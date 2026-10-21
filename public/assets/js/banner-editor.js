/* Admin-only live preview; all content is assigned as text, never executable HTML. */
(() => {
 'use strict';
 const form=document.querySelector('[data-banner-editor]');if(!form)return;
 const card=form.querySelector('.banner-card'),image=card.querySelector('[data-banner-image]'),fallback=card.querySelector('[data-banner-image-fallback]'),warning=form.querySelector('[data-banner-preview-warning]');
 const field=name=>form.elements.namedItem(name),value=name=>field(name)?.value.trim()||'';
 let request=0,lastImageKey='';
 const imageStatus=async()=>{
  const uploaded=form.elements.namedItem('assetUpload')?.files?.[0],token=++request,src=uploaded?URL.createObjectURL(uploaded):value('image'),detail=value('type')==='detail';
  if(!uploaded&&!/^\/assets\/images\/(?:[\w-]+\/)*[\w.-]+\.(?:png|webp|svg)$/i.test(src)){image.hidden=true;fallback.hidden=false;warning.textContent='이미지 경로를 확인해 주세요.';field('image').setCustomValidity(warning.textContent);return;}
  const probe=new Image();probe.src=src;
  try{await probe.decode();if(token!==request)return;
   if(detail){const canvas=document.createElement('canvas');canvas.width=Math.min(200,probe.naturalWidth);canvas.height=Math.min(200,probe.naturalHeight);const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(probe,0,0,canvas.width,canvas.height);const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;let transparent=false;for(let i=3;i<pixels.length;i+=4)if(pixels[i]<250){transparent=true;break;}if(!transparent)throw Error('alpha');}
   image.src=src;image.hidden=false;fallback.hidden=true;warning.textContent='';field('image').setCustomValidity('');
  }catch(error){if(token!==request)return;image.hidden=true;fallback.hidden=false;warning.textContent=error.message==='alpha'?'상세형은 배경이 실제로 투명한 상품 사진이 필요해요.':'이미지를 불러오지 못했어요. 경로를 확인해 주세요.';field('image').setCustomValidity(warning.textContent);}
 };
 const update=()=>{
  const detail=value('type')==='detail',hasUpload=!!form.elements.namedItem('assetUpload')?.files?.length,removed=!!form.elements.namedItem('removeImage')?.checked;field('image').required=!hasUpload&&!removed;if(removed){image.hidden=true;fallback.hidden=false;field('image').setCustomValidity('');}
  if(detail&&value('imagePreset')==='promotion')field('imagePreset').value='tall';else if(!detail)field('imagePreset').value='promotion';
  for(const option of field('imagePreset').options)option.disabled=detail?option.value==='promotion':option.value!=='promotion';
  card.classList.toggle('banner-card--detail',detail);card.classList.toggle('banner-card--promotion',!detail);card.dataset.bannerBackground=value('background');card.dataset.bannerPreset=value('imagePreset');
  card.querySelectorAll('[data-banner-text]').forEach(el=>{const text=value(el.dataset.bannerText);el.textContent=text;el.hidden=!text||(!detail&&['benefit','note'].includes(el.dataset.bannerText));});image.alt=value('imageAlt');
  form.querySelectorAll('[data-banner-detail-field]').forEach(el=>{el.hidden=!detail;el.querySelectorAll('input,textarea').forEach(input=>input.disabled=!detail);});
  const key=value('image')+'|'+value('type')+'|'+hasUpload+'|'+(form.elements.namedItem('assetUpload')?.files?.[0]?.name||'')+'|'+removed;if(key!==lastImageKey){lastImageKey=key;if(!removed)imageStatus();}
  for(const name of ['title','description']){const el=card.querySelector(`[data-banner-text="${name}"]`),lineHeight=parseFloat(getComputedStyle(el).lineHeight);field(name).setCustomValidity(el.offsetHeight>lineHeight*2+1?'문구를 두 줄 이내로 정리해 주세요.':'');}
  const body=card.querySelector('.banner-card__copy').getBoundingClientRect(),bounds=card.getBoundingClientRect();if(body.bottom>bounds.bottom-(detail?40:16))field('description').setCustomValidity('문구가 하단 안내와 겹치지 않도록 제목과 설명을 정리해 주세요.');
 };
 form.addEventListener('input',update);form.addEventListener('change',update);update();
})();
