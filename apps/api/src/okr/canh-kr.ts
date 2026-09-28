import type { CampaignStatus, Prisma } from "@crm/db";
import { LOAI_VIEC_KR, type LoaiViecKr } from "@crm/validation/okr-canh-kr";
import { ngayLich } from "@crm/validation/okr-chu-ky";
import type { HanhDongVet, OkrVetSnapshot } from "@crm/validation/okr-vet";
import {
	docDuocPhamVi,
	type WorkspaceRole,
} from "@crm/validation/vai-workspace";
import { z } from "zod";
import {
	type DongViec,
	type LienKet,
	LOAI_SANG_KIEN,
} from "./okr-canh-kr.contracts";

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

export const chonHangViec = {
	id: true,
	keyResultId: true,
	loai: true,
	tieuDe: true,
	nguoiLamUserId: true,
	hanNgay: true,
	xongLuc: true,
	campaignId: true,
	planId: true,
} as const;

type HangViecDb = Prisma.OkrViecKrGetPayload<{ select: typeof chonHangViec }>;

const loaiViecKr = z.enum(LOAI_VIEC_KR);

export function hangViec(h: HangViecDb): HangViec & { keyResultId: string } {
	return { ...h, loai: loaiViecKr.parse(h.loai) };
}

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

export type LoaiSangKien = (typeof LOAI_SANG_KIEN)[number];

export type HangSangKien = {
	loai: LoaiSangKien;
	campaign: { id: string; name: string; status: CampaignStatus } | null;
	plan: {
		id: string;
		closedAt: Date | null;
		company: { name: string; archivedAt: Date | null };
	} | null;
};

export function lienKetChoVai(
	role: WorkspaceRole,
	hang: HangSangKien,
): LienKet {
	if (!docDuocPhamVi(role, "doi-tac"))
		return { loai: hang.loai, coQuyen: false };
	if (hang.loai === "chien-dich") {
		const c = hang.campaign;
		if (c === null)
			return {
				loai: hang.loai,
				coQuyen: true,
				id: null,
				ten: null,
				trangThai: "da-xoa",
			};
		return {
			loai: hang.loai,
			coQuyen: true,
			id: c.id,
			ten: c.name,
			trangThai:
				c.status === "FINISHED"
					? "da-dong"
					: c.status === "DRAFT"
						? "chua-chay"
						: "dang-chay",
		};
	}
	const p = hang.plan;
	if (p === null)
		return {
			loai: hang.loai,
			coQuyen: true,
			id: null,
			ten: null,
			trangThai: "da-xoa",
		};
	return {
		loai: hang.loai,
		coQuyen: true,
		id: p.id,
		ten: p.company.name,
		trangThai:
			p.company.archivedAt !== null
				? "da-luu-tru"
				: p.closedAt !== null
					? "da-dong"
					: "dang-chay",
	};
}

const HANH_DONG_SANG_KIEN: readonly HanhDongVet[] = [
	"gan-sang-kien",
	"go-viec",
];
const loaiSangKien = z.enum(LOAI_SANG_KIEN);

type VetDong = {
	action: HanhDongVet;
	before: OkrVetSnapshot | null;
	after: OkrVetSnapshot | null;
};

function anhSangKienChoVai(
	role: WorkspaceRole,
	anh: OkrVetSnapshot | null,
): OkrVetSnapshot | null {
	const loai = loaiSangKien.safeParse(anh?.loai);
	if (anh === null || !loai.success) return anh;
	const lk = lienKetChoVai(role, {
		loai: loai.data,
		campaign: null,
		plan: null,
	});
	return lk.coQuyen ? anh : { loai: lk.loai, coQuyen: false };
}

export function vetSangKienChoVai<V extends VetDong>(
	role: WorkspaceRole,
	v: V,
): V {
	if (!HANH_DONG_SANG_KIEN.includes(v.action)) return v;
	return {
		...v,
		before: anhSangKienChoVai(role, v.before),
		after: anhSangKienChoVai(role, v.after),
	};
}
