const assert = require("node:assert");
const { stageFor } = require("./index.js");

// Stage thresholds cross-checked against the Python implementation
// (kleogeos/freelance-late-fee-cli, latefee.py STAGES table).
assert.deepStrictEqual(stageFor(0), ["not_due", "Invoice not yet overdue."]);
assert.strictEqual(stageFor(1)[0], "friendly");
assert.strictEqual(stageFor(7)[0], "friendly");
assert.strictEqual(stageFor(8)[0], "firm");
assert.strictEqual(stageFor(21)[0], "firm");
assert.strictEqual(stageFor(22)[0], "notice");
assert.strictEqual(stageFor(45)[0], "notice");
assert.strictEqual(stageFor(46)[0], "final");
assert.strictEqual(stageFor(1000)[0], "final");

console.log("All stage-threshold parity checks passed.");
