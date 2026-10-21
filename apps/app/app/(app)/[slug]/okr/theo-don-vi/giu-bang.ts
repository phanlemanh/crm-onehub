import { type DonChonOkr, khoaDonOkr } from "@crm/validation/okr-tham-so";
import { z } from "zod";

const donChon = z.discriminatedUnion("loai", [
	z.object({ loai: z.literal("goc") }),
	z.object({ loai: z.literal("bp"), id: z.string() }),
	z.object({ loai: z.literal("pb"), id: z.string() }),
	z.object({ loai: z.literal("nguoi"), id: z.string() }),
]);

const khoaTruyVanDanhSach = z.tuple([
	z.unknown(),
	z.object({ input: z.object({ cycleId: z.string(), unit: donChon }) }),
]);

export type TruyVanTruoc = { queryKey: readonly unknown[] };

export function giuKhiChiDoiLoc<T>(hienTai: {
	cycleId: string;
	don: DonChonOkr;
}): (truoc: T | undefined, truyVanTruoc: TruyVanTruoc | undefined) => T | undefined {
	return (truoc, truyVanTruoc) => {
		if (truoc === undefined || truyVanTruoc === undefined) return undefined;
		const khoa = khoaTruyVanDanhSach.safeParse(truyVanTruoc.queryKey);
		if (!khoa.success) return undefined;
		const { cycleId, unit } = khoa.data[1].input;
		const cungKhoa =
			cycleId === hienTai.cycleId && khoaDonOkr(unit) === khoaDonOkr(hienTai.don);
		return cungKhoa ? truoc : undefined;
	};
}
