import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CHO = [
	"apps/agent/agent/tools/tro-ly-okr-ngoai.ts",
	"apps/agent/agent/lib/okr/config.ts",
	"apps/agent/test/okr-uy-quyen-ngoai.spec.ts",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	"_acceptance/config.yaml",
	"apps/agent/agent/lib/zalo-config.ts",
	"packages/telemetry/src/allowlist.ts",
	"apps/app/lib/agent-transcript.ts",
	"apps/app/lib/messages/kara-ban-ghi.ts",
];
const TIEN_TO_HO_SO = "_acceptance/zalo-hoi-okr-khong-chet/";
const CHI_THEM = ["_acceptance/config.yaml"];
const DONG_THEM = {
	"apps/agent/agent/lib/zalo-config.ts": 1,
	"packages/telemetry/src/allowlist.ts": 1,
	"apps/app/lib/agent-transcript.ts": 1,
	"apps/app/lib/messages/kara-ban-ghi.ts": 2,
};
const TEN_CONG_CU = "tro-ly-okr-ngoai";

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

function ngoaiRanhGioi(ds) {
	return ds.filter((t) => !CHO.includes(t) && !t.startsWith(TIEN_TO_HO_SO));
}

function dongDoi(base, tep) {
	const dong = git(["diff", "-U0", base, "HEAD", "--", tep])
		.split("\n")
		.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---)/.test(d));
	return { them: dong.filter((d) => d.startsWith("+")), bo: dong.filter((d) => d.startsWith("-")) };
}

function kiemDanhSach(ds) {
	if (ds.length === 0) return { ma: 2, dong: ["diff rong"] };
	const ngoai = ngoaiRanhGioi(ds);
	return { ma: ngoai.length > 0 ? 1 : 0, dong: ngoai.map((t) => `ngoai ranh gioi: ${t}`) };
}

function doiChung() {
	const rong = kiemDanhSach([]);
	if (rong.ma !== 2 || rong.dong[0] !== "diff rong") return "doi chung rong khong thoat 2";
	console.log("doi chung: diff rong -> ma 2");
	const a = ngoaiRanhGioi(["apps/agent/test/okr-uy-quyen.spec.ts"]);
	const b = ngoaiRanhGioi(["apps/agent/agent/lib/zalo-chi-dan.ts"]);
	if (a[0] !== "apps/agent/test/okr-uy-quyen.spec.ts") return "doi chung okr-uy-quyen.spec.ts khong bi bat";
	if (b[0] !== "apps/agent/agent/lib/zalo-chi-dan.ts") return "doi chung zalo-chi-dan.ts khong bi bat";
	console.log(`doi chung: ngoai ranh gioi: ${a[0]}`);
	console.log(`doi chung: ngoai ranh gioi: ${b[0]}`);
	return null;
}

const loiDoiChung = doiChung();
if (loiDoiChung) {
	console.error(loiDoiChung);
	process.exit(1);
}
const base = git(["merge-base", "HEAD", "origin/onehub"]).trim();
const ds = git(["diff", "--name-only", base, "HEAD"]).split("\n").filter(Boolean);
const kiem = kiemDanhSach(ds);
if (kiem.ma === 2) {
	console.error(kiem.dong[0]);
	process.exit(2);
}
const loi = [...kiem.dong];
for (const tep of CHI_THEM.filter((t) => ds.includes(t)))
	if (dongDoi(base, tep).bo.length > 0) loi.push(`${tep}: co dong bo`);
for (const [tep, can] of Object.entries(DONG_THEM).filter(([t]) => ds.includes(t))) {
	const { them, bo } = dongDoi(base, tep);
	if (them.length !== can || bo.length !== 0 || !them.every((d) => d.includes(TEN_CONG_CU)))
		loi.push(`${tep}: khong dung dong them da khai`);
}
if (loi.length > 0) {
	for (const d of loi) console.error(d);
	process.exit(1);
}
console.log(`PHAM VI: ${ds.length} tep, 0 ngoai ranh gioi`);
