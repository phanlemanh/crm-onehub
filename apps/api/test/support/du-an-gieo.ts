import { db } from "@crm/db";
import { taoDuAn } from "@crm/db/du-an-ghi";
import { taoThu } from "./viec-gieo";

export function ngayDb(s: string): Date {
	return new Date(`${s}T00:00:00.000Z`);
}

export function ngayCua(d: Date | null | undefined): string | null {
	return d ? d.toISOString().slice(0, 10) : null;
}

export function duAnThu(
	nguoiId: string,
	ten = "Dự án thử",
): Promise<{ id: string }> {
	return db.$transaction((tx) =>
		taoDuAn(tx, {
			nguoiId,
			ten: `${ten} ${Math.random().toString(36).slice(2, 7)}`,
			now: new Date(),
		}),
	);
}

export function viecCoLich(input: {
	duAnId: string | null;
	giaoId: string;
	thucHienId?: string;
	tieuDe: string;
	batDau?: string;
	han?: string;
}): Promise<{ id: string }> {
	return taoThu({
		nguoiId: input.giaoId,
		nguoiThucHienId: input.thucHienId ?? input.giaoId,
		tieuDe: input.tieuDe,
		gan: [],
		duAnId: input.duAnId,
		hanNgay: input.han ? ngayDb(input.han) : null,
		batDauNgay: input.batDau ? ngayDb(input.batDau) : null,
	});
}

export async function lichCua(id: string) {
	const v = await db.viec.findUniqueOrThrow({
		where: { id },
		select: { batDauNgay: true, hanNgay: true, duAnId: true, trangThai: true },
	});
	return {
		batDau: ngayCua(v.batDauNgay),
		han: ngayCua(v.hanNgay),
		duAnId: v.duAnId,
		trangThai: v.trangThai,
	};
}

export async function donDuAn(): Promise<void> {
	await db.viec.deleteMany({
		where: { taoBoi: { email: { endsWith: "@thu.test" } } },
	});
	await db.duAn.deleteMany({
		where: { taoBoi: { email: { endsWith: "@thu.test" } } },
	});
}

export async function themLe(
	ngay: string,
	taoBoiId: string,
	ten = "Lễ thử",
): Promise<void> {
	await db.ngayNghi.upsert({
		where: { ngay: ngayDb(ngay) },
		create: { ngay: ngayDb(ngay), ten, taoBoiId },
		update: {},
	});
}

export async function boLe(ngay: string): Promise<void> {
	await db.ngayNghi.deleteMany({ where: { ngay: ngayDb(ngay) } });
}
