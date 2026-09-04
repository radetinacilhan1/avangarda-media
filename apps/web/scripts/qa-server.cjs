/* Local-only production QA harness. All writes to the real CMS are blocked. */
const http = require("node:http");
const { spawn } = require("node:child_process");
const upstream = new URL(process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://cms:1337");
if (!["cms", "localhost", "127.0.0.1"].includes(upstream.hostname)) throw new Error("QA only supports a local CMS");
const requests = [];
let outage = false;
let child;
const proxy = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:1338");
  if (url.pathname === "/__qa/status") {
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify({ outage, requests }));
  }
  if (url.pathname === "/__qa/reset") { requests.length = 0; return res.end("reset"); }
  if (url.pathname === "/__qa/outage") { outage = url.searchParams.get("on") === "1"; return res.end(String(outage)); }
  if (req.method !== "GET") { res.writeHead(405); return res.end("CMS writes disabled in QA"); }
  requests.push({ path: req.url, outage, at: new Date().toISOString() });
  if (outage) { res.writeHead(503); return res.end("Simulated local CMS outage"); }
  try {
    const response = await fetch(new URL(req.url, upstream), { signal: AbortSignal.timeout(15000) });
    res.writeHead(response.status, { "content-type": response.headers.get("content-type") || "application/json" });
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(502); res.end("Local CMS unavailable"); }
});
const env = { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1", STRAPI_URL: "http://127.0.0.1:1338", STRAPI_REVALIDATE_SECONDS: process.env.QA_CMS_REVALIDATE_SECONDS || "300" };
proxy.listen(1338, "127.0.0.1", () => {
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], { env, stdio: "inherit" });
  child.on("exit", (code) => {
    if (code !== 0) { proxy.close(); process.exitCode = code || 1; return; }
    requests.length = 0;
    child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"], { env, stdio: "inherit" });
    child.on("exit", (code) => { proxy.close(); process.exitCode = code || 0; });
  });
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { child?.kill(signal); proxy.close(); });
