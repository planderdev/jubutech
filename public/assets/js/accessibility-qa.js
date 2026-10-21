/* Explicit development audit only: qa=1&a11y=1. Never loaded in normal screens. */
(() => {
 let running=false;
 const run=async()=>{
  if(running||!window.axe)return;
  running=true;
  try {
   await document.fonts.ready;
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   await Promise.race([
    Promise.all(document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{}))),
    new Promise(resolve=>setTimeout(resolve,700))
   ]);
   const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});
   const report={path:location.pathname,viewport:innerWidth,engine:result.testEngine,passes:result.passes.length,incomplete:result.incomplete.map(r=>r.id),violations:result.violations.map(r=>({id:r.id,impact:r.impact,help:r.help,nodes:r.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))};
   let output=document.getElementById('qa-accessibility');
   if(!output){output=document.createElement('output');output.id='qa-accessibility';output.hidden=true;document.body.append(output);}
   output.textContent=JSON.stringify(report);
   if(parent!==window)parent.postMessage({type:'jubutech-accessibility-qa',report},location.origin);
  } finally {running=false;}
 };
 window.addEventListener('load',run);
 document.addEventListener('click',()=>setTimeout(run,400));
})();
