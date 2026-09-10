(() => {
  'use strict';
  const $=selector=>document.querySelector(selector), T=window.ErdosTrends, C=window.ErdosTrendCharts;
  const releases=JSON.parse($('#model-releases').textContent);
  const definitions={resolved:'“Resolved” includes proved, disproved, and otherwise solved.',lean:'Solutions formalized in Lean, including problems still listed as unresolved.',statements:'Problem statements written in Lean. This does not mean they are solved.'};
  const format=date=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(T.time(date)));
  let data=null, resizeFrame=null;
  const metric=()=>$('#trend-metric').value;
  function renderPace() {
    const days=Number($('#pace-window').value);
    for(const [key,text] of Object.entries(C.paceText(metric(),days))) $('#pace-'+key).textContent=text;
    C.pace($('#pace'),data,metric(),days,releases,$('#compare-release').value,id=> {
      $('#compare-release').value=id; renderPace(); renderWindow();
      $('#release-comparison').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
    });
  }
  function renderComposition() {
    C.composition($('#composition'),data,metric(),month=>{
      $('#records-month').value=month; renderRecords(); $('#problem-changes').open=true;
    });
  }
  function renderFormal() {
    const mode=$('#formal-mode').value;
    C.formal($('#formal'),data,mode);
    $('#formal-total-key').hidden=mode==='coverage';
    $('#formal-description').textContent=mode==='coverage' ? 'Share of resolved problems with a Lean solution at each date.' : 'The shaded gap shows resolved problems with no Lean solution recorded.';
  }
  function renderWindow() {
    const release=releases.find(r=>r.id===$('#compare-release').value);
    const result=T.releaseWindow(data,release.date,metric());
    const source=document.createElement('a'); source.href=release.source; source.textContent=`${format(release.date)} · ${release.kind} ↗`;
    $('#release-source').replaceChildren(source);
    if(release.note) { const note=document.createElement('a'); note.href=release.note_source; note.textContent=release.note; $('#release-source').append(' · ',note); }
    for(const side of ['before','after']) {
      const window=result[side];
      $(`#${side}-rate`).textContent=window.complete?`${window.rate.toFixed(2)}/day`:'Incomplete';
      $(`#${side}-count`).textContent=`${window.count} ${C.copy[metric()].counted}${window.complete?'':' in available snapshots'}`;
      $(`#${side}-range`).textContent=`${format(window.start)}–${format(T.iso(T.time(window.end)-T.DAY))}`;
    }
    const a=result.before,b=result.after;
    $('#window-verdict').textContent= !a.complete||!b.complete ? 'Not enough history for a full 30 days on both sides.' :
      a.count===b.count ? `The same number of changes before and after release (${a.count}).` :
      a.count===0 ? `No changes in the 30 days before release; ${b.count} in the 30 days after.` :
      `${(b.count/a.count).toFixed(2)}× as many changes after release (${b.count} vs ${a.count}).`;
  }
  function renderRecords() {
    const month=$('#records-month').value, events=T.events(data,metric(),month);
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
    if(!rows.length) { const tr=document.createElement('tr'),td=document.createElement('td'); td.colSpan=5;td.textContent='No changes this month.';tr.append(td);rows.push(tr); }
    $('#record-rows').replaceChildren(...rows);
    const unmatched=data.intervals.filter(i=>i.end.startsWith(month)).reduce((sum,i)=>sum+i.changes[metric()].unmatched,0);
    $('#records-count').textContent=`${events.length} ${events.length===1?'change':'changes'}${unmatched?` · ${unmatched>0?'+':''}${unmatched} unmatched`:''}`;
  }
  function renderMonths() {
    const rows=T.monthly(data,metric());
    $('#monthly-rows').replaceChildren(...rows.map(row=> {
      const tr=document.createElement('tr');
      [row.date.slice(0,7)+(row.partial?' (partial)':''),row.gained,row.added,row.lost,row.removed,row.unmatched,(row.net>=0?'+':'')+row.net].forEach((value,i)=> {
        const cell=document.createElement(i===0?'th':'td'); if(i===0) cell.scope='row'; cell.textContent=value; tr.append(cell);
      });
      return tr;
    }));
    $('#records-month').value=rows.reduce((a,b)=>b.gained>a.gained?b:a).date.slice(0,7);
  }
  function renderAll() {
    if(!data) return;
    $('#metric-definition').textContent=definitions[metric()];
    const copy=C.copy[metric()];
    $('#composition-description').textContent=copy.monthly;
    $('#release-description').textContent=copy.release;
    document.querySelectorAll('[data-change-label]').forEach(el=>el.textContent=copy.changes[el.dataset.changeLabel]);
    renderPace(); renderComposition(); renderMonths(); renderRecords(); renderWindow();
    renderFormal();
  }
  $('#trend-metric').addEventListener('change',renderAll);
  $('#pace-window').addEventListener('change',()=>{if(data)renderPace();});
  $('#formal-mode').addEventListener('change',()=>{if(data)renderFormal();});
  $('#records-month').addEventListener('change',()=>{if(data)renderRecords();});
  $('#compare-release').addEventListener('change',()=>{if(data){renderPace();renderWindow();}});
  async function load() {
    $('#retry-trends').hidden=true;
    try {
      if(!T||!C) throw Error('Chart scripts unavailable');
      const response=await fetch('../insights.json',{cache:'no-cache',signal:AbortSignal.timeout(15000)});
      if(!response.ok) throw Error('Trends unavailable');
      data=T.validate(await response.json()); renderAll();
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
