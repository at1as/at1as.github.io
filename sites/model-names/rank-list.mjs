// The numbered list accepts the same move from a pointer drag or a native button.
export function createRankList(list, template, onMove) {
  let order = [];
  let solution;
  let drag;

  function render(values, answerKey) {
    endDrag();
    order = [...values];
    solution = answerKey;
    list.replaceChildren(...order.map((name, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector('.rank-position').textContent = index + 1;
      row.querySelector('.rank-name').textContent = name;
      if (solution) {
        const right = name === solution[index];
        row.dataset.locked = right ? 'right' : 'wrong';
        row.querySelector('.rank-grip').textContent = right ? '✓' : '×';
        row.querySelector('.rank-actions').hidden = true;
      } else {
        for (const button of row.querySelectorAll('button')) {
          const up = button.value === '-1';
          button.disabled = up ? index === 0 : index === order.length - 1;
          button.setAttribute('aria-label', `Move ${name} ${up ? 'up' : 'down'}`);
        }
      }
      return row;
    }));
  }

  function move(from, to, focusDirection) {
    if (solution || from < 0 || to < 0 || to >= order.length || from === to) return;
    const [name] = order.splice(from, 1);
    order.splice(to, 0, name);
    render(order);
    onMove([...order], `${name} moved to position ${to + 1} of ${order.length}.`);
    if (focusDirection) {
      const row = list.children[to];
      (row.querySelector(`button[value="${focusDirection}"]:enabled`) || row.querySelector('button:enabled')).focus();
    }
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (drag || !button || button.disabled) return;
    const from = [...list.children].indexOf(button.closest('li'));
    move(from, from + Number(button.value), button.value);
  });

  function positionDrag(event) {
    const { row, slot, offsetX, offsetY } = drag;
    row.style.transform = `translate(${event.clientX - offsetX}px, ${event.clientY - offsetY}px)`;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('li');
    if (target?.parentElement === list && target !== slot && target !== row) {
      const bounds = target.getBoundingClientRect();
      const movingUp = target.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING;
      const midpoint = Math.round(bounds.top + bounds.height / 2);
      if (movingUp ? event.clientY > midpoint : event.clientY < midpoint) return;
      if (movingUp) target.before(slot);
      else target.after(slot);
      let position = 0;
      for (const item of list.children) {
        if (item === row) continue;
        (item === slot ? row : item).querySelector('.rank-position').textContent = ++position;
      }
    }
  }

  function endDrag() {
    if (!drag) return;
    const { pointerId, row, slot } = drag;
    drag = undefined;
    if (list.hasPointerCapture(pointerId)) list.releasePointerCapture(pointerId);
    slot.remove();
    row.classList.remove('dragging');
    row.style.removeProperty('width');
    row.style.removeProperty('transform');
    [...list.children].forEach((item, index) => {
      item.querySelector('.rank-position').textContent = index + 1;
    });
  }

  list.addEventListener('pointerdown', event => {
    if (solution || drag || !event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
    if (event.pointerType === 'touch' && !event.target.closest('.rank-grip')) return;
    const row = event.target.closest('li');
    if (!row) return;
    const bounds = row.getBoundingClientRect();
    const slot = document.createElement('li');
    slot.className = 'rank-placeholder';
    slot.setAttribute('aria-hidden', 'true');
    slot.style.height = `${bounds.height}px`;
    drag = {
      row, slot, from: [...list.children].indexOf(row), pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top
    };
    list.setPointerCapture(event.pointerId);
    row.before(slot);
    row.style.width = `${bounds.width}px`;
    row.classList.add('dragging');
    positionDrag(event);
  });

  list.addEventListener('pointermove', event => {
    if (drag?.pointerId !== event.pointerId) return;
    positionDrag(event);
  });

  list.addEventListener('pointerup', event => {
    if (drag?.pointerId !== event.pointerId) return;
    positionDrag(event);
    const { from, row, slot } = drag;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const to = target && list.contains(target) ? [...list.children].filter(item => item !== row).indexOf(slot) : -1;
    endDrag();
    move(from, to);
  });
  for (const type of ['pointercancel', 'lostpointercapture']) {
    list.addEventListener(type, event => {
      if (drag?.pointerId === event.pointerId) endDrag();
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') endDrag();
  });
  return render;
}
