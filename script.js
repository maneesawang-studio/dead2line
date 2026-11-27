// =========================================
// 1. ข้อมูลเริ่มต้น (Mock Data อ้างอิงตามภาพต้นฉบับ)
// =========================================
function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromToday(offset) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return localDateString(date);
}

const REFERENCE_TODAY = new Date(`${localDateString()}T00:00:00`);
const REFERENCE_DAY_ORDINAL = Date.UTC(
  REFERENCE_TODAY.getFullYear(),
  REFERENCE_TODAY.getMonth(),
  REFERENCE_TODAY.getDate()
) / 86400000;

const demoTasks = [
  {
    id: 1,
    title: "Send the Q4 sales summary slides to the executives.",
    desc: "Focus on a comparison chart of online channels and the plan for next year.",
    category: "Jobs",
    deadlineDate: dateFromToday(3),
    followUpDate: dateFromToday(5),
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
    deadlineDate: dateFromToday(14),
    displayDayOverride: null,
    deadlineTime: "",
    status: "in-progress",
    subtasks: []
  },
  {
    id: 3,
    title: "Finalize UX/UI Wireframes for Mobile App",
    desc: "Prepare interactive prototype for client review meeting.",
    category: "Freelance",
    deadlineDate: dateFromToday(8),
    deadlineTime: "4 p.m.",
    status: "in-progress",
    subtasks: []
  },
  {
    id: 4,
    title: "Database Architecture Essay",
    desc: "Submit PDF report on normalization and indexing strategies.",
    category: "Study",
    deadlineDate: dateFromToday(12),
    deadlineTime: "11:59 p.m.",
    status: "in-progress",
    subtasks: []
  },
  {
    id: 5,
    title: "Q3 Tax Filing & Expense Audit",
    desc: "Completed and submitted all receipts to the accounting team.",
    category: "Finance",
    deadlineDate: dateFromToday(-4),
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
    homeNav: "Home",
    tasksNav: "Tasks",
    aboutNav: "About",
    faqNav: "FAQ",
    contactNav: "Contact",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    pageTitle: "Manage tasks and deadlines",
    inProgress: "In progress",
    urgentFilter: "(≤ 3 days)",
    finish: "Finished",
    add: "Add",
    all: "All",
    jobs: "Jobs",
    study: "Study",
    freelance: "Freelance",
    finance: "Finance",
    deadline: "Deadline",
    deadlineHeading: "Deadline’s",
    followUpDate: "Follow-up date (optional)",
    followUp: date => `Follow-up on ${date}`,
    searchPlaceholder: "Search tasks",
    sortDeadlines: "Sort tasks by deadline",
    noResults: "No tasks match your search or filters.",
    overdueFilter: "Overdue",
    todayFilter: "Today",
    sortAscending: "Sort by earliest deadline",
    sortDescending: "Sort by latest deadline",
    confirmDiscardTitle: "Discard unsaved changes?",
    confirmDiscardMessage: "Your changes will be lost.",
    discard: "Discard",
    titleRequired: "Please enter a task title.",
    loadingTasks: "Loading your tasks...",
    loadTasksFailed: "Couldn't load your tasks:",
    saveTaskFailed: "Couldn't save the task:",
    updateTaskFailed: "Couldn't update the task:",
    updateSubtaskFailed: "Couldn't update the subtask:",
    deleteTaskFailed: "Couldn't delete the task:",
    daysLeft: days => days === 1 ? "1 day left" : `${days} days left`,
    dueToday: "Due today",
    daysOverdue: days => days === 1 ? "1 day overdue" : `${days} days overdue`,
    completed: "Finished",
    markFinished: "Mark as finished",
    moveToProgress: "Move back to In progress",
    taskActions: "Task actions",
    editTask: "Edit task",
    subProgress: "Subtasks",
    subProgressCount: (done, total) => `Subtasks completed: ${done}/${total}`,
    markStepComplete: step => `Mark subtask ${step} as complete`,
    step: number => `Subtask ${number}`,
    addStep: "Add subtask",
    addSchedule: "Add task",
    editSchedule: "Edit task",
    title: "Task title",
    category: "Category",
    timeOptional: "Time (optional)",
    details: "Additional details (optional)",
    titlePlaceholder: "Enter a task title",
    detailsPlaceholder: "Add any details or notes...",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    loggedInAccount: "Account",
    previewAccount: "Not signed in",
    openProfileMenu: "Open settings menu",
    switchTheme: "Switch theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Language",
    languageName: "English",
    settings: "Settings and privacy",
    installApp: "Install app",
    signIn: "Sign in",
    about: "About Deadline",
    faq: "FAQ",
    privacy: "Privacy",
    signOut: "Sign out",
    confirmDeleteTitle: "Delete this task?",
    confirmDeleteMessage: "This action can't be undone.",
    confirmFinishTitle: "Mark this task as finished?",
    confirmFinishMessage: "It will move to Finished and stay there until you delete it.",
    confirmRestoreTitle: "Move this task back to In progress?",
    confirmRestoreMessage: "It will move back to In progress.",
    confirm: "Confirm"
  },
  th: {
    homeNav: "หน้าหลัก",
    tasksNav: "รายการงาน",
    aboutNav: "เกี่ยวกับ",
    faqNav: "คำถามที่พบบ่อย",
    contactNav: "ติดต่อ",
    openNavigation: "เปิดเมนูนำทาง",
    closeNavigation: "ปิดเมนูนำทาง",
    pageTitle: "จัดการงานและกำหนดส่ง",
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
    deadlineHeading: "กำหนดส่ง",
    followUpDate: "วันที่ติดตามผล (ไม่บังคับ)",
    followUp: date => `ติดตามผลวันที่ ${date}`,
    searchPlaceholder: "ค้นหางาน",
    sortDeadlines: "เรียงงานตามกำหนดส่ง",
    noResults: "ไม่พบงานที่ตรงกับคำค้นหาหรือตัวกรอง",
    overdueFilter: "เกินกำหนด",
    todayFilter: "วันนี้",
    sortAscending: "เรียงกำหนดส่งเร็วที่สุด",
    sortDescending: "เรียงกำหนดส่งช้าที่สุด",
    confirmDiscardTitle: "ต้องการทิ้งการเปลี่ยนแปลงที่ยังไม่ได้บันทึกหรือไม่?",
    confirmDiscardMessage: "การเปลี่ยนแปลงที่ทำไว้จะหายไป",
    discard: "ทิ้งการเปลี่ยนแปลง",
    titleRequired: "กรุณากรอกชื่องาน",
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
    taskActions: "ตัวเลือกงาน",
    editTask: "แก้ไขงาน",
    subProgress: "งานย่อย",
    subProgressCount: (done, total) => `งานย่อยที่เสร็จแล้ว ${done}/${total}`,
    markStepComplete: step => `ทำเครื่องหมายงานย่อยข้อที่ ${step} ว่าเสร็จแล้ว`,
    step: number => `งานย่อยข้อที่ ${number}`,
    addStep: "เพิ่มงานย่อย",
    addSchedule: "เพิ่มงาน",
    editSchedule: "แก้ไขงาน",
    title: "ชื่องาน",
    category: "หมวดหมู่",
    timeOptional: "เวลา (ไม่บังคับ)",
    details: "รายละเอียดเพิ่มเติม (ไม่บังคับ)",
    titlePlaceholder: "กรอกชื่องาน",
    detailsPlaceholder: "เพิ่มรายละเอียดหรือบันทึกเพิ่มเติม",
    delete: "ลบ",
    cancel: "ยกเลิก",
    save: "บันทึก",
    close: "ปิด",
    loggedInAccount: "บัญชี",
    previewAccount: "ยังไม่ได้เข้าสู่ระบบ",
    openProfileMenu: "เปิดเมนูตั้งค่า",
    switchTheme: "เปลี่ยนธีม",
    light: "สว่าง",
    dark: "มืด",
    system: "ตามเครื่อง",
    language: "ภาษา",
    languageName: "ไทย",
    settings: "การตั้งค่าและความเป็นส่วนตัว",
    installApp: "ติดตั้งเป็นแอป",
    signIn: "เข้าสู่ระบบ",
    about: "เกี่ยวกับ Deadline",
    faq: "คำถามที่พบบ่อย",
    privacy: "ความเป็นส่วนตัว",
    signOut: "ออกจากระบบ",
    confirmDeleteTitle: "ต้องการลบงานนี้หรือไม่?",
    confirmDeleteMessage: "งานนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้",
    confirmFinishTitle: "ยืนยันว่าทำงานเสร็จแล้วใช่ไหม?",
    confirmFinishMessage: "งานจะย้ายไปที่เสร็จแล้ว และจะคงอยู่จนกว่าคุณจะลบเอง",
    confirmRestoreTitle: "ย้ายงานนี้กลับไปที่กำลังทำหรือไม่?",
    confirmRestoreMessage: "งานจะถูกย้ายกลับไปที่กำลังทำ",
    confirm: "ยืนยัน"
  }
};
let currentLanguage = localStorage.getItem("deadline-language") === "th" ? "th" : "en";
let currentThemeMode = window.deadlineGetThemeMode();
let currentTheme = window.deadlineGetThemePreference();

// =========================================
// 3. อ้างอิง Elements จาก HTML
// =========================================
const taskListContainer = document.getElementById("taskListContainer");
const countInProgressEl = document.getElementById("countInProgress");
const countUrgentEl = document.getElementById("countUrgent");
const countFinishEl = document.getElementById("countFinish");

const tabButtons = document.querySelectorAll(".task-controls__tab");
const filterPills = document.querySelectorAll(".task-filters__pill");
const searchInput = document.getElementById("searchInput");
const btnSort = document.getElementById("btnSort");

// Modal Elements
const addModal = document.getElementById("addModal");
const btnOpenModal = document.getElementById("btnOpenModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCancelModal = document.getElementById("btnCancelModal");
const actionConfirmModal = document.getElementById("actionConfirmModal");
const addTaskForm = document.getElementById("addTaskForm");
const btnAddStep = document.getElementById("btnAddStep");
const subtaskFormList = document.getElementById("subtaskFormList");
const addStepNumber = document.getElementById("addStepNumber");
const btnDeleteModal = document.getElementById("btnDeleteModal");
const btnProfile = document.getElementById("btnProfile");
const profileMenu = document.getElementById("profileMenu");
const themeToggle = document.getElementById("themeToggle");
const themeState = document.getElementById("themeState");
const guestThemeToggle = document.getElementById("guestThemeToggle");
const languageToggle = document.getElementById("languageToggle");
const languageState = document.getElementById("languageState");
const guestLanguageToggle = document.getElementById("guestLanguageToggle");
const taskOperationStatus = document.getElementById("taskOperationStatus");

let editingTaskId = null;
let modalScrollY = 0;
let modalBodyPaddingRight = "";
let modalPreviousFocus = null;
let modalDirty = false;
let realtimeTasksChannel = null;

btnOpenModal.disabled = !taskDataReady;

function t(key, ...args) {
  const translation = translations[currentLanguage][key];
  return typeof translation === "function" ? translation(...args) : translation;
}

function updateSortButton() {
  const sortLabel = sortAsc ? t("sortAscending") : t("sortDescending");
  btnSort.title = sortLabel;
  btnSort.setAttribute("aria-label", sortLabel);
  btnSort.setAttribute("aria-pressed", String(sortAsc));
  btnSort.dataset.sortDirection = sortAsc ? "ascending" : "descending";
}

function applyTheme() {
  window.deadlineApplyDocumentTheme(currentTheme);
  if (typeof window.deadlineApplyLogoTheme === "function") {
    window.deadlineApplyLogoTheme(currentTheme);
  }
  themeState.textContent = t(currentThemeMode);
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = `Deadline | ${t("pageTitle")}`;
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
  searchInput.setAttribute("aria-label", t("searchPlaceholder"));
  updateSortButton();
  btnProfile.setAttribute("aria-label", t("openProfileMenu"));
  btnCloseModal.setAttribute("aria-label", t("close"));
  document.getElementById("taskTitleInput").placeholder = t("titlePlaceholder");
  document.getElementById("taskDescInput").placeholder = t("detailsPlaceholder");
  document.getElementById("accountLabel").textContent = t("loggedInAccount");
  document.getElementById("themeLabel").textContent = t("switchTheme");
  document.getElementById("languageLabel").textContent = t("language");
  languageState.textContent = t("languageName");
  if (guestThemeToggle) {
    guestThemeToggle.setAttribute("aria-label", t("switchTheme"));
    guestThemeToggle.title = t("switchTheme");
  }
  if (guestLanguageToggle) {
    guestLanguageToggle.setAttribute("aria-label", t("language"));
    guestLanguageToggle.title = t("language");
  }
  document.getElementById("addStepLabel").textContent = t("addStep");
  document.getElementById("modalTitle").textContent = t(editingTaskId === null ? "addSchedule" : "editSchedule");
  themeState.textContent = t(currentThemeMode);
  const navToggle = document.getElementById("siteNavToggle");
  if (navToggle) {
    navToggle.setAttribute("aria-label", navToggle.getAttribute("aria-expanded") === "true"
      ? t("closeNavigation")
      : t("openNavigation"));
  }
  renderTasks();
}

function closeProfileMenu() {
  if (!profileMenu) return;
  profileMenu.classList.remove("account-menu__panel--open");
  if (btnProfile) btnProfile.setAttribute("aria-expanded", "false");
}

function closeTaskActionMenus(returnFocus = false) {
  taskListContainer.querySelectorAll(".task-card__action-menu:not([hidden])").forEach(menu => {
    menu.hidden = true;
    const trigger = menu.parentElement.querySelector('[data-action="toggle-task-menu"]');
    if (!trigger) return;
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus) trigger.focus();
  });
}

function showTaskModal() {
  modalPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  modalScrollY = window.scrollY;
  modalBodyPaddingRight = document.body.style.paddingRight;
  const isDesktop = window.matchMedia("(min-width: 769px)").matches;
  const scrollbarWidth = isDesktop ? 0 : window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  document.body.classList.add("site-page--modal-open");
  document.body.style.top = `-${modalScrollY}px`;
  addModal.classList.add("modal--open");
  addModal.setAttribute("aria-hidden", "false");
  document.querySelector(".modal__content").setAttribute("role", "dialog");
  document.querySelector(".modal__content").setAttribute("aria-modal", "true");
  document.querySelector(".modal__content").setAttribute("aria-labelledby", "modalTitle");
  requestAnimationFrame(() => document.getElementById("taskTitleInput").focus());
}

async function hideTaskModal() {
  if (modalDirty && !await showActionConfirm({
    titleKey: "confirmDiscardTitle",
    messageKey: "confirmDiscardMessage",
    confirmLabelKey: "discard",
    destructive: true
  })) return;
  addModal.classList.remove("modal--open");
  addModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("site-page--modal-open");
  document.body.style.top = "";
  document.body.style.paddingRight = modalBodyPaddingRight;
  window.scrollTo(0, modalScrollY);
  modalDirty = false;
  if (modalPreviousFocus instanceof HTMLElement) modalPreviousFocus.focus();
}

function showActionConfirm({ titleKey, messageKey, confirmLabelKey = "confirm", destructive = false }) {
  if (typeof window.deadlineConfirmAction !== "function") {
    throw new Error("The shared confirmation dialog is unavailable.");
  }
  return window.deadlineConfirmAction({
    title: t(titleKey),
    message: t(messageKey),
    confirmLabel: t(confirmLabelKey),
    cancelLabel: t("cancel"),
    destructive
  });
}

// =========================================
// 4. ฟังก์ชันคำนวณวันและจัดรูปแบบ (Helpers)
// =========================================
function getDaysLeft(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const targetDayOrdinal = Date.UTC(year, month - 1, day) / 86400000;
  return targetDayOrdinal - REFERENCE_DAY_ORDINAL;
}

function formatDateParts(dateString, overrideDay = null) {
  const dateObj = new Date(dateString + "T00:00:00");
  const englishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  let dayOfMonth = dateObj.getDate();
  let monthIndex = dateObj.getMonth();

  if (overrideDay) {
    const match = overrideDay.match(/^(\d{1,2})\s([A-Za-z]{3,9}\.?)$/);
    if (match) {
      const monthName = match[2].replace(".", "").toLowerCase();
      const overrideMonthIndex = englishMonths.findIndex(month =>
        month.toLowerCase().startsWith(monthName)
      );
      if (overrideMonthIndex >= 0) {
        dayOfMonth = Number(match[1]);
        monthIndex = overrideMonthIndex;
      } else if (currentLanguage === "en") {
        return { day: overrideDay, year: dateObj.getFullYear() };
      }
    } else if (currentLanguage === "en") {
      return { day: overrideDay, year: dateObj.getFullYear() };
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
    followUpDate: row.follow_up_date || "",
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
    follow_up_date: task.followUpDate || null,
    deadline_time: task.deadlineTime,
    status: task.status,
    subtasks: task.subtasks
  };
}

window.loadDeadlineTasks = async function(client, user) {
  try {
    const { data, error } = await client
      .from("tasks")
      .select("id, title, description, category, deadline_date, follow_up_date, deadline_time, status, subtasks")
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

window.subscribeDeadlineTasks = function(client, user) {
  if (realtimeTasksChannel) {
    client.removeChannel(realtimeTasksChannel);
  }
  realtimeTasksChannel = client
    .channel(`deadline-tasks-${user.id}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "tasks",
      filter: `user_id=eq.${user.id}`
    }, async () => {
      await window.loadDeadlineTasks(client, user);
    })
    .subscribe();
};

// =========================================
// 5. อัปเดตตัวเลขสรุปด้านบน (Summary Stats)
// =========================================
function updateStats() {
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const finishTasks = tasks.filter(t => t.status === "finish");
  const urgentTasks = inProgressTasks.filter(t => {
    const days = getDaysLeft(t.deadlineDate);
    return days >= 0 && days <= 3;
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
    taskListContainer.innerHTML = `<div class="task-list__empty-state">${t("loadingTasks")}</div>`;
    return;
  }

  // 1) กรองตาม Tab (In progress / Finished)
  let filtered = tasks.filter(task => task.status === currentTab);

  // 2) กรองตาม Pill (All / <= 3 days / หมวดหมู่)
  if (currentFilter === "urgent") {
    filtered = filtered.filter(task => {
      const days = getDaysLeft(task.deadlineDate);
      return task.status === "in-progress" && days >= 0 && days <= 3;
    });
  } else if (currentFilter === "today") {
    filtered = filtered.filter(task => getDaysLeft(task.deadlineDate) === 0);
  } else if (currentFilter === "overdue") {
    filtered = filtered.filter(task => getDaysLeft(task.deadlineDate) < 0);
  } else if (currentFilter !== "All") {
    filtered = filtered.filter(task => task.category === currentFilter);
  }

  // 3) กรองตามคำค้นหา
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(q) ||
      (task.desc || "").toLowerCase().includes(q) ||
      getCategoryLabel(task.category).toLowerCase().includes(q) ||
      (task.subtasks || []).some(subtask => (subtask.text || "").toLowerCase().includes(q))
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
    taskListContainer.innerHTML = `<div class="task-list__empty-state">${t("noResults")}</div>`;
    return;
  }

  const taskGroups = filtered.reduce((groups, task) => {
    let group = groups[groups.length - 1];
    if (!group || group.deadlineDate !== task.deadlineDate) {
      group = { deadlineDate: task.deadlineDate, tasks: [] };
      groups.push(group);
    }
    group.tasks.push(task);
    return groups;
  }, []);

  taskListContainer.innerHTML = taskGroups.map(group => {
    const { day, year } = formatDateParts(group.deadlineDate, group.tasks[0].displayDayOverride);
    const isUrgent = group.tasks.some(task =>
      getDaysLeft(task.deadlineDate) <= 3 && task.status === "in-progress"
    );
    const taskCardsHTML = group.tasks.map(task => {
      const daysLeft = getDaysLeft(task.deadlineDate);
      const isUrgent = daysLeft <= 3 && task.status === "in-progress";
      const isCompleted = task.status === "finish";
      const badgeClass = isCompleted
        ? "task-card__badge--completed"
        : isUrgent
          ? "task-card__badge--urgent"
          : daysLeft > 14
            ? "task-card__badge--distant"
            : "task-card__badge--normal";
      const deadlineTime = typeof task.deadlineTime === "string" ? task.deadlineTime.trim() : "";
      const followUpDate = task.followUpDate
        ? new Intl.DateTimeFormat(currentLanguage === "th" ? "th-TH-u-ca-buddhist" : "en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }).format(new Date(`${task.followUpDate}T00:00:00`))
        : "";

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
            <label class="task-card__checkbox ${sub.done ? "task-card__checkbox--done" : ""}">
              <input type="checkbox" data-action="toggle-subtask" data-task-id="${escapeHtml(task.id)}" data-subtask-id="${escapeHtml(sub.id)}" ${sub.done ? "checked" : ""}>
              <span class="task-card__checkmark"></span>
              ${escapeHtml(sub.text)}
            </label>
          </li>
        `).join("");

        subProgressHTML = `
          <div class="task-card__subtasks">
            <div class="task-card__progress-header">
              <span>${t("subProgressCount", doneCount, totalCount)}</span>
              <span class="task-card__progress-percent">${percent}%</span>
            </div>
            <div class="task-card__progress-track">
              <div class="task-card__progress-fill" style="width: ${percent}%;"></div>
            </div>
            <ul class="task-card__subtask-list">
              ${subtasksListItems}
            </ul>
          </div>
        `;
      }

      return `
        <div class="task-card__group-item">
          <div class="task-card__content">
            <div class="task-card__badges">
              <div class="task-card__badge-group">
                <span class="task-card__badge ${badgeClass}">${escapeHtml(badgeText)}</span>
                <span class="task-card__badge task-card__badge--category">${escapeHtml(getCategoryLabel(task.category))}</span>
                ${deadlineTime ? `<span class="task-card__badge task-card__badge--time task-card__deadline-time">${escapeHtml(formatDeadlineTime(deadlineTime))}</span>` : ""}
              </div>
              <div class="task-card__actions">
                <button type="button" class="task-card__more-button" data-action="toggle-task-menu" data-task-id="${escapeHtml(task.id)}"
                        title="${escapeHtml(t("taskActions"))}" aria-label="${escapeHtml(t("taskActions"))}"
                        aria-haspopup="menu" aria-expanded="false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>
                <div class="task-card__action-menu" role="menu" hidden>
                  <button type="button" role="menuitem" tabindex="-1"
                          data-action="edit-task" data-task-id="${escapeHtml(task.id)}">${t("editTask")}</button>
                  <button type="button" role="menuitem" tabindex="-1"
                          data-action="toggle-status" data-task-id="${escapeHtml(task.id)}">
                    ${t(task.status === "in-progress" ? "markFinished" : "moveToProgress")}
                  </button>
                  <button type="button" role="menuitem" tabindex="-1"
                          data-action="delete-task" data-task-id="${escapeHtml(task.id)}">${t("delete")}</button>
                </div>
              </div>
            </div>
            <h2 class="task-card__title">${escapeHtml(task.title)}</h2>
            <p class="task-card__description">${escapeHtml(task.desc)}</p>
            ${followUpDate ? `
              <div class="task-card__follow-up">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
                  <path d="M10 21h4"></path>
                </svg>
                <span>${escapeHtml(t("followUp", followUpDate))}</span>
              </div>
            ` : ""}
            ${subProgressHTML}
          </div>
        </div>
      `;
    }).join("");

    return `
      <article class="task-list__group">
        <div class="task-card__deadline-heading">
          <span class="task-card__deadline-label">${t("deadlineHeading")}</span>
          <strong class="task-card__deadline-day task-card__deadline-date ${isUrgent ? "task-card__deadline-date--urgent" : ""}">${escapeHtml(day)} ${escapeHtml(year)}</strong>
        </div>
        <div class="task-card task-card--group">
          ${taskCardsHTML}
        </div>
      </article>
    `;
  }).join("");
}

// =========================================
// 7. ฟังก์ชันโต้ตอบกับรายการงาน (Actions)
// =========================================
window.toggleTaskStatus = async function(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;

  const isFinishing = task.status === "in-progress";
  const confirmed = await showActionConfirm(isFinishing
    ? { titleKey: "confirmFinishTitle", messageKey: "confirmFinishMessage" }
    : { titleKey: "confirmRestoreTitle", messageKey: "confirmRestoreMessage" });
  if (!confirmed) return;

  const status = isFinishing ? "finish" : "in-progress";
  if (isDatabaseMode()) {
    try {
      const { error } = await window.deadlineSupabase
        .from("tasks")
        .update({
          status
        })
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
  const task = findTaskById(taskId);
  if (!task) return false;
  const confirmed = await showActionConfirm({
    titleKey: "confirmDeleteTitle",
    messageKey: "confirmDeleteMessage",
    destructive: true
  });
  if (!confirmed) return false;

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
  document.querySelector(".button-submit").textContent = t("save");
  btnDeleteModal.hidden = false;
  modalDirty = false;
  document.getElementById("taskDateInput").removeAttribute("min");

  document.getElementById("taskTitleInput").value = task.title;
  document.getElementById("taskDescInput").value = task.desc || "";
  document.getElementById("taskCategoryInput").value = task.category;
  document.getElementById("taskDateInput").value = task.deadlineDate;
  document.getElementById("taskFollowUpDateInput").value = task.followUpDate || "";
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
  if (target.dataset.action === "toggle-task-menu") {
    const menu = target.parentElement.querySelector(".task-card__action-menu");
    if (!menu) return;

    const shouldOpen = menu.hidden;
    closeTaskActionMenus();
    if (shouldOpen) {
      menu.hidden = false;
      target.setAttribute("aria-expanded", "true");
      menu.querySelector('[role="menuitem"]').focus();
    }
  } else if (target.dataset.action === "toggle-status") {
    closeTaskActionMenus();
    window.toggleTaskStatus(taskId);
  } else if (target.dataset.action === "edit-task") {
    closeTaskActionMenus();
    window.openEditModal(taskId);
  } else if (target.dataset.action === "delete-task") {
    closeTaskActionMenus();
    window.deleteTask(taskId);
  }
});

taskListContainer.addEventListener("keydown", event => {
  const menu = event.target instanceof Element ? event.target.closest(".task-card__action-menu") : null;
  if (!menu) return;

  const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
  const currentIndex = items.indexOf(document.activeElement);
  let nextIndex = currentIndex;

  if (event.key === "Escape") {
    event.preventDefault();
    closeTaskActionMenus(true);
    return;
  }
  if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % items.length;
  else if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + items.length) % items.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = items.length - 1;
  else return;

  event.preventDefault();
  items[nextIndex].focus();
});

taskListContainer.addEventListener("focusout", event => {
  const actions = event.target instanceof Element ? event.target.closest(".task-card__actions") : null;
  if (!actions || (event.relatedTarget instanceof Node && actions.contains(event.relatedTarget))) return;
  const menu = actions.querySelector(".task-card__action-menu");
  if (menu && !menu.hidden) closeTaskActionMenus();
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
  row.className = "task-form__subtask-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-form__subtask-checkbox";
  checkbox.checked = done;
  checkbox.setAttribute("aria-label", t("markStepComplete", stepNumber));

  const input = document.createElement("input");
  input.type = "text";
  input.className = "task-form__subtask-input";
  input.placeholder = t("step", stepNumber);
  input.value = text;

  row.appendChild(checkbox);
  row.appendChild(input);
  return row;
}

// =========================================
// 8. Event Listeners (ปุ่มควบคุมและ Modal)
// =========================================
// สลับแท็บ In progress / Finished
tabButtons.forEach(btn => {
btn.addEventListener("click", () => {
tabButtons.forEach(button => {
  const active = button === btn;
  button.classList.toggle("task-controls__tab--active", active);
  button.setAttribute("aria-pressed", String(active));
});
currentTab = btn.dataset.tab;
renderTasks();
});
});
// เลือกตัวกรองหมวดหมู่
filterPills.forEach(pill => {
pill.addEventListener("click", () => {
filterPills.forEach(button => {
  const active = button === pill;
  button.classList.toggle("task-filters__pill--active", active);
  button.setAttribute("aria-pressed", String(active));
});
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
updateSortButton();
renderTasks();
});
themeToggle.addEventListener("click", () => {
  const modes = ["system", "light", "dark"];
  currentThemeMode = modes[(modes.indexOf(currentThemeMode) + 1) % modes.length];
  window.deadlineSetThemeMode(currentThemeMode);
  currentTheme = window.deadlineGetThemePreference();
  applyTheme();
});
const systemThemePreference = window.matchMedia("(prefers-color-scheme: dark)");
const syncSystemTheme = event => {
  if (currentThemeMode !== "system") return;
  currentTheme = event.matches ? "dark" : "light";
  applyTheme();
};
if (systemThemePreference.addEventListener) {
  systemThemePreference.addEventListener("change", syncSystemTheme);
} else if (systemThemePreference.addListener) {
  systemThemePreference.addListener(syncSystemTheme);
}
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
  document.querySelector(".button-submit").textContent = t("save");
  btnDeleteModal.hidden = true;
  addTaskForm.reset();
  subtaskFormList.innerHTML = "";
  addStepNumber.textContent = "1";
  const today = localDateString();
  document.getElementById("taskDateInput").min = today;
  document.getElementById("taskDateInput").value = today;
  document.getElementById("taskFollowUpDateInput").value = "";
  modalDirty = false;
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
      modalDirty = false;
      hideTaskModal();
    }
  }
});
btnProfile.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = profileMenu.classList.toggle("account-menu__panel--open");
  btnProfile.setAttribute("aria-expanded", String(isOpen));
});
document.addEventListener("click", (e) => {
  if (actionConfirmModal.contains(e.target)) return;
  if (!profileMenu.contains(e.target) && !btnProfile.contains(e.target)) {
    profileMenu.classList.remove("account-menu__panel--open");
    btnProfile.setAttribute("aria-expanded", "false");
  }
  if (!(e.target instanceof Element) || !e.target.closest(".task-card__actions")) {
    closeTaskActionMenus();
  }
});
// เพิ่มรายการ Sub-progress ในฟอร์ม
btnAddStep.addEventListener("click", () => {
const stepNumber = subtaskFormList.querySelectorAll(".task-form__subtask-row").length + 1;
subtaskFormList.appendChild(createSubtaskFormRow("", stepNumber, false));
addStepNumber.textContent = String(stepNumber + 1);
document.getElementById("addStepLabel").textContent = t("addStep");
subtaskFormList.lastElementChild.querySelector(".task-form__subtask-input").focus();
});

addTaskForm.addEventListener("input", () => {
  modalDirty = true;
});

subtaskFormList.addEventListener("change", () => {
  modalDirty = true;
});

document.addEventListener("keydown", event => {
  if (!addModal.classList.contains("modal--open") || actionConfirmModal.classList.contains("modal--open")) return;
  if (event.key === "Escape") {
    event.preventDefault();
    hideTaskModal();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = Array.from(addModal.querySelectorAll(
    'button:not([hidden]):not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]'
  )).filter(element => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// บันทึกงานใหม่จากฟอร์ม
addTaskForm.addEventListener("submit", async (e) => {
e.preventDefault();
if (!taskDataReady) return;
const titleInput = document.getElementById("taskTitleInput");
const title = titleInput.value.trim();
if (!title) {
  titleInput.setCustomValidity(t("titleRequired"));
  titleInput.reportValidity();
  titleInput.addEventListener("input", () => titleInput.setCustomValidity(""), { once: true });
  return;
}
titleInput.setCustomValidity("");
const timeInput = document.getElementById("taskTimeInput").value;
let deadlineTime = "";
if (timeInput) {
  const [hours, minutes] = timeInput.split(":").map(Number);
  const suffix = hours >= 12 ? "p.m." : "a.m.";
  const displayHours = hours % 12 || 12;
  deadlineTime = `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
const subtasks = Array.from(subtaskFormList.querySelectorAll(".task-form__subtask-row"))
  .map(row => ({
    text: row.querySelector(".task-form__subtask-input").value.trim(),
    done: row.querySelector(".task-form__subtask-checkbox").checked
  }))
  .filter(subtask => subtask.text !== "")
  .map((subtask, index) => ({ id: Date.now() + index, text: subtask.text, done: subtask.done }));
const taskData = {
title,
desc: document.getElementById("taskDescInput").value.trim(),
category: document.getElementById("taskCategoryInput").value,
deadlineDate: document.getElementById("taskDateInput").value,
followUpDate: document.getElementById("taskFollowUpDateInput").value,
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
        .select("id, title, description, category, deadline_date, follow_up_date, deadline_time, status, subtasks")
        .single();
      if (error) throw error;
      Object.assign(task, taskFromDatabase(data));
    } else {
      const newTask = { status: "in-progress", ...taskData };
      const { data, error } = await window.deadlineSupabase
        .from("tasks")
        .insert(taskToDatabase(newTask, window.deadlineUser.id))
        .select("id, title, description, category, deadline_date, follow_up_date, deadline_time, status, subtasks")
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
modalDirty = false;
hideTaskModal();
// สลับกลับมาแท็บ In progress เพื่อให้เห็นงานที่เพิ่งเพิ่ม
currentTab = "in-progress";
tabButtons.forEach(button => {
  const active = button.dataset.tab === "in-progress";
  button.classList.toggle("task-controls__tab--active", active);
  button.setAttribute("aria-pressed", String(active));
});
renderTasks();
});
// =========================================
// 9. เริ่มต้นทำงานครั้งแรก
// =========================================
applyTheme();
applyLanguage();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(window.deadlineSiteUrl("sw.js")).catch(error => {
      console.error("Service worker registration failed:", error);
    });
  });
}

setInterval(() => {
  const today = new Date(`${localDateString()}T00:00:00`);
  if (today.getTime() !== REFERENCE_TODAY.getTime()) {
    location.reload();
  }
}, 60 * 1000);