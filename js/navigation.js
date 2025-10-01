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
            // No validation needed for step 2 - date and time are selected on this step
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
function goToStep(stepNumber) {
    // Hide all steps first
    const allSteps = document.querySelectorAll('.booking-step');
    allSteps.forEach(step => {
        step.classList.remove('active');
        step.style.display = 'none';
    });

    // Show the requested step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
        targetStep.style.display = 'block';
        window.scrollTo(0, targetStep.offsetTop - 20);
        
        // Update progress bar
        document.querySelectorAll('.progress-step').forEach(step => step.classList.remove('active'));
        document.querySelector(`.progress-step:nth-child(${stepNumber})`).classList.add('active');
    }
}

function nextStep(currentStep) {
    if (!validateStep(currentStep)) {
        return;
    }
    goToStep(currentStep + 1);
}

function prevStep(currentStep) {
    goToStep(currentStep - 1);
}

// Add this to your existing booking.js
