// cookie-prefs.js
document.addEventListener('DOMContentLoaded', function() {
    const savePrefsBtn = document.getElementById('savePrefs');
    const rejectAllBtn = document.getElementById('rejectAll');
    const marketingCookies = document.getElementById('marketingCookies');
    const analyticsCookies = document.getElementById('analyticsCookies');

    // Load saved preferences (if any)
    if (document.cookie.includes('marketing_cookies=false')) {
        marketingCookies.checked = false;
    }
    if (document.cookie.includes('analytics_cookies=false')) {
        analyticsCookies.checked = false;
    }

    // Save Preferences
    savePrefsBtn.addEventListener('click', () => {
        const marketingAllowed = marketingCookies.checked;
        const analyticsAllowed = analyticsCookies.checked;

        // Set cookies (expires in 1 year)
        document.cookie = `marketing_cookies=${marketingAllowed}; max-age=31536000; path=/`;
        document.cookie = `analytics_cookies=${analyticsAllowed}; max-age=31536000; path=/`;
        document.cookie = `cookies_accepted=true; max-age=31536000; path=/`;

        // Redirect to cornerroom.co.za instead of just '/'
        window.location.href = 'https://cornerroom.co.za';
    });

    // Reject All (except essential)
    rejectAllBtn.addEventListener('click', () => {
        document.cookie = 'marketing_cookies=false; max-age=31536000; path=/';
        document.cookie = 'analytics_cookies=false; max-age=31536000; path=/';
        document.cookie = 'cookies_accepted=true; max-age=31536000; path=/';
        
        // Redirect to cornerroom.co.za instead of just '/'
        window.location.href = 'https://cornerroom.co.za';
    });
});