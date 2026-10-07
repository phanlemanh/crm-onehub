#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkNodeTest } from "./gate-shape-node-test.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RUNS_DIR = join(ROOT, ".turbo", "runs");
const COVERAGE_LINE = /Finished in [^\n]*? on (\d+) files with (\d+) rules/g;

function arg(name) {
	const at = process.argv.indexOf(name);
	return at === -1 ? "" : process.argv[at + 1] || "";
}

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}

const SHAPE_FILE = arg("--shape") || join(ROOT, ".githooks", "gate-shape.json");

function readShape() {
	if (!existsSync(SHAPE_FILE)) {
		die([`the gate has no shape declaration at ${SHAPE_FILE}`]);
	}
	const shape = readJson(SHAPE_FILE);
	const roots = Array.isArray(shape.roots) ? shape.roots : [];
	const checkers = Array.isArray(shape.checkers) ? shape.checkers : [];
	if (roots.length === 0 || checkers.length === 0) {
		die(["the shape declaration names no roots or no checkers"]);
	}
	return { roots, checkers };
}

function allRoots(declared) {
	const roots = new Set(declared);
	const manifest = join(ROOT, "package.json");
	if (!existsSync(manifest)) return [...roots];
	for (const pattern of readJson(manifest).workspaces || []) {
		const at = pattern.indexOf("/*");
		if (at > 0) roots.add(pattern.slice(0, at));
	}
	return [...roots];
}

function readPackages(roots) {
	const found = [];
	for (const root of roots) {
		const dir = join(ROOT, root);
		if (!existsSync(dir)) continue;
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			const manifest = join(dir, entry.name, "package.json");
			if (!existsSync(manifest)) continue;
			const parsed = readJson(manifest);
			found.push({
				name: parsed.name || `${root}/${entry.name}`,
				where: `${root}/${entry.name}`,
				scripts: parsed.scripts || {},
			});
		}
	}
	return found.sort((a, b) => (a.name < b.name ? -1 : 1));
}

function readLedger(before) {
	if (!existsSync(RUNS_DIR)) return { runs: [], files: [] };
	const skip = new Set(before);
	const files = readdirSync(RUNS_DIR)
		.filter((name) => name.endsWith(".json") && !skip.has(name))
		.map((name) => join(RUNS_DIR, name));
	const runs = [];
	for (const file of files) {
		let summary;
		try {
			summary = readJson(file);
		} catch {
			continue;
		}
		const command = summary.execution?.command || "";
		const match = /^turbo run (\S+)/.exec(command);
		if (!match) continue;
		const ran = new Map();
		for (const task of summary.tasks || []) {
			if (task.task !== match[1]) continue;
			ran.set(task.package, {
				cache: task.cache?.status || "NONE",
				exit: task.execution ? task.execution.exitCode : null,
			});
		}
		runs.push({ task: match[1], ran });
	}
	return { runs, files };
}

function lastCoverage(text) {
	let seen = null;
	for (const match of text.matchAll(COVERAGE_LINE)) {
		seen = { files: Number(match[1]), rules: Number(match[2]) };
	}
	return seen;
}

function referenceOxlint() {
	const binary = join(ROOT, "node_modules", ".bin", "oxlint");
	if (!existsSync(binary)) return null;
	const run = spawnSync(binary, ["--format=default"], {
		cwd: ROOT,
		encoding: "utf8",
	});
	return lastCoverage(`${run.stdout || ""}${run.stderr || ""}`);
}

function checkTurbo(checker, packages, ledger, problems, report) {
	const exempt = checker.exempt || {};
	const runs = ledger.runs.filter((run) => run.task === checker.id);
	if (runs.length === 0) {
		problems.push(
			`checker '${checker.id}' left no run summary, so nothing proves it ran at all`,
		);
		return;
	}
	const ran = new Map();
	for (const run of runs) {
		for (const [name, result] of run.ran) ran.set(name, result);
	}
	const wanted = packages.filter((pkg) => !(pkg.name in exempt));
	let fresh = 0;
	for (const pkg of wanted) {
		const result = ran.get(pkg.name);
		if (!result) {
			if (!pkg.scripts[checker.id]) {
				problems.push(
					`${pkg.where} declares no '${checker.id}' script and no exemption — add the script, or add ${pkg.name} to exempt in gate-shape.json with a reason`,
				);
			} else {
				problems.push(
					`'${checker.id}' never reached ${pkg.name} — the gate covered ${ran.size} of the ${wanted.length} packages that need it`,
				);
			}
			continue;
		}
		if (result.cache !== "MISS") {
			problems.push(
				`${pkg.name}#${checker.id} read cache '${result.cache}' instead of running`,
			);
			continue;
		}
		if (result.exit !== 0) {
			problems.push(`${pkg.name}#${checker.id} exited ${result.exit}`);
			continue;
		}
		fresh += 1;
	}
	for (const [name, reason] of Object.entries(exempt)) {
		if (!packages.some((pkg) => pkg.name === name)) {
			problems.push(
				`gate-shape.json exempts ${name} from '${checker.id}', but no such package exists — drop the stale exemption`,
			);
			continue;
		}
		report.push(`  exempt: ${name} from '${checker.id}' — ${reason}`);
	}
	report.push(`  ${checker.id}: ${fresh}/${wanted.length} packages ran fresh`);
}

function checkOxlint(checker, log, problems, report) {
	const gate = lastCoverage(log);
	if (!gate) {
		problems.push(
			`checker '${checker.id}' reported no coverage line, so nothing proves it read this tree`,
		);
		return;
	}
	const reference = referenceOxlint();
	if (!reference) {
		problems.push(
			`could not measure a reference oxlint run, so '${checker.id}' coverage is unproven`,
		);
		return;
	}
	if (gate.files < reference.files) {
		problems.push(
			`'${checker.id}' read ${gate.files} files, but this tree holds ${reference.files}`,
		);
	}
	if (gate.rules < reference.rules) {
		problems.push(
			`'${checker.id}' applied ${gate.rules} rules, but the config declares ${reference.rules}`,
		);
	}
	report.push(`  ${checker.id}: ${gate.files} files, ${gate.rules} rules`);
}

function die(problems) {
	console.error("");
	console.error("  The gate no longer matches .githooks/gate-shape.json.");
	for (const problem of problems) console.error(`  - ${problem}`);
	console.error("");
	console.error(
		"  Fix the gate, or change the declaration and say why in the same commit.",
	);
	console.error("");
	process.exit(1);
}

const log =
	arg("--log") && existsSync(arg("--log"))
		? readFileSync(arg("--log"), "utf8")
		: "";
const beforeFile = arg("--runs-before");
const before =
	beforeFile && existsSync(beforeFile)
		? readFileSync(beforeFile, "utf8").split("\n").filter(Boolean)
		: [];

const shape = readShape();
const roots = allRoots(shape.roots);
const packages = readPackages(roots);
const ledger = readLedger(before);
const problems = [];
const report = [];

if (packages.length === 0) {
	problems.push(`no packages found under ${roots.join(", ")}`);
}

const declared = new Set(
	shape.checkers.filter((c) => c.kind === "turbo").map((c) => c.id),
);
for (const run of ledger.runs) {
	if (!declared.has(run.task)) {
		problems.push(
			`the gate ran 'turbo run ${run.task}', which gate-shape.json does not declare`,
		);
	}
}

for (const checker of shape.checkers) {
	if (checker.kind === "turbo") {
		checkTurbo(checker, packages, ledger, problems, report);
	} else if (checker.kind === "oxlint") {
		checkOxlint(checker, log, problems, report);
	} else if (checker.kind === "node-test") {
		const result = checkNodeTest(checker, log, { root: ROOT });
		problems.push(...result.problems);
		report.push(...result.report);
	} else {
		problems.push(
			`checker '${checker.id}' has an unknown kind '${checker.kind}'`,
		);
	}
}

for (const file of ledger.files) rmSync(file, { force: true });

if (problems.length > 0) die(problems);

console.log(
	`pre-push: gate matches its shape across ${packages.length} packages`,
);
for (const line of report) console.log(line);
