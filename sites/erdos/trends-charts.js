/* D3 7 renders the same SVG charts at build time and in the browser. */
((root) => {
  const d3 = root.d3, T = root.ErdosTrends;
  const colors = {resolved:'#3977bd', lean:'#298761', gained:'#3977bd', added:'#9fbfe3', lost:'#dd7b80', removed:'#a74559', unmatched:'#9b94ae'};
  const date = value => new Date(T.time(value));
  const label = value => d3.utcFormat('%b %-d, %Y')(date(value));
  const format = value => value.toLocaleString('en-US');
  function frame(element, title, domain, height=330) {
    const width = Math.max(340, Math.round(element.getBoundingClientRect().width) || 960);
    const margin = {top:38, right:20, bottom:38, left:52};
    const svg = d3.select(element).attr('viewBox', `0 0 ${width} ${height}`).attr('role','img').attr('aria-label',title).attr('tabindex',0);
    svg.selectAll('*').remove(); svg.append('title').text(title);
    const x = d3.scaleUtc().domain(domain.map(date)).range([margin.left,width-margin.right]);
    const y = d3.scaleLinear().range([height-margin.bottom,margin.top]);
    const readout = element.closest('.chart-card')?.querySelector('.chart-readout');
    const say = text => { if (readout) readout.textContent = text; };
    return {svg,x,y,width,height,margin,say};
  }
  function axes(f, categorical=false) {
    const {svg,x,y,width,height,margin} = f;
    svg.append('g').attr('class','chart-grid').attr('transform',`translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(width-margin.left-margin.right)).tickFormat('')).call(g=>g.select('.domain').remove());
    svg.append('g').attr('class','chart-axis').attr('transform',`translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10)).call(g=>g.select('.domain').remove());
    const axis = categorical ? d3.axisBottom(x).tickFormat(d=>d3.utcFormat('%b %y')(date(d))) : d3.axisBottom(x).ticks(width<600?4:8).tickFormat(d3.utcFormat('%b %y'));
    if (categorical && width<600) axis.tickValues(x.domain().filter((_,i)=>i%3===0));
    svg.append('g').attr('class','chart-axis').attr('transform',`translate(0,${height-margin.bottom})`).call(axis.tickSize(0).tickPadding(12));
  }
  function inspect(f, points, describe) {
    if (!points.length) return;
    const {svg,x,y,margin,width,height,say} = f;
    const guide = svg.append('line').attr('class','chart-crosshair').attr('y1',margin.top).attr('y2',height-margin.bottom).attr('visibility','hidden');
    let current = points.length-1;
    function show(i) {
      current = Math.max(0,Math.min(points.length-1,i));
      guide.attr('x1',x(date(points[current].date))).attr('x2',x(date(points[current].date))).attr('visibility','visible');
      say(describe(points[current]));
    }
    svg.append('rect').attr('x',margin.left).attr('y',margin.top).attr('width',width-margin.left-margin.right).attr('height',height-margin.top-margin.bottom)
      .attr('fill','transparent').on('pointermove',function(event) {
        const value = +x.invert(d3.pointer(event,svg.node())[0]);
        show(d3.bisector(p=>T.time(p.date)).center(points,value));
      }).on('pointerleave',()=>guide.attr('visibility','hidden'));
    svg.on('keydown',event=> {
      if (event.key==='ArrowLeft' || event.key==='ArrowRight') { event.preventDefault(); show(current+(event.key==='ArrowLeft'?-1:1)); }
      if (event.key==='Escape') guide.attr('visibility','hidden');
    });
    say(describe(points.at(-1)));
  }
  function pace(element,data,metric,days,releases,selected,onRelease) {
    const series = T.rolling(data,metric,days);
    const f = frame(element,'Rate of recorded state gains over time',[data.points[0].date,data.points.at(-1).date]);
    const {svg,x,y,margin,height,say} = f;
    y.domain([0,d3.max(series,p=>p.value)||1]).nice();
    data.intervals.filter(i=>i.days>7).forEach(i=>svg.append('rect').attr('class','gap-band').attr('x',x(date(i.start))).attr('width',x(date(i.end))-x(date(i.start))).attr('y',margin.top).attr('height',height-margin.top-margin.bottom));
    axes(f);
    const line = d3.line().x(p=>x(date(p.date))).y(p=>y(p.value)).curve(d3.curveStepAfter);
    svg.append('path').datum(series).attr('d',d3.area().x(p=>x(date(p.date))).y0(y(0)).y1(p=>y(p.value)).curve(d3.curveStepAfter)).attr('fill',colors[metric]||'#8f6ab3').attr('opacity',.09);
    svg.append('path').datum(series).attr('d',line).attr('fill','none').attr('stroke',colors[metric]||'#8f6ab3').attr('stroke-width',2.5);
    inspect(f,series,p=>`${label(p.date)} · ${p.value.toFixed(2)} gains/day · ${p.events} recorded changes over ${p.days} days (${label(p.start)}–${label(p.date)})`);
    releases.filter(r=>r.date>=data.points[0].date && r.date<=data.points.at(-1).date).forEach(r=> {
      const g=svg.append('g').attr('class','release-reference').attr('tabindex',0).attr('role','button').attr('aria-label',`${r.name}, ${label(r.date)}. Compare release windows.`);
      g.append('title').text(`${r.name} · ${label(r.date)}`);
      g.append('line').attr('x1',x(date(r.date))).attr('x2',x(date(r.date))).attr('y1',margin.top).attr('y2',height-margin.bottom).attr('stroke',r.id===selected?'#8062a7':'#aab5c5').attr('stroke-dasharray','4 5').attr('stroke-width',r.id===selected?2:1);
      g.append('line').attr('x1',x(date(r.date))).attr('x2',x(date(r.date))).attr('y1',margin.top).attr('y2',height-margin.bottom).attr('stroke','transparent').attr('stroke-width',10);
      if(r.id===selected) svg.append('text').attr('class','release-name').attr('x',Math.max(margin.left,Math.min(f.width-margin.right-130,x(date(r.date))))).attr('y',20).text(r.name.replace('Claude ','').split(' · ')[0]);
      g.on('pointerenter focus',()=>say(`${r.name} · ${label(r.date)} · ${r.kind}. Select to compare the surrounding weeks.`));
      g.on('click',()=>onRelease?.(r.id));
      g.on('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();onRelease?.(r.id);}});
    });
  }
  function composition(element,data,metric,onMonth) {
    const rows=T.monthly(data,metric), keys=['gained','added','lost','removed','unmatched'];
    const f=frame(element,'Monthly change: status gains, newly listed entries, losses and removals',[data.points[0].date,data.points.at(-1).date]);
    const {svg,y,width,height,margin,say}=f;
    const x=f.x=d3.scaleBand().domain(rows.map(r=>r.date)).range([margin.left,width-margin.right]).padding(.28);
    const stack=d3.stack().keys(keys).offset(d3.stackOffsetDiverging)(rows);
    y.domain([Math.min(0,d3.min(stack,s=>d3.min(s,p=>p[0]))),Math.max(1,d3.max(stack,s=>d3.max(s,p=>p[1])))]).nice();
    axes(f,true);
    svg.append('line').attr('x1',margin.left).attr('x2',width-margin.right).attr('y1',y(0)).attr('y2',y(0)).attr('stroke','#8494a9');
    const describe=r=>`${d3.utcFormat('%B %Y')(date(r.date))}${r.partial?' (partial month)':''} · ${r.gained} state gains + ${r.added} listed already qualifying − ${-r.lost} state losses − ${-r.removed} removals${r.unmatched?` + ${r.unmatched} unmatched`:''} = ${r.net>0?'+':''}${r.net} net`;
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
    const f=frame(element,percent?'Share of resolved problems with Lean formalizations':'Resolved problems and the Lean formalization backlog',[points[0].date,points.at(-1).date]);
    const {svg,x,y}=f;
    y.domain([0,percent?100:d3.max(points,p=>p.resolved)]).nice(); axes(f);
    if(percent) {
      svg.append('path').datum(points).attr('d',d3.area().x(p=>x(date(p.date))).y0(y(0)).y1(p=>y(p.resolved?p.resolved_lean/p.resolved*100:0)).curve(d3.curveStepAfter)).attr('fill','#298761').attr('opacity',.12);
      svg.append('path').datum(points).attr('d',d3.line().x(p=>x(date(p.date))).y(p=>y(p.resolved?p.resolved_lean/p.resolved*100:0)).curve(d3.curveStepAfter)).attr('fill','none').attr('stroke','#298761').attr('stroke-width',2.5);
    } else {
      svg.append('path').datum(points).attr('d',d3.area().x(p=>x(date(p.date))).y0(p=>y(p.resolved_lean)).y1(p=>y(p.resolved)).curve(d3.curveStepAfter)).attr('fill','#3977bd').attr('opacity',.1);
      for(const [key,color] of [['resolved','#3977bd'],['resolved_lean','#298761']]) svg.append('path').datum(points).attr('d',d3.line().x(p=>x(date(p.date))).y(p=>y(p[key])).curve(d3.curveStepAfter)).attr('fill','none').attr('stroke',color).attr('stroke-width',2.5);
    }
    inspect(f,points,p=>`${label(p.date)} · ${format(p.resolved)} resolved · ${format(p.resolved_lean)} of those in Lean (${(100*p.resolved_lean/p.resolved).toFixed(1)}%) · ${format(p.resolved-p.resolved_lean)} without Lean formalization`);
  }
  root.ErdosTrendCharts={pace,composition,formal};
})(typeof window==='undefined'?globalThis:window);
