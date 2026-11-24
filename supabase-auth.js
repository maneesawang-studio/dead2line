(() => {
  const scriptUrl = document.currentScript && document.currentScript.src;
  const siteRoot = new URL("./", scriptUrl || document.baseURI);
  const siteUrl = path => typeof window.deadlineSiteUrl === "function"
    ? window.deadlineSiteUrl(path)
    : new URL(String(path || "").replace(/^\/+/, ""), siteRoot).href;
  const config = window.DEADLINE_SUPABASE_CONFIG || {};
  const publicSiteUrl = typeof config.siteUrl === "string" ? config.siteUrl.trim() : "";
  const supabaseUrl = typeof config.url === "string" ? config.url.trim() : "";
  const publishableKey = typeof config.publishableKey === "string" ? config.publishableKey.trim() : "";
  const authPage = document.body.dataset.authPage;
  const loginForm = document.getElementById("loginForm");
  const signUpForm = document.getElementById("signUpForm");
  const loginButton = document.getElementById("loginSubmit");
  const signUpButton = document.getElementById("signUpSubmit");
  const resendConfirmationButton = document.getElementById("resendConfirmation");
  const status = authPage === "login" || authPage === "signup"
    ? document.getElementById("authStatus")
    : authPage === "landing"
      ? document.getElementById("landingAuthStatus")
      : document.getElementById("taskOperationStatus") || document.getElementById("profileAuthStatus") || document.getElementById("authStatus");
  const accountEmail = document.getElementById("accountEmail");
  const loginMenuLink = document.getElementById("loginMenuLink");
  const signOutButton = document.getElementById("signOutButton");
  const landingLoginLink = document.getElementById("landingLoginLink");
  const landingDashboardLink = document.getElementById("landingDashboardLink");
  const tasksNavLink = document.getElementById("tasksNavLink");
  let landingGreetingUser = null;

  const messages = {
    en: {
      landingGreeting: "Hello, {name}",
      configMissing: "Sign-in isn't configured. Add the Supabase project URL and publishable key to supabase-config.js, then open the site over HTTP(S).",
      sdkMissing: "We couldn't load the sign-in service. Check your connection and try again.",
      sessionFailed: "We couldn't verify your sign-in. Refresh the page and try again.",
      signingIn: "Signing in...",
      signInFailed: "Couldn't sign in.",
      signingUp: "Creating your account...",
      signUpFailed: "Couldn't create your account.",
      passwordMismatch: "The passwords don't match.",
      signUpCheckEmail: "Account created. Check your email and follow the confirmation link to continue.",
      emailConfirmed: "Email confirmed. You can now sign in.",
      emailConfirmSessionFailed: "Email confirmed, but we couldn't reset your sign-in. Refresh the page before signing in.",
      emailLinkExpired: "This confirmation link is invalid or has expired. Enter your email above and request a new confirmation email.",
      resendConfirmation: "Resend confirmation email",
      resendingConfirmation: "Sending a new confirmation email...",
      confirmationResent: "A new confirmation email has been sent. Check your inbox.",
      resendConfirmationFailed: "Couldn't resend the confirmation email.",
      signUpMissingUser: "We couldn't retrieve your new account. Please try again.",
      noSession: "Your account was created, but sign-in didn't complete. Please try signing in again.",
      signOutFailed: "Couldn't sign out.",
      signOutConfirmTitle: "Sign out?",
      signOutConfirmMessage: "You'll need to sign in again to view your tasks.",
      confirmSignOut: "Sign out",
      cancel: "Cancel",
      authUnavailable: "We couldn't connect to the sign-in service. Check your connection and try again."
    },
    th: {
      landingGreeting: "สวัสดี {name}",
      configMissing: "ยังไม่ได้ตั้งค่าระบบเข้าสู่ระบบ กรุณาตรวจสอบ Project URL และ Publishable key ใน supabase-config.js แล้วเปิดเว็บผ่าน HTTP(S)",
      sdkMissing: "โหลดระบบเข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง",
      sessionFailed: "ตรวจสอบสถานะการเข้าสู่ระบบไม่สำเร็จ กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง",
      signingIn: "กำลังเข้าสู่ระบบ...",
      signInFailed: "เข้าสู่ระบบไม่สำเร็จ",
      signingUp: "กำลังสร้างบัญชี...",
      signUpFailed: "สร้างบัญชีไม่สำเร็จ",
      passwordMismatch: "รหัสผ่านทั้งสองช่องไม่ตรงกัน",
      signUpCheckEmail: "สร้างบัญชีแล้ว กรุณาตรวจสอบอีเมลและกดลิงก์ยืนยันเพื่อดำเนินการต่อ",
      emailConfirmed: "ยืนยันอีเมลแล้ว คุณสามารถเข้าสู่ระบบได้เลย",
      emailConfirmSessionFailed: "ยืนยันอีเมลแล้ว แต่เตรียมสถานะเข้าสู่ระบบไม่สำเร็จ กรุณาโหลดหน้าใหม่ก่อนเข้าสู่ระบบ",
      emailLinkExpired: "ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว กรุณากรอกอีเมลด้านบนเพื่อขอลิงก์ยืนยันใหม่",
      resendConfirmation: "ส่งลิงก์ยืนยันอีกครั้ง",
      resendingConfirmation: "กำลังส่งอีเมลยืนยันใหม่...",
      confirmationResent: "ส่งอีเมลยืนยันใหม่แล้ว กรุณาตรวจสอบกล่องจดหมาย",
      resendConfirmationFailed: "ส่งอีเมลยืนยันใหม่ไม่สำเร็จ",
      signUpMissingUser: "เรียกดูข้อมูลบัญชีใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง",
      noSession: "สร้างบัญชีแล้ว แต่เข้าสู่ระบบไม่สำเร็จ กรุณาลองเข้าสู่ระบบอีกครั้ง",
      signOutFailed: "ออกจากระบบไม่สำเร็จ",
      signOutConfirmTitle: "ต้องการออกจากระบบหรือไม่?",
      signOutConfirmMessage: "คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อดูงาน",
      confirmSignOut: "ออกจากระบบ",
      cancel: "ยกเลิก",
      authUnavailable: "เชื่อมต่อระบบเข้าสู่ระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง"
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

  function setAuthReady(ready) {
    if (loginButton) loginButton.disabled = !ready;
    if (signUpButton) signUpButton.disabled = !ready;
  }

  function redirectToLogin(reason) {
    const loginUrl = new URL(siteUrl("login/"));
    if (reason) loginUrl.searchParams.set("reason", reason);
    window.location.replace(loginUrl.href);
  }

  function redirectToDashboard() {
    const dashboardUrl = siteUrl("app/");
    window.location.replace(dashboardUrl);
  }

  function redirectToHome() {
    window.location.replace(siteUrl(""));
  }

  function updateLandingGreeting(user) {
    const greeting = document.getElementById("landingGreeting");
    if (!greeting) return;

    landingGreetingUser = user;
    const metadata = user.user_metadata || {};
    const name = metadata.full_name || metadata.name || metadata.nickname || (user.email || "").split("@")[0];
    greeting.textContent = message("landingGreeting").replace("{name}", name);
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
    if (tasksNavLink) tasksNavLink.href = siteUrl(isAuthenticated ? "app/" : "login/");
    if (!isAuthenticated) {
      landingGreetingUser = null;
      window.deadlineUser = null;
      if (accountEmail) {
        accountEmail.dataset.siteI18n = "previewAccount";
        accountEmail.textContent = message("previewAccount");
      }
      if (signOutButton) signOutButton.hidden = true;
    }
  }

  function loadSupabaseSdk() {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      return Promise.resolve();
    }

    const sources = [
      siteUrl("Asset/supabase-js-2.119.2.js"),
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
    if (loginForm || signUpForm) {
      showStatus(message("configMissing"));
      setAuthReady(false);
    } else if (authPage === "dashboard") {
      redirectToLogin("config-missing");
    }
    return;
  }

  function initializeSupabase() {
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
        if (loginForm || signUpForm) setAuthReady(false);
      });
  }

  if (authPage === "landing" || authPage === "public") {
    if (document.readyState === "complete") {
      initializeSupabase();
    } else {
      window.addEventListener("load", initializeSupabase, { once: true });
    }
  } else {
    initializeSupabase();
  }

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
      setAuthReady(false);
      return;
    }

    if (loginForm || signUpForm) {
      const callbackError = new URLSearchParams(window.location.hash.slice(1));
      const expiredEmailLink = callbackError.get("error_code") === "otp_expired";
      if (callbackError.has("error")) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }

      const loginReason = new URLSearchParams(window.location.search).get("reason");
      if (loginForm && loginReason === "email-confirmed") {
        if (session) {
          try {
            const { error } = await client.auth.signOut();
            if (error) throw error;
            session = null;
          } catch (error) {
            console.error("Could not clear the session after email confirmation:", error);
            showStatus(message("emailConfirmSessionFailed"));
            setAuthReady(false);
            return;
          }
        }
        window.history.replaceState(null, "", window.location.pathname);
        showStatus(message("emailConfirmed"), "success");
      }

      if (session) {
        redirectToDashboard();
        return;
      }
      if (loginForm && resendConfirmationButton) {
        resendConfirmationButton.hidden = false;
        resendConfirmationButton.textContent = message("resendConfirmation");
      }
      if (expiredEmailLink && loginForm) {
        showStatus(message("emailLinkExpired"));
      }
      if (loginReason === "auth-unavailable" && loginForm) showStatus(message("authUnavailable"));
      setAuthReady(true);

      if (loginForm) {
        if (resendConfirmationButton) {
          resendConfirmationButton.addEventListener("click", async () => {
            const emailInput = document.getElementById("loginEmail");
            if (!emailInput.reportValidity()) return;

            resendConfirmationButton.disabled = true;
            showStatus(message("resendingConfirmation"), "pending");
            try {
              const { error } = await client.auth.resend({
                type: "signup",
                email: emailInput.value.trim(),
                options: {
                  emailRedirectTo: new URL("login/?reason=email-confirmed", publicSiteUrl).href
                }
              });
              if (error) throw error;
              showStatus(message("confirmationResent"), "success");
            } catch (error) {
              console.error("Supabase confirmation email resend failed:", error);
              showStatus(`${message("resendConfirmationFailed")} ${error.message || ""}`);
            } finally {
              resendConfirmationButton.disabled = false;
            }
          });
        }

        loginForm.addEventListener("submit", async event => {
          event.preventDefault();
          setAuthReady(false);
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
            setAuthReady(true);
          }
        });
      }

      if (signUpForm) {
        signUpForm.addEventListener("submit", async event => {
          event.preventDefault();
          const email = document.getElementById("signUpEmail").value.trim();
          const password = document.getElementById("signUpPassword").value;
          const passwordConfirm = document.getElementById("signUpPasswordConfirm").value;
          if (password !== passwordConfirm) {
            showStatus(message("passwordMismatch"));
            return;
          }

          setAuthReady(false);
          showStatus(message("signingUp"), "pending");
          try {
            const { data, error } = await client.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: new URL("login/?reason=email-confirmed", publicSiteUrl).href
              }
            });
            if (error) throw error;
            if (data && data.session) {
              redirectToDashboard();
            } else if (data && data.user) {
              showStatus(message("signUpCheckEmail"), "success");
            } else {
              throw new Error(message("signUpMissingUser"));
            }
          } catch (error) {
            console.error("Supabase sign-up failed:", error);
            showStatus(`${message("signUpFailed")} ${error.message || ""}`);
          } finally {
            setAuthReady(true);
          }
        });
      }

      return;
    }

    setAuthenticatedNavigation(Boolean(session));

    if (authPage === "dashboard" && !session) {
      redirectToHome();
      return;
    }

    if (authPage === "landing" && session) {
      const isStandaloneApp = (
        typeof window.matchMedia === "function" &&
        window.matchMedia("(display-mode: standalone)").matches
      ) || Boolean(window.navigator && window.navigator.standalone);
      if (isStandaloneApp) {
        redirectToDashboard();
        return;
      }
      updateLandingView(true);
    } else if (authPage === "landing") updateLandingView(false);
    else if (tasksNavLink && authPage !== "dashboard") {
      tasksNavLink.href = siteUrl(session ? "app/" : "login/");
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
      updateLandingGreeting(session.user);
      if (loginMenuLink) loginMenuLink.hidden = true;
      if (signOutButton) signOutButton.hidden = false;
    }

    if (signOutButton && session) {
      signOutButton.addEventListener("click", async () => {
        if (typeof window.deadlineConfirmAction !== "function") {
          console.error("The shared confirmation dialog is unavailable.");
          showStatus(message("signOutFailed"));
          return;
        }
        const confirmed = await window.deadlineConfirmAction({
          title: message("signOutConfirmTitle"),
          message: message("signOutConfirmMessage"),
          confirmLabel: message("confirmSignOut"),
          cancelLabel: message("cancel"),
          destructive: true
        });
        if (!confirmed) return;

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
        else if (tasksNavLink && authPage !== "dashboard") tasksNavLink.href = siteUrl("login/");
      }
      if (event === "SIGNED_IN" && nextSession) {
        setAuthenticatedNavigation(true);
        if (authPage === "landing") updateLandingView(true);
        else if (tasksNavLink && authPage !== "dashboard") tasksNavLink.href = siteUrl("app/");
        updateLandingGreeting(nextSession.user);
      }
      if (event === "TOKEN_REFRESHED" && nextSession) {
        window.deadlineUser = nextSession.user;
        updateLandingGreeting(nextSession.user);
      }
    });

    window.addEventListener("deadline-preferences-changed", () => {
      if (landingGreetingUser) updateLandingGreeting(landingGreetingUser);
    });
  }
})();
