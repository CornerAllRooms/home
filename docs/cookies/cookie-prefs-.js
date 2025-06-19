// cookie-prefs.js
document.addEventListener('DOMContentLoaded', function() {
  const prefsModal = document.getElementById('cookie-prefs-modal');
  const savePrefsBtn = document.getElementById('save-prefs');
  const rejectAllBtn = document.getElementById('reject-all');
  const cookieBanner = document.querySelector('.cookie-banner');

  // Load saved preferences
  if (document.cookie.includes('marketing_cookies=false')) {
    document.getElementById('marketing-toggle').checked = false;
  }
  if (document.cookie.includes('analytics_cookies=false')) {
    document.getElementById('analytics-toggle').checked = false;
  }

  // Save Preferences
  savePrefsBtn.addEventListener('click', function() {
    const expiry = '; max-age=31536000; path=/';
    const marketingAllowed = document.getElementById('marketing-toggle').checked;
    const analyticsAllowed = document.getElementById('analytics-toggle').checked;

    // Set cookies
    document.cookie = 'cookies_accepted=true' + expiry;
    document.cookie = `marketing_cookies=${marketingAllowed}` + expiry;
    document.cookie = `analytics_cookies=${analyticsAllowed}` + expiry;

    // Hide modal and banner
    prefsModal.style.display = 'none';
    cookieBanner.style.display = 'none';
    
    // Load tools if allowed and redirect
    if (marketingAllowed) loadMarketingTools();
    window.location.href = 'https://cornerroom.co.za';
  });

  // Reject All
  rejectAllBtn.addEventListener('click', function() {
    const expiry = '; max-age=31536000; path=/';
    document.cookie = 'cookies_accepted=true' + expiry;
    document.cookie = 'marketing_cookies=false' + expiry;
    document.cookie = 'analytics_cookies=false' + expiry;

    // Hide modal and banner
    prefsModal.style.display = 'none';
    cookieBanner.style.display = 'none';
    
    // Redirect to homepage
    window.location.href = 'https://cornerroom.co.za';
  });
});