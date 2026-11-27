/* Shared, dependency-free chart calculations. */
(function (root) {
  'use strict';
  const reported = m => m.status === 'preprint' || m.status === 'report';
  const statusText = {
    published: 'Published result',
    construction: 'Published construction',
    preprint: 'Preprint',
    report: 'Author report',
    conjecture: 'Conjecture · unproved',
    verified: 'Lean-verified proof'
  };
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
  function reverseStepPath(points) {
    if (!points.length) return '';
    let d = '';
    for (let i = points.length - 1; i > 0; i--) {
      d += `H${points[i][0]}V${points[i - 1][1]}`;
    }
    return d + `H${points[0][0]}`;
  }
  function bounds(problem, rows, mode) {
    if (problem.kind === 'grid') return [0, 13];
    if (mode === 'linear' && problem.id === 'primes') return [0, 80000000];
    if (mode === 'detail' && problem.id === 'matrix') return [2.371, 2.373];
    return problem.domain;
  }
  function inDetailRange(problem, milestone) {
    if (problem.id !== 'matrix' || !milestone) return true;
    return year(milestone.date) >= 2014 && milestone.value >= 2.371 && milestone.value <= 2.373 && milestone.boundChange !== 'lower';
  }
  function format(problem, value) {
    if (problem.kind === 'floor') return `10^${value}`;
    if (problem.kind === 'proportion') return `${Number(value.toFixed(4))}%`;
    if (problem.id === 'matrix') return String(Number(value.toFixed(7)));
    return value.toLocaleString('en-US');
  }
  function milestoneText(problem, milestone) {
    if (problem.kind === 'range') {
      if (problem.id === 'matrix') {
        const summary = milestone.lower === milestone.value
          ? `Floor: ${milestone.display} · Upper: ≤ ${format(problem, milestone.value)} (ω = 9/4)`
          : `Upper: ${milestone.display || format(problem, milestone.value)} · Floor: ${milestone.lower}`;
        return `${problem.name} · ${milestone.label}\n${summary}\n${statusText[milestone.status]}`;
      }
      return `${problem.name} · ${milestone.label}\n${milestone.lower}–${milestone.value}\n${statusText[milestone.status]}`;
    }
    const value = problem.kind === 'floor' ? `> 10^${milestone.value}` :
      milestone.display || format(problem, milestone.value);
    return `${problem.name} · ${milestone.label}\n${value}\n${statusText[milestone.status]}`;
  }
  function orderText(milestone, order) {
    const status = milestone.unknown.includes(order) ? 'Unresolved' :
      (milestone.reported || []).includes(order) ? 'Construction reported' : 'Construction known';
    return `Order ${order} · ${order} × ${order} matrix\n${status} · ${milestone.label}`;
  }
  function regions(problem, includeReports) {
    return (problem.zeroFreeRegions || []).filter(r => includeReports || !reported(r));
  }
  function regionEvidence(region) {
    const status = statusText[region.status];
    return region.leanEvidence ? `${status} · ${region.leanEvidence.label}` : status;
  }
  function regionBounds(region) {
    const { numerator: n, denominator: d } = region;
    const fraction = value => value * 2 === d ? '½' : `${value}/${d}`;
    return { lower: (d - n) / d, upper: n / d, lowerLabel: fraction(d - n), upperLabel: fraction(n) };
  }
  function regionRange(region) {
    const b = regionBounds(region);
    return b.lower === b.upper ? `β = ${b.upperLabel}` : `${b.lowerLabel} ≤ β ≤ ${b.upperLabel}`;
  }
  function problemStatus(problem, includeReports) {
    const list = milestones(problem, includeReports);
    const regionList = regions(problem, includeReports);
    if (regionList.some(r => r.status === 'verified') || list.some(m => m.status === 'verified')) {
      return { state: 'proved', tileLabel: 'Proved', label: 'Proved · Lean-verified' };
    }
    const latest = list.at(-1);
    if (problem.kind === 'range' && latest && latest.lower === latest.value) {
      if (reported(latest)) {
        return { state: 'claimed', tileLabel: 'Solved · preprint', label: 'Solved (preprint) · peer review ongoing' };
      }
      return { state: 'proved', tileLabel: 'Solved', label: 'Solved' };
    }
    if (problem.kind === 'grid' && latest) {
      return {
        state: 'open',
        tileLabel: 'Open',
        label: latest.value === 0 ? 'Open conjecture · orders ≤ 2,000 filled' : `Open conjecture · ${latest.value} gaps ≤ 2,000`
      };
    }
    return { state: 'open', tileLabel: 'Open', label: 'Open problem' };
  }
  function collectionSummary(data, includeReports) {
    const counts = { proved: 0, claimed: 0, open: 0 };
    for (const problem of data.problems) counts[problemStatus(problem, includeReports).state]++;
    const parts = [];
    if (counts.proved) parts.push(`${counts.proved} proved`);
    if (counts.claimed) parts.push(`${counts.claimed} solved (preprint)`);
    if (counts.open) parts.push(`${counts.open} open`);
    return parts.join(' · ');
  }
  const api = {
    reported, statusText, milestones, year, stepPath, reverseStepPath,
    bounds, inDetailRange, format, milestoneText, orderText,
    regions, regionEvidence, regionBounds, regionRange,
    problemStatus, collectionSummary
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Frontiers = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
