"""Check authored layout spacing, including aliases; geometry is deliberately excluded."""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tests'))
from design_system import rules

def audit():
    files=list((ROOT/'public/assets/css').glob('*.css'))
    definitions={}
    rows=[]
    for p in files:
        for selector,body in rules(p.read_text(encoding='utf-8')):
            for prop,value in re.findall(r'(?:^|;)\s*([\w-]+)\s*:\s*([^;{}]+)',body):
                if prop.startswith('--'):definitions.setdefault(prop[2:],set()).add(value.strip())
                if re.match(r'^(?:padding|margin|gap|row-gap|column-gap)(?:-|$)',prop):
                    rows.append((str(p.relative_to(ROOT)).replace('\\','/'),selector,prop,value.strip()))
    dynamic={'cta-height','keyboard-offset','viewport-height','viewport-width','viewport-top','scrollbar-compensation'}
    def leaves(value,trail=()):
        # Collect static operands separately from actual device measurements.
        refs=re.findall(r'var\(--([\w-]+)',value)
        stripped=re.sub(r'--[\w-]+','TOKEN',value)
        result=re.findall(r'(?<![\w.-])(-?\d*\.?\d+)(px|rem|em|vh|dvh|vw|%)',stripped)
        for name in refs:
            if name in dynamic or name in trail:continue
            for v in definitions.get(name,[]):result+=leaves(v,trail+(name,))
        return result
    violations=[];exceptions=[]
    for file,selector,prop,value in rows:
        values=leaves(value)
        bad=[n+unit for n,unit in values if float(n)>0 and (unit!='px' or float(n)%8!=0)]
        if selector=='.sr-only' and prop=='margin':
            exceptions.append({'file':file,'selector':selector,'property':prop,'value':value,'reason':'screen-reader clipping, not visible spacing'})
        elif bad:violations.append({'file':file,'selector':selector,'property':prop,'value':value,'invalid':bad})
    return {'declarationsChecked':len(rows),'violations':violations,'exceptions':exceptions}

if __name__=='__main__':
    result=audit()
    output=ROOT/'.runtime/audits/spacing-audit.json'
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
    sys.exit(bool(result['violations']))
