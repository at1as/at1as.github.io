import { balance } from "./model.js?v=58eee71b";

// Both teaching cases have identical plasma performance and thermal conversion.
export const efficiencyExamples = [0.5, 0.25].map(efficiency => ({
  efficiency,
  ...balance({ mode: "continuous", gain: 10, heating: 50, energy: 0, rate: 0,
    driver: efficiency, capture: 1, thermal: 0.4, aux: 50 }),
}));

function art(label, drawing, caption) {
  return `<figure class="engineering-art"><svg viewBox="0 0 400 300" font-family="Inter, Arial, sans-serif" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" rx="7" fill="#10212b"/>${drawing}</svg><figcaption>${caption}</figcaption></figure>`;
}
function plasma() {
  const nuclei = [[134,116,10],[201,94,11],[254,132,9],[178,168,11],[242,196,11],[112,188,8],[282,174,8],[216,144,9]];
  const electrons = [[96,120],[166,80],[286,98],[308,148],[154,212],[204,224],[272,226],[88,158],[204,118],[296,198]];
  return art("Illustration of confined nuclei and electrons in a plasma, with heat escaping outward; schematic", `
    <defs>
      <radialGradient id="engineering-plasma-glow"><stop stop-color="#e39256" stop-opacity=".4"/><stop offset=".68" stop-color="#d28749" stop-opacity=".12"/><stop offset="1" stop-color="#d28749" stop-opacity="0"/></radialGradient>
      <marker id="eng-loss" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 7 4 1 7" fill="none" stroke="#e89a6f" stroke-width="1.6"/></marker>
    </defs>
    <ellipse cx="200" cy="148" rx="165" ry="120" fill="url(#engineering-plasma-glow)"/>
    <ellipse cx="200" cy="148" rx="134" ry="88" fill="none" stroke="#6aa4b8" stroke-width="1.4" stroke-dasharray="5 5" opacity=".45"/>
    <g fill="none" stroke="#80bdd0" stroke-width="1.6" opacity=".55"><path d="M58 152C76 62 184 38 286 78"/><path d="M104 234C212 270 326 198 332 122"/><path d="M114 98C122 170 226 208 300 156"/></g>
    <g fill="none" stroke="#e89a6f" stroke-width="1.8" stroke-dasharray="4 3" marker-end="url(#eng-loss)" opacity=".85">
      <path d="M294 86 346 52"/>
      <path d="M312 186 364 210"/>
      <path d="M98 92 48 60"/>
    </g>
    <text x="348" y="42" text-anchor="middle" fill="#f0b08a" font-size="11.5" font-weight="600">Heat loss</text>
    ${nuclei.map(([x,y,r])=>`<path d="M${x-20} ${y+9}l15-7" stroke="#efaa75" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${r}" fill="#edac79"/><circle cx="${x-3}" cy="${y-3}" r="${r/3}" fill="#ffddaf"/>`).join("")}
    ${electrons.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5" fill="#9bd5e6"/>`).join("")}
    <circle cx="30" cy="276" r="5" fill="#edac79"/><text x="41" y="280" fill="#e3e8df" font-size="12">Nuclei</text>
    <circle cx="104" cy="276" r="3.5" fill="#9bd5e6"/><text x="114" y="280" fill="#e3e8df" font-size="12">Electrons</text>
    <line x1="190" y1="276" x2="210" y2="276" stroke="#80bdd0" stroke-width="2"/><text x="217" y="280" fill="#e3e8df" font-size="12">Field lines</text>
  `, "Magnetic fields guide charged particles while heat constantly tries to escape (schematic)");
}
function efficiencyComparison() {
  return `<figure class="engineering-example"><figcaption>Same 500 MW fusion output, opposite grid result</figcaption>
    <div class="efficiency-cases">${efficiencyExamples.map(e=>`<div class="efficiency-case">
      <div class="efficiency-head"><h5>${e.efficiency*100}% heating efficiency</h5><span class="efficiency-pill ${e.net<0?"negative":""}">${e.net<0?"Deficit":"Surplus"}</span></div>
      <div class="engineering-meter"><span>Electricity generated <b>${e.gross} MW</b></span><i><em style="width:${e.gross/250*100}%"></em></i></div>
      <div class="engineering-meter demand"><span>Total plant demand <b>${e.consumption} MW</b></span><i><em style="width:${e.consumption/250*100}%"></em></i></div>
      <p class="efficiency-loads">${e.driver} MW heating + ${e.aux} MW other plant loads</p>
      <p class="efficiency-result ${e.net<0?"negative":""}"><strong>${e.net<0?"−":"+"}${Math.abs(e.net)} MW</strong><span>${e.net<0?"Needed from the grid":"Available to the grid"}</span></p>
    </div>`).join("")}</div>
    <p class="engineering-figure-note">Illustrative thermal-plant comparison: 500 MW fusion power, 50 MW delivered heating, 40% thermal efficiency, and 50 MW other loads (omitting recovered heating and blanket gain)</p>
  </figure>`;
}
function turnaround() {
  return `<figure class="engineering-example pulse-example"><figcaption>A laser-fusion plant has to complete this cycle several times a second</figcaption>
    <div class="pulse-turnaround">
      <div class="pulse-shot"><span aria-hidden="true">✦</span><strong>Fusion pulse</strong></div>
      <div class="pulse-reset"><strong>Reset between shots (~10×/sec in proposed plants)</strong><ul><li>Clear debris and restore the chamber</li><li>Inject and track a fresh cryogenic target</li><li>Recharge the laser driver</li></ul></div>
      <div class="pulse-shot"><span aria-hidden="true">✦</span><strong>Next pulse</strong></div>
    </div>
    <p class="engineering-figure-note">Tasks can overlap; exact timing and equipment depend on the design</p>
  </figure>`;
}
function fuelInventory() {
  return `<figure class="engineering-example fuel-inventory"><figcaption>Usable tritium inventory during plant operation</figcaption>
    <div class="inventory-key"><span><i></i>Breeding &amp; recovery keep pace</span><span><i></i>Replenishment falls behind</span></div>
    <svg viewBox="0 0 440 280" font-family="Inter, Arial, sans-serif" role="img" aria-label="Illustrative usable-fuel inventory: it stays above an operating reserve when replenishment keeps pace, but drops into a shortfall zone when replenishment lags." xmlns="http://www.w3.org/2000/svg">
      <rect x="48" y="186" width="366" height="46" fill="#ac593b" fill-opacity=".1"/>
      <path d="M48 22V232H414" fill="none" stroke="#81978a" stroke-width="1.5"/>
      <path d="M48 186H414" stroke="#ac593b" stroke-opacity=".6" stroke-dasharray="5 5"/>
      <text x="56" y="178" fill="#64786a" font-size="12.5" font-weight="600">Operating reserve</text>
      <text x="56" y="218" fill="#9a4b2f" font-size="11.5">Shortfall / outage risk</text>
      <path d="M50 84C108 77 131 98 184 86S278 96 327 85 370 86 406 82" fill="none" stroke="#3f7a5c" stroke-width="3.8" stroke-linecap="round"/>
      <path d="M50 84C128 89 191 114 244 142S335 196 406 218" fill="none" stroke="#b05232" stroke-width="3.8" stroke-dasharray="8 5" stroke-linecap="round"/>
      <circle cx="406" cy="82" r="4.5" fill="#3f7a5c"/><text x="404" y="66" text-anchor="end" fill="#2e6449" font-size="12" font-weight="650">Self-sustaining</text>
      <circle cx="406" cy="218" r="4.5" fill="#b05232"/><text x="404" y="176" text-anchor="end" fill="#9a4b2f" font-size="12" font-weight="650">Depleting</text>
      <text transform="translate(19 135) rotate(-90)" text-anchor="middle" fill="#486150" font-size="13.5">Usable fuel</text>
      <text x="231" y="262" text-anchor="middle" fill="#486150" font-size="13.5">Time in operation →</text>
    </svg><p class="engineering-figure-note">Illustrative trends showing usable fuel when tritium breeding and extraction keep pace versus lag behind</p>
  </figure>`;
}
function material() {
  return art("14.1 MeV neutrons striking a reactor wall and displacing atoms in its crystal lattice", `
    <defs>
      <linearGradient id="engineering-wall" x1="0" x2="1"><stop stop-color="#45666e"/><stop offset="1" stop-color="#263f4b"/></linearGradient>
      <radialGradient id="engineering-impact"><stop stop-color="#f2a266" stop-opacity=".85"/><stop offset=".6" stop-color="#d97542" stop-opacity=".28"/><stop offset="1" stop-color="#d97542" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="M192 70 294 44 352 78 250 105Z" fill="#63837e" stroke="#8aa8a0"/>
    <path d="M250 105 352 78V230L250 262Z" fill="url(#engineering-wall)" stroke="#6f908f"/>
    <path d="M192 70 250 105V262L192 227Z" fill="#5b797a" stroke="#8aa8a0"/>
    <g fill="none" stroke="#a9c0b2" opacity=".3"><path d="M211 82v156m20-143v155M192 110l58 35M192 150l58 35M192 190l58 35"/></g>
    <ellipse cx="220" cy="154" rx="46" ry="64" fill="url(#engineering-impact)"/>
    <!-- Displaced atoms / damage cascade inside wall -->
    <g fill="none" stroke="#f5be8e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".85">
      <path d="M203 151 215 144 236 134"/><path d="M215 144 232 162 224 184"/><path d="M203 151 208 171"/>
    </g>
    <g fill="#f5be8e" stroke="#9e4522" stroke-width="1.1">
      <circle cx="215" cy="144" r="4"/><circle cx="232" cy="162" r="3.5"/><circle cx="208" cy="171" r="3.5"/>
      <circle cx="236" cy="134" r="3"/><circle cx="224" cy="184" r="3"/>
    </g>
    <!-- Incoming neutrons -->
    <g stroke="#9dc9d9" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round">
      <path d="M28 136 174 150"/><path d="M58 84 166 112"/><path d="M44 208 166 190"/>
    </g>
    <g fill="#b9e2eb" stroke="#10212b" stroke-width="2">
      <circle cx="174" cy="150" r="10"/><circle cx="132" cy="103" r="8.5"/><circle cx="106" cy="199" r="8.5"/>
    </g>
    <g text-anchor="middle" font-weight="700" fill="#18323d">
      <text x="174" y="154" font-size="12">n</text>
      <text x="132" y="107" font-size="11">n</text>
      <text x="106" y="203" font-size="11">n</text>
    </g>
    <text x="24" y="256" fill="#c7dde6" font-size="12.5" font-weight="600">14.1 MeV neutrons</text>
    <text x="296" y="279" text-anchor="middle" fill="#cfe0d8" font-size="12.5" font-weight="600">First wall &amp; blanket</text>
    <text x="296" y="34" text-anchor="middle" fill="#f4b98d" font-size="11.5" font-weight="600">Displaced atoms</text>
    <path d="M262 39 226 134" fill="none" stroke="#f4b98d" stroke-width="1" stroke-dasharray="2 3" opacity=".8"/>
  `, "Energetic neutrons knock atoms out of place inside structural walls over years of operation (schematic)");
}
function plant() {
  return art("Conceptual fusion power station showing reactor hall, turbine hall, cooling towers, and grid connection", `
    <defs>
      <radialGradient id="reactor-core-glow"><stop stop-color="#f2a266" stop-opacity=".42"/><stop offset="1" stop-color="#f2a266" stop-opacity="0"/></radialGradient>
    </defs>
    <path d="M22 232 180 166 382 224 214 282Z" fill="#19333d" stroke="#36545f"/>
    <ellipse cx="116" cy="116" rx="54" ry="30" fill="url(#reactor-core-glow)"/>
    <g stroke="#7ba6a3" stroke-width="1.4" stroke-linejoin="round">
      <path d="M60 154 129 128 189 156 119 184Z" fill="#43696e"/><path d="M60 154v72l59 29v-71Z" fill="#294c57"/><path d="M119 184 189 156v72l-70 27Z" fill="#375d66"/>
      <path d="M145 192 255 149 324 180 214 224Z" fill="#557778"/><path d="M145 192v34l69 32v-34Z" fill="#355761"/><path d="M214 224 324 180v34l-110 44Z" fill="#284a54"/>
      <path d="M77 150V123C77 95 139 78 153 106v34" fill="#3a666d"/><ellipse cx="116" cy="116" rx="39" ry="17" fill="#588587"/>
      <path d="M272 127c10-22 11-38 9-58h27c-2 20-1 36 10 58Z" fill="#486b72"/><ellipse cx="294" cy="69" rx="13" ry="5" fill="#1c353d"/>
      <path d="M316 147c8-20 9-33 7-49h24c-2 16-1 29 8 49Z" fill="#385d68"/><ellipse cx="335" cy="98" rx="12" ry="4" fill="#1c353d"/>
    </g>
    <g fill="#f2b888" opacity=".85"><path d="m71 181 12 6v8l-12-6Zm19 9 12 6v8l-12-6Z"/></g>
    <g fill="#9ed4bc" opacity=".85"><path d="m232 225 14-6v8l-14 6Zm24-10 14-6v8l-14 6Zm24-10 14-6v8l-14 6Z"/></g>
    <g fill="none" stroke="#a6c4bf" stroke-width="2"><path d="M225 109 239 42 253 109M228 94h22m-19-20h16m-16 20 16-20m-12-21h9M219 56h40m-43 18h46"/><path d="M259 56q30 16 60 8M262 74q28 12 58 10" stroke-width="1"/></g>
    <path d="M42 263h100m17 0h30" stroke="#8fb4a1" stroke-width="2" opacity=".5"/>
    <!-- Clean architectural callouts -->
    <g font-size="11.5" font-weight="600" fill="#dce8e2">
      <text x="116" y="42" text-anchor="middle" fill="#f5bf93">Reactor hall</text>
      <path d="M116 48v44" stroke="#f5bf93" stroke-width="1" stroke-dasharray="2 3" opacity=".8"/>
      <text x="239" y="26" text-anchor="middle">Grid tie</text>
      <text x="336" y="54" text-anchor="middle">Cooling</text>
      <text x="294" y="276" text-anchor="middle">Turbine hall</text>
      <path d="M268 262 246 226" stroke="#a6c4bf" stroke-width="1" stroke-dasharray="2 3" opacity=".8"/>
    </g>
  `, "The reactor core is one part of a full power station alongside turbines, cooling, and grid infrastructure (conceptual)");
}

export function engineeringDiagram(theme) {
  return ({ plasma_and_fuel_physics: plasma, electrical_balance: efficiencyComparison,
    sustained_operation: turnaround, fuel_cycle: fuelInventory,
    materials_and_maintenance: material, delivery_and_economics: plant })[theme]?.() || "";
}
