"""Server feedback must share the toast path without leaking errors to other forms."""
import http.cookiejar
import re
import unittest
import urllib.parse
import urllib.request


class Feedback(unittest.TestCase):
    def setUp(self):
        self.client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.get('/community/p1')

    def get(self, path):
        with self.client.open('http://127.0.0.1:8088' + path) as response:
            return response.read().decode()

    def post(self, source, action, **values):
        html = self.get(source)
        csrf = re.search(r'name="csrf" value="([^"]+)"', html).group(1)
        data = urllib.parse.urlencode(dict(csrf=csrf, action=action, _formContext=source, **values)).encode()
        with self.client.open('http://127.0.0.1:8088/actions', data) as response:
            return response.read().decode()

    def test_comment_errors_use_one_toast_and_only_mark_the_submitted_form(self):
        html = self.post('/community/p1', 'comment', id='p1', body='  ', **{'return': '/community/p1'})
        self.assertEqual(html.count('data-feedback-message'), 1)
        self.assertIn('data-kind="error" data-form-action="comment" role="alert"', html)
        self.assertNotIn('data-error-summary', html)
        textareas = re.findall(r'<textarea[^>]*aria-invalid="([^"]+)"[^>]*>(.*?)</textarea>', html)
        self.assertEqual(textareas, [('true', '  '), ('false', '')])

    def test_sheet_errors_keep_their_form_target_and_successes_use_the_same_toast(self):
        html = self.post('/journal', 'save_goal', month='2026-10', target=32, **{'return': '/journal'})
        self.assertIn('data-kind="error" data-form-action="save_goal"', html)
        self.assertIn('1~31일', html)
        html = self.post('/journal', 'save_goal', month='2026-10', target=12, **{'return': '/journal'})
        self.assertIn('data-kind="status"', html)
        self.assertIn('이번 달 기록 목표를 저장했어요.', html)


if __name__ == '__main__':
    unittest.main(verbosity=2)
