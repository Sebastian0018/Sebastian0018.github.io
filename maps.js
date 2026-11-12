/* Maps page: builds the atlas (index, text page, plates, divider) from window.PLATES
   (maps/plates.js) and writes the scroll-fill words. See maps/README.md. */
(() => {
    'use strict';
    const $ = (id) => document.getElementById(id);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    /* ===== B. Plates ===== */
    const roman = (n) => [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]]
        .reduce((s, [r, v]) => { while (n >= v) { s += r; n -= v; } return s; }, '');
    const PLATES = window.PLATES.slice();
    const file = (p, suffix) => `maps/img/${p.img || p.id}${suffix}.webp`;
    const stage = $('stage'), range = $('range'), panel = $('panel'), rail = $('rail'), select = $('under-select');

    /* ===== C. Index: rail tabs and the contents dialog ===== */
    const toc = $('toc'), tocGrid = $('toc-grid');
    PLATES.forEach((p, i) => {
        const t = document.createElement('button');
        t.className = 'rtab'; t.type = 'button'; t.id = `tab-${p.id}`;
        t.setAttribute('role', 'tab'); t.setAttribute('aria-controls', 'panel');
        t.innerHTML = `<img src="${file(p, '-thumb')}" alt="" width="240" height="315" loading="lazy" decoding="async"><span class="t"><span class="num">${p.no}</span><b>${p.tab}</b></span>`;
        t.addEventListener('click', () => go(i));
        rail.appendChild(t);

        const li = document.createElement('li');
        li.innerHTML = `<button type="button"><img src="${file(p, '-thumb')}" alt="" width="240" height="315" loading="lazy" decoding="async"><span><span class="num">Plate ${p.no}</span><b>${p.title}</b></span></button>`;
        li.firstChild.addEventListener('click', () => { toc.close(); go(i); });
        tocGrid.appendChild(li);
    });
    const tabs = [...rail.children], tocBtns = [...tocGrid.querySelectorAll('button')];
    $('rail-count').textContent = PLATES.length;
    $('toc-count').textContent = `${PLATES.length} plates`;
    $('open-toc').addEventListener('click', () => toc.showModal());
    $('close-toc').addEventListener('click', () => toc.close());
    toc.addEventListener('click', (e) => { if (e.target === toc) toc.close(); });   // click on the backdrop
    rail.addEventListener('keydown', (e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        const next = Math.max(0, Math.min(PLATES.length - 1, state.main + step));
        go(next); tabs[next].focus();
    });

    /* ===== D. The divider: one number, written once per frame ===== */
    let reveal = 100, target = 100, raf = 0, tweenId = 0;
    const paint = () => {
        stage.style.setProperty('--reveal', `${reveal}%`);
        stage.dataset.side = reveal > 97 ? 'top' : reveal < 3 ? 'under' : 'both';
        range.value = Math.round(reveal);
    };
    // follow(): ease towards where the pointer is, so the line trails the hand slightly
    const follow = (v) => {
        target = Math.max(0, Math.min(100, v)); tweenId++;
        if (reduced.matches) { reveal = target; paint(); return; }
        if (raf) return;
        const step = () => {
            reveal += (target - reveal) * 0.24;
            if (Math.abs(target - reveal) < 0.05) { reveal = target; raf = 0; } else raf = requestAnimationFrame(step);
            paint();
        };
        raf = requestAnimationFrame(step);
    };
    // sweep(): a timed move, used when a plate is laid down
    const sweep = (to, ms) => new Promise((done) => {
        cancelAnimationFrame(raf); raf = 0;
        const id = ++tweenId, from = reveal, t0 = performance.now();
        if (reduced.matches || ms <= 0) { reveal = target = to; paint(); return done(true); }
        const step = (now) => {
            if (id !== tweenId) return done(false);            // something else took over
            const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 4);
            reveal = target = from + (to - from) * e; paint();
            k < 1 ? requestAnimationFrame(step) : done(true);
        };
        requestAnimationFrame(step);
    });

    const fromPointer = (e) => { const r = stage.getBoundingClientRect(); follow(((e.clientX - r.left) / r.width) * 100); };
    stage.addEventListener('pointerdown', (e) => {
        if (e.button || e.target === range) return;
        stage.setPointerCapture(e.pointerId); stage.classList.add('is-held'); fromPointer(e);   // a plain click also places the line
    });
    stage.addEventListener('pointermove', (e) => { if (stage.hasPointerCapture(e.pointerId)) fromPointer(e); });
    ['pointerup', 'pointercancel'].forEach((ev) => stage.addEventListener(ev, () => stage.classList.remove('is-held')));
    range.addEventListener('input', () => { cancelAnimationFrame(raf); raf = 0; tweenId++; reveal = target = +range.value; paint(); });   // keyboard: exact steps, no easing

    /* ===== E. Layers: one <img> per plate, made on demand ===== */
    const layers = new Map();
    const layer = (i) => {
        if (!layers.has(i)) {
            const img = new Image();
            img.width = 1900; img.height = 2040; img.alt = ''; img.decoding = 'async'; img.draggable = false;
            // half-size file unless the stage really needs more pixels
            img.src = file(PLATES[i], stage.clientWidth * devicePixelRatio > 1000 ? '' : '-950');
            stage.insertBefore(img, stage.firstChild);
            layers.set(i, img);
        }
        return layers.get(i);
    };
    const ready = (i) => layer(i).decode().catch(() => {});

    const state = { main: -1, under: -1 };
    let seq = 0;

    const renderText = (i) => {
        const p = PLATES[i];
        panel.setAttribute('aria-labelledby', `tab-${p.id}`);
        panel.innerHTML = `
            <p class="txt-no"><b>Plate ${p.no}</b> of ${roman(PLATES.length)}</p>
            <h2 class="txt-title">${p.title}</h2>
            <p class="txt-sum">${p.summary}</p>
            ${p.fact ? `<aside class="fact"><span class="k">Curious fact</span>${p.fact}</aside>` : ''}
            ${p.insights.length ? `<details class="more"><summary><span>What it shows<span class="count">${p.insights.length}</span></span></summary>
                <ol class="insights">${p.insights.map(([b, t], k) => `<li><span class="n">0${k + 1}</span><span><b>${b}</b> ${t}</span></li>`).join('')}</ol></details>` : ''}
            ${p.data.length ? `<details class="more"><summary><span>Key data<span class="count">${p.data.length}</span></span></summary>
                <dl class="kv">${p.data.map(([k, v, tbc]) => `<div><dt>${k}</dt><dd>${v}${tbc ? `<span class="tbc">tbc · ${tbc}</span>` : ''}</dd></div>`).join('')}</dl></details>` : ''}`;
        panel.classList.remove('is-in'); void panel.offsetWidth; panel.classList.add('is-in');
        $('folio-l').textContent = 2 * i + 1; $('folio-r').textContent = 2 * i + 2;
    };
    const renderChrome = () => {
        const m = PLATES[state.main];
        $('pair-a').innerHTML = `<span class="num">${m.no}</span>${m.title}`;
        select.innerHTML = PLATES.map((p, i) => i === state.main ? '' : `<option value="${i}"${i === state.under ? ' selected' : ''}>${p.no} · ${p.title}</option>`).join('');
        stage.setAttribute('aria-label', `${m.title}, laid over ${PLATES[state.under].title}`);
        tabs.forEach((t, i) => {
            t.setAttribute('aria-selected', String(i === state.main)); t.tabIndex = i === state.main ? 0 : -1;
            t.classList.toggle('is-under', i === state.under);
        });
        tocBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === state.main)));
        // keep the open tab in view inside the rail without scrolling the page
        const t = tabs[state.main], horizontal = rail.scrollWidth > rail.clientWidth;
        if (horizontal) rail.scrollTo({ left: t.offsetLeft - rail.offsetLeft - 16, behavior: reduced.matches ? 'auto' : 'smooth' });
        else rail.scrollTo({ top: t.offsetTop - rail.offsetTop - rail.clientHeight / 2 + t.offsetHeight / 2, behavior: reduced.matches ? 'auto' : 'smooth' });
    };
    const setLayers = () => layers.forEach((img, i) => {
        img.classList.toggle('is-top', i === state.main);
        img.classList.toggle('is-under', i === state.under);
        img.classList.remove('is-fading', 'is-leaving');
        if (i === state.main) img.alt = PLATES[i].alt;
    });

    // Open a plate: the open one is first laid down fully, then becomes the
    // sheet underneath, and the new plate is drawn over it from the left.
    async function go(i) {
        if (i === state.main || !PLATES[i]) return;
        const id = ++seq;
        await ready(i);
        if (id !== seq) return;
        if (!(await sweep(100, 260 * (100 - reveal) / 50)) || id !== seq) return;
        state.under = state.main; state.main = i;
        reveal = target = 0; setLayers(); paint();          // looks the same: the old plate fills the page
        renderText(i); renderChrome();
        history.replaceState(null, '', `${location.pathname}${location.search}#${PLATES[i].id}`);
        sweep(50, 950);
    }
    // Change only the sheet underneath
    async function setUnder(j) {
        if (j === state.under || j === state.main || !PLATES[j]) return;
        const id = ++seq;
        await ready(j);
        if (id !== seq) return;
        const old = layers.get(state.under);
        state.under = j; setLayers();
        if (old && !reduced.matches) { old.classList.add('is-leaving'); layer(j).classList.add('is-fading'); setTimeout(() => { if (id === seq) setLayers(); }, 380); }
        renderChrome();
        if (reveal > 90) sweep(50, 800);                    // make sure the change is visible
    }
    select.addEventListener('change', () => setUnder(+select.value));
    addEventListener('hashchange', () => go(PLATES.findIndex((p) => p.id === location.hash.slice(1))));

    /* ===== F. Start: both plates in view, divider in the middle ===== */
    const start = Math.max(0, PLATES.findIndex((p) => p.id === location.hash.slice(1)));
    state.main = start; state.under = start > 0 ? start - 1 : Math.min(1, PLATES.length - 1);
    layer(state.main).fetchPriority = 'high'; layer(state.under);
    setLayers(); paint(); renderText(start); renderChrome();
    Promise.all([ready(state.main), ready(state.under)]).then(() => {
        // wait until the plate is on screen, then draw the divider in once
        const io = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            io.disconnect();
            if (reveal === 100 && tweenId === 0) sweep(50, 1300);
        }, { threshold: 0.35 });
        io.observe(stage);
    });

    /* ===== G. Text fill: one numbered span per word, so CSS can light them in order ===== */
    document.querySelectorAll('.fill').forEach((p) => {
        const words = p.textContent.trim().split(/\s+/);
        p.style.setProperty('--n', words.length);
        p.textContent = '';
        words.forEach((w, i) => {
            const s = document.createElement('span');
            s.className = 'w'; s.style.setProperty('--i', i); s.textContent = w;
            p.append(s, i < words.length - 1 ? ' ' : '');
        });
    });
})();
