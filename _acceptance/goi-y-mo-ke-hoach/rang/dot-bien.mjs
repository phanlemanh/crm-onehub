// Hồ sơ _acceptance/goi-y-mo-ke-hoach — E11: mỗi cặp chạy phép đo trên bản sao lành phải xanh, rồi
// thay ĐÚNG MỘT chuỗi vật thật và chạy lại phải đỏ với thông điệp ghim. Thông điệp ghim là thông điệp
// ra trước thật, đã chạy tay trên bản sao đột biến (16/10). Khuôn và bản sao dùng chung ban-sao.mjs của
// ca-chap-chon-cach-ly như ke-hoach-sinh-viec.
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

const SO_CAP_KHAI = 10;
const TRAN_MS = 900_000;
const API = (tep, t) =>
	`bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/${tep}${t ? ` -t ${t}` : ""}"`;
const GY = {
	sinh: API("goi-y-mo-ke-hoach.spec.ts", "gy-sinh"),
	chan: API("goi-y-mo-ke-hoach.spec.ts", "gy-chan"),
	xuLy: API("goi-y-mo-ke-hoach.spec.ts", "gy-xu-ly"),
	dong: API("goi-y-mo-ke-hoach.spec.ts", "gy-dong"),
	thuoc: API("goi-y-mo-ke-hoach-do-nguong.spec.ts"),
	nhac: `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.integration.spec.ts -t gy-nhac"`,
};
const DEALS = "apps/api/src/deals/deals.service.ts";
const LUAT = "packages/db/src/goi-y-ke-hoach.ts";
const DICH_VU = "apps/api/src/onboarding/onboarding.service.ts";
const NHAC = "packages/db/src/goi-y-nhac.ts";
const THUOC = "_acceptance/goi-y-mo-ke-hoach/rang/do-nguong.mjs";

const CAP = [
	[
		"a bo sinh goi y o chuyenGiaiDoanTrongTx",
		DEALS,
		"\t\tawait sinhGoiYKeHoach(tx, {\n\t\t\tdealId: deal.id,",
		"\t\tawait Promise.resolve({\n\t\t\tdealId: deal.id,",
		[[GY.sinh, "gy: o sinh sai mo→thang"]],
	],
	[
		"b bo sinh goi y o DealsService.create",
		DEALS,
		"\t\t\t\tawait sinhGoiYKeHoach(tx, {\n\t\t\t\t\tdealId: created.id,",
		"\t\t\t\tawait Promise.resolve({\n\t\t\t\t\tdealId: created.id,",
		[[GY.sinh, "gy: o sinh sai tao→thang"]],
	],
	[
		"c bo dieu kien cong ty co ke hoach mo",
		LUAT,
		"if (keHoachMo > 0 || dangCho > 0) return null;",
		"if (dangCho > 0) return null;",
		[[GY.chan, "gy: chan ke hoach mo khong chan"]],
	],
	[
		"d bo dieu kien deal co goi y cho",
		LUAT,
		"if (keHoachMo > 0 || dangCho > 0) return null;",
		"if (keHoachMo > 0) return null;",
		[[GY.chan, "gy: chan cho khong chan"]],
	],
	[
		"e bo kiem quyen o boQuaGoiY",
		DICH_VU,
		"if (goiY.nguoiNhanId !== userId && !(await this.laQuanTri(userId))) {\n\t\t\tthrow",
		"if (Date.now() < 0) {\n\t\t\tthrow",
		[[GY.xuLy, "gy: nguoi khac bo qua duoc"]],
	],
	[
		"f bo dong goi y trong createFromTemplate",
		DICH_VU,
		"\t\t\tawait dongGoiYCuaCongTy(tx, {",
		"\t\t\tawait Promise.resolve({",
		[[GY.dong, "gy: tao ke hoach khong dong goi y"]],
	],
	[
		"g bo loc CHO o nguon nhac",
		NHAC,
		"\t\t\ttrangThai: TrangThaiGoiY.CHO,\n",
		"",
		[[GY.nhac, "gy: nhac goi y da xu ly"]],
	],
	[
		"h thuoc dem mau so tu bang goi y",
		THUOC,
		"\t\tSELECT c.* FROM chuyen c",
		'\t\tSELECT c.* FROM (SELECT g."dealId" AS deal_id, g."companyId" AS cong_ty, g."chuyenLuc" AS luc FROM "goiYKeHoach" g) c',
		[[GY.thuoc, "gy: thuoc khong bat thieu goi y"]],
	],
	[
		"i bo dieu kien giai doan di khong phai thang",
		LUAT,
		"\tif (args.tuLoai !== null && laChotDuoc(args.tuLoai)) return null;\n",
		"",
		[[GY.sinh, "gy: o khong sinh lai sinh thang→thang"]],
	],
	[
		"j thuoc bo nhanh khong do duoc",
		THUOC,
		"const khongDoDuoc = lanChuyen === 0 || (thieu === 0 && tiLe === null);",
		"const khongDoDuoc = false;",
		[[GY.thuoc, "gy: thuoc xanh khi khong do"]],
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
	banSao = dungBanSao("gy");
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
