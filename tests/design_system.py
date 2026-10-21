"""Guard the shipped Base UI boundary and its single CSS/JS editing source."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'public/assets'


def rules(text):
    """Read ordinary rules recursively through media/supports blocks."""
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    pos = 0
    while (opening := text.find('{', pos)) >= 0:
        selector = text[pos:opening].strip()
        depth, end = 1, opening + 1
        while depth and end < len(text):
            depth += (text[end] == '{') - (text[end] == '}')
            end += 1
        body = text[opening + 1:end - 1]
        if selector.startswith(('@media', '@supports', '@layer', '@container')):
            yield from rules(body)
        elif not selector.startswith('@'):
            yield selector, body
        pos = end


FOUNDATION = {':root', '[data-theme="light"]', '[data-theme="dark"]'}


def foundation(source=None):
    source = source if source is not None else (BASE / 'css/ds.css').read_text(encoding='utf-8')
    blocks = list(rules(source))
    values = lambda body: dict(re.findall(r'--([\w-]+)\s*:\s*([^;]+);', body))
    light = values(next(body for selector, body in blocks if selector == '[data-theme="light"]'))
    dark = values(next(body for selector, body in blocks if selector == '[data-theme="dark"]'))
    root = values(next(body for selector, body in blocks if selector == ':root'))
    return {'global': {key: value for key, value in root.items() if key not in light}, 'light': light, 'dark': dark}


class DesignSystemBoundary(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.vendor = (BASE / 'css/ds.css').read_text(encoding='utf-8')
        cls.classes = {name for selector, _ in rules(cls.vendor) for name in re.findall(r'\.([A-Za-z_][\w-]*)', selector)}
        cls.tokens = set(re.findall(r'(--[\w-]+)\s*:', cls.vendor))
        cls.styles = [BASE / 'css/app.css']
        cls.sources = list((ROOT / 'app').rglob('*.php')) + [p for p in (BASE/'js').glob('*.js') if p.name != 'ds.js']

    def test_runtime_assets_have_a_single_editing_source(self):
        for filename in ['css/ds.css', 'js/ds.js', 'css/app.css', 'js/app.js', 'fonts/PretendardVariable.woff2', 'icons/sprite.svg']:
            self.assertTrue((BASE / filename).is_file(), filename)
        self.assertFalse((BASE / 'base').exists())
        self.assertFalse(list(BASE.glob('*.css')) + list(BASE.glob('*.js')))
        self.assertIn('url(../fonts/PretendardVariable.woff2)', self.vendor)
        script = (BASE / 'js/ds.js').read_text(encoding='utf-8')
        self.assertIn('replace(/js\\/ds\\.js$/, "icons/sprite.svg")', script)

    def test_no_component_or_global_style_overrides(self):
        for path in self.styles:
            for selector, body in rules(path.read_text(encoding='utf-8-sig')):
                with self.subTest(file=path.name, selector=selector):
                    names = set(re.findall(r'\.([A-Za-z_][\w-]*)', selector))
                    self.assertFalse(names & self.classes, f'DS selector overridden: {names & self.classes}')
                    self.assertTrue(all(part.strip().startswith('.') for part in selector.split(',')))
                    self.assertNotIn('!important', body)
                    self.assertNotRegex(body, r'--[\w-]+\s*:')
                    self.assertFalse(set(re.findall(r'var\((--[\w-]+)', body)) - self.tokens)

    def test_brand_is_defined_in_original_root_not_overridden(self):
        self.assertFalse((BASE / 'css/brand.css').exists())
        roots = [body for selector, body in rules(self.vendor) if selector == ':root']
        self.assertEqual(len(roots), 1)
        root_values = dict(re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', roots[0]))
        self.assertEqual(root_values['--primary-normal'], '#DB6287')
        self.assertEqual(root_values['--primary-strong'], '#C7597B')
        self.assertEqual(root_values['--primary-heavy'], '#B4506F')
        self.assertEqual(root_values['--primary-soft'], '#FBEFF3')
        self.assertEqual(root_values['--focus'], 'var(--primary-normal)')

    def test_no_inline_or_script_style_overrides(self):
        for path in self.sources:
            source = path.read_text(encoding='utf-8')
            with self.subTest(file=str(path.relative_to(ROOT))):
                self.assertNotRegex(source, r'<style\b|\bstyle\s*=')
                self.assertNotRegex(source, r'\.style\s*[.\[]|\.setProperty\(')
                for name in re.findall(r'\btype-[a-z0-9-]+', source):
                    self.assertIn(name, self.classes)


if __name__ == '__main__':
    unittest.main(verbosity=2)
