import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { parseTrichDoan } from "@crm/validation/tai-lieu-trich-doan";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import {
	type Ai,
	dungSan,
	goi,
	hashCua,
	type Json,
	ma,
	ok,
	phien,
	type TraLoi,
	taoTrang,
} from "./tai-lieu-san";

const gia = khoNguonGia();
dungSan(gia);

const T = TAI_LIEU_API.thongDiep;
const NOI_DUNG =
	"## Hoa hồng\n\nTừ ngày 01/10/2026, tầng hai hưởng 1,5% và tầng ba hưởng 1,8%.";
const TRICH = [
	{ menhDe: "Áp dụng từ 01/10/2026", trich: "Kể từ ngày 01/10/2026" },
	{ menhDe: "Tầng 2 hưởng 1,5%", trich: "tầng 2 là 1,5%" },
	{ menhDe: "Tầng 3 hưởng 1,8%", trich: "tầng 3 là 1,8%" },
];

async function banMay(): Promise<{
	deXuatId: string;
	nguonId: string;
	slug: string;
}> {
	const { trangId, slug } = await taoTrang(
		ma("Hoa hong"),
		"## Mot\n\nBan dau.",
	);
	await db.taiLieuDeXuat.updateMany({
		where: { trangId },
		data: { trangThai: "TRA_LAI", lyDo: "don cho ban may" },
	});
	const pathname = ma("blob");
	const nguon = await db.taiLieuNguon.create({
		data: {
			sha256: ma("sha"),
			tenTep: "quyet-dinh.docx",
			kieu: "docx",
			kichThuoc: 10,
			blobPathname: pathname,
			taiBoiId: phien.tao.nguoi,
			trangId,
			trangThai: "DA_SOAN",
		},
		select: { id: true },
	});
	gia.daPut.set(pathname, new Uint8Array([1, 2, 3]));
	const { deXuatId } = await db.$transaction((tx) =>
		taoDeXuatTaiLieu(tx, {
			trangId,
			banGocId: null,
			ten: "Chính sách hoa hồng",
			noiDung: NOI_DUNG,
			taoBoiId: phien.tao.nguoi,
			suKien: "DE_XUAT",
			nguonId: nguon.id,
			trichDoan: TRICH,
		}),
	);
	return { deXuatId, nguonId: nguon.id, slug };
}

async function duyetBan(
	deXuatId: string,
	ai: Ai,
	daDoiChieu?: number,
): Promise<TraLoi> {
	const diffHash = await hashCua(deXuatId, "chu");
	const vao: Json =
		daDoiChieu === undefined
			? { id: deXuatId, diffHash }
			: { id: deXuatId, diffHash, daDoiChieu };
	return goi("taiLieu.approve", vao, ai);
}

async function nguonCuaBanDangDung(slug: string): Promise<string | null> {
	const trang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: {
			banDangDung: { select: { deXuat: { select: { nguonId: true } } } },
		},
	});
	return trang.banDangDung?.deXuat.nguonId ?? null;
}

describe("duyet-ban-may", () => {
	test("duyet-ban-may: chu trang, owner, admin duyet duoc; nguoi tai, khac, okr thi khong", async () => {
		for (const ai of ["chu", "owner", "admin"] as const) {
			const { deXuatId, nguonId, slug } = await banMay();
			ok(await duyetBan(deXuatId, ai, 3), `duyet ${ai}`);
			expect(await nguonCuaBanDangDung(slug)).toBe(nguonId);
		}
		for (const ai of ["tao", "khac", "okr"] as const) {
			const { deXuatId } = await banMay();
			const truoc = await db.taiLieuPhienBan.count();
			const tra = await duyetBan(deXuatId, ai, 3);
			expect(`${ai} ${tra.status}`).toBe(`${ai} 403`);
			expect(await db.taiLieuPhienBan.count()).toBe(truoc);
		}
	});

	test("duyet-ban-may: chua tick het con so thi khong duyet duoc", async () => {
		const { deXuatId } = await banMay();
		const truoc = await db.taiLieuPhienBan.count();
		const thieu = await duyetBan(deXuatId, "chu", 2);
		expect(`${thieu.status} ${thieu.loi}`).toBe(`400 ${T.chuaDoiChieu}`);
		const khong = await duyetBan(deXuatId, "chu");
		expect(`${khong.status} ${khong.loi}`).toBe(`400 ${T.chuaDoiChieu}`);
		expect(await db.taiLieuPhienBan.count()).toBe(truoc);
		ok(await duyetBan(deXuatId, "chu", 3), "du tick");
		expect(await db.taiLieuPhienBan.count()).toBe(truoc + 1);
	});

	test("duyet-ban-may: doi chung, de xuat nguoi viet khong can tick", async () => {
		const { deXuatId } = await taoTrang(ma("Nguoi viet"), NOI_DUNG);
		ok(await duyetBan(deXuatId, "chu"), "duyet ban nguoi viet");
	});

	test("duyet-ban-may: sua ban nay giu nguon, duyet xong thanh vien tai ve duoc", async () => {
		const { deXuatId, nguonId, slug } = await banMay();
		const truocTaiVe = await goi("taiLieuNguon.taiVe", { id: nguonId }, "khac");
		expect(truocTaiVe.status).toBe(404);
		const sua = ok<{ deXuatId: string }>(
			await goi(
				"taiLieu.propose",
				{
					slug,
					noiDung: NOI_DUNG.replace("hưởng 1,5%", "được hưởng 1,5%"),
					tuDeXuatId: deXuatId,
				},
				"chu",
			),
			"sua ban nay",
		).deXuatId;
		const hang = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: sua },
			select: { nguonId: true, trichDoan: true, taoBoiId: true },
		});
		expect(hang.nguonId).toBe(nguonId);
		expect(parseTrichDoan(hang.trichDoan)).toEqual(TRICH);
		expect(hang.taoBoiId).toBe(phien.chu.nguoi);
		ok(await duyetBan(sua, "chu", 3), "duyet ban sua");
		expect(await nguonCuaBanDangDung(slug)).toBe(nguonId);
		ok(await goi("taiLieuNguon.taiVe", { id: nguonId }, "khac"), "khac tai ve");
		expect(gia.kyGetCuoi).toBe(300);
	});

	test("duyet-ban-may: doi chung, de xuat nguoi viet khong mang nguon", async () => {
		const { slug, deXuatId } = await taoTrang(ma("Viet tay"), "## Mot\n\nA.");
		await duyetBan(deXuatId, "chu");
		const moi = ok<{ deXuatId: string }>(
			await goi("taiLieu.propose", { slug, noiDung: "## Mot\n\nB." }, "tao"),
			"de xuat tay",
		).deXuatId;
		const hang = await db.taiLieuDeXuat.findUniqueOrThrow({
			where: { id: moi },
			select: { nguonId: true },
		});
		expect(hang.nguonId).toBeNull();
	});
});
