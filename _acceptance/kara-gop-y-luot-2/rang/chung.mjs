import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const RA = path.join(ROOT, ".acceptance-runs/kara-gop-y-luot-2");

function moiTruongSach() {
	const env = { ...process.env };
	for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
	return env;
}

export const chayVo = (lenh) =>
	spawnSync("bash", ["-c", lenh], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20, env: moiTruongSach() });

export const bam = (tep) => createHash("sha256").update(fs.readFileSync(path.join(ROOT, tep))).digest("hex");

export function lenhCauHinh(khoa) {
	const cfg = Bun.YAML.parse(fs.readFileSync(path.join(ROOT, "_acceptance/config.yaml"), "utf8"));
	const lenh = cfg.executors?.test?.[khoa] ?? cfg.executors?.script?.[khoa];
	if (!lenh) throw new Error(`thieu executors.*.${khoa} trong _acceptance/config.yaml`);
	return lenh;
}

export function ghiRa(ten, text) {
	fs.mkdirSync(RA, { recursive: true });
	const p = path.join(RA, ten);
	fs.writeFileSync(p, text);
	return p;
}
