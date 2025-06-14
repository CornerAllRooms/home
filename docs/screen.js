function updateScaleFactor() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const pageWidth = 2049; // Original width of the page
  const pageHeight = 1084.5; // Original height of the page

  // Calculate the scale factor to fit the page within the viewport
  const scaleWidth = viewportWidth / pageWidth;
  const scaleHeight = viewportHeight / pageHeight;
  const scaleFactor = Math.min(scaleWidth, scaleHeight);

  // Apply the scale factor to the PDF wrapper
  document.querySelector('.pdf-wrap').style.setProperty('--scale-factor', scaleFactor);
}

// Update the scale factor on window resize and load
window.addEventListener('resize', updateScaleFactor);
window.addEventListener('load', updateScaleFactor);