(() => {
  'use strict';
  const $=selector=>document.querySelector(selector), T=window.ErdosTrends, C=window.ErdosTrendCharts;
  const releases=JSON.parse($('#model-releases').textContent);
  const definitions={resolved:'“Resolved” includes proved, disproved, and otherwise solved',lean:'Solutions formalized in Lean, including problems still listed as unresolved',statements:'Problem statements written in Lean (not necessarily solved)'};
  const format=date=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(T.time(date)));
  let data=null, resizeFrame=null, previewPoint=null, evidenceDate=null, userPickedWindow=false;
  let catalog=null;
  const sourcePicker=$('#problem-source'), rollups=new Map();
  const metric=()=>$('#trend-metric').value;
  const days=()=>Number($('#pace-window').value);
  const showAllReleases=()=>$('#pace-releases')?.value==='all';

  function getRollup(selection) {
    if (!rollups.has(selection)) rollups.set(selection, T.rollup(catalog, selection));
    return rollups.get(selection);
  }

  function renderSummary() {
    const first=data.points[0],last=data.points.at(-1);
    const number=value=>value.toLocaleString('en-US');
    const signed=value=>(value>=0?'+':'')+number(value);
    const percent=(part,total)=>total?(part/total*100).toFixed(1)+'%':'—';
    const strong=text=>{const el=document.createElement('strong');el.textContent=text;return el;};
    const changes=data.intervals.map(i=>i.changes.resolved);
    const gains=changes.flatMap(change=>change.gained);
    const count=kind=>changes.reduce((sum,change)=>sum+(change[kind]?.length||0),0);
    const imported=count('baseline');
    const unmatched=changes.reduce((sum,change)=>sum+change.unmatched,0);
    const backlog=last.resolved-last.resolved_lean,oldBacklog=first.resolved-first.resolved_lean;
    const summary=[
      [number(last.resolved),`${signed(last.resolved-first.resolved)} since the first snapshot`],
      [number(gains.length),`${number(new Set(gains).size)} distinct problems since start`],
      [percent(last.resolved_lean,last.resolved),`${percent(first.resolved_lean,first.resolved)} in the first snapshot`],
      [number(backlog),`${number(Math.abs(backlog-oldBacklog))} ${backlog<oldBacklog?'fewer':'more'} than in the first snapshot`]
    ];
    document.querySelectorAll('.trend-stats article').forEach((article,i)=>{
      article.querySelector('strong').textContent=summary[i][0];
      article.querySelector('p').textContent=summary[i][1];
    });
    document.querySelectorAll('.view-meta time').forEach((el,i)=>{
      el.dateTime=[first,last][i].date;el.textContent=format(el.dateTime);
    });
    const change=last.total-first.total;
    $('.trend-finding').replaceChildren('Resolved share ',
      strong(`${percent(first.resolved,first.total)} to ${percent(last.resolved,last.total)}`),
      `. ${change===0 ? `The database held ${number(last.total)} problems` : `The database ${change>0?'grew':'shrank'} by ${number(Math.abs(change))} problems`}; unresolved problems went from ${number(first.total-first.resolved)} to ${number(last.total-last.resolved)}.`);
    $('.count-reconciliation').replaceChildren(strong(number(first.resolved)),
      ` initially resolved + ${number(gains.length)} changes to resolved + ${number(count('added'))} added as already resolved`,
      imported?` + ${number(imported)} from later catalog baselines`:'',
      ` − ${number(count('lost'))} changes back to unresolved − ${number(count('removed'))} removed from the database`,
      unmatched?` ${signed(unmatched)} unmatched changes`:'',
      ' = ',strong(number(last.resolved)),' currently resolved. New database entries can describe old results.');
  }
  function appendRevisions(element, interval, number) {
    const revisions=T.evidence(interval,metric(),number);
    // Legacy exported history has a single source and stores the revisions on the interval.
    const links=interval.revisions?revisions:[{...interval,repository:data.repository}];
    for(const [index,revision] of links.entries()) {
      if(!revision.repository) continue;
      const link=document.createElement('a');
      if(revision.baseline) {
        link.href=`${revision.repository}/commit/${revision.after}`;
        link.textContent=`${revision.label} baseline ↗`;
      } else {
        link.href=`${revision.repository}/compare/${revision.before}...${revision.after}`;
        link.textContent=sourcePicker?.value==='combined'&&revision.label?`${revision.label} revisions ↗`:'View revisions ↗';
      }
      if(index) element.append(' · ');
      element.append(link);
    }
  }
  function goToRecords() {
    $('#problem-changes').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    $('#changes-title').focus({preventScroll:true});
  }
  function showPoint(point) {
    evidenceDate=point.date;
    $('#records-selected').hidden=false;
    $('#records-month').value='selected';
    renderRecords();
    renderPace();
    goToRecords();
  }
  function renderPace() {
    const length=days();
    $('#records-recent').textContent=`Latest ${length}-day window`;
    previewPoint=null;
    $('#show-pace-changes').disabled=true;
    for(const [key,text] of Object.entries(C.paceText(metric(),length))) {
      const el = $('#pace-'+key);
      if (el) el.textContent=text;
    }
    C.pace($('#pace'),data,metric(),length,releases,$('#compare-release').value,id=> {
      $('#compare-release').value=id; renderPace(); renderWindow();
      $('#release-comparison').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
      $('#compare-release').focus({preventScroll:true});
    },{
      selectedDate:$('#records-month').value==='selected'?evidenceDate:null,
      onPreview:point=>{previewPoint=point;$('#show-pace-changes').disabled=false;},
      onSelect:showPoint
    },{ showAllReleases: showAllReleases() });
  }
  function renderCumulative() {
    const el = $('#cumulative');
    if (!el) return;
    const mode = $('#cumulative-mode')?.value || 'counts';
    const m = metric();
    const sel = sourcePicker?.value || 'bloom-tao';
    const primaryColor = C.colors[m] || '#3977bd';
    let overlay = null;
    const multiSource = catalog && catalog.sources.length > 1 && m !== 'statements';
    if (multiSource && sel === 'bloom-tao') {
      overlay = {
        primaryLabel: 'Bloom–Tao',
        label: 'Combined (union)',
        color: '#74559d',
        bandColor: '#8873b7',
        dashed: true,
        points: getRollup('combined').points
      };
    } else if (multiSource && sel === 'combined') {
      overlay = {
        primaryLabel: 'Combined',
        label: 'Bloom–Tao only',
        color: '#6b7f99',
        bandColor: '#8873b7',
        dashed: true,
        points: getRollup('bloom-tao').points
      };
    }
    C.cumulative(el, data, m, mode, overlay);
    const title = $('#cumulative-title');
    if (title) title.textContent = C.copy[m].cumulativeTitle;
    const desc = $('#cumulative-description');
    if (desc) {
      desc.textContent = overlay
        ? (mode === 'share'
          ? `Share of all problems with ${C.copy[m].scope} over time; shaded band shows the catalog gap between Bloom–Tao and Combined.`
          : `Total ${C.copy[m].plural} over time; shaded band shows the catalog gap between Bloom–Tao and Combined.`)
        : (mode === 'share'
          ? `Share of all problems with ${C.copy[m].scope} over time.`
          : `Total ${C.copy[m].plural} over time in the selected catalog.`);
    }
    const legend = $('#cumulative-legend');
    if (legend) {
      const primaryLabel = sel === 'combined' ? 'Combined (union)' : (catalog?.sources.find(s => s.id === sel)?.label || 'Bloom–Tao');
      const items = [{ label: primaryLabel, color: primaryColor, dashed: false }];
      if (overlay) items.push({ label: overlay.label, color: overlay.color, dashed: true });
      legend.replaceChildren(...items.map(item => {
        const span = document.createElement('span');
        const swatch = document.createElement('i');
        swatch.style.setProperty('--key', item.color);
        if (item.dashed) swatch.className = 'dashed';
        span.append(swatch, item.label);
        return span;
      }));
    }
  }
  function renderComposition() {
    C.composition($('#composition'),data,metric(),month=>{
      $('#records-month').value=month; renderRecords(); renderPace(); goToRecords();
    });
  }
  function renderFormal() {
    const mode=$('#formal-mode').value;
    C.formal($('#formal'),data,mode);
    $('#formal-total-key').hidden=mode==='coverage';
    $('#formal-description').textContent=mode==='coverage' ? 'Share of resolved problems with a Lean solution at each date.' : 'Shaded area shows resolved problems without a recorded Lean proof.';
  }
  function renderWindow() {
    // Older cached HTML may predate the uncertainty explanation.
    if(!$('#window-uncertainty')) {
      const details=document.createElement('details'),summary=document.createElement('summary');
      const explanation=document.createElement('p'),list=document.createElement('ul');
      details.id='window-uncertainty';details.className='window-uncertainty';
      summary.textContent='Boundary intervals';
      explanation.textContent='The lower count includes changes whose whole snapshot interval is inside the window. The upper count also includes changes that could fall on either side of a boundary. The same uncertain changes may appear in both ranges; do not add the upper counts.';
      list.id='window-intervals';details.append(summary,explanation,list);
      $('#window-verdict').after(details);
    }
    $('#after-rate').previousElementSibling.textContent='Release day + 29 days';
    $('#release-comparison .chart-note').textContent='Windows use UTC dates, not launch times. Captured snapshot transitions only; nearby release windows overlap.';
    const release=releases.find(r=>r.id===$('#compare-release').value);
    const result=T.releaseWindow(data,release.date,metric());
    const source=document.createElement('a'); source.href=release.source; source.textContent=`${format(release.date)} · ${release.kind} ↗`;
    $('#release-source').replaceChildren(source);
    if(release.note) { const note=document.createElement('a'); note.href=release.note_source; note.textContent=release.note; $('#release-source').append(' · ',note); }
    for(const side of ['before','after']) {
      const w=result[side];
      const count=w.uncertain?`${w.count}–${w.possible}`:String(w.count);
      const bounded=w.complete && !result.coverageChanged && w.uncertain;
      $(`#${side}-rate`).textContent=!w.complete?'Incomplete':result.coverageChanged?'Coverage changed':bounded?`${w.minRate.toFixed(2)}–${w.maxRate.toFixed(2)}/day`:`${w.rate.toFixed(2)}/day`;
      $(`#${side}-count`).textContent=`${count} observed ${C.copy[metric()][count === '1' ? 'countedSingular' : 'counted']}${w.complete?'':' in available history'}`;
      $(`#${side}-range`).textContent=`${format(w.start)}–${format(T.iso(T.time(w.end)-T.DAY))}`;
    }
    const intervals=result.uncertainIntervals;
    const uncertainty = $('#window-uncertainty');
    uncertainty.hidden=!intervals.length;
    const summaryEl = uncertainty.querySelector('summary');
    if (summaryEl) summaryEl.textContent = intervals.length ? `Boundary intervals (${intervals.length})` : 'Boundary intervals';
    $('#window-intervals').replaceChildren(...intervals.map(interval=>{
      const row=document.createElement('li');
      const count=interval.uncertain_ids.length;
      const boundaries=[[result.before.start,'start of the before window'],[release.date,'release date'],[result.after.end,'end of the after window']]
        .filter(([date])=>interval.start<date&&interval.end>=date).map(([,label])=>label);
      row.append(`${format(interval.start)}–${format(interval.end)}: ${count} observed ${count===1?'change':'changes'} in an interval spanning the ${boundaries.join(', ')}. `);
      appendRevisions(row,interval);return row;
    }));
    const a=result.before,b=result.after;
    let verdict;
    if (!a.complete || !b.complete) {
      verdict = 'Not enough history for a full 30 days on both sides.';
    } else if (result.coverageChanged) {
      verdict = 'A catalog joined during these windows, so the rates cover different source histories.';
    } else if (intervals.length) {
      const aSpan = a.uncertain ? `${a.count}–${a.possible}` : String(a.count);
      const bSpan = b.uncertain ? `${b.count}–${b.possible}` : String(b.count);
      if (b.count > a.possible) {
        verdict = `Higher after release (${bSpan} vs ${aSpan} observed changes); snapshot boundaries prevent an exact multiplier.`;
      } else if (a.count > b.possible) {
        verdict = `Lower after release (${bSpan} vs ${aSpan} observed changes); snapshot boundaries prevent an exact multiplier.`;
      } else {
        verdict = `Boundary-spanning snapshots overlap both windows (${aSpan} before vs ${bSpan} after); no exact multiplier is shown.`;
      }
    } else if (a.count === b.count) {
      verdict = `The same number of observed changes before and after the release date (${a.count}).`;
    } else if (a.count === 0) {
      verdict = `No observed changes in the 30 days before the release date; ${b.count} in the 30 days from it.`;
    } else {
      verdict = `${(b.count/a.count).toFixed(2)}× as many observed changes in the 30 days from the release date (${b.count} vs ${a.count}).`;
    }
    $('#window-verdict').textContent = verdict;
  }
  function renderRecords() {
    const period=$('#records-month').value;
    let events=[], scope='', unmatched=0;
    if(period==='recent'||period==='selected') {
      const series=T.rolling(data,metric(),days());
      const point=(period==='selected'&&series.find(p=>p.date===evidenceDate))||series.at(-1);
      if(point) {
        events=T.events(data,metric(),point,['gained']);
        scope=`${C.copy[metric()].counted[0].toUpperCase()+C.copy[metric()].counted.slice(1)} between the snapshots on ${format(point.start)} and ${format(point.date)} (${point.days} days)`;
        if(period==='selected') {
          evidenceDate=point.date;
          $('#records-selected').textContent=`${format(point.date)} · ${point.days} days`;
        }
      } else scope='Not enough history for this window';
    } else {
      events=T.events(data,metric(),period);
      unmatched=data.intervals.filter(i=>i.end.startsWith(period)).reduce((sum,i)=>sum+i.changes[metric()].unmatched,0);
      const month=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(T.time(period+'-01')));
      scope=`All changes to ${C.copy[metric()].scope} in ${month}, including database additions and removals`;
    }
    const rows=events.map(event=>{
      const tr=document.createElement('tr');
      const start=T.evidence(event,metric(),event.number).map(revision=>revision.start).sort()[0]||event.start;
      const change=event.kind==='baseline'?'From catalog baseline':C.copy[metric()].changes[event.kind]||'Removed from database';
      const values=[event.number,event.end,change,event.kind==='baseline'?event.end:`${start} → ${event.end}`,''];
      values.forEach((value,i)=>{
        const td=document.createElement(i===0?'th':'td');
        if(i===0) td.scope='row';
        if(i===0) {
          const link=document.createElement('a');
          link.href=`https://www.erdosproblems.com/${event.number}`;
          link.textContent=`#${value}`; td.append(link);
        } else if(i===4) appendRevisions(td,event,event.number);
        else td.textContent=value;
        tr.append(td);
      });
      return tr;
    });
    if(!rows.length) { const tr=document.createElement('tr'),td=document.createElement('td'); td.colSpan=5;td.textContent='No changes in this period';tr.append(td);rows.push(tr); }
    $('#record-rows').replaceChildren(...rows);
    const distinct=new Set(events.map(e=>e.number)).size;
    $('#records-count').textContent=`${events.length} ${events.length===1?'change':'changes'} across ${distinct} distinct ${distinct===1?'problem':'problems'}${unmatched?` · ${unmatched>0?'+':''}${unmatched} unmatched`:''}`;
    $('#records-scope').textContent=scope;
  }
  function renderMonths() {
    const rows=T.monthly(data,metric());
    const showImports=rows.some(row=>row.baseline);
    document.querySelectorAll('[data-baseline-key]').forEach(el=>el.hidden=!showImports);
    const select=$('#records-month'),selected=select.value;
    select.replaceChildren($('#records-recent'),$('#records-selected'),...rows.map(row=>{
      const option=document.createElement('option');
      option.value=row.date.slice(0,7);option.textContent=option.value;return option;
    }));
    select.value=selected;
    if(!select.value) select.value='recent';
    $('#monthly-rows').replaceChildren(...rows.map(row=> {
      const tr=document.createElement('tr');
      [row.date.slice(0,7)+(row.partial?' (partial)':''),row.gained,row.added,...(showImports?[row.baseline]:[]),row.lost,row.removed,row.unmatched,(row.net>=0?'+':'')+row.net].forEach((value,i)=> {
        const cell=document.createElement(i===0?'th':'td'); if(i===0) cell.scope='row'; cell.textContent=value; tr.append(cell);
      });
      return tr;
    }));
  }
  function renderAll() {
    if(!data) return;
    const sources=catalog ? T.catalogSources(catalog,sourcePicker.value) : [];
    let definition=definitions[metric()];
    if(metric()==='statements'&&sources.length>1) {
      definition=`Lean statement coverage · ${sources.filter(source=>source.metrics.includes('statements')).map(source=>source.label).join(', ')}`;
    } else if(metric()==='resolved'&&sources.some(source=>source.resolved_statuses.includes('independent'))) {
      definition='“Resolved” includes proved, disproved, otherwise solved, and accepted independence results';
    }
    $('#metric-definition').textContent=definition;
    const copy=C.copy[metric()];
    $('#composition-description').textContent=copy.monthly;
    $('#release-description').textContent=copy.release;
    document.querySelectorAll('[data-change-label]').forEach(el=>el.textContent=copy.changes[el.dataset.changeLabel]);
    renderMonths(); renderPace(); renderCumulative(); renderComposition(); renderRecords(); renderWindow();
    renderFormal();
  }
  function selectSource() {
    const selection=sourcePicker.value;
    data=getRollup(selection);
    const spanDays = (T.time(data.points.at(-1).date) - T.time(data.points[0].date)) / T.DAY;
    if (!userPickedWindow) {
      $('#pace-window').value = spanDays < 60 ? '7' : '30';
    }
    const sources=T.catalogSources(catalog,selection), metricSelect=$('#trend-metric');
    for(const option of metricSelect.options) option.disabled=!Object.hasOwn(data.coverage,option.value);
    if(metricSelect.selectedOptions[0]?.disabled) metricSelect.value=[...metricSelect.options].find(option=>!option.disabled).value;
    $('#records-month').value='recent'; evidenceDate=null;
    $('#records-selected').hidden=true;
    $('#compare-release').value=T.defaultRelease(data,releases);
    const note=$('#trend-source-note');
    note.hidden=sources.length===1&&sources[0].metrics.includes('statements');
    note.textContent=sources.length>1 ? 'Combined merges catalogs by problem number. Later catalogs join at their first snapshot; their opening balances appear separately from Pace.' :
      'Plasma does not report Lean statement coverage.';
    renderSummary(); renderAll();
    window.renderErdosSourceComparison?.(catalog,sources,data.points.at(-1));
  }
  $('#trend-metric').addEventListener('change',renderAll);
  $('#pace-window').addEventListener('change',()=>{userPickedWindow=true;if(data){$('#records-month').value='recent';evidenceDate=null;$('#records-selected').hidden=true;renderPace();renderRecords();}});
  $('#pace-releases')?.addEventListener('change',()=>{if(data)renderPace();});
  $('#cumulative-mode')?.addEventListener('change',()=>{if(data)renderCumulative();});
  $('#formal-mode').addEventListener('change',()=>{if(data)renderFormal();});
  $('#records-month').addEventListener('change',()=>{if(data){renderRecords();renderPace();}});
  $('#compare-release').addEventListener('change',()=>{if(data){renderPace();renderWindow();}});
  $('#show-pace-changes').addEventListener('click',()=>{if(previewPoint)showPoint(previewPoint);});
  sourcePicker?.addEventListener('change',selectSource);
  const revealMethodology=()=>{if(location.hash==='#methodology')$('#methodology').open=true;};
  window.addEventListener('hashchange',revealMethodology);
  document.querySelectorAll('a[href="#methodology"]').forEach(link=>link.addEventListener('click',()=>{$('#methodology').open=true;}));
  revealMethodology();
  async function load() {
    $('#retry-trends').hidden=true;
    try {
      if(!T||!C) throw Error('Chart scripts unavailable');
      const read=async path=>{
        const response=await fetch(path,{cache:'no-cache',signal:AbortSignal.timeout(15000)});
        if(!response.ok) throw Error('Trends unavailable');
        return response.json();
      };
      // The legacy export also supports an older checkout without problems.json.
      const payload=sourcePicker ? await read('../problems.json').catch(()=>read('../insights.json')) : await read('../insights.json');
      if(sourcePicker&&payload.schema_version===T.catalogVersion) {
        catalog=payload;
        window.populateErdosSourcePicker(sourcePicker,catalog.sources);
        selectSource();
      } else {
        data=T.validate(payload.schema_version===1?payload:await read('../insights.json'));
        renderSummary(); renderAll();
      }
      document.querySelectorAll('select').forEach(el=>{if(el!==sourcePicker||catalog)el.disabled=false;});
      $('#trends-message').hidden=true;
    } catch(error) {
      $('#trends-message').hidden=false;
      $('#trends-message').textContent='Interactive charts could not load. The saved charts and monthly totals are still available.';
      $('#retry-trends').hidden=false;
    }
  }
  $('#retry-trends').addEventListener('click',load);
  if('ResizeObserver' in window) {
    let lastWidth=0;
    new ResizeObserver(entries=> {
      const width=Math.round(entries[0].contentRect.width);
      if(width===lastWidth) return; lastWidth=width;
      if(resizeFrame!==null) cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>{if(data){renderPace();renderCumulative();renderComposition();renderFormal();}resizeFrame=null;});
    }).observe($('.trends-grid'));
  }
  load();
})();
