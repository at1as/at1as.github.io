const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { layout } = require('./render.cjs');

const site = path.join(__dirname, '..');
const history = JSON.parse(fs.readFileSync(path.join(site, 'history.json')));
const releases = JSON.parse(fs.readFileSync(path.join(site, 'model-releases.json')));
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(site, 'timeline.js'), 'utf8');
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(setImmediate); };

async function boot({ fail = false, reduced = true, data = history } = {}) {
  const dom = new JSDOM(html, { url: 'https://example.com/sites/erdos/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const timers = new Map(), frames = new Map(), blobs = [];
  let id = 0, now = 0;
  w.fetch = async () => { if (fail) throw Error('offline'); return { ok: true, json: async () => structuredClone(data) }; };
  w.matchMedia = () => ({ matches: reduced });
  w.AbortSignal.timeout = () => new w.AbortController().signal;
  w.setTimeout = (fn, delay) => { timers.set(++id, { fn, delay }); return id; };
  w.clearTimeout = timer => timers.delete(timer);
  w.requestAnimationFrame = fn => { frames.set(++id, fn); return id; };
  w.cancelAnimationFrame = frame => frames.delete(frame);
  w.performance.now = () => now;
  w.URL.createObjectURL = blob => { blobs.push(blob); return 'blob:historical-svg'; };
  w.URL.revokeObjectURL = () => {};
  w.eval(script);
  await settle();
  const q = selector => w.document.querySelector(selector);
  const event = (selector, type) => q(selector).dispatchEvent(new w.Event(type, { bubbles: true, cancelable: true }));
  const tick = () => {
    assert.equal(timers.size, 1, 'Only one playback timer should be active');
    const [key, timer] = timers.entries().next().value;
    timers.delete(key); timer.fn();
  };
  const finishAnimation = () => {
    now += 1000;
    for (const [key, frame] of [...frames]) { frames.delete(key); frame(now); }
  };
  return { dom, w, q, event, tick, finishAnimation, timers, frames, blobs };
}

test('all historical snapshots conserve flow on a shared scale', () => {
  for (const s of history.snapshots) {
    assert.equal(Object.values(s.statuses).reduce((a, b) => a + b, 0), s.total);
    const graph = layout(s, history.max_total);
    for (const link of graph.links) assert.ok(Math.abs(link.width - link.value * 352 / history.max_total) < 1e-6);
    for (const node of graph.nodes) {
      assert.ok([node.x0, node.x1, node.y0, node.y1].every(Number.isFinite));
      assert.ok(Math.abs(node.y1 - node.y0 - node.value * 352 / history.max_total) < 1e-6);
    }
  }
});

test('slider and date selection synchronize all displayed data and source revision', async () => {
  const app = await boot();
  assert.equal(app.q('figure').nextElementSibling, app.q('#text-summary'), 'Table follows the chart directly');
  assert.equal(app.q('#snapshot-picker').options.length, history.snapshots.length);
  assert.equal(app.q('#time-slider').value, String(history.snapshots.length - 1));
  for (const index of [0, 75, history.snapshots.length - 1]) {
    app.q('#time-slider').value = String(index); app.event('#time-slider', 'input');
    const s = history.snapshots[index];
    assert.equal(app.q('#snapshot-date').dateTime, s.as_of);
    assert.equal(app.q('#source-revision').href, s.source);
    assert.equal(app.q('[data-total]').textContent, s.total.toLocaleString('en-US'));
    for (const el of app.w.document.querySelectorAll('[data-attribute]')) {
      assert.equal(el.textContent, s.attributes[el.dataset.attribute].toLocaleString('en-US'));
    }
    for (const row of app.w.document.querySelectorAll('[data-status]')) {
      const key = row.dataset.status;
      const cells = row.querySelectorAll('td');
      assert.equal(cells[0].textContent, `${s.statuses[key].toLocaleString('en-US')} (${(100 * s.statuses[key] / s.total).toFixed(1)}%)`);
      if (s.lean[key] !== undefined) {
        const yes = s.lean[key], no = s.statuses[key] - yes;
        for (const [cell, value] of [[cells[1], yes], [cells[2], no]]) {
          const percent = s.statuses[key] ? (100 * value / s.statuses[key]).toFixed(1) + '%' : '—';
          assert.equal(cell.textContent, `${value.toLocaleString('en-US')} (${percent})`);
        }
      } else {
        assert.equal(cells[1].textContent, '—');
        assert.equal(cells[2].textContent, '—');
      }
    }
    assert.equal(app.q('[data-label="proved"] .node-count').textContent, String(s.statuses.proved));
    assert.equal(+app.q('[data-flow="0"]').getAttribute('stroke-width'), s.geometry.links[0].width);
  }
  app.q('#snapshot-picker').value = '0'; app.event('#snapshot-picker', 'change');
  assert.equal(app.q('#time-slider').value, '0');
  assert.equal(app.q('#previous-snapshot'), null);
  assert.equal(app.q('#next-snapshot'), null);
  assert.equal(app.q('#time-slider').style.getPropertyValue('--progress'), '0%');
  app.dom.window.close();
});

test('release markers map to snapshot spacing, pause playback, and link official sources', async () => {
  const app = await boot();
  assert.equal(app.w.document.querySelectorAll('.release-marker').length, releases.length);
  for (const release of releases) {
    const selector = `[data-release="${release.id}"]`;
    const index = history.snapshots.findIndex(snapshot => snapshot.as_of >= release.date);
    const before = history.snapshots[index - 1];
    const after = history.snapshots[index];
    const fractionalIndex = index === 0 ? 0 : index - 1 +
      (Date.parse(release.date) - Date.parse(before.as_of)) / (Date.parse(after.as_of) - Date.parse(before.as_of));
    assert.ok(Math.abs(parseFloat(app.q(selector).style.left) - 100 * fractionalIndex / (history.snapshots.length - 1)) < 1e-8);
    app.event('#play-timeline', 'click');
    app.event(selector, 'click');
    assert.equal(app.timers.size, 0);
    assert.equal(app.q('#snapshot-date').dateTime, after.as_of);
    assert.equal(app.q(selector).getAttribute('aria-pressed'), 'true');
    assert.equal(app.q('#release-current a').href, release.source);
    assert.equal(app.q(`${selector} time`).dateTime, release.date);
    if (release.date !== after.as_of) assert.match(app.q('#release-current').textContent, /next recorded snapshot/);
    if (release.note) assert.equal(app.q('.release-note').href, release.note_source);
  }
  app.dom.window.close();
});

test('nearby markers alternate around the slider with stems anchored to its axis', async () => {
  const app = await boot();
  const rail = app.q('#release-markers');
  const buttons = [...rail.querySelectorAll('button')];
  buttons.at(-1).focus();
  for (const width of [120, 220, 700]) {
    rail.getBoundingClientRect = () => ({ width });
    app.w.dispatchEvent(new app.w.Event('resize'));
    assert.equal(app.w.document.activeElement, buttons.at(-1), 'Relayout preserves keyboard focus');
    assert.notEqual(app.q('[data-release="fable-5-1"]').dataset.side, app.q('[data-release="astra"]').dataset.side);
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const dotY = parseFloat(button.style.top) + 12;
      const stem = parseFloat(button.style.getPropertyValue('--stem-length'));
      assert.equal(dotY + (button.dataset.side === 'above' ? stem : -stem), 0, 'Each stem touches the slider axis');
      for (let j = i + 1; j < buttons.length; j++) {
        if (buttons[i].style.top === buttons[j].style.top) {
          const gap = (parseFloat(buttons[j].style.left) - parseFloat(buttons[i].style.left)) * width / 100;
          assert.ok(gap >= 28 - 1e-8, '24px hit targets have at least 4px of separation');
        }
      }
    }
  }
  app.dom.window.close();
});

test('playback crosses releases and out-of-range events are omitted', async () => {
  const app = await boot();
  app.q('#time-slider').value = '0'; app.event('#time-slider', 'input');
  assert.equal(app.q('[aria-pressed="true"]'), null);
  const fable = history.snapshots.findIndex(snapshot => snapshot.as_of >= '2026-09-01');
  app.q('#time-slider').value = String(fable - 1); app.event('#time-slider', 'input');
  app.event('#play-timeline', 'click'); app.tick();
  assert.equal(app.q('[data-release="fable-5-1"]').getAttribute('aria-pressed'), 'true');
  assert.match(app.q('#release-current').textContent, /Claude Fable 5.1/);
  app.dom.window.close();
  const shorter = await boot({ data: { ...history, snapshots: history.snapshots.slice(70, 200) } });
  const expected = releases.filter(r => r.date >= history.snapshots[70].as_of && r.date <= history.snapshots[199].as_of);
  assert.equal(shorter.w.document.querySelectorAll('.release-marker').length, expected.length);
  assert.equal(shorter.q('[data-release="astra"]'), null);
  shorter.dom.window.close();
});

test('play replays from the start, supports speed/pause, and stops at the end', async () => {
  const app = await boot();
  app.event('#play-timeline', 'click');
  assert.equal(app.q('#time-slider').value, '0');
  assert.equal(app.q('#play-timeline').textContent.trim(), 'Ⅱ Pause');
  app.tick(); assert.equal(app.q('#time-slider').value, '1');
  for (const delay of [200, 100, 50, 25]) {
    app.q('#playback-speed').value = String(delay); app.event('#playback-speed', 'change');
    assert.equal(app.timers.values().next().value.delay, delay);
    app.tick();
  }
  app.event('#play-timeline', 'click'); assert.equal(app.timers.size, 0);
  app.event('#play-timeline', 'click');
  app.q('#time-slider').value = '10'; app.event('#time-slider', 'input');
  assert.equal(app.timers.size, 0, 'Manual selection pauses playback');
  app.q('#snapshot-picker').value = String(history.snapshots.length - 2); app.event('#snapshot-picker', 'change');
  app.event('#play-timeline', 'click'); app.tick();
  assert.equal(app.q('#time-slider').value, String(history.snapshots.length - 1));
  assert.equal(app.timers.size, 0);
  assert.equal(app.q('#time-slider').style.getPropertyValue('--progress'), '100%');
  app.dom.window.close();
});

test('animated transitions finish at exact selected D3 geometry; export uses selected date', async () => {
  const app = await boot({ reduced: false });
  app.q('#time-slider').value = '0'; app.event('#time-slider', 'input');
  assert.ok(app.frames.size > 0);
  app.finishAnimation();
  assert.equal(app.frames.size, 0);
  assert.equal(app.q('[data-flow="0"]').getAttribute('d'), history.snapshots[0].geometry.links[0].d);
  const link = app.q('#download-svg');
  link.addEventListener('click', e => e.preventDefault());
  app.event('#download-svg', 'click');
  assert.equal(link.download, `erdos-problems-${history.snapshots[0].as_of}.svg`);
  assert.equal(app.blobs.length, 1);
  assert.match(app.q('#flow-title').textContent, /2025/);
  app.dom.window.close();
});

test('failed history load preserves static chart and offers a working retry', async () => {
  const app = await boot({ fail: true });
  assert.ok(app.q('#play-timeline').disabled);
  assert.equal(app.q('#retry-history').hidden, false);
  assert.equal(app.q('[data-total]').textContent, history.snapshots.at(-1).total.toLocaleString('en-US'));
  app.w.fetch = async () => ({ ok: true, json: async () => structuredClone(history) });
  app.event('#retry-history', 'click'); await settle();
  assert.equal(app.q('#play-timeline').disabled, false);
  assert.equal(app.q('#retry-history').hidden, true);
  assert.equal(app.frames.size, 0, 'Reduced motion renders immediately');
  app.dom.window.close();
});
