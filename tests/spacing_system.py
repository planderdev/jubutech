"""Regression protection for the approved 8px spacing and token ownership policy."""
import importlib.util
from pathlib import Path
import re
import unittest
from design_system import foundation, rules

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'
CSS = (ASSETS / 'css/ds.css').read_text(encoding='utf-8')
DATA = foundation(CSS)


class SpacingSystem(unittest.TestCase):
    def test_all_layout_spacing_including_local_aliases_is_on_grid(self):
        spec = importlib.util.spec_from_file_location('spacing_audit', ROOT / 'scripts/audit_spacing.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        self.assertEqual(module.audit()['violations'], [])

    def test_numeric_wrapper_tokens_have_no_live_references(self):
        files = list((ASSETS/'css').glob('*.css')) + list((ASSETS/'js').glob('*.js')) + list((ROOT / 'app').rglob('*.php'))
        for path in files:
            source = path.read_text(encoding='utf-8')
            self.assertNotRegex(source, r'--size-[\w-]+', str(path))
            for number in re.findall(r'--space-(\d+)\b', source):
                self.assertGreater(int(number), 0)
                self.assertEqual(int(number) % 8, 0, str(path))

    def test_numbered_utilities_match_their_name_and_markup(self):
        for prefix, number, body in re.findall(r'\.([mp][xtyb]?|gap)-(\d+)\s*\{([^}]+)\}', CSS):
            self.assertEqual(int(number) % 8, 0)
            value = '0' if number == '0' else f'var(--space-{number})'
            self.assertRegex(body, r':\s*' + re.escape(value) + r'\s*;')
        for path in list((ROOT / 'app').rglob('*.php')) + list((ASSETS/'js').glob('*.js')):
            for number in re.findall(r'\b(?:[mp][xtyb]?|gap)-(\d+)\b', path.read_text(encoding='utf-8')):
                self.assertEqual(int(number) % 8, 0, str(path))

    def test_responsive_spacing_is_discrete_and_themes_are_complete(self):
        self.assertEqual(set(DATA['light']), set(DATA['dark']))
        self.assertTrue(DATA['light'])
        for selector, body in rules(CSS):
            if selector != ':root':
                continue
            for name, value in re.findall(r'--((?:responsive-)?space-[\w-]+)\s*:\s*([^;]+);', body):
                self.assertGreater(int(name.rsplit('-', 1)[1]), 0)
                self.assertEqual(int(name.rsplit('-', 1)[1]) % 8, 0)
                if name.startswith('responsive-space-'):
                    self.assertRegex(value, r'^var\(--space-\d+\)$')


if __name__ == '__main__':
    unittest.main(verbosity=2)
