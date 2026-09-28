import type { LoaiViecKr } from "@crm/validation/okr-canh-kr";
import { ngayLich } from "@crm/validation/okr-chu-ky";
import type { OkrVetSnapshot } from "@crm/validation/okr-vet";
import type { DongViec } from "./okr-canh-kr.contracts";

export type HangViec = {
	id: string;
	loai: LoaiViecKr;
	tieuDe: string;
	nguoiLamUserId: string | null;
	hanNgay: Date | null;
	xongLuc: Date | null;
	campaignId: string | null;
	planId: string | null;
};

export type BoiCanhDong = {
	userId: string;
	homNay: string;
	tenNguoi: Map<string, string>;
	conThanhVien: Set<string>;
};

export function cotNgay(ngay: string): Date {
	return new Date(`${ngayLich.parse(ngay)}T00:00:00.000Z`);
}

export function ngayCuaCot(d: Date | null): string | null {
	return d === null ? null : ngayLich.parse(d.toISOString().slice(0, 10));
}

export function anhVetViec(h: HangViec): OkrVetSnapshot {
	switch (h.loai) {
		case "chien-dich":
			return { loai: h.loai, campaignId: h.campaignId };
		case "ke-hoach":
			return { loai: h.loai, planId: h.planId };
		case "viec":
			return {
				viecId: h.id,
				tieuDe: h.tieuDe,
				nguoiLamUserId: h.nguoiLamUserId,
				hanNgay: ngayCuaCot(h.hanNgay),
			};
	}
}

export function dongViecTu(h: HangViec, bc: BoiCanhDong): DongViec {
	const hanNgay = ngayCuaCot(h.hanNgay);
	const xong = h.xongLuc !== null;
	const nguoiLam =
		h.nguoiLamUserId === null
			? null
			: {
					id: h.nguoiLamUserId,
					name: bc.tenNguoi.get(h.nguoiLamUserId) ?? "",
					daRoi: !bc.conThanhVien.has(h.nguoiLamUserId),
				};
	return {
		id: h.id,
		loai: "viec",
		tieuDe: h.tieuDe,
		nguoiLam,
		hanNgay,
		quaHan: !xong && hanNgay !== null && hanNgay < bc.homNay,
		xong,
		laNguoiLam: h.nguoiLamUserId === bc.userId,
	};
}
