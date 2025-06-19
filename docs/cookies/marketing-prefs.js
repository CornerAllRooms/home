function loadMarketingTools() {
  // Only load if marketing cookies are enabled
  if (!document.cookie.includes('marketing_cookies=true')) return;

  // ===== Google Analytics =====
  if (typeof gtag === 'undefined') {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID'); // 🔴 Replace with your GA ID

    const gaScript = document.createElement('script');
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(gaScript);
  }

  // ===== Facebook Pixel =====
  if (typeof fbq === 'undefined') {
    !function(f,b,e,v,n,t,s) {
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'FB_PIXEL_ID'); // 🔴 Replace with your Pixel ID
    fbq('track', 'PageView');
  }
}