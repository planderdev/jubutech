<?php
/** Original category illustrations, deliberately unbranded; not product photos.
 * Geometry belongs to artwork. Every fill reads the existing Base UI palette. */
function objectArt(string $kind): string {
 $paper='var(--surface-raised)';$rose='var(--primary-normal)';$soft='var(--primary-soft)';$ink='var(--focus)';
 $gold='var(--palette-yellow-300)';$green='var(--palette-teal-300)';$shade='var(--fill-strong)';
 $s='<ellipse cx="120" cy="177" rx="77" ry="11" fill="'.$shade.'"/>';
 switch($kind){
 case 'lotion':case 'soap':
  $s.='<rect x="70" y="69" width="93" height="108" rx="23" fill="'.$paper.'"/><rect x="95" y="48" width="44" height="30" rx="8" fill="'.$rose.'"/><path d="M112 45V31H164V41H126V48" fill="'.$rose.'"/><rect x="79" y="105" width="75" height="46" rx="10" fill="'.$soft.'"/><path d="M117 112C93 141 123 150 131 132C133 126 127 119 117 112" fill="'.$rose.'"/><rect x="163" y="116" width="28" height="62" rx="9" fill="'.$green.'"/>';break;
 case 'cup':case 'bread':
  $s.='<ellipse cx="114" cy="172" rx="70" ry="10" fill="'.$paper.'"/><path d="M154 84H174C205 84 203 139 169 139H154V124H171C188 124 188 99 171 99H154" fill="'.$rose.'"/><path d="M63 75H157V140Q157 166 131 166H89Q63 166 63 140Z" fill="'.$rose.'"/><ellipse cx="110" cy="76" rx="47" ry="12" fill="'.$soft.'"/><ellipse cx="110" cy="77" rx="38" ry="8" fill="'.$ink.'"/><path d="M88 54Q75 39 91 25M121 54Q109 40 124 22" fill="none" stroke="'.$paper.'" stroke-width="9" stroke-linecap="round"/>';break;
 case 'home':
  $s.='<path d="M115 138L134 42Q137 25 151 30L177 39L172 55L150 47L135 144" fill="'.$paper.'"/><rect x="86" y="134" width="88" height="41" rx="18" fill="'.$green.'"/><rect x="91" y="143" width="78" height="20" rx="10" fill="'.$paper.'"/><path d="M53 55V78M42 66H65M175 111V133M164 122H186" stroke="'.$gold.'" stroke-width="6" stroke-linecap="round"/>';break;
 case 'pet':
  $s.='<path d="M61 62H167L177 171H52Z" fill="'.$paper.'"/><rect x="62" y="54" width="104" height="18" rx="5" fill="'.$gold.'"/><path d="M98 144C76 140 98 115 111 119C128 117 151 146 129 148Z" fill="'.$rose.'"/><ellipse cx="86" cy="107" rx="9" ry="12" fill="'.$rose.'"/><ellipse cx="109" cy="98" rx="9" ry="12" fill="'.$rose.'"/><ellipse cx="133" cy="107" rx="9" ry="12" fill="'.$rose.'"/><rect x="165" y="155" width="39" height="15" rx="7" fill="'.$gold.'" transform="rotate(-20 180 160)"/>';break;
 case 'survey':case 'file-text':case 'clipboard-check':case 'newspaper':
  $s.='<rect x="62" y="35" width="115" height="143" rx="15" fill="'.$paper.'" transform="rotate(-7 120 105)"/><rect x="91" y="26" width="56" height="21" rx="8" fill="'.$rose.'"/><path d="M84 78H147M84 104H154M84 130H124" stroke="'.$soft.'" stroke-width="12" stroke-linecap="round"/><circle cx="168" cy="149" r="28" fill="'.$green.'"/><path d="M155 149L164 158L181 139" fill="none" stroke="'.$paper.'" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';break;
 case 'gift':case 'shopping-basket':
  $s.='<rect x="53" y="86" width="132" height="88" rx="13" fill="'.$rose.'"/><rect x="45" y="66" width="148" height="32" rx="10" fill="'.$soft.'"/><path d="M108 66H130V174H108Z" fill="'.$paper.'"/><path d="M118 66C54 65 71 15 99 36L120 64C180 64 165 14 140 36Z" fill="'.$gold.'"/>';break;
 default:
  $s.='<rect x="57" y="53" width="124" height="111" rx="15" fill="'.$paper.'" transform="rotate(-12 120 100)"/><rect x="78" y="42" width="104" height="71" rx="11" fill="'.$green.'" transform="rotate(8 120 90)"/><path d="M46 98Q46 85 59 85H173Q186 85 186 98V164Q186 177 173 177H59Q46 177 46 164Z" fill="'.$rose.'"/><rect x="144" y="118" width="48" height="31" rx="10" fill="'.$soft.'"/><circle cx="160" cy="133" r="5" fill="'.$rose.'"/><circle cx="61" cy="61" r="25" fill="'.$gold.'"/><path d="M61 45V77M51 52H66Q76 52 68 61H55Q45 70 68 70" fill="none" stroke="'.$paper.'" stroke-width="4" stroke-linecap="round"/>';
 }
 return '<svg class="object-art" viewBox="0 0 240 210" aria-hidden="true" focusable="false">'.$s.'</svg>';
}
