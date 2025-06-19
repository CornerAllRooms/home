document.addEventListener('DOMContentLoaded', function() {
  const prefsModal = document.getElementById('cookie-prefs-modal');
  const savePrefsBtn = document.getElementById('save-prefs');
  const rejectAllBtn = document.getElementById('reject-all');
  const marketingToggle = document.getElementById('marketing-toggle');
  const analyticsToggle = document.getElementById('analytics-toggle');
  const cookieBanner = document.querySelector('.cookie-banner');

  // Load saved preferences (if any)
  if (document.cookie.includes('marketing_cookies=false')) {
    marketingToggle.checked = false;
  }
  if (document.cookie.includes('analytics_cookies=false')) {
    analyticsToggle.checked = false;
  }

  // Save Preferences
  savePrefsBtn.addEventListener('click', function() {
    const marketingAllowed = marketingToggle.checked;
    const analyticsAllowed = analyticsToggle.checked;

    // Set cookies
    document.cookie = `cookies_accepted=true; max-age=31536000; path=/`;
    document.cookie = `marketing_cookies=${marketingAllowed}; max-age=31536000; path=/`;
    document.cookie = `analytics_cookies=${analyticsAllowed}; max-age=31536000; path=/`;

    // Hide modal and banner
    prefsModal.style.display = 'none';
    cookieBanner.style.display = 'none';

    // Load tools if allowed
    if (marketingAllowed) loadMarketingTools();
  });

  // Reject All
  rejectAllBtn.addEventListener('click', function() {
    document.cookie = 'cookies_accepted=true; max-age=31536000; path=/';
    document.cookie = 'marketing_cookies=false; max-age=31536000; path=/';
    document.cookie = 'analytics_cookies=false; max-age=31536000; path=/';

    // Hide modal and banner
    prefsModal.style.display = 'none';
    cookieBanner.style.display = 'none';
  });
});