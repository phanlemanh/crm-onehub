import type { Db } from "./client";

export type CaiDatHieuLuc = {
	dayRa: boolean;
	macDinh: boolean;
	doiLuc: Date | null;
};

export type MacDinhDayRa = (loai: string) => boolean | null;

type HangCaiDat = {
	userId: string;
	loai: string;
	dayRa: boolean;
	doiLuc: Date;
};

function boDoc(
	hang: HangCaiDat[],
	macDinhDayRa: MacDinhDayRa,
): (loai: string) => CaiDatHieuLuc {
	const theoLoai = new Map<string, HangCaiDat>();
	for (const h of hang) {
		if (macDinhDayRa(h.loai) === null) {
			console.warn(
				`[cai-dat-thong-bao] bo qua hang loai la nguoi=${h.userId} loai=${h.loai}`,
			);
			continue;
		}
		theoLoai.set(h.loai, h);
	}
	return (loai) => {
		const h = theoLoai.get(loai);
		if (h) return { dayRa: h.dayRa, macDinh: false, doiLuc: h.doiLuc };
		return { dayRa: macDinhDayRa(loai) ?? false, macDinh: true, doiLuc: null };
	};
}

export async function docCaiDatThongBao(
	db: Db,
	userId: string,
	macDinhDayRa: MacDinhDayRa,
): Promise<(loai: string) => CaiDatHieuLuc> {
	const hang = await db.caiDatThongBao.findMany({
		where: { userId },
		select: { userId: true, loai: true, dayRa: true, doiLuc: true },
	});
	return boDoc(hang, macDinhDayRa);
}

export async function docCaiDatNhieuNguoi(
	db: Db,
	userIds: string[],
	macDinhDayRa: MacDinhDayRa,
): Promise<Map<string, (loai: string) => CaiDatHieuLuc>> {
	const hang = await db.caiDatThongBao.findMany({
		where: { userId: { in: userIds } },
		select: { userId: true, loai: true, dayRa: true, doiLuc: true },
	});
	return new Map(
		userIds.map((id) => [
			id,
			boDoc(
				hang.filter((h) => h.userId === id),
				macDinhDayRa,
			),
		]),
	);
}

export async function luuCaiDatThongBao(
	db: Db,
	userId: string,
	loai: string,
	dayRa: boolean,
	macDinhDayRa: MacDinhDayRa,
): Promise<CaiDatHieuLuc> {
	const macDinh = macDinhDayRa(loai);
	if (macDinh === null)
		throw new Error(`loai thong bao khong ton tai: ${loai}`);
	if (dayRa === macDinh) {
		await db.caiDatThongBao.deleteMany({ where: { userId, loai } });
		return { dayRa, macDinh: true, doiLuc: null };
	}
	const h = await db.caiDatThongBao.upsert({
		where: { userId_loai: { userId, loai } },
		create: { userId, loai, dayRa },
		update: { dayRa },
		select: { dayRa: true, doiLuc: true },
	});
	return { dayRa: h.dayRa, macDinh: false, doiLuc: h.doiLuc };
}
