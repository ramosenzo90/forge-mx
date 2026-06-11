// Forged MX — landing interactions

(function () {
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  const links = document.querySelectorAll('.nav-link');

  // Header background on scroll.
  // Note: the nav highlight is intentionally NOT driven by scroll — each page keeps
  // its own hard-coded .active nav link (Home stays lit on the homepage, etc.).
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close mobile menu when clicking a link
  links.forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Nav "Media" dropdown (click to toggle; hover handled in CSS on desktop)
  const navItems = document.querySelectorAll('.nav-item');
  const closeNavDropdowns = () => navItems.forEach(item => {
    item.classList.remove('open');
    item.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
  });

  navItems.forEach(item => {
    const toggle = item.querySelector('.nav-dropdown-toggle');
    toggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Close dropdowns on outside click or Escape
  document.addEventListener('click', (e) => {
    navItems.forEach(item => { if (!item.contains(e.target)) item.classList.remove('open'); });
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNavDropdowns(); });

  // Close the mobile menu when a dropdown link is tapped
  document.querySelectorAll('.nav-dropdown a').forEach(a => a.addEventListener('click', () => {
    nav?.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }));

  // Hero background slideshow (auto crossfade)
  const slideshow = document.getElementById('heroSlideshow');
  if (slideshow) {
    const slides = slideshow.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
      let idx = 0;
      setInterval(() => {
        slides[idx].classList.remove('is-active');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add('is-active');
      }, 2750);
    }
  }

  // Gallery lightbox (click a collage photo to view fullscreen)
  const collage = document.querySelector('.collage');
  const lightbox = document.getElementById('lightbox');
  if (collage && lightbox) {
    const items = Array.from(collage.querySelectorAll('.collage-item'));
    const lbImg = document.getElementById('lightboxImg');
    let current = 0;

    const srcOf = (el) => {
      const bg = el.style.backgroundImage || getComputedStyle(el).backgroundImage;
      const m = bg.match(/url\(["']?(.*?)["']?\)/);
      return m ? m[1] : '';
    };
    const openAt = (i) => {
      current = i;
      lbImg.src = srcOf(items[i]);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeLb = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    const step = (d) => {
      current = (current + d + items.length) % items.length;
      lbImg.src = srcOf(items[current]);
    };

    items.forEach((el, i) => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => openAt(i));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i); }
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLb);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  // Contact form — submit via FormSubmit AJAX so the user stays on the page
  document.querySelectorAll('.contact-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const success = form.querySelector('.form-success');
      const error = form.querySelector('.form-error');
      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.textContent : '';
      if (success) success.hidden = true;
      if (error) error.hidden = true;
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      // Stamp the submission date and pick a random friendly greeting for the email subject
      const dateField = form.querySelector('input[name="submitted_at"]');
      if (dateField) dateField.value = new Date().toLocaleString();
      const subjectField = form.querySelector('input[name="subject"]');
      if (subjectField) {
        const greetings = [
          'Hey Trevor', "What's up Trevor", 'Yo Trevor',
          'Howdy Trevor', 'Hey hey Trevor', 'Trevor — new one for you',
        ];
        const g = greetings[Math.floor(Math.random() * greetings.length)];
        subjectField.value = `${g} — new message from the Forged MX website`;
      }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data.success === true || data.success === 'true')) {
          if (success) success.hidden = false;
          form.reset();
        } else {
          if (error) error.hidden = false;
        }
      } catch (err) {
        if (error) error.hidden = false;
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });
  });

  // Current year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
