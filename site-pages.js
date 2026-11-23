(() => {
const scriptUrl = document.currentScript && document.currentScript.src;
const siteRoot = new URL("./", scriptUrl || window.location.href);
const siteUrl = path => new URL(String(path || "").replace(/^\/+/, ""), siteRoot).href;
const sitePath = path => new URL(siteUrl(path)).pathname;
window.deadlineSiteUrl = siteUrl;

const lastPwaPageKey = "deadline-pwa-last-page";
const isStandaloneApp = (
  typeof window.matchMedia === "function" &&
  window.matchMedia("(display-mode: standalone)").matches
) || Boolean(window.navigator && window.navigator.standalone);
if (isStandaloneApp) {
  const currentPath = window.location.pathname;
  const navigationEntries = window.performance &&
    typeof window.performance.getEntriesByType === "function"
    ? window.performance.getEntriesByType("navigation")
    : [];
  const isHistoryNavigation = navigationEntries[0] && navigationEntries[0].type === "back_forward";
  const query = new URLSearchParams(window.location.search);
  const authCallbackKeys = ["code", "token_hash", "access_token", "refresh_token"];
  const isAuthCallback = authCallbackKeys.some(key => query.has(key)) ||
    query.get("reason") === "email-confirmed" ||
    /(?:access_token|refresh_token|code|token_hash)=/.test(window.location.hash);
  const savedPath = localStorage.getItem(lastPwaPageKey);
  let restoredPath = false;

  if (savedPath && !isHistoryNavigation && !isAuthCallback) {
    try {
      const savedUrl = new URL(savedPath, window.location.origin);
      if (savedUrl.origin === window.location.origin &&
        savedUrl.pathname.startsWith(siteRoot.pathname) &&
        savedUrl.pathname !== currentPath) {
        window.location.replace(savedUrl.pathname);
        restoredPath = true;
      }
    } catch (error) {
      console.warn("Ignoring invalid saved PWA page:", error);
    }
  }

  if (!restoredPath) {
    localStorage.setItem(lastPwaPageKey, currentPath);
  }

  if (!restoredPath && query.get("source") === "pwa") {
    query.delete("source");
    const remainingQuery = query.toString();
    window.history.replaceState(
      null,
      "",
      `${currentPath}${remainingQuery ? `?${remainingQuery}` : ""}${window.location.hash}`
    );
  }

  document.addEventListener("click", event => {
    if (event.defaultPrevented) return;
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") ||
      (link.target && link.target.toLowerCase() !== "_self")) return;

    const destination = new URL(link.href, window.location.href);
    if (destination.origin === window.location.origin &&
      destination.pathname.startsWith(siteRoot.pathname)) {
      localStorage.setItem(lastPwaPageKey, destination.pathname);
    }
  });
}

const nav = document.getElementById("siteNavigation") || document.querySelector(".navbar");
if (nav) {
  const activePage = document.body.dataset.navActive || "";
  const authPage = document.body.dataset.authPage || "";
  const isLanding = authPage === "landing";
  const pageThemeToggle = document.getElementById("themeToggle");
  const pageLanguageToggle = document.getElementById("languageToggle");
  const hasVisiblePagePreferences = Boolean(
    pageThemeToggle &&
    pageLanguageToggle &&
    !pageThemeToggle.closest("#profileMenu") &&
    !pageLanguageToggle.closest("#profileMenu")
  );
  let inner = nav.querySelector(".navbar-inner");

  function linksMarkup() {
    const tasksHref = siteUrl(authPage === "dashboard" ? "app/" : "login/");
    const currentPage = name => activePage === name ? ' aria-current="page"' : "";
    return `
      <button type="button" class="site-nav-toggle" id="siteNavToggle" aria-expanded="false" aria-controls="primaryNavigation" aria-label="Open navigation">
        <span></span><span></span><span></span>
      </button>
      <div class="site-nav-links" id="primaryNavigation">
        <a class="site-nav-link" href="${siteUrl("")}"${currentPage("home")}><span data-i18n="homeNav" data-site-i18n="homeNav">Home</span></a>
        <a class="site-nav-link" id="tasksNavLink" href="${tasksHref}"${currentPage("tasks")}><span data-i18n="tasksNav" data-site-i18n="tasksNav">Tasks</span></a>
        <a class="site-nav-link" href="${siteUrl("about/")}"${currentPage("about")}><span data-i18n="aboutNav" data-site-i18n="aboutNav">About</span></a>
        <a class="site-nav-link" href="${siteUrl("faq/")}"${currentPage("faq")}><span data-i18n="faqNav" data-site-i18n="faqNav">FAQ</span></a>
        ${hasVisiblePagePreferences ? "" : `
          <div class="site-nav-preferences">
            <button type="button" class="site-nav-preference" id="guestThemeToggle" data-i18n-aria-label="switchTheme" data-i18n-title="switchTheme" data-site-i18n-aria-label="switchTheme" data-site-i18n-title="switchTheme">
              <svg class="site-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path>
              </svg>
            </button>
            <button type="button" class="site-nav-preference" id="guestLanguageToggle" data-i18n-aria-label="language" data-i18n-title="language" data-site-i18n-aria-label="language" data-site-i18n-title="language">
              <svg class="site-nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </button>
          </div>`}
      </div>`;
  }

  function profileMarkup(includePreferences) {
    const preferences = includePreferences ? `
      <button type="button" class="profile-row theme-row" id="themeToggle">
        <span id="themeLabel" data-i18n="switchTheme" data-site-i18n="switchTheme">Switch theme</span>
        <span class="theme-state" id="themeState">Light</span>
      </button>
      <button type="button" class="profile-row theme-row" id="languageToggle">
        <span id="languageLabel" data-i18n="language" data-site-i18n="language">Language</span>
        <span class="theme-state" id="languageState">English</span>
      </button>` : "";
    return `
      <div class="profile-wrapper">
        <button type="button" class="user-profile" id="btnProfile" aria-expanded="false" aria-label="Open profile menu" hidden>
          <div class="avatar"><span class="avatar-initials" aria-hidden="true">U</span><img class="avatar-img" alt="User profile" hidden></div>
          <span class="profile-email" id="profileEmail"></span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888888" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="profile-menu" id="profileMenu">
          <div class="profile-account">
            <span id="accountLabel" data-i18n="loggedInAccount" data-site-i18n="account">Account</span>
            <strong id="accountEmail" data-i18n="previewAccount" data-site-i18n="previewAccount">Preview mode (not authenticated)</strong>
          </div>
          <p class="auth-status" id="profileAuthStatus" role="status" aria-live="polite" hidden></p>
          ${preferences}
          <a class="profile-row profile-row-link" href="${siteUrl("settings/")}" data-i18n="settings" data-site-i18n="settings">Settings</a>
          <hr>
          <a class="profile-row profile-row-link" href="${siteUrl("privacy/")}" data-i18n="privacy" data-site-i18n="privacy">Privacy</a>
          <a class="profile-row profile-row-link" id="loginMenuLink" href="${siteUrl("login/")}" data-i18n="signIn" data-site-i18n="signIn">Sign in</a>
          <button type="button" class="profile-row sign-out" id="signOutButton" data-i18n="signOut" data-site-i18n="signOut" hidden>Sign out</button>
        </div>
      </div>`;
  }

  if (!inner) {
    nav.className = "navbar";
    nav.innerHTML = `
      <div class="navbar-inner">
        <a class="logo" href="${siteUrl("")}" aria-label="Deadline home">
          <img src="${siteUrl("Asset/Deadline-512.png")}" alt="">
          <span class="logo-name">Deadline<span class="logo-dot">.</span></span>
        </a>
        ${linksMarkup()}
        <div class="site-nav-actions">
          ${isLanding ? `
            <a class="landing-nav-login site-nav-guest-link" id="landingLoginLink" href="${siteUrl("login/")}" data-i18n="signIn" data-site-i18n="signIn">Sign in</a>
            <a class="landing-nav-login site-nav-guest-link" id="landingSignUpLink" href="${siteUrl("signup/")}" data-i18n="signUpLink" data-site-i18n="signUpLink">Sign up</a>
            <a class="landing-nav-login" id="landingDashboardLink" href="${siteUrl("app/")}" data-i18n="openDashboard" data-site-i18n="openDashboard" hidden>Open dashboard</a>
          ` : ""}
          ${profileMarkup(true)}
        </div>
      </div>`;
  } else {
    const brand = inner.querySelector(".logo");
    const profile = inner.querySelector(".profile-wrapper");
    if (!inner.querySelector(".site-nav-links")) {
      const links = document.createElement("div");
      links.innerHTML = linksMarkup();
      const toggle = links.firstElementChild;
      const primaryLinks = links.lastElementChild;
      if (brand) brand.after(toggle, primaryLinks);
      else inner.prepend(toggle, primaryLinks);
    }

    if (!profile) {
      const actions = document.createElement("div");
      actions.className = "site-nav-actions";
      const preferencesAlreadyOnPage = Boolean(document.getElementById("themeToggle") || document.getElementById("languageToggle"));
      actions.innerHTML = profileMarkup(!preferencesAlreadyOnPage);
      inner.appendChild(actions);
    }
  }

  inner = nav.querySelector(".navbar-inner");
  let actions = inner.querySelector(".site-nav-actions");
  const profile = inner.querySelector(".profile-wrapper");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "site-nav-actions";
    if (profile) actions.appendChild(profile);
    inner.appendChild(actions);
  }

  let guestLoginLink = document.getElementById("landingLoginLink");
  if (!guestLoginLink && authPage !== "login") {
    guestLoginLink = document.createElement("a");
    guestLoginLink.id = "siteGuestLoginLink";
    guestLoginLink.className = "landing-nav-login site-nav-guest-link";
    guestLoginLink.href = siteUrl("login/");
    guestLoginLink.dataset.i18n = "signIn";
    guestLoginLink.dataset.siteI18n = "signIn";
    guestLoginLink.textContent = "Sign in";
    actions.prepend(guestLoginLink);
  }

  let guestSignUpLink = document.getElementById("landingSignUpLink");
  if (!guestSignUpLink && authPage !== "signup") {
    guestSignUpLink = document.createElement("a");
    guestSignUpLink.id = "siteGuestSignUpLink";
    guestSignUpLink.className = "landing-nav-login site-nav-guest-link";
    guestSignUpLink.href = siteUrl("signup/");
    guestSignUpLink.dataset.i18n = "signUpLink";
    guestSignUpLink.dataset.siteI18n = "signUpLink";
    guestSignUpLink.textContent = "Sign up";
    actions.appendChild(guestSignUpLink);
  }

  const primaryLinks = nav.querySelector(".site-nav-links");
  const toggle = document.getElementById("siteNavToggle");
  const profileButton = document.getElementById("btnProfile");
  const profileMenu = document.getElementById("profileMenu");
  const guestPreferences = nav.querySelector(".site-nav-preferences");
  if (toggle) actions.appendChild(toggle);
  function placeGuestPreferences() {
    if (!guestPreferences || !primaryLinks) return;
    const target = window.matchMedia("(min-width: 1001px)").matches ? actions : primaryLinks;
    if (guestPreferences.parentElement === target) return;
    if (target === actions && toggle && toggle.parentElement === actions) {
      actions.insertBefore(guestPreferences, toggle);
    } else {
      target.appendChild(guestPreferences);
    }
  }
  placeGuestPreferences();
  window.addEventListener("resize", placeGuestPreferences);
  if (profileMenu) {
    const privacyPath = sitePath("privacy/");
    const privacyLink = Array.from(profileMenu.querySelectorAll(".profile-row-link"))
      .find(link => new URL(link.href, window.location.href).pathname === privacyPath);
    [
      { id: "profileAboutLink", page: "about", key: "aboutNav", text: "About" },
      { id: "profileFaqLink", page: "faq", key: "faqNav", text: "FAQ" }
    ].forEach(({ id, page, key, text }) => {
      if (document.getElementById(id)) return;
      const link = document.createElement("a");
      link.id = id;
      link.className = "profile-row profile-row-link";
      link.href = siteUrl(`${page}/`);
      link.dataset.i18n = key;
      link.dataset.siteI18n = key;
      link.textContent = text;
      if (activePage === page) link.setAttribute("aria-current", "page");
      if (privacyLink) profileMenu.insertBefore(link, privacyLink);
      else profileMenu.appendChild(link);
    });
  }

  if (toggle) {
    const activePaths = {
      home: sitePath(""),
      tasks: sitePath("app/"),
      about: sitePath("about/"),
      faq: sitePath("faq/"),
      settings: sitePath("settings/"),
      privacy: sitePath("privacy/"),
      login: sitePath("login/")
    };
    const primaryPages = ["home", "tasks", "about", "faq"];
    const currentLinks = nav.querySelectorAll(primaryPages.includes(activePage)
      ? ".site-nav-link[href]"
      : ".profile-row-link[href]");
    currentLinks.forEach(link => {
      if (new URL(link.href, window.location.href).pathname === activePaths[activePage]) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    function setExpanded(expanded) {
      nav.classList.toggle("nav-open", expanded);
      toggle.setAttribute("aria-expanded", String(expanded));
      const language = document.documentElement.lang === "th";
      toggle.setAttribute("aria-label", expanded
        ? (language ? "ปิดเมนูนำทาง" : "Close navigation")
        : (language ? "เปิดเมนูนำทาง" : "Open navigation"));
    }

    toggle.addEventListener("click", event => {
      event.stopPropagation();
      setExpanded(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("click", event => {
      if (!nav.contains(event.target)) setExpanded(false);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") setExpanded(false);
    });
  }

  window.setDeadlineAuthenticatedNavigation = isAuthenticated => {
    nav.classList.toggle("nav-authenticated", isAuthenticated);
    const backLink = document.querySelector(".site-back-link");
    if (backLink) backLink.href = siteUrl(isAuthenticated ? "app/" : "");
    actions.querySelectorAll(".site-nav-guest-link").forEach(link => {
      link.hidden = isAuthenticated;
    });
    if (guestPreferences) guestPreferences.hidden = isAuthenticated;
    if (profile) profile.hidden = !isAuthenticated;
    if (profileButton) profileButton.hidden = !isAuthenticated;

    if (isAuthenticated) {
      if (toggle) {
        nav.classList.remove("nav-open");
        toggle.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
      if (primaryLinks) primaryLinks.remove();
    } else {
      if (profileMenu) profileMenu.classList.remove("show");
      if (profileButton) profileButton.setAttribute("aria-expanded", "false");
      if (primaryLinks && !primaryLinks.parentElement) {
        inner.insertBefore(primaryLinks, actions);
      }
      if (toggle) {
        toggle.hidden = false;
        actions.appendChild(toggle);
        toggle.setAttribute("aria-expanded", "false");
      }
    }
    placeGuestPreferences();
  };
  window.setDeadlineAuthenticatedNavigation(false);

  let previousScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (window.matchMedia("(max-width: 768px)").matches) {
      if (currentScrollY <= 24 || currentScrollY < previousScrollY - 2) {
        nav.classList.remove("navbar-hidden");
      } else if (currentScrollY > previousScrollY + 2) {
        nav.classList.add("navbar-hidden");
      }
    } else {
      nav.classList.remove("navbar-hidden");
    }
    previousScrollY = currentScrollY;
  }, { passive: true });
}

const siteTranslations = {
  en: {
    dashboard: "Tasks",
    homeNav: "Home",
    tasksNav: "Tasks",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
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
    signUpTitle: "Sign up",
    loginHeading: "Welcome back",
    loginLead: "Sign in to continue to your deadlines.",
    signUpHeading: "Create your account",
    signUpLead: "Create an account to start organizing your deadlines.",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    signInButton: "Sign in",
    signUpButton: "Create account",
    needAccount: "Don't have an account?",
    signUpLink: "Sign up",
    alreadyAccount: "Already have an account?",
    aboutTitle: "About | Task and Deadline Planner",
    aboutHeading: "Make every deadline manageable.",
    aboutIntro: "Deadline is a simple task and deadline dashboard designed to help you see what needs attention and break work into clear next steps.",
    featureTasksTitle: "See what matters",
    featureTasksText: "Review work in progress, finished tasks, and upcoming deadlines in one place.",
    featureStepsTitle: "Break work into steps",
    featureStepsText: "Add smaller checklist items and track progress as you complete them.",
    featurePersonalTitle: "Make it yours",
    featurePersonalText: "Switch between English and Thai, choose a light or dark theme, and organize work by category.",
    previewTitle: "Current preview",
    previewText: "Deadline uses Supabase for authenticated account access and cloud task storage. Your tasks are isolated to your signed-in account.",
    faqTitle: "FAQ | Tasks and Deadlines",
    faqAddQuestion: "How do I add a task?",
    faqAddAnswer: "Open the Tasks page and select + Add. Enter a title and deadline; category, time, notes, and subtasks are optional.",
    faqProgressQuestion: "How do I mark a task as finished?",
    faqProgressAnswer: "Select the check button on a task card. Use the In progress and Finished tabs to switch between task lists.",
    faqUrgentQuestion: "What does the urgent label mean?",
    faqUrgentAnswer: "It marks an in-progress task whose deadline is within three days.",
    faqThemeQuestion: "How do I change the theme or language?",
    faqThemeAnswer: "Open the profile menu on the Tasks page, then choose a theme or switch between English and Thai.",
    faqLoginQuestion: "How does sign-in work?",
    faqLoginAnswer: "Sign-in uses Supabase Auth. Use the account created for this workspace.",
    faqDataQuestion: "Are my tasks saved to the cloud?",
    faqDataAnswer: "Yes. Tasks are stored in Supabase and protected by per-user access rules.",
    backToTasks: "Back to home",
    footerNote: "A clearer way to keep deadlines in sight.",
    settingsHeading: "Settings",
    appearanceHeading: "Appearance",
    privacyHeading: "Privacy",
    privacyTitle: "Privacy Policy",
    privacyDataHeading: "Your data",
    privacyDataText: "Deadline stores task data in Supabase and associates it with your authenticated account. Theme and language preferences are stored in your browser.",
    privacyControlHeading: "Your control",
    privacyControlText: "You can edit or delete your tasks at any time. Signing out does not delete your tasks. To request account deletion, contact the account administrator.",
    homeTitle: "Task Manager & Deadline Planner",
    homeEyebrow: "YOUR WORK, IN GOOD TIME",
    homeHeadline: "Plan clearly. Finish confidently.",
    homeLead: "A calm, focused space for your tasks and deadlines. See what needs attention, break big work into small steps, and keep moving.",
    homeSignedInLead: "Your workspace is ready. Jump back into your tasks and keep your next deadline in sight.",
    homeCaption: "Simple by design. Useful every day.",
    getStarted: "Get started",
    seePreview: "Explore the preview",
    openDashboard: "Open my dashboard",
    previewSample: "SAMPLE DATA",
    previewDashboard: "Manage deadlines",
    previewUrgent: "≤ 3 days",
    previewAdd: "Add",
    previewSearch: "Search for a schedule",
    previewAll: "All",
    previewTodayFilter: "Today",
    previewOverdue: "Overdue",
    previewJobs: "Jobs",
    previewFreelance: "Freelance",
    previewFinance: "Finance",
    previewDeadline: "Deadline",
    previewOneDayLeft: "1 day left",
    previewFourDaysLeft: "4 days left",
    previewSubtasks: "1 of 2 subtasks",
    previewSubtaskOne: "Outline key ideas",
    previewSubtaskTwo: "Gather sources",
    homeInProgress: "In progress",
    homeFinished: "Finished",
    previewTaskOne: "Research presentation",
    previewTaskOneMeta: "Outline key ideas and gather sources",
    previewTaskTwo: "Weekly team update",
    previewTaskTwoMeta: "Share progress and next steps",
    homeStudy: "STUDY",
    homeWork: "WORK",
    homeClosing: "Make room for the work that matters."
  },
  th: {
    dashboard: "รายการงาน",
    homeNav: "หน้าหลัก",
    tasksNav: "รายการงาน",
    openNavigation: "เปิดเมนูนำทาง",
    closeNavigation: "ปิดเมนูนำทาง",
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
    signUpTitle: "สมัครสมาชิก",
    loginHeading: "ยินดีต้อนรับกลับ",
    loginLead: "เข้าสู่ระบบเพื่อดูรายการกำหนดส่งของคุณ",
    signUpHeading: "สร้างบัญชีของคุณ",
    signUpLead: "สมัครสมาชิกเพื่อเริ่มจัดการกำหนดส่ง",
    email: "อีเมล",
    password: "รหัสผ่าน",
    confirmPassword: "ยืนยันรหัสผ่าน",
    signInButton: "เข้าสู่ระบบ",
    signUpButton: "สร้างบัญชี",
    needAccount: "ยังไม่มีบัญชี?",
    signUpLink: "สมัครสมาชิก",
    alreadyAccount: "มีบัญชีอยู่แล้ว?",
    aboutTitle: "เกี่ยวกับ | จัดการงานและกำหนดส่ง",
    aboutHeading: "จัดการทุกกำหนดส่งให้ชัดเจน",
    aboutIntro: "Deadline คือแดชบอร์ดงานและกำหนดส่งที่ช่วยให้เห็นงานสำคัญและแบ่งงานออกเป็นขั้นตอนที่ทำต่อได้ง่าย",
    featureTasksTitle: "เห็นสิ่งที่สำคัญ",
    featureTasksText: "ดูงานที่กำลังทำ งานที่เสร็จแล้ว และกำหนดส่งที่ใกล้เข้ามาได้ในที่เดียว",
    featureStepsTitle: "แบ่งงานเป็นขั้นตอน",
    featureStepsText: "เพิ่มรายการย่อยและติดตามความคืบหน้าเมื่อทำงานเสร็จ",
    featurePersonalTitle: "ปรับให้เหมาะกับคุณ",
    featurePersonalText: "เลือกภาษาไทยหรืออังกฤษ ใช้ธีมสว่างหรือมืด และจัดงานตามหมวดหมู่",
    previewTitle: "สถานะเวอร์ชันปัจจุบัน",
    previewText: "Deadline ใช้ Supabase สำหรับบัญชีและการเก็บข้อมูลงานบนคลาวด์ โดยแยกงานตามบัญชีที่เข้าสู่ระบบ",
    faqTitle: "คำถามที่พบบ่อย | งานและกำหนดส่ง",
    faqAddQuestion: "เพิ่มงานอย่างไร?",
    faqAddAnswer: "ไปที่หน้ารายการงานแล้วเลือก + Add กรอกหัวข้อและกำหนดส่ง ส่วนหมวดหมู่ เวลา รายละเอียด และงานย่อยเป็นตัวเลือกเสริม",
    faqProgressQuestion: "ทำเครื่องหมายว่างานเสร็จแล้วอย่างไร?",
    faqProgressAnswer: "กดปุ่มเครื่องหมายถูกบนการ์ดงาน แล้วใช้แท็บกำลังทำและเสร็จแล้วเพื่อสลับรายการ",
    faqUrgentQuestion: "ป้ายเร่งด่วนหมายถึงอะไร?",
    faqUrgentAnswer: "แสดงงานที่กำลังทำและมีกำหนดส่งภายในสามวัน",
    faqThemeQuestion: "เปลี่ยนธีมหรือภาษาอย่างไร?",
    faqThemeAnswer: "เปิดเมนูโปรไฟล์ในหน้ารายการงาน แล้วเลือกธีมหรือสลับภาษาไทยและอังกฤษ",
    faqLoginQuestion: "ระบบเข้าสู่ระบบทำงานอย่างไร?",
    faqLoginAnswer: "ระบบเข้าสู่ระบบใช้ Supabase Auth กรุณาใช้บัญชีที่สร้างไว้สำหรับพื้นที่ใช้งานนี้",
    faqDataQuestion: "งานถูกบันทึกบนคลาวด์หรือไม่?",
    faqDataAnswer: "ใช่ ข้อมูลงานถูกเก็บใน Supabase และปกป้องด้วยสิทธิ์แยกตามผู้ใช้",
    backToTasks: "กลับหน้าหลัก",
    footerNote: "มองเห็นทุกกำหนดส่งได้ชัดเจนขึ้น",
    settingsHeading: "การตั้งค่า",
    appearanceHeading: "หน้าตา",
    privacyHeading: "ความเป็นส่วนตัว",
    privacyTitle: "นโยบายความเป็นส่วนตัว",
    privacyDataHeading: "ข้อมูลของคุณ",
    privacyDataText: "Deadline เก็บข้อมูลงานใน Supabase และเชื่อมกับบัญชีที่เข้าสู่ระบบ ธีมและภาษาถูกเก็บในเบราว์เซอร์",
    privacyControlHeading: "สิทธิ์ควบคุมของคุณ",
    privacyControlText: "คุณแก้ไขหรือลบงานได้ทุกเมื่อ การออกจากระบบไม่ได้ลบงาน หากต้องการลบบัญชี โปรดติดต่อผู้ดูแลบัญชี",
    homeTitle: "แอปจัดการงานและกำหนดส่ง",
    homeEyebrow: "จัดการงานให้ทันทุกกำหนด",
    homeHeadline: "วางแผนชัดเจน ทำงานเสร็จอย่างมั่นใจ",
    homeLead: "พื้นที่เรียบง่ายสำหรับจัดการงานและกำหนดส่ง เห็นสิ่งที่ควรทำ แบ่งงานใหญ่เป็นขั้นตอนเล็ก ๆ แล้วเดินหน้าต่อ",
    homeSignedInLead: "พื้นที่ทำงานของคุณพร้อมแล้ว กลับไปดูงานและกำหนดส่งถัดไปได้เลย",
    homeCaption: "เรียบง่ายตั้งใจ ใช้ได้ทุกวัน",
    getStarted: "เริ่มต้นใช้งาน",
    seePreview: "ดูตัวอย่าง",
    openDashboard: "เปิดหน้ารายการงาน",
    previewSample: "ข้อมูลตัวอย่าง",
    previewDashboard: "จัดการกำหนดส่ง",
    previewUrgent: "≤ 3 วัน",
    previewAdd: "เพิ่ม",
    previewSearch: "ค้นหางาน",
    previewAll: "ทั้งหมด",
    previewTodayFilter: "วันนี้",
    previewOverdue: "เลยกำหนด",
    previewJobs: "งาน",
    previewFreelance: "ฟรีแลนซ์",
    previewFinance: "การเงิน",
    previewDeadline: "กำหนดส่ง",
    previewOneDayLeft: "เหลือ 1 วัน",
    previewFourDaysLeft: "เหลือ 4 วัน",
    previewSubtasks: "ทำแล้ว 1 จาก 2 ขั้นตอน",
    previewSubtaskOne: "วางโครงเรื่อง",
    previewSubtaskTwo: "รวบรวมแหล่งข้อมูล",
    homeInProgress: "กำลังทำ",
    homeFinished: "เสร็จแล้ว",
    previewTaskOne: "เตรียมงานนำเสนอ",
    previewTaskOneMeta: "วางโครงเรื่องและรวบรวมแหล่งข้อมูล",
    previewTaskTwo: "สรุปความคืบหน้าทีม",
    previewTaskTwoMeta: "แจ้งความคืบหน้าและขั้นตอนถัดไป",
    homeStudy: "เรียน",
    homeWork: "งาน",
    homeClosing: "มีพื้นที่ให้กับงานที่สำคัญ"
  }
};

let siteLanguage = localStorage.getItem("deadline-language") === "th" ? "th" : "en";
const systemThemePreference = window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

function getThemePreference() {
  const savedTheme = localStorage.getItem("deadline-theme");
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return systemThemePreference && systemThemePreference.matches ? "dark" : "light";
}

function applyDocumentTheme(theme) {
  document.documentElement.style.colorScheme = theme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = theme === "dark" ? "#000000" : "#F2F2F7";
}

let siteTheme = getThemePreference();
window.deadlineGetThemePreference = getThemePreference;
window.deadlineApplyDocumentTheme = applyDocumentTheme;

function applyLogoTheme(theme) {
  document.querySelectorAll(".logo img, .login-brand img").forEach(image => {
    const lightSource = image.dataset.lightSource || image.getAttribute("src");
    image.dataset.lightSource = lightSource;
    image.src = theme === "dark"
      ? lightSource.replace(/Deadline-512\.png(?=([?#]|$))/, "Deadline-white-512.png")
      : lightSource;
  });
}

window.deadlineApplyLogoTheme = applyLogoTheme;

function siteText(key) {
  return siteTranslations[siteLanguage][key];
}

function updatePreviewDates() {
  const previewDates = [
    { offset: 1, day: "previewDayOne", month: "previewMonthOne", year: "previewYearOne" },
    { offset: 4, day: "previewDayTwo", month: "previewMonthTwo", year: "previewYearTwo" }
  ];
  const locale = siteLanguage === "th" ? "th-TH" : "en-US";
  const currentDate = document.getElementById("previewCurrentDate");
  if (currentDate) {
    currentDate.textContent = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(new Date());
  }

  previewDates.forEach(({ offset, day, month, year }) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const dayElement = document.getElementById(day);
    const monthElement = document.getElementById(month);
    const yearElement = document.getElementById(year);
    if (dayElement) dayElement.textContent = new Intl.DateTimeFormat(locale, { day: "numeric" }).format(date);
    if (monthElement) monthElement.textContent = new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
    if (yearElement) yearElement.textContent = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(date);
  });
}

function applySitePreferences() {
  document.documentElement.lang = siteLanguage;
  applyDocumentTheme(siteTheme);
  document.body.classList.toggle("dark-mode", siteTheme === "dark");
  applyLogoTheme(siteTheme);
  document.querySelectorAll("[data-site-i18n]").forEach(element => {
    element.textContent = siteText(element.dataset.siteI18n);
  });
  updatePreviewDates();

  const titleKey = document.body.dataset.siteTitle;
  if (titleKey) document.title = `Deadline. - ${siteText(titleKey)}`;

  const themeState = document.getElementById("themeState");
  const languageState = document.getElementById("languageState");
  const profileButton = document.getElementById("btnProfile");
  if (themeState) themeState.textContent = siteText(siteTheme);
  if (languageState) languageState.textContent = siteText("languageName");
  if (profileButton) profileButton.setAttribute("aria-label", siteText("openProfileMenu"));
  document.querySelectorAll("[data-site-i18n-aria-label]").forEach(element => {
    element.setAttribute("aria-label", siteText(element.dataset.siteI18nAriaLabel));
  });
  document.querySelectorAll("[data-site-i18n-title]").forEach(element => {
    element.title = siteText(element.dataset.siteI18nTitle);
  });
  const navToggle = document.getElementById("siteNavToggle");
  if (navToggle) {
    navToggle.setAttribute("aria-label", navToggle.getAttribute("aria-expanded") === "true"
      ? siteText("closeNavigation")
      : siteText("openNavigation"));
  }
  window.dispatchEvent(new Event("deadline-preferences-changed"));
}

function installActionConfirmation() {
  let modal = document.getElementById("actionConfirmModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "modal-overlay confirmation-overlay";
    modal.id = "actionConfirmModal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <section class="modal-content confirmation-content" role="dialog" aria-modal="true" aria-labelledby="actionConfirmTitle" aria-describedby="actionConfirmMessage">
        <div class="modal-header">
          <h3 id="actionConfirmTitle"></h3>
          <button type="button" class="btn-close-modal" id="actionConfirmClose">&times;</button>
        </div>
        <p class="confirmation-message" id="actionConfirmMessage"></p>
        <div class="modal-footer">
          <button type="button" class="btn-cancel" id="actionConfirmCancel"></button>
          <button type="button" class="btn-submit" id="actionConfirmAccept"></button>
        </div>
      </section>`;
    document.body.appendChild(modal);
  }

  const title = document.getElementById("actionConfirmTitle");
  const message = document.getElementById("actionConfirmMessage");
  const closeButton = document.getElementById("actionConfirmClose");
  const cancelButton = document.getElementById("actionConfirmCancel");
  const confirmButton = document.getElementById("actionConfirmAccept");
  let resolveConfirmation = null;
  let previousFocus = null;
  let previousModalOpen = false;
  let previousScrollY = 0;
  let previousBodyTop = "";
  let previousBodyPaddingRight = "";

  function close(confirmed) {
    if (!resolveConfirmation) return;
    const resolve = resolveConfirmation;
    resolveConfirmation = null;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    const taskModal = document.getElementById("addModal");
    if (taskModal && taskModal.classList.contains("show")) taskModal.setAttribute("aria-hidden", "false");
    if (!previousModalOpen) {
      document.body.classList.remove("modal-open");
      document.body.style.top = previousBodyTop;
      document.body.style.paddingRight = previousBodyPaddingRight;
      window.scrollTo(0, previousScrollY);
    }
    previousModalOpen = false;
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
    previousFocus = null;
    resolve(confirmed);
  }

  closeButton.setAttribute("aria-label", document.documentElement.lang === "th" ? "ปิด" : "Close");
  closeButton.addEventListener("click", () => close(false));
  cancelButton.addEventListener("click", () => close(false));
  confirmButton.addEventListener("click", () => close(true));
  modal.addEventListener("click", event => {
    if (event.target === modal) close(false);
  });
  document.addEventListener("keydown", event => {
    if (!modal.classList.contains("show")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close(false);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = Array.from(modal.querySelectorAll("button:not(:disabled)"));
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

  window.deadlineConfirmAction = ({ title: dialogTitle, message: dialogMessage, confirmLabel, cancelLabel, destructive = false }) => {
    if (resolveConfirmation) throw new Error("An action confirmation is already open.");
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previousModalOpen = document.body.classList.contains("modal-open");
    previousScrollY = window.scrollY;
    previousBodyTop = document.body.style.top;
    previousBodyPaddingRight = document.body.style.paddingRight;
    if (!previousModalOpen) {
      const isDesktop = window.matchMedia("(min-width: 769px)").matches;
      const scrollbarWidth = isDesktop ? 0 : window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.classList.add("modal-open");
      document.body.style.top = `-${previousScrollY}px`;
    }

    title.textContent = dialogTitle;
    message.textContent = dialogMessage;
    closeButton.setAttribute("aria-label", document.documentElement.lang === "th" ? "ปิด" : "Close");
    cancelButton.textContent = cancelLabel;
    confirmButton.textContent = confirmLabel;
    confirmButton.classList.toggle("confirmation-destructive", destructive);
    const taskModal = document.getElementById("addModal");
    if (taskModal && taskModal.classList.contains("show")) taskModal.setAttribute("aria-hidden", "true");
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    return new Promise(resolve => {
      resolveConfirmation = resolve;
      requestAnimationFrame(() => cancelButton.focus());
    });
  };
}

installActionConfirmation();

const isDashboard = document.body.dataset.authPage === "dashboard";
if (!isDashboard && systemThemePreference) {
  const syncSystemTheme = event => {
    const savedTheme = localStorage.getItem("deadline-theme");
    if (savedTheme === "dark" || savedTheme === "light") return;
    siteTheme = event.matches ? "dark" : "light";
    applySitePreferences();
  };
  if (systemThemePreference.addEventListener) {
    systemThemePreference.addEventListener("change", syncSystemTheme);
  } else if (systemThemePreference.addListener) {
    systemThemePreference.addListener(syncSystemTheme);
  }
}
const guestThemeToggle = document.getElementById("guestThemeToggle");
const guestLanguageToggle = document.getElementById("guestLanguageToggle");
if (guestThemeToggle) guestThemeToggle.addEventListener("click", () => {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.click();
});
if (guestLanguageToggle) guestLanguageToggle.addEventListener("click", () => {
  const languageToggle = document.getElementById("languageToggle");
  if (languageToggle) languageToggle.click();
});

if (!isDashboard) {
  const themeToggle = document.getElementById("themeToggle");
  const languageToggle = document.getElementById("languageToggle");
  if (themeToggle) themeToggle.addEventListener("click", () => {
    siteTheme = siteTheme === "light" ? "dark" : "light";
    localStorage.setItem("deadline-theme", siteTheme);
    applySitePreferences();
  });

  if (languageToggle) languageToggle.addEventListener("click", () => {
    siteLanguage = siteLanguage === "en" ? "th" : "en";
    localStorage.setItem("deadline-language", siteLanguage);
    applySitePreferences();
  });

  const profileButton = document.getElementById("btnProfile");
  const profileMenu = document.getElementById("profileMenu");
  if (profileButton && profileMenu) profileButton.addEventListener("click", event => {
    event.stopPropagation();
    const isOpen = profileMenu.classList.toggle("show");
    profileButton.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", event => {
    const confirmationModal = document.getElementById("actionConfirmModal");
    if (confirmationModal && confirmationModal.contains(event.target)) return;
    if (profileMenu && profileButton && !profileMenu.contains(event.target) && !profileButton.contains(event.target)) {
      profileMenu.classList.remove("show");
      profileButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (profileMenu) profileMenu.classList.remove("show");
      if (profileButton) profileButton.setAttribute("aria-expanded", "false");
    }
  });

  applySitePreferences();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(siteUrl("sw.js")).catch(error => {
        console.error("Service worker registration failed:", error);
      });
    });
  }
}
})();
