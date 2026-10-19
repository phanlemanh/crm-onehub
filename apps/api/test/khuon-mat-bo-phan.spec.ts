import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "kmbp";

let dem = 0;
function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

type GiaJson =
	| string
	| number
	| boolean
	| null
	| GiaJson[]
	| { [khoa: string]: GiaJson };
type DauVao = { [khoa: string]: GiaJson };
type TraLoi = { status: number; data: unknown; loi: string };

const phien = { nguoi: "", cookie: "", token: "" };

let app: INestApplication;

async function goi(thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/onboarding.${thuTuc}`)
		.set("cookie", phien.cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function goiOrg(thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/org.${thuTuc}`)
		.set("cookie", phien.cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function doc(thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.get(
			`/api/trpc/onboarding.${thuTuc}?input=${encodeURIComponent(JSON.stringify(dauVao))}`,
		)
		.set("cookie", phien.cookie);
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

type BoPhanRa = { id: string; name: string; purgeable: boolean };
type BuocKhuon = {
	label: string;
	departmentId: string;
	position: number;
	offsetDays: number;
};
type KhuonRa = { id: string; name: string; steps: BuocKhuon[] };

function buoc(boPhanIds: string[]): BuocKhuon[] {
	return boPhanIds.map((departmentId, position) => ({
		label: `Buoc ${position}`,
		departmentId,
		position,
		offsetDays: position * 7,
	}));
}

async function taoBoPhan(): Promise<BoPhanRa> {
	const name = ma("Bo phan");
	const { id } = ok<{ id: string }>(
		await goiOrg("createDepartment", { name, divisionId: null }),
		"tao bo phan",
	);
	return { id, name, purgeable: false };
}

async function taoKhuon(boPhanIds: string[]): Promise<KhuonRa> {
	return ok<KhuonRa>(
		await goi("createTemplate", {
			name: ma("Khuon"),
			partnerType: null,
			steps: buoc(boPhanIds),
		}),
		"tao khuon",
	);
}

async function taoKeHoach(khuonId: string): Promise<void> {
	const congTy = await db.company.create({ data: { name: ma("Cong ty") } });
	ok(
		await goi("createFromTemplate", {
			companyId: congTy.id,
			templateId: khuonId,
			startedAt: "2026-09-21",
			ownerId: phien.nguoi,
		}),
		"tao ke hoach",
	);
}

async function coTheXoa(id: string): Promise<boolean | undefined> {
	const ds = ok<BoPhanRa[]>(
		await doc("listDepartments", { archived: true }),
		"ds bo phan da luu tru",
	);
	return ds.find((d) => d.id === id)?.purgeable;
}

async function conHang(id: string): Promise<boolean> {
	return (await db.department.findUnique({ where: { id } })) !== null;
}

async function khuonLuuTruVoiBoPhan(): Promise<{
	boPhan: BoPhanRa;
	khuon: KhuonRa;
}> {
	const boPhan = await taoBoPhan();
	const khuon = await taoKhuon([boPhan.id]);
	ok(await goi("archiveTemplate", { id: khuon.id }), "luu tru khuon");
	ok(await goiOrg("archiveDepartment", { id: boPhan.id }), "luu tru bo phan");
	return { boPhan, khuon };
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();

	const id = ma("admin");
	await gieoThanhVien(id, "admin");
	const moi = await mintPhien(id);
	phien.nguoi = id;
	phien.cookie = moi.cookie;
	phien.token = moi.token;
});

afterAll(async () => {
	await app.close();
	await db.onboardingPlan.deleteMany({
		where: { company: { name: { startsWith: TIEN_TO } } },
	});
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.onboardingTemplate.deleteMany({
		where: { name: { startsWith: TIEN_TO } },
	});
	await db.department.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.session.deleteMany({ where: { token: phien.token } });
	await db.viec.deleteMany({
		where: {
			OR: [
				{ taoBoiId: { in: [phien.nguoi] } },
				{ nguoiGiaoId: { in: [phien.nguoi] } },
				{ nguoiThucHienId: { in: [phien.nguoi] } },
			],
		},
	});
	await db.member.deleteMany({ where: { userId: phien.nguoi } });
	await db.user.deleteMany({ where: { id: phien.nguoi } });
});

describe("kmbp-chan-xoa", () => {
	test("kmbp-chan-xoa: bo phan con trong khuon da luu tru khong xoa vinh vien duoc", async () => {
		const { boPhan: b, khuon: k } = await khuonLuuTruVoiBoPhan();
		expect(`B purgeable ${await coTheXoa(b.id)}`).toBe("B purgeable false");
		const xoaB = await goiOrg("purgeDepartment", { id: b.id });
		expect(
			`purgeDepartment B phai bi tu choi vi con trong khuon K: HTTP ${xoaB.status} nhac K ${xoaB.loi.includes(k.name)}`,
		).toBe(
			"purgeDepartment B phai bi tu choi vi con trong khuon K: HTTP 400 nhac K true",
		);
		expect(`B con hang ${await conHang(b.id)}`).toBe("B con hang true");

		const b2 = await taoBoPhan();
		const k1 = await taoKhuon([b2.id]);
		const k2 = await taoKhuon([b2.id]);
		ok(await goi("archiveTemplate", { id: k1.id }), "luu tru K1");
		ok(await goi("archiveTemplate", { id: k2.id }), "luu tru K2");
		ok(await goiOrg("archiveDepartment", { id: b2.id }), "luu tru B2");
		const xoaHai = await goiOrg("purgeDepartment", { id: b2.id });
		expect(
			`B2 trong K1 va K2: HTTP ${xoaHai.status} nhac K1 ${xoaHai.loi.includes(k1.name)} nhac K2 ${xoaHai.loi.includes(k2.name)}`,
		).toBe("B2 trong K1 va K2: HTTP 400 nhac K1 true nhac K2 true");

		ok(await goi("purgeTemplate", { id: k1.id }), "xoa vinh vien K1");
		expect(
			`B2 con trong K2 sau khi xoa K1: purgeable ${await coTheXoa(b2.id)}`,
		).toBe("B2 con trong K2 sau khi xoa K1: purgeable false");
		const xoaSau = await goiOrg("purgeDepartment", { id: b2.id });
		expect(
			`B2 con trong K2 sau khi xoa K1: HTTP ${xoaSau.status} nhac K2 ${xoaSau.loi.includes(k2.name)} nhac K1 ${xoaSau.loi.includes(k1.name)}`,
		).toBe(
			"B2 con trong K2 sau khi xoa K1: HTTP 400 nhac K2 true nhac K1 false",
		);
		expect(`B2 con hang ${await conHang(b2.id)}`).toBe("B2 con hang true");

		const c = await taoBoPhan();
		ok(await goiOrg("archiveDepartment", { id: c.id }), "luu tru C");
		expect(`C khong o dau ca: purgeable ${await coTheXoa(c.id)}`).toBe(
			"C khong o dau ca: purgeable true",
		);
		ok(await goiOrg("purgeDepartment", { id: c.id }), "xoa vinh vien C");
		expect(`C con hang ${await conHang(c.id)}`).toBe("C con hang false");
	});
});

describe("kmbp-khoi-phuc", () => {
	test("kmbp-khoi-phuc: khoi phuc khuon K sau khi thu xoa B", async () => {
		const { boPhan: b, khuon: k } = await khuonLuuTruVoiBoPhan();
		const xoa = await goiOrg("purgeDepartment", { id: b.id });
		expect(
			`khoi phuc khuon K sau khi thu xoa B: xoa B HTTP ${xoa.status}`,
		).toBe("khoi phuc khuon K sau khi thu xoa B: xoa B HTTP 400");

		ok(await goiOrg("restoreDepartment", { id: b.id }), "khoi phuc B");
		const khoiPhucK = await goi("restoreTemplate", { id: k.id });
		expect(
			`khoi phuc khuon K sau khi thu xoa B: HTTP ${khoiPhucK.status} ${khoiPhucK.loi}`,
		).toBe("khoi phuc khuon K sau khi thu xoa B: HTTP 200 ");

		const khuon = ok<KhuonRa[]>(
			await doc("listTemplates", { archived: false }),
			"ds khuon dang dung",
		).find((x) => x.id === k.id);
		expect(
			`K dang dung ${khuon !== undefined} so buoc ${khuon?.steps.length} giao B ${khuon?.steps[0]?.departmentId === b.id} nhan ${khuon?.steps[0]?.label}`,
		).toBe("K dang dung true so buoc 1 giao B true nhan Buoc 0");
		const boPhan = ok<BoPhanRa[]>(
			await doc("listDepartments", { archived: false }),
			"ds bo phan dang dung",
		).some((x) => x.id === b.id);
		expect(`B dang dung ${boPhan}`).toBe("B dang dung true");
	});
});

describe("kmbp-thu-tu-don", () => {
	test("kmbp-thu-tu-don: loi a — xoa khuon truoc", async () => {
		const { boPhan: b, khuon: k } = await khuonLuuTruVoiBoPhan();
		ok(await goi("purgeTemplate", { id: k.id }), "xoa vinh vien K");
		expect(
			`sau khi xoa K, B phai xoa duoc: purgeable ${await coTheXoa(b.id)}`,
		).toBe("sau khi xoa K, B phai xoa duoc: purgeable true");
		const xoa = await goiOrg("purgeDepartment", { id: b.id });
		expect(
			`sau khi xoa K, B phai xoa duoc: HTTP ${xoa.status} ${xoa.loi}`,
		).toBe("sau khi xoa K, B phai xoa duoc: HTTP 200 ");
		expect(`B con hang ${await conHang(b.id)}`).toBe("B con hang false");
	});

	test("kmbp-thu-tu-don: loi b — bo B khoi K", async () => {
		const { boPhan: b, khuon: k } = await khuonLuuTruVoiBoPhan();
		const khac = await taoBoPhan();
		ok(await goiOrg("restoreDepartment", { id: b.id }), "khoi phuc B");
		ok(await goi("restoreTemplate", { id: k.id }), "khoi phuc K");
		ok(
			await goi("updateTemplate", { id: k.id, steps: buoc([khac.id]) }),
			"sua K bo B",
		);
		ok(await goi("archiveTemplate", { id: k.id }), "luu tru lai K");
		ok(await goiOrg("archiveDepartment", { id: b.id }), "luu tru lai B");

		expect(
			`sau khi bo B khoi K, B phai xoa duoc: purgeable ${await coTheXoa(b.id)}`,
		).toBe("sau khi bo B khoi K, B phai xoa duoc: purgeable true");
		const xoa = await goiOrg("purgeDepartment", { id: b.id });
		expect(
			`sau khi bo B khoi K, B phai xoa duoc: HTTP ${xoa.status} ${xoa.loi}`,
		).toBe("sau khi bo B khoi K, B phai xoa duoc: HTTP 200 ");
		expect(`B con hang ${await conHang(b.id)}`).toBe("B con hang false");
	});
});

describe("kmbp-khop", () => {
	test("kmbp-khop: purgeable khop voi ket qua xoa vinh vien o bon ca", async () => {
		const khongDauCa = await taoBoPhan();

		const chiKhuon = await taoBoPhan();
		const khuonChiKhuon = await taoKhuon([chiKhuon.id]);
		ok(await goi("archiveTemplate", { id: khuonChiKhuon.id }), "luu tru khuon");

		const chiKeHoach = await taoBoPhan();
		const giu = await taoBoPhan();
		const khuonKeHoach = await taoKhuon([chiKeHoach.id, giu.id]);
		await taoKeHoach(khuonKeHoach.id);
		ok(
			await goi("updateTemplate", {
				id: khuonKeHoach.id,
				steps: buoc([giu.id]),
			}),
			"bo bo phan khoi khuon",
		);

		const caHai = await taoBoPhan();
		const khuonCaHai = await taoKhuon([caHai.id]);
		await taoKeHoach(khuonCaHai.id);
		ok(await goi("archiveTemplate", { id: khuonCaHai.id }), "luu tru khuon");

		const CA = [
			{ ten: "khong-dau-ca", id: khongDauCa.id, mong: true },
			{ ten: "chi-khuon-luu-tru", id: chiKhuon.id, mong: false },
			{ ten: "chi-buoc-ke-hoach", id: chiKeHoach.id, mong: false },
			{ ten: "ca-hai", id: caHai.id, mong: false },
		] as const;

		const luuTru = new Map<string, boolean>();
		for (const ca of CA) {
			const bp = ok<BoPhanRa>(
				await goiOrg("archiveDepartment", { id: ca.id }),
				`luu tru ${ca.ten}`,
			);
			luuTru.set(ca.id, bp.purgeable);
		}

		let soQuanHe = 0;
		for (const ca of CA) {
			const trongDs = await coTheXoa(ca.id);
			expect(
				`${ca.ten}: archiveDepartment ${luuTru.get(ca.id)} danh sach ${trongDs}`,
			).toBe(`${ca.ten}: archiveDepartment ${trongDs} danh sach ${ca.mong}`);
			soQuanHe += 1;

			const xoa = await goiOrg("purgeDepartment", { id: ca.id });
			expect(
				`${ca.ten}: purgeable ${trongDs} xoa duoc ${xoa.status === 200}`,
			).toBe(`${ca.ten}: purgeable ${ca.mong} xoa duoc ${ca.mong}`);
			soQuanHe += 1;
		}
		expect(`so quan he ${soQuanHe}`).toBe(`so quan he ${CA.length * 2}`);
	});
});
