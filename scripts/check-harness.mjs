#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const targetRoot = path.resolve(process.argv[2] || process.cwd());

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "docs/Harness-Ledger.md",
  "docs/11-REFERENCE/testing-standard.md",
  "docs/11-REFERENCE/execution-workflow-standard.md",
  "docs/11-REFERENCE/repo-governance-standard.md",
  "docs/11-REFERENCE/ci-cd-standard.md",
  "docs/11-REFERENCE/long-running-task-standard.md",
  "docs/11-REFERENCE/adversarial-review-standard.md",
  "docs/11-REFERENCE/review-routing-standard.md",
  "docs/11-REFERENCE/docs-library-standard.md",
  "docs/11-REFERENCE/harness-ledger-standard.md",
  "docs/10-WALKTHROUGH/_walkthrough-template.md",
  "docs/09-PLANNING/TASKS/_task-template/task_plan.md",
  "docs/09-PLANNING/TASKS/_task-template/findings.md",
  "docs/09-PLANNING/TASKS/_task-template/progress.md",
  "docs/09-PLANNING/TASKS/_task-template/review.md",
  "docs/09-PLANNING/TASKS/_task-template/long-running-task-contract.md",
  "docs/05-TEST-QA/Regression-SSoT.md",
  "docs/05-TEST-QA/Cadence-Ledger.md",
  "docs/01-GOVERNANCE/Lessons-SSoT.md",
];

const agAgentsRefs = [
  "repo-governance-standard.md",
  "ci-cd-standard.md",
  "execution-workflow-standard.md",
  "adversarial-review-standard.md",
  "review-routing-standard.md",
  "harness-ledger-standard.md",
];

const forbiddenTemplatePatterns = [
  /\[如有[^\]]*\]/,
  /\[[^\]]*(根据项目|框架名|目标覆盖率|列出关键|示例)[^\]]*\]/,
  /\[TODO\]/i,
  /\bTODO\b/,
  /\bTBD\b/i,
  /\[command\]/,
  /\[workflow path\]/,
  /\[owner\/repo or URL\]/,
];

const statusWords = ["designed", "implemented", "verified", "blocked-with-owner"];

const failures = [];
const warnings = [];

function rel(file) {
  return file.split(path.sep).join("/");
}

function filePath(relativePath) {
  return path.join(targetRoot, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    fail(`missing required file: ${relativePath}`);
    return false;
  }
  return true;
}

function checkRequiredFiles() {
  for (const requiredFile of requiredFiles) {
    requireFile(requiredFile);
  }
}

function checkAgentsIndex() {
  if (!exists("AGENTS.md")) return;
  const content = read("AGENTS.md");
  for (const ref of agAgentsRefs) {
    if (!content.includes(ref)) {
      fail(`AGENTS.md does not route to ${ref}`);
    }
  }
}

function checkNoGenericPlaceholders(relativePath, { allowTemplates = false } = {}) {
  if (!exists(relativePath)) return;
  const content = read(relativePath);
  if (allowTemplates) return;
  for (const pattern of forbiddenTemplatePatterns) {
    if (pattern.test(content)) {
      fail(`${relativePath} still contains generic placeholder matching ${pattern}`);
    }
  }
}

function checkGovernanceContent() {
  const governancePath = "docs/11-REFERENCE/repo-governance-standard.md";
  if (!exists(governancePath)) return;
  const content = read(governancePath);
  const requiredTerms = [
    "Repo Platform Profile",
    "Branch Model",
    "PR Policy",
    "Required Checks",
    "Branch Protection",
    "Worktree Concurrency",
  ];
  for (const term of requiredTerms) {
    if (!content.includes(term)) fail(`${governancePath} missing section: ${term}`);
  }
  if (!statusWords.some((status) => content.includes(status))) {
    fail(`${governancePath} does not use evidence status model`);
  }
  checkNoGenericPlaceholders(governancePath);
}

function checkCiCdContent() {
  const ciPath = "docs/11-REFERENCE/ci-cd-standard.md";
  if (!exists(ciPath)) return;
  const content = read(ciPath);
  const requiredTerms = [
    "CI Profile",
    "Workflow",
    "Required Checks",
    "Evidence Status",
  ];
  for (const term of requiredTerms) {
    if (!content.includes(term)) fail(`${ciPath} missing section: ${term}`);
  }
  if (!statusWords.some((status) => content.includes(status))) {
    fail(`${ciPath} does not use evidence status model`);
  }
  checkNoGenericPlaceholders(ciPath);
}

function checkPrTemplateOrResidual() {
  const templateCandidates = [
    ".github/pull_request_template.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".gitlab/merge_request_templates/default.md",
  ];
  if (templateCandidates.some((candidate) => exists(candidate))) return;
  if (exists("docs/11-REFERENCE/repo-governance-standard.md")) {
    const content = read("docs/11-REFERENCE/repo-governance-standard.md");
    if (/PR template/i.test(content) && /blocked-with-owner|manual setup residual|manual-setup-residual/i.test(content)) {
      warn("PR template missing, but repo governance records residual");
      return;
    }
  }
  fail("missing PR template or explicit blocked-with-owner residual");
}

function checkWorkflowOrResidual() {
  const workflowDir = filePath(".github/workflows");
  const hasGitHubWorkflow =
    fs.existsSync(workflowDir) &&
    fs.readdirSync(workflowDir).some((name) => /\.(ya?ml)$/i.test(name));
  if (hasGitHubWorkflow) return;
  if (exists("docs/11-REFERENCE/ci-cd-standard.md")) {
    const content = read("docs/11-REFERENCE/ci-cd-standard.md");
    if (/blocked-with-owner|unsupported checks|residual/i.test(content)) {
      warn("CI workflow missing, but CI/CD standard records residual");
      return;
    }
  }
  fail("missing CI workflow or explicit blocked-with-owner residual");
}

function checkReviewTemplate() {
  const reviewPath = "docs/09-PLANNING/TASKS/_task-template/review.md";
  if (!exists(reviewPath)) return;
  const content = read(reviewPath);
  if (!content.includes("Confidence Challenge")) {
    fail(`${reviewPath} missing Confidence Challenge`);
  }
  if (/\|\s*R-001\s*\|\s*P[01]\s*\|.*\|\s*open\s*\|/i.test(content)) {
    fail(`${reviewPath} ships with an open P0/P1 example finding`);
  }
}

function checkHarnessLedger() {
  if (!exists("docs/Harness-Ledger.md")) return;
  const content = read("docs/Harness-Ledger.md");
  if (!/Repo Governance|CI\/CD|ci-cd|repo-governance/i.test(content)) {
    fail("docs/Harness-Ledger.md does not mention repo governance / CI-CD update status");
  }
}

function checkReferencePlaceholders() {
  const refDir = filePath("docs/11-REFERENCE");
  if (!fs.existsSync(refDir)) return;
  for (const entry of fs.readdirSync(refDir)) {
    const full = path.join(refDir, entry);
    if (!fs.statSync(full).isFile() || !entry.endsWith(".md")) continue;
    checkNoGenericPlaceholders(rel(path.relative(targetRoot, full)));
  }
}

function main() {
  if (!fs.existsSync(targetRoot)) {
    console.error(`Target path does not exist: ${targetRoot}`);
    process.exit(2);
  }

  checkRequiredFiles();
  checkAgentsIndex();
  checkGovernanceContent();
  checkCiCdContent();
  checkPrTemplateOrResidual();
  checkWorkflowOrResidual();
  checkReviewTemplate();
  checkHarnessLedger();
  checkReferencePlaceholders();

  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (failures.length > 0) {
    console.error("Harness check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(`Harness check passed: ${targetRoot}`);
}

main();
