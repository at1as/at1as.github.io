const {test}=require('node:test');
const assert=require('node:assert/strict');
const T=require('../trends-data.js');
const data=require('../insights.json');

// Each row gives a snapshot date and the gains since the preceding snapshot.
function sample(rows) {
  return {points:rows.map(([date])=>({date})),intervals:rows.slice(1).map(([end,count],i)=>({
    start:rows[i][0],end,changes:{resolved:{gained:Array.from({length:count},(_,n)=>String(n+1)),
      added:['999'],lost:['998'],removed:['997'],unmatched:0}}
  }))};
}
const counts=window=>[window.count,window.uncertain,window.possible];

test('release windows count contained gains, excluding imports and losses, across sparse snapshots',()=>{
  const history=sample([['2026-01-01',0],['2026-01-11',0],['2026-01-20',2],['2026-02-09',3],
    ['2026-02-10',0],['2026-02-20',4],['2026-03-11',2],['2026-03-12',0]]);
  const result=T.releaseWindow(history,'2026-02-10','resolved');
  assert.deepEqual(counts(result.before),[5,0,5]);
  assert.deepEqual(counts(result.after),[6,0,6]);
  assert.equal(result.before.rate,5/30);assert.equal(result.after.rate,6/30);
  assert.equal(result.before.complete,true);assert.equal(result.after.complete,true);
  assert.deepEqual(result.uncertainIntervals,[]);
});

test('changes spanning any of the three boundaries remain uncertain, with each interval listed once',()=>{
  const history=sample([['2026-01-01',0],['2026-01-12',2],['2026-02-09',3],
    ['2026-02-12',5],['2026-03-13',7]]);
  const result=T.releaseWindow(history,'2026-02-10','resolved');
  assert.deepEqual(counts(result.before),[3,7,10]);
  assert.deepEqual(counts(result.after),[0,12,12]);
  assert.equal(result.before.rate,null);assert.equal(result.after.rate,null);
  assert.deepEqual(result.uncertainIntervals.map(i=>[i.start,i.end]),[
    ['2026-01-01','2026-01-12'],['2026-02-09','2026-02-12'],['2026-02-12','2026-03-13']]);
});

test('even adjacent daily snapshots cannot assign a change across a UTC date boundary',()=>{
  const history=sample([['2026-01-10',0],['2026-01-11',2],['2026-02-09',0],
    ['2026-02-10',5],['2026-03-11',0],['2026-03-12',7],['2026-03-13',11]]);
  const result=T.releaseWindow(history,'2026-02-10','resolved');
  assert.deepEqual(counts(result.before),[0,7,7]);
  assert.deepEqual(counts(result.after),[0,12,12]);
  assert.equal(result.uncertainIntervals.length,3);
});

test('a gap spanning both windows is not forced onto either side of the release',()=>{
  const result=T.releaseWindow(sample([['2026-01-01',0],['2026-04-01',9]]),'2026-02-10','resolved');
  assert.deepEqual(counts(result.before),[0,9,9]);
  assert.deepEqual(counts(result.after),[0,9,9]);
  assert.equal(result.uncertainIntervals.length,1);
  assert.equal(result.before.rate,null);assert.equal(result.after.rate,null);
});

test('incomplete history has no rate, including a baseline partway through the first window day',()=>{
  const history=sample([['2026-01-11',0],['2026-02-01',3],['2026-02-10',0],['2026-02-20',2]]);
  const result=T.releaseWindow(history,'2026-02-10','resolved');
  assert.equal(result.before.complete,false);assert.equal(result.after.complete,false);
  assert.equal(result.before.rate,null);assert.equal(result.after.rate,null);
  assert.deepEqual(counts(result.after),[2,0,2]);
  const future=T.releaseWindow(history,'2026-05-01','resolved');
  assert.deepEqual(counts(future.after),[0,0,0]);assert.equal(future.after.rate,null);
});

test('Opus 4.6 does not assign the 32 gains across omitted revisions to the after window',()=>{
  const result=T.releaseWindow(data,'2026-02-05','lean');
  assert.deepEqual(counts(result.before),[26,33,59]);
  assert.deepEqual(counts(result.after),[15,35,50]);
  assert.equal(result.before.complete,true);assert.equal(result.after.complete,true);
  assert.equal(result.before.rate,null);assert.equal(result.after.rate,null);
  const gap=result.uncertainIntervals.find(i=>i.start==='2026-01-30'&&i.end==='2026-02-14');
  assert.equal(gap.changes.lean.gained.length,32);
});
