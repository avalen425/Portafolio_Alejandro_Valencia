(function () {
  'use strict';

  // ── SCROLL RESTORATION — always start at top ──
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // ── MOBILE MENU ──
  var menuBtn = document.getElementById('menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (menuBtn) {
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  }
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  // ── FADE-IN ON SCROLL ──
  var faders = document.querySelectorAll('.fi');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });
    faders.forEach(function (el) { obs.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add('on'); });
  }

  // ── SCROLL PROGRESS + HERO PARALLAX + ACTIVE SECTION ──
  var progress = document.getElementById('scroll-progress');
  var heroInner = document.querySelector('.hero-inner');
  var navLinks = document.querySelectorAll('.nav-links a');
  var sectionIds = ['hero', 'capabilities', 'formation', 'work', 'approach', 'writing', 'contact'];
  var activeId = '';
  var raf = 0;

  function onScroll() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      if (progress) progress.style.width = pct + '%';

      if (heroInner) {
        var y = Math.min(window.scrollY, window.innerHeight);
        var op = Math.max(0, 1 - (y / window.innerHeight) * 1.4);
        heroInner.style.transform = 'translateY(' + (y * 0.18) + 'px)';
        heroInner.style.opacity = op;
      }

      // active section: lowest section whose top has crossed 45% of viewport
      var triggerY = window.innerHeight * 0.45;
      var current = sectionIds[0];
      for (var i = 0; i < sectionIds.length; i++) {
        var el = document.getElementById(sectionIds[i]);
        if (el && el.getBoundingClientRect().top <= triggerY) current = sectionIds[i];
      }
      if (current !== activeId) {
        activeId = current;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // ── DIALOG / MODAL SYSTEM ──
  var openBtns = document.querySelectorAll('[data-open-modal]');
  var closeBtns = document.querySelectorAll('[data-close-modal]');

  openBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var modalId = btn.getAttribute('data-open-modal');
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.showModal();
        document.body.classList.add('modal-open'); // Prevent background scrolling
      }
    });
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = btn.closest('dialog');
      if (modal) {
        modal.close();
      }
    });
  });

  // Handle closing events (Esc key or backdrop clicks in unsupported browsers)
  var dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(function (modal) {
    modal.addEventListener('close', function () {
      document.body.classList.remove('modal-open'); // Re-enable background scrolling
    });

    // Fallback for light-dismiss (Esc is handled natively by showModal)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      modal.addEventListener('click', function (event) {
        if (event.target !== modal) return;

        var rect = modal.getBoundingClientRect();
        var isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          modal.close();
        }
      });
    }
  });
})();

