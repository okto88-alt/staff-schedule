/**
 * Staff Monthly Schedule Panel
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

// FULL CHARACTER MAP
const fullCharacterMap = {
    "ACIN": "assets/characters/acin.png",
    "HERMAN": "assets/characters/herman.png",
    "DAVID": "assets/characters/david.png",
    "HARI": "assets/characters/hari.png",
    "BUDI": "assets/characters/budi.png",
    "DEA VALDA": "assets/characters/dea.png",
    "HADAD": "assets/characters/hadad.png",
    "HEWIN": "assets/characters/hewin.png",
    "LISTANI": "assets/characters/listani.png",
    "WILLY MEDAN": "assets/characters/wilmed.png",
    "WILLY PONTIANAK": "assets/characters/wilpon.png",
    "NIBRAS": "assets/characters/nibras.png",
    "RIAN": "assets/characters/rian.png",
    "WENDI": "assets/characters/wendi.png",
    "RIANTO": "assets/characters/rianto.png"
};

// 🚀 PRELOAD CHARACTER IMAGES
function preloadCharacters() {
    Object.values(fullCharacterMap).forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

/**
 * Initialize
 */
async function init() {
    try {
        preloadCharacters(); // 🔥 instant load
        await loadScheduleData();
        renderStaffGrid();
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError('Failed to load schedule data. Please refresh the page.');
    }
}

/**
 * Load schedule data
 */
async function loadScheduleData() {
    const response = await fetch('data/schedule.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    scheduleData = await response.json();
    updateScheduleMeta();
}

/**
 * Update month display
 */
function updateScheduleMeta() {
    if (scheduleData && scheduleData.meta) {
        const { month, year } = scheduleData.meta;
        scheduleMeta.innerHTML = `<span class="month-badge">${month} ${year}</span>`;
    }
}

/**
 * Role class
 */
function getRoleClass(roleCode) {
    switch (roleCode) {
        case 'L': return 'role-leader';
        case 'AL': return 'role-asst';
        default: return 'role-staff';
    }
}

/**
 * Role text
 */
function getRoleText(role, roleCode) {
    if (roleCode === 'L') return `(${roleCode}) ${role}`;
    if (roleCode === 'AL') return `(${roleCode}) ${role}`;
    return role;
}

/**
 * Render staff cards
 */
function renderStaffGrid() {
    if (!scheduleData || !scheduleData.staff) return;

    const rolePriority = { "L": 1, "AL": 2, "": 3 };

    const sortedStaff = [...scheduleData.staff].sort((a, b) => {
        const roleDiff = rolePriority[a.roleCode] - rolePriority[b.roleCode];
        if (roleDiff !== 0) return roleDiff;
        return a.name.localeCompare(b.name);
    });

    staffGrid.innerHTML = sortedStaff.map(staff => {
        const roleClass = getRoleClass(staff.roleCode);
        const roleText = getRoleText(staff.role, staff.roleCode);

        return `
            <div class="staff-card ${roleClass}" data-staff-id="${staff.id}">
                <div class="staff-card-content">
                    <div class="staff-avatar">
                        <img src="${fullCharacterMap[staff.name] || staff.avatar}" alt="${staff.name}" loading="lazy">
                    </div>
                    <div class="staff-name">${staff.name}</div>
                    <span class="staff-role ${roleClass}">${roleText}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Events
 */
function setupEventListeners() {

    staffGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.staff-card');
        if (card) openScheduleModal(card.dataset.staffId);
    });

    modalClose.addEventListener('click', closeModal);

    scheduleModal.addEventListener('click', (e) => {
        if (e.target === scheduleModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && scheduleModal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * OPEN MODAL
 */
function openScheduleModal(staffId) {
    const staff = scheduleData.staff.find(s => s.id === staffId);
    if (!staff) return;

    modalAvatar.innerHTML = `<img src="${staff.avatar}" alt="${staff.name}">`;
    modalName.textContent = staff.name;

    const fullImg = document.getElementById("modalFullCharacter");

    // Smooth loading
    fullImg.classList.remove("loaded");
    fullImg.src = fullCharacterMap[staff.name] || staff.avatar;
    fullImg.onload = () => {
        fullImg.classList.add("loaded");
    };

    const roleClass = getRoleClass(staff.roleCode);
    const roleText = getRoleText(staff.role, staff.roleCode);
    modalRole.className = `role-badge ${roleClass}`;
    modalRole.textContent = roleText;

    modalPersonality.textContent = staff.personality;
    renderCalendar(staff.schedule);

    scheduleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close modal
 */
function closeModal() {
    scheduleModal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Render calendar
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

function getShiftClass(shift) {
    switch (shift) {
        case 'P': return 'shift-p';
        case 'M': return 'shift-m';
        case 'OFF': return 'shift-off';
        default: return 'shift-off';
    }
}

function showError(message) {
    staffGrid.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
}

document.addEventListener('DOMContentLoaded', init);
