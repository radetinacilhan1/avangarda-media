/* Offline responsive fit checks: node apps/web/tests/site-header-sizing.cjs */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const filename = path.resolve(__dirname, "../src/components/site-header-sizing.ts");
const moduleShim = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { module: moduleShim, exports: moduleShim.exports }, { filename });
const fits = moduleShim.exports.desktopHeaderFits;
assert.equal(fits({ available: 970, navigation: 687.325, search: 254, gap: 14 }), true, "the observed Spanish desktop row has room for complete controls");
assert.equal(fits({ available: 850, navigation: 687.325, search: 254, gap: 14 }), false, "narrower layouts must move the entire nav, rather than wrap search alone");
assert.equal(fits({ available: 957, navigation: 687.325, search: 254, gap: 14 }), false, "fractional rounding needs spare space");
for (const navigation of [530, 575, 610, 650, 687.325, 715, 740, 780]) {
  assert.equal(fits({ available: navigation + 300, navigation, search: 275, gap: 14 }), true);
  assert.equal(fits({ available: navigation + 250, navigation, search: 275, gap: 14 }), false);
}
assert.equal(fits({ available: NaN, navigation: 600, search: 260, gap: 14 }), false);
assert.equal(fits({ available: 0, navigation: 600, search: 260, gap: 14 }), false);
console.log("site-header-sizing: complete-control fit, narrow/long-label reflow and fractional-width boundaries passed");
