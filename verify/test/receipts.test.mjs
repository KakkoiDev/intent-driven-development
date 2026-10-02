import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const validator = resolve(here, "../validator.mjs");

test("receipt gate reports missing receipts instead of crashing", () => {
  const r = spawnSync("node", [validator, "--root", root, "--receipts"], { encoding: "utf8" });
  assert.notEqual(r.status, 2, r.stderr);
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /\[receipts\] SPEC-\d{4}: missing .*receipts\/coverage\.yml/);
});
