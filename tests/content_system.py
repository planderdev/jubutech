"""Verify ownership, paragraph semantics and unchanged token values."""
from pathlib import Path
import re,subprocess,unittest

ROOT=Path(__file__).resolve().parents[1]
CSS=(ROOT/'public/assets/css/ds.css').read_text(encoding='utf-8')

class ContentSystem(unittest.TestCase):
    def test_reset_precedes_base_and_content_without_app_patches(self):
        self.assertLess(CSS.index('/* Reset:'),CSS.index('/* Base:'))
        self.assertLess(CSS.index('/* Base:'),CSS.index('.post {'))
        self.assertNotRegex((ROOT/'public/assets/css/app.css').read_text(encoding='utf-8'),r'\.post\b|\.ui-prose\b')

    def test_plain_text_paragraphs_are_semantic_and_remain_escaped(self):
        code="require 'app/helpers.php'; require 'app/content.php'; echo proseParagraphs(\"첫 문단\\n\\n두 번째 <script>alert(1)</script>\\n한 줄\");"
        # helpers requires the project path for its existing artwork include.
        code="define('APP_PATH',getcwd().'/app');"+code
        result=subprocess.run(['C:/php/php.exe','-r',code],cwd=ROOT,capture_output=True,text=True,encoding='utf-8',check=True).stdout
        self.assertEqual(result.count('<p>'),2);self.assertIn('&lt;script&gt;',result);self.assertNotIn('<script>',result);self.assertEqual(result.count('<br'),1)

    def test_content_scope_has_no_layout_gap_or_paragraph_padding(self):
        source=CSS
        body=re.search(r'\.post \{([^}]+)',source)[1]
        self.assertNotRegex(body,r'\bgap\s*:');self.assertRegex(body,r'display:\s*flow-root')
        self.assertNotIn('--post-bottom',source)
        for tag in ['h1','h2','h3','h4','h5','h6']:self.assertIn(f'.post :where({tag})',source)

if __name__=='__main__':unittest.main(verbosity=2)
