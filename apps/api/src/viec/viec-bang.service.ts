import { type Db, type Prisma, TrangThaiViec } from "@crm/db";
import { DAY_MS } from "@crm/db/onboarding-nhac";
import {
	CHON_VIEC,
	chuyenDuocCua,
	dieuKienNhom,
	dieuKienXemViec,
	TRANG_THAI_MO,
	theoHan,
	VIEC,
} from "@crm/db/viec";
import { keoViec } from "@crm/db/viec-ghi";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	TheBangOutput,
	ViecBangInput,
	ViecBangOutput,
	ViecKeoInput,
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
		con: { select: { trangThai: true } },
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

function theRa(h: HangBang, userId: string, now: Date): TheBangOutput {
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
		cha: h.cha,
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
				dieuKienNhom(input.nhom, userId),
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
		return {
			cot: COT_BANG.map((trangThai) => {
				const trongCot = sapCot(tatCa.filter((h) => h.trangThai === trangThai));
				return {
					trangThai,
					tong: trangThai === TrangThaiViec.XONG ? tongXong : trongCot.length,
					viec: trongCot.map((h) => theRa(h, userId, now)),
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

	private ghi<T>(lam: (tx: DbGhi) => Promise<T>): Promise<T> {
		return this.db.$transaction((tx) => lam(tx)).catch(dichLoi);
	}
}
