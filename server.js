const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);
const rootPrefix = `${root}${path.sep}`;
const port = Number(process.env.PORT || 3000);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".sql": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".yml": "text/plain; charset=utf-8"
  ,
  ".webmanifest": "application/manifest+json; charset=utf-8"
};
const publicRootFiles = new Set([
  "index.html",
  "style.css",
  "script.js",
  "site-pages.js",
  "supabase-config.js",
  "supabase-auth.js",
  "manifest.webmanifest",
  "sw.js"
]);
const publicDirectories = new Set(["app", "Asset", "about", "faq", "login", "settings", "privacy"]);

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400);
    response.end("Invalid URL");
    return;
  }

  if (pathname === "/") {
    response.writeHead(301, { Location: "/app/" });
    response.end();
    return;
  }

  if (pathname.includes("\0")) {
    response.writeHead(400);
    response.end("Invalid path");
    return;
  }

  const firstSegment = pathname.split(/[\\/]+/).filter(Boolean)[0];
  if (firstSegment && !publicRootFiles.has(firstSegment) && !publicDirectories.has(firstSegment)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const target = path.resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(rootPrefix)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  const resolvedFirstSegment = target === root ? "" : path.relative(root, target).split(path.sep)[0];
  if (resolvedFirstSegment && !publicRootFiles.has(resolvedFirstSegment) && !publicDirectories.has(resolvedFirstSegment)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  fs.stat(target, (statError, stats) => {
    if (statError) {
      response.writeHead(statError.code === "ENOENT" ? 404 : 500);
      response.end(statError.code === "ENOENT" ? "Not found" : "Unable to read file");
      return;
    }

    if (stats.isDirectory() && !pathname.endsWith("/")) {
      response.writeHead(301, { Location: `${pathname}/${new URL(request.url, "http://localhost").search}` });
      response.end();
      return;
    }

    const filePath = stats.isDirectory() ? path.join(target, "index.html") : target;
    fs.readFile(filePath, (readError, contents) => {
      if (readError) {
        response.writeHead(readError.code === "ENOENT" ? 404 : 500);
        response.end(readError.code === "ENOENT" ? "Not found" : "Unable to read file");
        return;
      }

      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "DENY",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
      });
      response.end(request.method === "HEAD" ? undefined : contents);
    });
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Deadline is available at http://127.0.0.1:${port}/`);
});

server.on("error", error => {
  console.error("Could not start the Deadline server:", error.message);
  process.exitCode = 1;
});
