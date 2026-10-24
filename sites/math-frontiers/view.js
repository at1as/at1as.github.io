/* Shared build-time and browser rendering; no DOM or runtime dependencies. */
(function(root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./model.js"));
  else root.FrontiersView = factory(root.Frontiers);
})(typeof window === "object" ? window : globalThis, function(M) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const statusText = { published: 'Published result', preprint: 'Preprint', report: 'Author report', construction: 'Published construction', conjecture: 'Conjecture · unproved' };
  const metric = (p, m) => p.kind === 'range' ? `${m.lower}–${m.value}` : p.kind === 'floor' ? `> 10<sup>${m.value.toLocaleString('en-US')}</sup>` : escape(m.display || M.format(p, m.value));
  const shortMetric = (p, m) => p.kind === 'grid' ? `${m.value} gaps` : p.kind === 'range' ? `${m.lower}–${m.value}` : p.kind === 'floor' ? `> 10^${m.value}` : M.format(p, m.value);

  function mini(p, list) {
    const ys = list.map(m => p.id === 'primes' ? Math.log10(m.value) : m.value);
    const min = Math.min(...ys), max = Math.max(...ys);
    const xs = list.map(m => M.year(m.date));
    const points = ys.map((v,i) => [3 + (xs[i]-xs[0]) / (xs.at(-1)-xs[0] || 1)*124, 26-(v-min)/(max-min || 1)*22]);
    return `<svg viewBox="0 0 130 30" aria-hidden="true"><path d="${M.stepPath(points)}" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".65"/><g data-tooltip="${escape(M.milestoneText(p,list.at(-1)))}"><circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="8" fill="transparent"/><circle class="mini-point" cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="2" fill="currentColor"/></g></svg>`;
  }

  function navigation(data, includeReports, selectedId) {
    return data.problems.map((p,i) => {
      const list = M.milestones(p, includeReports);
      const bound = M.regions(p, includeReports).filter(r=>r.status!=='conjecture').sort((a,b)=>M.regionBounds(a).upper-M.regionBounds(b).upper)[0];
      const values = p.id === 'riemann' ? `<span class="riemann-metrics"><span data-tooltip="${escape(M.milestoneText(p,list.at(-1)))}"><strong>${escape(shortMetric(p,list.at(-1)))}</strong><small>on the line</small></span><span${bound?` data-tooltip="${escape(M.regionRange(bound)+' · preprint')}">`:'>'}<strong>${bound?escape(bound.label):'RH'}</strong><small>${bound?'strip bound':'unproved'}</small></span></span>` : `<span class="mini-value">${escape(shortMetric(p,list.at(-1)))}</span>${mini(p,list)}`;
      return `<button type="button" class="problem-button${p.id==='riemann'?' riemann-card':''}" data-problem="${p.id}" aria-pressed="${p.id === selectedId}" aria-controls="explorer"><span class="number">0${i+1}${M.reported(list.at(-1))?' <span class="nav-evidence">Reported</span>':''}</span><span class="name">${escape(p.name)}</span>${values}</button>`;
    }).join('');
  }

  function progressChart(problem, list, index, mode, showAI, clientWidth) {
    const current = list[index];
    const narrow = clientWidth < 550;
    const width = narrow ? Math.max(260,clientWidth) : 680;
    const height = narrow ? 260 : 290, left = narrow ? 55 : 68, right = narrow ? 18 : 27, top = 22, bottom = 40;
    const plotW = width-left-right, plotH=height-top-bottom;
    const isLog = problem.id === 'primes' && mode !== 'linear';
    const isDetail = problem.id === 'matrix' && mode === 'detail';
    const [min,max] = M.bounds(problem,list,mode);
    const transform = value => isLog ? Math.log10(value) : value;
    const y = value => top + (transform(max)-transform(value))/(transform(max)-transform(min))*plotH;
    const xStart = isDetail ? 2014 : problem.start;
    const xEnd = problem.end;
    const x = date => left+(M.year(date)-xStart)/(xEnd-xStart)*plotW;
    const yTicks = isDetail ? [2.371,2.3715,2.372,2.3725,2.373] : (problem.id === 'primes' && mode === 'linear' ? [0,20000000,40000000,60000000,80000000] : problem.ticks);
    const yLabel = n => problem.kind === 'floor' ? `10^${n}` : problem.id === 'primes' && n>=1000000 ? `${n/1000000}m` : problem.id === 'primes' && n>=1000 ? `${n/1000}k` : problem.kind === 'proportion' ? `${n}%` : String(n);
    let svg = `<svg viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="chart-title chart-desc"><title id="chart-title">${escape(problem.name)}: selected milestones</title><desc id="chart-desc">${escape(problem.chartDescription)} Selected: ${escape(current.label)}, ${escape(shortMetric(problem,current))}. Full data and sources are below.</desc><defs><clipPath id="plot-clip"><rect x="${left-8}" y="${top-8}" width="${plotW+16}" height="${plotH+16}"/></clipPath></defs>`;
    for (const tick of yTicks) svg += `<line class="grid-line" x1="${left}" y1="${y(tick)}" x2="${width-right}" y2="${y(tick)}"/><text x="${left-12}" y="${y(tick)+3}" text-anchor="end">${yLabel(tick)}</text>`;
    const xticks = isDetail ? [2014,2018,2022,2026] : problem.yearTicks;
    for (const tick of xticks) svg+=`<text class="axis-label" x="${x(String(tick))}" y="${height-17}" text-anchor="middle">${tick}</text>`;
    if (problem.target != null && !isDetail) svg+=`<line class="target-line" x1="${left}" x2="${width-right}" y1="${y(problem.target)}" y2="${y(problem.target)}"/><text class="target-label" x="${width-right}" y="${y(problem.target)-8}" text-anchor="end">${escape(problem.targetLabel)}</text>`;
    const past = list.slice(0,index+1).filter(m => M.year(m.date)>=xStart);
    if (problem.kind === 'range' && past.length) {
      const upper = past.map(m => [x(m.date), y(m.value)]);
      const lower = past.map(m => [x(m.date), y(m.lower)]);
      const endX = x(String(xEnd));
      svg += `<path d="${M.stepPath([...upper,[endX,upper.at(-1)[1]]])}L${endX},${lower.at(-1)[1]}${lower.slice().reverse().map(p=>`L${p[0]},${p[1]}`).join('')}Z" fill="#eaf0e5"/>`;
      svg += `<path d="${M.stepPath([...lower,[endX,lower.at(-1)[1]]])}" stroke="#758dba" stroke-width="2" fill="none"/>`;
    }
    svg += '<g clip-path="url(#plot-clip)">';
    for (let i=1;i<past.length;i++) {
      const a=past[i-1],b=past[i];
      svg+=`<path d="M${x(a.date)},${y(a.value)}H${x(b.date)}" class="data-line${M.reported(a)?' reported-line':''}"/><path d="M${x(b.date)},${y(a.value)}V${y(b.value)}" class="data-line${M.reported(b)?' reported-line':''}"/>`;
    }
    if(past.length) {
      const last=past.at(-1);
      svg+=`<path d="M${x(last.date)},${y(last.value)}H${x(String(xEnd))}" class="data-line${M.reported(last)?' reported-line':''}" opacity=".35"/>`;
    }
    list.forEach((m,i) => {
      if(M.year(m.date)<xStart || m.value>max || m.value<min) return;
      const cx=x(m.date),cy=y(m.value),future=i>index;
      const tip=escape(M.milestoneText(problem,m));
      svg+=`<g opacity="${future?.28:1}" data-index="${i}" data-tooltip="${tip}" tabindex="0" role="button" aria-label="${tip}" aria-pressed="${i===index}"><circle class="hit-area" cx="${cx}" cy="${cy}" r="12"/><circle class="point-halo" cx="${cx}" cy="${cy}" r="10"/><circle class="point${i===index?' selected':''}${M.reported(m)?' report':''}${showAI&&m.ai?' ai':''}" cx="${cx}" cy="${cy}" r="${i===index?6:4}"/></g>`;
    });
    svg+='</g></svg>';

    const legend='<span class="legend-item"><i class="legend-line"></i> Published</span>'+(list.some(M.reported)?'<span class="legend-item"><i class="legend-line report"></i> Reported</span>':'')+(problem.kind==='range'?'<span class="legend-item"><i class="legend-line lower"></i> Lower bound</span>':'')+(problem.target!=null&&!isDetail?'<span class="legend-item"><i class="legend-line target"></i> Target</span>':'');
    const unit = isDetail ? 'Exponent ω · detail view (target 2 is outside the plot)' : problem.id==='primes' ? `Prime gap H₁ · ${isLog?'logarithmic':'linear'} scale` : problem.unit;
    const note = (isDetail ? 'The detail view shows 2014 onward and magnifies a very narrow range. Earlier values and the target are outside this view. ' : '') + problem.chartNote;
    return {svg, legend, unit, note};
  }

  function milestones(problem, list, index, showAI) {
    return list.map((entry,i)=>`<button type="button" data-index="${i}" data-tooltip="${escape(M.milestoneText(problem,entry))}" class="milestone-button${M.reported(entry)?' report':''}${showAI&&entry.ai?' ai':''}" aria-pressed="${i===index}"><time datetime="${entry.date}">${escape(entry.label)}</time><strong>${metric(problem,entry)}</strong><small>${showAI&&entry.ai?'✦ AI-assisted · ':''}${escape(entry.short || statusText[entry.status])}</small></button>`).join('');
  }

  return {metric, shortMetric, navigation, progressChart, milestones};
});
