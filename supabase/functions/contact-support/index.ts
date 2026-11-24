const allowedOrigins = new Set([
  "https://dead2line.com",
  "https://www.dead2line.com"
]);
const localOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const rateWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 3;
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const topics: Record<string, string> = {
  general: "General question",
  technical: "Technical issue",
  account: "Account access",
  privacy: "Privacy or account deletion"
};

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.has(origin) || localOriginPattern.test(origin);
}

function response(
  origin: string,
  status: number,
  payload: Record<string, string | boolean>
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Max-Age": "86400",
      "Content-Type": "application/json",
      "Vary": "Origin"
    }
  });
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = requestCounts.get(key);
  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + rateWindowMs });
    if (requestCounts.size > 1000) {
      for (const [requestKey, entry] of requestCounts) {
        if (entry.resetAt <= now) requestCounts.delete(requestKey);
      }
    }
    return false;
  }
  if (current.count >= maxRequestsPerWindow) return true;
  current.count += 1;
  return false;
}

Deno.serve(async request => {
  const origin = request.headers.get("origin") || "";
  if (!isAllowedOrigin(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }
    });
  }

  if (request.method !== "POST") {
    return response(origin, 405, { error: "method_not_allowed" });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return response(origin, 400, { error: "invalid_request" });
  }
  if (new TextEncoder().encode(rawBody).length > 8000) {
    return response(origin, 413, { error: "message_too_large" });
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(rawBody);
  } catch {
    return response(origin, 400, { error: "invalid_json" });
  }
  if (typeof parsedPayload !== "object" || parsedPayload === null || Array.isArray(parsedPayload)) {
    return response(origin, 400, { error: "invalid_form" });
  }
  const payload = parsedPayload as Record<string, unknown>;

  if (typeof payload.website === "string" && payload.website.trim()) {
    return response(origin, 200, { ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return response(origin, 429, { error: "rate_limited" });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const topic = typeof payload.topic === "string" ? payload.topic : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !Object.prototype.hasOwnProperty.call(topics, topic) ||
    message.length < 10 ||
    message.length > 3000
  ) {
    return response(origin, 400, { error: "invalid_form" });
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const supportEmail = Deno.env.get("SUPPORT_EMAIL");
  const supportFromEmail = Deno.env.get("SUPPORT_FROM_EMAIL");
  if (!resendApiKey || !supportEmail || !supportFromEmail) {
    console.error("Support email delivery is not configured.");
    return response(origin, 503, { error: "delivery_unavailable" });
  }

  try {
    const delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: supportFromEmail,
        to: [supportEmail],
        reply_to: email,
        subject: `[Deadline Support] ${topics[topic]}`,
        text: `Reply to: ${email}\nTopic: ${topics[topic]}\n\n${message}`
      })
    });

    if (!delivery.ok) {
      console.error("Resend rejected a support message:", delivery.status);
      return response(origin, 502, { error: "delivery_failed" });
    }
  } catch (error) {
    console.error("Could not deliver a support message:", error);
    return response(origin, 502, { error: "delivery_failed" });
  }

  return response(origin, 200, { ok: true });
});
