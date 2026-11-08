import { balance } from "./model.js";

// Both teaching cases have identical plasma performance and thermal conversion.
export const efficiencyExamples = [0.5, 0.25].map(efficiency => ({
  efficiency,
  ...balance({ mode: "continuous", gain: 10, heating: 50, energy: 0, rate: 0,
    driver: efficiency, capture: 1, thermal: 0.4, aux: 50 }),
}));

function art(label, drawing, caption) {
  return `<figure class="engineering-art"><svg viewBox="0 0 400 300" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" rx="7" fill="#10212b"/>${drawing}</svg><figcaption>${caption}</figcaption></figure>`;
}
function plasma() {
  const nuclei = [[130,113,10],[201,88,12],[259,130,9],[176,172,11],[244,204,12],[102,197,8],[290,177,8],[221,146,9]];
  const electrons = [[91,118],[164,75],[292,91],[320,145],[153,222],[206,235],[280,238],[80,160],[204,116],[306,207]];
  return art("Illustration of nuclei and electrons moving in a plasma; positions and sizes are schematic", `
    <defs><radialGradient id="engineering-plasma-glow"><stop stop-color="#d28749" stop-opacity=".35"/><stop offset="1" stop-color="#d28749" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="200" cy="150" rx="180" ry="145" fill="url(#engineering-plasma-glow)"/>
    <g fill="none" stroke="#80bdd0" stroke-width="1.5" opacity=".45"><path d="M47 154C63 54 184 27 291 72"/><path d="M103 246C216 286 335 206 339 124"/><path d="M112 95C119 174 229 214 306 158"/></g>
    ${nuclei.map(([x,y,r])=>`<path d="M${x-23} ${y+11}l18-8" stroke="#efaa75" stroke-opacity=".35" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r}" fill="#edac79"/><circle cx="${x-3}" cy="${y-3}" r="${r/3}" fill="#ffddaf"/>`).join("")}
    ${electrons.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5" fill="#9bd5e6"/>`).join("")}
    <circle cx="33" cy="275" r="5" fill="#edac79"/><text x="45" y="280" fill="#e3e8df" font-size="13">Nuclei</text><circle cx="132" cy="275" r="3" fill="#9bd5e6"/><text x="143" y="280" fill="#e3e8df" font-size="13">Electrons</text>
  `, "A moving mixture of nuclei and electrons. Illustration only; particle sizes and spacing are not to scale.");
}
function efficiencyComparison() {
  return `<figure class="engineering-example"><figcaption>Same fusion output. Different electrical result.</figcaption>
    <div class="efficiency-cases">${efficiencyExamples.map(e=>`<div class="efficiency-case">
      <h5>${e.efficiency*100}% heating efficiency</h5>
      <div class="engineering-meter"><span>Electricity generated <b>${e.gross} MW</b></span><i><em style="width:${e.gross/250*100}%"></em></i></div>
      <div class="engineering-meter demand"><span>Total plant demand <b>${e.consumption} MW</b></span><i><em style="width:${e.consumption/250*100}%"></em></i></div>
      <p class="efficiency-loads">${e.driver} MW for heating + ${e.aux} MW for other systems</p>
      <p class="efficiency-result ${e.net<0?"negative":""}"><strong>${e.net<0?"−":"+"}${Math.abs(e.net)} MW</strong><span>${e.net<0?"Needed from the grid":"Available to the grid"}</span></p>
    </div>`).join("")}</div>
    <p class="engineering-figure-note">Illustrative thermal-plant comparison: 500 MW of fusion power, 50 MW of delivered heating, full fusion-energy capture, 40% heat-to-electricity efficiency, and 50 MW of other electrical loads. These are teaching assumptions, not an operating facility.</p>
  </figure>`;
}
function turnaround() {
  return `<figure class="engineering-example pulse-example"><figcaption>A laser-fusion plant has to complete the cycle</figcaption>
    <div class="pulse-turnaround">
      <div class="pulse-shot"><span aria-hidden="true">✦</span><strong>Fusion pulse</strong></div>
      <div class="pulse-reset"><strong>Ready for the next shot</strong><ul><li>Clear debris and restore the chamber</li><li>Deliver and position a fresh target</li><li>Recharge the laser</li></ul></div>
      <div class="pulse-shot"><span aria-hidden="true">✦</span><strong>Next pulse</strong></div>
    </div>
    <p class="engineering-figure-note">Tasks can overlap. Timing and equipment depend on the design; this sketch does not show durations.</p>
  </figure>`;
}
function fuelInventory() {
  return `<figure class="engineering-example fuel-inventory"><figcaption>Fuel available to run the reactor</figcaption>
    <div class="inventory-key"><span><i></i>Replenishment keeps pace</span><span><i></i>Replenishment falls behind</span></div>
    <svg viewBox="0 0 440 290" role="img" aria-label="Illustrative usable-fuel inventory: it stays above an operating reserve when replenishment keeps pace, but falls below the reserve when replenishment lags. No measured data or time scale is implied." xmlns="http://www.w3.org/2000/svg">
      <path d="M48 25V242H418" fill="none" stroke="#81978a" stroke-width="1.5"/>
      <path d="M48 196H418" stroke="#a5b4a7" stroke-dasharray="5 5"/><text x="58" y="187" fill="#64786a" font-size="14">Operating reserve</text>
      <path d="M50 89C108 81 131 105 184 91S278 104 327 91 373 92 414 88" fill="none" stroke="#477f63" stroke-width="4"/>
      <path d="M50 89C128 94 191 119 244 148S339 205 414 228" fill="none" stroke="#ac593b" stroke-width="4" stroke-dasharray="8 5"/>
      <circle cx="414" cy="88" r="4.5" fill="#477f63"/><circle cx="414" cy="228" r="4.5" fill="#ac593b"/>
      <text transform="translate(20 150) rotate(-90)" text-anchor="middle" fill="#486150" font-size="15">Usable fuel inventory</text><text x="235" y="273" text-anchor="middle" fill="#486150" font-size="15">Time in operation →</text>
    </svg><p class="engineering-figure-note">Illustrative trends, not measured data or a forecast. Replenishment includes producing and recovering usable fuel.</p>
  </figure>`;
}
function material() {
  return art("Neutrons travelling into a schematic block of reactor material", `
    <defs><linearGradient id="engineering-wall" x1="0" x2="1"><stop stop-color="#46646b"/><stop offset="1" stop-color="#28414d"/></linearGradient><radialGradient id="engineering-impact"><stop stop-color="#efad7c" stop-opacity=".8"/><stop offset="1" stop-color="#efad7c" stop-opacity="0"/></radialGradient></defs>
    <path d="M195 76 293 50 351 84 252 111Z" fill="#688580" stroke="#8ba39c"/>
    <path d="M252 111 351 84V236L252 268Z" fill="url(#engineering-wall)" stroke="#718f8e"/>
    <path d="M195 76 252 111V268L195 233Z" fill="#678180" stroke="#8ba39c"/>
    <g stroke="#a1b5a5" opacity=".3"><path d="M211 87v156m20-143v155m-36-140 57 35m-57 6 57 35m-57 6 57 35"/></g>
    <ellipse cx="219" cy="155" rx="43" ry="62" fill="url(#engineering-impact)"/>
    <g stroke="#a8c5cf" stroke-width="2" stroke-linecap="round"><path d="M32 137 179 152"/><path d="M65 85 176 115"/><path d="M51 212 178 194"/></g>
    <g fill="#c2e3e8" stroke="#10212b" stroke-width="2"><circle cx="175" cy="151" r="10"/><circle cx="133" cy="103" r="8"/><circle cx="107" cy="204" r="9"/></g>
    <text x="168" y="156" fill="#263f49" font-size="13" font-weight="600">n</text>
    <text x="36" y="255" fill="#cfdbd5" font-size="14">Neutrons</text><text x="284" y="285" fill="#cfdbd5" font-size="14" text-anchor="middle">Reactor material</text>
  `, "The surrounding structure receives a sustained neutron exposure. This is a schematic illustration, not a material or lifetime prediction.");
}
function plant() {
  return art("Conceptual power-station buildings, cooling equipment and electrical infrastructure", `
    <path d="M25 230 180 165 381 223 213 283Z" fill="#1a343d" stroke="#35515a"/>
    <g stroke="#739b99" stroke-width="1.4" stroke-linejoin="round">
      <path d="M60 154 129 128 189 156 119 184Z" fill="#3f6266"/><path d="M60 154v72l59 29v-71Z" fill="#294b55"/><path d="M119 184 189 156v72l-70 27Z" fill="#365961"/>
      <path d="M145 192 255 149 324 180 214 224Z" fill="#527071"/><path d="M145 192v34l69 32v-34Z" fill="#35545e"/><path d="M214 224 324 180v34l-110 44Z" fill="#284852"/>
      <path d="M77 150V123C77 95 139 78 153 106v34" fill="#355d64"/><ellipse cx="116" cy="116" rx="39" ry="17" fill="#4e7578"/>
      <path d="M272 127c10-22 11-38 9-58h27c-2 20-1 36 10 58Z" fill="#46676d"/><ellipse cx="294" cy="69" rx="13" ry="5" fill="#1c353d"/>
      <path d="M316 147c8-20 9-33 7-49h24c-2 16-1 29 8 49Z" fill="#365963"/><ellipse cx="335" cy="98" rx="12" ry="4" fill="#1c353d"/>
    </g>
    <g fill="#99c9b3"><path d="m71 181 12 6v8l-12-6Zm19 9 12 6v8l-12-6Zm45 14 13-5v7l-13 5Zm24-9 13-5v7l-13 5Z"/></g>
    <g fill="none" stroke="#a1bab6" stroke-width="2"><path d="M225 109 239 39 253 109M228 94h22m-19-20h16m-16 20 16-20m-12-21h9M219 55h40m-43 19h46"/><path d="M259 55q30 18 60 9M262 74q28 13 58 11" stroke-width="1"/></g>
    <path d="M42 263h100m17 0h30" stroke="#8fb4a1" stroke-width="2" opacity=".5"/>
  `, "A power station includes buildings, cooling and electrical infrastructure around the reactor. Conceptual illustration; no particular project is shown.");
}

export function engineeringDiagram(theme) {
  return ({ plasma_and_fuel_physics: plasma, electrical_balance: efficiencyComparison,
    sustained_operation: turnaround, fuel_cycle: fuelInventory,
    materials_and_maintenance: material, delivery_and_economics: plant })[theme]?.() || "";
}
