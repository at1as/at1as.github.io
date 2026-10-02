(() => {
  'use strict';
  const $=selector=>document.querySelector(selector), T=window.ErdosTrends, C=window.ErdosTrendCharts;
  const releases=JSON.parse($('#model-releases').textContent);
  const definitions={resolved:'“Resolved” includes proved, disproved, and otherwise solved',lean:'Solutions formalized in Lean, including problems still listed as unresolved',statements:'Problem statements written in Lean. This does not mean they are solved.'};
  const format=date=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(T.time(date)));
  let data=null, resizeFrame=null, previewPoint=null, evidenceDate=null;
  const metric=()=>$('#trend-metric').value;
  const days=()=>Number($('#pace-window').value);
  function renderSummary() {
    const first=data.points[0],last=data.points.at(-1);
    const number=value=>value.toLocaleString('en-US');
    const signed=value=>(value>=0?'+':'')+number(value);
    const percent=(part,total)=>(part/total*100).toFixed(1)+'%';
    const strong=text=>{const el=document.createElement('strong');el.textContent=text;return el;};
    const changes=data.intervals.map(i=>i.changes.resolved);
    const gains=changes.flatMap(change=>change.gained);
    const count=kind=>changes.reduce((sum,change)=>sum+change[kind].length,0);
    const unmatched=changes.reduce((sum,change)=>sum+change.unmatched,0);
    const backlog=last.resolved-last.resolved_lean,oldBacklog=first.resolved-first.resolved_lean;
    const summary=[
      [number(last.resolved),`${signed(last.resolved-first.resolved)} since the first snapshot`],
      [number(gains.length),`${number(new Set(gains).size)} distinct problems since start`],
      [percent(last.resolved_lean,last.resolved),`Up from ${percent(first.resolved_lean,first.resolved)} of resolved problems`],
      [number(backlog),`${number(Math.abs(backlog-oldBacklog))} ${backlog<oldBacklog?'fewer':'more'} than in the first snapshot`]
    ];
    document.querySelectorAll('.trend-stats article').forEach((article,i)=>{
      article.querySelector('strong').textContent=summary[i][0];
      article.querySelector('p').textContent=summary[i][1];
    });
    document.querySelectorAll('.view-meta time').forEach((el,i)=>{
      el.dateTime=[first,last][i].date;el.textContent=format(el.dateTime);
    });
    $('.trend-finding').replaceChildren('The resolved share rose from ',
      strong(`${percent(first.resolved,first.total)} to ${percent(last.resolved,last.total)}`),
      `. The database grew by ${number(last.total-first.total)} problems; unresolved problems went from ${number(first.total-first.resolved)} to ${number(last.total-last.resolved)}.`);
    $('.count-reconciliation').replaceChildren(strong(number(first.resolved)),
      ` initially resolved + ${number(gains.length)} changes to resolved + ${number(count('added'))} added as already resolved − ${number(count('lost'))} changes back to unresolved − ${number(count('removed'))} removed from the database`,
      unmatched?` ${signed(unmatched)} unmatched changes`:'',
      ' = ',strong(number(last.resolved)),' currently resolved. New database entries can describe old results.');
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
    for(const [key,text] of Object.entries(C.paceText(metric(),length))) $('#pace-'+key).textContent=text;
    C.pace($('#pace'),data,metric(),length,releases,$('#compare-release').value,id=> {
      $('#compare-release').value=id; renderPace(); renderWindow();
      $('#release-comparison').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
      $('#compare-release').focus({preventScroll:true});
    },{
      selectedDate:$('#records-month').value==='selected'?evidenceDate:null,
      onPreview:point=>{previewPoint=point;$('#show-pace-changes').disabled=false;},
      onSelect:showPoint
    });
    $('#pace').setAttribute('aria-describedby','pace-interaction');
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
    $('#formal-description').textContent=mode==='coverage' ? 'Share of resolved problems with a Lean solution at each date' : 'The shaded gap shows resolved problems with no Lean solution recorded';
  }
  function renderWindow() {
    // Older cached HTML may predate the uncertainty explanation.
    if(!$('#window-uncertainty')) {
      const details=document.createElement('details'),summary=document.createElement('summary');
      const explanation=document.createElement('p'),list=document.createElement('ul');
      details.id='window-uncertainty';details.className='window-uncertainty';
      summary.textContent='Why timing is uncertain';
      explanation.textContent='The lower count includes changes whose whole snapshot interval is inside the window. The upper count also includes changes that could fall on either side of a boundary. The same uncertain changes may appear in both ranges; do not add the upper counts.';
      list.id='window-intervals';details.append(summary,explanation,list);
      $('#window-verdict').after(details);
    }
    $('#after-rate').previousElementSibling.textContent='Release day + 29 days';
    $('#release-comparison .chart-note').textContent='Windows use UTC dates, not launch times. Ranges cover only changes captured between saved snapshots; missed changes are not estimated. Nearby release windows can overlap.';
    const release=releases.find(r=>r.id===$('#compare-release').value);
    const result=T.releaseWindow(data,release.date,metric());
    const source=document.createElement('a'); source.href=release.source; source.textContent=`${format(release.date)} · ${release.kind} ↗`;
    $('#release-source').replaceChildren(source);
    if(release.note) { const note=document.createElement('a'); note.href=release.note_source; note.textContent=release.note; $('#release-source').append(' · ',note); }
    for(const side of ['before','after']) {
      const window=result[side];
      const count=window.uncertain?`${window.count}–${window.possible}`:String(window.count);
      $(`#${side}-rate`).textContent=!window.complete?'Incomplete':window.uncertain?'Uncertain':`${window.rate.toFixed(2)}/day`;
      $(`#${side}-count`).textContent=`${count} observed ${C.copy[metric()].counted}${window.complete?'':' in available history'}`;
      $(`#${side}-range`).textContent=`${format(window.start)}–${format(T.iso(T.time(window.end)-T.DAY))}`;
    }
    const intervals=result.uncertainIntervals;
    $('#window-uncertainty').hidden=!intervals.length;
    $('#window-intervals').replaceChildren(...intervals.map(interval=>{
      const row=document.createElement('li'),link=document.createElement('a');
      const count=interval.changes[metric()].gained.length;
      const boundaries=[[result.before.start,'start of the before window'],[release.date,'release date'],[result.after.end,'end of the after window']]
        .filter(([date])=>interval.start<date&&interval.end>=date).map(([,label])=>label);
      row.append(`${format(interval.start)}–${format(interval.end)}: ${count} observed ${count===1?'change':'changes'} in an interval spanning the ${boundaries.join(', ')}. `);
      link.href=`https://github.com/teorth/erdosproblems/compare/${interval.before}...${interval.after}`;
      link.textContent='View revisions ↗';row.append(link);return row;
    }));
    const a=result.before,b=result.after;
    $('#window-verdict').textContent= !a.complete||!b.complete ? 'Not enough history for a full 30 days on both sides' :
      intervals.length ? 'The snapshots cannot place every observed change inside or outside these windows. No exact rate or multiplier is shown for uncertain timing.' :
      a.count===b.count ? `The same number of observed changes before and after the release date (${a.count})` :
      a.count===0 ? `No observed changes in the 30 days before the release date; ${b.count} in the 30 days from it` :
      `${(b.count/a.count).toFixed(2)}× as many observed changes in the 30 days from the release date (${b.count} vs ${a.count})`;
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
      const values=[event.number,event.end,C.copy[metric()].changes[event.kind]||'Removed from database',`${event.start} → ${event.end}`,'View revisions ↗'];
      values.forEach((value,i)=>{
        const td=document.createElement(i===0?'th':'td');
        if(i===0) td.scope='row';
        if(i===0||i===4) {
          const link=document.createElement('a');
          link.href=i===0?`https://www.erdosproblems.com/${event.number}`:`https://github.com/teorth/erdosproblems/compare/${event.before}...${event.after}`;
          link.textContent=i===0?`#${value}`:value; td.append(link);
        } else td.textContent=value;
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
    const select=$('#records-month'),selected=select.value;
    select.replaceChildren($('#records-recent'),$('#records-selected'),...rows.map(row=>{
      const option=document.createElement('option');
      option.value=row.date.slice(0,7);option.textContent=option.value;return option;
    }));
    select.value=selected;
    if(!select.value) select.value='recent';
    $('#monthly-rows').replaceChildren(...rows.map(row=> {
      const tr=document.createElement('tr');
      [row.date.slice(0,7)+(row.partial?' (partial)':''),row.gained,row.added,row.lost,row.removed,row.unmatched,(row.net>=0?'+':'')+row.net].forEach((value,i)=> {
        const cell=document.createElement(i===0?'th':'td'); if(i===0) cell.scope='row'; cell.textContent=value; tr.append(cell);
      });
      return tr;
    }));
  }
  function renderAll() {
    if(!data) return;
    $('#metric-definition').textContent=definitions[metric()];
    const copy=C.copy[metric()];
    $('#composition-description').textContent=copy.monthly;
    $('#release-description').textContent=copy.release;
    document.querySelectorAll('[data-change-label]').forEach(el=>el.textContent=copy.changes[el.dataset.changeLabel]);
    renderMonths(); renderPace(); renderComposition(); renderRecords(); renderWindow();
    renderFormal();
  }
  $('#trend-metric').addEventListener('change',renderAll);
  $('#pace-window').addEventListener('change',()=>{if(data){$('#records-month').value='recent';evidenceDate=null;$('#records-selected').hidden=true;renderPace();renderRecords();}});
  $('#formal-mode').addEventListener('change',()=>{if(data)renderFormal();});
  $('#records-month').addEventListener('change',()=>{if(data){renderRecords();renderPace();}});
  $('#compare-release').addEventListener('change',()=>{if(data){renderPace();renderWindow();}});
  $('#show-pace-changes').addEventListener('click',()=>{if(previewPoint)showPoint(previewPoint);});
  const revealMethodology=()=>{if(location.hash==='#methodology')$('#methodology').open=true;};
  window.addEventListener('hashchange',revealMethodology);
  document.querySelectorAll('a[href="#methodology"]').forEach(link=>link.addEventListener('click',()=>{$('#methodology').open=true;}));
  revealMethodology();
  async function load() {
    $('#retry-trends').hidden=true;
    try {
      if(!T||!C) throw Error('Chart scripts unavailable');
      const response=await fetch('../insights.json',{cache:'no-cache',signal:AbortSignal.timeout(15000)});
      if(!response.ok) throw Error('Trends unavailable');
      data=T.validate(await response.json()); renderSummary(); renderAll();
      document.querySelectorAll('select').forEach(el=>el.disabled=false);
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
      const width=entries[0].contentRect.width;
      if(width===lastWidth) return; lastWidth=width;
      if(resizeFrame!==null) cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>{if(data){renderPace();renderComposition();renderFormal();}resizeFrame=null;});
    }).observe($('.trends-grid'));
  }
  load();
})();
