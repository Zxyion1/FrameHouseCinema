// Booking system configuration
const CONFIG = {
    BUSINESS_LOCATION: {
        lat: 41.3747, // Bowling Green, OH coordinates
        lng: -83.6513
    },
    MAX_TRAVEL_DISTANCE: 250, // Maximum travel distance in kilometers (covers Cincinnati and Cleveland)
    BUSINESS_HOURS: {
        start: 10, // 10 AM
        end: 20   // 8 PM
    }
};

// Store for bookings
let bookings = [];

// Initialize Google Maps
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: CONFIG.BUSINESS_LOCATION,
        zoom: 8
    });

    // Add autocomplete to location input
    const input = document.getElementById('location');
    const autocomplete = new google.maps.places.Autocomplete(input);
    
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        // Check if location is within range
        const distance = calculateDistance(
            CONFIG.BUSINESS_LOCATION,
            {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }
        );

        const messageElement = document.getElementById('distance-message');
        const nextButton = document.querySelector('#step3 .next-button');

        if (distance > CONFIG.MAX_TRAVEL_DISTANCE) {
            messageElement.innerHTML = `
                <div class="error-message">
                    This location is outside our service area. We serve within 250km of Bowling Green, OH.
                </div>
            `;
            nextButton.disabled = true;
        } else {
            messageElement.innerHTML = `
                <div style="color: var(--accent);">
                    Location is within our service area (${Math.round(distance)}km from Bowling Green)
                </div>
            `;
            nextButton.disabled = false;
        }

        // Update map
        map.setCenter(place.geometry.location);
        map.setZoom(12);
    });
}

// Calculate distance between two points
function calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Check if a time slot is available
function checkTimeSlotAvailability(date, time, serviceType) {
    // In a real implementation, this would check against a database
    const existingBooking = bookings.find(booking => 
        booking.date === date && 
        booking.time === time
    );

    if (!existingBooking) return true;

    // If there's an existing booking, check if the service types are compatible
    const incompatibleServices = {
        'Wedding Video Package': ['Wedding Video Package', 'Wedding Photography'],
        'Wedding Photography': ['Wedding Video Package', 'Wedding Photography'],
        'Commercial/Business': ['Commercial/Business'],
        'Short Film Production': ['Short Film Production'],
        'Portrait Sessions': ['Portrait Sessions'],
        'Event Photography': ['Event Photography']
    };

    return !incompatibleServices[serviceType].includes(existingBooking.serviceType);
}

// Handle form submission
async function submitBooking() {
    try {
        // Validate all required fields
        const requiredFields = ['name', 'email', 'phone', 'location'];
        for (const field of requiredFields) {
            const element = document.getElementById(field);
            if (!element.value) {
                throw new Error(`Please fill in your ${field}`);
            }
        }

        if (!selectedTimeSlot) {
            throw new Error('Please select a time slot');
        }

        // Create the booking
        const booking = {
            service: document.getElementById('service-type').value,
            date: document.getElementById('booking-date').value,
            time: selectedTimeSlot,
            location: document.getElementById('location').value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        // Process payment with Stripe
        const {paymentIntent, error} = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card: card,
                    billing_details: {
                        name: booking.name,
                        email: booking.email
                    }
                }
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        // Save booking to array (in real implementation, this would be a database)
        bookings.push(booking);

        // Show success message
        alert('Booking confirmed! You will receive a confirmation email shortly.');
        window.location.href = 'booking-confirmation.html';

    } catch (error) {
        document.getElementById('card-errors').textContent = error.message;
    }
}

// Initialize the form
// Generate time slots for a given date
function generateTimeSlots(dateStr) {
    const timeSlotsContainer = document.querySelector('.time-slots');
    if (!timeSlotsContainer) {
        console.error('Time slots container not found');
        return;
    }

    // Clear existing time slots
    timeSlotsContainer.innerHTML = '';
    selectedTimeSlot = null;

    // Get selected service
    const serviceType = document.querySelector('.service-card.selected')?.dataset.service;
    if (!serviceType) {
        console.error('No service selected');
        return;
    }

    // Generate time slots from business hours
    const startHour = CONFIG.BUSINESS_HOURS.start;
    const endHour = CONFIG.BUSINESS_HOURS.end;
    
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minutes of ['00', '30']) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minutes}`;
            const isAvailable = checkTimeSlotAvailability(dateStr, timeStr, serviceType);
            
            const timeSlot = document.createElement('div');
            timeSlot.className = `time-slot${isAvailable ? '' : ' disabled'}`;
            timeSlot.textContent = timeStr;
            
            if (isAvailable) {
                timeSlot.addEventListener('click', () => {
                    // Deselect previously selected time slot
                    document.querySelectorAll('.time-slot.selected').forEach(slot => {
                        slot.classList.remove('selected');
                    });
                    
                    // Select new time slot
                    timeSlot.classList.add('selected');
                    selectedTimeSlot = timeStr;
                });
            }
            
            timeSlotsContainer.appendChild(timeSlot);
        }
    }
}

// Initialize all form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    if (typeof google !== 'undefined') {
        initMap();
    } else {
        console.error('Google Maps not loaded');
    }

    // Set date picker options
    const datePickerOptions = {
        minDate: 'today',
        minTime: '10:00',
        maxTime: '20:00',
        disable: [
            function(date) {
                return isDateFullyBooked(date);
            }
        ],
        onChange: function(selectedDates, dateStr) {
            generateTimeSlots(dateStr);
        }
    };

    // Initialize date picker
    flatpickr("#booking-date", datePickerOptions);

    // Initialize step buttons
    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.step').id.replace('step', ''));
            nextStep(currentStep);
        });
    });

    document.querySelectorAll('.prev-button').forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.closest('.step').id.replace('step', ''));
            prevStep(currentStep);
        });
    });

    // Pre-fill service type if provided in URL
    getServiceFromURL();
});
