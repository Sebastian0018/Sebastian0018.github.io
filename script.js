// David Becerra — Portfolio
// Mobile nav toggle + GSAP scroll reveals/parallax. Degrades to plain visible content if GSAP fails to load.

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

  // Photo book (Beyond) — works with or without GSAP; GSAP adds a real page-turn
  // (3D flip on the leading page's spine edge), not just a crossfade.
  const book = document.getElementById('book');
  if (book) {
    const totalPhotos = 24;
    const spreads = [];
    for (let i = 1; i <= totalPhotos; i += 2) {
      spreads.push([i, Math.min(i + 1, totalPhotos)]);
    }
    let current = 0;
    let isAnimating = false;

    const leftInner = document.getElementById('left-inner');
    const rightInner = document.getElementById('right-inner');
    const leftFront = document.getElementById('left-front-img');
    const leftBack = document.getElementById('left-back-img');
    const rightFront = document.getElementById('right-front-img');
    const rightBack = document.getElementById('right-back-img');
    const shadeLeft = document.querySelector('.shade-left');
    const shadeRight = document.querySelector('.shade-right');
    const counter = document.getElementById('book-counter');
    const prevBtn = document.querySelector('.book-nav.prev');
    const nextBtn = document.querySelector('.book-nav.next');
    const thumbsWrap = document.getElementById('book-thumbs');

    const photoPath = (n) => `photos/photo-${String(n).padStart(2, '0')}.jpg`;
    const thumbPath = (n) => `photos/thumbs/photo-${String(n).padStart(2, '0')}.jpg`;

    for (let n = 1; n <= totalPhotos; n++) {
      const t = document.createElement('img');
      t.src = thumbPath(n);
      t.alt = `Jump to photo ${n}`;
      t.loading = 'lazy';
      t.dataset.n = String(n);
      thumbsWrap.appendChild(t);
    }

    function setFace(imgEl, n) {
      imgEl.src = photoPath(n);
      imgEl.alt = `Photography by David Becerra — frame ${n}`;
    }

    function updateChrome(l, r) {
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(spreads.length).padStart(2, '0')}`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === spreads.length - 1;
      thumbsWrap.querySelectorAll('img').forEach((t) => {
        const n = Number(t.dataset.n);
        t.classList.toggle('is-active', n === l || n === r);
      });
    }

    // Rotates .page-inner on its spine hinge; back face already shows the
    // destination photo (pre-rotated in CSS), so it reads correctly the instant
    // the tween lands. angle is -180 (right page turning forward) or +180 (left
    // page turning back).
    function flipPage(inner, frontImg, backImg, shadeEl, newN, angle) {
      return new Promise((resolve) => {
        setFace(backImg, newN);
        const proxy = { v: 0 };
        gsap.to(proxy, {
          v: angle,
          duration: 0.7,
          ease: 'power2.inOut',
          onUpdate: () => {
            inner.style.transform = `rotateY(${proxy.v}deg)`;
            const progress = Math.abs(proxy.v / angle);
            shadeEl.style.opacity = String(Math.max(0, 1 - Math.abs(progress - 0.5) * 2) * 0.9);
          },
          onComplete: () => {
            setFace(frontImg, newN);
            inner.style.transform = 'rotateY(0deg)';
            shadeEl.style.opacity = '0';
            resolve();
          },
        });
      });
    }

    function crossfade(frontImg, newN) {
      return new Promise((resolve) => {
        gsap.to(frontImg, {
          opacity: 0,
          duration: 0.18,
          ease: 'power2.in',
          onComplete: () => {
            setFace(frontImg, newN);
            gsap.fromTo(
              frontImg,
              { opacity: 0 },
              { opacity: 1, duration: 0.3, ease: 'power2.out', onComplete: resolve }
            );
          },
        });
      });
    }

    function goTo(index) {
      if (isAnimating || index < 0 || index >= spreads.length || index === current) return;
      const direction = index > current ? 'next' : 'prev';
      const [newL, newR] = spreads[index];
      current = index;

      if (typeof gsap === 'undefined' || prefersReducedMotion) {
        setFace(leftFront, newL);
        setFace(rightFront, newR);
        updateChrome(newL, newR);
        return;
      }

      isAnimating = true;
      prevBtn.disabled = true;
      nextBtn.disabled = true;

      const tasks =
        direction === 'next'
          ? [flipPage(rightInner, rightFront, rightBack, shadeRight, newR, -180), crossfade(leftFront, newL)]
          : [flipPage(leftInner, leftFront, leftBack, shadeLeft, newL, 180), crossfade(rightFront, newR)];

      Promise.all(tasks).then(() => {
        isAnimating = false;
        updateChrome(newL, newR);
      });
    }

    thumbsWrap.addEventListener('click', (e) => {
      const t = e.target.closest('img');
      if (!t) return;
      const n = Number(t.dataset.n);
      const idx = spreads.findIndex(([l, r]) => n === l || n === r);
      goTo(idx);
    });
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });

    updateChrome(spreads[0][0], spreads[0][1]);
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
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
      }
    );
  }

  // Hero deco shapes: scale/rotate pop-in, slightly after the hero text
  const heroDeco = gsap.utils.toArray('.hero .deco-parallax');
  if (heroDeco.length) {
    gsap.fromTo(
      heroDeco,
      { opacity: 0, scale: 0.7, rotate: -12 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.15, delay: 0.2 }
    );
  }

  // Scroll reveals for standalone elements (not hero, not a frame-card wrapper — those get their own pop-in below)
  gsap.utils.toArray('.reveal:not(.hero-reveal):not(.frame-card-wrap)').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  // Stagger groups (cards/timeline items) share one trigger per parent
  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll('.reveal-item');
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 36, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  // Frame-card wrappers: pop in on the wrapper only, never the tilted card itself —
  // the tilt is a CSS custom property (--tilt) on .frame-card; if GSAP wrote to that
  // element's transform directly it would silently overwrite the rotation.
  gsap.utils.toArray('.frame-card-wrap.reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40, scale: 0.92 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
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
        trigger: el.closest('.panel') || el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });
});
