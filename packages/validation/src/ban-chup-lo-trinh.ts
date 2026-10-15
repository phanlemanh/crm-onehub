import { z } from "zod";
import { type LoTrinhDuLieu, phanTichLoTrinh } from "./lo-trinh-du-lieu";

const MB = 1024 * 1024;

export const BAN_CHUP_LO_TRINH = {
	nguonCrm: "crm",
	tranThanByte: 2 * MB,
	tranCanhBao: 20,
	ketQua: ["nhan", "trung", "cu-hon"],
} as const;

const duLieuLoTrinh = z.record(z.string(), z.json()).superRefine((gt, ctx) => {
	const kq = phanTichLoTrinh(gt);
	if (!kq.ok)
		ctx.addIssue({
			code: "custom",
			path: kq.duongKhoa.split(".").filter(Boolean),
			message: kq.thongDiep,
		});
});

export const banChupVao = z.object({
	nguon: z.literal(BAN_CHUP_LO_TRINH.nguonCrm),
	sha: z.string().regex(/^[0-9a-f]{40}$/),
	commitLuc: z.iso.datetime({ offset: true }),
	duLieu: duLieuLoTrinh,
	canhBao: z.array(z.string()).max(BAN_CHUP_LO_TRINH.tranCanhBao),
});
export type BanChupVao = z.infer<typeof banChupVao>;

export const banChupRa = z.object({
	ketQua: z.enum(BAN_CHUP_LO_TRINH.ketQua),
});
export type KetQuaBanChup = z.infer<typeof banChupRa>["ketQua"];

export type BanChupDoc = {
	sha: string;
	commitLuc: string;
	layLuc: string;
	duLieu: LoTrinhDuLieu;
	canhBao: string[];
};

export type HangBanChupLuu = {
	sha: string;
	commitLuc: Date;
	layLuc: Date;
	duLieu: unknown;
	canhBao: string[];
};

export function phanTichBanChupLuu(
	hang: HangBanChupLuu,
):
	| { ok: true; banChup: BanChupDoc }
	| { ok: false; duongKhoa: string; thongDiep: string } {
	const kq = phanTichLoTrinh(hang.duLieu);
	if (!kq.ok) return kq;
	return {
		ok: true,
		banChup: {
			sha: hang.sha,
			commitLuc: hang.commitLuc.toISOString(),
			layLuc: hang.layLuc.toISOString(),
			duLieu: kq.duLieu,
			canhBao: hang.canhBao,
		},
	};
}
