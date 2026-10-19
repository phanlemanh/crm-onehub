// Hồ sơ _acceptance/ke-hoach-sinh-viec — E16: mỗi cặp chạy phép đo trên bản sao lành phải xanh, rồi
// thay ĐÚNG MỘT chuỗi vật thật và chạy lại phải đỏ với thông điệp ghim. Khuôn và bản sao dùng chung
// ban-sao.mjs của ca-chap-chon-cach-ly như viec-chung.
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

const SO_CAP_KHAI = 9;
const TRAN_MS = 900_000;
const API = (tep, t) =>
	`bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const KH = {
	tao: API("ke-hoach-sinh-viec.spec.ts", "kh-tao"),
	chonNguoi: API("ke-hoach-sinh-viec.spec.ts", "kh-chon-nguoi"),
	banChieu: API("ke-hoach-sinh-viec.spec.ts", "kh-ban-chieu"),
	chan: API("ke-hoach-sinh-viec.spec.ts", "kh-chan"),
	goBuoc: API("ke-hoach-sinh-viec.spec.ts", "kh-go-buoc"),
	thuoc: API("ke-hoach-sinh-viec-do-nguong.spec.ts"),
	nhacBuoc: `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.integration.spec.ts -t kh-nhac-buoc"`,
};
const DICH_VU = "apps/api/src/onboarding/onboarding.service.ts";
const GHI_KH = "apps/api/src/onboarding/onboarding-ghi.ts";
const GHI_VIEC = "packages/db/src/viec-ghi.ts";
const GOM = "packages/db/src/onboarding-nhac.ts";
const THUOC = "_acceptance/ke-hoach-sinh-viec/rang/do-nguong.mjs";

const CAP = [
	[
		"a bo tao Viec trong createFromTemplate",
		DICH_VU,
		"await taoViecChoBuoc(tx, {",
		"if (Date.now() < 0) await taoViecChoBuoc(tx, {",
		[[KH.tao, "kh: buoc khong tro dung mot viec"]],
	],
	[
		"b bo kiem vai o nhanh chon nguoi theo phong",
		DICH_VU,
		"(await kiemNguoiTheoPhong(tx, chon)).id",
		"chon.userId",
		[[KH.chonNguoi, "kh: chon vai okr khong bi chan"]],
	],
	[
		"c bo chieu o viec.sua",
		GHI_VIEC,
		"\t\t\tsau: { hanNgay: hanMoi },\n\t\t});\n\t}\n\tawait chieuLenBuoc(tx, viec.id);\n",
		"\t\t\tsau: { hanNgay: hanMoi },\n\t\t});\n\t}\n",
		[[KH.banChieu, "kh: buoc lech viec sau viec.sua"]],
	],
	[
		"d bo chan Huy tren Viec cua buoc",
		GHI_VIEC,
		"if (input.den === TrangThaiViec.HUY) await chanViecCuaBuoc(tx, viec.id);",
		"",
		[[KH.chan, "kh: viec cua buoc khong bi chan"]],
	],
	[
		"e removeStep xoa Viec thay vi Huy",
		GHI_KH,
		"await tx.onboardingStep.delete({ where: { id: buoc.id } });",
		"await tx.onboardingStep.delete({ where: { id: buoc.id } });\n\t\t\tif (buoc.viecId !== null) await tx.viec.delete({ where: { id: buoc.viecId } });",
		[[KH.goBuoc, "kh: go buoc viec sai"]],
	],
	[
		"f bo loc buoc da noi o bo gom nhac",
		GOM,
		"s.viecId !== null",
		"false",
		[[KH.nhacBuoc, "kh: nhac trung buoc va viec"]],
	],
	[
		"g thuoc so han sang ngay hom sau",
		THUOC,
		"AT TIME ZONE $3)::date + 1)",
		"AT TIME ZONE $3)::date + 2)",
		[[KH.thuoc, "kh: thuoc dem sai dungHan"]],
	],
	[
		"h thuoc bo loc han <= --den",
		THUOC,
		"AND (v.\"hanNgay\" AT TIME ZONE 'UTC')::date <= $2::date",
		"AND TRUE",
		[[KH.thuoc, "kh: thuoc dem sai tong"]],
	],
	[
		"i closePlan bo qua co huyViecMo",
		GHI_KH,
		"if (huyViecMo) await huyViecMoCuaKeHoach(tx, sau.id, actingUserId);",
		"",
		[[KH.goBuoc, "kh: dong ke hoach viec sai"]],
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
	banSao = dungBanSao("kh");
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
