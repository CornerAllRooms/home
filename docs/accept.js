// accept-cookies.js
document.addEventListener('DOMContentLoaded', function() {
  const acceptBtn = document.getElementById('accept-button');
  const cookieBanner = document.querySelector('.cookie-banner');

  // Hide banner if cookies already accepted
  if (document.cookie.includes('cookies_accepted=true')) {
    cookieBanner.style.display = 'none';
    if (document.cookie.includes('marketing_cookies=true')) {
      loadMarketingTools();
    }
    return;
  }

  // "I Accept" Button
  Btn.addEventListener('click', function() {
    // Set all cookies to true (1 year expiry)
    const expiry = '; max-age=31536000; path=/';
    document.cookie = 'cookies_accepted=true' + expiry;
    document.cookie = 'marketing_cookies=true' + expiry;
    document.cookie = 'analytics_cookies=true' + expiry;

    // Hide banner
    cookieBanner.style.display = 'none';
    
    // Load tools and redirect
    loadMarketingTools();
    window.location.href = '/';
  });
});