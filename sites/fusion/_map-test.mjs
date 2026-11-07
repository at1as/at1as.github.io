import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clusterMapSites, initialMapView, constrainMapView, zoomMapView, maxMapZoom } from './map-viewport.js';

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
for (const width of [330, 1154]) {
  for (const zoom of [1, 2.25, 8]) {
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
assert.ok(clusterMapSites(sites, 900 / 1154 / 8).length > clusterMapSites(sites, 900 / 1154).length, 'zoom reveals separate locations');
console.log('PASS: zoom anchoring, pan bounds, zoom limits, reset, and non-overlapping clusters retaining every site at phone/desktop sizes.');
