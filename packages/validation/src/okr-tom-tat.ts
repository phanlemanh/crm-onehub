import { z } from "zod";
import { cauTomTat } from "./okr-tro-ly";

export const TRANG_THAI_TOM_TAT = ["hien", "can-xem"] as const;

export type TrangThaiTomTat = (typeof TRANG_THAI_TOM_TAT)[number];

export const trangThaiTomTat = z.enum(TRANG_THAI_TOM_TAT);

export const MA_BO_CAU = [
	"nguon-ngoai-goi",
	"so-lech",
	"sai-chieu",
	"noi-ve-nguoi",
	"tu-cam",
	"trung-cau",
] as const;

export type MaBoCau = (typeof MA_BO_CAU)[number];

export const maBoCau = z.enum(MA_BO_CAU);

export const cauBoTomTat = cauTomTat.extend({ maBo: maBoCau });

export const noiDungTomTat = z.object({
	nac: z.enum(["an", "bat"]),
	cau: z.array(cauTomTat),
	bo: z.array(cauBoTomTat),
});

export type NoiDungTomTat = z.infer<typeof noiDungTomTat>;

export function parseNoiDungTomTat(value: unknown): NoiDungTomTat {
	const ket = noiDungTomTat.safeParse(value);
	if (!ket.success) {
		throw new Error(`noi dung tom tat tuan hong: ${ket.error.message}`);
	}
	return ket.data;
}

export function parseTrangThaiTomTat(value: unknown): TrangThaiTomTat {
	const ket = trangThaiTomTat.safeParse(value);
	if (!ket.success) {
		throw new Error(`trang thai tom tat tuan hong: ${ket.error.message}`);
	}
	return ket.data;
}
