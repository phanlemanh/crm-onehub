import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 8;
const TRAN_MS = 600_000;
const BAI = (t) =>
	`bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t ${t}"`;
const CAN_CHINH = "apps/api/src/okr/can-chinh.ts";
const DUA_VAO = "apps/api/src/okr/soan-dua-vao.ts";
const DICH_VU = "apps/api/src/okr/okr.service.ts";
const MIGRATION =
	"packages/db/prisma/migrations/20261010184651_ly_do_can_chinh/migration.sql";

const CAP = [
	[
		"a bo truyen lyDo",
		BAI("dua-vao"),
		DUA_VAO,
		"\t\t\t\t\tlyDo: lyDoTuSoan(c.dong.viSao),\n",
		"",
		"dua vao lam roi ly do",
	],
	[
		"b khong dat dau Kara",
		BAI("dua-vao"),
		CAN_CHINH,
		"{ lyDo, canCu: null, lyDoTuKara: true }",
		"{ lyDo, canCu: null, lyDoTuKara: false }",
		"mat dau Kara",
	],
	[
		"c chuoi rong khong thanh null",
		BAI("visao-rong"),
		CAN_CHINH,
		"return lyDo ? { lyDo, canCu: null, lyDoTuKara: true } : LY_DO_TRONG;",
		'return { lyDo, canCu: null, lyDoTuKara: lyDo !== "" };',
		"ly do rong thanh chuoi rong",
	],
	[
		"d gan tay doi ly do",
		BAI("gan-tay"),
		DICH_VU,
		"\t\tconst g = await tx.okrAlignment.create({",
		'\t\tif (!opts?.lyDo) throw new BadRequestException("thieu ly do");\n\t\tconst g = await tx.okrAlignment.create({',
		"gan tay bi chan vi thieu ly do",
	],
	[
		"e co can cu van dat cuoc",
		BAI("muc-tin"),
		CAN_CHINH,
		'return canCu ? "co-so-lieu" : "dat-cuoc";',
		'return "dat-cuoc";',
		"co-so-lieu: muc tin dat-cuoc khac co-so-lieu",
	],
	[
		"f bo lyDo IS NULL",
		BAI("dien-lai"),
		MIGRATION,
		' AND a."lyDo" IS NULL',
		"",
		"C: dien lai sai",
	],
	[
		"g bo dieu kien khac rong",
		BAI("dien-lai"),
		MIGRATION,
		String.raw` AND btrim(COALESCE(d."noiDung"->>'viSao', ''), E' \t\n\r\u00a0') <> ''`,
		"",
		"D: dien lai sai",
	],
	[
		"i bo cat khoang trang",
		BAI("visao-rong"),
		CAN_CHINH,
		"const lyDo = viSao.trim();",
		"const lyDo = viSao;",
		"ly do rong thanh chuoi rong",
	],
];

function chay(cwd, lenh) {
	const r = spawnSync("sh", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		timeout: TRAN_MS,
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

const coGhim = (ra, ghim) =>
	ra.split("\n").some((d) => d.startsWith("error:") && d.includes(ghim));

const banSao = dungBanSao("ldcc");
let daChay = 0;
const hong = [];
try {
	for (const [ten, cmd, tep, cu, moi, ghim] of CAP) {
		daChay += 1;
		const truoc = chay(banSao, cmd);
		const traLai = thayMotLan(banSao, tep, cu, moi);
		let sau;
		try {
			sau = chay(banSao, cmd);
		} finally {
			traLai();
		}
		const dat = truoc.ma === 0 && sau.ma !== 0 && coGhim(sau.ra, ghim);
		console.log(
			`${ten} xanh=${truoc.ma} do=${sau.ma} ghim=${coGhim(sau.ra, ghim) ? "ok" : "thieu"}`,
		);
		if (!dat)
			hong.push({
				ten,
				truoc: truoc.ra.slice(-1200),
				sau: sau.ra.slice(-1200),
			});
	}
} catch (loi) {
	goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
goBanSao(banSao);
for (const h of hong)
	console.error(`${h.ten}\n--- truoc\n${h.truoc}\n--- sau\n${h.sau}`);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(`DOT BIEN: ${daChay - hong.length}/${daChay} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
