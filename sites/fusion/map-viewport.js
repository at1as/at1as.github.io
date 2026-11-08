const world = { x: 0, y: 25, width: 900, height: 390 };
export const maxMapZoom = 16;
export const initialMapView = () => ({ x: world.x, y: world.y, zoom: 1 });
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));

export function constrainMapView(view) {
  const zoom = clamp(view.zoom, 1, maxMapZoom);
  return {
    zoom,
    x: clamp(view.x, world.x, world.x + world.width - world.width / zoom),
    y: clamp(view.y, world.y, world.y + world.height - world.height / zoom),
  };
}

// Preserve the world position under the pointer (or the centre for buttons).
export function zoomMapView(view, factor, anchor = { x: 0.5, y: 0.5 }, destination = anchor) {
  const zoom = clamp(view.zoom * factor, 1, maxMapZoom);
  return constrainMapView({
    zoom,
    x: view.x + world.width * (anchor.x / view.zoom - destination.x / zoom),
    y: view.y + world.height * (anchor.y / view.zoom - destination.y / zoom),
  });
}

const mapPoint = (site) => ({ x: (site.longitude + 180) * 2.5, y: (90 - site.latitude) * 2.5 });
const positionedSites = (sites) => sites.filter(s => Number.isFinite(s.latitude) && Number.isFinite(s.longitude));

export function fitMapSites(sites) {
  const points = positionedSites(sites).map(mapPoint);
  if (!points.length) return initialMapView();
  const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
  // Leave room for marker hit areas and context around the selected region.
  const zoom = clamp(Math.min(world.width * 0.72 / (maxX - minX || 1), world.height * 0.72 / (maxY - minY || 1)), 1, maxMapZoom);
  return constrainMapView({ zoom, x: (minX + maxX - world.width / zoom) / 2, y: (minY + maxY - world.height / zoom) / 2 });
}

export function buttonZoomMapView(view, factor, sites) {
  if (view.zoom > 1 || factor <= 1) return zoomMapView(view, factor);
  // From the world view, start at a real site instead of empty ocean or land.
  const centre = { x: view.x + world.width / 2, y: view.y + world.height / 2 };
  const points = positionedSites(sites).map(mapPoint);
  const nearest = points.sort((a, b) => Math.hypot(a.x - centre.x, a.y - centre.y) - Math.hypot(b.x - centre.x, b.y - centre.y))[0];
  return nearest
    ? zoomMapView(view, factor, { x: (nearest.x - view.x) / world.width, y: (nearest.y - view.y) / world.height }, { x: 0.5, y: 0.5 })
    : zoomMapView(view, factor);
}

// Keep the 24 px hit areas apart, including on narrow screens. Recheck after
// each merge because a cluster's centre moves when it gains another record.
export function clusterMapSites(sites, unitsPerPixel) {
  const groups = sites.map(site => ({
    sites: [site], x: (site.longitude + 180) * 2.5, y: (90 - site.latitude) * 2.5,
  }));
  let merged;
  do {
    merged = false;
    outer: for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i], b = groups[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) >= 28 * unitsPerPixel) continue;
        const count = a.sites.length + b.sites.length;
        a.x = (a.x * a.sites.length + b.x * b.sites.length) / count;
        a.y = (a.y * a.sites.length + b.y * b.sites.length) / count;
        a.sites.push(...b.sites);
        groups.splice(j, 1);
        merged = true;
        break outer;
      }
    }
  } while (merged);
  return groups.map(group => group.sites);
}

export function mountMapViewport(root, view, renderMarkers, sites = []) {
  const svg = root.querySelector('.map-canvas');
  const zoomIn = root.querySelector('[data-map-zoom="in"]');
  const zoomOut = root.querySelector('[data-map-zoom="out"]');
  const reset = root.querySelector('[data-map-reset]');
  const level = root.querySelector('.map-zoom-level');
  const controller = new AbortController();
  const on = (target, type, handler, options = {}) =>
    target.addEventListener(type, handler, { ...options, signal: controller.signal });
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointers = new Map();
  let drag = null, pinch = null, suppressClick = false, lastZoom, lastWidth;
  let frame = 0, motionTarget = null;

  function stopMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    motionTarget = null;
  }

  function draw() {
    const width = svg.getBoundingClientRect().width;
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${world.width / view.zoom} ${world.height / view.zoom}`);
    zoomIn.disabled = view.zoom >= maxMapZoom;
    zoomOut.disabled = view.zoom <= 1;
    reset.disabled = view.zoom === 1;
    level.textContent = `${Number(view.zoom.toFixed(1))}×`;
    svg.classList.toggle('is-zoomed', view.zoom > 1);
    if (width > 0 && (lastZoom !== view.zoom || lastWidth !== width)) {
      renderMarkers(view.zoom, world.width / width / view.zoom);
      lastZoom = view.zoom;
      lastWidth = width;
    }
  }
  function update(next) {
    Object.assign(view, constrainMapView(next));
    draw();
  }
  function moveTo(next) {
    stopMotion();
    const start = { ...view }, target = constrainMapView(next), began = performance.now();
    if (reducedMotion || (start.zoom === target.zoom && start.x === target.x && start.y === target.y)) { update(target); return; }
    motionTarget = target;
    function step(now) {
      const progress = Math.min(1, (now - began) / 320), t = 1 - (1 - progress) ** 3;
      // Interpolate the visible span, so pan and zoom move together smoothly.
      const zoom = 1 / ((1 - t) / start.zoom + t / target.zoom);
      update({ zoom, x: start.x + (target.x - start.x) * t, y: start.y + (target.y - start.y) * t });
      if (progress < 1) frame = requestAnimationFrame(step);
      else { update(target); frame = 0; motionTarget = null; }
    }
    frame = requestAnimationFrame(step);
  }
  function zoomBy(factor) {
    moveTo(buttonZoomMapView(motionTarget || view, factor, sites));
  }
  on(zoomIn, 'click', () => zoomBy(2));
  on(zoomOut, 'click', () => zoomBy(0.5));
  on(reset, 'click', () => moveTo(initialMapView()));

  function touchGeometry() {
    const [a, b] = [...pointers.values()], rect = svg.getBoundingClientRect();
    return { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), anchor: { x: ((a.x + b.x) / 2 - rect.left) / rect.width, y: ((a.y + b.y) / 2 - rect.top) / rect.height } };
  }
  function startDrag(id, point) {
    drag = { id, ...point, view: { ...view }, moved: false, lastX: point.x, lastY: point.y, lastTime: performance.now(), vx: 0, vy: 0 };
  }

  on(svg, 'pointerdown', (event) => {
    if (event.button !== 0 || pointers.size >= 2) return;
    stopMotion();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      suppressClick = false;
      startDrag(event.pointerId, pointers.get(event.pointerId));
    } else if (pointers.size === 2) {
      pinch = { ...touchGeometry(), view: { ...view } };
      drag = null;
      suppressClick = true;
      for (const id of pointers.keys()) svg.setPointerCapture(id);
    }
    if (!event.target.closest('[data-cluster]')) svg.focus({ preventScroll: true });
  });
  on(window, 'pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size >= 2) {
      const current = touchGeometry();
      update(zoomMapView(pinch.view, current.distance / pinch.distance, pinch.anchor, current.anchor));
      return;
    }
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      svg.setPointerCapture(event.pointerId);
      svg.classList.add('is-dragging');
    }
    suppressClick = true;
    const rect = svg.getBoundingClientRect();
    const now = performance.now(), dt = Math.max(1, now - drag.lastTime);
    drag.vx = (event.clientX - drag.lastX) / dt;
    drag.vy = (event.clientY - drag.lastY) / dt;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    update({
      ...drag.view,
      x: drag.view.x - dx * world.width / rect.width / drag.view.zoom,
      y: drag.view.y - dy * world.height / rect.height / drag.view.zoom,
    });
  });
  function coast(vx, vy) {
    if (reducedMotion || Math.hypot(vx, vy) < 0.1) return;
    let previous = performance.now(), began = previous;
    function step(now) {
      const dt = Math.min(32, now - previous), rect = svg.getBoundingClientRect();
      previous = now;
      vx *= Math.exp(-dt / 130);
      vy *= Math.exp(-dt / 130);
      const x = view.x, y = view.y;
      update({ ...view, x: x - vx * dt * world.width / rect.width / view.zoom, y: y - vy * dt * world.height / rect.height / view.zoom });
      if (Math.hypot(vx, vy) > 0.02 && now - began < 700 && (x !== view.x || y !== view.y)) frame = requestAnimationFrame(step);
      else frame = 0;
    }
    frame = requestAnimationFrame(step);
  }
  function endDrag(event) {
    if (!pointers.has(event.pointerId)) return;
    const ended = drag;
    pointers.delete(event.pointerId);
    drag = null;
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    if (pinch) {
      pinch = null;
      if (pointers.size === 1) {
        const [id, point] = [...pointers][0];
        startDrag(id, point);
      }
    } else if (event.type === 'pointerup' && ended?.moved && performance.now() - ended.lastTime < 80) {
      coast(ended.vx, ended.vy);
    }
    svg.classList.remove('is-dragging');
  }
  on(window, 'pointerup', endDrag);
  on(window, 'pointercancel', endDrag);
  on(svg, 'lostpointercapture', endDrag);
  // A drag starting on a marker must not also activate that marker.
  on(svg, 'click', (event) => {
    if (!suppressClick || event.detail === 0) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
  }, { capture: true });

  on(svg, 'wheel', (event) => {
    // Ordinary scrolling still moves the page; trackpad pinch uses ctrl+wheel.
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    stopMotion();
    const rect = svg.getBoundingClientRect();
    update(zoomMapView(view, Math.exp(-clamp(event.deltaY, -100, 100) * 0.01), {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }));
  }, { passive: false });
  on(svg, 'dblclick', (event) => {
    if (event.target.closest('[data-cluster]')) return;
    event.preventDefault();
    const rect = svg.getBoundingClientRect();
    moveTo(zoomMapView(view, event.shiftKey ? 0.5 : 2, { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }));
  });
  on(svg, 'keydown', (event) => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (directions[event.key]) {
      const [x, y] = directions[event.key];
      event.preventDefault();
      const target = motionTarget || view;
      moveTo({ ...target, x: target.x + x * world.width / target.zoom * 0.15, y: target.y + y * world.height / target.zoom * 0.15 });
    } else if (['+', '=', '-', 'Home'].includes(event.key)) {
      event.preventDefault();
      // Keep focus in the map if zoom replaces the focused cluster.
      svg.focus({ preventScroll: true });
      if (event.key === 'Home') moveTo(initialMapView());
      else zoomBy(event.key === '-' ? 0.5 : 2);
    }
  });
  on(svg, 'focusin', (event) => {
    // Pointer selection already has a visible target; recenter only for
    // keyboard focus so an automatic pan cannot fight a drag on an edge marker.
    if (pointers.size) return;
    const marker = event.target.closest('[data-cluster]');
    if (!marker) return;
    const x = Number(marker.dataset.x), y = Number(marker.dataset.y);
    const width = world.width / view.zoom, height = world.height / view.zoom;
    if (x < view.x + width * 0.03 || x > view.x + width * 0.97 || y < view.y + height * 0.03 || y > view.y + height * 0.97)
      moveTo({ ...view, x: x - width / 2, y: y - height / 2 });
  });
  const resize = new ResizeObserver(draw);
  resize.observe(svg);
  draw();
  return {
    focusSites(selected, { onlyZoomIn = false } = {}) {
      const target = fitMapSites(selected);
      if (onlyZoomIn && target.zoom < view.zoom) return;
      moveTo(target);
    },
    dispose() {
      stopMotion();
      controller.abort();
      resize.disconnect();
    },
  };
}
