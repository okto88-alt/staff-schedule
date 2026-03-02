/**
 * Staff Monthly Schedule Panel - Refactored
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
const modalFullImg = document.getElementById('modalFullCharacter');
const modalVideo = document.getElementById('modalCharacterVideo');

// FULL CHARACTER MAP (Images & Videos)
const characterAssets = {
    "ACIN": { img: "assets/characters/acin.png", vid: "assets/video/acin.webm" },
    "HERMAN": { img: "assets/characters/herman.png", vid: null },
    "DAVID": { img: "assets/characters/david.png", vid: null },
    "HARI": { img: "assets/characters/hari.png", vid: null },
    "BUDI": { img: "assets/characters/budi.png", vid: null },
    "DEA VALDA": { img: "assets/characters/dea.png", vid: null },
    "HADAD": { img: "assets/characters/hadad.png", vid: null },
    "HEWIN": { img: "assets/characters/hewin.png", vid: null },
    "LISTANI": { img: "assets/characters/listani.png", vid: null },
    "WILLY MEDAN": { img: "assets/characters/wilmed.png", vid: null },
    "WILLY PONTIANAK": { img: "assets/characters/wilpon.png", vid: null },
    "NIBRAS": { img: "assets/characters/nibras.png", vid: null },
    "RIAN": { img: "assets/characters/rian.png", vid: null },
    "WENDI": { img: "assets/characters/wendi.png", vid: null },
    "RIANTO": { img: "assets/characters/rianto.png", vid: null }
};

/**
 * Initialize
 */
document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
    
    modalClose.addEventListener('click', closeModal);
    scheduleModal.addEventListener('click', (e) => {
        if (e.target === scheduleModal) closeModal();
    });
});

/**
 * Fetch Data
 */
async function fetchSchedule() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Gagal mengambil data jadwal');
        
        scheduleData = await response.json();
        renderHeader(scheduleData.month, scheduleData.year);
        renderStaffGrid(scheduleData.staff);
    } catch (error) {
        console.error('Error:', error);
        staffGrid.innerHTML = `<p class="error">Gagal memuat data: ${error.message}</p>`;
    }
}

function renderHeader(month, year) {
    scheduleMeta.innerHTML = `<span class="month-badge">${month} ${year}</span>`;
}

/**
 * Render Staff Cards
 */
function renderStaffGrid(staffList) {
    staffGrid.innerHTML = staffList.map(staff => `
        <div class="staff-card" onclick="openModal('${staff.name}')">
            <div class="staff-avatar">
                <img src="${staff.avatar}" alt="${staff.name}">
            </div>
            <div class="staff-name">${staff.name}</div>
        </div>
    `).join('');
}

/**
 * Modal Logic
 */
function openModal(staffName) {
    const staff = scheduleData.staff.find(s => s.name === staffName);
    if (!staff) return;

    // Set Identity
    modalName.textContent = staff.name;
    modalPersonality.textContent = staff.personality;
    
    // Set Role Badge
    const roleCode = staff.roleCode || 'staff';
    modalRole.className = `role-badge role-${roleCode}`;
    modalRole.textContent = staff.role;

    // Set Avatar in Header
    modalAvatar.innerHTML = `<img src="${staff.avatar}" alt="${staff.name}">`;

    // Handle Character Panel (Image vs Video)
    const assets = characterAssets[staff.name.toUpperCase()];
    if (assets && assets.vid) {
        modalVideo.src = assets.vid;
        modalVideo.style.display = 'block';
        modalFullImg.style.display = 'none';
        modalVideo.play();
    } else {
        modalVideo.pause();
        modalVideo.style.display = 'none';
        modalFullImg.src = assets ? assets.img : staff.avatar;
        modalFullImg.style.display = 'block';
    }

    renderCalendar(staff.schedule);
    scheduleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    scheduleModal.classList.remove('active');
    document.body.style.overflow = '';
    modalVideo.pause();
}

/**
 * Render Calendar Grid
 */
function renderCalendar(schedule) {
    calendarGrid.innerHTML = schedule.map((shift, index) => {
        const shiftClass = getShiftClass(shift);
        return `
            <div class="calendar-day ${shiftClass}">
                <span class="day-number">${index + 1}</span>
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
        default: return '';
    }
}
