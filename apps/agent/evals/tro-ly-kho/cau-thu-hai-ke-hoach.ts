import { readFileSync } from "node:fs";
import { z } from "zod";

export const CAU_THU_HAI_ENV = {
	keHoach: "ZCH_KE_HOACH",
	ketQua: "ZCH_KET_QUA",
} as const;

const cauChuoi = z.object({
	maCau: z.string().min(1),
	messageId: z.string().min(1),
	than: z.string().min(2),
});

export const keHoachCauThuHai = z.object({
	chuoi: z.array(
		z.object({
			nguoi: z.string().min(1),
			cau: z.array(cauChuoi).min(2),
		}),
	),
});

export type KeHoachCauThuHai = z.infer<typeof keHoachCauThuHai>;

export const ketQuaCauThuHai = z.object({
	nguoi: z.string().min(1),
	thuTu: z.number().int().min(1),
	maCau: z.string().min(1),
	messageId: z.string().min(1),
	zaloHoiId: z.string().nullable(),
	sessionId: z.string().nullable(),
	ketQua: z.string().nullable(),
	tlhId: z.string().nullable(),
	tlhZaloHoiId: z.string().nullable(),
	tlhTrangThai: z.string().nullable(),
	tlhLyDo: z.string().nullable(),
	loi: z.string().nullable(),
});

export type KetQuaCauThuHai = z.infer<typeof ketQuaCauThuHai>;

export function docKeHoachCauThuHai(tep: string): KeHoachCauThuHai {
	return keHoachCauThuHai.parse(JSON.parse(readFileSync(tep, "utf8")));
}

export function docKetQuaCauThuHai(chu: string): KetQuaCauThuHai[] {
	return chu
		.split("\n")
		.filter(Boolean)
		.map((d) => ketQuaCauThuHai.parse(JSON.parse(d)));
}
