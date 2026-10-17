import { canManageSettings, workspaceRoleOf } from "@crm/auth";
import { type Db, TrangThaiViec } from "@crm/db";
import { coLichSuDuAn, DU_AN, docLichLam } from "@crm/db/du-an";
import {
	dongDuAn,
	mocTre,
	moLaiDuAn,
	suaDuAn,
	suaMoc,
	taoDuAn,
	taoMoc,
	taoPhuThuoc,
	xoaDuAn,
	xoaMoc,
	xoaPhuThuoc,
} from "@crm/db/du-an-ghi";
import { ngayHan, TRANG_THAI_KHEP } from "@crm/db/viec";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { dichLoi } from "../viec/viec.service";
import type {
	DuAnDongOutput,
	DuAnLichOutput,
	DuAnListInput,
	DuAnMocSuaInput,
	DuAnMocTaoInput,
	DuAnPhuThuocInput,
	DuAnSuaInput,
	DuAnTaoInput,
} from "./du-an.contracts";

const NGHIA_VIEC_LICH = {
	CHUA_LAM: "nhap",
	DANG_LAM: "dangChay",
	CHO_DANH_GIA: "cho",
	XONG: "xong",
	HUY: "ketThuc",
} as const satisfies Record<
	TrangThaiViec,
	DuAnLichOutput["viec"][number]["nghia"]
>;

function ngay(d: Date | null): string | null {
	return d ? ngayHan(d) : null;
}

@Injectable()
export class DuAnService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	private ghi<T>(lam: (tx: DbGhi) => Promise<T>): Promise<T> {
		return this.db.$transaction((tx) => lam(tx)).catch(dichLoi);
	}

	async list(input: DuAnListInput, nguoiId: string): Promise<DuAnDongOutput[]> {
		const ds = await this.db.duAn.findMany({
			where: { dongLuc: input.trangThai === "mo" ? null : { not: null } },
			orderBy: { taoLuc: "desc" },
			select: {
				id: true,
				ten: true,
				moTa: true,
				dongLuc: true,
				taoBoiId: true,
				taoBoi: { select: { id: true, name: true } },
				viec: {
					select: {
						tieuDe: true,
						trangThai: true,
						batDauNgay: true,
						hanNgay: true,
					},
				},
				moc: {
					orderBy: { ngay: "asc" },
					select: {
						ten: true,
						ngay: true,
						cho: {
							select: { viec: { select: { tieuDe: true, hanNgay: true } } },
						},
					},
				},
			},
		});
		const laQuanTri = canManageSettings(await workspaceRoleOf(nguoiId));
		const homNay = new Date().toISOString().slice(0, 10);
		return Promise.all(
			ds.map(async (d) => {
				const batDau = d.viec
					.map((v) => ngay(v.batDauNgay))
					.filter((x): x is string => x !== null);
				const han = d.viec
					.map((v) => ngay(v.hanNgay))
					.filter((x): x is string => x !== null);
				const mocKe =
					d.moc.find((m) => ngayHan(m.ngay) >= homNay) ?? d.moc.at(-1) ?? null;
				const coLichSu = await coLichSuDuAn(this.db, d.id);
				const duocDong = d.taoBoiId === nguoiId || laQuanTri;
				return {
					id: d.id,
					ten: d.ten,
					moTa: d.moTa,
					soViec: d.viec.filter((v) => v.trangThai !== TrangThaiViec.HUY)
						.length,
					soXong: d.viec.filter((v) => v.trangThai === TrangThaiViec.XONG)
						.length,
					batDauSom: batDau.sort()[0] ?? null,
					hanMuon: han.sort().at(-1) ?? null,
					mocKe: mocKe
						? {
								ten: mocKe.ten,
								ngay: ngayHan(mocKe.ngay),
								tre: mocTre(
									ngayHan(mocKe.ngay),
									mocKe.cho.map((c) => ({
										tieuDe: c.viec.tieuDe,
										han: ngay(c.viec.hanNgay),
									})),
								).tre,
							}
						: null,
					taoBoi: d.taoBoi,
					dong: d.dongLuc !== null,
					coLichSu,
					quyen: { dong: duocDong, xoa: duocDong && !coLichSu },
				};
			}),
		);
	}

	async get(id: string, nguoiId: string): Promise<DuAnDongOutput> {
		const [mo, dong] = await Promise.all([
			this.list({ trangThai: "mo" }, nguoiId),
			this.list({ trangThai: "dong" }, nguoiId),
		]);
		const d = [...mo, ...dong].find((x) => x.id === id);
		if (!d) throw new NotFoundException(DU_AN.thongDiep.khongCoDuAn(id));
		return d;
	}

	async lich(id: string, nguoiId: string): Promise<DuAnLichOutput> {
		const d = await this.db.duAn.findUnique({
			where: { id },
			select: {
				id: true,
				ten: true,
				moTa: true,
				dongLuc: true,
				taoBoiId: true,
				viec: {
					orderBy: [{ chaId: "asc" }, { taoLuc: "asc" }],
					select: {
						id: true,
						tieuDe: true,
						chaId: true,
						batDauNgay: true,
						hanNgay: true,
						trangThai: true,
						nguoiGiaoId: true,
						nguoiThucHienId: true,
						phaiCho: { select: { truocId: true } },
					},
				},
				moc: {
					orderBy: { ngay: "asc" },
					select: {
						id: true,
						ten: true,
						ngay: true,
						cho: {
							select: {
								viecId: true,
								viec: { select: { tieuDe: true, hanNgay: true } },
							},
						},
					},
				},
			},
		});
		if (!d) throw new NotFoundException(DU_AN.thongDiep.khongCoDuAn(id));
		const lich = await docLichLam(this.db);
		const dong = d.dongLuc !== null;
		return {
			duAn: { id: d.id, ten: d.ten, moTa: d.moTa, dong, taoBoiId: d.taoBoiId },
			viec: d.viec.map((v) => ({
				id: v.id,
				tieuDe: v.tieuDe,
				chaId: v.chaId,
				batDau: ngay(v.batDauNgay),
				han: ngay(v.hanNgay),
				nghia: NGHIA_VIEC_LICH[v.trangThai],
				suaDuoc:
					!dong &&
					(v.nguoiGiaoId === nguoiId || v.nguoiThucHienId === nguoiId) &&
					!TRANG_THAI_KHEP.includes(v.trangThai),
				phaiCho: v.phaiCho.map((p) => p.truocId),
			})),
			moc: d.moc.map((m) => {
				const t = mocTre(
					ngayHan(m.ngay),
					m.cho.map((c) => ({
						tieuDe: c.viec.tieuDe,
						han: ngay(c.viec.hanNgay),
					})),
				);
				return {
					id: m.id,
					ten: m.ten,
					ngay: ngayHan(m.ngay),
					tre: t.tre,
					treBoi: t.treBoi,
					cho: m.cho.map((c) => c.viecId),
				};
			}),
			lich: { ngayNghiTuan: [...lich.ngayNghiTuan], ngayLe: [...lich.ngayLe] },
		};
	}

	tao(input: DuAnTaoInput, nguoiId: string): Promise<{ id: string }> {
		return this.ghi((tx) =>
			taoDuAn(tx, { ...input, nguoiId, now: new Date() }),
		);
	}

	async sua(input: DuAnSuaInput, nguoiId: string): Promise<{ ok: true }> {
		await this.ghi((tx) =>
			suaDuAn(tx, {
				duAnId: input.id,
				ten: input.ten,
				moTa: input.moTa,
				nguoiId,
				now: new Date(),
			}),
		);
		return { ok: true };
	}

	async dong(id: string, nguoiId: string): Promise<{ ok: true }> {
		const laQuanTri = canManageSettings(await workspaceRoleOf(nguoiId));
		await this.ghi((tx) =>
			dongDuAn(tx, {
				duAnId: id,
				nguoiId,
				laQuanTri,
				now: new Date(),
			}),
		);
		return { ok: true };
	}

	async moLai(id: string, nguoiId: string): Promise<{ ok: true }> {
		const laQuanTri = canManageSettings(await workspaceRoleOf(nguoiId));
		await this.ghi((tx) =>
			moLaiDuAn(tx, {
				duAnId: id,
				nguoiId,
				laQuanTri,
				now: new Date(),
			}),
		);
		return { ok: true };
	}

	async xoa(id: string, nguoiId: string): Promise<{ ok: true }> {
		const laQuanTri = canManageSettings(await workspaceRoleOf(nguoiId));
		await this.ghi((tx) =>
			xoaDuAn(tx, {
				duAnId: id,
				nguoiId,
				laQuanTri,
				now: new Date(),
			}),
		);
		return { ok: true };
	}

	mocTao(input: DuAnMocTaoInput, nguoiId: string): Promise<{ id: string }> {
		return this.ghi((tx) => taoMoc(tx, { ...input, nguoiId, now: new Date() }));
	}

	async mocSua(input: DuAnMocSuaInput, nguoiId: string): Promise<{ ok: true }> {
		await this.ghi((tx) =>
			suaMoc(tx, {
				mocId: input.id,
				ten: input.ten,
				ngay: input.ngay,
				cho: input.cho,
				nguoiId,
				now: new Date(),
			}),
		);
		return { ok: true };
	}

	async mocXoa(id: string, nguoiId: string): Promise<{ ok: true }> {
		await this.ghi((tx) => xoaMoc(tx, { mocId: id, nguoiId, now: new Date() }));
		return { ok: true };
	}

	phuThuocTao(input: DuAnPhuThuocInput, nguoiId: string) {
		return this.ghi((tx) =>
			taoPhuThuoc(tx, { ...input, nguoiId, now: new Date() }),
		);
	}

	async phuThuocXoa(
		input: DuAnPhuThuocInput,
		nguoiId: string,
	): Promise<{ ok: true }> {
		await this.ghi((tx) =>
			xoaPhuThuoc(tx, { ...input, nguoiId, now: new Date() }),
		);
		return { ok: true };
	}
}
