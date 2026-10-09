import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const HO_SO = "_acceptance/khoa-eve-khong-tranh/";
const BAN_DO = ["PRODUCT-MAP.md", "LO-TRINH.html"];
const CHI_THEM = "_acceptance/config.yaml";
const MA_KHONG_DO = 2;

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.log(`KHONG DO DUOC: git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(MA_KHONG_DO);
	}
	return r.stdout;
}

const duoc = (t) =>
	t === "apps/agent-okr/test/support/khoi-dong.ts" ||
	/^apps\/agent-okr\/test\/khoa-eve[^/]*\.spec\.ts$/.test(t) ||
	t.startsWith(HO_SO) ||
	t === CHI_THEM ||
	BAN_DO.includes(t);

function kiem(ds) {
	if (ds.length === 0) return { ma: MA_KHONG_DO, chu: "diff rong" };
	const ngoai = ds.filter((t) => !duoc(t));
	return ngoai.length > 0
		? { ma: 1, chu: `ngoai ranh gioi: ${ngoai.join(", ")}` }
		: { ma: 0, chu: `PHAM VI: ${ds.length} tep, 0 ngoai ranh gioi` };
}

const rong = kiem([]);
const la = kiem(["apps/agent-okr/agent/agent.ts"]);
if (rong.ma !== MA_KHONG_DO || la.chu !== "ngoai ranh gioi: apps/agent-okr/agent/agent.ts") {
	console.log("doi chung hong");
	process.exit(1);
}
console.log(`doi chung: ${rong.chu} -> ma ${rong.ma}`);
console.log(`doi chung: ${la.chu}`);

const base = git(["merge-base", "HEAD", "origin/onehub"]).trim();
const ds = git(["diff", "--name-only", base, "HEAD"]).split("\n").filter(Boolean);
const bo = git(["diff", "-U0", base, "HEAD", "--", CHI_THEM])
	.split("\n")
	.filter((d) => d.startsWith("-") && !d.startsWith("---"));
if (bo.length > 0) {
	console.log(`${CHI_THEM}: co ${bo.length} dong bo`);
	process.exit(1);
}
const ket = kiem(ds);
console.log(ket.chu);
process.exit(ket.ma);
