const fs = require('node:fs');
const { layout, render, geometry } = require('../sankey.js');

module.exports = { layout, render, geometry };
if (require.main === module) {
  const data = JSON.parse(fs.readFileSync(0, 'utf8'));
  if (process.argv.includes('--problem-grid')) {
    const { JSDOM } = require('jsdom');
    const { create } = require('../problem-grid.js');
    const dom = new JSDOM(data.html);
    const document = dom.window.document;
    create(document, false)(data.snapshot, data.sources);
    for (const tiles of document.querySelectorAll('#problem-grid-panels .problem-range-tiles')) {
      for (const tile of tiles.children) tile.before('\n        ');
      tiles.append('\n      ');
    }
    process.stdout.write(document.getElementById('problem-grid').outerHTML);
  } else if (process.argv.includes('--history')) {
    const maxTotal = Math.max(...data.snapshots.map(snapshot => snapshot.total));
    data.snapshots.forEach(snapshot => { snapshot.geometry = geometry(snapshot, maxTotal); });
    data.max_total = maxTotal;
    process.stdout.write(JSON.stringify(data));
  } else {
    process.stdout.write(render(data));
  }
}
