// Get service type from URL parameters
function getServiceFromURL() {
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    if (service) {
        const serviceSelect = document.getElementById('service-type');
        serviceSelect.value = service;
    }
}

// Handle step navigation
function nextStep(currentStep) {
    // Validate current step
    if (!validateStep(currentStep)) {
        return;
    }

    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep + 1}`).classList.add('active');
}

function prevStep(currentStep) {
    document.getElementById(`step${currentStep}`).classList.remove('active');
    document.getElementById(`step${currentStep - 1}`).classList.add('active');
}

function validateStep(step) {
    switch(step) {
        case 1:
            const service = document.getElementById('service-type').value;
            if (!service) {
                alert('Please select a service type');
                return false;
            }
            return true;

        case 2:
            const date = document.getElementById('booking-date').value;
            const timeSlots = document.querySelectorAll('.time-slot.selected');
            if (!date || timeSlots.length === 0) {
                alert('Please select both a date and time');
                return false;
            }
            return true;

        case 3:
            const location = document.getElementById('location').value;
            if (!location) {
                alert('Please enter a location');
                return false;
            }
            return true;

        case 4:
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            if (!name || !email || !phone) {
                alert('Please fill in all contact information');
                return false;
            }
            if (!validateEmail(email)) {
                alert('Please enter a valid email address');
                return false;
            }
            if (!validatePhone(phone)) {
                alert('Please enter a valid phone number');
                return false;
            }
            return true;

        default:
            return true;
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\+?1?\d{10,}$/.test(phone.replace(/[\s-()]/g, ''));
}

// Generate time slots
function generateTimeSlots(date) {
    const timeSlots = document.getElementById('time-slots');
    timeSlots.innerHTML = '';

    const startHour = 10; // 10 AM
    const endHour = 20;   // 8 PM
    const interval = 30;   // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = timeString;
            
            // Check if slot is available
            if (isSlotAvailable(date, timeString)) {
                slot.addEventListener('click', () => selectTimeSlot(slot));
            } else {
                slot.classList.add('unavailable');
            }
            
            timeSlots.appendChild(slot);
        }
    }
}

function selectTimeSlot(slot) {
    // Remove selection from other slots
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    
    // Select this slot
    slot.classList.add('selected');
    selectedTimeSlot = slot.textContent;
}

// Initialize Stripe
let stripe;
let card;
let clientSecret;

async function initializeStripe() {
    // This is a test publishable key from Stripe's documentation
    stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
    
    const elements = stripe.elements();
    card = elements.create('card');
    card.mount('#card-element');

    card.addEventListener('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    getServiceFromURL();
    initializeStripe();

    // Pre-fill location if available
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const geocoder = new google.maps.Geocoder();
            const latlng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            geocoder.geocode({ location: latlng }, function(results, status) {
                if (status === 'OK' && results[0]) {
                    document.getElementById('location').value = results[0].formatted_address;
                }
            });
        });
    }
});
