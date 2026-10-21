/* The page is fully local: no API calls, remote fonts, or chart dependencies. */
(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('frontiers-data').textContent);
  const M = window.Frontiers;
  const $ = id => document.getElementById(id);
  const aiPreferenceKey = 'math-frontiers:highlight-ai';
  try {
    $('show-ai').checked = localStorage.getItem(aiPreferenceKey) !== 'false';
  } catch {
    // Storage may be unavailable; keep the default and allow in-page changes.
    $('show-ai').checked = true;
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const statusText = { published: 'Published result', preprint: 'Preprint', report: 'Author report', construction: 'Published construction', conjecture: 'Conjecture · unproved' };
  let problem = data.problems.find(p => p.id === location.hash.slice(1)) || data.problems[0];
  let index = -1, mode = 'full', timer = null;
  let riemannView = 'proportion', regionId = 'seven-eighths';
  let tooltipTarget = null;
  let tooltipHighlights = [];
  const rows = () => M.milestones(problem, $('include-reports').checked);
  const metric = (p, m) => p.kind === 'range' ? `${m.lower}–${m.value}` : p.kind === 'floor' ? `> 10<sup>${m.value.toLocaleString('en-US')}</sup>` : escape(m.display || M.format(p, m.value));
  const shortMetric = (p, m) => p.kind === 'grid' ? `${m.value} gaps` : p.kind === 'range' ? `${m.lower}–${m.value}` : p.kind === 'floor' ? `> 10^${m.value}` : M.format(p, m.value);

  function mini(p, list) {
    const ys = list.map(m => p.id === 'primes' ? Math.log10(m.value) : m.value);
    const min = Math.min(...ys), max = Math.max(...ys);
    const xs = list.map(m => M.year(m.date));
    const points = ys.map((v,i) => [3 + (xs[i]-xs[0]) / (xs.at(-1)-xs[0] || 1)*124, 26-(v-min)/(max-min || 1)*22]);
    return `<svg viewBox="0 0 130 30" aria-hidden="true"><path d="${M.stepPath(points)}" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".65"/><g data-tooltip="${escape(M.milestoneText(p,list.at(-1)))}"><circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="8" fill="transparent"/><circle class="mini-point" cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="2" fill="currentColor"/></g></svg>`;
  }

  function renderNav() {
    $('problem-nav').innerHTML = data.problems.map((p,i) => {
      const list = M.milestones(p, $('include-reports').checked);
      const bound = M.regions(p, $('include-reports').checked).filter(r=>r.status!=='conjecture').sort((a,b)=>M.regionBounds(a).upper-M.regionBounds(b).upper)[0];
      const values = p.id === 'riemann' ? `<span class="riemann-metrics"><span data-tooltip="${escape(M.milestoneText(p,list.at(-1)))}"><strong>${escape(shortMetric(p,list.at(-1)))}</strong><small>on the line</small></span><span${bound?` data-tooltip="${escape(M.regionRange(bound)+' · preprint')}">`:'>'}<strong>${bound?escape(bound.label):'RH'}</strong><small>${bound?'strip bound':'unproved'}</small></span></span>` : `<span class="mini-value">${escape(shortMetric(p,list.at(-1)))}</span>${mini(p,list)}`;
      return `<button type="button" class="problem-button${p.id==='riemann'?' riemann-card':''}" data-problem="${p.id}" aria-pressed="${p.id === problem.id}" aria-controls="explorer"><span class="number">0${i+1}${M.reported(list.at(-1))?' <span class="nav-evidence">Reported</span>':''}</span><span class="name">${escape(p.name)}</span>${values}</button>`;
    }).join('');
  }

  function renderRiemannNavigation() {
    const isRiemann = problem.id === 'riemann';
    $('riemann-navigation').hidden = !isRiemann;
    $('progress-view').hidden = isRiemann && riemannView === 'regions';
    $('region-view').hidden = !isRiemann || riemannView !== 'regions';
    if (isRiemann) {
      $('progress-view').setAttribute('role','tabpanel');
      $('progress-view').setAttribute('aria-labelledby','proportion-tab');
    } else {
      $('progress-view').removeAttribute('role');
      $('progress-view').removeAttribute('aria-labelledby');
    }
    $('riemann-views').querySelectorAll('[data-riemann-view]').forEach(button=>{
      const selected = button.dataset.riemannView === riemannView;
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function renderRegion() {
    hideTooltip();
    const available = M.regions(problem, $('include-reports').checked);
    const region = available.find(r=>r.id===regionId) || available.at(-1);
    regionId = region.id;
    const b = M.regionBounds(region), conjecture = region.status === 'conjecture';
    const range = M.regionRange(region);
    $('region-controls').querySelectorAll('[data-region]').forEach(button=>{
      button.disabled = !available.some(r=>r.id===button.dataset.region);
      button.setAttribute('aria-pressed',String(button.dataset.region===regionId));
    });
    $('region-filter-note').hidden = $('include-reports').checked;
    $('region-metric-label').textContent = conjecture ? 'Conjectured location of every nontrivial zero' : 'Reported location bound for every nontrivial zero';
    $('region-value').textContent = range;
    $('region-status').textContent = statusText[region.status];
    $('region-status').className = 'status '+(conjecture?'conjecture':'report');
    $('region-date').textContent = region.dateLabel;
    $('region-evidence').textContent = `${region.dateLabel} / ${statusText[region.status]}`;
    $('region-title').textContent = region.title;
    $('region-detail').textContent = region.detail;
    $('region-who').textContent = region.who;
    $('region-source').href = region.url;
    $('region-source').textContent = conjecture ? 'Read about the conjecture ↗' : 'Read the preprint ↗';
    $('region-ai-note').hidden = !$('show-ai').checked;
    $('region-ai-note').textContent = region.ai ? 'AI contribution · '+region.ai : 'The Riemann hypothesis was formulated in 1859; this comparison does not represent an AI result.';
    $('permitted-legend').hidden = conjecture;
    const latest = rows().at(-1);
    $('region-proportion-comparison').textContent = `${latest.display} of zeros lie exactly at β = ½, asymptotically (${statusText[latest.status].toLowerCase()}). This bound does not locate the remaining zeros.`;
    $('region-proportion-source').href = latest.url;
    $('region-location-comparison').textContent = conjecture ? 'Full RH would put every zero at β = ½. Even a 100% asymptotic proportion could leave a sparse set of exceptions; RH allows none.' : `The ${region.label} statement confines every nontrivial zero to ${range}. ${region.label} is a horizontal coordinate, not a percentage of zeros or a percentage solved.`;

    const width = Math.max(240, $('region-diagram').clientWidth), height = 320;
    const left = 38, right = 18, top = 42, bottom = 240, plotW = width-left-right;
    const x = value => left+value*plotW;
    const description = `${statusText[region.status]}. ${range}. ${conjecture?'Under full RH, every nontrivial zero would lie on the critical line.':'The outer bands are excluded by the reported statement; zeros may lie anywhere in the remaining strip, including on its boundaries.'} The restriction extends to every height. No individual zeros are plotted.`;
    const excludedTip = conjecture ? 'Excluded if RH is true · conjecture' : `Excluded by the ${region.label} statement · preprint`;
    const permittedTip = `${range}\nPermitted locations; not a distribution of zeros`;
    const boundary = (value,label,side) => {
      const exactDecimal = Number(value.toFixed(6));
      const tip = `${side} boundary · β = ${label}\n${value===exactDecimal?'=':'≈'} ${exactDecimal}\n${statusText[region.status]}`;
      return `<g data-tooltip="${escape(tip)}" tabindex="0" role="img" aria-label="${escape(tip)}"><line x1="${x(value)}" x2="${x(value)}" y1="${top}" y2="${bottom}" stroke="transparent" stroke-width="14"/><line class="region-boundary" x1="${x(value)}" x2="${x(value)}" y1="${top}" y2="${bottom}"/><circle cx="${x(value)}" cy="${bottom}" r="4" class="region-boundary-dot"/><text class="boundary-label" x="${x(value)}" y="${bottom+44}" text-anchor="middle">${label}</text></g>`;
    };
    $('region-diagram').innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="region-svg-title region-svg-desc">
      <title id="region-svg-title">${escape(region.label)}: permitted locations of zeta zeros</title><desc id="region-svg-desc">${escape(description)}</desc>
      <defs><pattern id="excluded-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-1,1L1,-1M0,7L7,0M6,8L8,6" stroke="#9eB7a1" stroke-width=".6"/></pattern></defs>
      <rect x="${left}" y="${top}" width="${plotW}" height="${bottom-top}" fill="#e8efe6"/>
      <rect x="${left}" y="${top}" width="${plotW}" height="${bottom-top}" fill="url(#excluded-hatch)" data-tooltip="${escape(excludedTip)}"/>
      ${conjecture?'':`<rect class="permitted-strip" x="${x(b.lower)}" y="${top}" width="${x(b.upper)-x(b.lower)}" height="${bottom-top}" fill="#fcf3e6" data-tooltip="${escape(permittedTip)}"/>`}
      <path d="M${left},${top}H${width-right}M${left},${bottom}H${width-right}" stroke="#aab9ad" stroke-dasharray="3 4"/>
      <text x="${x(.5)}" y="20" text-anchor="middle" class="critical-label">Critical line β = ½</text>
      <path d="M${x(.5)-4},${top+5}L${x(.5)},${top}L${x(.5)+4},${top+5}M${x(.5)-4},${bottom-5}L${x(.5)},${bottom}L${x(.5)+4},${bottom-5}" class="critical-line"/>
      <g tabindex="0" role="img" aria-label="Critical line: real part β = ½" data-tooltip="Critical line · β = ½ = 0.5${conjecture?'\nEvery nontrivial zero would lie here under RH':''}"><line x1="${x(.5)}" x2="${x(.5)}" y1="${top}" y2="${bottom}" stroke="transparent" stroke-width="14"/><line x1="${x(.5)}" x2="${x(.5)}" y1="${top}" y2="${bottom}" class="critical-line${conjecture?' rh-line':''}"/></g>
      ${conjecture?'':boundary(b.lower,b.lowerLabel,'Left')+boundary(b.upper,b.upperLabel,'Right')}
      <text x="${left}" y="${bottom+23}" text-anchor="middle">0</text><text x="${x(.5)}" y="${bottom+23}" text-anchor="middle">½</text><text x="${width-right}" y="${bottom+23}" text-anchor="middle">1</text>
      <text x="${x(.5)}" y="${height-8}" text-anchor="middle">Real part β →</text>
      <text transform="translate(15 ${(top+bottom)/2}) rotate(-90)" text-anchor="middle">Height γ · all heights</text>
      ${conjecture?`<text class="region-caption" x="${x(.5)+12}" y="${(top+bottom)/2}">All zeros</text><text class="region-caption" x="${x(.5)+12}" y="${(top+bottom)/2+18}">on this line</text>`:''}
    </svg>`;
  }

  function renderChart(list) {
    hideTooltip();
    const current = list[index];
    if (problem.kind === 'grid') return renderGrid(current);
    const narrow = $('chart').clientWidth < 550;
    const width = narrow ? Math.max(260,$('chart').clientWidth) : 680;
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
      svg+=`<g opacity="${future?.28:1}" data-index="${i}" data-tooltip="${tip}" tabindex="0" role="button" aria-label="${tip}" aria-pressed="${i===index}"><circle class="hit-area" cx="${cx}" cy="${cy}" r="12"/><circle class="point-halo" cx="${cx}" cy="${cy}" r="10"/><circle class="point${i===index?' selected':''}${M.reported(m)?' report':''}${$('show-ai').checked&&m.ai?' ai':''}" cx="${cx}" cy="${cy}" r="${i===index?6:4}"/></g>`;
    });
    svg+='</g></svg>';
    $('chart').innerHTML=svg;
    $('chart-legend').innerHTML='<span class="legend-item"><i class="legend-line"></i> Published</span>'+(list.some(M.reported)?'<span class="legend-item"><i class="legend-line report"></i> Reported</span>':'')+(problem.kind==='range'?'<span class="legend-item"><i class="legend-line lower"></i> Lower bound</span>':'')+(problem.target!=null&&!isDetail?'<span class="legend-item"><i class="legend-line target"></i> Target</span>':'');
    $('chart-unit').textContent = isDetail ? 'Exponent ω · detail view (target 2 is outside the plot)' : problem.id==='primes' ? `Prime gap H₁ · ${isLog?'logarithmic':'linear'} scale` : problem.unit;
    $('chart-note').textContent = (isDetail ? 'The detail view shows 2014 onward and magnifies a very narrow range. Earlier values and the target are outside this view. ' : '') + problem.chartNote;
  }

  function renderGrid(current) {
    const original=problem.milestones[0].unknown;
    const unresolved=new Set(current.unknown);
    const reported=new Set(current.reported || []);
    let grid='<p class="grid-intro">Each square is one order: 4, 8, 12, …, 2,000. Read left to right.</p><div class="order-grid" aria-hidden="true">';
    for(let order=4;order<=2000;order+=4)grid+=`<span class="order-cell${unresolved.has(order)?' unknown':reported.has(order)?' resolved':''}" data-cell-order="${order}" data-tooltip="${escape(M.orderText(current,order))}"></span>`;
    grid+='</div><p class="grid-intro">Inspect the orders that were open in the first snapshot:</p><div class="grid-cases">'+original.map(n=>`<button type="button" data-order="${n}" data-tooltip="${escape(M.orderText(current,n))}" aria-pressed="false">${n}</button>`).join('')+'</div><p class="grid-detail" id="grid-detail" aria-live="polite">Hover over a cell for its order and status, or select an order above.</p>';
    $('chart').innerHTML=grid;
    $('chart-unit').textContent='Admissible orders through 2,000 · 500 cases';
    $('chart-legend').innerHTML='<span class="legend-item">■ Known construction</span><span class="legend-item" style="color:var(--amber)">□ Unresolved</span><span class="legend-item" style="color:var(--amber)">▧ Reported construction</span>';
    $('chart-note').textContent=problem.chartNote;
  }

  function render() {
    const list=rows();
    index=Math.max(0,Math.min(index<0?list.length-1:index,list.length-1));
    const m=list[index];
    $('explorer').hidden=false;
    renderRiemannNavigation();
    $('problem-category').textContent=problem.category;
    $('problem-title').textContent=problem.name;
    $('metric-label').textContent=problem.metric;
    $('metric-value').innerHTML=metric(problem,m);
    $('metric-status').textContent=statusText[m.status];
    $('metric-status').className='status'+(M.reported(m)?' report':'');
    $('metric-date').textContent=m.label;
    $('question').textContent=problem.question;
    $('explanation').textContent=problem.explanation;
    $('event-date').textContent=m.label+' / '+statusText[m.status];
    $('event-title').textContent=m.title;
    $('event-detail').textContent=m.detail;
    $('event-who').textContent=m.who;
    $('event-source').href=m.url;
    $('interpretation').textContent=problem.interpretation;
    $('ai-note').hidden=!$('show-ai').checked;
    $('ai-note').textContent=m.ai ? 'AI contribution · '+m.ai : 'No AI contribution is documented for this milestone in this collection.';
    $('extra-note').hidden=!problem.note;
    $('extra-note').innerHTML=problem.note || '';
    $('milestone-slider').max=String(list.length-1);
    $('milestone-slider').value=String(index);
    $('milestone-slider').setAttribute('aria-valuetext',`${m.label}: ${shortMetric(problem,m)}`);
    $('milestone-position').textContent=`${index+1} / ${list.length}`;
    $('previous').disabled=index===0;
    $('next').disabled=index===list.length-1;
    $('scale-toggle').hidden=!['primes','matrix'].includes(problem.id);
    $('scale-toggle').textContent=problem.id==='primes' ? (mode==='linear'?'Use log scale':'Use linear scale') : (mode==='detail'?'Show full range':'Zoom to recent progress');
    $('scale-toggle').setAttribute('aria-pressed',String(mode!=='full'));
    if (!$('progress-view').hidden) renderChart(list);
    if (!$('region-view').hidden) renderRegion();
    $('milestone-list').innerHTML=list.map((entry,i)=>`<button type="button" data-index="${i}" data-tooltip="${escape(M.milestoneText(problem,entry))}" class="milestone-button${M.reported(entry)?' report':''}${$('show-ai').checked&&entry.ai?' ai':''}" aria-pressed="${i===index}"><time datetime="${entry.date}">${escape(entry.label)}</time><strong>${metric(problem,entry)}</strong><small>${$('show-ai').checked&&entry.ai?'✦ AI-assisted · ':''}${escape(entry.short || statusText[entry.status])}</small></button>`).join('');
  }

  function hideTooltip() {
    if(tooltipTarget) tooltipTarget.removeAttribute('aria-describedby');
    tooltipHighlights.forEach(element=>element.classList.remove('tooltip-active'));
    tooltipHighlights=[];
    tooltipTarget=null;
    $('chart-tooltip').hidden=true;
  }
  function showTooltip(target,event) {
    if(!target)return;
    if(tooltipTarget!==target) {
      hideTooltip();
      tooltipTarget=target;
      tooltipHighlights=[target];
      const point=target.dataset.index!==undefined ? $('chart').querySelector(`g[data-index="${target.dataset.index}"]`) : null;
      const cell=target.dataset.order ? $('chart').querySelector(`[data-cell-order="${target.dataset.order}"]`) : null;
      if(point && point!==target)tooltipHighlights.push(point);
      if(cell)tooltipHighlights.push(cell);
      tooltipHighlights.forEach(element=>element.classList.add('tooltip-active'));
    }
    const tooltip=$('chart-tooltip');
    tooltip.textContent=target.dataset.tooltip;
    tooltip.hidden=false;
    target.setAttribute('aria-describedby','chart-tooltip');
    const rect=target.getBoundingClientRect();
    const x=event?.clientX ?? rect.left+rect.width/2;
    const y=event?.clientY ?? rect.bottom;
    const left=Math.max(10,Math.min(x+14,window.innerWidth-tooltip.offsetWidth-10));
    const top=y+16+tooltip.offsetHeight<=window.innerHeight-10 ? y+16 : Math.max(10,y-tooltip.offsetHeight-12);
    tooltip.style.left=`${left}px`;
    tooltip.style.top=`${top}px`;
  }
  document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const target=e.target.closest('[data-tooltip]');if(target)showTooltip(target,e);});
  document.addEventListener('pointermove',e=>{if(tooltipTarget && e.target.closest('[data-tooltip]')===tooltipTarget)showTooltip(tooltipTarget,e);});
  document.addEventListener('pointerout',e=>{if(tooltipTarget && !tooltipTarget.contains(e.relatedTarget))hideTooltip();});
  document.addEventListener('focusin',e=>showTooltip(e.target.closest('[data-tooltip]')));
  document.addEventListener('focusout',hideTooltip);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTooltip();});
  window.addEventListener('scroll',hideTooltip,true);
  $('chart').addEventListener('keydown',e=>{const dot=e.target.closest('g[data-index]');if(dot && ['Enter',' '].includes(e.key)){e.preventDefault();select(Number(dot.dataset.index));$('chart').querySelector(`g[data-index="${index}"]`)?.focus({preventScroll:true});}});
  function stop(){if(timer)clearInterval(timer);timer=null;$('play').innerHTML='▶ <span>Play history</span>';$('play').setAttribute('aria-label','Play the milestones');}
  function select(i){stop();index=i;render();}
  function switchProblem(id,updateURL=true){const next=data.problems.find(p=>p.id===id);if(!next)return;stop();problem=next;index=-1;mode='full';renderNav();render();if(updateURL)history.replaceState(null,'','#'+id);}
  function switchRiemannView(view) {
    stop(); hideTooltip(); riemannView=view; render();
  }
  $('riemann-views').addEventListener('click',e=>{const button=e.target.closest('[data-riemann-view]');if(button)switchRiemannView(button.dataset.riemannView);});
  $('riemann-views').addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
    e.preventDefault();
    const view=e.key==='Home'?'proportion':e.key==='End'?'regions':riemannView==='proportion'?'regions':'proportion';
    switchRiemannView(view);
    $(view==='proportion'?'proportion-tab':'regions-tab').focus();
  });
  $('region-controls').addEventListener('click',e=>{const button=e.target.closest('[data-region]');if(button&&!button.disabled){regionId=button.dataset.region;renderRegion();}});
  $('problem-nav').addEventListener('click',e=>{const b=e.target.closest('[data-problem]');if(b){switchProblem(b.dataset.problem);$('problem-nav').querySelector(`[data-problem="${problem.id}"]`).focus({preventScroll:true});}});
  $('milestone-list').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b){select(Number(b.dataset.index));$('milestone-list').querySelector(`[data-index="${index}"]`).focus({preventScroll:true});}});
  $('chart').addEventListener('click',e=>{const point=e.target.closest('[data-index]');if(point)select(Number(point.dataset.index));const order=e.target.closest('[data-order]');if(order){const n=Number(order.dataset.order),m=rows()[index];$('chart').querySelectorAll('[data-order]').forEach(b=>b.setAttribute('aria-pressed',String(b===order)));$('grid-detail').textContent=`Order ${n}: ${m.unknown.includes(n)?'no construction known in this snapshot':(m.reported||[]).includes(n)?'construction reported in August 2026; the source records an independent check for order 668':'a construction is known in this snapshot'}.`;}});
  $('milestone-slider').addEventListener('input',e=>select(Number(e.target.value)));
  $('previous').addEventListener('click',()=>select(Math.max(0,index-1)));
  $('next').addEventListener('click',()=>select(Math.min(rows().length-1,index+1)));
  $('include-reports').addEventListener('change',()=>{stop();index=-1;renderNav();render();});
  $('show-ai').addEventListener('change',()=>{
    try { localStorage.setItem(aiPreferenceKey,String($('show-ai').checked)); }
    catch { /* The toggle still works when browser storage is unavailable. */ }
    render();
  });
  $('scale-toggle').addEventListener('click',()=>{mode=mode==='full'?(problem.id==='primes'?'linear':'detail'):'full';render();});
  $('play').addEventListener('click',()=>{if(timer){stop();return;}if(index===rows().length-1)index=0;render();$('play').innerHTML='Ⅱ <span>Pause</span>';$('play').setAttribute('aria-label','Pause the milestones');timer=setInterval(()=>{index++;render();if(index===rows().length-1)stop();},1700);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('hashchange',()=>switchProblem(location.hash.slice(1),false));
  window.addEventListener('resize',()=>{if(!$('region-view').hidden)renderRegion();else renderChart(rows());});
  renderNav();render();
})();
