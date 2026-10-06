#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ACCEPTANCE = join(ROOT, "_acceptance");
const GLOB_CHARS = /[*?]/;
const ODD_SHAPE = /^(\.{1,2}\/|\/)|\/$|\\|\s/;

const require = createRequire(import.meta.url);
const core = require(join(ROOT, "lib", "evidence-core.cjs"));
const evalYaml = require(join(ROOT, "lib", "eval-yaml.cjs"));

function trackedFiles() {
	const out = execFileSync("git", ["ls-files", "-z"], {
		cwd: ROOT,
		encoding: "utf8",
		maxBuffer: 1 << 28,
	});
	return new Set(out.split("\0").filter(Boolean));
}

function classify(entry, tracked) {
	const value = String(entry ?? "").trim();
	if (!value) return { kind: "loi", why: "mục rỗng" };
	if (ODD_SHAPE.test(value)) return { kind: "loi", why: "dạng lạ" };
	if (GLOB_CHARS.test(value)) return { kind: "ok" };
	if (tracked.has(value)) return { kind: "ok" };
	const onDisk = join(ROOT, value);
	if (existsSync(onDisk) && statSync(onDisk).isDirectory()) {
		return { kind: "loi", why: `thư mục trần, viết ${value}/**` };
	}
	return { kind: "canh-bao", why: "tệp không còn trong kho" };
}

function scan() {
	const tracked = trackedFiles();
	const errors = [];
	const warnings = [];
	for (const slug of readdirSync(ACCEPTANCE).sort()) {
		const file = join(ACCEPTANCE, slug, "evals.yaml");
		if (!existsSync(file)) continue;
		const text = readFileSync(file, "utf8");
		const evals = evalYaml.parseEvals(text, ["executor"]);
		for (const item of evals) {
			const entries = core.evalPathsOf(text, item.id) ?? [];
			for (const entry of entries) {
				const verdict = classify(entry, tracked);
				const line = `${slug}/${item.id}: ${entry} (${verdict.why})`;
				if (verdict.kind === "loi") errors.push(line);
				if (verdict.kind === "canh-bao") warnings.push(line);
			}
		}
	}
	return { errors, warnings };
}

const { errors, warnings } = scan();
for (const line of warnings) console.log(`CẢNH BÁO ${line}`);
for (const line of errors) console.log(`LỖI ${line}`);
console.log(
	`kiem-paths-dong: ${errors.length} lỗi, ${warnings.length} cảnh báo. Bộ lọc hoá cũ theo paths chỉ an toàn với tệp có thật hoặc glob có dấu sao.`,
);
process.exit(errors.length ? 1 : 0);
