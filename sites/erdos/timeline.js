/* Browse the saved Bloom–Tao snapshots and derive other views from the catalog histories. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const slider = $('#time-slider');
  const picker = $('#snapshot-picker');
  const play = $('#play-timeline');
  const speed = $('#playback-speed');
  const message = $('#timeline-message');
  const bloomChart = $('.chart-scroll svg');
  const download = $('#download-svg');
  const percentages = $('#include-percentages');
  const dock = $('#playback-dock');
  const dockPlay = $('#play-chart');
  const dockSpeed = $('#chart-speed');
  const dockDate = $('#chart-date');
  const toolbar = $('.timeline-toolbar');
  const chart = $('.chart-scroll');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const formatDate = date => formatter.format(new Date(date + 'T12:00:00Z'));
  const releases = JSON.parse($('#model-releases').textContent);
  const releaseRail = $('#release-markers');
  const releasePicker = $('#snapshot-release');
  const sourcePicker = $('#snapshot-source');
  const gridDatePicker = $('#problem-grid-date');
  const showProblemGrid = window.ErdosProblemGrid?.create(document);
  const customGridDate = new Option();
  let gridDateIndices = new Set();
  const T = window.ErdosTrends, S = window.ErdosSankey;
  const bloomAttribution = [...$('#snapshot-attribution').childNodes];
  const bloomCaption = $('#flow-caption').textContent;
  let releaseEvents = [];
  const count = value => value.toLocaleString('en-US');
  const setTableNumber = (cell, value, denominator) => {
    cell.querySelector('.table-count').textContent = count(value);
    cell.querySelector('.percentage').textContent = `(${denominator ? (100 * value / denominator).toFixed(1) + '%' : '—'})`;
  };
  const numberPattern = /-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi;
  let svg, nodeElements, labelElements, flowElements;
  function bindChart(element) {
    svg = element;
    nodeElements = [...svg.querySelectorAll('[data-node]')];
    labelElements = [...svg.querySelectorAll('[data-label]')];
    flowElements = [...svg.querySelectorAll('[data-flow]')];
    svg.setAttribute('data-percentages', String(percentages.checked));
  }
  bindChart(bloomChart);
  const statuses = [...document.querySelectorAll('[data-status]')].map(row => row.dataset.status);
  const attributeNames = [...new Set([...document.querySelectorAll('[data-attribute]')].map(el => el.dataset.attribute))];
  let history = null;
  let index = 0;
  let timer = null;
  let animation = null;
  let downloadURL = null;
  let bloomHistory, catalog;
  let activeSources = [];
  const catalogHistories = new Map();

  function updatePlaybackDock() {
    if (!dock) return;
    const bounds = chart.getBoundingClientRect();
    const chartVisible = bounds.top < window.innerHeight && bounds.bottom > 80;
    const controlsAbove = toolbar.getBoundingClientRect().bottom <= 0;
    dock.hidden = !(history && chartVisible && controlsAbove);
  }

  function updatePlaybackButtons() {
    const playing = timer !== null;
    for (const button of [play, dockPlay].filter(Boolean)) {
      button.innerHTML = playing ? 'Ⅱ <span>Pause</span>' : '▶ <span>Play</span>';
      button.setAttribute('aria-label', playing ? 'Pause history' : index === (history?.snapshots.length ?? 0) - 1 ? 'Replay history from the beginning' : 'Play history');
    }
    updatePlaybackDock();
  }

  function validate(payload) {
    if (payload.schema_version !== 1 || !Array.isArray(payload.snapshots) || payload.snapshots.length < 2) {
      throw new Error('Historical data is unavailable.');
    }
    let last = '';
    for (const snapshot of payload.snapshots) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.as_of) || snapshot.as_of <= last || !/^[a-f0-9]{40}$/.test(snapshot.commit)) {
        throw new Error('Invalid snapshot dates or source revisions.');
      }
      last = snapshot.as_of;
      const values = [snapshot.total, ...statuses.map(key => snapshot.statuses?.[key]),
        ...['proved', 'disproved', 'solved'].map(key => snapshot.lean?.[key]),
        ...attributeNames.map(key => snapshot.attributes?.[key])];
      if (values.some(n => !Number.isSafeInteger(n) || n < 0) || snapshot.total === 0 ||
          statuses.reduce((sum, key) => sum + snapshot.statuses[key], 0) !== snapshot.total) {
        throw new Error('Historical counts do not balance.');
      }
      const geometry = snapshot.geometry;
      if (geometry?.nodes?.length !== nodeElements.length || geometry?.links?.length !== flowElements.length ||
          geometry.nodes.some((node, i) => node.id !== nodeElements[i].dataset.node || ![node.y0, node.y1, node.value].every(Number.isFinite)) ||
          geometry.links.some(link => !Number.isFinite(link.width) || link.width < 0 || !/^[MC\d,.e+\- ]+$/i.test(link.d))) {
        throw new Error('Historical chart geometry is invalid.');
      }
    }
    return payload;
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
    updatePlaybackButtons();
  }

  function arrangeReleaseMarkers() {
    const width = releaseRail.getBoundingClientRect().width;
    if (!width) return;
    const lanes = [[], []];
    for (const event of releaseEvents) {
      const anchor = event.position * width;
      const [below, above] = lanes.map(lane => lane.at(-1)?.anchor ?? -Infinity);
      const lane = anchor - below >= 24 || below <= above ? lanes[0] : lanes[1];
      lane.push({button:event.button, anchor});
    }
    // Center crowded dots around their dates while keeping each dot separately clickable.
    lanes.forEach((lane, row) => {
      const gap = Math.min(14, width / Math.max(1, lane.length - 1));
      let previous = -gap;
      for (const marker of lane) {
        marker.fromLeft = Math.max(marker.anchor, previous + gap);
        previous = marker.fromLeft;
      }
      let next = width + gap;
      for (let i = lane.length - 1; i >= 0; i--) {
        const {button, anchor, fromLeft} = lane[i];
        next = Math.min(anchor, next - gap);
        const midpoint = (fromLeft + next) / 2;
        const x = Math.max(i * gap, Math.min(midpoint, width - (lane.length - 1 - i) * gap));
        const offset = x - anchor;
        button.style.marginLeft = `${offset}px`;
        button.style.setProperty('--stem-skew', `${Math.atan2(row ? -offset : offset, 18)}rad`);
        button.dataset.side = row ? 'above' : 'below';
        button.dataset.align = x < 110 ? 'left' : width - x < 110 ? 'right' : 'center';
      }
    });
  }

  function prepareReleases() {
    const snapshots = history.snapshots;
    releaseEvents = releases.filter(release => release.date >= snapshots[0].as_of && release.date <= snapshots.at(-1).as_of)
      .sort((a, b) => a.date.localeCompare(b.date)).map(release => {
        const nextIndex = snapshots.findIndex(snapshot => snapshot.as_of >= release.date);
        const steps = Math.max(1, snapshots.length - 1);
        let position = nextIndex;
        if (nextIndex > 0 && snapshots[nextIndex].as_of !== release.date) {
          const start = Date.parse(snapshots[nextIndex - 1].as_of);
          const end = Date.parse(snapshots[nextIndex].as_of);
          position = nextIndex - 1 + (Date.parse(release.date) - start) / (end - start);
        }
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'release-marker';
        button.dataset.release = release.id;
        button.style.left = `${100 * position / steps}%`;
        button.setAttribute('aria-label', `${release.name}, ${release.kind.toLowerCase()}, ${formatDate(release.date)}. View first snapshot on or after release.`);
        button.setAttribute('aria-pressed', 'false');
        const tooltip = document.createElement('span');
        tooltip.className = 'release-tooltip';
        tooltip.setAttribute('aria-hidden', 'true');
        tooltip.textContent = release.name;
        const date = document.createElement('time');
        date.dateTime = release.date;
        date.textContent = formatDate(release.date);
        tooltip.append(date);
        button.append(tooltip);
        button.addEventListener('click', () => { stop(); select(nextIndex, true, release.id); });
        return { ...release, nextIndex, position: position / steps, button };
      });
    const buttons = releaseEvents.map(release => release.button);
    releaseRail.replaceChildren(...buttons);
    releaseRail.hidden = buttons.length === 0;
    $('#release-info').hidden = releaseEvents.length === 0;
    const placeholder = new Option('Choose a release', '');
    placeholder.disabled = true;
    releasePicker.replaceChildren(placeholder, ...releaseEvents.map(release => new Option(release.name, release.id)));
    arrangeReleaseMarkers();
  }

  function updateReleaseInfo(date, selectedRelease) {
    const release = selectedRelease ? releaseEvents.find(event => event.id === selectedRelease) :
      releaseEvents.findLast(event => event.date <= date);
    releaseEvents.forEach(event => { event.button.setAttribute('aria-pressed', String(event === release)); });
    releasePicker.value = release?.id || '';
    const info = $('#release-current');
    info.replaceChildren();
    if (!release) return;
    const source = document.createElement('a');
    source.href = release.source;
    source.textContent = `${formatDate(release.date)} ↗`;
    source.setAttribute('aria-label', `${release.name}, ${formatDate(release.date)}, official release source`);
    info.append(source);
    if (selectedRelease && release.date !== date) {
      info.append(` · Showing ${formatDate(date)} (next recorded snapshot)`);
    }
    if (release.note) {
      const note = document.createElement('a');
      note.className = 'release-note';
      note.href = release.note_source;
      note.textContent = release.note;
      info.append(note);
    }
  }
  releasePicker.addEventListener('change', () => {
    const release = releaseEvents.find(event => event.id === releasePicker.value);
    if (!release) return;
    stop();
    select(release.nextIndex, true, release.id);
  });

  function geometryFrame(target, animate) {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
    const starts = nodeElements.map((el, i) => {
      const rect = el.querySelector('rect');
      return { y: +rect.getAttribute('y'), height: +rect.getAttribute('height'),
        titleY: +labelElements[i].querySelector('.node-title').getAttribute('y'),
        countY: +labelElements[i].querySelector('.node-count').getAttribute('y') };
    });
    const paths = flowElements.map((el, i) => ({
      from: el.getAttribute('d').match(numberPattern).map(Number),
      to: target.links[i].d.match(numberPattern).map(Number),
      width: +el.getAttribute('stroke-width'),
    }));
    const duration = animate && !reducedMotion.matches ? Math.min(300, Number(speed.value) * .7) : 0;
    const start = performance.now();
    function frame(now) {
      const progress = duration ? Math.min(1, (now - start) / duration) : 1;
      const t = progress * progress * (3 - 2 * progress);
      const mix = (a, b) => a + (b - a) * t;
      target.nodes.forEach((node, i) => {
        const rect = nodeElements[i].querySelector('rect');
        const height = mix(starts[i].height, node.y1 - node.y0);
        rect.setAttribute('y', mix(starts[i].y, node.y0));
        rect.setAttribute('height', Math.max(0, height));
        rect.setAttribute('rx', Math.min(2, Math.max(0, height / 2)));
        const titleY = node.terminal ? (node.y0 + node.y1) / 2 - 5 : node.y0 - 39;
        labelElements[i].querySelector('.node-title').setAttribute('y', mix(starts[i].titleY, titleY));
        labelElements[i].querySelector('.node-count').setAttribute('y', mix(starts[i].countY, titleY + (node.terminal ? 28 : 31)));
      });
      target.links.forEach((link, i) => {
        let number = 0;
        flowElements[i].setAttribute('d', link.d.replace(numberPattern, () => mix(paths[i].from[number], paths[i].to[number++])));
        flowElements[i].setAttribute('stroke-width', mix(paths[i].width, link.width));
      });
      animation = progress < 1 ? requestAnimationFrame(frame) : null;
    }
    frame(start);
  }

  function snapshotLinks(snapshot) {
    const primary = $('#source-revision'), extra = $('#extra-source-revisions');
    if (snapshot.statuses) {
      primary.href = `https://github.com/teorth/erdosproblems/blob/${snapshot.commit}/data/problems.yaml`;
      primary.title = `Recorded ${snapshot.recorded_at}`;
      primary.textContent = 'Source revision ↗';
      extra.replaceChildren();
      extra.hidden = true;
      return [primary.href];
    }
    const revisions = activeSources.flatMap(source => {
      const observation = source.history.findLast(item => item.date <= snapshot.as_of);
      return observation ? [{label: source.label, date: observation.date, url: `${source.repository}/commit/${observation.commit}`}] : [];
    });
    extra.replaceChildren();
    revisions.forEach(({label, date, url}, i) => {
      const link = i === 0 ? primary : document.createElement('a');
      link.href = url;
      link.title = `${label} snapshot on ${formatDate(date)}`;
      link.textContent = revisions.length === 1 ? 'Source revision ↗' : `${label} revision ↗`;
      if (i) extra.append(i === 1 ? '' : ' · ', link);
    });
    extra.hidden = revisions.length < 2;
    return revisions.map(item => item.url);
  }

  function updateStatusTable(snapshot) {
    if (snapshot.statuses) {
      document.querySelectorAll('[data-attribute]').forEach(el => { el.textContent = count(snapshot.attributes[el.dataset.attribute]); });
      const resolvedLean = Object.values(snapshot.lean).reduce((a, b) => a + b, 0);
      $('[data-derived="resolved-lean"]').textContent = count(resolvedLean);
      $('[data-derived="extra-lean"]').textContent = count(snapshot.attributes.solutions - resolvedLean);
      document.querySelectorAll('[data-status]').forEach(row => {
        const key = row.dataset.status;
        const cells = row.querySelectorAll('td');
        setTableNumber(cells[0], snapshot.statuses[key], snapshot.total);
        if (snapshot.lean[key] !== undefined) {
          setTableNumber(cells[1], snapshot.lean[key], snapshot.statuses[key]);
          setTableNumber(cells[2], snapshot.statuses[key] - snapshot.lean[key], snapshot.statuses[key]);
        }
      });
      return;
    }
    $('[data-attribute="solutions"]').textContent = count(snapshot.lean);
    for (const [key, total, lean] of [
      ['resolved', snapshot.resolved, snapshot.resolved_lean],
      ['unresolved', snapshot.total - snapshot.resolved, snapshot.lean - snapshot.resolved_lean]
    ]) {
      const cells = $(`[data-catalog-status="${key}"]`).querySelectorAll('td');
      setTableNumber(cells[0], total, snapshot.total);
      setTableNumber(cells[1], lean, total);
      setTableNumber(cells[2], total - lean, total);
    }
    const statements = $('#catalog-statements');
    statements.hidden = !activeSources.some(source => source.metrics.includes('statements') &&
      source.history[0].date <= snapshot.as_of);
    statements.textContent = ` · ${count(snapshot.statements)} problem statements in Lean`;
  }

  function select(value, animate = true, selectedRelease = null) {
    if (!history || !Number.isInteger(value) || value < 0 || value >= history.snapshots.length) return;
    index = value;
    const snapshot = history.snapshots[index];
    snapshot.geometry ??= S.geometry(snapshot, history.max_total);
    const date = formatDate(snapshot.as_of);
    updateReleaseInfo(snapshot.as_of, selectedRelease);
    slider.value = String(index);
    slider.style.setProperty('--progress', `${100 * index / Math.max(1, history.snapshots.length - 1)}%`);
    slider.setAttribute('aria-valuetext', date);
    picker.value = String(index);
    customGridDate.remove();
    if (!gridDateIndices.has(index)) {
      customGridDate.textContent = date;
      customGridDate.value = String(index);
      gridDatePicker.prepend(customGridDate);
    }
    gridDatePicker.value = String(index);
    showProblemGrid?.(snapshot, activeSources);
    $('#timeline-position').textContent = `Snapshot ${index + 1} of ${history.snapshots.length}`;
    $('#snapshot-date').textContent = date;
    $('#snapshot-date').dateTime = snapshot.as_of;
    if (dockDate) { dockDate.textContent = date; dockDate.dateTime = snapshot.as_of; }
    $('#footer-date').textContent = date;
    $('#table-date').textContent = date;
    const revisions = snapshotLinks(snapshot);
    document.querySelectorAll('[data-total]').forEach(el => { el.textContent = count(snapshot.total); });
    document.title = `Erdős problems in the AI era — ${date} | Jason Willems`;
    updateStatusTable(snapshot);
    snapshot.geometry.nodes.forEach((node, i) => {
      const label = labelElements[i].querySelector('.node-title').textContent;
      labelElements[i].querySelector('.node-number').textContent = count(node.value);
      labelElements[i].querySelector('.node-percentage').textContent = `${(100 * node.value / snapshot.total).toFixed(1)}%`;
      nodeElements[i].querySelector('title').textContent = `${label}: ${count(node.value)} (${(100 * node.value / snapshot.total).toFixed(1)}% of all problems)`;
    });
    snapshot.geometry.links.forEach((link, i) => {
      const title = flowElements[i].querySelector('title');
      title.textContent = title.textContent.replace(/: [\d,]+$/, ': ' + count(link.value));
    });
    const resolved = snapshot.resolved ?? snapshot.statuses.proved + snapshot.statuses.disproved + snapshot.statuses.solved;
    document.querySelectorAll('[data-overview="resolved"]').forEach(el => { el.textContent = count(resolved); });
    $('#flow-desc').textContent = `${date}: ${count(snapshot.total)} problems, ${count(resolved)} resolved and ${count(snapshot.total - resolved)} open or unresolved. Bar heights and ribbon widths use the same scale across all dates.`;
    $('#flow-title').textContent = `Erdős problems: ${date}`;
    const attribution = snapshot.attribution || 'Erdős problems database contributors, maintained by Thomas Bloom and Terence Tao';
    $('#flow-source').textContent = `Data: ${attribution}. Sources: ${revisions.join(' · ')}. Snapshot: ${snapshot.as_of}. Visualization: Jason Willems. Layout: D3 Sankey.`;
    geometryFrame(snapshot.geometry, animate);
    if (timer === null) stop();
  }

  function schedule() {
    timer = setTimeout(() => {
      if (index >= history.snapshots.length - 1) { stop(); return; }
      select(index + 1);
      if (index === history.snapshots.length - 1) stop();
      else schedule();
    }, Number(speed.value));
  }

  function togglePlayback() {
    if (!history || history.snapshots.length < 2) return;
    if (timer !== null) { stop(); return; }
    if (index === history.snapshots.length - 1) select(0, false);
    schedule();
    updatePlaybackButtons();
  }
  play.addEventListener('click', togglePlayback);
  dockPlay?.addEventListener('click', togglePlayback);
  slider.addEventListener('input', () => { stop(); select(Number(slider.value)); });
  picker.addEventListener('change', () => { stop(); select(Number(picker.value)); });
  gridDatePicker.addEventListener('change', () => { stop(); select(Number(gridDatePicker.value), false); });
  function changeSpeed(control) {
    speed.value = control.value;
    if (dockSpeed) dockSpeed.value = control.value;
    if (timer !== null) { clearTimeout(timer); schedule(); }
  }
  speed.addEventListener('change', () => changeSpeed(speed));
  dockSpeed?.addEventListener('change', () => changeSpeed(dockSpeed));
  window.addEventListener('scroll', updatePlaybackDock, { passive: true });
  window.addEventListener('resize', updatePlaybackDock);
  const showPercentages = () => svg.setAttribute('data-percentages', String(percentages.checked));
  percentages.addEventListener('change', showPercentages);
  percentages.disabled = false;
  showPercentages();
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', () => { stop(); if (downloadURL) URL.revokeObjectURL(downloadURL); });
  if ('ResizeObserver' in window) new ResizeObserver(arrangeReleaseMarkers).observe(releaseRail);
  else window.addEventListener('resize', arrangeReleaseMarkers);
  download.addEventListener('click', () => {
    if (history) geometryFrame(history.snapshots[index].geometry, false);
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    downloadURL = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
    download.href = downloadURL;
    const source = sourcePicker.value === 'bloom-tao' ? '' : `${sourcePicker.value}-`;
    download.download = `erdos-problems-${source}${$('#snapshot-date').dateTime}.svg`;
  });

  function showHistory(payload, selectedIndex) {
    history = payload;
    prepareReleases();
    picker.replaceChildren(...history.snapshots.map((snapshot, i) => new Option(formatDate(snapshot.as_of), String(i))));
    gridDateIndices = new Set(history.snapshots.flatMap((snapshot, i, snapshots) =>
      i === 0 || snapshot.as_of.slice(0, 7) !== snapshots[i + 1]?.as_of.slice(0, 7) ? [i] : []));
    gridDatePicker.replaceChildren(...[...gridDateIndices].reverse().map(i => new Option(
      formatDate(history.snapshots[i].as_of) + (i === history.snapshots.length - 1 ? ' (latest)' : ''), String(i))));
    gridDatePicker.disabled = !activeSources.length || history.snapshots.length < 2;
    slider.max = String(history.snapshots.length - 1);
    [slider, play, speed, dockPlay, dockSpeed].forEach(control => { control.disabled = history.snapshots.length < 2; });
    picker.disabled = false;
    $('#first-date').textContent = formatDate(history.snapshots[0].as_of);
    $('#last-date').textContent = formatDate(history.snapshots.at(-1).as_of);
    select(selectedIndex, false);
  }

  function selectCatalog() {
    const selection = sourcePicker.value, bloom = selection === 'bloom-tao';
    const sources = T.catalogSources(catalog, selection);
    let payload = bloomHistory;
    if (!bloom) {
      if (!catalogHistories.has(selection)) {
        const {points} = T.rollup(catalog, selection);
        const attribution = sources.map(source => source.label).join(' and ');
        const snapshots = points.map(point => ({...point, as_of: point.date, attribution}));
        catalogHistories.set(selection, {snapshots, max_total: Math.max(...snapshots.map(snapshot => snapshot.total))});
      }
      payload = catalogHistories.get(selection);
    }
    const selectedIndex = index === history.snapshots.length - 1 ? payload.snapshots.length - 1 :
      Math.max(0, payload.snapshots.findLastIndex(snapshot => snapshot.as_of <= history.snapshots[index].as_of));
    stop();
    activeSources = sources;
    if (bloom) chart.replaceChildren(bloomChart);
    else chart.innerHTML = S.render(payload.snapshots[selectedIndex]);
    bindChart(chart.querySelector('svg'));
    for (const id of ['bloom-statuses','bloom-attributes','bloom-data-links','bloom-counting-note']) $(`#${id}`).hidden = !bloom;
    for (const id of ['catalog-statuses','catalog-data-link','catalog-counting-note']) $(`#${id}`).hidden = bloom;
    if (bloom) $('#catalog-statements').hidden = true;
    $('#flow-caption').textContent = bloom ? bloomCaption : 'Wider bands mean more problems. Lean counts reflect solutions recorded by the selected catalogs.';
    $('#snapshot-history-link').href = bloom ? 'history.json' : 'problems.json';
    const attribution = $('#snapshot-attribution');
    attribution.replaceChildren(...(bloom ? bloomAttribution : ['Data: ']));
    if (!bloom) sources.forEach((source, i) => {
      const link = document.createElement('a');
      link.href = source.repository;
      link.textContent = source.label;
      attribution.append(i ? ' · ' : '', link);
      if (source.license) {
        const license = document.createElement('a');
        license.href = source.license;
        license.textContent = source.license_label;
        attribution.append(' (', license, ')');
      }
    });
    showHistory(payload, selectedIndex);
  }

  const read = async path => {
    const response = await fetch(path, { cache: 'no-cache', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('History request failed.');
    return response.json();
  };

  async function loadSources() {
    if (!T || !S) return;
    try {
      const payload = await read('problems.json');
      if (payload.schema_version !== T.catalogVersion || !payload.sources.length) return;
      catalog = payload;
      window.populateErdosSourcePicker(sourcePicker, catalog.sources);
      sourcePicker.value = 'bloom-tao';
      activeSources = T.catalogSources(catalog, 'bloom-tao');
      showProblemGrid?.(history.snapshots[index], activeSources);
      gridDatePicker.disabled = history.snapshots.length < 2;
      $('#snapshot-source-control').hidden = false;
    } catch (error) {
      // The saved Bloom–Tao snapshots are independently usable offline.
    }
  }
  sourcePicker.addEventListener('change', selectCatalog);

  async function load() {
    $('#retry-history').hidden = true;
    message.hidden = false;
    message.textContent = 'Loading historical snapshots…';
    try {
      bloomHistory = validate(await read('history.json'));
      showHistory(bloomHistory, bloomHistory.snapshots.length - 1);
      message.textContent = '';
      message.hidden = true;
      loadSources();
    } catch (error) {
      history = null;
      message.textContent = 'History could not load. The latest saved snapshot is still shown.';
      $('#retry-history').hidden = false;
    }
  }
  $('#retry-history').addEventListener('click', load);
  load();
})();
