(() => {
  const section = document.getElementById('source-comparison');
  if (!section || section.hidden) return;

  const input = document.getElementById('source-problem-number');
  const filterBar = document.getElementById('source-comparison-filters');
  const intro = document.getElementById('source-comparison-intro');
  const count = document.getElementById('source-comparison-count');
  const headings = document.getElementById('source-column-labels');
  const body = document.getElementById('source-problem-rows');
  const dialog = document.getElementById('source-evidence-dialog');
  const numberFormat = new Intl.NumberFormat('en-US');
  const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
  const labels = {
    solved: 'Otherwise solved',
    independent: 'Independent of ZFC',
    not_provable: 'Not provable in ZFC',
    not_disprovable: 'Not disprovable in ZFC',
    claimed: 'Claimed (pending)'
  };
  const evidenceLabels = {
    lean_proof: 'Lean proof',
    paper: 'Paper',
    preprint: 'Preprint',
    claim: 'Catalog claim',
    verification_record: 'Verification record'
  };
  let sources = [], problems = [], activeFilter = 'resolved';

  const isResolved = (problem, source) => source.resolved_statuses.includes(problem.sources[source.id]?.status);
  const hasDisagreement = problem => new Set(sources.map(source => isResolved(problem, source))).size > 1;
  const hasClaimed = problem => sources.some(source => problem.sources[source.id]?.status === 'claimed');
  const hasLean = problem => sources.some(source => Boolean(problem.sources[source.id]?.lean_solution));

  function cell(tag, value, scope) {
    const el = document.createElement(tag);
    el.append(value);
    if (scope) el.scope = scope;
    return el;
  }

  function link(href, label) {
    if (typeof href !== 'string' || !/^https?:\/\//.test(href)) return label;
    const el = document.createElement('a');
    el.href = href;
    el.textContent = label;
    return el;
  }

  function resultCell(result, source, number) {
    if (!result) return cell('td', 'No source record');
    const status = result.status;
    const label = labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    const url = source.problem_url?.replace('{number}', number) || source.url;
    const td = cell('td', link(url, label));
    if (status === 'claimed') td.classList.add('status-claimed');
    const evidence = result.evidence || [];
    const fullLean = evidence.filter(item => item.kind === 'lean_proof' && item.scope === 'full' && item.verification?.includes('lean'));
    if (result.lean_solution) td.append(' · ', link((fullLean.find(item => item.revision) || fullLean[0])?.url, 'Lean'));
    const metadata = document.createElement('div');
    metadata.className = 'source-result-meta';
    const date = result.terminal_on || result.terminal_by;
    if (date) {
      const time = document.createElement('time');
      time.className = 'source-resolution-date';
      time.dateTime = date;
      const revision = result.terminal_commit && `${source.repository}/commit/${result.terminal_commit}`;
      time.append(result.terminal_by ? '≤ ' : '', link(revision, dateFormat.format(new Date(date))));
      metadata.append(time);
    }
    if (evidence.length && dialog) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'source-evidence';
      button.textContent = 'Evidence';
      button.setAttribute('aria-label', `Evidence for problem ${number} in ${source.label}`);
      button.setAttribute('aria-haspopup', 'dialog');
      button.addEventListener('click', () => {
        document.getElementById('source-evidence-title').textContent = `#${number} · ${source.label} evidence`;
        const rows = evidence.map(item => {
          const row = document.createElement('li');
          const title = item.kind === 'lean_proof' && item.scope === 'unspecified' ? 'Lean contribution' :
            evidenceLabels[item.kind] || 'Source link';
          row.append(link(item.url, title), ` (${item.scope})`);
          if (item.record_url) row.append(' · ', link(item.record_url, 'Catalog claim'));
          return row;
        });
        document.getElementById('source-evidence-items').replaceChildren(...rows);
        dialog.showModal();
      });
      metadata.append(button);
    }
    if (metadata.childNodes.length) td.append(metadata);
    return td;
  }

  function buildFilters() {
    const defs = [
      { id: 'resolved', label: 'Resolved', match: p => sources.some(s => isResolved(p, s)) }
    ];
    if (sources.length > 1) {
      defs.push({ id: 'disagreements', label: 'Disagreements', match: hasDisagreement });
      const plasmaSource = sources.find(s => s.id === 'plasma');
      const bloomSource = sources.find(s => s.id === 'bloom-tao');
      if (plasmaSource && bloomSource) {
        defs.push({
          id: 'plasma-only',
          label: 'Plasma only',
          match: p => isResolved(p, plasmaSource) && !isResolved(p, bloomSource)
        });
      }
    }
    if (problems.some(hasClaimed)) {
      defs.push({ id: 'claimed', label: 'Pending claims', match: hasClaimed });
    }
    defs.push({ id: 'lean', label: 'Lean proofs', match: hasLean });
    return defs.map(def => ({ ...def, count: problems.filter(def.match).length }));
  }

  function renderFilterChips() {
    if (!filterBar) return;
    const defs = buildFilters();
    if (!defs.some(def => def.id === activeFilter)) activeFilter = 'resolved';
    filterBar.replaceChildren(...defs.map(def => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip';
      button.dataset.filter = def.id;
      button.setAttribute('aria-pressed', String(def.id === activeFilter));
      button.textContent = `${def.label} (${numberFormat.format(def.count)})`;
      button.addEventListener('click', () => {
        activeFilter = def.id;
        input.value = '';
        renderFilterChips();
        renderRows();
      });
      return button;
    }));
  }

  function renderRows() {
    const query = input.value.trim().replace(/^#/, '');
    const defs = buildFilters();
    const activeDef = defs.find(def => def.id === activeFilter) || defs[0];
    const rows = query
      ? problems.filter(problem => /^\d+$/.test(query) && problem.number === Number(query))
      : problems.filter(activeDef.match);
    const latest = problem => sources.map(source => {
      const record = problem.sources[source.id];
      return record?.terminal_on || record?.terminal_by || '';
    }).sort().at(-1);
    rows.sort((a, b) => Number(hasDisagreement(b)) - Number(hasDisagreement(a)) || latest(b).localeCompare(latest(a)) || a.number - b.number);
    body.replaceChildren(...rows.map(problem => {
      const tr = document.createElement('tr');
      tr.append(
        cell('th', link(`https://www.erdosproblems.com/${problem.number}`, `#${problem.number}`), 'row'),
        ...sources.map(source => resultCell(problem.sources[source.id], source, problem.number))
      );
      return tr;
    }));
    if (!rows.length) {
      const td = cell('td', query ? 'No problem matches this number.' : 'No problems match this filter.');
      td.colSpan = sources.length + 1;
      body.insertRow().append(td);
    }
  }

  window.renderErdosSourceComparison = (catalog, selected, latest) => {
    sources = selected;
    problems = catalog.problems;
    count.textContent = `${numberFormat.format(latest.resolved)} resolved · ${numberFormat.format(latest.resolved_lean)} with a Lean solution`;
    if (intro) {
      intro.textContent = sources.length > 1
        ? 'Compare both catalogs side by side, browse disagreements and pending claims, or look up any problem number.'
        : 'Filter problems or search by number to inspect status and proof links. Switch Source to Combined to compare catalogs side by side.';
    }
    headings.replaceChildren(cell('th', 'Problem', 'col'), ...sources.map(source => cell('th', source.label, 'col')));
    const revisions = document.getElementById('source-revisions');
    revisions.replaceChildren('Data revisions');
    for (const source of sources) {
      revisions.append(' · ', link(source.url, `${source.label} ${dateFormat.format(new Date(source.date))}`));
      if (source.license) revisions.append(' (', link(source.license, source.license_label), ')');
    }
    renderFilterChips();
    if (section.open) renderRows();
    else body.replaceChildren();
    document.getElementById('source-comparison-controls').hidden = false;
    document.getElementById('source-comparison-table').hidden = false;
  };
  section.addEventListener('toggle', () => {
    if (section.open && problems.length) renderRows();
  });
  input.addEventListener('input', renderRows);
})();
