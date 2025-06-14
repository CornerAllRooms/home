// Wait for the page to load
window.addEventListener('load', function() {
    // Show the loading screen
    const loadingScreen = document.getElementById('loading-screen');
    const content = document.getElementById('content');

    // Set a timeout for 8 seconds
    setTimeout(function() {
        // Hide the loading screen
        loadingScreen.style.display = 'none';
        // Show the content
        content.style.display = 'block';
    }, 4800); // 8000 milliseconds = 8 seconds
});