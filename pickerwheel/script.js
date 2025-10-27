/* Picker Wheel - vanilla JS */
(function () {
  const itemsInput = document.getElementById('itemsInput');
  const spinButton = document.getElementById('spinButton');
  const shuffleButton = document.getElementById('shuffleButton');
  const clearButton = document.getElementById('clearButton');
  const addSampleButton = document.getElementById('addSampleButton');
  const shareButton = document.getElementById('shareButton');
  const removeAfterPickToggle = document.getElementById('removeAfterPickToggle');
  const confettiToggle = document.getElementById('confettiToggle');
  const clearHistoryButton = document.getElementById('clearHistoryButton');
  const historyList = document.getElementById('historyList');

  const wheelCanvas = document.getElementById('wheelCanvas');
  const resultBadge = document.getElementById('resultBadge');
  const confettiCanvas = document.getElementById('confettiCanvas');

  const wheelCtx = wheelCanvas.getContext('2d');
  const confettiCtx = confettiCanvas.getContext('2d');

  const state = {
    items: [],
    colors: [
      '#ff9f1c', '#2ec4b6', '#e71d36', '#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#00bbf9', '#00f5d4', '#c77dff', '#f15bb5', '#f77f00'
    ],
    angle: 0,
    spinning: false,
    spinStart: 0,
    spinDurationMs: 0,
    fromAngle: 0,
    toAngle: 0,
    lastPickedIndex: -1,
    history: [],
  };

  const sampleItems = ['Alice','Bob','Charlie','Diana','Eve','Frank','Grace','Heidi'];

  function parseItems(text) {
    return text
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  function seedFromString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setItems(items) {
    state.items = items;
    itemsInput.value = items.join('\n');
    drawWheel();
    saveToUrl();
  }

  function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const packed = params.get('items');
    if (packed) {
      try {
        const decoded = decodeURIComponent(atob(packed));
        const items = parseItems(decoded);
        if (items.length) {
          setItems(items);
          return;
        }
      } catch {}
    }
    // fallback
    setItems([]);
  }

  function saveToUrl() {
    try {
      const data = state.items.join('\n');
      const packed = btoa(encodeURIComponent(data));
      const url = new URL(window.location.href);
      if (data.length === 0) {
        url.searchParams.delete('items');
      } else {
        url.searchParams.set('items', packed);
      }
      window.history.replaceState({}, '', url);
    } catch {}
  }

  function resizeCanvases() {
    const rect = wheelCanvas.getBoundingClientRect();
    wheelCanvas.width = Math.floor(rect.width * devicePixelRatio);
    wheelCanvas.height = Math.floor(rect.height * devicePixelRatio);
    wheelCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const confRect = confettiCanvas.getBoundingClientRect();
    confettiCanvas.width = Math.floor(confRect.width * devicePixelRatio);
    confettiCanvas.height = Math.floor(confRect.height * devicePixelRatio);
    confettiCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    drawWheel();
  }

  window.addEventListener('resize', resizeCanvases);

  function drawWheel() {
    const { width, height } = wheelCanvas;
    wheelCtx.clearRect(0, 0, width, height);

    const num = state.items.length || 1;
    const cx = width / devicePixelRatio / 2;
    const cy = height / devicePixelRatio / 2;
    const radius = Math.min(cx, cy) - 8;

    // outer circle shadow
    wheelCtx.save();
    wheelCtx.translate(cx, cy);
    wheelCtx.rotate(state.angle);

    const anglePer = (Math.PI * 2) / num;

    for (let i = 0; i < num; i++) {
      const start = i * anglePer;
      const end = start + anglePer;
      const color = state.colors[i % state.colors.length];
      wheelCtx.beginPath();
      wheelCtx.moveTo(0, 0);
      wheelCtx.arc(0, 0, radius, start, end);
      wheelCtx.closePath();
      wheelCtx.fillStyle = color;
      wheelCtx.fill();

      // labels
      const label = state.items[i] ?? '';
      if (label) {
        wheelCtx.save();
        const mid = start + anglePer / 2;
        wheelCtx.rotate(mid);
        wheelCtx.textAlign = 'right';
        wheelCtx.textBaseline = 'middle';
        wheelCtx.fillStyle = 'white';
        wheelCtx.font = '600 16px Inter, system-ui, sans-serif';
        const padding = 10;
        const maxWidth = radius - 24;
        const text = clipText(label, maxWidth, wheelCtx);
        wheelCtx.fillText(text, radius - padding, 0);
        wheelCtx.restore();
      }
    }

    // center cap
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, 16, 0, Math.PI * 2);
    wheelCtx.fillStyle = '#0d1330';
    wheelCtx.fill();
    wheelCtx.lineWidth = 2;
    wheelCtx.strokeStyle = 'rgba(255,255,255,0.6)';
    wheelCtx.stroke();

    wheelCtx.restore();
  }

  function clipText(text, maxWidth, ctx) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    const ellipsis = '…';
    let lo = 0, hi = text.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      const candidate = text.slice(0, mid) + ellipsis;
      if (ctx.measureText(candidate).width <= maxWidth) lo = mid; else hi = mid - 1;
    }
    return text.slice(0, lo) + ellipsis;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function spin() {
    if (state.spinning) return;
    if (state.items.length === 0) return;

    state.spinning = true;
    state.spinStart = performance.now();
    const randomExtraSpins = 4 + Math.floor(Math.random() * 4); // 4..7 turns
    const finalTargetIndex = Math.floor(Math.random() * state.items.length);

    // choose angle so that pointer at top lands on that index
    const num = state.items.length;
    const anglePer = (Math.PI * 2) / num;
    const midAngle = finalTargetIndex * anglePer + anglePer / 2;
    const pointerAngle = -Math.PI / 2; // top

    state.fromAngle = normalizeAngle(state.angle);
    const targetAngle = normalizeAngle(-midAngle + pointerAngle);
    const revolutions = Math.PI * 2 * randomExtraSpins;
    state.toAngle = targetAngle + revolutions;
    state.spinDurationMs = 3000 + Math.random() * 1500; // 3.0-4.5s

    resultBadge.textContent = 'Spinning…';

    requestAnimationFrame(tick);

    function tick(now) {
      const t = Math.min(1, (now - state.spinStart) / state.spinDurationMs);
      const e = easeOutCubic(t);
      state.angle = lerpAngle(state.fromAngle, state.toAngle, e);
      drawWheel();
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        state.spinning = false;
        const pickedIdx = finalTargetIndex;
        state.lastPickedIndex = pickedIdx;
        const picked = state.items[pickedIdx];
        resultBadge.textContent = picked ?? '';
        appendHistory(picked);
        if (confettiToggle.checked) triggerConfetti();
        if (removeAfterPickToggle.checked && picked) {
          const newItems = state.items.filter((_, i) => i !== pickedIdx);
          setItems(newItems);
        }
      }
    }
  }

  function appendHistory(text) {
    if (!text) return;
    state.history.unshift(text);
    const li = document.createElement('li');
    li.textContent = text;
    historyList.prepend(li);
  }

  function clearHistory() {
    state.history = [];
    historyList.innerHTML = '';
  }

  // Confetti
  const confettiPieces = [];
  function triggerConfetti() {
    const count = 160;
    confettiPieces.length = 0;
    const rect = confettiCanvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: Math.random() * width,
        y: -10 - Math.random() * height * 0.2,
        vx: -1 + Math.random() * 2,
        vy: 2 + Math.random() * 3,
        size: 6 + Math.random() * 8,
        color: state.colors[i % state.colors.length],
        rotation: Math.random() * Math.PI * 2,
        vr: -0.2 + Math.random() * 0.4,
      });
    }

    const start = performance.now();
    const duration = 1500;

    function step(now) {
      const t = (now - start) / duration;
      drawConfetti();
      if (t < 1) requestAnimationFrame(step);
      else confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    requestAnimationFrame(step);
  }

  function drawConfetti() {
    const { width, height } = confettiCanvas;
    confettiCtx.clearRect(0, 0, width, height);
    confettiCtx.save();
    confettiCtx.scale(devicePixelRatio, devicePixelRatio);

    for (const p of confettiPieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02;
      p.rotation += p.vr;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rotation);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      confettiCtx.restore();
    }
    confettiCtx.restore();
  }

  function normalizeAngle(a) {
    const twoPi = Math.PI * 2;
    a = a % twoPi;
    return a < 0 ? a + twoPi : a;
  }
  function lerpAngle(a, b, t) { return a + (b - a) * t; }

  // Events
  itemsInput.addEventListener('input', () => {
    state.items = parseItems(itemsInput.value);
    drawWheel();
    saveToUrl();
  });
  spinButton.addEventListener('click', spin);
  shuffleButton.addEventListener('click', () => {
    setItems(shuffle(state.items));
  });
  clearButton.addEventListener('click', () => {
    setItems([]);
    resultBadge.textContent = '';
  });
  addSampleButton.addEventListener('click', () => {
    setItems(sampleItems);
  });
  shareButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareButton.textContent = 'Link copied';
      setTimeout(() => (shareButton.textContent = 'Copy share link'), 1200);
    } catch {}
  });
  clearHistoryButton.addEventListener('click', clearHistory);

  // Init
  loadFromUrl();
  resizeCanvases();
  resultBadge.textContent = '';
})();