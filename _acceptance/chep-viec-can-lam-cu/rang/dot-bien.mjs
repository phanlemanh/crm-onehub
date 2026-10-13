import { spawnSync } from "node:child_process";
import {
	lstatSync,
	mkdirSync,
	readdirSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { join } from "node:path";
import {
	dungBanSao,
	GOC,
	goBanSao,
	KhongDo,
	thayMotLan,
} from "../../ca-chap-chon-cach-ly/rang/ban-sao.mjs";

const SO_CAP_KHAI = 13;
const TRAN_MS = 900_000;
const DB = (tep, t) =>
	`bun run test -- "cd packages/db && bun test test/${tep}${t ? ` -t '${t}'` : ""}"`;
const API = (t) =>
	`bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-can-lam-cu.spec.ts -t ${t}"`;
const AGENT = (tep, t) =>
	`bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const CVC = {
	chepDu: DB("viec-chep.spec.ts", "cvc-chep-du"),
	chepLai: DB("viec-chep.spec.ts", "cvc-chep-lai"),
	nguoiTao: DB("viec-chep.spec.ts", "cvc-nguoi-tao"),
	dao: DB("viec-chep.spec.ts", "cvc-dao"),
	lenh: DB("viec-chep-lenh.spec.ts", "kho xa"),
	dongThoiGian: API("cvc-dong-thoi-gian"),
	api: API("cvc-api"),
	tacNhan: AGENT("tac-nhan-giao-viec.integration.spec.ts", "cvc-tac-nhan"),
	maLech: AGENT("ma-lech-viec.integration.spec.ts"),
	quet: "node _acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs",
};
const GHI = "packages/db/src/viec-ghi.ts";
const CHEP = "packages/db/src/viec-chep.ts";
const LENH = "packages/db/scripts/chep-viec-can-lam.ts";
const DONG = "apps/api/src/activities/activities.service.ts";
const HOP_DONG = "apps/api/src/activities/activities.contracts.ts";
const TONG_QUAN = "apps/api/src/dashboard/dashboard.service.ts";
const TAC_NHAN = "apps/agent/agent/lib/run-runtime.ts";
const MA_LECH = "apps/agent/agent/lib/ma-lech.ts";

const CAP = [
	[
		"a bo anh xa completedAt sang XONG",
		GHI,
		"const trangThai = xong ? TrangThaiViec.XONG : TrangThaiViec.CHUA_LAM;",
		"const trangThai = TrangThaiViec.CHUA_LAM;",
		[[CVC.chepDu, "cvc: chep sai truong trangThai"]],
	],
	[
		"b bo dieu kien chua chep",
		GHI,
		"\tif (goc.viecChep !== null) return null;\n",
		"",
		[[CVC.chepLai, "cvc: chep lai nhan ban"]],
	],
	[
		"c bo nhanh nguoi chay nhan viec",
		GHI,
		"\t\t\tnguoi = input.nguoiChay;\n",
		"",
		[[CVC.nguoiTao, "cvc: nguoi tao khong nhan van giu"]],
	],
	[
		"d bo giu ban da doi khi dao",
		CHEP,
		"if (doi.has(id) && !input.caBanDaDoi) {",
		"if (false) {",
		[[CVC.dao, "cvc: dao xoa ban da doi"]],
	],
	[
		"e bo loc da chep o dong thoi gian",
		DONG,
		"AND: [this.anchor(input), filterClause(input.filter), CHUA_CHEP]",
		"AND: [this.anchor(input), filterClause(input.filter)]",
		[[CVC.dongThoiGian, "cvc: viec da chep con tren dong thoi gian"]],
	],
	[
		"f tra TASK vao COMPOSABLE_TYPES",
		HOP_DONG,
		"\tActivityType.MEETING,\n] as const;\n\nconst composableEnum",
		"\tActivityType.MEETING,\n\tActivityType.TASK,\n] as const;\n\nconst composableEnum",
		[[CVC.api, "cvc: api van nhan TASK"]],
	],
	[
		"g nhanh TASK cua Tac nhan ve ghi activity",
		TAC_NHAN,
		"const viec = await taoViec(tx, {",
		'const viec = await tx.activity.create({ data: { type: "TASK", subject: "dot-bien", createdById: nguoiId }, select: { id: true } }); const _dotBien = ((tx), {',
		[[CVC.tacNhan, "cvc: tac nhan con ghi TASK"]],
	],
	[
		"h bo ve viec cu chua chep o chan trung ma-lech",
		MA_LECH,
		'if (viecMo !== null || cuChuaChep !== null) return "da-co-viec-mo";',
		'if (viecMo !== null) return "da-co-viec-mo";',
		[[CVC.maLech, "cvc: ma lech giao trung khi con viec cu"]],
	],
	[
		"i bo bo chan kho xa",
		LENH,
		"const ghi = (values.chay && !values.thu) || values.dao;",
		"const ghi = values.thu && values.dao;",
		[[CVC.lenh, "cvc: lenh ghi chay tren kho xa"]],
	],
	[
		"j bo loc da chep o Tong quan",
		TONG_QUAN,
		"\t\t\tviecChep: { is: null },\n",
		"",
		[[CVC.api, "cvc: tong quan hien viec da chep"]],
	],
	[
		"k cay mot loi ghi TASK vao ma-lech",
		MA_LECH,
		"\t\ttry {\n\t\t\tawait taoViec(tx, {",
		"\t\tawait tx.activity.create({\n\t\t\tdata: {\n\t\t\t\ttype: ActivityType.TASK,\n\t\t\t\tplanId: payload.planId,\n\t\t\t\tcreatedById: keHoach.ownerId,\n\t\t\t},\n\t\t});\n\t\ttry {\n\t\t\tawait taoViec(tx, {",
		[[CVC.quet, "cvc: con duong ghi TASK"]],
	],
	[
		"l loi doc dong thoi gian an moi viec can lam",
		DONG,
		"NOT: { type: ActivityType.TASK, viecChep: { isNot: null } },",
		"NOT: { type: ActivityType.TASK },",
		[[CVC.dao, "cvc: dao xong viec cu khong hien lai"]],
	],
	[
		"m dung doi tuong TASK truoc roi ghi o ma-lech",
		MA_LECH,
		"\t\ttry {\n\t\t\tawait taoViec(tx, {",
		"\t\tconst hangCu = {\n\t\t\ttype: ActivityType.TASK,\n\t\t\tplanId: payload.planId,\n\t\t\tcreatedById: keHoach.ownerId,\n\t\t};\n\t\tawait tx.activity.create({ data: hangCu });\n\t\ttry {\n\t\t\tawait taoViec(tx, {",
		[[CVC.quet, "cvc: con duong ghi TASK"]],
	],
];

function goiCuaBanSao(banSao, nhom, ten) {
	const nm = join(banSao, nhom, ten, "node_modules");
	if (!lstatSync(nm).isSymbolicLink()) return;
	rmSync(nm);
	mkdirSync(join(nm, "@crm"), { recursive: true });
	const goc = join(GOC, nhom, ten, "node_modules");
	for (const muc of readdirSync(goc)) {
		if (muc !== "@crm") symlinkSync(join(goc, muc), join(nm, muc));
	}
	for (const goi of readdirSync(join(goc, "@crm"))) {
		symlinkSync(join(banSao, "packages", goi), join(nm, "@crm", goi));
	}
}

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

let banSao = null;
const xanh = new Map();
let daChay = 0;
const hong = [];
try {
	banSao = dungBanSao("cvc");
	for (const [nhom, ten] of [
		["apps", "api"],
		["apps", "agent"],
		["packages", "validation"],
	]) {
		goiCuaBanSao(banSao, nhom, ten);
	}
	for (const [ten, tep, cu, moi, kiem] of CAP) {
		daChay += 1;
		for (const [cmd] of kiem) {
			if (!xanh.has(cmd)) xanh.set(cmd, lenh(banSao, cmd));
		}
		const traLai = thayMotLan(banSao, tep, cu, moi);
		const sau = [];
		try {
			for (const [cmd, ghim] of kiem)
				sau.push({ cmd, ghim, ...lenh(banSao, cmd) });
		} finally {
			traLai();
		}
		for (const s of sau) {
			const truoc = xanh.get(s.cmd);
			const dung = truoc.ma === 0 && s.ma !== 0 && coGhim(s.ra, s.ghim);
			console.log(
				`${ten} xanh=${truoc.ma} do=${s.ma} ghim=${coGhim(s.ra, s.ghim) ? "ok" : "thieu"} «${s.ghim}»`,
			);
			if (!dung)
				hong.push({
					ten,
					truoc: truoc.ra.slice(-1200),
					sau: s.ra.slice(-1200),
				});
		}
	}
} catch (loi) {
	if (banSao !== null) goBanSao(banSao);
	console.log(`KHONG DO DUOC: ${loi.message}`);
	process.exit(loi instanceof KhongDo ? 2 : 1);
}
if (banSao !== null) goBanSao(banSao);
for (const h of hong)
	console.error(`${h.ten}\n--- truoc\n${h.truoc}\n--- sau\n${h.sau}`);
if (daChay !== SO_CAP_KHAI) {
	console.log(`da chay ${daChay} cap, khai ${SO_CAP_KHAI}`);
	process.exit(1);
}
console.log(
	`dot-bien: ${SO_CAP_KHAI - new Set(hong.map((h) => h.ten)).size}/${SO_CAP_KHAI} cap dat`,
);
process.exit(hong.length === 0 ? 0 : 1);
