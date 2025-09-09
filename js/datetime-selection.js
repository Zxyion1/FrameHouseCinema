// Date and time selection handling
let selectedDate = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDatePicker();
    createTimeSlots();
});

function initializeDatePicker() {
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        flatpickr(dateInput, {
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
                selectedDate = selectedDates[0];
                showTimeSlots();
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
    container.style.display = 'none';

    const heading = document.createElement('h3');
    heading.textContent = 'Available Time Slots';
    container.appendChild(heading);

    const slotsGrid = document.createElement('div');
    slotsGrid.className = 'time-slots-grid';

    timeSlots.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.onclick = () => selectTimeSlot(time, slot);
        slotsGrid.appendChild(slot);
    });

    container.appendChild(slotsGrid);

    // Add the time slots after the date picker
    const dateInput = document.getElementById('booking-date');
    if (dateInput && dateInput.parentElement) {
        dateInput.parentElement.appendChild(container);
    }
}

function selectTimeSlot(time, element) {
    // Remove selection from all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Add selection to clicked slot
    element.classList.add('selected');
    selectedTime = time;

    // Enable the next button
    const nextButton = document.querySelector('#step2 .next-button');
    if (nextButton) {
        nextButton.disabled = false;
    }
}

function showTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    if (timeSlotsContainer) {
        timeSlotsContainer.style.display = 'block';
        
        // Reset selection
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
            slot.disabled = false;
        });

        selectedTime = null;

        // Disable the next button until a time is selected
        const nextButton = document.querySelector('#step2 .next-button');
        if (nextButton) {
            nextButton.disabled = true;
        }
    }
}

// Navigation functions
function nextStep(step) {
    // Validate current step before proceeding
    if (step === 3 && (!selectedDate || !selectedTime)) {
        alert('Please select both a date and time before proceeding.');
        return;
    }

    document.getElementById('step' + (step - 1)).style.display = 'none';
    document.getElementById('step' + step).style.display = 'block';
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        el.classList.remove('active');
        if (index < step) el.classList.add('active');
    });
}

function prevStep(step) {
    document.getElementById('step' + step).style.display = 'none';
    document.getElementById('step' + (step - 1)).style.display = 'block';
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        el.classList.remove('active');
        if (index < (step - 1)) el.classList.add('active');
    });
}
