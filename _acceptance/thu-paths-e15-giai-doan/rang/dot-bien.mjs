import { execFileSync, spawnSync } from "node:child_process";
import {
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const RANG = "_acceptance/thu-paths-e15-giai-doan/rang";
const DS = "@_acceptance/thu-paths-e15-giai-doan/danh-sach.txt";
const GD = "_acceptance/giai-doan-thoa-thuan/evals.yaml";
const TP = "_acceptance/tat-preview-agent-okr/evals.yaml";
const OL = "_acceptance/okr-loai-hoc-tap/evals.yaml";
const KHOI_TP =
	'      - apps/agent-okr/vercel.json\n    paths:\n      - "docs/setup.md"\n      - "apps/agent-okr/vercel.json"\n';
const DONG_INPUTS_OL =
	"    inputs: [apps/agent-okr/agent/instructions.md, packages/validation/src/okr-cuoc-soan.ts, packages/validation/src/okr-muc-tieu.ts]\n";

const lenh = {
	E1: [
		`${RANG}/hoa-cu-theo-paths.mjs`,
		"--ho-so",
		"giai-doan-thoa-thuan",
		"--chi-eval",
		"E15",
		"--ma-tran-chu",
	],
	E2: [
		`${RANG}/hoa-cu-theo-paths.mjs`,
		"--ho-so",
		"giai-doan-thoa-thuan",
		"--gia-dinh",
		"apps/app/lib/messages/tin-hieu.ts=bo,apps/app/lib/messages/settings.ts=giu",
	],
	E3: [`${RANG}/them-paths.mjs`, "--kiem", "--ho-so", DS, "--kiem-danh-sach"],
	E3c: [
		`${RANG}/them-paths.mjs`,
		"--kiem",
		"--ho-so",
		DS,
		"--phai-co",
		"tat-preview-agent-okr",
	],
	E4: [`${RANG}/chi-them-paths.mjs`, "--ho-so", DS],
	E5: [`${RANG}/hoa-cu-theo-paths.mjs`, "--ho-so", DS],
	E6: [`${RANG}/them-paths.mjs`, "--kiem-bo-qua-lop"],
	E8: [`${RANG}/pmc-truoc-sau.mjs`, "--ho-so", DS],
};

const CAP = [
	{
		eval: "E1",
		ten: "messages-sao-tro-lai",
		doi: [
			{
				tep: GD,
				tu: '      - "apps/app/lib/messages/crm.ts"\n      - "apps/app/lib/messages/deals.ts"\n      - "apps/app/lib/messages/settings.ts"\n',
				sang: '      - "apps/app/lib/messages/**"\n',
			},
		],
		ma: 1,
		dong: ["SAI_LOP apps/app/lib/messages/tin-hieu.ts: mong bo, thay giu"],
	},
	{
		eval: "E1",
		ten: "man-nhap-them-okr",
		doi: [
			{
				tep: "apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx",
				tu: '"use client";\n',
				sang: '"use client";\nimport { okrMessages } from "@/lib/messages/okr";\n',
			},
		],
		ma: 1,
		dong: ["SAI_LOP apps/app/lib/messages/okr.ts: mong giu, thay bo"],
	},
	{
		eval: "E2",
		ten: "e17-phu-lib",
		canF23: true,
		doi: [
			{
				tep: GD,
				tu: '      - "tools/oxlint/onehub/**"\n',
				sang: '      - "apps/app/lib/**"\n      - "tools/oxlint/onehub/**"\n',
			},
		],
		ma: 1,
		dong: [
			"VAN_GIU giai-doan-thoa-thuan apps/app/lib/messages/tin-hieu.ts: E17:apps/app/lib/**",
		],
	},
	{
		eval: "E2",
		ten: "eval-may-mat-paths",
		canF23: true,
		doi: [
			{
				tep: GD,
				tu: '    paths:\n      - "apps/app/components/crm/timeline/**"\n      - "apps/app/test/giai-doan-timeline.dom.tsx"\n',
				sang: "",
			},
		],
		ma: 1,
		dong: [
			"KHONG_AP giai-doan-thoa-thuan apps/app/lib/messages/tin-hieu.ts: eval-may-thieu-paths:E19",
		],
	},
	{
		eval: "E3",
		ten: "xoa-khoi-paths",
		doi: [
			{ tep: TP, tu: KHOI_TP, sang: "      - apps/agent-okr/vercel.json\n" },
		],
		ma: 1,
		dong: ["THIEU_PATHS tat-preview-agent-okr#E9"],
	},
	{
		eval: "E3",
		ten: "bot-mot-muc",
		doi: [
			{
				tep: TP,
				tu: KHOI_TP,
				sang: '      - apps/agent-okr/vercel.json\n    paths:\n      - "docs/setup.md"\n',
			},
		],
		ma: 1,
		dong: [
			"LECH_PATHS tat-preview-agent-okr#E9: thieu apps/agent-okr/vercel.json",
		],
	},
	{
		eval: "E3",
		ten: "bo-ho-so-khoi-danh-sach",
		doi: [
			{
				tep: "_acceptance/thu-paths-e15-giai-doan/danh-sach.txt",
				tu: "tat-preview-agent-okr\n",
				sang: "",
			},
		],
		ma: 1,
		dong: ["THIEU_TRONG_DANH_SACH tat-preview-agent-okr"],
	},
	{
		eval: "E3",
		ten: "them-ho-so-con-cu",
		doi: [
			{
				tep: "_acceptance/thu-paths-e15-giai-doan/danh-sach.txt",
				tu: "tat-preview-agent-okr\n",
				sang: "tat-preview-agent-okr\nkhung-man-chung\n",
			},
		],
		ma: 1,
		dong: ["THUA_TRONG_DANH_SACH khung-man-chung"],
	},
	{
		eval: "E3c",
		ten: "phai-co-vang",
		doi: [
			{
				tep: "_acceptance/thu-paths-e15-giai-doan/danh-sach.txt",
				tu: "tat-preview-agent-okr\n",
				sang: "",
			},
		],
		ma: 1,
		dong: ["KHONG_CO_TEN tat-preview-agent-okr"],
	},
	{
		eval: "E4",
		ten: "doi-cau-hoi",
		commit: true,
		doi: [
			{
				tep: TP,
				tu: "Build Step theo VERCEL_ENV khong?",
				sang: "Build Step theo VERCEL_ENV khong??",
			},
		],
		ma: 1,
		dong: ["DOI_TRUONG tat-preview-agent-okr#E9"],
	},
	{
		eval: "E4",
		ten: "them-ngoai-danh-sach",
		commit: true,
		doi: [
			{
				tep: OL,
				tu: DONG_INPUTS_OL,
				sang: `${DONG_INPUTS_OL}    paths:\n      - "packages/validation/src/okr-cuoc-soan.ts"\n`,
			},
		],
		ma: 1,
		dong: ["NGOAI_DANH_SACH okr-loai-hoc-tap"],
	},
	{
		eval: "E4",
		ten: "cham-lib",
		commit: true,
		doi: [
			{
				tep: "lib/evidence-core.cjs",
				tu: "'use strict';\n",
				sang: "'use strict';\n\n",
			},
		],
		ma: 1,
		dong: ["CHAM_LIB lib/evidence-core.cjs"],
	},
	{
		eval: "E4",
		ten: "paths-thua",
		commit: true,
		doi: [{ tep: TP, tu: KHOI_TP, sang: `${KHOI_TP}      - "README.md"\n` }],
		ma: 1,
		dong: ["PATHS_KHAC_INPUTS tat-preview-agent-okr#E9"],
	},
	{
		eval: "E5",
		ten: "doi-input-that",
		commit: true,
		doi: [{ tep: "apps/agent-okr/vercel.json", cuoi: "\n" }],
		ma: 1,
		dong: ["CON_HOA_CU tat-preview-agent-okr: apps/agent-okr/vercel.json"],
	},
	{
		eval: "E5",
		ten: "mat-paths",
		doi: [
			{ tep: TP, tu: KHOI_TP, sang: "      - apps/agent-okr/vercel.json\n" },
		],
		ma: 1,
		dong: ["KHONG_AP tat-preview-agent-okr: eval-ngoai-may-thieu-paths:E9"],
	},
	{
		eval: "E6",
		ten: "them-paths-ho-so-khoa",
		doi: [
			{
				tep: "_acceptance/cua-vao-noi-tieng-viet/evals.yaml",
				tu: "      - evidence/E14-chu-loi.txt\n      - contract.md\n    expected: >-\n",
				sang: '      - evidence/E14-chu-loi.txt\n      - contract.md\n    paths:\n      - "_acceptance/cua-vao-noi-tieng-viet/contract.md"\n    expected: >-\n',
			},
		],
		ma: 1,
		dong: ["DOI_PATHS cua-vao-noi-tieng-viet#E14: khoa-thuoc-da-cham-thuc-te"],
	},
	{
		eval: "E6",
		ten: "them-paths-input-vang",
		doi: [
			{
				tep: OL,
				tu: DONG_INPUTS_OL,
				sang: `${DONG_INPUTS_OL}    paths:\n      - "packages/validation/src/okr-cuoc-soan.ts"\n`,
			},
		],
		ma: 1,
		dong: ["DOI_PATHS okr-loai-hoc-tap#E14: input-vang"],
	},
	{
		eval: "E8",
		ten: "mat-paths-pmc-that",
		commit: true,
		doi: [
			{ tep: TP, tu: KHOI_TP, sang: "      - apps/agent-okr/vercel.json\n" },
		],
		ma: 1,
		dong: [
			"VAN_HOA_CU tat-preview-agent-okr",
			"KHONG_AP_JUDGMENT tat-preview-agent-okr#E9",
		],
	},
];

const git = (cay, ...a) =>
	execFileSync("git", ["-C", cay, ...a], { maxBuffer: 1 << 30 }).toString();

function chayLenh(cay, ten) {
	const [tep, ...doi] = lenh[ten];
	const r = spawnSync("node", [join(cay, tep), ...doi], {
		cwd: cay,
		encoding: "utf8",
		maxBuffer: 1 << 30,
		env: { ...process.env, GOC_KHO: cay },
	});
	return { ma: r.status, ra: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

function apDoi(cay, d) {
	const p = join(cay, d.tep);
	const chu = readFileSync(p, "utf8");
	if (d.cuoi != null) {
		writeFileSync(p, chu + d.cuoi);
		return true;
	}
	const lan = chu.split(d.tu).length - 1;
	if (lan === 0) return false;
	if (lan > 1 && d.thu == null) return false;
	if (d.thu != null) {
		const dong = chu.split("\n");
		if (`${dong[d.thu - 1]}\n` !== d.tu) return false;
		dong.splice(
			d.thu - 1,
			1,
			...(d.sang ? d.sang.replace(/\n$/, "").split("\n") : []),
		);
		writeFileSync(p, dong.join("\n"));
		return true;
	}
	writeFileSync(p, chu.replace(d.tu, d.sang));
	return true;
}

function trangThaiChinh() {
	const tep = [...new Set(CAP.flatMap((c) => c.doi.map((d) => d.tep)))];
	return git(GOC, "status", "--porcelain", "--", ...tep);
}

function chay() {
	const truoc = trangThaiChinh();
	const tam = mkdtempSync(join(realpathSync(tmpdir()), "tpe-dot-bien-"));
	const cay = join(tam, "cay");
	const go = () => {
		spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cay]);
		rmSync(tam, { recursive: true, force: true });
	};
	for (const tin of ["SIGINT", "SIGTERM"])
		process.once(tin, () => {
			go();
			process.exit(130);
		});
	let lot = 0;
	let lech = 0;
	let soCap = 0;
	try {
		git(GOC, "worktree", "add", "--detach", "--quiet", cay, "HEAD");
		const goc = git(cay, "rev-parse", "HEAD").trim();
		const daChayLanh = new Map();
		const iChi = process.argv.indexOf("--chi");
		const chi = iChi === -1 ? null : (process.argv[iChi + 1] ?? "").split(",");
		for (const c of CAP.filter((x) => !chi || chi.includes(x.eval))) {
			soCap += 1;
			git(cay, "reset", "--hard", "--quiet", goc);
			if (!daChayLanh.has(c.eval))
				daChayLanh.set(c.eval, chayLenh(cay, c.eval));
			const lanh = daChayLanh.get(c.eval);
			if (lanh.ma === 0 && !lanh.ra.trim()) {
				lot += 1;
				console.log(
					`LOT ${c.eval} ${c.ten}: ban lanh ma 0 ma khong in gi — rang khong chay`,
				);
				continue;
			}
			if (lanh.ma !== 0) {
				if (
					c.canF23 &&
					/VAN_GIU giai-doan-thoa-thuan apps\/app\/lib\/messages\/tin-hieu\.ts: .*E17:apps\/app\/lib\/\*\*/.test(
						lanh.ra,
					)
				) {
					console.log(
						`CHO_F23 ${c.eval} ${c.ten}: E17 con phu apps/app/lib/**, cap chay sau khi #427 len cay`,
					);
					continue;
				}
				lot += 1;
				console.log(
					`LOT ${c.eval} ${c.ten}: ban lanh ma ${lanh.ma}\n${lanh.ra.split("\n").slice(-6).join("\n")}`,
				);
				continue;
			}
			if (!c.doi.every((d) => apDoi(cay, d))) {
				lech += 1;
				console.log(`DOT_BIEN_LECH ${c.eval} ${c.ten}`);
				continue;
			}
			if (c.commit)
				git(
					cay,
					"-c",
					"user.name=dot-bien",
					"-c",
					"user.email=dot-bien@local",
					"commit",
					"-qam",
					`dot bien ${c.ten}`,
				);
			const r = chayLenh(cay, c.eval);
			const thieu = c.dong.filter((d) => !r.ra.includes(d));
			if (r.ma === c.ma && !thieu.length)
				console.log(`${c.eval} ${c.ten}: lanh 0, dot bien ${r.ma}, bat`);
			else {
				lot += 1;
				console.log(
					`LOT ${c.eval} ${c.ten}: ma ${r.ma} (mong ${c.ma}), thieu ${thieu.join(" | ") || "-"}\n${r.ra.split("\n").slice(-6).join("\n")}`,
				);
			}
		}
	} finally {
		go();
	}
	if (trangThaiChinh() !== truoc) {
		lot += 1;
		console.log("LOT cay-chinh: tep dot bien o cay chinh doi trang thai");
	}
	console.log(`dot bien: ${soCap} cap · lot ${lot} · lech ${lech}`);
	if (lech) return 2;
	return lot ? 1 : 0;
}

if (
	process.argv[1] &&
	realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
)
	process.exit(chay());
