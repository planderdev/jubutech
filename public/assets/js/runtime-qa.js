/* Development diagnostics; loaded only by explicit qa=1. */
window.addEventListener('error',event=>{if(event.error)console.error('QA_RUNTIME '+event.filename+':'+event.lineno+' '+event.error.stack);});
