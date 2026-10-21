const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('public/assets/js/feedback.js','utf8');

function field(name,{type='text',value='',required=true,validity={valid:false,valueMissing:true},disabled=false}={}){
 const attrs={},help={id:'help-'+name,textContent:'',classList:{toggle(){}}};
 const wrapper={querySelector:s=>s==='.label'?{textContent:name}:help};
 return {type,value,required,validity,willValidate:!disabled,min:'1',max:'31',dataset:{},labels:[],hidden:false,
  classList:{contains:()=>false},getClientRects:()=>[{}],closest:s=>s==='.field'?wrapper:null,
  matches:()=>true,setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k]||null,
  focus(){this.focused=true;},reportValidity(){throw Error('Native validation bubble must not open');},attrs,help};
}
function harness(inputs,{managed=false,dialog=null,fixedControls=false}={}){
 const events={},toasts=[];
 const form={noValidate:false,matches:()=>managed,querySelectorAll:()=>inputs};
 const document={readyState:'complete',querySelector:s=>s==='dialog[open]'?dialog:s==='.app-nav-frame,.bottom-cta--fixed'&&fixedControls?{}:null,querySelectorAll:s=>s==='form'?[form]:[],addEventListener:(name,fn)=>events[name]=fn};
 const window={};
 const UI={toast(text,options){const item={text,options,closed:false};toasts.push(item);return {querySelector:()=>({click:()=>item.closed=true})};}};
 vm.runInNewContext(source,{window,document,UI,Set,requestAnimationFrame:fn=>fn()});
 const submit=(submitter={})=>{const event={target:form,submitter,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};events.submit(event);return event;};
 return {form,events,toasts,submit,feedback:window.AppFeedback};
}

test('empty comments are blocked with one error toast and focus, without a browser bubble',()=>{
 const input=field('댓글',{type:'textarea'}),h=harness([input]);
 assert.equal(h.form.noValidate,true);
 assert.equal(h.submit().stopped,true);assert.equal(input.focused,true);
 assert.equal(input.attrs['aria-invalid'],'true');assert.equal(input.attrs['aria-describedby'],'help-댓글');
 assert.equal(h.toasts[0].options.kind,'error');assert.equal(input.help.textContent,h.toasts[0].text);
 assert.equal(h.toasts[0].options.position,'bottom');
 h.submit();assert.equal(h.toasts.filter(t=>!t.closed).length,1);
});

test('status and error toasts stay at the bottom and clear controls in the active surface',()=>{
 const page=harness([],{fixedControls:true});page.feedback.show('저장했어요.');
 assert.equal(page.toasts[0].options.position,'bottom');assert.equal(page.toasts[0].options.higherThanCTA,true);
 const sheet=harness([],{dialog:{querySelector:()=>({})},fixedControls:true});sheet.feedback.show('입력해 주세요.',{kind:'error',position:'top'});
 assert.equal(sheet.toasts[0].options.position,'bottom');assert.equal(sheet.toasts[0].options.higherThanCTA,true);
 const modal=harness([],{dialog:{querySelector:()=>null},fixedControls:true});modal.feedback.show('입력해 주세요.',{kind:'error'});
 assert.equal(modal.toasts[0].options.position,'bottom');assert.equal(modal.toasts[0].options.higherThanCTA,false);
});
test('whitespace is rejected and correcting a field clears its persistent error',()=>{
 const input=field('댓글',{type:'textarea',value:'  ',validity:{valid:true}}),h=harness([input]);
 assert.equal(h.submit().defaultPrevented,true);
 input.value='내용';h.events.input({target:input});
 assert.equal(input.attrs['aria-invalid'],'false');assert.equal(input.help.textContent,'');
 assert.equal(h.submit().defaultPrevented,undefined);
 assert.equal(h.toasts[0].closed,true);
});
test('URL and range errors retain their specific messages',()=>{
 const url=field('활동 채널 URL',{type:'url',validity:{valid:false,typeMismatch:true}}),h=harness([url]);
 h.submit();assert.match(h.toasts[0].text,/URL/);
 const target=field('목표',{type:'number',value:'32',validity:{valid:false,rangeOverflow:true}}),range=harness([target]);
 range.submit();assert.match(range.toasts[0].text,/31 이하/);
});
test('disabled controls and draft submissions do not block valid work',()=>{
 const input=field('입력',{disabled:true}),h=harness([input]);
 assert.equal(h.submit().defaultPrevented,undefined);assert.equal(h.toasts.length,0);
 const draft=harness([field('종목')]);assert.equal(draft.submit({formNoValidate:true}).defaultPrevented,undefined);
});
test('wizard validation stays step driven and can reveal an invalid step before focus',()=>{
 const input=field('신청 사유'),h=harness([input],{managed:true});
 assert.equal(h.submit().defaultPrevented,undefined);assert.equal(h.toasts.length,0);
 assert.equal(h.feedback.validate(h.form,{focus:false}),false);assert.equal(input.focused,undefined);
 h.feedback.focus(input);assert.equal(input.focused,true);assert.equal(h.toasts.length,1);
});
