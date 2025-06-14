// Hide Button and Text When Pressed
const acceptButton = document.getElementById('accept-button');
const acceptContainer = document.querySelector('.accept-container');

acceptButton.addEventListener('click', () => {
  acceptContainer.classList.add('hidden'); // Hide the container
});