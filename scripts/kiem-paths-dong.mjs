#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ACCEPTANCE = join(ROOT, "_acceptance");
const SPECS = join(ROOT, "docs", "superpowers", "specs");
const BANG_MO = "<!-- <<<BANG-THAY-THE -->";
const BANG_DONG = "<!-- BANG-THAY-THE>>> -->";
const DONG_BANG = /^\|\s*([\w-]+\/E\d+)\s*\|.*\|\s*([^|]*?)\s*\|\s*$/;
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

function nguonBangThayThe() {
	const nguon = [];
	for (const slug of readdirSync(ACCEPTANCE).sort()) {
		const file = join(ACCEPTANCE, slug, "contract.md");
		if (existsSync(file)) nguon.push([slug, file]);
	}
	if (existsSync(SPECS)) {
		for (const ten of readdirSync(SPECS).sort()) {
			if (ten.endsWith(".md")) nguon.push([ten, join(SPECS, ten)]);
		}
	}
	return nguon;
}

function bangThayThe() {
	const thay = new Map();
	for (const [ten, file] of nguonBangThayThe()) {
		const text = readFileSync(file, "utf8");
		const khoi = text.split(BANG_MO)[1]?.split(BANG_DONG)[0];
		if (!khoi) continue;
		for (const dong of khoi.split("\n")) {
			const khop = dong.match(DONG_BANG);
			if (khop && !thay.has(khop[1])) {
				thay.set(khop[1], `${ten} ${khop[2]}`.trim());
			}
		}
	}
	return thay;
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
	const thay = bangThayThe();
	const errors = [];
	const warnings = [];
	const replaced = [];
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
				const thayBoi = thay.get(`${slug}/${item.id}`);
				if (verdict.kind === "loi") errors.push(line);
				if (verdict.kind === "canh-bao" && thayBoi) {
					replaced.push(`${line}, eval đã bị thay: ${thayBoi}`);
				} else if (verdict.kind === "canh-bao") warnings.push(line);
			}
		}
	}
	return { errors, warnings, replaced };
}

const { errors, warnings, replaced } = scan();
for (const line of replaced) console.log(`ĐÃ THAY ${line}`);
for (const line of warnings) console.log(`CẢNH BÁO ${line}`);
for (const line of errors) console.log(`LỖI ${line}`);
console.log(
	`kiem-paths-dong: ${errors.length} lỗi, ${warnings.length} cảnh báo, ${replaced.length} mục của eval đã bị thay theo bảng thay thế. Bộ lọc hoá cũ theo paths chỉ an toàn với tệp có thật hoặc glob có dấu sao.`,
);
process.exit(errors.length ? 1 : 0);
