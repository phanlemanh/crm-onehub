import type { Db } from "./client";
import { TrangThaiViec } from "./generated/prisma/enums";
import { laKhoCucBo, loiKhoXa } from "./kho-cuc-bo";
import { DAY_MS, ngayVN } from "./onboarding-nhac";
import { docDuocDoiTac } from "./vai-doi-tac";
import type { BanGhiGan } from "./viec";
import { doiTrangThai, keoViec, taoViec, taoViecCon } from "./viec-ghi";
import { WORKSPACE_ID } from "./workspace";

type Mau = {
	tieuDe: string;
	hanSauNgay: number | null;
	tuGiao: boolean;
	buoc: { ai: "giao" | "lam"; den: TrangThaiViec }[];
};

const MAU: readonly Mau[] = [
	{
		tieuDe: "Gửi bảng phí mới cho đại lý",
		hanSauNgay: -1,
		tuGiao: false,
		buoc: [],
	},
	{
		tieuDe: "Gọi xác nhận lịch đào tạo tuần đầu",
		hanSauNgay: 0,
		tuGiao: false,
		buoc: [{ ai: "lam", den: TrangThaiViec.DANG_LAM }],
	},
	{
		tieuDe: "Kiểm hồ sơ pháp lý bản cuối",
		hanSauNgay: 3,
		tuGiao: false,
		buoc: [{ ai: "lam", den: TrangThaiViec.CHO_DANH_GIA }],
	},
	{
		tieuDe: "Chốt danh sách môi giới tháng này",
		hanSauNgay: -5,
		tuGiao: false,
		buoc: [{ ai: "lam", den: TrangThaiViec.XONG }],
	},
	{
		tieuDe: "Đọc lại ghi chú buổi gặp quý trước",
		hanSauNgay: null,
		tuGiao: true,
		buoc: [],
	},
	{
		tieuDe: "Soạn thư chào đối tác mới",
		hanSauNgay: 5,
		tuGiao: false,
		buoc: [{ ai: "giao", den: TrangThaiViec.DANG_LAM }],
	},
	{
		tieuDe: "Hẹn lịch thăm văn phòng chi nhánh",
		hanSauNgay: 7,
		tuGiao: false,
		buoc: [{ ai: "giao", den: TrangThaiViec.HUY }],
	},
];

export const TIEU_DE_MAU: readonly string[] = MAU.map((m) => m.tieuDe);

function hanTu(now: Date, sauNgay: number | null): Date | null {
	if (sauNgay === null) return null;
	const homNay = Date.parse(`${ngayVN(now)}T00:00:00.000Z`);
	return new Date(homNay + sauNgay * DAY_MS);
}

export async function gieoViecMau(
	db: Db,
	chon: { databaseUrl: string; nguon: string; now: Date },
): Promise<{ soViec: number }> {
	if (!laKhoCucBo(chon.databaseUrl) && process.env.ALLOW_REMOTE_DB !== "1") {
		throw new Error(loiKhoXa("db:seed", chon.databaseUrl, chon.nguon));
	}
	if (
		(await db.viec.count({ where: { tieuDe: { in: [...TIEU_DE_MAU] } } })) > 0
	) {
		return { soViec: 0 };
	}
	const thanhVien = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		orderBy: { createdAt: "asc" },
		select: { userId: true, role: true },
	});
	const [giao, lam] = thanhVien
		.filter((m) => docDuocDoiTac(m.role))
		.map((m) => m.userId);
	if (!giao || !lam) return { soViec: 0 };
	const deal = await db.deal.findFirst({
		where: { archivedAt: null },
		orderBy: { createdAt: "asc" },
		select: { id: true },
	});
	const gan: BanGhiGan[] = deal ? [{ loai: "deal", id: deal.id }] : [];
	for (const mau of MAU) {
		await db.$transaction(async (tx) => {
			const v = await taoViec(tx, {
				nguoiId: giao,
				tieuDe: mau.tieuDe,
				hanNgay: hanTu(chon.now, mau.hanSauNgay),
				nguoiThucHienId: mau.tuGiao ? giao : lam,
				gan,
				nguon: "api",
				now: chon.now,
			});
			for (const b of mau.buoc) {
				await doiTrangThai(tx, {
					viecId: v.id,
					nguoiId: b.ai === "giao" ? giao : lam,
					den: b.den,
					nguon: "api",
					now: chon.now,
				});
			}
		});
	}
	return { soViec: MAU.length };
}

export const TIEU_DE_CHA_MAU = "Triển khai đại lý mẫu tháng 11";

const CON_MAU = [
	"Ký phụ lục hoa hồng mẫu",
	"Mở tài khoản đại lý mẫu trên hệ thống",
	"Đặt lịch đào tạo môi giới mẫu đợt 1",
] as const;

export async function gieoBangMau(
	db: Db,
	chon: { databaseUrl: string; nguon: string; now: Date },
): Promise<{ chaId: string | null; conIds: string[] }> {
	if (!laKhoCucBo(chon.databaseUrl) && process.env.ALLOW_REMOTE_DB !== "1") {
		throw new Error(loiKhoXa("db:seed", chon.databaseUrl, chon.nguon));
	}
	if ((await db.viec.count({ where: { tieuDe: TIEU_DE_CHA_MAU } })) > 0) {
		return { chaId: null, conIds: [] };
	}
	const thanhVien = await db.member.findMany({
		where: { organizationId: WORKSPACE_ID },
		orderBy: { createdAt: "asc" },
		select: { userId: true, role: true },
	});
	const [giao, lam] = thanhVien
		.filter((m) => docDuocDoiTac(m.role))
		.map((m) => m.userId);
	if (!giao || !lam) return { chaId: null, conIds: [] };
	const deal = await db.deal.findFirst({
		where: { archivedAt: null },
		orderBy: { createdAt: "asc" },
		select: { id: true },
	});
	const gan: BanGhiGan[] = deal ? [{ loai: "deal", id: deal.id }] : [];
	return db.$transaction(async (tx) => {
		const cha = await taoViec(tx, {
			nguoiId: giao,
			tieuDe: TIEU_DE_CHA_MAU,
			hanNgay: hanTu(chon.now, 14),
			nguoiThucHienId: lam,
			gan,
			nguon: "api",
			now: chon.now,
		});
		const nguoiCon = [lam, giao, lam];
		const conIds: string[] = [];
		for (const [i, tieuDe] of CON_MAU.entries()) {
			const con = await taoViecCon(tx, {
				chaId: cha.id,
				nguoiId: lam,
				tieuDe,
				nguoiThucHienId: nguoiCon[i] ?? lam,
				hanNgay: hanTu(chon.now, 3 + i),
				now: chon.now,
			});
			conIds.push(con.id);
		}
		const [mot, hai] = conIds;
		if (mot) {
			await doiTrangThai(tx, {
				viecId: mot,
				nguoiId: lam,
				den: TrangThaiViec.XONG,
				nguon: "api",
				now: chon.now,
			});
		}
		if (hai) {
			await keoViec(tx, {
				viecId: hai,
				nguoiId: giao,
				den: TrangThaiViec.DANG_LAM,
				thuTu: [hai],
				nguon: "bang-keo",
				now: chon.now,
			});
		}
		await keoViec(tx, {
			viecId: cha.id,
			nguoiId: lam,
			den: TrangThaiViec.DANG_LAM,
			thuTu: [],
			nguon: "bang-menu",
			now: chon.now,
		});
		return { chaId: cha.id, conIds };
	});
}
