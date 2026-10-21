"""Stateful admin integration checks; each test owns an isolated fictional session."""
import html
import re
import unittest
from http.cookiejar import CookieJar
from urllib.parse import urlencode, urlparse
from urllib.request import build_opener, HTTPCookieProcessor
from urllib.error import HTTPError

BASE='http://127.0.0.1:8088'

class AdminOperations(unittest.TestCase):
    def setUp(self):
        self.client=build_opener(HTTPCookieProcessor(CookieJar()))
        source=self.get('/admin/login')
        self.csrf=re.search('name="csrf" value="([^"]+)"',source).group(1)
        self.post(action='admin_login')

    def get(self,path):
        response=self.client.open(BASE+path)
        text=response.read().decode('utf-8-sig')
        self.assertNotRegex(text,r'<b>(?:Fatal error|Warning)</b>')
        return text

    def post(self,**data):
        response=self.client.open(BASE+'/actions',urlencode({'csrf':self.csrf}|data,doseq=True).encode())
        text=response.read().decode('utf-8-sig')
        self.assertNotRegex(text,r'<b>(?:Fatal error|Warning)</b>')
        return text,response.url

    def form(self,path,action):
        source=self.get(path)
        for body in re.findall(r'<form\b[^>]*>(.*?)</form>',source,re.S):
            if f'name="action" value="{action}"' not in body:continue
            fields={}
            for tag in re.findall(r'<input\b[^>]*>',body):
                attrs=dict(re.findall(r'([\w-]+)="([^"]*)"',tag))
                if 'name' in attrs and attrs.get('type') not in ['file','checkbox']:fields[attrs['name']]=html.unescape(attrs.get('value',''))
            for attrs,options in re.findall(r'<select\b([^>]*)>(.*?)</select>',body,re.S):
                name=re.search(r'name="([^"]+)"',attrs)
                values=re.findall(r'<option value="([^"]*)"([^>]*)>',options)
                if name and values:fields[name.group(1)]=html.unescape(next((v for v,a in values if 'selected' in a),values[0][0]))
            for name,value in re.findall(r'<textarea[^>]*name="([^"]+)"[^>]*>(.*?)</textarea>',body,re.S):fields[name]=html.unescape(value)
            return fields
        self.fail(f'Missing {action} on {path}')

    def bulk(self,table,ids,op,**changes):
        form=self.form('/admin/'+table,'admin_bulk')
        return self.post(**(form|{'ids[]':ids,'op':op,'reason':'검수용 사유'}|changes))[0]

    def test_all_menus_and_style_isolation(self):
        for table in ['articles','categories','campaigns','applications','reviews','posts','comments','reports','members','points','exchanges','notices','inquiries','banners','checklist','settings']:
            with self.subTest(table=table):
                source=self.get('/admin/'+table)
                self.assertIn('/assets/admin/css/admin-ds.css',source)
                self.assertNotIn('href="/assets/css/ds.css',source)
                self.assertNotIn('src="/assets/js/app.js',source)
                self.assertNotIn('lenis.min.js',source)
        user=self.get('/finance')
        self.assertIn('/assets/css/ds.css',user)
        self.assertNotIn('admin-ds.css',user)

    def test_bulk_partial_failure_and_stale_snapshot(self):
        form=self.form('/admin/articles','admin_bulk')
        result,_=self.post(**(form|{'ids[]':['i1','i2','missing'],'op':'hide','versions[i2]':'stale'}))
        self.assertIn('성공 1건 · 제외 0건 · 실패 2건',result)
        self.assertIn('다른 작업에서 변경',result)
        self.assertIn('대상이 삭제',result)
        self.assertIn('숨김',self.get('/admin/articles?search_by=id&q=i1'))
        result,_=self.post(**(form|{'ids[]':['i1'],'op':'publish','_requestKey':'new-key'}))
        self.assertIn('실패 1건',result)
        self.bulk('articles',['i1'],'publish')
        result,_=self.post(**(form|{'ids[]':['i1'],'op':'hide','_requestKey':'after-status-cycle'}))
        self.assertIn('실패 1건',result)

    def test_bulk_idempotency_and_noop(self):
        form=self.form('/admin/articles','admin_bulk')|{'ids[]':['i1'],'op':'hide'}
        self.post(**form)
        self.post(**form)
        history=self.get('/admin/articles/i1/edit')
        self.assertEqual(history.count('<strong>비공개</strong>'),1)
        result=self.bulk('articles',['i1'],'hide')
        self.assertIn('성공 0건 · 제외 1건 · 실패 0건',result)

    def test_capacity_and_cancelled_or_reviewed_exclusion(self):
        form=self.form('/admin/campaigns/cp1/edit','admin_save')
        self.post(**(form|{'capacity':'1'}))
        self.post(action='apply',id='cp1',nickname='가상검수',contact='010-0000-0000',reason='테스트',channelUrl='https://example.com',requiredConsent='1',**{'extra[0]':'테스트'})
        form=self.form('/admin/applications?campaign=cp1','admin_bulk')
        ids=re.findall(r'^versions\[(.+)\]$', '\n'.join(form), re.M)
        result,_=self.post(**(form|{'ids[]':ids,'op':'select'}))
        self.assertIn('성공 1건 · 제외 0건 · 실패 1건',result)
        self.assertIn('모집 인원 1명 초과',result)
        result=self.bulk('applications',['a5'],'unselect')
        self.assertIn('후기가 제출된 응모',result)

    def test_review_reasons_and_terminal_bulk_guard(self):
        result=self.bulk('reviews',['r1'],'revision',reason='')
        self.assertIn('처리 사유를 입력',result)
        self.assertIn('성공 1건',self.bulk('reviews',['r1'],'approve'))
        self.assertIn('이미 확정된 검수',self.bulk('reviews',['r1'],'revision'))

    def test_member_reason_masking_and_ledger_read_only(self):
        self.assertIn('처리 사유를 입력',self.bulk('members',['m1'],'suspend',reason=''))
        self.assertIn('성공 1건',self.bulk('members',['m1'],'suspend'))
        source=self.get('/admin/members/m1')
        self.assertIn('010-****-0101',source)
        self.assertNotIn('삼성전자',source)
        self.assertNotIn('admin_operate',self.get('/admin/points/pt1'))
        self.post(action='delete_post',id='p1',**{'return':'/community'})
        self.assertIn('작성자가 삭제한 항목',self.bulk('posts',['p1'],'publish'))

    def test_inquiry_conflict_and_retained_input(self):
        old=self.form('/admin/inquiries/q1','admin_answer')
        self.post(**(old|{'answer':'첫 답변'}))
        result,_=self.post(**(old|{'answer':'유지할 답변','_requestKey':'second'}))
        self.assertIn('다른 작업에서 변경',result)
        self.assertIn('유지할 답변',result)
        self.assertIn('첫 답변',self.get('/inquiries/q1'))

    def test_exchange_refund_once_and_reject_unsupported_transitions(self):
        self.post(action='exchange',id='rw1',_requestKey='exchange-test')
        form=self.form('/admin/exchanges','admin_bulk')
        eid=next(re.search(r'versions\[(.+)\]',k).group(1) for k in form if k.startswith('versions['))
        result,_=self.post(**(form|{'ids[]':[eid],'op':'cancel','reason':'검수 취소'}))
        self.assertIn('성공 1건',result)
        result=self.bulk('exchanges',[eid],'cancel')
        self.assertIn('제외 1건',result)
        self.assertEqual(self.get('/admin/points?member=m1').count('데모 교환 취소 반환'),1)
        result=self.bulk('articles',['i1'],'cancel')
        self.assertIn('허용되지 않은 작업',result)

    def test_reorder_atomicity_and_checklist_snapshot(self):
        form=self.form('/admin/checklist','admin_bulk')
        bad=form|{'action':'admin_reorder','orders[check1]':'99','versions[check2]':'stale'}
        result,_=self.post(**bad)
        self.assertIn('다른 작업에서 변경',result)
        source=self.get('/admin/checklist')
        self.assertRegex(source,r'name="orders\[check1\]" value="1"')
        self.post(**(form|{'action':'admin_reorder','orders[check1]':'99'}))
        self.assertIn('체크리스트',self.get('/journal/entries/j1'))

    def test_csv_filters_masking_and_formula_escape(self):
        csv=self.get('/admin/members?search_by=id&q=m1&export=csv')
        self.assertIn('010-****-0101',csv)
        csv=self.get('/admin/articles?categoryId=subsidy&export=csv')
        self.assertIn('우리 집이 받을',csv)
        self.assertNotIn('식비를 아끼는',csv)
        form=self.form('/admin/categories/subsidy/edit','admin_save')
        self.post(**(form|{'name':'=HYPERLINK("https://example.com")'}))
        self.assertIn("'=HYPERLINK",self.get('/admin/categories?export=csv'))

    def test_auth_csrf_and_preview_boundary(self):
        try:self.client.open(BASE+'/actions',urlencode({'csrf':'invalid','action':'admin_bulk'}).encode())
        except HTTPError as error:self.assertEqual(error.code,403)
        self.post(action='admin_logout')
        response=self.client.open(BASE+'/admin-user-preview/articles/i1')
        self.assertTrue(response.url.endswith('/admin/login'))
        self.assertNotIn('성공 1건',self.post(action='admin_bulk',table='articles',**{'ids[]':['i1'],'op':'hide'})[0])

if __name__=='__main__':unittest.main(verbosity=2)
