document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('birthdayCard');
    const button = document.getElementById('actionButton');
    const registrationForm = document.getElementById('registrationForm');
    const closeFormButton = document.getElementById('closeForm');
    const rsvpForm = document.getElementById('rsvpForm');
    const thankYouPopup = document.getElementById('thankYouPopup');
    const closeThankYouButton = document.getElementById('closeThankYou');
  
    // Handle hover state
    card.addEventListener('mouseenter', () => {
      button.textContent = 'Continuer';
    });
  
    card.addEventListener('mouseleave', () => {
      button.textContent = 'RSVP';
    });
  
    // Show registration form
    button.addEventListener('click', () => {
      registrationForm.classList.add('active');
    });
  
    // Close registration form
    closeFormButton.addEventListener('click', () => {
      registrationForm.classList.remove('active');
    });
  
    // Close thank you popup
    closeThankYouButton.addEventListener('click', () => {
      thankYouPopup.classList.remove('active');
    });
  
    // Handle form submission
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value
      };
  
      console.log('Form submitted:', formData);
      
      // Clear form and close
      rsvpForm.reset();
      registrationForm.classList.remove('active');
      
      // Show thank you popup
      setTimeout(() => {
        thankYouPopup.classList.add('active');
      }, 300);
    });
  });