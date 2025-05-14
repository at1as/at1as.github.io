document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  
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
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && siteNav && siteNav.classList.contains('active')) {
      siteNav.classList.remove('active');
      mobileMenuToggle.classList.remove('active');
    }
  });
});
