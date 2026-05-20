(function () {
  'use strict';

  var root = document.documentElement;

  // ── THEME TOGGLE ──
  var themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark';
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

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
})();
