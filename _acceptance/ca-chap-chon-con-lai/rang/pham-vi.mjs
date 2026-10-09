import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const TASKS = "apps/agent/test/tasks.integration.spec.ts";
const GIEO = "apps/agent-okr/test/support/gieo.ts";
const GOI_SPEC = "apps/agent-okr/test/goi-soan.integration.spec.ts";
const CONFIG = "_acceptance/config.yaml";
const CHO = [TASKS, GIEO, GOI_SPEC, CONFIG, "PRODUCT-MAP.md", "LO-TRINH.html"];
const TIEN_TO_CHO = ["_acceptance/ca-chap-chon-con-lai/", "docs/superpowers/"];
const CA_THAT = [
	"retireExhausted still retires exactly the limit",
	"claimDue still claims exactly the limit",
];
const DOI_CHUNG_DONG = "expect(await probe()).toHaveLength(rows);";
const SO_DOI_CHUNG = 2;
const DONG_MA = /^-export const ma = /;
const DONG_MA_THEM = /^\+export const ma = /;
const DAU_CHU_CAI = "const chuCai = ";

function git(args) {
	const r = spawnSync("git", args, {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	if (r.status !== 0) {
		console.error(`git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

const dongBo = (diff) =>
	diff.split("\n").filter((d) => d.startsWith("-") && !d.startsWith("---"));
const dongThem = (diff) =>
	diff.split("\n").filter((d) => d.startsWith("+") && !d.startsWith("+++"));

function khoiChuCai(chu) {
	const dong = chu.split("\n");
	const dau = dong.findIndex((d) => d.startsWith(DAU_CHU_CAI));
	if (dau < 0) return new Set();
	const cuoi = dong.findIndex((d, i) => i > dau && d === "};");
	return new Set(cuoi < 0 ? [] : dong.slice(dau, cuoi + 1));
}

export function kiemDanhSach(ds) {
	if (ds.length === 0) return { ma: 2, dong: ["diff rong"] };
	const ngoai = ds.filter(
		(t) => !CHO.includes(t) && !TIEN_TO_CHO.some((p) => t.startsWith(p)),
	);
	return {
		ma: ngoai.length > 0 ? 1 : 0,
		dong: ngoai.map((t) => `ngoai ranh gioi: ${t}`),
	};
}

function thanCa(chu, ten) {
	const dau = chu.indexOf(`it("${ten}"`);
	if (dau < 0) return null;
	const cuoi = chu.indexOf("\n\t});", dau);
	return cuoi < 0 ? null : chu.slice(dau, cuoi + 5);
}

export const LUAT = {
	chiThem: (tep, diff) =>
		dongBo(diff).length > 0 ? `${tep}: co dong bo` : null,
	gieo: (diff, chuMoi) => {
		const khoi = khoiChuCai(chuMoi);
		const boLa = dongBo(diff).some((d) => !DONG_MA.test(d));
		const themLa = dongThem(diff).some(
			(d) => !DONG_MA_THEM.test(d) && !khoi.has(d.slice(1)),
		);
		return boLa || themLa ? "gieo.ts: doi ngoai ma" : null;
	},
	tasks: (cu, moi) => {
		for (const ten of CA_THAT) {
			const than = thanCa(cu, ten);
			if (!than) return `tasks: khong thay ca that «${ten}» o merge-base`;
			if (!moi.includes(than)) return `tasks: ca that «${ten}» bi doi`;
		}
		const dem = moi.split(DOI_CHUNG_DONG).length - 1;
		return dem < SO_DOI_CHUNG
			? `tasks: doi chung chi con ${dem}/${SO_DOI_CHUNG} dong toHaveLength(rows)`
			: null;
	},
};

const GIEO_MOI = git(["show", `HEAD:${GIEO}`]);
const GIEO_THEM = `--- a/${GIEO}\n+++ b/${GIEO}\n@@ -5,0 +6 @@\n+export const X = 1;`;
const GIEO_HONG = `--- a/${GIEO}\n+++ b/${GIEO}\n@@ -4 +4 @@\n-export const TIEN_TO = "sokr-";\n+export const TIEN_TO = "sokr2-";`;
const DOI_CHUNG = [
	["rong", () => kiemDanhSach([]), 2, "diff rong"],
	[
		"tasks.ts",
		() => kiemDanhSach(["apps/agent/agent/lib/tasks.ts"]),
		1,
		"ngoai ranh gioi: apps/agent/agent/lib/tasks.ts",
	],
	[
		"goi-soan.ts",
		() => kiemDanhSach(["apps/agent-okr/agent/lib/goi-soan.ts"]),
		1,
		"ngoai ranh gioi: apps/agent-okr/agent/lib/goi-soan.ts",
	],
	[
		"tien to gieo",
		() => {
			const loi = LUAT.gieo(GIEO_HONG, GIEO_MOI);
			return { ma: loi ? 1 : 0, dong: loi ? [loi] : [] };
		},
		1,
		"gieo.ts: doi ngoai ma",
	],
	[
		"them export gieo",
		() => {
			const loi = LUAT.gieo(GIEO_THEM, GIEO_MOI);
			return { ma: loi ? 1 : 0, dong: loi ? [loi] : [] };
		},
		1,
		"gieo.ts: doi ngoai ma",
	],
];

for (const [ten, chay, ma, dong] of DOI_CHUNG) {
	const kq = chay();
	if (kq.ma !== ma || kq.dong[0] !== dong) {
		console.log(`doi chung «${ten}» hong: ${JSON.stringify(kq)}`);
		process.exit(1);
	}
}

const coSo = git(["merge-base", "origin/onehub", "HEAD"]).trim();
const ds = git(["diff", "--name-only", coSo, "HEAD"])
	.split("\n")
	.filter(Boolean);
const loi = [];
const danhSach = kiemDanhSach(ds);
if (danhSach.ma === 2) {
	console.log("diff rong");
	process.exit(2);
}
loi.push(...danhSach.dong);
const diffCua = (tep) => git(["diff", "-U0", coSo, "HEAD", "--", tep]);
for (const tep of [CONFIG, GOI_SPEC]) {
	const l = LUAT.chiThem(tep, diffCua(tep));
	if (l) loi.push(l);
}
const lGieo = LUAT.gieo(diffCua(GIEO), GIEO_MOI);
if (lGieo) loi.push(lGieo);
const tasksCu = git(["show", `${coSo}:${TASKS}`]);
const tasksMoi = git(["show", `HEAD:${TASKS}`]);
const hongTasks = [
	[
		"ca that doi",
		tasksMoi.replace("toHaveLength(limit);", "toHaveLength(limit + 0);"),
	],
	["bo doi chung", tasksMoi.replace(DOI_CHUNG_DONG, "")],
];
for (const [ten, chu] of hongTasks)
	if (LUAT.tasks(tasksCu, chu) === null) {
		console.log(`doi chung «${ten}» hong: luat tasks khong bat`);
		process.exit(1);
	}
const lTasks = LUAT.tasks(tasksCu, tasksMoi);
if (lTasks) loi.push(lTasks);
for (const l of loi) console.log(l);
console.log(`PHAM VI: ${ds.length} tep, ${loi.length} ngoai ranh gioi`);
process.exit(loi.length === 0 ? 0 : 1);
