// David Becerra — Portfolio
// Mobile nav panel, photo slider, GSAP reveals + line-drawing of the elevation.
// Degrades to plain visible content if GSAP fails to load.

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav panel (drops down under the nav bar)
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('nav-panel');

  if (menuBtn && menu) {
    const setMenu = (open) => {
      menu.classList.toggle('is-open', open);
      menu.inert = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) menu.querySelector('a').focus();
    };

    menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Photo slider (Beyond) — one frame at a time. Movement is a single CSS
  // transform transition on the track (GPU-composited), no JS per-frame work
  // and no image swapping mid-animation, which is what made the old flip-book stutter.
  const track = document.getElementById('slider-track');
  if (track) {
    const viewport = document.getElementById('slider-viewport');
    const slides = Array.from(track.querySelectorAll('.slide'));
    const thumbsWrap = document.getElementById('slider-thumbs');
    const thumbs = Array.from(thumbsWrap.querySelectorAll('button'));
    const counter = document.getElementById('slider-counter');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const total = slides.length;
    const pad = (n) => String(n).padStart(2, '0');
    let current = 0;

    // Offset that centers slide i inside the viewport
    const offsetFor = (i) => {
      const s = slides[i];
      return -(s.offsetLeft - (viewport.clientWidth - s.offsetWidth) / 2);
    };

    const setX = (x) => { track.style.transform = `translate3d(${x}px, 0, 0)`; };

    function preload(i) {
      [i - 1, i + 1, i + 2].forEach((j) => {
        const img = slides[j] && slides[j].querySelector('img');
        if (img && img.loading === 'lazy') img.loading = 'eager';
      });
    }

    function centerThumb(i, smooth) {
      const t = thumbs[i];
      const left = t.offsetLeft - (thumbsWrap.clientWidth - t.offsetWidth) / 2;
      thumbsWrap.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    }

    let pageLoaded = document.readyState === 'complete';

    function goTo(i, { animate = true } = {}) {
      current = Math.max(0, Math.min(total - 1, i));
      // a #frame-NN anchor makes the browser scroll this overflow:hidden box
      // natively — undo that so only our transform positions the track
      viewport.scrollLeft = 0;
      track.classList.toggle('no-anim', !animate);
      setX(offsetFor(current));
      slides.forEach((s, j) => {
        s.classList.toggle('is-active', j === current);
        s.setAttribute('aria-hidden', String(j !== current));
      });
      thumbs.forEach((t, j) => t.classList.toggle('is-active', j === current));
      counter.textContent = `${pad(current + 1)} / ${pad(total)}`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
      // warm up the neighbours only after the page has loaded, so they don't
      // compete with the first photo for bandwidth
      if (pageLoaded) preload(current);
      centerThumb(current, animate);
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    thumbs.forEach((t, j) => t.addEventListener('click', () => goTo(j)));

    document.addEventListener('keydown', (e) => {
      if (e.target instanceof Element && e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });

    // Drag / swipe — track follows the pointer, snaps on release
    let startX = 0;
    let baseX = 0;
    let dx = 0;
    let dragging = false;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      baseX = offsetFor(current);
      dx = 0;
      track.classList.add('no-anim');
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch (_) { /* pointer already gone */ }
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      // resist at the ends
      const atEdge = (current === 0 && dx > 0) || (current === total - 1 && dx < 0);
      setX(baseX + (atEdge ? dx * 0.3 : dx));
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('is-dragging');
      const threshold = Math.min(80, viewport.clientWidth * 0.12);
      if (Math.abs(dx) < 6) {
        // plain click: a click on a peeking neighbour moves to it
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const slide = hit && hit.closest('.slide');
        if (slide) {
          goTo(Number(slide.dataset.index));
          return;
        }
      }
      if (dx < -threshold) goTo(current + 1);
      else if (dx > threshold) goTo(current - 1);
      else goTo(current);
    };

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(current, { animate: false }), 80);
    });

    // Deep links from the Home photo strip: beyond.html#frame-07
    const fromHash = () => {
      const idx = slides.findIndex((s) => '#' + s.id === location.hash);
      return idx >= 0 ? idx : 0;
    };
    goTo(fromHash(), { animate: false });
    window.addEventListener('hashchange', () => goTo(fromHash()));
    // Fonts/layout can shift widths after first paint — re-center once settled
    window.addEventListener('load', () => {
      pageLoaded = true;
      goTo(current, { animate: false });
    });
  }

  // No animation library (blocked/offline) or reduced motion: show everything.
  // .js-motion is set early by the inline <head> script so below-the-fold
  // content is hidden before first paint; the hero animates in pure CSS.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReducedMotion) {
    document.documentElement.classList.remove('js-motion');
    return;
  }

  document.documentElement.classList.add('js-motion');
  gsap.registerPlugin(ScrollTrigger);

  // Elevation drawing: linework draws itself like a pen plotter, then hatching,
  // utilities and callouts fade in. Dashed utility lines are faded, not drawn,
  // so their dash pattern stays intact.
  const elev = document.querySelector('.elev');
  if (elev) {
    const strokes = gsap.utils.toArray(elev.querySelectorAll('.ln, .thin, .hl'))
      .filter((el) => !el.closest('.callout') && typeof el.getTotalLength === 'function');
    strokes.forEach((el) => {
      const len = Math.ceil(el.getTotalLength()) + 2;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    });
    const extras = elev.querySelectorAll('.hatch, .dash, .callout, text, .solid');
    gsap.set(extras, { opacity: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: elev, start: 'top 85%', once: true } });
    tl.to(strokes, { strokeDashoffset: 0, duration: 1.4, ease: 'power1.inOut', stagger: 0.025 })
      .to(extras, { opacity: 1, duration: 0.6, stagger: 0.01 }, '-=0.5');
  }

  // Scroll reveals for standalone elements
  gsap.utils.toArray('.reveal:not(.hero-reveal)').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      }
    );
  });

  // Stagger groups (cards/timeline items) share one trigger per parent
  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll('.reveal-item');
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 85%', toggleActions: 'play none none reverse' },
      }
    );
  });
});
