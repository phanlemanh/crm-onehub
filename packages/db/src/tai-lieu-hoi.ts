import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { dauNgayVN, ngayVN } from "./onboarding-nhac";

type Ghi = Db | Prisma.TransactionClient;

export type KetQuaHoi =
	| { trangThai: "TRA_LOI"; traLoi: Prisma.InputJsonValue }
	| {
			trangThai: "TU_CHOI";
			lyDo: "khong-co-trang" | "trich-truot";
			ganNhat: Prisma.InputJsonValue;
	  }
	| { trangThai: "LOI"; lyDo: "het-tran" | "loi-model" | "qua-han" };

export function dauThangVN(now: Date): Date {
	return dauNgayVN(new Date(`${ngayVN(now).slice(0, 8)}01T12:00:00+07:00`));
}

export function demHoiTrongNgay(
	db: Ghi,
	nguoiId: string,
	now: Date,
): Promise<number> {
	return db.taiLieuHoi.count({
		where: {
			nguoiHoiId: nguoiId,
			kenh: "CRM",
			hoiLuc: { gte: dauNgayVN(now) },
		},
	});
}

export function demHoiTrongThang(db: Ghi, now: Date): Promise<number> {
	return db.taiLieuHoi.count({
		where: { kenh: "CRM", hoiLuc: { gte: dauThangVN(now) } },
	});
}

export async function ghiKetQuaHoi(
	db: Ghi,
	hoiId: string,
	kq: KetQuaHoi,
	now: Date,
): Promise<boolean> {
	const chung = { trangThai: kq.trangThai, xongLuc: now };
	const data: Prisma.TaiLieuHoiUpdateManyMutationInput =
		kq.trangThai === "TRA_LOI"
			? { ...chung, traLoi: kq.traLoi, cauHoi: null, lyDo: null }
			: kq.trangThai === "TU_CHOI"
				? { ...chung, lyDo: kq.lyDo, ganNhat: kq.ganNhat }
				: { ...chung, lyDo: kq.lyDo };
	const { count } = await db.taiLieuHoi.updateMany({
		where: { id: hoiId, trangThai: "DANG_HOI" },
		data,
	});
	return count === 1;
}

export async function demHoiKho(
	db: Db,
	tu: Date,
	den: Date,
): Promise<{
	traLoi: number;
	tuChoi: number;
	loi: number;
	tiLe: number | null;
}> {
	const nhom = await db.taiLieuHoi.groupBy({
		by: ["trangThai"],
		where: { hoiLuc: { gte: tu, lt: den } },
		_count: { _all: true },
	});
	const so = (t: string) =>
		nhom.find((n) => n.trangThai === t)?._count._all ?? 0;
	const traLoi = so("TRA_LOI");
	const tuChoi = so("TU_CHOI");
	const mau = traLoi + tuChoi;
	return {
		traLoi,
		tuChoi,
		loi: so("LOI"),
		tiLe: mau === 0 ? null : traLoi / mau,
	};
}

export async function demBaoSai(
	db: Db,
	tu: Date,
	den: Date,
): Promise<{ tong: number; daXuLy: number; xacNhanSai: number }> {
	const where = { taoLuc: { gte: tu, lt: den } };
	const [tong, daXuLy, xacNhanSai] = await Promise.all([
		db.taiLieuBaoSai.count({ where }),
		db.taiLieuBaoSai.count({ where: { ...where, trangThai: "DA_XU_LY" } }),
		db.taiLieuBaoSai.count({ where: { ...where, ketLuan: "SAI" } }),
	]);
	return { tong, daXuLy, xacNhanSai };
}
