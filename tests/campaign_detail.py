"""Public campaign content, visibility, and real recommendation pagination."""
import html
import json
from http.cookiejar import CookieJar
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import HTTPCookieProcessor, build_opener
import re
import unittest

BASE='http://127.0.0.1:8088'


class CampaignDetail(unittest.TestCase):
    def setUp(self):
        self.client=build_opener(HTTPCookieProcessor(CookieJar()))

    def get(self,path):
        response=self.client.open(BASE+path)
        self.assertEqual(response.status,200)
        return response.read().decode('utf-8')

    def post(self,**data):
        response=self.client.open(BASE+'/actions',urlencode({'csrf':self.csrf}|data).encode())
        return response.read().decode('utf-8')

    def login_admin(self):
        source=self.get('/admin/login')
        self.csrf=re.search('name="csrf" value="([^"]+)"',source).group(1)
        self.post(action='admin_login')

    def test_reviews_and_product_images_belong_to_overview_and_related_is_outside_article(self):
        source=self.get('/campaigns/cp1')
        overview=source.split('id="campaign-overview"',1)[1].split('<section id="campaign-schedule"',1)[0]
        self.assertIn('data-campaign-reviews',overview)
        self.assertIn('data-campaign-product',overview)
        self.assertIn('예시 리뷰 포함',overview)
        self.assertIn('aria-label="5점 만점에 4.7점"',overview)
        self.assertEqual(overview.count('class="campaign-review-card"'),6)
        self.assertEqual(len(re.findall(r'상품정보 참고 이미지 [1-5]"',overview)),5)
        nav=source.split('data-campaign-nav>',1)[1].split('</nav>',1)[0]
        self.assertEqual(re.findall('href="([^"]+)"',nav),['#campaign-overview','#campaign-schedule','#campaign-guide'])
        self.assertTrue(re.search(r'</article>\s*<section id="campaign-recommendations"',source),'Recommendations must follow the article containing the tabs')

    def test_recommendations_page_until_exhaustion_without_repeats_or_closed_campaigns(self):
        source=self.get('/campaigns/cp1')
        ids=re.findall('data-recommendation-id="([^"]+)"',source)
        next_url=html.unescape(re.search('data-campaign-recommendations data-next="([^"]+)"',source).group(1))
        requests=0
        while next_url:
            requests+=1
            self.assertLessEqual(requests,5,'Pagination must terminate')
            data=json.loads(self.get(next_url))
            batch=re.findall('data-recommendation-id="([^"]+)"',data['html'])
            self.assertEqual(data['count'],len(batch))
            self.assertFalse(set(ids)&set(batch))
            ids+=batch
            next_url=data['next']
        self.assertEqual(requests,2)
        self.assertEqual(set(ids),{'cp2','cp3','cp4','cp6','cp7'})
        self.assertEqual(len(ids),len(set(ids)))

    def test_html_fallback_keeps_previously_loaded_items(self):
        source=self.get('/campaigns/cp1?relatedAfter=cp3#campaign-recommendations')
        self.assertEqual(re.findall('data-recommendation-id="([^"]+)"',source),['cp2','cp3','cp4','cp7'])
        self.assertIn('relatedAfter=cp7#campaign-recommendations',source)

    def test_unknown_campaign_and_bad_cursors_have_explicit_errors(self):
        for path,status in [('/campaigns/missing/recommendations',404),('/campaigns/cp1/recommendations?after=not-present',400),('/campaigns/cp1/recommendations?after[]=cp2',400)]:
            with self.subTest(path=path),self.assertRaises(HTTPError) as error:
                self.get(path)
            self.assertEqual(error.exception.code,status)
            self.assertIn('error',json.loads(error.exception.read().decode()))

    def test_hidden_campaigns_are_not_recommended_or_available_through_json(self):
        self.login_admin()
        self.post(action='admin_status',table='campaigns',id='cp2',status='hidden',**{'return':'/admin/campaigns'})
        data=json.loads(self.get('/campaigns/cp1/recommendations'))
        self.assertNotIn('data-recommendation-id="cp2"',data['html'])
        with self.assertRaises(HTTPError) as error:
            self.get('/campaigns/cp2/recommendations')
        self.assertEqual(error.exception.code,404)

    def test_pending_reviews_stay_private_and_approved_reviews_use_masked_identity(self):
        self.assertNotIn('향이 강하지 않아 설거지할 때 쓰기 좋았어요.',self.get('/campaigns/cp8'))
        self.login_admin()
        form=self.get('/admin/reviews/r1').split('value="admin_review"',1)[1].split('</form>',1)[0]
        expected=html.unescape(re.search('name="expected" value="([^"]+)"',form).group(1))
        self.post(action='admin_review',id='r1',reviewStatus='approved',expected=expected,feedback='',**{'return':'/admin/reviews/r1'})
        source=self.get('/campaigns/cp8')
        self.assertTrue('향이 강하지 않아 설거지할 때 쓰기 좋았어요.' in source,'Approved review should be public')
        self.assertNotIn('010-0000-0000',source)
        self.assertNotIn('https://example.com/demo-profile',source)


if __name__=='__main__':
    unittest.main(verbosity=2)
