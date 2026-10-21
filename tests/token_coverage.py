"""Guard presentation tokens and CSS variable resolution in the shipped CSS."""
from pathlib import Path
import re
import unittest
from design_system import rules, foundation, FOUNDATION

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / 'public/assets/css/ds.css').read_text(encoding='utf-8')
DATA = foundation(CSS)
COMPONENTS = [(selector, body) for selector, body in rules(CSS) if selector not in FOUNDATION]
REF = re.compile(r'var\(\s*--([\w-]+)')


def declarations(body):
    yield from re.findall(r'(?:^|(?<=;))\s*([\w-]+)\s*:\s*([^;{}]+)(?=;|$)', body, re.M)


class TokenCoverage(unittest.TestCase):
    def test_component_colors_use_the_palette_without_tokenizing_every_number(self):
        # Transparent, angles, local radii, ratios and component animation timings
        # are ordinary CSS. Color meanings still come from the existing palette.
        literal = re.compile(r'#[\da-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\(|\b(?:white|black)\b')
        for selector, body in COMPONENTS:
            for prop, value in declarations(body):
                with self.subTest(selector=selector, property=prop, value=value):
                    stripped = re.sub(r'--[\w-]+', 'TOKEN', value)
                    self.assertNotRegex(stripped, literal)

    def test_root_tokens_are_not_redeclared_in_components(self):
        names = set(DATA['global']) | set(DATA['light']) | set(DATA['dark'])
        for name in DATA['global']:
            self.assertNotRegex(name, r'^(?:angle|mix|radius)-\d+$|^(?:font-scale|scale)-|^(?:color-transparent|list-indent)$')
        for selector, body in COMPONENTS:
            for prop, value in declarations(body):
                if prop.startswith('--'):
                    self.assertNotIn(prop[2:], names, f'{selector}: {prop}')

    def test_each_foundation_block_has_no_duplicate_declarations(self):
        # Separate light/dark mappings and the responsive spacing breakpoint are
        # intentional scopes. Repeating a property inside one scope is not.
        for selector, body in rules(CSS):
            if selector in FOUNDATION:
                names = re.findall(r'--([\w-]+)\s*:', body)
                self.assertEqual(len(names), len(set(names)), selector)

    def test_component_variables_have_a_definition_or_explicit_fallback(self):
        names = set(re.findall(r'--([\w-]+)\s*:', CSS))
        for name, next_char in re.findall(r'var\(\s*--([\w-]+)\s*([,)])', CSS):
            self.assertTrue(name in names or next_char == ',', f'missing {name}')

    def test_foundation_references_are_defined_and_acyclic(self):
        for theme in ('light', 'dark'):
            values = DATA['global'] | DATA[theme]
            visited = set()
            def visit(key, trail=()):
                self.assertIn(key, values, f'{theme}: unknown token from {trail}')
                self.assertNotIn(key, trail, f'{theme}: cyclic token reference')
                if key in visited:
                    return
                for dep in REF.findall(values[key]):
                    visit(dep, trail + (key,))
                visited.add(key)
            for key in values:
                visit(key)

    def test_breakpoints_are_valid_runtime_css(self):
        self.assertNotRegex(CSS, r'\btoken\(')
        self.assertTrue(any(key.startswith('breakpoint-') for key in DATA['global']))
        for condition in re.findall(r'@media([^{}]+)\{', CSS):
            self.assertNotRegex(condition, r'var\(')
            for size in re.findall(r'(?:min|max)-width\s*:\s*([^\)]+)', condition):
                self.assertRegex(size, r'^\d+px$')

    def test_distribution_notices_are_included_with_assets(self):
        self.assertIn('Copyright (c) 2026 Plander, Inc', CSS)
        notice = (ROOT / 'public/assets/NOTICE.txt').read_text(encoding='utf-8')
        for name in ['Lucide', 'Pretendard', 'Unsplash', 'Pixabay']:
            self.assertIn(name, notice)


if __name__ == '__main__':
    unittest.main(verbosity=2)
