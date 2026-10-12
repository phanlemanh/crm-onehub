import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const THU_MUC_GITHUB = ".github/";
const TEP_LUOI = join(KHO, "scripts", "pre-merge-check.sh");
const TEP_DOC_DS = join(KHO, "lib", "workspace-record.cjs");
const RUT_HAM = `eval "$(sed -n '/^glob_variants() {/,/^}/p;/^match_globs() {/,/^}/p' "$1")"; type match_globs >/dev/null 2>&1 || exit 3; while IFS= read -r f; do [ -n "$f" ] || continue; if match_globs "$f" "$2"; then printf '%s\\n' "$f"; fi; done`;

export function quyetDinh({ suKien, nhap, tep, laT1 }) {
	if (suKien !== "pull_request") return { nang: true, lyDo: "khong-phai-pr" };
	if (nhap === "true") return { nang: false, lyDo: "nhap" };
	if (tep.length === 0) return { nang: true, lyDo: "khong-co-tep" };
	if (tep.some((t) => t.startsWith(THU_MUC_GITHUB))) return { nang: true, lyDo: "cham-github" };
	if (tep.every(laT1)) return { nang: false, lyDo: "chi-t1" };
	return { nang: true, lyDo: "co-tep-nang" };
}

export function docGlobT1(goc) {
	const { configList } = createRequire(import.meta.url)(TEP_DOC_DS);
	const globs = configList(readFileSync(join(goc, "_acceptance", "config.yaml"), "utf8"), "t1_skip_globs");
	if (globs.length === 0) throw new Error("t1_skip_globs rong");
	return globs;
}

export function tepT1(globs, tep) {
	const r = spawnSync("bash", ["-c", RUT_HAM, "phan-loai", TEP_LUOI, globs.join("\n")], { input: `${tep.join("\n")}\n`, encoding: "utf8" });
	if (r.error) throw new Error(`bash khong chay duoc: ${r.error.code ?? r.error.message}`);
	if (r.status !== 0) throw new Error(`khong rut duoc bo khop glob cua pre-merge-check (ma ${r.status})`);
	return new Set(r.stdout.split("\n").filter(Boolean));
}

function git(goc, ...args) {
	const r = spawnSync("git", args, { cwd: goc, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${args[0]} hong: ${(r.stderr || "").trim().split("\n")[0]}`);
	return r.stdout;
}

export function tepThayDoi(goc) {
	const cha = git(goc, "rev-list", "--parents", "-n", "1", "HEAD").trim().split(" ").length - 1;
	if (cha !== 2) throw new Error(`HEAD co ${cha} cha, khong phai commit hop nhat cua PR`);
	return git(goc, "diff", "--name-only", "--no-renames", "HEAD^1", "HEAD").split("\n").filter(Boolean);
}

export function phanLoai({ goc, suKien, nhap }) {
	try {
		if (suKien !== "pull_request" || nhap === "true") return quyetDinh({ suKien, nhap, tep: [], laT1: () => false });
		const tep = tepThayDoi(goc);
		const t1 = tepT1(docGlobT1(goc), tep);
		return { ...quyetDinh({ suKien, nhap, tep, laT1: (t) => t1.has(t) }), tep };
	} catch (e) {
		return { nang: true, lyDo: `loi: ${String(e.message).replace(/\s+/g, " ").trim()}` };
	}
}

function chay() {
	const i = process.argv.indexOf("--goc");
	const goc = i >= 0 ? resolve(process.argv[i + 1]) : KHO;
	const kq = phanLoai({ goc, suKien: process.env.SU_KIEN ?? "", nhap: process.env.NHAP ?? "" });
	const dong = `nang=${kq.nang}\nly_do=${kq.lyDo}\n`;
	process.stdout.write(dong);
	if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, dong);
	if (process.env.GITHUB_STEP_SUMMARY) {
		const ds = kq.tep?.length ? `\n\nTệp của PR (${kq.tep.length}):\n\n${kq.tep.slice(0, 50).map((t) => `- \`${t}\``).join("\n")}` : "";
		appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Phân loại: **${kq.nang ? "nặng" : "nhẹ"}** — \`${kq.lyDo}\`${ds}\n`);
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) chay();
