// Toggle Sidebar
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  hamburger.classList.toggle('active');
});
// Lock screen orientation to portrait (if supported)
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock("portrait").catch((error) => {
    console.error("Failed to lock orientation: ", error);
  });
}