import { spawnSync } from "node:child_process";
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const OXLINT = join(GOC, "node_modules", ".bin", "oxlint");
const SAN_QUET = 50;
const LUAT = [
	"onehub(khong-re-theo-ten-giai-doan)",
	"onehub(khong-dung-giai-doan-goc)",
];
const THU_MUC = [
	"apps/api/src",
	"apps/agent/agent",
	"apps/app/app",
	"apps/app/components",
	"apps/app/lib",
	"packages/db/src",
	"packages/telemetry/src",
];
const TRU = [
	"packages/db/src/generated/",
	"apps/api/src/generated/",
	"apps/app/app/proto/",
	"packages/db/src/giai-doan.ts",
];
const DUOI = [".ts", ".tsx", ".mjs", ".js"];
const MIEN = new Map([
	[
		"onehub/khong-re-theo-ten-giai-doan",
		new Set(["packages/db/src/giai-doan.ts", "apps/app/app/proto/**"]),
	],
	[
		"onehub/khong-dung-giai-doan-goc",
		new Set([
			"packages/db/src/giai-doan.ts",
			"apps/app/app/proto/**",
			"packages/telemetry/src/allowlist.ts",
		]),
	],
]);
const MOI = 'export const moi = ["CLOSED_WON", "GIAI_DOAN_GOC"];\n';

function dung(ma, cau) {
	console.log(cau);
	process.exit(ma);
}

function oxlint(cwd, dich = THU_MUC, them = []) {
	const r = spawnSync(OXLINT, ["--format=json", ...them, ...dich], {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});
	try {
		return JSON.parse(r.stdout);
	} catch {
		return dung(
			2,
			`KHONG DO DUOC: oxlint ma ${r.status} khong tra JSON — ${(r.stderr ?? "").trim().slice(0, 400)}`,
		);
	}
}

const cuaLuat = (ketQua) =>
	ketQua.diagnostics.filter((d) => LUAT.includes(d.code));

function kiemMoi() {
	const cay = mkdtempSync(join(tmpdir(), "krtt-moi-"));
	try {
		copyFileSync(join(GOC, ".oxlintrc.json"), join(cay, ".oxlintrc.json"));
		for (const t of ["tools", "node_modules"])
			symlinkSync(join(GOC, t), join(cay, t));
		for (const d of THU_MUC) {
			mkdirSync(join(cay, d), { recursive: true });
			writeFileSync(join(cay, d, "moi-krtt.ts"), MOI);
		}
		const thay = cuaLuat(oxlint(cay));
		const thieu = THU_MUC.flatMap((d) =>
			LUAT.filter(
				(l) =>
					!thay.some((x) => x.code === l && x.filename === `${d}/moi-krtt.ts`),
			).map((l) => `${d} ${l}`),
		);
		if (thieu.length > 0)
			dung(
				2,
				`KHONG DO DUOC: luat kho khong bat o ${thieu.join(", ")} — cau hinh .oxlintrc.json khong bat luat o day`,
			);
	} finally {
		rmSync(cay, { recursive: true, force: true });
	}
}

function git(...a) {
	const r = spawnSync("git", ["-C", GOC, ...a], { encoding: "utf8" });
	return { ma: r.status, ra: (r.stdout ?? "").trim() };
}

const laLoi = (muc) => (Array.isArray(muc) ? muc[0] : muc) === "error";

function kiemDuongTat() {
	const tat = [];
	const cauHinh = JSON.parse(readFileSync(join(GOC, ".oxlintrc.json"), "utf8"));
	for (const o of cauHinh.overrides ?? [])
		for (const [luat, mien] of MIEN) {
			const muc = o.rules?.[luat];
			if (muc === undefined || laLoi(muc)) continue;
			for (const f of o.files ?? [])
				if (!mien.has(f)) tat.push(`overrides tat ${luat} o ${f}`);
		}
	const long = git("ls-files", "--", "*oxlintrc*")
		.ra.split("\n")
		.filter((t) => t && t !== ".oxlintrc.json");
	for (const t of long) tat.push(`cau hinh long ${t}`);
	const chiThi = git(
		"grep",
		"-n",
		"-E",
		"(oxlint|eslint)-disable",
		"--",
		...THU_MUC,
	);
	if (chiThi.ma === 0)
		for (const d of chiThi.ra.split("\n")) tat.push(`chi thi tat ${d}`);
	if (tat.length > 0)
		dung(2, `KHONG DO DUOC: luat kho bi tat cuc bo — ${tat.join("; ")}`);
}

kiemDuongTat();
kiemMoi();
const tepTheoDoi = git("ls-files", "--", ...THU_MUC)
	.ra.split("\n")
	.filter((t) => DUOI.some((d) => t.endsWith(d)))
	.filter((t) => !TRU.some((m) => t.startsWith(m)));

function quetKhongBoQua() {
	const cay = mkdtempSync(join(tmpdir(), "krtt-quet-"));
	try {
		const cauHinh = JSON.parse(
			readFileSync(join(GOC, ".oxlintrc.json"), "utf8"),
		);
		const { ignorePatterns: _bo, ...conLai } = cauHinh;
		writeFileSync(join(cay, ".oxlintrc.json"), JSON.stringify(conLai));
		for (const t of ["tools", "node_modules"])
			symlinkSync(join(GOC, t), join(cay, t));
		for (const t of tepTheoDoi) {
			mkdirSync(dirname(join(cay, t)), { recursive: true });
			copyFileSync(join(GOC, t), join(cay, t));
		}
		return oxlint(cay, tepTheoDoi);
	} finally {
		rmSync(cay, { recursive: true, force: true });
	}
}

const ketQua = quetKhongBoQua();
console.log(`so tep da quet: ${ketQua.number_of_files}`);
if (ketQua.number_of_files < SAN_QUET)
	dung(
		2,
		`KHONG DO DUOC: chi quet ${ketQua.number_of_files} tep (< ${SAN_QUET})`,
	);
const hong = cuaLuat(ketQua).map((d) => {
	const tu = d.message.match(/«([^»]+)»/)?.[1] ?? d.message;
	return `HONG ${d.filename}:${d.labels?.[0]?.span?.line ?? "?"}: ${tu}`;
});
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
