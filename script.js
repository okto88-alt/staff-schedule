/**
 * Staff Monthly Schedule Panel
 * Interactive dashboard for viewing staff shift schedules
 */

// State
let scheduleData = null;

// DOM Elements
const staffGrid = document.getElementById('staffGrid');
const scheduleMeta = document.getElementById('scheduleMeta');
const scheduleModal = document.getElementById('scheduleModal');
const modalClose = document.getElementById('modalClose');
const modalAvatar = document.getElementById('modalAvatar');
const modalName = document.getElementById('modalName');
const modalRole = document.getElementById('modalRole');
const modalPersonality = document.getElementById('modalPersonality');
const calendarGrid = document.getElementById('calendarGrid');

/**
 * Initialize the application
 */
async function init() {
    try {
        await loadScheduleData();
        renderStaffGrid();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError('Failed to load schedule data. Please refresh the page.');
    }
}

/**
 * Load schedule data from JSON file
 */
async function loadScheduleData() {
    const response = await fetch('data/schedule.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    scheduleData = await response.json();
    updateScheduleMeta();
}

/**
 * Update the schedule month/year display
 */
function updateScheduleMeta() {
    if (scheduleData && scheduleData.meta) {
        const { month, year } = scheduleData.meta;
        scheduleMeta.innerHTML = `<span class="month-badge">${month} ${year}</span>`;
    }
}

/**
 * Get CSS class based on role
 */
function getRoleClass(roleCode) {
    switch (roleCode) {
        case 'L':
            return 'role-leader';
        case 'AL':
            return 'role-asst';
        default:
            return 'role-staff';
    }
}

/**
 * Get display text for role
 */
function getRoleText(role, roleCode) {
    if (roleCode === 'L') return `(${roleCode}) ${role}`;
    if (roleCode === 'AL') return `(${roleCode}) ${role}`;
    return role;
}

/**
 * Render the staff card grid
 */
function renderStaffGrid() {
    if (!scheduleData || !scheduleData.staff) return;

    // Priority Role Sorting
    const rolePriority = {
        "L": 1,
        "AL": 2,
        "": 3
    };

    const sortedStaff = [...scheduleData.staff].sort((a, b) => {
        const roleDiff = rolePriority[a.roleCode] - rolePriority[b.roleCode];
        if (roleDiff !== 0) return roleDiff;

        // Secondary sort by name
        return a.name.localeCompare(b.name);
    });

    staffGrid.innerHTML = sortedStaff.map(staff => {
        const roleClass = getRoleClass(staff.roleCode);
        const roleText = getRoleText(staff.role, staff.roleCode);

        return `
            <div class="staff-card ${roleClass}" data-staff-id="${staff.id}">
                <div class="staff-card-content">
                    <div class="staff-avatar">
                        <img src="${staff.avatar}" alt="${staff.name}" loading="lazy">
                    </div>
                    <div class="staff-name">${staff.name}</div>
                    <span class="staff-role ${roleClass}">${roleText}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Staff card clicks
    staffGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.staff-card');
        if (card) {
            const staffId = card.dataset.staffId;
            openScheduleModal(staffId);
        }
    });
    // Hover lift effect
staffGrid.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.staff-card');
    if (card) {
        card.style.transform = "translateY(-6px)";
    }
});

staffGrid.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.staff-card');
    if (card) {
        card.style.transform = "";
    }
});

    // Modal close
    modalClose.addEventListener('click', closeModal);

    // Click outside modal to close
    scheduleModal.addEventListener('click', (e) => {
        if (e.target === scheduleModal) {
            closeModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && scheduleModal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Open schedule modal for specific staff
 */
function openScheduleModal(staffId) {
    const staff = scheduleData.staff.find(s => s.id === staffId);
    if (!staff) return;

    // Update modal content
    modalAvatar.innerHTML = `<img src="${staff.avatar}" alt="${staff.name}">`;
    modalName.textContent = staff.name;

    // Update role badge
    const roleClass = getRoleClass(staff.roleCode);
    const roleText = getRoleText(staff.role, staff.roleCode);
    modalRole.className = `role-badge ${roleClass}`;
    modalRole.textContent = roleText;

    // Update personality
    modalPersonality.textContent = staff.personality;

    // Render calendar
    renderCalendar(staff.schedule);

    // Show modal
    scheduleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close schedule modal
 */
function closeModal() {
    scheduleModal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Render calendar grid
 */
function renderCalendar(schedule) {
    if (!schedule || schedule.length !== 31) {
        calendarGrid.innerHTML = '<p class="error">Invalid schedule data</p>';
        return;
    }

    calendarGrid.innerHTML = schedule.map((shift, index) => {
        const day = index + 1;
        const shiftClass = getShiftClass(shift);

        return `
            <div class="calendar-day ${shiftClass}">
                <span class="day-number">${day}</span>
                <span class="shift-code">${shift}</span>
            </div>
        `;
    }).join('');
}

/**
 * Get CSS class for shift type
 */
function getShiftClass(shift) {
    switch (shift) {
        case 'P':
            return 'shift-p';
        case 'M':
            return 'shift-m';
        case 'OFF':
            return 'shift-off';
        default:
            return 'shift-off';
    }
}

/**
 * Show error message
 */
function showError(message) {
    staffGrid.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
