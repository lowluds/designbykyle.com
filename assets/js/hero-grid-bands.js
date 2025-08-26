(() => {
  // ===== CONFIG (tweak freely) =====
  const CONFIG = {
    bandHeightPx: { min: 110, max: 200 }, // actual height is controlled by CSS; this is for layout math fallback
    baseCell: 84,                          // ideal cell size in CSS pixels; we auto-adjust to be flush edge-to-edge
    lineOpacity: 0.08,                     // grid line intensity
    bgOpacity: 0.06,                       // base cell background shade

    // Animation pacing
    spawnEveryMs: 850,                     // add a new active cell roughly this often (sequential feel)
    maxSimultaneous: 5,                    // how many cells can be active at once per band
    fillDurationMs: 4200,                  // how long a cell stays filled/animated
    fillEase: t => 1 - Math.pow(1 - t, 3), // ease for stripe progress

    // Color scheme (reads your CSS variables if present)
    colors: {
      line: 'rgba(255,255,255,',           // final alpha appended at draw
      stripeA: getVar('--accent-primary', '#3b82f6'), // blue
      stripeB: getVar('--accent-secondary', '#8b5cf6'), // purple
      stripeHi: 'rgba(255,255,255,0.85)'
    },
  };

  function getVar(name, fallback) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || fallback;
  }

  class GridBand {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      this.active = [];      // active cells
      this.lastSpawn = 0;    // spawn timer
      this.lastTs = 0;
      this.cols = 0; this.rows = 0; this.cellSize = CONFIG.baseCell;
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(canvas.parentElement);
      this.resize();
    }

    resize() {
      const host = this.canvas.parentElement; // .hero-ambient
      const rect = host.getBoundingClientRect();
      const h = this.canvas.dataset.band === 'top' || this.canvas.dataset.band === 'bottom'
        ? Math.min(Math.max(CONFIG.bandHeightPx.min, rect.height * 0.16), CONFIG.bandHeightPx.max)
        : rect.height;

      // Fit width exactly with whole-number columns: adjust cell size so the grid is flush on both sides.
      const ideal = CONFIG.baseCell;
      const cols = Math.max(4, Math.round(rect.width / ideal));
      const cellSize = rect.width / cols; // adjusted so last column is flush at right edge

      this.cols = cols;
      this.rows = Math.max(2, Math.floor(h / cellSize));
      this.cellSize = cellSize;

      // Canvas pixels @ DPR
      const wPx = Math.round(rect.width * this.dpr);
      const hPx = Math.round(h * this.dpr);
      this.canvas.width = wPx;
      this.canvas.height = hPx;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = h + 'px';

      // Cache for drawing
      this.gridW = rect.width; this.gridH = h;
      this.clear();
    }

    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    spawnCell(now) {
      if (this.active.length >= CONFIG.maxSimultaneous) return;
      // choose a random cell coordinate not already active
      const taken = new Set(this.active.map(a => `${a.c},${a.r}`));
      let tries = 40;
      while (tries--) {
        const c = Math.floor(Math.random() * this.cols);
        const r = Math.floor(Math.random() * this.rows);
        const key = `${c},${r}`;
        if (!taken.has(key)) {
          const hueShift = Math.random() * 0.12 - 0.06; // slight color variance
          this.active.push({ c, r, t0: now, life: CONFIG.fillDurationMs, hueShift });
          return;
        }
      }
    }

    drawGridLines() {
      const { ctx, dpr, cellSize } = this;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = `${CONFIG.colors.line}${CONFIG.lineOpacity})`;
      ctx.lineWidth = 1;

      // verticals
      for (let x = 0; x <= this.gridW + 0.5; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, this.gridH);
        ctx.stroke();
      }
      // horizontals
      for (let y = 0; y <= this.gridH + 0.5; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(this.gridW, y + 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawActive(now) {
      const { ctx, dpr, cellSize } = this;
      ctx.save();
      ctx.scale(dpr, dpr);

      const toRemove = [];
      for (let i = 0; i < this.active.length; i++) {
        const a = this.active[i];
        const elapsed = now - a.t0;
        const t = Math.min(1, elapsed / a.life);
        const ease = CONFIG.fillEase(t);
        const x = a.c * cellSize;
        const y = a.r * cellSize;

        // background wash
        ctx.fillStyle = `rgba(139, 92, 246, ${CONFIG.bgOpacity})`;
        ctx.fillRect(x, y, cellSize, cellSize);

        // stripes filling from left to right
        const stripeW = Math.max(4, cellSize / 10);
        const progressW = ease * cellSize;
        for (let sx = 0; sx < progressW; sx += stripeW * 2) {
          const w = Math.min(stripeW, progressW - sx);
          ctx.fillStyle = i % 2 ? CONFIG.colors.stripeA : CONFIG.colors.stripeB;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(x + sx, y, w, cellSize);
          ctx.globalAlpha = 1;
        }

        // subtle highlight bar
        const hiW = Math.min(6, cellSize * 0.06);
        ctx.fillStyle = CONFIG.colors.stripeHi;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(x, y, Math.max(hiW, progressW * 0.1), cellSize);
        ctx.globalAlpha = 1;

        if (elapsed >= a.life) toRemove.push(i);
      }

      // remove finished
      for (let j = toRemove.length - 1; j >= 0; j--) {
        this.active.splice(toRemove[j], 1);
      }

      ctx.restore();
    }

    frame(now) {
      if (!this.lastTs) this.lastTs = now;

      // spawn sequentially
      if (now - this.lastSpawn > CONFIG.spawnEveryMs) {
        this.spawnCell(now);
        this.lastSpawn = now;
      }

      this.clear();
      this.drawGridLines();
      this.drawActive(now);
    }
  }

  // Boot both bands when the DOM is ready
  const boot = () => {
    const canvases = document.querySelectorAll('.grid-band');
    if (!canvases.length) return;

    const bands = Array.from(canvases).map(c => new GridBand(c));

    let rafId = null;
    const loop = (ts) => {
      for (const b of bands) b.frame(ts);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // Clean up on SPA nav if needed
    window.addEventListener('beforeunload', () => cancelAnimationFrame(rafId));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
