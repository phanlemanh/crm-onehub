import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AnyProcedure } from "@trpc/server";
import { AppRouterHost } from "nestjs-trpc";
import request from "supertest";
import { z } from "zod";
import { createApp } from "../src/create-app";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const T = TO_CHUC.thongDiep;
const TIEN_TO = `mdg${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
let dem = 0;
const ma = (phan: string) =>
	`${TIEN_TO}-${phan}-${Date.now().toString(36)}-${++dem}`;

type Ai = "quan" | "thuong" | "chu";
type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type TraLoi = { status: number; data: unknown; loi: string };
type Phien = { nguoi: string; cookie: string };
type DuongRest = readonly [Verb, string, Json | undefined];
type Verb = "get" | "post" | "patch" | "delete";

const phien = {
	quan: { nguoi: "", cookie: "" },
	thuong: { nguoi: "", cookie: "" },
	chu: { nguoi: "", cookie: "" },
} satisfies Record<Ai, Phien>;
let app: NestExpressApplication;

async function trpc(
	thuTuc: string,
	vao: Json,
	ai: Ai = "quan",
): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", phien[ai].cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function docTrpc(
	thuTuc: string,
	vao?: Json,
	ai: Ai = "quan",
): Promise<TraLoi> {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/${thuTuc}${q}`)
		.set("cookie", phien[ai].cookie);
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

async function rest(
	verb: Verb,
	duong: string,
	vao: Json | undefined,
	ai: Ai = "quan",
): Promise<TraLoi> {
	let req = request(app.getHttpServer())
		[verb](`${REST_BRIDGE_PATH}${duong}`)
		.set("cookie", phien[ai].cookie);
	if (vao !== undefined) {
		req = req.set("content-type", "application/json").send(JSON.stringify(vao));
	}
	const res = await req;
	return {
		status: res.status,
		data: res.body,
		loi: res.status === 200 ? "" : String(res.body?.message ?? ""),
	};
}

function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

const cay = async () => ok<TreeOutput>(await docTrpc("org.tree"), "org.tree");

async function pbMoi(ten: string, divisionId: string | null = null) {
	return ok<{ id: string }>(
		await trpc("org.createDepartment", { name: ma(ten), divisionId }),
		`tao ${ten}`,
	).id;
}

async function bpMoi(ten: string) {
	return ok<{ id: string }>(
		await trpc("org.createDivision", { name: ma(ten) }),
		`tao bp ${ten}`,
	).id;
}

async function nguoiMoi(
	ten: string,
	vai: "member" | "admin" | "owner" = "member",
) {
	const id = ma(ten);
	await gieoThanhVien(id, vai);
	return id;
}

function datChinh(
	userId: string,
	pbId: string | null,
	phu: string[] = [],
): Promise<TraLoi> {
	return trpc("org.setPlacement", {
		userId,
		primaryDepartmentId: pbId,
		secondaryDepartmentIds: phu,
		managerUserId: null,
	});
}

async function roiWorkspace(userId: string) {
	await db.member.deleteMany({ where: { userId } });
}

async function khuonMoi(pbIds: string[]) {
	return ok<{ id: string; name: string }>(
		await trpc("onboarding.createTemplate", {
			name: ma("khuon"),
			partnerType: null,
			steps: pbIds.map((departmentId, position) => ({
				label: `Buoc ${position}`,
				departmentId,
				position,
				offsetDays: position,
			})),
		}),
		"tao khuon",
	);
}

async function luuKhuon(id: string) {
	ok(await trpc("onboarding.archiveTemplate", { id }), "luu khuon");
}

async function keHoachCoBuoc(pbId: string) {
	const cty = await db.company.create({
		data: { name: ma("cty") },
		select: { id: true },
	});
	await db.onboardingPlan.create({
		data: {
			companyId: cty.id,
			startedAt: new Date(),
			targetDays: 30,
			ownerId: phien.quan.nguoi,
			steps: {
				create: [
					{ label: "buoc", departmentId: pbId, dueAt: new Date(), position: 0 },
				],
			},
		},
	});
}

async function luuPb(id: string) {
	ok(await trpc("org.archiveDepartment", { id }), "luu pb");
}

async function conHang(id: string) {
	return (await db.department.findUnique({ where: { id } })) !== null;
}

beforeAll(async () => {
	app = await createApp();
	for (const [khoa, vai] of [
		["quan", "admin"],
		["thuong", "member"],
		["chu", "owner"],
	] as const) {
		const id = ma(khoa);
		await gieoThanhVien(id, vai);
		phien[khoa] = { nguoi: id, cookie: (await mintPhien(id)).cookie };
	}
});

afterAll(async () => {
	await db.orgSecondaryDepartment.deleteMany({
		where: { department: { name: { startsWith: TIEN_TO } } },
	});
	await db.orgPlacement.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.onboardingPlan.deleteMany({
		where: { company: { name: { startsWith: TIEN_TO } } },
	});
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.onboardingTemplate.deleteMany({
		where: { name: { startsWith: TIEN_TO } },
	});
	await db.department.updateMany({
		where: { name: { startsWith: TIEN_TO } },
		data: { headUserId: null, divisionId: null },
	});
	await db.department.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.division.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

type Gieo = () => Promise<{ id: string; khuon: string }>;

const gieoLuuTru = {
	khuonSong: async () => {
		const id = await pbMoi("ls-khuon");
		return { id, khuon: (await khuonMoi([id])).name };
	},
	khuonLuu: async () => {
		const id = await pbMoi("ls-khuon-luu");
		const k = await khuonMoi([id]);
		await luuKhuon(k.id);
		return { id, khuon: k.name };
	},
	haiNguoi: async () => {
		const id = await pbMoi("ls-nguoi");
		for (const n of ["a", "b"]) {
			ok(await datChinh(await nguoiMoi(`ls-${n}`), id), `nguoi ${n}`);
		}
		return { id, khuon: "" };
	},
	chiPhu: async () => {
		const id = await pbMoi("ls-phu");
		ok(await datChinh(await nguoiMoi("ls-phu-n"), null, [id]), "phu");
		return { id, khuon: "" };
	},
	nguoiRoi: async () => {
		const id = await pbMoi("ls-roi");
		const n = await nguoiMoi("ls-roi-n");
		ok(await datChinh(n, id), "nguoi roi");
		await roiWorkspace(n);
		return { id, khuon: "" };
	},
	coBuoc: async () => {
		const id = await pbMoi("ls-buoc");
		await keHoachCoBuoc(id);
		return { id, khuon: "" };
	},
	trong: async () => ({ id: await pbMoi("ls-trong"), khuon: "" }),
} satisfies Record<string, Gieo>;

describe("mdg-luat-luu-tru", () => {
	test("mdg-luat-luu-tru: bay ca luu tru, hai ca tu choi qua ca hai lop", async () => {
		const CA = [
			{
				ten: "1 trong khuon chua luu tru",
				gieo: gieoLuuTru.khuonSong,
				lop: "trpc",
				ma: 400,
				cau: (k: string) => T.phongBanTrongKhuon([k]),
				luu: false,
			},
			{
				ten: "2 chi trong khuon da luu tru",
				gieo: gieoLuuTru.khuonLuu,
				lop: "trpc",
				ma: 200,
				cau: () => "",
				luu: true,
			},
			{
				ten: "3 hai nguoi nhan lam chinh",
				gieo: gieoLuuTru.haiNguoi,
				lop: "trpc",
				ma: 400,
				cau: () => T.phongBanConNguoi(2),
				luu: false,
			},
			{
				ten: "4 chi nguoi phu",
				gieo: gieoLuuTru.chiPhu,
				lop: "trpc",
				ma: 200,
				cau: () => "",
				luu: true,
			},
			{
				ten: "5 chi nguoi da roi",
				gieo: gieoLuuTru.nguoiRoi,
				lop: "rest",
				ma: 200,
				cau: () => "",
				luu: true,
			},
			{
				ten: "6 co buoc ke hoach",
				gieo: gieoLuuTru.coBuoc,
				lop: "rest",
				ma: 200,
				cau: () => "",
				luu: true,
			},
			{
				ten: "7 trong",
				gieo: gieoLuuTru.trong,
				lop: "rest",
				ma: 200,
				cau: () => "",
				luu: true,
			},
			{
				ten: "1 REST trong khuon chua luu tru",
				gieo: gieoLuuTru.khuonSong,
				lop: "rest",
				ma: 400,
				cau: (k: string) => T.phongBanTrongKhuon([k]),
				luu: false,
			},
			{
				ten: "3 REST hai nguoi nhan lam chinh",
				gieo: gieoLuuTru.haiNguoi,
				lop: "rest",
				ma: 400,
				cau: () => T.phongBanConNguoi(2),
				luu: false,
			},
		] as const;
		let soKhangDinh = 0;
		for (const ca of CA) {
			const { id, khuon } = await ca.gieo();
			const tra =
				ca.lop === "trpc"
					? await trpc("org.archiveDepartment", { id })
					: await rest("post", `/org/departments/${id}/archive`, {});
			expect(`${ca.ten}: HTTP ${tra.status}`).toBe(`${ca.ten}: HTTP ${ca.ma}`);
			expect(`${ca.ten}: ${tra.loi}`).toBe(`${ca.ten}: ${ca.cau(khuon)}`);
			const dong = await db.department.findUniqueOrThrow({ where: { id } });
			expect(`${ca.ten}: luu tru ${dong.archivedAt !== null}`).toBe(
				`${ca.ten}: luu tru ${ca.luu}`,
			);
			soKhangDinh += 3;
		}
		expect(soKhangDinh).toBe(27);
	});

	test("mdg-luat-luu-tru: khoi phuc ve dung bo phan va vi tri", async () => {
		const bp = await bpMoi("kp-bp");
		const ids = [
			await pbMoi("kp-a", bp),
			await pbMoi("kp-b", bp),
			await pbMoi("kp-c", bp),
		];
		const giua = ids[1] as string;
		const truoc = await db.department.findUniqueOrThrow({
			where: { id: giua },
			select: { divisionId: true, position: true },
		});
		await luuPb(giua);
		ok(await trpc("org.restoreDepartment", { id: giua }), "khoi phuc");
		const sau = await db.department.findUniqueOrThrow({
			where: { id: giua },
			select: { divisionId: true, position: true },
		});
		expect(`divisionId ${sau.divisionId}`).toBe(
			`divisionId ${truoc.divisionId}`,
		);
		expect(`position ${sau.position}`).toBe(`position ${truoc.position}`);
		const c = await cay();
		expect(
			`trong bo phan ${c.divisions.find((d) => d.id === bp)?.departments.some((d) => d.id === giua)}`,
		).toBe("trong bo phan true");
	});

	test("mdg-luat-luu-tru: luu-lai — luu tru lan hai van 200 va van luu tru", async () => {
		const id = await pbMoi("luu-lai");
		await luuPb(id);
		const lan2 = await trpc("org.archiveDepartment", { id });
		expect(`luu lai: HTTP ${lan2.status}`).toBe("luu lai: HTTP 200");
		const dong = await db.department.findUniqueOrThrow({ where: { id } });
		expect(`luu lai: luu tru ${dong.archivedAt !== null}`).toBe(
			"luu lai: luu tru true",
		);
	});

	test("mdg-luat-luu-tru: khong-co — ma la tra 404 o ca ba thu tuc", async () => {
		const id = ma("khong-co");
		for (const thuTuc of [
			"org.archiveDepartment",
			"org.restoreDepartment",
			"org.purgeDepartment",
		]) {
			const tra = await trpc(thuTuc, { id });
			expect(`${thuTuc}: HTTP ${tra.status} ${tra.loi}`).toBe(
				`${thuTuc}: HTTP 404 ${T.khongCoPhongBan(id)}`,
			);
		}
	});

	test("mdg-luat-luu-tru: khoi-phuc-bo-phan-da-luu — bi chan, phong ban van o muc da luu tru", async () => {
		const bp = await bpMoi("kpl-bp");
		const id = await pbMoi("kpl-pb", bp);
		await luuPb(id);
		ok(await trpc("org.archiveDivision", { id: bp }), "luu bp");
		const tra = ok<{ chan?: { loai: string } }>(
			await trpc("org.restoreDepartment", { id }),
			"khoi phuc pb",
		);
		const c = await cay();
		expect({
			chan: tra.chan?.loai ?? null,
			chuaXep: c.chuaXep.some((d) => d.id === id),
			daLuu: c.archived.departments.some((d) => d.id === id),
		}).toEqual({ chan: "cha-luu-tru", chuaXep: false, daLuu: true });
	});
});

describe("mdg-luat-xoa-han", () => {
	test("mdg-luat-xoa-han: bay ca xoa han, hai ca tu choi qua REST, doi chung cau bo phan", async () => {
		const gieo = {
			chuaLuu: async () => ({ id: await pbMoi("xh-chua"), khuon: "" }),
			conBuoc: async () => {
				const id = await pbMoi("xh-buoc");
				await keHoachCoBuoc(id);
				await luuPb(id);
				return { id, khuon: "" };
			},
			nguoiSong: async () => {
				const id = await pbMoi("xh-nguoi");
				await luuPb(id);
				const n = await nguoiMoi("xh-nguoi-n");
				await db.orgPlacement.upsert({
					where: { userId: n },
					create: { userId: n, primaryDepartmentId: id },
					update: { primaryDepartmentId: id },
				});
				return { id, khuon: "" };
			},
			nguoiRoi: async () => {
				const id = await pbMoi("xh-roi");
				const n = await nguoiMoi("xh-roi-n");
				ok(await datChinh(n, id), "roi");
				await roiWorkspace(n);
				await luuPb(id);
				return { id, khuon: "" };
			},
			khuonLuu: async () => {
				const id = await pbMoi("xh-khuon");
				const k = await khuonMoi([id]);
				await luuKhuon(k.id);
				await luuPb(id);
				return { id, khuon: k.name };
			},
			chiPhu: async () => {
				const id = await pbMoi("xh-phu");
				ok(await datChinh(await nguoiMoi("xh-phu-n"), null, [id]), "phu");
				await luuPb(id);
				return { id, khuon: "" };
			},
			trong: async () => {
				const id = await pbMoi("xh-trong");
				await luuPb(id);
				return { id, khuon: "" };
			},
		} satisfies Record<string, Gieo>;

		const CA = [
			{
				ten: "1 chua luu tru",
				gieo: gieo.chuaLuu,
				lop: "trpc",
				ma: 400,
				cau: () => T.chuaLuuTru,
				con: true,
			},
			{
				ten: "2 con buoc",
				gieo: gieo.conBuoc,
				lop: "trpc",
				ma: 400,
				cau: () => T.phongBanConBuoc,
				con: true,
			},
			{
				ten: "3 con nguoi hieu luc",
				gieo: gieo.nguoiSong,
				lop: "trpc",
				ma: 400,
				cau: () => T.phongBanConNguoiXoa,
				con: true,
			},
			{
				ten: "4 con nguoi da roi",
				gieo: gieo.nguoiRoi,
				lop: "trpc",
				ma: 400,
				cau: () => T.phongBanConNguoiXoa,
				con: true,
			},
			{
				ten: "5 trong khuon da luu tru",
				gieo: gieo.khuonLuu,
				lop: "trpc",
				ma: 400,
				cau: (k: string) => T.phongBanConTrongKhuon([k]),
				con: true,
			},
			{
				ten: "6 chi nguoi phu",
				gieo: gieo.chiPhu,
				lop: "trpc",
				ma: 200,
				cau: () => "",
				con: false,
			},
			{
				ten: "7 trong qua REST",
				gieo: gieo.trong,
				lop: "rest",
				ma: 200,
				cau: () => "",
				con: false,
			},
			{
				ten: "1 REST chua luu tru",
				gieo: gieo.chuaLuu,
				lop: "rest",
				ma: 400,
				cau: () => T.chuaLuuTru,
				con: true,
			},
			{
				ten: "2 REST con buoc",
				gieo: gieo.conBuoc,
				lop: "rest",
				ma: 400,
				cau: () => T.phongBanConBuoc,
				con: true,
			},
		] as const;
		let soKhangDinh = 0;
		let cauMot = "";
		for (const ca of CA) {
			const { id, khuon } = await ca.gieo();
			const tra =
				ca.lop === "trpc"
					? await trpc("org.purgeDepartment", { id })
					: await rest("delete", `/org/departments/${id}`, undefined);
			expect(`${ca.ten}: HTTP ${tra.status}`).toBe(`${ca.ten}: HTTP ${ca.ma}`);
			expect(`${ca.ten}: ${tra.loi}`).toBe(`${ca.ten}: ${ca.cau(khuon)}`);
			expect(`${ca.ten}: con hang ${await conHang(id)}`).toBe(
				`${ca.ten}: con hang ${ca.con}`,
			);
			soKhangDinh += 3;
			if (ca.ten === "1 chua luu tru") cauMot = tra.loi;
			if (ca.ten === "6 chi nguoi phu") {
				const phu = await db.orgSecondaryDepartment.count({
					where: { departmentId: id },
				});
				expect(`${ca.ten}: dong phu ${phu}`).toBe(`${ca.ten}: dong phu 0`);
				soKhangDinh += 1;
			}
		}
		const bp = await bpMoi("xh-bp-chua");
		const bpTra = await trpc("org.purgeDivision", { id: bp });
		expect(`doi chung cau bo phan: ${bpTra.loi}`).toBe(
			`doi chung cau bo phan: ${cauMot}`,
		);
		soKhangDinh += 1;
		const KY_VONG = 7 * 3 + 1 + 2 * 3 + 1;
		expect(soKhangDinh).toBe(KY_VONG);
	});

	test("mdg-luat-xoa-han: con buoc va trong khuon — cau con buoc thang", async () => {
		const id = await pbMoi("xh-hai-ve");
		await keHoachCoBuoc(id);
		await luuKhuon((await khuonMoi([id])).id);
		await luuPb(id);
		const tra = await trpc("org.purgeDepartment", { id });
		expect(`hai ve: HTTP ${tra.status} ${tra.loi}`).toBe(
			`hai ve: HTTP 400 ${T.phongBanConBuoc}`,
		);
	});
});

describe("mdg-xoa-duoc-mot-noi", () => {
	test("mdg-xoa-duoc-mot-noi: org.tree, onboarding.listDepartments va lenh xoa cung mot cau tra loi", async () => {
		const gieoSauLuu = {
			"con buoc ke hoach": async () => {},
			"nguoi hieu luc nhan lam chinh": async (id) => {
				const n = await nguoiMoi("xd-song");
				await db.orgPlacement.create({
					data: { userId: n, primaryDepartmentId: id },
				});
			},
			"nguoi da roi nhan lam chinh": async (id) => {
				const n = await nguoiMoi("xd-roi");
				await db.orgPlacement.create({
					data: { userId: n, primaryDepartmentId: id },
				});
				await roiWorkspace(n);
			},
			"chi nguoi phu": async (id) => {
				const n = await nguoiMoi("xd-phu");
				await db.orgSecondaryDepartment.create({
					data: { userId: n, departmentId: id },
				});
			},
			"trong khuon chua luu tru": async (id) => {
				await db.onboardingTemplate.create({
					data: {
						name: ma("xd-khuon"),
						steps: [
							{ label: "B", departmentId: id, position: 0, offsetDays: 0 },
						],
					},
				});
			},
			"trong khuon da luu tru": async () => {},
			trong: async () => {},
		} satisfies Record<string, (id: string) => Promise<void>>;

		const CA = [
			{ ten: "con buoc ke hoach", mong: false },
			{ ten: "nguoi hieu luc nhan lam chinh", mong: false },
			{ ten: "nguoi da roi nhan lam chinh", mong: false },
			{ ten: "chi nguoi phu", mong: true },
			{ ten: "trong khuon chua luu tru", mong: false },
			{ ten: "trong khuon da luu tru", mong: false },
			{ ten: "trong", mong: true },
		] as const;
		const pb: Record<string, string> = {};
		for (const ca of CA) {
			const id = await pbMoi("xd");
			if (ca.ten === "con buoc ke hoach") await keHoachCoBuoc(id);
			if (ca.ten === "trong khuon da luu tru") {
				await luuKhuon((await khuonMoi([id])).id);
			}
			await luuPb(id);
			await (gieoSauLuu[ca.ten] as (id: string) => Promise<void>)(id);
			pb[ca.ten] = id;
		}
		const c = await cay();
		const ds = ok<{ id: string; purgeable: boolean }[]>(
			await docTrpc("onboarding.listDepartments", { archived: true }),
			"listDepartments",
		);
		let soKhangDinh = 0;
		for (const ca of CA) {
			const id = pb[ca.ten] as string;
			const A = c.archived.departments.find((d) => d.id === id)?.purgeable;
			const B = ds.find((d) => d.id === id)?.purgeable;
			expect(`${ca.ten}: org.tree ${A}, listDepartments ${B}`).toBe(
				`${ca.ten}: org.tree ${A}, listDepartments ${A}`,
			);
			const C = (await trpc("org.purgeDepartment", { id })).status === 200;
			expect(`${ca.ten}: org.tree ${A}, xoa ${C}`).toBe(
				`${ca.ten}: org.tree ${A}, xoa ${A}`,
			);
			expect(`${ca.ten}: ${A}`).toBe(`${ca.ten}: ${ca.mong}`);
			soKhangDinh += 3;
		}
		expect(soKhangDinh).toBe(21);

		const song = await pbMoi("xd-song-pb");
		const dang = ok<{ id: string; purgeable: boolean }[]>(
			await docTrpc("onboarding.listDepartments", { archived: false }),
			"listDepartments dang dung",
		).find((d) => d.id === song);
		expect(`chua luu tru purgeable ${dang?.purgeable}`).toBe(
			"chua luu tru purgeable false",
		);
	});
});

describe("mdg-quyen-ba-thu-tuc", () => {
	test("mdg-quyen-ba-thu-tuc: ba thu tuc x hai lop x ba vai", async () => {
		const THU_TUC = [
			{
				ten: "org.archiveDepartment",
				rest: (id: string): DuongRest => [
					"post",
					`/org/departments/${id}/archive`,
					{},
				],
				gieo: () => pbMoi("q-trong"),
				doc: async (id: string) =>
					`${(await db.department.findUnique({ where: { id } }))?.archivedAt !== null}`,
			},
			{
				ten: "org.restoreDepartment",
				rest: (id: string): DuongRest => [
					"post",
					`/org/departments/${id}/restore`,
					{},
				],
				gieo: async () => {
					const id = await pbMoi("q-luu");
					await luuPb(id);
					return id;
				},
				doc: async (id: string) =>
					`${(await db.department.findUnique({ where: { id } }))?.archivedAt !== null}`,
			},
			{
				ten: "org.purgeDepartment",
				rest: (id: string): DuongRest => [
					"delete",
					`/org/departments/${id}`,
					undefined,
				],
				gieo: async () => {
					const id = await pbMoi("q-xoa");
					await luuPb(id);
					return id;
				},
				doc: async (id: string) => `${await conHang(id)}`,
			},
		] as const;
		let soKhangDinh = 0;
		for (const t of THU_TUC) {
			for (const lop of ["trpc", "rest"] as const) {
				for (const ai of ["thuong", "quan", "chu"] as const) {
					const id = await t.gieo();
					const truoc = await t.doc(id);
					const [verb, duong, vao] = t.rest(id);
					const tra =
						lop === "trpc"
							? await trpc(t.ten, { id }, ai)
							: await rest(verb, duong, vao, ai);
					const mong = ai === "thuong" ? 403 : 200;
					expect(`${t.ten} ${lop} ${ai}: HTTP ${tra.status}`).toBe(
						`${t.ten} ${lop} ${ai}: HTTP ${mong}`,
					);
					soKhangDinh += 1;
					if (ai === "thuong") {
						expect(`${t.ten} ${lop} ${ai}: ${await t.doc(id)}`).toBe(
							`${t.ten} ${lop} ${ai}: ${truoc}`,
						);
						soKhangDinh += 1;
					}
				}
			}
		}
		expect(soKhangDinh).toBe(24);
	});
});

const khaiRest = z
	.object({ openapi: z.object({ method: z.string(), path: z.string() }) })
	.transform((m) => `${m.openapi.method.toUpperCase()} ${m.openapi.path}`);

function thuTucGhi() {
	const { appRouter } = app.get(AppRouterHost);
	const procs = appRouter._def.procedures as Record<string, AnyProcedure>;
	return Object.entries(procs)
		.filter(([, p]) => p._def.type === "mutation")
		.map(([ten, p]) => {
			const r = khaiRest.safeParse(p._def.meta);
			return { ten, rest: r.success ? r.data : null };
		});
}

describe("mdg-go-duong-cu", () => {
	test("mdg-go-duong-cu: sau thu tuc va sau duong REST cu tra 404, moi duong ghi phong ban nam duoi org", async () => {
		const bp = await pbMoi("gc-pb");
		const chup = () =>
			db.department.findMany({
				orderBy: { id: "asc" },
				select: {
					id: true,
					name: true,
					position: true,
					archivedAt: true,
					divisionId: true,
				},
			});
		const truoc = await chup();
		const DUONG_CU = [
			["trpc", "onboarding.createDepartment", { name: ma("gc-moi") }],
			["trpc", "onboarding.updateDepartment", { id: bp, name: ma("gc-ten") }],
			["trpc", "onboarding.reorderDepartments", { ids: [bp] }],
			["trpc", "onboarding.archiveDepartment", { id: bp }],
			["trpc", "onboarding.restoreDepartment", { id: bp }],
			["trpc", "onboarding.purgeDepartment", { id: bp }],
			["post", "/onboarding/departments", { name: ma("gc-moi") }],
			["patch", `/onboarding/departments/${bp}`, { name: ma("gc-ten") }],
			["post", "/onboarding/departments/reorder", { ids: [bp] }],
			["post", `/onboarding/departments/${bp}/archive`, {}],
			["post", `/onboarding/departments/${bp}/restore`, {}],
			["delete", `/onboarding/departments/${bp}`, undefined],
		] as const;
		let soKhangDinh = 0;
		for (const [lop, duong, vao] of DUONG_CU) {
			const tra =
				lop === "trpc"
					? await trpc(duong, vao ?? {})
					: await rest(lop, duong, vao);
			const nhan =
				lop === "trpc" ? duong : `${lop.toUpperCase()} /rest${duong}`;
			expect(`${nhan}: HTTP ${tra.status}`).toBe(`${nhan}: HTTP 404`);
			soKhangDinh += 1;
		}
		expect(await chup()).toEqual(truoc);
		soKhangDinh += 1;

		const ghi = thuTucGhi();
		const tenNgoai = ghi
			.filter((t) => /Department/.test(t.ten) && !t.ten.startsWith("org."))
			.map((t) => t.ten)
			.sort();
		expect(`thu tuc ghi phong ban ngoai org: ${tenNgoai.join(", ")}`).toBe(
			"thu tuc ghi phong ban ngoai org: ",
		);
		const restNgoai = ghi
			.flatMap((t) => (t.rest ? [t.rest] : []))
			.filter(
				(r) =>
					r.includes("/departments") && !r.split(" ")[1]?.startsWith("/org/"),
			)
			.sort();
		expect(`duong REST ghi phong ban ngoai org: ${restNgoai.join(", ")}`).toBe(
			"duong REST ghi phong ban ngoai org: ",
		);
		const cuaOrg = ghi.filter((t) => /^org\.\w*Department$/.test(t.ten));
		expect(cuaOrg.map((t) => t.ten).sort()).toEqual(
			[
				"org.archiveDepartment",
				"org.createDepartment",
				"org.moveDepartment",
				"org.purgeDepartment",
				"org.renameDepartment",
				"org.restoreDepartment",
			].sort(),
		);
		expect(cuaOrg.map((t) => t.rest).sort()).toEqual(
			[
				"POST /org/departments",
				"PATCH /org/departments/{id}",
				"POST /org/departments/{id}/move",
				"POST /org/departments/{id}/archive",
				"POST /org/departments/{id}/restore",
				"DELETE /org/departments/{id}",
			].sort(),
		);
		soKhangDinh += 4;

		const dsTrpc = ok<{ id: string }[]>(
			await docTrpc("onboarding.listDepartments"),
			"doc tRPC",
		);
		expect(
			`tRPC listDepartments co pb: ${dsTrpc.some((d) => d.id === bp)}`,
		).toBe("tRPC listDepartments co pb: true");
		const dsRest = await rest("get", "/onboarding/departments", undefined);
		expect(
			`REST GET /onboarding/departments: HTTP ${dsRest.status} co pb ${(dsRest.data as { id: string }[]).some?.((d) => d.id === bp)}`,
		).toBe("REST GET /onboarding/departments: HTTP 200 co pb true");
		soKhangDinh += 2;
		expect(soKhangDinh).toBe(19);
	});
});
