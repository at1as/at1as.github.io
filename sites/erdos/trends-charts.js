/* D3 7 renders the same SVG charts at build time and in the browser. */
((root) => {
  const d3 = root.d3, T = root.ErdosTrends;
  const colors = {resolved:'#3977bd', lean:'#298761', statements:'#5a6f9c', gained:'#3977bd', added:'#9fbfe3', baseline:'#8873b7', lost:'#dd7b80', removed:'#a74559', unmatched:'#9b94ae'};
  const copy = {
    resolved: {
      title:'How often problems are marked resolved',
      cumulativeTitle:'Cumulative resolved problems',
      monthly:'Status changes vs. database additions by month. Select a bar to inspect problems.',
      release:'Observed changes to resolved in the 30 days before vs. after release (timeline context, not attribution).',
      counted:'changes to resolved status',
      countedSingular:'change to resolved status',
      unit:'status changes',
      scope:'resolved status',
      plural:'resolved problems',
      changes:{gained:'Marked resolved',added:'Added as resolved',lost:'No longer resolved'}
    },
    lean: {
      title:'How often Lean solutions are added',
      cumulativeTitle:'Cumulative solutions in Lean',
      monthly:'Lean solution changes vs. database additions by month. Select a bar to inspect problems.',
      release:'Observed Lean solution additions in the 30 days before vs. after release (timeline context, not attribution).',
      counted:'Lean solution additions',
      countedSingular:'Lean solution addition',
      unit:'additions',
      scope:'Lean solutions',
      plural:'Lean solutions',
      changes:{gained:'Newly in Lean',added:'Added with a Lean solution',lost:'Lean solution no longer listed'}
    },
    statements: {
      title:'How often Lean statements are added',
      cumulativeTitle:'Cumulative statements in Lean',
      monthly:'Lean statement changes vs. database additions by month. Select a bar to inspect problems.',
      release:'Observed Lean statement additions in the 30 days before vs. after release (timeline context, not attribution).',
      counted:'Lean statement additions',
      countedSingular:'Lean statement addition',
      unit:'additions',
      scope:'Lean statements',
      plural:'Lean statements',
      changes:{gained:'Newly in Lean',added:'Added with a Lean statement',lost:'Lean statement no longer listed'}
    }
  };
  const date = value => new Date(T.time(value));
  const label = value => d3.utcFormat('%b %-d, %Y')(date(value));
  const format = value => value.toLocaleString('en-US');
  const shortRelease = r => r.short_name || r.name.replace('Claude ','').split(' · ')[0];

  function paceText(metric, days) {
    const words = copy[metric];
    return {
      title: words.title,
      description: `Rolling daily average over the previous ${days} days. Select a point to inspect changes, or a model marker to compare before and after.`,
      note: 'Counts changes to existing problems, including repeats. Grey bands mark snapshot gaps over 7 days; purple shading marks the selected release’s 30-day before/after windows.'
    };
  }
  function frame(element, title, domain, height=330) {
    const width = Math.max(240, Math.round(element.getBoundingClientRect().width) || 960);
    const margin = {top:38, right:20, bottom:38, left:52};
    const svg = d3.select(element).attr('viewBox', `0 0 ${width} ${height}`).attr('role','img').attr('aria-label',title).attr('tabindex',0);
    svg.selectAll('*').remove(); svg.append('title').text(title);
    const x = d3.scaleUtc().domain(domain.map(date)).range([margin.left,width-margin.right]);
    const y = d3.scaleLinear().range([height-margin.bottom,margin.top]);
    const readout = element.closest('.chart-card')?.querySelector('.chart-readout');
    const say = text => { if (readout) readout.textContent = text; };
    return {svg,x,y,width,height,margin,say};
  }
  function axes(f, categorical=false, yFormat=null) {
    const {svg,x,y,width,height,margin} = f;
    svg.append('g').attr('class','chart-grid').attr('transform',`translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(width-margin.left-margin.right)).tickFormat('')).call(g=>g.select('.domain').remove());
    const leftAxis = d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10);
    if (yFormat) leftAxis.tickFormat(yFormat);
    svg.append('g').attr('class','chart-axis').attr('transform',`translate(${margin.left},0)`)
      .call(leftAxis).call(g=>g.select('.domain').remove());
    let axis;
    if (categorical) {
      axis = d3.axisBottom(x).tickFormat(d=>d3.utcFormat('%b %y')(date(d)));
      if (width<600 && x.domain().length > 6) axis.tickValues(x.domain().filter((_,i)=>i%3===0));
    } else {
      const spanDays = (x.domain()[1] - x.domain()[0]) / T.DAY;
      const tickFmt = spanDays <= 100 ? d3.utcFormat('%b %-d') : d3.utcFormat('%b %y');
      axis = d3.axisBottom(x).ticks(width<600?4:7).tickFormat(tickFmt);
    }
    svg.append('g').attr('class','chart-axis').attr('transform',`translate(0,${height-margin.bottom})`).call(axis.tickSize(0).tickPadding(12));
  }
  function inspect(f, points, describe, {onPreview, onSelect, selectedDate} = {}) {
    if (!points.length) return;
    const {svg,x,margin,width,height,say} = f;
    const guide = svg.append('line').attr('class','chart-crosshair').attr('y1',margin.top).attr('y2',height-margin.bottom).attr('visibility','hidden');
    let pinned = selectedDate ? points.findIndex(p=>p.date===selectedDate) : -1;
    let current = pinned >= 0 ? pinned : points.length-1;
    function show(i) {
      current = Math.max(0,Math.min(points.length-1,i));
      guide.attr('x1',x(date(points[current].date))).attr('x2',x(date(points[current].date))).attr('visibility','visible');
      say(describe(points[current]));
      onPreview?.(points[current]);
    }
    const pointAt = event => d3.bisector(p=>T.time(p.date)).center(points,+x.invert(d3.pointer(event,svg.node())[0]));
    const select = () => { pinned=current; onSelect?.(points[current]); };
    svg.append('rect').attr('class','chart-inspect-hit').attr('x',margin.left).attr('y',margin.top).attr('width',width-margin.left-margin.right).attr('height',height-margin.top-margin.bottom)
      .attr('fill','transparent').on('pointermove',event=>show(pointAt(event)))
      .on('pointerleave',()=>{if(pinned>=0)show(pinned);else guide.attr('visibility','hidden');})
      .on('click',event=>{if(onSelect){show(pointAt(event));select();}});
    svg.on('keydown',event=> {
      if(event.target!==svg.node()) return;
      if (event.key==='ArrowLeft' || event.key==='ArrowRight') { event.preventDefault(); show(current+(event.key==='ArrowLeft'?-1:1)); }
      if ((event.key==='Enter'||event.key===' ') && onSelect) { event.preventDefault(); show(current); select(); }
      if (event.key==='Escape') guide.attr('visibility','hidden');
    });
    if(pinned>=0) show(pinned);
    else { say(describe(points[current])); onPreview?.(points[current]); }
  }
  function pace(element,data,metric,days,releases,selected,onRelease,inspection,options={}) {
    const series = T.rolling(data,metric,days);
    const start = data.points[0].date, latest = data.points.at(-1).date;
    const showAll = Boolean(options.showAllReleases);
    const inRange = releases.filter(r => r.date >= start && T.time(r.date) <= T.time(latest) + 30*T.DAY)
      .sort((a,b)=>a.date.localeCompare(b.date));
    const releaseDates = showAll ? inRange : inRange.filter(r => r.featured !== false || r.id === selected);
    const end = [latest, releaseDates.at(-1)?.date || latest].sort().at(-1);
    const f = frame(element,`${copy[metric].title}, looking back ${days} days`,[start,end]);
    const {svg,x,y,margin,say} = f;
    // Keep every displayed release on its exact date; pack labels into rows when they overlap.
    const layer = svg.append('g').attr('class','release-labels');
    const lanes = [];
    const markers = releaseDates.map(r=> {
        const g=layer.append('g').attr('class','release-reference').attr('data-release',r.id)
          .attr('tabindex',0).attr('role','button').attr('aria-pressed',r.id===selected)
          .attr('aria-label',`${r.name}, ${label(r.date)}. Compare before and after release.`);
        g.append('title').text(`${r.name} · ${label(r.date)}`);
        const text=g.append('text').attr('class','release-name').attr('font-family','Arial,Helvetica,sans-serif').attr('font-size',11.5)
          .attr('font-weight',r.id===selected?600:400).text(shortRelease(r));
        const width=Math.ceil(Math.max(text.node().getComputedTextLength?.()||0,text.text().length*6.6))+10;
        const at=x(date(r.date));
        const left=Math.max(margin.left,Math.min(f.width-margin.right-width,at-width/2));
        let lane=lanes.findIndex(laneEnd=>laneEnd+8<=left);
        if(lane<0) lane=lanes.length;
        lanes[lane]=left+width;
        return {r,g,text,width,at,left,lane};
      });
    const laneHeight=22;
    margin.top=Math.max(36,lanes.length*laneHeight+18);
    f.height=margin.top + (f.width<600 ? 184 : 216) + margin.bottom;
    const height=f.height;
    svg.attr('viewBox',`0 0 ${f.width} ${height}`).style('height',`${height}px`);
    y.range([height-margin.bottom,margin.top]);
    y.domain([0,d3.max(series,p=>p.value)||1]).nice();

    // Highlight selected release's 30-day before/after comparison windows directly on the pace chart.
    const selectedObj = releases.find(r => r.id === selected);
    if (selectedObj) {
      const startMs = T.time(start), endMs = T.time(end), relMs = T.time(selectedObj.date);
      const clamp = ms => x(new Date(Math.max(startMs, Math.min(endMs, ms))));
      const b0 = clamp(relMs - 30*T.DAY), b1 = clamp(relMs), a1 = clamp(relMs + 30*T.DAY);
      if (b1 > b0) svg.append('rect').attr('class','release-window-before').attr('x',b0).attr('y',margin.top).attr('width',b1-b0).attr('height',height-margin.top-margin.bottom);
      if (a1 > b1) svg.append('rect').attr('class','release-window-after').attr('x',b1).attr('y',margin.top).attr('width',a1-b1).attr('height',height-margin.top-margin.bottom);
    }

    if (end > latest) svg.append('rect').attr('class','after-coverage').attr('x',x(date(latest))).attr('y',margin.top)
      .attr('width',x(date(end))-x(date(latest))).attr('height',height-margin.top-margin.bottom);
    data.intervals.filter(i=>i.days>7).forEach(i=>svg.append('rect').attr('class','gap-band').attr('x',x(date(i.start))).attr('width',x(date(i.end))-x(date(i.start))).attr('y',margin.top).attr('height',height-margin.top-margin.bottom));
    axes(f);
    const line = d3.line().x(p=>x(date(p.date))).y(p=>y(p.value)).curve(d3.curveStepAfter);
    svg.append('path').datum(series).attr('d',d3.area().x(p=>x(date(p.date))).y0(y(0)).y1(p=>y(p.value)).curve(d3.curveStepAfter)).attr('fill',colors[metric]||'#8f6ab3').attr('opacity',.09);
    svg.append('path').datum(series).attr('d',line).attr('fill','none').attr('stroke',colors[metric]||'#8f6ab3').attr('stroke-width',2.5);
    inspect(f,series,p=>`${label(p.date)} · ${p.events} ${copy[metric][p.events === 1 ? 'countedSingular' : 'counted']} in the previous ${p.days} days · ${p.value.toFixed(2)} per day on average`,inspection);
    if(!series.length) say('Not enough history for this window');
    const guides=svg.append('g').attr('class','release-guides').attr('pointer-events','none');
    layer.raise();
    markers.forEach(({r,g,text,width,at,left,lane})=> {
      const top=lane*laneHeight+2, ink=r.id===selected?'#74559d':'#5b687e';
      const guideLine=guides.append('line').attr('class','release-line').attr('data-release',r.id).attr('x1',at).attr('x2',at).attr('y1',margin.top).attr('y2',height-margin.bottom)
        .attr('stroke',r.id===selected?'#8062a7':'#c5ccd7').attr('stroke-dasharray','4 5').attr('stroke-width',r.id===selected?2:1);
      g.append('line').attr('x1',at).attr('x2',at).attr('y1',margin.top).attr('y2',height-margin.bottom).attr('stroke','transparent').attr('stroke-width',10);
      guides.append('path').attr('class','release-stem').attr('d',`M${at},${margin.top}V${top+20}H${left+width/2}`)
        .attr('fill','none').attr('stroke',r.id===selected?'#8062a7':'#d4dae3').attr('pointer-events','none');
      g.append('rect').attr('class','release-label-hit').attr('x',left).attr('y',top).attr('width',width).attr('height',20).attr('rx',3)
        .attr('fill',r.id===selected?'#f1edf7':'#fff');
      text.attr('x',left+5).attr('y',top+14).attr('fill',ink).raise();
      g.on('pointerenter focus',()=>{
        guideLine.attr('stroke','#74559d').attr('stroke-width',2);
        const suffix=r.date>latest?'After the latest saved snapshot.':'Select to compare before and after release.';
        say(`${r.name} · ${label(r.date)} · ${r.kind}. ${suffix}`);
      }).on('pointerleave blur',()=>guideLine.attr('stroke',r.id===selected?'#8062a7':'#c5ccd7').attr('stroke-width',r.id===selected?2:1));
      g.on('click',()=>onRelease?.(r.id));
      g.on('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onRelease?.(r.id);}});
    });
  }

  function cumulative(element,data,metric,mode='counts',overlay=null) {
    const points = data.points;
    const share = mode === 'share';
    const val = p => share ? (p.total ? 100 * p[metric] / p.total : 0) : p[metric];
    const primaryColor = colors[metric] || '#3977bd';
    const allDates = [points[0].date, points.at(-1).date];
    if (overlay?.points?.length) {
      if (overlay.points[0].date < allDates[0]) allDates[0] = overlay.points[0].date;
      if (overlay.points.at(-1).date > allDates[1]) allDates[1] = overlay.points.at(-1).date;
    }
    const f = frame(element, `${copy[metric].cumulativeTitle} (${share ? 'share of all problems' : 'count'})`, allDates, 300);
    const {svg,x,y,margin} = f;
    const maxVal = Math.max(
      d3.max(points, val) || 1,
      overlay?.points?.length ? (d3.max(overlay.points, val) || 0) : 0
    );
    const minVal = share ? 0 : Math.max(0, Math.floor((Math.min(
      d3.min(points, val) || 0,
      overlay?.points?.length ? (d3.min(overlay.points, val) || Infinity) : Infinity
    ) * 0.9) / 25) * 25);
    y.domain(share ? [0, Math.min(100, Math.ceil((maxVal + 5) / 10) * 10)] : [minVal, Math.ceil(maxVal * 1.05)]).nice();
    axes(f, false, share ? v => `${v}%` : null);

    const stepLine = d3.line().x(p=>x(date(p.date))).y(p=>y(val(p))).curve(d3.curveStepAfter);
    const stepArea = d3.area().x(p=>x(date(p.date))).y0(y(y.domain()[0])).y1(p=>y(val(p))).curve(d3.curveStepAfter);

    const atDate = (pts, targetDate) => {
      let found = null;
      for (const pt of pts) {
        if (pt.date <= targetDate) found = pt;
        else break;
      }
      return found;
    };

    if (overlay?.points?.length) {
      // Shade the gap between primary and comparison series where both have observations.
      const unionDates = [...new Set([...points.map(p=>p.date), ...overlay.points.map(p=>p.date)])].sort();
      const paired = unionDates.flatMap(d => {
        const a = atDate(points, d), b = atDate(overlay.points, d);
        return a && b ? [{date: d, a: val(a), b: val(b)}] : [];
      });
      svg.append('path').datum(paired)
        .attr('d', d3.area().x(p=>x(date(p.date))).y0(p=>y(Math.min(p.a, p.b))).y1(p=>y(Math.max(p.a, p.b))).curve(d3.curveStepAfter))
        .attr('fill', overlay.bandColor || '#8873b7').attr('opacity', .14);
      svg.append('path').datum(overlay.points).attr('d', stepLine)
        .attr('fill','none').attr('stroke', overlay.color || '#74559d').attr('stroke-width', 2)
        .attr('stroke-dasharray', overlay.dashed ? '5 4' : null);
    } else {
      svg.append('path').datum(points).attr('d', stepArea).attr('fill', primaryColor).attr('opacity', .09);
    }

    svg.append('path').datum(points).attr('d', stepLine).attr('fill','none').attr('stroke', primaryColor).attr('stroke-width', 2.5);

    // Direct end-of-line value badges for instant scanning.
    const lastPt = points.at(-1);
    const endX = x(date(lastPt.date));
    svg.append('circle').attr('cx', endX).attr('cy', y(val(lastPt))).attr('r', 3.5).attr('fill', primaryColor);
    if (overlay?.points?.length) {
      const ovLast = overlay.points.at(-1);
      svg.append('circle').attr('cx', x(date(ovLast.date))).attr('cy', y(val(ovLast))).attr('r', 3).attr('fill', overlay.color || '#74559d');
    }

    const inspectPoints = overlay?.points?.length
      ? [...new Set([...points.map(p=>p.date), ...overlay.points.map(p=>p.date)])].sort().map(d => ({date: d}))
      : points;

    inspect(f, inspectPoints, item => {
      const p = atDate(points, item.date);
      if (!p) return '';
      const pct = p.total ? ` (${(100 * p[metric] / p.total).toFixed(1)}%)` : '';
      let text = `${label(item.date)} · ${overlay?.primaryLabel ? overlay.primaryLabel + ': ' : ''}${format(p[metric])}${pct} ${copy[metric].plural} of ${format(p.total)}`;
      if (overlay?.points?.length) {
        const o = atDate(overlay.points, item.date);
        if (o && o[metric] !== p[metric]) {
          const diff = o[metric] - p[metric];
          text += ` · ${overlay.label}: ${format(o[metric])} (${diff > 0 ? '+' : ''}${format(diff)})`;
        }
      }
      return text;
    });
  }

  function composition(element,data,metric,onMonth) {
    const rows=T.monthly(data,metric);
    const keys=['gained','added',...(rows.some(row=>row.baseline)?['baseline']:[]),'lost','removed','unmatched'];
    const f=frame(element,`Monthly changes: ${copy[metric].counted}`,[data.points[0].date,data.points.at(-1).date]);
    const {svg,y,width,height,margin,say}=f;
    const x=f.x=d3.scaleBand().domain(rows.map(r=>r.date)).range([margin.left,width-margin.right]).padding(.28);
    const stack=d3.stack().keys(keys).offset(d3.stackOffsetDiverging)(rows);
    y.domain([Math.min(0,d3.min(stack,s=>d3.min(s,p=>p[0]))),Math.max(1,d3.max(stack,s=>d3.max(s,p=>p[1])))]).nice();
    axes(f,true);
    svg.append('line').attr('x1',margin.left).attr('x2',width-margin.right).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','#8494a9');
    const describe=r=> {
      const parts=keys.filter(k=>r[k]).map(k=>`${Math.abs(r[k])} ${(copy[metric].changes[k]||{baseline:'from catalog baseline',removed:'removed from database',unmatched:'unmatched changes'}[k]).toLowerCase()}`);
      return `${d3.utcFormat('%B %Y')(date(r.date))}${r.partial?' (partial month)':''} · ${r.net>0?'+':''}${r.net} net change${parts.length?' · '+parts.join(' · '):''}`;
    };
    stack.forEach(series=>svg.append('g').attr('fill',colors[series.key]).selectAll('rect').data(series).join('rect').attr('x',p=>x(p.data.date)).attr('width',x.bandwidth()).attr('y',p=>y(p[1])).attr('height',p=>Math.max(0,y(p[0])-y(p[1]))));
    rows.forEach(r=>{
      svg.append('circle').attr('cx',x(r.date)+x.bandwidth()/2).attr('cy',y(r.net)).attr('r',3).attr('fill','#17253c');
      const g=svg.append('g').attr('tabindex',0).attr('role','button').attr('aria-label',describe(r)+'. View underlying problems.');
      g.append('title').text(describe(r));
      g.append('rect').attr('x',x(r.date)).attr('width',x.bandwidth()).attr('y',margin.top).attr('height',height-margin.top-margin.bottom).attr('fill','transparent');
      g.on('pointerenter focus',()=>say(describe(r))).on('click',()=>onMonth?.(r.date.slice(0,7)));
      g.on('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onMonth?.(r.date.slice(0,7));}});
    });
    say(describe(rows.at(-1)));
  }
  function formal(element,data,mode='counts') {
    const points=data.points, percent=mode==='coverage';
    const f=frame(element,percent?'Share of resolved problems with solutions in Lean':'Resolved problems and how many have solutions in Lean',[points[0].date,points.at(-1).date]);
    const {svg,x,y}=f;
    y.domain([0,percent?100:d3.max(points,p=>p.resolved)||1]).nice();
    axes(f, false, percent ? v => `${v}%` : null);
    if(percent) {
      svg.append('path').datum(points).attr('d',d3.area().x(p=>x(date(p.date))).y0(y(0)).y1(p=>y(p.resolved?p.resolved_lean/p.resolved*100:0)).curve(d3.curveStepAfter)).attr('fill','#298761').attr('opacity',.12);
      svg.append('path').datum(points).attr('d',d3.line().x(p=>x(date(p.date))).y(p=>y(p.resolved?p.resolved_lean/p.resolved*100:0)).curve(d3.curveStepAfter)).attr('fill','none').attr('stroke','#298761').attr('stroke-width',2.5);
    } else {
      svg.append('path').datum(points).attr('d',d3.area().x(p=>x(date(p.date))).y0(p=>y(p.resolved_lean)).y1(p=>y(p.resolved)).curve(d3.curveStepAfter)).attr('fill','#3977bd').attr('opacity',.1);
      for(const [key,color] of [['resolved','#3977bd'],['resolved_lean','#298761']]) svg.append('path').datum(points).attr('d',d3.line().x(p=>x(date(p.date))).y(p=>y(p[key])).curve(d3.curveStepAfter)).attr('fill','none').attr('stroke',color).attr('stroke-width',2.5);
    }
    inspect(f,points,p=>`${label(p.date)} · ${format(p.resolved)} resolved · ${format(p.resolved_lean)} of those in Lean (${p.resolved?(100*p.resolved_lean/p.resolved).toFixed(1)+'%':'—'}) · ${format(p.resolved-p.resolved_lean)} without Lean formalization`);
  }
  root.ErdosTrendCharts={pace,cumulative,composition,formal,copy,paceText,colors};
})(typeof window==='undefined'?globalThis:window);
