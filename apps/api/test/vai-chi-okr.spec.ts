import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { auth, KHONG_TRONG_PHAM_VI, NOT_A_MEMBER } from "@crm/auth";
import { db } from "@crm/db";
import { readContextDevKey, writeContextDevKey } from "@crm/db/settings";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { ContextLogger } from "../src/logging/context-logger";
import { AuthMiddleware } from "../src/trpc/middlewares/auth.middleware";
import { PhamViChungMiddleware } from "../src/trpc/middlewares/pham-vi-du-lieu.middleware";
import { WorkspaceService } from "../src/workspace/workspace.service";
import {
	type DauVaoHopLe,
	dangNhap,
	datMatKhau,
	gan,
	goiTrpc,
	maTranRest,
	maTranTrpc,
	soThuTuc,
} from "./ma-tran-thu";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "vai-chi-okr";
const id = (phan: string) => `${suffix}-${phan}`;
const THU_MUC_APP = join(import.meta.dir, "..", "..", "app");

const ALIAS_CHO_PHEP = [
	"users",
	"settings",
	"currency",
	"zalo",
	"apiKeys",
	"sso",
	"workspace",
	"org",
] as const;
const NGOAI_LE = ["workspace.get", "sso.signInOptions"] as const;
const SAN_THU_TUC = 50;
const SAN_DUONG_REST = 30;
const SAN_MUTATION_CHUNG = 15;
const SAN_DUONG_NGOAI = 20;
const SO_MUTATION_KHONG_DAU_VAO = 13;
const THU_TUC_MAU = [
	{ ten: "contacts.list", input: {} },
	{ ten: "companies.list", input: {} },
	{ ten: "deals.list", input: {} },
	{ ten: "activities.myTasks", input: {} },
	{ ten: "search.quick", input: { q: "a" } },
	{ ten: "campaigns.list", input: undefined },
] as const;

const DAU_VAO_HOP_LE = {
	"apiKeys.create": { name: "thu", expiresInDays: null },
	"apiKeys.revoke": { id: "khong-co" },
	"zalo.taoMa": {},
	"zalo.go": {},
	"zalo.guiThu": {},
	"zalo.luuUuTien": { channel: "ZALO" },
	"zalo.luuBot": { token: "thu" },
	"settings.setAgentModel": { modelId: null },
	"settings.setResearchKey": { apiKey: "ctx_thu_khong_that_du_dai_1234567890" },
	"settings.setArchiveRetention": { days: 30 },
	"currency.setReportingCurrency": { currency: "USD" },
	"currency.setManualRate": { currency: "USD", rate: 1 },
	"currency.removeManualRate": { currency: "USD" },
	"currency.refreshRates": {},
	"sso.register": {
		providerId: "thu",
		issuer: "https://thu.test",
		domain: "thu.test",
		clientId: "a",
		clientSecret: "b",
	},
	"sso.remove": { providerId: "thu" },
	"workspace.update": { name: "CRM", website: "https://thu.test" },
	"workspace.setMemberRole": { memberId: "khong-co", role: "member" },
	"workspace.allowEmail": { email: "moi@thu.test", role: "member" },
	"workspace.issuePasswordLink": { email: "moi@thu.test" },
	"workspace.revokeAllowance": { allowanceId: "khong-co" },
	"workspace.removeMember": { memberId: "khong-co" },
	"org.createDivision": { name: "Bo phan thu" },
	"org.renameDivision": { id: "khong-co", name: "x" },
	"org.reorderDivisions": { ids: ["khong-co"] },
	"org.archiveDivision": { id: "khong-co" },
	"org.restoreDivision": { id: "khong-co" },
	"org.purgeDivision": { id: "khong-co" },
	"org.createDepartment": { name: "Phong thu", divisionId: null },
	"org.renameDepartment": { id: "khong-co", name: "x" },
	"org.moveDepartment": { id: "khong-co", divisionId: null, index: 0 },
	"org.setHead": { kind: "division", id: "khong-co", userId: null },
	"org.setPlacement": {
		userId: "khong-co",
		primaryDepartmentId: null,
		secondaryDepartmentIds: [],
		managerUserId: null,
	},
	"org.previewImport": { text: "" },
	"org.applyImport": { text: "" },
} satisfies Record<string, DauVaoHopLe>;
const dauVaoCua = (ten: string): DauVaoHopLe | undefined =>
	ten in DAU_VAO_HOP_LE
		? DAU_VAO_HOP_LE[ten as keyof typeof DAU_VAO_HOP_LE]
		: undefined;
const dongNhatKy = z.object({
	path: z.string(),
	outcome: z.string(),
	role: z.string().nullable(),
	phamVi: z.string().nullable(),
});
type DongNhatKy = z.infer<typeof dongNhatKy>;

const TU_PHUC_VU = [
	"apiKeys.create",
	"apiKeys.revoke",
	"zalo.taoMa",
	"zalo.go",
	"zalo.luuUuTien",
	"zalo.guiThu",
];
const KHAI_2XX = [
	"GET /",
	"GET /-yaml",
	"GET //LICENSE",
	"GET //index.html",
	"GET /swagger-ui-init.js",
	"GET /openapi.json",
	"GET /health",
	"GET /auth/me",
	"GET /auth/session",
	"GET /api/t/config/:siteId",
	"POST /api/t/e",
	"GET /api/auth/ok",
	"GET /api/auth/error",
	"GET /api/auth/get-session",
	"GET /api/auth/list-sessions",
	"GET /api/auth/list-accounts",
	"POST /api/auth/sign-out",
	"GET /api/auth/api-key/list",
	"GET /api/auth/sso/providers",
	"GET /api/auth/organization/list",
	"GET /api/auth/organization/get-full-organization",
	"GET /api/auth/organization/get-active-member",
	"GET /api/auth/organization/get-active-member-role",
	"GET /api/auth/organization/list-members",
	"GET /api/auth/organization/list-invitations",
	"GET /api/auth/organization/list-user-invitations",
];

type Vai = "owner" | "admin" | "member" | "okr";
type Dau = Record<string, string>;

let app: NestExpressApplication;
let workspace: WorkspaceService;

function choPhep(): string[] {
	return soThuTuc(app)
		.filter(
			(t) =>
				(ALIAS_CHO_PHEP as readonly string[]).includes(
					t.ten.split(".")[0] ?? "",
				) || (NGOAI_LE as readonly string[]).includes(t.ten),
		)
		.map((t) => t.ten)
		.sort();
}

function choPhepRest(): string[] {
	const ten = new Set(choPhep());
	return soThuTuc(app)
		.flatMap((t) => (ten.has(t.ten) && t.restKey ? [t.restKey] : []))
		.sort();
}

const biChanPhamVi = (h: { status: number; message: string }) =>
	h.status === 403 && h.message === KHONG_TRONG_PHAM_VI;

async function gieoNguoi(phan: string, vai: Vai) {
	const userId = id(phan);
	await gieoThanhVien(userId, vai);
	return { userId, email: await datMatKhau(userId) };
}

async function memberId(userId: string): Promise<string> {
	const row = await db.member.findFirstOrThrow({
		where: { organizationId: WORKSPACE_ID, userId },
		select: { id: true },
	});
	return row.id;
}

async function vaiCua(userId: string): Promise<string> {
	const row = await db.member.findFirstOrThrow({
		where: { organizationId: WORKSPACE_ID, userId },
		select: { role: true },
	});
	return row.role;
}

async function vaiVanLa(dau: Dau, vai: Vai) {
	const res = await goiTrpc(app, "workspace.get", "query", undefined, dau);
	expect(res.status, "workspace.get sau ma tran").toBe(200);
	expect(res.body.result.data.viewerRole, "tu cach doi giua ma tran").toBe(vai);
}

async function don() {
	const users = { startsWith: `${suffix}-` };
	await db.apikey.deleteMany({ where: { referenceId: users } });
	await db.session.deleteMany({ where: { userId: users } });
	await db.account.deleteMany({ where: { userId: users } });
	await db.member.deleteMany({ where: { userId: users } });
	await db.invitation.deleteMany({ where: { email: { contains: suffix } } });
	await db.user.deleteMany({ where: { id: users } });
}

async function locationQuaProxy(
	cookie: string,
	apiUrl: string,
	duong: string,
): Promise<string | null> {
	const kichBan = [
		`const { NextRequest } = await import("next/server");`,
		`const { proxy } = await import(${JSON.stringify(join(THU_MUC_APP, "proxy.ts"))});`,
		`const res = await proxy(new NextRequest("http://localhost:3000" + process.env.DUONG_THU, { headers: { cookie: process.env.COOKIE_THU } }));`,
		`console.log(JSON.stringify({ location: res.headers.get("location") }));`,
	].join("\n");
	const con = Bun.spawn(["bun", "-e", kichBan], {
		cwd: THU_MUC_APP,
		env: {
			...process.env,
			NEXT_PUBLIC_API_URL: apiUrl,
			COOKIE_THU: cookie,
			DUONG_THU: duong,
		},
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, loi, ma] = await Promise.all([
		new Response(con.stdout).text(),
		new Response(con.stderr).text(),
		con.exited,
	]);
	expect(ma, `tien trinh proxy loi: ${loi}`).toBe(0);
	const dong = ra.trim().split("\n").at(-1) ?? "{}";
	return (JSON.parse(dong) as { location: string | null }).location;
}

const duongCua = (location: string | null) =>
	location === null ? null : new URL(location).pathname;

beforeAll(async () => {
	app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
	workspace = new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);
});

afterAll(async () => {
	await don();
	await app.close();
});

describe("vai-chi-okr", () => {
	beforeEach(don);

	test("ma-tran-trpc: okr goi duoc dung tap khai, moi thu tuc doi tac bi tu choi ve pham vi", async () => {
		const { email } = await gieoNguoi("okr", "okr");
		const cookie = await dangNhap(email);
		const tatCa = soThuTuc(app);
		expect(tatCa.length, "so router rong hoac qua it").toBeGreaterThanOrEqual(
			SAN_THU_TUC,
		);
		const khongDauVao = tatCa
			.filter((t) => t.loai === "mutation" && !t.coDauVao)
			.map((t) => t.ten);
		expect(
			khongDauVao,
			`mutation khong dau vao: ${khongDauVao.join(", ")}`,
		).toHaveLength(SO_MUTATION_KHONG_DAU_VAO);
		const hang = await maTranTrpc(app, { cookie });
		expect(hang.length).toBe(tatCa.length);
		const khongChan = hang
			.filter((h) => !biChanPhamVi(h))
			.map((h) => h.ten)
			.sort();
		expect(khongChan, "tap cho phep lech tap khai").toEqual(choPhep());
		for (const h of hang.filter((x) =>
			/^(contacts|companies|deals|campaigns|onboarding)\./.test(x.ten),
		)) {
			expect(biChanPhamVi(h), `${h.ten} ${h.status} ${h.message}`).toBe(true);
		}
		expect(
			hang.some((h) => h.message === NOT_A_MEMBER),
			"okr bi coi la nguoi ngoai",
		).toBe(false);
		await vaiVanLa({ cookie }, "okr");
	});

	test("ma-tran-khoa-rest: khoa API cua okr va cau REST di dung ranh nhu phien", async () => {
		const { email } = await gieoNguoi("okr", "okr");
		const cookie = await dangNhap(email);
		const tao = await goiTrpc(
			app,
			"apiKeys.create",
			"mutation",
			{ name: "thu", expiresInDays: null },
			{ cookie },
		);
		expect(tao.status, JSON.stringify(tao.body)).toBe(200);
		const key = tao.body.result.data.key as string;
		expect(key.length).toBeGreaterThan(10);
		const dau = { "x-api-key": key };
		const hang = await maTranTrpc(app, dau);
		expect(
			hang
				.filter((h) => !biChanPhamVi(h))
				.map((h) => h.ten)
				.sort(),
			"tap cho phep qua khoa lech tap khai",
		).toEqual(choPhep());
		const rest = await maTranRest(app, dau);
		expect(rest.length).toBeGreaterThanOrEqual(SAN_DUONG_REST);
		expect(
			rest.filter((h) => h.status === 404).map((h) => h.ten),
			"duong khai ma cau khong gan",
		).toEqual([]);
		expect(
			rest
				.filter((h) => !biChanPhamVi(h))
				.map((h) => h.ten)
				.sort(),
			"tap cho phep qua REST lech tap khai",
		).toEqual(choPhepRest());
		await vaiVanLa(dau, "okr");
	});

	test("doi-chung: member va admin khong bao gio nhan thong diep pham vi", async () => {
		for (const vai of ["member", "admin"] as const) {
			const { email } = await gieoNguoi(vai, vai);
			const cookie = await dangNhap(email);
			for (const { ten, input } of THU_TUC_MAU) {
				const res = await goiTrpc(app, ten, "query", input, { cookie });
				expect(res.status, `${vai} ${ten} phai tra 200`).toBe(200);
			}
			const hang = await maTranTrpc(app, { cookie });
			expect(
				hang.filter(biChanPhamVi).map((h) => h.ten),
				`${vai} bi chan oan ve pham vi`,
			).toEqual([]);
			await vaiVanLa({ cookie }, vai);
		}
	});

	test("khong-khai-nhom: lop nen tran chan okr, cho member qua; lop chung cho okr qua", async () => {
		const okr = await gieoNguoi("okr", "okr");
		const member = await gieoNguoi("member", "member");
		const goi = async (lop: AuthMiddleware, userId: string) => {
			let next = 0;
			const user = { id: userId, email: `${userId}@thu.test`, name: userId };
			try {
				await lop.use({
					ctx: { session: { user } },
					path: "router-moi.list",
					type: "query",
					input: undefined,
					getRawInput: async () => undefined,
					meta: undefined,
					signal: undefined,
					next: async () => {
						next += 1;
						return { ok: true, data: null, marker: "middlewareMarker" };
					},
				} as never);
				return { next, loi: null as string | null };
			} catch (e) {
				return { next, loi: (e as Error).message };
			}
		};
		expect(await goi(app.get(AuthMiddleware), okr.userId)).toEqual({
			next: 0,
			loi: KHONG_TRONG_PHAM_VI,
		});
		expect(await goi(app.get(AuthMiddleware), member.userId)).toEqual({
			next: 1,
			loi: null,
		});
		expect(await goi(app.get(PhamViChungMiddleware), okr.userId)).toEqual({
			next: 1,
			loi: null,
		});
	});

	test("doi-vai-hieu-luc-ngay: cookie cu cua member bi chan ngay sau khi doi sang okr", async () => {
		const { userId, email } = await gieoNguoi("doi", "member");
		const cookie = await dangNhap(email);
		const truoc = await goiTrpc(app, "contacts.list", "query", {}, { cookie });
		expect(truoc.status).toBe(200);
		await db.member.updateMany({ where: { userId }, data: { role: "okr" } });
		const sau = await goiTrpc(app, "contacts.list", "query", {}, { cookie });
		expect({ status: sau.status, message: sau.body?.error?.message }).toEqual({
			status: 403,
			message: KHONG_TRONG_PHAM_VI,
		});
	});

	test("nhat-ky: dong tRPC mang vai va pham vi, ke ca khi bi tu choi", async () => {
		const okr = await gieoNguoi("okr", "okr");
		const member = await gieoNguoi("member", "member");
		const cookieOkr = await dangNhap(okr.email);
		const cookieMember = await dangNhap(member.email);
		const dong: DongNhatKy[] = [];
		const spy = spyOn(ContextLogger.prototype, "log").mockImplementation(
			(message) => {
				const doc = dongNhatKy.safeParse(message);
				if (doc.success) dong.push(doc.data);
			},
		);
		try {
			await goiTrpc(app, "contacts.list", "query", {}, { cookie: cookieOkr });
			await goiTrpc(app, "users.me", "query", undefined, {
				cookie: cookieMember,
			});
		} finally {
			spy.mockRestore();
		}
		const cua = (path: string) => dong.find((d) => d.path === path);
		expect(cua("contacts.list"), JSON.stringify(dong)).toMatchObject({
			outcome: "err",
			role: "okr",
			phamVi: "doi-tac",
		});
		expect(cua("users.me"), JSON.stringify(dong)).toMatchObject({
			outcome: "ok",
			role: "member",
			phamVi: "chung",
		});
		expect(
			dong.filter(
				(d) => d.role === "okr" && d.phamVi === "doi-tac" && d.outcome === "ok",
			),
			"okr doc duoc doi tac ma nhat ky ghi ok",
		).toEqual([]);
		const loDong: DongNhatKy[] = [];
		const spyLo = spyOn(ContextLogger.prototype, "log").mockImplementation(
			(message) => {
				const doc = dongNhatKy.safeParse(message);
				if (doc.success) loDong.push(doc.data);
			},
		);
		try {
			const lo = await gan(
				request(app.getHttpServer()).get(
					`/api/trpc/workspace.get,zalo.cuaToi,contacts.list?batch=1&input=${encodeURIComponent(JSON.stringify({ 2: {} }))}`,
				),
				{ cookie: cookieOkr },
			);
			expect([200, 207], JSON.stringify(lo.body).slice(0, 300)).toContain(
				lo.status,
			);
		} finally {
			spyLo.mockRestore();
		}
		const cuaLo = (path: string) => loDong.find((d) => d.path === path);
		expect(cuaLo("contacts.list"), JSON.stringify(loDong)).toMatchObject({
			outcome: "err",
			role: "okr",
			phamVi: "doi-tac",
		});
		expect(cuaLo("zalo.cuaToi"), JSON.stringify(loDong)).toMatchObject({
			outcome: "ok",
			role: "okr",
			phamVi: "chung",
		});
		expect(cuaLo("workspace.get"), JSON.stringify(loDong)).toMatchObject({
			outcome: "ok",
			role: "okr",
			phamVi: "chung",
		});
		expect(
			loDong.filter(
				(d) => d.role === "okr" && d.phamVi === "doi-tac" && d.outcome === "ok",
			),
			"trong mot lo, dong cua thu tuc chung bi nhiem pham vi doi tac",
		).toEqual([]);
	});

	test("ghi-chung: okr chi ghi duoc thu cua minh; cau hinh he thong doi quan tri", async () => {
		const okr = await gieoNguoi("okr", "okr");
		const member = await gieoNguoi("member", "member");
		const admin = await gieoNguoi("admin", "admin");
		const cookieOkr = await dangNhap(okr.email);
		const mutation = soThuTuc(app).filter(
			(t) =>
				t.loai === "mutation" &&
				[
					"users",
					"settings",
					"currency",
					"zalo",
					"apiKeys",
					"sso",
					"workspace",
					"org",
				].includes(t.ten.split(".")[0] ?? ""),
		);
		expect(mutation.length).toBeGreaterThanOrEqual(SAN_MUTATION_CHUNG);
		const thieu = mutation
			.filter((t) => dauVaoCua(t.ten) === undefined)
			.map((t) => t.ten);
		expect(thieu, `thieu dau vao hop le cho: ${thieu.join(", ")}`).toEqual([]);
		const khongBiChan: string[] = [];
		const saiThongDiep: string[] = [];
		for (const { ten } of mutation) {
			const res = await goiTrpc(app, ten, "mutation", dauVaoCua(ten), {
				cookie: cookieOkr,
			});
			const message = String(res.body?.error?.message ?? "");
			if (res.status !== 403) {
				khongBiChan.push(`${ten} ${res.status} ${message}`);
				continue;
			}
			if (message === KHONG_TRONG_PHAM_VI || message === NOT_A_MEMBER) {
				saiThongDiep.push(`${ten} ${message}`);
			}
		}
		expect(
			khongBiChan.map((h) => h.split(" ")[0]).sort(),
			`tap khong bi chan: ${khongBiChan.join(" | ")}`,
		).toEqual([...TU_PHUC_VU].sort());
		expect(saiThongDiep, "403 nham loai").toEqual([]);
		const cookieMember = await dangNhap(member.email);
		for (const ten of [
			"settings.setAgentModel",
			"settings.setResearchKey",
			"settings.setArchiveRetention",
		]) {
			const res = await goiTrpc(app, ten, "mutation", dauVaoCua(ten), {
				cookie: cookieMember,
			});
			expect(res.status, `${ten} cho member`).toBe(403);
		}
		const cookieAdmin = await dangNhap(admin.email);
		const res = await goiTrpc(
			app,
			"settings.setArchiveRetention",
			"mutation",
			{ days: 30 },
			{ cookie: cookieAdmin },
		);
		expect(res.status, JSON.stringify(res.body)).toBe(200);
	});

	test("duong-ngoai-router: tap duong HTTP ngoai tRPC/REST tra 2xx cho okr bang dung tap khai", async () => {
		const { email } = await gieoNguoi("okr", "okr");
		const cookie = await dangNhap(email);
		const express = app.getHttpAdapter().getInstance() as {
			router: {
				stack: Array<{
					route?: { path: string; methods: Record<string, boolean> };
				}>;
			};
		};
		const cuaNest = express.router.stack.flatMap((l) =>
			l.route
				? Object.keys(l.route.methods).map((m) => ({
						method: m.toUpperCase(),
						path: l.route?.path ?? "",
					}))
				: [],
		);
		const cuaAuth = Object.values(
			auth.api as unknown as Record<
				string,
				{ path?: string; options?: { method?: string | string[] } }
			>,
		).flatMap((e) =>
			e.path && e.options?.method
				? [e.options.method]
						.flat()
						.map((m) => ({ method: m, path: `/api/auth${e.path}` }))
				: [],
		);
		const duong = [...cuaNest, ...cuaAuth].filter(
			(d) =>
				d.path.length > 0 &&
				!d.path.startsWith("/api/trpc") &&
				!d.path.startsWith("/rest") &&
				["GET", "POST", "PATCH", "PUT", "DELETE"].includes(d.method),
		);
		expect(
			duong.length,
			`danh sach duong qua ngan: ${duong.map((d) => `${d.method} ${d.path}`).join(", ")}`,
		).toBeGreaterThanOrEqual(SAN_DUONG_NGOAI);
		const hai: string[] = [];
		for (const d of duong) {
			const url = d.path
				.replace(/:[a-zA-Z]+\??/g, "khong-co")
				.replace(/\*.*$/, "");
			const verb = d.method.toLowerCase() as
				| "get"
				| "post"
				| "patch"
				| "put"
				| "delete";
			const res = await gan(
				request(app.getHttpServer())
					[verb](url)
					.set("content-type", "application/json"),
				{ cookie },
			);
			if (res.status < 300) hai.push(`${d.method} ${d.path}`);
		}
		expect(
			[...new Set(hai)].sort(),
			`duong tra 2xx: ${[...new Set(hai)].sort().join(" | ")}`,
		).toEqual([...KHAI_2XX].sort());
	});

	test("gan-vai: admin gan okr qua doi vai va loi moi; member khong gan duoc; chu so huu cuoi khong bi ha", async () => {
		const chu = await gieoNguoi("chu", "owner");
		const admin = await gieoNguoi("admin", "admin");
		const nguoi = await gieoNguoi("nguoi", "member");
		await workspace.setMemberRole(admin.userId, {
			memberId: await memberId(nguoi.userId),
			role: "okr",
		});
		expect(await vaiCua(nguoi.userId)).toBe("okr");
		const emailMoi = `${id("moi")}@thu.test`;
		await workspace.allowEmail(admin.userId, { email: emailMoi, role: "okr" });
		const loiMoi = await db.invitation.findFirstOrThrow({
			where: { email: emailMoi },
			select: { role: true },
		});
		expect(loiMoi.role).toBe("okr");
		const now = new Date();
		await db.user.create({
			data: {
				id: id("moi"),
				name: "moi",
				email: emailMoi,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
		});
		await datMatKhau(id("moi"));
		await dangNhap(emailMoi);
		expect(await vaiCua(id("moi")), "loi moi okr bi ha ve member").toBe("okr");
		await expect(
			workspace.setMemberRole(nguoi.userId, {
				memberId: await memberId(admin.userId),
				role: "okr",
			}),
		).rejects.toThrow(/owner or an admin/);
		await expect(
			workspace.setMemberRole(chu.userId, {
				memberId: await memberId(chu.userId),
				role: "okr",
			}),
		).rejects.toThrow(/needs an owner/);
		expect(await vaiCua(chu.userId)).toBe("owner");
		await workspace.setMemberRole(admin.userId, {
			memberId: await memberId(admin.userId),
			role: "okr",
		});
		const cookieAdmin = await dangNhap(admin.email);
		const danhSach = await goiTrpc(
			app,
			"workspace.members",
			"query",
			{},
			{
				cookie: cookieAdmin,
			},
		);
		expect(danhSach.status).toBe(200);
		await expect(
			workspace.setMemberRole(admin.userId, {
				memberId: await memberId(nguoi.userId),
				role: "member",
			}),
		).rejects.toThrow(/owner or an admin/);
	});

	test("proxy-ngoai-pham-vi: okr bi dua ve trang ngoai pham vi, member khong; proxy van doc tu cach", async () => {
		const okr = await gieoNguoi("okr", "okr");
		const member = await gieoNguoi("member", "member");
		const cookieOkr = await dangNhap(okr.email);
		const cookieMember = await dangNhap(member.email);
		const khoaTruoc = await readContextDevKey(db);
		await writeContextDevKey(db, "lan-do-khong-phai-khoa-that");
		const server = await app.listen(0, "127.0.0.1");
		const { port } = server.address() as AddressInfo;
		const apiUrl = `http://127.0.0.1:${port}`;
		for (const p of [
			"/contacts",
			"/deals",
			"/onboarding",
			"/chat",
			"/settings/members",
		]) {
			expect(duongCua(await locationQuaProxy(cookieOkr, apiUrl, p)), p).toMatch(
				/\/ngoai-pham-vi$/,
			);
		}
		for (const p of ["/", "/settings/notifications"]) {
			expect(
				duongCua(await locationQuaProxy(cookieOkr, apiUrl, p)) ?? "",
				p,
			).not.toContain("ngoai-pham-vi");
		}
		expect(
			duongCua(await locationQuaProxy(cookieOkr, apiUrl, "/settings")),
		).toMatch(/\/settings\/notifications$/);
		expect(
			duongCua(await locationQuaProxy(cookieMember, apiUrl, "/contacts")) ?? "",
		).not.toContain("ngoai-pham-vi");
		const res = await goiTrpc(app, "workspace.get", "query", undefined, {
			cookie: cookieOkr,
		});
		expect(res.status).toBe(200);
		expect(res.body.result.data.viewerRole).toBe("okr");
		await writeContextDevKey(db, khoaTruoc ?? "");
	});
});
