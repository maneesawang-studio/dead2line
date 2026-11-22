(() => {
  const config = window.DEADLINE_SUPABASE_CONFIG || {};
  const supabaseUrl = typeof config.url === "string" ? config.url.trim() : "";
  const publishableKey = typeof config.publishableKey === "string" ? config.publishableKey.trim() : "";
  const authPage = document.body.dataset.authPage;
  const loginForm = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginSubmit");
  const status = document.getElementById("loginStatus") || document.getElementById("authStatus");
  const accountEmail = document.getElementById("accountEmail");
  const loginMenuLink = document.getElementById("loginMenuLink");
  const signOutButton = document.getElementById("signOutButton");

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
    window.location.replace(new URL("../", window.location.href).href);
  }

  function loadSupabaseSdk() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.onload = () => {
        if (window.supabase && typeof window.supabase.createClient === "function") {
          resolve();
        } else {
          reject(new Error(message("sdkMissing")));
        }
      };
      script.onerror = () => reject(new Error(message("sdkMissing")));
      document.head.appendChild(script);
    });
  }

  if (!supabaseUrl || !publishableKey) {
    if (loginForm) {
      showStatus(message("configMissing"));
      setLoginReady(false);
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
      showStatus(`${message("authUnavailable")} ${error.message}`);
      setLoginReady(false);
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
      showStatus(`${message("sessionFailed")} ${error.message || ""}`);
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

    if (authPage === "dashboard" && !session) {
      redirectToLogin();
      return;
    }

    if (session) {
      if (authPage === "dashboard") {
        window.deadlineUser = session.user;
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
      if (loginMenuLink) loginMenuLink.hidden = true;
      if (signOutButton) signOutButton.hidden = false;
    }

    if (signOutButton && session) {
      signOutButton.addEventListener("click", async () => {
        signOutButton.disabled = true;
        try {
          const { error } = await client.auth.signOut();
          if (error) throw error;
          redirectToLogin();
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
        if (authPage === "dashboard") redirectToLogin("session-ended");
      }
      if (event === "TOKEN_REFRESHED" && nextSession) {
        window.deadlineUser = nextSession.user;
      }
    });
  }
})();
