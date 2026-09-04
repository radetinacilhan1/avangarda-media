// Synthetic titles over actual local article HTML/CSS; never edits CMS content.
const http = require("node:http");
const titles = {
  sr: ["Buka bez smisla", "Od krvave šake do muzejskog zida: kako protest proizvodi umetnost"],
  en: ["Noise without meaning", "From the bloody hand to the museum wall: how protest produces art and preserves collective memory"],
  ar: ["ضجيج بلا معنى", "من اليد الملطخة بالدماء إلى جدار المتحف: كيف ينتج الاحتجاج الفن ويحافظ على الذاكرة الجماعية"],
};
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost:3101");
    if (req.method !== "GET") { res.writeHead(405); return res.end(); }
    if (url.pathname === "/preview") {
      const lang = Object.hasOwn(titles, url.searchParams.get("lang")) ? url.searchParams.get("lang") : "sr";
      const title = titles[lang][url.searchParams.get("length") === "short" ? 0 : 1];
      const response = await fetch(`http://localhost:3100/${lang}/a/article-3`);
      if (!response.ok) throw new Error(`QA article returned ${response.status}`);
      const html = (await response.text())
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<h1 class="article-header__title">[\s\S]*?<\/h1>/, `<h1 class="article-header__title">${title}</h1>`);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return res.end(html);
    }
    const asset = await fetch(new URL(req.url, "http://localhost:3100"));
    res.writeHead(asset.status, { "content-type": asset.headers.get("content-type") || "application/octet-stream" });
    res.end(Buffer.from(await asset.arrayBuffer()));
  } catch (error) { res.writeHead(502); res.end(error.message); }
}).listen(3101, "127.0.0.1", () => console.log("Typography fixtures: http://localhost:3101/preview?lang=sr&length=long"));
