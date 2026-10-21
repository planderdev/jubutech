(() => {
 'use strict';
 const fallback=media=>{
  if(media.dataset.failed)return;
  media.dataset.failed='true';media.hidden=true;
  const text=document.createElement('p');text.className='type-label-2 muted--on-alternative';text.setAttribute('role','status');
  text.textContent=media.tagName==='VIDEO'?'영상을 불러오지 못했어요. 아래 설명으로 내용을 확인해 주세요.':'이미지를 불러오지 못했어요. 아래 내용을 확인해 주세요.';
  media.after(text);
 };
 document.querySelectorAll('img').forEach(img=>{img.addEventListener('error',()=>fallback(img),{once:true});if(img.complete&&!img.naturalWidth)fallback(img);});
 const videos=Array.from(document.querySelectorAll('video[data-media]'));
 videos.forEach(video=>{video.addEventListener('error',()=>fallback(video),{once:true});video.querySelectorAll('source').forEach(source=>source.addEventListener('error',()=>fallback(video),{once:true}));});
 const pause=()=>videos.forEach(video=>video.pause());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 document.addEventListener('ui:open',pause);window.addEventListener('pagehide',pause);
})();
