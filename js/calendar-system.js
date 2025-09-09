// Booking state
let bookingState = {
    selectedDate: null,
    selectedTime: null,
    duration: null,
    basePrice: 0
};

// Available durations per service type
const serviceDurations = {
    'Wedding Video Package': [4, 6, 8], // hours
    'Commercial Video': [2, 4, 6],
    'Event Photography': [2, 3, 4],
    'Portrait Session': [1, 2],
    // Add more services as needed
};

// Price multipliers for duration
const durationMultipliers = {
    1: 1,
    2: 1.8,
    3: 2.5,
    4: 3,
    6: 4,
    8: 5
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    createTimeSlots();
    setupDurationSelector();
    updateBookingPrice();
});

function initializeCalendar() {
    const calendar = document.getElementById('booking-date');
    if (calendar) {
        flatpickr(calendar, {
            enableTime: false,
            dateFormat: "Y-m-d",
            minDate: "today",
            disable: [
                function(date) {
                    // Disable Sundays
                    return date.getDay() === 0;
                }
            ],
            onChange: function(selectedDates) {
                bookingState.selectedDate = selectedDates[0];
                showTimeSlots();
                updateBookingPrice();
            }
        });
    }
}

function createTimeSlots() {
    const timeSlots = [
        "10:00 AM", "11:00 AM", "12:00 PM",
        "1:00 PM", "2:00 PM", "3:00 PM",
        "4:00 PM", "5:00 PM", "6:00 PM",
        "7:00 PM", "8:00 PM"
    ];

    const container = document.createElement('div');
    container.id = 'time-slots';
    container.className = 'time-slots';

    const grid = document.createElement('div');
    grid.className = 'time-slots-grid';

    timeSlots.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.onclick = () => selectTimeSlot(time, slot);
        grid.appendChild(slot);
    });

    container.appendChild(grid);

    const dateContainer = document.getElementById('date-time-container');
    if (dateContainer) {
        dateContainer.appendChild(container);
    }
}

function selectTimeSlot(time, element) {
    // Remove selection from all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Add selection to clicked slot
    element.classList.add('selected');
    bookingState.selectedTime = time;

    // Check if the selected time + duration exceeds 8 PM
    const selectedHour = parseTimeString(time);
    const duration = bookingState.duration || 1;
    
    if (selectedHour + duration > 20) { // 20 = 8 PM
        alert('The selected time and duration would exceed our operating hours (8 PM). Please select an earlier time or shorter duration.');
        element.classList.remove('selected');
        bookingState.selectedTime = null;
        return;
    }

    // Enable the next button if we have both date and time
    enableNextIfReady();
    updateBookingPrice();
}

function parseTimeString(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours] = time.split(':');
    hours = parseInt(hours);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours;
}

function setupDurationSelector() {
    const serviceType = document.getElementById('service-type').value;
    const durations = serviceDurations[serviceType] || [1, 2];
    
    const container = document.createElement('div');
    container.className = 'duration-selector';
    container.innerHTML = `
        <label for="duration">Session Duration:</label>
        <select id="duration" onchange="updateDuration(this.value)">
            ${durations.map(hours => 
                `<option value="${hours}">${hours} hour${hours > 1 ? 's' : ''}</option>`
            ).join('')}
        </select>
    `;

    const dateContainer = document.getElementById('date-time-container');
    if (dateContainer) {
        dateContainer.appendChild(container);
    }
}

function updateDuration(hours) {
    bookingState.duration = parseInt(hours);
    // Revalidate current time selection
    if (bookingState.selectedTime) {
        const selectedHour = parseTimeString(bookingState.selectedTime);
        if (selectedHour + hours > 20) {
            alert('The selected duration would exceed our operating hours (8 PM). Please select an earlier time or shorter duration.');
            document.querySelector('.time-slot.selected')?.classList.remove('selected');
            bookingState.selectedTime = null;
        }
    }
    updateBookingPrice();
    enableNextIfReady();
}

function updateBookingPrice() {
    if (!bookingState.selectedTime || !bookingState.duration) return;

    const basePrice = bookingState.basePrice;
    const multiplier = durationMultipliers[bookingState.duration];
    const totalPrice = basePrice * multiplier;

    const priceDisplay = document.getElementById('price-display');
    if (priceDisplay) {
        priceDisplay.textContent = `Estimated Price: $${totalPrice}`;
    }
}

function enableNextIfReady() {
    const nextButton = document.querySelector('#step2 .next-button');
    if (nextButton) {
        nextButton.disabled = !(bookingState.selectedDate && 
                              bookingState.selectedTime && 
                              bookingState.duration);
    }
}

// Function to check time slot availability (to be connected to backend)
function isTimeSlotAvailable(date, time) {
    // This would typically check against a backend database
    // For now, returning true for all slots
    return true;
}
