// Modern World Clock Gadget JavaScript

class WorldClockGadget {
    constructor() {
        this.clocks = [];
        this.updateInterval = null;
        this.isAnalogView = false;
        this.config = null;
        this.init();
    }

    async init() {
        // Load configuration first
        await this.loadConfiguration();
        // Initialize with saved or default clocks
        this.addDefaultClocks();
        this.startClockUpdates();
        this.setupEventListeners();
        // Set initial view mode
        this.setInitialViewMode();
    }

    async loadConfiguration() {
        try {
            if (window.electronAPI && window.electronAPI.loadConfig) {
                this.config = await window.electronAPI.loadConfig();
            } else {
                // Fallback for web version
                this.config = {
                    timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
                    viewMode: 'digital'
                };
            }
        } catch (error) {
            console.log('Error loading configuration:', error);
            this.config = {
                timezones: ['America/New_York', 'Europe/London', 'Asia/Tokyo'],
                viewMode: 'digital'
            };
        }
    }

    async saveConfiguration() {
        try {
            if (window.electronAPI && window.electronAPI.saveConfig) {
                await window.electronAPI.saveConfig(this.config);
            }
        } catch (error) {
            console.log('Error saving configuration:', error);
        }
    }

    async saveTimezones() {
        try {
            const timezones = this.clocks.map(clock => clock.timezone);
            if (window.electronAPI && window.electronAPI.saveTimezones) {
                await window.electronAPI.saveTimezones(timezones);
                this.config.timezones = timezones;
            }
        } catch (error) {
            console.log('Error saving timezones:', error);
        }
    }

    async saveViewMode(viewMode) {
        try {
            if (window.electronAPI && window.electronAPI.saveViewMode) {
                await window.electronAPI.saveViewMode(viewMode);
                this.config.viewMode = viewMode;
            }
        } catch (error) {
            console.log('Error saving view mode:', error);
        }
    }

    addDefaultClocks() {
        // Use saved timezones or fallback to defaults
        const timezones = this.config?.timezones || ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
        
        timezones.forEach(timezone => {
            // Extract city name from timezone
            const cityName = this.getCityNameFromTimezone(timezone);
            this.addClock(cityName, timezone);
        });
    }

    getCityNameFromTimezone(timezone) {
        // Extract city name from timezone string
        const parts = timezone.split('/');
        const cityPart = parts[parts.length - 1];
        return cityPart.replace(/_/g, ' ');
    }

    setInitialViewMode() {
        if (this.config?.viewMode === 'analog') {
            this.switchToAnalogView();
        } else {
            this.switchToDigitalView();
        }
    }

    addClock(cityName, timezone) {
        const clockId = `clock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const clock = {
            id: clockId,
            city: cityName,
            timezone: timezone
        };
        
        this.clocks.push(clock);
        this.renderClock(clock);
        this.saveTimezones();
    }

    removeClock(clockId) {
        // Remove from array
        this.clocks = this.clocks.filter(clock => clock.id !== clockId);
        
        // Remove from DOM
        const digitalElement = document.getElementById(clockId);
        const analogElement = document.getElementById(`analog-${clockId}`);
        
        if (digitalElement) {
            digitalElement.remove();
        }
        if (analogElement) {
            analogElement.remove();
        }
        
        this.saveTimezones();
    }

    renderClock(clock) {
        if (this.isAnalogView) {
            this.renderAnalogClock(clock);
        } else {
            this.renderDigitalClock(clock);
        }
    }

    renderDigitalClock(clock) {
        const clockGrid = document.getElementById('clockGrid');
        if (!clockGrid) return;

        const clockCard = document.createElement('div');
        clockCard.className = 'clock-card';
        clockCard.id = clock.id;

        clockCard.innerHTML = `
            <div class="clock-header">
                <div>
                    <div class="clock-city">${clock.city}</div>
                    <div class="clock-timezone">${this.getTimezoneAbbreviation(clock.timezone)}</div>
                </div>
            </div>
            <div class="clock-time" id="time-${clock.id}">--:--:--</div>
            <div class="clock-date" id="date-${clock.id}">Loading...</div>
            <div class="clock-actions">
                <button class="delete-clock" onclick="worldClock.removeClock('${clock.id}')" title="Remove Clock">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;

        clockGrid.appendChild(clockCard);
        this.updateClockTime(clock);
    }

    updateClockTime(clock) {
        try {
            const now = new Date();
            const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: clock.timezone}));
            
            // Format time
            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: clock.timezone
            };
            
            // Format date
            const dateOptions = {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                timeZone: clock.timezone
            };
            
            const timeString = timeInTimezone.toLocaleTimeString('en-US', timeOptions);
            const dateString = timeInTimezone.toLocaleDateString('en-US', dateOptions);
            
            const timeElement = document.getElementById(`time-${clock.id}`);
            const dateElement = document.getElementById(`date-${clock.id}`);
            
            if (timeElement) {
                timeElement.textContent = timeString;
            }
            if (dateElement) {
                dateElement.textContent = dateString;
            }
            
            // Update analog clock if in analog view
            if (this.isAnalogView) {
                this.updateAnalogClock(clock);
            }
            
        } catch (error) {
            console.error('Error updating clock time:', error);
            const timeElement = document.getElementById(`time-${clock.id}`);
            const dateElement = document.getElementById(`date-${clock.id}`);
            
            if (timeElement) timeElement.textContent = 'Error';
            if (dateElement) dateElement.textContent = 'Invalid timezone';
        }
    }

    getTimezoneAbbreviation(timezone) {
        try {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                timeZone: timezone,
                timeZoneName: 'short'
            });
            
            const parts = timeString.split(' ');
            return parts[parts.length - 1];
        } catch (error) {
            return timezone.split('/').pop().replace(/_/g, ' ');
        }
    }

    startClockUpdates() {
        // Update immediately
        this.updateAllClocks();
        
        // Update every second
        this.updateInterval = setInterval(() => {
            this.updateAllClocks();
        }, 1000);
    }

    updateAllClocks() {
        this.clocks.forEach(clock => {
            this.updateClockTime(clock);
        });
    }

    setupEventListeners() {
        // View toggle buttons
        const digitalViewBtn = document.getElementById('digitalView');
        const analogViewBtn = document.getElementById('analogView');
        
        if (digitalViewBtn) {
            digitalViewBtn.addEventListener('click', () => {
                this.switchToDigitalView();
            });
        }

        if (analogViewBtn) {
            analogViewBtn.addEventListener('click', () => {
                this.switchToAnalogView();
            });
        }

        // Add clock button
        const addClockBtn = document.getElementById('addClockBtn');
        if (addClockBtn) {
            addClockBtn.addEventListener('click', showAddClockModal);
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', showSettingsModal);
        }

        // Modal close buttons
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', hideAddClockModal);
        }

        // Settings modal close
        const settingsModalClose = document.getElementById('closeSettingsModal');
        if (settingsModalClose) {
            settingsModalClose.addEventListener('click', hideSettingsModal);
        }

        // Modal overlay click to close
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    hideAddClockModal();
                }
            });
        }

        // Settings modal overlay click to close
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    hideSettingsModal();
                }
            });
        }

        // Form submission
        const addClockForm = document.getElementById('addClockForm');
        if (addClockForm) {
            addClockForm.addEventListener('submit', (e) => {
                e.preventDefault();
                addNewClock();
            });
        }

        // Settings form submission
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                saveSettings();
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', toggleDarkMode);
        }

        // View switcher buttons in settings
        const digitalViewSettings = document.getElementById('digitalViewSettings');
        const analogViewSettings = document.getElementById('analogViewSettings');
        
        if (digitalViewSettings) {
            digitalViewSettings.addEventListener('click', () => {
                this.switchToDigitalView();
            });
        }

        if (analogViewSettings) {
            analogViewSettings.addEventListener('click', () => {
                this.switchToAnalogView();
            });
        }

        // Window controls
        const minimizeBtn = document.getElementById('minimizeBtn');
        const closeBtn = document.getElementById('closeBtn');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', minimizeWindow);
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeWindow);
        }

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                showAddClockModal();
            }
            if (e.key === 'Escape') {
                hideAddClockModal();
                hideSettingsModal();
            }
        });

        // Initialize theme
        this.initializeTheme();
    }

    switchToDigitalView() {
        this.isAnalogView = false;
        const digitalGrid = document.getElementById('clockGrid');
        const analogGrid = document.getElementById('analogClockGrid');
        const digitalBtn = document.getElementById('digitalView');
        const analogBtn = document.getElementById('analogView');
        
        if (digitalGrid) digitalGrid.style.display = 'grid';
        if (analogGrid) analogGrid.style.display = 'none';
        if (digitalBtn) digitalBtn.classList.add('active');
        if (analogBtn) analogBtn.classList.remove('active');
        
        // Re-render all clocks in digital format
        this.renderAllDigitalClocks();
        
        // Save view mode
        this.saveViewMode('digital');
        
        // Update settings modal if open
        this.updateSettingsViewButtons();
    }

    switchToAnalogView() {
        this.isAnalogView = true;
        const digitalGrid = document.getElementById('clockGrid');
        const analogGrid = document.getElementById('analogClockGrid');
        const digitalBtn = document.getElementById('digitalView');
        const analogBtn = document.getElementById('analogView');
        
        if (digitalGrid) digitalGrid.style.display = 'none';
        if (analogGrid) analogGrid.style.display = 'grid';
        if (digitalBtn) digitalBtn.classList.remove('active');
        if (analogBtn) analogBtn.classList.add('active');
        
        // Render analog clocks for existing clocks
        this.renderAllAnalogClocks();
        
        // Save view mode
        this.saveViewMode('analog');
        
        // Update settings modal if open
        this.updateSettingsViewButtons();
    }

    renderAllDigitalClocks() {
        const digitalGrid = document.getElementById('clockGrid');
        if (!digitalGrid) return;
        
        digitalGrid.innerHTML = '';
        this.clocks.forEach(clock => {
            this.renderDigitalClock(clock);
        });
    }

    renderAllAnalogClocks() {
        const analogGrid = document.getElementById('analogClockGrid');
        if (!analogGrid) return;
        
        analogGrid.innerHTML = '';
        this.clocks.forEach(clock => {
            this.renderAnalogClock(clock);
        });
    }

    renderAnalogClock(clock) {
        const analogGrid = document.getElementById('analogClockGrid');
        if (!analogGrid) return;
        
        const clockCard = document.createElement('div');
        clockCard.className = 'analog-clock';
        clockCard.id = `analog-${clock.id}`;
        
        clockCard.innerHTML = `
            <div class="clock-header">
                <div>
                    <div class="clock-city">${clock.city}</div>
                    <div class="clock-timezone">${this.getTimezoneAbbreviation(clock.timezone)}</div>
                </div>
            </div>
            <div class="analog-clock-face" id="analog-face-${clock.id}">
                <div class="hour-hand" id="hour-hand-${clock.id}"></div>
                <div class="minute-hand" id="minute-hand-${clock.id}"></div>
                <div class="second-hand" id="second-hand-${clock.id}"></div>
                <div class="center-dot"></div>
                <div class="hour-markers">
                    ${Array.from({length: 12}, (_, i) => `<div class="hour-marker" style="transform: rotate(${i * 30}deg)"></div>`).join('')}
                </div>
            </div>
            <div class="clock-actions">
                <button class="delete-clock" onclick="worldClock.removeClock('${clock.id}')" title="Remove Clock">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        
        analogGrid.appendChild(clockCard);
        this.updateAnalogClock(clock);
    }

    updateAnalogClock(clock) {
        try {
            const now = new Date();
            const timeInTimezone = new Date(now.toLocaleString("en-US", {timeZone: clock.timezone}));
            
            const hours = timeInTimezone.getHours() % 12;
            const minutes = timeInTimezone.getMinutes();
            const seconds = timeInTimezone.getSeconds();
            
            const hourAngle = (hours * 30) + (minutes * 0.5);
            const minuteAngle = minutes * 6;
            const secondAngle = seconds * 6;
            
            const hourHand = document.getElementById(`hour-hand-${clock.id}`);
            const minuteHand = document.getElementById(`minute-hand-${clock.id}`);
            const secondHand = document.getElementById(`second-hand-${clock.id}`);
            
            if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
            if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
            if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`;
            
        } catch (error) {
            console.error('Error updating analog clock:', error);
        }
    }

    updateSettingsViewButtons() {
        const digitalViewSettings = document.getElementById('digitalViewSettings');
        const analogViewSettings = document.getElementById('analogViewSettings');
        
        if (digitalViewSettings && analogViewSettings) {
            if (this.isAnalogView) {
                analogViewSettings.classList.add('active');
                digitalViewSettings.classList.remove('active');
            } else {
                digitalViewSettings.classList.add('active');
                analogViewSettings.classList.remove('active');
            }
        }
    }

    initializeTheme() {
        // Load saved dark mode preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                darkModeToggle.checked = true;
            }
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Modal Functions
function showAddClockModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.add('show');
        const cityInput = document.getElementById('cityName');
        if (cityInput) {
            cityInput.focus();
        }
    }
}

function hideAddClockModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.remove('show');
        // Clear form
        const form = document.getElementById('addClockForm');
        if (form) {
            form.reset();
        }
    }
}

function addNewClock() {
    const cityName = document.getElementById('cityName').value.trim();
    const timezone = document.getElementById('timezone').value;
    
    if (!cityName || !timezone) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check if timezone already exists
    const existingClock = worldClock.clocks.find(clock => clock.timezone === timezone);
    if (existingClock) {
        showNotification('This timezone is already added', 'warning');
        return;
    }
    
    worldClock.addClock(cityName, timezone);
    hideAddClockModal();
    showNotification(`Added ${cityName} clock successfully!`, 'success');
}

// Window Controls
function minimizeWindow() {
    if (window.electronAPI && window.electronAPI.minimizeWindow) {
        window.electronAPI.minimizeWindow();
    } else {
        console.log('Minimize function not available in web version');
    }
}

function closeWindow() {
    if (window.electronAPI && window.electronAPI.closeWindow) {
        window.electronAPI.closeWindow();
    } else {
        window.close();
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${getNotificationIcon(type)}
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
    };
    return icons[type] || icons.info;
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        border-left: 4px solid var(--primary-500);
        animation: slideInRight 0.3s ease-out;
    }
    
    .notification-success {
        border-left-color: var(--success-500);
    }
    
    .notification-error {
        border-left-color: var(--error-500);
    }
    
    .notification-warning {
        border-left-color: var(--warning-500);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
    }
    
    .notification-icon {
        flex-shrink: 0;
        color: var(--primary-500);
    }
    
    .notification-success .notification-icon {
        color: var(--success-500);
    }
    
    .notification-error .notification-icon {
        color: var(--error-500);
    }
    
    .notification-warning .notification-icon {
        color: var(--warning-500);
    }
    
    .notification-message {
        flex: 1;
        font-size: 14px;
        font-weight: 500;
        color: var(--gray-800);
    }
    
    .notification-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: var(--gray-400);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .notification-close:hover {
        background: var(--gray-100);
        color: var(--gray-600);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Settings Modal Functions
 function showSettingsModal() {
     const modal = document.getElementById('settingsModal');
     if (modal) {
         modal.style.display = 'flex';
         // Load current settings
         loadCurrentSettings();
     }
 }
 
 function hideSettingsModal() {
     const modal = document.getElementById('settingsModal');
     if (modal) {
         modal.style.display = 'none';
     }
 }

function loadCurrentSettings() {
    // Load dark mode setting
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = document.body.classList.contains('dark-mode');
    }

    // Load view mode setting
    const digitalViewSettings = document.getElementById('digitalViewSettings');
    const analogViewSettings = document.getElementById('analogViewSettings');
    
    if (digitalViewSettings && analogViewSettings) {
        if (worldClock.isAnalogView) {
            analogViewSettings.classList.add('active');
            digitalViewSettings.classList.remove('active');
        } else {
            digitalViewSettings.classList.add('active');
            analogViewSettings.classList.remove('active');
        }
    }
}

function saveSettings() {
    showNotification('Settings saved successfully!', 'success');
    hideSettingsModal();
}

function toggleDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle && darkModeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// Global instance
let worldClock;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    worldClock = new WorldClockGadget();
    
    // Add some visual feedback for loading
    document.body.classList.add('loaded');
});

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (worldClock) {
        if (document.hidden) {
            // Pause updates when hidden to save resources
            if (worldClock.updateInterval) {
                clearInterval(worldClock.updateInterval);
                worldClock.updateInterval = null;
            }
        } else {
            // Resume updates when visible
            worldClock.startClockUpdates();
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (worldClock) {
        worldClock.destroy();
    }
});