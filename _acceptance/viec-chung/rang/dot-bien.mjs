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

const SO_CAP_KHAI = 14;
const TRAN_MS = 900_000;
const API = (tep, t) =>
	`bun run test -- "cd apps/api && bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const AGENT = (t) =>
	`bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/nhac-viec.integration.spec.ts -t ${t}"`;
const VC = {
	tao: API("viec-ghi.spec.ts", "vc-tao"),
	gan: API("viec-ghi.spec.ts", "vc-gan"),
	trangThai: API("viec-ghi.spec.ts", "vc-trang-thai"),
	vongDoi: API("viec-ghi.spec.ts", "vc-vong-doi"),
	vaiOkr: API("viec-quyen.spec.ts", "vc-vai-okr"),
	xem: API("viec-quyen.spec.ts", "vc-xem"),
	chuyen: API("viec-chuyen.spec.ts"),
	thuoc: API("viec-do-nguong.spec.ts"),
	nhacVaiOkr: AGENT("vc-nhac-vai-okr"),
	xongN: AGENT("vc-xong-n"),
};
const GHI = "packages/db/src/viec-ghi.ts";
const LUAT = "packages/db/src/viec.ts";
const GOM = "packages/db/src/onboarding-nhac.ts";
const TRA_LOI = "apps/agent/agent/lib/tra-loi-nhac.ts";
const THUOC = "_acceptance/viec-chung/rang/do-nguong.mjs";

const CAP = [
	[
		"a bo hang ViecGan khi tao",
		GHI,
		"for (const b of ganDung) {\n\t\tawait tx.viecGan.create({ data: { viecId: viec.id, ...cotGan(b) } });\n\t}\n\tfor (const n of nguoiTheoDoi) {",
		"for (const b of []) {\n\t\tawait tx.viecGan.create({ data: { viecId: viec.id, ...cotGan(b) } });\n\t}\n\tfor (const n of nguoiTheoDoi) {",
		[[VC.tao, "vc: gan sai"]],
	],
	[
		"b bo loc trung o khoi cong ty",
		LUAT,
		"return [...new Map(hang.map((h) => [h.viec.id, h.viec])).values()];",
		"return hang.map((h) => h.viec);",
		[[VC.gan, "vc: cong ty hien viec"]],
	],
	[
		"c bo kiem quyen nguoi theo doi",
		LUAT,
		'if (!duoc) return "khong-quyen";',
		'if (!duoc && !vai.theoDoi) return "khong-quyen";',
		[[VC.trangThai, "vc: o khong lot"]],
	],
	[
		"d bo ve vai o kiemNguoiNhanViec",
		GHI,
		"if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {",
		"if (false) {",
		[[VC.vaiOkr, "vc: giao cho vai okr khong bi chan"]],
	],
	[
		"e bo dieu kien viec rieng",
		LUAT,
		"{ gan: { some: {} } },",
		'{ id: { not: "" } },',
		[[VC.xem, "vc: viec rieng lo"]],
	],
	[
		"f bo cong vai nguon viec",
		GOM,
		"guiViec(v, tapDoiTac, chon.now)",
		"guiViec(v, tap, chon.now)",
		[[VC.nhacVaiOkr, "vc: bo gom co viec doi tac cho vai okr"]],
	],
	[
		"g bo kiem nguoi nhan xong n",
		TRA_LOI,
		"if (!dungNguoiNhan(m, v, input.userId)) {",
		"if (false) {",
		[[VC.xongN, "vc: xong n nguoi la lot"]],
	],
	[
		"h bo chuyen nguoi giao",
		GHI,
		"v.nguoiGiaoId === input.tuId ? input.den.id : v.nguoiGiaoId",
		"v.nguoiGiaoId",
		[[VC.chuyen, "vc: chuyen viec bo sot nguoi giao"]],
	],
	[
		"i bo kiem chua co lich su",
		GHI,
		"if (await coLichSu(tx, viec.id)) {",
		"if (false) {",
		[[VC.vongDoi, "vc: xoa viec co lich su"]],
	],
	[
		"j thuoc so han sang ngay hom sau",
		THUOC,
		"AT TIME ZONE $3)::date + 1)",
		"AT TIME ZONE $3)::date + 2)",
		[[VC.thuoc, "vc: thuoc dem sai dung han"]],
	],
	[
		"k bo chan theo doi o CHO_DANH_GIA-XONG",
		LUAT,
		'const duoc = o === "G" ? vai.giao : vai.giao || vai.thucHien;',
		'const duoc = (o === "G" ? vai.giao : vai.giao || vai.thucHien) || (nguon === "CHO_DANH_GIA" && den === "XONG" && vai.theoDoi);',
		[[VC.trangThai, "vc: o khong lot"]],
	],
	[
		"l bo ve nguoi doi la nguoi thuc hien",
		GHI,
		"\t\tviec.nguoiThucHienId === input.nguoiId &&\n",
		"",
		[
			[VC.trangThai, "vc: roiChuaLamLuc ghi boi nguoi giao"],
			[VC.thuoc, "vc: thuoc dem sai dung han"],
		],
	],
	[
		"m bo kiem lai o nhanh mo lai",
		GHI,
		"await kiemNguoiNhanViec(tx, viec.nguoiThucHienId);",
		"",
		[[VC.vaiOkr, "vc: giao cho vai okr khong bi chan"]],
	],
	[
		"n bo kiem vai khi gan ban ghi",
		GHI,
		"for (const ma of nguoiTrongViec(viec)) {",
		"for (const ma of []) {",
		[[VC.vaiOkr, "vc: gan doi tac cho vai okr khong bi chan"]],
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
	banSao = dungBanSao("vc");
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
