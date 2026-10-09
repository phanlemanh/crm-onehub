import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HO_SO = "_acceptance/ly-do-can-chinh-tu-soan";
const TIEN_TO_DUOC = [`${HO_SO}/`, "docs/superpowers/"];
const LUON_DUOC = ["PRODUCT-MAP.md", "LO-TRINH.html"];
const CHI_THEM = "_acceptance/config.yaml";
const KHONG_DOI = "apps/api/test/okr-can-chinh.spec.ts";
const BON_TRUONG = ["lyDo", "canCu", "lyDoTuKara", "mucTin"];
const MOC = "<mốc>";
const MA_KHONG_DO = 2;

class KhongDo extends Error {}

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0)
		throw new KhongDo(`git ${args.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout;
}

export function docRanhGioi(chu) {
	const dong = chu.split("\n").filter((d) => d.startsWith("- Ranh giới"));
	if (dong.length === 0)
		throw new KhongDo("contract.md khong co dong Ranh gioi");
	const mau = [];
	let thuMuc = "";
	for (const d of dong) {
		for (const [, ten] of d.matchAll(/`([^`]+)`/g)) {
			if (!/\.[a-z]+$/.test(ten)) continue;
			if (ten.includes("/")) {
				thuMuc = dirname(ten);
				mau.push(ten);
			} else if (thuMuc) {
				mau.push(join(thuMuc, ten));
			}
		}
	}
	return mau;
}

function khop(mau, tep) {
	const re = new RegExp(
		`^${mau
			.replace(/[.+^${}()|[\]\\]/g, "\\$&")
			.replace(MOC, "\\d{14}")
			.replace(/\*/g, "[^/]*")}$`,
	);
	return re.test(tep);
}

export function bonTruong({ them, bo }) {
	const dung = them.every((d) =>
		BON_TRUONG.some((k) => d.slice(1).trim().startsWith(`${k}:`)),
	);
	return bo.length === 0 && dung && them.length > 0
		? null
		: `${KHONG_DOI}: doi ngoai bon truong`;
}

export function kiem(ds, mau) {
	if (ds.length === 0) return { ma: MA_KHONG_DO, chu: "diff rong" };
	const ngoai = ds.filter(
		(t) =>
			!TIEN_TO_DUOC.some((p) => t.startsWith(p)) &&
			!LUON_DUOC.includes(t) &&
			t !== CHI_THEM &&
			!mau.some((m) => khop(m, t)),
	);
	if (ngoai.length > 0)
		return { ma: 1, chu: `ngoai ranh gioi: ${ngoai.join(", ")}` };
	return { ma: 0, chu: `PHAM VI: ${ds.length} tep, 0 ngoai ranh gioi` };
}

try {
	const mau = docRanhGioi(
		readFileSync(join(GOC, HO_SO, "contract.md"), "utf8"),
	);
	const rong = kiem([], mau);
	if (rong.ma !== MA_KHONG_DO)
		throw new KhongDo("doi chung diff rong khong ra ma 2");
	console.log(`doi chung: ${rong.chu} -> ma ${rong.ma}`);
	const sheet = "apps/app/app/(app)/[slug]/okr/objective-sheet.tsx";
	const la = kiem([sheet], mau);
	if (la.chu !== `ngoai ranh gioi: ${sheet}`)
		throw new KhongDo(`doi chung tep la: ${la.chu}`);
	console.log(`doi chung: ${la.chu}`);
	const migration = kiem(
		[
			"packages/db/prisma/migrations/20261010184651_ly_do_can_chinh/migration.sql",
		],
		mau,
	);
	if (migration.ma !== 0)
		throw new KhongDo(`doi chung moc migration: ${migration.chu}`);
	const goc = git(["merge-base", "HEAD", "origin/onehub"]).trim();
	const ds = git(["diff", "--name-only", goc, "HEAD"])
		.split("\n")
		.filter(Boolean);
	const bot = git(["diff", "-U0", goc, "HEAD", "--", CHI_THEM])
		.split("\n")
		.filter((d) => d.startsWith("-") && !d.startsWith("---"));
	if (bot.length > 0) {
		console.log(`${CHI_THEM}: co ${bot.length} dong bo`);
		process.exit(1);
	}
	const xau = bonTruong({
		them: ["+\t\t\tlyDo: null,"],
		bo: ['-\t\t\tunitName: "",'],
	});
	const lanh = bonTruong({
		them: ["+\t\t\tlyDo: null,", '+\t\t\tmucTin: "chua-co-ly-do" as const,'],
		bo: [],
	});
	if (xau !== `${KHONG_DOI}: doi ngoai bon truong` || lanh !== null)
		throw new KhongDo("doi chung bon truong hong");
	console.log(`doi chung: ${xau}`);
	if (ds.includes(KHONG_DOI)) {
		const dong = git(["diff", "-U0", goc, "HEAD", "--", KHONG_DOI])
			.split("\n")
			.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---)/.test(d));
		const loi = bonTruong({
			them: dong.filter((d) => d.startsWith("+")),
			bo: dong.filter((d) => d.startsWith("-")),
		});
		if (loi) {
			console.log(loi);
			process.exit(1);
		}
	}
	const ket = kiem(ds, mau);
	console.log(ket.chu);
	process.exit(ket.ma);
} catch (loi) {
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? MA_KHONG_DO : 1);
}
