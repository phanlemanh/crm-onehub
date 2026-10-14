import type { Db } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import { dieuKienThay, dieuKienThayDeXuat } from "@crm/db/tai-lieu-quyen";
import {
	DIEU_KIEN_DANG_DUNG,
	type HangTimKho,
	timTrangDangDung,
} from "@crm/db/tai-lieu-tim";
import { type LoaiTrang, TAI_LIEU } from "@crm/validation/tai-lieu";
import { cauChuaLienKet, chuThuong } from "@crm/validation/tai-lieu-markdown";
import { doanTrich, dungTruyVan } from "@crm/validation/tai-lieu-tim";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type { NguoiGoi } from "./quyen";
import type {
	TaiLieuBoLocOutput,
	TaiLieuNhacToiOutput,
	TaiLieuSucKhoeOutput,
	TaiLieuTimOutput,
} from "./tai-lieu.contracts";
import { TAI_LIEU_API } from "./tai-lieu-config";
import { TaiLieuHoiService } from "./tai-lieu-hoi.service";

const TIM = TAI_LIEU.tim;

const NGUOI = { select: { id: true, name: true } } as const;

type LienKetDung = { tuTrangId: string; denSlug: string; vanBan: string };

function cat<T>(rows: T[]) {
	return { rows: rows.slice(0, TIM.sucKhoeToiDa), total: rows.length };
}

function theoTen<T extends { ten: string }>(a: T, b: T): number {
	return a.ten.localeCompare(b.ten, "vi");
}

function trichCua(
	hang: HangTimKho,
	tu: readonly string[],
): TaiLieuTimOutput["rows"][number]["doanTrich"] {
	return (
		doanTrich(chuThuong(hang.noiDung), tu, TIM.benTrich) ??
		doanTrich(hang.ten, tu, TIM.benTrich) ?? {
			truoc: "",
			khop: "",
			sau: hang.ten,
		}
	);
}

@Injectable()
export class TaiLieuTimService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(TaiLieuHoiService) private readonly hoiKho: TaiLieuHoiService,
	) {}

	async tim(q: string): Promise<TaiLieuTimOutput> {
		const truyVan = dungTruyVan(q);
		if (!truyVan) return { rows: [] };
		const hang = await timTrangDangDung(this.db, truyVan.tsquery, TIM.soDong);
		return {
			rows: hang.map((h) => ({
				slug: h.slug,
				ten: h.ten,
				loai: h.loai as LoaiTrang,
				chuTrang: { id: h.chuId, name: h.chuTen },
				phienBan: h.so,
				doanTrich: trichCua(h, truyVan.tu),
			})),
		};
	}

	async nhacToi(nguoi: NguoiGoi, slug: string): Promise<TaiLieuNhacToiOutput> {
		const dich = await this.db.taiLieuTrang.findFirst({
			where: { AND: [{ slug }, dieuKienThay(nguoi)] },
			select: { id: true },
		});
		if (!dich) {
			throw new NotFoundException(TAI_LIEU_API.thongDiep.khongCo);
		}
		const lienKet = await this.db.taiLieuLienKet.findMany({
			where: {
				denSlug: slug,
				tuTrang: { ...DIEU_KIEN_DANG_DUNG, slug: { not: slug } },
			},
			distinct: ["tuTrangId"],
			select: {
				tuTrang: {
					select: {
						slug: true,
						ten: true,
						banDangDung: { select: { noiDung: true } },
					},
				},
			},
		});
		const rows = lienKet.flatMap(({ tuTrang }) => {
			const cau = cauChuaLienKet(tuTrang.banDangDung?.noiDung ?? "", slug);
			return cau ? [{ slug: tuTrang.slug, ten: tuTrang.ten, ...cau }] : [];
		});
		rows.sort((a, b) => a.ten.localeCompare(b.ten, "vi"));
		return { rows: rows.slice(0, TIM.nhacToiToiDa) };
	}

	async boLoc(nguoi: NguoiGoi): Promise<TaiLieuBoLocOutput> {
		const thay = { AND: [dieuKienThay(nguoi), { archivedAt: null }] };
		const [theoDonVi, theoChu] = await Promise.all([
			this.db.taiLieuTrang.groupBy({
				by: ["departmentId"],
				where: { AND: [thay, { departmentId: { not: null } }] },
				_count: { _all: true },
			}),
			this.db.taiLieuTrang.groupBy({
				by: ["chuTrangId"],
				where: thay,
				_count: { _all: true },
			}),
		]);
		const [donVi, chu] = await Promise.all([
			this.db.department.findMany({
				where: {
					id: { in: theoDonVi.flatMap((d) => d.departmentId ?? []) },
				},
				select: { id: true, name: true },
			}),
			this.db.user.findMany({
				where: { id: { in: theoChu.map((c) => c.chuTrangId) } },
				select: { id: true, name: true },
			}),
		]);
		const soDonVi = new Map(
			theoDonVi.map((d) => [d.departmentId, d._count._all]),
		);
		const soChu = new Map(theoChu.map((c) => [c.chuTrangId, c._count._all]));
		const theoTen = (a: { ten: string }, b: { ten: string }) =>
			a.ten.localeCompare(b.ten, "vi");
		return {
			donVi: donVi
				.map((d) => ({ id: d.id, ten: d.name, so: soDonVi.get(d.id) ?? 0 }))
				.sort(theoTen),
			chuTrang: chu
				.map((c) => ({ id: c.id, ten: c.name, so: soChu.get(c.id) ?? 0 }))
				.sort(theoTen),
		};
	}

	async sucKhoe(nguoi: NguoiGoi): Promise<TaiLieuSucKhoeOutput> {
		const [chuaTraLoi, baoSai] = await Promise.all([
			this.hoiKho.danhSachChuaTraLoi(nguoi),
			this.hoiKho.danhSachBaoSai(nguoi),
		]);
		const [dangDung, daLuuTru, lienKet, cho] = await Promise.all([
			this.db.taiLieuTrang.findMany({
				where: DIEU_KIEN_DANG_DUNG,
				select: {
					id: true,
					slug: true,
					ten: true,
					xacMinhDen: true,
					chuTrang: NGUOI,
					banDangDung: { select: { duyetLuc: true } },
				},
			}),
			this.db.taiLieuTrang.findMany({
				where: { banDangDungId: { not: null }, archivedAt: { not: null } },
				select: { slug: true },
			}),
			this.db.taiLieuLienKet.findMany({
				where: { tuTrang: DIEU_KIEN_DANG_DUNG },
				select: { tuTrangId: true, denSlug: true, vanBan: true },
				orderBy: { id: "asc" },
			}),
			this.db.taiLieuDeXuat.groupBy({
				by: ["trangId"],
				where: {
					AND: [dieuKienThayDeXuat(nguoi), { trangThai: "CHO_DUYET" }],
				},
				_count: { _all: true },
			}),
		]);
		const trangCho = await this.db.taiLieuTrang.findMany({
			where: { id: { in: cho.map((c) => c.trangId) } },
			select: { id: true, slug: true, ten: true, chuTrang: NGUOI },
		});
		const theoId = new Map(dangDung.map((t) => [t.id, t]));
		const slugDung = new Set([...dangDung, ...daLuuTru].map((t) => t.slug));
		const coNguoiDanToi = new Set(
			lienKet
				.filter((l) => theoId.get(l.tuTrangId)?.slug !== l.denSlug)
				.map((l) => l.denSlug),
		);
		const gay = lienKet.filter((l) => !slugDung.has(l.denSlug));
		const dong = (t: (typeof dangDung)[number]) => ({
			slug: t.slug,
			ten: t.ten,
			chuTrang: t.chuTrang,
		});
		const dauHomNay = dauNgayVN(new Date());
		const soCho = new Map(cho.map((c) => [c.trangId, c._count._all]));
		return {
			quaHan: cat(
				dangDung
					.filter((t) => t.xacMinhDen && t.xacMinhDen < dauHomNay)
					.sort(
						(a, b) =>
							(a.xacMinhDen?.getTime() ?? 0) - (b.xacMinhDen?.getTime() ?? 0),
					)
					.map((t) => ({
						...dong(t),
						xacMinhDen: (t.xacMinhDen as Date).toISOString(),
					})),
			),
			choDuyet: cat(
				trangCho
					.map((t) => ({
						slug: t.slug,
						ten: t.ten,
						chuTrang: t.chuTrang,
						soBan: soCho.get(t.id) ?? 0,
					}))
					.sort((a, b) => b.soBan - a.soBan || theoTen(a, b)),
			),
			gay: cat(this.gayTheoNguon(gay, theoId, dong)),
			chuaCo: cat(this.chuaCoTheoDich(gay)),
			moCoi: cat(
				dangDung
					.filter((t) => !coNguoiDanToi.has(t.slug))
					.sort(theoTen)
					.map((t) => ({
						...dong(t),
						duyetLuc: (t.banDangDung?.duyetLuc ?? new Date(0)).toISOString(),
					})),
			),
			chuaTraLoi,
			baoSai,
		};
	}

	private gayTheoNguon<T extends { ten: string }, D>(
		gay: LienKetDung[],
		theoId: Map<string, T>,
		dong: (t: T) => D & { ten: string },
	) {
		const nhom = new Map<string, LienKetDung[]>();
		for (const l of gay) {
			nhom.set(l.tuTrangId, [...(nhom.get(l.tuTrangId) ?? []), l]);
		}
		return [...nhom.entries()]
			.flatMap(([id, ds]) => {
				const t = theoId.get(id);
				return t
					? [
							{
								...dong(t),
								lienKet: ds.map((l) => ({
									denSlug: l.denSlug,
									vanBan: l.vanBan,
								})),
							},
						]
					: [];
			})
			.sort(theoTen);
	}

	private chuaCoTheoDich(gay: LienKetDung[]) {
		const nhom = new Map<string, { vanBan: string; nguon: Set<string> }>();
		for (const l of gay) {
			const co = nhom.get(l.denSlug) ?? { vanBan: l.vanBan, nguon: new Set() };
			co.nguon.add(l.tuTrangId);
			nhom.set(l.denSlug, co);
		}
		return [...nhom.entries()]
			.map(([denSlug, v]) => ({
				denSlug,
				vanBan: v.vanBan,
				soTrang: v.nguon.size,
			}))
			.sort(
				(a, b) => b.soTrang - a.soTrang || a.denSlug.localeCompare(b.denSlug),
			);
	}
}
