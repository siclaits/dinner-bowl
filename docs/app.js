// Dinner Bowl Picker: one spin picks a base, a protein, a produce, toppings and a sauce.
(() => {
  'use strict';

  // Same key as the Claude Design prototype, so lists saved there carry over.
  const KEY = 'dinnerBowlPantry.v1';
  const TOPPING_COUNT = 2; // 1 to 4
  const SPIN_MS = 1400;
  const TICK_MS = 70;
  const STAGGER_MS = 160;
  const HISTORY_LIMIT = 50;

  const CATS = [
    { id: 'base', label: 'Bases', one: 'Base', bg: 'oklch(0.86 0.09 25)', ink: 'oklch(0.42 0.12 22)', chipInk: 'oklch(0.3 0.09 22)' },
    { id: 'protein', label: 'Proteins', one: 'Protein', bg: 'oklch(0.91 0.06 60)', ink: 'oklch(0.45 0.11 55)', chipInk: 'oklch(0.32 0.08 55)' },
    { id: 'produce', label: 'Produce', one: 'Produce', bg: 'oklch(0.93 0.07 98)', ink: 'oklch(0.45 0.09 95)', chipInk: 'oklch(0.32 0.07 95)' },
    { id: 'topping', label: 'Toppings', one: 'Topping', bg: 'oklch(0.91 0.06 145)', ink: 'oklch(0.42 0.09 145)', chipInk: 'oklch(0.3 0.07 145)' },
    { id: 'sauce', label: 'Sauces', one: 'Sauce', bg: 'oklch(0.9 0.05 240)', ink: 'oklch(0.42 0.1 245)', chipInk: 'oklch(0.3 0.08 245)' },
  ];

  const DEFAULTS = {
    base: ['Jasmine rice', 'Quinoa', 'Mixed greens', 'Soba noodles'],
    protein: ['Grilled chicken', 'Crispy tofu', 'Salmon', 'Black beans'],
    produce: ['Avocado', 'Cucumber', 'Roasted sweet potato', 'Edamame'],
    topping: ['Sesame seeds', 'Pickled onions', 'Crispy shallots', 'Feta', 'Scallions', 'Kimchi'],
    sauce: ['Tahini', 'Peanut sauce', 'Sriracha mayo', 'Teriyaki'],
  };

  // First match wins. Names starting with "@" are the hand-drawn icons below.
  const ICONS = [
    [/shrimp|prawn/, 'shrimp'],
    [/salmon|tuna|fish|cod|tilapia|halibut/, 'fish'],
    [/chicken|turkey|duck/, 'bird'],
    [/beef|steak|pork|lamb|bacon|sausage|chorizo|meatball/, 'cow'],
    [/egg/, 'egg'],
    [/tofu|tempeh|paneer/, 'cube'],
    [/sriracha|chili|chile|pepper|jalape|gochujang|harissa|hot sauce/, 'pepper'],
    [/avocado|guac/, 'avocado'],
    [/carrot/, 'carrot'],
    [/broccoli|cauliflower/, 'tree'],
    [/cheese|feta|parm|cheddar|mozz|cotija|goat/, 'cheese'],
    [/bread|crouton|pita|tortilla|naan/, 'bread'],
    [/lemon|lime|orange|citrus|yuzu|ponzu/, 'orange-slice'],
    [/kimchi|spicy/, 'flame'],
    [/sesame|seed|nut|almond|cashew|walnut|pecan|pistachio/, 'acorn'],
    [/potato|yam|fries|hash brown/, '@potato'],
    [/onion|shallot|leek/, '@onion'],
    [/pasta|spaghetti|penne|farfalle|rigatoni|fusilli|macaroni|gnocchi|orzo|linguine|fettuccine|tortellini|ravioli/, '@pasta'],
    [/noodle|soba|ramen|udon|vermicelli|pho/, 'bowl-steam'],
    [/rice|quinoa|grain|farro|barley|couscous|bulgur|corn|millet/, 'grains'],
    [/green|kale|lettuce|spinach|arugula|salad|cabbage|herb|cilantro|basil|scallion|mint|cucumber|zucchini|chard|bok choy/, 'leaf'],
    [/bean|chickpea|lentil|edamame|pea/, 'plant'],
  ];
  const CAT_ICON = { base: 'bowl-food', protein: 'fork-knife', produce: 'plant', topping: 'sparkle', sauce: 'drop' };

  const iconFor = (cat, name) => {
    const n = (name || '').toLowerCase();
    if (/mayo|aioli/.test(n)) return 'egg';
    if (cat === 'sauce' && !/sriracha|chili|pepper|gochujang|harissa|hot|ponzu|lemon|lime/.test(n)) return 'drop';
    const m = ICONS.find(([r]) => r.test(n));
    return m ? m[1] : CAT_ICON[cat];
  };

  // Hand-drawn icons in the Phosphor duotone style (16px stroke on a 256 grid, 20% fill).
  const STROKE = 'fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"';
  const DRAWN = {
    '@potato': `<svg viewBox="0 0 256 256" ${STROKE}><path d="M64 92c18-40 86-52 128-28 34 20 42 66 18 100-26 36-92 52-136 28C40 174 46 132 64 92Z" fill="currentColor" fill-opacity=".2" stroke="none"/><path d="M64 92c18-40 86-52 128-28 34 20 42 66 18 100-26 36-92 52-136 28C40 174 46 132 64 92Z"/><circle cx="104" cy="112" r="7" fill="currentColor" stroke="none"/><circle cx="156" cy="98" r="7" fill="currentColor" stroke="none"/><circle cx="128" cy="164" r="7" fill="currentColor" stroke="none"/><circle cx="178" cy="148" r="7" fill="currentColor" stroke="none"/></svg>`,
    '@onion': `<svg viewBox="0 0 256 256" ${STROKE}><path d="M128 76c-50 30-84 62-84 102 0 32 38 50 84 50s84-18 84-50c0-40-34-72-84-102Z" fill="currentColor" fill-opacity=".2" stroke="none"/><path d="M128 76c-50 30-84 62-84 102 0 32 38 50 84 50s84-18 84-50c0-40-34-72-84-102Z"/><path d="M128 76V28"/><path d="M128 50c-10-12-22-18-36-20"/><path d="M128 50c10-12 22-18 36-20"/><path d="M106 108c-22 30-26 72-8 114"/><path d="M150 108c22 30 26 72 8 114"/></svg>`,
    '@pasta': `<svg viewBox="0 0 256 256" ${STROKE}><path d="M114 128 40 76c-14 22-14 82 0 104Z" fill="currentColor" fill-opacity=".2" stroke="none"/><path d="M142 128l74-52c14 22 14 82 0 104Z" fill="currentColor" fill-opacity=".2" stroke="none"/><path d="M114 128 40 76c-14 22-14 82 0 104Z"/><path d="M142 128l74-52c14 22 14 82 0 104Z"/><rect x="114" y="104" width="28" height="48" rx="14" fill="currentColor" fill-opacity=".2"/><path d="M68 96v64"/><path d="M92 112v32"/><path d="M188 96v64"/><path d="M164 112v32"/></svg>`,
  };
  const iconSvg = (name) => DRAWN[name]
    || `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${window.PHOSPHOR_DUOTONE[name] || ''}</svg>`;

  const REROLL_SVG = '<svg class="slot-reroll" width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M128 40a88 88 0 1 0 62.2 25.8L216 92" fill="currentColor" fill-opacity=".2" stroke="none"/><path d="M128 40a88 88 0 1 0 62.2 25.8L216 92"/><path d="M216 44v48h-48"/></svg>';
  const CLOSE_SVG = '<svg width="13" height="13" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round" aria-hidden="true"><path d="M200 56 56 200M56 56l144 144"/></svg>';

  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const pickN = (a, n) => {
    const c = [...a]; const out = [];
    while (out.length < n && c.length) out.push(c.splice(Math.floor(Math.random() * c.length), 1)[0]);
    return out;
  };
  const choose = (n, k) => {
    if (k > n) return 0;
    let r = 1;
    for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
    return Math.round(r);
  };
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  // ── state ──
  const tCount = Math.max(1, Math.min(4, TOPPING_COUNT));
  const defs = [];
  CATS.forEach((c) => {
    const n = c.id === 'topping' ? tCount : 1;
    for (let i = 0; i < n; i++) defs.push({ cat: c.id, label: n > 1 ? `${c.one} ${i + 1}` : c.one, bg: c.bg, ink: c.ink, idx: i });
  });

  const loadPantry = () => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && CATS.every((c) => Array.isArray(s[c.id]))) return s;
    } catch (e) { /* storage unavailable */ }
    return DEFAULTS;
  };
  const persist = (pantry) => { try { localStorage.setItem(KEY, JSON.stringify(pantry)); } catch (e) { /* storage unavailable */ } };

  const state = { pantry: loadPantry(), picks: null, display: null, settled: [], spinning: false, history: [] };
  let timer = null;

  const makePicks = (pantry) => {
    const t = pickN(pantry.topping, tCount);
    return defs.map((s) => (s.cat === 'topping' ? (t[s.idx] ?? null) : (pantry[s.cat].length ? rand(pantry[s.cat]) : null)));
  };
  const combos = () => CATS.reduce((m, c) => m * (c.id === 'topping' ? choose(state.pantry.topping.length, tCount) : state.pantry[c.id].length), 1);

  const snapshot = (label) => {
    state.history = [...state.history.slice(-(HISTORY_LIMIT - 1)), { pantry: state.pantry, picks: state.picks, label }];
  };
  const savePantry = (pantry, label) => {
    snapshot(label || 'Undo list change');
    state.pantry = pantry;
    persist(pantry);
  };

  const undo = () => {
    if (state.spinning || !state.history.length) return;
    const last = state.history[state.history.length - 1];
    clearInterval(timer);
    Object.assign(state, { history: state.history.slice(0, -1), pantry: last.pantry, picks: last.picks, display: null, settled: [] });
    persist(last.pantry);
    render();
  };

  const runSpin = (targetIdx) => {
    if (state.spinning) return;
    const pantry = state.pantry;
    let picks;
    if (targetIdx == null) {
      picks = makePicks(pantry);
    } else {
      picks = [...(state.picks || makePicks(pantry))];
      const s = defs[targetIdx];
      const taken = picks.filter((p, i) => i !== targetIdx && defs[i].cat === s.cat);
      const pool = pantry[s.cat].filter((x) => !taken.includes(x) && x !== picks[targetIdx]);
      const fallback = pantry[s.cat].filter((x) => !taken.includes(x));
      picks[targetIdx] = pool.length ? rand(pool) : (fallback.length ? rand(fallback) : null);
    }
    const active = targetIdx == null ? defs.map((_, i) => i) : [targetIdx];
    const stopAt = {};
    active.forEach((i, k) => { stopAt[i] = SPIN_MS + k * STAGGER_MS; });
    const start = Date.now();
    snapshot(targetIdx == null ? 'Undo spin' : 'Undo re-roll');

    const tick = () => {
      const t = Date.now() - start;
      state.display = defs.map((s, i) => {
        if (!active.includes(i) || t >= stopAt[i]) return picks[i];
        return pantry[s.cat].length ? rand(pantry[s.cat]) : null;
      });
      state.settled = defs.map((_, i) => !active.includes(i) || t >= stopAt[i]);
      state.spinning = !state.settled.every(Boolean);
      if (!state.spinning) clearInterval(timer);
      render();
    };
    Object.assign(state, { picks, spinning: true });
    clearInterval(timer);
    tick();
    timer = setInterval(tick, TICK_MS);
  };

  // ── DOM ──
  const $ = (id) => document.getElementById(id);
  const undoBtn = $('undo');
  const spinBtn = $('spin');
  const combosEl = $('combos');

  $('topping-word').textContent = tCount === 1 ? 'a topping' : `${['', 'one', 'two', 'three', 'four'][tCount]} toppings`;

  const slotEls = defs.map((s, i) => {
    const b = el('button', 'slot');
    b.type = 'button';
    b.title = 'Re-roll this pick';
    const text = el('span', 'slot-text');
    const label = el('span', 'slot-label');
    label.textContent = s.label;
    label.style.color = s.ink;
    const value = el('span', 'slot-value');
    const mark = el('span');
    mark.style.background = s.bg;
    value.append(mark);
    text.append(label, value);
    const icon = el('span', 'slot-icon');
    icon.style.color = s.ink;
    icon.setAttribute('aria-hidden', 'true');
    b.append(text, icon);
    b.insertAdjacentHTML('beforeend', REROLL_SVG);
    b.lastElementChild.style.color = s.ink;
    b.addEventListener('click', () => runSpin(i));
    $('slots').append(b);
    return { b, value, mark, icon, iconName: null };
  });

  const catEls = CATS.map((c) => {
    const wrap = el('div', 'cat');
    const head = el('div', 'cat-head');
    const h = el('h3');
    h.textContent = c.label;
    const count = el('span', 'cat-count');
    head.append(h, count);
    const chips = el('div', 'chips');
    const row = el('div', 'add-row');
    const input = el('input', 'input');
    input.placeholder = `Add a ${c.one.toLowerCase()}…`;
    input.setAttribute('aria-label', `Add to ${c.label.toLowerCase()}`);
    input.enterKeyHint = 'done';
    const add = el('button', 'btn btn-secondary', 'Add');
    add.type = 'button';
    row.append(input, add);
    wrap.append(head, chips, row);
    $('cats').append(wrap);

    const commit = () => {
      const v = input.value.trim();
      if (!v) return;
      const items = state.pantry[c.id];
      if (!items.some((x) => x.toLowerCase() === v.toLowerCase())) savePantry({ ...state.pantry, [c.id]: [...items, v] });
      input.value = '';
      render();
    };
    add.addEventListener('click', commit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); });
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-remove');
      if (!btn) return;
      const name = btn.dataset.name;
      savePantry({ ...state.pantry, [c.id]: state.pantry[c.id].filter((x) => x !== name) });
      render();
    });
    return { count, chips, list: null };
  });

  function render() {
    const { pantry, picks, display, settled, spinning, history } = state;
    const shown = display || picks;

    defs.forEach((s, i) => {
      const r = slotEls[i];
      const v = shown ? shown[i] : null;
      const empty = !pantry[s.cat].length || (s.cat === 'topping' && s.idx >= pantry.topping.length);
      r.mark.textContent = empty ? `Add a ${s.cat}` : (v ?? '?');
      r.value.style.opacity = !shown || empty ? 0.4 : (settled[i] ? 1 : 0.55);
      r.b.disabled = spinning || empty;
      const showIcon = !!(shown && v && !empty && (!display || settled[i]));
      const iconName = showIcon ? iconFor(s.cat, v) : null;
      if (iconName !== r.iconName) {
        r.icon.innerHTML = iconName ? iconSvg(iconName) : '';
        r.iconName = iconName;
      }
    });

    CATS.forEach((c, k) => {
      const r = catEls[k];
      const items = pantry[c.id];
      const need = c.id === 'topping' ? tCount : 1;
      const short = items.length < need;
      r.count.textContent = short ? `Need at least ${need}` : `${items.length} on hand`;
      r.count.classList.toggle('short', short);
      if (r.list !== items) {
        r.list = items;
        r.chips.replaceChildren(...items.map((name) => {
          const chip = el('span', 'chip');
          chip.style.background = c.bg;
          chip.style.color = c.chipInk;
          chip.append(document.createTextNode(name));
          const x = el('button', 'chip-remove', CLOSE_SVG);
          x.type = 'button';
          x.title = 'Ran out';
          x.setAttribute('aria-label', `Remove ${name}`);
          x.dataset.name = name;
          chip.append(x);
          return chip;
        }));
      }
    });

    const n = combos();
    combosEl.textContent = n ? `${n.toLocaleString()} possible bowls` : 'Fill every list to spin';
    spinBtn.disabled = spinning;
    spinBtn.textContent = spinning ? 'Spinning…' : (picks ? 'Spin again' : 'Spin my bowl');
    undoBtn.disabled = spinning || !history.length;
    undoBtn.title = history.length ? history[history.length - 1].label : 'Nothing to undo';
  }

  spinBtn.addEventListener('click', () => { if (combos()) runSpin(null); });
  undoBtn.addEventListener('click', undo);
  $('reset').addEventListener('click', () => {
    savePantry(DEFAULTS);
    Object.assign(state, { picks: null, display: null });
    render();
  });

  render();
})();
