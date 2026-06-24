/* ============================================================
   UNICLEAR – Interaktionen
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile-Navigation ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('open');
      })
    );
  }

  /* ---------- Header-Schatten beim Scrollen ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Aufsteigende Seifenblasen ---------- */
  document.querySelectorAll('.bubble-field').forEach(field => {
    if (reduceMotion) return;
    const count = parseInt(field.dataset.count || '14', 10);
    for (let i = 0; i < count; i++) {
      const b = document.createElement('span');
      b.className = 'bubble';
      const size = 8 + Math.random() * 46;
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      b.style.left = Math.random() * 100 + '%';
      b.style.animationDuration = (9 + Math.random() * 12) + 's';
      b.style.animationDelay = (-Math.random() * 16) + 's';
      b.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
      b.style.opacity = (0.4 + Math.random() * 0.5).toFixed(2);
      field.appendChild(b);
    }
  });

  /* ---------- Reveal beim Scrollen ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  /* ---------- Bubbles "zerplatzen" beim Scrollen ---------- */
  if (!reduceMotion) {
    let popLayer = document.querySelector('.pop-layer');
    if (!popLayer) {
      popLayer = document.createElement('div');
      popLayer.className = 'pop-layer';
      document.body.appendChild(popLayer);
    }
    let lastY = window.scrollY;
    let acc = 0;
    let ticking = false;

    const spawnPop = () => {
      const p = document.createElement('span');
      p.className = 'pop';
      const size = 10 + Math.random() * 34;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = (15 + Math.random() * 70) + 'vh';
      popLayer.appendChild(p);
      setTimeout(() => p.remove(), 950);
    };

    window.addEventListener('scroll', () => {
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      acc += dy;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          // alle ~120px Scrollweg eine Blase platzen lassen
          while (acc > 120) { spawnPop(); acc -= 120; }
          if (acc > 360) acc = 360;
          ticking = false;
        });
      }
    }, { passive: true });
  }

  /* ---------- Shop: Betrag wählen (Platzhalter-Logik) ---------- */
  const amountGrid = document.querySelector('.amount-grid');
  if (amountGrid) {
    const balanceEl = document.querySelector('[data-balance]');
    const opts = amountGrid.querySelectorAll('.amount-opt');
    let selected = 0;
    opts.forEach(opt => {
      opt.addEventListener('click', () => {
        opts.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selected = parseFloat(opt.dataset.value || '0');
      });
    });
    const form = document.querySelector('#topup-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selected) { alert('Bitte einen Betrag wählen.'); return; }
        if (balanceEl) {
          const current = parseFloat(balanceEl.dataset.balance || '0');
          const next = current + selected;
          balanceEl.dataset.balance = next;
          balanceEl.textContent = 'CHF ' + next.toFixed(2);
        }
        const note = document.querySelector('#topup-note');
        if (note) {
          note.textContent = `✓ Demo: CHF ${selected.toFixed(2)} wurden zur Karte hinzugefügt. (Zahlung noch nicht angebunden.)`;
          note.style.display = 'block';
        }
      });
    }
  }

  /* ---------- News-Slider ---------- */
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const track = slider.querySelector('.news-track');
    const slides = Array.from(slider.querySelectorAll('.news-slide'));
    const dotsWrap = slider.querySelector('.news-dots');
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    if (!track || slides.length === 0) return;

    let index = 0;
    let timer = null;
    const interval = parseInt(slider.dataset.slider || '6000', 10);

    // Punkte erzeugen
    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.className = 'news-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(d);
      return d;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach((d, n) => d.classList.toggle('active', n === index));
    }
    function start() { if (!reduceMotion && slides.length > 1) timer = setInterval(() => go(index + 1), interval); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (prev) prev.addEventListener('click', () => { go(index - 1); restart(); });
    if (next) next.addEventListener('click', () => { go(index + 1); restart(); });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  });

  /* ---------- Kontaktformular (Platzhalter) ---------- */
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = document.querySelector('#contact-note');
      if (note) {
        note.textContent = '✓ Danke! Demo-Formular – Versand ist noch nicht angebunden.';
        note.style.display = 'block';
      }
      contactForm.reset();
    });
  }
})();
