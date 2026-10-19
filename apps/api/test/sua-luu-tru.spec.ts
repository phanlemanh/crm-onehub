import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "slt";

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

const nguoi = { chu: "", quanTri: "", thanhVien: "" };
const cookie = { chu: "", quanTri: "", thanhVien: "" };
const daGieo = { phien: [] as string[], nguoi: [] as string[] };

let app: INestApplication;

async function goi(
	thuTuc: string,
	dauVao: DauVao | undefined,
	ai: keyof typeof cookie = "quanTri",
): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc.includes(".") ? thuTuc : `onboarding.${thuTuc}`}`)
		.set("cookie", cookie[ai])
		.set("content-type", "application/json")
		.send(dauVao === undefined ? "" : JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function doc(
	thuTuc: string,
	dauVao: DauVao | undefined,
	ai: keyof typeof cookie = "quanTri",
): Promise<TraLoi> {
	const q =
		dauVao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(dauVao))}`;
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/onboarding.${thuTuc}${q}`)
		.set("cookie", cookie[ai]);
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

type BoPhanRa = {
	id: string;
	name: string;
	position: number;
	purgeable: boolean;
};
type KhuonRa = { id: string; name: string; purgeable: boolean };
type BuocRa = { label: string; departmentName: string };

async function taoBoPhan(divisionId: string | null = null): Promise<BoPhanRa> {
	const name = ma("Bo phan");
	const { id } = ok<{ id: string }>(
		await goi("org.createDepartment", { name, divisionId }),
		"tao bo phan",
	);
	const { position } = await db.department.findUniqueOrThrow({
		where: { id },
		select: { position: true },
	});
	return { id, name, position, purgeable: false };
}

async function taoKhuon(boPhanIds: string[]): Promise<KhuonRa> {
	return ok<KhuonRa>(
		await goi("createTemplate", {
			name: ma("Khuon"),
			partnerType: null,
			steps: boPhanIds.map((departmentId, position) => ({
				label: `Buoc ${position}`,
				departmentId,
				position,
				offsetDays: position * 7,
			})),
		}),
		"tao khuon",
	);
}

async function taoKeHoach(
	khuonId: string,
	ai: keyof typeof cookie = "quanTri",
): Promise<{ id: string; companyName: string }> {
	const congTy = await db.company.create({ data: { name: ma("Cong ty") } });
	const kh = ok<{ id: string }>(
		await goi(
			"createFromTemplate",
			{
				companyId: congTy.id,
				templateId: khuonId,
				startedAt: "2026-09-21",
				ownerId: nguoi[ai],
			},
			ai,
		),
		"tao ke hoach",
	);
	return { id: kh.id, companyName: congTy.name };
}

async function taoGhiDanh(
	planId: string,
): Promise<{ id: string; contactId: string }> {
	const caNhan = await db.contact.create({
		data: { firstName: ma("Ca nhan") },
	});
	const gd = ok<{ id: string }>(
		await goi("upsertEnrollment", {
			planId,
			contactId: caNhan.id,
			source: "tay",
		}),
		"ghi danh",
	);
	return { id: gd.id, contactId: caNhan.id };
}

async function danhSachBoPhan(archived: boolean): Promise<BoPhanRa[]> {
	return ok<BoPhanRa[]>(
		await doc("listDepartments", { archived }),
		"ds bo phan",
	);
}

async function danhSachKhuon(archived: boolean): Promise<KhuonRa[]> {
	return ok<KhuonRa[]>(await doc("listTemplates", { archived }), "ds khuon");
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();

	const vai: Array<[keyof typeof nguoi, WorkspaceRole]> = [
		["chu", "owner"],
		["quanTri", "admin"],
		["thanhVien", "member"],
	];
	for (const [khoa, v] of vai) {
		const id = ma(v);
		await gieoThanhVien(id, v);
		const phien = await mintPhien(id);
		nguoi[khoa] = id;
		cookie[khoa] = phien.cookie;
		daGieo.nguoi.push(id);
		daGieo.phien.push(phien.token);
	}
});

afterAll(async () => {
	await app.close();
	await db.onboardingPlan.deleteMany({
		where: { company: { name: { startsWith: TIEN_TO } } },
	});
	await db.contact.deleteMany({
		where: { firstName: { startsWith: TIEN_TO } },
	});
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.onboardingTemplate.deleteMany({
		where: { name: { startsWith: TIEN_TO } },
	});
	await db.department.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.division.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.viec.deleteMany({
		where: {
			OR: [
				{ taoBoiId: { in: daGieo.nguoi } },
				{ nguoiGiaoId: { in: daGieo.nguoi } },
				{ nguoiThucHienId: { in: daGieo.nguoi } },
			],
		},
	});
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
});

describe("api-bo-phan", () => {
	test("api-bo-phan: doi ten, sap xep, luu tru va khoi phuc qua HTTP", async () => {
		const khoi = ok<{ id: string }>(
			await goi("org.createDivision", { name: ma("Khoi") }),
			"tao bo phan cap tren",
		).id;
		const [a, b, c] = [
			await taoBoPhan(khoi),
			await taoBoPhan(khoi),
			await taoBoPhan(khoi),
		];
		if (!a || !b || !c) throw new Error("thieu bo phan");
		const khuon = await taoKhuon([a.id]);
		const kh = await taoKeHoach(khuon.id);

		const tenMoi = ma("Ten moi");
		ok(
			await goi("org.renameDepartment", { id: a.id, name: tenMoi }),
			"doi ten",
		);
		const trongDb = await db.department.findUniqueOrThrow({
			where: { id: a.id },
		});
		expect(`ten DB ${trongDb.name}`).toBe(`ten DB ${tenMoi}`);
		const buoc = ok<{ rows: BuocRa[] }>(
			await doc("listSteps", { planId: kh.id }),
			"buoc",
		);
		expect(`ten buoc ${buoc.rows[0]?.departmentName}`).toBe(
			`ten buoc ${tenMoi}`,
		);

		ok(
			await goi("org.moveDepartment", { id: c.id, divisionId: khoi, index: 0 }),
			"sap xep",
		);
		const thuTu = (await danhSachBoPhan(false))
			.filter((d) => [a.id, b.id, c.id].includes(d.id))
			.map((d) => d.id);
		expect(`thu tu ${thuTu.join(",")}`).toBe(
			`thu tu ${[c.id, a.id, b.id].join(",")}`,
		);
		const viTri = await db.department.findMany({
			where: { id: { in: [a.id, b.id, c.id] } },
			orderBy: { position: "asc" },
			select: { id: true, position: true },
		});
		expect(viTri.map((v) => `${v.id}:${v.position}`)).toEqual([
			`${c.id}:0`,
			`${a.id}:1`,
			`${b.id}:2`,
		]);

		ok(await goi("archiveTemplate", { id: khuon.id }), "luu tru khuon");
		ok(await goi("org.archiveDepartment", { id: a.id }), "luu tru bo phan");
		const dangDungSauLuuTru = (await danhSachBoPhan(false)).some(
			(d) => d.id === a.id,
		);
		const luuTruSauLuuTru = (await danhSachBoPhan(true)).some(
			(d) => d.id === a.id,
		);
		expect(
			`${tenMoi} sau luu tru: dang dung ${dangDungSauLuuTru} da luu tru ${luuTruSauLuuTru}`,
		).toBe(`${tenMoi} sau luu tru: dang dung false da luu tru true`);
		const sauLuuTru = ok<{ rows: BuocRa[] }>(
			await doc("listSteps", { planId: kh.id }),
			"buoc sau luu tru",
		);
		expect(`ten buoc sau luu tru ${sauLuuTru.rows[0]?.departmentName}`).toBe(
			`ten buoc sau luu tru ${tenMoi}`,
		);

		ok(await goi("org.restoreDepartment", { id: a.id }), "khoi phuc");
		const dangDungSauKhoiPhuc = (await danhSachBoPhan(false)).some(
			(d) => d.id === a.id,
		);
		expect(`${tenMoi} sau khoi phuc: dang dung ${dangDungSauKhoiPhuc}`).toBe(
			`${tenMoi} sau khoi phuc: dang dung true`,
		);
	});
});

describe("api-chan-luu-tru", () => {
	test("api-chan-luu-tru: ba ca luu tru bo phan theo khuon dang dung", async () => {
		const trongKhuon = await taoBoPhan();
		const khuonDung = await taoKhuon([trongKhuon.id]);
		const trongKhuonDaLuu = await taoBoPhan();
		const khuonDaLuu = await taoKhuon([trongKhuonDaLuu.id]);
		ok(await goi("archiveTemplate", { id: khuonDaLuu.id }), "luu tru khuon");
		const tuDo = await taoBoPhan();

		const CA = [
			{
				ten: "trong khuon chua luu tru",
				id: trongKhuon.id,
				ma: 400,
				khuon: khuonDung.name,
			},
			{
				ten: "chi trong khuon da luu tru",
				id: trongKhuonDaLuu.id,
				ma: 200,
				khuon: null,
			},
			{ ten: "khong khuon nao", id: tuDo.id, ma: 200, khuon: null },
		] as const;

		let soCa = 0;
		for (const ca of CA) {
			const tra = await goi("org.archiveDepartment", { id: ca.id });
			expect(`${ca.ten}: HTTP ${tra.status}`).toBe(`${ca.ten}: HTTP ${ca.ma}`);
			const dong = await db.department.findUniqueOrThrow({
				where: { id: ca.id },
			});
			if (ca.khuon !== null) {
				expect(`${ca.ten}: ${tra.loi.includes(ca.khuon)}`).toBe(
					`${ca.ten}: true`,
				);
				expect(`${ca.ten}: archivedAt ${dong.archivedAt}`).toBe(
					`${ca.ten}: archivedAt null`,
				);
			} else {
				expect(`${ca.ten}: da luu tru ${dong.archivedAt !== null}`).toBe(
					`${ca.ten}: da luu tru true`,
				);
			}
			soCa += 1;
		}
		expect(soCa).toBe(3);
	});
});

describe("api-khuon", () => {
	test("api-khuon: sua khuon khong doi ke hoach da tao", async () => {
		const d = await taoBoPhan();
		const khuon = await taoKhuon([d.id, d.id]);
		const kh = await taoKeHoach(khuon.id);

		const tenMoi = ma("Khuon moi");
		ok(
			await goi("updateTemplate", {
				id: khuon.id,
				name: tenMoi,
				partnerType: "San moi gioi",
				steps: [
					{ label: "Buoc moi", departmentId: d.id, position: 0, offsetDays: 3 },
				],
			}),
			"sua khuon",
		);
		const moi = await db.onboardingTemplate.findUniqueOrThrow({
			where: { id: khuon.id },
		});
		expect(`${moi.name}|${moi.partnerType}`).toBe(`${tenMoi}|San moi gioi`);
		const buoc = await db.onboardingStep.findMany({
			where: { planId: kh.id },
			orderBy: { position: "asc" },
		});
		expect(`buoc ke hoach ${buoc.map((b) => b.label).join(",")}`).toBe(
			"buoc ke hoach Buoc 0,Buoc 1",
		);
	});

	test("api-khuon: luu tru, tao ke hoach tu khuon da luu tru, khoi phuc", async () => {
		const d = await taoBoPhan();
		const khuon = await taoKhuon([d.id]);
		ok(await goi("archiveTemplate", { id: khuon.id }), "luu tru");
		expect(
			`${khuon.name} dang dung ${(await danhSachKhuon(false)).some((k) => k.id === khuon.id)}`,
		).toBe(`${khuon.name} dang dung false`);
		expect((await danhSachKhuon(true)).some((k) => k.id === khuon.id)).toBe(
			true,
		);
		const congTy = await db.company.create({ data: { name: ma("Cong ty") } });
		const tao = await goi("createFromTemplate", {
			companyId: congTy.id,
			templateId: khuon.id,
			startedAt: "2026-09-21",
			ownerId: nguoi.quanTri,
		});
		expect(`tao tu khuon da luu tru: HTTP ${tao.status}`).toBe(
			"tao tu khuon da luu tru: HTTP 400",
		);
		ok(await goi("restoreTemplate", { id: khuon.id }), "khoi phuc");
		expect((await danhSachKhuon(false)).some((k) => k.id === khuon.id)).toBe(
			true,
		);
	});

	test("api-khuon: ba ca bi tu choi vi bo phan da luu tru", async () => {
		const dA = await taoBoPhan();
		const dB = await taoBoPhan();
		const khuonA = await taoKhuon([dA.id]);
		const khuonB = await taoKhuon([dB.id]);
		ok(await goi("archiveTemplate", { id: khuonA.id }), "luu tru khuon A");
		ok(await goi("archiveTemplate", { id: khuonB.id }), "luu tru khuon B");
		ok(await goi("org.archiveDepartment", { id: dA.id }), "luu tru bo phan A");
		const khuonSua = await taoKhuon([dB.id]);
		const soKhuonTruoc = await db.onboardingTemplate.count();

		const buoc = (id: string) => [
			{ label: "Buoc", departmentId: id, position: 0, offsetDays: 0 },
		];
		const CA = [
			{
				ten: "khoi phuc khuon",
				sai: () => goi("restoreTemplate", { id: khuonA.id }),
				dung: () => goi("restoreTemplate", { id: khuonB.id }),
			},
			{
				ten: "soan khuon",
				sai: () =>
					goi("createTemplate", {
						name: ma("Khuon"),
						partnerType: null,
						steps: buoc(dA.id),
					}),
				dung: () =>
					goi("createTemplate", {
						name: ma("Khuon"),
						partnerType: null,
						steps: buoc(dB.id),
					}),
			},
			{
				ten: "sua khuon",
				sai: () =>
					goi("updateTemplate", { id: khuonSua.id, steps: buoc(dA.id) }),
				dung: () =>
					goi("updateTemplate", { id: khuonSua.id, steps: buoc(dB.id) }),
			},
		] as const;

		let soCa = 0;
		for (const ca of CA) {
			const sai = await ca.sai();
			expect(`${ca.ten}: HTTP ${sai.status} ${sai.loi.includes(dA.name)}`).toBe(
				`${ca.ten}: HTTP 400 true`,
			);
			soCa += 1;
		}
		expect(soCa).toBe(3);
		const khuonAHien = await db.onboardingTemplate.findUniqueOrThrow({
			where: { id: khuonA.id },
		});
		expect(`khuon A van luu tru ${khuonAHien.archivedAt !== null}`).toBe(
			"khuon A van luu tru true",
		);
		expect(await db.onboardingTemplate.count()).toBe(soKhuonTruoc);
		const suaHien = await db.onboardingTemplate.findUniqueOrThrow({
			where: { id: khuonSua.id },
		});
		expect(JSON.stringify(suaHien.steps).includes(dA.id)).toBe(false);

		for (const ca of CA) {
			const dung = await ca.dung();
			expect(`${ca.ten} doi chung: HTTP ${dung.status}`).toBe(
				`${ca.ten} doi chung: HTTP 200`,
			);
		}
	});
});

describe("api-xoa-vinh-vien", () => {
	test("api-xoa-vinh-vien: nam ca xoa vinh vien", async () => {
		const chuaDung = await taoBoPhan();
		ok(
			await goi("org.archiveDepartment", { id: chuaDung.id }),
			"luu tru chua dung",
		);

		const daDung = await taoBoPhan();
		const khuonDung = await taoKhuon([daDung.id]);
		await taoKeHoach(khuonDung.id);
		ok(
			await goi("archiveTemplate", { id: khuonDung.id }),
			"luu tru khuon da dung",
		);
		ok(
			await goi("org.archiveDepartment", { id: daDung.id }),
			"luu tru da dung",
		);

		const dangDung = await taoBoPhan();

		const nen = await taoBoPhan();
		const khuonChuaDung = await taoKhuon([nen.id]);
		ok(
			await goi("archiveTemplate", { id: khuonChuaDung.id }),
			"luu tru khuon chua dung",
		);

		const bpLuuTru = await danhSachBoPhan(true);
		const khLuuTru = await danhSachKhuon(true);
		const co = (ds: { id: string; purgeable: boolean }[], id: string) =>
			ds.find((x) => x.id === id)?.purgeable;

		const CA = [
			{
				ten: "bo phan chua dung",
				purgeable: co(bpLuuTru, chuaDung.id),
				mong: true,
				thuTuc: "org.purgeDepartment",
				id: chuaDung.id,
				ma: 200,
				conHang: false,
				bang: "bp",
			},
			{
				ten: "bo phan da dung",
				purgeable: co(bpLuuTru, daDung.id),
				mong: false,
				thuTuc: "org.purgeDepartment",
				id: daDung.id,
				ma: 400,
				conHang: true,
				bang: "bp",
			},
			{
				ten: "bo phan chua luu tru",
				purgeable: undefined,
				mong: undefined,
				thuTuc: "org.purgeDepartment",
				id: dangDung.id,
				ma: 400,
				conHang: true,
				bang: "bp",
			},
			{
				ten: "khuon chua dung",
				purgeable: co(khLuuTru, khuonChuaDung.id),
				mong: true,
				thuTuc: "purgeTemplate",
				id: khuonChuaDung.id,
				ma: 200,
				conHang: false,
				bang: "kh",
			},
			{
				ten: "khuon da dung",
				purgeable: co(khLuuTru, khuonDung.id),
				mong: false,
				thuTuc: "purgeTemplate",
				id: khuonDung.id,
				ma: 400,
				conHang: true,
				bang: "kh",
			},
		] as const;

		let soCa = 0;
		for (const ca of CA) {
			expect(`${ca.ten}: purgeable ${ca.purgeable}`).toBe(
				`${ca.ten}: purgeable ${ca.mong}`,
			);
			const tra = await goi(ca.thuTuc, { id: ca.id });
			expect(`${ca.ten}: HTTP ${tra.status}`).toBe(`${ca.ten}: HTTP ${ca.ma}`);
			const hang =
				ca.bang === "bp"
					? await db.department.count({ where: { id: ca.id } })
					: await db.onboardingTemplate.count({ where: { id: ca.id } });
			expect(`${ca.ten}: con hang ${hang === 1}`).toBe(
				`${ca.ten}: con hang ${ca.conHang}`,
			);
			soCa += 1;
		}
		expect(soCa).toBe(5);
	});
});

describe("api-quyen", () => {
	test("api-quyen: thanh vien bi 403 o moi thu tuc cau hinh, van lam viec tren ke hoach", async () => {
		const dX = await taoBoPhan();
		const dY = await taoBoPhan();
		ok(await goi("org.archiveDepartment", { id: dY.id }), "luu tru dY");
		const kX = await taoKhuon([dX.id]);
		const kY = await taoKhuon([dX.id]);
		ok(await goi("archiveTemplate", { id: kY.id }), "luu tru kY");

		const chup = async () =>
			JSON.stringify([
				await db.department.findMany({
					orderBy: { id: "asc" },
					select: { id: true, name: true, position: true, archivedAt: true },
				}),
				await db.onboardingTemplate.findMany({
					orderBy: { id: "asc" },
					select: { id: true, name: true, steps: true, archivedAt: true },
				}),
			]);
		const truoc = await chup();

		const CAU_HINH: ReadonlyArray<[string, DauVao]> = [
			["org.createDepartment", { name: ma("Bo phan"), divisionId: null }],
			["org.renameDepartment", { id: dX.id, name: ma("Doi") }],
			["org.moveDepartment", { id: dX.id, divisionId: null, index: 0 }],
			["org.archiveDepartment", { id: dX.id }],
			["org.restoreDepartment", { id: dY.id }],
			["org.purgeDepartment", { id: dY.id }],
			[
				"createTemplate",
				{
					name: ma("Khuon"),
					partnerType: null,
					steps: [
						{ label: "B", departmentId: dX.id, position: 0, offsetDays: 0 },
					],
				},
			],
			["updateTemplate", { id: kX.id, name: ma("Doi") }],
			["archiveTemplate", { id: kX.id }],
			["restoreTemplate", { id: kY.id }],
			["purgeTemplate", { id: kY.id }],
		];
		let soAssert = 0;
		for (const [thuTuc, dauVao] of CAU_HINH) {
			const tra = await goi(thuTuc, dauVao, "thanhVien");
			expect(`${thuTuc}: HTTP ${tra.status}`).toBe(`${thuTuc}: HTTP 403`);
			soAssert += 1;
		}
		expect(soAssert).toBe(11);
		expect(await chup()).toBe(truoc);

		const quyen = async (ai: keyof typeof cookie) =>
			ok<{ canManage: boolean }>(
				await doc("access", undefined, ai),
				`access ${ai}`,
			).canManage;
		expect(
			`thanh vien ${await quyen("thanhVien")} quan tri ${await quyen("quanTri")} chu ${await quyen("chu")}`,
		).toBe("thanh vien false quan tri true chu true");
		ok(
			await goi(
				"org.createDepartment",
				{ name: ma("Cua chu"), divisionId: null },
				"chu",
			),
			"chu tao bo phan",
		);

		const kh = await taoKeHoach(kX.id, "thanhVien");
		ok(await goi("closePlan", { id: kh.id }, "thanhVien"), "thanh vien dong");
		ok(
			await goi("reopenPlan", { id: kh.id }, "thanhVien"),
			"thanh vien mo lai",
		);
		const caNhan = await db.contact.create({
			data: { firstName: ma("Ca nhan") },
		});
		const gd = ok<{ id: string }>(
			await goi(
				"upsertEnrollment",
				{ planId: kh.id, contactId: caNhan.id, source: "tay" },
				"thanhVien",
			),
			"thanh vien ghi danh",
		);
		ok(
			await goi(
				"markEnrollmentStage",
				{ id: gd.id, stage: "accountAt", at: "2026-09-21" },
				"thanhVien",
			),
			"thanh vien danh dau bac",
		);
	});
});

describe("api-dong-mo", () => {
	test("api-dong-mo: dong roi mo lai ke hoach", async () => {
		const d = await taoBoPhan();
		const khuon = await taoKhuon([d.id]);
		const kh = await taoKeHoach(khuon.id);
		const coTrong = async (status: string) =>
			ok<{ rows: { id: string }[] }>(
				await doc("manDanhMuc", { q: kh.companyName, status }),
				`danh muc ${status}`,
			).rows.some((r) => r.id === kh.id);
		const dongLuc = async () =>
			ok<{ closedAt: string | null }>(
				await doc("planById", { id: kh.id }),
				"planById",
			).closedAt;

		ok(await goi("closePlan", { id: kh.id }), "dong");
		expect(
			`sau dong: ${(await dongLuc()) !== null} ${await coTrong("dang-chay")} ${await coTrong("da-dong")}`,
		).toBe("sau dong: true false true");
		ok(await goi("reopenPlan", { id: kh.id }), "mo lai");
		expect(`sau mo lai: ${await dongLuc()} ${await coTrong("dang-chay")}`).toBe(
			"sau mo lai: null true",
		);
		const vang = await doc("planById", { id: ma("khong-co") });
		expect(`planById vang: HTTP ${vang.status}`).toBe(
			"planById vang: HTTP 404",
		);
	});
});

describe("api-bac", () => {
	test("api-bac: danh dau bac khong ep thu tu va bo danh dau", async () => {
		const d = await taoBoPhan();
		const khuon = await taoKhuon([d.id]);
		const kh = await taoKeHoach(khuon.id);
		const gd = await taoGhiDanh(kh.id);

		ok(
			await goi("markEnrollmentStage", {
				id: gd.id,
				stage: "dealAt",
				at: "2026-09-20",
			}),
			"danh dau",
		);
		const sau = await db.onboardingEnrollment.findUniqueOrThrow({
			where: { id: gd.id },
		});
		expect(
			`${sau.dealAt?.toISOString().slice(0, 10)} ${sau.accountAt} ${sau.courseAt} ${sau.activeAt}`,
		).toBe("2026-09-20 null null null");

		ok(
			await goi("markEnrollmentStage", {
				id: gd.id,
				stage: "dealAt",
				at: null,
			}),
			"bo danh dau",
		);
		const bo = await db.onboardingEnrollment.findUniqueOrThrow({
			where: { id: gd.id },
		});
		expect(`dealAt ${bo.dealAt}`).toBe("dealAt null");
	});
});

describe("api-ngay", () => {
	test("api-ngay: ngay chi nhan chuoi YYYY-MM-DD", async () => {
		const d = await taoBoPhan();
		const khuon = await taoKhuon([d.id]);
		const kh = await taoKeHoach(khuon.id);
		const gd = await taoGhiDanh(kh.id);
		const congTy = await db.company.create({ data: { name: ma("Cong ty") } });

		const SAI: ReadonlyArray<{
			truong: "startedAt" | "at";
			gia: string | number | null | undefined;
		}> = [
			{ truong: "startedAt", gia: undefined },
			{ truong: "startedAt", gia: null },
			{ truong: "startedAt", gia: 1726963200000 },
			{ truong: "startedAt", gia: "21/09/2026" },
			{ truong: "at", gia: undefined },
			{ truong: "at", gia: 1726963200000 },
			{ truong: "at", gia: "21/09/2026" },
		];

		let soO = 0;
		for (const o of SAI) {
			const soKeHoachTruoc = await db.onboardingPlan.count();
			const truocGd = await db.onboardingEnrollment.findUniqueOrThrow({
				where: { id: gd.id },
			});
			const dauVao: DauVao =
				o.truong === "startedAt"
					? {
							companyId: congTy.id,
							templateId: khuon.id,
							ownerId: nguoi.quanTri,
						}
					: { id: gd.id, stage: "courseAt" };
			if (o.gia !== undefined) dauVao[o.truong] = o.gia;
			const tra = await goi(
				o.truong === "startedAt" ? "createFromTemplate" : "markEnrollmentStage",
				dauVao,
			);
			const nhan = `${o.truong}=${JSON.stringify(o.gia)}`;
			expect(`${nhan}: HTTP ${tra.status} ${tra.loi.includes(o.truong)}`).toBe(
				`${nhan}: HTTP 400 true`,
			);
			expect(`${nhan}: so ke hoach ${await db.onboardingPlan.count()}`).toBe(
				`${nhan}: so ke hoach ${soKeHoachTruoc}`,
			);
			const sauGd = await db.onboardingEnrollment.findUniqueOrThrow({
				where: { id: gd.id },
			});
			expect(`${nhan}: courseAt ${sauGd.courseAt}`).toBe(
				`${nhan}: courseAt ${truocGd.courseAt}`,
			);
			soO += 1;
		}
		expect(soO).toBe(7);

		const lanh = ok<{ id: string }>(
			await goi("createFromTemplate", {
				companyId: congTy.id,
				templateId: khuon.id,
				startedAt: "2026-09-21",
				ownerId: nguoi.quanTri,
			}),
			"ngay lanh",
		);
		const moi = await db.onboardingPlan.findUniqueOrThrow({
			where: { id: lanh.id },
		});
		expect(`startedAt ${moi.startedAt.toISOString().slice(0, 10)}`).toBe(
			"startedAt 2026-09-21",
		);
		expect(
			`ke hoach nam 1970: ${await db.onboardingPlan.count({ where: { startedAt: { lt: new Date("1971-01-01") } } })}`,
		).toBe("ke hoach nam 1970: 0");
	});
});

describe("api-trung-pheu", () => {
	test("api-trung-pheu: nguoi da trong pheu tra 409, nguon khong doi", async () => {
		const d = await taoBoPhan();
		const khuon = await taoKhuon([d.id]);
		const kh = await taoKeHoach(khuon.id);
		const x = await db.contact.create({ data: { firstName: ma("Ca nhan") } });
		await db.onboardingEnrollment.create({
			data: { planId: kh.id, contactId: x.id, source: "nen-tang" },
		});

		const tra = await goi("upsertEnrollment", {
			planId: kh.id,
			contactId: x.id,
			source: "tay",
		});
		expect(`HTTP ${tra.status} ${tra.loi}`).toBe(
			"HTTP 409 Người này đã có trong phễu.",
		);
		const hang = await db.onboardingEnrollment.findMany({
			where: { planId: kh.id, contactId: x.id },
		});
		expect(hang.map((h) => h.source)).toEqual(["nen-tang"]);

		const y = await db.contact.create({ data: { firstName: ma("Ca nhan") } });
		ok(
			await goi("upsertEnrollment", {
				planId: kh.id,
				contactId: y.id,
				source: "tay",
			}),
			"doi chung",
		);
		const hangY = await db.onboardingEnrollment.findMany({
			where: { planId: kh.id, contactId: y.id },
		});
		expect(hangY.map((h) => h.source)).toEqual(["tay"]);
	});
});
