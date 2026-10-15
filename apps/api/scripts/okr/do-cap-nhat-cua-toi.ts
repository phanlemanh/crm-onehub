/**
 * Lệnh đo ngưỡng Cổng Đáng của hồ sơ `cua-toi-ba-phan` — CHỈ ĐỌC.
 *
 *   bun apps/api/scripts/okr/do-cap-nhat-cua-toi.ts --tu 2026-10-21 --den 2026-11-04
 *
 * Đếm phiên cập nhật tuần ĐÃ GỬI trong `[tu, den)` của người đang dẫn ít nhất một đơn vị
 * (trưởng bộ phận hoặc phòng ban chưa lưu trữ, theo cây lúc chạy lệnh). «Mở ở Của tôi» là
 * mọi lối vào trừ `sheet` (ngăn chi tiết một KR) — sau lượt DH3, mọi lối khác đều mở bảng
 * ngay trong Của tôi. In tỉ lệ, cờ «không đủ mẫu» khi dưới 10 phiên, và số đơn vị có dấu
 * sửa trong cửa sổ (chặn trên của số đơn vị có thể đã đổi trưởng — giới hạn đã khai ở
 * «Đường đo» của hợp đồng).
 */
import { type Db, db } from "@crm/db";

export const SAN_MAU = 10;
const LOI_NGAN_KR = "sheet";

export type KetQuaDo = {
	n: number;
	k: number;
	p: number;
	duMau: boolean;
	donViSua: number;
};

export async function doCapNhatCuaToi(
	nguon: Db,
	tu: Date,
	den: Date,
): Promise<KetQuaDo> {
	const [boPhan, phongBan] = await Promise.all([
		nguon.division.findMany({
			where: { archivedAt: null, headUserId: { not: null } },
			select: { headUserId: true },
		}),
		nguon.department.findMany({
			where: { archivedAt: null, headUserId: { not: null } },
			select: { headUserId: true },
		}),
	]);
	const truong = [
		...new Set(
			[...boPhan, ...phongBan].flatMap((d) =>
				d.headUserId === null ? [] : [d.headUserId],
			),
		),
	];
	const trongCuaSo = { gte: tu, lt: den };
	const phien = await nguon.okrCheckInSession.findMany({
		where: { userId: { in: truong }, submittedAt: trongCuaSo },
		select: { entry: true },
	});
	const [boPhanSua, phongBanSua] = await Promise.all([
		nguon.division.count({ where: { updatedAt: trongCuaSo } }),
		nguon.department.count({ where: { updatedAt: trongCuaSo } }),
	]);
	const n = phien.length;
	const k = phien.filter((x) => x.entry !== LOI_NGAN_KR).length;
	return {
		n,
		k,
		p: n === 0 ? 0 : Math.round((k / n) * 1000) / 10,
		duMau: n >= SAN_MAU,
		donViSua: boPhanSua + phongBanSua,
	};
}

export function inKetQua(r: KetQuaDo): string {
	return [
		`${r.k}/${r.n} phiên đã gửi của trưởng đơn vị mở ở Của tôi (${r.p.toFixed(1)} %)`,
		r.duMau ? "đủ mẫu" : `không đủ mẫu (dưới ${SAN_MAU} phiên)`,
		`${r.donViSua} đơn vị sửa trong cửa sổ`,
	].join("\n");
}

function ngay(args: string[], co: string): Date {
	const i = args.indexOf(co);
	const giaTri = i === -1 ? undefined : args[i + 1];
	const d = giaTri ? new Date(`${giaTri}T00:00:00+07:00`) : null;
	if (!d || Number.isNaN(d.getTime()))
		throw new Error(`${co} cần một ngày dạng YYYY-MM-DD.`);
	return d;
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	const ket = await doCapNhatCuaToi(
		db,
		ngay(args, "--tu"),
		ngay(args, "--den"),
	);
	console.log(inKetQua(ket));
	await db.$disconnect();
}
