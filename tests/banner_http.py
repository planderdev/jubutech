"""Banner editing and exposure integration tests use independent demo sessions."""
import http.cookiejar
import html
import re
import unittest
import urllib.parse
import urllib.request

class BannerHTTP(unittest.TestCase):
    def setUp(self):
        self.client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.post('/admin/login',action='admin_login')

    def get(self,path):
        return self.client.open('http://127.0.0.1:8088'+path).read().decode()

    def post(self,path,**values):
        source=self.get(path)
        csrf=re.search(r'name="csrf" value="([^"]+)"',source).group(1)
        body=urllib.parse.urlencode(dict(csrf=csrf,_formContext=path,**values)).encode()
        return self.client.open('http://127.0.0.1:8088/actions',body).read().decode()

    def banner(self,**changes):
        return dict(type='promotion',title='새 배너 검수',eyebrow='검수',benefit='',description='일상에 맞는 정보를 확인해요',note='',image='/assets/images/banners/support-envelope.svg',imageAlt='지원 안내 봉투',imageSource='',imageCredit='',background='sky',imagePreset='promotion',url='/finance/articles/i1',mode='finance',order=0,startAt='2026-10-01T00:00',endAt='2026-12-31T23:59',enabled='1')|changes

    def test_mixed_home_uses_true_counts_and_no_external_navigation_controls(self):
        page=self.get('/campaigns')
        self.assertIn('banner-card--promotion',page)
        self.assertIn('banner-card--detail',page)
        self.assertEqual(re.search(r'data-banner-slider data-slide-count="(\d+)"',page).group(1),'2')
        self.assertEqual(len(re.findall(r'data-banner-index=',page)),6)
        self.assertNotIn('data-carousel-prev',page)
        self.assertIn('상품 이미지는 예시예요',page)
        self.assertNotIn('banner-slider__credits',page)
        self.assertNotIn('Photo: KamranAydinov',page)
        self.assertIn('KamranAydinov / Magnific',self.get('/about'))

    def test_admin_saved_order_visibility_and_copy_reach_the_home(self):
        self.post('/admin/banners/new',action='admin_save',table='banners',**self.banner())
        page=self.get('/finance')
        self.assertIn('새 배너 검수',page)
        self.assertLess(page.index('새 배너 검수'),page.index('우리 집 지원금'))
        self.post('/admin/banners/new',action='admin_save',table='banners',**self.banner(title='숨긴 배너 검수',enabled='0'))
        self.assertNotIn('숨긴 배너 검수',self.get('/finance'))

    def test_detail_rejects_opaque_svg_and_preserves_existing_banners(self):
        result=self.post('/admin/banners/new',action='admin_save',table='banners',**self.banner(type='detail',imagePreset='tall'))
        self.assertIn('투명 PNG·WebP 상품 사진',result)
        self.assertIn('data-kind="error"',result)
        self.assertNotIn('새 배너 검수',self.get('/finance'))

    def test_detail_accepts_reviewed_alpha_and_output_escapes_authored_text(self):
        self.post('/admin/banners/new',action='admin_save',table='banners',**self.banner(type='detail',imagePreset='tall',image='/assets/images/banners/cosmetic-cutout.webp',title='<b>검수</b>',benefit='조건 확인'))
        page=self.get('/finance')
        self.assertIn('&lt;b&gt;검수&lt;/b&gt;',page)
        self.assertNotIn('<b>검수</b>',page)
        self.assertIn('cosmetic-cutout.webp',page)

    def test_existing_banner_and_member_records_survive_the_seed_migration(self):
        page=self.get('/admin/banners/b1/edit')
        self.assertIn('작은 기록이 나만의 투자 기준이 돼요',page)
        self.assertIn('data-banner-editor',page)
        self.assertIn('390px 앱 기준',page)
        self.assertIn('삼성전자',self.get('/journal'))

if __name__=='__main__':unittest.main(verbosity=2)
