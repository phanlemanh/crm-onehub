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
import { API_KEY_HEADER, auth, NOT_A_MEMBER } from "@crm/auth";
import { db, type Prisma } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AnyProcedure } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { AppRouterHost } from "nestjs-trpc";
import request from "supertest";
import { z } from "zod";
import {
	cauXemTruoc,
	DUOI_LUOT_DON,
	sqlLuotDon,
} from "../../../packages/db/scripts/luot-don-sql";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { WorkspaceService } from "../src/workspace/workspace.service";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "go-la-cat-quyen";
const MAT_KHAU = "mat-khau-thu-du-dai-1";
const NGOAI_LE = ["sso.signInOptions", "workspace.get"] as const;
const SAN_THU_TUC = 50;
const SAN_DUONG_REST = 30;
const LO_SONG_SONG = 8;
const KET_NOI_DU_TRU = 2;
const SO_TRUY_VAN_DO_POOL = 32;
const NGU_DO_POOL_GIAY = 0.05;
const SO_PHAN_TU_GIA = 40;
const THU_MUC_APP = join(import.meta.dir, "..", "..", "app");
const MOC_THOI_CU = new Date("2020-01-01T00:00:00.000Z");
const NGAY_MS = 24 * 60 * 60 * 1000;
const LENH_XEM_TRUOC = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"packages",
	"db",
	"scripts",
	"xem-truoc-luot-don.ts",
);

const THU_TUC_MAU = [
	{ ten: "contacts.list", input: {} },
	{ ten: "companies.list", input: {} },
	{ ten: "deals.list", input: {} },
	{ ten: "viec.cuaToi", input: { nhom: "giao-cho-toi" } },
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

async function theoLo<T, R>(
	ds: readonly T[],
	fn: (x: T) => Promise<R>,
	lo = 1,
): Promise<R[]> {
	const kq: R[] = [];
	for (let dau = 0; dau < ds.length; dau += lo) {
		kq.push(...(await Promise.all(ds.slice(dau, dau + lo).map(fn))));
	}
	return kq;
}

const TRAN_MA_TRAN_MS = 60_000;

async function maTranTrpc(dau: Dau, lo?: number): Promise<HangMaTran[]> {
	return theoLo(
		soThuTuc(),
		async ({ ten, loai }) => {
			const res = await goiTrpc(ten, loai, undefined, dau);
			return {
				ten,
				status: res.status,
				message: String(res.body?.error?.message ?? ""),
			};
		},
		lo,
	);
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

function tenDuong(d: { path: string; method: string }): string {
	return `${d.method.toUpperCase()} ${d.path}`;
}

async function maTranRest(dau: Dau, lo?: number): Promise<HangMaTran[]> {
	const server = app.getHttpServer();
	return theoLo(
		duongRest(),
		async (d) => {
			const url = d.path.replace(/\{[^}]+\}/g, "khong-co");
			const verb = d.method as "get" | "post" | "patch" | "put" | "delete";
			let req = request(server)[verb](url);
			if (verb !== "get" && verb !== "delete") {
				req = req.set("content-type", "application/json").send("{}");
			}
			const res = await gan(req, dau);
			return {
				ten: tenDuong(d),
				status: res.status,
				message: String(res.body?.message ?? ""),
			};
		},
		lo,
	);
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

async function taoKhoaTat(userId: string, name: string) {
	const khoa = await taoKhoa(userId, name);
	await db.apikey.update({ where: { id: khoa.id }, data: { enabled: false } });
	return khoa;
}

type ThanKhoa = { name?: string; keyId?: string; enabled?: boolean };

function quaHeader(duong: string, key: string, body: ThanKhoa) {
	return request(app.getHttpServer())
		.post(duong)
		.set(API_KEY_HEADER, key)
		.set("content-type", "application/json")
		.send(JSON.stringify(body));
}

class HoanTac extends Error {}

async function chayRoiHoanTac<T>(
	fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
	let ketQua: { gia: T } | null = null;
	try {
		await db.$transaction(
			async (tx) => {
				ketQua = { gia: await fn(tx) };
				throw new HoanTac();
			},
			{ isolationLevel: "RepeatableRead" },
		);
	} catch (loi) {
		if (!(loi instanceof HoanTac)) throw loi;
	}
	if (!ketQua) throw new Error("giao dich hoan tac khong tra ket qua");
	return (ketQua as { gia: T }).gia;
}

const soXemTruoc = z.object({
	may: z.string(),
	khoa: z.number(),
	chu: z.number(),
	dungGanDay: z.number(),
});

async function chayLenhXemTruoc(url: string | undefined) {
	const env = { ...process.env };
	delete env.XEM_TRUOC_DATABASE_URL;
	if (url !== undefined) env.XEM_TRUOC_DATABASE_URL = url;
	const con = Bun.spawn(["bun", LENH_XEM_TRUOC], {
		env,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, loi, ma] = await Promise.all([
		new Response(con.stdout).text(),
		new Response(con.stderr).text(),
		con.exited,
	]);
	return { ra, loi, ma };
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
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
	workspace = new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);
});

afterAll(async () => {
	await don();
	await app.close();
});

async function luotCungLuc(lo?: number) {
	const ds = Array.from({ length: SO_PHAN_TU_GIA }, (_, i) => i);
	let dangChay = 0;
	let lonNhat = 0;
	const kq = await theoLo(
		ds,
		async (x) => {
			dangChay += 1;
			lonNhat = Math.max(lonNhat, dangChay);
			await Bun.sleep(1);
			dangChay -= 1;
			return x;
		},
		lo,
	);
	return { ds, kq, lonNhat };
}

async function coPoolThat(): Promise<number> {
	const hang = await Promise.all(
		Array.from(
			{ length: SO_TRUY_VAN_DO_POOL },
			() =>
				db.$queryRaw<
					Array<{ pid: number }>
				>`SELECT pg_backend_pid() AS pid FROM pg_sleep(${NGU_DO_POOL_GIAY}::float8)`,
		),
	);
	return new Set(hang.map(([h]) => h?.pid)).size;
}

test("theo-lo: bo chia lo mac dinh chay tung luot, LO_SONG_SONG chay dung so luot da khai", async () => {
	const tuanTu = await luotCungLuc();
	expect(tuanTu.lonNhat, "bo chia lo mac dinh chay nhieu hon mot luot").toBe(1);
	expect(tuanTu.kq, "bo chia lo mac dinh lech thu tu").toEqual(tuanTu.ds);
	const songSong = await luotCungLuc(LO_SONG_SONG);
	expect(
		songSong.lonNhat,
		"bo chia lo khong chay dung LO_SONG_SONG luot cung luc",
	).toBe(LO_SONG_SONG);
	expect(songSong.kq, "bo chia lo song song lech thu tu").toEqual(songSong.ds);
	const coPool = await coPoolThat();
	expect(coPool, "phep do pool chua lam day pool").toBeLessThan(
		SO_TRUY_VAN_DO_POOL,
	);
	expect(
		LO_SONG_SONG + KET_NOI_DU_TRU,
		"LO_SONG_SONG lan vao pool pg",
	).toBeLessThanOrEqual(coPool);
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

	test(
		"ma-tran-dang-nhap-lai: bi go roi dang nhap lai thi moi thu tuc ngoai ngoai le tu choi ve tu cach",
		async () => {
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
		},
		TRAN_MA_TRAN_MS,
	);

	test(
		"ngoai-le-dung-tap-khai: tap thu tuc khong chan nguoi bi go bang dung tap khai",
		async () => {
			await go();
			const cookie = await dangNhap(emailBi);
			const hang = await maTranTrpc({ cookie });
			const khongChan = hang
				.filter((h) => !biChanVeTuCach(h))
				.map((h) => h.ten)
				.sort();
			expect(khongChan, "tap ngoai le lech tap khai").toEqual([...NGOAI_LE]);
			const res = await goiTrpc("workspace.get", "query", undefined, {
				cookie,
			});
			expect(res.status, "workspace.get phai tra 200 cho proxy").toBe(200);
			expect(res.body.result.data.viewerRole).toBe(null);
		},
		TRAN_MA_TRAN_MS,
	);

	test(
		"doi-chung-thanh-vien: thanh vien khong bao gio nhan thong diep tu cach",
		async () => {
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
		},
		TRAN_MA_TRAN_MS,
	);

	test(
		"tab-dang-mo: cookie bo dem phien mat quyen ngay khi bi go",
		async () => {
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
		},
		TRAN_MA_TRAN_MS,
	);

	test(
		"khoa-con-bat: khoa con bat cua nguoi khong con trong kho bi tu choi qua tRPC va REST",
		async () => {
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
			const hangTrpc = await maTranTrpc(dau, LO_SONG_SONG);
			expect(
				hangTrpc.map((h) => h.ten),
				"ma tran tRPC song song lech danh sach thu tuc",
			).toEqual(soThuTuc().map((t) => t.ten));
			expect(
				hangLot(hangTrpc, laNgoaiLeTrpc),
				"tRPC: khoa con bat cua nguoi ngoai van qua duoc",
			).toEqual([]);
			const rest = await maTranRest(dau, LO_SONG_SONG);
			expect(
				rest.length,
				"ma tran REST rong hoac qua it",
			).toBeGreaterThanOrEqual(SAN_DUONG_REST);
			expect(
				rest.map((h) => h.ten),
				"ma tran REST song song lech danh sach duong",
			).toEqual(duongRest().map(tenDuong));
			expect(
				hangLot(rest, laNgoaiLeRest),
				"REST: khoa con bat cua nguoi ngoai van qua duoc",
			).toEqual([]);
		},
		TRAN_MA_TRAN_MS,
	);

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
		const quaKhoaTat = await goiTrpc(
			"contacts.list",
			"query",
			{},
			{ [API_KEY_HEADER]: b1.key },
		);
		const xacMinh = await auth.api.verifyApiKey({ body: { key: b1.key } });
		expect(
			{
				status: quaKhoaTat.status,
				loiKhoa: xacMinh.error?.code ?? null,
			},
			"khoa da tat phai bi tu choi o tang khoa, khong phai o phep kiem tu cach",
		).toEqual({ status: 401, loiKhoa: "KEY_DISABLED" });
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
		const tuChoi = { status: 403, message: NOT_A_MEMBER };
		expect(
			{
				quaTrpc: {
					status: quaTrpc.status,
					message: String(quaTrpc.body?.error?.message ?? ""),
				},
				quaAuth: {
					status: quaAuth.status,
					message: String(quaAuth.body?.message ?? ""),
				},
				batLai: {
					status: batLai.status,
					message: String(batLai.body?.message ?? ""),
				},
				soKhoa: await db.apikey.count({ where: { referenceId: bi } }),
				cuBat: await khoaBat(cu.id),
			},
			"nguoi da bi go van tao hay bat lai duoc khoa, hoac bi tu choi vi ly do khac tu cach",
		).toEqual({
			quaTrpc: tuChoi,
			quaAuth: tuChoi,
			batLai: tuChoi,
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
		const tatCuaChu = await taoKhoaTat(chu, "tv-tat");
		const tvBatLai = await request(server)
			.post("/api/auth/api-key/update")
			.set("cookie", cookieChu)
			.set("content-type", "application/json")
			.send(JSON.stringify({ keyId: tatCuaChu.id, enabled: true }));
		expect(
			{ status: tvBatLai.status, bat: await khoaBat(tatCuaChu.id) },
			"thanh vien khong bat lai duoc khoa cua chinh minh qua cong xac thuc",
		).toEqual({ status: 200, bat: true });
	});

	test("header-tao-khoa: khoa con bat cua nguoi ngoai kho khong tao duoc khoa moi chi bang header", async () => {
		const khoa = await taoKhoa(bi, "khoa-con-bat");
		await db.member.delete({ where: { id: await memberId(bi) } });
		expect(
			await khoaBat(khoa.id),
			"khoa phai con bat de tu choi khong den tu tang khoa",
		).toBe(true);
		const truoc = await db.apikey.count({ where: { referenceId: bi } });
		const res = await quaHeader("/api/auth/api-key/create", khoa.key, {
			name: "qua-header",
		});
		expect(
			{
				status: res.status,
				message: String(res.body?.message ?? ""),
				them: (await db.apikey.count({ where: { referenceId: bi } })) - truoc,
			},
			"POST /api/auth/api-key/create chi bang header khoa cua nguoi ngoai kho van qua",
		).toEqual({ status: 403, message: NOT_A_MEMBER, them: 0 });
	});

	test("header-bat-lai-khoa: khoa con bat cua nguoi ngoai kho khong bat lai hay sua duoc khoa nao", async () => {
		const conBat = await taoKhoa(bi, "khoa-con-bat");
		const daTat = await taoKhoaTat(bi, "khoa-da-tat");
		await db.member.delete({ where: { id: await memberId(bi) } });
		const batLai = await quaHeader("/api/auth/api-key/update", conBat.key, {
			keyId: daTat.id,
			enabled: true,
		});
		const doiTen = await quaHeader("/api/auth/api-key/update", conBat.key, {
			keyId: conBat.id,
			name: "doi-ten-qua-header",
		});
		const ten = await db.apikey.findUniqueOrThrow({
			where: { id: conBat.id },
			select: { name: true },
		});
		expect(
			{
				batLai: {
					status: batLai.status,
					message: String(batLai.body?.message ?? ""),
				},
				doiTen: {
					status: doiTen.status,
					message: String(doiTen.body?.message ?? ""),
				},
				daTatVanTat: await khoaBat(daTat.id),
				tenKhongDoi: ten.name,
			},
			"POST /api/auth/api-key/update chi bang header khoa cua nguoi ngoai kho van qua",
		).toEqual({
			batLai: { status: 403, message: NOT_A_MEMBER },
			doiTen: { status: 403, message: NOT_A_MEMBER },
			daTatVanTat: false,
			tenKhongDoi: "khoa-con-bat",
		});
	});

	test("header-lan-cookie: phep kiem hoi dung danh tinh ma endpoint se dung, khong phai cookie", async () => {
		const khoaBi = await taoKhoa(bi, "khoa-con-bat");
		await db.member.delete({ where: { id: await memberId(bi) } });
		const cookieChu = await dangNhap(await datMatKhau(chu));
		const dem = () =>
			db.apikey.count({ where: { referenceId: { in: [bi, chu] } } });
		const truoc = await dem();
		const res = await request(app.getHttpServer())
			.post("/api/auth/api-key/create")
			.set("cookie", cookieChu)
			.set(API_KEY_HEADER, khoaBi.key)
			.set("content-type", "application/json")
			.send(JSON.stringify({ name: "lan-cookie" }));
		expect(
			{
				status: res.status,
				message: String(res.body?.message ?? ""),
				them: (await dem()) - truoc,
			},
			"cookie thanh vien che mat header khoa cua nguoi ngoai kho",
		).toEqual({ status: 403, message: NOT_A_MEMBER, them: 0 });
	});

	test("header-doi-chung: thanh vien dung header khoa van tao va bat lai duoc khoa", async () => {
		const khoa = await taoKhoa(chu, "khoa-chu");
		const daTat = await taoKhoaTat(chu, "khoa-chu-tat");
		const dem = () => db.apikey.count({ where: { referenceId: chu } });
		const truoc = await dem();
		const tao = await quaHeader("/api/auth/api-key/create", khoa.key, {
			name: "tao-qua-header",
		});
		expect(
			{ status: tao.status, them: (await dem()) - truoc },
			"thanh vien khong tao duoc khoa chi bang header khoa",
		).toEqual({ status: 200, them: 1 });
		const batLai = await quaHeader("/api/auth/api-key/update", khoa.key, {
			keyId: daTat.id,
			enabled: true,
		});
		expect(
			{ status: batLai.status, bat: await khoaBat(daTat.id) },
			"thanh vien khong bat lai duoc khoa chi bang header khoa",
		).toEqual({ status: 200, bat: true });
		const truocHeThong = await dem();
		await taoKhoa(chu, "he-thong");
		expect(
			(await dem()) - truocHeThong,
			"he thong khong tao duoc khoa phia may chu khong kem phien",
		).toBe(1);
	});

	test("don-mot-lan: luot don tat khoa con bat cua nguoi ngoai kho, khong cham khoa thanh vien", async () => {
		const sql = sqlLuotDon();
		const daChay = await db.$queryRawUnsafe<Array<{ n: bigint }>>(
			`SELECT count(*) AS n FROM "_prisma_migrations" WHERE "migration_name" LIKE '%${DUOI_LUOT_DON}' AND "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL`,
		);
		expect(
			Number(daChay[0]?.n ?? 0),
			"migrate deploy chua ap luot don len co so du lieu cua luot kiem",
		).toBe(1);
		const b1 = await taoKhoa(bi, "b1");
		const b2 = await taoKhoa(bi, "b2");
		await db.apikey.update({ where: { id: b2.id }, data: { enabled: null } });
		const b3 = await taoKhoaTat(bi, "b3");
		await db.apikey.update({
			where: { id: b3.id },
			data: { updatedAt: MOC_THOI_CU },
		});
		const c1 = await taoKhoa(chu, "c1");
		const c2 = await taoKhoa(chu, "c2");
		await db.apikey.update({ where: { id: c2.id }, data: { enabled: null } });
		await db.member.delete({ where: { id: await memberId(bi) } });
		const ids = [b1.id, b2.id, b3.id, c1.id, c2.id];
		const truoc = await db.apikey.findMany({
			where: { id: { in: ids } },
			select: { id: true, referenceId: true, enabled: true },
			orderBy: { name: "asc" },
		});
		expect(
			truoc.map((h) => [h.referenceId, h.enabled]),
			"khuon khoa do writer that ghi lech gia dinh cua luot don",
		).toEqual([
			[bi, true],
			[bi, null],
			[bi, false],
			[chu, true],
			[chu, null],
		]);
		const sau = await chayRoiHoanTac(async (tx) => {
			await tx.$executeRawUnsafe(sql);
			const hang = await tx.apikey.findMany({
				where: { id: { in: ids } },
				select: { id: true, enabled: true, updatedAt: true },
			});
			const theo = new Map(hang.map((h) => [h.id, h]));
			return {
				b1: theo.get(b1.id)?.enabled,
				b2: theo.get(b2.id)?.enabled,
				b3: {
					enabled: theo.get(b3.id)?.enabled,
					updatedAt: theo.get(b3.id)?.updatedAt.toISOString(),
				},
				c1: theo.get(c1.id)?.enabled,
				c2: theo.get(c2.id)?.enabled,
				soKhoaBi: await tx.apikey.count({ where: { referenceId: bi } }),
			};
		});
		expect(
			sau,
			"luot don lech: khoa nguoi ngoai kho con bat, khoa da tat bi de, khoa thanh vien bi cham, hoac dong khoa bi xoa",
		).toEqual({
			b1: false,
			b2: false,
			b3: { enabled: false, updatedAt: MOC_THOI_CU.toISOString() },
			c1: true,
			c2: null,
			soKhoaBi: 3,
		});
	});

	test("don-bang-rong: kho chua ai ghi danh thi luot don khong tat khoa nao", async () => {
		const sql = sqlLuotDon();
		const b1 = await taoKhoa(bi, "b1");
		const b2 = await taoKhoa(bi, "b2");
		await db.apikey.update({ where: { id: b2.id }, data: { enabled: null } });
		const c1 = await taoKhoa(chu, "c1");
		const sau = await chayRoiHoanTac(async (tx) => {
			await tx.member.deleteMany({ where: { organizationId: WORKSPACE_ID } });
			await tx.$executeRawUnsafe(sql);
			const hang = await tx.apikey.findMany({
				where: { id: { in: [b1.id, b2.id, c1.id] } },
				select: { id: true, enabled: true },
			});
			const theo = new Map(hang.map((h) => [h.id, h.enabled]));
			return {
				b1: theo.get(b1.id),
				b2: theo.get(b2.id),
				c1: theo.get(c1.id),
			};
		});
		expect(
			sau,
			"luot don tat khoa khi bang thanh vien rong — lan ghi danh dau se mat het khoa",
		).toEqual({ b1: true, b2: null, c1: true });
	});

	test("xem-truoc-dung-so: lenh xem truoc dem dung so khoa ma luot don se tat", async () => {
		const sql = sqlLuotDon();
		const b1 = await taoKhoa(bi, "b1");
		const b2 = await taoKhoa(bi, "b2");
		await db.apikey.update({ where: { id: b2.id }, data: { enabled: null } });
		await taoKhoa(chu, "c1");
		await db.member.delete({ where: { id: await memberId(bi) } });
		const ketQua = await chayRoiHoanTac(async (tx) => {
			const [xemTruoc] = await tx.$queryRawUnsafe<
				Array<{ khoa: number; chu: number; dungGanDay: number }>
			>(cauXemTruoc(sql));
			const daDoi = await tx.$executeRawUnsafe(sql);
			const conLai = await tx.$queryRawUnsafe<Array<{ khoa: number }>>(
				cauXemTruoc(sql),
			);
			const cuaBi = await tx.apikey.count({
				where: { id: { in: [b1.id, b2.id] }, enabled: false },
			});
			return { xemTruoc, daDoi, conLai: conLai[0]?.khoa, cuaBi };
		});
		expect(
			{
				khopSoDong: ketQua.xemTruoc?.khoa === ketQua.daDoi,
				conLai: ketQua.conLai,
				cuaBi: ketQua.cuaBi,
			},
			`xem truoc dem ${ketQua.xemTruoc?.khoa} khoa, luot don doi ${ketQua.daDoi} dong`,
		).toEqual({ khopSoDong: true, conLai: 0, cuaBi: 2 });
		expect(
			ketQua.xemTruoc?.khoa ?? 0,
			"xem truoc khong thay khoa nao cua co lieu",
		).toBeGreaterThanOrEqual(2);
		expect(ketQua.xemTruoc?.chu ?? 0).toBeGreaterThanOrEqual(1);
	});

	test("xem-truoc-chay-lenh: lenh xem truoc chay that, dem dung khoa dung gan day, khong ghi dong nao", async () => {
		const url = process.env.TEST_DATABASE_URL;
		expect(url, "luot kiem khong co TEST_DATABASE_URL").toBeDefined();
		const thieuBien = await chayLenhXemTruoc(undefined);
		expect(
			{
				ma: thieuBien.ma,
				goiTen: thieuBien.loi.includes("XEM_TRUOC_DATABASE_URL"),
			},
			`thieu bien rieng ma lenh van chay: ${thieuBien.loi}`,
		).toEqual({ ma: 2, goiTen: true });
		const docSo = async () => {
			const kq = await chayLenhXemTruoc(url);
			expect(kq.ma, `lenh xem truoc loi: ${kq.loi}`).toBe(0);
			return soXemTruoc.parse(JSON.parse(kq.ra));
		};
		const truoc = await docSo();
		const ganDay = await taoKhoa(bi, "gan-day");
		const ganDay2 = await taoKhoa(bi, "gan-day-2");
		const lauRoi = await taoKhoa(bi, "lau-roi");
		const cuaChu = await taoKhoa(chu, "cua-chu");
		const bayGio = Date.now();
		await db.apikey.update({
			where: { id: ganDay.id },
			data: { lastRequest: new Date(bayGio - NGAY_MS) },
		});
		await db.apikey.update({
			where: { id: ganDay2.id },
			data: { lastRequest: new Date(bayGio - 2 * NGAY_MS) },
		});
		await db.apikey.update({
			where: { id: lauRoi.id },
			data: { lastRequest: new Date(bayGio - 60 * NGAY_MS) },
		});
		await db.apikey.update({
			where: { id: cuaChu.id },
			data: { lastRequest: new Date(bayGio - NGAY_MS) },
		});
		await db.member.delete({ where: { id: await memberId(bi) } });
		const sau = await docSo();
		expect(
			{
				may: sau.may,
				themKhoa: sau.khoa - truoc.khoa,
				themChu: sau.chu - truoc.chu,
				themDungGanDay: sau.dungGanDay - truoc.dungGanDay,
			},
			"lenh xem truoc dem lech: khoa, chu khoa, hoac khoa dung trong 30 ngay",
		).toEqual({
			may: new URL(String(url)).host,
			themKhoa: 3,
			themChu: 1,
			themDungGanDay: 2,
		});
		expect(
			[
				await khoaBat(ganDay.id),
				await khoaBat(ganDay2.id),
				await khoaBat(lauRoi.id),
				await khoaBat(cuaChu.id),
			],
			"lenh xem truoc da ghi vao co so du lieu",
		).toEqual([true, true, true, true]);
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
