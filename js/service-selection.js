// Handle URL parameters and service selection
// Define all services with their details
const services = {
    'Wedding Video Package': {
        price: '$1,500',
        note: 'Full day coverage',
        category: 'video'
    },
    'Commercial/Business': {
        price: '$800',
        note: 'Per project',
        category: 'video'
    },
    'Short Film Production': {
        price: '$2,000',
        note: 'Custom pricing based on project scope',
        category: 'video'
    },
    'Wedding Photography': {
        price: '$1,800',
        note: 'Full day coverage',
        category: 'photo'
    },
    'Portrait Sessions': {
        price: '$200',
        note: '2-hour session',
        category: 'photo'
    },
    'Event Photography': {
        price: '$400',
        note: '4-hour minimum',
        category: 'photo'
    }
};

function createServiceMenu(container, currentService) {
    const menu = document.createElement('div');
    menu.className = 'service-menu';
    
    // Create category sections
    const videoSection = document.createElement('div');
    const photoSection = document.createElement('div');
    
    videoSection.innerHTML = '<h3>Video Services</h3>';
    photoSection.innerHTML = '<h3>Photo Services</h3>';
    
    // Create service options
    Object.entries(services).forEach(([name, details]) => {
        const option = document.createElement('div');
        option.className = 'service-option' + (name === currentService ? ' selected' : '');
        option.innerHTML = `
            <div class="service-name">${name}</div>
            <div class="service-price">${details.price}</div>
            <div class="service-note">${details.note}</div>
        `;
        
        option.onclick = () => {
            document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            document.getElementById('service-type').value = name;
        };
        
        if (details.category === 'video') {
            videoSection.appendChild(option);
        } else {
            photoSection.appendChild(option);
        }
    });
    
    menu.appendChild(videoSection);
    menu.appendChild(photoSection);
    container.appendChild(menu);
    
    return menu;
}

function initializeServiceSelection() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedService = urlParams.get('service');
    
    if (selectedService) {
        const serviceSelect = document.getElementById('service-type');
        if (serviceSelect) {
            // Create a container for our custom UI
            const container = document.createElement('div');
            container.className = 'service-selection-container';
            serviceSelect.parentElement.appendChild(container);
            
            // Hide the original select
            serviceSelect.style.display = 'none';
            
            // Decode the URL-encoded service name
            const decodedService = decodeURIComponent(selectedService);
            serviceSelect.value = decodedService;
            
            // Show the selected service
            const selectedDisplay = document.createElement('div');
            selectedDisplay.className = 'selected-service';
            selectedDisplay.innerHTML = `
                <div class="service-name">${decodedService}</div>
                <div class="service-price">${services[decodedService].price}</div>
                <div class="service-note">${services[decodedService].note}</div>
            `;
            container.appendChild(selectedDisplay);
            
            // Add a "Change Service" button
            const changeButton = document.createElement('button');
            changeButton.textContent = 'Change Service';
            changeButton.className = 'change-service-btn';
            container.appendChild(changeButton);

            let serviceMenu = null;
            
            changeButton.onclick = function() {
                if (serviceMenu) {
                    // If menu is already open, close it
                    serviceMenu.remove();
                    serviceMenu = null;
                    changeButton.textContent = 'Change Service';
                } else {
                    // Open the menu
                    serviceMenu = createServiceMenu(container, decodedService);
                    changeButton.textContent = 'Cancel';
                    
                    // Add confirm button
                    const confirmButton = document.createElement('button');
                    confirmButton.textContent = 'Confirm Service';
                    confirmButton.className = 'change-service-btn confirm-service';
                    
                    confirmButton.onclick = function() {
                        const selectedOption = document.querySelector('.service-option.selected');
                        if (selectedOption) {
                            const serviceName = selectedOption.querySelector('.service-name').textContent;
                            selectedDisplay.innerHTML = `
                                <div class="service-name">${serviceName}</div>
                                <div class="service-price">${services[serviceName].price}</div>
                                <div class="service-note">${services[serviceName].note}</div>
                            `;
                            serviceSelect.value = serviceName;
                        }
                        serviceMenu.remove();
                        serviceMenu = null;
                        confirmButton.remove();
                        changeButton.textContent = 'Change Service';
                    };
                    
                    container.appendChild(confirmButton);
                }
            };
            
            confirmButton.onclick = function() {
                serviceSelect.disabled = true;
                confirmButton.style.display = 'none';
                changeButton.style.display = 'inline-block';
            };
            
            serviceContainer.appendChild(changeButton);
            serviceContainer.appendChild(confirmButton);
        }
    }
}

// Initialize when the document loads
document.addEventListener('DOMContentLoaded', initializeServiceSelection);
