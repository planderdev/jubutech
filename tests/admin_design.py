"""Admin design isolation and foundation policy; no browser required."""
from pathlib import Path
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
DS=(ROOT/'public/assets/admin/css/admin-ds.css').read_text(encoding='utf-8')
LAYOUT=(ROOT/'public/assets/admin/css/admin.css').read_text(encoding='utf-8')

class AdminDesign(unittest.TestCase):
    def test_blue_original_definitions_and_no_shadow_roots(self):
        self.assertEqual(len(re.findall(r'(?:^|\n):root\s*\{',DS)),1)
        self.assertIn('--primary-normal: #2563EB;',DS)
        self.assertNotRegex(DS,r'(?i)#(?:DB6287|C7597B|B4506F|FBEFF3|E489A5|402C3B)')
        self.assertNotRegex(LAYOUT,r':root|!important|--primary-\w+\s*:|--size-')
        self.assertIn('--primary-normal: #DB6287;', (ROOT/'public/assets/css/ds.css').read_text(encoding='utf-8'))

    def test_variables_resolve_or_have_explicit_fallbacks(self):
        css=DS+'\n'+LAYOUT
        defined=set(re.findall(r'--([\w-]+)\s*:',css))
        required=set(re.findall(r'var\(\s*--([\w-]+)\s*\)',css))
        self.assertEqual(required-defined,set())
        self.assertIn('url(../../fonts/PretendardVariable.woff2)',DS)

    def test_admin_composition_spacing_is_eight_pixel_grid(self):
        for prop,value in re.findall(r'(padding(?:-[\w]+)?|margin(?:-[\w]+)?|gap|row-gap|column-gap):([^;}]+)',LAYOUT):
            for amount in re.findall(r'(?<![\w-])(\d+(?:\.\d+)?)px',value):
                self.assertEqual(float(amount)%8,0,(prop,value))

if __name__=='__main__':unittest.main()
