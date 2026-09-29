// David Becerra — Portfolio
// Mobile nav toggle, Beyond photo slider, GSAP scroll reveals/parallax.
// Degrades to plain visible content if GSAP fails to load.

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
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

    function goTo(i, { animate = true } = {}) {
      current = Math.max(0, Math.min(total - 1, i));
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
      preload(current);
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

    goTo(0, { animate: false });
    // Fonts/layout can shift widths after first paint — re-center once settled
    window.addEventListener('load', () => goTo(current, { animate: false }));
  }

  if (typeof gsap === 'undefined' || prefersReducedMotion) {
    return;
  }

  document.documentElement.classList.add('js-motion');
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  const heroTargets = gsap.utils.toArray('.hero-reveal');
  if (heroTargets.length) {
    gsap.fromTo(
      heroTargets,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 }
    );
  }

  // Handwritten arrows/underlines draw themselves in after the headline lands
  gsap.utils.toArray('.draw path').forEach((path, i) => {
    const len = Math.ceil(path.getTotalLength());
    gsap.fromTo(
      path,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', delay: 0.7 + i * 0.2 }
    );
  });

  // Hero deco shapes: pop-in
  const heroDeco = gsap.utils.toArray('.hero .deco-parallax');
  if (heroDeco.length) {
    gsap.fromTo(
      heroDeco,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.15, delay: 0.2 }
    );
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

  // Scroll parallax on decorative shapes — each moves at its own speed via data-parallax
  gsap.utils.toArray('.deco-parallax').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.2');
    gsap.to(el, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });
});
