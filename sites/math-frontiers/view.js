/* Shared build-time and browser rendering; no DOM or runtime dependencies. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./model.js'));
  else root.FrontiersView = factory(root.Frontiers);
})(typeof window === 'object' ? window : globalThis, function(M) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const { statusText } = M;

  const metric = (p, m) => {
    if (p.kind === 'range') {
      if (m.rangeDisplay) return escape(m.rangeDisplay);
      if (m.lower === m.value) return `= ${escape(M.format(p, m.value))}`;
      return `${escape(M.format(p, m.lower))}–${escape(M.format(p, m.value))}`;
    }
    if (p.kind === 'floor') return `> 10<sup>${m.value.toLocaleString('en-US')}</sup>`;
    return escape(m.display || M.format(p, m.value));
  };

  const cardMetric = (p, m) => p.id === 'matrix' ? escape(m.display || M.format(p, m.value)) : metric(p, m);

  const shortMetric = (p, m) => {
    if (p.kind === 'grid') return `${m.value} gaps ≤ 2,000`;
    if (p.id === 'primes') return m.display || M.format(p, m.value);
    if (p.kind === 'range') return m.lower === m.value ? `= ${M.format(p, m.value)}` : `${M.format(p, m.lower)}–${M.format(p, m.value)}`;
    if (p.kind === 'floor') return `> 10^${m.value}`;
    return M.format(p, m.value);
  };

  function mini(p, list) {
    const xs = list.map(m => M.year(m.date));
    const spanX = xs.at(-1) - xs[0] || 1;
    const mapX = v => 3 + (v - xs[0]) / spanX * 124;
    if (p.kind === 'range') {
      const allY = list.flatMap(m => [m.value, m.lower]);
      const min = Math.min(...allY), max = Math.max(...allY), spanY = max - min || 1;
      const mapY = v => 26 - (v - min) / spanY * 22;
      const upper = list.map((m, i) => [mapX(xs[i]), mapY(m.value)]);
      const lower = list.map((m, i) => [mapX(xs[i]), mapY(m.lower)]);
      const lastU = upper.at(-1), lastL = lower.at(-1);
      const band = `${M.stepPath(upper)}L${lastL[0]},${lastL[1]}${M.reverseStepPath(lower)}Z`;
      return `<svg viewBox="0 0 130 30" aria-hidden="true"><path d="${band}" fill="currentColor" opacity=".12"/><path d="${M.stepPath(lower)}" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".45"/><path d="${M.stepPath(upper)}" fill="none" stroke="currentColor" stroke-width="1.35" opacity=".75"/><g data-tooltip="${escape(M.milestoneText(p, list.at(-1)))}"><circle cx="${lastU[0]}" cy="${lastU[1]}" r="8" fill="transparent"/><circle class="mini-point" cx="${lastU[0]}" cy="${lastU[1]}" r="2.2" fill="currentColor"/></g></svg>`;
    }
    const ys = list.map(m => p.id === 'primes' ? Math.log10(m.value) : m.value);
    const min = Math.min(...ys), max = Math.max(...ys);
    const points = ys.map((v, i) => [mapX(xs[i]), 26 - (v - min) / (max - min || 1) * 22]);
    return `<svg viewBox="0 0 130 30" aria-hidden="true"><path d="${M.stepPath(points)}" fill="none" stroke="currentColor" stroke-width="1.35" opacity=".7"/><g data-tooltip="${escape(M.milestoneText(p, list.at(-1)))}"><circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="8" fill="transparent"/><circle class="mini-point" cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="2.2" fill="currentColor"/></g></svg>`;
  }

  function navigation(data, includeReports, selectedId) {
    return data.problems.map((p, i) => {
      const list = M.milestones(p, includeReports);
      const regions = M.regions(p, includeReports);
      const proof = regions.find(region => region.status === 'verified');
      const region = proof || regions.findLast(M.reported) || regions.at(-1);
      const ps = M.problemStatus(p, includeReports);
      const badge = `<span class="nav-status ${ps.state}">${escape(ps.tileLabel)}</span>`;
      const footer = p.id === 'riemann'
        ? `<span class="riemann-metrics"><span data-tooltip="${escape(M.milestoneText(p, list.at(-1)))}"><strong>${escape(shortMetric(p, list.at(-1)))}</strong><small>on the line</small></span><span data-tooltip="${escape(M.regionRange(region) + ' · ' + M.regionEvidence(region))}"><strong>${escape(proof ? M.regionRange(proof) : region.label)}</strong><small>${proof ? 'full RH' : 'preprint bound'}</small></span></span>`
        : `<span class="mini-value">${escape(shortMetric(p, list.at(-1)))}</span>${mini(p, list)}`;
      const classes = p.id === 'riemann' ? 'problem-button riemann-card' : 'problem-button';
      return `<button type="button" class="${classes}" data-problem="${p.id}" aria-pressed="${p.id === selectedId}" aria-controls="explorer"><span class="card-meta"><span class="number">0${i + 1}</span>${badge}</span><span class="name">${escape(p.name)}</span><span class="card-footer">${footer}</span></button>`;
    }).join('');
  }

  function progressChart(problem, list, index, mode, showAI, clientWidth) {
    const current = list[index];
    const narrow = clientWidth < 550;
    const width = narrow ? Math.max(260, clientWidth) : 680;
    const height = narrow ? 260 : 292, left = narrow ? 55 : 68, right = narrow ? 18 : 27, top = 22, bottom = 40;
    const plotW = width - left - right, plotH = height - top - bottom;
    const isLog = problem.id === 'primes' && mode !== 'linear';
    const isDetail = problem.id === 'matrix' && mode === 'detail';
    const [min, max] = M.bounds(problem, list, mode);
    const belowZoom = isDetail ? list.filter(m => m.value < min) : [];
    const zoomNote = isDetail
      ? `Zoomed to ${min}–${max} (2014–2026 laser-method plateau). ` +
        (belowZoom.length
          ? `Switch to full range for the late-2026 bounds at ${M.format(problem, belowZoom.at(-1).value)} and the lower bound at 2. `
          : 'Switch to full range for earlier bounds and the lower bound at 2. ')
      : '';
    const transform = value => isLog ? Math.log10(value) : value;
    const y = value => top + (transform(max) - transform(value)) / (transform(max) - transform(min)) * plotH;
    const xStart = isDetail ? 2014 : problem.start;
    const xEnd = isDetail ? 2027.4 : problem.end;
    const x = date => left + (M.year(date) - xStart) / (xEnd - xStart) * plotW;
    const yTicks = isDetail
      ? [2.371, 2.3715, 2.372, 2.3725, 2.373]
      : (problem.id === 'primes' && mode === 'linear' ? [0, 20000000, 40000000, 60000000, 80000000] : problem.ticks);
    const yLabel = n => problem.kind === 'floor' ? `10^${n}` :
      problem.id === 'primes' && n >= 1000000 ? `${n / 1000000}m` :
      problem.id === 'primes' && n >= 1000 ? `${n / 1000}k` :
      problem.kind === 'proportion' ? `${n}%` : String(n);

    let svg = `<svg viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="chart-title chart-desc"><title id="chart-title">${escape(problem.name)}: selected milestones</title><desc id="chart-desc">${escape(problem.chartDescription)} Selected: ${escape(current.label)}, ${escape(shortMetric(problem, current))}. ${escape(zoomNote)}Full data and sources are below.</desc><defs><clipPath id="plot-clip"><rect x="${left - 12}" y="${top - 12}" width="${plotW + 24}" height="${plotH + 24}"/></clipPath></defs>`;

    for (const tick of yTicks) {
      svg += `<line class="grid-line" x1="${left}" y1="${y(tick)}" x2="${width - right}" y2="${y(tick)}"/><text x="${left - 12}" y="${y(tick) + 3}" text-anchor="end">${yLabel(tick)}</text>`;
    }
    const xticks = isDetail ? [2014, 2018, 2022, 2026] : problem.yearTicks;
    for (const tick of xticks) {
      svg += `<text class="axis-label" x="${x(String(tick))}" y="${height - 17}" text-anchor="middle">${tick}</text>`;
    }
    if (problem.target != null && !isDetail) {
      svg += `<line class="target-line" x1="${left}" x2="${width - right}" y1="${y(problem.target)}" y2="${y(problem.target)}"/><text class="target-label" x="${width - right}" y="${y(problem.target) - 8}" text-anchor="end">${escape(problem.targetLabel)}</text>`;
    }

    const visiblePredicate = m => isDetail
      ? M.inDetailRange(problem, m)
      : (M.year(m.date) >= xStart && m.value <= max && m.value >= min);
    const past = list.slice(0, index + 1).filter(visiblePredicate);
    const lineClass = milestone => 'data-line' + (M.reported(milestone) ? ' reported-line' :
      milestone.status === 'verified' ? ' verified-line' : '');
    const lowerClass = milestone => 'data-line ' + (milestone.boundChange === 'lower' && M.reported(milestone) ? 'reported-line' : 'lower-line');

    svg += '<g clip-path="url(#plot-clip)">';
    if (problem.kind === 'range' && !isDetail && past.length) {
      const upper = past.map(m => [x(m.date), y(m.value)]);
      const lower = past.map(m => [x(m.date), y(m.lower)]);
      const endX = x(String(xEnd));
      const upperWithEnd = [...upper, [endX, upper.at(-1)[1]]];
      const lowerWithEnd = [...lower, [endX, lower.at(-1)[1]]];
      svg += `<path d="${M.stepPath(upperWithEnd)}L${endX},${lower.at(-1)[1]}${M.reverseStepPath(lowerWithEnd)}Z" fill="#eaf0e5"/>`;
      for (let i = 1; i < past.length; i++) {
        const a = past[i - 1], b = past[i];
        svg += `<path d="M${x(a.date)},${y(a.lower)}H${x(b.date)}" class="${lowerClass(a)}"/>`;
        if (b.lower !== a.lower) {
          const bx = x(b.date), ay = y(a.lower), by = y(b.lower);
          svg += `<path d="M${bx},${ay}V${by}" class="${lowerClass(b)}"/>`;
          if (by < ay - 14) {
            const midY = (ay + by) / 2;
            svg += `<path d="M${bx - 4},${midY + 4}L${bx},${midY - 3}L${bx + 4},${midY + 4}" class="${lowerClass(b)}" stroke-dasharray="none"/>`;
          }
        }
      }
      const last = past.at(-1);
      svg += `<path d="M${x(last.date)},${y(last.lower)}H${endX}" class="${lowerClass(last)}" opacity=".38"/>`;
      if (problem.floorLabel) {
        svg += `<text class="floor-label" x="${left + 8}" y="${y(problem.domain[0]) - 8}">${escape(problem.floorLabel)}</text>`;
      }
    }

    for (let i = 1; i < past.length; i++) {
      const a = past[i - 1], b = past[i];
      const horizClass = a.boundChange === 'lower' ? lineClass(past[i - 2] || a) : lineClass(a);
      svg += `<path d="M${x(a.date)},${y(a.value)}H${x(b.date)}" class="${horizClass}"/>`;
      if (b.value !== a.value) {
        svg += `<path d="M${x(b.date)},${y(a.value)}V${y(b.value)}" class="${lineClass(b)}"/>`;
      }
    }
    if (past.length) {
      const last = past.at(-1);
      const extendX = isDetail && belowZoom.length ? x(last.date) + 18 : x(String(xEnd));
      svg += `<path d="M${x(last.date)},${y(last.value)}H${extendX}" class="${lineClass(last)}" opacity=".35"/>`;
      if (isDetail && belowZoom.length) {
        const latestBelow = belowZoom.at(-1);
        svg += `<text class="zoom-callout" x="${left + 8}" y="${height - bottom - 10}" text-anchor="start">↓ ${escape(M.format(problem, latestBelow.value))} in late 2026 (full range)</text>`;
      }
    }

    // Render unselected points first and the active point on top so adjacent points stay readable.
    const pointIndices = list.map((_, i) => i).filter(i => visiblePredicate(list[i]));
    pointIndices.sort((a, b) => (a === index ? 1 : b === index ? -1 : a - b));
    for (const i of pointIndices) {
      const m = list[i];
      const cx = x(m.date);
      const cy = y(m.boundChange === 'lower' ? m.lower : m.value);
      const future = i > index;
      const tip = escape(M.milestoneText(problem, m));
      const evidence = M.reported(m) ? ' report' : m.status === 'verified' ? ' verified' : '';
      const aiRing = showAI && m.ai ? `<circle class="ai-ring" cx="${cx}" cy="${cy}" r="${i === index ? 9 : 6.8}"/>` : '';
      svg += `<g opacity="${future ? .28 : 1}" data-index="${i}" data-tooltip="${tip}" tabindex="0" role="button" aria-label="${tip}" aria-pressed="${i === index}"><circle class="hit-area" cx="${cx}" cy="${cy}" r="12"/><circle class="point-halo" cx="${cx}" cy="${cy}" r="10.5"/>${aiRing}<circle class="point${i === index ? ' selected' : ''}${evidence}" cx="${cx}" cy="${cy}" r="${i === index ? 5.5 : 3.5}"/></g>`;
    }
    svg += '</g></svg>';

    const legend = '<span class="legend-item"><i class="legend-line"></i> Published</span>' +
      (list.some(M.reported) ? '<span class="legend-item"><i class="legend-line report"></i> Reported</span>' : '') +
      (list.some(m => m.status === 'verified') ? '<span class="legend-item"><i class="legend-line verified"></i> Lean verified</span>' : '') +
      (problem.kind === 'range' && !isDetail ? '<span class="legend-item"><i class="legend-line lower"></i> Lower bound</span>' : '') +
      (problem.target != null && !isDetail ? '<span class="legend-item"><i class="legend-line target"></i> Target</span>' : '') +
      (showAI && list.some(m => m.ai) ? '<span class="legend-item"><i class="legend-ai"></i> AI-assisted</span>' : '');
    const unit = isDetail
      ? 'Exponent ω · 2014–2026 plateau zoom'
      : problem.id === 'primes'
        ? `Prime gap H₁ · ${isLog ? 'logarithmic' : 'linear'} scale`
        : problem.unit;
    const note = zoomNote + problem.chartNote;
    return { svg, legend, unit, note };
  }

  function milestones(problem, list, index, showAI) {
    return list.map((entry, i) => {
      const classes = ['milestone-button'];
      if (M.reported(entry)) classes.push('report');
      if (entry.status === 'verified') classes.push('verified');
      if (showAI && entry.ai) classes.push('ai');
      return `<button type="button" data-index="${i}" data-tooltip="${escape(M.milestoneText(problem, entry))}" class="${classes.join(' ')}" aria-pressed="${i === index}"><time datetime="${entry.date}">${escape(entry.label)}</time><strong>${cardMetric(problem, entry)}</strong><small>${showAI && entry.ai ? '✦ AI-assisted · ' : ''}${escape(entry.short || statusText[entry.status])}</small></button>`;
    }).join('');
  }

  return { metric, cardMetric, shortMetric, navigation, progressChart, milestones };
});
