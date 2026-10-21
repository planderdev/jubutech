"""HTTP integration checks using an isolated cookie jar; no external dependencies."""
import re, sys, json, html
from urllib.request import build_opener, HTTPCookieProcessor, Request
from urllib.parse import urlencode, urlparse, quote
from urllib.error import HTTPError
from http.cookiejar import CookieJar
from html.parser import HTMLParser

BASE = sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8088'
sys.stdout.reconfigure(encoding='utf-8')
opener=build_opener(HTTPCookieProcessor(CookieJar()))
checks=[]
def request(path, data=None):
    path=quote(path,safe='/?=&%')
    try:
        res=opener.open(Request(BASE+path, data=urlencode(data).encode() if data is not None else None), timeout=15)
        body=res.read().decode('utf-8'); status=res.status; url=res.url
    except HTTPError as err:
        status=err.code; body=err.read().decode('utf-8'); url=err.url
    assert 'Fatal error' not in body and '<b>Warning</b>' not in body, (path,body[:500])
    return status,body,url
def check(label, condition):
    assert condition,label
    checks.append(label)
def token():
    body=request('/finance')[1]
    return re.search(r'name="csrf" value="([^"]+)"',body).group(1)
csrf=token()
def post(action, **data):
    return request('/actions',{'csrf':csrf,'action':action,**data})

# Route integrity, allowed dynamic paths, private source boundaries.
routes=['/','/finance','/finance/categories','/finance/saved','/finance/articles/i1','/journal','/journal/entries','/journal/entries/new','/journal/entries/j1','/journal/entries/j1/edit','/journal/entries/j1/share','/journal/analysis','/campaigns','/campaigns/explore','/campaigns/cp1','/campaigns/cp1/apply','/applications','/applications/a1','/applications/a1/review','/search?mode=finance&q=ETF','/notifications','/mypage','/mypage/points','/mypage/missions','/mypage/badges','/mypage/posts','/mypage/settings','/community','/community/new','/community/p1','/notices','/notices/n1','/inquiries','/inquiries/new','/inquiries/q1','/rewards','/rewards/rw1','/legal/privacy','/legal/terms','/about','/login','/dev/states?state=error']
for path in routes: check('HTTP 200 '+path,request(path)[0]==200)
for path in ['/missing','/finance/articles/unknown','/campaigns/unknown','/journal/entries/unknown','/app/data/fixtures.php','/scripts/start.ps1','/../app/data/fixtures.php']:
    check('HTTP 404 '+path,request(path)[0]==404)
check('CSRF rejects invalid token',request('/actions',{'action':'save_goal','csrf':'invalid'})[0]==403)
post('save_article',id='i2',return_='/finance')
check('Bookmark stored in shared session','식비를 아끼는' in request('/finance/saved')[1])
post('save_article',id='i2')
check('Bookmark removal reflected','식비를 아끼는' not in request('/finance/saved')[1])

journal={'tradeDate':'2026-10-21','market':'KR','stockName':'통합검증 종목','symbol':'999999','side':'buy','unitPrice':'1000','quantity':'3','fee':'10','tax':'0','saveAs':'complete','reason':'통합 검증 이유','reflection':'통합 검증 복기','checklistAnswers[check1]':'yes','checklistAnswers[check2]':'no','trendChecks[5]':'up'}
result=post('save_journal',**{**journal,'unitPrice':'-1'})
check('Negative unit price rejected','0보다 큰 숫자' in result[1])
result=post('save_journal',**{**journal,'tradeDate':'2026-02-31'})
check('Invalid date rejected','올바른 거래일' in result[1])
result=post('save_journal',**journal); jid=urlparse(result[2]).path.rsplit('/',1)[1]
visible_amounts=html.unescape(re.sub(r'<[^>]+>','',result[1]))
check('Journal created with accurate amount','3,000원' in visible_amounts and '3,010원' in visible_amounts)
review_counts=re.sub(r'\s+','',visible_amounts)
check('Checklist reviewed and met counts separate','1/6충족·2/6점검완료' in review_counts or ('충족1/6' in review_counts and '점검완료2/6' in review_counts))
check('Journal appears in list','통합검증 종목' in request('/journal/entries?q=통합검증')[1])
check('Latest journal appears on first unfiltered page','통합검증 종목' in request('/journal/entries')[1])
result=post('save_journal',id=jid,**{**journal,'quantity':'4'})
visible_amounts=html.unescape(re.sub(r'<[^>]+>','',result[1]))
check('Journal edit recalculates amount','4,000원' in visible_amounts and '4,010원' in visible_amounts)
check('Analysis reads same records','통합검증 종목' in request('/journal/analysis')[1])
result=post('save_journal',**{**journal,'stockName':'','unitPrice':'','quantity':'','saveAs':'draft'})
check('Optional incomplete draft persists','임시 저장' in result[1])
post('delete_journal',id=jid)
check('Journal deleted from detail',request('/journal/entries/'+jid)[0]==404)
post('undo')
check('Journal deletion can be undone',request('/journal/entries/'+jid)[0]==200)

application={'id':'cp1','nickname':'검증 가상회원','contact':'010-0000-0000','channelUrl':'https://example.com/demo','reason':'통합검증 신청','extra[0]':'일상에서 체험해요','requiredConsent':'1'}
result=post('apply',**application); aid=urlparse(result[2]).path.rsplit('/',1)[1]
check('Application submitted','응모를 완료했어요' in result[1] and aid.startswith('ap_'))
result=post('apply',**application)
check('Duplicate application resolved to same record',urlparse(result[2]).path.endswith(aid))
result=post('apply',**{**application,'id':'cp6'})
check('Upcoming campaign blocks applications','현재 응모할 수 없는' in result[1])
result=post('apply',**{**application,'id':'cp8'})
check('Closed campaign blocks applications','현재 응모할 수 없는' in result[1])
result=post('submit_review',id='a2',url='https://example.com/review',content='검증',**{'return':'/applications/a2'})
check('Unselected applicant cannot submit review','후기 제출 대상이 아니에요' in result[1])
post('admin_login')
admin=['/admin','/admin/articles','/admin/articles/new','/admin/articles/i1/edit','/admin/articles/i1/preview','/admin/categories','/admin/campaigns','/admin/campaigns/cp1/edit','/admin/campaigns/cp1/preview','/admin/applications','/admin/reviews','/admin/members','/admin/members/m1','/admin/notices','/admin/inquiries','/admin/banners','/admin/settings','/admin/posts','/admin/comments','/admin/reports','/admin/points','/admin/exchanges','/admin/checklist']
for path in admin:check('HTTP 200 '+path,request(path)[0]==200)
check('Application visible to administrator','통합검증 신청' in request('/admin/applications/'+aid)[1])
post('admin_select',id=aid,selectionStatus='selected',expected='applied',**{'return':'/admin/applications/'+aid})
check('Selection reflected to user','후기 제출하기' in request('/applications/'+aid)[1])
post('submit_review',id=aid,url='https://example.com/qa-review',content='직접 사용한 데모 후기',**{'return':'/applications/'+aid})
body=request('/admin/reviews')[1]
rids=re.findall(r'/admin/reviews/(re_[a-f0-9]+)',body);rid=rids[-1]
check('Review visible to administrator','직접 사용한 데모 후기' in request('/admin/reviews/'+rid)[1])
post('admin_review',id=rid,reviewStatus='revision',feedback='협찬 표시를 확인해 주세요.',**{'return':'/admin/reviews/'+rid})
check('Revision feedback reflected to user','협찬 표시를 확인해 주세요.' in request('/applications/'+aid)[1])
post('submit_review',id=aid,url='https://example.com/qa-review',content='표시를 보완한 후기',**{'return':'/applications/'+aid})
post('admin_review',id=rid,reviewStatus='approved',feedback='',**{'return':'/admin/reviews/'+rid})
check('Review can complete after revision','승인 완료' in request('/applications/'+aid)[1])
post('admin_status',table='articles',id='i1',status='hidden',**{'return':'/admin/articles'})
check('Hidden article direct URL blocked',request('/finance/articles/i1')[0]==404)
check('Hidden article remains previewable',request('/admin/articles/i1/preview')[0]==200)
post('admin_status',table='campaigns',id='cp1',status='hidden',**{'return':'/admin/campaigns'})
check('Hidden campaign direct URL blocked',request('/campaigns/cp1')[0]==404)
check('Hidden campaign apply URL blocked',request('/campaigns/cp1/apply')[0]==404)
result=post('admin_delete',table='campaigns',id='cp1',**{'return':'/admin/campaigns'})
check('Campaign with applicants cannot be deleted','응모자가 있는 캠페인' in result[1])
check('Admin member view excludes private journal','통합검증 종목' not in request('/admin/members/m1')[1])
result=post('admin_save',table='campaigns',title='날짜검증',brand='가상',categoryId='생활',description='가상',benefit='가상',capacity=1,channel='블로그',image='home',recruitmentStartAt='2026-11-03T00:00',recruitmentEndAt='2026-11-01T00:00',announcementAt='2026-11-02T00:00',reviewDueAt='2026-11-10T00:00',exposureStartAt='2026-10-01T00:00',exposureEndAt='2026-12-01T00:00',missions='가상',questions='',conditions='가상',shipping=1,publicationStatus='draft')
check('Admin campaign dates validated','일정의 순서를 확인해 주세요.' in result[1])
post('admin_save',table='categories',id='saving',name='생활 절약',order='0',enabled='1')
check('Category edits reflected to user','생활 절약' in request('/finance/categories')[1])
check('Category reorder preserves other rows','지원금' in request('/finance/categories')[1])
post('admin_save',table='checklist',id='check1',title='새 이평선 문구',help='변경된 점검 도움말',order='1',enabled='1')
check('Old journal retains checklist snapshot','새 이평선 문구' not in request('/journal/entries/j1')[1])
check('New journal gets current checklist','새 이평선 문구' in request('/journal/entries/new')[1])
article={'table':'articles','title':'검증 <script>alert(1)</script> 콘텐츠','categoryId':'saving','summary':'검증 요약','thumbnail':'','body':'첫 문단\n\n두 번째 문단','source':'가상 편집팀','sourceUrl':'','publishedAt':'2026-10-21T09:00','status':'published','placement':'list'}
post('admin_save',**article)
body=request('/finance/categories?q='+quote('검증'))[1]
check('Admin-created article visible in user search','검증 &lt;script&gt;' in body)
check('Article title HTML is escaped','<script>alert(1)</script>' not in body)
body=request('/finance/categories')[1]
check('New dated article appears before older fixtures','검증 &lt;script&gt;' in body and body.index('검증 &lt;script&gt;')<body.index('식비를 아끼는'))
result=post('save_post',title='선택 공유 검증',body='직접 공개한 글',topic='주식·재테크',sourceJournalId='j1',includeReason='1')
check('Selective journal share includes chosen field','정해둔 가격대에서' in result[1])
check('Selective journal share omits amount and private reflection','682,000' not in result[1] and '조급하게 결정하지 않고' not in result[1])
body=request('/community')[1]
check('New community post appears before older fixtures',body.index('선택 공유 검증')<body.index('등원 후 두 시간'))
post('admin_save',table='notices',id='n1',title='고정 해제 공지',body='가상 공지',status='published')
post('admin_save',table='notices',title='상단 고정 검증',body='가상 공지',pinned='1',status='published')
body=request('/notices')[1]
check('Pinned notice appears before unpinned notice',body.index('상단 고정 검증')<body.index('고정 해제 공지'))
post('login',id='m2')
check('Another demo member cannot view private journal',request('/journal/entries/j1')[0]==404)
post('login',id='m1')
check('Pagination exposes the second page', 'name="page" value="2"' in request('/finance/categories')[1])
page_two=request('/finance/categories?page=2')[1]
check('Pagination changes the active page', 'name="page" value="2" aria-current="page"' in page_two)
check('Pagination preserves search filters', 'name="q" value="생활"' in request('/finance/categories?q=생활')[1])
check('Demo reset has a visible control','데모 초기화' in request('/admin/settings')[1])
post('reset_demo')
print(json.dumps({'passed':len(checks),'checks':checks},ensure_ascii=False,indent=2))
