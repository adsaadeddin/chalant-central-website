/* ==========================================================================
   Chalant Central — main.js
   Vanilla JS: mobile nav, sticky header state, scroll reveals,
   gallery lightbox, and the catering quote form (Formspree + mailto fallback).
   ========================================================================== */
(() => {
  'use strict';

  const QUOTE_EMAIL = 'chalantcentral@gmail.com';

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  // Close after choosing a link, or on Escape
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });

  /* ---------- Header shadow once scrolled ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Gallery lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lb-img');
  const items = Array.from(document.querySelectorAll('.g-item'));
  let current = 0;
  let lastFocus = null;

  const show = (i) => {
    current = (i + items.length) % items.length;
    const thumb = items[current].querySelector('img');
    lbImg.src = items[current].dataset.full;
    lbImg.alt = thumb.alt;
  };

  items.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      lastFocus = btn;
      show(i);
      lb.showModal(); // native <dialog> traps focus and handles Escape
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
  lb.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  // Click on the backdrop (outside image and buttons) closes
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => { lbImg.src = ''; if (lastFocus) lastFocus.focus(); });

  /* ---------- Catering quote form ---------- */
  const form = document.getElementById('quote-form');
  const status = document.getElementById('form-status');

  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = 'form-status' + (type ? ' is-' + type : '');
  };

  // Highlight invalid fields and focus the first one
  const validate = () => {
    let firstBad = null;
    form.querySelectorAll('[required]').forEach((field) => {
      const ok = field.checkValidity();
      field.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstBad) firstBad = field;
    });
    if (firstBad) {
      setStatus('Please complete the highlighted fields.', 'err');
      firstBad.focus();
      return false;
    }
    return true;
  };
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
      e.target.setAttribute('aria-invalid', 'false');
    }
  });

  // Build a plain-text summary for the mailto fallback
  const buildMailto = (data) => {
    const items = data.getAll('items').join(', ') || 'Not specified';
    const lines = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Phone: ${data.get('phone') || '-'}`,
      `Event type: ${data.get('event_type')}`,
      `Event date: ${data.get('event_date')}`,
      `Guest count: ${data.get('guest_count')}`,
      `Location: ${data.get('location')}`,
      `Items wanted: ${items}`,
      '',
      `Message:`,
      data.get('message') || '-',
    ];
    const subject = `Catering quote request – ${data.get('event_type')} on ${data.get('event_date')}`;
    return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData(form);
    if (data.get('_gotcha')) return; // spam bot

    // Formspree not configured yet? Use the email fallback.
    if (form.action.includes('YOUR_FORM_ID')) {
      window.location.href = buildMailto(data);
      setStatus('Your email app should open with your request filled in. Just press send!', 'ok');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    setStatus('Sending…');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      setStatus('Thank you! Your request is on its way. We\'ll be in touch within 48 hours.', 'ok');
    } catch (err) {
      // Network/service problem: fall back to email
      setStatus('Something went wrong, so we\'re opening your email app instead.', 'err');
      window.location.href = buildMailto(data);
    } finally {
      btn.disabled = false;
    }
  });
})();
