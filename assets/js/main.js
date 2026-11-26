import { initPaper } from './reader.js';

initPaper({ pdf: 'paper/Apple_Stock_Analysis_Presentation.pdf', meta: '0.8 MB', unit: 'slides', viewerHash: 'zoom=page-fit&pagemode=none' });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#61BB46', '#FDB827', '#F5821F', '#E03A3E', '#963D97', '#009DDC'];
const svgNS = 'http://www.w3.org/2000/svg';

/* ============================================================
   Figure 1: 44 years of AAPL (monthly close, split-adjusted)
   ============================================================ */
const MILESTONES = [
  { m: '1983-01', label: 'Lisa' },
  { m: '1984-01', label: 'Macintosh' },
  { m: '1991-10', label: 'PowerBook' },
  { m: '1998-08', label: 'iMac' },
  { m: '2001-11', label: 'iPod' },
  { m: '2007-06', label: 'iPhone' },
  { m: '2010-04', label: 'iPad' },
  { m: '2015-04', label: 'Apple Watch' },
];

async function buildPriceChart() {
  const host = document.getElementById('priceChart');
  const readout = document.getElementById('readout');
  const data = await (await fetch('assets/data/aapl_monthly.json')).json();
  const W = 1060, H = 430, L = 62, R = 20, T = 56, B = 40;
  const n = data.length;
  const x = (i) => L + (i / (n - 1)) * (W - L - R);
  let scale = 'log';
  const minV = 0.05, maxV = 260;
  const yLog = (v) => T + (1 - (Math.log10(v) - Math.log10(minV)) / (Math.log10(maxV) - Math.log10(minV))) * (H - T - B);
  const yLin = (v) => T + (1 - v / maxV) * (H - T - B);
  const yOf = (v) => (scale === 'log' ? yLog(v) : yLin(v));
  const idx = Object.fromEntries(data.map((d, i) => [d[0], i]));

  host.innerHTML = '';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  host.appendChild(svg);
  const gGrid = document.createElementNS(svgNS, 'g');
  const gMiles = document.createElementNS(svgNS, 'g');
  svg.append(gGrid, gMiles);

  // rainbow gradient for the line
  svg.insertAdjacentHTML('afterbegin', `<defs><linearGradient id="rb" x1="0" x2="1" y1="0" y2="0">${COLORS.map((c, i) => `<stop offset="${(i / 5) * 100}%" stop-color="${c}"/>`).join('')}</linearGradient></defs>`);
  const area = document.createElementNS(svgNS, 'path');
  area.setAttribute('fill', 'rgba(29,29,31,0.05)');
  const line = document.createElementNS(svgNS, 'path');
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', 'url(#rb)');
  line.setAttribute('stroke-width', '3');
  line.setAttribute('stroke-linejoin', 'round');
  svg.append(area, line);

  // year axis
  for (let yr = 1985; yr <= 2020; yr += 5) {
    const i = idx[`${yr}-01`];
    gGrid.insertAdjacentHTML('beforeend', `<text x="${x(i)}" y="${H - 12}" font-size="16" text-anchor="middle" fill="#5E5E63">${yr}</text>`);
  }

  const cross = document.createElementNS(svgNS, 'line');
  cross.setAttribute('stroke', '#1D1D1F');
  cross.setAttribute('stroke-width', '1');
  cross.setAttribute('stroke-dasharray', '3 4');
  cross.setAttribute('opacity', '0');
  const dot = document.createElementNS(svgNS, 'circle');
  dot.setAttribute('r', '6');
  dot.setAttribute('fill', '#fff');
  dot.setAttribute('stroke', '#1D1D1F');
  dot.setAttribute('stroke-width', '2.5');
  dot.setAttribute('opacity', '0');
  svg.append(cross, dot);

  function draw(animate) {
    // horizontal grid
    gGrid.querySelectorAll('.h').forEach((e) => e.remove());
    const ticks = scale === 'log' ? [0.1, 1, 10, 100] : [0, 50, 100, 150, 200, 250];
    ticks.forEach((v) => {
      const y = yOf(Math.max(v, minV));
      gGrid.insertAdjacentHTML('beforeend', `<line class="h" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#ECE9E1"/><text class="h" x="${L - 10}" y="${y + 5}" font-size="15" text-anchor="end" fill="#5E5E63">$${v < 1 ? v.toFixed(2) : v}</text>`);
    });
    const pts = data.map((d, i) => `${x(i).toFixed(1)},${yOf(Math.max(d[1], minV)).toFixed(1)}`);
    line.setAttribute('d', 'M' + pts.join('L'));
    area.setAttribute('d', `M${x(0)},${H - B}L${pts.join('L')}L${x(n - 1)},${H - B}Z`);
    // milestones
    gMiles.innerHTML = '';
    MILESTONES.forEach((m, k) => {
      const i = idx[m.m];
      const c = COLORS[k % 6];
      const yv = yOf(Math.max(data[i][1], minV));
      const ly = k % 2 ? 30 : 46;
      gMiles.insertAdjacentHTML('beforeend',
        `<line x1="${x(i)}" x2="${x(i)}" y1="${ly + 6}" y2="${yv}" stroke="${c}" stroke-width="1.5" stroke-dasharray="2 4"/>` +
        `<circle cx="${x(i)}" cy="${yv}" r="5" fill="${c}" stroke="#fff" stroke-width="2"/>` +
        `<text x="${x(i)}" y="${ly}" font-size="17" font-style="italic" text-anchor="middle" fill="#1D1D1F">${m.label}</text>`);
    });
    if (animate && !reduceMotion) {
      const len = line.getTotalLength();
      line.style.transition = 'none';
      line.style.strokeDasharray = `${len}`;
      line.style.strokeDashoffset = `${len}`;
      line.getBoundingClientRect();
      line.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.22,1,0.36,1)';
      line.style.strokeDashoffset = '0';
    } else {
      line.style.strokeDasharray = '';
      line.style.strokeDashoffset = '';
    }
  }

  // draw once visible
  let drawn = false;
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting) && !drawn) { drawn = true; draw(true); io.disconnect(); }
  }, { threshold: 0.25 });
  io.observe(host);
  draw(false);
  line.style.strokeDasharray = '1 99999';

  document.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => {
    scale = b.dataset.scale;
    document.querySelectorAll('.seg-btn').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    drawn = true;
    draw(false);
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function onMove(clientX) {
    const r = svg.getBoundingClientRect();
    const sx = ((clientX - r.left) / r.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round(((sx - L) / (W - L - R)) * (n - 1))));
    const [m, v] = data[i];
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i));
    cross.setAttribute('y1', T - 10); cross.setAttribute('y2', H - B);
    dot.setAttribute('cx', x(i)); dot.setAttribute('cy', yOf(Math.max(v, minV)));
    cross.setAttribute('opacity', '0.6'); dot.setAttribute('opacity', '1');
    const [yy, mm] = m.split('-');
    readout.textContent = `${months[Number(mm) - 1]} ${yy}: $${v < 1 ? v.toFixed(3) : v.toFixed(2)}`;
  }
  svg.addEventListener('mousemove', (e) => onMove(e.clientX));
  svg.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
  svg.addEventListener('mouseleave', () => { cross.setAttribute('opacity', '0'); dot.setAttribute('opacity', '0'); readout.textContent = 'Hover over the chart'; });
}

/* ============================================================
   Figure 2: product families (Hive output in the presentation)
   ============================================================ */
const TOP = [
  ['68000 (Lisa)', 3, 14.2282], ['Printers', 9, 9.7502], ['AirPort Express', 3, 6.7924], ['iPod Shuffle', 5, 5.6615],
  ['Quadra', 7, 4.8319], ['Display', 7, 4.7505], ['PowerBook Duo', 5, 4.4986], ['Macintosh Server', 5, 4.4329],
  ['Apple II', 10, 4.2853], ['iPod Classic', 9, 3.6919],
];
const BOTTOM = [
  ['Modems', 4, -13.2951], ['MacBook', 10, -4.5048], ['PowerBook G3', 4, -4.3048], ['PowerBook 100', 8, -3.5635],
  ['Workgroup Server', 5, -3.3392], ['MacBook Air', 17, -3.3355], ['Keyboards', 7, -2.7514], ['Mac Mini', 13, -2.2377],
  ['Speakers', 9, -1.6655], ['iPhone', 30, -1.4152],
];
function buildBars(id, rows, neg) {
  const el = document.getElementById(id);
  const max = 14.5;
  el.innerHTML = rows.map(([name, nRel, v], k) => `
    <div class="bar-row"><span class="bar-name">${name}<small>${nRel}</small></span>
      <span class="bar-track"><span class="bar-fill" data-w="${(Math.abs(v) / max) * 100}" style="background:${neg ? '' : COLORS[k % 6]}"></span></span>
      <span class="bar-val">${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%</span></div>`).join('');
  if (neg) el.classList.add('neg');
  const fill = () => el.querySelectorAll('.bar-fill').forEach((f, k) => setTimeout(() => { f.style.width = `${f.dataset.w}%`; }, reduceMotion ? 0 : k * 70));
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { fill(); io.disconnect(); } }, { threshold: 0.3 });
  io.observe(el);
}

/* ============================================================
   Figure 3: SEC filing types, return vs volatility
   ============================================================ */
const FILINGS = [
  // type, avg return %, n (return), volatility %, group
  ['424B2', 1.4716, 56, 0.8843, 'debt'], ['SD', 1.3951, 11, 0.7398, 'other'], ['8-K', 1.3165, 210, 2.3207, 'events'],
  ['FWP', 1.2982, 28, 0.9455, 'debt'], ['8-A12B', 1.2893, 6, 1.0979, 'other'], ['CORRESP', 1.2094, 20, 1.8276, 'other'],
  ['PX14A6G', 1.1171, 38, 1.3495, 'proxy'], ['144', 1.0448, 13, 0.7890, 'insider'], ['10-Q', 0.8714, 90, 1.9612, 'reports'],
  ['UPLOAD', 0.7703, 28, 1.3940, 'other'], ['SC 13G', 0.6602, 21, 2.2688, 'insider'], ['4', 0.6199, 1243, 1.4154, 'insider'],
  ['DEFA14A', 0.1172, 20, 1.5026, 'proxy'], ['S-8', 0.0533, 29, 2.1057, 'other'], ['3', -0.0302, 34, 1.5795, 'insider'],
  ['10-K', -0.0982, 28, 1.8174, 'reports'], ['DEF 14A', -0.4020, 30, 1.6876, 'proxy'], ['NO ACT', -0.8938, 17, 2.1211, 'other'],
  ['PRE 14A', -1.0773, 6, 1.9677, 'proxy'], ['424B3', -1.7924, 6, 0.9928, 'debt'],
];
const GROUPS = {
  debt: ['#61BB46', 'Debt offerings'], events: ['#F5821F', 'Material events (8-K)'], reports: ['#009DDC', 'Annual and quarterly reports'],
  proxy: ['#963D97', 'Proxy and shareholder votes'], insider: ['#FDB827', 'Insider and ownership'], other: ['#9A9A9F', 'Other'],
};
const OFFSETS = { '8-A12B': [10, -6], 'FWP': [10, 2], '424B2': [10, 8], 'SD': [10, 8], '144': [-10, 6, 'end'], 'UPLOAD': [10, -10], 'PX14A6G': [10, 18], '4': [0, 6, 'middle'], '3': [-10, 5, 'end'], 'DEFA14A': [10, 10], 'CORRESP': [10, 5], '10-K': [10, 5], 'S-8': [10, 5], 'NO ACT': [10, 5], '10-Q': [10, 5] };
function buildScatter() {
  const host = document.getElementById('filingScatter');
  const W = 1000, H = 520, L = 70, R = 30, T = 30, B = 60;
  const x = (v) => L + ((v + 2.1) / (1.8 + 2.1)) * (W - L - R);
  const y = (v) => T + (1 - (v - 0.6) / (2.6 - 0.6)) * (H - T - B);
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="${svgNS}">`;
  for (let v = -2; v <= 1.5; v += 0.5) s += `<line x1="${x(v)}" x2="${x(v)}" y1="${T}" y2="${H - B}" stroke="${v === 0 ? '#1D1D1F' : '#EEEBE3'}" ${v === 0 ? 'stroke-dasharray="4 5"' : ''}/><text x="${x(v)}" y="${H - B + 24}" font-size="16" text-anchor="middle" fill="#5E5E63">${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%</text>`;
  for (let v = 0.75; v <= 2.5; v += 0.25) s += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#F3F1EA"/>`;
  [1, 1.5, 2, 2.5].forEach((v) => { s += `<text x="${L - 10}" y="${y(v) + 5}" font-size="16" text-anchor="end" fill="#5E5E63">${v.toFixed(1)}%</text>`; });
  s += `<text x="${(L + W - R) / 2}" y="${H - 8}" font-size="17" text-anchor="middle" fill="#1D1D1F" font-style="italic">Average return after filing</text>`;
  s += `<text transform="translate(18 ${(T + H - B) / 2}) rotate(-90)" font-size="17" text-anchor="middle" fill="#1D1D1F" font-style="italic">Volatility after filing</text>`;
  FILINGS.forEach(([t, r, n, v, g]) => {
    const rad = 5 + Math.sqrt(n) * 0.55;
    const [c] = GROUPS[g];
    const [dx, dy, anchor] = OFFSETS[t] || [rad + 5, 5];
    s += `<g class="pt"><circle cx="${x(r)}" cy="${y(v)}" r="${rad}" fill="${c}" fill-opacity="0.78" stroke="#fff" stroke-width="2"><title>${t}: ${r > 0 ? '+' : ''}${r.toFixed(2)}% return, ${v.toFixed(2)}% volatility, ${n} filings</title></circle>`;
    const lx = anchor === 'middle' ? x(r) : x(r) + (dx > 0 ? Math.max(dx, rad + 4) : Math.min(dx, -rad - 4));
    s += `<text x="${lx}" y="${y(v) + dy}" font-size="16" text-anchor="${anchor || 'start'}" fill="${anchor === 'middle' ? '#fff' : '#1D1D1F'}" font-weight="${anchor === 'middle' ? 600 : 400}">${t}</text></g>`;
  });
  s += '</svg>';
  host.innerHTML = s;
  document.getElementById('filingLegend').innerHTML = Object.values(GROUPS).map(([c, l]) => `<span><i style="background:${c}"></i>${l}</span>`).join('');
}

/* ---------- reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll('.band .inner, .band .inner-wide, .mac-window, .slides-card');
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  els.forEach((e) => e.classList.add('reveal'));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
}

buildPriceChart();
buildBars('famTop', TOP, false);
buildBars('famBottom', BOTTOM, true);
buildScatter();
initReveal();
