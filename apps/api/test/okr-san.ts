import { afterAll, beforeAll, expect } from "bun:test";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import {
	Test,
	type TestingModule,
	type TestingModuleBuilder,
} from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import { AppRouterHost } from "nestjs-trpc";
import request from "supertest";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { createBaseTrpcContext } from "../src/trpc/trpc.context";
import { gieoThanhVien, mintPhien } from "./phien-thu";

export const TIEN_TO = `dok${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
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
export type AiHoacCookie = Ai | (string & {});
type Phien = { nguoi: string; cookie: string; token: string };

let app: INestApplication;
export const ungDung = () => app;
export const phien = {
	quan: { nguoi: "", cookie: "", token: "" },
	thuong: { nguoi: "", cookie: "", token: "" },
	chu: { nguoi: "", cookie: "", token: "" },
	okr: { nguoi: "", cookie: "", token: "" },
} satisfies Record<Ai, Phien>;

const laAi = (ai: string): ai is Ai => ai in phien;
const cookieCua = (ai: AiHoacCookie) => (laAi(ai) ? phien[ai].cookie : ai);

export async function phienCua(userId: string): Promise<string> {
	return (await mintPhien(userId)).cookie;
}

export async function goi(
	thuTuc: string,
	vao: Json,
	ai: AiHoacCookie = "quan",
): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookieCua(ai))
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

export async function goiQuery(
	thuTuc: string,
	ai: AiHoacCookie = "quan",
	vao?: Json,
): Promise<TraLoi> {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/${thuTuc}${q}`)
		.set("cookie", cookieCua(ai));
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

export async function doc<T>(
	thuTuc: string,
	ai: AiHoacCookie = "quan",
	vao?: Json,
): Promise<T> {
	const tra = await goiQuery(thuTuc, ai, vao);
	expect(`${thuTuc}: HTTP ${tra.status}`).toBe(`${thuTuc}: HTTP 200`);
	return tra.data as T;
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

export const bpMoi = (ten: string) =>
	tao("org.createDivision", { name: ma(ten) }, `tao ${ten}`);

export async function truongMoi(
	kind: "division" | "department",
	id: string,
	ten: string,
): Promise<{ nguoi: string; cookie: string }> {
	const nguoi = await nguoiMoi(ten);
	if (kind === "department") ok(await datViTri(nguoi, id), `xep ${ten}`);
	ok(await goi("org.setHead", { kind, id, userId: nguoi }), `truong ${ten}`);
	return { nguoi, cookie: await phienCua(nguoi) };
}

export const CHUONG_TRINH_RONG = {
	objectiveCap: 50,
	krCap: 50,
	capMode: "canh-bao",
	scoreScale: "0-100",
	weightsOn: false,
	personalOn: true,
	duyetCongBo: false,
} as const;

export const taoNam = (ten: string, nam: number) =>
	tao(
		"okr.createCycle",
		{
			kind: "nam",
			name: ma(ten),
			parentId: null,
			startsOn: `${nam}-01-01`,
			endsOn: `${nam}-12-31`,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		},
		`nam ${ten}`,
	);

export const taoQuy = (
	ten: string,
	parentId: string,
	tu: string,
	den: string,
) =>
	tao(
		"okr.createCycle",
		{
			kind: "quy",
			name: ma(ten),
			parentId,
			startsOn: tu,
			endsOn: den,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
		},
		`quy ${ten}`,
	);

export const dangChay = async (id: string) =>
	ok(await goi("okr.setCyclePhase", { id, phase: "dang-chay" }), "dang chay");

export async function kyDangChay(ten: string): Promise<string> {
	const nam = await taoNam(`${ten}-nam`, 2026);
	const quy = await taoQuy(ten, nam, "2026-10-01", "2026-12-31");
	await dangChay(quy);
	return quy;
}

const DON_SAN_MS = 30_000;

export function dungSan(
	sua: (b: TestingModuleBuilder) => TestingModuleBuilder = (b) => b,
	tuy: { rest?: boolean } = {},
): void {
	beforeAll(async () => {
		const { AppModule } = await import("../src/app.module");
		const modul: TestingModule = await sua(
			Test.createTestingModule({ imports: [AppModule] }),
		).compile();
		app = modul.createNestApplication({ bodyParser: false });
		let cau: ((req: Request, res: Response) => Promise<void>) | undefined;
		if (tuy.rest)
			app.use(
				REST_BRIDGE_PATH,
				(req: Request, res: Response, next: NextFunction) => {
					if (!cau) {
						next();
						return;
					}
					void cau(req, res);
				},
			);
		await app.init();
		if (tuy.rest)
			cau = createOpenApiExpressMiddleware({
				router: app.get(AppRouterHost).appRouter,
				createContext: ({ req }) => createBaseTrpcContext(req),
			});
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
		const cuaSan = { cycle: { name: { startsWith: TIEN_TO } } };
		const mucTieu = (
			await db.okrObjective.findMany({ where: cuaSan, select: { id: true } })
		).map((m) => m.id);
		const hoiYSan = { hoiY: cuaSan };
		await db.okrHoiYHieu.deleteMany({ where: hoiYSan });
		await db.okrY.deleteMany({ where: hoiYSan });
		await db.okrChuDe.deleteMany({ where: hoiYSan });
		await db.okrHoiYBanTruoc.deleteMany({ where: hoiYSan });
		await db.okrHoiY.deleteMany({ where: cuaSan });
		await db.okrGhiNhanNhan.deleteMany({
			where: { ghiNhan: { objectiveId: { in: mucTieu } } },
		});
		await db.okrGhiNhan.deleteMany({
			where: { objectiveId: { in: mucTieu } },
		});
		await db.okrMention.deleteMany({
			where: { comment: { objectiveId: { in: mucTieu } } },
		});
		await db.okrComment.deleteMany({
			where: { objectiveId: { in: mucTieu } },
		});
		await db.okrFollow.deleteMany({
			where: { objectiveId: { in: mucTieu } },
		});
		await db.okrCheckIn.deleteMany({
			where: {
				OR: [
					{ keyResult: { objectiveId: { in: mucTieu } } },
					{ session: { userId: { startsWith: TIEN_TO } } },
					{ authorUserId: { startsWith: TIEN_TO } },
				],
			},
		});
		await db.okrCheckInSession.deleteMany({
			where: { userId: { startsWith: TIEN_TO } },
		});
		await db.okrTrail.deleteMany({
			where: {
				OR: [
					{ actorUserId: { startsWith: TIEN_TO } },
					{ objectiveId: { in: mucTieu } },
				],
			},
		});
		await db.okrAlignment.deleteMany({
			where: {
				OR: [
					{ objective: cuaSan },
					{ targetObjective: cuaSan },
					{ targetKeyResult: { objective: cuaSan } },
				],
			},
		});
		await db.okrDoiDich.deleteMany({
			where: { keyResult: { objective: cuaSan } },
		});
		await db.okrDiemKr.deleteMany({ where: cuaSan });
		await db.okrBangChung.deleteMany({
			where: { keyResult: { objective: cuaSan } },
		});
		await db.okrKeyResult.deleteMany({ where: { objective: cuaSan } });
		await db.okrParticipant.deleteMany({ where: { objective: cuaSan } });
		await db.okrObjective.deleteMany({ where: cuaSan });
		await db.okrCycle.deleteMany({
			where: { name: { startsWith: TIEN_TO }, parentId: { not: null } },
		});
		await db.okrCycle.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
		await db.okrProgramConfig.deleteMany({
			where: { createdById: { startsWith: TIEN_TO } },
		});
		await db.orgSecondaryDepartment.deleteMany({
			where: { userId: { startsWith: TIEN_TO } },
		});
		await db.orgPlacement.deleteMany({
			where: { userId: { startsWith: TIEN_TO } },
		});
		await db.onboardingPlan.deleteMany({
			where: { company: { name: { startsWith: TIEN_TO } } },
		});
		const congTyXoa = await db.company.findMany({
			where: { name: { startsWith: TIEN_TO } },
			select: { id: true },
		});
		await db.agentTask.deleteMany({
			where: { companyId: { in: congTyXoa.map((c) => c.id) } },
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
		await db.viec.deleteMany({
			where: {
				OR: [
					{ taoBoiId: { startsWith: TIEN_TO } },
					{ nguoiGiaoId: { startsWith: TIEN_TO } },
					{ nguoiThucHienId: { startsWith: TIEN_TO } },
				],
			},
		});
		await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
		await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	}, DON_SAN_MS);
}
