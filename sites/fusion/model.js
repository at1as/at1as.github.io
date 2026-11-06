/** Educational energy accounting, all powers in MW, pulse energy in MJ. */
export function balance(p) {
  const keys = ['gain','heating','energy','rate','driver','capture','thermal','aux'];
  if(keys.some(k => !Number.isFinite(p[k]) || p[k]<0) || p.driver<=0 || p.driver>1 || p.capture>1 || p.thermal>1) return {error:'Driver efficiency must be above zero; efficiencies must be between 0 and 100%.'};
  const delivered = p.mode === 'continuous' ? p.heating : p.energy*p.rate;
  const fusion=delivered*p.gain, gross=p.thermal*p.capture*fusion, driver=delivered/p.driver, aux=p.mode==='inertia'?p.aux*p.rate:p.aux, consumption=driver+aux;
  const denominator=p.thermal*p.capture*delivered;
  return {delivered,fusion,gross,driver,aux,consumption,net:gross-consumption,threshold:denominator>0?consumption/denominator:null,ratio:consumption>0?gross/consumption:null};
}
export const defaults = {
 continuous:{mode:'continuous',gain:10,heating:50,energy:10,rate:10,driver:.5,capture:1,thermal:.4,aux:50},
 pulsed:{mode:'pulsed',gain:30,heating:50,energy:10,rate:10,driver:.2,capture:1,thermal:.4,aux:100},
 inertia:{mode:'inertia',gain:25,heating:50,energy:10,rate:10,driver:.12,capture:1,thermal:.45,aux:5}
};
export function targetCost(rate,cost,net) {return net>0 ? 3600*rate*cost/net : null;}
export function readScenario(params) {
 const mode=['continuous','pulsed','inertia'].includes(params.get('mode'))?params.get('mode'):'continuous';
 const p={...defaults[mode]};
 const limits={gain:[0,100],heating:[0,200],energy:[0,20],rate:[0,20],driver:[.01,1],capture:[0,1],thermal:[0,.6],aux:[0,500]};
 for(const [k,[min,max]] of Object.entries(limits)) if(params.has(k)){const v=Number(params.get(k)); if(Number.isFinite(v))p[k]=Math.min(max,Math.max(min,v));}
 return p;
}
