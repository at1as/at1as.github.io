const assert = require('node:assert/strict');
const fs = require('node:fs');
const M = require('./model.js');
const data = require('./data.json');
assert.equal(new Set(data.problems.map(p=>p.id)).size, 6);
for (const p of data.problems) {
  const list = p.milestones;
  assert.ok(M.milestones(p,false).length, `${p.id}: needs published baseline`);
  for (let i=0;i<list.length;i++) {
    const m=list[i];
    assert.ok(Number.isFinite(M.year(m.date)), `${p.id}: invalid date`);
    assert.ok(m.date <= data.reviewed, `${p.id}: future milestone`);
    assert.ok(m.url.startsWith('https://'), `${p.id}: missing source`);
    assert.ok(['published','construction','preprint','report'].includes(m.status));
    if(i) {
      assert.ok(M.year(m.date)>=M.year(list[i-1].date), `${p.id}: unsorted dates`);
      const improving=['floor','proportion'].includes(p.kind) ? m.value>=list[i-1].value : m.value<=list[i-1].value;
      assert.ok(improving, `${p.id}: record series regresses`);
    }
    if(p.kind==='range') assert.ok(m.lower<=m.value);
    if(p.kind==='grid') {
      assert.equal(m.unknown.length,m.value);
      assert.equal(new Set(m.unknown).size,m.unknown.length);
      assert.ok(m.unknown.every(n=>n>0&&n<=2000&&n%4===0));
      assert.ok((m.reported||[]).every(n=>!m.unknown.includes(n)));
    }
  }
  assert.ok(M.milestones(p,false).every(m=>!M.reported(m)));
}
assert.equal(M.milestones(data.problems[0],false).at(-1).value,246);
assert.equal(M.milestones(data.problems[1],false).at(-1).value,41.7293);
assert.equal(M.milestones(data.problems[5],false).at(-1).value,12);
assert.equal(M.stepPath([[0,10],[5,7],[20,2]]),'M0,10H5V7H20V2');
assert.ok(M.year('2026-08-30')<M.year('2026-08-31'));
assert.deepEqual(M.bounds(data.problems[2],[], 'detail'),[2.371,2.373]);
assert.match(M.milestoneText(data.problems[2],data.problems[2].milestones[2]), /< 2\.3728639/,'Hover values preserve the full source precision');
assert.match(M.milestoneText(data.problems[3],data.problems[3].milestones.at(-1)), /43–46/);
const hadamard=data.problems.find(p=>p.id==='hadamard');
assert.match(M.orderText(hadamard.milestones[0],668),/Unresolved/);
assert.match(M.orderText(hadamard.milestones[1],1004),/Construction known/);
assert.match(M.orderText(hadamard.milestones[2],668),/Construction reported/);
assert.match(M.orderText(hadamard.milestones[2],2000),/Order 2000 · 2000 × 2000 matrix\nConstruction known/);
const riemann=data.problems.find(p=>p.id==='riemann');
const [eleven,seven,rh]=riemann.zeroFreeRegions;
assert.deepEqual(M.regionBounds(eleven),{lower:1/12,upper:11/12,lowerLabel:'1/12',upperLabel:'11/12'});
assert.deepEqual(M.regionBounds(seven),{lower:1/8,upper:7/8,lowerLabel:'1/8',upperLabel:'7/8'});
assert.deepEqual(M.regionBounds(rh),{lower:.5,upper:.5,lowerLabel:'½',upperLabel:'½'});
assert.equal(M.regionRange(seven),'1/8 ≤ β ≤ 7/8');
assert.equal(M.regionRange(rh),'β = ½');
assert.ok(M.regionBounds(seven).upper<M.regionBounds(eleven).upper,'7/8 gives the narrower permitted strip');
assert.ok(seven.date<eleven.date,'Comparison order must not imply publication order');
assert.equal(rh.status,'conjecture','Full RH must never become a proven milestone');
assert.deepEqual(M.regions(riemann,false),[rh],'Excluding reports removes both quasi-RH preprints, retaining only the conjectured reference');
for(const region of riemann.zeroFreeRegions) {
  assert.ok(region.url.startsWith('https://'));
  assert.ok(region.date<=data.reviewed);
  assert.ok(M.regionBounds(region).lower<=.5 && M.regionBounds(region).upper>=.5);
  assert.equal(M.regionBounds(region).lower+M.regionBounds(region).upper,1);
}
const html=fs.readFileSync(`${__dirname}/index.html`,'utf8');
const embedded=JSON.parse(html.match(/<script id="frontiers-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(embedded,data,'Regenerate index.html after data edits');
assert.ok(html.includes(`<time datetime="${data.updated}">${data.updated}</time>`),'Visible date uses the curated update date, not the build clock');
assert.equal((html.match(/<tr><td><time/g)||[]).length,data.problems.reduce((n,p)=>n+p.milestones.length+(p.zeroFreeRegions||[]).length,0));
for(const region of riemann.zeroFreeRegions)assert.ok(html.includes(`href="${region.url}"`),'Region sources remain available without JavaScript');
console.log('Passed: chronology, bound direction, source coverage, published filters, Hadamard cases, step geometry, hover values, zero-free symmetry and filtering, conjecture status, update date, and generated-data consistency.');
