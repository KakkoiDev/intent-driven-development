#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, relative, dirname, basename } from "node:path";
import { argv, cwd, exit } from "node:process";

import fg from "fast-glob";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const args = argv.slice(2);
const flag = (name) => args.includes(name);
const valueOf = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const ROOT = resolve(valueOf("--root", cwd()));
const REQUIRE_RECEIPTS = flag("--receipts");
const JSON_OUT = flag("--json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const errors = [];
const warnings = [];
const pushErr = (gate, msg) => errors.push({ gate, msg });
const pushWarn = (gate, msg) => warnings.push({ gate, msg });

function splitFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: null, body: text };
  try {
    return { fm: yaml.load(m[1]) ?? {}, body: m[2] };
  } catch (e) {
    return { fm: null, body: text, parseError: e.message };
  }
}

async function readText(path) {
  return readFile(resolve(ROOT, path), "utf8");
}

async function loadYaml(path) {
  try {
    return yaml.load(await readText(path));
  } catch (e) {
    pushErr("yaml", `${path}: ${e.message}`);
    return null;
  }
}

async function loadSchemas() {
  const files = await fg("schemas/*.schema.json", { cwd: ROOT });
  const out = {};
  for (const f of files) {
    const s = JSON.parse(await readText(f));
    const key = basename(f).replace(".schema.json", "");
    out[key] = ajv.compile(s);
  }
  return out;
}

async function loadMdWithFrontmatter(glob, kind) {
  const files = await fg(glob, { cwd: ROOT });
  const out = [];
  for (const f of files) {
    const raw = await readText(f);
    const { fm, body, parseError } = splitFrontmatter(raw);
    if (parseError) pushErr("yaml", `${f}: ${parseError}`);
    out.push({ kind, path: f, fm: fm ?? {}, body, raw });
  }
  return out;
}

async function load() {
  const [schemas, visions, intents, specs, plans, adrs] = await Promise.all([
    loadSchemas(),
    loadMdWithFrontmatter("vision/VIS-*.md", "vision"),
    loadMdWithFrontmatter("intents/INT-*.md", "intent"),
    loadMdWithFrontmatter("specs/*/spec.md", "spec"),
    loadMdWithFrontmatter("plans/*/plan.md", "plan"),
    loadMdWithFrontmatter("plans/*/adr/ADR-*.md", "adr"),
  ]);

  const taskFiles = await fg("plans/*/tasks.yaml", { cwd: ROOT });
  const tasks = [];
  for (const tf of taskFiles) {
    const doc = await loadYaml(tf);
    if (doc?.tasks) tasks.push({ path: tf, doc });
  }

  const specDirs = [...new Set(specs.map((s) => dirname(s.path)))];
  const sidecars = {};
  for (const d of specDirs) {
    sidecars[d] = {};
    for (const name of ["observability.yml", "compliance.yml", "budgets.yml", "acceptance.yaml"]) {
      const p = `${d}/${name}`;
      if ((await fg(p, { cwd: ROOT })).length) sidecars[d][name] = await loadYaml(p);
    }
    const diagrams = await fg(`${d}/diagrams/*.mmd`, { cwd: ROOT });
    sidecars[d].diagrams = {};
    for (const dg of diagrams) sidecars[d].diagrams[basename(dg)] = await readText(dg);
    const features = await fg(`${d}/features/*.feature`, { cwd: ROOT });
    sidecars[d].features = {};
    for (const ft of features) sidecars[d].features[basename(ft)] = await readText(ft);
  }

  return { schemas, visions, intents, specs, plans, adrs, tasks, sidecars };
}

function gateSchema(db) {
  const map = {
    intent: db.schemas.intent,
    spec: db.schemas.spec,
    plan: db.schemas.plan,
    adr: db.schemas.adr,
  };
  for (const kind of Object.keys(map)) {
    for (const a of db[kind + "s"] ?? []) {
      const ok = map[kind](a.fm);
      if (!ok) pushErr(`schema:${kind}`, `${a.path}: ${ajv.errorsText(map[kind].errors)}`);
    }
  }
  for (const { path, doc } of db.tasks) {
    const ok = db.schemas.tasks(doc);
    if (!ok) pushErr("schema:tasks", `${path}: ${ajv.errorsText(db.schemas.tasks.errors)}`);
  }
  for (const [dir, side] of Object.entries(db.sidecars)) {
    for (const name of ["observability", "compliance", "budgets"]) {
      const file = name + (name === "budgets" ? ".yml" : ".yml");
      if (side[file] && db.schemas[name]) {
        const ok = db.schemas[name](side[file]);
        if (!ok) pushErr(`schema:${name}`, `${dir}/${file}: ${ajv.errorsText(db.schemas[name].errors)}`);
      }
    }
  }
}

function gateUniqueIds(db) {
  const seen = new Map();
  const all = [...db.visions, ...db.intents, ...db.specs, ...db.plans, ...db.adrs];
  for (const a of all) {
    const id = a.fm?.id;
    if (!id) continue;
    if (seen.has(id)) pushErr("unique", `duplicate ${id} in ${a.path} and ${seen.get(id)}`);
    else seen.set(id, a.path);
  }
  const taskIds = new Map();
  for (const { path, doc } of db.tasks) {
    for (const t of doc.tasks ?? []) {
      if (taskIds.has(t.id)) pushErr("unique", `duplicate task ${t.id} in ${path}`);
      else taskIds.set(t.id, path);
    }
  }
}

function gateLinks(db) {
  const ids = new Set();
  for (const a of [...db.visions, ...db.intents, ...db.specs, ...db.plans, ...db.adrs]) {
    if (a.fm?.id) ids.add(a.fm.id);
  }
  const refFields = ["parent", "implements", "supersedes", "superseded-by", "context"];
  for (const a of [...db.intents, ...db.specs, ...db.plans, ...db.adrs]) {
    for (const f of refFields) {
      const v = a.fm?.[f];
      if (v && v !== null && !ids.has(v)) pushErr("links", `${a.path}: ${f}=${v} does not resolve`);
    }
  }
}

function listRequirements(spec) {
  const ids = [];
  const re = new RegExp(`\\*\\*(${spec.fm.id}-R\\d{2})\\*\\*`, "g");
  let m;
  while ((m = re.exec(spec.body))) ids.push(m[1]);
  return ids;
}

function gateTaskCoverage(db) {
  const covered = new Set();
  for (const { doc } of db.tasks) {
    for (const t of doc.tasks ?? []) {
      for (const r of t.satisfies ?? []) covered.add(r);
    }
  }
  for (const s of db.specs) {
    for (const r of listRequirements(s)) {
      if (!covered.has(r)) pushErr("task-coverage", `${r} has no satisfying task`);
    }
  }
}

function gateOrphans(db) {
  const intentIds = new Set(db.intents.map((i) => i.fm?.id).filter(Boolean));
  const specParents = new Set(db.specs.map((s) => s.fm?.parent).filter(Boolean));
  const planImpls = new Set(db.plans.map((p) => p.fm?.implements).filter(Boolean));

  for (const i of db.intents) {
    if (i.fm?.status === "accepted" && !specParents.has(i.fm.id)) {
      pushWarn("orphan", `${i.fm.id} is accepted but has no spec`);
    }
  }
  for (const s of db.specs) {
    if (s.fm?.status === "accepted" && !planImpls.has(s.fm.id)) {
      pushWarn("orphan", `${s.fm.id} is accepted but has no plan`);
    }
    if (s.fm?.parent && !intentIds.has(s.fm.parent)) {
      pushErr("orphan", `${s.fm.id}: parent ${s.fm.parent} does not exist`);
    }
  }
  for (const a of [...db.intents, ...db.specs, ...db.plans, ...db.adrs]) {
    if (a.fm?.status === "deprecated" && !a.fm["superseded-by"]) {
      pushErr("orphan", `${a.fm.id} is deprecated but has no superseded-by`);
    }
  }
}

function gateLifecycle(db) {
  const taskById = new Map();
  for (const { doc } of db.tasks) {
    for (const t of doc.tasks ?? []) taskById.set(t.id, t);
  }
  for (const s of db.specs) {
    if (s.fm?.status !== "implemented") continue;
    const reqs = listRequirements(s);
    for (const r of reqs) {
      const tasks = [...taskById.values()].filter((t) => (t.satisfies ?? []).includes(r));
      if (!tasks.length || tasks.some((t) => t.status !== "done")) {
        pushErr("lifecycle", `${s.fm.id} is implemented but ${r} has incomplete tasks`);
      }
    }
  }
}

function parseAcceptance(doc) {
  if (!Array.isArray(doc)) return [];
  return doc.map((e) => e.requirement).filter(Boolean);
}

function parseGherkinRequirements(text) {
  const out = [];
  const re = /(?:Scenario|Scenario Outline):\s*(SPEC-\d{4}-R\d{2})/g;
  let m;
  while ((m = re.exec(text))) out.push(m[1]);
  return out;
}

function gateReqTestBinding(db) {
  const byReq = {};
  for (const s of db.specs) {
    const dir = dirname(s.path);
    const side = db.sidecars[dir] ?? {};
    const reqs = listRequirements(s);
    const bound = new Set();
    for (const r of parseAcceptance(side["acceptance.yaml"])) bound.add(r);
    for (const f of Object.values(side.features ?? {})) {
      for (const r of parseGherkinRequirements(f)) bound.add(r);
    }
    for (const r of reqs) {
      byReq[r] = bound.has(r);
      if (!bound.has(r)) {
        pushErr("req-binding", `${r}: no Gherkin scenario, acceptance entry, or contract binding found`);
      }
    }
  }
}

function gateObservabilityCoverage(db) {
  for (const [dir, side] of Object.entries(db.sidecars)) {
    const obs = side["observability.yml"];
    if (!obs) continue;
    const declared = new Set(
      [...(obs.metrics ?? []), ...(obs.logs ?? []), ...(obs.traces ?? [])]
        .map((e) => e.requirement)
        .filter(Boolean)
    );
    const emitted = new Set();
    for (const { doc } of db.tasks) {
      for (const t of doc.tasks ?? []) {
        for (const r of t.satisfies ?? []) {
          if (declared.has(r) && (t.emits ?? []).length) emitted.add(r);
        }
      }
    }
    for (const r of declared) {
      if (!emitted.has(r)) pushErr("observability", `${r} declares signals in ${dir}/observability.yml but no task emits them`);
    }
  }
}

function gateComplianceTagging(db) {
  for (const [dir, side] of Object.entries(db.sidecars)) {
    const comp = side["compliance.yml"];
    if (!comp?.data_classification) continue;
    for (const entry of comp.data_classification) {
      if (["PII", "financial", "health", "sensitive"].includes(entry.class) && !(entry.governed_by ?? []).length) {
        pushErr("compliance", `${dir}: field ${entry.field} classified ${entry.class} but no governed_by requirement`);
      }
    }
  }
}

function gateBudgetPresence(db) {
  for (const s of db.specs) {
    if (s.fm?.status === "draft") continue;
    const dir = dirname(s.path);
    const budgets = db.sidecars[dir]?.["budgets.yml"];
    if (!budgets) {
      pushWarn("budgets", `${s.fm?.id}: no budgets.yml (ok for non-perf specs)`);
      continue;
    }
    const covered = new Set(
      [...(budgets.performance ?? []), ...(budgets.cost ?? [])]
        .map((e) => e.requirement)
        .filter(Boolean)
    );
    for (const r of listRequirements(s)) {
      if (!covered.has(r)) pushWarn("budgets", `${r} has no budget entry`);
    }
  }
}

function parseStateTransitions(mmd) {
  const out = [];
  const lines = mmd.split(/\n/);
  for (const line of lines) {
    const m = line.match(/^\s*(\w+)\s*-->\s*(\w+)(?:\s*:\s*(.+))?$/);
    if (m) out.push({ from: m[1], to: m[2], event: (m[3] ?? "").trim() });
  }
  return out;
}

function gateStateMachineCoverage(db) {
  for (const [dir, side] of Object.entries(db.sidecars)) {
    const mmd = side.diagrams?.["state.mmd"];
    if (!mmd) continue;
    const spec = db.specs.find((s) => dirname(s.path) === dir);
    if (!spec) continue;
    const transitions = parseStateTransitions(mmd);
    const scenarios = Object.values(side.features ?? {}).join("\n") + "\n" + (JSON.stringify(side["acceptance.yaml"] ?? ""));
    for (const t of transitions) {
      const needle = `${t.from} -> ${t.to}`;
      if (!scenarios.includes(needle) && !scenarios.includes(t.event)) {
        pushErr("state-machine", `${spec.fm.id}: transition ${t.from} --> ${t.to}${t.event ? ` (${t.event})` : ""} has no test`);
      }
    }
  }
}

function gateDeterminism(db) {
  for (const s of db.specs) {
    const h = s.fm?.["compiled-hash"];
    if (!h) continue;
    const payload = s.body;
    const actual = createHash("sha256").update(payload).digest("hex");
    if (actual !== h) {
      pushErr("determinism", `${s.fm.id}: compiled-hash=${h} does not match body hash ${actual}`);
    }
  }
}

function gateReceipts(db) {
  if (!REQUIRE_RECEIPTS) return;
  for (const s of db.specs) {
    const dir = dirname(s.path);
    const want = ["coverage", "mutation", "judge", "determinism"];
    for (const name of want) {
      const p = `${dir}/receipts/${name}.yml`;
      if (!require("fs").existsSync(resolve(ROOT, p))) {
        pushErr("receipts", `${s.fm.id}: missing ${p}`);
      }
    }
  }
}

async function emitTraceability(db) {
  const edges = [];
  const nodes = new Set();
  const addEdge = (a, b) => {
    nodes.add(a);
    nodes.add(b);
    edges.push([a, b]);
  };
  for (const i of db.intents) if (i.fm?.parent) addEdge(i.fm.parent, i.fm.id);
  for (const s of db.specs) {
    if (s.fm?.parent) addEdge(s.fm.parent, s.fm.id);
    for (const r of listRequirements(s)) addEdge(s.fm.id, r);
  }
  for (const p of db.plans) if (p.fm?.implements) addEdge(p.fm.implements, p.fm.id);
  for (const { doc } of db.tasks) {
    for (const t of doc.tasks ?? []) {
      for (const r of t.satisfies ?? []) addEdge(r, t.id);
      for (const f of t.produces ?? []) addEdge(t.id, f);
    }
  }

  const mmd = ["graph TD"];
  for (const n of nodes) mmd.push(`  ${n.replace(/[^a-zA-Z0-9_-]/g, "_")}["${n}"]`);
  for (const [a, b] of edges) {
    mmd.push(`  ${a.replace(/[^a-zA-Z0-9_-]/g, "_")} --> ${b.replace(/[^a-zA-Z0-9_-]/g, "_")}`);
  }
  await writeFile(resolve(ROOT, "verify/traceability.mmd"), mmd.join("\n") + "\n");

  const yml = yaml.dump({ nodes: [...nodes], edges });
  await writeFile(resolve(ROOT, "verify/traceability.yaml"), yml);
}

function report() {
  if (JSON_OUT) {
    console.log(JSON.stringify({ errors, warnings }, null, 2));
    return;
  }
  if (warnings.length) {
    console.log("Warnings:");
    for (const w of warnings) console.log(`  [${w.gate}] ${w.msg}`);
  }
  if (errors.length) {
    console.log("Errors:");
    for (const e of errors) console.log(`  [${e.gate}] ${e.msg}`);
    console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  } else {
    console.log(`OK. All gates pass. ${warnings.length} warning(s).`);
  }
}

async function main() {
  try {
    const db = await load();
    gateSchema(db);
    gateUniqueIds(db);
    gateLinks(db);
    gateTaskCoverage(db);
    gateOrphans(db);
    gateLifecycle(db);
    gateReqTestBinding(db);
    gateObservabilityCoverage(db);
    gateComplianceTagging(db);
    gateBudgetPresence(db);
    gateStateMachineCoverage(db);
    gateDeterminism(db);
    gateReceipts(db);
    await emitTraceability(db);
    report();
    exit(errors.length ? 1 : 0);
  } catch (e) {
    console.error(`validator error: ${e.stack || e.message}`);
    exit(2);
  }
}

main();
