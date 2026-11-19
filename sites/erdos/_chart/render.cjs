const fs = require('node:fs');
const { layout, render, geometry } = require('../sankey.js');

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
