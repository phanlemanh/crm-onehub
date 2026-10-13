import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	docBanDangDung,
	docNhieuBanDangDung,
	timTrangDangDung,
} from "@crm/db/tai-lieu-tim";
import { dungTruyVan } from "@crm/validation/tai-lieu-tim";
import {
	donTaiLieu,
	dungSan,
	duyet,
	goi,
	hoi,
	ok,
	phien,
	TIEN_TO,
} from "./tai-lieu-san";

dungSan();

const TU = `tulapluutru${TIEN_TO.replace(/[^a-z0-9]/g, "")}${Date.now().toString(36)}`;
const san = { a: "", b: "", c2: "", donVi: "" };

type Slug = { slug: string };
type Nhom = { rows: Slug[] };
type BoLoc = {
	donVi: { id: string; so: number }[];
	chuTrang: { id: string; so: number }[];
};
type SucKhoe = { quaHan: Nhom };
type DanhSach = { rows: (Slug & { luuTruLuc: string | null })[] };

function homQuaVN(): string {
	const vn = new Date(Date.now() + 7 * 3_600_000 - 86_400_000);
	return vn.toISOString().slice(0, 10);
}

async function taoTrang(nhan: string, noiDung: string, chu: "chu" | "khac") {
	const { slug } = ok<{ slug: string }>(
		await goi(
			"taiLieu.create",
			{
				ten: `${TIEN_TO} ${nhan}`,
				loai: "quy-dinh",
				departmentId: chu === "chu" ? san.donVi : null,
				chuTrangId: phien[chu].nguoi,
				noiDung,
			},
			"tao",
		),
		`tao ${nhan}`,
	);
	const hang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { deXuat: { select: { id: true } } },
	});
	await duyet(hang.deXuat[0]?.id ?? "", chu);
	return slug;
}

async function viecTrang(
	thuTuc: "taiLieu.deXuatLuuTru" | "taiLieu.deXuatKhoiPhuc",
	slug: string,
) {
	const { deXuatId } = ok<{ deXuatId: string }>(
		await goi(thuTuc, { slug, lyDo: "Đo bộ lọc." }, "khac"),
		`${thuTuc} ${slug}`,
	);
	await duyet(deXuatId, "chu");
}

const trongAB = (slugs: readonly string[]) =>
	[...new Set(slugs.filter((s) => s === san.a || s === san.b))].sort();

async function boLoc() {
	const b = ok<BoLoc>(await hoi("taiLieu.boLoc", undefined, "khac"), "bo loc");
	return {
		donVi: b.donVi.find((d) => d.id === san.donVi)?.so ?? 0,
		chuTrang: b.chuTrang.find((c) => c.id === phien.chu.nguoi)?.so ?? 0,
	};
}

async function bangDoc(): Promise<Record<string, string[]>> {
	const truyVan = dungTruyVan(TU);
	if (!truyVan) throw new Error("tu khoa khong dung duoc truy van");
	const [tim, dangDung, list, sucKhoe, nhacToi, timDb, docB, docA, docNhieu] =
		await Promise.all([
			hoi("taiLieu.tim", { q: TU }, "khac"),
			hoi("taiLieu.dangDung", undefined, "khac"),
			hoi("taiLieu.list", { donViId: san.donVi }, "khac"),
			hoi("taiLieu.sucKhoe", undefined, "khac"),
			hoi("taiLieu.nhacToi", { slug: san.c2 }, "khac"),
			timTrangDangDung(db, truyVan.tsquery, 50),
			docBanDangDung(db, san.b),
			docBanDangDung(db, san.a),
			docNhieuBanDangDung(db, [san.a, san.b]),
		]);
	return {
		tim: trongAB(ok<Nhom>(tim, "tim").rows.map((r) => r.slug)),
		dangDung: trongAB(ok<Nhom>(dangDung, "dang dung").rows.map((r) => r.slug)),
		listMacDinh: trongAB(ok<Nhom>(list, "list").rows.map((r) => r.slug)),
		sucKhoeQuaHan: trongAB(
			ok<SucKhoe>(sucKhoe, "suc khoe").quaHan.rows.map((r) => r.slug),
		),
		nhacToi: trongAB(ok<Nhom>(nhacToi, "nhac toi").rows.map((r) => r.slug)),
		timTrangDangDung: trongAB(timDb.map((h) => h.slug)),
		docBanDangDung: trongAB([docA?.slug, docB?.slug].flatMap((s) => s ?? [])),
		docNhieuBanDangDung: trongAB(docNhieu.map((d) => d.slug)),
	};
}

beforeAll(async () => {
	const d = await db.department.create({
		data: { name: `ktl-luu-tru ${process.pid}`, position: 950 },
	});
	san.donVi = d.id;
	san.c2 = await taoTrang(
		"C2 dich",
		"## Đích\n\nTrang được nhắc tới.\n",
		"khac",
	);
	const lk = `[trang đích](/ws/tai-lieu/${san.c2})`;
	for (const k of ["a", "b"] as const) {
		san[k] = await taoTrang(
			`Trang ${k.toUpperCase()}`,
			`## ${k}\n\nTừ khoá ${TU} và xem ${lk} khi cần.\n`,
			"chu",
		);
		ok(
			await goi("taiLieu.datXacMinh", { slug: san[k], den: homQuaVN() }, "chu"),
			`xac minh ${k}`,
		);
	}
}, 120_000);

afterAll(async () => {
	await donTaiLieu({});
	await db.department.deleteMany({ where: { id: san.donVi } });
});

describe("lslt-bo-loc", () => {
	test("loc: ma tran muoi cho doc — truoc luu tru ra A,B; sau luu tru chi A; khoi phuc lai ra A,B", async () => {
		const AB = [san.a, san.b].sort();
		const BANG = [
			"tim",
			"dangDung",
			"listMacDinh",
			"sucKhoeQuaHan",
			"nhacToi",
			"timTrangDangDung",
			"docBanDangDung",
			"docNhieuBanDangDung",
		] as const;

		const truoc = await bangDoc();
		expect(Object.keys(truoc).sort()).toEqual([...BANG].sort());
		for (const cho of BANG)
			expect(`${cho}: ${truoc[cho]}`).toBe(`${cho}: ${AB}`);
		expect(await boLoc()).toEqual({ donVi: 2, chuTrang: 2 });

		await viecTrang("taiLieu.deXuatLuuTru", san.b);

		const sau = await bangDoc();
		for (const cho of BANG)
			expect(`${cho}: ${sau[cho]}`).toBe(`${cho}: ${san.a}`);
		expect(await boLoc()).toEqual({ donVi: 1, chuTrang: 1 });
		const daLuu = ok<DanhSach>(
			await hoi("taiLieu.list", { donViId: san.donVi, archived: true }, "khac"),
			"list archived",
		);
		expect(daLuu.rows.map((r) => r.slug)).toEqual([san.b]);
		const trangB = await db.taiLieuTrang.findUniqueOrThrow({
			where: { slug: san.b },
			select: { archivedAt: true },
		});
		expect(daLuu.rows[0]?.luuTruLuc).toBe(
			trangB.archivedAt?.toISOString() ?? "",
		);
		const getB = ok<{ daLuuTru: { luc: string } | null }>(
			await hoi("taiLieu.get", { slug: san.b }, "khac"),
			"get B",
		);
		expect(getB.daLuuTru?.luc).toBe(trangB.archivedAt?.toISOString() ?? "");
		expect(BANG.length + 2).toBe(10);

		await viecTrang("taiLieu.deXuatKhoiPhuc", san.b);

		const khoiPhuc = await bangDoc();
		for (const cho of BANG)
			expect(`${cho}: ${khoiPhuc[cho]}`).toBe(`${cho}: ${AB}`);
		expect(await boLoc()).toEqual({ donVi: 2, chuTrang: 2 });
		expect(
			ok<DanhSach>(
				await hoi(
					"taiLieu.list",
					{ donViId: san.donVi, archived: true },
					"khac",
				),
				"list archived sau khoi phuc",
			).rows,
		).toEqual([]);
	});
});
