import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.DTOC_GOC ?? join(HERE, "..", "..", "..");
const TAP_QUET =
	/^(apps\/app\/(app|components|lib)\/.*\.tsx?|apps\/api\/src\/.*\.ts|packages\/[^/]+\/src\/.*\.tsx?|apps\/agent\/agent\/lib\/zalo-[^/]*\.ts|apps\/app\/public\/site\.webmanifest)$/;
const TAP_LOAI_TRU = [
	/^apps\/app\/app\/\(landing\)\/page\.tsx$/,
	/^apps\/app\/components\/landing\//,
	/^apps\/app\/app\/proto\//,
	/^apps\/api\/src\/create-app\.ts$/,
	/\/test\//,
	/\.(spec|test)\.tsx?$/,
	/\.dom\.tsx$/,
];
const NOI = "\u0000";
const NGOAI_LE = [
	`packages/auth/src/auth.ts${NOI}This CRM is private. Sign in with your @`,
	`packages/auth/src/auth.ts${NOI}This CRM is private. That address is not on the allow-list.`,
	`packages/db/src/settings.ts${NOI}CRM`,
	`packages/db/src/safe-fetch.ts${NOI}Mozilla/5.0 (compatible; CRM/1.0)`,
	`packages/validation/src/tai-lieu-hoi.ts${NOI}CRM`,
	`packages/db/src/tai-lieu-hoi.ts${NOI}CRM`,
	`apps/api/src/tai-lieu/tai-lieu-hoi.service.ts${NOI}CRM`,
];
const TEN_CU = /\bCRM\b/;
const TIEN_TO = "OneHub ";

const dong = [];
function ghi(dat, chu) {
	dong.push(dat);
	console.log(`${dat ? "DUNG" : "SAI"} ${chu}`);
}

function hien(khoa) {
	return khoa.replace(NOI, ": ");
}

export function docChuoi(tep, noiDung) {
	if (tep.endsWith(".webmanifest")) {
		const { name, short_name: tenNgan } = JSON.parse(noiDung);
		return [name, tenNgan].filter(Boolean).map((chu) => ({ dong: 1, chu: String(chu) }));
	}
	const nguon = ts.createSourceFile(
		tep,
		noiDung,
		ts.ScriptTarget.Latest,
		true,
		tep.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const ra = [];
	const di = (n) => {
		if (
			ts.isStringLiteral(n) ||
			ts.isNoSubstitutionTemplateLiteral(n) ||
			ts.isTemplateHead(n) ||
			ts.isTemplateMiddle(n) ||
			ts.isTemplateTail(n) ||
			ts.isJsxText(n)
		) {
			const { line } = nguon.getLineAndCharacterOfPosition(n.getStart());
			ra.push({ dong: line + 1, chu: n.text });
		}
		ts.forEachChild(n, di);
	};
	di(nguon);
	return ra;
}

export function viPhamLuatTen(chu) {
	for (const m of chu.matchAll(/\bCenter\b/g)) {
		if (chu.slice(Math.max(0, m.index - TIEN_TO.length), m.index) !== TIEN_TO) {
			return "Center tran";
		}
	}
	if (/trung tâm/i.test(chu)) return "dich ten";
	if (/\bthe OneHub Center\b/i.test(chu)) return "the OneHub Center";
	return null;
}

function tepQuet(goc) {
	return execFileSync("git", ["-C", goc, "ls-files"], { encoding: "utf8" })
		.split("\n")
		.filter((t) => TAP_QUET.test(t) && !TAP_LOAI_TRU.some((r) => r.test(t)));
}

function quet(goc) {
	const con = [];
	const thayNgoaiLe = new Set();
	const phamLuat = [];
	for (const tep of tepQuet(goc)) {
		const noiDung = readFileSync(join(goc, tep), "utf8");
		for (const { dong: d, chu } of docChuoi(tep, noiDung)) {
			const khoa = `${tep}${NOI}${chu}`;
			if (TEN_CU.test(chu)) {
				if (NGOAI_LE.includes(khoa)) thayNgoaiLe.add(khoa);
				else con.push({ tep, dong: d });
			}
			const loi = viPhamLuatTen(chu);
			if (loi) phamLuat.push({ tep, dong: d, loi });
		}
	}
	return { con, thayNgoaiLe, phamLuat };
}

function doiChungLuatTen() {
	const maTran = [
		["Sign in to OneHub Center", null],
		["Open Center", "Center tran"],
		["the OneHub Center reads", "the OneHub Center"],
		["Trung tâm OneHub", "dich ten"],
	];
	for (const [chu, ky] of maTran) {
		const ra = viPhamLuatTen(chu);
		ghi(ra === ky, `doi chung luat ten «${chu}» -> ${ra ?? "hop le"}`);
	}
}

const HOP_DONG_LUOT = "_acceptance/doi-ten-onehub-center/contract.md";

function gitDoc(...doi) {
	return execFileSync("git", ["-C", GOC, ...doi], { encoding: "utf8" }).trim();
}

function mergeBase() {
	const mocChung = gitDoc("merge-base", "HEAD", "origin/onehub");
	const gopLuot = gitDoc(
		"log",
		"--first-parent",
		"--diff-filter=A",
		"--format=%H",
		mocChung,
		"--",
		HOP_DONG_LUOT,
	)
		.split("\n")
		.at(-1);
	return gopLuot === "" ? mocChung : gitDoc("rev-parse", `${gopLuot}^1`);
}

function soNgoaiLe() {
	const khai = JSON.parse(
		readFileSync(join(HERE, "ngoai-le.json"), "utf8"),
	).map((m) => `${m.tep}${NOI}${m.chu}`);
	const la = khai.filter((k) => !NGOAI_LE.includes(k));
	const thieu = NGOAI_LE.filter((k) => !khai.includes(k));
	for (const k of la) ghi(false, `ngoai le la: ${hien(k)}`);
	for (const k of thieu) ghi(false, `thieu ngoai le: ${hien(k)}`);
	if (la.length === 0 && thieu.length === 0) {
		ghi(true, `ngoai-le.json bang dung ${NGOAI_LE.length} muc da duyet`);
	}
}

function soHead() {
	const head = quet(GOC);
	for (const c of head.con) ghi(false, `con CRM: ${c.tep}:${c.dong}`);
	if (head.con.length === 0) ghi(true, "khong con CRM ngoai ngoai le");
	for (const k of NGOAI_LE) {
		const co = head.thayNgoaiLe.has(k);
		ghi(co, `${co ? "ngoai le con dung cho" : "ngoai le mo coi"}: ${hien(k)}`);
	}
	for (const p of head.phamLuat) ghi(false, `${p.loi}: ${p.tep}:${p.dong}`);
	if (head.phamLuat.length === 0) ghi(true, "luat ten dat tren moi chuoi");
}

function soBase() {
	const tam = mkdtempSync(join(tmpdir(), "dtoc-base-"));
	rmSync(tam, { recursive: true, force: true });
	try {
		execFileSync(
			"git",
			["-C", GOC, "worktree", "add", "--detach", tam, mergeBase()],
			{
				stdio: "ignore",
			},
		);
		const base = new Set(quet(tam).con.map((c) => c.tep));
		const ky = new Set(
			readFileSync(join(HERE, "tep-mang-ten-cu.txt"), "utf8")
				.split("\n")
				.filter(Boolean),
		);
		const thieu = [...ky].filter((t) => !base.has(t));
		const thua = [...base].filter((t) => !ky.has(t));
		for (const t of thieu) ghi(false, `thieu: ${t}`);
		for (const t of thua) ghi(false, `thua: ${t}`);
		if (thieu.length === 0 && thua.length === 0) {
			ghi(true, `merge-base goi ten dung ${ky.size} tep`);
		}
	} finally {
		execFileSync("git", ["-C", GOC, "worktree", "remove", "--force", tam], {
			stdio: "ignore",
		});
	}
}

function main() {
	doiChungLuatTen();
	soNgoaiLe();
	soHead();
	soBase();
	const sai = dong.filter((d) => !d).length;
	console.log(`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI`);
	process.exit(sai === 0 ? 0 : 1);
}

if (import.meta.main) {
	try {
		main();
	} catch (loi) {
		console.log(`KHONG DO DUOC: ${loi.message}`);
		process.exit(2);
	}
}
