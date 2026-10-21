"""Source contracts preventing sticky hover and preserving input/selection states."""
from pathlib import Path
import re
import unittest
import urllib.request
from design_system import rules

ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / 'public/assets/css/ds.css').read_text(encoding='utf-8')


def contextual_rules(source, parents=()):
    source = re.sub(r'/\*.*?\*/', '', source, flags=re.S)
    pos = 0
    while (start := source.find('{', pos)) >= 0:
        selector = source[pos:start].strip()
        depth, end = 1, start + 1
        while depth:
            depth += (source[end] == '{') - (source[end] == '}')
            end += 1
        body = source[start + 1:end - 1]
        if selector.startswith('@media'):
            yield from contextual_rules(body, parents + (selector,))
        elif not selector.startswith('@'):
            yield selector, body, parents
        pos = end


class TouchInteractions(unittest.TestCase):
    def test_every_hover_is_desktop_opt_in_and_never_moves_or_reveals_content(self):
        hover = [(s,b,p) for s,b,p in contextual_rules(CSS) if ':hover' in s]
        self.assertTrue(hover)
        for selector, body, parents in hover:
            with self.subTest(selector=selector):
                self.assertTrue(any('(hover:hover)' in p and '(pointer:fine)' in p for p in parents))
                self.assertIn('[data-interaction="pointer"]', selector)
                self.assertNotRegex(body, r'\b(transform|scale|translate|box-shadow|display|visibility|opacity)\s*:')

    def test_native_pressed_feedback_is_short_and_excludes_disabled_loading(self):
        for name in ['.button', '.text-button', '.icon-button', '.card--interactive',
                     '.list-row:where(button,a)', '.chip', '.calendar__day']:
            matches = [(s,b) for s,b in rules(CSS) if re.sub(r'\s*,\s*', ',', s).startswith(name + ':active')]
            self.assertTrue(matches, name)
            for selector, body in matches:
                self.assertIn(':not([aria-disabled=true])', selector)
                self.assertIn(':not([aria-busy=true])', selector)
                self.assertNotIn('transform:', body)
        for name in ['.button', '.chip', '.card--interactive', '.list-row']:
            self.assertTrue(any(name in s and 'var(--duration-fast)' in b for s,b in rules(CSS)),name)
        self.assertRegex(CSS, r'--duration-fast:\s*120ms;')

    def test_focus_and_selected_checked_states_remain_explicit(self):
        source_rules = list(rules(CSS))
        focus = [b for s,b in source_rules if s.startswith('.root :focus-visible')]
        self.assertTrue(focus)
        self.assertIn('solid var(--focus)', focus[0])
        self.assertIn(':has(input:focus-visible)', CSS)
        for selector in ['.tabs [aria-selected=true]', '.calendar__grid [aria-selected=true] .calendar__day',
                         '.checkbox input:checked', '.bottom-nav [aria-current=page]']:
            self.assertTrue(any(selector in s for s,_ in source_rules), selector)
        self.assertIn('.input[aria-invalid=true]', CSS)
        self.assertIn('.button[aria-busy=true]', CSS)
        self.assertIn('@media (prefers-reduced-motion:reduce)', CSS)

    def test_weak_danger_keeps_its_tint_without_a_black_pressed_overlay(self):
        source_rules = list(rules(CSS))
        variant = next(b for s,b in source_rules if s == '.button--weak.button--danger')
        values = dict(re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', variant))
        self.assertEqual(values['--button-background-color'], 'var(--palette-red-50)')
        for token in ['--button-color', '--button-hover-color', '--button-active-color']:
            self.assertEqual(values[token], 'var(--palette-red-500)')
        for selector, body in source_rules:
            if selector.startswith('.button:active'):
                self.assertNotIn('::before', selector)
                self.assertIn('background: var(--button-active-color)', body)
            if selector.startswith('.button--weak.button--danger:active'):
                self.assertIn('background: var(--button-background-color)', body)
                self.assertIn('color: var(--button-active-color)', body)
        self.assertNotIn('--button-pressed-background-color', CSS)
        self.assertNotIn('--button-pressed-opacity', CSS)

    def test_help_is_visible_without_hover_and_activation_uses_click(self):
        bubble = next(b for s,b in rules(CSS) if s == '.tooltip__bubble')
        self.assertRegex(bubble, r'visibility:\s*visible')
        self.assertRegex(bubble, r'opacity:\s*var\(--opacity-100\)')
        self.assertRegex(bubble, r'position:\s*static')
        for p in (ROOT / 'public/assets/js').glob('*.js'):
            if p.name == 'ds.js':continue  # Base UI's optional hover API is outside the app event policy.
            self.assertNotRegex(p.read_text(encoding='utf-8'), r'\b(mouseenter|mouseover|pointerenter)\b')
        app = (ROOT / 'public/assets/js/app.js').read_text(encoding='utf-8')
        self.assertIn("button.addEventListener('click'", app)
        self.assertNotIn('touchend', app)  # No second activation path or persistent press class.

    def test_user_and_admin_layouts_select_the_intended_policy(self):
        for path, policy in [('/journal','touch'),('/finance','touch'),('/campaigns','touch'),('/admin/login','pointer')]:
            html = urllib.request.urlopen('http://127.0.0.1:8088'+path).read().decode()
            self.assertRegex(html, rf'<body class="[^"]*\broot\b[^"]*" data-interaction="{policy}"')


if __name__ == '__main__':
    unittest.main(verbosity=2)
