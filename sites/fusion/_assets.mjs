import { writeFileSync, readFileSync } from 'node:fs';
import { renderMachine } from './diagrams.js';

// Use the landing illustration's geometry at a larger scale. Fine callouts are
// omitted in the social card so the machine remains legible at feed size.
const machine = renderMachine('tokamak', 3, {
  fieldOverview: true,
  overviewLabels: false,
  overviewLegend: false,
})
  .replace(/<svg[^>]+>/, '<g transform="translate(456 65) scale(1.13)">')
  .replace('</svg>', '</g>');
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f7f5ef"/>
<rect x="565" y="40" width="595" height="550" rx="8" fill="#101c29"/>
<g font-family="Arial,sans-serif">
  <text x="55" y="82" fill="#384e45" font-size="15" letter-spacing="3">FUSION ATLAS</text>
  <text x="55" y="398" fill="#354945" font-size="21">Reactor designs, experimental results</text>
  <text x="55" y="430" fill="#354945" font-size="21">and the engineering of fusion power</text>
  <text x="55" y="554" fill="#65766b" font-size="13">JASONWILLEMS.COM / SITES / FUSION</text>
  <text x="600" y="82" fill="#a5b7c3" font-size="12" letter-spacing="1.5">TOKAMAK · MAGNETIC CONFINEMENT</text>
</g>
<g font-family="Georgia,serif" font-size="78">
  <text x="50" y="212" fill="#182630">The paths to</text>
  <text x="50" y="302" fill="#b94e2b">fusion power.</text>
</g>
${machine}
<g font-family="Arial,sans-serif" font-size="14" fill="#b9c8cf">
  <path d="M605 549h20" stroke="#69baff" stroke-width="2.5"/><text x="633" y="554">Field</text>
  <path d="M730 549h20" stroke="#ff925c" stroke-width="2.5"/><text x="758" y="554">Plasma</text>
  <path d="M864 549h20" stroke="#9ee4cb" stroke-width="2.5"/><text x="892" y="554">Exhaust</text>
  <path d="M1012 549h20" stroke="#a8bac4" stroke-width="2.5"/><text x="1040" y="554">Magnets</text>
</g>
</svg>`;
writeFileSync(new URL('./share-card.svg', import.meta.url), card);
const includePath = new URL('../../_includes/site-preview.html', import.meta.url);
let include = readFileSync(includePath, 'utf8');
const marker = "{% when 'fusion' %}";
if (include.includes(marker))
  include = include.replace(/\{% when 'fusion' %\}[\s\S]*?(?=\{% when )/, '');
const preview = card
  .replace('width="1200" height="630" viewBox="0 0 1200 630"', 'viewBox="0 0 1200 760" focusable="false"')
  .replace('height="630" fill="#f7f5ef"', 'height="760" fill="#f7f5ef"');
include = include.replace('{% case include.preview %}', `{% case include.preview %}\n${marker}\n${preview}`);
writeFileSync(includePath, include);
console.log('Generated share card and directory artwork.');
