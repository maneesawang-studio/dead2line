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
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    pageTitle: "Manage deadlines",
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
    searchPlaceholder: "Search for a schedule",
    sortDeadlines: "Sort deadlines",
    noResults: "No deadlines found matching your filter.",
    overdueFilter: "Overdue",
    todayFilter: "Today",
    sortAscending: "Sort by earliest deadline",
    sortDescending: "Sort by latest deadline",
    confirmDiscardTitle: "Discard unsaved changes?",
    confirmDiscardMessage: "Your changes will be lost.",
    discard: "Discard",
    titleRequired: "Enter a task title.",
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
    confirmDeleteTitle: "Delete this task?",
    confirmDeleteMessage: "This action can't be undone.",
    confirmFinishTitle: "Mark this task as finished?",
    confirmFinishMessage: "It will move to Finished and stay there until you delete it.",
    confirmRestoreTitle: "This task isn't finished yet?",
    confirmRestoreMessage: "It will move back to In progress.",
    confirm: "Confirm"
  },
  th: {
    homeNav: "หน้าหลัก",
    tasksNav: "รายการงาน",
    aboutNav: "เกี่ยวกับ",
    faqNav: "คำถามที่พบบ่อย",
    openNavigation: "เปิดเมนูนำทาง",
    closeNavigation: "ปิดเมนูนำทาง",
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
    overdueFilter: "เกินกำหนด",
    todayFilter: "วันนี้",
    sortAscending: "เรียงกำหนดส่งเร็วที่สุด",
    sortDescending: "เรียงกำหนดส่งช้าที่สุด",
    confirmDiscardTitle: "ต้องการทิ้งการเปลี่ยนแปลงที่ยังไม่ได้บันทึกหรือไม่?",
    confirmDiscardMessage: "การเปลี่ยนแปลงที่ทำไว้จะหายไป",
    discard: "ทิ้งการเปลี่ยนแปลง",
    titleRequired: "กรุณากรอกหัวข้องาน",
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
    confirmDeleteTitle: "ต้องการลบงานนี้หรือไม่?",
    confirmDeleteMessage: "งานนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้",
    confirmFinishTitle: "ยืนยันว่าทำงานเสร็จแล้วใช่ไหม?",
    confirmFinishMessage: "งานจะย้ายไปที่เสร็จแล้ว และจะคงอยู่จนกว่าคุณจะลบเอง",
    confirmRestoreTitle: "งานนี้ยังไม่เสร็จใช่ไหม?",
    confirmRestoreMessage: "งานจะถูกย้ายกลับไปที่กำลังดำเนินการ",
    confirm: "ยืนยัน"
  }
};
let currentLanguage = localStorage.getItem("deadline-language") === "th" ? "th" : "en";
let currentTheme = window.deadlineGetThemePreference();

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

function applyTheme() {
  window.deadlineApplyDocumentTheme(currentTheme);
  document.body.classList.toggle("dark-mode", currentTheme === "dark");
  if (typeof window.deadlineApplyLogoTheme === "function") {
    window.deadlineApplyLogoTheme(currentTheme);
  }
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
  searchInput.setAttribute("aria-label", t("searchPlaceholder"));
  const sortLabel = sortAsc ? t("sortAscending") : t("sortDescending");
  btnSort.title = sortLabel;
  btnSort.setAttribute("aria-label", sortLabel);
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
  themeState.textContent = t(currentTheme);
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
  profileMenu.classList.remove("show");
  if (btnProfile) btnProfile.setAttribute("aria-expanded", "false");
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
  document.body.classList.add("modal-open");
  document.body.style.top = `-${modalScrollY}px`;
  addModal.classList.add("show");
  addModal.setAttribute("aria-hidden", "false");
  document.querySelector(".modal-content").setAttribute("role", "dialog");
  document.querySelector(".modal-content").setAttribute("aria-modal", "true");
  document.querySelector(".modal-content").setAttribute("aria-labelledby", "modalTitle");
  requestAnimationFrame(() => document.getElementById("taskTitleInput").focus());
}

async function hideTaskModal() {
  if (modalDirty && !await showActionConfirm({
    titleKey: "confirmDiscardTitle",
    messageKey: "confirmDiscardMessage",
    confirmLabelKey: "discard",
    destructive: true
  })) return;
  addModal.classList.remove("show");
  addModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
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
    taskListContainer.innerHTML = `<div class="empty-state">${t("loadingTasks")}</div>`;
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
    taskListContainer.innerHTML = `<div class="empty-state">${t("noResults")}</div>`;
    return;
  }

  taskListContainer.innerHTML = filtered.map(task => {
    const daysLeft = getDaysLeft(task.deadlineDate);
    const isUrgent = daysLeft <= 3 && task.status === "in-progress";
    const { day, year } = formatDateParts(task.deadlineDate, task.displayDayOverride);
    const deadlineTime = typeof task.deadlineTime === "string" ? task.deadlineTime.trim() : "";

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
          ${deadlineTime ? `<span class="deadline-time">${escapeHtml(formatDeadlineTime(deadlineTime))}</span>` : ""}
        </div>

        <div class="task-content-col">
          <div class="task-badges">
            <div class="task-badge-group">
              <span class="badge ${isUrgent ? "urgent" : "normal"}">${escapeHtml(badgeText)}</span>
              <span class="badge category">${escapeHtml(getCategoryLabel(task.category))}</span>
            </div>
            <div class="task-actions-col">
              <button type="button" class="btn-check ${task.status === "finish" ? "completed" : ""}"
                      data-action="toggle-status" data-task-id="${escapeHtml(task.id)}"
                      title="${escapeHtml(task.status === "in-progress" ? t("markFinished") : t("moveToProgress"))}"
                      aria-label="${escapeHtml(task.status === "in-progress" ? t("markFinished") : t("moveToProgress"))}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <button type="button" class="btn-more" data-action="edit-task" data-task-id="${escapeHtml(task.id)}"
                      title="${escapeHtml(t("editTask"))}" aria-label="${escapeHtml(t("editTask"))}">
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
  document.querySelector(".btn-submit").textContent = t("save");
  btnDeleteModal.hidden = false;
  modalDirty = false;
  document.getElementById("taskDateInput").removeAttribute("min");

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
// สลับแท็บ In progress / Finished
tabButtons.forEach(btn => {
btn.addEventListener("click", () => {
tabButtons.forEach(button => {
  const active = button === btn;
  button.classList.toggle("active", active);
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
  button.classList.toggle("active", active);
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
const sortLabel = sortAsc ? t("sortAscending") : t("sortDescending");
btnSort.title = sortLabel;
btnSort.setAttribute("aria-label", sortLabel);
renderTasks();
});
themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("deadline-theme", currentTheme);
  applyTheme();
});
const systemThemePreference = window.matchMedia("(prefers-color-scheme: dark)");
const syncSystemTheme = event => {
  const savedTheme = localStorage.getItem("deadline-theme");
  if (savedTheme === "dark" || savedTheme === "light") return;
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
  document.querySelector(".btn-submit").textContent = t("save");
  btnDeleteModal.hidden = true;
  addTaskForm.reset();
  subtaskFormList.innerHTML = "";
  addStepNumber.textContent = "1";
  const today = localDateString();
  document.getElementById("taskDateInput").min = today;
  document.getElementById("taskDateInput").value = today;
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
  const isOpen = profileMenu.classList.toggle("show");
  btnProfile.setAttribute("aria-expanded", String(isOpen));
});
document.addEventListener("click", (e) => {
  if (actionConfirmModal.contains(e.target)) return;
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

addTaskForm.addEventListener("input", () => {
  modalDirty = true;
});

subtaskFormList.addEventListener("change", () => {
  modalDirty = true;
});

document.addEventListener("keydown", event => {
  if (!addModal.classList.contains("show") || actionConfirmModal.classList.contains("show")) return;
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
const subtasks = Array.from(subtaskFormList.querySelectorAll(".subtask-form-row"))
  .map(row => ({
    text: row.querySelector(".subtask-form-input").value.trim(),
    done: row.querySelector(".subtask-form-check").checked
  }))
  .filter(subtask => subtask.text !== "")
  .map((subtask, index) => ({ id: Date.now() + index, text: subtask.text, done: subtask.done }));
const taskData = {
title,
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
modalDirty = false;
hideTaskModal();
// สลับกลับมาแท็บ In progress เพื่อให้เห็นงานที่เพิ่งเพิ่ม
currentTab = "in-progress";
tabButtons.forEach(button => {
  const active = button.dataset.tab === "in-progress";
  button.classList.toggle("active", active);
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