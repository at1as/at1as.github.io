const assert = require('node:assert/strict');
const fs = require('node:fs');
const M = require('./model.js');
const V = require('./view.js');
const data = require('./data.json');

assert.equal(new Set(data.problems.map(p => p.id)).size, 6);
for (const p of data.problems) {
  const list = p.milestones;
  assert.ok(M.milestones(p, false).length, `${p.id}: needs published baseline`);
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    assert.ok(Number.isFinite(M.year(m.date)), `${p.id}: invalid date`);
    assert.ok(m.date <= (p.reviewed || data.reviewed), `${p.id}: future milestone`);
    assert.ok(m.url.startsWith('https://'), `${p.id}: missing source`);
    assert.ok(['published', 'construction', 'preprint', 'report', 'verified'].includes(m.status));
    if (i) {
      assert.ok(M.year(m.date) >= M.year(list[i - 1].date), `${p.id}: unsorted dates`);
      const improving = ['floor', 'proportion'].includes(p.kind) ? m.value >= list[i - 1].value : m.value <= list[i - 1].value;
      assert.ok(improving, `${p.id}: record series regresses`);
      if (p.kind === 'range') {
        assert.ok(m.lower >= list[i - 1].lower, `${p.id}: lower bound regresses`);
      }
    }
    if (p.kind === 'range') assert.ok(m.lower <= m.value);
    if (p.kind === 'grid') {
      assert.equal(m.unknown.length, m.value);
      assert.equal(new Set(m.unknown).size, m.unknown.length);
      assert.ok(m.unknown.every(n => n > 0 && n <= 2000 && n % 4 === 0));
      assert.ok((m.reported || []).every(n => !m.unknown.includes(n)));
    }
  }
  assert.ok(M.milestones(p, false).every(m => !M.reported(m)));
}

assert.equal(M.milestones(data.problems[0], false).at(-1).value, 246);
assert.equal(M.milestones(data.problems[5], false).at(-1).value, 12);
assert.equal(M.stepPath([[0, 10], [5, 7], [20, 2]]), 'M0,10H5V7H20V2');
assert.equal(M.reverseStepPath([[0, 10], [5, 7], [20, 2]]), 'H20V7H5V10H0');
assert.ok(M.year('2026-08-30') < M.year('2026-08-31'));

// Matrix multiplication: upper bound drop and lower bound (floor) rise to 9/4.
const matrix = data.problems.find(p => p.id === 'matrix');
const matrixReports = M.milestones(matrix, true);
const matrixPublished = M.milestones(matrix, false);
const octoberBound = matrixReports.at(-2);
const novemberFloor = matrixReports.at(-1);
assert.equal(matrix.kind, 'range');
assert.deepEqual(M.bounds(matrix, matrixReports, 'detail'), [2.371, 2.373]);
assert.match(M.milestoneText(matrix, matrix.milestones[2]), /< 2\.3728639/, 'Hover values preserve full source precision');
assert.equal(M.format(matrix, 2.3728639), '2.3728639', 'Format retains 7 decimal places for matrix bounds');
const improvement = (matrixReports.find(m => m.date === '1990').value - matrixReports.find(m => m.date === '2026-08-17').value).toFixed(6);
assert.match(matrix.interpretation, new RegExp(improvement.replace('.', '\\.')));
assert.match(matrix.interpretation, /2\.25/);
assert.match(matrix.interpretationPublished, /2\.371339/);
assert.doesNotMatch(matrix.interpretationPublished, /preprint/i);
assert.equal(octoberBound.value, 2.25);
assert.equal(octoberBound.lower, 2);
assert.equal(octoberBound.status, 'preprint');
assert.equal(octoberBound.url, 'https://github.com/openai/math/blob/main/preprints/Matrix-Multiplication-Nine-Fourths-October-2-2026/paper.pdf');
assert.equal(novemberFloor.date, '2026-11-24');
assert.equal(novemberFloor.value, 2.25);
assert.equal(novemberFloor.lower, 2.25);
assert.equal(novemberFloor.boundChange, 'lower');
assert.equal(novemberFloor.status, 'preprint');
assert.equal(novemberFloor.url, 'https://github.com/openai/math/blob/main/preprints/The-matrix-multiplication-exponent-is-nine-fourths-November-24-2026/paper.pdf');
assert.equal(matrixPublished.at(-1).value, 2.371339);
assert.equal(matrixPublished.at(-1).lower, 2);
assert.equal(V.metric(matrix, novemberFloor), '= 2.25');
assert.equal(V.metric(matrix, octoberBound), '2–2.25');
assert.equal(V.shortMetric(matrix, novemberFloor), '= 2.25');
assert.equal(V.shortMetric(matrix, matrixPublished.at(-1)), '2–2.371339');
assert.equal(M.inDetailRange(matrix, matrixReports.find(m => m.date === '2026-08-17')), true);
assert.equal(M.inDetailRange(matrix, octoberBound), false);
assert.equal(M.inDetailRange(matrix, novemberFloor), false);

const matrixFull = V.progressChart(matrix, matrixReports, matrixReports.length - 1, 'full', true, 680);
const matrixZoom = V.progressChart(matrix, matrixReports, matrixReports.findIndex(m => m.date === '2026-08-17'), 'detail', true, 680);
assert.match(matrixFull.svg, /Floor: ≥ 2\.25 · Upper: ≤ 2\.25/);
assert.match(matrixFull.svg, /class="ai-ring"/, 'AI highlights use a dedicated outer ring without hiding evidence color');
assert.match(matrixFull.legend, /Lower bound/);
assert.doesNotMatch(matrixZoom.svg, /Oct 6, 2026/);
assert.doesNotMatch(matrixZoom.svg, /Nov 24, 2026/);
assert.match(matrixZoom.svg, /↓ 2\.25 in late 2026/);
assert.match(matrixZoom.note, /Switch to full range for the late-2026 bounds at 2\.25/);

// Ramsey & Hadamard
assert.match(M.milestoneText(data.problems[3], data.problems[3].milestones.at(-1)), /43–46/);
const hadamard = data.problems.find(p => p.id === 'hadamard');
assert.match(M.orderText(hadamard.milestones[0], 668), /Unresolved/);
assert.match(M.orderText(hadamard.milestones[1], 1004), /Construction known/);
assert.match(M.orderText(hadamard.milestones[2], 668), /Construction reported/);
assert.match(M.orderText(hadamard.milestones[2], 2000), /Order 2000 · 2000 × 2000 matrix\nConstruction known/);

// Riemann hypothesis
const riemann = data.problems.find(p => p.id === 'riemann');
const [eleven, seven, rh] = riemann.zeroFreeRegions;
assert.deepEqual(M.regionBounds(eleven), { lower: 1 / 12, upper: 11 / 12, lowerLabel: '1/12', upperLabel: '11/12' });
assert.deepEqual(M.regionBounds(seven), { lower: 1 / 8, upper: 7 / 8, lowerLabel: '1/8', upperLabel: '7/8' });
assert.deepEqual(M.regionBounds(rh), { lower: .5, upper: .5, lowerLabel: '½', upperLabel: '½' });
assert.equal(M.regionRange(seven), '1/8 ≤ β ≤ 7/8');
assert.equal(M.regionRange(rh), 'β = ½');
assert.ok(M.regionBounds(seven).upper < M.regionBounds(eleven).upper, '7/8 gives the narrower permitted strip');
assert.ok(seven.date < eleven.date, 'Comparison order must not imply publication order');
assert.equal(M.regionEvidence(eleven), 'Preprint · Separate Lean proof');
assert.equal(M.regionEvidence(seven), 'Preprint · Lean checked');
assert.equal(M.regionEvidence(rh), 'Lean-verified proof');
assert.equal(rh.date, '2026-11-20');
assert.equal(rh.verificationDate, '2026-11-21');
assert.ok(rh.date <= rh.verificationDate && rh.verificationDate <= riemann.reviewed);
assert.ok(rh.verificationUrl.startsWith('https://'));
assert.deepEqual(M.regions(riemann, false), [rh], 'Excluding reports retains the Lean-verified proof');

const proportions = M.milestones(riemann, true);
const verifiedProportion = proportions.at(-1);
assert.deepEqual(proportions.slice(-2).map(m => m.value), [67.25, 100]);
assert.deepEqual(M.milestones(riemann, false).slice(-2).map(m => m.value), [41.7293, 100]);
assert.equal(verifiedProportion.status, rh.status);
assert.equal(verifiedProportion.date, rh.date);
assert.equal(verifiedProportion.url, rh.url);
assert.equal(verifiedProportion.supportUrl, rh.verificationUrl);

const timeline = V.progressChart(riemann, proportions, proportions.length - 1, 'full', true, 680);
assert.match(timeline.svg, /<path d="M[\d.]+,[\d.]+V22" class="data-line verified-line"\/>/, 'The verified step reaches the 100% grid line');
assert.match(timeline.legend, /legend-line verified"><\/i> Lean verified/);
assert.match(V.milestones(riemann, proportions, proportions.length - 1, true), /milestone-button verified ai/);
const navWithReports = V.navigation(data, true, 'riemann');
const navPublished = V.navigation(data, false, 'riemann');
assert.equal(M.collectionSummary(data, true), '1 proved · 1 solved (preprint) · 4 open');
assert.equal(M.collectionSummary(data, false), '1 proved · 5 open');
assert.equal(M.problemStatus(riemann, true).state, 'proved');
assert.equal(M.problemStatus(matrix, true).state, 'claimed');
assert.equal(M.problemStatus(matrix, false).state, 'open');
assert.equal(M.problemStatus(hadamard, true).state, 'open');
assert.match(M.problemStatus(hadamard, true).label, /Open conjecture · orders ≤ 2,000 filled/);
assert.match(M.problemStatus(hadamard, false).label, /Open conjecture · 12 gaps ≤ 2,000/);
assert.match(navWithReports, /nav-status proved">Proved<\/span>.*?<strong>100%<\/strong><small>on the line<\/small>.*?<strong>β = ½<\/strong><small>full RH<\/small>/s);
assert.match(navWithReports, /nav-status claimed">Solved · preprint<\/span>/);
assert.match(navWithReports, /0 gaps ≤ 2,000/);
assert.doesNotMatch(navWithReports, /7\/8<\/strong><small>preprint bound/, 'Verified full RH supersedes earlier preprint bound on the overview card');
assert.match(navPublished, /nav-status proved">Proved<\/span>.*?<strong>β = ½<\/strong><small>full RH<\/small>/s);
assert.doesNotMatch(navPublished, /nav-status claimed/);

for (const region of riemann.zeroFreeRegions) {
  assert.ok(region.url.startsWith('https://'));
  assert.ok(region.date <= riemann.reviewed);
  assert.ok(M.regionBounds(region).lower <= .5 && M.regionBounds(region).upper >= .5);
  assert.equal(M.regionBounds(region).lower + M.regionBounds(region).upper, 1);
}

// Generated static HTML checks
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
assert.doesNotMatch(html, /__\w+__/, 'Generated pages must not contain unfilled template slots');
assert.doesNotMatch(html, /id="explorer"[^>]*\shidden/, 'The initial explorer must occupy space before JavaScript loads');
assert.match(html, /<title id="chart-title">Twin prime gaps: selected milestones<\/title>/, 'The initial chart is available without JavaScript');
assert.equal((html.match(/class="problem-button/g) || []).length, data.problems.length, 'Every question is present at first paint');
const embedded = JSON.parse(html.match(/<script id="frontiers-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(embedded, data, 'Regenerate index.html after data edits');
assert.ok(html.includes(`<time datetime="${data.updated}">${data.updated}</time>`), 'Visible date uses the curated update date, not the build clock');
assert.equal((html.match(/<tr><td><time/g) || []).length, data.problems.reduce((n, p) => n + p.milestones.length + (p.zeroFreeRegions || []).length, 0));
for (const region of riemann.zeroFreeRegions) assert.ok(html.includes(`href="${region.url}"`), 'Region sources remain available without JavaScript');
for (const region of [eleven, seven]) {
  assert.ok(html.includes(`<td>${M.regionEvidence(region)}<span`), 'Lean evidence appears alongside preprint status in the source table');
  assert.ok(html.includes(`href="${region.leanEvidence.url}" target="_blank" rel="noopener">Lean evidence`), 'Lean evidence links work without JavaScript');
}
assert.ok(html.includes(`href="${rh.verificationUrl}"`), 'The Lean verification source appears in the generated page');
assert.ok(html.includes(`href="${novemberFloor.url}"`), 'The November 24 matrix lower-bound source appears in the generated page');

console.log('Passed: chronology, upper/lower bound monotonicity, matrix floor rising, zoom range handling, source coverage, published filters, Hadamard cases, step geometry, hover precision, zero-free symmetry, unified verified styling, update date, and generated-data consistency.');
