import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const CHO = [
	"apps/agent/agent/tools/tro-ly-okr-ngoai.ts",
	"apps/agent/agent/lib/okr/config.ts",
	"apps/agent/agent/lib/okr/uy-quyen.ts",
	"apps/agent/agent/subagents/tro_ly_okr/instructions/viec.ts",
	"apps/agent/agent/hooks/okr-uy-quyen.ts",
	"apps/agent/test/okr-uy-quyen-ngoai.spec.ts",
	"apps/agent/test/okr-uy-quyen.spec.ts",
	"docs/agent.md",
	".env.example",
	"_acceptance/tro-ly-okr-nen/run-log.jsonl",
	"_acceptance/tro-ly-okr-nen/evidence-report.md",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	"_acceptance/config.yaml",
	"apps/agent/agent/lib/zalo-config.ts",
	"packages/telemetry/src/allowlist.ts",
	"apps/app/lib/agent-transcript.ts",
	"apps/app/lib/messages/kara-ban-ghi.ts",
];
const TIEN_TO_HO_SO = "_acceptance/zalo-hoi-okr-khong-chet/";
const CHI_THEM = ["_acceptance/config.yaml", ".env.example"];
const { TRO_LY_OKR } = await import(
	join(GOC, "apps/agent/agent/lib/okr/config.ts")
);
const { SESSION_PURPOSES } = await import(
	join(GOC, "packages/validation/src/phien-tac-tu.ts")
);
const MA_TRAN_NGOAI_OKR = SESSION_PURPOSES.filter((p) => p !== "okr");
const BIEN_BO_DE = TRO_LY_OKR.ngoaiPhien.bienBoDe;
const DONG_THEM = {
	"apps/agent/agent/lib/zalo-config.ts": 1,
	"packages/telemetry/src/allowlist.ts": 1,
	"apps/app/lib/agent-transcript.ts": 1,
	"apps/app/lib/messages/kara-ban-ghi.ts": 2,
};
const TEN_CONG_CU = "tro-ly-okr-ngoai";
const NEN_RUN_LOG = "_acceptance/tro-ly-okr-nen/run-log.jsonl";
const NEN_REPORT = "_acceptance/tro-ly-okr-nen/evidence-report.md";
const MA_SPEC = "apps/agent/test/okr-uy-quyen.spec.ts";
const LOI_NEN = "tro-ly-okr-nen: doi ngoai phan ghim lai";

function git(args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) {
		console.error(`git ${args.join(" ")}: ${r.stderr.trim()}`);
		process.exit(2);
	}
	return r.stdout;
}

export function kiemDanhSach(ds) {
	if (ds.length === 0) return { ma: 2, dong: ["diff rong"] };
	const ngoai = ds.filter(
		(t) => !CHO.includes(t) && !t.startsWith(TIEN_TO_HO_SO),
	);
	return {
		ma: ngoai.length > 0 ? 1 : 0,
		dong: ngoai.map((t) => `ngoai ranh gioi: ${t}`),
	};
}

export const LUAT = {
	chiThem: (tep, { bo }) => (bo.length > 0 ? `${tep}: co dong bo` : null),
	dongThem: (tep, can, { them, bo }) =>
		them.length !== can ||
		bo.length !== 0 ||
		!them.every((d) => d.includes(TEN_CONG_CU))
			? `${tep}: khong dung dong them da khai`
			: null,
	env: ({ them }) => {
		const khai = them.filter((d) => d.includes(BIEN_BO_DE));
		const la = them.filter((d) => !d.startsWith("+#"));
		return khai.length === 0 ||
			la.length > 0 ||
			!them.at(-1)?.includes(`${BIEN_BO_DE}=`)
			? ".env.example: them ngoai khoi khai TRO_LY_OKR_BO_DE"
			: null;
	},
	maTran: ({ them, bo }) =>
		[...them, ...bo].every((d) =>
			MA_TRAN_NGOAI_OKR.some((m) => d.includes(`["${m}"`)),
		)
			? null
			: "okr-uy-quyen.spec.ts: doi dong ngoai ma tran ngoai okr",
	runLog: ({ them, bo }) => {
		if (bo.length > 0) return LOI_NEN;
		const hong = them.some((d) => {
			try {
				return !String(JSON.parse(d.slice(1)).kind ?? "").startsWith("repin");
			} catch {
				return true;
			}
		});
		return hong ? LOI_NEN : null;
	},
	report: ({ them, bo }, chu) => {
		const repin = chu.slice(Math.max(0, chu.indexOf("### Re-pin")));
		const lech =
			!chu.includes("### Re-pin") ||
			bo.some((d) => !d.startsWith("-verified_commit:")) ||
			them.some(
				(d) =>
					!d.startsWith("+verified_commit:") && !repin.includes(d.slice(1)),
			);
		return lech ? LOI_NEN : null;
	},
};

const DOI_CHUNG = [
	["rong", () => kiemDanhSach([]).dong[0], "diff rong"],
	[
		"ngoai agent.ts",
		() =>
			kiemDanhSach(["apps/agent/agent/subagents/tro_ly_okr/agent.ts"]).dong[0],
		"ngoai ranh gioi: apps/agent/agent/subagents/tro_ly_okr/agent.ts",
	],
	[
		"ngoai zalo-chi-dan",
		() => kiemDanhSach(["apps/agent/agent/lib/zalo-chi-dan.ts"]).dong[0],
		"ngoai ranh gioi: apps/agent/agent/lib/zalo-chi-dan.ts",
	],
	[
		"ngoai contract nen",
		() => kiemDanhSach(["_acceptance/tro-ly-okr-nen/contract.md"]).dong[0],
		"ngoai ranh gioi: _acceptance/tro-ly-okr-nen/contract.md",
	],
	[
		"config bo dong",
		() => LUAT.chiThem("_acceptance/config.yaml", { them: [], bo: ["-x"] }),
		"_acceptance/config.yaml: co dong bo",
	],
	[
		"zalo-config hai dong",
		() =>
			LUAT.dongThem("apps/agent/agent/lib/zalo-config.ts", 1, {
				them: ['+"tro-ly-okr-ngoai",', '+"khac",'],
				bo: [],
			}),
		"apps/agent/agent/lib/zalo-config.ts: khong dung dong them da khai",
	],
	[
		"env dong la",
		() => LUAT.env({ them: ["+# ghi chu", "+KHAC=1", `+# ${BIEN_BO_DE}=""`] }),
		".env.example: them ngoai khoi khai TRO_LY_OKR_BO_DE",
	],
	[
		"ma tran dong okr",
		() => LUAT.maTran({ them: ['+	["okr", "cho"],'], bo: [] }),
		"okr-uy-quyen.spec.ts: doi dong ngoai ma tran ngoai okr",
	],
	[
		"run-log kind la",
		() => LUAT.runLog({ them: ['+{"kind":"round-tally"}'], bo: [] }),
		LOI_NEN,
	],
	[
		"report doi ngoai repin",
		() =>
			LUAT.report(
				{ them: ["+verdict: FAIL"], bo: ["-verdict: PASS"] },
				"verdict: FAIL\n### Re-pin lần 1\n",
			),
		LOI_NEN,
	],
	[
		"lanh: env dung khoi",
		() => LUAT.env({ them: ["+# ghi chu", `+# ${BIEN_BO_DE}=""`] }),
		null,
	],
	[
		"lanh: report chi repin",
		() =>
			LUAT.report(
				{
					them: ["+verified_commit: abc", "+### Re-pin lần 1"],
					bo: ["-verified_commit: xyz"],
				},
				"verified_commit: abc\n### Re-pin lần 1\n",
			),
		null,
	],
];

let chay = 0;
for (const [ten, goi, mong] of DOI_CHUNG) {
	const thuc = goi();
	if (thuc !== mong) {
		console.error(`doi chung hong: ${ten}: mong «${mong}», duoc «${thuc}»`);
		process.exit(1);
	}
	chay++;
	console.log(`doi chung: ${ten} -> ${thuc ?? "khong loi"}`);
}
if (chay !== 12) {
	console.error(`doi chung chay ${chay}/12`);
	process.exit(1);
}

const base = git(["merge-base", "HEAD", "origin/onehub"]).trim();
const ds = git(["diff", "--name-only", base, "HEAD"])
	.split("\n")
	.filter(Boolean);
const kiem = kiemDanhSach(ds);
if (kiem.ma === 2) {
	console.error(kiem.dong[0]);
	process.exit(2);
}

function dongDoi(tep) {
	const dong = git(["diff", "-U0", base, "HEAD", "--", tep])
		.split("\n")
		.filter((d) => /^[+-]/.test(d) && !/^(\+\+\+|---)/.test(d));
	return {
		them: dong.filter((d) => d.startsWith("+")),
		bo: dong.filter((d) => d.startsWith("-")),
	};
}

const loi = [...kiem.dong];
const co = (t) => ds.includes(t);
for (const tep of CHI_THEM.filter(co))
	loi.push(LUAT.chiThem(tep, dongDoi(tep)));
for (const [tep, can] of Object.entries(DONG_THEM).filter(([t]) => co(t)))
	loi.push(LUAT.dongThem(tep, can, dongDoi(tep)));
if (co(".env.example")) loi.push(LUAT.env(dongDoi(".env.example")));
if (co(MA_SPEC)) loi.push(LUAT.maTran(dongDoi(MA_SPEC)));
if (co(NEN_RUN_LOG)) loi.push(LUAT.runLog(dongDoi(NEN_RUN_LOG)));
if (co(NEN_REPORT))
	loi.push(
		LUAT.report(dongDoi(NEN_REPORT), git(["show", `HEAD:${NEN_REPORT}`])),
	);
const thatLoi = loi.filter(Boolean);
if (thatLoi.length > 0) {
	for (const d of thatLoi) console.error(d);
	process.exit(1);
}
console.log(`PHAM VI: ${ds.length} tep, 0 ngoai ranh gioi`);
