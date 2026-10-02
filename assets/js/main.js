document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  let isMobile = window.innerWidth <= 768;

  function setMobileMenuOpen(open) {
    if (!mobileMenuToggle || !siteNav) return;
    mobileMenuToggle.classList.toggle('active', open);
    mobileMenuToggle.setAttribute('aria-expanded', String(open));
    siteNav.classList.toggle('active', open);
  }

  if (mobileMenuToggle && siteNav) {
    mobileMenuToggle.addEventListener('click', function() {
      setMobileMenuOpen(this.getAttribute('aria-expanded') !== 'true');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (siteNav && siteNav.classList.contains('active') &&
        !event.target.closest('.site-nav') &&
        !event.target.closest('.mobile-menu-toggle')) {
      setMobileMenuOpen(false);
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && siteNav && siteNav.classList.contains('active')) {
      setMobileMenuOpen(false);
      mobileMenuToggle.focus();
    }
  });

  // Close mobile menu when window is resized above mobile breakpoint
  // Use debounced resize handler to prevent forced reflows
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const newIsMobile = window.innerWidth <= 768;
      if (newIsMobile !== isMobile) {
        isMobile = newIsMobile;
        if (!isMobile && siteNav && siteNav.classList.contains('active')) {
          setMobileMenuOpen(false);
        }
      }
    }, 150);
  });
});
