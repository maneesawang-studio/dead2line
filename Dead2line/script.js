// =========================================
// 1. ข้อมูลเริ่มต้น (Mock Data อ้างอิงตามภาพต้นฉบับ)
// =========================================
const REFERENCE_TODAY = new Date("2026-11-22T00:00:00");

const demoTasks = [
  {
    id: 1,
    title: "Send the Q4 sales summary slides to the executives.",
    desc: "Focus on a comparison chart of online channels and the plan for next year.",
    category: "Jobs",
    deadlineDate: "2026-11-25",
    deadlineTime: "10 a.m.",
    status: "in-progress",
    subtasks: [
      { id: 101, text: "Retrieve the latest sales data", done: true },
      { id: 102, text: "Format the summary slide", done: false }
    ]
  },
  {
    id: 2,
    title: "Weekly Report Summary",
    desc: "Weekly update on team task status and issues encountered",
    category: "Finance",
    deadlineDate: "2026-12-06", // 14 days left จากวันที่ 22 Nov 2026
    displayDayOverride: "25 Nov.", // แสดงผลตามภาพตัวอย่าง
    deadlineTime: "",
    status: "in-progress",
    subtasks: []
  },
  {
    id: 3,
    title: "Finalize UX/UI Wireframes for Mobile App",
    desc: "Prepare interactive prototype for client review meeting.",
    category: "Freelance",
    deadlineDate: "2026-11-30",
    deadlineTime: "4 p.m.",
    status: "in-progress",
    subtasks: []
  },
  {
    id: 4,
    title: "Database Architecture Essay",
    desc: "Submit PDF report on normalization and indexing strategies.",
    category: "Study",
    deadlineDate: "2026-12-04",
    deadlineTime: "11:59 p.m.",
    status: "in-progress",
    subtasks: []
  },
  {
    id: 5,
    title: "Q3 Tax Filing & Expense Audit",
    desc: "Completed and submitted all receipts to the accounting team.",
    category: "Finance",
    deadlineDate: "2026-11-18",
    deadlineTime: "5 p.m.",
    status: "finish",
    subtasks: []
  }
];
const supabaseConfig = window.DEADLINE_SUPABASE_CONFIG;
const hasSupabaseConfig = Boolean(supabaseConfig && supabaseConfig.url && supabaseConfig.publishableKey);
let tasks = hasSupabaseConfig ? [] : demoTasks;
let taskDataReady = !hasSupabaseConfig;

// =========================================
// 2. ตัวแปรสถานะของหน้าจอ (App State)
// =========================================
let currentTab = "in-progress"; // 'in-progress' หรือ 'finish'
let currentFilter = "All";       // 'All', 'urgent', 'Jobs', 'Study', 'Freelance', 'Finance'
let searchQuery = "";
let sortAsc = true;
const translations = {
  en: {
    pageTitle: "Manage deadlines",
    inProgress: "In progress",
    urgentFilter: "(≤ 3 days)",
    finish: "Finish",
    add: "Add",
    all: "All",
    jobs: "Jobs",
    study: "Study",
    freelance: "Freelance",
    finance: "Finance",
    deadline: "Deadline",
    searchPlaceholder: "Search for a schedule",
    sortDeadlines: "Sort deadlines",
    noResults: "No deadlines found matching your filter.",
    loadingTasks: "Loading your tasks...",
    loadTasksFailed: "Couldn't load your tasks:",
    saveTaskFailed: "Couldn't save the task:",
    updateTaskFailed: "Couldn't update the task:",
    updateSubtaskFailed: "Couldn't update the subtask:",
    deleteTaskFailed: "Couldn't delete the task:",
    daysLeft: days => `${days} days left`,
    dueToday: "Due today",
    daysOverdue: days => `${days} days overdue`,
    completed: "Completed",
    markFinished: "Mark as finished",
    moveToProgress: "Move back to In progress",
    editTask: "Edit task",
    subProgress: "Sub-progress",
    subProgressCount: (done, total) => `Sub-progress (${done}/${total})`,
    markStepComplete: step => `Mark step ${step} complete`,
    step: number => `Step ${number}`,
    addStep: "Add step",
    addSchedule: "Add schedule",
    editSchedule: "Edit schedule",
    title: "Title",
    category: "Category",
    timeOptional: "Time (optional)",
    details: "Details / Additional Notes",
    titlePlaceholder: "add title....",
    detailsPlaceholder: "Specify the scope of work, conditions, or necessary preparations...",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    loggedInAccount: "Account",
    previewAccount: "Preview mode (not authenticated)",
    openProfileMenu: "Open profile menu",
    switchTheme: "Switch theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    languageName: "English",
    settings: "Settings",
    signIn: "Sign in",
    about: "About Deadline",
    faq: "FAQ",
    privacy: "Privacy",
    signOut: "Sign out",
    confirmDelete: "Do you want to delete this deadline?"
  },
  th: {
    pageTitle: "จัดการกำหนดส่ง",
    inProgress: "กำลังทำ",
    urgentFilter: "(≤ 3 วัน)",
    finish: "เสร็จแล้ว",
    add: "เพิ่ม",
    all: "ทั้งหมด",
    jobs: "งาน",
    study: "การเรียน",
    freelance: "ฟรีแลนซ์",
    finance: "การเงิน",
    deadline: "กำหนดส่ง",
    searchPlaceholder: "ค้นหากำหนดการ",
    sortDeadlines: "เรียงลำดับกำหนดส่ง",
    noResults: "ไม่พบกำหนดการที่ตรงกับตัวกรอง",
    loadingTasks: "กำลังโหลดรายการงาน...",
    loadTasksFailed: "โหลดรายการงานไม่สำเร็จ:",
    saveTaskFailed: "บันทึกงานไม่สำเร็จ:",
    updateTaskFailed: "แก้ไขงานไม่สำเร็จ:",
    updateSubtaskFailed: "อัปเดตงานย่อยไม่สำเร็จ:",
    deleteTaskFailed: "ลบงานไม่สำเร็จ:",
    daysLeft: days => `เหลืออีก ${days} วัน`,
    dueToday: "ครบกำหนดวันนี้",
    daysOverdue: days => `เกินกำหนด ${days} วัน`,
    completed: "เสร็จแล้ว",
    markFinished: "ทำเครื่องหมายว่าเสร็จแล้ว",
    moveToProgress: "ย้ายกลับไปกำลังทำ",
    editTask: "แก้ไขงาน",
    subProgress: "ความคืบหน้าย่อย",
    subProgressCount: (done, total) => `ความคืบหน้าย่อย (${done}/${total})`,
    markStepComplete: step => `ทำเครื่องหมายขั้นตอนที่ ${step} ว่าเสร็จแล้ว`,
    step: number => `ขั้นตอนที่ ${number}`,
    addStep: "เพิ่มขั้นตอน",
    addSchedule: "เพิ่มกำหนดการ",
    editSchedule: "แก้ไขกำหนดการ",
    title: "หัวข้อ",
    category: "หมวดหมู่",
    timeOptional: "เวลา (ไม่บังคับ)",
    details: "รายละเอียด / บันทึกเพิ่มเติม",
    titlePlaceholder: "เพิ่มหัวข้อ....",
    detailsPlaceholder: "ระบุขอบเขตงาน เงื่อนไข หรือการเตรียมตัวที่จำเป็น...",
    delete: "ลบ",
    cancel: "ยกเลิก",
    save: "บันทึก",
    close: "ปิด",
    loggedInAccount: "บัญชี",
    previewAccount: "โหมดตัวอย่าง (ยังไม่ได้เข้าสู่ระบบ)",
    openProfileMenu: "เปิดเมนูโปรไฟล์",
    switchTheme: "เปลี่ยนธีม",
    light: "สว่าง",
    dark: "มืด",
    language: "ภาษา",
    languageName: "ไทย",
    settings: "การตั้งค่า",
    signIn: "เข้าสู่ระบบ",
    about: "เกี่ยวกับ Deadline",
    faq: "คำถามที่พบบ่อย",
    privacy: "ความเป็นส่วนตัว",
    signOut: "ออกจากระบบ",
    confirmDelete: "ต้องการลบกำหนดการนี้หรือไม่?"
  }
};
let currentLanguage = localStorage.getItem("deadline-language") === "th" ? "th" : "en";
let currentTheme = localStorage.getItem("deadline-theme") === "dark" ? "dark" : "light";

// =========================================
// 3. อ้างอิง Elements จาก HTML
// =========================================
const taskListContainer = document.getElementById("taskListContainer");
const countInProgressEl = document.getElementById("countInProgress");
const countUrgentEl = document.getElementById("countUrgent");
const countFinishEl = document.getElementById("countFinish");

const tabButtons = document.querySelectorAll(".tab-btn");
const filterPills = document.querySelectorAll(".pill");
const searchInput = document.getElementById("searchInput");
const btnSort = document.getElementById("btnSort");

// Modal Elements
const addModal = document.getElementById("addModal");
const btnOpenModal = document.getElementById("btnOpenModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCancelModal = document.getElementById("btnCancelModal");
const addTaskForm = document.getElementById("addTaskForm");
const btnAddStep = document.getElementById("btnAddStep");
const subtaskFormList = document.getElementById("subtaskFormList");
const addStepNumber = document.getElementById("addStepNumber");
const btnDeleteModal = document.getElementById("btnDeleteModal");
const btnProfile = document.getElementById("btnProfile");
const profileMenu = document.getElementById("profileMenu");
const navbar = document.querySelector(".navbar");
const themeToggle = document.getElementById("themeToggle");
const themeState = document.getElementById("themeState");
const languageToggle = document.getElementById("languageToggle");
const languageState = document.getElementById("languageState");
const taskOperationStatus = document.getElementById("taskOperationStatus");

let editingTaskId = null;
let modalScrollY = 0;
let modalBodyPaddingRight = "";

btnOpenModal.disabled = !taskDataReady;

function t(key, ...args) {
  const translation = translations[currentLanguage][key];
  return typeof translation === "function" ? translation(...args) : translation;
}

function applyTheme() {
  document.body.classList.toggle("dark-mode", currentTheme === "dark");
  themeState.textContent = t(currentTheme);
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = `Deadline. - ${t("pageTitle")}`;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  const dateLocale = currentLanguage === "th" ? "th-TH-u-ca-buddhist" : "en-US";
  document.getElementById("currentDate").textContent = new Intl.DateTimeFormat(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(REFERENCE_TODAY);

  searchInput.placeholder = t("searchPlaceholder");
  btnSort.title = t("sortDeadlines");
  btnSort.setAttribute("aria-label", t("sortDeadlines"));
  btnProfile.setAttribute("aria-label", t("openProfileMenu"));
  btnCloseModal.setAttribute("aria-label", t("close"));
  document.getElementById("taskTitleInput").placeholder = t("titlePlaceholder");
  document.getElementById("taskDescInput").placeholder = t("detailsPlaceholder");
  document.getElementById("accountLabel").textContent = t("loggedInAccount");
  document.getElementById("themeLabel").textContent = t("switchTheme");
  document.getElementById("languageLabel").textContent = t("language");
  languageState.textContent = t("languageName");
  document.getElementById("addStepLabel").textContent = t("addStep");
  document.getElementById("modalTitle").textContent = t(editingTaskId === null ? "addSchedule" : "editSchedule");
  themeState.textContent = t(currentTheme);
  renderTasks();
}

function closeProfileMenu() {
  if (!profileMenu) return;
  profileMenu.classList.remove("show");
  if (btnProfile) btnProfile.setAttribute("aria-expanded", "false");
}

function showTaskModal() {
  modalScrollY = window.scrollY;
  modalBodyPaddingRight = document.body.style.paddingRight;
  const isDesktop = window.matchMedia("(min-width: 769px)").matches;
  const scrollbarWidth = isDesktop ? 0 : window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  document.body.classList.add("modal-open");
  document.body.style.top = `-${modalScrollY}px`;
  addModal.classList.add("show");
}

function hideTaskModal() {
  addModal.classList.remove("show");
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  document.body.style.paddingRight = modalBodyPaddingRight;
  window.scrollTo(0, modalScrollY);
}

let previousScrollY = window.scrollY;
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  if (window.matchMedia("(max-width: 768px)").matches) {
    if (currentScrollY <= 24 || currentScrollY < previousScrollY - 2) {
      navbar.classList.remove("navbar-hidden");
    } else if (currentScrollY > previousScrollY + 2) {
      navbar.classList.add("navbar-hidden");
    }
  } else {
    navbar.classList.remove("navbar-hidden");
  }
  previousScrollY = currentScrollY;
}, { passive: true });

// =========================================
// 4. ฟังก์ชันคำนวณวันและจัดรูปแบบ (Helpers)
// =========================================
function getDaysLeft(dateString) {
  const target = new Date(dateString + "T00:00:00");
  const diffTime = target - REFERENCE_TODAY;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDateParts(dateString, overrideDay = null) {
  const dateObj = new Date(dateString + "T00:00:00");
  const englishMonths = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
  const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  let dayOfMonth = dateObj.getDate();
  let monthIndex = dateObj.getMonth();

  if (overrideDay && currentLanguage === "en") {
    return { day: overrideDay, year: dateObj.getFullYear() };
  }
  if (overrideDay) {
    const match = overrideDay.match(/^(\d{1,2})\s([A-Za-z]{3}\.?)$/);
    if (match) {
      dayOfMonth = Number(match[1]);
      monthIndex = englishMonths.findIndex(month => month.startsWith(match[2].replace(".", "")));
      if (monthIndex < 0) monthIndex = dateObj.getMonth();
    }
  }

  const months = currentLanguage === "th" ? thaiMonths : englishMonths;
  const day = `${dayOfMonth} ${months[monthIndex]}`;
  const year = dateObj.getFullYear() + (currentLanguage === "th" ? 543 : 0);
  return { day, year };
}

function formatDeadlineTime(time) {
  if (currentLanguage !== "th") return time;
  const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s([ap])\.m\.$/i);
  if (!match) return time;

  let hour = Number(match[1]);
  if (hour < 1 || hour > 12) return time;
  if (match[3].toLowerCase() === "p" && hour < 12) hour += 12;
  if (match[3].toLowerCase() === "a" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}${match[2] ? `:${match[2]}` : ""} น.`;
}

function getCategoryLabel(category) {
  const categoryKeys = {
    Jobs: "jobs",
    Study: "study",
    Freelance: "freelance",
    Finance: "finance"
  };
  return categoryKeys[category] ? t(categoryKeys[category]) : category;
}

function escapeHtml(value) {
  const escapeCharacters = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  };
  return String(value).replace(/[&<>"']/g, character => escapeCharacters[character]);
}

function findTaskById(taskId) {
  return tasks.find(task => String(task.id) === String(taskId));
}

function isDatabaseMode() {
  return Boolean(window.deadlineSupabase && window.deadlineUser && window.deadlineUser.id);
}

function showTaskError(translationKey, error) {
  if (!taskOperationStatus) return;
  const detail = error && error.message ? ` ${error.message}` : "";
  taskOperationStatus.textContent = `${t(translationKey)}${detail}`;
  taskOperationStatus.hidden = false;
}

function clearTaskError() {
  if (!taskOperationStatus) return;
  taskOperationStatus.textContent = "";
  taskOperationStatus.hidden = true;
}

function taskFromDatabase(row) {
  if (!Array.isArray(row.subtasks)) {
    throw new Error("Task data has an invalid subtasks value.");
  }
  return {
    id: row.id,
    title: row.title,
    desc: row.description,
    category: row.category,
    deadlineDate: row.deadline_date,
    deadlineTime: row.deadline_time,
    status: row.status,
    subtasks: row.subtasks
  };
}

function taskToDatabase(task, userId) {
  return {
    user_id: userId,
    title: task.title,
    description: task.desc,
    category: task.category,
    deadline_date: task.deadlineDate,
    deadline_time: task.deadlineTime,
    status: task.status,
    subtasks: task.subtasks
  };
}

window.loadDeadlineTasks = async function(client, user) {
  try {
    const { data, error } = await client
      .from("tasks")
      .select("id, title, description, category, deadline_date, deadline_time, status, subtasks")
      .eq("user_id", user.id)
      .order("deadline_date", { ascending: true });

    if (error) throw error;
    if (!Array.isArray(data)) throw new Error("Supabase returned an invalid task list.");

    tasks = data.map(taskFromDatabase);
    clearTaskError();
  } catch (error) {
    console.error("Could not load tasks from Supabase:", error);
    tasks = [];
    showTaskError("loadTasksFailed", error);
  } finally {
    taskDataReady = true;
    btnOpenModal.disabled = false;
    renderTasks();
  }
};

// =========================================
// 5. อัปเดตตัวเลขสรุปด้านบน (Summary Stats)
// =========================================
function updateStats() {
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const finishTasks = tasks.filter(t => t.status === "finish");
  const urgentTasks = inProgressTasks.filter(t => {
    const days = getDaysLeft(t.deadlineDate);
    return days <= 3;
  });

  countInProgressEl.textContent = inProgressTasks.length;
  countUrgentEl.textContent = urgentTasks.length;
  countFinishEl.textContent = finishTasks.length;
}

// =========================================
// 6. แสดงผลรายการงาน (Render Tasks)
// =========================================
function renderTasks() {
  updateStats();
  if (!taskDataReady) {
    taskListContainer.innerHTML = `<div class="empty-state">${t("loadingTasks")}</div>`;
    return;
  }

  // 1) กรองตาม Tab (In progress / Finish)
  let filtered = tasks.filter(task => task.status === currentTab);

  // 2) กรองตาม Pill (All / <= 3 days / หมวดหมู่)
  if (currentFilter === "urgent") {
    filtered = filtered.filter(task => getDaysLeft(task.deadlineDate) <= 3);
  } else if (currentFilter !== "All") {
    filtered = filtered.filter(task => task.category === currentFilter);
  }

  // 3) กรองตามคำค้นหา
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(q) || 
      task.desc.toLowerCase().includes(q)
    );
  }

  // 4) เรียงลำดับตามวันที่
  filtered.sort((a, b) => {
    const dateA = new Date(a.deadlineDate);
    const dateB = new Date(b.deadlineDate);
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  // 5) สร้าง HTML ของแต่ละการ์ด
  if (filtered.length === 0) {
    taskListContainer.innerHTML = `<div class="empty-state">${t("noResults")}</div>`;
    return;
  }

  taskListContainer.innerHTML = filtered.map(task => {
    const daysLeft = getDaysLeft(task.deadlineDate);
    const isUrgent = daysLeft <= 3 && task.status === "in-progress";
    const { day, year } = formatDateParts(task.deadlineDate, task.displayDayOverride);

    // ข้อความบน Badge แจ้งเตือนวัน
    let badgeText = t("daysLeft", daysLeft);
    if (daysLeft === 0) badgeText = t("dueToday");
    else if (daysLeft < 0) badgeText = t("daysOverdue", Math.abs(daysLeft));
    if (task.status === "finish") badgeText = t("completed");

    // คำนวณส่วน Sub-progress (ถ้ามี subtasks)
    let subProgressHTML = "";
    if (task.subtasks && task.subtasks.length > 0) {
      const doneCount = task.subtasks.filter(s => s.done).length;
      const totalCount = task.subtasks.length;
      const percent = Math.round((doneCount / totalCount) * 100);

      const subtasksListItems = task.subtasks.map(sub => `
        <li>
          <label class="custom-checkbox ${sub.done ? "done" : ""}">
            <input type="checkbox" data-action="toggle-subtask" data-task-id="${escapeHtml(task.id)}" data-subtask-id="${escapeHtml(sub.id)}" ${sub.done ? "checked" : ""}>
            <span class="checkmark"></span>
            ${escapeHtml(sub.text)}
          </label>
        </li>
      `).join("");

      subProgressHTML = `
        <div class="sub-progress-section">
          <div class="progress-header">
            <span>${t("subProgressCount", doneCount, totalCount)}</span>
            <span class="progress-percent">${percent}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
          <ul class="subtask-list">
            ${subtasksListItems}
          </ul>
        </div>
      `;
    }

    return `
      <div class="task-card">
        <div class="task-date-col">
          <span class="deadline-label">${t("deadline")}</span>
          <strong class="deadline-day ${isUrgent ? "urgent" : ""}">${escapeHtml(day)}</strong>
          <span class="deadline-year">${escapeHtml(year)}</span>
          ${task.deadlineTime ? `<span class="deadline-time">${escapeHtml(formatDeadlineTime(task.deadlineTime))}</span>` : ""}
        </div>

        <div class="task-content-col">
          <div class="task-badges">
            <div class="task-badge-group">
              <span class="badge ${isUrgent ? "urgent" : "normal"}">${escapeHtml(badgeText)}</span>
              <span class="badge category">${escapeHtml(getCategoryLabel(task.category))}</span>
            </div>
            <div class="task-actions-col">
              <button class="btn-check ${task.status === "finish" ? "completed" : ""}"
                      data-action="toggle-status" data-task-id="${escapeHtml(task.id)}"
                      title="${escapeHtml(task.status === "in-progress" ? t("markFinished") : t("moveToProgress"))}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <button class="btn-more" data-action="edit-task" data-task-id="${escapeHtml(task.id)}" title="${escapeHtml(t("editTask"))}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          <h2 class="task-title">${escapeHtml(task.title)}</h2>
          <p class="task-desc">${escapeHtml(task.desc)}</p>
          ${subProgressHTML}
        </div>
      </div>
    `;
  }).join("");
}

// =========================================
// 7. ฟังก์ชันโต้ตอบกับรายการงาน (Actions)
// =========================================
window.toggleTaskStatus = async function(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  const status = task.status === "in-progress" ? "finish" : "in-progress";
  if (isDatabaseMode()) {
    try {
      const { error } = await window.deadlineSupabase
        .from("tasks")
        .update({ status })
        .eq("id", task.id)
        .eq("user_id", window.deadlineUser.id)
        .select("id")
        .single();
      if (error) throw error;
    } catch (error) {
      console.error("Could not update task status:", error);
      showTaskError("updateTaskFailed", error);
      return;
    }
  }

  task.status = status;
  clearTaskError();
  renderTasks();
};

window.toggleSubtask = async function(taskId, subtaskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  const subtask = task.subtasks.find(item => String(item.id) === String(subtaskId));
  if (!subtask) return;

  const subtasks = task.subtasks.map(item => (
    String(item.id) === String(subtaskId) ? { ...item, done: !item.done } : item
  ));
  if (isDatabaseMode()) {
    try {
      const { error } = await window.deadlineSupabase
        .from("tasks")
        .update({ subtasks })
        .eq("id", task.id)
        .eq("user_id", window.deadlineUser.id)
        .select("id")
        .single();
      if (error) throw error;
    } catch (error) {
      console.error("Could not update subtask:", error);
      showTaskError("updateSubtaskFailed", error);
      renderTasks();
      return;
    }
  }

  task.subtasks = subtasks;
  clearTaskError();
  renderTasks();
};

window.deleteTask = async function(taskId) {
  if (!confirm(t("confirmDelete"))) return false;

  const task = findTaskById(taskId);
  if (!task) return false;

  if (isDatabaseMode()) {
    try {
      const { error } = await window.deadlineSupabase
        .from("tasks")
        .delete()
        .eq("id", task.id)
        .eq("user_id", window.deadlineUser.id)
        .select("id")
        .single();
      if (error) throw error;
    } catch (error) {
      console.error("Could not delete task:", error);
      showTaskError("deleteTaskFailed", error);
      return false;
    }
  }

  tasks = tasks.filter(item => String(item.id) !== String(task.id));
  clearTaskError();
  renderTasks();
  return true;
};

window.openEditModal = function(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  closeProfileMenu();
  editingTaskId = taskId;
  document.getElementById("modalTitle").textContent = t("editSchedule");
  document.querySelector(".btn-submit").textContent = t("save");
  btnDeleteModal.hidden = false;

  document.getElementById("taskTitleInput").value = task.title;
  document.getElementById("taskDescInput").value = task.desc || "";
  document.getElementById("taskCategoryInput").value = task.category;
  document.getElementById("taskDateInput").value = task.deadlineDate;
  document.getElementById("taskTimeInput").value = task.deadlineTime ? convertDisplayTimeToInput(task.deadlineTime) : "";

  subtaskFormList.innerHTML = "";
  (task.subtasks || []).forEach((subtask, index) => {
    subtaskFormList.appendChild(createSubtaskFormRow(subtask.text, index + 1, subtask.done));
  });
  addStepNumber.textContent = String((task.subtasks || []).length + 1);
  showTaskModal();
};

taskListContainer.addEventListener("click", event => {
  const target = event.target instanceof Element ? event.target.closest("[data-action]") : null;
  if (!target || !taskListContainer.contains(target)) return;

  const taskId = target.dataset.taskId;
  if (target.dataset.action === "toggle-status") {
    window.toggleTaskStatus(taskId);
  } else if (target.dataset.action === "edit-task") {
    window.openEditModal(taskId);
  }
});

taskListContainer.addEventListener("change", event => {
  const target = event.target instanceof Element ? event.target.closest('[data-action="toggle-subtask"]') : null;
  if (!target || !taskListContainer.contains(target)) return;
  window.toggleSubtask(target.dataset.taskId, target.dataset.subtaskId);
});

function convertDisplayTimeToInput(displayTime) {
  const match = displayTime.match(/^(\d{1,2}):(\d{2})\s(a\.m\.|p\.m\.)$/);
  if (!match) return "";
  let hours = Number(match[1]);
  const minutes = match[2];
  if (match[3] === "p.m." && hours !== 12) hours += 12;
  if (match[3] === "a.m." && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function createSubtaskFormRow(text = "", stepNumber = 1, done = false) {
  const row = document.createElement("div");
  row.className = "subtask-form-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "subtask-form-check";
  checkbox.checked = done;
  checkbox.setAttribute("aria-label", t("markStepComplete", stepNumber));

  const input = document.createElement("input");
  input.type = "text";
  input.className = "subtask-form-input";
  input.placeholder = t("step", stepNumber);
  input.value = text;

  row.appendChild(checkbox);
  row.appendChild(input);
  return row;
}

// =========================================
// 8. Event Listeners (ปุ่มควบคุมและ Modal)
// =========================================
// สลับแท็บ In progress / Finish
tabButtons.forEach(btn => {
btn.addEventListener("click", () => {
tabButtons.forEach(b => b.classList.remove("active"));
btn.classList.add("active");
currentTab = btn.dataset.tab;
renderTasks();
});
});
// เลือกตัวกรองหมวดหมู่
filterPills.forEach(pill => {
pill.addEventListener("click", () => {
filterPills.forEach(p => p.classList.remove("active"));
pill.classList.add("active");
currentFilter = pill.dataset.filter;
renderTasks();
});
});
// ค้นหาข้อความ
searchInput.addEventListener("input", (e) => {
searchQuery = e.target.value;
renderTasks();
});
// เรียงลำดับวันที่
btnSort.addEventListener("click", () => {
sortAsc = !sortAsc;
renderTasks();
});
themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("deadline-theme", currentTheme);
  applyTheme();
});
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "th" : "en";
  localStorage.setItem("deadline-language", currentLanguage);
  applyLanguage();
});
// เปิด-ปิด Modal เพิ่มงาน
btnOpenModal.addEventListener("click", () => {
  editingTaskId = null;
  closeProfileMenu();
  document.getElementById("modalTitle").textContent = t("addSchedule");
  document.querySelector(".btn-submit").textContent = t("save");
  btnDeleteModal.hidden = true;
  addTaskForm.reset();
  subtaskFormList.innerHTML = "";
  addStepNumber.textContent = "1";
  showTaskModal();
});
btnCloseModal.addEventListener("click", hideTaskModal);
btnCancelModal.addEventListener("click", () => {
  closeProfileMenu();
  hideTaskModal();
});
addModal.addEventListener("click", (e) => {
if (e.target === addModal) hideTaskModal();
});
btnDeleteModal.addEventListener("click", async () => {
  if (editingTaskId !== null) {
    const deleted = await window.deleteTask(editingTaskId);
    if (deleted) {
      editingTaskId = null;
      hideTaskModal();
    }
  }
});
btnProfile.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = profileMenu.classList.toggle("show");
  btnProfile.setAttribute("aria-expanded", String(isOpen));
});
document.addEventListener("click", (e) => {
  if (!profileMenu.contains(e.target) && !btnProfile.contains(e.target)) {
    profileMenu.classList.remove("show");
    btnProfile.setAttribute("aria-expanded", "false");
  }
});
// เพิ่มรายการ Sub-progress ในฟอร์ม
btnAddStep.addEventListener("click", () => {
const stepNumber = subtaskFormList.querySelectorAll(".subtask-form-row").length + 1;
subtaskFormList.appendChild(createSubtaskFormRow("", stepNumber, false));
addStepNumber.textContent = String(stepNumber + 1);
document.getElementById("addStepLabel").textContent = t("addStep");
subtaskFormList.lastElementChild.querySelector(".subtask-form-input").focus();
});
// บันทึกงานใหม่จากฟอร์ม
addTaskForm.addEventListener("submit", async (e) => {
e.preventDefault();
if (!taskDataReady) return;
const timeInput = document.getElementById("taskTimeInput").value;
let deadlineTime = "";
if (timeInput) {
  const [hours, minutes] = timeInput.split(":").map(Number);
  const suffix = hours >= 12 ? "p.m." : "a.m.";
  const displayHours = hours % 12 || 12;
  deadlineTime = `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
const subtasks = Array.from(subtaskFormList.querySelectorAll(".subtask-form-row"))
  .map(row => ({
    text: row.querySelector(".subtask-form-input").value.trim(),
    done: row.querySelector(".subtask-form-check").checked
  }))
  .filter(subtask => subtask.text !== "")
  .map((subtask, index) => ({ id: Date.now() + index, text: subtask.text, done: subtask.done }));
const taskData = {
title: document.getElementById("taskTitleInput").value.trim(),
desc: document.getElementById("taskDescInput").value.trim(),
category: document.getElementById("taskCategoryInput").value,
deadlineDate: document.getElementById("taskDateInput").value,
deadlineTime,
subtasks
};
const submitButton = addTaskForm.querySelector('button[type="submit"]');
submitButton.disabled = true;
try {
  if (isDatabaseMode()) {
    if (editingTaskId !== null) {
      const task = findTaskById(editingTaskId);
      if (!task) throw new Error("The task being edited could not be found.");

      const { data, error } = await window.deadlineSupabase
        .from("tasks")
        .update(taskToDatabase({ ...task, ...taskData }, window.deadlineUser.id))
        .eq("id", task.id)
        .eq("user_id", window.deadlineUser.id)
        .select("id, title, description, category, deadline_date, deadline_time, status, subtasks")
        .single();
      if (error) throw error;
      Object.assign(task, taskFromDatabase(data));
    } else {
      const newTask = { status: "in-progress", ...taskData };
      const { data, error } = await window.deadlineSupabase
        .from("tasks")
        .insert(taskToDatabase(newTask, window.deadlineUser.id))
        .select("id, title, description, category, deadline_date, deadline_time, status, subtasks")
        .single();
      if (error) throw error;
      tasks.unshift(taskFromDatabase(data));
    }
  } else if (editingTaskId !== null) {
    const task = findTaskById(editingTaskId);
    if (!task) throw new Error("The task being edited could not be found.");
    Object.assign(task, taskData);
  } else {
    tasks.unshift({
      id: Date.now(),
      status: "in-progress",
      ...taskData
    });
  }
} catch (error) {
  console.error("Could not save task:", error);
  showTaskError("saveTaskFailed", error);
  return;
} finally {
  submitButton.disabled = false;
}

clearTaskError();
addTaskForm.reset();
subtaskFormList.innerHTML = "";
addStepNumber.textContent = "1";
editingTaskId = null;
hideTaskModal();
// สลับกลับมาแท็บ In progress เพื่อให้เห็นงานที่เพิ่งเพิ่ม
currentTab = "in-progress";
tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === "in-progress"));
renderTasks();
});
// =========================================
// 9. เริ่มต้นทำงานครั้งแรก
// =========================================
applyTheme();
applyLanguage();