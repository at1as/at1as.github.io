const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const T=require('../trends-data.js');
const site=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(site,'insights.json')));
const history=JSON.parse(fs.readFileSync(path.join(site,'history.json')));

test('every identity-matched interval and monthly total reconciles to the Sankey snapshots',()=>{
  T.validate(data);
  for(const [i,p] of data.points.entries()) {
    const s=history.snapshots[i];
    assert.equal(p.commit,s.commit); assert.equal(p.total,s.total);
    assert.equal(p.resolved,s.statuses.proved+s.statuses.disproved+s.statuses.solved);
    assert.equal(p.resolved_lean,Object.values(s.lean).reduce((a,b)=>a+b,0));
    assert.equal(p.lean,s.attributes.solutions); assert.equal(p.statements,s.attributes.statements);
  }
  for(const metric of ['resolved','lean','statements']) {
    const rows=T.monthly(data,metric);
    assert.equal(rows.reduce((sum,r)=>sum+r.net,0),data.points.at(-1)[metric]-data.points[0][metric]);
    for(const r of rows) assert.equal(r.gained+r.added+r.lost+r.removed+r.unmatched,r.net);
  }
  const totals=data.intervals.reduce((a,i)=>{
    for(const k of ['gained','lost','added','removed']) a[k]+=i.changes.resolved[k].length;
    return a;
  },{gained:0,lost:0,added:0,removed:0});
  assert.equal(totals.gained+totals.added-totals.lost-totals.removed,data.points.at(-1).resolved-data.points[0].resolved);
});

test('rolling rates use actual elapsed time across gaps and do not treat additions as gains',()=>{
  for(const days of [7,30,90]) {
    for(const row of T.rolling(data,'resolved',days)) {
      assert.ok(row.days>=days);
      const expected=data.intervals.filter(i=>i.end>row.start&&i.end<=row.date).reduce((n,i)=>n+i.changes.resolved.gained.length,0);
      assert.equal(row.events,expected);
      assert.equal(row.value,expected/((T.time(row.date)-T.time(row.start))/T.DAY));
      const next=data.points.find(p=>p.date>row.start);
      assert.ok(T.time(next.date)>T.time(row.date)-days*T.DAY,'Baseline is the last snapshot on/before the intended start');
    }
  }
  assert.ok(T.rolling(data,'resolved',7).some(r=>r.days>7));
});

test('release windows assign launch-day observations once and suppress incomplete rates',()=>{
  const recent=T.releaseWindow(data,data.points.at(-1).date,'resolved');
  assert.equal(recent.before.complete,true); assert.equal(recent.after.complete,false); assert.equal(recent.after.rate,null);
  const old=T.releaseWindow(data,data.points[0].date,'resolved'); assert.equal(old.before.complete,false);
  const full=T.releaseWindow(data,'2026-07-09','lean');
  assert.equal(full.before.complete,true); assert.equal(full.after.complete,true);
  assert.equal(full.after.count,data.intervals.filter(i=>i.end>='2026-07-09'&&i.end<'2026-08-08').reduce((n,i)=>n+i.changes.lean.gained.length,0));
  assert.equal(full.after.rate,full.after.count/30);
});

async function boot(fail=false) {
  const dom=new JSDOM(fs.readFileSync(path.join(site,'trends/index.html'),'utf8'),{url:'https://example.com/sites/erdos/trends/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  w.fetch=async()=>{if(fail)throw Error('offline');return{ok:true,json:async()=>structuredClone(data)};};
  w.matchMedia=()=>({matches:true});w.AbortSignal.timeout=()=>new w.AbortController().signal;
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  for(const name of ['d3.min.js','trends-data.js','trends-charts.js','trends.js']) w.eval(fs.readFileSync(path.join(site,name),'utf8'));
  for(let i=0;i<5;i++) await new Promise(setImmediate);
  const q=s=>w.document.querySelector(s);
  const change=(s,value)=>{q(s).value=value;q(s).dispatchEvent(new w.Event('change',{bubbles:true}));};
  return {dom,w,q,change};
}

test('trends controls render all measures, period evidence, and release comparisons with real D3',async()=>{
  const app=await boot();
  assert.equal(app.q('#trends-message').hidden,true);
  for(const metric of ['resolved','lean','statements']) {
    app.change('#trend-metric',metric);
    for(const window of ['7','30','90']) app.change('#pace-window',window);
    for(const path of app.w.document.querySelectorAll('.trend-plot path')) assert.doesNotMatch(path.getAttribute('d')||'',/NaN|Infinity/);
    const month=app.q('#records-month').value;
    const events=T.events(data,metric,month);
    assert.equal(app.q('#record-rows').children.length,events.length||1);
    assert.match(app.q('#monthly-rows').textContent,/partial/);
  }
  app.change('#compare-release','astra');
  const astraWindow=T.releaseWindow(data,'2026-09-03',app.q('#trend-metric').value);
  assert.equal(app.q('#after-rate').textContent,astraWindow.after.complete?`${astraWindow.after.rate.toFixed(2)}/day`:'Incomplete');
  if(!astraWindow.after.complete) assert.match(app.q('#window-verdict').textContent,/Not enough/);
  app.change('#compare-release','gpt-5-6');
  assert.doesNotMatch(app.q('#after-rate').textContent,/Incomplete/);
  assert.ok(app.q('#release-source a').href.startsWith('https://developers.openai.com/'));
  app.change('#formal-mode','coverage');
  assert.match(app.q('#formal').getAttribute('aria-label'),/Share of resolved/);
  assert.match(app.q('#formal-description').textContent,/denominator/);
  assert.equal(app.q('#formal-total-key').hidden,true);
  const monthButton=app.q('#composition g[role="button"]');
  monthButton.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.equal(app.q('#problem-changes').open,true);
  const marker=app.q('#pace .release-reference');
  marker.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.equal(app.q('#compare-release').value,'sonnet-4-5');
  app.dom.window.close();
});

test('failed loading preserves the static SVGs and monthly table, and retry recovers',async()=>{
  const app=await boot(true);
  assert.equal(app.q('#retry-trends').hidden,false); assert.equal(app.q('#trend-metric').disabled,true);
  assert.ok(app.q('#pace path')); assert.ok(app.q('#monthly-rows tr'));
  app.w.fetch=async()=>({ok:true,json:async()=>structuredClone(data)});
  app.q('#retry-trends').click();
  for(let i=0;i<5;i++)await new Promise(setImmediate);
  assert.equal(app.q('#retry-trends').hidden,true);assert.equal(app.q('#trend-metric').disabled,false);
  app.dom.window.close();
});
