(() => {
  const section = document.getElementById('source-comparison');
  if (!section || section.hidden) return;

  const input = document.getElementById('source-problem-number');
  const count = document.getElementById('source-comparison-count');
  const headings = document.getElementById('source-column-labels');
  const body = document.getElementById('source-problem-rows');
  const dialog = document.getElementById('source-evidence-dialog');
  const numberFormat = new Intl.NumberFormat('en-US');
  const dateFormat = new Intl.DateTimeFormat('en-US', {dateStyle: 'medium', timeZone: 'UTC'});
  const labels = {solved: 'Otherwise solved', independent: 'Independent of ZFC',
    not_provable: 'Not provable in ZFC', not_disprovable: 'Not disprovable in ZFC'};
  const evidenceLabels = {lean_proof: 'Lean proof', paper: 'Paper', preprint: 'Preprint',
    claim: 'Catalog claim', verification_record: 'Verification record'};
  let sources, problems;

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

  function renderRows() {
    const isResolved = (problem, source) => source.resolved_statuses.includes(problem.sources[source.id]?.status);
    const query = input.value.trim().replace(/^#/, '');
    const rows = query ? problems.filter(problem => /^\d+$/.test(query) && problem.number === Number(query)) :
      problems.filter(problem => sources.some(source => isResolved(problem, source)));
    const disagrees = problem => new Set(sources.map(source => isResolved(problem, source))).size > 1;
    const latest = problem => sources.map(source => {
      const record = problem.sources[source.id];
      return record?.terminal_on || record?.terminal_by || '';
    }).sort().at(-1);
    rows.sort((a, b) => Number(disagrees(b)) - Number(disagrees(a)) || latest(b).localeCompare(latest(a)) || a.number - b.number);
    body.replaceChildren(...rows.map(problem => {
      const tr = document.createElement('tr');
      tr.append(cell('th', link(`https://www.erdosproblems.com/${problem.number}`, `#${problem.number}`), 'row'),
        ...sources.map(source => resultCell(problem.sources[source.id], source, problem.number)));
      return tr;
    }));
    if (!rows.length) {
      const td = cell('td', query ? 'No problem matches this number.' : 'This source has no resolved problems.');
      td.colSpan = sources.length + 1;
      body.insertRow().append(td);
    }
  }

  window.renderErdosSourceComparison = (catalog, selected, latest) => {
    sources = selected;
    problems = catalog.problems;
    count.textContent = `${numberFormat.format(latest.resolved)} resolved · ${numberFormat.format(latest.resolved_lean)} with a Lean solution`;
    headings.replaceChildren(cell('th', 'Problem', 'col'), ...sources.map(source => cell('th', source.label, 'col')));
    const revisions = document.getElementById('source-revisions');
    revisions.replaceChildren('Data revisions');
    for (const source of sources) {
      revisions.append(' · ', link(source.url, `${source.label} ${dateFormat.format(new Date(source.date))}`));
      if (source.license) revisions.append(' (', link(source.license, source.license_label), ')');
    }
    if (section.open) renderRows();
    else body.replaceChildren();
    document.getElementById('source-comparison-controls').hidden = false;
    document.getElementById('source-comparison-table').hidden = false;
  };
  section.addEventListener('toggle', () => {
    if (section.open && problems) renderRows();
  });
  input.addEventListener('input', renderRows);
})();
