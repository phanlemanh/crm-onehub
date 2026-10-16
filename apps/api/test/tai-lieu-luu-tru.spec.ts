import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { NGAY_MS } from "@crm/db/okr-tro-ly-danh-muc";
import { TAI_LIEU } from "@crm/validation/tai-lieu";
import { TAI_LIEU_API } from "../src/tai-lieu/tai-lieu-config";
import { datLuuTru } from "../src/tai-lieu/tai-lieu-luu-tru";
import {
	type Ai,
	deXuat,
	dungSan,
	duyet,
	goi,
	hoi,
	ma,
	ok,
	phien,
	taoTrang,
	traLai,
} from "./tai-lieu-san";

dungSan();

const T = TAI_LIEU_API.thongDiep;

async function trangDangDung(
	nhan: string,
	noiDung = `## ${nhan}\n\nNội dung đang dùng.`,
) {
	const t = await taoTrang(ma(nhan), noiDung, "tao", "chu");
	await duyet(t.deXuatId, "chu");
	return t;
}

async function deXuatLuuTru(
	slug: string,
	lyDo = "Không còn dùng.",
	ai: Ai = "khac",
) {
	return ok<{ deXuatId: string }>(
		await goi("taiLieu.deXuatLuuTru", { slug, lyDo }, ai),
		`de xuat luu tru ${slug}`,
	).deXuatId;
}

async function deXuatKhoiPhuc(
	slug: string,
	lyDo = "Cần dùng lại.",
	ai: Ai = "khac",
) {
	return ok<{ deXuatId: string }>(
		await goi("taiLieu.deXuatKhoiPhuc", { slug, lyDo }, ai),
		`de xuat khoi phuc ${slug}`,
	).deXuatId;
}

async function daLuuTru(nhan: string) {
	const t = await trangDangDung(nhan);
	await duyet(await deXuatLuuTru(t.slug), "chu");
	return t;
}

async function dem(trangId: string) {
	const [deXuat, suKien] = await Promise.all([
		db.taiLieuDeXuat.count({ where: { trangId } }),
		db.taiLieuSuKien.count({ where: { trangId } }),
	]);
	return { deXuat, suKien };
}

async function idSuKien(trangId: string) {
	const ds = await db.taiLieuSuKien.findMany({
		where: { trangId },
		select: { id: true },
	});
	return new Set(ds.map((d) => d.id));
}

function demLoai(ds: { loai: string }[]) {
	const so: Record<string, number> = {};
	for (const s of ds) so[s.loai] = (so[s.loai] ?? 0) + 1;
	return so;
}

async function suKienMoi(trangId: string, truoc: Set<string>) {
	const ds = (
		await db.taiLieuSuKien.findMany({
			where: { trangId },
			select: { id: true, loai: true, aiId: true },
		})
	).filter((d) => !truoc.has(d.id));
	return { so: demLoai(ds), ds };
}

const hangTrang = (id: string) =>
	db.taiLieuTrang.findUniqueOrThrow({
		where: { id },
		select: {
			slug: true,
			ten: true,
			archivedAt: true,
			banDangDungId: true,
			updatedAt: true,
			xacMinhDen: true,
		},
	});

describe("lslt-luu-tru", () => {
	test("de-xuat-luu-tru: mot de xuat LUU_TRU mang ly do, trang khong doi", async () => {
		const p = await trangDangDung("Luu tru P");
		const truocTrang = await hangTrang(p.trangId);
		const truoc = await dem(p.trangId);
		const id = await deXuatLuuTru(p.slug, "không còn dùng");
		const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id } });
		expect({
			loai: dx.loai,
			lyDoDeXuat: dx.lyDoDeXuat,
			trangThai: dx.trangThai,
			taoBoiId: dx.taoBoiId,
		}).toEqual({
			loai: "LUU_TRU",
			lyDoDeXuat: "không còn dùng",
			trangThai: "CHO_DUYET",
			taoBoiId: phien.khac.nguoi,
		});
		expect(await dem(p.trangId)).toEqual({
			deXuat: truoc.deXuat + 1,
			suKien: truoc.suKien + 1,
		});
		const sk = await db.taiLieuSuKien.findFirstOrThrow({
			where: {
				trangId: p.trangId,
				chiTiet: { path: ["deXuatId"], equals: id },
			},
		});
		expect(sk.loai).toBe("DE_XUAT");
		expect(await hangTrang(p.trangId)).toEqual(truocTrang);
	});

	test("de-xuat-luu-tru: ma tran tu choi viet truoc, moi ca khong ghi hang nao", async () => {
		const chuaDuyet = await taoTrang(
			ma("Luu tru chua duyet"),
			"## A\n\nB.",
			"tao",
			"chu",
		);
		const daLuu = await daLuuTru("Luu tru da luu");
		const coCho = await trangDangDung("Luu tru co cho");
		await deXuatLuuTru(coCho.slug);
		const binhThuong = await trangDangDung("Luu tru binh thuong");
		const BANG = [
			{
				ca: "chua tung duyet",
				t: chuaDuyet,
				lyDo: "Hết dùng.",
				mong: `400 ${T.chuaTungDuyet}`,
				ai: "tao",
			},
			{
				ca: "da luu tru",
				t: daLuu,
				lyDo: "Hết dùng.",
				mong: `400 ${T.daLuuTru}`,
			},
			{
				ca: "da co de xuat luu tru cho",
				t: coCho,
				lyDo: "Hết dùng.",
				mong: `409 ${T.daCoLuuTruCho}`,
			},
			{
				ca: "ly do trong",
				t: binhThuong,
				lyDo: "   ",
				mong: `400 ${T.lyDoDeXuatTrong}`,
			},
			{
				ca: "ly do 501 ky tu",
				t: binhThuong,
				lyDo: "ữ".repeat(TAI_LIEU.lyDo.max + 1),
				mong: `400 ${T.lyDoDeXuatDai(TAI_LIEU.lyDo.max)}`,
			},
		] as const;
		expect(BANG).toHaveLength(5);
		for (const dong of BANG) {
			const truoc = await dem(dong.t.trangId);
			const tra = await goi(
				"taiLieu.deXuatLuuTru",
				{ slug: dong.t.slug, lyDo: dong.lyDo },
				"ai" in dong ? dong.ai : "khac",
			);
			expect(`${dong.ca}: ${tra.status} ${tra.loi}`).toBe(
				`${dong.ca}: ${dong.mong}`,
			);
			expect(await dem(dong.t.trangId)).toEqual(truoc);
		}
	});

	test("de-xuat-luu-tru: doi chung duong bien — ly do 500 ky tu co dau va 1 ky tu duoc nhan", async () => {
		for (const lyDo of ["ữ".repeat(TAI_LIEU.lyDo.max), "x"]) {
			const t = await trangDangDung(`Luu tru bien ${lyDo.length}`);
			const id = await deXuatLuuTru(t.slug, lyDo);
			const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id } });
			expect(dx.lyDoDeXuat).toBe(lyDo);
		}
	});

	test("duyet-luu-tru: ma tran nguoi viet truoc — chu trang, owner, admin duyet duoc; khac, okr FORBIDDEN", async () => {
		const BANG: { ai: Ai; duoc: boolean }[] = [
			{ ai: "chu", duoc: true },
			{ ai: "owner", duoc: true },
			{ ai: "admin", duoc: true },
			{ ai: "khac", duoc: false },
			{ ai: "okr", duoc: false },
		];
		for (const { ai, duoc } of BANG) {
			const p = await trangDangDung(`Duyet luu tru ${ai}`);
			const noiDung = await deXuat(
				p.slug,
				`## Sửa ${ai}\n\nBản sửa đang chờ.`,
				"tao",
			);
			const luuTru = await deXuatLuuTru(p.slug);
			const truocTrang = await hangTrang(p.trangId);
			const soBan = await db.taiLieuPhienBan.count({
				where: { trangId: p.trangId },
			});
			const truocSuKien = await idSuKien(p.trangId);
			const proposal = ok<{ diffHash: string }>(
				await hoi("taiLieu.proposal", { id: luuTru }, "chu"),
				"proposal luu tru",
			);
			const tra = await goi(
				"taiLieu.approve",
				{ id: luuTru, diffHash: proposal.diffHash },
				ai,
			);
			const sauTrang = await hangTrang(p.trangId);
			const [dxNoiDung, dxLuuTru] = await Promise.all([
				db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: noiDung } }),
				db.taiLieuDeXuat.findUniqueOrThrow({ where: { id: luuTru } }),
			]);
			if (duoc) {
				expect(`${ai}: ${tra.status}`).toBe(`${ai}: 200`);
				expect(sauTrang.archivedAt).not.toBeNull();
				expect(sauTrang.banDangDungId).toBe(truocTrang.banDangDungId);
				expect(
					await db.taiLieuPhienBan.count({ where: { trangId: p.trangId } }),
				).toBe(soBan);
				expect([dxNoiDung.trangThai, dxLuuTru.trangThai]).toEqual([
					"CU",
					"DA_DUYET",
				]);
				const { so, ds } = await suKienMoi(p.trangId, truocSuKien);
				expect(so).toEqual({ LUU_TRU: 1, CU: 1 });
				expect(ds.find((d) => d.loai === "LUU_TRU")?.aiId).toBe(
					phien[ai].nguoi,
				);
			} else {
				expect(`${ai}: ${tra.status}`).toBe(`${ai}: 403`);
				expect(sauTrang).toEqual(truocTrang);
				expect([dxNoiDung.trangThai, dxLuuTru.trangThai]).toEqual([
					"CHO_DUYET",
					"CHO_DUYET",
				]);
			}
		}
	});

	test("duyet-luu-tru: giu ngay luu tru dau khi duyet lan nua, chieu do phan biet ban luon ghi now", async () => {
		const p = await daLuuTru("Giu ngay dau");
		const dau = (await hangTrang(p.trangId)).archivedAt;
		if (!dau) throw new Error("chua luu tru");
		const lechBaNgay = new Date(dau.getTime() + 3 * NGAY_MS);
		await db.$transaction((tx) => datLuuTru(tx, p.trangId, lechBaNgay));
		expect((await hangTrang(p.trangId)).archivedAt).toEqual(dau);

		const q = await daLuuTru("Giu ngay dau do");
		const dauQ = (await hangTrang(q.trangId)).archivedAt;
		await db.$transaction((tx) =>
			tx.taiLieuTrang.updateMany({
				where: { id: q.trangId },
				data: { archivedAt: lechBaNgay },
			}),
		);
		expect((await hangTrang(q.trangId)).archivedAt).not.toEqual(dauQ);
	});

	test("khoi-phuc: de xuat khoi phuc duoc duyet thi trang tro lai tim va dang dung", async () => {
		const tu = `khoiphuc${Date.now().toString(36)}`;
		const b = await taoTrang(
			ma("Khoi phuc B"),
			`## B\n\nTừ khoá ${tu} ở đây.`,
			"tao",
			"chu",
		);
		await duyet(b.deXuatId, "chu");
		await duyet(await deXuatLuuTru(b.slug), "chu");
		const id = await deXuatKhoiPhuc(b.slug, "cần lại");
		const dx = await db.taiLieuDeXuat.findUniqueOrThrow({ where: { id } });
		expect([dx.loai, dx.lyDoDeXuat]).toEqual(["KHOI_PHUC", "cần lại"]);
		const truocSuKien = await idSuKien(b.trangId);
		await duyet(id, "chu");
		expect((await hangTrang(b.trangId)).archivedAt).toBeNull();
		expect((await suKienMoi(b.trangId, truocSuKien)).so).toEqual({
			KHOI_PHUC: 1,
		});
		const tim = ok<{ rows: { slug: string }[] }>(
			await hoi("taiLieu.tim", { q: tu }, "khac"),
			"tim B",
		);
		expect(tim.rows.map((r) => r.slug)).toEqual([b.slug]);
		const dangDung = ok<{ rows: { slug: string }[] }>(
			await hoi("taiLieu.dangDung", undefined, "khac"),
			"dang dung",
		);
		expect(dangDung.rows.map((r) => r.slug)).toContain(b.slug);
	});

	test("khoi-phuc: ma tran tu choi viet truoc va propose tren trang da luu tru", async () => {
		const chuaLuu = await trangDangDung("Khoi phuc chua luu");
		const coCho = await daLuuTru("Khoi phuc co cho");
		await deXuatKhoiPhuc(coCho.slug);
		const BANG = [
			{ ca: "trang chua luu tru", t: chuaLuu, mong: `400 ${T.chuaLuuTru}` },
			{
				ca: "da co de xuat khoi phuc cho",
				t: coCho,
				mong: `409 ${T.daCoKhoiPhucCho}`,
			},
		] as const;
		expect(BANG).toHaveLength(2);
		for (const dong of BANG) {
			const truoc = await dem(dong.t.trangId);
			const tra = await goi(
				"taiLieu.deXuatKhoiPhuc",
				{ slug: dong.t.slug, lyDo: "Cần lại." },
				"khac",
			);
			expect(`${dong.ca}: ${tra.status} ${tra.loi}`).toBe(
				`${dong.ca}: ${dong.mong}`,
			);
			expect(await dem(dong.t.trangId)).toEqual(truoc);
		}
		const truoc = await dem(coCho.trangId);
		const tra = await goi(
			"taiLieu.propose",
			{ slug: coCho.slug, noiDung: "## Sửa\n\nKhi đã lưu trữ." },
			"tao",
		);
		expect(`${tra.status} ${tra.loi}`).toBe(`400 ${T.daLuuTru}`);
		expect(await dem(coCho.trangId)).toEqual(truoc);
	});

	test("da-xu-ly: nhom Da xu ly gom da duyet, tra lai, cu; nhom cho khong doi", async () => {
		const t = await taoTrang(ma("Da xu ly"), "## A\n\nBản đầu.", "tao", "chu");
		const cu = await deXuat(t.slug, "## A\n\nBản song song.", "tao");
		await duyet(t.deXuatId, "chu");
		const traLaiId = await deXuat(t.slug, "## A\n\nBản bị trả.", "tao");
		await traLai(traLaiId, "chu");
		const choId = await deXuat(t.slug, "## A\n\nBản đang chờ.", "tao");
		type Dong = { id: string; trangThai: string };
		type DanhSach = { rows: Dong[]; total: number };
		const daXuLy = ok<DanhSach>(
			await hoi("taiLieu.proposals", { nhom: "da-xu-ly", slug: t.slug }, "chu"),
			"da xu ly",
		);
		const theoId = (rows: Dong[]) =>
			Object.fromEntries(rows.map((r) => [r.id, r.trangThai]));
		expect(theoId(daXuLy.rows)).toEqual({
			[t.deXuatId]: "DA_DUYET",
			[traLaiId]: "TRA_LAI",
			[cu]: "CU",
		});
		expect(daXuLy.total).toBe(daXuLy.rows.length);
		const cho = ok<DanhSach>(
			await hoi("taiLieu.proposals", { nhom: "cho", slug: t.slug }, "chu"),
			"cho",
		);
		expect(theoId(cho.rows)).toEqual({ [choId]: "CHO_DUYET" });
		expect(cho.total).toBe(1);
	});
});

describe("tlkp", () => {
	test("tlkp-dem: su kien sinh truoc khi chup khong duoc dem du luc o tuong lai, su kien sau thi duoc dem", async () => {
		const t = await trangDangDung("Dem su kien");
		const aiId = phien.chu.nguoi;
		await db.taiLieuSuKien.create({
			data: {
				trangId: t.trangId,
				loai: "DE_XUAT",
				aiId,
				luc: new Date(Date.now() + 5000),
				chiTiet: {},
			},
		});
		const moc = new Date(Date.now() - 1);
		const truoc = await idSuKien(t.trangId);
		const theoMoc = demLoai(
			await db.taiLieuSuKien.findMany({
				where: { trangId: t.trangId, luc: { gt: moc } },
				select: { loai: true },
			}),
		);
		if (theoMoc.DE_XUAT !== 1)
			throw new Error("tlkp-dem: du lieu gieo khong kich duoc loi moc gio");
		if (Object.keys((await suKienMoi(t.trangId, truoc)).so).length > 0)
			throw new Error("tlkp-dem: dem nham su kien truoc moc");
		await db.taiLieuSuKien.create({
			data: { trangId: t.trangId, loai: "KHOI_PHUC", aiId, chiTiet: {} },
		});
		const sau = await suKienMoi(t.trangId, truoc);
		if (sau.so.KHOI_PHUC !== 1)
			throw new Error("tlkp-dem: ham moi khong dem su kien sau moc");
		expect(sau.so).toEqual({ KHOI_PHUC: 1 });
	});
});
