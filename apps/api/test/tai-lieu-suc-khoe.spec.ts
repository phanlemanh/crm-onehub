import {
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import {
	type Ai,
	deXuat,
	donTaiLieu,
	dungSan,
	duyet,
	hoi,
	ok,
	taoTrang,
} from "./tai-lieu-san";

dungSan();

afterEach(() => {
	setSystemTime();
});

type DongTrang = { slug: string; ten: string; chuTrang: { name: string } };
type SucKhoe = {
	quaHan: { rows: (DongTrang & { xacMinhDen: string })[]; total: number };
	choDuyet: { rows: (DongTrang & { soBan: number })[]; total: number };
	gay: {
		rows: (DongTrang & { lienKet: { denSlug: string; vanBan: string }[] })[];
		total: number;
	};
	chuaCo: {
		rows: { denSlug: string; vanBan: string; soTrang: number }[];
		total: number;
	};
	moCoi: { rows: (DongTrang & { duyetLuc: string })[]; total: number };
};

const slug: Record<string, string> = {};
const NGAY_MS = 24 * 60 * 60 * 1000;
const SAU_NUA_DEM_MS = (6 * 60 + 30) * 60 * 1000;
const DAU_MAI = new Date(dauNgayVN(new Date()).getTime() + NGAY_MS);
const LUC_GIA = new Date(DAU_MAI.getTime() + SAU_NUA_DEM_MS);
const cach = (ngay: number) => new Date(DAU_MAI.getTime() + ngay * NGAY_MS);
const khoa = (s: string) =>
	Object.entries(slug).find(([, v]) => v === s)?.[0] ?? s;
const CHUA_A = "ktl-chua-co-a";
const CHUA_B = "ktl-chua-co-b";
const lk = (den: string) => `[tới ${den}](/ws/tai-lieu/${den})`;

async function sucKhoe(ai: Ai): Promise<SucKhoe> {
	return ok<SucKhoe>(
		await hoi("taiLieu.sucKhoe", undefined, ai),
		`sucKhoe ${ai}`,
	);
}

async function trangDuyet(k: string, noiDung: string, chu: Ai = "chu") {
	const moi = await taoTrang(`Sức khoẻ ${k}`, noiDung, "tao", chu);
	await duyet(moi.deXuatId, chu);
	slug[k] = moi.slug;
	return moi;
}

async function suaDuyet(k: string, noiDung: string) {
	await duyet(await deXuat(slug[k] as string, noiDung), "chu");
}

describe("lien-ket kho rong", () => {
	beforeAll(async () => {
		await donTaiLieu({});
	});

	test("lien-ket: kho chua co trang nao thi nam danh sach rong, khong loi", async () => {
		const sk = await sucKhoe("khac");
		expect(
			[sk.quaHan, sk.choDuyet, sk.gay, sk.chuaCo, sk.moCoi].map((d) => d.total),
		).toEqual([0, 0, 0, 0, 0]);
	});
});

describe("lien-ket", () => {
	beforeAll(async () => {
		for (const k of ["P1", "P2", "P3", "P4", "P5", "P6"]) {
			await trangDuyet(k, `Trang ${k}.\n`);
		}
		const n1 = await taoTrang("Sức khoẻ N1 nháp", "Nháp.\n", "tao", "chu");
		slug.N1 = n1.slug;
		await suaDuyet("P1", `Xem ${lk(slug.P2 as string)} và ${lk(CHUA_B)}.\n`);
		await suaDuyet("P2", `Xem ${lk(slug.P1 as string)}.\n`);
		await suaDuyet("P3", `Xem ${lk(slug.P2 as string)}.\n`);
		await suaDuyet("P4", `Xem ${lk(CHUA_A)}.\n`);
		await suaDuyet("P5", `Xem ${lk(CHUA_A)} và ${lk(slug.N1 as string)}.\n`);
		await suaDuyet("P6", `Xem ${lk(slug.P6 as string)}.\n`);
	});

	test("lien-ket: mo coi, gay, chua co dung tap viet truoc, nhu nhau voi nguoi tao va nguoi khac", async () => {
		for (const ai of ["tao", "khac"] as const) {
			const sk = await sucKhoe(ai);
			const moCoi = sk.moCoi.rows.map((r) => khoa(r.slug)).sort();
			expect(moCoi, `suc-khoe: mo coi (${ai})`).toEqual([
				"P3",
				"P4",
				"P5",
				"P6",
			]);
			const chuaCo = Object.fromEntries(
				sk.chuaCo.rows.map((r) => [khoa(r.denSlug), r.soTrang]),
			);
			if (!("N1" in chuaCo)) {
				throw new Error(
					`suc-khoe: n1 bien khoi chuaCo voi ${ai === "tao" ? "nguoi tao" : ai}`,
				);
			}
			const gay = Object.fromEntries(
				sk.gay.rows.map((r) => [
					khoa(r.slug),
					r.lienKet.map((l) => khoa(l.denSlug)).sort(),
				]),
			);
			expect(gay, `suc-khoe: gay (${ai})`).toEqual({
				P1: [CHUA_B],
				P4: [CHUA_A],
				P5: [CHUA_A, "N1"].sort(),
			});
			expect(chuaCo, `suc-khoe: chua co (${ai})`).toEqual({
				[CHUA_A]: 2,
				[CHUA_B]: 1,
				N1: 1,
			});
			expect(sk.gay.total).toBe(3);
			expect(sk.chuaCo.total).toBe(3);
		}
	});
});

describe("trang-thai", () => {
	beforeAll(async () => {
		await donTaiLieu({});
		for (const k of ["Q1", "Q2", "Q3", "Q4"]) {
			await trangDuyet(k, `Trang ${k}.\n`, "khac");
		}
		await trangDuyet("Q5", "Trang Q5.\n", "chu");
		await deXuat(slug.Q5 as string, "Sửa Q5.\n", "tao");
		const ngay: Record<string, Date | null> = {
			Q1: cach(-1),
			Q2: cach(0),
			Q3: cach(1),
			Q4: null,
		};
		for (const [k, d] of Object.entries(ngay)) {
			await db.taiLieuTrang.update({
				where: { slug: slug[k] },
				data: { xacMinhDen: d },
			});
		}
		await deXuat(slug.Q3 as string, "Sửa Q3 lần một.\n", "tao");
		await deXuat(slug.Q3 as string, "Sửa Q3 lần hai.\n", "tao");
	});

	test("trang-thai: qua han theo dau ngay gio Viet Nam", async () => {
		setSystemTime(LUC_GIA);
		const sk = await sucKhoe("khac");
		const quaHan = sk.quaHan.rows.map((r) => khoa(r.slug));
		if (quaHan.includes("Q2")) {
			throw new Error("suc-khoe: dau ngay hom nay VN bi tinh qua han");
		}
		expect(quaHan).toEqual(["Q1"]);
		expect(sk.quaHan.rows[0]?.xacMinhDen).toBe(cach(-1).toISOString());
	});

	test("trang-thai: co de xuat cho duyet theo nguoi xem thay duoc, kem so ban", async () => {
		const MONG: Record<string, Record<string, number>> = {
			chu: { Q5: 1 },
			khac: { Q3: 2 },
			admin: { Q3: 2, Q5: 1 },
			tao: { Q3: 2, Q5: 1 },
			okr: {},
		};
		for (const [ai, mong] of Object.entries(MONG)) {
			const sk = await sucKhoe(ai as Ai);
			const thay = Object.fromEntries(
				sk.choDuyet.rows.map((r) => [khoa(r.slug), r.soBan]),
			);
			expect(thay, `suc-khoe: cho duyet (${ai})`).toEqual(mong);
		}
	});

	test("trang-thai: moi dong cua nam danh sach co ten trang va chu trang", async () => {
		setSystemTime(LUC_GIA);
		const sk = await sucKhoe("admin");
		const dong = [
			...sk.quaHan.rows,
			...sk.choDuyet.rows,
			...sk.gay.rows,
			...sk.moCoi.rows,
		];
		expect(dong.length > 0).toBe(true);
		for (const r of dong) {
			expect(r.ten.length > 0 && r.chuTrang.name.length > 0).toBe(true);
		}
	});
});
