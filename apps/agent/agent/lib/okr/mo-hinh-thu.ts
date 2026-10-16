import { z } from "zod";
import { TRO_LY_OKR } from "./config";

const { bien, danhSach } = TRO_LY_OKR.moHinhThu;
const [MAC_DINH, HAIKU] = danhSach;

export type MucMoHinh = (typeof danhSach)[number];

const maHopLe = z.enum([MAC_DINH.ma, HAIKU.ma]);

export function chonMoHinhTroLyOkr(
	env: Readonly<Record<string, string | undefined>>,
): MucMoHinh {
	if (env.NODE_ENV === "production") return MAC_DINH;
	const giaTri = env[bien];
	if (giaTri === undefined || giaTri === "") return MAC_DINH;
	const doc = maHopLe.safeParse(giaTri);
	if (!doc.success)
		throw new Error(
			`${bien}="${giaTri}" is not an allowed model. Allowed: ${danhSach.map((m) => m.ma).join(", ")}.`,
		);
	return doc.data === HAIKU.ma ? HAIKU : MAC_DINH;
}

export const MO_HINH_DANG_CHAY: MucMoHinh = chonMoHinhTroLyOkr(process.env);
