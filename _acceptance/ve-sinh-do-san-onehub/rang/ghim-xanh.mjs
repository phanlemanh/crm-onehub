import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const VONG = "ve-sinh-do-san-onehub";
const BAY = [
	"okr-soat-anh-luot-3",
	"toan-canh-okr",
	"soan-okr-trong-khung",
	"khung-trang-cai-dat",
	"man-cai-dat-noi-tieng-viet",
	"dat-okr-trong-crm",
	"muc-tieu-va-kr",
];

function chay(lenh, thamSo) {
	return spawnSync(lenh, thamSo, {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
	});
}

function git(...thamSo) {
	const r = chay("git", thamSo);
	if (r.status !== 0) {
		console.log(`KHONG DO DUOC: git ${thamSo.join(" ")} — ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

function daKy(slug) {
	const hd = join(GOC, "_acceptance", slug, "contract.md");
	if (!existsSync(hd)) return false;
	const tt = readFileSync(hd, "utf8").match(/^status:\s*(\S+)/m)?.[1];
	return tt === "signed-off" || tt === "machine-cleared";
}

function dongRepinCuoi(runLog) {
	const dong = runLog
		.split("\n")
		.filter(Boolean)
		.flatMap((d) => {
			try {
				return [JSON.parse(d)];
			} catch {
				return [];
			}
		});
	return dong.filter((d) => d.kind === "repin").at(-1) ?? null;
}

function soiHoSo(slug, runLog, cayKhop) {
	const r = dongRepinCuoi(runLog);
	if (!r) return `HONG GHIM ${slug}: khong co dong repin`;
	const suite = Array.isArray(r.suites_exit) ? r.suites_exit : [];
	if (suite.some((m) => m !== 0))
		return `HONG GHIM ${slug}: suites_exit ${JSON.stringify(suite)}`;
	const evals = Object.entries(r.evals_exit ?? {}).filter(([, m]) => m !== 0);
	if (!r.evals_exit) return `HONG GHIM ${slug}: dong repin thieu evals_exit`;
	if (evals.length > 0)
		return `HONG GHIM ${slug}: eval do ${evals.map(([e, m]) => `${e}=${m}`).join(", ")}`;
	if (!cayKhop(r.sha))
		return `HONG GHIM ${slug}: cay ngoai _acceptance o ${String(r.sha).slice(0, 9)} khac dinh nhanh`;
	return null;
}

if (process.argv.includes("--tu-thu")) {
	const gia = [
		JSON.stringify({
			kind: "repin",
			sha: "a",
			suites_exit: [0],
			evals_exit: { E1: 0 },
		}),
		JSON.stringify({ kind: "panel", run_id: "x" }),
	].join("\n");
	const boCuoi = gia
		.split("\n")
		.filter((d) => !d.includes('"repin"'))
		.join("\n");
	const kq = soiHoSo("okr-soat-anh-luot-3", boCuoi, () => true);
	if (kq !== "HONG GHIM okr-soat-anh-luot-3: khong co dong repin") {
		console.log(`HONG tu kiem ghim: run-log bo dong repin ma ra «${kq}»`);
		process.exit(1);
	}
	if (soiHoSo("x", gia, () => true) !== null) {
		console.log("HONG tu kiem ghim: run-log lanh van bi bat");
		process.exit(1);
	}
	console.log("OK tu kiem ghim");
	process.exit(0);
}

const mb = git("merge-base", "HEAD", "origin/onehub").trim();
const trongDiff = new Set(
	git("diff", "--name-only", `${mb}..HEAD`, "--", "_acceptance/")
		.split("\n")
		.filter(Boolean)
		.map((t) => t.split("/")[1]),
);
const tap = [
	...new Set([...BAY, ...[...trongDiff].filter((s) => s !== VONG && daKy(s))]),
];
const cayKhop = (sha) =>
	chay("git", ["diff", "--quiet", sha, "HEAD", "--", ".", ":!_acceptance"])
		.status === 0;

const hong = [];
for (const slug of tap) {
	const tep = join(GOC, "_acceptance", slug, "run-log.jsonl");
	const loi = soiHoSo(
		slug,
		existsSync(tep) ? readFileSync(tep, "utf8") : "",
		cayKhop,
	);
	if (loi) hong.push(loi);
}

const luoi = chay("bash", [
	"scripts/pre-merge-check.sh",
	".",
	"--base",
	"origin/onehub",
]);
const viPham = `${luoi.stdout}${luoi.stderr}`
	.split("\n")
	.filter((d) => d.startsWith("VIOLATION") && !d.includes(`[${VONG}]`));
for (const d of viPham) hong.push(d);

for (const d of hong) console.log(d);
if (hong.length > 0) process.exit(1);
console.log(
	`ghim-xanh: ${tap.length} ho so xanh, pre-merge sach (${tap.join(", ")})`,
);
