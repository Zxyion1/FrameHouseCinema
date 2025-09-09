// Helper function to check if a date is fully booked
function isDateFullyBooked(date) {
    // This is a placeholder function - in a real implementation, 
    // you would check against your booking database
    return false;
}

// Global variable for selected time slot
let selectedTimeSlot = null;

// Validate each step before proceeding
function validateStep(step) {
    switch (step) {
        case 1:
            // Service selection validation
            const selectedService = document.querySelector('.service-card.selected');
            if (!selectedService) {
                alert('Please select a service to continue.');
                return false;
            }
            return true;

        case 2:
            // Date and time validation
            const selectedDate = document.querySelector('.flatpickr-input').value;
            if (!selectedDate) {
                alert('Please select a date to continue.');
                return false;
            }
            if (!selectedTimeSlot) {
                alert('Please select a time slot to continue.');
                return false;
            }
            return true;

        case 3:
            // Location validation
            const location = document.getElementById('location').value;
            const nextButton = document.querySelector('#step3 .next-button');
            if (!location || nextButton.disabled) {
                alert('Please enter a valid location within our service area.');
                return false;
            }
            return true;

        case 4:
            // Payment info validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            if (!name || !email || !phone) {
                alert('Please fill in all required contact information.');
                return false;
            }
            return true;

        default:
            return true;
    }
}

// Handle step navigation
function nextStep(currentStep) {
    if (!validateStep(currentStep)) {
        return;
    }
    
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const nextStepElement = document.getElementById(`step${currentStep + 1}`);
    
    if (currentStepElement && nextStepElement) {
        currentStepElement.classList.remove('active');
        currentStepElement.style.display = 'none';
        nextStepElement.classList.add('active');
        nextStepElement.style.display = 'block';
        window.scrollTo(0, nextStepElement.offsetTop - 20);
        
        // Update progress bar
        document.querySelector(`.progress-step:nth-child(${currentStep})`).classList.remove('active');
        document.querySelector(`.progress-step:nth-child(${currentStep + 1})`).classList.add('active');
    }
}

function prevStep(currentStep) {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const prevStepElement = document.getElementById(`step${currentStep - 1}`);
    
    if (currentStepElement && prevStepElement) {
        currentStepElement.classList.remove('active');
        currentStepElement.style.display = 'none';
        prevStepElement.classList.add('active');
        prevStepElement.style.display = 'block';
        window.scrollTo(0, prevStepElement.offsetTop - 20);

        // Update progress bar
        document.querySelector(`.progress-step:nth-child(${currentStep})`).classList.remove('active');
        document.querySelector(`.progress-step:nth-child(${currentStep - 1})`).classList.add('active');
    }
}

// Add this to your existing booking.js
