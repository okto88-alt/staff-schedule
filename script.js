/**
 * Staff Monthly Schedule Panel - CLEAN LINEUP VERSION
 */

let scheduleData = null;

/* ===============================
   DOM ELEMENTS
================================= */

const staffGrid = document.getElementById('staffGrid');
const scheduleMeta = document.getElementById('scheduleMeta');
const scheduleModal = document.getElementById('scheduleModal');
const modalClose = document.getElementById('modalClose');
const modalAvatar = document.getElementById('modalAvatar');
const modalName = document.getElementById('modalName');
const modalPersonality = document.getElementById('modalPersonality');
const calendarGrid = document.getElementById('calendarGrid');
const fullImg = document.getElementById("modalFullCharacter");
const video = document.getElementById("modalCharacterVideo");

/* ===============================
   CHARACTER MAP
================================= */

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

const characterVideoMap = {
    "HERMAN": "assets/characters/video/herman_idle.webm",
    "ACIN": "assets/characters/video/acin_idle.webm",
    "HARI": "assets/characters/video/hari_idle.webm",
    "HEWIN": "assets/characters/video/hewin_idle.webm"
};

/* ===============================
   INIT
================================= */

document.addEventListener('DOMContentLoaded', init);

async function init() {
    try {
        preloadCharacters();
        await loadScheduleData();
        renderStaffGrid();
        setupEventListeners();
    } catch (error) {
        console.error(error);
        staffGrid.innerHTML = `<p style="color:red">Failed to load schedule data</p>`;
    }
}

/* ===============================
   DATA
================================= */

async function loadScheduleData() {
    const response = await fetch('data/schedule.json');
    if (!response.ok) throw new Error("Failed to load schedule.json");
    scheduleData = await response.json();
    updateScheduleMeta();
}

function updateScheduleMeta() {
    if (!scheduleData?.meta) return;
    const { month, year } = scheduleData.meta;
    scheduleMeta.innerHTML = `<span class="month-badge">${month} ${year}</span>`;
}

/* ===============================
   PRELOAD
================================= */

function preloadCharacters() {
    Object.values(fullCharacterMap).forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

/* ===============================
   RENDER LINEUP
================================= */

function renderStaffGrid() {
    if (!scheduleData?.staff) return;

    const sortedStaff = [...scheduleData.staff]
        .sort((a, b) => a.name.localeCompare(b.name));

    staffGrid.innerHTML = sortedStaff.map(staff => `
        <div class="staff-card" data-staff-id="${staff.id}">
            <div class="staff-avatar">
                <img src="${fullCharacterMap[staff.name] || staff.avatar}" 
                     alt="${staff.name}" 
                     loading="lazy">
            </div>
            <div class="staff-name">${staff.name}</div>
        </div>
    `).join('');
}

/* ===============================
   EVENTS
================================= */

function setupEventListeners() {

    staffGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.staff-card');
        if (!card) return;

        animateCharacterFly(card);
        openScheduleModal(card.dataset.staffId);
    });

    modalClose.addEventListener('click', closeModal);

    scheduleModal.addEventListener('click', (e) => {
        if (e.target === scheduleModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

/* ===============================
   ANIMATE TO MODAL
================================= */

function animateCharacterFly(card) {

    const img = card.querySelector("img");
    const clone = img.cloneNode(true);

    const start = img.getBoundingClientRect();

    clone.style.position = "fixed";
    clone.style.left = start.left + "px";
    clone.style.top = start.top + "px";
    clone.style.width = start.width + "px";
    clone.style.height = start.height + "px";
    clone.style.zIndex = "2000";
    clone.style.transition = "all 0.45s ease";

    document.body.appendChild(clone);

    scheduleModal.classList.add('active');

    requestAnimationFrame(() => {
        const end = fullImg.getBoundingClientRect();
        clone.style.left = end.left + "px";
        clone.style.top = end.top + "px";
        clone.style.width = end.width + "px";
        clone.style.height = end.height + "px";
    });

    setTimeout(() => clone.remove(), 450);
}

/* ===============================
   OPEN MODAL
================================= */

function openScheduleModal(staffId) {

    const staff = scheduleData.staff.find(s => s.id === staffId);
    if (!staff) return;

    modalAvatar.innerHTML = `<img src="${staff.avatar}" alt="${staff.name}">`;
    modalName.textContent = staff.name;
    modalPersonality.textContent = staff.personality || "";

    fullImg.classList.remove("loaded");

    if (characterVideoMap[staff.name]) {

    video.pause();
    video.currentTime = 0;
    video.src = characterVideoMap[staff.name];

    video.style.display = "block";
    fullImg.style.display = "none";

    video.load();

    video.play().catch(() => {});

} else {

    video.pause();
    video.style.display = "none";

    fullImg.style.display = "block";
    fullImg.src = fullCharacterMap[staff.name] || staff.avatar;
}

    fullImg.onload = () => fullImg.classList.add("loaded");

    renderCalendar(staff.schedule);

    scheduleModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/* ===============================
   CLOSE MODAL
================================= */

function closeModal() {
    scheduleModal.classList.remove('active');
    document.body.style.overflow = '';
}

/* ===============================
   CALENDAR
================================= */

function renderCalendar(schedule) {
    if (!schedule || schedule.length !== 31) {
        calendarGrid.innerHTML = `<p style="color:red">Invalid schedule</p>`;
        return;
    }

    calendarGrid.innerHTML = schedule.map((shift, index) => {
        return `
            <div class="calendar-day ${getShiftClass(shift)}">
                <span class="day-number">${index + 1}</span>
                <span class="shift-code">${shift}</span>
            </div>
        `;
    }).join('');
}

function getShiftClass(shift) {
    if (shift === 'P') return 'shift-p';
    if (shift === 'M') return 'shift-m';
    return 'shift-off';
}
