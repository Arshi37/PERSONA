(function () {
  function getParams() {
    const url = new URL(window.location.href);
    const itemsParam = url.searchParams.get('items');
    const items = itemsParam ? itemsParam.split(',').map(s => s.trim()).filter(Boolean) : ['Alice', 'Bob', 'Charlie', 'Delta'];
    const autospin = url.searchParams.get('autospin') === '1' || url.searchParams.get('autospin') === 'true';
    const remove = url.searchParams.get('remove') === '1' || url.searchParams.get('remove') === 'true';
    const sizeParam = parseInt(url.searchParams.get('size'), 10);
    const size = Number.isFinite(sizeParam) ? Math.max(200, Math.min(sizeParam, 800)) : 420;
    const durationParam = parseInt(url.searchParams.get('duration'), 10);
    const spinDurationMs = Number.isFinite(durationParam) ? Math.max(1200, Math.min(durationParam, 12000)) : 4500;
    return { items, autospin, remove, size, spinDurationMs };
  }

  function updateTextareaFromItems(items) {
    const el = document.getElementById('choices');
    if (el) el.value = items.join('\n');
  }

  function init() {
    const { items, autospin, remove, size, spinDurationMs } = getParams();
    const root = document.getElementById('wheel-root');
    const wheel = new WheelOfChoice(root, {
      items,
      removeChosenItem: remove,
      spinDurationMs,
      size
    });

    const choicesEl = document.getElementById('choices');
    const removeEl = document.getElementById('removeChosen');
    const autospinEl = document.getElementById('autospin');
    const applyBtn = document.getElementById('applyBtn');
    const spinBtn = document.getElementById('spinBtn');

    updateTextareaFromItems(items);
    if (removeEl) removeEl.checked = remove;
    if (autospinEl) autospinEl.checked = autospin;

    applyBtn.addEventListener('click', () => {
      const newItems = choicesEl.value.split(/\n+/).map(s => s.trim()).filter(Boolean);
      wheel.removeChosenItem = !!removeEl.checked;
      wheel.setItems(newItems);
      const url = new URL(window.location.href);
      url.searchParams.set('items', newItems.join(','));
      url.searchParams.set('remove', removeEl.checked ? '1' : '0');
      url.searchParams.set('autospin', autospinEl.checked ? '1' : '0');
      history.replaceState({}, '', url);
    });

    spinBtn.addEventListener('click', () => wheel.spin());

    wheel.on('spinstart', () => {
      spinBtn.disabled = true;
      applyBtn.disabled = true;
    });
    wheel.on('spinend', () => {
      spinBtn.disabled = false;
      applyBtn.disabled = false;
    });

    if (autospin) {
      setTimeout(() => wheel.spin(), 250);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

