import { spawnSync } from "node:child_process";
import {
	dungBanSao,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 6;
const TRAN_MS = 900_000;
const API = (t) =>
	`bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t ${t}"`;
const GHI = "apps/api/src/onboarding/onboarding-ghi.ts";
const GOI_BUOC = "\t\t\tawait traBuocKhongNhan(\n\t\t\t\ttx,\n\t\t\t\tsau,\n";

const CAP = [
	[
		"a bo doi cam trich khi mo lai",
		API("mlk-mo-lai"),
		GHI,
		"const camTrich = await traCamTrich(tx, sau, actingUserId);",
		"const camTrich = sau;",
		"mlk: cam trich chua doi sang nguoi mo lai",
	],
	[
		"b bo go nguoi duoc giao khi mo lai",
		API("mlk-mo-lai"),
		GHI,
		`${GOI_BUOC}\t\t\t\tawait buocChuaXong(tx, sau.id),\n\t\t\t\tactingUserId,\n\t\t\t);\n`,
		"",
		"mlk: buoc mo con trong tay vai okr",
	],
	[
		"c bo go theo doi khi mo lai",
		API("mlk-mo-lai"),
		GHI,
		"\t\t\tawait goTheoDoiKhongNhan(tx, sau.id);\n",
		"",
		"mlk: cam trich doc duoc ma vai okr con theo doi",
	],
	[
		"d bo go nguoi duoc giao khi bo xong",
		API("mlk-bo-xong"),
		GHI,
		'if (!input.done && ket.ket === "da-doi") {',
		"if (false) {",
		"mlk: bo xong tra buoc ve vai okr",
	],
	[
		"e coi moi thanh vien la nhan duoc viec",
		API("mlk-bo-xong"),
		GHI,
		"nhanDuoc: n.members.some((m) => docDuocDoiTac(m.role)),",
		"nhanDuoc: n.members.length > 0,",
		"mlk: bo xong tra buoc ve vai okr",
	],
	[
		"f chi go khi doi cam trich",
		API("mlk-mo-lai"),
		GHI,
		GOI_BUOC,
		"\t\t\tif (camTrich.ownerId !== sau.ownerId) await traBuocKhongNhan(\n\t\t\t\ttx,\n\t\t\t\tsau,\n",
		"mlk: cam trich doc duoc ma buoc con trong tay vai okr",
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
	ra.split("\n").some((d) => d.startsWith("error:") && d.includes(ghim));

const banSao = dungBanSao("mlk");
const xanh = new Map();
let daChay = 0;
const hong = [];
try {
	for (const [ten, cmd, tep, cu, moi, ghim] of CAP) {
		daChay += 1;
		if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		const truoc = xanh.get(cmd);
		const traLai = thayMotLan(banSao, tep, cu, moi);
		let sau;
		try {
			sau = lenh(banSao, cmd);
		} finally {
			traLai();
		}
		const dung = truoc.ma === 0 && sau.ma !== 0 && coGhim(sau.ra, ghim);
		console.log(
			`${ten} xanh=${truoc.ma} do=${sau.ma} ghim=${coGhim(sau.ra, ghim) ? "ok" : "thieu"}`,
		);
		if (!dung)
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
console.log(`dot-bien: ${SO_CAP_KHAI - hong.length}/${SO_CAP_KHAI} cap dat`);
process.exit(hong.length === 0 ? 0 : 1);
