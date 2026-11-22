(() => {
  const config = window.DEADLINE_SUPABASE_CONFIG || {};
  const supabaseUrl = typeof config.url === "string" ? config.url.trim() : "";
  const publishableKey = typeof config.publishableKey === "string" ? config.publishableKey.trim() : "";
  const authPage = document.body.dataset.authPage;
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginSubmit");
  const status = authPage === "login"
    ? document.getElementById("authStatus")
    : authPage === "landing"
      ? document.getElementById("landingAuthStatus")
      : document.getElementById("taskOperationStatus") || document.getElementById("authStatus");
  const accountEmail = document.getElementById("accountEmail");
  const loginMenuLink = document.getElementById("loginMenuLink");
  const signOutButton = document.getElementById("signOutButton");
  const landingLoginLink = document.getElementById("landingLoginLink");
  const landingDashboardLink = document.getElementById("landingDashboardLink");
  const tasksNavLink = document.getElementById("tasksNavLink");

  const messages = {
    en: {
      configMissing: "Supabase isn't configured yet. Add the project URL and publishable key to supabase-config.js. Sign-in needs an HTTP(S) site URL.",
      sdkMissing: "Couldn't load the Supabase client. Check your connection and reload.",
      sessionFailed: "Couldn't verify your session.",
      signingIn: "Signing in...",
      signInFailed: "Sign-in failed.",
      noSession: "Supabase didn't return a session. Check your Auth settings.",
      signOutFailed: "Sign-out failed.",
      authUnavailable: "Couldn't connect to Supabase. Check the project URL and network, then try again."
    },
    th: {
      configMissing: "ยังไม่ได้ตั้งค่า Supabase กรุณาใส่ Project URL และ Publishable key ใน supabase-config.js และเปิดเว็บผ่าน HTTP(S)",
      sdkMissing: "โหลด Supabase client ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วโหลดหน้าใหม่",
      sessionFailed: "ตรวจสอบสถานะการเข้าสู่ระบบไม่สำเร็จ",
      signingIn: "กำลังเข้าสู่ระบบ...",
      signInFailed: "เข้าสู่ระบบไม่สำเร็จ",
      noSession: "Supabase ไม่ได้ส่ง session กลับมา กรุณาตรวจสอบการตั้งค่า Auth",
      signOutFailed: "ออกจากระบบไม่สำเร็จ",
      authUnavailable: "เชื่อมต่อ Supabase ไม่สำเร็จ กรุณาตรวจสอบ Project URL และเครือข่าย"
    }
  };

  const language = () => document.documentElement.lang === "th" ? "th" : "en";
  const message = key => messages[language()][key];

  function showStatus(text, kind = "error") {
    if (!status) return;
    status.hidden = false;
    status.dataset.kind = kind;
    status.textContent = text;
  }

  function setLoginReady(ready) {
    if (loginButton) loginButton.disabled = !ready;
  }

  function redirectToLogin(reason) {
    const loginPath = authPage === "dashboard" ? "../login/" : "../login/";
    const loginUrl = new URL(loginPath, window.location.href);
    if (reason) loginUrl.searchParams.set("reason", reason);
    window.location.replace(loginUrl.href);
  }

  function redirectToDashboard() {
    window.location.replace(new URL("/app/", window.location.origin).href);
  }

  function redirectToHome() {
    window.location.replace(new URL("/", window.location.origin).href);
  }

  function applyUserProfile(user) {
    const metadata = user.user_metadata || {};
    const identityImage = (user.identities || [])
      .map(identity => identity.identity_data && (identity.identity_data.avatar_url || identity.identity_data.picture))
      .find(Boolean);
    const imageUrl = metadata.avatar_url || metadata.picture || metadata.profile_image_url || metadata.avatar || identityImage;
    if (typeof imageUrl === "string" && imageUrl.trim()) {
      try {
        const parsed = new URL(imageUrl, window.location.href);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          document.querySelectorAll(".avatar-img").forEach(image => {
            if (!image.dataset.fallbackSrc) image.dataset.fallbackSrc = image.getAttribute("src") || "";
            image.onerror = () => {
              image.onerror = null;
              if (image.dataset.fallbackSrc) image.src = image.dataset.fallbackSrc;
            };
            image.src = parsed.href;
          });
        }
      } catch (error) {
        console.warn("Ignoring invalid profile image URL.");
      }
    }

    document.querySelectorAll(".avatar-img").forEach(image => {
      image.alt = metadata.full_name || metadata.name || user.email || "User profile";
    });

    const greeting = document.getElementById("landingGreeting");
    if (greeting) {
      const name = metadata.full_name || metadata.name || metadata.nickname || (user.email || "").split("@")[0];
      greeting.textContent = `${language() === "th" ? "ยินดีต้อนรับกลับ" : "Welcome back"}, ${name}`;
    }
  }

  function setAuthenticatedNavigation(isAuthenticated) {
    if (typeof window.setDeadlineAuthenticatedNavigation === "function") {
      window.setDeadlineAuthenticatedNavigation(isAuthenticated);
    }
    if (loginMenuLink) loginMenuLink.hidden = isAuthenticated;
    if (signOutButton) signOutButton.hidden = !isAuthenticated;
  }

  function updateLandingView(isAuthenticated) {
    setAuthenticatedNavigation(isAuthenticated);
    document.querySelectorAll("[data-auth-view='guest']").forEach(element => {
      element.hidden = isAuthenticated;
    });
    document.querySelectorAll("[data-auth-view='authenticated']").forEach(element => {
      element.hidden = !isAuthenticated;
    });
    if (landingLoginLink) landingLoginLink.hidden = isAuthenticated;
    if (landingDashboardLink) landingDashboardLink.hidden = !isAuthenticated;
    if (tasksNavLink) tasksNavLink.href = isAuthenticated ? "/app/" : "/login/";
    if (!isAuthenticated) {
      window.deadlineUser = null;
      if (accountEmail) {
        accountEmail.dataset.siteI18n = "previewAccount";
        accountEmail.textContent = language() === "th" ? "โหมดตัวอย่าง (ยังไม่ได้เข้าสู่ระบบ)" : "Preview mode (not authenticated)";
      }
      if (signOutButton) signOutButton.hidden = true;
      document.querySelectorAll(".avatar-img").forEach(image => {
        image.onerror = null;
        if (image.dataset.fallbackSrc) image.src = image.dataset.fallbackSrc;
        image.alt = "User profile";
      });
    }
  }

  function loadSupabaseSdk() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return Promise.resolve();
    }

    const sources = [
      "/Asset/supabase-js-2.119.2.js",
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/dist/umd/supabase.js",
      "https://unpkg.com/@supabase/supabase-js@2.119.2/dist/umd/supabase.js"
    ];
    const failures = [];

    function loadSource(index) {
      if (index >= sources.length) {
        return Promise.reject(new Error(`${message("sdkMissing")} ${failures.join(" ")}`));
      }

      return new Promise(resolve => {
        const script = document.createElement("script");
        script.src = sources[index];
        script.onload = () => {
          if (window.supabase && typeof window.supabase.createClient === "function") {
            resolve(true);
            return;
          }
          failures.push(`Loaded ${sources[index]} without the expected Supabase API.`);
          script.remove();
          resolve(false);
        };
        script.onerror = () => {
          failures.push(`Could not load ${sources[index]}.`);
          script.remove();
          resolve(false);
        };
        document.head.appendChild(script);
      }).then(loaded => {
        if (loaded) return;
        if (index + 1 < sources.length) {
          console.warn("Supabase SDK source failed; trying the next source.");
        }
        return loadSource(index + 1);
      });
    }

    return loadSource(0);
  }

  if (!supabaseUrl || !publishableKey) {
    if (loginForm) {
      showStatus(message("configMissing"));
      setLoginReady(false);
    } else if (authPage === "dashboard") {
      redirectToLogin("config-missing");
    }
    return;
  }

  loadSupabaseSdk()
    .then(() => {
      const client = window.supabase.createClient(supabaseUrl, publishableKey);
      window.deadlineSupabase = client;
      return initializeAuth(client);
    })
    .catch(error => {
      console.error("Supabase initialization failed:", error);
      if (authPage === "dashboard") {
        redirectToLogin("auth-unavailable");
        return;
      }
      showStatus(message("authUnavailable"));
      if (loginForm) setLoginReady(false);
    });

  async function initializeAuth(client) {
    let session;
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      session = data.session;
    } catch (error) {
      console.error("Supabase session check failed:", error);
      if (authPage === "dashboard") {
        redirectToLogin("auth-unavailable");
        return;
      }
      showStatus(message("sessionFailed"));
      setLoginReady(false);
      return;
    }

    if (loginForm) {
      if (session) {
        redirectToDashboard();
        return;
      }
      const reason = new URLSearchParams(window.location.search).get("reason");
      if (reason === "auth-unavailable") showStatus(message("authUnavailable"));
      setLoginReady(true);
      loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        setLoginReady(false);
        showStatus(message("signingIn"), "pending");

        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: document.getElementById("loginEmail").value.trim(),
            password: document.getElementById("loginPassword").value
          });
          if (error) {
            showStatus(`${message("signInFailed")} ${error.message}`);
          } else if (data.session) {
            redirectToDashboard();
          } else {
            showStatus(message("noSession"));
          }
        } catch (error) {
          console.error("Supabase sign-in failed:", error);
          showStatus(`${message("signInFailed")} ${error.message || ""}`);
        } finally {
          setLoginReady(true);
        }
      });
      return;
    }

    setAuthenticatedNavigation(Boolean(session));

    if (authPage === "dashboard" && !session) {
      redirectToHome();
      return;
    }

    if (authPage === "landing") updateLandingView(Boolean(session));
    else if (tasksNavLink && authPage !== "dashboard") {
      tasksNavLink.href = session ? "/app/" : "/login/";
    }

    if (session) {
      window.deadlineUser = session.user;
      if (authPage === "dashboard") {
        if (typeof window.loadDeadlineTasks === "function") {
          await window.loadDeadlineTasks(client, session.user);
        }
        if (typeof window.subscribeDeadlineTasks === "function") {
          window.subscribeDeadlineTasks(client, session.user);
        }
      }

      if (accountEmail) {
        accountEmail.removeAttribute("data-i18n");
        accountEmail.removeAttribute("data-site-i18n");
        accountEmail.textContent = session.user.email || session.user.id;
      }
      applyUserProfile(session.user);
      if (loginMenuLink) loginMenuLink.hidden = true;
      if (signOutButton) signOutButton.hidden = false;
    }

    if (signOutButton && session) {
      signOutButton.addEventListener("click", async () => {
        signOutButton.disabled = true;
        try {
          const { error } = await client.auth.signOut();
          if (error) throw error;
          redirectToHome();
        } catch (error) {
          console.error("Supabase sign-out failed:", error);
          showStatus(`${message("signOutFailed")} ${error.message || ""}`);
        } finally {
          signOutButton.disabled = false;
        }
      });
    }

    client.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_OUT" || !nextSession) {
        setAuthenticatedNavigation(false);
        if (authPage === "dashboard") redirectToHome();
        if (authPage === "landing") updateLandingView(false);
        else if (tasksNavLink && authPage !== "dashboard") tasksNavLink.href = "/login/";
      }
      if (event === "SIGNED_IN" && nextSession) {
        setAuthenticatedNavigation(true);
        if (authPage === "landing") updateLandingView(true);
        else if (tasksNavLink && authPage !== "dashboard") tasksNavLink.href = "/app/";
        applyUserProfile(nextSession.user);
      }
      if (event === "TOKEN_REFRESHED" && nextSession) {
        window.deadlineUser = nextSession.user;
        applyUserProfile(nextSession.user);
      }
    });

    window.addEventListener("deadline-preferences-changed", () => {
      if (window.deadlineUser) applyUserProfile(window.deadlineUser);
    });
  }
})();
