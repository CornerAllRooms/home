// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register the service worker
        navigator.serviceWorker.register('/aichat/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Show the add to home screen banner
let deferredPrompt;
const banner = document.getElementById('add-to-home-screen-banner');
const addButton = document.getElementById('add-to-home-screen-button');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Check if the app is already installed
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        // Show the banner only if not already installed
        banner.style.display = 'block';
    }
});

addButton.addEventListener('click', () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        // Hide the banner regardless of user choice
        banner.style.display = 'none';
        deferredPrompt = null;
    });
});

// Hide banner if app is already installed
window.addEventListener('appinstalled', () => {
    banner.style.display = 'none';
    console.log('PWA was installed');
});