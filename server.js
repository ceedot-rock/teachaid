/**
 * TEACHAiD host — static files + Vercel-style /api handlers.
 * Works on Fly (or any Node host). Port: process.env.PORT || 8080
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";

const API = {
  chat: require("./api/chat"),
  curriculum: require("./api/curriculum"),
  "pro-verify": require("./api/pro-verify"),
  "pro-lifetime": require("./api/pro-lifetime"),
  referral: require("./api/referral"),
  tts: require("./api/tts"),
  "connect-onboard": require("./api/connect-onboard"),
  "settle-payout": require("./api/settle-payout"),
};

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers) {
  const h = headers || {};
  if (!h["Content-Type"] && typeof body === "string") {
    h["Content-Type"] = "text/plain; charset=utf-8";
  }
  res.writeHead(status, h);
  res.end(body);
}

function vercelRes(nodeRes) {
  let statusCode = 200;
  const headers = {};
  let ended = false;
  const api = {
    setHeader(k, v) {
      headers[k] = v;
    },
    getHeader(k) {
      return headers[k];
    },
    status(code) {
      statusCode = code;
      return api;
    },
    json(obj) {
      if (ended) return;
      ended = true;
      const body = JSON.stringify(obj);
      headers["Content-Type"] = headers["Content-Type"] || "application/json; charset=utf-8";
      nodeRes.writeHead(statusCode, headers);
      nodeRes.end(body);
    },
    end(chunk) {
      if (ended) return;
      ended = true;
      nodeRes.writeHead(statusCode, headers);
      nodeRes.end(chunk === undefined ? undefined : chunk);
    },
    send(chunk) {
      return api.end(chunk);
    },
  };
  // Allow res.status(x).json(y) chain
  return api;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);
  if (!raw.length) return { raw: Buffer.alloc(0), json: {}, text: "" };
  const text = raw.toString("utf8");
  let json = {};
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
    try {
      json = JSON.parse(text);
    } catch {
      json = {};
    }
  }
  return { raw, json, text };
}

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  let rel = decoded === "/" ? "/index.html" : decoded;
  if (rel.endsWith("/")) rel += "index.html";
  // cleanUrls: /pricing → pricing.html
  const full = path.normalize(path.join(root, rel));
  if (!full.startsWith(root)) return null;
  return full;
}

function tryStatic(filePath) {
  if (!filePath) return null;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
  // cleanUrls
  if (!path.extname(filePath)) {
    const html = filePath + ".html";
    if (fs.existsSync(html) && fs.statSync(html).isFile()) return html;
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || "localhost";
    const u = new URL(req.url || "/", `http://${host}`);
    const pathname = u.pathname;

    // Health
    if (pathname === "/health" || pathname === "/api/health") {
      return send(res, 200, JSON.stringify({ ok: true, app: "teachaid", host }), {
        "Content-Type": "application/json",
      });
    }

    // API
    if (pathname.startsWith("/api/")) {
      const name = pathname.replace(/^\/api\//, "").replace(/\/$/, "");
      const handler = API[name];
      if (!handler) {
        return send(res, 404, JSON.stringify({ error: "Not found" }), {
          "Content-Type": "application/json",
        });
      }
      const { json, text } = await readBody(req);
      const query = Object.fromEntries(u.searchParams.entries());
      const vReq = {
        method: req.method,
        headers: req.headers,
        body: Object.keys(json).length ? json : text || {},
        query,
        url: req.url,
      };
      const vRes = vercelRes(res);
      await handler(vReq, vRes);
      // If handler never ended (bug), close
      if (!res.writableEnded) {
        send(res, 500, JSON.stringify({ error: "Handler did not respond" }), {
          "Content-Type": "application/json",
        });
      }
      return;
    }

    // Static
    let filePath = tryStatic(safeJoin(ROOT, pathname));
    if (!filePath && pathname === "/") filePath = tryStatic(path.join(ROOT, "index.html"));
    if (!filePath) {
      return send(res, 404, "Not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    const headers = { "Content-Type": type };
    if (pathname === "/" || pathname.endsWith("index.html") || pathname.endsWith("sw.js")) {
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    } else if (ext === ".html") {
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    } else {
      headers["Cache-Control"] = "public, max-age=300";
    }
    const data = fs.readFileSync(filePath);
    res.writeHead(200, headers);
    res.end(data);
  } catch (e) {
    console.error(e);
    if (!res.writableEnded) {
      send(res, 500, JSON.stringify({ error: e.message || "server error" }), {
        "Content-Type": "application/json",
      });
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`TEACHAiD listening on http://${HOST}:${PORT}`);
});
