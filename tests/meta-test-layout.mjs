#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
assert(pkg.scripts.test === "node tests/run-all.mjs", "npm test should use the multi-suite test runner");

const mainHarness = fs.readFileSync(path.join(repoRoot, "tests/test-harness.mjs"), "utf8");
assert(mainHarness.split(/\r?\n/).length <= 1450, "tests/test-harness.mjs should stay below 1450 lines after suite extraction");
assert(fs.existsSync(path.join(repoRoot, "tests/source-package-boundary.mjs")), "source/package boundary tests should live in a dedicated suite");
