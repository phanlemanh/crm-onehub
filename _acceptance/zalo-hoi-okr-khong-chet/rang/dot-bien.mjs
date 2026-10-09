import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 10;
const TRAN_MS = 300_000;
const NGOAI = "apps/agent/agent/tools/tro-ly-okr-ngoai.ts";
const UY_QUYEN = "apps/agent/agent/lib/okr/uy-quyen.ts";
const HOOK = "apps/agent/agent/hooks/okr-uy-quyen.ts";
const NOP = "apps/agent/agent/lib/okr/nop-de-xuat.ts";
const DOC = "apps/agent/agent/lib/okr/doc.ts";
const VIEC = "apps/agent/agent/subagents/tro_ly_okr/instructions/viec.ts";
const SPEC = (tep, t) =>
	`bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const NGOAI_SPEC = "okr-uy-quyen-ngoai.spec.ts";

const CAP = [
	[
		"a zalo-khong-de",
		SPEC(NGOAI_SPEC, "tro-ly-okr-ngoai"),
		NGOAI,
		'purposeOf(ctx) === "okr"',
		'(purposeOf(ctx) === "okr" || purposeOf(ctx) === "zalo")',
		"zalo: khong de tro_ly_okr",
	],
	[
		"b luon-de",
		SPEC(NGOAI_SPEC, "tro-ly-okr-ngoai"),
		NGOAI,
		'purposeOf(ctx) === "okr"',
		"false",
		"phien okr bi de tro_ly_okr",
	],
	[
		"g cong-tac-lot",
		SPEC(NGOAI_SPEC, "cong-tac"),
		NGOAI,
		" || boDe()",
		"",
		"cong tac bo de khong tat",
	],
	[
		"c okr-khac-lot",
		SPEC(NGOAI_SPEC, "hook"),
		UY_QUYEN,
		"return { cho: false, loi: LOI_UY_QUYEN.khacTroLy };",
		"return { cho: true, daGoi: [...daGoi] };",
		"okr: khac tro ly khong bi chan",
	],
	[
		"d hook-nem-lai",
		SPEC(NGOAI_SPEC, "hook"),
		HOOK,
		"console.warn(`${TRO_LY_OKR.ngoaiPhien.dongNgoaiOkr}${purpose}`);",
		"throw new Error(`${TRO_LY_OKR.ngoaiPhien.dongNgoaiOkr}${purpose}`);",
		"hook van giet luot",
	],
	[
		"e nop-bo-kiem",
		SPEC(NGOAI_SPEC, "nop-ngoai"),
		NOP,
		'\tif (!hang) return khongGhi("tu-choi", "not an OKR session");\n',
		"",
		"hang.kind",
	],
	[
		"f viec-phien-khac",
		SPEC(NGOAI_SPEC, "nop-ngoai"),
		DOC,
		"\t\twhere: { sessionId, kind: { in: [...LOAI_VIEC_TRO_LY_OKR] } },",
		"\t\twhere: { kind: { in: [...LOAI_VIEC_TRO_LY_OKR] }, finishedAt: null },",
		"nhan viec cua phien khac",
	],
	[
		"h cong-tac-o-production",
		SPEC(NGOAI_SPEC, "cong-tac"),
		NGOAI,
		'\tprocess.env.NODE_ENV !== "production" && process.env[bienBoDe] === "1";',
		'\tprocess.env[bienBoDe] === "1";',
		"cong tac bo de chay o production",
	],
	[
		"i khong-viec-tra-null",
		SPEC(NGOAI_SPEC, "khong-viec"),
		VIEC,
		"\t\t\tif (!hang)\n\t\t\t\treturn defineInstructions({\n\t\t\t\t\tmarkdown: TRO_LY_OKR.ngoaiPhien.chiDanKhongViec,\n\t\t\t\t});\n",
		"\t\t\tif (!hang) return null;\n",
		"phien con khong viec khong co chi dan",
	],
	[
		"j hook-lo-input",
		SPEC(NGOAI_SPEC, "hook"),
		HOOK,
		"\t\t\t\t\tconsole.warn(`${TRO_LY_OKR.ngoaiPhien.dongNgoaiOkr}${purpose}`);",
		"\t\t\t\t\tconsole.warn(`${TRO_LY_OKR.ngoaiPhien.dongNgoaiOkr}${purpose} ${JSON.stringify(event.data.actions.map((a) => a.input))}`);",
		"lo cau hoi trong log",
	],
];

function lenh(cwd, cmd) {
	const r = spawnSync("sh", ["-c", cmd], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra
		.split("\n")
		.some((d) => /^(error|[A-Za-z]*Error):/.test(d) && d.includes(ghim));

const banSao = dungBanSao("zhok-dot-bien");
let daChay = 0;
const hong = [];
try {
	for (const [ten, cmd, tep, cu, moi, ghim] of CAP) {
		daChay += 1;
		const truoc = lenh(banSao, cmd);
		const traLai = thayMotLan(banSao, tep, cu, moi);
		let sau;
		try {
			sau = lenh(banSao, cmd);
		} finally {
			traLai();
		}
		console.log(
			`${ten} xanh=${truoc.ma} do=${sau.ma} ghim=${coGhim(sau.ra, ghim) ? "ok" : "thieu"}`,
		);
		if (!(truoc.ma === 0 && sau.ma !== 0 && coGhim(sau.ra, ghim)))
			hong.push(
				`${ten}\n--- truoc\n${truoc.ra.slice(-1200)}\n--- sau\n${sau.ra.slice(-1200)}`,
			);
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);
for (const h of hong) console.error(h);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(`DOT BIEN: ${SO_CAP_KHAI - hong.length}/${SO_CAP_KHAI} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
