const siteTranslations = {
  en: {
    dashboard: "Tasks",
    aboutNav: "About",
    aboutMenu: "About Deadline",
    faqNav: "FAQ",
    theme: "Theme",
    language: "Language",
    light: "Light",
    dark: "Dark",
    languageName: "English",
    account: "Account",
    previewAccount: "Preview mode (not authenticated)",
    openProfileMenu: "Open profile menu",
    switchTheme: "Switch theme",
    settings: "Settings",
    signIn: "Sign in",
    privacy: "Privacy",
    signOut: "Sign out",
    loginTitle: "Sign in",
    loginHeading: "Welcome back",
    loginLead: "Sign in to continue to your deadlines.",
    email: "Email",
    password: "Password",
    signInButton: "Sign in",
    loginNote: "Use an account that has been created in Supabase Auth.",
    aboutTitle: "About Deadline",
    aboutHeading: "Make every deadline manageable.",
    aboutIntro: "Deadline is a simple task and deadline dashboard designed to help you see what needs attention and break work into clear next steps.",
    featureTasksTitle: "See what matters",
    featureTasksText: "Review work in progress, finished tasks, and upcoming deadlines in one place.",
    featureStepsTitle: "Break work into steps",
    featureStepsText: "Add smaller checklist items and track progress as you complete them.",
    featurePersonalTitle: "Make it yours",
    featurePersonalText: "Switch between English and Thai, choose a light or dark theme, and organize work by category.",
    previewTitle: "Current preview",
    previewText: "Task data is currently held in the page and is not synced to a database. Supabase sign-in will be enabled after project settings are added.",
    faqTitle: "Frequently asked questions",
    faqAddQuestion: "How do I add a task?",
    faqAddAnswer: "Open the Tasks page and select + Add. Enter a title and deadline; category, time, notes, and subtasks are optional.",
    faqProgressQuestion: "How do I mark a task as finished?",
    faqProgressAnswer: "Select the check button on a task card. Use the In progress and Finish tabs to switch between task lists.",
    faqUrgentQuestion: "What does the urgent label mean?",
    faqUrgentAnswer: "It marks an in-progress task whose deadline is within three days.",
    faqThemeQuestion: "How do I change the theme or language?",
    faqThemeAnswer: "Open the profile menu on the Tasks page, then choose a theme or switch between English and Thai.",
    faqLoginQuestion: "How does sign-in work?",
    faqLoginAnswer: "Sign-in uses Supabase Auth. The page is prepared, but authentication is not active until a Supabase project URL and publishable key are configured.",
    faqDataQuestion: "Are my tasks saved to the cloud?",
    faqDataAnswer: "Not yet. Tasks currently use preview data in the browser. Supabase database storage and per-user access rules have not been configured.",
    backToTasks: "Back to tasks",
    footerNote: "A clearer way to keep deadlines in sight."
  },
  th: {
    dashboard: "รายการงาน",
    aboutNav: "เกี่ยวกับ",
    aboutMenu: "เกี่ยวกับ Deadline",
    faqNav: "คำถามที่พบบ่อย",
    theme: "ธีม",
    language: "ภาษา",
    light: "สว่าง",
    dark: "มืด",
    languageName: "ไทย",
    account: "บัญชี",
    previewAccount: "โหมดตัวอย่าง (ยังไม่ได้เข้าสู่ระบบ)",
    openProfileMenu: "เปิดเมนูโปรไฟล์",
    switchTheme: "เปลี่ยนธีม",
    settings: "การตั้งค่า",
    signIn: "เข้าสู่ระบบ",
    privacy: "ความเป็นส่วนตัว",
    signOut: "ออกจากระบบ",
    loginTitle: "เข้าสู่ระบบ",
    loginHeading: "ยินดีต้อนรับกลับ",
    loginLead: "เข้าสู่ระบบเพื่อดูรายการกำหนดส่งของคุณ",
    email: "อีเมล",
    password: "รหัสผ่าน",
    signInButton: "เข้าสู่ระบบ",
    loginNote: "ใช้บัญชีที่สร้างไว้ใน Supabase Auth",
    aboutTitle: "เกี่ยวกับ Deadline",
    aboutHeading: "จัดการทุกกำหนดส่งให้ชัดเจน",
    aboutIntro: "Deadline คือแดชบอร์ดงานและกำหนดส่งที่ช่วยให้เห็นงานสำคัญและแบ่งงานออกเป็นขั้นตอนที่ทำต่อได้ง่าย",
    featureTasksTitle: "เห็นสิ่งที่สำคัญ",
    featureTasksText: "ดูงานที่กำลังทำ งานที่เสร็จแล้ว และกำหนดส่งที่ใกล้เข้ามาได้ในที่เดียว",
    featureStepsTitle: "แบ่งงานเป็นขั้นตอน",
    featureStepsText: "เพิ่มรายการย่อยและติดตามความคืบหน้าเมื่อทำงานเสร็จ",
    featurePersonalTitle: "ปรับให้เหมาะกับคุณ",
    featurePersonalText: "เลือกภาษาไทยหรืออังกฤษ ใช้ธีมสว่างหรือมืด และจัดงานตามหมวดหมู่",
    previewTitle: "สถานะเวอร์ชันปัจจุบัน",
    previewText: "ข้อมูลงานยังอยู่ในหน้าเว็บและไม่ได้ซิงก์กับฐานข้อมูล จะเปิดใช้ Supabase sign-in หลังเพิ่มค่าตั้งค่าโปรเจกต์",
    faqTitle: "คำถามที่พบบ่อย",
    faqAddQuestion: "เพิ่มงานอย่างไร?",
    faqAddAnswer: "ไปที่หน้ารายการงานแล้วเลือก + Add กรอกหัวข้อและกำหนดส่ง ส่วนหมวดหมู่ เวลา รายละเอียด และงานย่อยเป็นตัวเลือกเสริม",
    faqProgressQuestion: "ทำเครื่องหมายว่างานเสร็จแล้วอย่างไร?",
    faqProgressAnswer: "กดปุ่มเครื่องหมายถูกบนการ์ดงาน แล้วใช้แท็บกำลังทำและเสร็จแล้วเพื่อสลับรายการ",
    faqUrgentQuestion: "ป้ายเร่งด่วนหมายถึงอะไร?",
    faqUrgentAnswer: "แสดงงานที่กำลังทำและมีกำหนดส่งภายในสามวัน",
    faqThemeQuestion: "เปลี่ยนธีมหรือภาษาอย่างไร?",
    faqThemeAnswer: "เปิดเมนูโปรไฟล์ในหน้ารายการงาน แล้วเลือกธีมหรือสลับภาษาไทยและอังกฤษ",
    faqLoginQuestion: "ระบบเข้าสู่ระบบทำงานอย่างไร?",
    faqLoginAnswer: "ระบบเข้าสู่ระบบใช้ Supabase Auth โดยเตรียมหน้าไว้แล้ว แต่ยังไม่เปิดใช้จนกว่าจะตั้งค่า Project URL และ Publishable key",
    faqDataQuestion: "งานถูกบันทึกบนคลาวด์หรือไม่?",
    faqDataAnswer: "ยังไม่ถูกบันทึก ขณะนี้ใช้ข้อมูลตัวอย่างในเบราว์เซอร์ และยังไม่ได้ตั้งค่าฐานข้อมูล Supabase หรือสิทธิ์แยกตามผู้ใช้",
    backToTasks: "กลับไปหน้ารายการงาน",
    footerNote: "มองเห็นทุกกำหนดส่งได้ชัดเจนขึ้น"
  }
};

let siteLanguage = localStorage.getItem("deadline-language") === "th" ? "th" : "en";
let siteTheme = localStorage.getItem("deadline-theme") === "dark" ? "dark" : "light";

function siteText(key) {
  return siteTranslations[siteLanguage][key];
}

function applySitePreferences() {
  document.documentElement.lang = siteLanguage;
  document.body.classList.toggle("dark-mode", siteTheme === "dark");
  document.querySelectorAll("[data-site-i18n]").forEach(element => {
    element.textContent = siteText(element.dataset.siteI18n);
  });

  const titleKey = document.body.dataset.siteTitle;
  if (titleKey) document.title = `Deadline. - ${siteText(titleKey)}`;

  const themeState = document.getElementById("themeState");
  const languageState = document.getElementById("languageState");
  const profileButton = document.getElementById("btnProfile");
  if (themeState) themeState.textContent = siteText(siteTheme);
  if (languageState) languageState.textContent = siteText("languageName");
  if (profileButton) profileButton.setAttribute("aria-label", siteText("openProfileMenu"));
}

document.getElementById("themeToggle").addEventListener("click", () => {
  siteTheme = siteTheme === "light" ? "dark" : "light";
  localStorage.setItem("deadline-theme", siteTheme);
  applySitePreferences();
});

document.getElementById("languageToggle").addEventListener("click", () => {
  siteLanguage = siteLanguage === "en" ? "th" : "en";
  localStorage.setItem("deadline-language", siteLanguage);
  applySitePreferences();
});

const profileButton = document.getElementById("btnProfile");
const profileMenu = document.getElementById("profileMenu");

profileButton.addEventListener("click", event => {
  event.stopPropagation();
  const isOpen = profileMenu.classList.toggle("show");
  profileButton.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", event => {
  if (!profileMenu.contains(event.target) && !profileButton.contains(event.target)) {
    profileMenu.classList.remove("show");
    profileButton.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    profileMenu.classList.remove("show");
    profileButton.setAttribute("aria-expanded", "false");
  }
});

applySitePreferences();
