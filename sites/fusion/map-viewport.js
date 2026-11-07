const world = { x: 0, y: 25, width: 900, height: 390 };
export const maxMapZoom = 8;
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
export function zoomMapView(view, factor, anchor = { x: 0.5, y: 0.5 }) {
  const zoom = clamp(view.zoom * factor, 1, maxMapZoom);
  return constrainMapView({
    zoom,
    x: view.x + world.width * anchor.x * (1 / view.zoom - 1 / zoom),
    y: view.y + world.height * anchor.y * (1 / view.zoom - 1 / zoom),
  });
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

export function mountMapViewport(root, view, renderMarkers) {
  const svg = root.querySelector('.map-canvas');
  const zoomIn = root.querySelector('[data-map-zoom="in"]');
  const zoomOut = root.querySelector('[data-map-zoom="out"]');
  const reset = root.querySelector('[data-map-reset]');
  const level = root.querySelector('.map-zoom-level');
  const controller = new AbortController();
  const on = (target, type, handler, options = {}) =>
    target.addEventListener(type, handler, { ...options, signal: controller.signal });
  let drag = null, suppressClick = false, lastZoom, lastWidth;

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
  on(zoomIn, 'click', () => update(zoomMapView(view, 1.5)));
  on(zoomOut, 'click', () => update(zoomMapView(view, 1 / 1.5)));
  on(reset, 'click', () => update(initialMapView()));

  on(svg, 'pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    if (view.zoom === 1) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, view: { ...view }, moved: false };
    if (!event.target.closest('[data-cluster]')) svg.focus({ preventScroll: true });
  });
  on(window, 'pointermove', (event) => {
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
    update({
      ...drag.view,
      x: drag.view.x - dx * world.width / rect.width / drag.view.zoom,
      y: drag.view.y - dy * world.height / rect.height / drag.view.zoom,
    });
  });
  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
    drag = null;
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
    const rect = svg.getBoundingClientRect();
    update(zoomMapView(view, Math.exp(-clamp(event.deltaY, -100, 100) * 0.01), {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }));
  }, { passive: false });
  on(svg, 'keydown', (event) => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (directions[event.key]) {
      const [x, y] = directions[event.key];
      event.preventDefault();
      update({ ...view, x: view.x + x * world.width / view.zoom * 0.15, y: view.y + y * world.height / view.zoom * 0.15 });
    } else if (['+', '=', '-', 'Home'].includes(event.key)) {
      event.preventDefault();
      // Keep focus in the map if zoom replaces the focused cluster.
      svg.focus({ preventScroll: true });
      update(event.key === 'Home' ? initialMapView() : zoomMapView(view, event.key === '-' ? 1 / 1.5 : 1.5));
    }
  });
  on(svg, 'focusin', (event) => {
    const marker = event.target.closest('[data-cluster]');
    if (!marker) return;
    const x = Number(marker.dataset.x), y = Number(marker.dataset.y);
    const width = world.width / view.zoom, height = world.height / view.zoom;
    if (x < view.x + width * 0.03 || x > view.x + width * 0.97 || y < view.y + height * 0.03 || y > view.y + height * 0.97)
      update({ ...view, x: x - width / 2, y: y - height / 2 });
  });
  const resize = new ResizeObserver(draw);
  resize.observe(svg);
  draw();
  return () => {
    controller.abort();
    resize.disconnect();
  };
}
