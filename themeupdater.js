function updatePWAInstall(team) {
  // Only works during beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.platformOptions = {
      overrideIcon: `/${team}.png`, // Forces team-specific icon
      overrideThemeColor: TEAM_COLORS[team].themeColor
    };
  });
}

// Call when team changes
onTeamSelected('black'); // Example
class ThemeManager {
  static THEMES = {
    'black': {
      themeColor: '#FF0000',
      secondaryColor: '#000000',
      icon: '/black.png',
      accent: '#FF4444'
    },
    'gold': {
      themeColor: '#FFC0CB',
      secondaryColor: '#FFD700',
      icon: '/gold.png',
      accent: '#FFB6C1'
    },
    'green-gold': {
      themeColor: '#008000',
      secondaryColor: '#FFD700',
      icon: '/green-gold.png',
      accent: '#90EE90'
    },
    'original': {
      themeColor: '#FFA500',
      secondaryColor: '#A89858',
      icon: '/original.png',
      accent: '#FFD580'
    }
  };

  static init() {
    this.applyTheme(localStorage.getItem('selectedTeam') || 'original');
    this.watchSystemTheme();
  }

  static applyTheme(team) {
    const theme = this.THEMES[team] || this.THEMES.original;
    
    // Update Favicon (with cache busting)
    this.updateFavicon(`${theme.icon}?v=${Date.now()}`);
    
    // Update PWA Manifest
    this.updateManifest(team, theme.themeColor);
    
    // Update CSS Variables
    document.documentElement.style.setProperty('--primary', theme.themeColor);
    document.documentElement.style.setProperty('--secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--accent', theme.accent);
    
    // Save preference
    localStorage.setItem('selectedTeam', team);
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }));
  }

  static updateFavicon(iconPath) {
    const links = [
      { rel: 'icon', sizes: '16x16' },
      { rel: 'icon', sizes: '32x32' },
      { rel: 'apple-touch-icon', sizes: '180x180' },
      { rel: 'mask-icon', color: '#000000' }
    ];

    links.forEach(link => {
      const el = document.querySelector(`link[rel="${link.rel}"][sizes="${link.sizes}"]`) || 
                 document.createElement('link');
      el.rel = link.rel;
      el.href = iconPath;
      if (link.sizes) el.sizes = link.sizes;
      if (link.color) el.color = link.color;
      document.head.appendChild(el);
    });
  }

  static updateManifest(team, themeColor) {
    const manifest = {
      ...window.manifestBase,
      theme_color: themeColor,
      icons: [{
        src: this.THEMES[team].icon,
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "any maskable"
      }]
    };

    const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const link = document.querySelector('link[rel="manifest"]') || 
                 document.createElement('link');
    link.rel = 'manifest';
    link.href = url;
    document.head.appendChild(link);
  }

  static watchSystemTheme() {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addListener(() => this.handleSystemThemeChange());
    this.handleSystemThemeChange();
  }

  static handleSystemThemeChange() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark-mode', isDark);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Store original manifest
  window.manifestBase = {
    name: "CornerRoom",
    short_name: "CAR",
    start_url: "https://cornerroom.co.za",
    display: "standalone",
    background_color: "#000000",
    orientation: "portrait-primary"
  };
  
  ThemeManager.init();
});
