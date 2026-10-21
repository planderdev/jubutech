"""HTTP/asset regressions for progressive enhancement and the pinned libraries."""
from pathlib import Path
import hashlib, json, re, urllib.request, unittest

ROOT=Path(__file__).resolve().parents[1]
def page(path):
    return urllib.request.urlopen('http://127.0.0.1:8088'+path).read().decode()

class Interactions(unittest.TestCase):
    def test_pinned_local_assets_match_verified_manifest(self):
        manifest=json.loads((ROOT/'public/assets/vendor/manifest.json').read_text())
        self.assertEqual({k:v['version'] for k,v in manifest.items()}, {'swiper':'12.0.3','lenis':'1.3.27','aos':'2.3.4'})
        for package,meta in manifest.items():
            for file,digest in meta['sha256'].items():
                self.assertEqual(hashlib.sha256((ROOT/f'public/assets/vendor/{package}-{meta["version"]}/{file}').read_bytes()).hexdigest(),digest)

    def test_libraries_are_page_specific(self):
        for path,expected in {
            '/finance':{'aos','lenis','swiper'},'/campaigns':{'aos','lenis','swiper'},
            '/finance/articles/i2':{'lenis'},'/finance/categories':{'swiper','lenis'},
            '/journal':{'swiper'},'/journal/entries/new':set(),'/campaigns/cp4/apply':set(),
            '/campaigns/cp1':{'lenis','swiper'},'/admin/login':set(),
        }.items():
            with self.subTest(path=path):
                self.assertEqual(set(re.findall(r'/assets/vendor/(aos|lenis|swiper)-',page(path))),expected)

    def test_library_failure_preserves_content_and_native_actions(self):
        for path in ['/finance','/campaigns','/journal','/finance/categories']:
            html=page(path+'?qa=1&libraries=off')
            self.assertNotIn('/assets/vendor/',html)
            self.assertNotIn('data-aos=',html)
            self.assertIn('<main',html)
        self.assertIn('data-journal-day="2026-10-21"',page('/journal?qa=1&libraries=off'))
        self.assertEqual(page('/finance/categories?qa=1&libraries=off').count('data-chip-url='),9)

    def test_week_dates_cross_month_and_year_without_loop_duplicates(self):
        for selected,expected in [('2026-11-01','2026-11-08'),('2026-12-31','2027-01-07'),('2028-02-29','2028-03-07')]:
            html=page('/journal?date='+selected)
            dates=re.findall('data-journal-day="([^"]+)"',html)
            self.assertEqual(len(dates),21)
            self.assertEqual(len(set(dates)),21)
            self.assertIn('data-week-url="/journal?date='+expected+'"',html)
            self.assertIn('new?date='+selected,html)
            self.assertIn('href="/journal" class="button',html)

    def test_selected_day_has_matching_records(self):
        html=page('/journal?date=2026-10-20')
        self.assertIn('10월 20일의 기록',html)
        self.assertIn('aria-selected="true"',html)
        self.assertNotIn('오늘의 기록</h3>',html)

    def test_forms_stay_button_driven_and_keep_post_contract(self):
        html=page('/campaigns/cp4/apply')
        self.assertEqual(html.count('<section data-form-step>'),3)
        for name in ['nickname','contact','channelUrl','reason','extra[0]','requiredConsent','csrf']:
            self.assertIn('name="'+name+'"',html)
        self.assertNotIn('data-carousel',html)
        self.assertNotIn('/assets/vendor/',page('/journal/entries/new'))

    def test_campaign_gallery_has_five_local_photos_without_image_note(self):
        html=page('/campaigns/cp1')
        gallery=html.split('class="campaign-hero"',1)[1].split('<header class="campaign-detail-summary">',1)[0]
        self.assertIn('data-slide-count="5"',gallery)
        self.assertEqual(gallery.count('class="swiper-slide"'),5)
        images=re.findall(r'<img [^>]*src="([^"]+)"[^>]*>',gallery)
        self.assertEqual(len(set(images)),5)
        for source in images:
            self.assertTrue(source.startswith('/assets/images/'))
            self.assertTrue((ROOT/'public'/source.lstrip('/')).is_file())
        self.assertEqual(gallery.count('loading="eager"'),1)
        self.assertEqual(gallery.count('loading="lazy"'),4)
        self.assertNotIn('campaign-image-note',html)

    def test_media_is_local_deferred_and_attributed(self):
        html=page('/finance/articles/i2')
        self.assertIn('controls playsinline preload="none"',html)
        self.assertIn('poster="/assets/images/meal-prep-poster.webp"',html)
        self.assertNotIn('autoplay',html)
        self.assertIn('ilkerkaraca26 / Pixabay',html)
        self.assertIn('nrd / Unsplash',html)
        self.assertIn('loading="lazy" decoding="async"',html)
        self.assertLess((ROOT/'public/assets/media/meal-prep.mp4').stat().st_size,500_000)
        self.assertLess((ROOT/'public/assets/images/food.webp').stat().st_size,150_000)

if __name__=='__main__':unittest.main(verbosity=2)
