import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SUMMARY_LINE = /^(?:ℹ|#) (tests|fail) (\d+)\s*$/gm;
const SECTION_MARK = "pre-push: bun run ";

export const withoutGitVars = (env) => Object.fromEntries(Object.entries(env).filter(([key]) => !key.startsWith("GIT_")));

export function nodeTestSummary(text) {
	const seen = {};
	for (const match of text.matchAll(SUMMARY_LINE)) seen[match[1]] = Number(match[2]);
	if (seen.tests === undefined || seen.fail === undefined) return null;
	return { tests: seen.tests, fail: seen.fail };
}

export function sectionFor(log, id) {
	const lines = log.split("\n");
	const start = lines.lastIndexOf(`${SECTION_MARK}${id}`);
	if (start === -1) return null;
	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => line.startsWith(SECTION_MARK));
	return (end === -1 ? rest : rest.slice(0, end)).join("\n");
}

export function runReference(root, dir) {
	const abs = join(root, dir);
	if (!existsSync(abs)) return null;
	const files = readdirSync(abs)
		.filter((name) => name.endsWith(".test.mjs"))
		.sort()
		.map((name) => join(abs, name));
	if (files.length === 0) return null;
	const run = spawnSync("node", ["--test", "--test-reporter=tap", ...files], {
		cwd: root,
		env: withoutGitVars(process.env),
		encoding: "utf8",
	});
	return nodeTestSummary(`${run.stdout || ""}${run.stderr || ""}`);
}

export function checkNodeTest(checker, log, { root, reference = runReference(root, checker.dir) }) {
	const problems = [];
	const report = [];
	const section = sectionFor(log, checker.id);
	const gate = section === null ? null : nodeTestSummary(section);
	if (!gate) {
		problems.push(`checker '${checker.id}' reported no test summary, so nothing proves it ran`);
		return { problems, report };
	}
	if (gate.fail > 0) {
		problems.push(`'${checker.id}' reported ${gate.fail} failed`);
	}
	if (!reference) {
		problems.push(`could not run a reference '${checker.id}' over ${checker.dir}, so its coverage is unproven`);
	} else if (gate.tests < reference.tests) {
		problems.push(`'${checker.id}' ran ${gate.tests} tests, but ${checker.dir} holds ${reference.tests}`);
	}
	report.push(`  ${checker.id}: ${gate.tests} tests`);
	return { problems, report };
}
