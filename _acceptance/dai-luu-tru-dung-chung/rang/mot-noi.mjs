import { spawnSync } from "node:child_process";
import {
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const APP = join(GOC, "apps", "app");
const BO_QUA = new Set(["node_modules", ".next", ".turbo", "test"]);
const DAU_HIEU = ["data-dai-luu-tru", "data-khoa-luu-tru"];
const CHAN = [
	"onPointerDownCapture",
	"onMouseDownCapture",
	"onClickCapture",
	"onKeyDownCapture",
];
const NGUON_MANH = "@crm/ui/components/dai-luu-tru";
const NGAN = ["company-sheet.tsx", "contact-sheet.tsx", "deal-sheet.tsx"].map(
	(t) => join(APP, "components", "crm", "record-sheet", t),
);
const HANH_DONG = join(
	APP,
	"components",
	"crm",
	"record-sheet",
	"record-actions.tsx",
);
const QUET_TOI_THIEU = 100;
const CHIEU_DO = process.argv.includes("--chieu-do");

function duyet(thu, ra) {
	for (const muc of readdirSync(thu, { withFileTypes: true })) {
		if (muc.isDirectory()) {
			if (!BO_QUA.has(muc.name) || thu !== APP) duyet(join(thu, muc.name), ra);
			continue;
		}
		if (/\.(ts|tsx)$/.test(muc.name)) ra.push(join(thu, muc.name));
	}
	return ra;
}

function nhapTu(chu, ten) {
	const re = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;
	for (const m of chu.matchAll(re)) {
		if (m[2] !== NGUON_MANH) continue;
		if (
			m[1]
				.split(",")
				.map((s) => s.trim())
				.includes(ten)
		)
			return true;
	}
	return false;
}

function viPham(tep, chu) {
	const loi = [];
	for (const d of DAU_HIEU) if (chu.includes(d)) loi.push(`${tep} (${d})`);
	if (chu.includes("<fieldset") && CHAN.some((c) => chu.includes(c)))
		loi.push(`${tep} (<fieldset kem bo chan capture)`);
	return loi;
}

function do_(loi) {
	console.log(
		`dai-luu-tru-dung-chung mot-noi: do — apps/app con tu dung dai luu tru: ${loi.join("; ")}`,
	);
	process.exit(1);
}

if (CHIEU_DO) {
	const moc = spawnSync("git", ["merge-base", "HEAD", "origin/onehub"], {
		cwd: GOC,
		encoding: "utf8",
	}).stdout.trim();
	const cu = spawnSync("git", ["show", `${moc}:${relative(GOC, HANH_DONG)}`], {
		cwd: GOC,
		encoding: "utf8",
	}).stdout;
	const tam = mkdtempSync(join(tmpdir(), "dlt-mot-noi-"));
	const banSao = join(tam, "record-actions.tsx");
	writeFileSync(banSao, cu);
	const loi = viPham(
		"record-actions.tsx (ban onehub truoc vong)",
		readFileSync(banSao, "utf8"),
	);
	rmSync(tam, { recursive: true, force: true });
	if (loi.length > 0) do_(loi);
	console.log("dai-luu-tru-dung-chung mot-noi: dat");
	process.exit(0);
}

const tep = duyet(APP, []);
const loi = [];
if (tep.length <= QUET_TOI_THIEU) loi.push(`chi quet ${tep.length} tep`);
for (const t of tep)
	loi.push(...viPham(relative(GOC, t), readFileSync(t, "utf8")));
for (const n of NGAN) {
	if (!nhapTu(readFileSync(n, "utf8"), "KhoaLuuTru"))
		loi.push(`${relative(GOC, n)} khong nhap KhoaLuuTru tu ${NGUON_MANH}`);
}
const hanhDong = readFileSync(HANH_DONG, "utf8");
if (!nhapTu(hanhDong, "DaiLuuTru") || !hanhDong.includes("<DaiLuuTru"))
	loi.push(`${relative(GOC, HANH_DONG)} khong dung DaiLuuTru tu ${NGUON_MANH}`);
if (loi.length > 0) do_(loi);
console.log(`dai-luu-tru-dung-chung mot-noi: dat (${tep.length} tep)`);
