document.addEventListener('DOMContentLoaded', function() {
  const acceptBtn = document.getElementById('accept-button');
  const cookieBanner = document.querySelector('.cookie-banner');

  // Hide banner if cookies already accepted
  if (document.cookie.includes('cookies_accepted=true')) {
    cookieBanner.style.display = 'none';
    loadMarketingTools(); // Load tools if marketing enabled
  }

  // "I Accept" Button
  acceptBtn.addEventListener('click', function() {
    // Set all cookies to true
    document.cookie = 'cookies_accepted=true; max-age=31536000; path=/';
    document.cookie = 'marketing_cookies=true; max-age=31536000; path=/';
    document.cookie = 'analytics_cookies=true; max-age=31536000; path=/';

    // Hide banner
    cookieBanner.style.display = 'none';

    // Load tools
    loadMarketingTools();
  });
});