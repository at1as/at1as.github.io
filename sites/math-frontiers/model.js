/* Shared, dependency-free chart calculations. */
(function (root) {
  'use strict';
  const reported = m => m.status === 'preprint' || m.status === 'report';
  function milestones(problem, includeReports) {
    return problem.milestones.filter(m => includeReports || !reported(m));
  }
  function year(date) {
    const parts = date.split('-').map(Number);
    const start = Date.UTC(parts[0], 0, 1);
    return parts[0] + (Date.UTC(parts[0], (parts[1] || 1) - 1, parts[2] || 1) - start) /
      (Date.UTC(parts[0] + 1, 0, 1) - start);
  }
  function stepPath(points) {
    if (!points.length) return '';
    return `M${points[0][0]},${points[0][1]}` + points.slice(1).map(p => `H${p[0]}V${p[1]}`).join('');
  }
  function bounds(problem, rows, mode) {
    if (problem.kind === 'grid') return [0, 13];
    if (mode === 'linear' && problem.id === 'primes') return [0, 80000000];
    if (mode === 'detail' && problem.id === 'matrix') return [2.371, 2.373];
    return problem.domain;
  }
  function format(problem, value) {
    if (problem.kind === 'floor') return `10^${value}`;
    if (problem.kind === 'proportion') return `${Number(value.toFixed(4))}%`;
    if (problem.id === 'matrix') return String(Number(value.toFixed(6)));
    return value.toLocaleString('en-US');
  }
  function milestoneText(problem, milestone) {
    const value = problem.kind === 'range' ? `${milestone.lower}–${milestone.value}` :
      problem.kind === 'floor' ? `> 10^${milestone.value}` :
      milestone.display || format(problem, milestone.value);
    const status = {published:'Published result',construction:'Published construction',preprint:'Preprint',report:'Author report'}[milestone.status];
    return `${problem.name} · ${milestone.label}\n${value}\n${status}`;
  }
  function orderText(milestone, order) {
    const status = milestone.unknown.includes(order) ? 'Unresolved' :
      (milestone.reported || []).includes(order) ? 'Construction reported' : 'Construction known';
    return `Order ${order} · ${order} × ${order} matrix\n${status} · ${milestone.label}`;
  }
  function regions(problem, includeReports) {
    return (problem.zeroFreeRegions || []).filter(r => includeReports || !reported(r));
  }
  function regionBounds(region) {
    const { numerator: n, denominator: d } = region;
    const fraction = value => value * 2 === d ? '½' : `${value}/${d}`;
    return { lower: (d-n)/d, upper: n/d, lowerLabel: fraction(d-n), upperLabel: fraction(n) };
  }
  function regionRange(region) {
    const b = regionBounds(region);
    return b.lower === b.upper ? `β = ${b.upperLabel}` : `${b.lowerLabel} ≤ β ≤ ${b.upperLabel}`;
  }
  const api = { reported, milestones, year, stepPath, bounds, format, milestoneText, orderText, regions, regionBounds, regionRange };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Frontiers = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
