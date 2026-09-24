import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ttc${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
let dem = 0;
function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

type TraLoi = { status: number; data: unknown; loi: string };
type Ai = "quan" | "thuong" | "chu";
type Phien = { nguoi: string; cookie: string; token: string };

let app: INestApplication;
const phien: Record<Ai, Phien> = {
	quan: { nguoi: "", cookie: "", token: "" },
	thuong: { nguoi: "", cookie: "", token: "" },
	chu: { nguoi: "", cookie: "", token: "" },
};

async function goi(
	thuTuc: string,
	vao: unknown,
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

async function doc<T>(thuTuc: string, ai: Ai = "quan"): Promise<T> {
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/${thuTuc}`)
		.set("cookie", phien[ai].cookie);
	expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
	return res.body.result.data as T;
}

function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

const cay = () => doc<TreeOutput>("org.tree");

async function tao(
	thuTuc: string,
	vao: unknown,
	nhan: string,
): Promise<string> {
	return ok<{ id: string }>(await goi(thuTuc, vao), nhan).id;
}

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
	for (const [khoa, vai] of [
		["quan", "admin"],
		["thuong", "member"],
		["chu", "owner"],
	] as const) {
		const id = ma(khoa);
		await gieoThanhVien(id, vai);
		const moi = await mintPhien(id);
		phien[khoa] = { nguoi: id, cookie: moi.cookie, token: moi.token };
	}
});

afterAll(async () => {
	await app.close();
	await db.orgSecondaryDepartment.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.orgPlacement.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
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
});

describe("du-lieu-cu", () => {
	test("du-lieu-cu: phong ban khong divisionId nam o chuaXep theo position, da luu tru chi o archived", async () => {
		const ids: string[] = [];
		for (const ten of ["D", "A", "C", "B"]) {
			ids.push(
				await tao(
					"onboarding.createDepartment",
					{ name: ma(ten) },
					`tao ${ten}`,
				),
			);
		}
		const luu = await tao(
			"onboarding.createDepartment",
			{ name: ma("luu") },
			"tao luu",
		);
		ok(await goi("onboarding.archiveDepartment", { id: luu }), "luu tru");

		const c1 = await cay();
		const thuTu = c1.chuaXep.map((d) => d.id).filter((id) => ids.includes(id));
		expect(`chuaXep: ${thuTu.length} phong ban`).toBe("chuaXep: 4 phong ban");
		expect(thuTu).toEqual(ids);
		expect(
			`luu tru trong chuaXep ${c1.chuaXep.some((d) => d.id === luu)}`,
		).toBe("luu tru trong chuaXep false");
		expect(
			`luu tru trong archived ${c1.archived.departments.some((d) => d.id === luu)}`,
		).toBe("luu tru trong archived true");

		const bp = await tao(
			"org.createDivision",
			{ name: ma("bp") },
			"tao bo phan",
		);
		ok(
			await goi("org.moveDepartment", { id: ids[0], divisionId: bp, index: 0 }),
			"chuyen",
		);
		const c2 = await cay();
		expect(
			c2.chuaXep.map((d) => d.id).filter((id) => ids.includes(id)).length,
		).toBe(3);
	});
});

type Buoc = {
	boPhan: { id: string; name: string; phongBan: string[] }[];
	chuaXep: string[];
};

function chieu(c: TreeOutput, bpIds: string[], pbIds: string[]): Buoc {
	return {
		boPhan: c.divisions
			.filter((b) => bpIds.includes(b.id))
			.map((b) => ({
				id: b.id,
				name: b.name,
				phongBan: b.departments
					.map((d) => d.id)
					.filter((id) => pbIds.includes(id)),
			})),
		chuaXep: c.chuaXep.map((d) => d.id).filter((id) => pbIds.includes(id)),
	};
}

describe("vong-doi-don-vi", () => {
	test("vong-doi-don-vi: tao, doi ten, sap, them, chuyen — cay khop tung buoc; ten sai bi tu choi", async () => {
		const tenA = ma("A");
		const tenB = ma("B");
		const a = await tao("org.createDivision", { name: tenA }, "tao A");
		const b = await tao("org.createDivision", { name: tenB }, "tao B");
		const bp = [a, b];
		const ky: Buoc = {
			boPhan: [
				{ id: a, name: tenA, phongBan: [] },
				{ id: b, name: tenB, phongBan: [] },
			],
			chuaXep: [],
		};
		const pb: string[] = [];
		const soVoi = async (nhan: string) => {
			expect({ nhan, ...chieu(await cay(), bp, pb) }).toEqual({ nhan, ...ky });
		};
		await soVoi("sau khi tao");

		const tenA2 = ma("A2");
		ok(await goi("org.renameDivision", { id: a, name: tenA2 }), "doi ten A");
		ky.boPhan[0] = { id: a, name: tenA2, phongBan: [] };
		await soVoi("sau khi doi ten");

		ok(await goi("org.reorderDivisions", { ids: [b, a] }), "sap");
		ky.boPhan.reverse();
		await soVoi("sau khi sap");

		const tenP1 = ma("P1");
		for (const ten of [tenP1, ma("P2"), ma("P3")]) {
			pb.push(
				await tao("org.createDepartment", { name: ten, divisionId: a }, ten),
			);
		}
		ky.boPhan[1] = { id: a, name: tenA2, phongBan: [...pb] };
		await soVoi("sau khi them phong ban");

		ok(
			await goi("org.moveDepartment", { id: pb[1], divisionId: b, index: 0 }),
			"chuyen P2",
		);
		ky.boPhan[0] = { id: b, name: tenB, phongBan: [pb[1] as string] };
		ky.boPhan[1] = {
			id: a,
			name: tenA2,
			phongBan: [pb[0] as string, pb[2] as string],
		};
		await soVoi("sau khi chuyen P2");

		ok(
			await goi("org.moveDepartment", {
				id: pb[2],
				divisionId: null,
				index: 0,
			}),
			"ve chua xep",
		);
		ky.boPhan[1] = { id: a, name: tenA2, phongBan: [pb[0] as string] };
		ky.chuaXep = [pb[2] as string];
		await soVoi("sau khi ve chua xep");

		const TU_CHOI: [string, unknown, string][] = [
			["org.createDivision", { name: "   " }, "Tên không được để trống."],
			["org.createDivision", { name: "x".repeat(81) }, "Tên dài quá 80 ký tự."],
			[
				"org.createDivision",
				{ name: tenB.toUpperCase() },
				`Đã có «${tenB.toUpperCase()}» ở cấp này.`,
			],
			[
				"org.createDepartment",
				{ name: "   ", divisionId: null },
				"Tên không được để trống.",
			],
			[
				"org.createDepartment",
				{ name: "x".repeat(81), divisionId: null },
				"Tên dài quá 80 ký tự.",
			],
			[
				"org.createDepartment",
				{ name: tenP1.toUpperCase(), divisionId: null },
				`Đã có «${tenP1.toUpperCase()}» ở cấp này.`,
			],
		];
		for (const [thuTuc, vao, cau] of TU_CHOI) {
			const truoc = chieu(await cay(), bp, pb);
			const r = await goi(thuTuc, vao);
			expect(`${thuTuc}: HTTP ${r.status} ${r.loi}`).toBe(
				`${thuTuc}: HTTP 400 ${cau}`,
			);
			expect(chieu(await cay(), bp, pb)).toEqual(truoc);
		}

		const dai = `${TIEN_TO}-`.padEnd(80, "z");
		const daiId = await tao(
			"org.createDivision",
			{ name: dai },
			"ten 80 ky tu",
		);
		ok(await goi("org.archiveDivision", { id: daiId }), "luu tru ten dai");
		ok(await goi("onboarding.archiveDepartment", { id: pb[0] }), "luu tru P1");
		await tao(
			"org.createDepartment",
			{ name: tenP1, divisionId: null },
			"tao lai ten da luu tru",
		);
	});
});

describe("do-phu", () => {
	test("do-phu: phong ban moi khong truong lam tang dem chua co truong dung so", async () => {
		const truoc = (await cay()).coverage.departmentsWithoutHead;
		await tao(
			"org.createDepartment",
			{ name: ma("khong-truong-1"), divisionId: null },
			"pb 1",
		);
		await tao(
			"org.createDepartment",
			{ name: ma("khong-truong-2"), divisionId: null },
			"pb 2",
		);
		const sau = (await cay()).coverage.departmentsWithoutHead;
		expect(`chua co truong tang ${sau - truoc}`).toBe("chua co truong tang 2");
	});
});
