import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const RA = path.join(ROOT, ".acceptance-runs/ly-do-tu-choi-nop-theo-locale");
export const SOAN = "apps/app/app/(app)/[slug]/okr/soan";
export const NOP = "apps/agent-okr/agent/lib/nop-ban-nhap.ts";
export const VALIDATION = "packages/validation/src/okr-cuoc-soan.ts";

export function moiTruongSach() {
	const env = { ...process.env };
	for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
	return env;
}

export const git = (args) =>
	execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20, env: moiTruongSach() });

export const chayVo = (lenh) =>
	spawnSync("bash", ["-c", lenh], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20, env: moiTruongSach() });

export const docTep = (tep) => fs.readFileSync(path.join(ROOT, tep), "utf8");
export const bam = (tep) => createHash("sha256").update(fs.readFileSync(path.join(ROOT, tep))).digest("hex");
export const diemRe = () => git(["merge-base", "HEAD", "origin/onehub"]).trim();

export function lenhCauHinh(khoa) {
	const cfg = Bun.YAML.parse(docTep("_acceptance/config.yaml"));
	const lenh = cfg.executors?.test?.[khoa] ?? cfg.executors?.script?.[khoa];
	if (!lenh) throw new Error(`thieu executors.*.${khoa} trong _acceptance/config.yaml`);
	return lenh;
}

export function doiCo(argv) {
	const co = {};
	for (let i = 0; i < argv.length; i++) {
		if (!argv[i].startsWith("--")) continue;
		const k = argv[i].slice(2);
		co[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
	}
	return co;
}

export function ghiRa(ten, text) {
	fs.mkdirSync(RA, { recursive: true });
	const p = path.join(RA, ten);
	fs.writeFileSync(p, text);
	return p;
}

export function ketLuan(sai) {
	console.log(`KET LUAN: ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
	process.exit(sai ? 1 : 0);
}
