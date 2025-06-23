document.addEventListener('DOMContentLoaded', function() {
  const banner = document.querySelector('.accept-container');
  
  // Only show banner if cookies not accepted AND team popup isn't active
  if (!document.cookie.includes('cookies_accepted=true')) {
    banner.style.display = 'block';
    
    document.getElementById('accept-button').addEventListener('click', function() {
      // Set acceptance cookies (1 year expiry)
      document.cookie = "cookies_accepted=true; max-age=31536000; path=/";
      document.cookie = "marketing_cookies=true; max-age=31536000; path=/";
      
      // Only hide the banner, don't affect other popups
      banner.style.display = 'none';
      loadMarketingTools();
      
      // Make sure team popup stays visible if it was showing
      const teamPopup = document.getElementById('team-popup');
      if (teamPopup && teamPopup.style.display === 'block') {
        teamPopup.style.display = 'block';
      }
    });
  } else {
    banner.style.display = 'none';
    loadMarketingTools();
  }
});