"""Inventory shipped CSS variables; keep numeric wrappers distinct from real tokens."""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests'))
from design_system import rules

def audit():
    files = list((ROOT / 'public/assets/css').glob('*.css')) + list((ROOT / 'public/assets/js').glob('*.js')) + list((ROOT / 'app').rglob('*.php'))
    inventory = {}
    def item(name):
        return inventory.setdefault(name, {'declarations': [], 'references': []})
    for file in files:
        source = file.read_text(encoding='utf-8-sig'); path=str(file.relative_to(ROOT)).replace('\\','/')
        if file.suffix == '.css':
            for selector,body in rules(source):
                for name,value in re.findall(r'--([\w-]+)\s*:\s*([^;{}]+)',body):
                    item(name)['declarations'].append({'file':path,'scope':selector,'value':value.strip()})
        for m in re.finditer(r'var\(\s*--([\w-]+)|(?:setProperty|getPropertyValue)\([\'\"](--[\w-]+)', source):
            name=m.group(1) or m.group(2)[2:]
            record={'file':path,'line':source.count('\n',0,m.start())+1}
            item(name)['references'].append(record)
            if 'setProperty' in m.group(0):item(name)['declarations'].append(record|{'scope':'runtime'})
    runtime={'keyboard-offset','viewport-top','viewport-height','viewport-width','app-frame-width','cta-height','progress','scrollbar-compensation','tab-indicator-x','tab-indicator-width'}
    for name,data in inventory.items():
        if name in runtime or any(d.get('scope')=='runtime' for d in data['declarations']):kind='runtime measurement/state'
        elif (name.startswith('size-')
              or re.match(r'^(?:angle|mix|radius)-\d+$|^(?:font-scale|scale)-|^(?:color-transparent|list-indent)$',name)
              or (name.startswith('space-') and (not name[6:].isdigit() or int(name[6:])==0 or int(name[6:])%8))):kind='numeric wrapper to migrate'
        elif any(d.get('scope') in ('[data-theme="light"]','[data-theme="dark"]') for d in data['declarations']):kind='theme mapping'
        elif any(d.get('scope')==':root' for d in data['declarations']):kind='foundation token'
        else:kind='component configuration'
        data['classification']=kind
    return inventory

if __name__ == '__main__':
    output=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'.runtime/audits/token-inventory.json'
    output.parent.mkdir(parents=True,exist_ok=True)
    data=audit();output.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    from collections import Counter
    print(json.dumps(Counter(v['classification'] for v in data.values()),ensure_ascii=False))
