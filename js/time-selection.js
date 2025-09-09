document.addEventListener('DOMContentLoaded', function() {
    initializeTimeSelection();
});

function initializeTimeSelection() {
    const timeSlots = [
        "10:00 AM", "11:00 AM", "12:00 PM",
        "1:00 PM", "2:00 PM", "3:00 PM",
        "4:00 PM", "5:00 PM", "6:00 PM",
        "7:00 PM", "8:00 PM"
    ];

    // Create time slots section
    const timeSlotsSection = document.createElement('div');
    timeSlotsSection.id = 'time-slots-section';
    timeSlotsSection.className = 'booking-section time-slots-section';
    timeSlotsSection.style.display = 'none'; // Hidden by default

    const title = document.createElement('h3');
    title.className = 'section-title';
    title.textContent = 'Select a Time';
    timeSlotsSection.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'time-slots-grid';

    timeSlots.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.onclick = () => selectTimeSlot(time, slot);
        grid.appendChild(slot);
    });

    timeSlotsSection.appendChild(grid);

    // Insert after the calendar
    const calendar = document.querySelector('.calendar-group');
    if (calendar && calendar.parentNode) {
        calendar.parentNode.insertBefore(timeSlotsSection, calendar.nextSibling);
    }

    // Initialize flatpickr with the new configuration
    flatpickr("#booking-date", {
        enableTime: false, // Disable time selection in calendar
        dateFormat: "Y-m-d",
        minDate: "today",
        disable: [
            function(date) {
                // Disable Sundays
                return date.getDay() === 0;
            }
        ],
        onChange: function(selectedDates) {
            const date = selectedDates[0];
            if (date) {
                document.getElementById('time-slots-section').style.display = 'block';
                // Reset any previously selected time
                document.querySelectorAll('.time-slot.selected').forEach(slot => {
                    slot.classList.remove('selected');
                });
                updateConfirmButton();
            }
        }
    });
}

function selectTimeSlot(time, element) {
    // Remove selection from all slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });

    // Add selection to clicked slot
    element.classList.add('selected');

    // Store the selected time
    const selectedTime = time;

    // Check if we should enable the confirm button
    updateConfirmButton();
}

function updateConfirmButton() {
    const confirmBtn = document.getElementById('confirm-datetime-btn');
    if (confirmBtn) {
        const hasDate = document.querySelector('.flatpickr-input').value !== '';
        const hasTime = document.querySelector('.time-slot.selected') !== null;
        confirmBtn.disabled = !(hasDate && hasTime);
    }
}
