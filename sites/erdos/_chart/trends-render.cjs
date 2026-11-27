const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = path.join(__dirname,'..');
const {fallback,releases,problems} = JSON.parse(fs.readFileSync(0,'utf8'));
const ids = ['pace','cumulative','composition','formal'];
const dom = new JSDOM('<body>'+ids.map(id=>`<section class="chart-card"><svg id="${id}"></svg><p class="chart-readout"></p></section>`).join('')+'</body>',{runScripts:'outside-only'});
const w=dom.window;
for(const file of [path.join(__dirname,'node_modules/d3/dist/d3.min.js'),path.join(site,'trends-data.js'),path.join(site,'trends-charts.js')]) w.eval(fs.readFileSync(file,'utf8'));
const T = w.ErdosTrends;
const hasCatalog = problems.schema_version === T.catalogVersion && problems.sources?.length;
const data = hasCatalog ? T.rollup(problems, 'bloom-tao') : T.validate(fallback);
const selected = T.defaultRelease(data, releases);
const overlay = hasCatalog && problems.sources.length > 1
  ? { primaryLabel: 'Bloom–Tao', label: 'Combined (union)', color: '#74559d', bandColor: '#8873b7', dashed: true, points: T.rollup(problems, 'combined').points }
  : null;
w.ErdosTrendCharts.pace(w.document.getElementById('pace'),data,'resolved',30,releases,selected,null,{},{showAllReleases:false});
w.ErdosTrendCharts.cumulative(w.document.getElementById('cumulative'),data,'resolved','counts',overlay);
w.ErdosTrendCharts.composition(w.document.getElementById('composition'),data,'resolved');
w.ErdosTrendCharts.formal(w.document.getElementById('formal'),data);
const out={
  data,
  selected,
  pace_text:w.ErdosTrendCharts.paceText('resolved',30),
  cumulative_legend: overlay
    ? '<span><i style="--key:#3977bd"></i>Bloom–Tao</span><span><i class="dashed" style="--key:#74559d"></i>Combined (union)</span>'
    : '<span><i style="--key:#3977bd"></i>Bloom–Tao</span>'
};
for(const id of ids) {
  const svg=w.document.getElementById(id);
  out[id]=svg.outerHTML;
  out[id+'_readout']=svg.parentElement.querySelector('.chart-readout').textContent;
}
out.months=w.ErdosTrends.monthly(data,'resolved');
out.recent=w.ErdosTrends.rolling(data,'resolved',30).at(-1);
out.events=out.recent ? T.events(data,'resolved',out.recent,['gained']) : [];
process.stdout.write(JSON.stringify(out));
dom.window.close();
