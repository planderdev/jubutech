"""Account flows use fresh cookie jars; no changes touch the user's demo session."""
import os
from pathlib import Path
import re
import unittest
from http.cookiejar import CookieJar
from urllib.error import HTTPError
from urllib.parse import quote, urlencode, urlparse
from urllib.request import build_opener, HTTPCookieProcessor, Request

BASE = os.getenv('TEST_BASE', 'http://127.0.0.1:8088')
ROOT = Path(__file__).resolve().parents[1]


class AccountPages(unittest.TestCase):
    def setUp(self):
        self.client = build_opener(HTTPCookieProcessor(CookieJar()))
        body, _, _ = self.get('/mypage/settings')
        self.csrf = re.search(r'name="csrf" value="([^"]+)"', body).group(1)

    def request(self, path, data=None):
        try:
            response = self.client.open(Request(BASE + quote(path, safe='/?=&%'),
                data=urlencode(data).encode() if data is not None else None), timeout=10)
        except HTTPError as error:
            response = error
        body = response.read().decode('utf-8')
        self.assertNotRegex(body, r'Fatal error|<b>Warning</b>')
        url = urlparse(response.url)
        return body, url.path + ('?' + url.query if url.query else ''), response.code

    def get(self, path):
        return self.request(path)

    def post(self, action, **data):
        return self.request('/actions', {'csrf': self.csrf, 'action': action, **data})

    def test_account_links_preserve_selected_mode(self):
        for mode in ['finance', 'journal', 'campaigns']:
            for route in ['/mypage/missions', '/mypage/posts', '/mypage/settings', '/notices',
                          '/notices/n1', '/inquiries', '/inquiries/q1', '/inquiries/new', '/about']:
                with self.subTest(mode=mode, route=route):
                    body, _, code = self.get(route + '?mode=' + mode)
                    self.assertEqual(code, 200)
                    self.assertRegex(body, r'data-app-back')
                    self.assertIn('?mode=' + mode + '" data-app-back', body)
                    self.assertEqual(len(re.findall(r'<h1\b', body)), 1)

    def test_owned_posts_have_unique_sheets_and_deletion_returns_to_list(self):
        body, _, _ = self.get('/mypage/posts?mode=journal')
        self.assertIn('data-open="my-post-actions-p1"', body)
        self.assertIn('aria-controls="my-post-actions-p1"', body)
        self.assertEqual(body.count('id="my-post-actions-p1"'), 1)
        self.assertNotIn('my-post-actions-p2', body)
        self.assertNotIn('my-post-actions-p3', body)
        body, url, _ = self.post('delete_post', id='p1', **{'return': '/mypage/posts?mode=journal'})
        self.assertEqual(url, '/mypage/posts?mode=journal')
        self.assertIn('아직 쓴 글이 없어요', body)
        self.assertNotIn('data-open="my-post-actions-p1"', body)
        body, _, _ = self.post('undo', **{'return': '/mypage/posts?mode=journal'})
        self.assertIn('data-open="my-post-actions-p1"', body)

    def test_post_edit_retains_list_context_and_existing_reactions(self):
        ret = '/mypage/posts?mode=journal'
        body, _, _ = self.get('/community/p1/edit?return=' + quote(ret, safe=''))
        self.assertIn('href="' + ret + '" data-app-back', body)
        self.assertIn('name="return" value="' + ret + '"', body)
        body, url, _ = self.post('save_post', id='p1', title='수정 확인', body='수정한 본문', topic='자유', **{'return': ret})
        self.assertEqual(url, ret)
        self.assertIn('수정 확인', body)
        self.assertIn('공감 1', body)
        self.assertIn('댓글 1', body)

    def test_invalid_post_keeps_editor_context_and_rejects_other_return_urls(self):
        ret = '/mypage/posts?mode=campaigns'
        body, url, _ = self.post('save_post', id='p1', title='', body='내용', **{'return': ret})
        self.assertTrue(url.startswith('/community/p1/edit?return='))
        self.assertIn('name="return" value="' + ret + '"', body)
        for ret in ['https://example.com', '//example.com', '/admin', '/mypage/posts?mode=journal&bad=1']:
            _, url, _ = self.post('save_post', id='p1', title='정상 저장', body='본문', **{'return': ret})
            self.assertEqual(url, '/community/p1')

    def test_inquiry_registration_and_validation_preserve_mode(self):
        body, url, _ = self.post('inquiry', title='', body='', mode='journal')
        self.assertEqual(url, '/inquiries/new?mode=journal')
        self.assertIn('aria-invalid="true"', body)
        body, url, _ = self.post('inquiry', title='문의 흐름 확인', body='가상 문의 본문', mode='journal')
        self.assertRegex(url, r'^/inquiries/in_[a-f0-9]+\?mode=journal$')
        self.assertIn('가상 문의 본문', body)
        self.assertIn('답변을 기다리고 있어요', body)

    def test_inquiry_filter_and_answer_states_are_real(self):
        body, _, _ = self.get('/inquiries?status=answered&mode=journal')
        self.assertIn('해당하는 문의가 없어요', body)
        self.assertNotIn('체험단 후기 링크를 수정하고 싶어요', body)
        self.post('admin_login')
        self.post('admin_answer', id='q1', answer='답변 검수 <script>예시</script>')
        body, _, _ = self.get('/inquiries?status=answered&mode=journal')
        self.assertIn('체험단 후기 링크를 수정하고 싶어요', body)
        body, _, _ = self.get('/inquiries/q1?mode=journal')
        self.assertIn('운영팀 답변', body)
        self.assertIn('답변 검수 &lt;script&gt;', body)
        self.assertNotIn('답변을 기다리고 있어요', body)
        self.post('login', id='m2')
        self.assertEqual(self.get('/inquiries/q1')[2], 404)

    def test_review_revision_links_to_editor_and_completed_missions_leave_list(self):
        self.post('login', id='m2')
        body, _, _ = self.get('/mypage/missions')
        self.assertIn('검토 중', body)
        self.assertIn('제출 내역 확인', body)
        self.assertNotIn('배송 정보 입력', body)
        self.post('admin_login')
        self.post('admin_review', id='r1', reviewStatus='revision', feedback='보완 검수', **{'return': '/mypage/missions'})
        body, _, _ = self.get('/mypage/missions')
        self.assertIn('보완 검수', body)
        self.assertIn('href="/applications/a5/review"', body)
        self.post('admin_review', id='r1', reviewStatus='approved', feedback='', **{'return': '/mypage/missions'})
        body, _, _ = self.get('/mypage/missions')
        self.assertIn('진행 중인 미션이 없어요', body)

    def test_list_row_base_and_size_definitions_are_not_duplicated(self):
        for name in ['public/assets/css/ds.css', 'public/assets/admin/css/admin-ds.css']:
            source = (ROOT / name).read_text(encoding='utf-8')
            for selector in ['.list-row', '.list-row--sm', '.list-row--lg']:
                self.assertEqual(len(re.findall(r'^' + re.escape(selector) + r'\s*\{', source, re.M)), 1, (name, selector))


if __name__ == '__main__':
    unittest.main(verbosity=2)
