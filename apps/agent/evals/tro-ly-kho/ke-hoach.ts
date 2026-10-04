import { readFileSync } from "node:fs";
import { z } from "zod";

export const CHAM_BO_DO_ENV = {
	keHoach: "TLK_KE_HOACH",
	ketQua: "TLK_KET_QUA",
} as const;

const cauMot = z.object({
	id: z.string().min(1),
	cau: z.string().min(2),
	nguoiId: z.string().min(1),
});

const cauHai = cauMot.extend({
	messageId: z.string().min(1),
	than: z.string().min(2),
});

export const keHoachChamBoDo = z.object({
	lo: z.number().int().min(1),
	mot: z.array(cauMot),
	hai: z.array(cauHai),
});

export type KeHoachChamBoDo = z.infer<typeof keHoachChamBoDo>;

export const ketQuaChamBoDo = z.discriminatedUnion("luot", [
	z.object({
		luot: z.literal(1),
		id: z.string().min(1),
		hoiId: z.string().min(1),
		phienId: z.string().nullable(),
		conGoi: z.array(z.string()),
		loi: z.string().nullable(),
	}),
	z.object({
		luot: z.literal(2),
		id: z.string().min(1),
		messageId: z.string().min(1),
		zaloHoiId: z.string().nullable(),
		phienId: z.string().nullable(),
		ketQua: z.string().nullable(),
		conGoi: z.array(z.string()),
		loi: z.string().nullable(),
	}),
]);

export type KetQuaChamBoDo = z.infer<typeof ketQuaChamBoDo>;

export function docKeHoach(tep: string): KeHoachChamBoDo {
	return keHoachChamBoDo.parse(JSON.parse(readFileSync(tep, "utf8")));
}

export function docKetQua(chu: string): KetQuaChamBoDo[] {
	return chu
		.split("\n")
		.filter(Boolean)
		.map((d) => ketQuaChamBoDo.parse(JSON.parse(d)));
}
