const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('public/assets/js/campaign-detail.js','utf8');
const feedSource=source.slice(source.indexOf(' const recommendations='),source.lastIndexOf('\n})();'));
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const response=(ids,next=null)=>({ok:true,json:async()=>({html:ids.map(id=>`<div data-recommendation-id="${id}"></div>`).join(''),next,page:next?'/campaigns/cp1?relatedAfter=cp7#campaign-recommendations':null})});

function harness(fetcher,{intersection=true}={}){
 const attributes={};
 const card=id=>({dataset:{recommendationId:id},matches:()=>true,link:{focus(){this.focused=true;}},querySelector(){return this.link;}});
 const grid={cards:['cp2','cp3'].map(card),querySelectorAll(){return this.cards;},append(...cards){this.cards.push(...cards);},setAttribute(name,value){attributes[name]=value;}};
 const more={handlers:{},textContent:'상품 더 보기',hidden:false,addEventListener(name,callback){this.handlers[name]=callback;},setAttribute(name,value){attributes[name]=value;},removeAttribute(name){delete attributes[name];}};
 const status={textContent:''},sentinel={};
 const nodes={'[data-recommendation-grid]':grid,'[data-recommendation-more]':more,'[data-recommendation-status]':status,'[data-recommendation-sentinel]':sentinel};
 const feed={dataset:{next:'/campaigns/cp1/recommendations?after=cp3'},querySelector:selector=>nodes[selector]};
 let observer;
 class Observer{
  constructor(callback){this.callback=callback;observer=this;}
  observe(){this.observing=true;}
  unobserve(){this.observing=false;}
  disconnect(){this.observing=false;this.disconnected=true;}
 }
 const calls=[];
 const context={document:{querySelector:()=>feed,createElement(){return {content:{children:[]},set innerHTML(value){this.content.children=[...value.matchAll(/data-recommendation-id="([^"]+)"/g)].map(match=>card(match[1]));}};}},window:intersection?{IntersectionObserver:Observer}:{},IntersectionObserver:Observer,AbortController,setTimeout:()=>1,clearTimeout(){},fetch:(...args)=>{calls.push(args);return fetcher(...args);}};
 vm.createContext(context);
 vm.runInContext(`(()=>{${feedSource}\n})();`,context);
 return {grid,more,status,feed,calls,attributes,get observer(){return observer;},auto(){observer.callback([{isIntersecting:true}]);},click(){more.handlers.click({button:0,preventDefault(){}});}};
}

test('scroll pages append unique products and stop observing after the final page',async()=>{
 const pages=[response(['cp3','cp4','cp7'],'/campaigns/cp1/recommendations?after=cp7'),response(['cp6'])];
 const h=harness(async()=>pages.shift());
 h.auto();await settle();
 assert.deepEqual(h.grid.cards.map(card=>card.dataset.recommendationId),['cp2','cp3','cp4','cp7']);
 assert.equal(h.observer.observing,true);
 h.auto();await settle();
 assert.deepEqual(h.grid.cards.map(card=>card.dataset.recommendationId),['cp2','cp3','cp4','cp7','cp6']);
 assert.equal(h.more.hidden,true);
 assert.equal(h.observer.observing,false);
 assert.equal(h.feed.dataset.next,'');
 assert.match(h.status.textContent,/모두 확인/);
 assert.equal(h.attributes['aria-busy'],'false');
});

test('overlapping scroll and click triggers share one pending request',async()=>{
 let resolve;
 const h=harness(()=>new Promise(done=>resolve=done));
 h.auto();h.click();h.auto();
 assert.equal(h.calls.length,1);
 assert.equal(h.attributes['aria-busy'],'true');
 assert.equal(h.attributes['aria-disabled'],'true');
 resolve(response(['cp4']));await settle();
 assert.equal(h.attributes['aria-disabled'],undefined);
 assert.equal(h.attributes['aria-busy'],'false');
});

test('failed automatic fetch stops retries until a deliberate retry succeeds',async()=>{
 let attempt=0;
 const h=harness(async()=>++attempt===1?{ok:false}:response(['cp4']));
 h.auto();await settle();
 assert.equal(h.grid.cards.length,2);
 assert.equal(h.observer.observing,false);
 assert.equal(h.more.hidden,false);
 assert.match(h.more.textContent,/다시 불러오기/);
 assert.match(h.status.textContent,/불러오지 못/);
 h.click();await settle();
 assert.equal(h.calls.length,2);
 assert.equal(h.grid.cards.length,3);
 assert.equal(h.grid.cards[2].link.focused,true);
 assert.equal(h.more.hidden,true);
});

test('manual loading works without IntersectionObserver and keeps keyboard focus on new content',async()=>{
 const h=harness(async()=>response(['cp4']),{intersection:false});
 assert.equal(h.observer,undefined);
 h.click();await settle();
 assert.equal(h.grid.cards.length,3);
 assert.equal(h.grid.cards[2].link.focused,true);
 assert.equal(h.calls[0][1].credentials,'same-origin');
});

test('malformed responses preserve existing content and offer a retry',async()=>{
 const h=harness(async()=>({ok:true,json:async()=>({html:null,next:null,page:null})}));
 h.auto();await settle();
 assert.equal(h.grid.cards.length,2);
 assert.equal(h.more.hidden,false);
 assert.match(h.more.textContent,/다시 불러오기/);
});
