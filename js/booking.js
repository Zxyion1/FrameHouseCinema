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

// Initialize map using Leaflet + Nominatim (OpenStreetMap)
function initMap() {
    // Create the Leaflet map
    const map = L.map('map').setView([CONFIG.BUSINESS_LOCATION.lat, CONFIG.BUSINESS_LOCATION.lng], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add base marker for business location
    L.marker([CONFIG.BUSINESS_LOCATION.lat, CONFIG.BUSINESS_LOCATION.lng]).addTo(map).bindPopup('FrameHouseCinema base');

    let marker = null;
    const input = document.getElementById('location');
    const suggestions = document.getElementById('location-suggestions');
    const nextButton = document.querySelector('#step3 .next-button');
    const messageElement = document.getElementById('distance-message');

    function setLocation(lat, lng, displayName) {
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng]).addTo(map);
        }
        map.setView([lat, lng], 12);
        if (displayName) input.value = displayName;

        const distance = calculateDistance(CONFIG.BUSINESS_LOCATION, { lat, lng });
        if (distance > CONFIG.MAX_TRAVEL_DISTANCE) {
            messageElement.innerHTML = `<div class="error-message">This location is outside our service area. We serve within ${CONFIG.MAX_TRAVEL_DISTANCE}km of Bowling Green, OH.</div>`;
            if (nextButton) nextButton.disabled = true;
        } else {
            messageElement.innerHTML = `<div style="color: var(--accent);">Location is within our service area (${Math.round(distance)}km from Bowling Green)</div>`;
            if (nextButton) nextButton.disabled = false;
        }
    }

    // Debounced search using Nominatim
    let debounceTimer = null;
    let suggestionIndex = -1;
    input.addEventListener('input', (e) => {
        const q = e.target.value.trim();
        suggestions.innerHTML = '';
        suggestions.style.display = 'none';
        if (debounceTimer) clearTimeout(debounceTimer);
        if (!q) return;
        debounceTimer = setTimeout(() => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`;
            fetch(url)
                .then(r => r.json())
                .then(results => {
                    suggestions.innerHTML = '';
                    if (!results || results.length === 0) { suggestions.style.display = 'none'; return; }
                    // Populate suggestions and reset keyboard index
                    suggestionIndex = -1;
                    results.forEach(r => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item';
                        item.textContent = r.display_name;
                        item.dataset.lat = r.lat;
                        item.dataset.lon = r.lon;
                        item.addEventListener('click', () => {
                            setLocation(parseFloat(item.dataset.lat), parseFloat(item.dataset.lon), item.textContent);
                            suggestions.innerHTML = '';
                            suggestions.style.display = 'none';
                        });
                        suggestions.appendChild(item);
                    });
                    // keyboard support: highlight/unhighlight helpers
                    function highlightSuggestion(idx){
                        const items = suggestions.querySelectorAll('.suggestion-item');
                        items.forEach((it,i)=> it.classList.toggle('active', i===idx));
                    }
                    // handle key navigation on the input
                    input.onkeydown = function(ev){
                        const items = suggestions.querySelectorAll('.suggestion-item');
                        if (!items || items.length === 0) return;
                        if (ev.key === 'ArrowDown') {
                            ev.preventDefault();
                            suggestionIndex = Math.min(items.length - 1, suggestionIndex + 1);
                            highlightSuggestion(suggestionIndex);
                            items[suggestionIndex].scrollIntoView({block: 'nearest'});
                        } else if (ev.key === 'ArrowUp') {
                            ev.preventDefault();
                            suggestionIndex = Math.max(0, suggestionIndex - 1);
                            highlightSuggestion(suggestionIndex);
                            items[suggestionIndex].scrollIntoView({block: 'nearest'});
                        } else if (ev.key === 'Enter') {
                            ev.preventDefault();
                            if (suggestionIndex >= 0 && items[suggestionIndex]) {
                                const it = items[suggestionIndex];
                                setLocation(parseFloat(it.dataset.lat), parseFloat(it.dataset.lon), it.textContent);
                                suggestions.innerHTML = '';
                                suggestions.style.display = 'none';
                            }
                        } else if (ev.key === 'Escape') {
                            suggestions.innerHTML = '';
                            suggestions.style.display = 'none';
                        }
                    };
                    suggestions.style.display = 'block';
                })
                .catch(err => console.error('Nominatim error', err));
        }, 350);
    });

    // Click on map to set location
    map.on('click', function(e) {
        setLocation(e.latlng.lat, e.latlng.lng);
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
    // Initialize the map (Leaflet)
    try {
        initMap();
    } catch (e) {
        console.error('Map initialization failed', e);
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
