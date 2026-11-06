export function engineeringDiagram(theme) {
  if (theme === "electrical_balance")
    return `<figure class="engineering-figure">
      <figcaption>Electricity available to the grid</figcaption>
      <div class="electrical-equation">
        <div class="engineering-node"><strong>Gross generation</strong><span>All electricity produced by the plant</span></div>
        <span class="equation-operator" aria-label="minus">−</span>
        <div class="engineering-node"><strong>Plant demand</strong><span>Heating or drivers, cooling, pumps and fuel processing</span></div>
        <span class="equation-operator" aria-label="equals">=</span>
        <div class="engineering-node net-export"><strong>Net export</strong><span>Electricity left to supply the grid</span></div>
      </div>
      <p>Gross generation already reflects losses when converting fusion energy to electricity. If plant demand exceeds generation, the plant draws electricity from the grid</p>
    </figure>`;
  if (theme === "fuel_cycle")
    return `<figure class="engineering-figure">
      <figcaption>The tritium loop in a D–T plant</figcaption>
      <div class="tritium-loop">
        <ol class="fuel-cycle-flow">
          <li class="engineering-node"><strong>Fusion chamber</strong><span>D–T reactions consume tritium and release neutrons</span></li>
          <li class="engineering-node"><strong>Lithium blanket</strong><span>Neutrons react with lithium to produce tritium</span></li>
          <li class="engineering-node"><strong>Extraction</strong><span>Tritium is recovered from the blanket</span></li>
          <li class="engineering-node"><strong>Fuel preparation</strong><span>Tritium is purified and combined with deuterium</span></li>
        </ol>
        <div class="fuel-return"><span>Fuel returns to the chamber</span></div>
      </div>
      <p>Fuel does not all fuse on one pass. Unburned deuterium and tritium are recovered and reused</p>
    </figure>`;
  return "";
}
