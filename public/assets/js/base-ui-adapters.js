/* App bindings for Base UI components; foundation brand values are build-time configuration. */
(() => {
 'use strict';
 document.addEventListener('DOMContentLoaded',()=>{
  const qs=(selector,root=document)=>root.querySelector(selector);
  const all=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const emit=input=>{input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
  const openMonths=(input,returnTarget)=>{
   UI.openDatePicker(input);
   const calendar=document.getElementById(input.id+'-calendar');
   calendar._returnFocus=returnTarget;
   qs('[data-calendar-period]',calendar)?.click();
   return calendar;
  };
  const chosenMonth=(calendar,button)=>{
   const year=qs('[data-calendar-year]',calendar).value.padStart(4,'0');
   return year+'-'+String(Number(button.dataset.calendarMonth)+1).padStart(2,'0')+'-01';
  };

  // Base UI has a month/year view; this adapter commits the first day as a month.
  all('[data-month-picker]').forEach(root=>{
   const input=qs('input',root),control=document.createElement('div'),bridge=document.createElement('input');
   control.className='date-picker__control';
   bridge.type='date';bridge.id=input.id+'-date';bridge.value=input.value?input.value+'-01':'';
   bridge.className='sr-only';bridge.tabIndex=-1;bridge.setAttribute('aria-hidden','true');bridge.required=input.required;
   if(input.min)bridge.min=input.min+'-01';if(input.max)bridge.max=input.max+'-31';
   input.before(control);control.append(bridge,input);root.dataset.datepicker='';
   input.type='text';input.placeholder='YYYY-MM';input.pattern='[0-9]{4}-(0[1-9]|1[0-2])';input.maxLength=7;input.inputMode='numeric';
   UI.init(root);bridge.hidden=true;
   const calendar=qs('.calendar',root),trigger=qs('[data-date-trigger]',root);
   const updateLabel=()=>trigger.setAttribute('aria-label',input.value?'월 변경, '+input.value:'월 선택');
   let syncing=false;
   root.addEventListener('ui:date',e=>{
    if(e.target!==bridge||syncing)return;
    input.value=bridge.value.slice(0,7);syncing=true;emit(input);syncing=false;updateLabel();
   });
   input.addEventListener('change',()=>{
    if(syncing||!input.checkValidity())return;
    syncing=true;UI.setDate(bridge,input.value?input.value+'-01':'');syncing=false;updateLabel();
   });
   root.addEventListener('click',e=>{
    if(e.target.closest('[data-date-trigger]')){e.preventDefault();e.stopPropagation();openMonths(bridge,trigger);}
    const month=e.target.closest('[data-calendar-month]');
    if(month&&!month.disabled){e.preventDefault();e.stopPropagation();UI.setDate(bridge,chosenMonth(calendar,month));}
   },true);
   input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();openMonths(bridge,input);}});
   updateLabel();
  });

  // Preserve YYYY-MM-DDTHH:mm contracts while composing the DS date/time controls.
  all('[data-datetime-picker]').forEach(root=>{
   const original=qs('input',root),label=qs('label',root),group=document.createElement('div');
   const dateRoot=document.createElement('div'),timeRoot=document.createElement('div'),control=document.createElement('div');
   const dateInput=document.createElement('input'),timeInput=document.createElement('input');
   const [day='',time='']=original.value.split('T');
   group.className='datetime-fields';dateRoot.dataset.datepicker='';timeRoot.dataset.timepicker='';timeRoot.className='timepicker';
   control.className='date-picker__control';
   for(const [input,part,value] of [[dateInput,'date',day],[timeInput,'time',time]]){
    input.type=part;input.className='input';input.id=original.id+'-'+part;input.value=value;
    input.required=original.required;input.disabled=original.disabled;input.readOnly=original.readOnly;
    input.setAttribute('aria-label',label.textContent+(part==='date'?' 날짜':' 시간'));
    input.setAttribute('aria-describedby',original.getAttribute('aria-describedby')||'');
   }
   original.type='hidden';label.htmlFor=dateInput.id;
   control.append(dateInput);dateRoot.append(control);timeRoot.append(timeInput);group.append(dateRoot,timeRoot);original.after(group);
   UI.init(group);
   const sync=()=>{original.value=dateInput.value&&timeInput.value?dateInput.value+'T'+timeInput.value:'';};
   group.addEventListener('input',sync);group.addEventListener('change',sync);
  });

  all('[data-goal-progress]').forEach(el=>UI.setProgress(el,Number(el.dataset.goalProgress)));

  const journal=qs('[data-journal-date]');
  if(journal){
   const input=qs('input',journal),calendar=qs('.calendar',journal),monthButton=qs('[data-journal-month]'),dateButton=qs('[data-journal-calendar]');
   // Month and calendar buttons are the visible triggers for this screen.
   qs('[data-date-trigger]',journal).hidden=true;input.hidden=true;
   const recordDays=new Set(JSON.parse(journal.dataset.recordDates));let monthMode=false;
   const decorate=()=>all('[data-calendar-date]',calendar).forEach(button=>{
    const has=recordDays.has(button.dataset.calendarDate);
    if(has&&!button.getAttribute('aria-label').endsWith(', 기록 있음'))button.setAttribute('aria-label',button.getAttribute('aria-label')+', 기록 있음');
   });
   new MutationObserver(decorate).observe(calendar,{childList:true,subtree:true});decorate();
   const open=(button,months)=>{
    monthMode=months;button.setAttribute('aria-expanded','true');
    if(months)openMonths(input,button);else{UI.openDatePicker(input);calendar._returnFocus=button;}
   };
   monthButton.addEventListener('click',()=>open(monthButton,true));dateButton.addEventListener('click',()=>open(dateButton,false));
   calendar.addEventListener('close',()=>{monthButton.setAttribute('aria-expanded','false');dateButton.setAttribute('aria-expanded','false');});
   calendar.addEventListener('click',e=>{
    const month=e.target.closest('[data-calendar-month]');
    if(monthMode&&month&&!month.disabled){e.preventDefault();e.stopPropagation();UI.setDate(input,chosenMonth(calendar,month));}
   },true);
   input.addEventListener('ui:date',()=>{if(input.value)window.AppNavigation.go('/journal?date='+encodeURIComponent(input.value),{restore:true});});
  }
 });
})();
