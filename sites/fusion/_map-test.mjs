import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setMaxListeners } from 'node:events';
import { clusterMapSites, initialMapView, constrainMapView, zoomMapView, maxMapZoom, fitMapSites, buttonZoomMapView, mountMapViewport } from './map-viewport.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const start = initialMapView();
const zoomed = zoomMapView(start, 4);
// Button zoom keeps the same geographical centre.
close(zoomed.x + 900 / zoomed.zoom / 2, 450);
close(zoomed.y + 390 / zoomed.zoom / 2, 220);
// Zooming at a pointer keeps the point underneath it stationary.
const anchor = { x: 0.3, y: 0.7 };
const next = zoomMapView(zoomed, 1.5, anchor);
close(next.x + 900 * anchor.x / next.zoom, zoomed.x + 900 * anchor.x / zoomed.zoom);
close(next.y + 390 * anchor.y / next.zoom, zoomed.y + 390 * anchor.y / zoomed.zoom);
// Panning cannot lose the world off any edge, including after zooming out.
const edge = constrainMapView({ zoom: 4, x: 10000, y: -10000 });
assert.deepEqual(edge, { zoom: 4, x: 675, y: 25 });
assert.deepEqual(zoomMapView(edge, 0.01), start);
assert.equal(zoomMapView(start, 1000).zoom, maxMapZoom);
assert.deepEqual(constrainMapView({ zoom: 4, x: -100, y: 10000 }), { zoom: 4, x: 0, y: 317.5 });
assert.deepEqual(zoomMapView(zoomed, 0.25), start);
assert.deepEqual(start, initialMapView(), 'navigation must not mutate the reset view');
const sites = JSON.parse(readFileSync(new URL('./data.json', import.meta.url))).sites
  .filter(s => s.latitude !== null && s.longitude !== null);
const helionSites = sites.filter(s => /helion|polaris|orion/i.test(s.name));
const fitted = fitMapSites(helionSites);
assert.ok(helionSites.length >= 3);
assert.ok(fitted.zoom > 1, 'a regional search must zoom into its results');
for (const s of helionSites) {
  const x = (s.longitude + 180) * 2.5, y = (90 - s.latitude) * 2.5;
  assert.ok(x >= fitted.x && x <= fitted.x + 900 / fitted.zoom);
  assert.ok(y >= fitted.y && y <= fitted.y + 390 / fitted.zoom);
}
assert.deepEqual(fitMapSites([]), start, 'no coordinates must leave a useful world view');
assert.deepEqual(fitMapSites([{ latitude: null, longitude: null }]), start);
assert.equal(fitMapSites([helionSites[0], helionSites[0]]).zoom, maxMapZoom, 'co-located sites must have a finite bounded view');
assert.equal(fitMapSites(sites).zoom, 1, 'globally distributed results fit the world');
const firstButtonZoom = buttonZoomMapView(start, 2, sites);
const buttonCentre = { x: firstButtonZoom.x + 900 / firstButtonZoom.zoom / 2, y: firstButtonZoom.y + 390 / firstButtonZoom.zoom / 2 };
assert.ok(sites.some(s => Math.hypot((s.longitude + 180) * 2.5 - buttonCentre.x, (90 - s.latitude) * 2.5 - buttonCentre.y) < 1e-8), 'first button zoom must centre on a site');
assert.deepEqual(buttonZoomMapView(zoomed, 1.5, sites), zoomMapView(zoomed, 1.5), 'later zoom keeps the region chosen by the reader');
assert.deepEqual(buttonZoomMapView(start, 1.5, []), zoomMapView(start, 1.5));
// A two-finger gesture changes both scale and midpoint while retaining the
// same geographic point under that moving midpoint.
const destination = { x: 0.45, y: 0.55 };
const pinched = zoomMapView(zoomed, 1.25, anchor, destination);
close(pinched.x + 900 * destination.x / pinched.zoom, zoomed.x + 900 * anchor.x / zoomed.zoom);
close(pinched.y + 390 * destination.y / pinched.zoom, zoomed.y + 390 * anchor.y / zoomed.zoom);
for (const width of [330, 1154]) {
  for (const zoom of [1, 2.25, maxMapZoom]) {
    const scale = 900 / width / zoom;
    const groups = clusterMapSites(sites, scale);
    assert.deepEqual(groups.flat().map(s => s.id).sort(), sites.map(s => s.id).sort(), 'every visible site must appear exactly once');
    const centres = groups.map(g => ({
      x: g.reduce((n, s) => n + (s.longitude + 180) * 2.5, 0) / g.length,
      y: g.reduce((n, s) => n + (90 - s.latitude) * 2.5, 0) / g.length,
    }));
    for (let i = 0; i < centres.length; i++) {
      for (let j = i + 1; j < centres.length; j++) {
        const distance = Math.hypot(centres[i].x - centres[j].x, centres[i].y - centres[j].y) / scale;
        assert.ok(distance >= 28 - 1e-8, `marker hit areas overlap at ${width}px / ${zoom}x`);
      }
    }
  }
}
assert.ok(clusterMapSites(sites, 900 / 1154 / maxMapZoom).length > clusterMapSites(sites, 900 / 1154).length, 'zoom reveals separate locations');
assert.equal(clusterMapSites(helionSites, 900 / 330 / maxMapZoom).length, 2, 'even on mobile, distinct Helion locations separate while co-located records stay grouped');

// Exercise gesture/lifecycle behavior without a browser: two fingers, an
// interrupted animation, reset during momentum, and disposal on a filter change.
setMaxListeners(0);
let now = 0, nextFrame = 0, reducedMotion = false;
const frames = new Map();
globalThis.performance = { now: () => now };
globalThis.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
globalThis.matchMedia = () => ({ matches: reducedMotion });
globalThis.window = new EventTarget();
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
class Element extends EventTarget {
  classList = { add() {}, remove() {}, toggle() {} };
  captures = new Set();
  attributes = {};
  setAttribute(name, value) { this.attributes[name] = value; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 900, height: 390 }; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  closest() { return null; }
  focus() {}
}
const elements = Object.fromEntries(['.map-canvas', '[data-map-zoom="in"]', '[data-map-zoom="out"]', '[data-map-reset]', '.map-zoom-level'].map(key => [key, new Element()]));
const root = { querySelector: selector => elements[selector] }, canvas = elements['.map-canvas'];
const fire = (target, type, values = {}) => target.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), values));
function settle() {
  for (let i = 0; frames.size && i < 120; i++) {
    now += 16;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(now));
  }
  assert.equal(frames.size, 0, 'motion must finish');
}
const liveView = initialMapView();
let markerDraws = 0;
const control = mountMapViewport(root, liveView, () => markerDraws++, sites);
fire(elements['[data-map-zoom="in"]'], 'click');
assert.ok(frames.size > 0, 'button zoom animates');
settle();
assert.equal(liveView.zoom, 2);
assert.ok(markerDraws > 1, 'markers update during zoom');
control.focusSites(helionSites);
settle();
assert.equal(liveView.zoom, maxMapZoom);
fire(canvas, 'pointerdown', { pointerId: 1, button: 0, clientX: 100, clientY: 100 });
now += 16;
const beforeDrag = { ...liveView };
fire(window, 'pointermove', { pointerId: 1, clientX: 200, clientY: 140 });
assert.ok(liveView.x < beforeDrag.x && liveView.y < beforeDrag.y, 'drag follows the pointer');
fire(window, 'pointerup', { pointerId: 1 });
assert.ok(frames.size > 0, 'a quick drag coasts');
fire(elements['[data-map-reset]'], 'click');
settle();
assert.deepEqual(liveView, start, 'reset cancels momentum');
fire(canvas, 'pointerdown', { pointerId: 1, button: 0, clientX: 350, clientY: 200 });
fire(canvas, 'pointerdown', { pointerId: 2, button: 0, clientX: 550, clientY: 200 });
fire(window, 'pointermove', { pointerId: 2, clientX: 750, clientY: 200 });
assert.equal(liveView.zoom, 2, 'two fingers can zoom from the world view');
close(liveView.x + 450 * 550 / 900, 450);
fire(window, 'pointercancel', { pointerId: 2 });
fire(window, 'pointercancel', { pointerId: 1 });
control.focusSites(helionSites);
assert.ok(frames.size > 0);
control.dispose();
assert.equal(frames.size, 0, 'unmount cancels scheduled work');
const disposedView = { ...liveView };
fire(elements['[data-map-zoom="in"]'], 'click');
assert.deepEqual(liveView, disposedView, 'unmount removes event handlers');
reducedMotion = true;
const reducedControl = mountMapViewport(root, liveView, () => {}, sites);
reducedControl.focusSites(helionSites);
assert.equal(liveView.zoom, maxMapZoom);
assert.equal(frames.size, 0, 'reduced motion skips animation');
reducedControl.dispose();
console.log('PASS: filtered bounds, mobile clusters, pinch/drag, animation and momentum, reset, reduced motion, and lifecycle cleanup.');
