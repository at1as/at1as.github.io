document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  let isMobile = window.innerWidth <= 768;

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      siteNav.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (siteNav && siteNav.classList.contains('active') &&
        !event.target.closest('.site-nav') &&
        !event.target.closest('.mobile-menu-toggle')) {
      siteNav.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
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
          siteNav.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
        }
      }
    }, 150);
  });
});
