(function () {
    var config = window.SITE_CONFIG || {};
    var measurementId = config.gaMeasurementId || 'G-GTDNPY8HYP';

    if (!measurementId || window.__gaLoaded) return;
    window.__gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', measurementId);
})();
