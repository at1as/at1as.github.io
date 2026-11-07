# Nuclear fusion visualization research and implementation handoff

Research snapshot: **22 October 2026, America/Los_Angeles**. Prepared for the Codex implementation of an interactive fusion explainer. The companion data is a curated collection of approaches, companies, public experiments, financing announcements, and milestones. It is not a census of every fusion venture or an investment ranking.

## 1 The recommended project

Build this. Fusion is unusually well suited to an interactive explainer because its machines are physically different, its milestones have precise but easily confused meanings, and a small number of diagrams can explain why apparently contradictory headlines can all be true. The strongest question for the site is: **What has each route to fusion power demonstrated, and what would it still have to prove?** Funding and geography make the landscape tangible; the mechanisms and evidence make it useful.

Use **Fusion Atlas** as the project name and **The paths to fusion power** as the public title. Suggested introduction: “Explore how fusion machines work, the results they have produced, and the engineering between an experiment and a power plant.” A reader should leave able to recognize a tokamak, stellarator, laser target, compressed plasma and pinch; interpret a gain claim; and explain why producing fusion energy does not establish a profitable generating station.

The site should have a short guided introduction and a deeper explorer. Its opening should not demand familiarity with plasma physics or ask the reader to choose from twenty company logos. The first useful interaction is to follow the energy through a machine. The second is to change the confinement approach. Company cards, the map and financing belong after those concepts are established.

This fits the existing visualizations: the mathematics site separates published results from claims, the Kurzweil site exposes interpretation, and the recruiting calculator makes assumptions inspectable. Carry those conventions forward: visible dates, citations beside facts, a methodology section, downloadable data, and a plain table available behind every chart. [PAR_EXISTING_SITES](https://www.jasonwillems.com/sites/)

### The principal editorial decisions

1. **Use several evidence dimensions.** A universal percentage of completion would combine physics, engineering, finance and timelines without a defensible scale.
2. **Keep observations, models and targets visibly distinct.** The distinction must survive filtering, sorting, tooltips, screenshots and exported data.
3. **Give every gain number a boundary.** Plasma gain, target gain, recovered electricity and net plant electricity describe different accounting problems.
4. **Keep funding types separate.** A round, a cumulative figure, a grant, an undrawn loan, a conditional commitment and a merger valuation are different facts.
5. **Make the map represent sites.** A headquarters, operating experiment, proposed plant and fuel-cycle test facility need different symbols and explicit labels.
6. **Treat unresolved information as information.** Unknown funding is not zero; a missing public result is not proof that a private experiment failed.

The report recommends an evidence-first comparison, while retaining useful interpretation. A route can have a stronger experimental basis and still face difficult plant integration. Another can promise a simpler plant while requiring a larger physics extrapolation. Both statements can be shown without inventing a probability that a company will succeed.

## 2 What changed from the earlier research

The earlier discussions correctly identified CFS, Helion, Inertia, Pacific Fusion, Proxima, Type One, TAE and Zap as useful comparison cases, and distinguished scientific gain from usable electricity. They also contained rough company rankings and numerical chances of success by 2030. Preserve the questions behind those estimates; do not publish the percentages. They were judgments in a conversation, not calibrated forecasts supported by a reproducible dataset.

Several updates change what the visualization should say. Helion now defines Polaris’s objective as converting a portion of fusion-origin energy into electricity stored in capacitor banks, and explains why it no longer uses its earlier “net electricity” framing for that prototype. A card saying that Polaris is a demonstrated net-electric machine would be wrong. The long-term D-He3 fuel plan must also be separated from testing with D-D, D-T and D-He3. [MAG_HELION_POLARIS](https://www.helionenergy.com/polaris)

Realta's June 2026 direct-conversion experiment is a second instructive example. The company describes conversion of plasma-particle energy into electricity, predominantly recovering power supplied to heat the experimental plasma. Its technical explanation explicitly distinguishes that result from net electricity and large-scale conversion of fusion-born power. This is useful engineering progress with a precisely limited claim. [MAG_REALTA_DEC](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/)

Inertia's earlier 18, 30 and 45 target-gain scenarios remain on its FAQ, paired with approximately 50, 500 and 1,500 MW of modeled grid output. A September 2026 target-design paper describes a different set of simulations. Neither is a measured company power-plant result, and their points must not be connected into a universal gain-to-electricity curve. They belong in a company-model panel with the underlying assumptions and source version attached. [ALT_INERTIA_GAIN](https://inertia.com/faq/how-much-fusion-energy-or-gain-do-you-need/) [ALT_INERTIA_PAPER](https://arxiv.org/abs/2609.19752) [ALT_INERTIA_MODEL](https://inertia.com/press/models-confirm-fuel-target-design)

Recent financing announcements also make older totals stale. The data retains the announcement date, whether an amount is cumulative, and any release conditions. Helion's amended financing close, Proxima's equity versus grants and public commitments, and Marvel's company funding versus public cooperation projects are examples where simply adding headlines would overstate the available capital. The company and financing appendices preserve these distinctions.

This update also corrects a common visual mistake: the most recent achievement is not necessarily a new record. LLNL lists a June 2026 ignition result, while its largest listed target yield remains the April 2025 experiment. A record-history step chart and a chronological shot chart therefore have different meanings. [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition)

## 3 The physics the introduction needs

### Fusion releases nuclear binding energy

Fusion joins light nuclei. When the resulting nuclei and particles have less total rest mass than the initial reactants, the difference appears as energy. In the most common near-term reactor fuel choice, deuterium and tritium react to produce a helium-4 nucleus and a neutron. The products carry about 17.6 MeV in total: about 3.5 MeV in the charged helium nucleus and 14.1 MeV in the neutron. Thus roughly one fifth of the reaction energy is initially in a charged product and four fifths in an uncharged neutron. [PHY_001](https://www.energy.gov/science/doe-explainsfusion-reactions) [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) [PHY_044](https://www.energy.gov/sites/prod/files/2019/06/f63/The-Sandia-New-Mexico-Tritium-Story-Capabilities-and-R-and-D.pdf)

The diagram should show the nucleus counts correctly: deuterium has one proton and one neutron, tritium one proton and two neutrons, helium-4 two of each, and one neutron leaves. The labels should say nuclei, not intact atoms with orbiting electrons. At fusion temperatures the material is plasma. Magnetic fields affect charged particles; they do not trap the outgoing neutrons in the same way.

The Sun is helpful context but a misleading engineering model. Gravity confines an enormous amount of stellar material, and its principal reaction chain differs from the D-T route pursued by many terrestrial projects. A machine on Earth has to achieve an adequate combination of temperature, density and energy confinement with different fuels and geometries. “A miniature Sun” is an analogy, not a technical specification. [PHY_001](https://www.energy.gov/science/doe-explainsfusion-reactions) [PHY_003](https://www.energy.gov/science/doe-explainsplasma-confinement)

### Temperature alone is insufficient

Useful fusion requires enough reactions before energy escapes. The familiar triple product combines particle density, temperature and energy-confinement time. It helps organize performance, but its numerical meaning depends on fuel, the temperature convention, plasma profiles and the definition of confinement. A reactor-relevant result needs those quantities under compatible conditions. Combining one shot's highest temperature with another shot's longest duration produces a fictional result. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_007](https://arxiv.org/html/2505.03834v6)

The distinction between **energy-confinement time** and **pulse duration** deserves a tooltip. A plasma can be maintained for minutes by continuous external heating while its energy would escape much faster if that heating stopped. A long pulse is valuable evidence about control and heat management; it is not automatically a large triple product or a positive energy balance. [PHY_003](https://www.energy.gov/science/doe-explainsplasma-confinement) [PHY_007](https://arxiv.org/html/2505.03834v6)

Keep the opening qualitative. Three controls labelled temperature, density and heat retention can explain the tradeoff, but they must not generate a fake universal probability of fusion or a supposedly predictive animation. At an advanced level, show an equation and a link to the Lawson literature. Do not display a single threshold across D-T, D-He3 and p-B11 without a specified physical model.

### Why the approaches look different

Magnetic confinement holds a relatively dilute hot plasma with magnetic fields. Inertial confinement compresses a small fuel target rapidly enough that reactions occur before it expands. Magneto-inertial designs combine an initial magnetic field with compression, seeking some of the benefits of both. These are organizing families, not watertight commercial categories: companies combine different geometry, heating and compression choices. [PHY_003](https://www.energy.gov/science/doe-explainsplasma-confinement) [PHY_033](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/) [PHY_034](https://www.lle.rochester.edu/inertial-confinement-fusion/)

The data therefore separates the confinement family, plasma geometry, driver, intended fuel and energy-conversion path. “HTS” describes high-temperature superconducting magnets, not a mutually exclusive reactor family. “FRC” describes a plasma configuration; Helion's pulsed compression and TAE's beam-sustained route should not share one undifferentiated mechanism animation. “Aneutronic” describes an intended reaction characteristic, not a guarantee that an operating plant produces no neutrons or radioactive material.

### From fusion products to useful power

For a D-T thermal plant, neutrons enter a surrounding blanket, transferring energy and potentially producing tritium in lithium-containing material. Coolant carries heat to a power-conversion system. That system makes gross electricity, some of which must power the plant itself. Pumps, heating systems, magnets and cryogenics, vacuum systems, fuel processing and other auxiliaries all matter to the net balance. The blanket is a nuclear and thermal component, not simply a passive heat shield. [PHY_022](https://www.iter.org/machine/supporting-systems/tritium-breeding) [PHY_023](https://www.iter.org/fusion-energy/making-it-work) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)

Some concepts seek direct electrical conversion of charged-particle or plasma-expansion energy. Show this as a distinct energy path, and distinguish conversion of fusion-born energy from recovery of externally supplied energy. Efficient recovery can improve a power balance, but recovery alone does not establish an energy source. For D-T systems, a charged-particle conversion subsystem does not eliminate the much larger neutron-energy channel. [MAG_REALTA_DEC](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/) [PHY_037](https://www.helionenergy.com/technology)

## 4 A fuel comparison that preserves the tradeoffs

| Fuel route | Why it is attractive | What it adds to the problem | How to label it |
| --- | --- | --- | --- |
| D-T | Favorable reaction rate at comparatively accessible plasma conditions; substantial experimental heritage | Tritium supply and breeding, energetic neutrons, activation, shielding and component damage | Primary route of many near-term projects |
| D-D | Deuterium is widely available; useful experimental and fuel-production reactions | More demanding reaction conditions; reaction branches produce neutrons and tritium | Experimental fuel and possible future cycle, not automatically a tritium-free plant |
| D-He3 | Primary reaction products are charged, making direct conversion attractive | Higher required performance, helium-3 production or supply, D-D side reactions and associated neutrons | Intended commercial cycle where specifically stated |
| p-B11 | Primary reaction produces charged helium nuclei and uses non-tritium reactants | Much harder energy balance, high required ion energies, radiation losses, fuel purity and side reactions | Advanced fuel goal; distinguish measured reactions from reactor-level gain |

This table summarizes established reaction differences; the relative engineering burden is an interpretation of those differences, not a company ranking. The Lawson review supports the fuel-specific performance distinction. Company-specific plans belong in each record because a developer's present experimental fuel can differ from its intended commercial fuel. [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_007](https://arxiv.org/html/2505.03834v6)

Avoid saying that the fuel comes “just from seawater.” Deuterium abundance does not solve tritium inventory, breeding, extraction, losses or startup logistics. A D-T plant must establish a working fuel cycle at its own operating conditions; a component breeding experiment does not demonstrate fleet-wide self-sufficiency. Similarly, naming lithium as a feedstock does not establish a breeding ratio after all parasitic losses and geometric constraints. [PHY_022](https://www.iter.org/machine/supporting-systems/tritium-breeding) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)

## 5 The approaches and their visual explanations

### Tokamaks and spherical tokamaks

A tokamak uses a toroidal plasma, external coils and a substantial plasma current to create a confining magnetic geometry. It has the deepest body of high-performance magnetic-fusion experiments. The same heritage identifies difficult issues: plasma instabilities and disruptions, how to sustain current, exhaust heat, survive neutron exposure and make access for maintenance. A smaller or stronger-field tokamak changes the engineering tradeoffs; it does not remove them. [PHY_004](https://www.energy.gov/science/doe-explainstokamaks) [PHY_019](https://www.iter.org/fusion-energy/what-will-iter-do) [PHY_023](https://www.iter.org/fusion-energy/making-it-work)

A spherical tokamak has a tighter central hole and a more compact, cored-apple-like plasma shape. The small central column makes space allocation for magnets, shielding and structural support especially important. Render it alongside a conventional tokamak at the same schematic scale, with a central-column annotation. Do not imply that a smaller device is automatically cheaper per delivered kilowatt-hour. The approach explorer should connect CFS and ITER to tokamak heritage, and Tokamak Energy, Startorus and STEP to spherical variants.

### Stellarators

Stellarators use externally shaped magnetic fields to create the twist needed to confine plasma without relying on a tokamak-sized plasma current. This makes sustained operation attractive and changes disruption risks. The cost is a demanding three-dimensional design, precise construction and challenging access, alongside the shared problems of confinement, exhaust, blankets and maintenance. Computational optimization and new manufacturing methods are relevant advantages, not evidence that all plant problems are solved. [PHY_005](https://www.energy.gov/science/doe-explainsstellarators) [PHY_015](https://www.ipp.mpg.de/5532945/w7x)

The canonical animation can show a shaped three-dimensional coil set around a smooth plasma surface, then toggle to field lines. Company-specific diagrams must respect their actual magnet architecture: Thea, for example, uses arrays of planar coils to shape a three-dimensional field. A stellarator is not a tokamak with a wavy wall. Wendelstein 7-X provides public experimental evidence for the family; Proxima, Type One, Thea, Renaissance and Helical represent distinct commercialization strategies. A result from W7-X must remain attributed to W7-X rather than inherited as an experiment performed by those companies. [MAG_THEA_CANIS](https://arxiv.org/abs/2503.18960) [MAG_THEA_HELIOS](https://arxiv.org/abs/2512.08027)

### Magnetic mirrors and levitated dipoles

A mirror uses an elongated plasma with stronger magnetic fields toward the ends. It offers an open geometry that can simplify access and creates opportunities to recover the energy of escaping charged particles. Its central challenge is sufficient confinement despite particle and energy losses through the ends, together with an adequate integrated power balance. WHAM and Realta provide a useful experimental and commercial pairing. [PHY_035](https://wham.physics.wisc.edu/) [MAG_REALTA_DEC](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/)

A levitated dipole places a superconducting ring inside the vacuum chamber, with plasma confined around its dipole field. OpenStar's Junior is a prototype; Tama Nui is a proposed plant design. The picture must show the internal ring and the challenge of keeping that magnet cold and protected inside the chamber. Prototype confinement and a published D-T plant design are different evidence categories. [PAR_OPENSTAR_PPPL](https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy) [PAR_OPENSTAR_TECH](https://www.openstar.tech/technical-resources)

### Field reversed configurations

An FRC is a compact plasma configuration with a reversed magnetic field and a field topology different from a tokamak. In a beam-sustained approach, injected energetic particles help form, heat and sustain the configuration. In a pulsed compressed approach, plasma structures are formed, accelerated or merged, and compressed; the system then expands and resets. The two animations should share a shape vocabulary but have different sequences and energy inputs. [PHY_036](https://www.nature.com/articles/s41467-025-58849-5) [PHY_037](https://www.helionenergy.com/technology)

TAE's long-term p-B11 ambition adds a fuel-performance challenge to its configuration and heating work. Helion's D-He3 plan adds fuel-cycle and power-recovery questions to its pulsed-machine sequence. Neither company's present prototype should be depicted simply as a scaled-down version of a proven commercial plant.

### Z-pinch and mechanical magnetized target fusion

A Z-pinch drives current through plasma, generating a magnetic field that compresses it. Sheared-flow stabilization is a specific way to address instabilities; depict the flow separately from the current and from the surrounding magnetic field. A claim of high pressure or temperature needs its diagnostic context and does not establish a complete reactor power balance. Zap's engineering test systems should also be distinguished from its fusion-plasma experiments. [PHY_038](https://www.zapenergy.com/technologies/fusion)

Mechanical magnetized target fusion compresses a pre-magnetized plasma with a moving liner or related mechanical system. General Fusion seeks to trade some magnetic-confinement requirements for rapid compression and a protective liquid-metal architecture. For the experimental LM26 card, use the actual test device description rather than copying a commercial liquid-wall rendering. The important remaining evidence includes compression scaling, plasma behavior, repeatability, conversion efficiency and replacement or reset of components. [PHY_039](https://generalfusion.com/our-fusion-technology/what-sets-mtf-apart/) [ALT_GENERAL_TEMP](https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/) [ALT_GENERAL_PATH](https://generalfusion.com/path-to-commercialization/)

### Laser and pulsed power inertial fusion

In direct-drive laser fusion, lasers illuminate the capsule; the outer material ablates and the reaction force compresses the fuel. In indirect drive, lasers first heat a surrounding cavity called a hohlraum, whose X-rays drive the capsule implosion. The animation must show the indirect step. Fast-ignition variants add a separate ignition stage and should not be flattened into ordinary direct drive. [PHY_034](https://www.lle.rochester.edu/inertial-confinement-fusion/)

NIF demonstrates the scientific significance of indirect-drive ignition. A commercial system also needs efficient drivers, adequate target gain, repeatable target manufacture and injection, chamber clearing, optics protection, blankets, tritium processing and heat extraction. These engineering requirements create a meaningful comparison between Inertia, Xcimer, Focused Energy, Marvel and EX-Fusion, even when they share some inertial-fusion heritage. [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [ALT_INERTIA_FUND](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html) [ALT_XCIMER_ROADMAP](https://xcimer.energy/energy/) [ALT_FOCUSED_TECH](https://www.focused-energy.co/technology/lighthouse)

Xcimer’s hybrid direct-drive target starts with hohlraum-generated X-ray drive and then uses direct laser drive. It needs its own sequence rather than a NIF or fast-ignition animation. EX-Fusion describes a LIFT-inspired fast-ignition architecture with compression followed by a separate ignition laser. These are design descriptions, not demonstrated commercial gain. [PAR_XCIMER_HDD](https://pubs.aip.org/aip/pop/article/31/11/112708/3322685/Hybrid-direct-drive-with-a-two-sided-ultraviolet) [PAR_EXFUSION_TECH](https://ex-fusion.com/technology/knowledge)

Pulsed-power inertial systems use intense electrical pulses to drive compression. Some include pre-magnetized or laser-preheated fuel, and their targets and coupling geometries differ. Sandia's Z and MagLIF are useful public research anchors; Pacific Fusion develops its own pulsed magnetic compression system. Fuse's existing dense-plasma-focus neutron-testing hardware and its proposed MagLIF energy system are different development stages. Neutron production for testing does not demonstrate the future plant's energy balance. Do not animate every pulsed-power design as if it were an identical Sandia experiment. [PHY_033](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/) [ALT_PACIFIC_MODULE](https://www.pacificfusion.com/resources/validating-the-next-building-block-toward-affordable-fusion-power) [ALT_FUSE_TEST](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign) [ALT_FUSE_CONCEPT](https://www.f.energy/apeiron-i-fusion-energy-plant)

First Light's current FLARE programme develops a two-stage D-T fuel system with separate compression and ignition, while partners supply major driver and plant systems. Its approximately 1,000 target gain is modeled; the September 2026 compression test did not demonstrate ignition or gain. Marvel's current near-term laser fast-ignition design uses D-T, so an older proton–boron label would be misleading. HB11 separately pursues laser-driven proton–boron fast ignition and a proposed thermal electricity cycle; reaction-yield experiments are not reactor-level gain. [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/) [ALT_FIRSTLIGHT_TEST](https://firstlightfusion.com/media/first-light-fusion-achieves-major-step-forward-for-flare-proving-key-low-cost-fusion-principle/) [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology) [ALT_HB11_TECH](https://hb11.energy/our-technology/) [ALT_HB11_PAPER](https://hb11.energy/wp-content/uploads/2025/08/hydrogen-boron-fusion-in-confined-geometries_20250718.pdf)

Electrostatic compact approaches can appear in the extended explorer. Avalanche's crossed-field concept combines electrostatic ion orbits with magnetic electron confinement. Its small size and high-voltage component results should not imply demonstrated plant gain. Attach the evidence label to the particular result rather than infer it from the architecture. [ALT_AVALANCHE_TECH](https://www.avalanchefusion.com/orbitron) [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs)

## 6 The gain explainer is the central interactive

### Define the denominator

| Label | What is being compared | What it does not establish |
| --- | --- | --- |
| Plasma gain | Fusion power divided by specified external heating power delivered to the plasma | Electrical power consumed by the heating equipment or the whole facility |
| Target gain | Fusion energy from a shot divided by driver energy delivered to the target at the stated boundary | Efficient lasers, rapid repetition, gross electricity or net electricity |
| Fuel gain | Fusion energy divided by energy coupled into the fuel, if that narrower quantity is specified | Target gain; these denominators can differ substantially |
| Recovered electrical energy | Electricity returned from a plasma, circuit or energy-storage subsystem | That the returned energy originated in fusion or exceeded all inputs |
| Gross electricity | Electrical output before internal loads are deducted | Positive power exported by the plant |
| Net electricity | Gross electrical generation minus all relevant plant electrical consumption over a declared period | Commercial availability, acceptable costs or a sustainable fuel cycle |
| Ignition | A physical self-heating condition whose definition depends on the experimental context | A universal synonym for target gain above one or a working power station |

Use the source's exact boundary before adopting its symbol. “Q” on two press releases is not enough to make their points comparable. This is especially important when one result uses power and another uses energy per pulse, or one estimate assumes an equivalent D-T plasma rather than an actual D-T experiment. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_007](https://arxiv.org/html/2505.03834v6) [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition) [PHY_019](https://www.iter.org/fusion-energy/what-will-iter-do)

The ignition distinction deserves an explicit historical example. NIF's 8 August 2021 experiment achieved physical hot-spot ignition and the onset of propagating burn under the relevant self-heating criteria. Its target gain was still below one. The 5 December 2022 experiment crossed the different boundary of fusion yield exceeding laser energy delivered to the target. Preserve both milestones and name the criterion in use. [PHY_011](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record) [PHY_007](https://arxiv.org/html/2505.03834v6) [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition)

### Three anchor examples

**NIF:** the 5 December 2022 shot produced 3.15 MJ of fusion energy from 2.05 MJ of laser energy delivered to the target, a target gain of approximately 1.54. The listed record on 7 April 2025 was 8.6 ± 0.45 MJ from 2.08 MJ, with reported target gain 4.13. LLNL's latest listed ignition result at this snapshot was 20 June 2026: 7.9 ± 0.4 MJ, target gain approximately 3.8. The latest shot is therefore not the listed maximum. The denominator does not include the electricity used to operate the lasers and facility, and NIF does not turn the shot into exported electrical power. [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition) [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [PHY_012](https://lmf.llnl.gov/news/target-breakthrough-enabled-fusion-record-nif)

**ITER:** its design goal is 500 MW of fusion power from 50 MW of plasma heating, or plasma Q = 10. ITER is an experiment and is not designed to generate electricity. Its nominal 500 MW must never appear in an electricity-capacity column. The current baseline places research operations in 2034 and D-T operation in 2039; label those as programme targets. [PHY_019](https://www.iter.org/fusion-energy/what-will-iter-do) [PHY_020](https://www.iter.org/few-lines) [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024)

**Electrical recovery:** show an explicitly fictional full-cycle example: 100 MJ supplied, 102 MJ returned, and 3 MJ of additional plant consumption gives minus 1 MJ net. Both endpoints must have the same stored-energy state. A capacitor-bank gain can otherwise reflect a partial boundary or a change in inventory. This example is original arithmetic, not a claim about Helion or Realta.

### A transparent teaching calculator

Let H be heating delivered to a plasma in MW, Q the fusion-to-heating ratio, d the electric-to-heating efficiency, c the captured fraction of fusion power, e the heat-to-electric efficiency, and A the auxiliary electrical load in MW, excluding the driver demand already counted separately. The deliberately simplified model is:

- Fusion power = Q × H.
- Gross electric power = e × c × Q × H.
- Driver electric demand = H / d.
- Net electric power = e × c × Q × H − H / d − A.

At H = 50 MW, Q = 10, d = 0.5, c = 1, e = 0.4 and A = 50 MW, this gives 500 MW fusion, 200 MW gross electrical generation, 100 MW of driver demand and 50 MW net. Changing only driver efficiency to 0.25 makes net output minus 50 MW. These values are teaching assumptions; they are not an ITER plant model or a forecast for any company.

For a pulsed target, let E be driver energy delivered to the target in MJ per shot and f be repetition rate in Hz. Fusion power is E × target gain × f; driver electrical demand is E × f / d. One MJ per shot at one shot per second is one MW. At E = 10 MJ, gain 30, f = 10 Hz, driver efficiency 20%, capture 100%, thermal efficiency 40% and auxiliary load 100 MW, this gives 3,000 MW fusion, 1,200 MW gross electrical generation, 500 MW driver demand and 600 MW net. At 10% driver efficiency, driver demand becomes 1,000 MW and net output becomes 100 MW. These pedagogical scenarios illustrate sensitivity; they do not reproduce Inertia's proprietary plant assumptions. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_007](https://arxiv.org/html/2505.03834v6)

The default calculator excludes useful recovery of externally supplied heating energy, blanket energy multiplication, detailed transient storage, maintenance, capital costs and design-dependent losses. It treats several inputs as independent even though a real machine couples them. Those limitations belong beside the controls. The calculator must preserve negative output. Zero driver efficiency makes the input-demand division undefined and must produce a validation message. Zero thermal efficiency or zero capture is a valid teaching case with zero gross generation and negative net output when loads are positive; only ratios or thresholds that divide by those quantities become undefined.

Add an optional target-manufacturing calculation: 10 Hz means 864,000 targets per operating day. At a hypothetical $1 per target, target costs alone are $72/MWh at 500 MW net or $24/MWh at 1,500 MW net. Those values follow from 3,600 × shots per second × dollars per target / net MW. They exclude every other plant cost and are not estimates of electricity prices. If net output is nonpositive, do not show a cost per delivered MWh.

### Inertia's attributed model and manufacturing evidence

Two additional Inertia pages provide useful detail. Both were **undated live pages** when reviewed for the 22 October 2026 snapshot; the access date must not become an announcement or experimental date. The Phase I roadmap gives a rough company power balance using 10 MJ of laser energy per shot, 10 Hz, 12% electric-to-laser efficiency, 45% heat-to-electric efficiency and 5 MJ of other electrical consumption per shot. With those assumptions, net electrical power in MW is repetition rate multiplied by `(thermal efficiency × target gain × laser energy − laser energy / laser efficiency − other electrical energy per shot)`. [ALT_INERTIA_PHASE1](https://inertia.com/press/commercial-roadmap-phase-1)

| Target gain | Laser efficiency | Calculated net electricity from the stated inputs | Company's rounded example |
| --- | --- | --- | --- |
| 25 | 12% | 241.7 MWe | Approximately 250 MWe |
| 40 | 12% | 916.7 MWe | More than 900 MWe |
| 40 | 15% | 1,083.3 MWe | Approximately 1,085 MWe |

These are **modeled scenarios**, not measured outputs. The small differences follow from doing the arithmetic with the published rounded inputs. This supports a separate “Attributed company model” calculator tab; it should not overwrite the teaching defaults or be forced to reproduce the older 18/30/45 FAQ scenarios. The roadmap's completed virtual-shot milestone is a simulation, even though the company presents it with a check mark. [ALT_INERTIA_PHASE1](https://inertia.com/press/commercial-roadmap-phase-1) [ALT_INERTIA_GAIN](https://inertia.com/faq/how-much-fusion-energy-or-gain-do-you-need/)

The second page reports Inertia/LLNL production of frozen D-T fuel layers in **two to three hours**, with measured layer roughness and simulation-based assessment of fusion-performance compatibility. Use that specific result rather than the headline's broader “days to minutes” language. It is evidence about a manufacturing step; it does not establish completed targets at an industrial production rate, experimental gain for the proposed target, or an operating power plant. [ALT_INERTIA_FUELING](https://inertia.com/press/inertia-fast-fueling)

## 7 How to compare progress honestly

The word record needs a metric, regime, date and scope. The numerical dataset deliberately keeps NIF target gain, JET fusion energy, tokamak plasma gain, long-pulse duration, temperature and stellarator performance in separate metric families. A chart may compare compatible points within a family; it should not transform all records into one normalized progress score.

JET's final D-T campaign produced approximately 69 MJ of fusion energy in 2023, announced in 2024. Its historical peak plasma gain is a separate result. EAST's 1,066-second high-confinement discharge, WEST's 1,337-second plasma discharge, and KSTAR's high-temperature and H-mode durations have different conditions and should be labelled accordingly. WEST's reported injected/extracted heating energy is not fusion yield. [PHY_013](https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record) [PHY_014](https://www.ipp.mpg.de/5405892/jet_rekord_2024) [PHY_016](https://english.cas.cn/head/202501/t20250121_899060.shtml) [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720) [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/)

Wendelstein 7-X's 2025 performance result concerns the combination of temperature, density and confinement maintained over a long pulse. It is valuable evidence for stellarators, but it is not a D-T electricity demonstration. A related source's publication date must not silently become the experimental date. [PHY_015](https://www.ipp.mpg.de/5532945/w7x)

The most useful comparison card has four rows: the result, its accounting or measurement boundary, its evidence type, and the next proof required. For example, “full-scale magnet test” should lead to “integrated plasma operation and plant conditions remain separate demonstrations.” “Simulated target gain” should lead to “validate gain with the proposed target and driver, then repeat at the intended rate.” This makes the project educational even as records change.

## 8 Risk and uncertainty

### Replace the single risk score with explicit questions

The requested interpretive layer is useful if it exposes its reasoning. Give each route a short assessment and a matrix covering these six reader-facing themes: plasma and fuel physics; electrical balance; sustained or repeated operation; fuel cycle; materials and maintenance; delivery and economics. The detailed dataset expands them into thirteen evidence questions.

Use evidence states such as **demonstrated under relevant conditions**, **partial or subsystem evidence**, **modeled**, **announced target**, **public evidence insufficient**, and **not applicable to this design**. Evidence states are not equally spaced scores. “Not applicable” means that a specific requirement is absent or different, not that the entire route is low risk.

Every assessment should have a rationale and a test that would change it. A high-quality result is one that makes a risk narrower: a measured uncertainty bound, sustained performance in an integrated configuration, a demonstrated replacement operation, a measured breeding balance, or a credible complete-cycle energy audit. The site should reward those distinctions rather than the size of a claimed future plant.

### The principal engineering questions

**Fuel and plasma:** does the demonstrated fuel and operating regime support the intended reactor? Relevant evidence includes reaction yields, ion and electron temperatures, radiation losses, confinement and stability measured together. This is a particularly consequential question for advanced fuels and less mature configurations. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_007](https://arxiv.org/html/2505.03834v6)

**Electrical balance:** does the complete system produce more electricity than it consumes over a meaningful interval? Input recovery, auxiliary consumption and stored energy all need a consistent boundary. A transient output trace is insufficient without the rest of the cycle. [PHY_006](https://arxiv.org/abs/2105.10954) [MAG_HELION_POLARIS](https://www.helionenergy.com/polaris) [MAG_REALTA_DEC](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/)

**Duty and repetition:** can a steady-state design sustain its intended conditions, or can a pulsed design repeatedly return to its starting state? A single high-gain shot and a rapid low-power engineering cycle answer different questions. Both can be valuable without being interchangeable. [PHY_007](https://arxiv.org/html/2505.03834v6) [PHY_034](https://www.lle.rochester.edu/inertial-confinement-fusion/) [ALT_ZAP_STRATEGY](https://www.zapenergy.com/updates/2026/04/zap-energy-advances-integrated-nuclear-strategy-and-appoints-zabrina-johal-as-ceo)

**Tritium and breeding:** can the system obtain a startup inventory, produce enough replacement fuel, process it, contain it and keep losses sufficiently low? A calculated breeding ratio must be evaluated alongside ports, structural material, extraction, inventory and availability. “Breeds tritium” should not be a binary proven checkmark based on a proposed blanket alone. [PHY_022](https://www.iter.org/machine/supporting-systems/tritium-breeding) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)

**Materials and maintenance:** can walls, divertors, blankets, magnets, optics and power electronics meet their required lives and be replaced economically? Neutron exposure changes material properties; heat exhaust and mechanical cycling create other limits. IFMIF-DONES and other test facilities matter because materials qualification is part of the path to power, even though those facilities are not power-plant contenders. [PHY_024](https://fusionforenergy.europa.eu/news/eu-invest-ifmif-dones-fusion-facility/) [PHY_025](https://ifmif-dones.es/) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)

**Delivery and economics:** can an organization fund and construct the integrated plant, qualify suppliers, obtain permissions, connect to the grid and operate at useful availability and cost? A power purchase agreement demonstrates customer intent under contractual conditions. It does not establish that the machine works or that its schedule is independently validated. Gross power, net power, capacity factor and availability should remain separate fields.

### The relative judgments that are defensible

Tokamaks have comparatively deep high-performance experimental heritage, while a commercial plant still faces substantial integration and economic questions. Stellarators offer an attractive route toward sustained operation, accompanied by three-dimensional engineering and reactor-regime validation. Indirect-drive laser fusion can point to demonstrated ignition in a predecessor experiment, while its proposed commercial drivers, targets and repetition systems remain separate extrapolations. Advanced-fuel and direct-conversion concepts can reduce some eventual plant burdens while making other physics or fuel-cycle requirements harder. These are architecture-level judgments supported by the mechanisms; they should not be presented as statistical forecasts. [PHY_004](https://www.energy.gov/science/doe-explainstokamaks) [PHY_005](https://www.energy.gov/science/doe-explainsstellarators) [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition)

The useful company question is “Which assumptions does this team still need to validate?” A confident total order from safest to riskiest would conceal those assumptions. Readers can instead filter by the uncertainty they care about and inspect the company evidence beneath it.

## 9 Money and geography

The FIA's July 2026 survey reports 56 responding companies, $14.24 billion of cumulative declared funding and $4.48 billion in the reporting year. It is an industry survey of voluntary responses with its own treatment of incoming investment. It should appear as a dated context card, not as an audited total of cash currently available to fusion developers. [PAR_FIA_RELEASE](https://www.fusionindustryassociation.org/fusion-industry-attracts-record-annual-funding-of-4-48bn-raising-total-to-14-24bn/)

F4E's 2026 comparison examines a different quantity: identified public and private funding mobilized or formally committed during 2022–2025 across the US, China, EU, UK and Japan, including specified ITER contributions. Its country figures cannot be added to the FIA total. The methodological distinction is more informative than a false reconciliation of two headline numbers. [PAR_F4E_REPORT](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf) [PAR_F4E_RELEASE](https://fusionforenergy.europa.eu/news/f4e-publishes-the-first-global-fusion-energy-trends-report/)

For individual companies, show the original currency and announcement date first. The financing ledger supplies event type, amount, qualifier, source and whether prior financing is included. Do not infer a cash balance or runway from capital raised. Do not add cumulative totals to their constituent rounds. A source-provided dollar equivalent is a dated approximation, not permission to convert all historical funding at an invented exchange rate.

The default money view should be a sortable evidence table. An optional chart can compare entries within the same currency and compatible funding basis. Conditional commitments, public cooperation-project budgets, credit facilities and valuations should have distinct symbols or separate panels. When a credible cumulative amount is absent, the row can still show a recent round with its date. Source visibility matters more than filling every bar.

The geography model separates an organization from its sites. A company may have a headquarters, one or more laboratories, a factory and an announced power-plant location in different places. Public experiments and engineering facilities should be visible in an optional map layer because they explain where the underlying science and supply chain come from. The map coordinates in this packet are approximate city or research-area positions, not surveyed facility coordinates. Their precision must remain visible; cluster markers and provide a searchable list.

The curated scope deliberately includes US and European companies, Chinese developers and public projects, Japanese development and suppliers, Canadian work, and a New Zealand dipole developer. It does not claim complete coverage of the global industry. An omitted company should never be read as a failed company or an editorial judgment about its prospects.

## 10 Public programmes and light history

The historical narrative should occupy one compact section with an expandable timeline. Start with laboratory fusion and stellar-energy theory, introduce magnetic confinement and the emergence of tokamaks, then show D-T experiments, large international programmes, ignition and the present diversity of private machines. The timeline data provides selected events; it is not an exhaustive chronology or a smooth record curve. [PHY_027](https://www.pppl.gov/about/history) [PHY_029](https://www.iter.org/fusion-energy/60-years-progress) [PHY_030](https://www.nature.com/articles/133413a0) [PHY_031](https://journals.aps.org/pr/abstract/10.1103/PhysRev.55.434)

The central historical lesson is that different milestones answer different questions. Public research often deliberately isolates a physics or engineering problem. NIF studies ignition and high-energy-density physics, W7-X tests stellarator performance, long-pulse tokamaks test sustained operation, and neutron/material facilities develop components. Their value should not be judged by whether each exports electricity.

ITER's design and current schedule are described in the gain section. STEP's current programme targets operation from 2040 at West Burton and aims to address net power, tritium breeding and commercial availability. Its £1.3 billion next-stage funding sits inside wider UK support; neither number is a startup equity round or a verified full-plant price. [PAR_STEP_STRATEGY](https://www.gov.uk/government/publications/uk-fusion-energy-ltd-ukfe-strategy/uk-fusion-energy-ltd-strategy-accessible-version) [PAR_UK_STRATEGY](https://www.gov.uk/government/publications/uk-fusion-strategy-2026/a-new-energy-revolution-the-uks-plan-for-delivering-fusion-energy-accessible-webpage)

BEST is a high-field tokamak under construction in Hefei for burning-plasma research. The partner research-plan release targets first plasma in 2027 and high-Q D-T research; a later F4E overview gives late 2027 or early 2028. Preserve the schedule range and purpose. A first-plasma target must not be rendered as first electricity. CRAFT is enabling technology infrastructure, which belongs in a different site-role category. [PAR_BEST_PLAN](https://euro-fusion.org/eurofusion-news/eurofusion-asipp-best-research-plan/) [PAR_F4E_REPORT](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf)

The US Department of Energy's finalized June 2026 roadmap supports a path toward pilot and commercial plants in the mid-2030s, with explicit dependence on future partnerships and appropriations. Display that as a policy goal. It is not independent evidence that the deadline will be met. [PAR_DOE_ROADMAP](https://www.energy.gov/articles/energy-department-releases-finalized-fusion-science-and-technology-roadmap-accelerate)

## 11 Safety regulation and the energy system

Fusion has potential safety advantages over a self-sustaining fission chain reaction, but a power plant still has hazards to manage: radiation, radioactive inventories and activated materials, large stored energies, cryogenics, vacuum systems, and design-specific chemical or thermal risks. Avoid “no radioactive waste,” “no radiation,” or “inherently risk-free.” The amount and character of waste depend on materials, fuel, neutron exposure and the plant design. [PHY_043](https://www.iter.org/faqs?thematic=75)

The regulatory panel should remain compact. The NRC published a proposed fusion-machine rule in February 2026; the official status reviewed for this packet describes it as proposed. The byproduct-material framework is an important policy distinction, not an exemption from licensing, environmental obligations, siting or other applicable requirements. No legal conclusion about a particular project should be inferred from this overview. [PHY_040](https://www.federalregister.gov/documents/2026/02/26/2026-03865/regulatory-framework-for-fusion-machines) [PHY_041](https://www.nrc.gov/materials/fusion/rulemaking-status)

Economically useful fusion would be dispatchable low-carbon energy if the plants achieve the required availability and economics. Its value would depend on the future energy system, financing, operating costs and alternatives. The report does not supply a credible universal fusion electricity price or forecast of energy-market displacement, so those should not be invented for the visualization. A plant announcement is an opportunity to examine requirements, not a reason to assume cheap electricity has already arrived.

## 12 What Codex should build

The complete implementation contract is in the build specification. The minimum coherent version includes the introductory energy flow, approach explorer, gain-boundary comparison, evidence-labelled company cards, funding table, map with site roles, selected history, risk questions and source drawer. Use the supplied static data. The builder should not need to research company facts, guess missing values or create its own risk scoring system.

Progressive disclosure is essential. A first-time reader can finish the core explanation in several minutes. An interested reader can compare three entities, inspect numerical records, read the source behind a claim and download the data. The data and examples in this packet are the content; Codex's main work is the visual implementation, responsive behavior and interaction design.

The handoff also includes a data dictionary, a validator, formula examples and editorial acceptance criteria. Unknowns are intentional. They should remain explicit until new evidence is added in a later editorial update. The snapshot date belongs on the page and in shared screenshots. Company targets should remain forecasts even after their dates pass; only a reviewed result can change their evidence status.

## 13 Specific limitations and maintenance

The collection is comprehensive across the selected mechanisms and major comparison cases, but selective across organizations. Private data is uneven. A company source establishes what the company reports; it does not provide independent verification merely because the URL is primary. A peer-reviewed design can substantiate a model without demonstrating a built plant. Programme documents describe intentions and requirements as well as achieved results.

The source registry records dates when available and a retrieval date for live pages. Some institutional servers intermittently rejected direct access; the BEST partner release and F4E review provide a bounded record without inventing unobserved detail. Source contradictions are retained in the data-quality notes. In particular, do not use the inconsistent NIF October 2025 gain row in a calculated series, and do not silently reconcile different Helical financing totals or TAE schedule scopes.

Future updates should be event-driven: new measured gain or conversion results, a revised financing close, a fuel or architecture change, a site or programme change, a formal rule, or a missed/changed target. First update the source, then the claim, then any derived chart. An elapsed target date alone must not be converted automatically into a failed-physics verdict.

The initial release can be built entirely from this packet. The remaining research gaps are already represented as nulls, qualifiers, evidence states and exclusions. They are not implementation tasks for Codex to fill with guesses.


# Appendix A — Companies and suppliers

The 27 profiles below are deliberately not ranked. Dates, amount types, evidence scope and missing information are part of each profile. All figures are snapshots, not live feeds.


## Commonwealth Fusion Systems

Compact high-field tokamak developer building SPARC before the first ARC electricity plant.

**Approach:** Tokamak. **Variant:** high field tokamak.

**Experimental fuel/status:** SPARC is under construction; no current burning-fuel operation established.

**Intended fuel:** D-T

**Mechanism:** HTS magnets confine a toroidal plasma with plasma current. ARC would capture D-T neutron energy as heat and use a turbine cycle. [MAG_CFS_FUND_2026](https://www.cfs.energy/news-and-media/commonwealth-fusion-systems-raises-another-1-billion-bringing-total-capital-raised-to-4-billion/) [MAG_CFS_SPARC](https://cfs.energy/technology/sparc/) [MAG_CFS_ARC](https://cfs.energy/technology/arc/) [MAG_CFS_MAGNET](https://cfs.energy/technology/hts-magnets/)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Commonwealth Fusion Systems headquarters / primary location | headquarters / listed location | Devens, Massachusetts, United States |
| SPARC | experiment / under construction | Devens, Massachusetts, United States |
| ARC / Fall Line Fusion Power Station | planned power plant / planned | Chesterfield County, Virginia, United States |

### Evidence and current plans

- **Experimental result.** Large-bore HTS magnet reached 20 T; this is a component milestone. event date: 2021. [MAG_CFS_MAGNET](https://cfs.energy/technology/hts-magnets/)

- **Target.** SPARC plasma Q > 1. target window: 2027. [MAG_CFS_SPARC](https://cfs.energy/technology/sparc/)

- **Target.** ARC approximately 400 MW delivered to grid. target window: early 2030s. [MAG_CFS_ARC](https://cfs.energy/technology/arc/)


**Financing snapshot:** $4.0B capital raised, July 2026

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-07-30 | USD 1B | round. Additional financing announced; separate from cumulative total. [MAG_CFS_FUND_2026](https://www.cfs.energy/news-and-media/commonwealth-fusion-systems-raises-another-1-billion-bringing-total-capital-raised-to-4-billion/) |
| 2026-07-30 | USD 4B | cumulative total. Reported capital raised; includes latest round. [MAG_CFS_FUND_2026](https://www.cfs.energy/news-and-media/commonwealth-fusion-systems-raises-another-1-billion-bringing-total-capital-raised-to-4-billion/) |

### Interpretive assessment

- SPARC gain demonstration pending. Tokamak heritage and magnet achievement support a testable path, but the planned high-field burning plasma remains to be demonstrated. [MAG_CFS_SPARC](https://cfs.energy/technology/sparc/) [MAG_CFS_MAGNET](https://cfs.energy/technology/hts-magnets/)

- Shared D-T engineering burden. An ARC plant must combine tritium breeding, neutron shielding, heat exhaust and maintainable components. A successful SPARC result would not by itself validate those plant systems. [MAG_CFS_ARC](https://cfs.energy/technology/arc/)


## Helion

Pulsed FRC developer pursuing direct inductive electricity recovery and an early Microsoft power project.

**Approach:** Pulsed compressed field reversed configuration. **Variant:** pulsed frc.

**Experimental fuel/status:** Polaris lists D-D, D-T and D-He3; January 2026 reported result specifically used D-T.

**Intended fuel:** D-He3; deuterium reactions and helium-3 production remain part of the proposed fuel cycle.

**Mechanism:** Two magnetized plasmas merge and are compressed. Their subsequent expansion can induce current in surrounding coils and return energy to capacitors. [MAG_HELION_FUND](https://www.helionenergy.com/newsroom/helion-raises-465-million-series-g-funding-round-to-meet-surging-global-demand-for-power) [PHY_037](https://www.helionenergy.com/technology) [MAG_HELION_POLARIS](https://www.helionenergy.com/polaris) [MAG_HELION_ORION](https://www.helionenergy.com/orion) [MAG_HELION_POLARIS_RESULTS](https://www.helionenergy.com/newsroom/helion-achieves-new-fusion-energy-milestones) [MAG_HELION_CHIPS](https://www.helionenergy.com/newsroom/helion-signs-letter-of-intent-for-175-million-chips-award-to-advance-semiconductor-fusion-energy)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Helion headquarters / primary location | headquarters / listed location | Everett, Washington, United States |
| Polaris | experiment / operating | Everett, Washington, United States |
| Orion | planned power plant / under construction | Malaga, Washington, United States |

### Evidence and current plans

- **Experimental result.** Company reported D-T fusion in Polaris and 150 million °C plasma temperature. event date: 2026-01. [MAG_HELION_POLARIS_RESULTS](https://www.helionenergy.com/newsroom/helion-achieves-new-fusion-energy-milestones)

- **Target.** Polaris aims to put a portion of fusion-origin energy into capacitor-bank electricity; the earlier net-electricity formulation has been discontinued. [MAG_HELION_POLARIS](https://www.helionenergy.com/polaris)

- **Target.** Orion initial operations, associated with a 50 MW Microsoft commitment. target window: 2028. [MAG_HELION_ORION](https://www.helionenergy.com/orion)


**Financing snapshot:** Series G finalized at $500M in September 2026; $1.5B cumulative reported June

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-06-04 | USD 465M | round. Initial Series G amount, superseded by September final close. [MAG_HELION_FUND](https://www.helionenergy.com/newsroom/helion-raises-465-million-series-g-funding-round-to-meet-surging-global-demand-for-power) |
| 2026-09 | USD 500M | round. Final close of SAME Series G round; includes original $465 million. [MAG_HELION_FUND](https://www.helionenergy.com/newsroom/helion-raises-465-million-series-g-funding-round-to-meet-surging-global-demand-for-power) |
| 2026-06-04 | USD 1.5B | cumulative total. Cumulative amount reported with June announcement; do not silently update by arithmetic. [MAG_HELION_FUND](https://www.helionenergy.com/newsroom/helion-raises-465-million-series-g-funding-round-to-meet-surging-global-demand-for-power) |
| 2026-10-22 | Up to USD 175M | government equity award. UP TO amount in LOI, definitive award pending; government non-voting equity on award. [MAG_HELION_CHIPS](https://www.helionenergy.com/newsroom/helion-signs-letter-of-intent-for-175-million-chips-award-to-advance-semiconductor-fusion-energy) |
| 2026-10-22 | USD 50M | conditional commitment. Planned private investment tied to CHIPS project; not reported closed. [MAG_HELION_CHIPS](https://www.helionenergy.com/newsroom/helion-signs-letter-of-intent-for-175-million-chips-award-to-advance-semiconductor-fusion-energy) |

### Interpretive assessment

- Energy-boundary proof remains essential. A recoverable capacitor-bank signal must be distinguished from recycled input electricity; sustained whole-plant net output is a separate milestone. [MAG_HELION_POLARIS](https://www.helionenergy.com/polaris) [PHY_037](https://www.helionenergy.com/technology)

- Advanced-fuel transition. Current D-T results do not demonstrate commercial D-He3 conditions, helium-3 supply or a closed fuel cycle. Reduced neutron production is not zero-neutron operation. [PHY_037](https://www.helionenergy.com/technology) [MAG_HELION_POLARIS_RESULTS](https://www.helionenergy.com/newsroom/helion-achieves-new-fusion-energy-milestones)

- Aggressive company schedule. The 2028 construction programme depends on physics, repetition, components and electricity balance progressing together. Construction alone does not validate these. [MAG_HELION_ORION](https://www.helionenergy.com/orion) [MAG_HELION_POLARIS](https://www.helionenergy.com/polaris)


## TAE Technologies

Neutral-beam FRC developer whose preferred commercial fuel is hydrogen-boron; its shortened roadmap proceeds directly toward Da Vinci.

**Approach:** Beam sustained field reversed configuration. **Variant:** beam driven frc.

**Experimental fuel/status:** Experimental light-ion plasmas; no commercial p-B11 burning plasma established in the reviewed evidence. Exact current mixture not independently verified here.

**Intended fuel:** Preferred p-B11; D-He3 is an additional prospective option, not a verified replacement baseline.

**Mechanism:** Energetic neutral beams create and sustain a field-reversed plasma. The preferred p-B11 power concept would collect radiation and particle energy as heat for electricity. [MAG_TAE_FUND](https://tae.com/tae-technologies-raises-150-million-in-latest-funding-round/) [MAG_TAE_ROADMAP](https://tae.com/tae-shortens-device-roadmap-prepares-for-commercial-era/) [MAG_TAE_NATURE](https://pubmed.ncbi.nlm.nih.gov/40221407/) [MAG_TAE_FUEL](https://tae.com/faq-fusion/) [MAG_TAE_HE3](https://tae.com/tae-technologies-and-black-moon-energy-corporation-enter-into-strategic-helium-3-supply-and-commercialization-agreement-for-fusion-power/) [MAG_TAE_DEBT](https://tae.com/tae-technologies-advances-site-evaluation-process-with-multi-state-visits-ahead-of-first-fusion-power-plant/) [MAG_TAE_MERGER](https://tae.com/trump-media-technology-group-and-tae-technologies-file-form-s-4-registration-statement-for-proposed-merger/)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| TAE Technologies headquarters / primary location | headquarters / listed location | Foothill Ranch, California, United States |
| Norm / former Norman configuration | experiment / operating | Foothill Ranch, California, United States |
| Da Vinci | planned power plant / site not verified selected |  |

### Evidence and current plans

- **Experimental result.** Neutral-beam injection formed field-reversed configurations from seed plasmas in approximately 10 ms. publication date: 2025-04-12. [MAG_TAE_NATURE](https://pubmed.ncbi.nlm.nih.gov/40221407/)

- **Organization event.** Company removed Copernicus from its roadmap; this is a programme change, not achieved gain. reported at: 2025-11-17. [MAG_TAE_ROADMAP](https://tae.com/tae-shortens-device-roadmap-prepares-for-commercial-era/)

- **Target.** August release targets Da Vinci 50 MWe operations in 2031. Later filing sequencing could not be fully reconciled; do not label this a confirmed grid date. target window: 2031. [MAG_TAE_HE3](https://tae.com/tae-technologies-and-black-moon-energy-corporation-enter-into-strategic-helium-3-supply-and-commercialization-agreement-for-fusion-power/) [MAG_TAE_MERGER](https://tae.com/trump-media-technology-group-and-tae-technologies-file-form-s-4-registration-statement-for-proposed-merger/)


**Financing snapshot:** >$1.3B equity reported June 2025; $200M convertible-note proceeds confirmed March 2026

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2025-06-02 | More than USD 150M | round. More than $150 million; numeric value is a lower-bound anchor. [MAG_TAE_FUND](https://tae.com/tae-technologies-raises-150-million-in-latest-funding-round/) |
| 2025-06-02 | More than USD 1.3B | cumulative total. More than $1.3 billion in cumulative EQUITY at that date. [MAG_TAE_FUND](https://tae.com/tae-technologies-raises-150-million-in-latest-funding-round/) |
| 2026-03-26 | USD 200M | debt facility. Company confirms funds already provided under convertible promissory note; not equity-round cash. [MAG_TAE_DEBT](https://tae.com/tae-technologies-advances-site-evaluation-process-with-multi-state-visits-ahead-of-first-fusion-power-plant/) |
| 2026-03-26 | USD 100M | debt facility. Additional amount available upon Form S-4 filing. Filing occurred September; drawdown not verified. [MAG_TAE_DEBT](https://tae.com/tae-technologies-advances-site-evaluation-process-with-multi-state-visits-ahead-of-first-fusion-power-plant/) [MAG_TAE_MERGER](https://tae.com/trump-media-technology-group-and-tae-technologies-file-form-s-4-registration-statement-for-proposed-merger/) |
| 2026-09-30 | Undisclosed | proposed merger. Proposed all-stock merger; S-4 filing not closing. Valuation excluded from funding. [MAG_TAE_MERGER](https://tae.com/trump-media-technology-group-and-tae-technologies-file-form-s-4-registration-statement-for-proposed-merger/) |

### Interpretive assessment

- Advanced-fuel energy balance unproven. FRC formation is a distinct achievement from p-B11 fusion gain; beam power and radiation losses must be balanced at much more demanding operating conditions. [MAG_TAE_NATURE](https://pubmed.ncbi.nlm.nih.gov/40221407/) [MAG_TAE_FUEL](https://tae.com/faq-fusion/)

- Roadmap and fuel options evolving. Skipping Copernicus concentrates validation in later development. Prospective lunar helium-3 supply is an option, not available operating fuel. [MAG_TAE_ROADMAP](https://tae.com/tae-shortens-device-roadmap-prepares-for-commercial-era/) [MAG_TAE_HE3](https://tae.com/tae-technologies-and-black-moon-energy-corporation-enter-into-strategic-helium-3-supply-and-commercialization-agreement-for-fusion-power/)

- Proposed merger and debt differ from equity. The filed merger is not verified closed; the supplied convertible note and additional available facility must remain separate from historic equity totals. [MAG_TAE_DEBT](https://tae.com/tae-technologies-advances-site-evaluation-process-with-multi-state-visits-ahead-of-first-fusion-power-plant/) [MAG_TAE_MERGER](https://tae.com/trump-media-technology-group-and-tae-technologies-file-form-s-4-registration-statement-for-proposed-merger/)


## Tokamak Energy

Spherical-tokamak developer with a separate commercial HTS magnet business, TE Magnetics.

**Approach:** Spherical tokamak. **Variant:** spherical tokamak.

**Experimental fuel/status:** ST40 experimental hydrogen-isotope plasma; exact current campaign mixture not established in the reviewed sources.

**Intended fuel:** D-T

**Mechanism:** A compact, low-aspect-ratio tokamak confines plasma using external fields and plasma current; HTS technology is being developed for later systems. [MAG_TE_FUND](https://tokamakenergy.com/2024/11/20/tokamak-energy-raises-125m-to-commercialise-transformative-fusion-and-magnet-technologies/) [MAG_TE_DEMO4](https://tokamakenergy.com/2026/09/09/tokamak-energy-completes-world-leading-fusion-magnet-campaign-validating-technology-for-commercial-hts-systems/) [MAG_TE_ST40](https://tokamakenergy.com/2023/02/28/institute-of-physics-marks-tokamak-energys-record-100-million-degrees-fusion-plasma/) [MAG_TE_US](https://tokamakenergy.com/usa/)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Tokamak Energy headquarters / primary location | headquarters / listed location | Milton Park / Abingdon, Oxfordshire, United Kingdom |
| ST40 and Demo4 campus | experiment and components / operating | Milton Park / Abingdon, Oxfordshire, United Kingdom |

### Evidence and current plans

- **Experimental result.** ST40 exceeded 100 million °C ion temperature; not a gain or electricity milestone. event date: 2022. [MAG_TE_ST40](https://tokamakenergy.com/2023/02/28/institute-of-physics-marks-tokamak-energys-record-100-million-degrees-fusion-plasma/)

- **Experimental result.** Demo4 magnet campaign reached 13.7 T; approximately 10,000 hours covered varying energized conditions. reported at: 2026-09-09. [MAG_TE_DEMO4](https://tokamakenergy.com/2026/09/09/tokamak-energy-completes-world-leading-fusion-magnet-campaign-validating-technology-for-commercial-hts-systems/)

- **Target.** U.S. D-T pilot design targets 800 MW fusion power and 85 MW net electricity in the 2030s. target window: 2030s. [MAG_TE_US](https://tokamakenergy.com/usa/)


**Financing snapshot:** $335M reported total: $275M private + $60M government

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2024-11-20 | USD 125M | round. Private financing round. [MAG_TE_FUND](https://tokamakenergy.com/2024/11/20/tokamak-energy-raises-125m-to-commercialise-transformative-fusion-and-magnet-technologies/) |
| 2024-11-20 | USD 275M | cumulative total. Private investment subtotal. [MAG_TE_FUND](https://tokamakenergy.com/2024/11/20/tokamak-energy-raises-125m-to-commercialise-transformative-fusion-and-magnet-technologies/) |
| 2024-11-20 | USD 60M | cumulative total. Government funding subtotal; not private equity. [MAG_TE_FUND](https://tokamakenergy.com/2024/11/20/tokamak-energy-raises-125m-to-commercialise-transformative-fusion-and-magnet-technologies/) |
| 2024-11-20 | USD 335M | cumulative total. Combined $275 million private plus $60 million government; do not add component rows again. [MAG_TE_FUND](https://tokamakenergy.com/2024/11/20/tokamak-energy-raises-125m-to-commercialise-transformative-fusion-and-magnet-technologies/) |

### Interpretive assessment

- Compact central-column constraints. A low-aspect-ratio D-T reactor must fit shielding, magnets and breeding structures into restricted space while handling heat and neutron exposure. [MAG_TE_US](https://tokamakenergy.com/usa/) [MAG_TE_ST40](https://tokamakenergy.com/2023/02/28/institute-of-physics-marks-tokamak-energys-record-100-million-degrees-fusion-plasma/)

- Component success is not burning-plasma success. Demo4 verifies magnet behavior; a complete HTS fusion plant still requires integrated plasma, fuel-cycle and power systems. [MAG_TE_DEMO4](https://tokamakenergy.com/2026/09/09/tokamak-energy-completes-world-leading-fusion-magnet-campaign-validating-technology-for-commercial-hts-systems/) [MAG_TE_US](https://tokamakenergy.com/usa/)


## Type One Energy

HTS stellarator developer planning engineering verification and a grid-power project at a retired TVA coal site.

**Approach:** Stellarator. **Variant:** stellarator.

**Experimental fuel/status:** Infinity One not yet commissioned; no company burning-plasma operation established.

**Intended fuel:** D-T for Infinity Two

**Mechanism:** Three-dimensional superconducting coils provide a twisted toroidal confinement field without depending on a large driven plasma current. [MAG_TYPEONE_FUND](https://typeoneenergy.com/insights-announcements/type-one-energy-completes-200m-series-b-financing/) [MAG_TYPEONE_TECH](https://typeoneenergy.com/our-technology/) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Type One Energy headquarters / primary location | headquarters / listed location | Knoxville, Tennessee, United States |
| Infinity One at TVA Bull Run | experiment / planned | Clinton, Tennessee, United States |
| Infinity Two at TVA Bull Run | planned power plant / planned | Clinton, Tennessee, United States |

### Evidence and current plans

- **Model or design.** Infinity Two physics and engineering designs have been published; no operating company-scale burning plasma is established. [MAG_TYPEONE_TECH](https://typeoneenergy.com/our-technology/)

- **Target.** Commission Infinity One engineering verification platform. target window: 2029. [MAG_TYPEONE_TECH](https://typeoneenergy.com/our-technology/)

- **Target.** Infinity Two design: 800 MW fusion power and 400 MWe grid output. [MAG_TYPEONE_TECH](https://typeoneenergy.com/our-technology/)

- **Target.** Company survey target for first grid power. target window: 2034. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)


**Financing snapshot:** $200M Series B announced October 2026

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-10-06 | USD 200M | round. Series B; no current cumulative amount asserted from this release. [MAG_TYPEONE_FUND](https://typeoneenergy.com/insights-announcements/type-one-energy-completes-200m-series-b-financing/) |

### Interpretive assessment

- Three-dimensional reactor integration. Coil construction, neutron shielding, blanket access and maintenance must work together in the complete stellarator geometry. [MAG_TYPEONE_TECH](https://typeoneenergy.com/our-technology/)

- Heritage is not the company’s demonstration. Results from HSX and W7-X inform the design; they do not count as achieved Infinity One or Infinity Two milestones. [MAG_TYPEONE_TECH](https://typeoneenergy.com/our-technology/)

- D-T supply and breeding required. Electricity deployment also requires a workable tritium cycle and durable neutron-exposed systems. [MAG_TYPEONE_TECH](https://typeoneenergy.com/our-technology/)


## Proxima Fusion

European HTS stellarator developer building from Wendelstein 7-X scientific heritage toward Alpha and Stellaris.

**Approach:** Stellarator. **Variant:** quasi isodynamic stellarator.

**Experimental fuel/status:** No operating company fusion experiment established; Alpha is planned.

**Intended fuel:** D-T for the power-plant concept

**Mechanism:** Optimized quasi-isodynamic three-dimensional magnetic fields are designed to reduce particle losses and support steady plasma confinement. [MAG_PROXIMA_FUND](https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion) [MAG_PROXIMA_ALPHA](https://www.proximafusion.com/program/alpha) [MAG_PROXIMA_STELLARIS](https://www.proximafusion.com/program/stellaris) [MAG_PROXIMA_PAPER](https://www.proximafusion.com/press-news/proxima-fusion-and-partners-publish-stellaris-fusion-power-plant-concept-to-bring-limitless-safe-clean-energy-to-the-grid)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Proxima Fusion headquarters / primary location | headquarters / listed location | Munich, Bavaria, Germany |
| Alpha | planned experiment / planned | Garching, Bavaria, Germany |
| Stellaris | planned power plant / planned | Gundremmingen, Bavaria, Germany |

### Evidence and current plans

- **Model or design.** Published an integrated Stellaris plant concept; this is design evidence, not achieved plasma gain. publication date: 2025-02-26. [MAG_PROXIMA_PAPER](https://www.proximafusion.com/press-news/proxima-fusion-and-partners-publish-stellaris-fusion-power-plant-concept-to-bring-limitless-safe-clean-energy-to-the-grid)

- **Target.** Demonstrate an HTS stellarator model coil. target window: 2027. [MAG_PROXIMA_PAPER](https://www.proximafusion.com/press-news/proxima-fusion-and-partners-publish-stellaris-fusion-power-plant-concept-to-bring-limitless-safe-clean-energy-to-the-grid)

- **Target.** Alpha plasma Q > 1. target window: early 2030s. [MAG_PROXIMA_ALPHA](https://www.proximafusion.com/program/alpha)

- **Target.** Stellaris electricity delivery. target window: 2030s. [MAG_PROXIMA_STELLARIS](https://www.proximafusion.com/program/stellaris)


**Financing snapshot:** >€650M reported funding, including €95M grants; €411M latest round

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-07-07 | EUR 411M | round. Source supplies approximate USD equivalent. [MAG_PROXIMA_FUND](https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion) |
| 2026-07-07 | More than EUR 650M | cumulative total. More than €650 million, including €95 million grants; not pure equity. [MAG_PROXIMA_FUND](https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion) |
| 2026-07-07 | EUR 95M | cumulative total. Public grants already included within reported cumulative financing. [MAG_PROXIMA_FUND](https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion) |
| 2026-07-07 | Up to EUR 400M | conditional commitment. Separate Bavaria public commitment; do not treat as received equity or add to secured total. [MAG_PROXIMA_FUND](https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion) |

### Interpretive assessment

- Burning-plasma extrapolation pending. W7-X supports the confinement approach; a compact high-field D-T plant requires additional physics and engineering validation. [MAG_PROXIMA_PAPER](https://www.proximafusion.com/press-news/proxima-fusion-and-partners-publish-stellaris-fusion-power-plant-concept-to-bring-limitless-safe-clean-energy-to-the-grid) [MAG_PROXIMA_ALPHA](https://www.proximafusion.com/program/alpha)

- Integrated high-field stellarator burden. Complex HTS coils, heat exhaust, tritium breeding and maintainability must be demonstrated together. [MAG_PROXIMA_PAPER](https://www.proximafusion.com/press-news/proxima-fusion-and-partners-publish-stellaris-fusion-power-plant-concept-to-bring-limitless-safe-clean-energy-to-the-grid)

- Mixed and committed funding. The reported cumulative total includes grants, and Bavaria’s commitment differs from received financing. [MAG_PROXIMA_FUND](https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion)


## Thea Energy

Stellarator developer replacing individually twisted coils with many actively controlled planar HTS coils.

**Approach:** Stellarator. **Variant:** planar coil stellarator.

**Experimental fuel/status:** No Eos plasma operation established; demonstrated work includes magnet arrays.

**Intended fuel:** D-D for Eos; D-T for Helios electricity plant

**Mechanism:** A surrounding array of simple planar coils synthesizes a three-dimensional stellarator field through individually controlled currents. [MAG_THEA_FUND](https://thea.energy/press-release/thea-energy-raises-100-million-series-b-funding-to-build-scalable-fusion-power-plants/) [MAG_THEA_EXTENSION](https://thea.energy/press-release/thea-energy-extends-series-b-funding-to-deploy-efficient-and-economical-fusion-power/) [MAG_THEA_EOS](https://thea.energy/eos/) [MAG_THEA_HELIOS](https://arxiv.org/abs/2512.08027) [MAG_THEA_CANIS](https://arxiv.org/abs/2503.18960)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Thea Energy headquarters / primary location | headquarters / listed location | Kearny, New Jersey, United States |
| Magnet development facilities | component research / operating | Kearny, New Jersey, United States |
| Eos | planned experiment / site selection in progress as of reviewed release |  |

### Evidence and current plans

- **Experimental result.** Canis nine-coil array controlled stellarator-relevant fields to within 1% of prediction at 20 K. publication date: 2025-03-19. [MAG_THEA_CANIS](https://arxiv.org/abs/2503.18960)

- **Target.** Build Eos as an integrated D-D stellarator; published performance values are targets. [MAG_THEA_EOS](https://thea.energy/eos/)

- **Target.** Helios preconceptual design: 1.1 GW thermal and 390 MW net electric power. [MAG_THEA_HELIOS](https://arxiv.org/abs/2512.08027)

- **Target.** Begin Helios construction by the end of the decade. target window: by the end of the 2020s. [MAG_THEA_FUND](https://thea.energy/press-release/thea-energy-raises-100-million-series-b-funding-to-build-scalable-fusion-power-plants/)


**Financing snapshot:** $100M Series B plus undisclosed extension; $20M ARPA-E award separately

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-05-27 | USD 100M | round. Series B initial financing announcement. [MAG_THEA_FUND](https://thea.energy/press-release/thea-energy-raises-100-million-series-b-funding-to-build-scalable-fusion-power-plants/) |
| 2026-08-18 | Undisclosed | round. Additional Series B extension amount undisclosed; not zero. [MAG_THEA_EXTENSION](https://thea.energy/press-release/thea-energy-extends-series-b-funding-to-deploy-efficient-and-economical-fusion-power/) |
| 2026-08-18 | USD 20M | grant. ARPA-E SCALEUP award reported by company; do not add to private-equity series. [MAG_THEA_EXTENSION](https://thea.energy/press-release/thea-energy-extends-series-b-funding-to-deploy-efficient-and-economical-fusion-power/) |

### Interpretive assessment

- Complexity shifts into many controlled coils. Simple coil shapes can ease manufacturing, while the integrated machine must validate many currents, connections and field-control interactions. [MAG_THEA_CANIS](https://arxiv.org/abs/2503.18960) [MAG_THEA_HELIOS](https://arxiv.org/abs/2512.08027)

- Component and design stages. Canis is a subsystem demonstration; Helios capacity factor, net power and coil lifetime are calculations, not operating records. [MAG_THEA_CANIS](https://arxiv.org/abs/2503.18960) [MAG_THEA_HELIOS](https://arxiv.org/abs/2512.08027)

- Later D-T conversion. Eos D-D operation would not alone demonstrate Helios tritium breeding and reactor materials performance. [MAG_THEA_EOS](https://thea.energy/eos/)


## Renaissance Fusion

Stellarator developer combining patterned HTS surfaces with liquid-metal wall concepts.

**Approach:** Stellarator. **Variant:** patterned hts stellarator.

**Experimental fuel/status:** Component and manufacturing development; no burning-plasma result established.

**Intended fuel:** D-T, consistent with its lithium/tritium power concept

**Mechanism:** Laser-patterned superconducting paths would create the confinement field; flowing lithium would absorb heat, shield hardware and breed tritium. [MAG_RENAISSANCE_NEWS](https://renfusion.eu/press-releases) [MAG_RENAISSANCE_TECH](https://renfusion.eu/technology)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Renaissance Fusion headquarters / primary location | headquarters / listed location | Grenoble, Auvergne-Rhône-Alpes, France |
| HTS and liquid-metal development | component research / operating | Grenoble, Auvergne-Rhône-Alpes, France |

### Evidence and current plans

- **Engineering progress.** Company reports ongoing HTS manufacturing and component-development work; no integrated fusion gain established. [MAG_RENAISSANCE_NEWS](https://renfusion.eu/press-releases)

- **Target.** Integrate patterned magnets and liquid-metal walls into a stellarator power system; no verified current first-electricity date adopted here. [MAG_RENAISSANCE_TECH](https://renfusion.eu/technology)


**Financing snapshot:** €32M Series A first close, March 2025; €10M BPIFrance grant separately

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2025-03-06 | EUR 32M | round. Series A FIRST CLOSE; source gives $33.2 million equivalent. [MAG_RENAISSANCE_NEWS](https://renfusion.eu/press-releases) |
| 2023-12-01 | EUR 10M | grant. BPIFrance grant, separate from private financing. [MAG_RENAISSANCE_NEWS](https://renfusion.eu/press-releases) |

### Interpretive assessment

- Novel integrated fabrication. Reactor-scale patterned HTS manufacturing and liquid-metal flow in strong magnetic fields need integrated validation. [MAG_RENAISSANCE_TECH](https://renfusion.eu/technology)

- Component stage. The reviewed evidence does not establish operating reactor-level confinement or energy balance. [MAG_RENAISSANCE_NEWS](https://renfusion.eu/press-releases)


## Realta Fusion

High-field magnetic-mirror developer pursuing modular industrial heat and power.

**Approach:** Magnetic mirror. **Variant:** magnetic mirror.

**Experimental fuel/status:** D-D in the reviewed WHAM direct-conversion experiment

**Intended fuel:** D-T for first-generation commercial plants

**Mechanism:** Stronger end fields reflect particles in a linear plasma. Direct electrostatic recovery may reduce losses, while D-T neutron energy still feeds a thermal power system. [MAG_REALTA_TECH](https://realtafusion.com/technology/) [MAG_REALTA_FUND](https://www.prnewswire.com/news-releases/realta-fusion-raises-36-million-series-a-to-advance-compact-scalable-modular-fusion-energy-302452726.html) [MAG_REALTA_DEBT](https://www.prnewswire.com/news-releases/realta-fusion-secures-9-5-million-growth-capital-facility-from-silicon-valley-bank-a-division-of-first-citizens-bank-302689285.html) [MAG_REALTA_WHAM](https://news.wisc.edu/first-plasma-marks-major-milestone-in-uw-madison-fusion-energy-research/) [MAG_REALTA_DEC](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/) [MAG_REALTA_TIMELINE](https://realtafusion.com/timeline/)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Realta Fusion headquarters / primary location | headquarters / listed location | Madison, Wisconsin, United States |
| WHAM | public research facility / scientific operation | Stoughton, Wisconsin, United States |

### Evidence and current plans

- **Experimental result.** WHAM first plasma with high-field mirror end magnets. event date: 2024-07. [MAG_REALTA_WHAM](https://news.wisc.edu/first-plasma-marks-major-milestone-in-uw-madison-fusion-energy-research/)

- **Experimental result.** Electrostatic converter recovered mostly supplied plasma-heating energy; not net fusion electricity. event date: 2026-06-19. [MAG_REALTA_DEC](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/)

- **Target.** Commercial pilot plant. target window: mid-2030s. [MAG_REALTA_TIMELINE](https://realtafusion.com/timeline/)


**Financing snapshot:** $36M Series A; $9.5M debt facility separately

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2025-05-13 | USD 36M | round. Series A. [MAG_REALTA_FUND](https://www.prnewswire.com/news-releases/realta-fusion-raises-36-million-series-a-to-advance-compact-scalable-modular-fusion-energy-302452726.html) |
| 2026-02-17 | USD 9.5M | debt facility. Growth-capital facility; drawdown amount not disclosed. [MAG_REALTA_DEBT](https://www.prnewswire.com/news-releases/realta-fusion-secures-9-5-million-growth-capital-facility-from-silicon-valley-bank-a-division-of-first-citizens-bank-302689285.html) |

### Interpretive assessment

- End-loss control remains central. Mirror geometry is mechanically attractive but must retain enough particles and energy at useful fusion conditions. [MAG_REALTA_TECH](https://realtafusion.com/technology/)

- Recovery is not generation proof. The demonstrated converter largely recycled input heating. D-T net power requires fusion gain, neutron-heat conversion and complete plant accounting. [MAG_REALTA_DEC](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/)


## Energy Singularity

Shanghai HTS tokamak developer operating HH70 and planning a higher-field successor.

**Approach:** Tokamak. **Variant:** high field tokamak.

**Experimental fuel/status:** Experimental HH70 plasma; campaign fuel details not verified in the reviewed primary releases.

**Intended fuel:** D-T for commercial concept

**Mechanism:** HTS magnets surround a tokamak plasma; the programme moves from long-duration experimental operation toward high-field gain studies. [MAG_ES_DEVICES](https://energysingularity.cn/en/devices.html) [MAG_ES_PULSE](https://energysingularity.cn/en/news/news-001.html) [MAG_ES_MAGNET](https://energysingularity.cn/en/news/index.php/2026/06/17/energy-singularity-develops-26-7-tesla-cryogen-free-insulated-hts-magnet-breaking-two-world-records/) [MAG_ES_SEED](https://energysingularity.cn/news/news-059.html) [MAG_ES_PREA](https://energysingularity.cn/en/news/news-047.html) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Energy Singularity headquarters / primary location | headquarters / listed location | Shanghai, Shanghai, China |
| HH70 | experiment / operating | Shanghai, Shanghai, China |

### Evidence and current plans

- **Experimental result.** HH70 first plasma. event date: 2024-06. [MAG_ES_DEVICES](https://energysingularity.cn/en/devices.html)

- **Experimental result.** HH70 1,337-second discharge; duration does not establish fusion gain. reported at: 2026-02-02. [MAG_ES_PULSE](https://energysingularity.cn/en/news/news-001.html)

- **Experimental result.** Small test magnet reached 26.7 T; winding inner diameter 30 mm. reported at: 2026-06-17. [MAG_ES_MAGNET](https://energysingularity.cn/en/news/index.php/2026/06/17/energy-singularity-develops-26-7-tesla-cryogen-free-insulated-hts-magnet-breaking-two-world-records/)

- **Target.** HH170 equivalent Q above two; this is not a claim of measured D-T Q. [MAG_ES_DEVICES](https://energysingularity.cn/en/devices.html)


**Financing snapshot:** $112.5M company-declared in 2026 survey; historical native-currency total nearly RMB800M in 2023

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2022-02-26 | Nearly CNY 400M | round. Nearly RMB 400 million; source figure approximate. [MAG_ES_SEED](https://energysingularity.cn/news/news-059.html) |
| 2023-04-30 | Nearly CNY 400M | round. Nearly RMB 400 million Pre-A. [MAG_ES_PREA](https://energysingularity.cn/en/news/news-047.html) |
| 2023-04-30 | Nearly CNY 800M | cumulative total. Historical total, nearly RMB 800 million; not a current audited balance. [MAG_ES_PREA](https://energysingularity.cn/en/news/news-047.html) |
| 2026-07-13 | USD 112.5M | cumulative total. Company-declared Q2 survey total; financing categories not reconciled. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |

### Interpretive assessment

- Different quantities need separate axes. Long pulses, small-magnet peak field and equivalent Q should not be treated as equivalent to burning-plasma or whole-plant performance. [MAG_ES_DEVICES](https://energysingularity.cn/en/devices.html) [MAG_ES_PULSE](https://energysingularity.cn/en/news/news-001.html) [MAG_ES_MAGNET](https://energysingularity.cn/en/news/index.php/2026/06/17/energy-singularity-develops-26-7-tesla-cryogen-free-insulated-hts-magnet-breaking-two-world-records/)

- Some financial and fuel details unresolved. The current campaign fuel and composition of survey funding are not established here; these are evidence gaps rather than proof of technical failure. [MAG_ES_DEVICES](https://energysingularity.cn/en/devices.html) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)


## Kyoto Fusioneering

Fusion engineering supplier developing heating, blanket, thermal-cycle and tritium systems.

**Approach:** Enabling systems supplier. **Variant:** fusion systems supplier.

**Experimental fuel/status:** Engineering tests; not a reactor developer’s operating plasma fuel.

**Intended fuel:** Tritium handling, heating and blanket systems for customers, including D-T concepts.

**Mechanism:** Provides enabling plant components and test loops across multiple reactor approaches; its own test facilities are not fusion-powered grid plants. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350) [MAG_KYOTO_HQ](https://kyotofusioneering.com/en/news/2025/01/08/2807)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Kyoto Fusioneering headquarters / primary location | headquarters / listed location | Tokyo, Tokyo, Japan |
| UNITY-1 | engineering test facility / development and testing | Kyoto, Kyoto, Japan |
| UNITY-2 / Canadian collaboration | fuel cycle test facility / development | Chalk River, Ontario, Canada |

### Evidence and current plans

- **Engineering progress.** UNITY engineering programme develops integrated heat-transfer and fuel-cycle testing; do not label externally heated tests as net fusion electricity. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350)

- **Target.** Supply validated plant engineering systems to multiple fusion developers. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350)


**Financing snapshot:** ¥32.98B cumulative equity; latest ¥16.72B equity plus ¥9B facilities

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-08-24 | JPY 16.72B | round. Series D first-close EQUITY; USD approximation supplied by source. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350) |
| 2026-08-24 | JPY 9B | debt facility. Credit and loan facilities; source does not establish full drawdown. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350) |
| 2026-08-24 | JPY 32.98B | cumulative total. Cumulative equity ONLY; source USD conversion approximate. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350) |

### Interpretive assessment

- Representative conditions required. Thermal-loop testing must eventually connect to reactor neutron environments and reliable tritium recovery. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350)

- Customer and industry timing. Supplier revenues depend partly on customers’ plant schedules; core plasma-gain risk belongs to those reactor projects. [MAG_KYOTO_FUND](https://kyotofusioneering.com/en/news/2026/08/24/4350)


## nT-Tao

Compact pulsed stellarator developer targeting modular on-site electricity.

**Approach:** Stellarator. **Variant:** pulsed compact stellarator.

**Experimental fuel/status:** Experimental plasma; exact operating mixture not verified here.

**Intended fuel:** D-T

**Mechanism:** High-density pulsed magnetic confinement combines stellarator shaping and rapidly delivered heating; intended plant output would use a thermal cycle. [MAG_NTTAO_FUND](https://www.prnewswire.com/news-releases/nt-tao-raises-22m-series-a-to-ensure-a-secure-clean-energy-future-with-a-compact-and-scalable-nuclear-fusion-solution-301735890.html) [MAG_NTTAO_POWER](https://www.globenewswire.com/news-release/2026/09/15/3362276/0/en/nt-tao-deploys-50-mw-pulsed-power-subsystem-to-drive-fusion-prototype-toward-next-temperature-milestone.html) [MAG_NTTAO_TECH](https://www.nt-tao.com/nt-tao-technology) [MAG_NTTAO_FAQ](https://www.nt-tao.com/faq) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| nT-Tao headquarters / primary location | headquarters / listed location | Hod HaSharon, Central District, Israel |
| Prototype programme | experiment / operating | Hod HaSharon, Central District, Israel |

### Evidence and current plans

- **Experimental result.** Company reported 1.5 million °C plasma and deployed a 50 MW pulsed INPUT-power subsystem. reported at: 2026-09-15. [MAG_NTTAO_POWER](https://www.globenewswire.com/news-release/2026/09/15/3362276/0/en/nt-tao-deploys-50-mw-pulsed-power-subsystem-to-drive-fusion-prototype-toward-next-temperature-milestone.html)

- **Target.** Pilot plant. target window: early 2030s. [MAG_NTTAO_FAQ](https://www.nt-tao.com/faq)

- **Target.** Tao Energy Box design objective of 20 MWe. [MAG_NTTAO_TECH](https://www.nt-tao.com/nt-tao-technology)


**Financing snapshot:** $34M company-declared in Q2 2026 survey

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2023-02-01 | USD 22M | round. Series A. [MAG_NTTAO_FUND](https://www.prnewswire.com/news-releases/nt-tao-raises-22m-series-a-to-ensure-a-secure-clean-energy-future-with-a-compact-and-scalable-nuclear-fusion-solution-301735890.html) |
| 2023-02-01 | USD 28M | cumulative total. Historical total at Series A announcement. [MAG_NTTAO_FUND](https://www.prnewswire.com/news-releases/nt-tao-raises-22m-series-a-to-ensure-a-secure-clean-energy-future-with-a-compact-and-scalable-nuclear-fusion-solution-301735890.html) |
| 2026-07-13 | USD 34M | cumulative total. Company-declared Q2 survey total; composition unverified. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |

### Interpretive assessment

- Early experimental stage. The cited temperature and pulsed-power hardware do not establish fusion gain, confinement at reactor conditions or net output. [MAG_NTTAO_POWER](https://www.globenewswire.com/news-release/2026/09/15/3362276/0/en/nt-tao-deploys-50-mw-pulsed-power-subsystem-to-drive-fusion-prototype-toward-next-temperature-milestone.html)

- Power density and shielding challenge. A small D-T plant must integrate heating, neutron shielding, heat capture and tritium systems within its intended compact package. [MAG_NTTAO_TECH](https://www.nt-tao.com/nt-tao-technology)


## Helical Fusion

Japanese helical-stellarator developer pairing continuous HTS coils with liquid-metal blanket technology.

**Approach:** Stellarator. **Variant:** helical stellarator.

**Experimental fuel/status:** HARUKA is under construction; no company burning plasma established.

**Intended fuel:** D-T

**Mechanism:** Two helical superconducting coils wind around the plasma torus to produce its twisted magnetic field; the plant concept captures fusion heat for electricity. [MAG_HELICAL_FUND_EN](https://global.helicalfusion.com/post/fuji-electric-joins-helical-fusion-as-strategic-investor-and-official-partner-as-series-b-second-clo) [MAG_HELICAL_FUND_JP](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86) [MAG_HELICAL_TECH](https://global.helicalfusion.com/technology) [MAG_HELICAL_MANUFACTURE](https://global.helicalfusion.com/post/helical-fusion-completes-a-new-coil-manufacturing-machine-for-its-integrated-demonstration-device-in) [MAG_HELICAL_HQ](https://global.helicalfusion.com/company)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Helical Fusion headquarters / primary location | headquarters / listed location | Tokyo, Tokyo, Japan |
| Helix HARUKA at NIFS | integrated demonstrator / under construction | Toki, Gifu, Japan |
| Helix KANATA | planned power plant / planned |  |

### Evidence and current plans

- **Experimental result.** Company reported HTS cable testing and completed a dedicated coil manufacturing machine. reported at: 2026-02-05. [MAG_HELICAL_MANUFACTURE](https://global.helicalfusion.com/post/helical-fusion-completes-a-new-coil-manufacturing-machine-for-its-integrated-demonstration-device-in)

- **Target.** HARUKA integrated demonstration; precedes KANATA. target window: 2030s. [MAG_HELICAL_FUND_JP](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86) [MAG_HELICAL_MANUFACTURE](https://global.helicalfusion.com/post/helical-fusion-completes-a-new-coil-manufacturing-machine-for-its-integrated-demonstration-device-in)

- **Target.** KANATA net electricity after HARUKA. target window: 2030s. [MAG_HELICAL_FUND_JP](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86) [MAG_HELICAL_MANUFACTURE](https://global.helicalfusion.com/post/helical-fusion-completes-a-new-coil-manufacturing-machine-for-its-integrated-demonstration-device-in)


**Financing snapshot:** ¥13.05B cumulative mixed funding; ¥3.23B latest Series B second close

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-10-08 | JPY 3.23B | round. Series B SECOND CLOSE, not the entire Series B round. [MAG_HELICAL_FUND_EN](https://global.helicalfusion.com/post/fuji-electric-joins-helical-fusion-as-strategic-investor-and-official-partner-as-series-b-second-clo) [MAG_HELICAL_FUND_JP](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86) |
| 2026-10-08 | JPY 5.93B | cumulative total. Total Series B financing to date; includes second close; not cumulative company funding. [MAG_HELICAL_FUND_JP](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86) |
| 2026-10-08 | JPY 13.05B | cumulative total. Japanese article updated Oct 9: includes grants and loans; English page gives conflicting ¥13.15B. Conditional METI subsidy excluded. [MAG_HELICAL_FUND_JP](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86) [MAG_HELICAL_FUND_EN](https://global.helicalfusion.com/post/fuji-electric-joins-helical-fusion-as-strategic-investor-and-official-partner-as-series-b-second-clo) |

### Interpretive assessment

- Complex coil and blanket integration. Cable and manufacturing advances do not yet establish integrated plasma, liquid-metal blanket and power-cycle performance. [MAG_HELICAL_TECH](https://global.helicalfusion.com/technology) [MAG_HELICAL_MANUFACTURE](https://global.helicalfusion.com/post/helical-fusion-completes-a-new-coil-manufacturing-machine-for-its-integrated-demonstration-device-in)

- Mixed total with source discrepancy. Cumulative financing includes grants and loans, and Japanese/English totals differ. The newer Japanese total is preferred with an explicit annotation. [MAG_HELICAL_FUND_JP](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86) [MAG_HELICAL_FUND_EN](https://global.helicalfusion.com/post/fuji-electric-joins-helical-fusion-as-strategic-investor-and-official-partner-as-series-b-second-clo)


## Inertia Enterprises

Scales NIF-style indirect-drive laser fusion toward a repetitive electricity-producing plant.

**Approach:** Laser inertial fusion with indirect drive. **Variant:** laser indirect drive.

**Experimental fuel/status:** Component development; no company integrated fusion experiment identified

**Intended fuel:** D-T

**Mechanism:** Diode-pumped beamlines deliver light to a hohlraum surrounding a cryogenic DT capsule. X-rays generated inside the hohlraum compress and ignite the capsule. The proposed gas-armored chamber and replaceable solid wall surround a heat-capturing, tritium-breeding system; turbines would make electricity. Fresh targets and laser shots repeat at the planned plant rate. [ALT_INERTIA_FUND](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html) [ALT_INERTIA_GAIN](https://inertia.com/faq/how-much-fusion-energy-or-gain-do-you-need/) [ALT_INERTIA_MODEL](https://inertia.com/press/models-confirm-fuel-target-design) [ALT_INERTIA_PAPER](https://arxiv.org/abs/2609.19752) [ALT_INERTIA_HOME](https://inertia.com/) [ALT_INERTIA_PHASE1](https://inertia.com/press/commercial-roadmap-phase-1) [ALT_INERTIA_FUELING](https://inertia.com/press/inertia-fast-fueling) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Inertia Enterprises headquarters / primary location | headquarters / listed location | Livermore, California, United States |
| Livermore development and prototyping | R&D / component development | Livermore, California, United States |

### Evidence and current plans

- **Experimental result.** Company and LLNL report producing DT fuel layers in two to three hours and measuring their roughness; acceptable fusion performance is supported by simulations, not a demonstrated integrated power-plant target shot. [ALT_INERTIA_FUELING](https://inertia.com/press/inertia-fast-fueling)

- **Model or design.** Target performance modeled with ignition-benchmarked codes; predicted gain approximately 26–43 from 10 MJ laser energy, not experimental yield. publication date: 2026-09-17. [ALT_INERTIA_PAPER](https://arxiv.org/abs/2609.19752) [ALT_INERTIA_MODEL](https://inertia.com/press/models-confirm-fuel-target-design)

- **Predecessor evidence.** NIF ignition is predecessor evidence, not an experiment performed by the company. [ALT_INERTIA_FUND](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html)

- **Target.** Thunderwall unit beamline target: 10 kJ at 10 Hz with 10% wall-plug efficiency. [ALT_INERTIA_FUND](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html)

- **Target.** Full-system design goal 10 MJ at 10 Hz and target production below $1 each; nominal plant 1.5 GW. [ALT_INERTIA_HOME](https://inertia.com/)

- **Target.** Pilot and engineering-gain timing declared in 2026 survey: 2037–2040. target window: 2037/2040. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)


**Financing snapshot:** $450 million milestone-based Series A announced February 2026

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-02-11 | USD 450M | conditional commitment. Milestone-based Series A; full cash disbursement not established in release. [ALT_INERTIA_FUND](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html) |

### Interpretive assessment

- Physics scaling. High gain is simulated for larger, manufacturable targets; NIF validates a predecessor regime but does not validate this full design. [ALT_INERTIA_MODEL](https://inertia.com/press/models-confirm-fuel-target-design) [ALT_INERTIA_PAPER](https://arxiv.org/abs/2609.19752) [ALT_INERTIA_FUELING](https://inertia.com/press/inertia-fast-fueling)

- Repetition and manufacturing. Efficient 10 MJ shots at 10 Hz, economical cryogenic targets, injection and chamber recovery must work together continuously. [ALT_INERTIA_FUND](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html) [ALT_INERTIA_HOME](https://inertia.com/) [ALT_INERTIA_PHASE1](https://inertia.com/press/commercial-roadmap-phase-1)

- Fuel and materials. A DT power plant still needs tritium breeding, heat extraction, radiation-tolerant optics and maintainable first-wall systems. [ALT_INERTIA_FUND](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html) [ALT_INERTIA_MODEL](https://inertia.com/press/models-confirm-fuel-target-design)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. The live FAQ18/30/45 scenarios and newer >25–43 simulations with 250–1300 MWe estimates use different model snapshots. Do not fit them into one universal line. Preserve source and version labels.


## Pacific Fusion

Uses synchronized pulsed-power modules to magnetically compress a fuel target.

**Approach:** Pulsed power liner inertial fusion. **Variant:** pulsed magnetic inertial.

**Experimental fuel/status:** Driver/target experiments; prototype fuel details differ by campaign

**Intended fuel:** D-T

**Mechanism:** Capacitor modules store electrical energy. Synchronized short current pulses create a strong magnetic force around a target. The target implodes, compressing and heating DT fuel. Future plant systems must turn the released heat into electricity and replace spent targets. [ALT_PACIFIC_FOUND](https://www.pacificfusion.com/resources/founders-letter) [ALT_PACIFIC_MODULE](https://www.pacificfusion.com/resources/validating-the-next-building-block-toward-affordable-fusion-power) [ALT_PACIFIC_CAPITAL](https://www.pacificfusion.com/resources/lawrence-livermore-pacific-fusion-collaboration-breaks-new-record-to-advance-america-s-high-gain-fusion-capability) [ALT_PACIFIC_SITE](https://www.pacificfusion.com/resources/pacific-fusion-breaks-ground-on-first-of-a-kind-fusion-facility-in-new-mexico) [ALT_PACIFIC_LOC](https://www.pacificfusion.com/locations)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Pacific Fusion headquarters / primary location | headquarters / listed location | Fremont, California, United States |
| Mesa del Sol Demonstration System | experimental demo / under construction | Albuquerque, New Mexico, United States |
| Fusion Factory | manufacturing / developing | Los Lunas, New Mexico, United States |
| Build Center | manufacturing / operating | San Leandro, California, United States |

### Evidence and current plans

- **Experimental result.** Scaled pulser prototype achieved approximately 440 GW peak electrical power with 80 ns pulse duration;>1000 qualification shots. reported at: 2026-06-02. [ALT_PACIFIC_MODULE](https://www.pacificfusion.com/resources/validating-the-next-building-block-toward-affordable-fusion-power)

- **Engineering progress.** Albuquerque demonstration-campus construction broke ground. reported at: 2026-08-24. [ALT_PACIFIC_SITE](https://www.pacificfusion.com/resources/pacific-fusion-breaks-ground-on-first-of-a-kind-fusion-facility-in-new-mexico)

- **Target.** Demonstration System targets fusion output greater than total initially stored machine energy by 2030. This is not a net-electric definition. target window: 2030. [ALT_PACIFIC_SITE](https://www.pacificfusion.com/resources/pacific-fusion-breaks-ground-on-first-of-a-kind-fusion-facility-in-new-mexico)


**Financing snapshot:** >$1 billion private capital reported July 2026; original Series A was milestone-released

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2024-10-25 | More than USD 900M | conditional commitment. More than $900 million committed up front; released against predefined milestones. [ALT_PACIFIC_FOUND](https://www.pacificfusion.com/resources/founders-letter) |
| 2026-07-16 | More than USD 1B | cumulative total. More than $1 billion private capital reported; release does not clarify received versus still-conditional tranches. [ALT_PACIFIC_CAPITAL](https://www.pacificfusion.com/resources/lawrence-livermore-pacific-fusion-collaboration-breaks-new-record-to-advance-america-s-high-gain-fusion-capability) |

### Interpretive assessment

- Physics scaling. Driver progress must translate to repeatable high-yield target implosions; peak driver power is not fusion output. [ALT_PACIFIC_MODULE](https://www.pacificfusion.com/resources/validating-the-next-building-block-toward-affordable-fusion-power) [ALT_PACIFIC_SITE](https://www.pacificfusion.com/resources/pacific-fusion-breaks-ground-on-first-of-a-kind-fusion-facility-in-new-mexico)

- Integrated plant. Stored-energy facility gain excludes conversion losses and other plant electricity. Repetition, debris, target replacement and balance of plant remain. [ALT_PACIFIC_FOUND](https://www.pacificfusion.com/resources/founders-letter) [ALT_PACIFIC_SITE](https://www.pacificfusion.com/resources/pacific-fusion-breaks-ground-on-first-of-a-kind-fusion-facility-in-new-mexico)

- Financing. Headline commitments are not identical to cash received; the company reports a newer cumulative amount without a tranche reconciliation. [ALT_PACIFIC_FOUND](https://www.pacificfusion.com/resources/founders-letter) [ALT_PACIFIC_CAPITAL](https://www.pacificfusion.com/resources/lawrence-livermore-pacific-fusion-collaboration-breaks-new-record-to-advance-america-s-high-gain-fusion-capability)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work.


## Xcimer Energy

Develops high-energy excimer lasers and a liquid-wall chamber for inertial fusion power.

**Approach:** Hybrid direct-drive laser fusion. **Variant:** hybrid direct drive excimer.

**Experimental fuel/status:** Laser-component tests; no integrated power-generating fusion system identified

**Intended fuel:** D-T

**Mechanism:** Excimer gas amplifiers create a long laser pulse. Optical pulse compression shortens it for target implosion. Target design uses initial hohlraum-generated X-ray drive followed by direct laser drive; this hybrid direct-drive design is not fast ignition. An inertial-fusion target releases energy inside a liquid-wall chamber. Molten salt captures heat, shields structures and is intended to breed fuel. [ALT_XCIMER_FUND](https://www.businesswire.com/news/home/20240604168571/en/Xcimer-Raises-$100-Million-to-Put-Inertial-Fusion-Energy-on-Path-to-Commercialization) [ALT_XCIMER_ROADMAP](https://xcimer.energy/energy/) [ALT_XCIMER_DOE](https://xcimer.energy/news/u-s-department-of-energy-approves-xcimers-fusion-power-plant-preconceptual-design-and-technology-roadmap-milestone/) [ALT_XCIMER_FAQ](https://xcimer.energy/faq/) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) [PAR_XCIMER_HDD](https://pubs.aip.org/aip/pop/article/31/11/112708/3322685/Hybrid-direct-drive-with-a-two-sided-ultraviolet)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Xcimer Energy headquarters / primary location | headquarters / listed location | Denver, Colorado, United States |
| Denver headquarters and development | R&D / operating | Denver, Colorado, United States |
| Tucson manufacturing | manufacturing / operating | Tucson, Arizona, United States |

### Evidence and current plans

- **Experimental result.** Phoenix prototype laser began operation and DOE accepted an Athena preconceptual-design/roadmap milestone. These are component and design milestones. reported at: 2026-06-10. [ALT_XCIMER_DOE](https://xcimer.energy/news/u-s-department-of-energy-approves-xcimers-fusion-power-plant-preconceptual-design-and-technology-roadmap-milestone/)

- **Target.** Anvil beamline demonstration target 200 kJ. target window: 2028. [ALT_XCIMER_ROADMAP](https://xcimer.energy/energy/)

- **Target.** Vulcan aims for wall-plug breakeven by 2031, explicitly defined by the company as producing more electricity than all the electricity consumed to operate the system. target window: 2031. [ALT_XCIMER_ROADMAP](https://xcimer.energy/energy/) [ALT_XCIMER_FAQ](https://xcimer.energy/faq/)

- **Target.** Athena aims to deliver 400 MW of electricity to the grid in 2035. target window: 2035. [ALT_XCIMER_ROADMAP](https://xcimer.energy/energy/) [ALT_XCIMER_FAQ](https://xcimer.energy/faq/)


**Financing snapshot:** Nearly $200 million in seed and Series A investment on live FAQ; July 2026 survey snapshot was $178 million

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2024-06-04 | USD 100M | round. Series A; not the latest cumulative total. [ALT_XCIMER_FUND](https://www.businesswire.com/news/home/20240604168571/en/Xcimer-Raises-$100-Million-to-Put-Inertial-Fusion-Energy-on-Path-to-Commercialization) |
| 2026-07-13 | USD 178M | cumulative total. self-reported total; category composition not fully disclosed [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |
| Undated live page | Nearly USD 200M | cumulative total. Nearly $200 million in seed and Series A investment on undated live FAQ; snapshot as of research cutoff; not an exact $200 million close. [ALT_XCIMER_FAQ](https://xcimer.energy/faq/) |

### Interpretive assessment

- Driver scaling. Excimer/SBS proof of concept must scale to multi-megajoule energy, efficiency and sustained repetition. [ALT_XCIMER_ROADMAP](https://xcimer.energy/energy/) [ALT_XCIMER_DOE](https://xcimer.energy/news/u-s-department-of-energy-approves-xcimers-fusion-power-plant-preconceptual-design-and-technology-roadmap-milestone/)

- Liquid wall and fuel. Renewing molten salt may protect the wall, but whole-plant breeding, corrosion, flow recovery and remote maintenance still require validation. [ALT_XCIMER_DOE](https://xcimer.energy/news/u-s-department-of-energy-approves-xcimers-fusion-power-plant-preconceptual-design-and-technology-roadmap-milestone/)

- Evidence boundary. DOE design-milestone acceptance is not a plant operating licence or proof of commercial energy production. [ALT_XCIMER_DOE](https://xcimer.energy/news/u-s-department-of-energy-approves-xcimers-fusion-power-plant-preconceptual-design-and-technology-roadmap-milestone/)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work.


## Focused Energy

Develops direct-drive laser fusion, modular lasers and manufactured DT fuel capsules.

**Approach:** Laser inertial fusion with direct drive. **Variant:** laser direct drive fast ignition.

**Experimental fuel/status:** Target/laser and proton-focusing experiments

**Intended fuel:** D-T

**Mechanism:** Fresh DT capsules enter the chamber. Direct laser drive compresses the fuel. Published development work also tests focused laser-generated protons for fast ignition. Repeated fusion heat is intended to feed a conventional electricity plant. [ALT_FOCUSED_FUND](https://www.focused-energy.co/news-release/focused-energy-sets-a-new-benchmark-240-million-for-the-largest-series-a-financing-in-the-global-fusion-industry) [ALT_FOCUSED_TECH](https://www.focused-energy.co/technology/lighthouse) [ALT_FOCUSED_EXP](https://www.focused-energy.co/news-release/focused-energy-completes-its-first-milestones-through-does-milestone-based-fusion-development-program) [ALT_FOCUSED_ROADMAP](https://www.focused-energy.co/) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Focused Energy headquarters / primary location | headquarters / listed location | Darmstadt, Hesse, Germany |
| Biblis development / proposed fusion site | planned plant and laser development / announced | Biblis, Hesse, Germany |
| US office | office / listed | San Francisco, California, United States |
| US office | office / listed | Austin, Texas, United States |

### Evidence and current plans

- **Experimental result.** Reported completion of DOE milestones: a target-design report and a proton-focusing experimental campaign; no target-gain demonstration. reported at: 2024-11-14. [ALT_FOCUSED_EXP](https://www.focused-energy.co/news-release/focused-energy-completes-its-first-milestones-through-does-milestone-based-fusion-development-program)

- **Target.** First laser at Biblis. target window: 2028. [ALT_FOCUSED_ROADMAP](https://www.focused-energy.co/)

- **Target.** Pilot plant. target window: 2035. [ALT_FOCUSED_ROADMAP](https://www.focused-energy.co/)

- **Target.** First grid megawatt-hour. target window: 2037. [ALT_FOCUSED_ROADMAP](https://www.focused-energy.co/)


**Financing snapshot:** $500 million total declared in 2026 survey; $240 million Series A announced May 2026

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-05-27 | USD 240M | round. Company-announced fully secured Series A; not a cumulative total. [ALT_FOCUSED_FUND](https://www.focused-energy.co/news-release/focused-energy-sets-a-new-benchmark-240-million-for-the-largest-series-a-financing-in-the-global-fusion-industry) |
| 2026-07-13 | USD 500M | cumulative total. self-reported total; category composition not fully disclosed [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |

### Interpretive assessment

- Target physics. Direct drive/fast ignition must establish its own reliable gain regime; NIF indirect-drive ignition does not directly validate it. [ALT_FOCUSED_TECH](https://www.focused-energy.co/technology/lighthouse) [ALT_FOCUSED_EXP](https://www.focused-energy.co/news-release/focused-energy-completes-its-first-milestones-through-does-milestone-based-fusion-development-program)

- Manufacturing and repetition. High-rate lasers, target manufacture, precision injection and chamber recovery must be integrated. [ALT_FOCUSED_TECH](https://www.focused-energy.co/technology/lighthouse) [ALT_FOCUSED_EXP](https://www.focused-energy.co/news-release/focused-energy-completes-its-first-milestones-through-does-milestone-based-fusion-development-program)

- Fuel and plant. DT breeding, materials durability and heat conversion remain whole-plant requirements despite siting/industrial partnerships. [ALT_FOCUSED_FUND](https://www.focused-energy.co/news-release/focused-energy-sets-a-new-benchmark-240-million-for-the-largest-series-a-financing-in-the-global-fusion-industry) [ALT_FOCUSED_TECH](https://www.focused-energy.co/technology/lighthouse)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. Current homepage emphasizes direct drive; older primary milestone release specifies proton fast ignition. Keep both with dates instead of asserting every present design detail is unchanged.


## General Fusion

Compresses a magnetized plasma with a metal liner, aiming for a reusable liquid-metal power-plant wall.

**Approach:** Mechanically compressed magnetized target. **Variant:** mechanical magnetized target.

**Experimental fuel/status:** LM26 deuterium spherical-tokamak plasmas (solid-liner experiments)

**Intended fuel:** D-T

**Mechanism:** An injector forms a deuterium spherical-tokamak plasma. A metal liner compresses and heats the magnetized fuel. LM26 uses a solid lithium liner; commercial machinery envisages liquid metal. The commercial liquid wall would capture heat and breed tritium. [ALT_GENERAL_TEMP](https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/) [ALT_GENERAL_LIST](https://generalfusion.com/post/general-fusion-becomes-first-publicly-listed-fusion-company/) [ALT_GENERAL_PATH](https://generalfusion.com/path-to-commercialization/) [ALT_GENERAL_LOC](https://generalfusion.com/about/contact-us/) [ALT_GENERAL_PAPER](https://arxiv.org/abs/2606.23974) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| General Fusion headquarters / primary location | headquarters / listed location | Richmond, British Columbia, Canada |
| LM26 and headquarters | experimental demo / operating | Richmond, British Columbia, Canada |

### Evidence and current plans

- **Experimental result.** LM26 electron temperature around 1.1 keV by Thomson scattering and 1.2 keV by AXUV; ion temperature inferred near 0.46 keV. Heating result, not Lawson/gain. reported at: 2026-10-08. [ALT_GENERAL_TEMP](https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/)

- **Organization event.** Nasdaq GFUZ trading began after completed business combination. reported at: 2026-07-13. [ALT_GENERAL_LIST](https://generalfusion.com/post/general-fusion-becomes-first-publicly-listed-fusion-company/)

- **Target.** Next LM26 milestones 10 keV then Lawson-equivalent conditions; the surrogate-fuel experiment does not itself demonstrate DT power gain. target window: 2028. [ALT_GENERAL_TEMP](https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/) [ALT_GENERAL_PATH](https://generalfusion.com/path-to-commercialization/) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

- **Target.** First-of-a-kind plant initial operation approximately 2035. target window: 2035. [ALT_GENERAL_PATH](https://generalfusion.com/path-to-commercialization/)


**Financing snapshot:** ≈$500 million survey total; ≈$150 million cash at July 2026 listing shown separately

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-07-13 | USD 500M | cumulative total. self-reported total; category composition not fully disclosed [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |
| 2026-07-13 | About USD 150M | cash balance snapshot. Approximate cash at public listing, including net transaction proceeds; NOT new round amount or valuation. [ALT_GENERAL_LIST](https://generalfusion.com/post/general-fusion-becomes-first-publicly-listed-fusion-company/) |

### Interpretive assessment

- Physics scaling. Higher electron temperature does not establish adequate ion temperature, confinement and density simultaneously. LM26 still targets additional large steps. [ALT_GENERAL_TEMP](https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/) [ALT_GENERAL_PATH](https://generalfusion.com/path-to-commercialization/)

- Prototype to plant. Solid-liner experiment to repetitive liquid-metal machinery is a substantial engineering transition. [ALT_GENERAL_TEMP](https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/) [ALT_GENERAL_PATH](https://generalfusion.com/path-to-commercialization/) [ALT_GENERAL_PAPER](https://arxiv.org/abs/2606.23974)

- Capital and execution. Public-market access changes financing options; approximately $150 million cash is not full power-plant financing. [ALT_GENERAL_LIST](https://generalfusion.com/post/general-fusion-becomes-first-publicly-listed-fusion-company/) [ALT_GENERAL_PATH](https://generalfusion.com/path-to-commercialization/)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. Company press releases use Vancouver metropolitan label; street address is Richmond. Do not plot two independent reactor sites. Older Culham demonstration plans should not be shown as an active operating project without a current dedicated source.


## Zap Energy

Uses the plasma current to pinch a flowing column, with sheared flow intended to suppress instabilities.

**Approach:** Sheared flow stabilized Z-pinch. **Variant:** sheared flow z pinch.

**Experimental fuel/status:** Deuterium fusion experiments; Century engineering platform uses hydrogen

**Intended fuel:** D-T

**Mechanism:** Current accelerates plasma into a narrow column. The current generates a magnetic field that compresses the column. Different axial flow speeds help stabilize the pinch. Future liquid-metal walls capture heat; fission and hybrid products are separate development tracks. [ALT_ZAP_FUND](https://legacy.zapenergy.com/news/zap-attracts-130m-as-demo-system-begins-operations) [ALT_ZAP_PRESSURE](https://www.zapenergy.com/updates/2025/11/zap-energy-exceeds-gigapascal-fusion-plasma-pressures-on-new-fusion-device-fuze-3) [ALT_ZAP_STRATEGY](https://www.zapenergy.com/updates/2026/04/zap-energy-advances-integrated-nuclear-strategy-and-appoints-zabrina-johal-as-ceo) [ALT_ZAP_LOC](https://www.zapenergy.com/privacy-policy) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Zap Energy headquarters / primary location | headquarters / listed location | Everett, Washington, United States |
| Everett R&D | R&D / operating | Everett, Washington, United States |

### Evidence and current plans

- **Experimental result.** FuZE-3 measured peak electron pressure 830 MPa; total 1.6 GPa is inferred using near-equal ion/electron temperature, over ~1 microsecond. reported at: 2025-11-17. [ALT_ZAP_PRESSURE](https://www.zapenergy.com/updates/2025/11/zap-energy-exceeds-gigapascal-fusion-plasma-pressures-on-new-fusion-device-fuze-3)

- **Experimental result.** Century repeated hydrogen plasma pulses into a liquid-metal-lined chamber; it is not a fusion-energy-output experiment. reported at: 2024-10-09. [ALT_ZAP_FUND](https://legacy.zapenergy.com/news/zap-attracts-130m-as-demo-system-begins-operations)

- **Organization event.** Company announced fission/hybrid development alongside ongoing fusion. reported at: 2026-04-29. [ALT_ZAP_STRATEGY](https://www.zapenergy.com/updates/2026/04/zap-energy-advances-integrated-nuclear-strategy-and-appoints-zabrina-johal-as-ceo)

- **Target.** Fusion pilot timing: late 2030s; net 50 MWe/module is design intent. target window: 2037/2039. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)


**Financing snapshot:** $338 million declared 2026 survey total; $130 million Series D verified October 2024

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2024-10-09 | USD 130M | round. Series D; separately published total then exceeded $330 million. [ALT_ZAP_FUND](https://legacy.zapenergy.com/news/zap-attracts-130m-as-demo-system-begins-operations) |
| 2026-07-13 | USD 338M | cumulative total. self-reported total; category composition not fully disclosed [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |

### Interpretive assessment

- Plasma stability. Sheared-flow stabilization must hold at higher current and useful fusion gain; pressure alone cannot rank overall reactor performance. [ALT_ZAP_PRESSURE](https://www.zapenergy.com/updates/2025/11/zap-energy-exceeds-gigapascal-fusion-plasma-pressures-on-new-fusion-device-fuze-3)

- Repetition and electrodes. Repetitive power, electrode erosion and liquid-metal handling need validation at fusion heat and neutron loads. [ALT_ZAP_FUND](https://legacy.zapenergy.com/news/zap-attracts-130m-as-demo-system-begins-operations) [ALT_ZAP_PRESSURE](https://www.zapenergy.com/updates/2025/11/zap-energy-exceeds-gigapascal-fusion-plasma-pressures-on-new-fusion-device-fuze-3)

- Business scope. Any future fission electricity must not be counted as demonstrated fusion electricity. [ALT_ZAP_STRATEGY](https://www.zapenergy.com/updates/2026/04/zap-energy-advances-integrated-nuclear-strategy-and-appoints-zabrina-johal-as-ceo)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work.


## First Light Fusion

Develops FLARE, a two-stage fuel system, with partners supplying major plant and driver systems.

**Approach:** Two-stage hybrid fast ignition. **Variant:** hybrid fast ignition.

**Experimental fuel/status:** Hydrodynamics/compression tests; not integrated ignition

**Intended fuel:** D-T

**Mechanism:** An engineered fuel package controls the compression of DT fuel. An electrical pulse compresses the fuel with limited premature heating. A separate rapid heating step is intended to trigger ignition. Partner-built systems complete the plant around the fuel-system design. [ALT_FIRSTLIGHT_FUND](https://firstlightfusion.com/media/first-light-fusion-announces-25m-successful-first-close-of-new-funding-round-with-investments-from-starmaker-one-ukaea/) [ALT_FIRSTLIGHT_TEST](https://firstlightfusion.com/media/first-light-fusion-achieves-major-step-forward-for-flare-proving-key-low-cost-fusion-principle/) [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| First Light Fusion headquarters / primary location | headquarters / listed location | Yarnton, Oxfordshire, United Kingdom |
| M3 and Oxfordshire headquarters | R&D / operating | Yarnton, Oxfordshire, United Kingdom |

### Evidence and current plans

- **Experimental result.** M3 experiments tested the compression principle; release explicitly says they were not designed to demonstrate ignition or fusion gain. reported at: 2026-09-22. [ALT_FIRSTLIGHT_TEST](https://firstlightfusion.com/media/first-light-fusion-achieves-major-step-forward-for-flare-proving-key-low-cost-fusion-principle/)

- **Model or design.** FLARE modeled target gain around 1000; this is a design calculation with no corresponding demonstrated gain. [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/)

- **Target.** Pilot timing in 2026 survey: late 2030s. target window: 2037/2039. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)


**Financing snapshot:** $156.38 million survey total; £25 million first-close round April 2026

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-04-21 | GBP 25M | round. First close of new round; includes public investor UKAEA; not all-time total. [ALT_FIRSTLIGHT_FUND](https://firstlightfusion.com/media/first-light-fusion-announces-25m-successful-first-close-of-new-funding-round-with-investments-from-starmaker-one-ukaea/) |
| 2026-07-13 | USD 156.4M | cumulative total. self-reported total; category composition not fully disclosed [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |

### Interpretive assessment

- Integrated physics. Compression and rapid ignition must work together; a successful first stage does not validate high gain. [ALT_FIRSTLIGHT_TEST](https://firstlightfusion.com/media/first-light-fusion-achieves-major-step-forward-for-flare-proving-key-low-cost-fusion-principle/) [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/)

- Partner dependence. Target-system developer depends on partners for drivers, facilities and industrial integration. [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/)

- Commercial systems. High modeled gain does not resolve target production, tritium breeding, chamber endurance or cost. [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. Do not present historic projectile-driven power-plant plans as the current strategy. Current FLARE is a partnered fuel-system/hybrid-fast-ignition program.


## Marvel Fusion

Pursues hollow-shell fast ignition using nanostructured targets and high-repetition lasers.

**Approach:** Laser inertial fusion with direct drive. **Variant:** laser fast ignition.

**Experimental fuel/status:** Laser/target component research

**Intended fuel:** Near-term noncryogenic D-T; longer-term tritium-lean options

**Mechanism:** Laser pulses interact with nanostructured target materials. Converters couple energy through fast particles and radiation into fuel. A fast-ignition architecture is intended to initiate burn. Near-term DT plants use a liquid blanket for heat extraction and tritium breeding. [ALT_MARVEL_FUND](https://www.marvelfusion.com/newsroom/marvel-fusion-extends-series-b-to-eur-113m-with-commitments-from-eqt-ventures-siemens-energy-and-european-innovation-council-eic-fund) [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology) [ALT_MARVEL_SITE](https://www.marvelfusion.com/newsroom/marvel-fusion-the-state-of-colorado-and-siemens-energy-sign-letter-of-intent) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Marvel Fusion headquarters / primary location | headquarters / listed location | Munich, Bavaria, Germany |
| ATLAS at Colorado State University | laser demo / under development | Fort Collins, Colorado, United States |
| CALA partner research | partner experimental site / operating | Garching, Bavaria, Germany |

### Evidence and current plans

- **Experimental result.** CALA/ELI-NP proof-of-concept is described by the company as component validation; not target gain. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology)

- **Organization event.** Colorado/Siemens Energy LOI signed; supports cooperation, not completed deployment. reported at: 2026-08-12. [ALT_MARVEL_SITE](https://www.marvelfusion.com/newsroom/marvel-fusion-the-state-of-colorado-and-siemens-energy-sign-letter-of-intent)

- **Target.** ATLAS infrastructure ready. target window: end 2026. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology) [ALT_MARVEL_SITE](https://www.marvelfusion.com/newsroom/marvel-fusion-the-state-of-colorado-and-siemens-energy-sign-letter-of-intent)

- **Target.** ATLAS first laser. target window: early 2027. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology) [ALT_MARVEL_SITE](https://www.marvelfusion.com/newsroom/marvel-fusion-the-state-of-colorado-and-siemens-energy-sign-letter-of-intent)

- **Target.** Target ignition. target window: 2032. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology)

- **Target.** Engineering gain; preserve the company definition when available. target window: 2035. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology)

- **Target.** Grid electricity. target window: 2036. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology)


**Financing snapshot:** €170 million private investment plus €215 million public cooperation projects (March 2025 disclosure)

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2025-03-27 | EUR 50M | round. Series B extension; included in €113 million total Series B and €170 million total private investments. [ALT_MARVEL_FUND](https://www.marvelfusion.com/newsroom/marvel-fusion-extends-series-b-to-eur-113m-with-commitments-from-eqt-ventures-siemens-energy-and-european-innovation-council-eic-fund) |
| 2025-03-27 | EUR 170M | cumulative total. Total private investment reported; includes Series B and its extension. [ALT_MARVEL_FUND](https://www.marvelfusion.com/newsroom/marvel-fusion-extends-series-b-to-eur-113m-with-commitments-from-eqt-ventures-siemens-energy-and-european-innovation-council-eic-fund) |
| 2025-03-27 | EUR 215M | public budget. Public cooperation project value; not an equity round or confirmed company cash receipt. [ALT_MARVEL_FUND](https://www.marvelfusion.com/newsroom/marvel-fusion-extends-series-b-to-eur-113m-with-commitments-from-eqt-ventures-siemens-energy-and-european-innovation-council-eic-fund) |

### Interpretive assessment

- Physics. Company-specific hollow-shell fast ignition must demonstrate gain; NIF indirect-drive success is not direct validation. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology)

- Laser scaling. High-efficiency, high-repetition short-pulse lasers must scale from demonstrations to plant energy and reliability. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology)

- Fuel. Current near-term design uses DT and retains breeding/neutron challenges; older proton-boron descriptions should not be copied forward. [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. 2026 survey says $440 million declared total and 300–500 MWe; live roadmap says ~100 MW pilot with net 2036. Keep source-vintage differences visible; do not silently blend.


## Avalanche Energy

Develops compact crossed-field devices, combining electrostatic ion orbits with magnetic electron confinement.

**Approach:** Magneto-electrostatic confinement. **Variant:** magneto electrostatic.

**Experimental fuel/status:** Hydrogen/ion-confinement experiments; DT gain program planned

**Intended fuel:** D-T near-term; other fuels discussed as longer-term options

**Mechanism:** A negative central electrode attracts fast ions into orbits. A surrounding magnetic field confines electrons. Co-confined charged populations are intended to sustain fusion reactions. First commercial infrastructure targets neutron testing; electricity-producing compact machines remain future goals. [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs) [ALT_AVALANCHE_TECH](https://www.avalanchefusion.com/orbitron) [ALT_AVALANCHE_GRANT](https://www.avalanchefusion.com/news-release/avalanche-energy-awarded-10-million-grant-from-washington-state-to-develop-fusionwerx-neutron-factory) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Avalanche Energy headquarters / primary location | headquarters / listed location | Seattle, Washington, United States |
| FusionWERX | commercial test facility / buildout and licensing | Richland, Washington, United States |

### Evidence and current plans

- **Experimental result.** Reported compact-device 300 kV high-voltage operation and published component/confinement papers; not demonstrated net energy. reported at: 2026-02-03. [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs)

- **Target.** FusionWERX broad-scope tritium-capable licensed operation; a proposed host for a D-T Q > 1 test programme, not a promise of gain in that year. target window: 2027. [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs)

- **Target.** Survey forecast for scientific/engineering gain; definitions not harmonized. target window: 2029. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

- **Target.** Survey forecast for pilot operation. target window: 2030. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)


**Financing snapshot:** $104.2 million 2026 survey total; $29 million round and $10 million state grant separately identified

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-02-03 | USD 29M | round. New financing round; also provides grant matching funds. [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs) |
| 2025-07-23 | USD 10M | grant. Washington grant; award/matching requirements differ from equity cash. [ALT_AVALANCHE_GRANT](https://www.avalanchefusion.com/news-release/avalanche-energy-awarded-10-million-grant-from-washington-state-to-develop-fusionwerx-neutron-factory) |
| 2026-07-13 | USD 104.2M | cumulative total. self-reported total; category composition not fully disclosed [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |

### Interpretive assessment

- Physics. Voltage, confinement and compact size are enabling results; energy-positive distributions and fusion output remain unproven in reviewed evidence. [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs) [ALT_AVALANCHE_TECH](https://www.avalanchefusion.com/orbitron)

- Fuel and scale. A practical DT microreactor still needs shielding, fuel supply, heat removal and conversion, which affect complete-system size. [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs) [ALT_AVALANCHE_TECH](https://www.avalanchefusion.com/orbitron)

- Licensing. A planned licensed test service is distinct from an operating electricity plant. [ALT_AVALANCHE_FUND](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work.


## EX-Fusion

Builds laser control, target delivery and laser systems toward repeated inertial-fusion operation.

**Approach:** Laser inertial fusion with direct drive. **Variant:** laser direct fast ignition.

**Experimental fuel/status:** Surrogate-target laser irradiation; fusion-neutron operation is a future integrated milestone

**Intended fuel:** D-T

**Mechanism:** A target-feed system delivers fresh fuel capsules. Feedback control tracks targets and aims laser beams. The referenced LIFT design uses multi-direction laser compression followed by a separate laser ignition stage. A future thermal plant converts repeated fusion heat to power. [ALT_EXFUSION_A](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD) [ALT_EXFUSION_EXT](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94) [ALT_EXFUSION_TEST](https://ex-fusion.com/news/%E4%B8%96%E7%95%8C%E5%88%9D%E3%80%811%E7%A7%92%E9%96%93%E3%81%AB10%E5%9B%9E%E3%80%81%E6%A8%A1%E6%93%AC%E7%87%83%E6%96%99%E3%81%AB%E5%AF%BE%E3%81%99%E3%82%8B%E3%83%AC%E3%83%BC%E3%82%B6%E3%83%BC) [ALT_EXFUSION_LOC](https://ex-fusion.com/company) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) [PAR_EXFUSION_TECH](https://ex-fusion.com/technology/knowledge)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| EX-Fusion headquarters / primary location | headquarters / listed location | Suita, Osaka, Japan |
| Hamamatsu development facility | R&D / operating | Hamamatsu, Shizuoka, Japan |

### Evidence and current plans

- **Experimental result.** Reported 10 Hz continuous irradiation of surrogate targets at Hamamatsu; not 10 Hz fusion ignition. reported at: 2025-07-01. [ALT_EXFUSION_TEST](https://ex-fusion.com/news/%E4%B8%96%E7%95%8C%E5%88%9D%E3%80%811%E7%A7%92%E9%96%93%E3%81%AB10%E5%9B%9E%E3%80%81%E6%A8%A1%E6%93%AC%E7%87%83%E6%96%99%E3%81%AB%E5%AF%BE%E3%81%99%E3%82%8B%E3%83%AC%E3%83%BC%E3%82%B6%E3%83%BC)

- **Target.** One hour of continuous neutron generation is a fiscal 2027 development target. target window: FY2027. [ALT_EXFUSION_A](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD) [ALT_EXFUSION_EXT](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94)

- **Target.** Electricity demonstration in the 2030s is a company goal, not an operating system. target window: 2030/2039. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)


**Financing snapshot:** JPY 6 billion cumulative financing, including loans (October 2025)

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2025-06-05 | JPY 2.6B | round. JPY 2.3 billion equity plusJPY 0.3 billion loans; mixed financing. [ALT_EXFUSION_A](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD) |
| 2025-10-14 | JPY 400M | round. Series A extension; included in cumulativeJPY 6 billion. [ALT_EXFUSION_EXT](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94) |
| 2025-10-14 | JPY 6B | cumulative total. All-time financing; includes loans in earlier Series A. [ALT_EXFUSION_EXT](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94) [ALT_EXFUSION_A](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD) |

### Interpretive assessment

- Integration. Target tracking and repetitive irradiation must be coupled to adequate driver energy and gain on real fuel. [ALT_EXFUSION_A](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD) [ALT_EXFUSION_TEST](https://ex-fusion.com/news/%E4%B8%96%E7%95%8C%E5%88%9D%E3%80%811%E7%A7%92%E9%96%93%E3%81%AB10%E5%9B%9E%E3%80%81%E6%A8%A1%E6%93%AC%E7%87%83%E6%96%99%E3%81%AB%E5%AF%BE%E3%81%99%E3%82%8B%E3%83%AC%E3%83%BC%E3%82%B6%E3%83%BC)

- Laser and plant. High-power laser efficiency, thermal management and integrated DT fuel cycle remain outstanding. [ALT_EXFUSION_A](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD) [ALT_EXFUSION_EXT](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94)

- Funding comparability. JPY 6 billion includes debt; do not label it equity or convert with an undocumented exchange rate. [ALT_EXFUSION_A](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD) [ALT_EXFUSION_EXT](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. FIA2026 reports $38 million total as a survey conversion. Original-currencyJPY 6 billion is preferred; do not add the two figures.


## HB11 Energy

Develops laser-driven proton-boron fusion and related laser and target technologies.

**Approach:** Laser inertial fusion with direct drive. **Variant:** laser proton boron.

**Experimental fuel/status:** Proton-boron reaction experiments in collaborating facilities

**Intended fuel:** p-B11

**Mechanism:** The proposed fast-ignition sequence begins with a nanosecond laser pulse that compresses a proton-boron fuel pellet. A picosecond pulse generates focused energetic protons intended to ignite the compressed fuel. The main proton-boron-11 reaction yields three helium nuclei; experiments study target geometry and reaction yield. The concept feeds about one pellet per second and recovers heat through a conventional steam cycle; this is a future plant design. [ALT_HB11_TECH](https://hb11.energy/our-technology/) [ALT_HB11_PAPER](https://hb11.energy/wp-content/uploads/2025/08/hydrogen-boron-fusion-in-confined-geometries_20250718.pdf) [ALT_HB11_PROJECT](https://hb11.energy/2022/05/03/hb11-energy-awarded-22m-laser-project-to-build-sovereign-nuclear-fusion-energy-capabilities/)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| HB11 Energy headquarters / primary location | headquarters / listed location | Sydney, New South Wales, Australia |

### Evidence and current plans

- **Experimental result.** Peer-reviewed collaborating LFEX work found enhanced alpha-particle yield using confined target geometries; not ignition or net energy. publication date: 2025-07-18. [ALT_HB11_PAPER](https://hb11.energy/wp-content/uploads/2025/08/hydrogen-boron-fusion-in-confined-geometries_20250718.pdf)

- **Target.** Commercial proton-boron electricity is the goal; no robust dated plant commitment identified in reviewed primary pages. [ALT_HB11_TECH](https://hb11.energy/our-technology/)


**Financing snapshot:** Company total not verified; AUD 22 million consortium project disclosed separately

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2022-05-03 | AUD 22M | public budget. Consortium laser project: AUD 6 million grant+AUD 16 million partner contributions; not company equity. [ALT_HB11_PROJECT](https://hb11.energy/2022/05/03/hb11-energy-awarded-22m-laser-project-to-build-sovereign-nuclear-fusion-energy-capabilities/) |

### Interpretive assessment

- Physics. Demonstrated reaction yield is far from a demonstrated self-sustaining high-gain regime; cited paper notes lack of evidence for yield-amplifying cascades in most prior experiments. [ALT_HB11_PAPER](https://hb11.energy/wp-content/uploads/2025/08/hydrogen-boron-fusion-in-confined-geometries_20250718.pdf)

- Driver and conversion. High-efficiency repetitive lasers and integrated useful-energy recovery remain necessary even if the primary fuel cycle avoids tritium breeding. [ALT_HB11_TECH](https://hb11.energy/our-technology/) [ALT_HB11_PROJECT](https://hb11.energy/2022/05/03/hb11-energy-awarded-22m-laser-project-to-build-sovereign-nuclear-fusion-energy-capabilities/)

- Evidence and funding. Current cumulative company funding was not established in reviewed primary sources. Project value is not a substitute. [ALT_HB11_PROJECT](https://hb11.energy/2022/05/03/hb11-energy-awarded-22m-laser-project-to-build-sovereign-nuclear-fusion-energy-capabilities/)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. supplemental


## Fuse Energy Technologies

Commercializes radiation-testing hardware while developing pulsed-power inertial-fusion concepts.

**Approach:** Pulsed power liner inertial fusion. **Variant:** pulsed magnetic inertial.

**Experimental fuel/status:** D-D neutron-source tests; future MagLIF route

**Intended fuel:** D-D / D-T

**Mechanism:** Pulsed-power systems drive high-current loads. Existing dense-plasma-focus hardware produces neutrons for testing. A future MagLIF system would compress preconditioned fuel. Energy production remains distinct from existing radiation-service revenue. [ALT_FUSE_TEST](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign) [ALT_FUSE_CONCEPT](https://www.f.energy/apeiron-i-fusion-energy-plant) [ALT_FUSE_HOME](https://www.f.energy/) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Fuse Energy Technologies headquarters / primary location | headquarters / listed location | San Leandro, California, United States |
| San Leandro experimental systems | R&D and testing / operating | San Leandro, California, United States |
| Albuquerque testing expansion | radiation testing / developing | Albuquerque, New Mexico, United States |

### Evidence and current plans

- **Experimental result.** FAETON test campaign with Fifth Gait reported repeated fusion-neutron production for radiation testing. reported at: 2025-04-08. [ALT_FUSE_TEST](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign)

- **Target.** Apeiron I is a future MagLIF energy demonstrator concept; no verified net-electric result or firm date in reviewed page. [ALT_FUSE_CONCEPT](https://www.f.energy/apeiron-i-fusion-energy-plant)


**Financing snapshot:** $65 million total declared in 2026 industry survey

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-07-13 | USD 65M | cumulative total. self-reported total; category composition not fully disclosed [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) |

### Interpretive assessment

- Physics. Dense-plasma-focus neutron-source performance does not demonstrate the proposed MagLIF plant gain. [ALT_FUSE_TEST](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign) [ALT_FUSE_CONCEPT](https://www.f.energy/apeiron-i-fusion-energy-plant)

- Repetition and plant. Practical repetition, debris clearing, target replacement and electric conversion need system validation. [ALT_FUSE_CONCEPT](https://www.f.energy/apeiron-i-fusion-energy-plant) [ALT_FUSE_HOME](https://www.f.energy/)

- Business metrics. Radiation-testing contracts, contract-vehicle ceilings and revenue must not be charted as fusion electricity or equity funding. [ALT_FUSE_TEST](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign) [ALT_FUSE_HOME](https://www.f.energy/)


**Additional context:** No positive net-electric demonstration found in reviewed sources; this is an evidence status, not an assertion about unpublished work. supplemental


## Startorus Fusion

Chinese developer of spherical tokamaks using repetitive magnetic reconnection heating and HTS magnets.

**Approach:** Spherical tokamak. **Variant:** spherical tokamak.

**Experimental fuel/status:** Experimental fuel is not specified consistently in the reviewed company releases; do not infer a D-T burn.

**Intended fuel:** D-T (company-reported FIA 2026 profile); equivalent-Q targets are not measured D-T gain.

**Mechanism:** A compact toroidal plasma is heated in repeated magnetic reconnection pulses. High-current-density magnets support the small central-column geometry. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html) [PAR_STARTORUS_A_PLUS_PLUS](https://www.startorus.com/company-news/484.html) [PAR_STARTORUS_MAGNET](https://startorus.com/progress-news/473.html) [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| Startorus Fusion listed office | company office / listed location | Shanghai, Shanghai, China |
| Jiading experimental base | experimental facility / under construction | Shanghai, Shanghai, China |
| Xian operations | research and manufacturing / listed location | Xian, Shaanxi, China |

Shanghai is a listed office, not a verified headquarters designation. The FIA profile lists Xi’an as the primary location. Coordinates in the dataset are approximate. [MAG_FIA_2026](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf) [PAR_STARTORUS_A_PLUS_PLUS](https://www.startorus.com/company-news/484.html)

### Evidence and current plans

- **Reported status.** Reports SUNIST-2 operation and construction of NTST; the source distinguishes these from the future CTRFR-1 design. reported at: 2026-05-07. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html)

- **Experimental result.** Full-scale HTS toroidal-field magnet energized at 20 K and 4.5 kA. reported at: 2026-06-11. [PAR_STARTORUS_MAGNET](https://startorus.com/progress-news/473.html)

- **Target.** NTST operation at rated parameters. target window: 2027. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html)

- **Target.** Equivalent plasma Q greater than one; modeled-fuel equivalence, not a measured D-T result. target window: 2029/2030. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html)

- **Target.** Electricity-exporting demonstration facility. target window: early 2030s. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html)


**Financing snapshot:** RMB880m A++ round announced August 2026; earlier cumulative financing exceeded RMB2bn in May 2026. Do not display their sum as a company-reported latest total.

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-05-07 | CNY 500M | round. A+ closed financing; source body takes precedence over shortened headline. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html) |
| 2026-05-07 | More than CNY 2B | cumulative total. Greater than; cumulative financing as of May, not updated after August round. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html) |
| 2026-08-08 | CNY 880M | round. A++ completed financing; do not add to a later total that may already include it. [PAR_STARTORUS_A_PLUS_PLUS](https://www.startorus.com/company-news/484.html) |

### Interpretive assessment

- Substantial extrapolation from experimental operation to repetitive reactor performance. [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html)

- A magnet test and an equivalent-Q target leave fuel cycle, heat exhaust, maintenance and integrated electricity unproven. [PAR_STARTORUS_MAGNET](https://startorus.com/progress-news/473.html) [PAR_STARTORUS_A_PLUS](https://www.startorus.com/company-news/453.html)


## OpenStar Technologies

Develops a levitated superconducting ring that confines plasma around its dipole field.

**Approach:** Levitated dipole. **Variant:** levitated dipole.

**Experimental fuel/status:** Prototype plasma; exact experimental fuel not carried from reviewed partner release.

**Intended fuel:** D-T in the published Tama Nui plant design.

**Mechanism:** Unlike an external-coil torus, the central magnet sits inside the plasma chamber. The ring must remain cold and shielded while plasma surrounds it; prospective D-T plants still require a blanket and fuel cycle. [PAR_OPENSTAR_PPPL](https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy) [PAR_OPENSTAR_LOAN](https://www.beehive.govt.nz/release/government-backs-fusion-energy-research) [PAR_OPENSTAR_TECH](https://www.openstar.tech/technical-resources) [PAR_OPENSTAR_TEAM](https://www.openstar.tech/team)

### Locations

| Site | Role / status | Location |
| --- | --- | --- |
| OpenStar Technologies headquarters / primary location | headquarters / listed location | Wellington, Wellington, New Zealand |
| Junior experimental programme | experimental facility / prototype operating | Wellington, Wellington, New Zealand |

### Evidence and current plans

- **Engineering progress.** Junior prototype fully commissioned according to PPPL partnership announcement. reported by: 2026-09-29. [PAR_OPENSTAR_PPPL](https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy)

- **Model or design.** Tama Nui grid-scale plant exists as a published D-T design, not demonstrated output. No precisely dated electricity target is adopted from an undated five-year website claim. [PAR_OPENSTAR_PPPL](https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy) [PAR_OPENSTAR_TECH](https://www.openstar.tech/technical-resources)


**Financing snapshot:** Government loan of up to NZD35m announced February 2026. Comparable current cumulative private funding not established in this record.

| Reported date | Amount / currency | Type and scope |
| --- | --- | --- |
| 2026-02-04 | Up to NZD 35M | debt facility. Government loan up to this amount; announced facility support, not proven disbursed equity. [PAR_OPENSTAR_LOAN](https://www.beehive.govt.nz/release/government-backs-fusion-energy-research) |

### Interpretive assessment

- Reactor-relevant confinement, temperature and gain must be shown beyond prototype operation. [PAR_OPENSTAR_PPPL](https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy)

- A superconducting magnet within the chamber creates distinctive shielding, cooling, access and lifetime requirements. [PAR_OPENSTAR_PPPL](https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy) [PAR_OPENSTAR_TECH](https://www.openstar.tech/technical-resources)


# Appendix B — Public programmes and enabling facilities

Public research supplies much of the experimental heritage. Its budget, mission and success criteria should remain distinct from private-company financing and commercial targets.


## National Ignition Facility

Laser-fusion experiment and national security research facility.

**Location:** Livermore, California, United States. **Status:** operating.

- **Reported evidence/status (2025-04-07):** Target gain 4.13 on 2025-04-07 [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition) [PHY_011](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record)

- **Reported evidence/status (2026-06-20):** Latest listed ignition 2026-06-20: 7.9 MJ, gain about 3.8 [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition) [PHY_011](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition) [PHY_011](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record)


## Joint European Torus

Major D-T tokamak; scientific operation ended December 2023.

**Location:** Culham, Oxfordshire, United Kingdom. **Status:** scientific operations ended.

- **Reported evidence/status (1997):** 1997 peak plasma Q about 0.67 [PHY_013](https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record) [PHY_014](https://www.ipp.mpg.de/5405892/jet_rekord_2024) [PHY_020](https://www.iter.org/few-lines)

- **Reported evidence/status (2023-10-03):** 2023 final campaign approximately 69 MJ fusion energy [PHY_013](https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record) [PHY_014](https://www.ipp.mpg.de/5405892/jet_rekord_2024) [PHY_020](https://www.iter.org/few-lines)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_013](https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record) [PHY_014](https://www.ipp.mpg.de/5405892/jet_rekord_2024) [PHY_020](https://www.iter.org/few-lines)


## Wendelstein 7-X

Optimized stellarator testing the long-pulse physics of this approach; not an electricity plant.

**Location:** Greifswald, Mecklenburg-Vorpommern, Germany. **Status:** operating.

- **Reported evidence/status (2025-05-22):** High triple product sustained 43 s in May 2025 [PHY_015](https://www.ipp.mpg.de/5532945/w7x)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_015](https://www.ipp.mpg.de/5532945/w7x)


## EAST

Superconducting tokamak studying stable long-duration plasma operation.

**Location:** Hefei, Anhui, China. **Status:** operating.

- **Reported evidence/status (2025-01-20):** High-confinement plasma 1,066 s on 2025-01-20 [PHY_016](https://english.cas.cn/head/202501/t20250121_899060.shtml)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_016](https://english.cas.cn/head/202501/t20250121_899060.shtml)


## KSTAR

Superconducting tokamak studying hot-ion and long-pulse operation.

**Location:** Daejeon, South Korea. **Status:** operating.

- **Reported evidence/status (2024-02):** Ion temperature 100 million degrees Celsius for 48 s [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720)

- **Reported evidence/status (2024-02):** H-mode 102 s in the same 2023–2024 campaign; do not merge metrics [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720)


## WEST

Tokamak used for long-pulse plasma-facing-component and control research.

**Location:** Saint-Paul-lez-Durance, Provence, France. **Status:** operating.

- **Reported evidence/status (2025-02-12):** Hydrogen plasma 1,337 s on 2025-02-12 [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/)

- **Reported evidence/status (2025-02-12):** 2.6 GJ external heating injected and extracted [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/)


## ITER

International experiment designed to study burning plasma and reactor systems; no electricity generator.

**Location:** Saint-Paul-lez-Durance, Provence, France. **Status:** under construction.

- **Target (2034):** Research operations start; not the D-T phase. [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024)

- **Target (2036):** Full magnetic energy. [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024)

- **Target (2039):** Start of D-T phase; not necessarily immediate Q = 10. [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024)

- **Target:** Design target: 500 MW fusion from 50 MW external plasma heating, plasma Q = 10; no electrical generator. [PHY_019](https://www.iter.org/fusion-energy/what-will-iter-do) [PHY_020](https://www.iter.org/few-lines)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_019](https://www.iter.org/fusion-energy/what-will-iter-do) [PHY_020](https://www.iter.org/few-lines) [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024)


## JT-60SA

Japan-Europe research tokamak supporting ITER and future power-plant plasma scenarios. Current campaign state not independently refreshed here.

**Location:** Naka, Ibaraki, Japan. **Status:** first plasma demonstrated.

- **Reported evidence/status (2023-10-23):** First plasma 2023-10-23 [PHY_026](https://www.iter.org/whatsnew/398)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_026](https://www.iter.org/whatsnew/398)


## IFMIF-DONES

Accelerator-driven neutron source for testing fusion materials; not a fusion reactor or a grid-power project.

**Location:** Escuzar, Granada, Spain. **Status:** under construction.

- **Target:** Qualify materials under fusion-relevant neutron exposure [PHY_024](https://fusionforenergy.europa.eu/news/eu-invest-ifmif-dones-fusion-facility/) [PHY_025](https://ifmif-dones.es/)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_024](https://fusionforenergy.europa.eu/news/eu-invest-ifmif-dones-fusion-facility/) [PHY_025](https://ifmif-dones.es/)


## Sandia Z and MagLIF

Pulsed-power facility developing magnetized liner fusion experiments.

**Location:** Albuquerque, New Mexico, United States. **Status:** research facility.

- **Reported evidence/status:** Thermonuclear plasma experiments with magnetization, preheat and liner compression [PHY_033](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_033](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/)


## OMEGA

University laser facility studying direct-drive implosions and diagnostics.

**Location:** Rochester, New York, United States. **Status:** research facility.


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_034](https://www.lle.rochester.edu/inertial-confinement-fusion/)


## WHAM

UW–Madison experiment with Realta; keep the university facility distinct from the company.

**Location:** Stoughton, Wisconsin, United States. **Status:** scientific operation.

- **Reported evidence/status (2024-07-15):** First plasma July 15, 2024 [PHY_035](https://wham.physics.wisc.edu/)

- **Reported evidence/status:** 17 T HTS mirror magnets [PHY_035](https://wham.physics.wisc.edu/)


**Funding boundary:** Public infrastructure funding is not comparable with startup equity funding. [PHY_035](https://wham.physics.wisc.edu/)


## STEP

Prototype intended to export net electricity, breed tritium and demonstrate a route to commercial availability.

**Location:** West Burton, Nottinghamshire, United Kingdom. **Status:** development and site preparation.

- **Reported evidence/status:** Programme planning, site preparation and partner selection; no operating fusion power plant. [PAR_STEP_STRATEGY](https://www.gov.uk/government/publications/uk-fusion-energy-ltd-ukfe-strategy/uk-fusion-energy-ltd-strategy-accessible-version) [PAR_UK_STRATEGY](https://www.gov.uk/government/publications/uk-fusion-strategy-2026/a-new-energy-revolution-the-uks-plan-for-delivering-fusion-energy-accessible-webpage) [PAR_STEP_PARTNERS](https://www.gov.uk/government/news/new-uk-fusion-energy-strategy-maps-path-to-commercial-fusion)

- **Target (2040):** Prototype operation from 2040. [PAR_STEP_STRATEGY](https://www.gov.uk/government/publications/uk-fusion-energy-ltd-ukfe-strategy/uk-fusion-energy-ltd-strategy-accessible-version)


**Funding boundary:** GBP1.3bn for next STEP stage, within wider GBP2.5bn UK fusion support; not total lifetime plant cost. [PAR_STEP_STRATEGY](https://www.gov.uk/government/publications/uk-fusion-energy-ltd-ukfe-strategy/uk-fusion-energy-ltd-strategy-accessible-version) [PAR_UK_STRATEGY](https://www.gov.uk/government/publications/uk-fusion-strategy-2026/a-new-energy-revolution-the-uks-plan-for-delivering-fusion-energy-accessible-webpage) [PAR_STEP_PARTNERS](https://www.gov.uk/government/news/new-uk-fusion-energy-strategy-maps-path-to-commercial-fusion)


## BEST

Compact high-field tokamak for D-T burning-plasma research and technology testing.

**Location:** Hefei, Anhui, China. **Status:** under construction.

- **Reported evidence/status:** Construction and joint research plan; reviewed evidence does not show a burning-plasma result. [PAR_BEST_PLAN](https://euro-fusion.org/eurofusion-news/eurofusion-asipp-best-research-plan/) [PAR_F4E_REPORT](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf)

- **Target (late 2027–early 2028):** First plasma: late 2027 or early 2028 in the July 2026 F4E overview; the November 2025 partner announcement had specified 2027. [PAR_BEST_PLAN](https://euro-fusion.org/eurofusion-news/eurofusion-asipp-best-research-plan/) [PAR_F4E_REPORT](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf)

- **Target:** Fusion gain Q greater than 5 is a research aim, not net grid-electric output. [PAR_BEST_PLAN](https://euro-fusion.org/eurofusion-news/eurofusion-asipp-best-research-plan/)


**Funding boundary:** No directly comparable project cash total included; state-linked capital and programme budgets have different boundaries. [PAR_BEST_PLAN](https://euro-fusion.org/eurofusion-news/eurofusion-asipp-best-research-plan/) [PAR_F4E_REPORT](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf)


## CRAFT

Engineering and technology test infrastructure supporting future fusion systems.

**Location:** Hefei, Anhui, China. **Status:** engineering test infrastructure.

- **Reported evidence/status:** Facility infrastructure exists; it is not an electricity-producing fusion reactor. [PAR_F4E_REPORT](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf)


**Funding boundary:** No comparable cash figure included. [PAR_F4E_REPORT](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf)


# Appendix C — Historical timeline and selected numerical results

## Timeline

| Date / role | Milestone | Interpretation and source |
| --- | --- | --- |
| 1934 / publication date | Laboratory fusion of heavy hydrogen | Oliphant, Harteck and Rutherford publish experiments involving heavy hydrogen. This establishes laboratory fusion reactions, not a power plant. [PHY_030](https://www.nature.com/articles/133413a0) |
| 1939-03-01 / publication date | Stellar energy explained | Bethe publishes a quantitative account of nuclear energy generation in stars. [PHY_031](https://journals.aps.org/pr/abstract/10.1103/PhysRev.55.434) |
| 1951 / event date | The stellarator program begins | Spitzer and Princeton begin Project Matterhorn, exploring magnetic confinement. [PHY_027](https://www.pppl.gov/about/history) |
| 1957 / publication date | Useful fusion gets quantitative conditions | Lawson publishes criteria relating plasma conditions and useful energy production. [PHY_032](https://doi.org/10.1088/0370-1301/70/1/303) |
| 1958 / event date | Research opens internationally | Previously secret magnetic fusion research is declassified. [PHY_027](https://www.pppl.gov/about/history) |
| 1968 / event date | Tokamaks change the field | Soviet tokamak results show much better plasma performance, prompting worldwide attention. [PHY_029](https://www.iter.org/fusion-energy/60-years-progress) |
| 1969 / event date | Independent measurement changes minds | British confirmation of Soviet results prompts Princeton to convert Model C to a tokamak. [PHY_028](https://www.pppl.gov/posts/2026/symmetric-tokamak-1970-1974) |
| 1982 / event date | High confinement mode discovered | ASDEX identifies H-mode, a major improvement in magnetic confinement. [PHY_029](https://www.iter.org/fusion-energy/60-years-progress) |
| 1991 / event date | JET begins D-T fusion experiments | JET uses deuterium and tritium to release fusion power under laboratory control. [PHY_029](https://www.iter.org/fusion-energy/60-years-progress) |
| 1997 / event date | JET reaches plasma gain near two thirds | JET reaches about 16 MW fusion power from 24 MW external heating, Q about 0.67. This is not an electrical efficiency. [PHY_020](https://www.iter.org/few-lines) |
| 2006 / event date | ITER agreement signed | The multinational ITER agreement establishes a shared experimental program; its mission is not grid electricity. [PHY_020](https://www.iter.org/few-lines) |
| 2021-08-08 / event date | NIF achieves physical ignition | Alpha heating supports a propagating burn in an experiment yielding over 1.3 MJ; target gain remains below one. [PHY_011](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record) |
| 2022-12-05 / event date | NIF passes target energy breakeven | Fusion yield of 3.15 MJ exceeds laser energy delivered to target: 2.05 MJ. Whole-facility electrical breakeven is a different boundary. [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition) |
| 2023-10-03 / event date | JET records about 69 MJ in one discharge | Final D-T campaign record measures integrated fusion energy over roughly five seconds. [PHY_013](https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record) [PHY_014](https://www.ipp.mpg.de/5405892/jet_rekord_2024) |
| 2023-10-23 / event date | JT-60SA achieves first plasma | The Europe-Japan tokamak at Naka begins plasma operation; first plasma is an integration milestone. [PHY_026](https://www.iter.org/whatsnew/398) |
| 2024-03-20 / reported at | KSTAR reports longer hot-ion operation | Campaign ran December 2023 to February 2024; 48 s at 100 million degrees Celsius ion temperature and 102 s in H-mode are separate records. [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720) |
| 2024-07-15 / event date | WHAM reaches first plasma | High-field mirror experiment at Stoughton enters scientific operation. [PHY_035](https://wham.physics.wisc.edu/) |
| 2025-01-20 / event date | EAST sustains high confinement for 1,066 seconds | Long-duration controlled plasma operation, not reported electricity output. [PHY_016](https://english.cas.cn/head/202501/t20250121_899060.shtml) |
| 2025-02-12 / event date | WEST sustains hydrogen plasma for 1,337 seconds | The 2.6 GJ handled by the machine is input and exhaust heat, not fusion yield. [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/) |
| 2025-04-07 / event date | NIF reaches target gain 4.13 | Record listed: 8.6 MJ fusion yield from 2.08 MJ laser input; target boundary only. [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [PHY_012](https://lmf.llnl.gov/news/target-breakthrough-enabled-fusion-record-nif) |
| 2025-05-22 / event date | W7-X sustains high performance for 43 seconds | Record combines triple product with long pulse duration; it is not the largest triple product at every pulse length. [PHY_015](https://www.ipp.mpg.de/5532945/w7x) |
| 2025-07-14 / reported at | EU approves EUR 202 million for materials test facility | IFMIF-DONES will provide accelerator-driven neutron irradiation for fusion materials research. [PHY_024](https://fusionforenergy.europa.eu/news/eu-invest-ifmif-dones-fusion-facility/) |
| 2026-02-26 / reported at | NRC publishes a fusion rule proposal | Proposal addresses radioactive materials and environmental review for fusion machines. This entry does not mark final rule adoption. [PHY_040](https://www.federalregister.gov/documents/2026/02/26/2026-03865/regulatory-framework-for-fusion-machines) |
| 2026-06-20 / event date | NIF lists its eleventh ignition experiment | Reported yield of 7.9 ± 0.4 MJ and target gain approximately 3.8; lower than the record 2025 yield. [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) |
| 2034 / target window | ITER research operations target | Announced baseline target; early research phases do not yet use D-T. [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024) |
| 2036 / target window | ITER full magnetic energy target | Announced baseline target; do not label this as commercial operation. [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024) |
| 2039 / target window | ITER D-T operations target | Start of D-T phase under current baseline; not a promise of grid electricity or immediate Q = 10. [PHY_021](https://www.ipp.mpg.de/5434926/ITER_baseline_2024) |


## Selected published results

These quantities belong in separate metric views. The numerical data is intentionally not collapsed into one leaderboard. NIF gain is plotted against time within its declared target-energy boundary. The latest point is not necessarily the largest.

| Facility / date | Metric / value | Accounting boundary and source |
| --- | --- | --- |
| EAST / 2025-01-20 | h mode duration: 1066 s | plasma_operating_regime [PHY_016](https://english.cas.cn/head/202501/t20250121_899060.shtml) |
| Joint European Torus / 1997 | plasma gain peak: 0.67 ratio | external_heating_to_plasma [PHY_020](https://www.iter.org/few-lines) |
| Joint European Torus / 2023-10-03 | fusion energy: 69 MJ | fusion_energy_released [PHY_013](https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record) [PHY_014](https://www.ipp.mpg.de/5405892/jet_rekord_2024) |
| KSTAR / 2024-02 | ion temperature duration: 48 s | specified_ion_temperature [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720) |
| KSTAR / 2024-02 | h mode duration: 102 s | plasma_operating_regime [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720) |
| National Ignition Facility / 2022-12-05 | target gain: 1.54 ratio | laser_energy_to_target [PHY_010](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition) |
| National Ignition Facility / 2023-07-30 | target gain: 1.89 ratio | laser_energy_to_target [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) |
| National Ignition Facility / 2024-02-12 | target gain: 2.36 ratio | laser_energy_to_target [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) |
| National Ignition Facility / 2025-02-23 | target gain: 2.44 ratio | laser_energy_to_target [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) |
| National Ignition Facility / 2025-04-07 | target gain: 4.13 ratio | laser_energy_to_target [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [PHY_012](https://lmf.llnl.gov/news/target-breakthrough-enabled-fusion-record-nif) |
| National Ignition Facility / 2026-06-20 | target gain: approximately 3.8 ratio | laser_energy_to_target [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) |
| Wendelstein 7-X / 2025-05-22 | high triple product duration: 43 s | high_performance_interval [PHY_015](https://www.ipp.mpg.de/5532945/w7x) |
| WEST / 2025-02-12 | plasma duration: 1337 s | plasma_discharge_duration [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/) |


# Appendix D — Risk questions, glossary and implementation map

## Detailed risk questions


### Fuel physics

Has the intended fuel demonstrated relevant reaction and loss physics?

**Evidence needed:** Measured reaction yield, ion/electron temperatures, radiation losses and fuel composition with uncertainty.

**Interpretation:** A result with hydrogen or D-D is informative but does not demonstrate D-T or p-B11 plant performance. [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) [PHY_006](https://arxiv.org/abs/2105.10954)


### Confinement and gain

Can the concept produce enough fusion energy at relevant conditions?

**Evidence needed:** Simultaneous density, temperature, confinement and actual gain at a declared boundary.

**Interpretation:** High temperature or a long pulse alone does not answer the gain question. [PHY_007](https://arxiv.org/html/2505.03834v6) [PHY_015](https://www.ipp.mpg.de/5532945/w7x)


### Heating and driver efficiency

Can the plant deliver the required pulse or heating economically?

**Evidence needed:** End-to-end electrical efficiency at required energy, power, repetition and component lifetime.

**Interpretation:** An efficient small driver or isolated subsystem may not scale to the required duty cycle. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_033](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/) [PHY_034](https://www.lle.rochester.edu/inertial-confinement-fusion/)


### Fuel supply and processing

Can the plant obtain, recover and replenish its operating fuel?

**Evidence needed:** Integrated mass balance, extraction/recycle rates, inventories, retention and leakage; D-T additionally net breeding.

**Interpretation:** Advanced fuel substitutes one set of constraints for another; it does not make fuel automatically free or available. [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) [PHY_022](https://www.iter.org/machine/supporting-systems/tritium-breeding)


### Neutrons and materials

Do structural and functional materials survive the actual particle spectrum?

**Evidence needed:** Irradiation and component tests at relevant spectrum, fluence, temperature and stress, plus replacement plans.

**Interpretation:** Short discharges establish little about multiyear component life. [PHY_024](https://fusionforenergy.europa.eu/news/eu-invest-ifmif-dones-fusion-facility/) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)


### Heat and particle exhaust

Can heat and particles leave without destroying surfaces or degrading plasma?

**Evidence needed:** Integrated heat-flux control, impurity management, coolant conditions and component tests.

**Interpretation:** Successful confinement can make exhaust more demanding. [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/) [PHY_023](https://www.iter.org/fusion-energy/making-it-work)


### Energy conversion

Can the released energy become useful electricity?

**Evidence needed:** Measured thermal/direct conversion efficiency and full recirculating electrical ledger.

**Interpretation:** Energy recovered from a charged system may largely be previously supplied energy. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_037](https://www.helionenergy.com/technology)


### Repetition and availability

Can the device operate often enough and recover between shots?

**Evidence needed:** Long-run pulse/duty-cycle data at relevant output including failures, scheduled downtime and consumables.

**Interpretation:** One successful shot, high repetition at low power and full-rate high-output operation are separate results. [PHY_034](https://www.lle.rochester.edu/inertial-confinement-fusion/) [PHY_038](https://www.zapenergy.com/technologies/fusion) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)


### Maintenance and replacement

Can worn or activated parts be changed affordably?

**Evidence needed:** Demonstrated remote access, validated replacement duration, component life and waste handling.

**Interpretation:** A cheaper core can still be an expensive plant if downtime is frequent. [PHY_023](https://www.iter.org/fusion-energy/making-it-work) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap) [PHY_043](https://www.iter.org/faqs?thematic=75)


### Integrated net output

Has the complete plant exported net energy over a meaningful interval?

**Evidence needed:** Metered complete-cycle energy balance with all auxiliaries and storage state restored, then repeat operation.

**Interpretation:** A set of independently successful components does not demonstrate an integrated plant. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)


### Financing and economics

Can a complete plant be built, operated and replicated at an acceptable cost?

**Evidence needed:** Cost scope, financing terms, capex, availability, lifetime, consumables, maintenance and electricity-market assumptions.

**Interpretation:** Capital raised is capacity to attempt the next milestone, not proof it can be reached. [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)


### Licensing and site delivery

Are a specific plant design and site permitted and connectable?

**Evidence needed:** Applicable license, environmental/site approvals, cooling and grid agreements, not merely a national policy statement.

**Interpretation:** A lighter regulatory category reduces one burden but does not remove permitting or engineering obligations. [PHY_040](https://www.federalregister.gov/documents/2026/02/26/2026-03865/regulatory-framework-for-fusion-machines) [PHY_041](https://www.nrc.gov/materials/fusion/rulemaking-status)


### Evidence and transparency

How directly does public evidence support the claim?

**Evidence needed:** Method, measurement boundary, uncertainty, raw/result detail, peer review and independent verification where available.

**Interpretation:** Unknown public evidence must be shown as unknown; company-authored peer review is not the same as replication. [PHY_007](https://arxiv.org/html/2505.03834v6)


## Glossary

| Term | Definition | Important distinction |
| --- | --- | --- |
| Plasma | An ionized state of matter containing free electrons and ions. | First plasma establishes operation, not fusion gain. [PHY_003](https://www.energy.gov/science/doe-explainsplasma-confinement) |
| Deuterium | Hydrogen isotope whose nucleus has one proton and one neutron. | Ordinary hydrogen and tritium. [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) |
| Tritium | Radioactive hydrogen isotope with one proton and two neutrons; half-life about 12.3 years. | An abundant ready-to-use fuel reserve. [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) |
| Alpha particle | Helium-4 nucleus produced in D-T fusion; its charged-particle energy can heat the plasma. | The neutron, which carries most D-T energy and is not magnetically confined. [PHY_001](https://www.energy.gov/science/doe-explainsfusion-reactions) [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) |
| Plasma gain | Fusion power divided by external heating power delivered across the stated plasma or device boundary. | Power drawn from the grid; denominator conventions vary and must be disclosed. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_019](https://www.iter.org/fusion-energy/what-will-iter-do) |
| Target gain | Fusion energy from one implosion divided by driver energy delivered to the target. | Wall-plug electricity, fuel-absorbed energy, or electrical output. [PHY_009](https://lmf.llnl.gov/science/achieving-fusion-ignition) [PHY_007](https://arxiv.org/html/2505.03834v6) |
| Fuel gain | Fusion output divided by energy actually coupled into the fusion fuel under a stated definition. | Target gain; much driver energy may never reach the fuel. [PHY_006](https://arxiv.org/abs/2105.10954) |
| Driver efficiency | Energy delivered to the target or plasma divided by electrical input to the driver system. | Fusion gain; a device can improve one while the other remains low. [PHY_006](https://arxiv.org/abs/2105.10954) |
| Electrical gain | For this site only: gross electrical output divided by all recirculating plant electrical consumption over the same complete interval. | Other authors may call different ratios engineering Q; always display the actual numerator and denominator. [PHY_006](https://arxiv.org/abs/2105.10954) |
| Net electricity | Gross generated electrical energy minus every included plant electrical input, measured over a stated complete cycle or interval. | Momentary current, capacitor recovery, or gross generation. [PHY_006](https://arxiv.org/abs/2105.10954) |
| Grid export | Net electrical energy delivered at the grid connection over an interval, accounting for imports and stored-energy changes. | An isolated pulse or a signed power-purchase agreement. [PHY_006](https://arxiv.org/abs/2105.10954) |
| Ignition | Fusion-product self-heating becomes sufficient to sustain or propagate the burn under the specified physical criterion. | A universal synonym for Q greater than 1; physical ignition and target breakeven are distinct. [PHY_007](https://arxiv.org/html/2505.03834v6) [PHY_011](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record) |
| Burning plasma | A plasma substantially heated by its own fusion products, typically with self-heating dominating external heating. | Continuous commercial electricity generation. [PHY_011](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record) [PHY_020](https://www.iter.org/few-lines) |
| Triple product | Number density times temperature times energy confinement time, with conventions, units and averaging stated. | Pulse duration times record temperature from a different experiment. [PHY_006](https://arxiv.org/abs/2105.10954) [PHY_007](https://arxiv.org/html/2505.03834v6) |
| Energy confinement time | Characteristic time for stored plasma thermal energy to be lost; commonly W_plasma / P_loss under the stated power balance. | Total duration of a maintained plasma discharge. [PHY_006](https://arxiv.org/abs/2105.10954) |
| Pulse duration | Length of an experimental discharge or specified high-performance interval. | Energy confinement time or full power-plant availability. [PHY_015](https://www.ipp.mpg.de/5532945/w7x) [PHY_017](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720) [PHY_018](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/) |
| Repetition rate | Number of complete shots or pulses per second, measured with specified driver energy and target conditions. | A one-off maximum shot rate maintained at low power. [PHY_033](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/) [PHY_034](https://www.lle.rochester.edu/inertial-confinement-fusion/) |
| Blanket | A surrounding reactor subsystem that may absorb energy, shield components and breed tritium. | A demonstrated fuel-self-sufficient plant simply because a blanket is drawn. [PHY_022](https://www.iter.org/machine/supporting-systems/tritium-breeding) |
| Tritium breeding ratio | Tritium generated divided by tritium consumed under a stated neutronics and accounting boundary. | Net recoverable surplus after processing losses, decay and inventory needs. [PHY_022](https://www.iter.org/machine/supporting-systems/tritium-breeding) [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) |
| Divertor | A magnetic-plasma exhaust region that handles escaping heat and particles. | A blanket; exhaust and neutron-heating loads are different. [PHY_023](https://www.iter.org/fusion-energy/making-it-work) |
| High temperature superconductor | A material that remains superconducting at higher temperatures than conventional low-temperature superconductors; fusion magnets still require cryogenic cooling. | Room-temperature magnets or a guarantee of low overall plant demand. [PHY_035](https://wham.physics.wisc.edu/) [PHY_042](https://www.energy.gov/documents/fusion-science-and-technology-roadmap) |
| Field reversed configuration | A compact plasma configuration with magnetic-field reversal in its core and no material center column through the confined region. | A specific company, fuel or energy-conversion method. [PHY_036](https://www.nature.com/articles/s41467-025-58849-5) [PHY_037](https://www.helionenergy.com/technology) |
| Aneutronic | A description for reactions whose main products are charged particles rather than neutrons. | Zero neutron production, zero radiation, or no shielding in an operating plant. [PHY_002](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel) |
| MW fusion and MW electric | Fusion power describes nuclear energy release; gross electrical output and net electrical output describe different later boundaries. | Interchangeable units just because all use MW. [PHY_019](https://www.iter.org/fusion-energy/what-will-iter-do) [PHY_006](https://arxiv.org/abs/2105.10954) |


# Appendix E — Source register

167 distinct primary and attributed sources were retained after URL deduplication. Titles are source titles and may contain promotional wording; that wording is not adopted as an editorial conclusion. Live pages without publication dates are labeled undated. Reviewed 22 October 2026 Pacific time.


### PHY_001 — DOE Explains Fusion Reactions

US Department of Energy. Undated live page. government explainer.

[https://www.energy.gov/science/doe-explainsfusion-reactions](https://www.energy.gov/science/doe-explainsfusion-reactions)


### PHY_002 — DOE Explains Deuterium Tritium Fusion Fuel

US Department of Energy. Undated live page. government explainer.

[https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel](https://www.energy.gov/science/doe-explainsdeuterium-tritium-fusion-fuel)


### PHY_003 — DOE Explains Plasma Confinement

US Department of Energy. Undated live page. government explainer.

[https://www.energy.gov/science/doe-explainsplasma-confinement](https://www.energy.gov/science/doe-explainsplasma-confinement)


### PHY_004 — DOE Explains Tokamaks

US Department of Energy. Undated live page. government explainer.

[https://www.energy.gov/science/doe-explainstokamaks](https://www.energy.gov/science/doe-explainstokamaks)


### PHY_005 — DOE Explains Stellarators

US Department of Energy. Undated live page. government explainer.

[https://www.energy.gov/science/doe-explainsstellarators](https://www.energy.gov/science/doe-explainsstellarators)


### PHY_006 — Progress toward fusion energy breakeven and gain as measured against the Lawson criterion

Wurzel and Hsu; Physics of Plasmas. Published 2022-06. peer reviewed review.

[https://arxiv.org/abs/2105.10954](https://arxiv.org/abs/2105.10954)


### PHY_007 — Continuing progress toward fusion energy breakeven and gain as measured against the Lawson criteria

Wurzel and Hsu; Physics of Plasmas. Published 2025-11. peer reviewed review.

[https://arxiv.org/html/2505.03834v6](https://arxiv.org/html/2505.03834v6)


### PHY_008 — Lawson criterion paper figures and data

Samuel E Wurzel. Undated live page. author data repository.

[https://github.com/swurzel/lawson-criterion-paper](https://github.com/swurzel/lawson-criterion-paper)


### PHY_009 — Achieving Fusion Ignition

Lawrence Livermore National Laboratory. Undated live page. laboratory results.

[https://lmf.llnl.gov/science/achieving-fusion-ignition](https://lmf.llnl.gov/science/achieving-fusion-ignition)


### PHY_010 — DOE National Laboratory Makes History by Achieving Fusion Ignition

US Department of Energy. Published 2022-12. government result announcement.

[https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition](https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition)


### PHY_011 — Three peer reviewed papers highlight scientific results of NIF record yield shot

Lawrence Livermore National Laboratory. Published 2022-08-08. laboratory paper summary.

[https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record](https://www.llnl.gov/article/48866/three-peer-reviewed-papers-highlight-scientific-results-national-ignition-facility-record)


### PHY_012 — Target Breakthrough Enabled Fusion Record at NIF

Lawrence Livermore National Laboratory. Published 2026-04-15. laboratory result explanation.

[https://lmf.llnl.gov/news/target-breakthrough-enabled-fusion-record-nif](https://lmf.llnl.gov/news/target-breakthrough-enabled-fusion-record-nif)


### PHY_013 — JET final tritium experiments yield new fusion energy record

UK Atomic Energy Authority. Published 2024-02-08. government result announcement.

[https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record](https://www.gov.uk/government/news/jets-final-tritium-experiments-yield-new-fusion-energy-record)


### PHY_014 — Energy record JET

Max Planck Institute for Plasma Physics. Published 2024-02-08. laboratory result announcement.

[https://www.ipp.mpg.de/5405892/jet_rekord_2024](https://www.ipp.mpg.de/5405892/jet_rekord_2024)


### PHY_015 — Wendelstein 7-X sets new performance records in fusion research

Max Planck Institute for Plasma Physics. Published 2025-06-03. laboratory result announcement.

[https://www.ipp.mpg.de/5532945/w7x](https://www.ipp.mpg.de/5532945/w7x)


### PHY_016 — Chinese Artificial Sun Sets Milestone Record towards Fusion Power Generation

Chinese Academy of Sciences. Published 2025-01-21. laboratory result announcement.

[https://english.cas.cn/head/202501/t20250121_899060.shtml](https://english.cas.cn/head/202501/t20250121_899060.shtml)


### PHY_017 — Green light for long duration fusion plasma operation technology

National Research Council of Science and Technology and Korea Institute of Fusion Energy. Published 2024-03-20. government institute result announcement.

[https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720](https://www.nst.re.kr/www/selectBbsNttView.do?bbsNo=12&key=52&nttNo=42720)


### PHY_018 — WEST sets a new plasma duration record

CEA Institute for Magnetic Fusion Research. Published 2025-02-19. laboratory result announcement.

[https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/](https://irfm.cea.fr/en/2025/02/west-sets-a-new-plasma-duration-record/)


### PHY_019 — What will ITER do

ITER Organization. Undated live page. project official.

[https://www.iter.org/fusion-energy/what-will-iter-do](https://www.iter.org/fusion-energy/what-will-iter-do)


### PHY_020 — In a Few Lines

ITER Organization. Undated live page. project official.

[https://www.iter.org/few-lines](https://www.iter.org/few-lines)


### PHY_021 — The implications of the new ITER schedule

Max Planck Institute for Plasma Physics. Published 2024-07-03. project institutional update.

[https://www.ipp.mpg.de/5434926/ITER_baseline_2024](https://www.ipp.mpg.de/5434926/ITER_baseline_2024)


### PHY_022 — Tritium Breeding

ITER Organization. Undated live page. project official.

[https://www.iter.org/machine/supporting-systems/tritium-breeding](https://www.iter.org/machine/supporting-systems/tritium-breeding)


### PHY_023 — Making fusion work

ITER Organization. Undated live page. project explainer.

[https://www.iter.org/fusion-energy/making-it-work](https://www.iter.org/fusion-energy/making-it-work)


### PHY_024 — European Union to invest 202 million EUR to IFMIF-DONES

Fusion for Energy. Published 2025-07-14. public funding announcement.

[https://fusionforenergy.europa.eu/news/eu-invest-ifmif-dones-fusion-facility/](https://fusionforenergy.europa.eu/news/eu-invest-ifmif-dones-fusion-facility/)


### PHY_025 — IFMIF-DONES official project

IFMIF-DONES. Undated live page. project official.

[https://ifmif-dones.es/](https://ifmif-dones.es/)


### PHY_026 — ITER Newsline 398

ITER Organization. Published 2023-10-30. institutional news.

[https://www.iter.org/whatsnew/398](https://www.iter.org/whatsnew/398)


### PHY_027 — History

Princeton Plasma Physics Laboratory. Undated live page. laboratory history.

[https://www.pppl.gov/about/history](https://www.pppl.gov/about/history)


### PHY_028 — Symmetric Tokamak 1970 to 1974

Princeton Plasma Physics Laboratory. Published 2026-05-29. laboratory history.

[https://www.pppl.gov/posts/2026/symmetric-tokamak-1970-1974](https://www.pppl.gov/posts/2026/symmetric-tokamak-1970-1974)


### PHY_029 — 60 years of progress

ITER Organization. Undated live page. institutional history.

[https://www.iter.org/fusion-energy/60-years-progress](https://www.iter.org/fusion-energy/60-years-progress)


### PHY_030 — Transmutation Effects observed with Heavy Hydrogen

Oliphant Harteck Rutherford; Nature. Published 1934. original research historical.

[https://www.nature.com/articles/133413a0](https://www.nature.com/articles/133413a0)


### PHY_031 — Energy Production in Stars

Hans Bethe; Physical Review. Published 1939-03-01. original research historical.

[https://journals.aps.org/pr/abstract/10.1103/PhysRev.55.434](https://journals.aps.org/pr/abstract/10.1103/PhysRev.55.434)


### PHY_032 — Some Criteria for a Power Producing Thermonuclear Reactor

J D Lawson; Proceedings of the Physical Society B. Published 1957. original research historical.

[https://doi.org/10.1088/0370-1301/70/1/303](https://doi.org/10.1088/0370-1301/70/1/303)


### PHY_033 — An overview of magneto inertial fusion on the Z Machine at Sandia National Laboratories

Sandia National Laboratories. Published 2022-04-01. research publication abstract.

[https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/)


### PHY_034 — Inertial Confinement Fusion

University of Rochester Laboratory for Laser Energetics. Undated live page. laboratory explainer.

[https://www.lle.rochester.edu/inertial-confinement-fusion/](https://www.lle.rochester.edu/inertial-confinement-fusion/)


### PHY_035 — Wisconsin HTS Axisymmetric Mirror

University of Wisconsin Madison. Undated live page. project official.

[https://wham.physics.wisc.edu/](https://wham.physics.wisc.edu/)


### PHY_036 — Generation of field reversed configurations via neutral beam injection

TAE research authors; Nature Communications. Published 2025-04-12. peer reviewed experiment.

[https://www.nature.com/articles/s41467-025-58849-5](https://www.nature.com/articles/s41467-025-58849-5)


### PHY_037 — Helion technology

Helion. Undated live page. company technology description.

[https://www.helionenergy.com/technology](https://www.helionenergy.com/technology)


### PHY_038 — Fusion Technology

Zap Energy. Undated live page. company technology description.

[https://www.zapenergy.com/technologies/fusion](https://www.zapenergy.com/technologies/fusion)


### PHY_039 — What Sets Magnetized Target Fusion Apart

General Fusion. Undated live page. company technology description.

[https://generalfusion.com/our-fusion-technology/what-sets-mtf-apart/](https://generalfusion.com/our-fusion-technology/what-sets-mtf-apart/)


### PHY_040 — Regulatory Framework for Fusion Machines

US Nuclear Regulatory Commission and Federal Register. Published 2026-02-26. proposed regulation.

[https://www.federalregister.gov/documents/2026/02/26/2026-03865/regulatory-framework-for-fusion-machines](https://www.federalregister.gov/documents/2026/02/26/2026-03865/regulatory-framework-for-fusion-machines)


### PHY_041 — Fusion Machine Rulemaking Status

US Nuclear Regulatory Commission. Undated live page. regulator status.

[https://www.nrc.gov/materials/fusion/rulemaking-status](https://www.nrc.gov/materials/fusion/rulemaking-status)


### PHY_042 — Fusion Science and Technology Roadmap

US Department of Energy. Published 2026-06. government technical roadmap.

[https://www.energy.gov/documents/fusion-science-and-technology-roadmap](https://www.energy.gov/documents/fusion-science-and-technology-roadmap)


### PHY_043 — Fusion Safety and Environment FAQs

ITER Organization. Undated live page. project safety explainer.

[https://www.iter.org/faqs?thematic=75](https://www.iter.org/faqs?thematic=75)


### MAG_CFS_FUND_2026 — Commonwealth Fusion Systems raises another $1 billion, bringing total capital raised to $4 billion

Commonwealth Fusion Systems. Published 2026-07-30. company primary.

[https://www.cfs.energy/news-and-media/commonwealth-fusion-systems-raises-another-1-billion-bringing-total-capital-raised-to-4-billion/](https://www.cfs.energy/news-and-media/commonwealth-fusion-systems-raises-another-1-billion-bringing-total-capital-raised-to-4-billion/)


### MAG_CFS_SPARC — SPARC

Commonwealth Fusion Systems. Undated live page. company primary.

[https://cfs.energy/technology/sparc/](https://cfs.energy/technology/sparc/)


### MAG_CFS_ARC — ARC

Commonwealth Fusion Systems. Undated live page. company primary.

[https://cfs.energy/technology/arc/](https://cfs.energy/technology/arc/)


### MAG_CFS_MAGNET — High-temperature superconducting magnets

Commonwealth Fusion Systems. Undated live page. company primary.

[https://cfs.energy/technology/hts-magnets/](https://cfs.energy/technology/hts-magnets/)


### MAG_HELION_FUND — Helion raises $465 million Series G funding round to meet surging global demand for power

Helion. Published 2026-06-04. company primary.

[https://www.helionenergy.com/newsroom/helion-raises-465-million-series-g-funding-round-to-meet-surging-global-demand-for-power](https://www.helionenergy.com/newsroom/helion-raises-465-million-series-g-funding-round-to-meet-surging-global-demand-for-power)

Source note: Live article updated September 2026; do not add original and final round amounts.


### MAG_HELION_POLARIS — Polaris

Helion. Undated live page. company primary.

[https://www.helionenergy.com/polaris](https://www.helionenergy.com/polaris)

Source note: Critical energy-boundary correction: the stated objective is not whole-plant net electricity, and this page alone does not establish that its revised objective has been achieved.


### MAG_HELION_ORION — Orion

Helion. Undated live page. company primary.

[https://www.helionenergy.com/orion](https://www.helionenergy.com/orion)


### MAG_HELION_POLARIS_RESULTS — Helion achieves new fusion energy milestones

Helion. Published 2026-02-13. company primary.

[https://www.helionenergy.com/newsroom/helion-achieves-new-fusion-energy-milestones](https://www.helionenergy.com/newsroom/helion-achieves-new-fusion-energy-milestones)


### MAG_HELION_CHIPS — Helion signs letter of intent for $175 million CHIPS award to advance semiconductor fusion energy

Helion. Published 2026-10-22. company primary.

[https://www.helionenergy.com/newsroom/helion-signs-letter-of-intent-for-175-million-chips-award-to-advance-semiconductor-fusion-energy](https://www.helionenergy.com/newsroom/helion-signs-letter-of-intent-for-175-million-chips-award-to-advance-semiconductor-fusion-energy)


### MAG_TAE_FUND — TAE Technologies raises $150 million in latest funding round

TAE Technologies. Published 2025-06-02. company primary.

[https://tae.com/tae-technologies-raises-150-million-in-latest-funding-round/](https://tae.com/tae-technologies-raises-150-million-in-latest-funding-round/)


### MAG_TAE_ROADMAP — TAE shortens device roadmap, prepares for commercial era

TAE Technologies. Published 2025-11-17. company primary.

[https://tae.com/tae-shortens-device-roadmap-prepares-for-commercial-era/](https://tae.com/tae-shortens-device-roadmap-prepares-for-commercial-era/)


### MAG_TAE_NATURE — Generation of field-reversed configurations via neutral beam injection

Nature Communications / PubMed. Published 2025-04-12. peer reviewed experiment.

[https://pubmed.ncbi.nlm.nih.gov/40221407/](https://pubmed.ncbi.nlm.nih.gov/40221407/)

Source note: PubMed abstract read; full Nature and PMC versions were blocked during retrieval. DOI 10.1038/s41467-025-58849-5.


### MAG_TAE_FUEL — Fusion FAQ

TAE Technologies. Undated live page. company primary.

[https://tae.com/faq-fusion/](https://tae.com/faq-fusion/)


### MAG_TAE_HE3 — TAE Technologies and Black Moon Energy Corporation enter into strategic helium-3 supply and commercialization agreement for fusion power

TAE Technologies. Published 2026-08-05. company primary.

[https://tae.com/tae-technologies-and-black-moon-energy-corporation-enter-into-strategic-helium-3-supply-and-commercialization-agreement-for-fusion-power/](https://tae.com/tae-technologies-and-black-moon-energy-corporation-enter-into-strategic-helium-3-supply-and-commercialization-agreement-for-fusion-power/)

Source note: Treat the 2031 operations statement as a dated company target; a later SEC filing search extract used different sequencing and full filing could not be reviewed.


### MAG_TAE_DEBT — TAE Technologies advances site evaluation process with multi-state visits ahead of first fusion power plant

TAE Technologies. Published 2026-03-26. company primary.

[https://tae.com/tae-technologies-advances-site-evaluation-process-with-multi-state-visits-ahead-of-first-fusion-power-plant/](https://tae.com/tae-technologies-advances-site-evaluation-process-with-multi-state-visits-ahead-of-first-fusion-power-plant/)


### MAG_TAE_MERGER — Trump Media & Technology Group and TAE Technologies file Form S-4 registration statement for proposed merger

TAE Technologies. Published 2026-09-30. company primary.

[https://tae.com/trump-media-technology-group-and-tae-technologies-file-form-s-4-registration-statement-for-proposed-merger/](https://tae.com/trump-media-technology-group-and-tae-technologies-file-form-s-4-registration-statement-for-proposed-merger/)


### MAG_TE_FUND — Tokamak Energy raises $125m to commercialise transformative fusion and magnet technologies

Tokamak Energy. Published 2024-11-20. company primary.

[https://tokamakenergy.com/2024/11/20/tokamak-energy-raises-125m-to-commercialise-transformative-fusion-and-magnet-technologies/](https://tokamakenergy.com/2024/11/20/tokamak-energy-raises-125m-to-commercialise-transformative-fusion-and-magnet-technologies/)


### MAG_TE_DEMO4 — Tokamak Energy completes fusion magnet campaign validating technology for commercial HTS systems

Tokamak Energy. Published 2026-09-09. company primary.

[https://tokamakenergy.com/2026/09/09/tokamak-energy-completes-world-leading-fusion-magnet-campaign-validating-technology-for-commercial-hts-systems/](https://tokamakenergy.com/2026/09/09/tokamak-energy-completes-world-leading-fusion-magnet-campaign-validating-technology-for-commercial-hts-systems/)


### MAG_TE_ST40 — Institute of Physics marks Tokamak Energy’s record 100 million degrees fusion plasma

Tokamak Energy. Published 2023-02-28. company primary.

[https://tokamakenergy.com/2023/02/28/institute-of-physics-marks-tokamak-energys-record-100-million-degrees-fusion-plasma/](https://tokamakenergy.com/2023/02/28/institute-of-physics-marks-tokamak-energys-record-100-million-degrees-fusion-plasma/)


### MAG_TE_US — Tokamak Energy U.S.

Tokamak Energy. Undated live page. company primary.

[https://tokamakenergy.com/usa/](https://tokamakenergy.com/usa/)


### MAG_TYPEONE_FUND — Type One Energy completes $200m Series B financing

Type One Energy. Published 2026-10-06. company primary.

[https://typeoneenergy.com/insights-announcements/type-one-energy-completes-200m-series-b-financing/](https://typeoneenergy.com/insights-announcements/type-one-energy-completes-200m-series-b-financing/)


### MAG_TYPEONE_TECH — Our technology

Type One Energy. Undated live page. company primary.

[https://typeoneenergy.com/our-technology/](https://typeoneenergy.com/our-technology/)


### MAG_PROXIMA_FUND — Proxima Fusion raises €411 million to build Europe’s commercial fusion champion

Proxima Fusion. Published 2026-07-07. company primary.

[https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion](https://www.proximafusion.com/press-news/proxima-fusion-raises-eu411-million-to-build-europes-commercial-fusion-champion)


### MAG_PROXIMA_ALPHA — Alpha

Proxima Fusion. Undated live page. company primary.

[https://www.proximafusion.com/program/alpha](https://www.proximafusion.com/program/alpha)


### MAG_PROXIMA_STELLARIS — Stellaris

Proxima Fusion. Undated live page. company primary.

[https://www.proximafusion.com/program/stellaris](https://www.proximafusion.com/program/stellaris)


### MAG_PROXIMA_PAPER — Proxima Fusion and partners publish Stellaris fusion power plant concept

Proxima Fusion. Published 2025-02-26. company primary.

[https://www.proximafusion.com/press-news/proxima-fusion-and-partners-publish-stellaris-fusion-power-plant-concept-to-bring-limitless-safe-clean-energy-to-the-grid](https://www.proximafusion.com/press-news/proxima-fusion-and-partners-publish-stellaris-fusion-power-plant-concept-to-bring-limitless-safe-clean-energy-to-the-grid)


### MAG_THEA_FUND — Thea Energy raises $100 million Series B funding to build scalable fusion power plants

Thea Energy. Published 2026-05-27. company primary.

[https://thea.energy/press-release/thea-energy-raises-100-million-series-b-funding-to-build-scalable-fusion-power-plants/](https://thea.energy/press-release/thea-energy-raises-100-million-series-b-funding-to-build-scalable-fusion-power-plants/)


### MAG_THEA_EXTENSION — Thea Energy extends Series B funding to deploy efficient and economical fusion power

Thea Energy. Published 2026-08-18. company primary.

[https://thea.energy/press-release/thea-energy-extends-series-b-funding-to-deploy-efficient-and-economical-fusion-power/](https://thea.energy/press-release/thea-energy-extends-series-b-funding-to-deploy-efficient-and-economical-fusion-power/)


### MAG_THEA_EOS — Eos

Thea Energy. Undated live page. company primary.

[https://thea.energy/eos/](https://thea.energy/eos/)


### MAG_THEA_HELIOS — Overview of the Helios Design: A Practical Planar Coil Stellarator Fusion Power Plant

Thea authors / arXiv. Published 2025-12-08. preprint design.

[https://arxiv.org/abs/2512.08027](https://arxiv.org/abs/2512.08027)

Source note: Version 3 dated 2026-01-05; no independent operating-performance claim.


### MAG_THEA_CANIS — Prototyping and Test of the Canis HTS Planar Coil Array for Stellarator Field Shaping

Thea authors / arXiv. Published 2025-03-19. preprint experiment.

[https://arxiv.org/abs/2503.18960](https://arxiv.org/abs/2503.18960)


### MAG_RENAISSANCE_NEWS — Press releases

Renaissance Fusion. Undated live page. company primary.

[https://renfusion.eu/press-releases](https://renfusion.eu/press-releases)


### MAG_RENAISSANCE_TECH — Technology

Renaissance Fusion. Undated live page. company primary.

[https://renfusion.eu/technology](https://renfusion.eu/technology)


### MAG_REALTA_TECH — Technology

Realta Fusion. Undated live page. company primary.

[https://realtafusion.com/technology/](https://realtafusion.com/technology/)


### MAG_REALTA_FUND — Realta Fusion raises $36 million Series A to advance compact, scalable, modular fusion energy

Realta Fusion / PR Newswire. Published 2025-05-13. company press release.

[https://www.prnewswire.com/news-releases/realta-fusion-raises-36-million-series-a-to-advance-compact-scalable-modular-fusion-energy-302452726.html](https://www.prnewswire.com/news-releases/realta-fusion-raises-36-million-series-a-to-advance-compact-scalable-modular-fusion-energy-302452726.html)


### MAG_REALTA_DEBT — Realta Fusion secures $9.5 million growth capital facility from Silicon Valley Bank

Silicon Valley Bank / PR Newswire. Published 2026-02-17. counterparty primary.

[https://www.prnewswire.com/news-releases/realta-fusion-secures-9-5-million-growth-capital-facility-from-silicon-valley-bank-a-division-of-first-citizens-bank-302689285.html](https://www.prnewswire.com/news-releases/realta-fusion-secures-9-5-million-growth-capital-facility-from-silicon-valley-bank-a-division-of-first-citizens-bank-302689285.html)


### MAG_REALTA_WHAM — First plasma marks major milestone in UW-Madison fusion energy research

University of Wisconsin–Madison. Published 2024-07-18. institution primary.

[https://news.wisc.edu/first-plasma-marks-major-milestone-in-uw-madison-fusion-energy-research/](https://news.wisc.edu/first-plasma-marks-major-milestone-in-uw-madison-fusion-energy-research/)


### MAG_REALTA_DEC — A fusion first: Realta demos direct energy conversion

Realta Fusion. Published 2026-06-30. company primary.

[https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/](https://realtafusion.com/insight/a-fusion-first-realta-demos-direct-energy-conversion/)


### MAG_REALTA_TIMELINE — Timeline

Realta Fusion. Undated live page. company primary.

[https://realtafusion.com/timeline/](https://realtafusion.com/timeline/)


### MAG_ES_DEVICES — Devices

Energy Singularity. Undated live page. company primary.

[https://energysingularity.cn/en/devices.html](https://energysingularity.cn/en/devices.html)


### MAG_ES_PULSE — HH70 achieves a 1,337-second plasma discharge

Energy Singularity. Published 2026-02-02. company primary.

[https://energysingularity.cn/en/news/news-001.html](https://energysingularity.cn/en/news/news-001.html)


### MAG_ES_MAGNET — Energy Singularity develops 26.7-tesla cryogen-free insulated HTS magnet

Energy Singularity. Published 2026-06-17. company primary.

[https://energysingularity.cn/en/news/index.php/2026/06/17/energy-singularity-develops-26-7-tesla-cryogen-free-insulated-hts-magnet-breaking-two-world-records/](https://energysingularity.cn/en/news/index.php/2026/06/17/energy-singularity-develops-26-7-tesla-cryogen-free-insulated-hts-magnet-breaking-two-world-records/)


### MAG_ES_SEED — Energy Singularity completes nearly RMB 400 million seed financing

Energy Singularity. Published 2022-02-26. company primary.

[https://energysingularity.cn/news/news-059.html](https://energysingularity.cn/news/news-059.html)


### MAG_ES_PREA — Energy Singularity raises nearly RMB400 million in Series Pre-A funding

Energy Singularity. Published 2023-04-30. company primary.

[https://energysingularity.cn/en/news/news-047.html](https://energysingularity.cn/en/news/news-047.html)


### MAG_KYOTO_FUND — Kyoto Fusioneering announces Series D first close and new credit facilities

Kyoto Fusioneering. Published 2026-08-24. company primary.

[https://kyotofusioneering.com/en/news/2026/08/24/4350](https://kyotofusioneering.com/en/news/2026/08/24/4350)


### MAG_KYOTO_HQ — Kyoto Fusioneering relocates headquarters to Tokyo

Kyoto Fusioneering. Published 2025-01-08. company primary.

[https://kyotofusioneering.com/en/news/2025/01/08/2807](https://kyotofusioneering.com/en/news/2025/01/08/2807)


### MAG_NTTAO_FUND — nT-Tao raises $22M Series A to ensure a secure clean energy future

nT-Tao / PR Newswire. Published 2023-02-01. company press release.

[https://www.prnewswire.com/news-releases/nt-tao-raises-22m-series-a-to-ensure-a-secure-clean-energy-future-with-a-compact-and-scalable-nuclear-fusion-solution-301735890.html](https://www.prnewswire.com/news-releases/nt-tao-raises-22m-series-a-to-ensure-a-secure-clean-energy-future-with-a-compact-and-scalable-nuclear-fusion-solution-301735890.html)


### MAG_NTTAO_POWER — nT-Tao deploys 50 MW pulsed-power subsystem to drive fusion prototype toward next temperature milestone

nT-Tao / GlobeNewswire. Published 2026-09-15. company press release.

[https://www.globenewswire.com/news-release/2026/09/15/3362276/0/en/nt-tao-deploys-50-mw-pulsed-power-subsystem-to-drive-fusion-prototype-toward-next-temperature-milestone.html](https://www.globenewswire.com/news-release/2026/09/15/3362276/0/en/nt-tao-deploys-50-mw-pulsed-power-subsystem-to-drive-fusion-prototype-toward-next-temperature-milestone.html)


### MAG_NTTAO_TECH — nT-Tao Technology

nT-Tao. Undated live page. company primary.

[https://www.nt-tao.com/nt-tao-technology](https://www.nt-tao.com/nt-tao-technology)


### MAG_NTTAO_FAQ — Frequently asked questions

nT-Tao. Undated live page. company primary.

[https://www.nt-tao.com/faq](https://www.nt-tao.com/faq)


### MAG_HELICAL_FUND_EN — Fuji Electric joins Helical Fusion as Series B second close raises JPY 3.23 billion

Helical Fusion. Published 2026-10-08. company primary.

[https://global.helicalfusion.com/post/fuji-electric-joins-helical-fusion-as-strategic-investor-and-official-partner-as-series-b-second-clo](https://global.helicalfusion.com/post/fuji-electric-joins-helical-fusion-as-strategic-investor-and-official-partner-as-series-b-second-clo)

Source note: The Japanese release, updated 9 October, instead gives ¥13.05 billion cumulative funding. Use the newer Japanese total and disclose the discrepancy.


### MAG_HELICAL_FUND_JP — Helical Fusion Series B second close: ¥3.23 billion; cumulative funding ¥13.05 billion

Helical Fusion. Published 2026-10-08. company primary.

[https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86](https://www.helicalfusion.com/post/helical-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAb%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89-2nd%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%BA32-3%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%81%A7%E7%99%BA%E9%9B%BB%E3%81%AB%E5%90%91%E3%81%91%E3%81%9F%E9%96%8B%E7%99%BA%E3%83%BB%E5%AE%9F%E8%A8%BC%E3%82%92%E5%8A%A0%E9%80%9F%E3%80%81%E7%B4%AF%E8%A8%88%E8%AA%BF%E9%81%94%E9%A1%8D%E3%81%AF130-5%E5%84%84%E5%86%86)


### MAG_HELICAL_TECH — Technology

Helical Fusion. Undated live page. company primary.

[https://global.helicalfusion.com/technology](https://global.helicalfusion.com/technology)


### MAG_HELICAL_MANUFACTURE — Helical Fusion completes a new coil manufacturing machine with Sugino Machine

Helical Fusion. Published 2026-02-05. company primary.

[https://global.helicalfusion.com/post/helical-fusion-completes-a-new-coil-manufacturing-machine-for-its-integrated-demonstration-device-in](https://global.helicalfusion.com/post/helical-fusion-completes-a-new-coil-manufacturing-machine-for-its-integrated-demonstration-device-in)


### MAG_HELICAL_HQ — Company

Helical Fusion. Undated live page. company primary.

[https://global.helicalfusion.com/company](https://global.helicalfusion.com/company)


### MAG_FIA_2026 — The Global Fusion Industry Report 2026

Fusion Industry Association. Published 2026-07-13. industry survey primary.

[https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf](https://www.fusionindustryassociation.org/wp-content/uploads/2026/07/FIA-Industry-report-2026_d9.pdf)

Source note: Self-reported Q2 2026 survey. Corporate totals may mix financing categories. Local PDF read; later company releases supersede stale survey figures. Keep derived copy across final report terse.


### ALT_INERTIA_FUND — Inertia raises $450 million to commercialize the only proven fusion science

Inertia Enterprises via GlobeNewswire. Published 2026-02-11. company primary.

[https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html](https://www.globenewswire.com/news-release/2026/02/11/3236274/0/en/inertia-raises-450-million-to-commercialize-the-only-proven-fusion-science.html)


### ALT_INERTIA_GAIN — How much fusion energy or gain do you need

Inertia Enterprises. Undated live page. company primary.

[https://inertia.com/faq/how-much-fusion-energy-or-gain-do-you-need/](https://inertia.com/faq/how-much-fusion-energy-or-gain-do-you-need/)


### ALT_INERTIA_MODEL — Inertia target design for grid-scale energy validated by ignition-benchmarked fusion codes

Inertia Enterprises. Undated live page. company primary.

[https://inertia.com/press/models-confirm-fuel-target-design](https://inertia.com/press/models-confirm-fuel-target-design)


### ALT_INERTIA_PAPER — Indirect-Drive Fusion Target Design for Commercial Fusion Energy

Weber et al and Inertia Collaboration / arXiv. Published 2026-09-17. research preprint.

[https://arxiv.org/abs/2609.19752](https://arxiv.org/abs/2609.19752)


### ALT_INERTIA_HOME — Inertia commercial fusion overview

Inertia Enterprises. Undated live page. company primary.

[https://inertia.com/](https://inertia.com/)


### ALT_INERTIA_PHASE1 — Defining Success: Inertia Phase 1 Commercial Roadmap

Inertia Enterprises. Undated live page. company primary.

[https://inertia.com/press/commercial-roadmap-phase-1](https://inertia.com/press/commercial-roadmap-phase-1)


### ALT_INERTIA_FUELING — Fueling breakthrough for fusion energy brings production time from days to minutes

Inertia Enterprises. Undated live page. company primary.

[https://inertia.com/press/inertia-fast-fueling](https://inertia.com/press/inertia-fast-fueling)


### ALT_PACIFIC_FOUND — Introducing Pacific Fusion

Pacific Fusion. Published 2024-10-25. company primary.

[https://www.pacificfusion.com/resources/founders-letter](https://www.pacificfusion.com/resources/founders-letter)


### ALT_PACIFIC_MODULE — Validating the next building block toward affordable fusion power

Pacific Fusion. Published 2026-06-02. company primary.

[https://www.pacificfusion.com/resources/validating-the-next-building-block-toward-affordable-fusion-power](https://www.pacificfusion.com/resources/validating-the-next-building-block-toward-affordable-fusion-power)


### ALT_PACIFIC_CAPITAL — Lawrence Livermore Pacific Fusion collaboration breaks new record

Pacific Fusion. Published 2026-07-16. company primary.

[https://www.pacificfusion.com/resources/lawrence-livermore-pacific-fusion-collaboration-breaks-new-record-to-advance-america-s-high-gain-fusion-capability](https://www.pacificfusion.com/resources/lawrence-livermore-pacific-fusion-collaboration-breaks-new-record-to-advance-america-s-high-gain-fusion-capability)


### ALT_PACIFIC_SITE — Pacific Fusion breaks ground on first-of-a-kind fusion facility in New Mexico

Pacific Fusion. Published 2026-08-25. company primary.

[https://www.pacificfusion.com/resources/pacific-fusion-breaks-ground-on-first-of-a-kind-fusion-facility-in-new-mexico](https://www.pacificfusion.com/resources/pacific-fusion-breaks-ground-on-first-of-a-kind-fusion-facility-in-new-mexico)


### ALT_PACIFIC_LOC — Locations

Pacific Fusion. Undated live page. company primary.

[https://www.pacificfusion.com/locations](https://www.pacificfusion.com/locations)


### ALT_XCIMER_FUND — Xcimer Raises $100 Million to Put Inertial Fusion Energy on Path to Commercialization

Xcimer via Business Wire. Published 2024-06-04. company primary.

[https://www.businesswire.com/news/home/20240604168571/en/Xcimer-Raises-$100-Million-to-Put-Inertial-Fusion-Energy-on-Path-to-Commercialization](https://www.businesswire.com/news/home/20240604168571/en/Xcimer-Raises-$100-Million-to-Put-Inertial-Fusion-Energy-on-Path-to-Commercialization)


### ALT_XCIMER_ROADMAP — Energy and roadmap

Xcimer Energy. Undated live page. company primary.

[https://xcimer.energy/energy/](https://xcimer.energy/energy/)


### ALT_XCIMER_FAQ — Xcimer frequently asked questions

Xcimer Energy. Undated live page. company primary.

[https://xcimer.energy/faq/](https://xcimer.energy/faq/)


### ALT_XCIMER_DOE — DOE approves Xcimer preconceptual design and technology roadmap milestone

Xcimer Energy. Published 2026-06-10. company primary.

[https://xcimer.energy/news/u-s-department-of-energy-approves-xcimers-fusion-power-plant-preconceptual-design-and-technology-roadmap-milestone/](https://xcimer.energy/news/u-s-department-of-energy-approves-xcimers-fusion-power-plant-preconceptual-design-and-technology-roadmap-milestone/)


### ALT_FOCUSED_FUND — Focused Energy $240 Million Series A

Focused Energy. Published 2026-05-27. company primary.

[https://www.focused-energy.co/news-release/focused-energy-sets-a-new-benchmark-240-million-for-the-largest-series-a-financing-in-the-global-fusion-industry](https://www.focused-energy.co/news-release/focused-energy-sets-a-new-benchmark-240-million-for-the-largest-series-a-financing-in-the-global-fusion-industry)


### ALT_FOCUSED_TECH — LightHouse Laser Fusion System

Focused Energy. Undated live page. company primary.

[https://www.focused-energy.co/technology/lighthouse](https://www.focused-energy.co/technology/lighthouse)


### ALT_FOCUSED_EXP — Focused Energy completes first DOE milestones

Focused Energy. Published 2024-11-14. company primary.

[https://www.focused-energy.co/news-release/focused-energy-completes-its-first-milestones-through-does-milestone-based-fusion-development-program](https://www.focused-energy.co/news-release/focused-energy-completes-its-first-milestones-through-does-milestone-based-fusion-development-program)


### ALT_FOCUSED_ROADMAP — Focused Energy roadmap

Focused Energy. Undated live page. company primary.

[https://www.focused-energy.co/](https://www.focused-energy.co/)


### ALT_GENERAL_TEMP — General Fusion achieves 1 keV electron temperature milestone

General Fusion. Published 2026-10-08. company primary.

[https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/](https://generalfusion.com/post/general-fusion-achieves-world-first-1-kev-electron-temperature-milestone-on-its-path-to-commercial-fusion-power/)


### ALT_GENERAL_LIST — General Fusion becomes publicly listed

General Fusion. Published 2026-07-13. company primary.

[https://generalfusion.com/post/general-fusion-becomes-first-publicly-listed-fusion-company/](https://generalfusion.com/post/general-fusion-becomes-first-publicly-listed-fusion-company/)


### ALT_GENERAL_PATH — Path to commercialization

General Fusion. Undated live page. company primary.

[https://generalfusion.com/path-to-commercialization/](https://generalfusion.com/path-to-commercialization/)


### ALT_GENERAL_PAPER — The science of compressional heating on the LM26 magnetized target fusion experiment

S. J. Howard et al / arXiv. Published 2026-06-22. research preprint.

[https://arxiv.org/abs/2606.23974](https://arxiv.org/abs/2606.23974)


### ALT_GENERAL_LOC — Contact General Fusion

General Fusion. Undated live page. company primary.

[https://generalfusion.com/about/contact-us/](https://generalfusion.com/about/contact-us/)


### ALT_ZAP_FUND — Zap attracts $130M as demo system begins operations

Zap Energy. Published 2024-10-09. company primary.

[https://legacy.zapenergy.com/news/zap-attracts-130m-as-demo-system-begins-operations](https://legacy.zapenergy.com/news/zap-attracts-130m-as-demo-system-begins-operations)


### ALT_ZAP_PRESSURE — Zap exceeds gigapascal plasma pressures on FuZE-3

Zap Energy. Published 2025-11-17. company primary.

[https://www.zapenergy.com/updates/2025/11/zap-energy-exceeds-gigapascal-fusion-plasma-pressures-on-new-fusion-device-fuze-3](https://www.zapenergy.com/updates/2025/11/zap-energy-exceeds-gigapascal-fusion-plasma-pressures-on-new-fusion-device-fuze-3)


### ALT_ZAP_STRATEGY — Zap advances integrated nuclear strategy

Zap Energy. Published 2026-04-29. company primary.

[https://www.zapenergy.com/updates/2026/04/zap-energy-advances-integrated-nuclear-strategy-and-appoints-zabrina-johal-as-ceo](https://www.zapenergy.com/updates/2026/04/zap-energy-advances-integrated-nuclear-strategy-and-appoints-zabrina-johal-as-ceo)


### ALT_ZAP_LOC — Zap contact address

Zap Energy. Undated live page. company primary.

[https://www.zapenergy.com/privacy-policy](https://www.zapenergy.com/privacy-policy)


### ALT_FIRSTLIGHT_FUND — First Light announces £25 million first close

First Light Fusion. Published 2026-04-21. company primary.

[https://firstlightfusion.com/media/first-light-fusion-announces-25m-successful-first-close-of-new-funding-round-with-investments-from-starmaker-one-ukaea/](https://firstlightfusion.com/media/first-light-fusion-announces-25m-successful-first-close-of-new-funding-round-with-investments-from-starmaker-one-ukaea/)


### ALT_FIRSTLIGHT_TEST — First Light demonstrates FLARE compression principle

First Light Fusion. Published 2026-09-22. company primary.

[https://firstlightfusion.com/media/first-light-fusion-achieves-major-step-forward-for-flare-proving-key-low-cost-fusion-principle/](https://firstlightfusion.com/media/first-light-fusion-achieves-major-step-forward-for-flare-proving-key-low-cost-fusion-principle/)


### ALT_FIRSTLIGHT_TECH — First Light FLARE technology

First Light Fusion. Undated live page. company primary.

[https://firstlightfusion.com/technology/](https://firstlightfusion.com/technology/)


### ALT_MARVEL_FUND — Marvel extends Series B to EUR113m

Marvel Fusion. Published 2025-03-27. company primary.

[https://www.marvelfusion.com/newsroom/marvel-fusion-extends-series-b-to-eur-113m-with-commitments-from-eqt-ventures-siemens-energy-and-european-innovation-council-eic-fund](https://www.marvelfusion.com/newsroom/marvel-fusion-extends-series-b-to-eur-113m-with-commitments-from-eqt-ventures-siemens-energy-and-european-innovation-council-eic-fund)


### ALT_MARVEL_TECH — Marvel technology and roadmap

Marvel Fusion. Undated live page. company primary.

[https://www.marvelfusion.com/technology](https://www.marvelfusion.com/technology)


### ALT_MARVEL_SITE — Marvel Colorado Siemens Energy letter of intent

Marvel Fusion. Published 2026-08-12. company primary.

[https://www.marvelfusion.com/newsroom/marvel-fusion-the-state-of-colorado-and-siemens-energy-sign-letter-of-intent](https://www.marvelfusion.com/newsroom/marvel-fusion-the-state-of-colorado-and-siemens-energy-sign-letter-of-intent)


### ALT_AVALANCHE_FUND — Avalanche raises $29 million following plasma physics breakthroughs

Avalanche Energy. Published 2026-02-03. company primary.

[https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs](https://www.avalanchefusion.com/news-release/avalanche-energy-raises-29-million-following-plasma-physics-breakthroughs)


### ALT_AVALANCHE_TECH — Orbitron

Avalanche Energy. Undated live page. company primary.

[https://www.avalanchefusion.com/orbitron](https://www.avalanchefusion.com/orbitron)


### ALT_AVALANCHE_GRANT — Avalanche awarded $10 million state grant

Avalanche Energy. Published 2025-07-23. company primary.

[https://www.avalanchefusion.com/news-release/avalanche-energy-awarded-10-million-grant-from-washington-state-to-develop-fusionwerx-neutron-factory](https://www.avalanchefusion.com/news-release/avalanche-energy-awarded-10-million-grant-from-washington-state-to-develop-fusionwerx-neutron-factory)


### ALT_EXFUSION_A — EX-Fusion raises approximately JPY 2.6 billion Series A

EX-Fusion. Published 2025-06-05. company primary.

[https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BA-a-%E3%81%A7%E7%B7%8F%E9%A1%8D%E7%B4%84-26-%E5%84%84%E5%86%86%E3%81%AE%E8%B3%87%E9%87%91%E8%AA%BF%E9%81%94%E3%82%92%E5%AE%9F%E6%96%BD)


### ALT_EXFUSION_EXT — EX-Fusion Series A extension JPY 0.4 billion

EX-Fusion. Published 2025-10-14. company primary.

[https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94](https://ex-fusion.com/news/ex-fusion%E3%80%81%E3%82%B7%E3%83%AA%E3%83%BC%E3%82%BAa%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89%EF%BC%88%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%86%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%81%A7%EF%BC%94)


### ALT_EXFUSION_TEST — EX-Fusion demonstrates continuous 10 Hz laser irradiation of surrogate fuel

EX-Fusion. Published 2025-07-01. company primary.

[https://ex-fusion.com/news/%E4%B8%96%E7%95%8C%E5%88%9D%E3%80%811%E7%A7%92%E9%96%93%E3%81%AB10%E5%9B%9E%E3%80%81%E6%A8%A1%E6%93%AC%E7%87%83%E6%96%99%E3%81%AB%E5%AF%BE%E3%81%99%E3%82%8B%E3%83%AC%E3%83%BC%E3%82%B6%E3%83%BC](https://ex-fusion.com/news/%E4%B8%96%E7%95%8C%E5%88%9D%E3%80%811%E7%A7%92%E9%96%93%E3%81%AB10%E5%9B%9E%E3%80%81%E6%A8%A1%E6%93%AC%E7%87%83%E6%96%99%E3%81%AB%E5%AF%BE%E3%81%99%E3%82%8B%E3%83%AC%E3%83%BC%E3%82%B6%E3%83%BC)


### ALT_EXFUSION_LOC — Company

EX-Fusion. Undated live page. company primary.

[https://ex-fusion.com/company](https://ex-fusion.com/company)


### ALT_HB11_TECH — HB11 laser-boron technology

HB11 Energy. Undated live page. company primary.

[https://hb11.energy/our-technology/](https://hb11.energy/our-technology/)


### ALT_HB11_PAPER — Hydrogen boron fusion in confined geometries

Tosca et al / High Power Laser Science and Engineering. Published 2025-07-18. peer reviewed paper.

[https://hb11.energy/wp-content/uploads/2025/08/hydrogen-boron-fusion-in-confined-geometries_20250718.pdf](https://hb11.energy/wp-content/uploads/2025/08/hydrogen-boron-fusion-in-confined-geometries_20250718.pdf)


### ALT_HB11_PROJECT — HB11 $22 million laser project

HB11 Energy. Published 2022-05-03. company primary.

[https://hb11.energy/2022/05/03/hb11-energy-awarded-22m-laser-project-to-build-sovereign-nuclear-fusion-energy-capabilities/](https://hb11.energy/2022/05/03/hb11-energy-awarded-22m-laser-project-to-build-sovereign-nuclear-fusion-energy-capabilities/)


### ALT_FUSE_TEST — Fifth Gait shot campaign on Fuse FAETON

Fuse Energy Technologies. Published 2025-04-08. company primary.

[https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign)


### ALT_FUSE_CONCEPT — Apeiron I concept

Fuse Energy Technologies. Undated live page. company primary.

[https://www.f.energy/apeiron-i-fusion-energy-plant](https://www.f.energy/apeiron-i-fusion-energy-plant)


### ALT_FUSE_HOME — Fuse overview

Fuse Energy Technologies. Undated live page. company primary.

[https://www.f.energy/](https://www.f.energy/)


### PAR_FIA_RELEASE — Fusion Industry Attracts Record Annual Funding of 4.48bn Raising Total to 14.24bn

Fusion Industry Association. Published 2026-07-13. industry survey.

[https://www.fusionindustryassociation.org/fusion-industry-attracts-record-annual-funding-of-4-48bn-raising-total-to-14-24bn/](https://www.fusionindustryassociation.org/fusion-industry-attracts-record-annual-funding-of-4-48bn-raising-total-to-14-24bn/)


### PAR_F4E_REPORT — Global Fusion Energy Trends

Fusion for Energy. Published 2026-07-15. institutional analysis.

[https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf](https://fusionforenergy.europa.eu/wp-content/uploads/2026/07/F4E_Observatory-Global_Fusion_Energy_Trends_1st_Edition-1.pdf)


### PAR_F4E_RELEASE — F4E publishes the first Global Fusion Energy Trends report

Fusion for Energy. Published 2026-07-15. institutional analysis.

[https://fusionforenergy.europa.eu/news/f4e-publishes-the-first-global-fusion-energy-trends-report/](https://fusionforenergy.europa.eu/news/f4e-publishes-the-first-global-fusion-energy-trends-report/)


### PAR_DOE_ROADMAP — Energy Department Releases Finalized Fusion Science and Technology Roadmap to Accelerate Commercial Fusion Power

US Department of Energy. Published 2026-06-09. government program.

[https://www.energy.gov/articles/energy-department-releases-finalized-fusion-science-and-technology-roadmap-accelerate](https://www.energy.gov/articles/energy-department-releases-finalized-fusion-science-and-technology-roadmap-accelerate)


### PAR_STEP_STRATEGY — UK Fusion Energy Ltd Strategy

UK Fusion Energy. Published 2026-04-20. government program.

[https://www.gov.uk/government/publications/uk-fusion-energy-ltd-ukfe-strategy/uk-fusion-energy-ltd-strategy-accessible-version](https://www.gov.uk/government/publications/uk-fusion-energy-ltd-ukfe-strategy/uk-fusion-energy-ltd-strategy-accessible-version)


### PAR_UK_STRATEGY — A new energy revolution The UK plan for delivering fusion energy

UK Department for Energy Security and Net Zero. Published 2026-03-16. government program.

[https://www.gov.uk/government/publications/uk-fusion-strategy-2026/a-new-energy-revolution-the-uks-plan-for-delivering-fusion-energy-accessible-webpage](https://www.gov.uk/government/publications/uk-fusion-strategy-2026/a-new-energy-revolution-the-uks-plan-for-delivering-fusion-energy-accessible-webpage)


### PAR_STEP_PARTNERS — New UK Fusion Energy strategy maps path to commercial fusion

UK Fusion Energy. Published 2026-04-14. government program.

[https://www.gov.uk/government/news/new-uk-fusion-energy-strategy-maps-path-to-commercial-fusion](https://www.gov.uk/government/news/new-uk-fusion-energy-strategy-maps-path-to-commercial-fusion)


### PAR_BEST_PLAN — EUROfusion and ASIPP have released the BEST Research Plan

EUROfusion. Published 2025-11-27. project partner report.

[https://euro-fusion.org/eurofusion-news/eurofusion-asipp-best-research-plan/](https://euro-fusion.org/eurofusion-news/eurofusion-asipp-best-research-plan/)

Access note: Complete partner release text available in search retrieval; direct web and PDF fetch intermittently unavailable. F4E July 2026 review corroborates role and location.


### PAR_STARTORUS_A_PLUS — Startorus Fusion Secures 500 Million Series A Financing Cumulative Funding Exceeds 2 Billion

Startorus Fusion. Published 2026-05-07. company report.

[https://www.startorus.com/company-news/453.html](https://www.startorus.com/company-news/453.html)


### PAR_STARTORUS_A_PLUS_PLUS — Startorus Fusion Completes A New Round of Financing of 880 Million Yuan

Startorus Fusion. Published 2026-08-08. company report.

[https://www.startorus.com/company-news/484.html](https://www.startorus.com/company-news/484.html)


### PAR_STARTORUS_MAGNET — Startorus Fusion Completes 20K Cryogenic Energization Test of Full Scale HTS Toroidal Field Magnet

Startorus Fusion. Published 2026-06-11. company report.

[https://startorus.com/progress-news/473.html](https://startorus.com/progress-news/473.html)


### PAR_IAEA_FFDB — Fusion Facility Database

International Atomic Energy Agency. Undated live page. institutional database.

[https://nucleus.iaea.org/sites/fusion-portal/SitePages/FFDB.aspx?web=1](https://nucleus.iaea.org/sites/fusion-portal/SitePages/FFDB.aspx?web=1)


### PAR_EXISTING_SITES — Jason Willems Sites

Jason Willems. Undated live page. user reference.

[https://www.jasonwillems.com/sites/](https://www.jasonwillems.com/sites/)


### PAR_OPENSTAR_PPPL — OpenStar Technologies and PPPL are building partnership to advance fusion energy

Princeton Plasma Physics Laboratory. Published 2026-09-29. project partner report.

[https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy](https://www.pppl.gov/news/2026/openstar-technologies-and-pppl-are-building-partnership-advance-fusion-energy)


### PAR_OPENSTAR_LOAN — Government backs fusion energy research

New Zealand Government. Published 2026-02-04. government funding announcement.

[https://www.beehive.govt.nz/release/government-backs-fusion-energy-research](https://www.beehive.govt.nz/release/government-backs-fusion-energy-research)


### PAR_OPENSTAR_TECH — OpenStar Technical Resources

OpenStar Technologies. Undated live page. company technical library.

[https://www.openstar.tech/technical-resources](https://www.openstar.tech/technical-resources)


### PAR_OPENSTAR_TEAM — OpenStar Who we are

OpenStar Technologies. Undated live page. company report.

[https://www.openstar.tech/team](https://www.openstar.tech/team)


### PHY_044 — The Sandia-NM Tritium Story: Capabilities and R&D

Sandia National Laboratories / US Department of Energy. Published 2018-10-23. national laboratory presentation.

[https://www.energy.gov/sites/prod/files/2019/06/f63/The-Sandia-New-Mexico-Tritium-Story-Capabilities-and-R-and-D.pdf](https://www.energy.gov/sites/prod/files/2019/06/f63/The-Sandia-New-Mexico-Tritium-Story-Capabilities-and-R-and-D.pdf)

Locator: Slide 2 (PDF page 2).


### PAR_XCIMER_HDD — Hybrid direct drive with a two-sided ultraviolet laser

Thomas and collaborators, including Xcimer; Physics of Plasmas. Published 2024-11-27. peer reviewed design and simulation.

[https://pubs.aip.org/aip/pop/article/31/11/112708/3322685/Hybrid-direct-drive-with-a-two-sided-ultraviolet](https://pubs.aip.org/aip/pop/article/31/11/112708/3322685/Hybrid-direct-drive-with-a-two-sided-ultraviolet)


### PAR_EXFUSION_TECH — Research and Knowledge

EX-Fusion. Undated live page. company technical explainer.

[https://ex-fusion.com/technology/knowledge](https://ex-fusion.com/technology/knowledge)


# Appendix F — Complete implementation specification


## Purpose and fixed content contract

Build an interactive editorial explainer titled **The paths to fusion power** within the existing sites collection. The project name is **Fusion Atlas** and the suggested path is `/sites/fusion/`. Use the supplied research snapshot dated 22 October 2026. The implementation task is to turn the provided content and records into responsive visual explanations. No further research is needed for the initial release.

Read `01_RESEARCH_REPORT.md`, `04_DATA_DICTIONARY.md` and `data/fusion_atlas.json` before building. Treat `data/fusion_atlas.json` as the canonical content source. Individual JSON files in `data/` are convenience views of the same snapshot. Do not hardcode a second collection of facts in components. Source IDs connect records to citations and source drawers. The model examples are deliberately explicit about assumptions.

Preserve unknown values, evidence categories, event types, date precision and qualifications. A publication or financing date is not necessarily an experiment date. A field named `last_reviewed_at` means that a source was reviewed, not that the underlying company result was independently verified. Never upgrade the evidence type based on the source being official.

## Audience and visual direction

The primary reader is curious and technically comfortable but has no plasma-physics background. Provide a clear first read in five to eight minutes, with depth available on demand. The goal is recognition and understanding, not an imitation of a reactor control panel.

Use the existing host site's navigation, typography and shared shell if a repository is provided. Preserve the conventions of the mathematical-frontiers and Kurzweil projects: restrained editorial layout, explicit snapshot dates, direct links to evidence and a useful methodology section. If starting without the host repository, use a light background, dark text, one clear heading family and an ordinary readable body font. A suggested neutral palette is background `#F5F5F2`, text `#14212B`, muted text `#52616C`, magnetic family `#2167A8`, inertial family `#A2472C`, hybrid family `#7758A6`, and neutral/source lines `#89959E`. These are design choices, not scientific categories.

Use original SVG or Canvas diagrams. Scientific schematics need exact labels and editable geometry. Do not use generated raster art to explain fields, reactions or accounting. Do not copy company renderings into the site without a separate rights decision. Logos are unnecessary; the company name and mechanism thumbnail are sufficient.

Family colors must stay consistent across diagrams, filters, cards and map markers. Evidence type needs a separate encoding: solid marker for an experimental observation, outlined marker for a model, dashed marker for a target, and a neutral symbol for unavailable data. Pair every encoding with words. A color alone must never carry the distinction between measured and planned.

## Information architecture

| Section | Reader learns | Main interaction | Default content |
| --- | --- | --- | --- |
| Introduction | The difference between a reaction and an integrated power plant | Step through an energy path | D-T reaction and thermal conversion |
| Brief history | Which questions successive experiments answered | Select a dated milestone | Six to eight key events, expandable |
| Approaches | Why machines have different shapes and tradeoffs | Switch mechanism, scrub stages, compare two | Tokamak, stellarator and laser indirect drive |
| Reading the results | How gain and records should be interpreted | Change accounting boundary; adjust toy model | NIF, ITER, electrical recovery |
| Landscape | Who is building what and where | Filter, map/list, compare up to three | Curated developers, with public/supplier layers optional |
| What remains | Which evidence would reduce the uncertainties | Select a risk theme | Six-theme overview, details on demand |
| Sources and methodology | Where facts and judgments come from | Search sources and download data | Snapshot, scope and definitions |

A compact local navigation can use Learn, Approaches, Results, Landscape and Sources. Keep the first screen legible without animation. The default hero should show a simple annotated machine or energy flow with a visible “Explore the approaches” button. Do not make the funding total the main headline.

## Interaction contracts

### Introductory reaction and energy flow

Create a six-step scene with explicit Back, Next and Play/Pause controls. Scroll may select a scene, but every scene must work through ordinary buttons and keyboard input. The selected step remains readable when motion is disabled.

1. **Fuel:** one deuterium nucleus and one tritium nucleus, with correct proton/neutron counts. Copy: “Many fusion projects use deuterium and tritium, two forms of hydrogen.”
2. **Conditions:** particles sit in a schematic plasma; reveal temperature, density and heat retention as three requirements. Copy: “The fuel must react often enough before energy escapes.”
3. **Reaction:** one helium nucleus and one neutron leave the collision. Show 3.5 MeV and 14.1 MeV, with a 17.6 MeV total. The animation is schematic, not an orbit or cross-section simulation.
4. **Blanket:** neutrons enter a blanket while charged helium can heat the plasma. Copy: “A D-T plant must capture neutron energy and replenish its tritium fuel.”
5. **Conversion:** heat moves to a turbine/generator; a thermal loss branch stays visible. Copy: “Only part of the captured heat becomes electricity.”
6. **Plant boundary:** reveal electricity returning to plant systems and the remainder available for export. Copy: “A useful plant must generate more electricity than all of its systems consume.”

Draw field lines as paths, particle tracks as distinct dashed trails, heat as labelled flow arrows and electricity as a separate color/style. Never depict magnetic fields bending the neutron trajectory. Do not animate a closed fuel cycle with a green “solved” checkmark; it is a requirement of the proposed plant.

The 80% neutron / 20% alpha split describes the initial reaction-energy partition, not the efficiency of electricity generation. Charged-product energy first heats the plasma and can subsequently leave through exhaust and radiation. Keep the assumed heat-capture fraction and heat-to-electric efficiency as separate stages rather than silently discarding or double-counting that energy.

### Mechanism explorer

Each approach has a common layout: name and plain-language mechanism; diagram with stage controls; “What this could simplify”; “What still needs to be demonstrated”; linked experiments and companies; sources. Use the source-backed mechanism and explicit interpretation from `approaches.json`.

Provide a family selector and an advanced “Show all configurations” list. Spherical tokamaks are a tokamak variant; HTS is a technology attribute. FRC variants need separate steps. Suppliers and public materials facilities do not receive invented reactor diagrams.

The default comparison is two approaches side by side at desktop width. On mobile use a labelled swap control or two stacked diagrams; never compress labels until they become unreadable. The scale of every schematic is explicitly “not to scale.” A shared visual footprint is for comparison of mechanisms, not physical reactor dimensions.

### Detailed diagram storyboard

| Approach | Geometry and sequence | Visible components | Scientific constraint |
| --- | --- | --- | --- |
| Tokamak | Torus; energize external coils; induce or drive plasma current; reveal helical field; show heating and exhaust | Plasma, toroidal coils, solenoid, poloidal field contribution, divertor, blanket | A field line is not a rigid wall or an electron orbit; current drive and external fields both matter |
| Spherical tokamak | Same sequence with tight central hole and elongated cross-section | Compact central column, shielding/magnet space, exhaust | Do not claim size alone proves better economics |
| Stellarator | Reveal external magnets; field lines wind around a three-dimensional plasma; add sustained heating | Modular coils or the selected design's planar-coil architecture, plasma surface, exhaust, blanket | Three-dimensional field shaping does not require every coil to be nonplanar; do not impose W7-X geometry on every company |
| Mirror | Long chamber; increase field at both throats; heat plasma; show end-loss particles and possible recovery | End magnets, central plasma, injectors, collectors | Some particles escape; loss reduction and recovery are different tasks |
| Levitated dipole | Float ring in chamber; draw dipole field; plasma surrounds ring; show ring protection | Internal superconducting ring, external support/levitation, shielding, chamber | Magnet is inside the chamber; proposed plant protection is not a demonstrated reactor lifetime |
| Beam-sustained FRC | Form compact FRC; add neutral beams; sustain population and field configuration | FRC separatrix, beam injectors, end regions | Do not reuse the pulsed colliding-plasma animation as the steady mechanism |
| Pulsed FRC | Form two configurations; accelerate/merge; compress; expand and recover; reset | Formation sections, coils, capacitor banks, recovery path | Draw recovered input and fusion contribution as separate annotations |
| Sheared-flow Z-pinch | Establish axial flow and current; show azimuthal magnetic field; pinch; reset | Electrodes, current path, axial velocity variation, plasma | Sheared flow is a stabilization technique, not a generic claim that instabilities are eliminated |
| Magnetized target | Form magnetized plasma; inject into compression chamber; liner moves inward; capture heat; reset | Plasma injector, liner or liquid metal, compression actuator | LM26 test geometry and future commercial geometry require distinct labels |
| Indirect-drive laser | Inject target; lasers heat hohlraum; X-rays ablate/compress capsule; fusion pulse; clear chamber | Laser ports, hohlraum, capsule, blanket, target injector | Do not show lasers hitting the fuel directly in this mode |
| Direct-drive laser | Target injection; symmetric illumination; ablation/compression; optional separate fast-ignition stage; clear chamber | Driver, capsule, optional ignition beam, optics and chamber | Fast ignition is an explicitly selected variant; rep-rate tests are not ignition tests |
| Hybrid direct-drive laser | Initial hohlraum X-ray stage; later direct laser drive; compression and proposed burn | Hohlraum, capsule, two-sided laser access | Xcimer design; not fast ignition or ordinary NIF indirect drive |
| Hybrid fast ignition | Electrical multi-shell compression; separate rapid ignition; proposed heat capture | Fuel-system module, compression driver, ignition stage, partner interfaces | First Light FLARE; do not invent MagLIF premagnetization or reuse its old projectile roadmap |
| Pulsed-power inertial | Charge modules; deliver current; compress target/liner; fusion pulse; replace/reset | Capacitors, transmission lines, liner, fuel, optional preheat | Use generic architecture only; Pacific, Fuse and MagLIF details differ |
| Electrostatic compact | Apply fields; accelerate/confine ions; show intended collision region | Electrodes/fields, ions, magnetic assistance where specified | Schematic is conceptual; small size is not evidence of net gain |

Apply company-specific configuration guards when selecting these storyboards. First Light's FLARE needs separate compression and ignition stages and its current fuel-system/partnered-reactor role; do not automatically depict it as the old projectile concept or ordinary direct-drive laser fusion. Marvel's current near-term fuel is D-T. HB11 belongs with laser proton–boron fast ignition, not electrostatic confinement. Fuse's existing neutron-testing device and proposed MagLIF energy concept require separate labels and evidence records. [ALT_FIRSTLIGHT_TECH](https://firstlightfusion.com/technology/) [ALT_MARVEL_TECH](https://www.marvelfusion.com/technology) [ALT_HB11_TECH](https://hb11.energy/our-technology/) [ALT_FUSE_TEST](https://www.f.energy/library/fifth-gait-technologies-completes-successful-shot-campaign) [ALT_FUSE_CONCEPT](https://www.f.energy/apeiron-i-fusion-energy-plant)

Xcimer uses the hybrid direct-drive storyboard. EX-Fusion uses the direct-drive fast-ignition variant described in its Japanese technology page. [PAR_XCIMER_HDD](https://pubs.aip.org/aip/pop/article/31/11/112708/3322685/Hybrid-direct-drive-with-a-two-sided-ultraviolet) [PAR_EXFUSION_TECH](https://ex-fusion.com/technology/knowledge)

Frame timings are presentational. A 500 ms animation does not represent a physical pulse duration. Label “slowed schematic” on pulsed scenes. Hovering a component should expose one sentence and an optional definition; clicking opens the fuller explanation. Never require hover on a touch screen.

### Gain boundaries and calculator

Implement the gain definitions before the sliders. The boundary selector highlights one of: fuel, target/plasma, conversion subsystem, whole plant. A source badge states exactly what each example measures. Include the NIF and ITER anchor examples and the fictional electrical-recovery example from the report.

Keep physical ignition separate from target-energy breakeven: the NIF timeline has an August 2021 physical-ignition result and a December 2022 target-gain-above-one result. The current NIF panel must also distinguish the 7 April 2025 listed maximum from the 20 June 2026 latest listed ignition. Show source-reported uncertainty when supplied; do not derive a statistical success rate from the count of ignition experiments.

For the toy calculator, put a persistent **Illustrative assumptions** label above controls. Use separate modes for a continuously heated plasma and a pulsed target. Read formula definitions and default values from `power_balance.json`. Render net output on a signed axis centered on zero, with gross generation and plant consumption separately labelled. A negative value should say “Net consumption.” A zero should say “Electrical break-even in this simplified model.”

Suggested input ranges are presentational and must not imply physical feasibility: Q or gain 0–100; heating 1–200 MW; delivered target energy 0.1–20 MJ; rate 0.1–20 Hz; driver efficiency 1–100%; thermal efficiency 10–60%; captured fraction 0–100%; auxiliary demand 0–500 MW. Advanced inputs can allow zero for edge-case demonstrations with proper guards. No division by zero or infinity should reach the display.

The auxiliary load excludes the driver demand already counted in the formula. In pulsed mode, driver demand is delivered target energy × repetition rate / driver efficiency, without multiplying by target gain. Reject zero driver efficiency; allow zero capture or zero thermal efficiency to produce zero gross output and the corresponding net consumption. A ratio or breakeven threshold with a zero denominator is unavailable even when net power itself remains well defined. Do not give recovered input-energy credit unless the matching supplied energy is included in the same complete-cycle boundary.

Do not portray zero external heating on a finite-Q slider as a model of ignition. A plasma with finite fusion power and zero external heating has no finite fusion-to-external-heating ratio; that limit requires a different physical model.

Provide Reset and Copy scenario link. Round displayed power to an appropriate precision, but compute from unrounded values. Put “These inputs are coupled in real machines” next to the controls. This is a bookkeeping demonstration, not a plasma simulator.

If showing Inertia's published roadmap accounting, place it in an **Attributed company model** tab. Use the explicit input assumptions and source snapshot in the company record. Do not silently use those values as the general default, and do not merge the older FAQ scenarios with the newer roadmap or target-design simulations. A “Virtual NIF Shot” is a simulation label.

### Records and history

Provide a metric selector with only compatible records in each panel. NIF target gain can form a shot series or a best-record step series; label the selected mode. A record-history line uses a running maximum of comparable measured shots. It does not connect future targets or substitute paper publication dates for experiment dates.

The supplied results are a curated selection, not every attempted shot. Label the chronological view “Selected published shots.” A running maximum is “Best gain among included shots” unless the included points have been checked against the complete published record progression. Do not interpolate shot success rates or imply that every omitted experiment succeeded.

Duration records use separate lanes for the stated regime. A long H-mode discharge, a high-temperature phase and a general plasma discharge should not share an unqualified “world record” line. JET's total fusion energy belongs in MJ; ITER's planned fusion power belongs in MW; proposed electricity uses MWe or explicitly labelled grid MW. Do not convert an energy result into average power unless the duration and interval support it.

The historical timeline can mix event types because it does not imply a numerical performance scale. Each event has a type label and date precision. Separate future targets into a dashed “Announced plans” lane to the right of the snapshot divider. A planned 2030s event should occupy a range, not a fabricated date on January 1.

### Landscape table and entity cards

Default filters: confinement family, intended fuel, country, entity role and evidence type. Search should match names, device names and places. A filter count must state whether it counts organizations or sites. Selecting a public laboratory should explain its research role rather than making it compete for a startup funding rank.

Compact row fields: organization, approach, intended fuel, latest included evidence, announced target, funding display with date, primary location and sources. On mobile show an accessible card/list instead of a horizontally truncated twelve-column table. Keep data downloads available without a filter-dependent surprise.

Expanded card sections:

- How it works, with the mechanism diagram or a link to it.
- Evidence ledger, with each item's category and source.
- Current experimental fuel and intended commercial fuel.
- Company targets, retaining their original scope and date precision.
- Locations, with separate roles and approximate positions.
- Financing, with each event's basis and conditions.
- Remaining questions, with editorial interpretation clearly labelled.

Allow comparison of up to three organizations. Require choosing either an evidence view or a funding view rather than automatically ranking them. The evidence view compares the six themes; the funding view preserves financing categories. An absent value stays “Not established in this record.”

Do not repeat a simulated target in the “Measured” section merely because it originally appeared in an input packet's `demonstrated` list. The normalized `claims` array and its `category` field govern rendering.

### Map

Use a simple geographic map or globe-free projection. One marker represents one location record. Shapes: circle for headquarters/company office; square for experimental facility; outlined diamond for announced power plant; hexagon for enabling, fuel-cycle or materials infrastructure. Use status outlines for operating, construction and planned. Unknown status remains unknown.

Coordinates are approximate city or area centers. Round to two decimals for display, use a modest maximum zoom, and label “Approximate location.” Do not offer turn-by-turn directions or imply exact plant boundaries. Multiple organizations or facilities in a city should cluster; selecting a cluster opens a list. The organization can have more than one marker. Its funding must not be counted once per marker.

Ship a local, attributed low-resolution world outline or use the host's existing licensed map asset. Include the attribution with the source file. The first release must work without an API key. The map must have a synchronized, keyboard-accessible list so it remains usable when WebGL, JavaScript or external tiles are unavailable.

### Financing

The authoritative financing object is an observation, not a transaction ledger with guaranteed cash disbursement. Render `amount`, original `currency`, `event_type`, `announcement_date`, amount qualifier, inclusion notes and source together. `amount_usd` is usable only when the source explicitly reports it, and should retain its approximate basis.

Never sum `cumulative_total` records with rounds, grants or other cumulative totals. A Series G announced at one size and later closed at another is one financing event with a revision, not two new rounds. A public programme allocation that includes a partner contract cannot be added to that same contract to create a sector total. A public cooperation-project budget is not necessarily money on one company's balance sheet.

Default to a table. For an optional chart, require both a currency and a funding-basis filter. Keep recent-round amounts and cumulative totals in separate panels. Commitments and debt are distinct from stated equity. Give valuations and commercial power contracts their own optional panels or leave them as context. Do not infer investor returns, cash runway or success from funding.

### Risk view

Use a matrix of evidence questions with a source-linked explanation. No composite risk number, probability of success, traffic-light verdict on a company, or radial score chart. Selecting a theme explains what evidence would reduce the uncertainty. For a company, show its specific claims and editorial assessment under the theme.

An interpretive label should read “Assessment” and include an `assessment_basis` or rationale. Do not label a row “independently verified” unless the record specifically establishes that. Relevant experiment, subsystem demonstration, model, target and insufficient public evidence are distinct classes. “Not applicable” is available only for a particular requirement; it is never a substitute for missing evidence.

## Data and component architecture

Suggested components: `SnapshotHeader`, `ReactionStepper`, `EnergyBoundaryExplorer`, `ApproachSelector`, `MechanismDiagram`, `RecordChart`, `HistoryTimeline`, `EntityExplorer`, `EntityDetail`, `ComparisonTray`, `SiteMap`, `FundingTable`, `RiskQuestions`, `SourceDrawer`, `Methodology` and `DataDownload`. These are implementation suggestions, not required library choices.

Use stable IDs in URLs. Example state: `?approach=stellarator&compare=cfs,proxima&tab=evidence`. Deep links should restore a readable state and source drawers must have ordinary URL anchors. Filter state can stay in the URL; there is no need for user accounts, a backend database or remote tracking.

Prefer the current repository's stack. If none is available, a static TypeScript frontend or vanilla HTML/CSS/JS implementation is sufficient. The dataset should ship with the build. Do not add a live-news ingestion service or a language-model runtime. Citations can open external pages; core explanations and filters should work offline after local assets load.

Keep numerical units in the data and labels. Do not store a formatted `$1B` string as the only quantitative representation. Preserve original source wording where its qualifier matters, but use the curated concise display text for rows.

## Accessibility and performance

All interactive controls require visible labels, keyboard operation, focus indication and sensible reading order. All diagrams need a short description and a longer text explanation matching the selected stage. Provide native tables for numerical charts and source lists. Respect `prefers-reduced-motion`; no motion is required to receive the explanation. Avoid flashing particle effects.

At a 390 px viewport, the narrative and primary controls must fit without horizontal page scrolling. At desktop width, the approach diagram and explanation can occupy two columns. The comparison tray must not cover the source link or reading controls. Text must remain legible at 200% zoom. Tooltips should never be the only place a scientific qualification appears.

Load the explainer and content first. Lazy-load the map and advanced comparison views. Avoid a large 3D engine for a small schematic. Static SVG with controlled animation will be easier to understand, inspect and maintain.

## Editorial acceptance criteria

The initial build is acceptable only if all of the following are true:

1. NIF target gain never appears as net plant electricity.
2. ITER's 500 MW is always identified as planned fusion power, and ITER is never shown as an electricity generator.
3. Helion Polaris is not labelled as an already demonstrated net-electric machine.
4. Realta's recovered input-power demonstration is not labelled as large-scale fusion-born or net electricity.
5. Inertia models and manufacturing results remain distinct from experimentally demonstrated target gain and a working target factory.
6. A commercial target never turns into an achievement merely because its date is earlier than the current date.
7. Operating fuel and intended commercial fuel remain distinguishable.
8. Cumulative financing is not added to rounds; conditional commitments, loans, public budgets and valuations keep their types.
9. Unknown values remain null or explicitly unknown; they do not render as zero.
10. HQ and planned plant sites use different roles and marker shapes; approximate locations are labelled.
11. Every quantitative or project-specific assertion in a card has a traceable source.
12. Company and programme targets retain date precision; “early 2030s” is not an exact year.
13. WEST heating energy is not charted as fusion yield; KSTAR regimes remain separate.
14. A simulation or peer-reviewed design is not automatically labelled an experiment.
15. Negative net output and undefined ratios display correctly in the calculator.
16. Sources, data and methodology are accessible on mobile and with the keyboard.
17. The snapshot date and curated scope are visible without opening a modal.
18. The page supplies useful content before any interactive control is used.

## Delivery sequence

First implement the data loader and citation system, then the short introduction and three core diagrams. Add all approach variants through the shared diagram interface. Implement the gain explainer and the three worked accounting examples. Then add entity cards, comparison, the funding table and map. Finish with the risk questions, timeline, accessible fallback tables and data downloads.

Run `python3 scripts/validate_data.py` against the handoff before implementation and after any data changes. Use the model's supplied numerical examples to verify the calculator. Inspect the completed page on mobile and desktop. Report any unresolved data qualification faithfully; do not remove a qualification to make a layout cleaner.

The research is already supplied. If a field is missing, the intended initial behavior is to display the specified unknown state. The implementation should be complete and reviewable before any publishing step. Do not publish to a live site until the user authorizes publication in the implementation session.
