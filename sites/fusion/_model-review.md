# Machine explorer review · 6 November 2026

Scope: the 15 family models, their component explanations and interactions, the separate laser fast-ignition option, and the architecture overrides used by 39 organization profiles. The original research snapshot remains 22 October 2026.

## Findings and resolutions

| Family | Physics and geometry reviewed | Result |
| --- | --- | --- |
| Tokamak | Toroidal and poloidal field contributions, solenoid, heating, exhaust, future blanket | Closed magnet paths now meet without a mesh seam; reviewed ordinary and high-field variants |
| Spherical tokamak | Narrow centre column, elongated plasma, coil clearance, divertor location | Reduced inner coil thickness and moved exhaust below the plasma; checked assembly separation |
| Stellarator | External field shaping, nonplanar coils, periodic plasma surface | Fixed the longitudinal surface seam and continuous helical winding closure; inspected modular, planar-array and helical variants |
| Patterned HTS stellarator variant | Renaissance’s cylindrical winding surfaces | Replaced the single cylinder surrounding the entire machine with patterned cylindrical sections around the torus; mitered ends leave gaps between sections |
| Magnetic mirror | Strong end fields, open field lines, heating, end collection | Field tracers use the field colour rather than implying that all confined particles stream out of one end |
| Levitated dipole | Internal superconducting ring, external levitation, closed poloidal flux surfaces | Replaced truncated point-dipole curves with closed circular-current-loop fields; plasma follows nested surfaces clear of the ring housing |
| Beam-sustained FRC | Beam sustainment, closed reversed-field core, surrounding open field | Replaced ellipses that met on the axis with off-axis closed loops; inner and outer legs point in opposite axial directions |
| Pulsed FRC | Formation, acceleration/merging, compression, inductive recovery | Added the missing reversed-field component; distinguished closed core and open surrounding field |
| Sheared-flow Z-pinch | Axial current, azimuthal field, different axial flow speeds | Kept shear tracers inside the plasma column; retained faster core and slower outer paths |
| Magnetized target | Magnetized plasma injection, moving liner, mechanical compression concept | Generic plant concept remains separate from LM26’s solid-liner experiment |
| LM26 variant | Theta-pinch coils, cylindrical lithium liner, toroidal plasma around a central shaft | Added shaft and cones, replaced spherical plasma with a torus, routed injection around the cone, and faced the liner cutaway toward the initial camera |
| Indirect-drive laser | Beams entering hohlraum openings, wall deposition, X-ray illumination, ablation | X-ray paths end at the capsule surface; laser paths avoid the capsule and meet the cavity wall |
| Direct-drive laser | Direct illumination of the ablator; separate fast-ignition option | Checked capsule-surface endpoints and retained a distinct ignition path to the compressed fuel |
| Hybrid direct-drive laser | Initial X-ray compression followed by direct illumination | Corrected later laser endpoints and colour; kept this separate from fast ignition |
| Hybrid fast ignition | Electrical compression, multi-shell fuel package, separate ignition interface | Retained a separate ignition subsystem without assigning an unsupported driver technology |
| Pulsed-power inertial | Current along a cylindrical liner, azimuthal field, inward magnetic force | Added feed/return paths, axial liner current and a selectable pinch field; MagLIF retains its separate preheat and magnetization systems |
| Electrostatic compact | Negative electrode, ion orbits, axial magnetic bottle, radial electric field | Separated orange ion orbits, blue magnetic lines and inward purple electric-field arrows; added the electric-field legend; replaced the ambiguous output assembly with coolant pipes and heat exchanger |

## Primary-source cross-checks

- [DOE: stellarators](https://www.energy.gov/science/doe-explainsstellarators), [IPP: W7-X coils](https://www.ipp.mpg.de/14824/magnetspulen), [Thea’s Canis paper](https://arxiv.org/abs/2503.18960), [Helical Fusion’s coil arrangement](https://global.helicalfusion.com/technology), and [Renaissance’s published winding-surface concept](https://renfusion.eu/)
- [WHAM](https://wham.physics.wisc.edu/), [LDX field geometry](https://www2.psfc.mit.edu/ldx/pubs/iaea_2000_final.pdf), [beam-driven FRC paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC11993635/), [Helion’s mechanism](https://www.helionenergy.com/technology), and [Zap’s sheared-flow pinch](https://www.zapenergy.com/technologies/fusion)
- [General Fusion’s LM26 diagnostics poster](https://generalfusion.com/wp-content/uploads/2024/06/HTPD2024_poster_HGould.pdf) and [solid-liner compression paper](https://generalfusion.com/wp-content/uploads/2025/06/Simulation-of-Electromagnetic-Lithium-Cylinder-Compression-for-Applications-in-Magnetized-Target-Fusion-Sirmas-2025.pdf)
- [LLE’s inertial-confinement explanation](https://www.lle.rochester.edu/inertial-confinement-fusion/), [LLNL’s ignition history](https://lmf.llnl.gov/science/achieving-fusion-ignition), [Xcimer hybrid-drive paper](https://pubs.aip.org/aip/pop/article/31/11/112708/3322685/Hybrid-direct-drive-with-a-two-sided-ultraviolet), [First Light’s mechanism](https://firstlightfusion.com/technology/), and [Sandia’s MagLIF overview](https://www.sandia.gov/research/publications/details/an-overview-of-magneto-inertial-fusion-on-the-z-machine-at-sandia-national-2022-04-01/)
- [Avalanche’s Orbitron mechanism and initial heat-recovery concept](https://www.avalanchefusion.com/orbitron)

Company sources establish the architecture being illustrated; they do not independently establish performance. No company forecast or experimental result was promoted to a demonstrated power-plant result during this review.

## Verification

- All 55 family/variant/profile configurations: component/source/connection integrity, finite vertices, default empty selection, experimental exclusions, animation confined to tracers, noncontracting component-centre separation, and complete resource disposal
- New regressions: periodic skin and magnet closure; spherical divertor below the plasma; dipole paths and plasma clear of the protected ring; FRC closed/open topology and axial reversal; Z-pinch tracer containment; laser/X-ray paths outside the capsule; electric arrows toward the negative cathode; LM26 plasma clear of its central shaft
- Browser: visually inspected all 15 families; checked selection/deselection, top/front presets, opt-in motion and reset for every family; inspected focused field views, isolation, separation and the distinct company variants
- Responsive review: all 15 models render at 320 px with no horizontal page overflow; inspected the four-colour electrostatic legend at 390 px and the laptop workspace at 1280 px
- No browser warnings or errors in the reviewed local preview
- Energy/diagram suite: seven supplied examples, invalid and limiting cases, 60 SVG states, and D–T mass-energy conversion pass
- Canonical data/adapter validation: pass with zero warnings
- Production Jekyll build and SEO validation: pass, including 233 sitemap URLs

These are educational geometry checks, not validation of an engineering design or plasma equilibrium. The dipole helper integrates the vacuum field of a circular current loop to obtain coherent closed paths; the other confinement fields remain illustrative. Coil counts, dimensions and motion timing are not device specifications. No further actionable issue was found in the final checks above.
