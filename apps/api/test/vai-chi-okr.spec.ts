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
import {
	chamKrInput,
	dongRaInput,
	ghiDieuHocDuocInput,
	mangSangInput,
	moLaiKyInput,
	moRaInput,
	xuatKyInput,
} from "@crm/validation/okr-khep";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { ContextLogger } from "../src/logging/context-logger";
import { OKR } from "../src/okr/okr-config";
import { bangChamInput } from "../src/okr/okr-khep.contracts";
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
	"okr",
	"taiLieu",
	"taiLieuNguon",
] as const;
const NGOAI_LE = ["workspace.get", "sso.signInOptions"] as const;
const SAN_THU_TUC = 50;
const SAN_DUONG_REST = 30;
const SAN_MUTATION_CHUNG = 15;
const SAN_DUONG_NGOAI = 20;
const SO_MUTATION_KHONG_DAU_VAO = 13;
const CHO_MA_TRAN_MS = 60_000;
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
	"org.archiveDepartment": { id: "khong-co" },
	"org.restoreDepartment": { id: "khong-co" },
	"org.purgeDepartment": { id: "khong-co" },
	"org.createDepartment": { name: "Phong thu", divisionId: null },
	"org.renameDepartment": { id: "khong-co", name: "x" },
	"org.moveDepartment": { id: "khong-co", divisionId: null, index: 0 },
	"org.attachDepartments": {
		divisionId: "khong-co",
		departmentIds: ["khong-co"],
	},
	"org.addPeople": { departmentId: "khong-co", userIds: ["khong-co"] },
	"org.setHead": { kind: "division", id: "khong-co", userId: null },
	"org.setPlacement": {
		userId: "khong-co",
		primaryDepartmentId: null,
		secondaryDepartmentIds: [],
		managerUserId: null,
	},
	"org.previewImport": { text: "" },
	"org.applyImport": { text: "" },
	"okr.datNguonKr": { keyResultId: "khong-co", loai: "api" },
	"okr.ghiSoKr": { id: "khong-co", giaTri: 1 },
	"okr.moRa": {
		cycleId: "khong-co",
		tuNgay: "2026-11-16",
		denNgay: "2026-11-22",
	},
	"okr.dongRa": { id: "khong-co" },
	"okr.bangCham": { cycleId: "khong-co" },
	"okr.chamKr": { keyResultId: "khong-co", diem: 0.5 },
	"okr.ghiDieuHocDuoc": {
		objectiveId: "khong-co",
		noiDung: "Khách mới đến từ giới thiệu",
	},
	"okr.moLaiKy": { id: "khong-co", lyDo: "Chấm nhầm một KR cần sửa" },
	"okr.mangSang": { objectiveId: "khong-co" },
	"okr.xuatKy": { cycleId: "khong-co" },
} satisfies Record<string, DauVaoHopLe>;
const dauVaoCua = (ten: string): DauVaoHopLe | undefined =>
	ten in DAU_VAO_HOP_LE
		? DAU_VAO_HOP_LE[ten as keyof typeof DAU_VAO_HOP_LE]
		: undefined;
const THU_TUC_KHEP = {
	"okr.moRa": moRaInput,
	"okr.dongRa": dongRaInput,
	"okr.bangCham": bangChamInput,
	"okr.chamKr": chamKrInput,
	"okr.ghiDieuHocDuoc": ghiDieuHocDuocInput,
	"okr.moLaiKy": moLaiKyInput,
	"okr.mangSang": mangSangInput,
	"okr.xuatKy": xuatKyInput,
} as const;
const KHOA_DOI_TAC = ["contactId", "companyId", "dealId"] as const;

const giaTriJson = z.json();
const doiTuongJson = z.record(z.string(), giaTriJson);
type GiaTriJson = z.infer<typeof giaTriJson>;

function khoaCua(v: GiaTriJson, duong: string): string[] {
	if (Array.isArray(v))
		return v.flatMap((x, i) => khoaCua(x, `${duong}[${i}]`));
	const doc = doiTuongJson.safeParse(v);
	if (!doc.success) return [];
	return Object.entries(doc.data).flatMap(([k, x]) => [
		`${duong}.${k}`,
		...khoaCua(x, `${duong}.${k}`),
	]);
}

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

const khongGanCau = (h: { status: number; message: string }) =>
	h.status === 404 && h.message === "Not found";

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

	test(
		"ma-tran-trpc: okr goi duoc dung tap khai, moi thu tuc doi tac bi tu choi ve pham vi",
		async () => {
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
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ma-tran-khoa-rest: khoa API cua okr va cau REST di dung ranh nhu phien",
		async () => {
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
				rest.filter(khongGanCau).map((h) => h.ten),
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
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"doi-chung: member va admin khong bao gio nhan thong diep pham vi",
		async () => {
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
		},
		CHO_MA_TRAN_MS,
	);

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

	test(
		"nhat-ky: dong tRPC mang vai va pham vi, ke ca khi bi tu choi",
		async () => {
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
					(d) =>
						d.role === "okr" && d.phamVi === "doi-tac" && d.outcome === "ok",
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
					(d) =>
						d.role === "okr" && d.phamVi === "doi-tac" && d.outcome === "ok",
				),
				"trong mot lo, dong cua thu tuc chung bi nhiem pham vi doi tac",
			).toEqual([]);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ghi-chung: okr chi ghi duoc thu cua minh; cau hinh he thong doi quan tri",
		async () => {
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
			expect(thieu, `thieu dau vao hop le cho: ${thieu.join(", ")}`).toEqual(
				[],
			);
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
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"duong-ngoai-router: tap duong HTTP ngoai tRPC/REST tra 2xx cho okr bang dung tap khai",
		async () => {
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
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"gan-vai: admin gan okr qua doi vai va loi moi; member khong gan duoc; chu so huu cuoi khong bi ha",
		async () => {
			const chu = await gieoNguoi("chu", "owner");
			const admin = await gieoNguoi("admin", "admin");
			const nguoi = await gieoNguoi("nguoi", "member");
			await workspace.setMemberRole(admin.userId, {
				memberId: await memberId(nguoi.userId),
				role: "okr",
			});
			expect(await vaiCua(nguoi.userId)).toBe("okr");
			const emailMoi = `${id("moi")}@thu.test`;
			await workspace.allowEmail(admin.userId, {
				email: emailMoi,
				role: "okr",
			});
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
			expect(await vaiCua(id("moi")), "loi moi okr bi ha ve member").toBe(
				"okr",
			);
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
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"proxy-ngoai-pham-vi: okr bi dua ve trang ngoai pham vi, member khong; proxy van doc tu cach",
		async () => {
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
				expect(
					duongCua(await locationQuaProxy(cookieOkr, apiUrl, p)),
					p,
				).toMatch(/\/ngoai-pham-vi$/);
			}
			for (const p of ["/", "/settings/notifications"]) {
				expect(
					duongCua(await locationQuaProxy(cookieOkr, apiUrl, p)) ?? "",
					p,
				).not.toContain("ngoai-pham-vi");
			}
			expect(
				duongCua(await locationQuaProxy(cookieOkr, apiUrl, "/settings")),
			).toMatch(/\/settings\/api-keys$/);
			expect(
				duongCua(await locationQuaProxy(cookieMember, apiUrl, "/contacts")) ??
					"",
			).not.toContain("ngoai-pham-vi");
			const res = await goiTrpc(app, "workspace.get", "query", undefined, {
				cookie: cookieOkr,
			});
			expect(res.status).toBe(200);
			expect(res.body.result.data.viewerRole).toBe("okr");
			await writeContextDevKey(db, khoaTruoc ?? "");
		},
		CHO_MA_TRAN_MS,
	);

	describe("pham-vi-so", () => {
		test(
			"bon vai goi nam thu tuc so tren KR cua minh; rieng banGhiChiSo chan vai okr dung cau ghim",
			async () => {
				const VAI_SO = ["owner", "admin", "member", "okr"] as const;
				const nguoi = {} as Record<
					(typeof VAI_SO)[number],
					{ userId: string; cookie: string }
				>;
				for (const vai of VAI_SO) {
					const { userId, email } = await gieoNguoi(`so-${vai}`, vai);
					nguoi[vai] = { userId, cookie: await dangNhap(email) };
				}
				const cycle = await db.okrCycle.create({
					data: {
						kind: "quy",
						name: id("ky-pham-vi-so"),
						startsOn: new Date("2000-01-01T00:00:00Z"),
						endsOn: new Date("2100-01-01T00:00:00Z"),
						phase: "dang-chay",
					},
				});
				const mucTieuId: string[] = [];
				const krCua = {} as Record<(typeof VAI_SO)[number], string>;
				try {
					for (const vai of VAI_SO) {
						const { userId } = nguoi[vai];
						const mt = await db.okrObjective.create({
							data: {
								cycleId: cycle.id,
								level: "ca-nhan",
								personUserId: userId,
								ownerUserId: userId,
								kind: "cam-ket",
								status: "nhap",
								title: id(`mt-so-${vai}`),
							},
						});
						mucTieuId.push(mt.id);
						const kr = await db.okrKeyResult.create({
							data: {
								objectiveId: mt.id,
								title: id(`kr-so-${vai}`),
								kind: "tang-toi",
								ownerUserId: userId,
								startValue: 0,
								targetValue: 100,
								currentValue: 0,
								source: "tay",
							},
						});
						krCua[vai] = kr.id;
					}
					for (const vai of VAI_SO) {
						const { cookie } = nguoi[vai];
						const keyResultId = krCua[vai];
						const chiSo = await goiTrpc(app, "okr.chiSo", "query", undefined, {
							cookie,
						});
						expect(chiSo.status, `${vai} okr.chiSo`).toBe(200);

						const xemTruocVao = encodeURIComponent(
							JSON.stringify({
								chiSo: "thoa-thuan-chot-duoc",
								phamVi: { kieu: "toan-cong-ty" },
								cycleId: cycle.id,
							}),
						);
						const xemTruoc = await gan(
							request(app.getHttpServer()).get(
								`/api/trpc/okr.xemTruocChiSo?input=${xemTruocVao}`,
							),
							{ cookie },
						);
						expect(xemTruoc.status, `${vai} okr.xemTruocChiSo`).toBe(200);

						const datNguon = await goiTrpc(
							app,
							"okr.datNguonKr",
							"mutation",
							{ keyResultId, loai: "api" },
							{ cookie },
						);
						expect(
							datNguon.status,
							`${vai} okr.datNguonKr ${JSON.stringify(datNguon.body)}`,
						).toBe(200);

						const lichSu = await goiTrpc(
							app,
							"okr.lichSuSo",
							"query",
							{ keyResultId },
							{ cookie },
						);
						expect(lichSu.status, `${vai} okr.lichSuSo`).toBe(200);

						const ghi = await goiTrpc(
							app,
							"okr.ghiSoKr",
							"mutation",
							{ id: keyResultId, giaTri: 5 },
							{ cookie },
						);
						expect(
							ghi.status,
							`${vai} okr.ghiSoKr ${JSON.stringify(ghi.body)}`,
						).toBe(200);

						const banGhi = await goiTrpc(
							app,
							"okr.banGhiChiSo",
							"query",
							{ keyResultId, trang: 1 },
							{ cookie },
						);
						if (vai === "okr") {
							expect(banGhi.status, `${vai} okr.banGhiChiSo`).toBe(403);
							expect(
								banGhi.body?.error?.message,
								`${vai} okr.banGhiChiSo message`,
							).toBe(OKR.thongDiep.so.danhSachDoiTac);
						} else {
							expect(
								banGhi.status,
								`${vai} okr.banGhiChiSo ${JSON.stringify(banGhi.body)}`,
							).toBe(200);
						}
					}
				} finally {
					const krIds = Object.values(krCua);
					await db.okrSoChup.deleteMany({
						where: { keyResultId: { in: krIds } },
					});
					await db.okrNguonKr.deleteMany({
						where: { keyResultId: { in: krIds } },
					});
					await db.okrKeyResult.deleteMany({ where: { id: { in: krIds } } });
					await db.okrObjective.deleteMany({
						where: { id: { in: mucTieuId } },
					});
					await db.okrCycle.deleteMany({ where: { id: cycle.id } });
				}
			},
			CHO_MA_TRAN_MS,
		);
	});
});

describe("pham-vi-khep", () => {
	beforeEach(don);

	test("tam thu tuc khep ky co trong so thu tuc va co dau vao hop le", () => {
		const ten = new Set(soThuTuc(app).map((t) => t.ten));
		expect(
			Object.keys(THU_TUC_KHEP).filter((t) => !ten.has(t)),
			"thu tuc khep ky khong do thay",
		).toEqual([]);
		const hong = Object.entries(THU_TUC_KHEP).flatMap(([t, khuon]) => {
			const vao = dauVaoCua(t);
			if (vao === undefined) return [`${t}: thieu dau vao`];
			const doc = khuon.safeParse(vao);
			return doc.success ? [] : [`${t}: ${doc.error.message}`];
		});
		expect(hong, "dau vao hop le cho thu tuc khep ky").toEqual([]);
	});

	test(
		"vai okr: bangCham, xuatKy doc duoc; chamKr, ghiDieuHocDuoc, mangSang theo quyen ban ghi; moRa, dongRa, moLaiKy 403; khong dau ra nao co khoa doi tac",
		async () => {
			const minh = await gieoNguoi("khep-okr", "okr");
			const khac = await gieoNguoi("khep-khac", "member");
			const cookie = await dangNhap(minh.email);
			const dau = { cookie };
			const ra: { ten: string; body: GiaTriJson }[] = [];
			const goi = async (
				ten: keyof typeof THU_TUC_KHEP,
				loai: "query" | "mutation",
				vao: DauVaoHopLe,
			) => {
				const res = await goiTrpc(app, ten, loai, vao, dau);
				ra.push({ ten, body: giaTriJson.parse(res.body) });
				return {
					status: res.status,
					message: String(res.body?.error?.message ?? ""),
					data: res.body?.result?.data,
				};
			};
			const cu = await db.okrProgramConfig.findFirst({
				orderBy: { version: "desc" },
			});
			const chuongTrinh = await db.okrProgramConfig.create({
				data: {
					version: (cu?.version ?? 0) + 1,
					objectiveCap: 50,
					krCap: 50,
					capMode: "canh-bao",
					scoreScale: "0-1",
					weightsOn: false,
					personalOn: true,
					createdById: minh.userId,
				},
			});
			const ky = await db.okrCycle.create({
				data: {
					kind: "quy",
					name: id("ky-khep"),
					startsOn: new Date("2000-01-01T00:00:00Z"),
					endsOn: new Date("2000-03-31T00:00:00Z"),
					phase: "cham-diem",
				},
			});
			const kyKe = await db.okrCycle.create({
				data: {
					kind: "quy",
					name: id("ky-khep-ke"),
					startsOn: new Date("2000-04-01T00:00:00Z"),
					endsOn: new Date("2000-06-30T00:00:00Z"),
					phase: "lap-ke-hoach",
				},
			});
			const gieo = async (userId: string, phan: string) => {
				const mt = await db.okrObjective.create({
					data: {
						cycleId: ky.id,
						level: "ca-nhan",
						personUserId: userId,
						ownerUserId: userId,
						kind: "cam-ket",
						status: "cong-bo",
						publishedAt: new Date("2000-01-02T00:00:00Z"),
						title: id(`mt-khep-${phan}`),
					},
				});
				const kr = await db.okrKeyResult.create({
					data: {
						objectiveId: mt.id,
						title: id(`kr-khep-${phan}`),
						kind: "tang-toi",
						ownerUserId: userId,
						startValue: 0,
						targetValue: 100,
						currentValue: 50,
						source: "tay",
					},
				});
				await db.okrDiemKr.create({
					data: {
						keyResultId: kr.id,
						cycleId: ky.id,
						soChot: 50,
						diemGoiY: 0.5,
						thang: "0-1",
						trongSoBat: false,
						phienBanChuongTrinh: chuongTrinh.version,
					},
				});
				return { mt: mt.id, kr: kr.id };
			};
			try {
				const cuaMinh = await gieo(minh.userId, "minh");
				const cuaKhac = await gieo(khac.userId, "khac");

				const bang = await goi("okr.bangCham", "query", { cycleId: ky.id });
				expect(bang.status, `bangCham ${bang.message}`).toBe(200);
				expect(
					bang.data.mucTieu.map((m: { id: string }) => m.id).sort(),
				).toEqual([cuaMinh.mt, cuaKhac.mt].sort());

				const ket = {
					chamMinh: await goi("okr.chamKr", "mutation", {
						keyResultId: cuaMinh.kr,
						diem: 0.5,
					}),
					chamKhac: await goi("okr.chamKr", "mutation", {
						keyResultId: cuaKhac.kr,
						diem: 0.5,
					}),
					hocMinh: await goi("okr.ghiDieuHocDuoc", "mutation", {
						objectiveId: cuaMinh.mt,
						noiDung: "Khách mới đến từ giới thiệu",
					}),
					hocKhac: await goi("okr.ghiDieuHocDuoc", "mutation", {
						objectiveId: cuaKhac.mt,
						noiDung: "Khách mới đến từ giới thiệu",
					}),
					mangMinh: await goi("okr.mangSang", "mutation", {
						objectiveId: cuaMinh.mt,
					}),
					mangKhac: await goi("okr.mangSang", "mutation", {
						objectiveId: cuaKhac.mt,
					}),
					moRa: await goi("okr.moRa", "mutation", {
						cycleId: ky.id,
						tuNgay: "2000-02-01",
						denNgay: "2000-02-07",
					}),
					dongRa: await goi("okr.dongRa", "mutation", {
						...DAU_VAO_HOP_LE["okr.dongRa"],
					}),
					moLaiKy: await goi("okr.moLaiKy", "mutation", {
						...DAU_VAO_HOP_LE["okr.moLaiKy"],
						id: ky.id,
					}),
				};
				expect(
					Object.fromEntries(
						Object.entries(ket).map(([k, v]) => [
							k,
							`${v.status} ${v.status === 200 ? "" : v.message}`.trim(),
						]),
					),
				).toEqual({
					chamMinh: "200",
					chamKhac: `403 ${OKR.thongDiep.khongSuaDuocKr}`,
					hocMinh: "200",
					hocKhac: `403 ${OKR.thongDiep.khongSuaDuocDonVi}`,
					mangMinh: "200",
					mangKhac: `403 ${OKR.thongDiep.khongSuaDuocDonVi}`,
					moRa: `403 ${OKR.thongDiep.canQuyenQuanTri}`,
					dongRa: `403 ${OKR.thongDiep.canQuyenQuanTri}`,
					moLaiKy: `403 ${OKR.thongDiep.canQuyenQuanTri}`,
				});
				expect(ket.mangMinh.data.cycleId).toBe(kyKe.id);

				await db.okrCycle.update({
					where: { id: ky.id },
					data: { phase: "da-dong" },
				});
				const bangDong = await goi("okr.bangCham", "query", {
					cycleId: ky.id,
				});
				const xuat = await goi("okr.xuatKy", "query", { cycleId: ky.id });
				expect({
					bangDong: bangDong.status,
					xuat: xuat.status,
					coMucTieu: String(xuat.data?.noiDung ?? "").includes(
						id("mt-khep-minh"),
					),
				}).toEqual({ bangDong: 200, xuat: 200, coMucTieu: true });

				const lo = ra.flatMap(({ ten, body }) =>
					khoaCua(body, ten).filter((k) =>
						KHOA_DOI_TAC.some((d) => k.endsWith(`.${d}`)),
					),
				);
				expect(lo, `khoa doi tac trong dau ra: ${lo.join(", ")}`).toEqual([]);
			} finally {
				const kyIds = [ky.id, kyKe.id];
				const mts = { cycleId: { in: kyIds } };
				await db.okrMangSang.deleteMany({ where: { sangCycleId: kyKe.id } });
				await db.okrNhinLai.deleteMany({ where: { objective: mts } });
				await db.okrDiemKr.deleteMany({ where: { cycleId: ky.id } });
				await db.okrKeyResult.deleteMany({ where: { objective: mts } });
				await db.okrParticipant.deleteMany({ where: { objective: mts } });
				await db.okrObjective.deleteMany({ where: mts });
				await db.okrTrail.deleteMany({ where: { cycleId: { in: kyIds } } });
				await db.okrCycle.deleteMany({ where: { id: { in: kyIds } } });
				await db.okrProgramConfig.deleteMany({
					where: { id: chuongTrinh.id },
				});
			}
		},
		CHO_MA_TRAN_MS,
	);
});
