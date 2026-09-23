import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { API_KEY_HEADER, auth, NOT_A_MEMBER } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AnyProcedure } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { AppRouterHost } from "nestjs-trpc";
import request from "supertest";
import { z } from "zod";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "go-la-cat-quyen";
const MAT_KHAU = "mat-khau-thu-du-dai-1";
const NGOAI_LE = ["sso.signInOptions", "workspace.get"] as const;
const SAN_THU_TUC = 50;
const SAN_DUONG_REST = 30;
const THU_MUC_APP = join(import.meta.dir, "..", "..", "app");

const THU_TUC_MAU = [
	{ ten: "contacts.list", input: {} },
	{ ten: "companies.list", input: {} },
	{ ten: "deals.list", input: {} },
	{ ten: "activities.myTasks", input: {} },
	{ ten: "search.quick", input: { q: "a" } },
	{ ten: "campaigns.list", input: undefined },
] as const;

type Loai = "query" | "mutation";
type ThuTuc = { ten: string; loai: Loai; restKey: string | null };
type HangMaTran = { ten: string; status: number; message: string };
type Dau = Record<string, string>;
type DauVao = Record<string, string> | undefined;

const khaiRest = z
	.object({ openapi: z.object({ method: z.string(), path: z.string() }) })
	.transform((m) => m.openapi);

function thuTucDangChay() {
	const { appRouter } = app.get(AppRouterHost);
	const procs = appRouter._def.procedures as Record<string, AnyProcedure>;
	return Object.entries(procs).map(([ten, p]) => {
		const rest = khaiRest.safeParse(p._def.meta);
		return {
			ten,
			type: p._def.type,
			rest: rest.success ? rest.data : null,
		};
	});
}

let app: NestExpressApplication;
let workspace: WorkspaceService;

const id = (phan: string) => `${suffix}-${phan}`;

function soThuTuc(): ThuTuc[] {
	return thuTucDangChay()
		.flatMap(({ ten, type, rest }) =>
			type === "query" || type === "mutation"
				? [
						{
							ten,
							loai: type,
							restKey: rest
								? `${rest.method.toUpperCase()} ${REST_BRIDGE_PATH}${rest.path}`
								: null,
						},
					]
				: [],
		)
		.sort((a, b) => a.ten.localeCompare(b.ten));
}

function gan(req: request.Test, dau: Dau): request.Test {
	let r = req;
	for (const [k, v] of Object.entries(dau)) r = r.set(k, v);
	return r;
}

async function goiTrpc(
	ten: string,
	loai: Loai,
	input: DauVao,
	dau: Dau,
): Promise<request.Response> {
	const server = app.getHttpServer();
	if (loai === "query") {
		const duong =
			input === undefined
				? `/api/trpc/${ten}`
				: `/api/trpc/${ten}?input=${encodeURIComponent(JSON.stringify(input))}`;
		return gan(request(server).get(duong), dau);
	}
	return gan(
		request(server)
			.post(`/api/trpc/${ten}`)
			.set("content-type", "application/json")
			.send(JSON.stringify(input ?? {})),
		dau,
	);
}

async function maTranTrpc(dau: Dau): Promise<HangMaTran[]> {
	const hang: HangMaTran[] = [];
	for (const { ten, loai } of soThuTuc()) {
		const res = await goiTrpc(ten, loai, undefined, dau);
		hang.push({
			ten,
			status: res.status,
			message: String(res.body?.error?.message ?? ""),
		});
	}
	return hang;
}

function duongRest(): Array<{ path: string; method: string }> {
	return thuTucDangChay()
		.flatMap(({ rest }) => (rest ? [rest] : []))
		.map((o) => ({
			path: `${REST_BRIDGE_PATH}${o.path}`,
			method: o.method.toLowerCase(),
		}))
		.sort((a, b) =>
			`${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`),
		);
}

async function maTranRest(dau: Dau): Promise<HangMaTran[]> {
	const hang: HangMaTran[] = [];
	const server = app.getHttpServer();
	for (const { path, method } of duongRest()) {
		const url = path.replace(/\{[^}]+\}/g, "khong-co");
		const verb = method as "get" | "post" | "patch" | "put" | "delete";
		let req = request(server)[verb](url);
		if (verb !== "get" && verb !== "delete") {
			req = req.set("content-type", "application/json").send("{}");
		}
		const res = await gan(req, dau);
		hang.push({
			ten: `${method.toUpperCase()} ${path}`,
			status: res.status,
			message: String(res.body?.message ?? ""),
		});
	}
	return hang;
}

function biChanVeTuCach(h: HangMaTran): boolean {
	return h.status === 403 && h.message === NOT_A_MEMBER;
}

function ngoaiLeRest(): string[] {
	const ten = new Set<string>(NGOAI_LE);
	return soThuTuc().flatMap((t) =>
		ten.has(t.ten) && t.restKey ? [t.restKey] : [],
	);
}

function hangLot(hang: HangMaTran[], ngoaiLe: (h: HangMaTran) => boolean) {
	return hang
		.filter((h) => !ngoaiLe(h) && !biChanVeTuCach(h))
		.map((h) => `${h.ten} ${h.status} ${h.message}`);
}

const laNgoaiLeTrpc = (h: HangMaTran) =>
	(NGOAI_LE as readonly string[]).includes(h.ten);

function laNgoaiLeRest(h: HangMaTran): boolean {
	return ngoaiLeRest().includes(h.ten);
}

async function datMatKhau(userId: string): Promise<string> {
	const now = new Date();
	await db.account.upsert({
		where: { id: `acc-${userId}` },
		create: {
			id: `acc-${userId}`,
			accountId: userId,
			providerId: "credential",
			userId,
			password: await hashPassword(MAT_KHAU),
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});
	return `${userId}@thu.test`;
}

async function dangNhap(email: string): Promise<string> {
	const { headers } = await auth.api.signInEmail({
		body: { email, password: MAT_KHAU },
		returnHeaders: true,
	});
	return headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
}

async function memberId(userId: string): Promise<string> {
	const row = await db.member.findFirstOrThrow({
		where: { organizationId: WORKSPACE_ID, userId },
		select: { id: true },
	});
	return row.id;
}

async function taoKhoa(userId: string, name: string) {
	return auth.api.createApiKey({ body: { name, userId } });
}

async function khoaBat(keyId: string): Promise<boolean | null> {
	const row = await db.apikey.findUniqueOrThrow({
		where: { id: keyId },
		select: { enabled: true },
	});
	return row.enabled;
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

async function locationQuaProxy(cookie: string, apiUrl: string) {
	const kichBan = [
		`const { NextRequest } = await import("next/server");`,
		`const { proxy } = await import(${JSON.stringify(join(THU_MUC_APP, "proxy.ts"))});`,
		`const res = await proxy(new NextRequest("http://localhost:3000/contacts", { headers: { cookie: process.env.COOKIE_THU } }));`,
		`console.log(JSON.stringify({ location: res.headers.get("location") }));`,
	].join("\n");
	const con = Bun.spawn(["bun", "-e", kichBan], {
		cwd: THU_MUC_APP,
		env: { ...process.env, NEXT_PUBLIC_API_URL: apiUrl, COOKIE_THU: cookie },
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

beforeAll(async () => {
	app = await createApp();
	workspace = new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);
});

afterAll(async () => {
	await don();
	await app.close();
});

describe("go-la-cat-quyen", () => {
	let chu: string;
	let bi: string;
	let emailBi: string;

	beforeEach(async () => {
		await don();
		chu = id("chu");
		bi = id("bi");
		await gieoThanhVien(chu, "owner");
		await gieoThanhVien(bi, "member");
		emailBi = await datMatKhau(bi);
	});

	const go = async () =>
		workspace.removeMember(chu, { memberId: await memberId(bi) });

	test("ma-tran-dang-nhap-lai: bi go roi dang nhap lai thi moi thu tuc ngoai ngoai le tu choi ve tu cach", async () => {
		await go();
		const cookie = await dangNhap(emailBi);
		const tatCa = soThuTuc();
		expect(
			tatCa.length,
			"so router rong hoac qua it — ma tran se xanh cam",
		).toBeGreaterThanOrEqual(SAN_THU_TUC);
		const hang = await maTranTrpc({ cookie });
		expect(hang.length).toBe(tatCa.length);
		expect(
			hangLot(hang, laNgoaiLeTrpc),
			"thu tuc khong tu choi nguoi da bi go ve tu cach",
		).toEqual([]);
	});

	test("ngoai-le-dung-tap-khai: tap thu tuc khong chan nguoi bi go bang dung tap khai", async () => {
		await go();
		const cookie = await dangNhap(emailBi);
		const hang = await maTranTrpc({ cookie });
		const khongChan = hang
			.filter((h) => !biChanVeTuCach(h))
			.map((h) => h.ten)
			.sort();
		expect(khongChan, "tap ngoai le lech tap khai").toEqual([...NGOAI_LE]);
		const res = await goiTrpc("workspace.get", "query", undefined, { cookie });
		expect(res.status, "workspace.get phai tra 200 cho proxy").toBe(200);
		expect(res.body.result.data.viewerRole).toBe(null);
	});

	test("doi-chung-thanh-vien: thanh vien khong bao gio nhan thong diep tu cach", async () => {
		const cookie = await dangNhap(emailBi);
		const hang = await maTranTrpc({ cookie });
		expect(
			hang.filter(biChanVeTuCach).map((h) => h.ten),
			"thanh vien bi chan oan ve tu cach",
		).toEqual([]);
		for (const { ten, input } of THU_TUC_MAU) {
			const res = await goiTrpc(ten, "query", input, { cookie });
			expect(res.status, `${ten} phai tra 200 cho thanh vien`).toBe(200);
		}
	});

	test("tab-dang-mo: cookie bo dem phien mat quyen ngay khi bi go", async () => {
		const cookie = await dangNhap(emailBi);
		expect(
			cookie,
			"phep do dang hoi thieu cookie bo dem phien — dung loi cua phep do cu",
		).toContain("session_data");
		expect(
			(await goiTrpc("contacts.list", "query", {}, { cookie })).status,
			"doi chung: tab con doc duoc truoc luot go",
		).toBe(200);
		await go();
		const hang = await maTranTrpc({ cookie });
		expect(
			hangLot(hang, laNgoaiLeTrpc),
			"tab dang mo cua nguoi da bi go van qua duoc",
		).toEqual([]);
	});

	test("khoa-con-bat: khoa con bat cua nguoi khong con trong kho bi tu choi qua tRPC va REST", async () => {
		const khoa = await taoKhoa(bi, "khoa-con-bat");
		const dau = { [API_KEY_HEADER]: khoa.key };
		expect(
			(await goiTrpc("contacts.list", "query", {}, dau)).status,
			"doi chung tRPC: khoa doc duoc khi con la thanh vien",
		).toBe(200);
		const restTruoc = await request(app.getHttpServer())
			.post(`${REST_BRIDGE_PATH}/contacts/search`)
			.set(API_KEY_HEADER, khoa.key)
			.set("content-type", "application/json")
			.send("{}");
		expect(restTruoc.status, "doi chung REST: khoa doc duoc").toBe(200);
		await db.member.delete({ where: { id: await memberId(bi) } });
		expect(
			await khoaBat(khoa.id),
			"khoa phai con bat de 403 khong den tu tang khoa",
		).toBe(true);
		expect(
			hangLot(await maTranTrpc(dau), laNgoaiLeTrpc),
			"tRPC: khoa con bat cua nguoi ngoai van qua duoc",
		).toEqual([]);
		const rest = await maTranRest(dau);
		expect(rest.length, "ma tran REST rong hoac qua it").toBeGreaterThanOrEqual(
			SAN_DUONG_REST,
		);
		expect(
			hangLot(rest, laNgoaiLeRest),
			"REST: khoa con bat cua nguoi ngoai van qua duoc",
		).toEqual([]);
	});

	test("go-tat-khoa: luot go tat moi khoa cua nguoi bi go, khong cham khoa nguoi khac", async () => {
		const [b1, b2] = [await taoKhoa(bi, "b1"), await taoKhoa(bi, "b2")];
		const [c1, c2] = [await taoKhoa(chu, "c1"), await taoKhoa(chu, "c2")];
		expect(
			(
				await goiTrpc(
					"contacts.list",
					"query",
					{},
					{ [API_KEY_HEADER]: b1.key },
				)
			).status,
			"doi chung: khoa nguoi thu nhat doc duoc truoc luot go",
		).toBe(200);
		await go();
		expect(
			await db.apikey.count({ where: { referenceId: bi } }),
			"luot go khong duoc xoa dong khoa",
		).toBe(2);
		const conBat = [];
		for (const k of [b1, b2])
			if ((await khoaBat(k.id)) !== false) conBat.push(k.id);
		expect(conBat, "khoa cua nguoi bi go van bat").toEqual([]);
		expect(
			(
				await goiTrpc(
					"contacts.list",
					"query",
					{},
					{ [API_KEY_HEADER]: b1.key },
				)
			).status,
			"khoa da tat van doc duoc",
		).not.toBe(200);
		expect([await khoaBat(c1.id), await khoaBat(c2.id)]).toEqual([true, true]);
		expect(
			(
				await goiTrpc(
					"contacts.list",
					"query",
					{},
					{ [API_KEY_HEADER]: c1.key },
				)
			).status,
			"khoa cua thanh vien khac bi cham",
		).toBe(200);
	});

	test("khoa-moi: nguoi da bi go khong tao hay bat lai khoa; thanh vien va he thong van tao duoc", async () => {
		const cu = await taoKhoa(bi, "khoa-cu");
		await go();
		const cookie = await dangNhap(emailBi);
		const server = app.getHttpServer();
		const quaTrpc = await request(server)
			.post("/api/trpc/apiKeys.create")
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify({ name: "sau-go", expiresInDays: null }));
		const quaAuth = await request(server)
			.post("/api/auth/api-key/create")
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify({ name: "sau-go-2" }));
		const batLai = await request(server)
			.post("/api/auth/api-key/update")
			.set("cookie", cookie)
			.set("content-type", "application/json")
			.send(JSON.stringify({ keyId: cu.id, enabled: true }));
		expect(
			{
				quaTrpc: quaTrpc.status < 300,
				quaAuth: quaAuth.status < 300,
				batLai: batLai.status < 300,
				soKhoa: await db.apikey.count({ where: { referenceId: bi } }),
				cuBat: await khoaBat(cu.id),
			},
			`nguoi da bi go van tao hay bat lai duoc khoa (${quaTrpc.status}/${quaAuth.status}/${batLai.status})`,
		).toEqual({
			quaTrpc: false,
			quaAuth: false,
			batLai: false,
			soKhoa: 1,
			cuBat: false,
		});

		const emailChu = await datMatKhau(chu);
		const cookieChu = await dangNhap(emailChu);
		const dem = () => db.apikey.count({ where: { referenceId: chu } });
		const truoc1 = await dem();
		const tv1 = await request(server)
			.post("/api/trpc/apiKeys.create")
			.set("cookie", cookieChu)
			.set("content-type", "application/json")
			.send(JSON.stringify({ name: "tv-trpc", expiresInDays: null }));
		expect(
			{ status: tv1.status, them: (await dem()) - truoc1 },
			"thanh vien khong tao duoc khoa qua man cai dat",
		).toEqual({ status: 200, them: 1 });
		const truoc2 = await dem();
		const tv2 = await request(server)
			.post("/api/auth/api-key/create")
			.set("cookie", cookieChu)
			.set("content-type", "application/json")
			.send(JSON.stringify({ name: "tv-auth" }));
		expect(
			{ status: tv2.status, them: (await dem()) - truoc2 },
			"thanh vien khong tao duoc khoa qua cong xac thuc",
		).toEqual({ status: 200, them: 1 });
		const truoc3 = await dem();
		await taoKhoa(chu, "he-thong");
		expect(
			(await dem()) - truoc3,
			"he thong khong tao duoc khoa phia may chu khong kem phien",
		).toBe(1);
	});

	test("cho-phep-lai: duoc cho phep lai thi doc lai duoc, khoa cu van tat", async () => {
		const cu = await taoKhoa(bi, "khoa-cu");
		await go();
		await workspace.allowEmail(chu, { email: emailBi, role: "member" });
		const cookie = await dangNhap(emailBi);
		expect(
			(await goiTrpc("contacts.list", "query", {}, { cookie })).status,
			"nguoi duoc cho phep lai van bi chan",
		).toBe(200);
		expect(await khoaBat(cu.id), "khoa cu duoc bat lai theo").toBe(false);
		expect(
			(
				await goiTrpc(
					"contacts.list",
					"query",
					{},
					{ [API_KEY_HEADER]: cu.key },
				)
			).status,
			"khoa cu doc duoc sau khi cho phep lai",
		).not.toBe(200);
	});

	test("proxy-het-quyen: proxy that dua nguoi bi go sang man het quyen, thanh vien thi khong", async () => {
		const server = await app.listen(0, "127.0.0.1");
		const { port } = server.address() as AddressInfo;
		const apiUrl = `http://127.0.0.1:${port}`;
		const emailChu = await datMatKhau(chu);
		const cookieChu = await dangNhap(emailChu);
		await go();
		const cookieBi = await dangNhap(emailBi);
		const [choBi, choChu] = await Promise.all([
			locationQuaProxy(cookieBi, apiUrl),
			locationQuaProxy(cookieChu, apiUrl),
		]);
		expect(
			new URL(choBi ?? "http://x/khong-chuyen").pathname,
			`proxy khong dua nguoi bi go sang man het quyen, nhan ${choBi}`,
		).toBe("/het-quyen");
		expect(
			choChu === null ? null : new URL(choChu).pathname,
			"thanh vien bi dua nham sang man het quyen",
		).not.toBe("/het-quyen");
	});
});
