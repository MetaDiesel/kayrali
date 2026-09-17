/* Kayrali — page motion. Runs after gsap, ScrollTrigger and Lenis (all deferred). */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const desktop = () => window.matchMedia('(min-width: 901px) and (hover: hover)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---- Inline the kolam symbol where CSS needs to reach individual paths ----
  const symbol = $('#k');
  ['.loader-kolam', '.steps-kolam svg'].forEach((sel) => {
    const svg = $(sel);
    if (!svg || !symbol) return;
    svg.innerHTML = symbol.innerHTML;
    ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'].forEach((a) => {
      if (!svg.hasAttribute(a)) svg.setAttribute(a, symbol.getAttribute(a));
    });
  });

  // ---- Footer year ----
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // ---- Smooth scroll ----
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined' && hasGsap) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      scrollTo(target);
    });
  });

  // ---- Header ----
  const header = $('#site-header');
  const toggle = $('#nav-toggle');
  function closeNav() {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start();
  }
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  const silkCanvas = $('#silk');
  let lastY = 0;
  const onScroll = (y) => {
    header.classList.toggle('is-solid', y > 40);
    if (Math.abs(y - lastY) > 4) {
      header.classList.toggle('is-hidden', y > 200 && y > lastY && !header.classList.contains('nav-open'));
      lastY = y;
    }
    const fade = Math.min(1, y / (window.innerHeight * 0.9));
    if (window.__silk) window.__silk.setScroll(fade);
    if (silkCanvas) silkCanvas.style.opacity = String(1 - fade);
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

  // ---- Cursor ----
  const cursor = $('#cursor');
  if (fine && cursor && !reduce) {
    const dot = $('.cursor-dot', cursor);
    const ring = $('.cursor-ring', cursor);
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('pointerleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('pointerenter', () => document.body.classList.remove('cursor-hidden'));
    (function tick() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    })();
    $$('a, button, summary').forEach((el) => {
      el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ---- Magnetic buttons ----
  if (fine && !reduce && hasGsap) {
    $$('[data-magnetic]').forEach((el) => {
      const strength = 0.35;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ---- Tilt on collection pieces ----
  if (fine && !reduce && hasGsap) {
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, { rotateY: px * 12, rotateX: -py * 12, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'power3.out' });
      });
    });
  }

  // ---- Intro: light up word by word as it scrolls into view ----
  const intro = $('[data-reveal-words]');
  if (intro) {
    const words = intro.textContent.trim().split(/\s+/);
    intro.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const spans = $$('.w', intro);
    if (hasGsap && !reduce) {
      ScrollTrigger.create({
        trigger: intro, start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate: (self) => {
          const n = Math.round(self.progress * spans.length);
          spans.forEach((s, i) => s.classList.toggle('on', i < n));
        },
      });
    } else {
      spans.forEach((s) => s.classList.add('on'));
    }
  }

  // ---- Why: line reveals ----
  $$('[data-reveal-line]').forEach((line) => {
    line.innerHTML = `<span>${line.innerHTML}</span>`;
  });
  if (hasGsap && !reduce) {
    $$('[data-reveal-line] > span').forEach((span, i) => {
      gsap.to(span, {
        y: 0, duration: 1.2, ease: 'power4.out',
        scrollTrigger: { trigger: span.parentElement, start: 'top 88%', once: true },
        delay: i * 0.08,
      });
    });
  }

  // ---- Collection rail: pinned horizontal scroll on desktop ----
  const rail = $('#rail');
  const track = $('#rail-track');
  if (rail && track && hasGsap && !reduce) {
    ScrollTrigger.matchMedia({
      '(min-width: 901px) and (hover: hover)': () => {
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: rail.closest('.rail-section'), pin: true, scrub: 1,
            start: 'top top',
            end: () => '+=' + distance(),
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        return () => tween.kill();
      },
    });
  }

  // ---- Steps: active state + kolam quadrant ----
  const steps = $$('.step');
  const kolam = $('.steps-kolam');
  const count = $('#steps-current');
  if (steps.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        steps.forEach((s) => s.classList.remove('is-active'));
        en.target.classList.add('is-active');
        const n = en.target.dataset.step;
        if (kolam) kolam.dataset.active = n;
        if (count) count.textContent = n;
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  } else {
    steps.forEach((s) => s.classList.add('is-active'));
  }

  // ---- Loader and hero entrance: the one orchestrated moment ----
  const loader = $('#loader');
  const heroLines = $$('.hero-title .line-inner');
  const heroRest = ['.hero-side', '.hero-meta', '.scroll-cue'].map((s) => $(s)).filter(Boolean);

  function enterHero() {
    if (!hasGsap || reduce) {
      heroLines.forEach((l) => (l.style.transform = 'none'));
      heroRest.forEach((el) => (el.style.opacity = 1));
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(heroLines, { y: 0, duration: 1.4, stagger: 0.12 }, 0)
      .to(heroRest, { opacity: 1, duration: 1.2, stagger: 0.1 }, 0.5);
  }

  if (loader && !reduce) {
    document.body.classList.add('is-loading');
    if (lenis) lenis.stop();
    const strokes = $$('path', loader);
    const dots = $('.kolam-dots', loader);
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      if (lenis) lenis.start();
      enterHero();
      setTimeout(() => loader.remove(), 1400);
    };
    if (hasGsap) {
      gsap.set(strokes, { strokeDasharray: 1, strokeDashoffset: 1 });
      const tl = gsap.timeline({ onComplete: done });
      setTimeout(done, 5000); // never let the loader hold the page hostage
      tl.to(dots, { opacity: 1, duration: 0.4 }, 0)
        .to(strokes, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.05 }, 0.2)
        .add(() => loader.classList.add('is-drawn'), 1.3)
        .to({}, { duration: 0.7 });
    } else {
      setTimeout(done, 600);
    }
  } else {
    if (loader) loader.remove();
    document.body.classList.remove('is-loading');
    enterHero();
  }
})();
