// Energy-transfer schematic. The turbine is shown from the side, along its shaft;
// the arrows represent energy transfers, not piping or electrical waveforms.
export function renderPowerCycle(recirculate = false) {
  return `<g class="power-cycle" font-family="Inter, Arial, sans-serif" fill="#203c40">
    <defs>
      <marker id="cycle-heat-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 7 4 1 7" fill="none" stroke="#af5835" stroke-width="1.5"/></marker>
      <marker id="cycle-electric-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 7 4 1 7" fill="none" stroke="#376e5c" stroke-width="1.5"/></marker>
      <marker id="cycle-cooling-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 7 4 1 7" fill="none" stroke="#637b83" stroke-width="1.5"/></marker>
    </defs>
    <!-- Reactor vessel and surrounding heat-absorbing blanket -->
    <rect x="26" y="86" width="100" height="96" rx="43" fill="#e2e9da" stroke="#6c866e" stroke-width="2"/>
    <rect x="43" y="103" width="66" height="62" rx="28" fill="#eee1d0" stroke="#b78d6d" stroke-width="2"/>
    <ellipse cx="76" cy="134" rx="20" ry="16" fill="#d48d62"/>
    <path d="M126 134H186" class="cycle-flow heat" fill="none" stroke="#af5835" stroke-width="3" marker-end="url(#cycle-heat-arrow)"/>
    <text x="155" y="73" text-anchor="middle" font-size="20" fill="#9d5232">Blanket heat</text>

    <!-- Expanding turbine casing, blade rows, and shared mechanical shaft -->
    <path d="M192 119 282 94V174L192 149Z" fill="#e1e7dd" stroke="#698373" stroke-width="2" stroke-linejoin="round"/>
    <path d="M207 116V152m19-41v46m19-51v56m19-61v66" fill="none" stroke="#91a99a" stroke-width="5"/>
    <path d="M193 134H345" stroke="#536f66" stroke-width="5"/>
    <path d="M209 122 217 146m10-30 8 36m10-42 8 48m10-54 8 60" fill="none" stroke="#536f66" stroke-width="3"/>
    <path d="M210 174V183m55-9v9M202 184h72" fill="none" stroke="#698373" stroke-width="3"/>

    <!-- Generator stator and rotor -->
    <rect x="340" y="106" width="94" height="57" rx="13" fill="#e2eae4" stroke="#698373" stroke-width="2"/>
    <path d="M353 114V155m9-41v41m48-41v41m9-41v41" stroke="#92aa9e" stroke-width="2"/>
    <rect x="368" y="122" width="35" height="25" rx="4" fill="#698373"/>
    <path d="M353 163v20m67-20v20M345 184h83" stroke="#698373" stroke-width="3" fill="none"/>
    <path d="M434 134H512" class="cycle-flow electricity" fill="none" stroke="#376e5c" stroke-width="3" marker-end="url(#cycle-electric-arrow)"/>
    <text x="482" y="73" text-anchor="middle" font-size="24" fill="#37664f">${recirculate ? "Net electricity" : "Electricity"}</text>

    <!-- Lattice transmission tower, crossarms, and hanging insulators -->
    <g fill="none" stroke="#536f66" stroke-width="2.3" stroke-linejoin="round">
      <path d="M556 81 546 103 533 184M556 81 566 103 579 184M533 184h46M546 103h20M542 128h28M538 153h36M546 103l24 25-32 25 41 31M566 103l-24 25 32 25-41 31"/>
      <path d="M525 105h62l-21-12h-20ZM516 132h80l-26-12h-28Z"/>
      <path d="M525 105v11m62-11v11m-71 16v11m80-11v11" stroke-width="4"/>
      <path d="M596 143q12 6 24 0M587 116q16 7 33 0" stroke-width="1.5"/>
    </g>
    <g text-anchor="middle" font-size="26">
      <text x="76" y="216">Reactor</text><text x="238" y="216">Turbine</text><text x="387" y="216">Generator</text><text x="556" y="216">Grid</text>
    </g>
    <path d="M257 94V49H341" class="cycle-flow cooling" fill="none" stroke="#637b83" stroke-width="2" marker-end="url(#cycle-cooling-arrow)"/>
    <text x="257" y="27" font-size="22" text-anchor="middle" fill="#526a72">Waste heat</text>
    ${recirculate ? `<circle cx="471" cy="134" r="4" fill="#376e5c"/><path d="M471 134V267H356" class="cycle-flow electricity" fill="none" stroke="#376e5c" stroke-width="2" marker-end="url(#cycle-electric-arrow)"/><rect x="130" y="244" width="220" height="46" rx="5" fill="#e2eae4" stroke="#698373" stroke-width="1.5"/><text x="240" y="275" text-anchor="middle" font-size="23" fill="#37664f">Run this plant</text><path d="M130 267H18V134H25" class="cycle-flow electricity" fill="none" stroke="#376e5c" stroke-width="2" marker-end="url(#cycle-electric-arrow)"/>` : ""}
  </g>`;
}
