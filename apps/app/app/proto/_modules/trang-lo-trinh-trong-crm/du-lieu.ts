import { phanTichLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import type { DauVaoLoTrinh } from "@/lib/lo-trinh/doc-trang";
import mau from "./du-lieu-mau.json";

const kq = phanTichLoTrinh(mau);
if (!kq.ok) throw new Error(`du-lieu-mau.json lech khuon: ${kq.duongKhoa}`);
const DU_LIEU_MAU = kq.duLieu;

export const STATE = {
	dayDu: "ST-lotrinh-day-du",
	loc: "ST-lotrinh-loc",
	tre: "ST-lotrinh-tre",
	dangTai: "ST-lotrinh-dang-tai",
	chuaCoKhoi: "ST-lotrinh-chua-co-khoi",
	khoiHong: "ST-lotrinh-khoi-hong",
	tepVang: "ST-lotrinh-tep-vang",
	loLoi: "ST-lotrinh-lo-loi",
	khuonMoi: "ST-lotrinh-khuon-moi",
	bangCot: "ST-lotrinh-bang-cot",
	chiTiet: "ST-lotrinh-chi-tiet",
	chiaMoc: "ST-lotrinh-chia-moc",
	tab: "ST-lotrinh-tab",
	daBac: "ST-lotrinh-da-bac",
} as const;

export const NGAY_MAU = "2026-10-09";
export const NGAY_TRE = "2026-12-20";

const THAM_SO = new Map<string, string>([
	[STATE.loc, "nhom=okr"],
	[STATE.tab, "vongDoi=da-giao"],
	[STATE.bangCot, "xemLoTrinh=bang-cot"],
	[STATE.chiaMoc, "xemLoTrinh=moc"],
	[STATE.daBac, "daBac=true"],
	[STATE.chiTiet, "viec=docs%2Fplan%2Flo-trinh-okr.json%23LT2"],
]);

export function thamSoCuaState(state: string): string {
	return THAM_SO.get(state) ?? "";
}

export function dauVaoCuaState(state: string): DauVaoLoTrinh {
	if (state === STATE.tepVang) return { kieu: "tep-vang" };
	if (state === STATE.chuaCoKhoi)
		return {
			kieu: "chua-co-khoi",
			cauMay: "trang chưa mang dữ liệu lộ trình — vẽ lại bằng bộ kit từ 2.27",
		};
	if (state === STATE.khoiHong)
		return {
			kieu: "khoi-hong",
			cauMay:
				"khối dữ liệu lộ trình không phải JSON hợp lệ: Unexpected token 'k', \"{khong\" is not valid JSON",
		};
	if (state === STATE.loLoi)
		return {
			kieu: "co-du-lieu",
			canhBao: [],
			duLieu: {
				...DU_LIEU_MAU,
				lo_trinh: DU_LIEU_MAU.lo_trinh.map((lo, i) =>
					i === 1
						? {
								...lo,
								loi: "docs/plan/lo-trinh-kho-tai-lieu.json: không phải JSON hợp lệ (dòng 14)",
								hang: [],
								moc: [],
								can_sua: [],
								da_bac: [],
								hang_ke: null,
							}
						: lo,
				),
			},
		};
	if (state === STATE.khuonMoi)
		return {
			kieu: "co-du-lieu",
			canhBao: ["khuôn phiên bản 2 mới hơn bộ đọc (1) — đọc phần biết"],
			duLieu: { ...DU_LIEU_MAU, phien_ban: 2 },
		};
	return { kieu: "co-du-lieu", canhBao: [], duLieu: DU_LIEU_MAU };
}
