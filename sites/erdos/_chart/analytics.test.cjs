const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const site = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(site, 'analytics.js'), 'utf8');
const config = fs.readFileSync(path.join(site, '..', '..', '_config.yml'), 'utf8');
const measurementId = config.match(/^google_analytics:\s*"([^"]+)"/m)[1];
const productionURL = 'https://www.jasonwillems.com/sites/erdos/';

function boot(url = productionURL, id = measurementId) {
  // No external resources are loaded, and no test traffic is sent to Google.
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  const el = dom.window.document.getElementById('analytics-config');
  el.textContent = JSON.stringify({ ...JSON.parse(el.textContent), measurementId: id });
  dom.window.eval(script);
  return dom;
}

test('production analytics uses the shared GA4 property and initializes only once', () => {
  const dom = boot(productionURL + '?utm_source=test');
  const w = dom.window;
  const tag = w.document.getElementById('erdos-google-tag');
  assert.equal(tag.src, `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  assert.equal(tag.async, true);
  assert.equal(w.dataLayer.length, 2);
  assert.equal(w.dataLayer[0][0], 'js');
  assert.equal(w.dataLayer[1][0], 'config');
  assert.equal(w.dataLayer[1][1], measurementId);
  assert.equal(w.dataLayer[1][2].page_title, w.document.querySelector('meta[property="og:title"]').content);
  assert.equal(w.dataLayer[1][2].send_page_view, undefined, 'Use the single default GA4 pageview');
  assert.equal(w.dataLayer[1][2].page_location, undefined, 'Preserve the actual URL and campaign parameters');
  w.eval(script);
  assert.equal(w.document.querySelectorAll('#erdos-google-tag').length, 1);
  assert.equal(w.dataLayer.length, 2);
  dom.window.close();
});

test('analytics is disabled for local previews, unrelated hosts, and absent IDs', () => {
  for (const [url, id] of [
    ['http://127.0.0.1:4178/sites/erdos/', measurementId],
    ['http://localhost:4178/sites/erdos/', measurementId],
    ['https://preview.jasonwillems.com/sites/erdos/', measurementId],
    ['https://example.com/sites/erdos/', measurementId],
    [productionURL, ''],
  ]) {
    const dom = boot(url, id);
    assert.equal(dom.window.document.getElementById('erdos-google-tag'), null);
    assert.equal(dom.window.dataLayer, undefined);
    dom.window.close();
  }
  const apex = boot('https://jasonwillems.com/sites/erdos/');
  assert.ok(apex.window.document.getElementById('erdos-google-tag'));
  apex.window.close();
});

test('links back to Jason’s site record their placement without blocking navigation', () => {
  const dom = boot();
  const w = dom.window;
  for (const placement of ['breadcrumb', 'header', 'footer']) {
    const link = w.document.querySelector(`[data-site-link="${placement}"]`);
    const event = new w.MouseEvent('click', { bubbles: true, cancelable: true });
    w.document.addEventListener('click', e => {
      assert.equal(e.defaultPrevented, false, 'Analytics must not intercept the link');
      e.preventDefault(); // Avoid attempting navigation in JSDOM.
    }, { once: true });
    (link.querySelector('span') || link).dispatchEvent(event);
    const call = w.dataLayer.at(-1);
    assert.equal(call[0], 'event');
    assert.equal(call[1], 'site_visit');
    assert.equal(call[2].link_location, placement);
    assert.equal(call[2].link_url, 'https://www.jasonwillems.com/');
  }
  assert.equal(w.dataLayer.filter(call => call[0] === 'config').length, 1);
  dom.window.close();
});

test('generated page exposes consistent metadata, source attribution, and content without JavaScript', () => {
  const dom = new JSDOM(html);
  const d = dom.window.document;
  const q = selector => d.querySelector(selector);
  assert.match(d.title, /Erdős Problems Sankey.*History.*Jason Willems/);
  assert.equal(q('link[rel="canonical"]').href, productionURL);
  assert.equal(q('meta[property="og:url"]').content, productionURL);
  assert.equal(q('meta[property="og:title"]').content, d.title);
  assert.equal(q('meta[name="twitter:title"]').content, d.title);
  assert.equal(q('meta[property="og:description"]').content, q('meta[name="description"]').content);
  const structured = JSON.parse(q('script[type="application/ld+json"]').textContent);
  assert.equal(structured.url, productionURL);
  assert.equal(structured.author.name, 'Jason Willems');
  assert.equal(structured.isBasedOn, q('#source-revision').href);
  assert.equal(structured.description, q('meta[name="description"]').content);
  assert.equal(d.querySelectorAll('h1').length, 1);
  assert.equal(d.querySelectorAll('[data-status]').length, 10);
  assert.ok(q('figure svg'));
  assert.equal(q('#text-summary').tagName, 'SECTION');
  assert.equal(q('#text-summary summary'), null);
  assert.ok(q('#text-summary table'));
  dom.window.close();
});
