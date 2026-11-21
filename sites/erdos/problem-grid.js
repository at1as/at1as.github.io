/* The saved and interactive grids both use the catalog's recorded resolution flags. */
((root, factory) => {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./trends-data.js'));
  else root.ErdosProblemGrid = factory(root.ErdosTrends);
})(typeof window === 'undefined' ? globalThis : window, T => {
  const rangeSize = 100;
  const count = value => value.toLocaleString('en-US');

  function groupRows(rows) {
    const ranges = new Map();
    for (const [number, records] of [...rows].sort(([a], [b]) => Number(a) - Number(b))) {
      const start = Math.floor((Number(number) - 1) / rangeSize) * rangeSize + 1;
      if (!ranges.has(start)) ranges.set(start, { last: Number(number), entries: [], resolved: 0 });
      const range = ranges.get(start);
      range.last = Number(number);
      records.forEach((flags, index) => {
        const resolved = flags.includes('resolved');
        range.entries.push({ id: number + '-' + index, number, resolved,
          duplicate: records.length > 1 ? ' · Entry ' + (index + 1) + ' of ' + records.length : '' });
        if (resolved) range.resolved++;
      });
    }
    return ranges;
  }

  function setTileTabStop(tile) {
    const previous = tile.parentElement.querySelector('[tabindex="0"]');
    if (previous) previous.tabIndex = -1;
    tile.tabIndex = 0;
  }

  function renderTiles(grid, entries, problemURL, interactive) {
    const document = grid.ownerDocument;
    const previous = [...grid.children];
    const byId = new Map(previous.map(tile => [tile.dataset.entry, tile]));
    const next = entries.map(({ id, number, resolved, duplicate }) => {
      const tile = byId.get(id) || document.createElement('a');
      const title = 'Problem ' + number + ' · ' + (resolved ? 'Resolved' : 'Open or unresolved') + duplicate;
      const href = problemURL.replace('{number}', number);
      if (!tile.dataset.entry) {
        tile.dataset.entry = id;
        tile.textContent = number;
        if (interactive) tile.tabIndex = -1;
      }
      if (tile.title !== title) {
        tile.title = title;
        tile.setAttribute('aria-label', title);
        tile.dataset.resolved = String(resolved);
      }
      if (tile.getAttribute('href') !== href) tile.href = href;
      return tile;
    });
    if (previous.length !== next.length || next.some((tile, index) => previous[index] !== tile)) {
      const focused = grid.contains(document.activeElement);
      const tabStop = next.find(tile => tile.tabIndex === 0) || next[0];
      grid.replaceChildren(...next);
      if (interactive) {
        setTileTabStop(tabStop);
        if (focused) tabStop.focus();
      }
    }
  }

  function rangeView(link, section) {
    return {
      link, section, label: link.querySelector('.problem-range-label'),
      heading: section.querySelector('h3'), summary: section.querySelector('p'),
      tiles: section.querySelector('.problem-range-tiles')
    };
  }

  function create(document, interactive = true) {
    const panel = document.getElementById('problem-grid');
    const rangeLinks = document.getElementById('problem-grid-ranges');
    const rangePanels = document.getElementById('problem-grid-panels');
    const template = document.getElementById('problem-grid-range-template');
    const content = document.getElementById('problem-grid-content');
    const unavailable = document.getElementById('problem-grid-unavailable');
    const duplicates = document.getElementById('problem-grid-duplicates');
    const resolvedCount = document.getElementById('problem-grid-resolved');
    const openCount = document.getElementById('problem-grid-open');
    const views = new Map([...rangeLinks.children].map(link => [
      Number(link.dataset.start), rangeView(link, document.getElementById(link.hash.slice(1)))
    ]));
    let selected;
    let shownSources;

    function prepare(view) {
      view.link.setAttribute('role', 'tab');
      view.link.setAttribute('aria-controls', view.section.id);
      view.section.setAttribute('role', 'tabpanel');
      view.section.setAttribute('aria-labelledby', view.link.id);
      view.tiles.setAttribute('aria-description', 'Use the arrow keys to move between problems.');
      // The first problem link is the tab stop for this panel.
      view.section.removeAttribute('tabindex');
      for (const tile of view.tiles.children) tile.tabIndex = -1;
      if (view.tiles.firstElementChild) setTileTabStop(view.tiles.firstElementChild);
    }

    function selectRange(start) {
      selected = start;
      for (const [key, { link, section }] of views) {
        const active = key === selected;
        link.tabIndex = active ? 0 : -1;
        link.setAttribute('aria-selected', String(active));
        section.hidden = !active;
      }
    }

    if (interactive) {
      panel.dataset.interactive = '';
      rangeLinks.setAttribute('role', 'tablist');
      for (const view of views.values()) prepare(view);
      const linkedRange = Number(document.defaultView.location.hash.match(/^#problem-range-(\d+)$/)?.[1]);
      selectRange(views.has(linkedRange) ? linkedRange : views.keys().next().value);
      rangeLinks.addEventListener('click', event => {
        const link = event.target.closest('.problem-range-link');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        selectRange(Number(link.dataset.start));
      });
      rangeLinks.addEventListener('keydown', event => {
        const links = [...rangeLinks.children];
        const index = links.indexOf(event.target);
        const next = { ArrowLeft: (index + links.length - 1) % links.length,
          ArrowRight: (index + 1) % links.length, Home: 0, End: links.length - 1, ' ': index }[event.key];
        const target = links[next];
        if (!target) return;
        event.preventDefault();
        selectRange(Number(target.dataset.start));
        target.focus();
      });
      rangePanels.addEventListener('focusin', event => {
        if (event.target.matches('.problem-range-tiles > a')) setTileTabStop(event.target);
      });
      rangePanels.addEventListener('keydown', event => {
        const grid = event.target.closest('.problem-range-tiles');
        if (!grid) return;
        const cells = [...grid.children];
        const index = cells.indexOf(event.target);
        const columns = document.defaultView.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
        const next = { ArrowLeft: index - 1, ArrowRight: index + 1, ArrowUp: index - columns,
          ArrowDown: index + columns, Home: 0, End: cells.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        cells[next]?.focus();
      });
    }

    return function show(snapshot, sources) {
      const date = snapshot.as_of;
      const displayed = date === panel.dataset.date && snapshot.commit === panel.dataset.commit;
      if (!sources.length) {
        content.hidden = !views.size || !displayed;
        unavailable.hidden = !content.hidden;
        return;
      }
      if (displayed && sources === shownSources) {
        content.hidden = false;
        unavailable.hidden = true;
        return;
      }

      const matchingRevision = !snapshot.statuses || sources[0].history?.find(item => item.date === date)?.commit === snapshot.commit;
      const rows = matchingRevision ? T.problemRowsAt(sources, date) : new Map();
      const groups = groupRows(rows);
      let total = 0;
      let resolved = 0;
      for (const group of groups.values()) {
        total += group.entries.length;
        resolved += group.resolved;
      }
      const expectedResolved = snapshot.resolved ?? snapshot.statuses.proved + snapshot.statuses.disproved + snapshot.statuses.solved;
      if (total !== snapshot.total || resolved !== expectedResolved) {
        // A stale or incomplete problem catalog should never contradict the chart.
        content.hidden = !displayed || !!shownSources || !snapshot.statuses || !views.size;
        unavailable.hidden = !content.hidden;
        return;
      }

      const focused = document.activeElement;
      let restoreRangeFocus = false;
      for (const [start, view] of views) {
        if (groups.has(start)) continue;
        restoreRangeFocus ||= view.link === focused || view.section.contains(focused);
        view.link.remove();
        view.section.remove();
        views.delete(start);
      }
      const problemURL = (sources.length === 1 && sources[0].problem_url) || 'https://www.erdosproblems.com/{number}';
      const starts = [...groups.keys()];
      for (const [position, start] of starts.entries()) {
        const { last, entries, resolved } = groups.get(start);
        const end = position === starts.length - 1 ? last : start + rangeSize - 1;
        const label = start === end ? String(start) : start + '–' + end;
        const summary = count(resolved) + ' of ' + count(entries.length) + ' resolved';
        let view = views.get(start);
        if (!view) {
          const [link, section] = template.content.cloneNode(true).children;
          link.dataset.start = start;
          link.id = 'problem-range-link-' + start;
          section.id = 'problem-range-' + start;
          link.href = '#' + section.id;
          view = rangeView(link, section);
          view.heading.id = section.id + '-title';
          section.setAttribute('aria-labelledby', view.heading.id);
          views.set(start, view);
          rangeLinks.insertBefore(link, rangeLinks.children[position] || null);
          rangePanels.insertBefore(section, rangePanels.children[position] || null);
          if (interactive) prepare(view);
        }
        view.label.textContent = label;
        view.link.setAttribute('aria-label', 'Problems ' + label + ', ' + summary);
        view.link.title = summary;
        view.link.style.setProperty('--resolved-share', (100 * resolved / entries.length) + '%');
        view.heading.textContent = 'Problems ' + label;
        view.summary.textContent = summary;
        renderTiles(view.tiles, entries, problemURL, interactive);
      }
      resolvedCount.textContent = count(resolved);
      openCount.textContent = count(total - resolved);
      duplicates.hidden = rows.size === total;
      panel.dataset.date = date;
      panel.dataset.commit = snapshot.commit;
      shownSources = sources;
      content.hidden = false;
      unavailable.hidden = true;
      if (interactive) {
        selectRange(views.has(selected) ? selected : starts[0]);
        if (restoreRangeFocus) views.get(selected)?.link.focus();
      }
    };
  }
  return { create };
});
