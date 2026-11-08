// Node runner: loads assets/brf-sample.js and assets/brf-live.js exactly as the browser does and
// prints the canon as JSON. Compare with materials/compare-ladder.py against brf_reference.py.
const fs = require("fs"), path = require("path"), vm = require("vm");
const repo = process.argv[2] || path.join(__dirname, "..");
const ctx = { window: {} }; ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(repo, "assets/brf-sample.js"), "utf8"), ctx);
const api = require(path.join(path.resolve(repo), "assets/brf-live.js"));
process.stdout.write(JSON.stringify(api.canon(ctx.window.BRF_SAMPLE)));
