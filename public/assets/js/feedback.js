/* Form feedback uses Base UI's toast, field errors and native constraints. */
(() => {
 'use strict';
 if(window.AppFeedback)return;
 const all=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
 let activeToast,activeKind,errorId=0;
 const dismiss=()=>{activeToast?.querySelector('.toast__close')?.click();activeToast=undefined;activeKind=undefined;};
 const show=(message,options={})=>{
  if(!message)return;
  dismiss();
  const error=options.kind==='error';
  activeKind=options.kind||'status';
  const dialog=document.querySelector('dialog[open]');
  const higherThanCTA=!!(dialog?dialog.querySelector('.bottom-cta'):document.querySelector('.app-nav-frame,.bottom-cta--fixed'));
  activeToast=UI.toast(message,{duration:error?6000:4000,icon:error?'circle-alert':'circle-check',dismissible:true,...options,position:'bottom',higherThanCTA});
  return activeToast;
 };
 const focus=input=>{
  if(!input)return;
  for(let parent=input.parentElement;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
  const dialog=input.closest('dialog');if(dialog&&!dialog.open)UI.openDialog(dialog);
  if(input.hidden||input.classList.contains('sr-only')){
   const field=input.closest('.field,[data-datepicker],[data-month-picker]');
   input=field&&all('input:not([type="hidden"]),button',field).find(el=>!el.hidden&&!el.classList.contains('sr-only')&&el.getClientRects().length)||input;
  }
  input.focus();
  if(input.closest('.dialog__body'))input.scrollIntoView?.({block:'nearest',inline:'nearest'});
 };
 const label=input=>{
  const text=input.closest('.field')?.querySelector('.label')?.textContent||input.getAttribute('aria-label')||input.labels?.[0]?.childNodes&&Array.from(input.labels[0].childNodes).filter(node=>node.nodeType===3).map(node=>node.textContent).join('')||'';
  return text.trim()||'필수';
 };
 const message=input=>{
  if(!input.willValidate)return '';
  const validity=input.validity,name=label(input);
  if(validity.customError)return input.validationMessage;
  if(validity.valueMissing||input.required&&['text','search','tel','email','url','textarea'].includes(input.type)&&!input.value.trim())return input.type==='checkbox'?'필수 동의 항목을 선택해 주세요.':input.type==='radio'?'필수 항목을 선택해 주세요.':name+' 항목을 입력해 주세요.';
  if(validity.badInput)return name+' 항목에 올바른 값을 입력해 주세요.';
  if(validity.typeMismatch)return input.type==='url'?'올바른 URL을 입력해 주세요.':input.type==='email'?'올바른 이메일 주소를 입력해 주세요.':name+'의 입력 형식을 확인해 주세요.';
  if(validity.rangeUnderflow)return name+': '+input.min+' 이상으로 입력해 주세요.';
  if(validity.rangeOverflow)return name+': '+input.max+' 이하로 입력해 주세요.';
  if(validity.tooShort)return name+': '+input.minLength+'자 이상 입력해 주세요.';
  if(validity.tooLong)return name+': '+input.maxLength+'자 이하로 입력해 주세요.';
  if(!validity.valid)return name+'의 입력 형식을 확인해 주세요.';
  return '';
 };
 const setError=(input,text)=>{
  input.setAttribute('aria-invalid',String(!!text));
  let help=input.closest('.field')?.querySelector('[data-field-error]');
  if(!help&&input.dataset.feedbackError)help=document.getElementById(input.dataset.feedbackError);
  if(!help&&text){
   help=document.createElement('span');help.id='feedback-error-'+(++errorId);help.className='help';help.dataset.fieldError='';
   const wrapper=input.closest('.checkbox,.radio');(wrapper?.querySelector('span')||input.parentElement).append(help);
   input.dataset.feedbackError=help.id;
  }
  if(help){
   help.textContent=text;help.classList.toggle('help--error',!!text);
   const ids=new Set((input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));
   if(help.id)ids.add(help.id);input.setAttribute('aria-describedby',Array.from(ids).join(' '));
  }
 };
 const validate=(scope,{focus:moveFocus=true}={})=>{
  let first,text;
  for(const input of all('input,select,textarea',scope)){
   if(!input.willValidate)continue;
   const error=message(input);setError(input,error);
   if(error&&!first){first=input;text=error;}
  }
  if(!first){if(activeKind==='error')dismiss();return true;}
  if(moveFocus)focus(first);
  show(text,{kind:'error'});
  // Bottom feedback can shrink a sheet's scroll area after the first focus.
  if(moveFocus)requestAnimationFrame(()=>focus(first));
  return false;
 };
 window.AppFeedback={show,validate,focus};
 // Keep HTML constraints for a no-script fallback; suppress only the native UI
 // once this common validation handler is available.
 all('form').forEach(form=>form.noValidate=true);
 document.addEventListener('submit',event=>{
  const form=event.target;
  if(event.defaultPrevented||event.submitter?.formNoValidate||form.matches('#journal-form,[data-compact-wizard]'))return;
  if(!validate(form)){event.preventDefault();event.stopImmediatePropagation();}
 },true);
 for(const type of ['input','change'])document.addEventListener(type,event=>{
  const input=event.target;
  if(input.matches('input,select,textarea')&&input.getAttribute('aria-invalid')==='true')setError(input,message(input));
 });
 const hydrate=()=>{
  all('[data-feedback-message]').forEach(node=>{
   const kind=node.dataset.kind||'status',text=node.querySelector('[data-feedback-text]').textContent;
   const form=all('form').find(form=>form.elements.namedItem('action')?.value===node.dataset.formAction);
   const invalid=form?.querySelector('[aria-invalid="true"]');
   const dialog=form?.closest('dialog');if(dialog&&!dialog.open)UI.openDialog(dialog);
   const undo=node.querySelector('form');
   if(undo){undo.hidden=true;document.body.append(undo);}
   node.closest('[data-feedback-fallback]').remove();
   show(text,{kind,duration:kind==='error'||undo?0:4000,...(undo?{actionLabel:undo.querySelector('button').textContent,action:()=>undo.requestSubmit()}:{} )});
   if(kind==='error'&&invalid)requestAnimationFrame(()=>focus(invalid));
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hydrate,{once:true});else hydrate();
})();
