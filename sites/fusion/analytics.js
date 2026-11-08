// Match the site's GA4 property and the production-host guard used by Erdős.
(() => {
  "use strict";
  const config = JSON.parse(document.getElementById("analytics-config").textContent);
  const host = config.hostname.replace(/^www\./, "");
  if (
    !/^G-[A-Z0-9]+$/.test(config.measurementId) ||
    location.protocol !== "https:" ||
    ![host, `www.${host}`].includes(location.hostname) ||
    document.getElementById("fusion-google-tag")
  ) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", config.measurementId, { page_title: document.title });

  const script = document.createElement("script");
  script.id = "fusion-google-tag";
  script.async = true;
  script.referrerPolicy = "origin";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
  document.head.append(script);
})();
