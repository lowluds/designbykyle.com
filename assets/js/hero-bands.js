(function(){
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const cfg = {
    cell: 88,            // logical square size in px, bigger squares per request
    bandHeight: 180,     // default height, use CSS var to override
    gridAlpha: 0.08,     // grid line alpha
    density: 0.015,      // fraction of cells animated per frame
    maxActive: 6,        // limit active cells per band desktop
    speedMin: 2.0,       // seconds
    speedMax: 5.5,       // seconds
    fade: 0.35,          // seconds, ease in and out
    colors: [
      hexA(getVar('--cell-purple') || '#7c3aed', 0.65),
      hexA(getVar('--cell-blue')   || '#6366f1', 0.55),
      hexA(getVar('--cell-teal')   || '#22d3ee', 0.22)
    ]
  };

  function getVar(name){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function hexA(hex, a){
    const c = hex.replace('#','');
    const bigint = parseInt(c.length === 3 ? c.split('').map(x=>x+x).join('') : c, 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) cfg.maxActive = 0; // keep only grid

  // mobile adjustments
  if (window.matchMedia('(max-width: 640px)').matches) {
    cfg.maxActive = 3;
    cfg.cell = 72;
  }

  const bands = [
    { el: document.querySelector('.hero-band--top'), phase: 0.0 },
    { el: document.querySelector('.hero-band--bottom'), phase: 0.42 }
  ].filter(b => b.el);

  if (!bands.length) return;

  // each band owns its canvas context and cell map
  bands.forEach(setupBand);
  window.addEventListener('resize', debounce(() => bands.forEach(setupBand), 150));

  let last = performance.now();
  requestAnimationFrame(tick);

  function tick(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    bands.forEach(b => drawBand(b, dt));
    requestAnimationFrame(tick);
  }

  function setupBand(b){
    const el = b.el;
    const rect = el.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    // size canvas with DPR for sharp grid
    el.width = w * DPR;
    el.height = h * DPR;
    b.ctx = el.getContext('2d');
    b.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // grid layout
    b.cols = Math.ceil(w / cfg.cell);
    b.rows = Math.ceil(h / cfg.cell);
    b.w = w; b.h = h;
    b.active = [];

    // draw static grid once per resize
    drawGrid(b);
  }

  function drawGrid(b){
    const {ctx, w, h} = b;
    ctx.clearRect(0,0,w,h);
    ctx.save();
    ctx.strokeStyle = `rgba(255,255,255,${cfg.gridAlpha})`;
    ctx.lineWidth = 1;
    // horizontal
    for(let y=0; y<=h; y += cfg.cell){
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
    }
    // vertical
    for(let x=0; x<=w; x += cfg.cell){
      ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke();
    }
    ctx.restore();
  }

  function drawBand(b, dt){
    const {ctx, w, h, cols, rows} = b;
    if (!ctx) return;

    // redraw grid faintly to slowly erase trails, creates soft persistence
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0,0,w,h);
    drawGrid(b);

    // spawn new animations at a low rate
    const target = Math.min(cfg.maxActive, Math.round(cols * rows * cfg.density));
    if (b.active.length < target && Math.random() < 0.25){
      b.active.push(spawn(b));
    }

    // draw active cells
    b.active = b.active.filter(cell => {
      cell.t += dt;
      const done = cell.t >= cell.dur + cfg.fade * 2;
      if (!done) renderCell(ctx, cell);
      return !done;
    });
  }

  function spawn(b){
    const x = Math.floor(Math.random() * b.cols) * cfg.cell;
    const y = Math.floor(Math.random() * b.rows) * cfg.cell;
    const dur = lerp(cfg.speedMin, cfg.speedMax, Math.random());
    const color = cfg.colors[(Math.random() * cfg.colors.length) | 0];
    const stripes = 4 + (Math.random() * 6) | 0; // 4 to 9 stripes
    const dir = Math.random() < 0.5 ? 'h' : 'v';
    return { x, y, dur, t: 0, color, stripes, dir };
  }

  function renderCell(ctx, c){
    const pad = 6; // keep borders visible
    const size = cfg.cell - pad * 2;
    const x = c.x + pad, y = c.y + pad;

    // ease in and out
    const t = c.t, d = c.dur, f = cfg.fade;
    let a = 1.0;
    if (t < f) a = t / f;
    else if (t > d + f) a = 1 - Math.min(1, (t - d - f) / f);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = c.color;

    // fill the base cell
    ctx.fillRect(x, y, size, size);

    // add moving stripes inside the cell, slow sweep
    ctx.globalAlpha = a * 0.55;
    const stripeW = size / (c.stripes * 1.5);
    const offset = (t % c.dur) / c.dur * size; // 0 to size

    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    if (c.dir === 'h'){
      for(let i = -1; i < c.stripes + 2; i++){
        const yy = y + ((i * stripeW * 1.7 + offset) % size);
        ctx.fillRect(x, yy, size, stripeW);
      }
    } else {
      for(let i = -1; i < c.stripes + 2; i++){
        const xx = x + ((i * stripeW * 1.7 + offset) % size);
        ctx.fillRect(xx, y, stripeW, size);
      }
    }

    ctx.restore();
  }

  function lerp(a,b,t){ return a + (b - a) * t; }
  function debounce(fn, w){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), w); }; }
})();
