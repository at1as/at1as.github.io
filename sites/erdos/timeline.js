/* Historical geometry is computed by D3 at build time. No CDN or live API calls. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const slider = $('#time-slider');
  const picker = $('#snapshot-picker');
  const play = $('#play-timeline');
  const speed = $('#playback-speed');
  const message = $('#timeline-message');
  const svg = $('.chart-scroll svg');
  const download = $('#download-svg');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const formatDate = date => formatter.format(new Date(date + 'T12:00:00Z'));
  const releases = JSON.parse($('#model-releases').textContent);
  const releaseRail = $('#release-markers');
  let releaseEvents = [];
  const count = value => value.toLocaleString('en-US');
  const setTableNumber = (cell, value, denominator) => {
    cell.querySelector('.table-count').textContent = count(value);
    cell.querySelector('.percentage').textContent = `(${denominator ? (100 * value / denominator).toFixed(1) + '%' : '—'})`;
  };
  const numberPattern = /-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi;
  const nodeElements = [...svg.querySelectorAll('[data-node]')];
  const labelElements = [...svg.querySelectorAll('[data-label]')];
  const flowElements = [...svg.querySelectorAll('[data-flow]')];
  const statuses = [...document.querySelectorAll('[data-status]')].map(row => row.dataset.status);
  const attributeNames = [...new Set([...document.querySelectorAll('[data-attribute]')].map(el => el.dataset.attribute))];
  let history = null;
  let index = 0;
  let timer = null;
  let animation = null;
  let downloadURL = null;

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
    play.innerHTML = '▶ <span>Play</span>';
    play.setAttribute('aria-label', index === (history?.snapshots.length ?? 0) - 1 ? 'Replay history from the beginning' : 'Play history');
  }

  function arrangeReleaseMarkers() {
    // Every stem meets the slider axis. Nearby targets alternate below/above.
    const width = releaseRail.getBoundingClientRect().width || 120;
    const laneEnds = [];
    let above = 22, below = 22;
    releaseEvents.forEach(release => {
      const position = release.position * width;
      let lane = laneEnds.findIndex(end => position - end >= 28);
      if (lane < 0) lane = laneEnds.length;
      laneEnds[lane] = position;
      const side = lane % 2 ? 'above' : 'below';
      const distance = 20 + Math.floor(lane / 2) * 28;
      release.button.dataset.side = side;
      release.button.style.top = `${(side === 'above' ? -distance : distance) - 12}px`;
      release.button.style.setProperty('--stem-length', `${distance}px`);
      if (side === 'above') above = Math.max(above, distance + 2);
      else below = Math.max(below, distance + 2);
      release.button.dataset.align = position < 110 ? 'left' : width - position < 110 ? 'right' : 'center';
    });
    $('.timeline-toolbar').style.setProperty('--release-above', `${above}px`);
    $('.timeline-toolbar').style.setProperty('--release-below', `${below}px`);
  }

  function prepareReleases() {
    const snapshots = history.snapshots;
    releaseEvents = releases.filter(release => release.date >= snapshots[0].as_of && release.date <= snapshots.at(-1).as_of)
      .sort((a, b) => a.date.localeCompare(b.date)).map(release => {
        const nextIndex = snapshots.findIndex(snapshot => snapshot.as_of >= release.date);
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
        button.style.left = `${100 * position / (snapshots.length - 1)}%`;
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
        return { ...release, nextIndex, position: position / (snapshots.length - 1), button };
      });
    releaseRail.replaceChildren(...releaseEvents.map(release => release.button));
    releaseRail.hidden = releaseEvents.length === 0;
    $('#release-info').hidden = releaseEvents.length === 0;
    arrangeReleaseMarkers();
  }

  function updateReleaseInfo(date, selectedRelease) {
    const release = selectedRelease ? releaseEvents.find(event => event.id === selectedRelease)
      : releaseEvents.findLast(event => event.date <= date);
    releaseEvents.forEach(event => { event.button.setAttribute('aria-pressed', String(event === release)); });
    const info = $('#release-current');
    info.replaceChildren();
    if (!release) { info.textContent = 'Select a marker to explore a release'; return; }
    const source = document.createElement('a');
    source.href = release.source;
    source.textContent = `${release.name} ↗`;
    source.setAttribute('aria-label', `${release.name}: official release source`);
    info.append(source, ` · ${formatDate(release.date)} · ${release.kind}`);
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

  function select(value, animate = true, selectedRelease = null) {
    if (!history || !Number.isInteger(value) || value < 0 || value >= history.snapshots.length) return;
    index = value;
    const snapshot = history.snapshots[index];
    const date = formatDate(snapshot.as_of);
    updateReleaseInfo(snapshot.as_of, selectedRelease);
    slider.value = String(index);
    slider.style.setProperty('--progress', `${100 * index / (history.snapshots.length - 1)}%`);
    slider.setAttribute('aria-valuetext', date);
    picker.value = String(index);
    $('#timeline-position').textContent = `Snapshot ${index + 1} of ${history.snapshots.length}`;
    $('#snapshot-date').textContent = date;
    $('#snapshot-date').dateTime = snapshot.as_of;
    $('#footer-date').textContent = date;
    $('#table-date').textContent = date;
    $('#source-revision').href = `https://github.com/teorth/erdosproblems/blob/${snapshot.commit}/data/problems.yaml`;
    $('#source-revision').title = `Recorded ${snapshot.recorded_at}`;
    document.querySelectorAll('[data-total]').forEach(el => { el.textContent = count(snapshot.total); });
    document.title = `Erdős problems in the AI era — ${date} | Jason Willems`;
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
    snapshot.geometry.nodes.forEach((node, i) => {
      const label = labelElements[i].querySelector('.node-title').textContent;
      labelElements[i].querySelector('.node-count').textContent = count(node.value);
      nodeElements[i].querySelector('title').textContent = `${label}: ${count(node.value)} (${(100 * node.value / snapshot.total).toFixed(1)}% of all problems)`;
    });
    snapshot.geometry.links.forEach((link, i) => {
      const title = flowElements[i].querySelector('title');
      title.textContent = title.textContent.replace(/: [\d,]+$/, ': ' + count(link.value));
    });
    const resolved = snapshot.statuses.proved + snapshot.statuses.disproved + snapshot.statuses.solved;
    $('#flow-desc').textContent = `${date}: ${count(snapshot.total)} problems, ${count(resolved)} resolved and ${count(snapshot.total - resolved)} open or unresolved. Bar heights and ribbon widths use the same scale across all dates.`;
    $('#flow-title').textContent = `Erdős problems: ${date}`;
    $('#flow-source').textContent = `Data: Erdős problems database contributors, maintained by Thomas Bloom and Terence Tao. Source: ${$('#source-revision').href}. Snapshot: ${snapshot.as_of}. Visualization: Jason Willems. Layout: D3 Sankey.`;
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

  play.addEventListener('click', () => {
    if (!history) return;
    if (timer !== null) { stop(); return; }
    if (index === history.snapshots.length - 1) select(0, false);
    play.innerHTML = 'Ⅱ <span>Pause</span>';
    play.setAttribute('aria-label', 'Pause history');
    schedule();
  });
  slider.addEventListener('input', () => { stop(); select(Number(slider.value)); });
  picker.addEventListener('change', () => { stop(); select(Number(picker.value)); });
  speed.addEventListener('change', () => { if (timer !== null) { clearTimeout(timer); schedule(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', () => { stop(); if (downloadURL) URL.revokeObjectURL(downloadURL); });
  if ('ResizeObserver' in window) new ResizeObserver(arrangeReleaseMarkers).observe(releaseRail);
  else window.addEventListener('resize', arrangeReleaseMarkers);
  download.addEventListener('click', () => {
    if (!history) return; // The original static SVG remains the no-JS fallback.
    geometryFrame(history.snapshots[index].geometry, false);
    if (downloadURL) URL.revokeObjectURL(downloadURL);
    downloadURL = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
    download.href = downloadURL;
    download.download = `erdos-problems-${history.snapshots[index].as_of}.svg`;
  });

  async function load() {
    $('#retry-history').hidden = true;
    message.hidden = false;
    message.textContent = 'Loading historical snapshots…';
    try {
      const response = await fetch('history.json', { cache: 'no-cache', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('History request failed.');
      history = validate(await response.json());
      prepareReleases();
      picker.replaceChildren(...history.snapshots.map((snapshot, i) => new Option(formatDate(snapshot.as_of), String(i))));
      slider.max = String(history.snapshots.length - 1);
      [slider, picker, play, speed].forEach(control => { control.disabled = false; });
      $('#first-date').textContent = formatDate(history.snapshots[0].as_of);
      $('#last-date').textContent = formatDate(history.snapshots.at(-1).as_of);
      message.textContent = '';
      message.hidden = true;
      select(history.snapshots.length - 1, false);
    } catch (error) {
      history = null;
      message.textContent = 'History could not load. The latest saved snapshot is still shown.';
      $('#retry-history').hidden = false;
    }
  }
  $('#retry-history').addEventListener('click', load);
  load();
})();
