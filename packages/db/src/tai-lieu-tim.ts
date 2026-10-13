import type { Db } from "./client";

export const DIEU_KIEN_DANG_DUNG = {
	banDangDungId: { not: null },
	archivedAt: null,
} as const;

export type HangTimKho = {
	slug: string;
	ten: string;
	loai: string;
	chuId: string;
	chuTen: string;
	so: number;
	noiDung: string;
};

export function timTrangDangDung(
	db: Db,
	tsquery: string,
	gioiHan: number,
): Promise<HangTimKho[]> {
	return db.$queryRaw<HangTimKho[]>`
		SELECT t.slug, t.ten, t.loai, u.id AS "chuId", u.name AS "chuTen",
			p.so, p."noiDung"
		FROM "taiLieuTrang" t
		JOIN "taiLieuPhienBan" p ON p.id = t."banDangDungId"
		JOIN "user" u ON u.id = t."chuTrangId",
			to_tsquery('simple', unaccent(${tsquery})) q
		WHERE t."timKiem" @@ q AND t."archivedAt" IS NULL
		ORDER BY (to_tsvector('simple', unaccent(t.ten)) @@ q) DESC,
			ts_rank_cd(t."timKiem", q) DESC, t.ten ASC
		LIMIT ${gioiHan}
	`;
}

export type BanDangDungDb = {
	slug: string;
	ten: string;
	so: number;
	duyetLuc: Date;
	noiDung: string;
	xacMinhDen: Date | null;
	chuTen: string;
};

const CHON = {
	slug: true,
	ten: true,
	xacMinhDen: true,
	chuTrang: { select: { name: true } },
	banDangDung: { select: { so: true, duyetLuc: true, noiDung: true } },
} as const;

type HangDoc = {
	slug: string;
	ten: string;
	xacMinhDen: Date | null;
	chuTrang: { name: string };
	banDangDung: { so: number; duyetLuc: Date; noiDung: string } | null;
};

function veBan(h: HangDoc): BanDangDungDb | null {
	if (!h.banDangDung) return null;
	return {
		slug: h.slug,
		ten: h.ten,
		so: h.banDangDung.so,
		duyetLuc: h.banDangDung.duyetLuc,
		noiDung: h.banDangDung.noiDung,
		xacMinhDen: h.xacMinhDen,
		chuTen: h.chuTrang.name,
	};
}

export async function docBanDangDung(
	db: Db,
	slug: string,
): Promise<BanDangDungDb | null> {
	const h = await db.taiLieuTrang.findFirst({
		where: { slug, ...DIEU_KIEN_DANG_DUNG },
		select: CHON,
	});
	return h ? veBan(h) : null;
}

export async function docNhieuBanDangDung(
	db: Db,
	slugs: readonly string[],
): Promise<BanDangDungDb[]> {
	if (slugs.length === 0) return [];
	const hang = await db.taiLieuTrang.findMany({
		where: { slug: { in: [...new Set(slugs)] }, ...DIEU_KIEN_DANG_DUNG },
		select: CHON,
	});
	return hang.map(veBan).filter((b): b is BanDangDungDb => b !== null);
}
