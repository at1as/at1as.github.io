import * as THREE from "./assets/vendor/three.module.min.js";
import { buildReactor, applyReactorLayers } from "./reactor-geometry.js";
import { getReactorContent } from "./reactor-content.js";
import { renderMachine } from "./diagrams.js";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let nextId = 0;

/** One disposable, keyboard-accessible inspection surface, shared by the atlas and company notes. */
export function createReactorExplorer(host, id, options = {}) {
  const content = getReactorContent(id, options),
    uid = `reactor-${++nextId}`;
  const sources = options.citations || (() => "");
  let selected = content.defaultPart,
    alive = true,
    model,
    renderer,
    scene,
    camera,
    frame = 0,
    visible = true,
    playing = false;
  let yaw = 0.75,
    pitch = 0.42,
    zoom = 1,
    baseDistance = 15,
    explosion = options.displaySettings?.explosion ?? 0,
    isolate = false,
    labels = options.displaySettings?.labels ?? true,
    hovered = null,
    focused = false;
  const layers = { structure: true, field: true, plasma: true, flow: true, ...options.displaySettings?.layers };
  const pointers = new Map(),
    originals = new Map(),
    cameraTarget = new THREE.Vector3();
  let defaultDistance = 15;
  let lastPoint = null,
    down = null,
    pinchDistance = 0,
    dragged = false,
    clockTime = 0,
    lastFrame = 0;
  host.classList.add("reactor-explorer");
  host.classList.remove("reactor-fallback");
  host.innerHTML = `<div class="reactor-toolbar"><div><span class="reactor-eyebrow">COMPONENT VIEW</span><strong>${esc(options.title || content.title)}</strong></div><div class="reactor-views" aria-label="Camera view"><button data-camera="iso" class="active" aria-pressed="true">Perspective</button><button data-camera="top" aria-pressed="false">Top</button><button data-camera="front" aria-pressed="false">Front</button><button data-action="reset" title="Reset view and layers">Reset ↺</button></div></div>
  <div class="reactor-body"><div class="reactor-visual"><div class="reactor-stage"><div class="reactor-canvas"></div><div class="reactor-annotations" aria-label="Selectable machine components"></div><div class="reactor-hover" hidden></div><div class="reactor-navigation"><button data-action="zoom-in" aria-label="Zoom in">+</button><button data-action="zoom-out" aria-label="Zoom out">−</button><button data-action="rotate-left" aria-label="Rotate left">↶</button><button data-action="rotate-right" aria-label="Rotate right">↷</button></div></div>
  <div class="reactor-interaction-hint"><span>Drag to rotate · select a part</span><button data-action="motion" aria-pressed="false">Trace the paths ▷</button>
  <div class="reactor-legend" aria-label="Diagram color key"><span>Field geometry</span><span class="plasma">Fuel / particles</span><span class="energy">Driver / energy flow</span>${id === "electrostatic" ? '<span class="electric">Electric field</span>' : ""}</div></div>
  <details class="reactor-display-options"${options.displayOptionsOpen === false ? "" : " open"}><summary>Display options</summary><div class="reactor-layer-controls"><label><input type="checkbox" data-layer="structure" checked> Hardware</label><label><input type="checkbox" data-layer="field" checked> Fields</label><label><input type="checkbox" data-layer="plasma" checked> Plasma / fuel</label><label><input type="checkbox" data-layer="flow" checked> Energy paths</label><label><input type="checkbox" data-action="labels" checked> Labels</label></div>
  <div class="reactor-explode"><label for="${uid}-explode">Separate the assembly</label><input id="${uid}-explode" type="range" min="0" max="100" value="0" aria-label="Separate the assembly"><output for="${uid}-explode">Assembled</output></div></details></div>
  <aside class="reactor-inspector" tabindex="0" aria-label="Component descriptions"><div class="reactor-inspector-heading"><span class="reactor-eyebrow">COMPONENTS</span><label><input type="checkbox" data-action="isolate"> Isolate</label></div><div class="reactor-parts" role="group" aria-label="Machine systems">${content.parts.map((p, i) => `<button data-part="${p.id}" aria-pressed="${p.id === selected}"><span>${String(i + 1).padStart(2, "0")}</span>${esc(p.name)}</button>`).join("")}</div><div class="reactor-part-detail" aria-live="polite"></div></aside></div>
  ${content.conceptNote ? `<details class="reactor-concept-note"><summary>Model notes</summary><p>${esc(content.conceptNote)}</p></details>` : ""}`;
  const q = (s) => host.querySelector(s),
    qa = (s) => [...host.querySelectorAll(s)],
    stage = q(".reactor-stage"),
    canvasHost = q(".reactor-canvas"),
    overlay = q(".reactor-annotations");
  qa("[data-layer]").forEach((input) => {
    input.checked = layers[input.dataset.layer];
  });
  q('[data-action="labels"]').checked = labels;
  q(".reactor-explode input").value = explosion * 100;
  q(".reactor-explode output").textContent = explosion
    ? `${Math.round(explosion * 100)}% separated`
    : "Assembled";
  function detail() {
    const p = content.parts.find((p) => p.id === selected);
    qa("[data-part]").forEach((b) => {
      b.classList.toggle("active", b.dataset.part === selected);
      b.setAttribute("aria-pressed", b.dataset.part === selected);
    });
    q('[data-action="isolate"]').disabled = !p || !renderer;
    if (!p) {
      q(".reactor-part-detail").innerHTML =
        '<p class="reactor-empty-selection">Select a component to read how it works</p>';
      return;
    }
    q(".reactor-part-detail").innerHTML =
      `<p class="reactor-part-role">${esc(p.role)}</p><h4>${esc(p.name)}</h4><button class="reactor-focus" data-action="focus" ${renderer ? "" : "disabled"}>Focus on this part ⊕</button><p>${esc(p.description)}</p><div class="reactor-engineering"><strong>Engineering challenge</strong><p>${esc(p.challenge)}</p></div>${
        p.connectsTo?.length
          ? `<div class="reactor-connections"><span>Connected components</span>${p.connectsTo
              .map((id) => {
                const t = content.parts.find((t) => t.id === id);
                return t
                  ? `<button data-part="${id}">${esc(t.name)} →</button>`
                  : "";
              })
              .join("")}</div>`
          : ""
      }<div class="reactor-citations">${partSources(p.sourceIds || content.sourceIds || [])}</div>`;
  }
  function partSources(ids) {
    return (
      sources(ids.slice(0, 3)) +
      (ids.length > 3
        ? `<details><summary>${ids.length - 3} more references</summary>${sources(ids.slice(3))}</details>`
        : "")
    );
  }
  function restoreMaterials() {
    for (const [mesh, material] of originals) {
      mesh.material.dispose();
      mesh.material = material;
    }
    originals.clear();
  }
  function highlight() {
    if (!model) return;
    restoreMaterials();
    for (const p of model.parts) {
      if (p.id !== selected && p.id !== hovered) continue;
      p.object.traverse((o) => {
        if (!o.isMesh || Array.isArray(o.material)) return;
        const m = o.material.clone();
        originals.set(o, o.material);
        o.material = m;
        if (m.emissive) {
          m.emissive.set(p.id === selected ? 0x487b8c : 0x214252);
          m.emissiveIntensity = p.id === selected ? 0.38 : 0.2;
        }
        if (p.id === selected && m.opacity < 0.6) {
          m.opacity = 0.6;
          m.transparent = true;
        }
      });
    }
  }
  function apply() {
    if (!model) return;
    applyReactorLayers(model, layers, isolate ? selected : null);
    for (const p of model.parts) {
      p.object.position
        .copy(p.basePosition)
        .addScaledVector(p.explode || new THREE.Vector3(), explosion);
    }
    highlight();
    draw();
  }
  function select(part) {
    if (!content.parts.some((p) => p.id === part)) return;
    selected = selected === part ? null : part;
    if (!selected) {
      isolate = false;
      focused = false;
      q('[data-action="isolate"]').checked = false;
      if (model && camera) fit(model.parts.map((p) => p.object));
    }
    const p = model?.parts.find((p) => p.id === selected);
    if (p)
      for (const layer of p.layers) {
        layers[layer] = true;
        const input = q(`[data-layer="${layer}"]`);
        if (input) input.checked = true;
      }
    detail();
    // A new component starts at its heading even after reading a long prior note.
    q(".reactor-inspector").scrollTop = 0;
    if (!renderer && q('[data-action="focus"]'))
      q('[data-action="focus"]').disabled = true;
    apply();
    if (focused) focusPart();
    host.dispatchEvent(
      new CustomEvent("reactorselect", {
        detail: { part: selected, id },
        bubbles: true,
      }),
    );
  }
  function positionCamera() {
    if (!camera) return;
    const d = baseDistance * zoom;
    camera.position
      .set(
        Math.sin(yaw) * Math.cos(pitch) * d,
        Math.sin(pitch) * d,
        Math.cos(yaw) * Math.cos(pitch) * d,
      )
      .add(cameraTarget);
    camera.lookAt(cameraTarget);
    camera.updateMatrixWorld();
  }
  function fit(objects, center = new THREE.Vector3()) {
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const up = new THREE.Vector3(
      -Math.sin(yaw) * Math.sin(pitch),
      Math.cos(pitch),
      -Math.cos(yaw) * Math.sin(pitch),
    );
    const direction = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.cos(yaw) * Math.cos(pitch),
    );
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    let distance = 1;
    model.root.updateMatrixWorld(true);
    for (const object of objects)
      object.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry.computeBoundingBox();
        const b = o.geometry.boundingBox;
        for (const x of [b.min.x, b.max.x])
          for (const y of [b.min.y, b.max.y])
            for (const z of [b.min.z, b.max.z]) {
              const v = new THREE.Vector3(x, y, z)
                .applyMatrix4(o.matrixWorld)
                .sub(center);
              distance = Math.max(
                distance,
                v.dot(direction) +
                  Math.max(
                    Math.abs(v.dot(right)) / (tangent * camera.aspect),
                    Math.abs(v.dot(up)) / tangent,
                  ) /
                    0.84,
              );
            }
      });
    cameraTarget.copy(center);
    baseDistance = distance;
    zoom = 1;
  }
  function focusPart() {
    if (!model || !camera) return;
    const p = model.parts.find((p) => p.id === selected);
    if (!p) return;
    focused = true;
    const box = new THREE.Box3().setFromObject(p.object);
    fit([p.object], box.getCenter(new THREE.Vector3()));
    draw();
  }
  function annotations() {
    if (!camera || !model) return;
    const w = stage.clientWidth,
      h = stage.clientHeight,
      placed = [],
      lines = [];
    model.root.updateMatrixWorld(true);
    for (const p of model.parts) {
      const b = overlay.querySelector(`[data-part="${p.id}"]`);
      if (!b) continue;
      const point = (p.anchor || new THREE.Vector3())
        .clone()
        .addScaledVector(p.explode || new THREE.Vector3(), explosion);
      model.root.localToWorld(point);
      point.project(camera);
      const x = (point.x * 0.5 + 0.5) * w,
        y = (-point.y * 0.5 + 0.5) * h;
      const shown =
        labels &&
        p.object.visible &&
        point.z < 1 &&
        x > 12 &&
        x < w - 12 &&
        y > 12 &&
        y < h - 12;
      b.hidden = !shown;
      if (!shown) continue;
      let px = x,
        py = y;
      const free = (a, c) =>
        a > 22 &&
        a < w - 22 &&
        c > 22 &&
        c < h - 22 &&
        placed.every((v) => Math.hypot(a - v[0], c - v[1]) > 36);
      if (!free(px, py)) {
        search: for (const radius of [38, 55, 75, 96])
          for (let i = 0; i < 12; i++) {
            const a = x + Math.cos((i * Math.PI) / 6) * radius,
              c = y + Math.sin((i * Math.PI) / 6) * radius;
            if (free(a, c)) {
              px = a;
              py = c;
              break search;
            }
          }
      }
      placed.push([px, py]);
      b.style.left = `${px}px`;
      b.style.top = `${py}px`;
      b.classList.toggle("active", p.id === selected);
      b.classList.toggle("label-left", px > w - 180);
      b.setAttribute("aria-pressed", p.id === selected);
      if (Math.hypot(px - x, py - y) > 8)
        lines.push(
          `<path d="M${x.toFixed(1)} ${y.toFixed(1)}L${px.toFixed(1)} ${py.toFixed(1)}"/>`,
        );
    }
    overlay.querySelector(".reactor-leaders").innerHTML = lines.join("");
  }
  function draw() {
    if (!alive || !renderer) return;
    positionCamera();
    renderer.render(scene, camera);
    annotations();
  }
  function animate(t) {
    frame = 0;
    if (!alive || !playing || !visible || document.hidden) return;
    if (t - lastFrame > 32) {
      clockTime += Math.min((t - lastFrame) / 1000, 0.06);
      lastFrame = t;
      model?.update?.(clockTime);
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function pause() {
    playing = false;
    cancelAnimationFrame(frame);
    frame = 0;
    const b = q('[data-action="motion"]');
    b.textContent = "Trace the paths ▷";
    b.setAttribute("aria-pressed", "false");
  }
  function clearCameraPreset() {
    qa("[data-camera]").forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
  }
  function reset() {
    pause();
    clockTime = 0;
    model?.update(0);
    focused = false;
    cameraTarget.set(0, 0, 0);
    baseDistance = defaultDistance;
    yaw = 0.75;
    pitch = 0.42;
    zoom = 1;
    explosion = 0;
    isolate = false;
    labels = true;
    Object.keys(layers).forEach((k) => (layers[k] = true));
    qa("[data-layer]").forEach((i) => (i.checked = !i.disabled));
    q('[data-action="labels"]').checked = true;
    q('[data-action="isolate"]').checked = false;
    q(".reactor-explode input").value = 0;
    q(".reactor-explode output").textContent = "Assembled";
    qa("[data-camera]").forEach((b) => {
      b.classList.toggle("active", b.dataset.camera === "iso");
      b.setAttribute("aria-pressed", b.dataset.camera === "iso");
    });
    apply();
    if (model && camera) {
      fit(model.parts.map((p) => p.object));
      defaultDistance = baseDistance;
      draw();
    }
  }
  host.addEventListener("click", onClick);
  function onClick(e) {
    const b = e.target.closest("button");
    if (!b || !host.contains(b)) return;
    if (b.dataset.part) {
      select(b.dataset.part);
      return;
    }
    if (b.dataset.camera) {
      yaw = b.dataset.camera === "front" ? 0 : 0.75;
      pitch =
        b.dataset.camera === "top"
          ? Math.PI / 2 - 0.01
          : b.dataset.camera === "front"
            ? 0.02
            : 0.42;
      qa("[data-camera]").forEach((x) => {
        x.classList.toggle("active", x === b);
        x.setAttribute("aria-pressed", x === b);
      });
      if (model) {
        const objects = focused
          ? [model.parts.find((p) => p.id === selected).object]
          : model.parts.map((p) => p.object);
        fit(objects, cameraTarget.clone());
      }
      draw();
    }
    switch (b.dataset.action) {
      case "reset":
        reset();
        break;
      case "focus":
        focusPart();
        break;
      case "zoom-in":
        zoom = Math.max(0.45, zoom * 0.82);
        draw();
        break;
      case "zoom-out":
        zoom = Math.min(2.3, zoom * 1.22);
        draw();
        break;
      case "rotate-left":
        clearCameraPreset();
        yaw -= 0.3;
        draw();
        break;
      case "rotate-right":
        clearCameraPreset();
        yaw += 0.3;
        draw();
        break;
      case "motion":
        if (playing) pause();
        else {
          playing = true;
          b.textContent = "Pause paths Ⅱ";
          b.setAttribute("aria-pressed", "true");
          lastFrame = performance.now();
          if (!frame) frame = requestAnimationFrame(animate);
        }
        break;
    }
  }
  host.addEventListener("change", onChange);
  function onChange(e) {
    const input = e.target;
    if (input.dataset.layer) {
      layers[input.dataset.layer] = input.checked;
      apply();
    }
    if (input.dataset.action === "isolate") {
      isolate = Boolean(selected && input.checked);
      apply();
    }
    if (input.dataset.action === "labels") {
      labels = input.checked;
      draw();
    }
  }
  q(".reactor-explode input").addEventListener("input", (e) => {
    explosion = +e.target.value / 100;
    q(".reactor-explode output").textContent = explosion
      ? `${Math.round(explosion * 100)}% separated`
      : "Assembled";
    apply();
    if (model && camera) {
      if (focused) focusPart();
      else {
        const currentZoom = zoom;
        fit(model.parts.map((p) => p.object));
        zoom = currentZoom;
        draw();
      }
    }
  });
  detail();
  const sizeInspector = () => {
    host.style.setProperty(
      "--inspector-height",
      `${q(".reactor-visual").offsetHeight}px`,
    );
  };
  sizeInspector();
  const inspectorObserver = new ResizeObserver(sizeInspector);
  inspectorObserver.observe(q(".reactor-visual"));
  let resizeObserver, intersectionObserver;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x101c29, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      `${content.title}, interactive concept model. Drag to rotate, arrow keys to orbit, plus or minus to zoom. Select a system with the component buttons.`,
    );
    canvasHost.append(canvas);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(37, 1, 0.1, 150);
    scene.add(new THREE.HemisphereLight(0xc2e4ff, 0x182a32, 2.5));
    const key = new THREE.DirectionalLight(0xf5e9d0, 4);
    key.position.set(3, 8, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x75bfff, 3);
    rim.position.set(-5, 2, -4);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xe3fbef, 1);
    fill.position.set(1, -2, 4);
    scene.add(fill);
    model = buildReactor(id, options);
    const availableLayers = new Set(model.parts.flatMap((p) => p.layers));
    qa("[data-layer]").forEach((input) => {
      input.disabled = !availableLayers.has(input.dataset.layer);
      input.checked = !input.disabled && layers[input.dataset.layer];
      input.parentElement.title = input.disabled
        ? "Not used in this configuration"
        : "";
    });
    scene.add(model.root);
    model.parts.forEach((p) => (p.basePosition = p.object.position.clone()));
    const box = new THREE.Box3().setFromObject(model.root),
      sphere = box.getBoundingSphere(new THREE.Sphere());
    baseDistance = Math.max(8, sphere.radius * 2.55);
    defaultDistance = baseDistance;
    const grid = new THREE.PolarGridHelper(
      Math.max(4, sphere.radius),
      12,
      4,
      96,
      0x29404c,
      0x20333e,
    );
    grid.position.y = box.min.y - 0.18;
    scene.add(grid);
    overlay.innerHTML =
      '<svg class="reactor-leaders" aria-hidden="true"></svg>' +
      content.parts
        .map(
          (p, i) =>
            `<button class="reactor-pin" data-part="${p.id}" aria-label="Inspect ${esc(p.name)}" aria-pressed="${p.id === selected}"><span>${i + 1}</span><span class="reactor-pin-name">${esc(p.name)}</span></button>`,
        )
        .join("");
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    function hit(e) {
      const r = canvas.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const objects = [];
      model.root.traverseVisible((mesh) => {
        if (
          mesh.isMesh &&
          ["structure", "plasma"].includes(mesh.userData.layer)
        )
          objects.push(mesh);
      });
      const hits = raycaster.intersectObjects(objects, false);
      for (const h of hits) {
        let o = h.object;
        while (o && !o.userData.partId) o = o.parent;
        if (
          o?.userData.partId &&
          content.parts.some((p) => p.id === o.userData.partId)
        )
          return o.userData.partId;
      }
      return null;
    }
    canvas.addEventListener("pointerdown", (e) => {
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      lastPoint = [e.clientX, e.clientY];
      down = [e.clientX, e.clientY];
      dragged = false;
      canvas.setPointerCapture(e.pointerId);
      canvas.focus({ preventScroll: true });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(a[0] - b[0], a[1] - b[1]);
      }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (pointers.has(e.pointerId)) {
        pointers.set(e.pointerId, [e.clientX, e.clientY]);
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()],
            d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (pinchDistance)
            zoom = THREE.MathUtils.clamp(
              (zoom * pinchDistance) / Math.max(1, d),
              0.45,
              2.3,
            );
          pinchDistance = d;
          dragged = true;
        } else if (lastPoint) {
          clearCameraPreset();
          yaw -= (e.clientX - lastPoint[0]) * 0.009;
          pitch = THREE.MathUtils.clamp(
            pitch + (e.clientY - lastPoint[1]) * 0.008,
            -1.15,
            1.5,
          );
          if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5)
            dragged = true;
        }
        lastPoint = [e.clientX, e.clientY];
        q(".reactor-hover").hidden = true;
        draw();
        return;
      }
      const id = hit(e);
      if (id !== hovered) {
        hovered = id;
        canvas.style.cursor = id ? "pointer" : "grab";
        highlight();
        draw();
      }
      const hint = q(".reactor-hover");
      hint.hidden = !id;
      if (id) {
        hint.textContent = content.parts.find((p) => p.id === id).name;
        const r = canvas.getBoundingClientRect();
        // Pointer coordinates are displayed pixels; CSS positions use the
        // unscaled stage, including when an ancestor is scaled.
        const x = (e.clientX - r.left) * stage.clientWidth / r.width;
        const y = (e.clientY - r.top) * stage.clientHeight / r.height;
        hint.style.left = `${Math.max(0, Math.min(x + 14, stage.clientWidth - hint.offsetWidth))}px`;
        hint.style.top = `${Math.max(0, y - 30)}px`;
      }
    });
    canvas.addEventListener("pointerup", (e) => {
      if (!dragged && pointers.size === 1) {
        const id = hit(e);
        if (id) select(id);
      }
      pointers.delete(e.pointerId);
      lastPoint = null;
      down = null;
      pinchDistance = 0;
    });
    canvas.addEventListener("pointercancel", (e) => {
      pointers.delete(e.pointerId);
      lastPoint = null;
      down = null;
    });
    canvas.addEventListener("pointerleave", () => {
      hovered = null;
      q(".reactor-hover").hidden = true;
      highlight();
      draw();
    });
    canvas.addEventListener(
      "wheel",
      (e) => {
        if (document.activeElement !== canvas && !e.ctrlKey) return;
        e.preventDefault();
        zoom = THREE.MathUtils.clamp(
          zoom * Math.exp(e.deltaY * 0.001),
          0.45,
          2.3,
        );
        draw();
      },
      { passive: false },
    );
    canvas.addEventListener("keydown", (e) => {
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "+",
          "=",
          "-",
          "Home",
        ].includes(e.key)
      )
        e.preventDefault();
      else return;
      if (e.key.startsWith("Arrow")) clearCameraPreset();
      if (e.key === "ArrowLeft") yaw -= 0.18;
      if (e.key === "ArrowRight") yaw += 0.18;
      if (e.key === "ArrowUp") pitch = Math.min(1.5, pitch + 0.15);
      if (e.key === "ArrowDown") pitch = Math.max(-1.15, pitch - 0.15);
      if (["+", "="].includes(e.key)) zoom = Math.max(0.45, zoom * 0.85);
      if (e.key === "-") zoom = Math.min(2.3, zoom * 1.18);
      if (e.key === "Home") reset();
      draw();
    });
    canvas.addEventListener("webglcontextlost", (e) => {
      if (!alive) return;
      e.preventDefault();
      pause();
      q(".reactor-interaction-hint span").textContent =
        "Graphics paused. Choose a system to read its explanation.";
    });
    canvas.addEventListener("webglcontextrestored", () => {
      if (!alive) return;
      q(".reactor-interaction-hint span").textContent =
        "Drag to rotate · select a part";
      draw();
    });
    resizeObserver = new ResizeObserver(() => {
      const w = stage.clientWidth,
        h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (focused) focusPart();
      else {
        fit(model.parts.map((p) => p.object));
        defaultDistance = baseDistance;
      }
      draw();
    });
    resizeObserver.observe(stage);
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else if (playing && !frame) {
          lastFrame = performance.now();
          frame = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(host);
    detail();
    apply();
  } catch (error) {
    renderer?.dispose();
    renderer = null;
    model?.dispose?.();
    model = null;
    canvasHost.innerHTML = renderMachine(id, 3, options);
    host.classList.add("reactor-fallback");
    q(".reactor-interaction-hint span").textContent =
      "3D is unavailable here. Explore the schematic using the system buttons.";
    qa(
      '[data-camera],.reactor-navigation button,[data-action="motion"],.reactor-explode input,[data-layer],[data-action="isolate"],[data-action="focus"]',
    ).forEach((b) => (b.disabled = true));
    q('[data-action="labels"]').disabled = true;
  }
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (playing && visible && !frame) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(animate);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  const onMotionPreference = () => {
    if (motionPreference.matches) pause();
  };
  motionPreference.addEventListener("change", onMotionPreference);
  return {
    select,
    reset,
    getDisplaySettings() {
      return { layers: { ...layers }, labels, explosion };
    },
    refreshSources() {
      detail();
    },
    dispose() {
      if (!alive) return;
      alive = false;
      pause();
      restoreMaterials();
      inspectorObserver.disconnect();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionPreference.removeEventListener("change", onMotionPreference);
      host.removeEventListener("click", onClick);
      host.removeEventListener("change", onChange);
      model?.dispose?.();
      scene?.traverse((o) => {
        if (o.type === "PolarGridHelper") {
          o.geometry.dispose();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      renderer?.dispose();
      renderer?.forceContextLoss();
      host.innerHTML = "";
    },
  };
}
