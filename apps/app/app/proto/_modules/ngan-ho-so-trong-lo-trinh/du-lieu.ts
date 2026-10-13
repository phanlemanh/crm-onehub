import { phanTichLoTrinh } from "@crm/validation/lo-trinh-du-lieu";
import { choVaiXem } from "@/lib/lo-trinh/cho-vai";
import type { DauVaoLoTrinh } from "@/lib/lo-trinh/doc-trang";
import khoi from "./du-lieu-x2.json";

const kq = phanTichLoTrinh(khoi);
if (!kq.ok) throw new Error(`du-lieu-x2.json lech khuon: ${kq.duongKhoa}`);

const CO_DU_LIEU: DauVaoLoTrinh = {
	kieu: "co-du-lieu",
	duLieu: kq.duLieu,
	canhBao: [],
};

export const STATE = {
	dayDu: "ST-ngan-day-du",
	chuKho: "ST-ngan-chu-kho",
	oVang: "ST-ngan-o-vang",
	chuaCo: "ST-ngan-chua-co-tom-tat",
	khuonCu: "ST-ngan-khuon-cu",
	doanDai: "ST-ngan-doan-dai",
} as const;

export const NGAY_MAU = "2026-10-12";

const TEP = "docs/plan/lo-trinh-okr.json";

const VIEC = new Map<string, string>([
	[STATE.dayDu, "LT1"],
	[STATE.chuKho, "LT1"],
	[STATE.oVang, "4n"],
	[STATE.chuaCo, "N0"],
	[STATE.khuonCu, "LT1"],
	[STATE.doanDai, "R1g"],
]);

export function thamSoCuaState(state: string): string {
	const ma = VIEC.get(state);
	return ma ? `vongDoi=da-giao&viec=${encodeURIComponent(`${TEP}#${ma}`)}` : "";
}

export function dauVaoCuaState(state: string): DauVaoLoTrinh {
	if (state === STATE.chuKho) return choVaiXem(CO_DU_LIEU, "owner");
	if (state === STATE.khuonCu && CO_DU_LIEU.kieu === "co-du-lieu")
		return {
			...CO_DU_LIEU,
			duLieu: {
				...CO_DU_LIEU.duLieu,
				phien_ban: 1,
				lo_trinh: CO_DU_LIEU.duLieu.lo_trinh.map((lo) => ({
					...lo,
					hang: lo.hang.map((h) => ({ ...h, tom_tat: null })),
				})),
			},
		};
	return choVaiXem(CO_DU_LIEU, "member");
}
