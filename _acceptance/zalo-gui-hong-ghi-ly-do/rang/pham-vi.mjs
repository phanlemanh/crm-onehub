import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HO_SO = "_acceptance/zalo-gui-hong-ghi-ly-do";
const LUON_DUOC = ["PRODUCT-MAP.md", "LO-TRINH.html"];
const CHI_THEM = "_acceptance/config.yaml";
const MA_KHONG_DO = 2;

class KhongDo extends Error {}

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new KhongDo(`git ${args.join(" ")}: ${r.stderr.trim()}`);
	return r.stdout;
}

export function docRanhGioi(chu) {
	const dong = chu.split("\n").filter((d) => d.startsWith("- Ranh giới"));
	if (dong.length === 0) throw new KhongDo("contract.md khong co dong Ranh gioi");
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
		`^${mau.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`,
	);
	return re.test(tep);
}

export function kiem(ds, mau) {
	if (ds.length === 0) return { ma: MA_KHONG_DO, chu: "diff rong" };
	const ngoai = ds.filter(
		(t) =>
			!t.startsWith(`${HO_SO}/`) &&
			!LUON_DUOC.includes(t) &&
			t !== CHI_THEM &&
			!mau.some((m) => khop(m, t)),
	);
	if (ngoai.length > 0) return { ma: 1, chu: `ngoai ranh gioi: ${ngoai.join(", ")}` };
	return { ma: 0, chu: `PHAM VI: ${ds.length} tep, 0 ngoai ranh gioi` };
}

try {
	const mau = docRanhGioi(readFileSync(join(GOC, HO_SO, "contract.md"), "utf8"));
	const rong = kiem([], mau);
	if (rong.ma !== MA_KHONG_DO) throw new KhongDo("doi chung diff rong khong ra ma 2");
	console.log(`doi chung: ${rong.chu} -> ma ${rong.ma}`);
	const la = kiem(["apps/agent/agent/lib/nhac-ke-hoach.ts"], mau);
	if (la.chu !== "ngoai ranh gioi: apps/agent/agent/lib/nhac-ke-hoach.ts")
		throw new KhongDo(`doi chung tep la: ${la.chu}`);
	console.log(`doi chung: ${la.chu}`);
	const goc = git(["merge-base", "HEAD", "origin/onehub"]).trim();
	const ds = git(["diff", "--name-only", goc, "HEAD"]).split("\n").filter(Boolean);
	const bot = git(["diff", "-U0", goc, "HEAD", "--", CHI_THEM])
		.split("\n")
		.filter((d) => d.startsWith("-") && !d.startsWith("---"));
	if (bot.length > 0) {
		console.log(`${CHI_THEM} co dong bi xoa hay sua: ${bot.length}`);
		process.exit(1);
	}
	const ket = kiem(ds, mau);
	console.log(ket.chu);
	process.exit(ket.ma);
} catch (loi) {
	if (!(loi instanceof KhongDo)) throw loi;
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(MA_KHONG_DO);
}
