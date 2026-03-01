/* ============================================================
   JARINRAKSA OY — main.js
   ============================================================ */

'use strict';

/* ── NAVIGAATIO: scroll-efekti ───────────────────────────── */
(function initScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ── HAMPURILAISVALIKKO ──────────────────────────────────── */
(function initMobileMenu() {
  const toggle = document.querySelector('.hamburger');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onEsc);
    document.addEventListener('click', onOutsideClick);
  }

  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onEsc);
    document.removeEventListener('click', onOutsideClick);
  }

  function onEsc(e) {
    if (e.key === 'Escape') {
      closeMenu();
      toggle.focus();
    }
  }

  function onOutsideClick(e) {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  }

  toggle.addEventListener('click', function () {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Sulje valikko kun mobiililinkkiä klikataan
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Sulje valikko kun näyttö levenee tablet-kokoon
  const mq = window.matchMedia('(min-width: 961px)');
  function onBreakpoint(e) {
    if (e.matches) closeMenu();
  }
  mq.addEventListener('change', onBreakpoint);
})();


/* ── AKTIIVINEN NAVIGOINTILINKKI ─────────────────────────── */
(function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(function (link) {
        const isActive = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', isActive);
        link.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();


/* ── SCROLL-ANIMAATIOT (fade-up) ─────────────────────────── */
(function initFadeAnimations() {
  // Lisää fade-up-luokka animoitaville elementeille
  const targets = [
    '.palvelu-card',
    '.galleria-item',
    '.prosessi-step',
    '.stat-item',
    '.meista-content',
    '.meista-visual',
    '.lomake-info',
    '.lomake-wrap',
    '.section-header'
  ];

  targets.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.classList.add('fade-up');
    });
  });

  // Tarkista prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-up').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('.fade-up').forEach(function (el, i) {
    // Porrastettu viive korteille jotka ovat rinnakkain
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.querySelectorAll('.fade-up'));
      const index = siblings.indexOf(el);
      if (index > 0) {
        el.style.transitionDelay = Math.min(index * 80, 400) + 'ms';
      }
    }
    observer.observe(el);
  });
})();


/* ── TARJOUSPYYNTÖLOMAKE ─────────────────────────────────── */
(function initContactForm() {
  const form        = document.getElementById('contact-form');
  const successEl   = document.getElementById('form-success');
  const errorEl     = document.getElementById('form-error');
  if (!form) return;

  const submitBtn   = form.querySelector('button[type="submit"]');
  const btnText     = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnSpinner  = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (btnText)    btnText.hidden    = isLoading;
    if (btnSpinner) btnSpinner.hidden = !isLoading;
  }

  function showSuccess() {
    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (errorEl) errorEl.hidden = true;
  }

  function showError() {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (successEl) successEl.hidden = true;
  }

  // Lomakkeen validointi ennen lähetystä
  function validateForm() {
    let valid = true;

    form.querySelectorAll('[required]').forEach(function (field) {
      removeFieldError(field);
      if (!field.value.trim()) {
        showFieldError(field, 'Tämä kenttä on pakollinen.');
        valid = false;
      }
    });

    const puhelinField = form.querySelector('#puhelin');
    if (puhelinField && puhelinField.value.trim()) {
      const digits = puhelinField.value.replace(/\D/g, '');
      if (digits.length < 7) {
        showFieldError(puhelinField, 'Tarkista puhelinnumero.');
        valid = false;
      }
    }

    const emailField = form.querySelector('#email');
    if (emailField && emailField.value.trim()) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(emailField.value.trim())) {
        showFieldError(emailField, 'Tarkista sähköpostiosoite.');
        valid = false;
      }
    }

    return valid;
  }

  function showFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('field-error');

    const errorId = field.id + '-error';
    let errorMsg = document.getElementById(errorId);
    if (!errorMsg) {
      errorMsg = document.createElement('span');
      errorMsg.id = errorId;
      errorMsg.className = 'field-error-msg';
      errorMsg.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    field.setAttribute('aria-describedby', errorId);
  }

  function removeFieldError(field) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('field-error');
    const errorId = field.id + '-error';
    const errorMsg = document.getElementById(errorId);
    if (errorMsg) errorMsg.remove();
    field.removeAttribute('aria-describedby');
  }

  // Poista virhe kun käyttäjä alkaa kirjoittaa
  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      removeFieldError(field);
    });
    field.addEventListener('change', function () {
      removeFieldError(field);
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (successEl) successEl.hidden = true;
    if (errorEl)   errorEl.hidden   = true;

    if (!validateForm()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setLoading(true);

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showSuccess();
        form.reset();
      } else {
        const data = await response.json().catch(function () { return {}; });
        if (data && data.errors) {
          console.warn('Formspree errors:', data.errors);
        }
        showError();
      }
    } catch (err) {
      console.error('Lomakkeen lähetysvirhe:', err);
      showError();
    } finally {
      setLoading(false);
    }
  });
})();


/* ── GALLERIA: lightbox ──────────────────────────────────── */
(function initGalleryLightbox() {
  const items = document.querySelectorAll('.galleria-item img');
  if (!items.length) return;

  // Rakenna lightbox-elementti
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Kuvan suurennos');
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="lb-backdrop"></div>
    <div class="lb-inner">
      <button class="lb-close" aria-label="Sulje">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <button class="lb-prev" aria-label="Edellinen kuva">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <img class="lb-img" src="" alt="">
      <button class="lb-next" aria-label="Seuraava kuva">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
      <p class="lb-caption"></p>
    </div>
  `;
  document.body.appendChild(lightbox);

  // Lightbox CSS dynaamisesti
  const lbStyle = document.createElement('style');
  lbStyle.textContent = `
    #lightbox {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    #lightbox[hidden] { display: none; }
    .lb-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(9,19,38,.95);
      cursor: pointer;
    }
    .lb-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 90vw;
      max-height: 90vh;
      gap: .75rem;
    }
    .lb-img {
      max-width: 85vw;
      max-height: 78vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 24px 80px rgba(0,0,0,.6);
    }
    .lb-close {
      position: absolute;
      top: -3rem;
      right: 0;
      background: rgba(255,255,255,.12);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      transition: background .2s;
    }
    .lb-close:hover { background: rgba(255,255,255,.25); }
    .lb-prev,
    .lb-next {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,.12);
      border: none;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      transition: background .2s;
      z-index: 2;
    }
    .lb-prev { left: 1.5rem; }
    .lb-next { right: 1.5rem; }
    .lb-prev:hover,
    .lb-next:hover { background: rgba(255,255,255,.25); }
    .lb-caption {
      color: rgba(255,255,255,.65);
      font-size: .85rem;
      text-align: center;
      max-width: 60ch;
      margin: 0;
    }
    @media (max-width: 600px) {
      .lb-prev { left: .5rem; }
      .lb-next { right: .5rem; }
    }
  `;
  document.head.appendChild(lbStyle);

  const lbImg     = lightbox.querySelector('.lb-img');
  const lbCaption = lightbox.querySelector('.lb-caption');
  const lbClose   = lightbox.querySelector('.lb-close');
  const lbPrev    = lightbox.querySelector('.lb-prev');
  const lbNext    = lightbox.querySelector('.lb-next');
  const lbBackdrop = lightbox.querySelector('.lb-backdrop');

  const imgArray = Array.from(items);
  let currentIndex = 0;
  let lastFocused  = null;

  function openLightbox(index) {
    currentIndex = index;
    lastFocused  = document.activeElement;
    updateLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
    document.addEventListener('keydown', onLightboxKey);
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onLightboxKey);
    if (lastFocused) lastFocused.focus();
  }

  function updateLightbox() {
    const img = imgArray[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt;

    const figcaption = img.closest('figure') && img.closest('figure').querySelector('figcaption');
    lbCaption.textContent = figcaption ? figcaption.textContent : '';

    lbPrev.style.display = imgArray.length > 1 ? 'flex' : 'none';
    lbNext.style.display = imgArray.length > 1 ? 'flex' : 'none';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + imgArray.length) % imgArray.length;
    updateLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % imgArray.length;
    updateLightbox();
  }

  function onLightboxKey(e) {
    switch (e.key) {
      case 'Escape':     closeLightbox(); break;
      case 'ArrowLeft':  showPrev();      break;
      case 'ArrowRight': showNext();      break;
    }
  }

  // Tee kuvat klikkaukelpoisiksi
  imgArray.forEach(function (img, i) {
    const figure = img.closest('figure');
    const wrapper = figure || img.parentElement;
    wrapper.style.cursor = 'pointer';
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('tabindex', '0');
    wrapper.setAttribute('aria-label', 'Suurenna kuva: ' + (img.alt || 'Kohde ' + (i + 1)));

    wrapper.addEventListener('click', function () { openLightbox(i); });
    wrapper.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  // Swipe mobiilille
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { showNext(); } else { showPrev(); }
    }
  }, { passive: true });
})();


/* ── SMOOTH SCROLL ankkurilinkeille ─────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = document.querySelector('.site-header')
        ? document.querySelector('.site-header').offsetHeight
        : 0;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();


/* ── FIELD-ERROR TYYLIT ──────────────────────────────────── */
(function injectFormErrorStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .field-error {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 3px rgba(220,38,38,.15) !important;
    }
    .field-error-msg {
      font-size: .8rem;
      color: #dc2626;
      font-weight: 500;
      margin-top: .2rem;
      display: block;
    }
    .nav-links a.active {
      color: #fff;
      background: rgba(255,255,255,.1);
    }
  `;
  document.head.appendChild(style);
})();