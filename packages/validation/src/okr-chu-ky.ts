import { PHA_CHUYEN_DUOC as PHA_CHUYEN } from "@crm/db/okr-don-vi";
import { PHA_GHI_DUOC as PHA_GHI } from "@crm/db/okr-duyet";
import { z } from "zod";

export const THAM_SO_KY_OKR = "kyOkr";

export const LOAI_CHU_KY = ["nam", "quy"] as const;
export const PHA_CHU_KY = [
	"lap-ke-hoach",
	"dang-chay",
	"cham-diem",
	"da-dong",
] as const;

export type LoaiChuKy = (typeof LOAI_CHU_KY)[number];
export type PhaChuKy = (typeof PHA_CHU_KY)[number];

export const PHA_GHI_DUOC: readonly PhaChuKy[] = PHA_GHI;

export const PHA_CHUYEN_DUOC: readonly PhaChuKy[] = PHA_CHUYEN;

export const ngayLich = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const truongNgayChuKy = {
	startsOn: ngayLich,
	endsOn: ngayLich,
	breakStartsOn: ngayLich.nullable(),
	breakEndsOn: ngayLich.nullable(),
};

const ngayChuKy = z.object(truongNgayChuKy);

type NgayChuKy = z.infer<typeof ngayChuKy>;

const kiemBatDau = (c: NgayChuKy) => c.startsOn < c.endsOn;

const kiemKhoangNghi = (c: NgayChuKy) =>
	(c.breakStartsOn === null) === (c.breakEndsOn === null) &&
	(c.breakStartsOn === null ||
		(c.breakStartsOn <= (c.breakEndsOn as string) &&
			c.breakStartsOn >= c.startsOn &&
			(c.breakEndsOn as string) <= c.endsOn));

const maChuKy = z.string().trim().min(1).max(120);
const tenChuKy = z.string().trim().min(2).max(80);
const thuCapNhat = z.int().min(1).max(7);

export const chuKyInput = z
	.object({
		kind: z.enum(LOAI_CHU_KY),
		name: tenChuKy,
		parentId: maChuKy.nullable(),
		...truongNgayChuKy,
		updateWeekday: thuCapNhat,
	})
	.refine(kiemBatDau, { message: "startsOn < endsOn" })
	.refine(kiemKhoangNghi, { message: "khoang nghi trong chu ky" });

export const suaChuKyInput = z
	.object({
		id: maChuKy,
		name: tenChuKy,
		...truongNgayChuKy,
		updateWeekday: thuCapNhat,
	})
	.refine(kiemBatDau, { message: "startsOn < endsOn" })
	.refine(kiemKhoangNghi, { message: "khoang nghi trong chu ky" });

export const goChuKyInput = z.object({ id: maChuKy });
export const hienChuKyInput = z.object({
	id: maChuKy,
});

export type SuaChuKyInput = z.infer<typeof suaChuKyInput>;
export type GoChuKyInput = z.infer<typeof goChuKyInput>;
export type HienChuKyInput = z.infer<typeof hienChuKyInput>;
export type ChuKyInput = z.infer<typeof chuKyInput>;

export function phaSau(pha: PhaChuKy): PhaChuKy | null {
	const i = PHA_CHU_KY.indexOf(pha);
	return PHA_CHU_KY[i + 1] ?? null;
}

export function ghiDuocOPha(pha: PhaChuKy): boolean {
	return PHA_GHI_DUOC.includes(pha);
}

export type TinhTrangChuKy = {
	phase: PhaChuKy;
	kind: LoaiChuKy;
	trong: boolean;
	daAn: boolean;
	quyConHien: number;
};

export type ViecChuKy = {
	suaMoiO: boolean;
	suaTen: boolean;
	go: boolean;
	an: boolean;
	hienLai: boolean;
};

export function viecChuKy(t: TinhTrangChuKy): ViecChuKy {
	if (t.daAn)
		return {
			suaMoiO: false,
			suaTen: false,
			go: false,
			an: false,
			hienLai: true,
		};
	return {
		suaMoiO: t.trong && t.phase === "lap-ke-hoach",
		suaTen: t.phase !== "da-dong",
		go: t.trong,
		an: !t.trong && !(t.kind === "nam" && t.quyConHien > 0),
		hienLai: false,
	};
}
