import { LOI_SO_THEO_KIEU, type LoiSoTheoKieu } from "@crm/validation/okr-kr";
import type { CapMau, MauNoiDung } from "@crm/validation/okr-mau";
import { z } from "zod";

export type MauChon = {
	id: string;
	ten: string;
	cap: CapMau;
	donViIds: string[];
	soKr: number;
	daDung: number;
	luuTru: boolean;
	noiDung: MauNoiDung;
};

export type NhomDonVi = "bo-phan" | "phong-ban";

export const nhomDonVi = (cap: CapMau): NhomDonVi =>
	cap === "bo-phan" ? "bo-phan" : "phong-ban";

const loiSo = z.enum(LOI_SO_THEO_KIEU);
const duongDichKr = z.tuple([
	z.literal("noiDung"),
	z.literal("krs"),
	z.number(),
	z.literal("targetValue"),
]);

type VanDe = {
	readonly path: readonly PropertyKey[];
	readonly message: string;
};

export function loiSoTheoKr(
	vanDe: readonly VanDe[],
): Map<number, LoiSoTheoKieu> {
	const kq = new Map<number, LoiSoTheoKieu>();
	for (const v of vanDe) {
		const duong = duongDichKr.safeParse(v.path);
		const loi = loiSo.safeParse(v.message);
		if (duong.success && loi.success) kq.set(duong.data[2], loi.data);
	}
	return kq;
}
