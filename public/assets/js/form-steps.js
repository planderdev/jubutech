(() => {
 'use strict';
 document.querySelectorAll('[data-compact-wizard]').forEach(form=>{
  const sections=Array.from(form.querySelectorAll('[data-form-step]'));
  const previous=form.querySelector('[data-form-prev]'),next=form.querySelector('[data-form-next]'),submit=form.querySelector('[data-form-submit]'),status=form.querySelector('[data-form-status]');
  // Keep the previous and final actions in one row; the original submit stays
  // available outside the hidden enhancement controls when JavaScript is off.
  form.querySelector('.bottom-cta__buttons').append(submit);
  submit.classList.remove('button--full');
  let index=0;form.noValidate=true;
  const valid=(section,focus=true)=>window.AppFeedback.validate(section,{focus});
  const show=(n,focus=true)=>{index=n;sections.forEach((section,i)=>{section.hidden=i!==index;section.inert=i!==index;});previous.hidden=!index;next.hidden=index===sections.length-1;submit.hidden=index!==sections.length-1;status.textContent=`${index+1} / ${sections.length}`;if(focus){window.AppScroll?.scrollTo(0);sections[index].querySelector('h2').focus({preventScroll:true});window.AppMotion?.enter(sections[index]);}};
  previous.addEventListener('click',()=>show(Math.max(0,index-1)));next.addEventListener('click',()=>{if(valid(sections[index]))show(index+1);});
  form.addEventListener('submit',e=>{if(index<sections.length-1){e.preventDefault();if(valid(sections[index]))show(index+1);return;}for(let i=0;i<sections.length;i++){if(!valid(sections[i],false)){e.preventDefault();show(i,false);window.AppFeedback.focus(sections[i].querySelector('[aria-invalid="true"]'));return;}}});
  form.querySelector('[data-form-controls]').hidden=false;
  const invalid=sections.findIndex(section=>section.querySelector('[aria-invalid="true"]'));
  show(Math.max(0,invalid),false);
 });
})();
