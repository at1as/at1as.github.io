/* GA4 uses the property's ID from _config.yml, embedded by _generate.py. */
(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('analytics-config').textContent);
  const host = config.hostname.replace(/^www\./, '');
  if (!/^G-[A-Z0-9]+$/.test(config.measurementId) || location.protocol !== 'https:' ||
      ![host, `www.${host}`].includes(location.hostname) || document.getElementById('erdos-google-tag')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // One automatic pageview; changing snapshots does not create extra visits.
  window.gtag('config', config.measurementId, { page_title: config.pageTitle });
  const script = document.createElement('script');
  script.id = 'erdos-google-tag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
  document.head.append(script);

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-site-link]');
    if (!link) return;
    window.gtag('event', 'site_visit', { link_location: link.dataset.siteLink, link_url: link.href });
  });
})();
