import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { cpSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const validator = resolve(here, "../validator.mjs");
const schemas = resolve(here, "../../schemas");

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "idd-receipts-"));
  mkdirSync(join(root, "specs/SPEC-0001-x"), { recursive: true });
  mkdirSync(join(root, "verify"));
  cpSync(schemas, join(root, "schemas"), { recursive: true });
  writeFileSync(join(root, "specs/SPEC-0001-x/spec.md"), "---\nid: SPEC-0001\nslug: x\nstatus: draft\nparent: INT-0001\nversion: 0.1.0\n---\n");
  return root;
}

function receiptErrors(root) {
  const r = spawnSync("node", [validator, "--root", root, "--receipts", "--json"], { encoding: "utf8" });
  assert.notEqual(r.status, 2, r.stderr);
  return JSON.parse(r.stdout).errors.filter((e) => e.gate === "receipts").map((e) => e.msg);
}

test("receipt gate reports missing receipts instead of crashing", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.deepEqual(receiptErrors(root), [
    "SPEC-0001: missing specs/SPEC-0001-x/receipts/coverage.yml",
    "SPEC-0001: missing specs/SPEC-0001-x/receipts/mutation.yml",
    "SPEC-0001: missing specs/SPEC-0001-x/receipts/judge.yml",
    "SPEC-0001: missing specs/SPEC-0001-x/receipts/determinism.yml",
  ]);
});

test("receipt gate passes when all receipts exist", (t) => {
  const root = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "specs/SPEC-0001-x/receipts"));
  for (const n of ["coverage", "mutation", "judge", "determinism"]) {
    writeFileSync(join(root, `specs/SPEC-0001-x/receipts/${n}.yml`), "{}\n");
  }
  assert.deepEqual(receiptErrors(root), []);
});
