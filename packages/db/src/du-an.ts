import { z } from "zod";
import type { DbGhi } from "./zalo-lien-ket";

export const DU_AN = {
	tenToiDa: 120,
	moTaToiDa: 4000,
	viecToiDa: 300,
	mocToiDa: 50,
	phuThuocToiDa: 600,
	ngayLeToiDa: 200,
	tenNgayLeToiDa: 80,
} as const;

export const LOAI_VET_DU_AN = [
	"tao",
	"doi-noi-dung",
	"them-viec",
	"bot-viec",
	"them-moc",
	"sua-moc",
	"xoa-moc",
	"dong",
	"mo-lai",
] as const;

export type LoaiVetDuAn = (typeof LOAI_VET_DU_AN)[number];

const viecNgan = z.object({ id: z.string(), tieuDe: z.string() });
const mocNgan = z.object({ id: z.string(), ten: z.string(), ngay: z.string() });
const noiDung = z.object({ ten: z.string(), moTa: z.string().nullable() });

export const vetDuAn = z.discriminatedUnion("loai", [
	z.object({ loai: z.literal("tao"), truoc: z.null(), sau: noiDung }),
	z.object({ loai: z.literal("doi-noi-dung"), truoc: noiDung, sau: noiDung }),
	z.object({ loai: z.literal("them-viec"), truoc: z.null(), sau: viecNgan }),
	z.object({ loai: z.literal("bot-viec"), truoc: viecNgan, sau: z.null() }),
	z.object({ loai: z.literal("them-moc"), truoc: z.null(), sau: mocNgan }),
	z.object({ loai: z.literal("sua-moc"), truoc: mocNgan, sau: mocNgan }),
	z.object({ loai: z.literal("xoa-moc"), truoc: mocNgan, sau: z.null() }),
	z.object({ loai: z.literal("dong"), truoc: z.null(), sau: z.null() }),
	z.object({ loai: z.literal("mo-lai"), truoc: z.null(), sau: z.null() }),
]);

export type VetDuAn = z.infer<typeof vetDuAn>;

export function parseVetDuAn(hang: {
	loai: string;
	truoc: unknown;
	sau: unknown;
}): VetDuAn {
	return vetDuAn.parse({ loai: hang.loai, truoc: hang.truoc, sau: hang.sau });
}

export async function coLichSuDuAn(
	tx: DbGhi,
	duAnId: string,
): Promise<boolean> {
	const n = await tx.duAnVet.count({
		where: { duAnId, loai: { not: "tao" } },
	});
	return n > 0;
}
