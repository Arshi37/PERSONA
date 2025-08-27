/*
  Wheel of Choice - Embeddable widget
  Minimal dependency-free canvas wheel with spin animation and result callbacks.

  Usage:
    const wheel = new WheelOfChoice(document.getElementById('wheel-root'), {
      items: ['Alice', 'Bob', 'Charlie'],
      removeChosenItem: false,
      spinDurationMs: 4500,
      colors: [] // optional custom colors
    });
    // wheel.spin();
*/

(function () {
  const DEFAULT_COLORS = [
    '#FF6B6B', '#4ECDC4', '#FFD93D', '#6A4C93', '#45B7D1', '#96CEB4', '#FF8C42',
    '#9B5DE5', '#00BBF9', '#F15BB5', '#2EC4B6', '#E71D36', '#FF9F1C', '#1A936F'
  ];

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  class WheelOfChoice {
    constructor(containerElement, options = {}) {
      if (!containerElement) {
        throw new Error('WheelOfChoice requires a valid container element.');
      }

      this.containerElement = containerElement;
      this.items = Array.isArray(options.items) ? options.items.slice() : [];
      this.removeChosenItem = Boolean(options.removeChosenItem);
      this.spinDurationMs = Number.isFinite(options.spinDurationMs) ? clamp(options.spinDurationMs, 1200, 12000) : 4500;
      this.colors = Array.isArray(options.colors) && options.colors.length > 0 ? options.colors.slice() : DEFAULT_COLORS;
      this.size = Number.isFinite(options.size) ? clamp(options.size, 180, 800) : 420;
      this._rotationRad = 0; // current rotation angle in radians
      this._isSpinning = false;
      this._history = [];

      this._buildDom();
      this._resizeCanvas();
      this._draw();

      window.addEventListener('resize', () => {
        this._resizeCanvas();
        this._draw();
      });
    }

    setItems(newItems) {
      this.items = Array.isArray(newItems) ? newItems.filter(Boolean) : [];
      this._draw();
    }

    getItems() {
      return this.items.slice();
    }

    getHistory() {
      return this._history.slice();
    }

    isSpinning() {
      return this._isSpinning;
    }

    spin() {
      if (this._isSpinning) return;
      if (!this.items || this.items.length === 0) return;

      this._isSpinning = true;
      this._emit('spinstart');

      const segmentCount = this.items.length;
      const segmentAngle = (Math.PI * 2) / Math.max(1, segmentCount);

      // Random target segment with random offset so it doesn't always stop at the same place
      const randomTargetIndex = Math.floor(Math.random() * segmentCount);
      const randomOffsetWithinSegment = (Math.random() - 0.5) * segmentAngle * 0.6; // small offset

      // Pointer is at angle = -Math.PI/2 (12 o'clock). We want the chosen segment center to land there.
      const targetSegmentCenter = (randomTargetIndex + 0.5) * segmentAngle;
      const pointerAngle = -Math.PI / 2;
      // Add multiple full rotations for nice effect
      const fullRotations = 6 + Math.floor(Math.random() * 3); // 6-8 turns
      const targetAngle = fullRotations * Math.PI * 2 + (pointerAngle - targetSegmentCenter) + randomOffsetWithinSegment;

      const startAngle = this._rotationRad;
      const deltaAngle = targetAngle - startAngle;
      const duration = this.spinDurationMs;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const t = clamp(elapsed / duration, 0, 1);
        const eased = easeOutCubic(t);
        this._rotationRad = startAngle + deltaAngle * eased;
        this._draw();
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          this._isSpinning = false;
          const winnerIndex = this._getWinnerIndexFromRotation();
          const winner = this.items[winnerIndex];
          this._history.unshift(winner);
          if (this.removeChosenItem && this.items.length > 1) {
            this.items.splice(winnerIndex, 1);
          }
          this._draw();
          this._emit('spinend', { winner });
        }
      };

      requestAnimationFrame(step);
    }

    on(eventName, handler) {
      if (!this._handlers) this._handlers = {};
      if (!this._handlers[eventName]) this._handlers[eventName] = new Set();
      this._handlers[eventName].add(handler);
      return () => this.off(eventName, handler);
    }

    off(eventName, handler) {
      if (!this._handlers || !this._handlers[eventName]) return;
      this._handlers[eventName].delete(handler);
    }

    _emit(eventName, detail) {
      if (!this._handlers || !this._handlers[eventName]) return;
      this._handlers[eventName].forEach((h) => {
        try { h(detail); } catch (e) { /* noop */ }
      });
    }

    _buildDom() {
      this.containerElement.classList.add('woc');

      // Canvas root
      const canvas = document.createElement('canvas');
      canvas.className = 'woc-canvas';
      this.canvas = canvas;

      // Overlay pointer
      const pointer = document.createElement('div');
      pointer.className = 'woc-pointer';
      this.pointer = pointer;

      // Controls
      const controls = document.createElement('div');
      controls.className = 'woc-controls';

      const spinButton = document.createElement('button');
      spinButton.type = 'button';
      spinButton.className = 'woc-spin-btn';
      spinButton.textContent = 'Spin';
      spinButton.addEventListener('click', () => this.spin());

      controls.appendChild(spinButton);

      const result = document.createElement('div');
      result.className = 'woc-result';
      this.resultEl = result;

      const history = document.createElement('div');
      history.className = 'woc-history';
      history.innerHTML = '<div class="woc-history-title">History</div><ul class="woc-history-list"></ul>';
      this.historyListEl = history.querySelector('.woc-history-list');

      this.containerElement.appendChild(canvas);
      this.containerElement.appendChild(pointer);
      this.containerElement.appendChild(controls);
      this.containerElement.appendChild(result);
      this.containerElement.appendChild(history);
    }

    _resizeCanvas() {
      const rect = this.containerElement.getBoundingClientRect();
      const maxSize = Math.min(rect.width || this.size, this.size);
      const size = Math.max(200, Math.floor(maxSize));
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = size * dpr;
      this.canvas.height = size * dpr;
      this.canvas.style.width = size + 'px';
      this.canvas.style.height = size + 'px';
      this._ctx = this.canvas.getContext('2d');
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._radius = size / 2 - 6; // padding for stroke
    }

    _draw() {
      const ctx = this._ctx;
      if (!ctx) return;
      const width = this.canvas.clientWidth;
      const height = this.canvas.clientHeight;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this._rotationRad);

      const items = this.items.length > 0 ? this.items : ['Add items'];
      const n = items.length;
      const angle = (Math.PI * 2) / n;

      // Draw slices
      for (let i = 0; i < n; i++) {
        const start = i * angle;
        const end = start + angle;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, this._radius, start, end);
        ctx.closePath();
        ctx.fillStyle = this.colors[i % this.colors.length];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      // Draw labels
      ctx.fillStyle = '#12212b';
      ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textRadius = this._radius * 0.68;
      for (let i = 0; i < n; i++) {
        const theta = (i + 0.5) * angle; // center of slice
        ctx.save();
        ctx.rotate(theta);
        ctx.translate(textRadius, 0);
        ctx.rotate(Math.PI / 2);
        const text = String(items[i]);
        const maxWidth = this._radius * 0.9;
        this._fillFittedText(ctx, text, maxWidth);
        ctx.restore();
      }

      ctx.restore();

      // Update result and history UI
      const winnerIndex = this.items.length ? this._getWinnerIndexFromRotation() : -1;
      this._updateResultUI(winnerIndex);
      this._updateHistoryUI();
    }

    _fillFittedText(ctx, text, maxWidth) {
      let fontSize = 16;
      ctx.font = `600 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
      let metrics = ctx.measureText(text);
      while (metrics.width > maxWidth && fontSize > 10) {
        fontSize -= 1;
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
        metrics = ctx.measureText(text);
      }
      if (metrics.width > maxWidth) {
        // Truncate with ellipsis
        let truncated = text;
        while (ctx.measureText(truncated + '…').width > maxWidth && truncated.length > 1) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated + '…', 0, 0);
      } else {
        ctx.fillText(text, 0, 0);
      }
    }

    _getWinnerIndexFromRotation() {
      if (!this.items || this.items.length === 0) return -1;
      const n = this.items.length;
      const anglePer = (Math.PI * 2) / n;
      // Pointer at -PI/2. Effective angle for slice index:
      const effective = mod(-this._rotationRad - Math.PI / 2, Math.PI * 2);
      const index = Math.floor(effective / anglePer);
      // We drew slices increasing clockwise when rotating canvas; adjust orientation:
      const winnerIndex = mod(index, n);
      return winnerIndex;
    }

    _updateResultUI(winnerIndex) {
      if (winnerIndex < 0 || !this.items.length) {
        this.resultEl.textContent = '';
        return;
      }
      const winner = this.items[winnerIndex];
      this.resultEl.innerHTML = `<span class="woc-result-label">Next up:</span> <span class="woc-result-winner">${this._escapeHtml(String(winner))}</span>`;
    }

    _updateHistoryUI() {
      if (!this.historyListEl) return;
      this.historyListEl.innerHTML = '';
      this._history.slice(0, 10).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        this.historyListEl.appendChild(li);
      });
    }

    _escapeHtml(str) {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
      return str.replace(/[&<>"']/g, (m) => map[m]);
    }
  }

  // UMD-lite export
  if (typeof window !== 'undefined') {
    window.WheelOfChoice = WheelOfChoice;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = WheelOfChoice;
  }
})();

