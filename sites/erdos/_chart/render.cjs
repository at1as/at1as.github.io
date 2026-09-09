const fs = require('node:fs');
const { sankey, sankeyJustify, sankeyLinkHorizontal } = require('d3-sankey');

const palette = {
  gray: '#a3adba', blue: '#5b9ddd', green: '#65bd89',
  orange: '#ed965d', purple: '#a284ce', red: '#ed8990',
};
const resolvedStatuses = [
  ['proved', 'Proved', 'green', 'proof'],
  ['disproved', 'Disproved', 'orange', 'disproof'],
  ['solved', 'Otherwise solved', 'purple', 'solution'],
];
const openStatuses = [
  ['open', 'Completely open'], ['decidable', 'Decidable'],
  ['falsifiable', 'Falsifiable'], ['verifiable', 'Verifiable'],
  ['not provable', 'Not provable in ZFC'],
  ['not disprovable', 'Not disprovable in ZFC'],
  ['independent', 'Independent of ZFC'],
];
const escape = text => String(text).replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[ch]));
const format = value => value.toLocaleString('en-US');
const url = query => 'https://teorth.github.io/erdosproblems/' +
  (query ? '?' + new URLSearchParams(query).toString() : '');

function layout(data, maxTotal = data.total) {
  const nodes = [], links = [];
  const add = (id, label, color, href) => nodes.push({ id, label, color, href });
  const flow = (source, target, value) => links.push({ source, target, value });
  const resolved = resolvedStatuses.reduce((sum, [id]) => sum + data.statuses[id], 0);
  add('all', 'All problems', 'gray', url());
  add('resolved', 'Resolved', 'blue');
  add('unresolved', 'Open / unresolved', 'red');
  flow('all', 'resolved', resolved);
  flow('all', 'unresolved', data.total - resolved);
  for (const [id, label, color, kind] of resolvedStatuses) {
    add(id, label, color, url({ status: id }));
    add(id + '-lean', 'Lean-formalized ' + kind, color, url({ status: id, formal: 'Lean' }));
    add(id + '-other', 'Not Lean-formalized', color);
    flow('resolved', id, data.statuses[id]);
    flow(id, id + '-lean', data.lean[id]);
    flow(id, id + '-other', data.statuses[id] - data.lean[id]);
  }
  for (const [id, label] of openStatuses) {
    add(id, label, 'red', url({ status: id }));
    flow('unresolved', id, data.statuses[id]);
  }
  return sankey()
    .nodeId(node => node.id)
    .nodeAlign(sankeyJustify)
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(16)
    .nodePadding(44)
    // Keep one count-to-pixel scale across the entire historical series.
    .extent([[32, 80], [932, 80 + 528 + 352 * data.total / maxTotal]])
    .iterations(64)({ nodes, links });
}

function render(data) {
  const graph = layout(data);
  const resolved = graph.nodes.find(node => node.id === 'resolved').value;
  const path = sankeyLinkHorizontal();
  const parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1000" role="group" aria-labelledby="flow-title flow-desc">',
    '<title id="flow-title">Erdős problems: status and Lean formalization</title>',
    `<desc id="flow-desc">${format(data.total)} problems divide into ${format(resolved)} resolved and ${format(data.total - resolved)} open or unresolved. Layout by D3 Sankey. Bar heights and ribbon widths are proportional to counts. A text table follows the chart.</desc>`,
    `<metadata id="flow-source">Data: Erdős problems database contributors, maintained by Thomas Bloom and Terence Tao. Source: ${escape(data.source)}. Snapshot: ${escape(data.as_of)}. Visualization: Jason Willems. Layout: D3 Sankey.</metadata>`,
    `<style>
      text { font-family: Arial, Helvetica, sans-serif; fill: #17253c; }
      .node-title { font-size: 19px; font-weight: 500; }
      .node-count { font-size: 23px; font-weight: 700; font-variant-numeric: tabular-nums; }
      .branch .node-title { font-size: 20px; font-weight: 600; }
      .branch .node-count { font-size: 27px; }
      .node-label { paint-order: stroke; stroke: #fdfdfe; stroke-width: 6px; stroke-linejoin: round; }
      .flow { fill: none; stroke-opacity: .38; }
      .flow:hover { stroke-opacity: .65; }
      a:hover .node-title, a:focus .node-title { text-decoration: underline; }
      a:focus { outline: none; }
      a:focus .node-bar { stroke: #17253c; stroke-width: 2px; }
    </style>`,
    '<defs>',
  ];
  for (const item of graph.links) {
    parts.push(`<linearGradient id="flow-${item.index}" gradientUnits="userSpaceOnUse" x1="${item.source.x1}" x2="${item.target.x0}" y1="0" y2="0"><stop stop-color="${palette[item.source.color]}"/><stop offset="1" stop-color="${palette[item.target.color]}"/></linearGradient>`);
  }
  parts.push('</defs>');
  for (const item of graph.links) {
    parts.push(`<path class="flow" data-flow="${item.index}" d="${path(item)}" stroke="url(#flow-${item.index})" stroke-width="${item.width}"><title>${escape(item.source.label)} → ${escape(item.target.label)}: ${format(item.value)}</title></path>`);
  }
  // Draw all bars first, then all labels so a later ribbon or bar cannot obscure text.
  for (const node of graph.nodes) {
    const terminal = node.sourceLinks.length === 0;
    const tag = node.href ? 'a' : 'g';
    parts.push(`<${tag}${node.href ? ` href="${escape(node.href)}"` : ''} data-node="${node.id}" class="node ${terminal ? 'terminal' : 'branch'}">`);
    parts.push(`<title>${escape(node.label)}: ${format(node.value)} (${(node.value / data.total * 100).toFixed(1)}% of all problems)</title>`);
    parts.push(`<rect class="node-bar" x="${node.x0}" y="${node.y0}" width="${node.x1 - node.x0}" height="${node.y1 - node.y0}" fill="${palette[node.color]}" rx="${Math.min(2, (node.y1 - node.y0) / 2)}"/>`);
    parts.push(`</${tag}>`);
  }
  for (const node of graph.nodes) {
    const terminal = node.sourceLinks.length === 0;
    const x = terminal ? node.x1 + 16 : node.x0;
    const y = terminal ? (node.y0 + node.y1) / 2 - 5 : node.y0 - 39;
    const tag = node.href ? 'a' : 'g';
    // The bar provides the keyboard target; this duplicate label link is pointer-only.
    parts.push(`<${tag}${node.href ? ` href="${escape(node.href)}" tabindex="-1" aria-hidden="true"` : ''} data-label="${node.id}" class="${terminal ? 'terminal' : 'branch'}">`);
    parts.push(`<text class="node-label node-title" x="${x}" y="${y}">${escape(node.label)}</text>`);
    parts.push(`<text class="node-label node-count" x="${x}" y="${y + (terminal ? 28 : 31)}">${format(node.value)}</text>`);
    parts.push(`</${tag}>`);
  }
  parts.push('</svg>');
  return parts.join('\n');
}

function geometry(data, maxTotal) {
  const graph = layout(data, maxTotal);
  const round = number => Math.round(number * 1000) / 1000;
  const path = sankeyLinkHorizontal();
  return {
    nodes: graph.nodes.map(node => ({ id: node.id, value: node.value,
      y0: round(node.y0), y1: round(node.y1), terminal: !node.sourceLinks.length })),
    links: graph.links.map(item => ({ value: item.value, width: round(item.width),
      d: path(item).replace(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi, n => round(Number(n))) })),
  };
}

module.exports = { layout, render, geometry };
if (require.main === module) {
  const data = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (process.argv.includes('--history')) {
    const maxTotal = Math.max(...data.snapshots.map(snapshot => snapshot.total));
    data.snapshots.forEach(snapshot => { snapshot.geometry = geometry(snapshot, maxTotal); });
    data.max_total = maxTotal;
    process.stdout.write(JSON.stringify(data));
  } else {
    process.stdout.write(render(data));
  }
}
