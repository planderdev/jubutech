"""Follow-up regressions and demo round trips, always using a fresh cookie jar."""
import html, json, re, sys
from http.cookiejar import CookieJar
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode, urlparse, quote
from urllib.request import build_opener, HTTPCookieProcessor, Request

BASE='http://127.0.0.1:8088'
client=build_opener(HTTPCookieProcessor(CookieJar()))
checks=[]
def request(path,data=None):
    try:
        response=client.open(Request(BASE+quote(path,safe='/?=&%'),data=urlencode(data).encode() if data is not None else None),timeout=10)
    except HTTPError as error: response=error
    body=response.read().decode('utf-8')
    assert not re.search(r'Fatal error|<b>Warning</b>',body),(path,body[:500])
    return response.code,body,urlparse(response.url).path+('?' + urlparse(response.url).query if urlparse(response.url).query else '')
class Forms(HTMLParser):
    def __init__(self,source):
        super().__init__();self.forms=[];self.current=None;self.capture=None;self.select=None;self.option=None;self.feed(source)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='form':self.current={};self.forms.append(self.current)
        if self.current is None:return
        if tag=='input' and a.get('name') and (a.get('type') not in ['checkbox','radio'] or 'checked' in a):self.current[a['name']]=a.get('value','')
        if tag=='textarea':self.capture=a.get('name');self.current[self.capture]=''
        if tag=='select':self.select=a.get('name');self.current[self.select]=''
        if tag=='option' and self.select:
            if not self.current[self.select] or 'selected' in a:self.current[self.select]=a.get('value','')
    def handle_endtag(self,tag):
        if tag=='form':self.current=None
        if tag=='textarea':self.capture=None
        if tag=='select':self.select=None
    def handle_data(self,text):
        if self.capture and self.current is not None:self.current[self.capture]+=text
def form(path,action):return next(f for f in Forms(request(path)[1]).forms if f.get('action')==action)
csrf=form('/finance','save_article')['csrf']
def post(action,**data):return request('/actions',{'csrf':csrf,'action':action,**data})
def submit(data,**changes):return request('/actions',{**data,**changes})
def check(label,condition):
    assert condition,label
    checks.append(label)

# Full-filter URL carries only the deliberate query/sort, and resets pagination.
body=request('/finance/categories?category=subsidy&q=지원&sort=oldest&page=2')[1]
all_url=html.unescape(re.search(r'data-chip-url="([^"]+)"[^>]*>전체<',body).group(1))
check('All chip removes category and resets page, preserves query and sort','category=' not in all_url and 'page=1' in all_url and 'sort=oldest' in all_url and 'q=' in all_url)
body=request(all_url)[1]
check('All chip renders pressed state',bool(re.search(r'aria-pressed="true" data-chip-url="[^"]+">전체<',body)))

check('Seed application predates its announcement','2026.10.14' in request('/applications/a1')[1])
for month,target,expected in [('2026-02',29,False),('2028-02',29,True),('2026-04',31,False)]:
    response=post('save_goal',month=month,target=target,**{'return':'/journal?date='+month+'-01'})
    check('Month goal bound '+month,('기록 목표를 저장했어요' in response[1])==expected)

draft=form('/journal/entries/new','save_journal');draft.update(tradeDate='2026-10-21',stockName='후속 QA 가상 종목',market='KR',side='buy',unitPrice='1000',quantity='2',saveAs='draft')
response=submit(draft);journal=response[2].split('/')[-1]
check('Draft has no trailing delimiter','국내주식 · 매수</p>' in response[1])
check('Draft excluded from analysis','후속 QA 가상 종목' not in request('/journal/analysis')[1])
response=submit(draft)
check('Duplicate create request resolves to same journal',response[2].endswith(journal))
edit=form('/journal/entries/'+journal+'/edit','save_journal');response=submit(edit,saveAs='complete')
check('Final record appears in analysis','후속 QA 가상 종목' in request('/journal/analysis')[1])
post('delete_journal',id=journal)
check('Deleted journal absent from daily list and analysis',request('/journal/entries/'+journal)[0]==404 and '후속 QA 가상 종목' not in request('/journal/analysis')[1])
check('Undo remains discoverable after another GET','삭제 되돌리기' in request('/journal/entries')[1])
post('undo',**{'return':'/journal/entries'})
check('Undo restores journal',request('/journal/entries/'+journal)[0]==200)

review=form('/applications/a1/review?source=detail','submit_review');response=submit(review,url='',content='')
check('Review validation retains entry query',response[2]=='/applications/a1/review?source=detail')
check('Review validation retains detail back link','href="/applications/a1" data-app-back' in response[1])
response=submit(form('/applications/a1/review','submit_review'),url='javascript:alert(1)',content='후기')
check('Review rejects unsafe URL','올바른 후기 URL' in response[1])

# Apply -> admin selection -> shipping -> review -> revision -> resubmit -> approval.
application=form('/campaigns/cp3/apply','apply');response=submit(application,nickname='가상 검수자',contact='010-0000-0000',reason='후속 테스트',requiredConsent='1',**{'extra[0]':'가상 답변'})
aid=response[2].split('?',1)[0].split('/')[-1]
check('Application completes in isolated session',aid.startswith('ap_'))
post('admin_login')
selection=form('/admin/applications/'+aid,'admin_select');submit(selection,selectionStatus='selected')
check('Selection visible to member','선정' in request('/applications/'+aid)[1])
submit(form('/applications/a1','save_shipping'),recipient='가상 수령인',address='테스트 전용 가상 배송지')
check('Demo shipping persists without dispatch','테스트 전용 가상 배송지' in request('/applications/a1')[1])
response=submit(selection,selectionStatus='not_selected',_requestKey='different-request')
check('Stale selection is rejected','다른 작업에서 상태가 변경' in response[1])
response=submit(form('/applications/'+aid+'/review','submit_review'),content='분리된 세션의 가상 후기')
check('Review submission reaches application detail',response[2]=='/applications/'+aid)
body=request('/admin/reviews?q=장보기')[1];rid=re.search(r'href="/admin/reviews/(re_[^"/]+)"',body).group(1)
review_edit=form('/admin/reviews/'+rid,'admin_review')
response=submit(review_edit,reviewStatus='revision',feedback='')
check('Revision requires a reason','보완할 내용을 입력' in response[1])
submit(form('/admin/reviews/'+rid,'admin_review'),reviewStatus='revision',feedback='사용 과정 한 줄을 추가해 주세요')
check('Revision request reaches user','사용 과정 한 줄' in request('/applications/'+aid)[1])
response=submit(form('/applications/'+aid+'/review','submit_review'),content='사용 과정을 추가한 가상 후기')
check('User can resubmit revision',response[2]=='/applications/'+aid)
check('Review history survives resubmission','사용 과정 한 줄' in request('/admin/reviews/'+rid)[1] and '사용자 재제출' in request('/admin/reviews/'+rid)[1])
submit(form('/admin/reviews/'+rid,'admin_review'),reviewStatus='approved',feedback='확인 완료')
check('Approved review locks form','승인된 후기예요' in request('/applications/'+aid+'/review')[1])
response=submit(form('/admin/reviews/'+rid,'admin_review'),reviewStatus='rejected',feedback='')
check('Rejection requires a distinct reason','반려 사유를 입력' in response[1])
submit(form('/admin/reviews/'+rid,'admin_review'),reviewStatus='rejected',feedback='가상 반려 검수')
check('Rejected review is distinct from revision and locks resubmission','반려된 후기예요' in request('/applications/'+aid+'/review')[1])
post('undo',**{'return':'/admin/reviews/'+rid})
check('Review decision undo restores previous approval','승인된 후기예요' in request('/applications/'+aid+'/review')[1])

# Operation-specific filters must affect the rows, not only the controls.
body=request('/admin/articles?categoryId=subsidy')[1]
check('Admin content category filters actual rows','우리 집이 받을 수 있는 지원금' in body and '식비를 아끼는' not in body)
body=request('/admin/campaigns?recruiting=closed')[1]
check('Admin campaign recruitment filter applies','코지홈' in body and '그린테이블' not in body and '<tbody>' in body)
campaign=form('/admin/campaigns/cp1/edit','admin_save')
response=submit(campaign,recruitmentStartAt='2026-02-30T09:00')
check('Invalid calendar date is not silently normalized','모집 시작 날짜를 확인해 주세요.' in response[1])
submit(form('/admin/campaigns/cp1/edit','admin_save'),capacity='1')
submit(form('/admin/applications/a4','admin_select'),selectionStatus='selected')
response=submit(form('/campaigns/cp1/apply','apply'),nickname='정원 검수',contact='010-0000-0000',channelUrl='https://example.com/demo',reason='가상 정원 테스트',requiredConsent='1',**{'extra[0]':'가상 답변'})
capacity_aid=response[2].split('?',1)[0].split('/')[-1]
response=submit(form('/admin/applications/'+capacity_aid,'admin_select'),selectionStatus='selected')
check('Selection cannot exceed capacity','모집 인원을 초과해 선정할 수 없어요.' in response[1])
response=submit(form('/admin/campaigns/cp1/edit','admin_save'),capacity='0')
check('Capacity cannot be lower than selected count','선정 인원보다 모집 인원을 줄일 수 없어요.' in response[1])

# Public posting with edit/delete, comments, reports, inquiries and points ledger.
response=submit(form('/community/new','save_post'),title='후속 QA 공개 이야기',body='가상 게시글',topic='자유');pid=response[2].split('/')[-1]
check('Published post visible',request('/community/'+pid)[0]==200)
submit(form('/community/'+pid+'/edit','save_post'),title='후속 QA 수정된 이야기',body='수정된 가상 내용')
check('Own post editable','수정된 가상 내용' in request('/community/'+pid)[1])
post('like_post',id=pid,**{'return':'/community/'+pid})
check('Like has an explicit selected state','aria-pressed="true"' in request('/community/'+pid)[1])
submit(form('/community/'+pid,'comment'),body='가상 댓글')
body=request('/community/'+pid)[1];check('Comment saved','가상 댓글' in body)
delete=next(f for f in Forms(body).forms if f.get('action')=='delete_comment');submit(delete)
check('Comment deletion reflected','가상 댓글' not in request('/community/'+pid)[1])
submit(form('/community/'+pid,'report_post'),body='가상 검수 신고')
body=request('/admin/reports?q=후속')[1];report_id=re.search(r'href="/admin/reports/([^"/]+)"',body).group(1)
submit(form('/admin/reports/'+report_id,'admin_report'),result='가상 검수 완료 · 게시 유지')
check('Report action has persisted result','가상 검수 완료 · 게시 유지' in request('/admin/reports')[1])
response=submit(form('/inquiries/new','inquiry'),title='가상 문의',body='답변 왕복 확인');qid=response[2].split('/')[-1]
submit(form('/admin/inquiries/'+qid,'admin_answer'),answer='가상 답변 완료')
check('Inquiry answer reaches member','가상 답변 완료' in request('/inquiries/'+qid)[1])
exchange=form('/rewards/rw1','exchange');submit(exchange);before=request('/admin/exchanges')[1];submit(exchange);after=request('/admin/exchanges')[1]
check('Duplicate exchange does not create another ledger row',before.count('교환 데모')==after.count('교환 데모') and re.findall(r'ex_[a-f0-9]+',before)==re.findall(r'ex_[a-f0-9]+',after))
submit(form('/community/'+pid,'delete_post'))
check('Own post deletion reflected',request('/community/'+pid)[0]==404)
post('undo',**{'return':'/community'})
check('Own post deletion recoverable',request('/community/'+pid)[0]==200)

# Stored revisions reject stale editor submissions; private journal remains absent.
settings=form('/admin/settings','admin_save');submit(settings,financeIntro='후속 검수 안내')
response=submit(settings,financeIntro='오래된 편집',_requestKey='new-stale-request')
check('Stale editor is rejected','다른 작업에서 내용이 변경' in response[1])
check('Settings change reflected in user home','후속 검수 안내' in request('/finance')[1])
check('Admin member detail excludes private journal','후속 QA 가상 종목' not in request('/admin/members/m1')[1])
check('Admin shortcut hidden without deployment flag','관리자 데모 열기' not in request('/mypage/settings')[1])
check('All notifications can be read', '모든 소식을 확인했어요' in post('read_all',**{'return':'/notifications?status=unread'})[1])

Path('tests/results').mkdir(parents=True,exist_ok=True)
Path('tests/results/followup-http-results.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'environment':'PHP local demo / independent HTTP cookie jar; user session untouched'},ensure_ascii=False,indent=2),encoding='utf-8')
sys.stdout.reconfigure(encoding='utf-8')
print(json.dumps({'passed':len(checks),'checks':checks},ensure_ascii=False,indent=2))
