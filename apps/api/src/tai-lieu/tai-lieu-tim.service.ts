import type { Db } from "@crm/db";
import { dieuKienThay } from "@crm/db/tai-lieu-quyen";
import { type LoaiTrang, TAI_LIEU } from "@crm/validation/tai-lieu";
import { cauChuaLienKet, chuThuong } from "@crm/validation/tai-lieu-markdown";
import { doanTrich, dungTruyVan } from "@crm/validation/tai-lieu-tim";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { type NguoiGoi, thayTrang } from "./quyen";
import type {
	TaiLieuBoLocOutput,
	TaiLieuNhacToiOutput,
	TaiLieuTimOutput,
} from "./tai-lieu.contracts";
import { TAI_LIEU_API } from "./tai-lieu-config";

const TIM = TAI_LIEU.tim;

type HangTim = {
	slug: string;
	ten: string;
	loai: string;
	chuId: string;
	chuTen: string;
	so: number;
	noiDung: string;
};

function trichCua(
	hang: HangTim,
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
	constructor(@InjectDatabase() private readonly db: Db) {}

	async tim(q: string): Promise<TaiLieuTimOutput> {
		const truyVan = dungTruyVan(q);
		if (!truyVan) return { rows: [] };
		const hang = await this.db.$queryRaw<HangTim[]>`
			SELECT t.slug, t.ten, t.loai, u.id AS "chuId", u.name AS "chuTen",
				p.so, p."noiDung"
			FROM "taiLieuTrang" t
			JOIN "taiLieuPhienBan" p ON p.id = t."banDangDungId"
			JOIN "user" u ON u.id = t."chuTrangId",
				to_tsquery('simple', unaccent(${truyVan.tsquery})) q
			WHERE t."timKiem" @@ q
			ORDER BY (to_tsvector('simple', unaccent(t.ten)) @@ q) DESC,
				ts_rank_cd(t."timKiem", q) DESC, t.ten ASC
			LIMIT ${TIM.soDong}
		`;
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
		const dich = await this.db.taiLieuTrang.findUnique({
			where: { slug },
			select: {
				chuTrangId: true,
				banDangDungId: true,
				deXuat: { distinct: ["taoBoiId"], select: { taoBoiId: true } },
			},
		});
		if (!dich || !thayTrang(nguoi, dich, dich.deXuat)) {
			throw new NotFoundException(TAI_LIEU_API.thongDiep.khongCo);
		}
		const lienKet = await this.db.taiLieuLienKet.findMany({
			where: {
				denSlug: slug,
				tuTrang: { banDangDungId: { not: null }, slug: { not: slug } },
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
		const thay = dieuKienThay(nguoi);
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
}
