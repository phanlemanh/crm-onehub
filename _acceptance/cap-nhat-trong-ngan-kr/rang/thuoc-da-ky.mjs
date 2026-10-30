import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "cap-nhat-trong-ngan-kr";
const MA_TRAN = join(GOC, "_acceptance", HO_SO, "thuoc-da-ky.md");
const SO_VONG = join(GOC, "_acceptance", HO_SO, "decisions.jsonl");
const NHANH_GOC = "origin/onehub";
const NHAN = new Set(["giu", "chuyen-cho-do", "thay-loi-hua"]);
const DAU_HOP = [
	"data-hop-cap-nhat-kr",
	"HopThoaiCapNhatKr",
	"useCapNhatKr",
	"cap-nhat-ngan-kr",
	"hop-thoai-cap-nhat-kr",
];
const VUNG_GREP = ["apps/app/test", "apps/api/test", "_acceptance"];
const BO_QUA = [
	new RegExp(`^_acceptance/${HO_SO}/`),
	/^_acceptance\/[^/]+\/(?!rang\/)/,
];
const MAU_CAU = [
	/loi\.push\(\s*(["'`])((?:\\.|(?!\1).)*?)(?:\$\{|\1)/gs,
	/\|\|\s*(["'`])((?:\\.|(?!\1).)*?)(?:\$\{|\1)/gs,
	/throw new Error\(\s*(["'`])((?:\\.|(?!\1).)*?)(?:\$\{|\1)/gs,
	/sai\.push\(\s*(["'`])((?:\\.|(?!\1).)*?)(?:\$\{|\1)/gs,
	/\bdong\(\s*[^,]+,\s*[^,]+,\s*(["'`])((?:\\.|(?!\1).)*?)(?:\$\{|\1)/gs,
];
const CAU_TOI_THIEU = 6;
const DUOI_MA = /\.(?:mjs|cjs|js|ts|tsx)$/;
const HOI_2 = "d-20261030T064203Z-9";

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});

export function docMaTran(chu) {
	return chu
		.split("\n")
		.filter((d) => /^\|\s*`?[\w./()[\]-]+`?\s*\|/.test(d) && !/^\|\s*-/.test(d))
		.map((d) =>
			d
				.split("|")
				.slice(1, -1)
				.map((o) => o.trim().replace(/`/g, "")),
		)
		.filter((o) => o.length >= 6 && o[0] !== "tệp")
		.map(([tep, ca, dong, khangDinh, nhan, hoSo]) => ({
			tep,
			ca,
			dong,
			khangDinh,
			nhan,
			hoSo,
		}));
}

export function rutKhangDinh(chu) {
	const ra = new Set();
	for (const m of MAU_CAU)
		for (const x of chu.matchAll(m)) {
			const cau = x[2].trim();
			if (cau.length >= CAU_TOI_THIEU) ra.add(cau);
		}
	for (const d of chu.split("\n"))
		if (/\bexpect\(/.test(d)) ra.add(d.trim().replace(/\s+/g, " "));
	return ra;
}

const trich = (o) => [...o.khangDinh.matchAll(/«([^»]+)»/g)].map((m) => m[1]);

function tepCoDauHop(goc) {
	const ra = git(
		"grep",
		"-l",
		...DAU_HOP.flatMap((d) => ["-e", d]),
		goc,
		"--",
		...VUNG_GREP,
	);
	return ra
		.split("\n")
		.filter(Boolean)
		.map((d) => d.replace(`${goc}:`, ""))
		.filter((t) => DUOI_MA.test(t) && !BO_QUA.some((m) => m.test(t)));
}

export function soKhangDinh(tep, chuGoc, chuNay, maTran) {
	const nay = rutKhangDinh(chuNay);
	const daTrich = maTran
		.filter((o) => o.tep === tep && o.nhan !== "giu")
		.flatMap(trich);
	const mat = [...rutKhangDinh(chuGoc)].filter(
		(k) => !nay.has(k) && !daTrich.some((t) => k.includes(t)),
	);
	return mat.length > 0
		? `${tep.split("/").pop()}: mat ${mat.length} assertion khong co dong so (${mat
				.map((k) => k.slice(0, 60))
				.join(" | ")})`
		: null;
}

function hoi2DaTraLoi() {
	const dong = readFileSync(SO_VONG, "utf8").split("\n").filter(Boolean);
	const coHoi = dong.some(
		(d) => d.includes(`"id":"${HOI_2}"`) || d.includes(`"id": "${HOI_2}"`),
	);
	const traLoi = dong.some(
		(d) => d.includes('"stage":"gate1"') && d.includes("Hỏi-2"),
	);
	return coHoi && traLoi;
}

function coDongFix(hoSo) {
	const so = join(GOC, "_acceptance", hoSo, "decisions.jsonl");
	if (!existsSync(so)) return false;
	return readFileSync(so, "utf8")
		.split("\n")
		.filter(Boolean)
		.some((d) => {
			try {
				const o = JSON.parse(d);
				return o.type === "fix" && o.stage === HO_SO && o.decided_by;
			} catch {
				return false;
			}
		});
}

function doiChungDuong(maTran) {
	const o = maTran.find((x) =>
		x.tep.endsWith("hop-cap-nhat-lan-truoc.dom.tsx"),
	);
	if (!o) return "khong co dong hop-cap-nhat-lan-truoc.dom.tsx trong ma tran";
	const chu = readFileSync(join(GOC, o.tep), "utf8");
	const dongExpect = chu.split("\n").find((d) => /\bexpect\(/.test(d));
	const bot = dongExpect ? chu.replace(dongExpect, "") : chu;
	return soKhangDinh(o.tep, chu, bot, []) === null
		? "doi chung duong: xoa mot expect ma rang khong bat"
		: null;
}

const loi = [];
if (!existsSync(MA_TRAN)) {
	console.error(`thuoc-da-ky: thieu ${MA_TRAN}`);
	process.exit(2);
}
const maTran = docMaTran(readFileSync(MA_TRAN, "utf8"));
for (const o of maTran)
	if (!NHAN.has(o.nhan)) loi.push(`${o.tep}: nhan la «${o.nhan}»`);

const dc = doiChungDuong(maTran);
if (dc) {
	console.error(`thuoc-da-ky: ${dc}`);
	process.exit(2);
}

const mb = git("merge-base", "HEAD", NHANH_GOC).trim();
const tepGoc = tepCoDauHop(mb);
const trongMaTran = new Set(maTran.map((o) => o.tep));
for (const t of tepGoc)
	if (!trongMaTran.has(t))
		loi.push(`${t}: co dau hop o merge-base ma thieu dong ma tran`);

for (const tep of trongMaTran) {
	let chuGoc = "";
	try {
		chuGoc = git("show", `${mb}:${tep}`);
	} catch {
		continue;
	}
	const duong = join(GOC, tep);
	const chuNay = existsSync(duong) ? readFileSync(duong, "utf8") : "";
	const mat = soKhangDinh(tep, chuGoc, chuNay, maTran);
	if (mat) loi.push(mat);
}

if (maTran.some((o) => o.nhan === "thay-loi-hua") && !hoi2DaTraLoi())
	loi.push("o thay-loi-hua ma Hoi-2 chua co tra loi cua chu kho");

const hoSoCham = new Set(
	maTran.filter((o) => o.nhan !== "giu").map((o) => o.hoSo),
);
for (const h of hoSoCham)
	if (!coDongFix(h)) loi.push(`${h}: thieu dong so fix mang decided_by`);

for (const l of loi) console.error(`thuoc-da-ky: ${l}`);
const matLang = loi.filter((l) => l.includes("khong co dong so")).length;
console.log(`thuoc-da-ky: ${maTran.length} o, ${matLang} mat lang`);
process.exit(loi.length === 0 ? 0 : 1);
