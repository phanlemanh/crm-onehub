import {
	type LoTrinhDuLieu,
	phanTichLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";
import type { DauVaoLoTrinh } from "@/lib/lo-trinh/doc-trang";
import mau from "./du-lieu-mau.json";

export const STATE = {
	moc: "ST-du-kien-moc",
	bang: "ST-du-kien-bang",
	ngan: "ST-du-kien-ngan",
	daQua: "ST-du-kien-da-qua",
	banCu: "ST-du-kien-ban-cu",
	mocEn: "ST-du-kien-moc-en",
} as const;

export const NGAY_MAU = "2026-10-17";
export const NGAY_DA_QUA = "2026-10-19";

const DU_KIEN = new Map([
	[
		"2026-10-21",
		{ ngay_tinh: "2026-10-17", hoan_tat: "2026-10-17", qua_tai: null },
	],
	[
		"2026-10-28",
		{
			ngay_tinh: "2026-10-15",
			hoan_tat: "2026-10-30",
			qua_tai: "mốc quá tải: dự kiến 30/10, mục tiêu 28/10",
		},
	],
]);

function hangDaDo(ma: string): boolean {
	return ma === "l5";
}

function voiDuKien(goc: LoTrinhDuLieu): LoTrinhDuLieu {
	return {
		...goc,
		lo_trinh: goc.lo_trinh.map((lo) => ({
			...lo,
			hang: lo.hang.map((h) =>
				hangDaDo(h.ma) && h.gio_may
					? {
							...h,
							gio_may: {
								...h.gio_may,
								nguon: "do",
								co: null,
								chu: "5–7 giờ máy (theo 6 vòng đo)",
							},
						}
					: h,
			),
			moc: lo.moc.map((m) => {
				const dk = m.con_viec ? DU_KIEN.get(m.ngay) : undefined;
				if (lo.tep.endsWith("kho-tai-lieu.json") && m.con_viec)
					return {
						...m,
						du_kien: {
							ngay_tinh: "2026-10-16",
							hoan_tat: "2026-10-20",
							chu: "dự báo lúc bắt đầu (16/10): hoàn tất 20/10",
						},
						qua_tai: null,
					};
				if (!dk) return m;
				return {
					...m,
					du_kien: {
						ngay_tinh: dk.ngay_tinh,
						hoan_tat: dk.hoan_tat,
						chu: `dự báo lúc bắt đầu: hoàn tất ${dk.hoan_tat}`,
					},
					qua_tai: dk.qua_tai,
				};
			}),
		})),
	};
}

function banCu(goc: LoTrinhDuLieu): LoTrinhDuLieu {
	return {
		...goc,
		lo_trinh: goc.lo_trinh.map((lo) => ({
			...lo,
			hang: lo.hang.map((h) => ({ ...h, gio_may: null })),
			moc: lo.moc.map((m) => ({
				...m,
				gio_may: null,
				du_kien: null,
				qua_tai: null,
			})),
		})),
	};
}

function docLai(duLieu: LoTrinhDuLieu | typeof mau): LoTrinhDuLieu {
	const kq = phanTichLoTrinh(duLieu);
	if (!kq.ok) throw new Error(`du-lieu-mau.json lech khuon: ${kq.duongKhoa}`);
	return kq.duLieu;
}

const GOC = docLai(mau);
const VOI_DU_KIEN = docLai(voiDuKien(GOC));
const BAN_CU = docLai(banCu(GOC));

const THAM_SO = new Map<string, string>([
	[STATE.moc, "xemLoTrinh=moc"],
	[STATE.mocEn, "xemLoTrinh=moc"],
	[STATE.daQua, "xemLoTrinh=moc"],
	[STATE.banCu, "xemLoTrinh=moc"],
	[STATE.ngan, "viec=docs%2Fplan%2Flo-trinh-okr.json%23LT1e"],
]);

export function thamSoCuaState(state: string): string {
	return THAM_SO.get(state) ?? "";
}

export function dauVaoCuaState(state: string): DauVaoLoTrinh {
	const duLieu = state === STATE.banCu ? BAN_CU : VOI_DU_KIEN;
	return { kieu: "co-du-lieu", canhBao: [], duLieu };
}
