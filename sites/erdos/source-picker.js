/* Both views share the same segmented source picker, date help, and cross-tab source state. */
(() => {
  const STORAGE_KEY = 'erdos-source';
  const descriptions = {
    'bloom-tao': 'Curated Erdős Problems catalog tracking proved, disproved, and otherwise solved problems, plus Lean statements and solutions.',
    'plasma': 'Tracks accepted claims settling the full problem (including independence results), plus pending claims and Lean proofs.'
  };

  function readSavedSource(validIds) {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('source');
      if (fromUrl && validIds.includes(fromUrl)) return fromUrl;
    } catch {}
    try {
      const fromStorage = window.sessionStorage?.getItem(STORAGE_KEY);
      if (fromStorage && validIds.includes(fromStorage)) return fromStorage;
    } catch {}
    return validIds[0] || 'bloom-tao';
  }

  function updateCrossViewLinks(selection) {
    const links = document.querySelectorAll('.explorer-tabs a, .methodology-link, .current-site a, footer a[href*="trends/"]');
    for (const link of links) {
      const raw = link.getAttribute('href');
      if (!raw || raw.startsWith('#') || raw.startsWith('http://') || raw.startsWith('https://')) continue;
      try {
        const url = new URL(raw, window.location.href);
        if (selection === 'bloom-tao') url.searchParams.delete('source');
        else url.searchParams.set('source', selection);
        const query = url.searchParams.toString();
        const base = raw.split(/[?#]/)[0];
        const hash = raw.includes('#') ? '#' + raw.split('#')[1] : '';
        link.setAttribute('href', base + (query ? '?' + query : '') + hash);
      } catch {}
    }
  }

  function syncState(picker, { persist = true } = {}) {
    const selection = picker.value;
    const container = picker.closest('.source-picker');
    if (container) {
      for (const button of container.querySelectorAll('[data-source-option]')) {
        button.setAttribute('aria-pressed', String(button.dataset.sourceOption === selection));
      }
    }
    updateCrossViewLinks(selection);
    if (!persist) return;
    try {
      window.sessionStorage?.setItem(STORAGE_KEY, selection);
    } catch {}
    try {
      const url = new URL(window.location.href);
      if (selection === 'bloom-tao') url.searchParams.delete('source');
      else url.searchParams.set('source', selection);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch {}
  }

  window.populateErdosSourcePicker = function (picker, sources) {
    const help = document.getElementById('source-help');
    const list = help.querySelector('dl');
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const format = date => formatter.format(new Date(date + 'T00:00:00Z'));

    const choices = [];
    const primary = sources[0];
    if (primary) choices.push({ id: primary.id, label: primary.label });
    if (sources.length > 1) choices.push({ id: 'combined', label: 'Combined' });
    for (const source of sources.slice(1)) choices.push({ id: source.id, label: source.label });

    picker.replaceChildren(...choices.map(choice => new Option(choice.label, choice.id)));

    const container = picker.closest('.source-picker');
    const segments = container?.querySelector('.source-segments');
    if (segments) {
      segments.replaceChildren(...choices.map(choice => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.sourceOption = choice.id;
        button.textContent = choice.label;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          if (picker.value === choice.id) return;
          picker.value = choice.id;
          picker.dispatchEvent(new Event('change', { bubbles: true }));
        });
        return button;
      }));
    }

    list.replaceChildren();
    for (const source of sources) {
      const term = document.createElement('dt');
      const link = document.createElement('a');
      link.href = source.policy_url || source.repository;
      link.textContent = source.label;
      term.append(link);
      const range = document.createElement('span');
      range.textContent = format(source.history[0].date) + ' – ' + format(source.history.at(-1).date);
      const detail = document.createElement('dd');
      if (descriptions[source.id]) {
        term.append(' ', range);
        detail.textContent = descriptions[source.id];
      } else {
        detail.append(range);
      }
      list.append(term, detail);
    }
    help.querySelector('#combined-help').hidden = sources.length < 2;
    picker.disabled = false;
    const infoButton = container?.querySelector('.source-info');
    if (infoButton) infoButton.hidden = false;

    const initial = readSavedSource(choices.map(c => c.id));
    picker.value = initial;
    syncState(picker, { persist: false });

    if (!picker.dataset.segmentBound) {
      picker.dataset.segmentBound = 'true';
      picker.addEventListener('change', () => syncState(picker, { persist: true }));
    }
    return initial;
  };
})();
