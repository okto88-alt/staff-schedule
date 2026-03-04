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
    "ACIN": "assets/characters/acin.webp",
    "HERMAN": "assets/characters/herman.webp",
    "DAVID": "assets/characters/david.webp",
    "HARI": "assets/characters/hari.webp",
    "BUDI": "assets/characters/budi.webp",
    "DEA VALDA": "assets/characters/dea.webp",
    "HADAD": "assets/characters/hadad.webp",
    "HEWIN": "assets/characters/hewin.webp",
    "LISTANI": "assets/characters/listani.webp",
    "WILLY MEDAN": "assets/characters/wilmed.webp",
    "WILLY PONTIANAK": "assets/characters/wilpon.webp",
    "NIBRAS": "assets/characters/nibras.webp",
    "RIAN": "assets/characters/rian.webp",
    "WENDI": "assets/characters/wendi.webp",
    "RIANTO": "assets/characters/rianto.webp"
};

const characterVideoMap = {
    "HERMAN": "assets/characters/video/herman_idle.webm",
    "BUDI": "assets/characters/video/budi_idle.webm",
    "HARI": "assets/characters/video/hari_idle.webm",
    "DEA VALDA": "assets/characters/video/dea_idle.webm",
    "ACIN": "assets/characters/video/acin_idle.webm",
    "DAVID": "assets/characters/video/david_idle.webm",
    "HADAD": "assets/characters/video/hadad_idle.webm",
    "LISTANI": "assets/characters/video/listani_idle.webm",
    "NIBRAS": "assets/characters/video/nibras_idle.webm",
    "WILLY PONTIANAK": "assets/characters/video/wilpon_idle.webm",
    "WILLY MEDAN": "assets/characters/video/wilmed_idle.webm",
    "WENDI": "assets/characters/video/wendi_idle.webm",
    "RIAN": "assets/characters/video/rian_idle.webm",
    "HEWIN": "assets/characters/video/hewin_idle.webm"
};

// 🚀 PRELOAD CHARACTER IMAGES
function preloadCharacters() {

    const images = Object.values(fullCharacterMap);

    const lazyImages = images.slice(6); // mulai dari karakter ke-7

    lazyImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

}
/**
 * Initialize
 */
async function init() {
    try {
        await preloadCharacters(); // 🔥 instant load
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
                        <img src="${fullCharacterMap[staff.name]}" alt="${staff.name}" loading="lazy" decoding="async">
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
    if (card){
        animateCharacterFly(card);
        openScheduleModal(card.dataset.staffId);
    }
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
function animateCharacterFly(card){

    const img = card.querySelector("img");
    const clone = img.cloneNode(true);

    const start = img.getBoundingClientRect();
    const target = document.getElementById("modalFullCharacter");

    clone.classList.add("fly-clone");
    clone.style.left = start.left+"px";
    clone.style.top = start.top+"px";
    clone.style.width = start.width+"px";
    clone.style.height = start.height+"px";

    document.body.appendChild(clone);

    scheduleModal.classList.add('active');

    requestAnimationFrame(()=>{

        const end = target.getBoundingClientRect();

        clone.style.left = end.left+"px";
        clone.style.top = end.top+"px";
        clone.style.width = end.width+"px";
        clone.style.height = end.height+"px";
    });

    setTimeout(()=>{
        clone.remove();
    },450);
}

function openScheduleModal(staffId) {
    const staff = scheduleData.staff.find(s => s.id === staffId);
    if (!staff) return;

    modalAvatar.innerHTML = `<img src="${staff.avatar}" alt="${staff.name}">`;
    modalName.textContent = staff.name;

    const fullImg = document.getElementById("modalFullCharacter");
    const video = document.getElementById("modalCharacterVideo");
    
fullImg.classList.remove("loaded");

if(characterVideoMap[staff.name]){
    video.src = characterVideoMap[staff.name];
    video.style.display = "block";
    fullImg.style.display = "none";
    video.load();
    video.play();
}else{
    video.style.display = "none";
    fullImg.style.display = "block";
    fullImg.src = fullCharacterMap[staff.name] || staff.avatar;
}

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
