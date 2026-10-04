import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { LoaiTrang } from "@crm/validation/tai-lieu";
import {
	type Ai,
	donTaiLieu,
	dungSan,
	duyet,
	goi,
	hoi,
	ok,
	phien,
} from "./tai-lieu-san";

dungSan();

type KhoaDv = "DV1" | "DV2" | "DV3" | "DV4";
type KhoaTrang = "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8";

const DON_VI: readonly KhoaDv[] = ["DV1", "DV2", "DV3", "DV4"];

const TRANG = {
	T1: { dv: "DV1", loai: "quy-dinh", chu: "chu" },
	T2: { dv: "DV1", loai: "chinh-sach", chu: "khac" },
	T3: { dv: "DV2", loai: "quy-dinh", chu: "chu" },
	T4: { dv: "DV2", loai: "quy-trinh", chu: "admin" },
	T5: { dv: "DV3", loai: "bieu-mau", chu: "khac" },
	T6: { dv: null, loai: "quy-dinh", chu: "admin" },
	T7: { dv: "DV1", loai: "quy-trinh", chu: "chu" },
	T8: { dv: "DV3", loai: "chinh-sach", chu: "chu" },
} satisfies Record<KhoaTrang, { dv: KhoaDv | null; loai: LoaiTrang; chu: Ai }>;

type Dem = Record<LoaiTrang, number>;
const dem = (qd: number, cs: number, qt: number, bm: number): Dem => ({
	"quy-dinh": qd,
	"chinh-sach": cs,
	"quy-trinh": qt,
	"bieu-mau": bm,
	"chien-luoc": 0,
});

const MA_TRAN: readonly {
	ten: string;
	loc: { dv?: KhoaDv; loai?: LoaiTrang; chu?: Ai };
	mong: readonly KhoaTrang[];
	facet: Dem;
}[] = [
	{
		ten: "khong loc",
		loc: {},
		mong: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"],
		facet: dem(3, 2, 2, 1),
	},
	{
		ten: "don vi",
		loc: { dv: "DV1" },
		mong: ["T1", "T2", "T7"],
		facet: dem(1, 1, 1, 0),
	},
	{
		ten: "loai",
		loc: { loai: "quy-dinh" },
		mong: ["T1", "T3", "T6"],
		facet: dem(3, 2, 2, 1),
	},
	{
		ten: "chu",
		loc: { chu: "chu" },
		mong: ["T1", "T3", "T7", "T8"],
		facet: dem(2, 1, 1, 0),
	},
	{
		ten: "don vi + loai",
		loc: { dv: "DV1", loai: "quy-dinh" },
		mong: ["T1"],
		facet: dem(1, 1, 1, 0),
	},
	{
		ten: "don vi + chu",
		loc: { dv: "DV2", chu: "admin" },
		mong: ["T4"],
		facet: dem(0, 0, 1, 0),
	},
	{
		ten: "loai + chu",
		loc: { loai: "quy-dinh", chu: "chu" },
		mong: ["T1", "T3"],
		facet: dem(2, 1, 1, 0),
	},
	{
		ten: "ca ba",
		loc: { dv: "DV3", loai: "chinh-sach", chu: "chu" },
		mong: ["T8"],
		facet: dem(0, 1, 0, 0),
	},
];

const dvId = new Map<KhoaDv, string>();
const khoaCua = new Map<string, string>();

type BoLoc = {
	donVi: { id: string; ten: string; so: number }[];
	chuTrang: { id: string; ten: string; so: number }[];
};

beforeAll(async () => {
	await donTaiLieu({});
	for (const [i, k] of DON_VI.entries()) {
		const d = await db.department.create({
			data: { name: `ktl-loc ${k} ${process.pid}`, position: 900 + i },
		});
		dvId.set(k, d.id);
	}
	for (const [khoa, t] of Object.entries(TRANG) as [
		KhoaTrang,
		(typeof TRANG)[KhoaTrang],
	][]) {
		const tao = ok<{ slug: string }>(
			await goi(
				"taiLieu.create",
				{
					ten: `Trang lọc ${khoa}`,
					loai: t.loai,
					departmentId: t.dv ? dvId.get(t.dv) : null,
					chuTrangId: phien[t.chu].nguoi,
					noiDung: `Nội dung ${khoa}.\n`,
				},
				"tao",
			),
			`tao ${khoa}`,
		);
		const hang = await db.taiLieuTrang.findUniqueOrThrow({
			where: { slug: tao.slug },
			select: { deXuat: { select: { id: true } } },
		});
		await duyet(hang.deXuat[0]?.id as string, "admin");
		khoaCua.set(tao.slug, khoa);
	}
	const nhap = ok<{ slug: string }>(
		await goi(
			"taiLieu.create",
			{
				ten: "Trang lọc nháp",
				loai: "bieu-mau",
				departmentId: dvId.get("DV4"),
				chuTrangId: phien.owner.nguoi,
				noiDung: "Nháp.\n",
			},
			"tao",
		),
		"tao nhap",
	);
	khoaCua.set(nhap.slug, "N");
});

afterAll(async () => {
	await donTaiLieu({});
	await db.department.deleteMany({ where: { id: { in: [...dvId.values()] } } });
});

describe("loc", () => {
	test("loc: 8 to hop loc ra dung tap va dung so dem theo loai", async () => {
		let soKhangDinh = 0;
		for (const { ten, loc, mong, facet } of MA_TRAN) {
			const vao = {
				page: 1,
				donViId: loc.dv ? dvId.get(loc.dv) : undefined,
				loai: loc.loai,
				chuTrangId: loc.chu ? phien[loc.chu].nguoi : undefined,
			};
			const ra = ok<{
				rows: { slug: string }[];
				total: number;
				facetCounts: Dem;
			}>(await hoi("taiLieu.list", vao, "khac"), `list ${ten}`);
			const thay = ra.rows.map((r) => khoaCua.get(r.slug) ?? r.slug).sort();
			expect(thay, `loc: ${ten}`).toEqual([...mong].sort());
			soKhangDinh += 1;
			if (JSON.stringify(ra.facetCounts) !== JSON.stringify(facet)) {
				throw new Error(
					`loc: facetCounts khong theo don vi da chon (${ten}: ${JSON.stringify(ra.facetCounts)})`,
				);
			}
			expect(ra.facetCounts).toEqual(facet);
			soKhangDinh += 1;
		}
		expect(soKhangDinh).toBe(16);
	});

	test("loc: bo loc chi gom don vi va chu co trang nguoi xem thay", async () => {
		const khac = ok<BoLoc>(
			await hoi("taiLieu.boLoc", undefined, "khac"),
			"boLoc khac",
		);
		const dvKhac = khac.donVi.map((d) => d.id).sort();
		expect(dvKhac).toEqual(
			(["DV1", "DV2", "DV3"] as const).map((k) => dvId.get(k) as string).sort(),
		);
		expect(khac.donVi.find((d) => d.id === dvId.get("DV1"))?.so).toBe(3);
		const chuKhac = khac.chuTrang.map((c) => c.id).sort();
		expect(chuKhac).toEqual(
			(["chu", "khac", "admin"] as const).map((a) => phien[a].nguoi).sort(),
		);
		expect(khac.chuTrang.find((c) => c.id === phien.chu.nguoi)?.so).toBe(4);
		const quanTri = ok<BoLoc>(
			await hoi("taiLieu.boLoc", undefined, "owner"),
			"boLoc owner",
		);
		expect(quanTri.donVi.map((d) => d.id)).toContain(dvId.get("DV4") as string);
		expect(quanTri.chuTrang.map((c) => c.id)).toContain(phien.owner.nguoi);
	});
});
