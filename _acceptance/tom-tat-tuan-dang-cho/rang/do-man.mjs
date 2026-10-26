import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	ket,
	khongDo,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";
import {
	bao,
	choThay,
	DO,
	GOC,
	mo,
	nghi,
	tongKet,
} from "../../vo-khu-muc-tieu/rang/do-man-lib.mjs";
import { taoNguCanh } from "../../vo-khu-muc-tieu/rang/do-man-ngu-canh.mjs";

const CHIEU_DO = process.env.EVAL === "chieu-do";
const CHEP_ANH = process.env.TTDC_CHEP_ANH === "1";
const ANH = CHEP_ANH
	? join(GOC, "_acceptance/tom-tat-tuan-dang-cho/evidence")
	: join(GOC, ".acceptance-runs/tom-tat-tuan-dang-cho/anh");
const DONG = '[data-trang-thai="ST-tomtat-cho-ban-dau"] [data-cho-ban]';
const KHO = [
	{ ten: "1440", rong: 1440, cao: 900 },
	{ ten: "375", rong: 375, cao: 812 },
];
const MAU_CHU =
	/^Kara gửi bản tóm tắt đầu tiên vào khoảng \d\d:\d\d (thứ \S+|Chủ nhật), \d\d\/\d\d — sáng hôm sau ngày cập nhật (thứ \S+|Chủ nhật)\.$/u;

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);
const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);
mkdirSync(ANH, { recursive: true });
console.log(`do-man HT4${CHIEU_DO ? " · chieu-do" : ""}`);

const n = await taoNguCanh({ canSoan: false });
const cauHinh = CHIEU_DO
	? { aiOn: false }
	: {
			aiOn: true,
			aiTomTatPhamVi: "danh-sach",
			aiTomTatDonVi: [n.donVi.id],
			aiTomTatAnPhamVi: "tat",
			aiTomTatAnDonVi: [],
		};
await n.api.quanTri.lam("okr.setProgram", cauHinh);
const vao = { cycleId: n.ky.hienHanh, departmentId: n.donVi.id };
const tomTat = await n.api.truong.hoi("okr.troLyTomTat", vao);
console.log(
	`okr.troLyTomTat: ban=${tomTat.ban === null ? "null" : "co"} dangSoan=${tomTat.dangSoan} chuaCapNhat=${tomTat.chuaCapNhat} choBan=${JSON.stringify(tomTat.choBan ?? null)}`,
);

const duong = n.w(
	`/okr/bo-okr?xemOkr=hop-tuan&donOkr=pb:${n.donVi.id}&kyOkr=${n.ky.hienHanh}`,
);
const t = n.may.truong;

for (const kho of KHO) {
	await t.trang.setViewport({ width: kho.rong, height: kho.cao });
	const r = await mo(t, duong, CHIEU_DO ? null : DONG);
	if (!CHIEU_DO && !r.thay) await choThay(t.trang, DONG, DO.cho.dauHieuMs);
	const dong = await t.trang.evaluate((chon) => {
		const o = document.querySelector(chon);
		if (!o) return null;
		o.scrollIntoView({ block: "center" });
		const h = o.getBoundingClientRect();
		return {
			chu: (o.textContent ?? "").replace(/\s+/g, " ").trim(),
			cao: h.height,
			tren: h.top,
			duoi: h.bottom,
			trai: h.left,
			phai: h.right,
			khungCao: window.innerHeight,
			khungRong: window.innerWidth,
			cuonNgang: document.documentElement.scrollWidth,
		};
	}, DONG);
	await nghi(DO.cho.cuonMs);
	await t.trang.screenshot({ path: join(ANH, `tom-tat-cho-${kho.ten}.png`) });
	if (dong === null) {
		bao(false, "", `SAI KHONG CO DONG CHO ${kho.ten}`);
		continue;
	}
	bao(
		MAU_CHU.test(dong.chu),
		`DUNG chu dong cho ${kho.ten}: ${dong.chu}`,
		`SAI CHU DONG CHO ${kho.ten}: ${dong.chu}`,
	);
	bao(
		dong.cao > 0 &&
			dong.tren >= 0 &&
			dong.duoi <= dong.khungCao &&
			dong.trai >= 0 &&
			dong.phai <= dong.khungRong,
		`DUNG dong cho nam tron trong khung ${kho.ten}`,
		`SAI DONG CHO NGOAI KHUNG ${kho.ten}: ${JSON.stringify(dong)}`,
	);
	bao(
		dong.cuonNgang <= dong.khungRong,
		`DUNG khong tran ngang ${kho.ten}`,
		`SAI TRAN NGANG ${kho.ten}: ${dong.cuonNgang} > ${dong.khungRong}`,
	);
}

const kq = tongKet();
console.log(
	`KET LUAN: ${kq.dung} dong DUNG, ${kq.sai} dong SAI · anh o ${ANH}`,
);
await ket(kq.sai > 0 ? 1 : 0);
