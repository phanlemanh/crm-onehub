import { type DonChonOkr, khoaDonOkr } from "@crm/validation/okr-tham-so";
import { z } from "zod";
import { SOAN_BO } from "./cau-hinh";

const ma = z.string().min(1);

const donGoc = z
	.tuple([z.literal("goc")])
	.transform((): DonChonOkr => ({ loai: "goc" }));

const donCoId = z
	.tuple([z.enum(["bp", "pb", "nguoi"]), ma])
	.transform(([loai, id]): DonChonOkr => ({ loai, id }));

const khoaDon = z
	.string()
	.transform((v) => v.split(":"))
	.pipe(z.union([donGoc, donCoId]));

const khoaBo = z
	.string()
	.transform((v) => v.split(SOAN_BO.dauTachKhoa))
	.pipe(z.tuple([ma, khoaDon]))
	.transform(([cycleId, don]) => ({ cycleId, don }));

export type KhoaBo = z.infer<typeof khoaBo>;

export function taoKhoaBo(cycleId: string, don: DonChonOkr): string {
	return `${cycleId}${SOAN_BO.dauTachKhoa}${khoaDonOkr(don)}`;
}

export function docKhoaBo(id: string): KhoaBo | null {
	const kq = khoaBo.safeParse(id);
	return kq.success ? kq.data : null;
}
