const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = path.join(__dirname,'..');
const {data,releases,selected} = JSON.parse(fs.readFileSync(0,'utf8'));
const dom = new JSDOM('<body>'+['pace','composition','formal'].map(id=>`<section class="chart-card"><svg id="${id}"></svg><p class="chart-readout"></p></section>`).join('')+'</body>',{runScripts:'outside-only'});
const w=dom.window;
for(const file of [path.join(__dirname,'node_modules/d3/dist/d3.min.js'),path.join(site,'trends-data.js'),path.join(site,'trends-charts.js')]) w.eval(fs.readFileSync(file,'utf8'));
w.ErdosTrends.validate(data);
w.ErdosTrendCharts.pace(w.document.getElementById('pace'),data,'resolved',30,releases,selected);
w.ErdosTrendCharts.composition(w.document.getElementById('composition'),data,'resolved');
w.ErdosTrendCharts.formal(w.document.getElementById('formal'),data);
const out={};
for(const id of ['pace','composition','formal']) {
  const svg=w.document.getElementById(id);
  out[id]=svg.outerHTML;
  out[id+'_readout']=svg.parentElement.querySelector('.chart-readout').textContent;
}
out.months=w.ErdosTrends.monthly(data,'resolved');
out.peak=out.months.reduce((a,b)=>b.gained>a.gained?b:a).date.slice(0,7);
out.events=w.ErdosTrends.events(data,'resolved',out.peak);
process.stdout.write(JSON.stringify(out));
dom.window.close();
