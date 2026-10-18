import { type Db, type Prisma, TrangThaiViec } from "@crm/db";
import { DAY_MS } from "@crm/db/onboarding-nhac";
import {
	CHON_VIEC,
	chuyenDuocCua,
	dieuKienNhomHayDuAn,
	dieuKienXemViec,
	TRANG_THAI_MO,
	theoHan,
	VIEC,
	vaiCua,
} from "@crm/db/viec";
import { keoViec, taoViecCon } from "@crm/db/viec-ghi";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	TheBangOutput,
	ViecBangInput,
	ViecBangOutput,
	ViecConOutput,
	ViecKeoInput,
	ViecTaoConInput,
} from "./viec.contracts";
import { dichLoi, viecRa } from "./viec.service";

const COT_BANG = [
	TrangThaiViec.CHUA_LAM,
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
	TrangThaiViec.XONG,
] as const;

function chonBang(userId: string) {
	return {
		...CHON_VIEC,
		chaId: true,
		cha: { select: { id: true, tieuDe: true } },
		con: { where: dieuKienXemViec(userId), select: { trangThai: true } },
		thuTu: { where: { userId }, select: { khoa: true } },
	} as const satisfies Prisma.ViecSelect;
}

type HangBang = Prisma.ViecGetPayload<{ select: ReturnType<typeof chonBang> }>;

function sapCot(ds: HangBang[]): HangBang[] {
	const chuaKhoa = ds.filter((h) => h.thuTu.length === 0).sort(theoHan);
	const coKhoa = ds
		.filter((h) => h.thuTu.length > 0)
		.sort((a, b) => {
			const ka = a.thuTu[0]?.khoa ?? "";
			const kb = b.thuTu[0]?.khoa ?? "";
			return ka < kb ? -1 : ka > kb ? 1 : 0;
		});
	return [...chuaKhoa, ...coKhoa];
}

type ChaRa = { id: string; tieuDe: string } | null;

async function chaThay(
	db: Db,
	userId: string,
	ds: { cha: ChaRa }[],
): Promise<Set<string>> {
	const ma = [
		...new Set(ds.flatMap((h) => (h.cha === null ? [] : [h.cha.id]))),
	];
	if (ma.length === 0) return new Set();
	const thay = await db.viec.findMany({
		where: { AND: [{ id: { in: ma } }, dieuKienXemViec(userId)] },
		select: { id: true },
	});
	return new Set(thay.map((h) => h.id));
}

function chaRa(cha: ChaRa, thay: Set<string>): ChaRa {
	return cha !== null && thay.has(cha.id) ? cha : null;
}

function theRa(
	h: HangBang,
	userId: string,
	now: Date,
	thay: Set<string>,
): TheBangOutput {
	const conDem = h.con.filter((c) => c.trangThai !== TrangThaiViec.HUY);
	return {
		...viecRa(h, now),
		chuyenDuoc: chuyenDuocCua(h, userId),
		con:
			h.con.length === 0
				? null
				: {
						xong: conDem.filter((c) => c.trangThai === TrangThaiViec.XONG)
							.length,
						tong: conDem.length,
					},
		cha: chaRa(h.cha, thay),
		conMo: h.con.filter((c) => TRANG_THAI_MO.includes(c.trangThai)).length,
	};
}

@Injectable()
export class ViecBangService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async bang(input: ViecBangInput, userId: string): Promise<ViecBangOutput> {
		const now = new Date();
		const loc = (trangThai: Prisma.ViecWhereInput): Prisma.ViecWhereInput => ({
			AND: [
				dieuKienNhomHayDuAn(input.nhom, userId, input),
				dieuKienXemViec(userId),
				trangThai,
			],
		});
		const tuNgay = new Date(now.getTime() - VIEC.bang.xongGanDayNgay * DAY_MS);
		const [mo, xong, tongXong, soHuy, daHuy] = await Promise.all([
			this.db.viec.findMany({
				where: loc({ trangThai: { in: [...TRANG_THAI_MO] } }),
				select: chonBang(userId),
			}),
			this.db.viec.findMany({
				where: loc({ trangThai: TrangThaiViec.XONG, khepLuc: { gte: tuNgay } }),
				select: chonBang(userId),
			}),
			this.db.viec.count({ where: loc({ trangThai: TrangThaiViec.XONG }) }),
			this.db.viec.count({ where: loc({ trangThai: TrangThaiViec.HUY }) }),
			this.db.viec.findMany({
				where: loc({ trangThai: TrangThaiViec.HUY }),
				orderBy: [{ khepLuc: { sort: "desc", nulls: "last" } }, { id: "asc" }],
				take: VIEC.tranKhep,
				select: CHON_VIEC,
			}),
		]);
		const tatCa = [...mo, ...xong];
		const thay = await chaThay(this.db, userId, tatCa);
		return {
			cot: COT_BANG.map((trangThai) => {
				const trongCot = sapCot(tatCa.filter((h) => h.trangThai === trangThai));
				return {
					trangThai,
					tong: trangThai === TrangThaiViec.XONG ? tongXong : trongCot.length,
					viec: trongCot.map((h) => theRa(h, userId, now, thay)),
				};
			}),
			soHuy,
			daHuy: daHuy.map((h) => viecRa(h, now)),
		};
	}

	async keo(input: ViecKeoInput, userId: string): Promise<{ ok: true }> {
		await this.ghi((tx) =>
			keoViec(tx, {
				viecId: input.id,
				nguoiId: userId,
				den: input.den,
				thuTu: input.thuTu,
				nguon: input.nguon,
				now: new Date(),
			}),
		);
		return { ok: true };
	}

	taoCon(input: ViecTaoConInput, userId: string): Promise<{ id: string }> {
		return this.ghi((tx) =>
			taoViecCon(tx, {
				chaId: input.chaId,
				nguoiId: userId,
				tieuDe: input.tieuDe,
				nguoiThucHienId: input.nguoiThucHienId,
				hanNgay: input.hanNgay ?? null,
				now: new Date(),
			}),
		);
	}

	async con(id: string, userId: string): Promise<ViecConOutput> {
		const nguoi = { select: { id: true, name: true, image: true } } as const;
		const h = await this.db.viec.findFirst({
			where: { AND: [{ id }, dieuKienXemViec(userId)] },
			select: {
				id: true,
				chaId: true,
				trangThai: true,
				nguoiGiaoId: true,
				nguoiThucHienId: true,
				theoDoi: { select: { userId: true } },
				cha: { select: { id: true, tieuDe: true } },
				con: {
					where: dieuKienXemViec(userId),
					orderBy: [{ taoLuc: "asc" }, { id: "asc" }],
					select: {
						id: true,
						tieuDe: true,
						trangThai: true,
						nguoiThucHien: nguoi,
					},
				},
			},
		});
		if (h === null) throw new NotFoundException(VIEC.thongDiep.khongCoViec(id));
		const vai = vaiCua(h, userId);
		const thay = await chaThay(this.db, userId, [h]);
		return {
			cha: chaRa(h.cha, thay),
			con: h.con,
			conMo: h.con.filter((c) => TRANG_THAI_MO.includes(c.trangThai)).length,
			themDuoc:
				(vai.giao || vai.thucHien) &&
				h.chaId === null &&
				TRANG_THAI_MO.includes(h.trangThai),
		};
	}

	private ghi<T>(lam: (tx: DbGhi) => Promise<T>): Promise<T> {
		return this.db.$transaction((tx) => lam(tx)).catch(dichLoi);
	}
}
