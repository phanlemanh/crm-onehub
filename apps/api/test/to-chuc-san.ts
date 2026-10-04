import { afterAll, beforeAll, expect } from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { gieoThanhVien, mintPhien } from "./phien-thu";

export const TIEN_TO = `ttc${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
let dem = 0;
export function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

export type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };

export type TraLoi = { status: number; data: Json; loi: string };
export type Ai = "quan" | "thuong" | "chu" | "okr";
type Phien = { nguoi: string; cookie: string; token: string };

let app: INestApplication;
export const phien = {
	quan: { nguoi: "", cookie: "", token: "" },
	thuong: { nguoi: "", cookie: "", token: "" },
	chu: { nguoi: "", cookie: "", token: "" },
	okr: { nguoi: "", cookie: "", token: "" },
} satisfies Record<Ai, Phien>;

export async function goi(
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

export async function doc<T>(
	thuTuc: string,
	ai: Ai = "quan",
	vao?: Json,
): Promise<T> {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/${thuTuc}${q}`)
		.set("cookie", phien[ai].cookie);
	expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
	return res.body.result.data as T;
}

export function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

export const cay = () => doc<TreeOutput>("org.tree");

export async function tao(
	thuTuc: string,
	vao: Json,
	nhan: string,
): Promise<string> {
	return ok<{ id: string }>(await goi(thuTuc, vao), nhan).id;
}

export async function nguoiMoi(
	ten: string,
	vai: WorkspaceRole = "member",
): Promise<string> {
	const id = ma(ten);
	await gieoThanhVien(id, vai);
	return id;
}

export async function datViTri(
	userId: string,
	primaryDepartmentId: string | null,
	secondaryDepartmentIds: string[] = [],
	managerUserId: string | null = null,
): Promise<TraLoi> {
	return goi("org.setPlacement", {
		userId,
		primaryDepartmentId,
		secondaryDepartmentIds,
		managerUserId,
	});
}

export const pbMoi = (ten: string, divisionId: string | null = null) =>
	tao("org.createDepartment", { name: ma(ten), divisionId }, `tao ${ten}`);

export function dungSan(): void {
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
			["okr", "okr"],
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
		await db.onboardingPlan.deleteMany({
			where: { company: { name: { startsWith: TIEN_TO } } },
		});
		await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
		await db.department.updateMany({
			where: { name: { startsWith: TIEN_TO } },
			data: { headUserId: null, divisionId: null },
		});
		await db.department.deleteMany({
			where: { name: { startsWith: TIEN_TO } },
		});
		await db.division.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
		await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	});
}
