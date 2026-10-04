import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import { capNhatPhien } from "@crm/db/okr-cuoc-soan";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { PHIEN_CHO_EVE } from "@crm/validation/okr-cuoc-soan";
import {
	KHONG_TRONG_PHAM_VI,
	type WorkspaceRole,
} from "@crm/validation/vai-workspace";
import { verifyJwtHmac } from "eve/channels/auth";
import { z } from "zod";

const suffix = `${process.env.TEST_RUN_ID ?? "cua-okr"}-cua`;
const NGUOI = {
	owner: `${suffix}-owner`,
	admin: `${suffix}-admin`,
	member: `${suffix}-member`,
	okr: `${suffix}-okr`,
} as const;
const NGOAI = `${suffix}-ngoai`;
const CHU_KY = `${suffix}-ky`;
const CUOC = {
	cuaOkr: `${suffix}-cuoc-okr`,
	cuaNguoiKhac: `${suffix}-cuoc-khac`,
	daDuaVao: `${suffix}-cuoc-xong`,
	cuaNgoai: `${suffix}-cuoc-ngoai`,
} as const;
const BI_MAT = "bi-mat-cua-okr-du-dai-32-ky-tu-thu";
const AGENT_GIA = "http://127.0.0.1:65530";
const LY_DO_LUOT = [
	"het-luot-cuoc",
	"het-tran-thang",
	"cuoc-khong-dang",
	"don-vi-chua-bat",
	"don-vi-luu-tru",
	"chua-co-khoa-mo-hinh",
] as const;

type KetLuot =
	| { ok: true; soLuot: number }
	| { ok: false; lyDo: (typeof LY_DO_LUOT)[number] }
	| "nem";

let phien: { user: { id: string; email: string; name: string } } | null = null;
let ketLuot: KetLuot = { ok: true, soLuot: 1 };
const daChuyen: { url: string; headers: Headers }[] = [];
const daTangLuot: string[] = [];

const serverThat = await import("next/server");
mock.module("next/server", () => ({
	...serverThat,
	connection: async () => undefined,
}));
const sessionThat = await import("@/lib/session");
mock.module("@/lib/session", () => ({
	...sessionThat,
	getSession: async () => phien,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({}),
	getServerTrpc: () => ({}),
	getServerTrpcClient: () => ({
		okr: {
			soanTangLuot: {
				mutate: async (vao: { cuocSoanId: string }) => {
					daTangLuot.push(vao.cuocSoanId);
					if (ketLuot === "nem") throw new Error("api khong tra loi");
					return ketLuot;
				},
			},
		},
	}),
}));

const BIEN = [
	"OKR_AGENT_BRIDGE_SECRET",
	"OKR_AGENT_URL",
	"AGENT_BRIDGE_SECRET",
] as const;
const bienThat = BIEN.map((ten) => [ten, process.env[ten]] as const);
process.env.OKR_AGENT_BRIDGE_SECRET = BI_MAT;
process.env.OKR_AGENT_URL = AGENT_GIA;
process.env.AGENT_BRIDGE_SECRET = "bi-mat-cau-noi-cu-du-dai-32-ky-tu-thu";
const cuocSoanThat = await import("@crm/db/okr-cuoc-soan");
const capNhatThat = cuocSoanThat.capNhatPhien;
let ghiHong = false;
mock.module("@crm/db/okr-cuoc-soan", () => ({
	...cuocSoanThat,
	capNhatPhien: async (...vao: Parameters<typeof capNhatThat>) => {
		if (ghiHong) throw new Error("kho hong");
		return capNhatThat(...vao);
	},
}));
let duaVoi: { id: string; cho: string } | null = null;
const fetchThat = globalThis.fetch;
let soEve = 0;
let traVe: "ca-hai" | "chi-than" | "khong-co" | "loi" = "ca-hai";
const daTraEve: string[] = [];
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
	daChuyen.push({ url: String(input), headers: new Headers(init?.headers) });
	const eve = `${suffix}-eve-${++soEve}`;
	daTraEve.push(eve);
	if (duaVoi) await capNhatThat(db, duaVoi.id, duaVoi.cho);
	if (traVe === "loi") return Response.json({ ok: false }, { status: 500 });
	if (traVe === "khong-co") return Response.json({ ok: true }, { status: 202 });
	return Response.json(
		{ ok: true, sessionId: eve, continuationToken: `eve:${eve}` },
		{
			status: 202,
			headers: traVe === "ca-hai" ? { "x-eve-session-id": eve } : {},
		},
	);
}) as typeof fetch;

const { POST, GET } = await import(
	"@/app/eve/agents/okr/eve/v1/[...path]/route"
);
const { POST: POST_CU } = await import("@/app/eve/v1/[...path]/route");
const { AGENT_URL, OKR_AGENT_URL } = await import("@/lib/agent-bridge");

async function gieoNguoi(userId: string, vai: WorkspaceRole | null) {
	const now = new Date();
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: now },
		update: {},
	});
	await db.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			name: userId,
			email: `${userId}@thu.test`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});
	if (!vai) return;
	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId },
		},
		create: {
			id: `member-${userId}`,
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: now,
		},
		update: { role: vai },
	});
}

async function gieoCuoc(
	id: string,
	nguoiMoUserId: string,
	trangThai: "dang" | "da-dua-vao",
	cacPhien: string[] = [],
) {
	await db.okrCuocSoan.create({
		data: {
			id,
			cycleId: CHU_KY,
			level: "onehub",
			nguoiMoUserId,
			sessionId: `phien-${id}`,
			cacPhien,
			nac: "bat",
			trangThai,
		},
	});
}

let soCuocCho = 0;
async function cuocCho(nguoiMoUserId: string): Promise<string> {
	const id = `${suffix}-cho-${++soCuocCho}`;
	const cho = `${PHIEN_CHO_EVE}${id}`;
	await db.okrCuocSoan.create({
		data: {
			id,
			cycleId: CHU_KY,
			level: "onehub",
			nguoiMoUserId,
			sessionId: cho,
			cacPhien: [cho],
			nac: "bat",
			trangThai: "dang",
		},
	});
	return id;
}

const docPhien = (id: string) =>
	db.okrCuocSoan.findUniqueOrThrow({
		where: { id },
		select: { sessionId: true, cacPhien: true },
	});

const TIEN_TO_NEXT = "/eve/agents/okr/eve/v1/";

function pathTuUrl(url: string): string[] {
	const { pathname } = new URL(url);
	if (!pathname.startsWith(TIEN_TO_NEXT))
		throw new Error(`Next khong dua ${pathname} vao cua nay`);
	return pathname
		.slice(TIEN_TO_NEXT.length)
		.split("/")
		.map((doan) => decodeURIComponent(doan));
}

function goi(
	userId: string | null,
	duong: string,
	cuocSoanId: string | null,
	method = "POST",
	them: Record<string, string> = {},
) {
	phien = userId
		? { user: { id: userId, email: `${userId}@thu.test`, name: userId } }
		: null;
	daChuyen.length = 0;
	daTangLuot.length = 0;
	const headers = new Headers({
		"x-crm-deal": "cmdealgiakhongduocqua1",
		"content-type": "application/json",
		...them,
	});
	if (cuocSoanId) headers.set("x-crm-cuoc-soan", cuocSoanId);
	const url = `http://localhost:3000/eve/agents/okr${duong}`;
	const ctx = { params: Promise.resolve({ path: pathTuUrl(url) }) };
	if (method === "GET") return GET(new Request(url, { method, headers }), ctx);
	return POST(new Request(url, { method, headers, body: "{}" }), ctx);
}

async function don() {
	await db.okrCuocSoan.deleteMany({
		where: { id: { startsWith: `${suffix}-` } },
	});
	await db.okrCycle.deleteMany({ where: { id: CHU_KY } });
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

beforeAll(async () => {
	await don();
	for (const [vai, id] of Object.entries(NGUOI))
		await gieoNguoi(id, vai as keyof typeof NGUOI);
	await gieoNguoi(NGOAI, null);
	await db.okrCycle.create({
		data: {
			id: CHU_KY,
			kind: "quy",
			name: "Quý thử",
			startsOn: new Date("2027-01-01"),
			endsOn: new Date("2027-03-31"),
			phase: "lap-ke-hoach",
		},
	});
	await gieoCuoc(CUOC.cuaOkr, NGUOI.okr, "dang", [`phien-cu-${CUOC.cuaOkr}`]);
	await gieoCuoc(CUOC.cuaNguoiKhac, NGUOI.member, "dang");
	await gieoCuoc(CUOC.daDuaVao, NGUOI.okr, "da-dua-vao");
	await gieoCuoc(CUOC.cuaNgoai, NGOAI, "dang");
});
afterAll(async () => {
	globalThis.fetch = fetchThat;
	phien = null;
	for (const [ten, giaTri] of bienThat) {
		if (giaTri === undefined) delete process.env[ten];
		else process.env[ten] = giaTri;
	}
	await don();
});

const phanThanThe = z.record(z.string(), z.union([z.string(), z.number()]));

function claims(token: string) {
	const [, payload] = token.split(".");
	return phanThanThe.parse(
		JSON.parse(Buffer.from(payload ?? "", "base64url").toString()),
	);
}

describe("cua-okr", () => {
	test("tro ly OKR o dia chi rieng, khong phai tac nhan CRM", () => {
		expect(OKR_AGENT_URL).not.toBe(AGENT_URL);
	});
	test("503 co ten khi chua dat bi mat, ke ca bi mat chi co khoang trang", async () => {
		for (const biMat of ["", "   "]) {
			process.env.OKR_AGENT_BRIDGE_SECRET = biMat;
			const res = await goi(NGUOI.okr, "/eve/v1/session", CUOC.cuaOkr);
			expect({
				biMat,
				status: res.status,
				body: await res.json(),
				chuyen: daChuyen.length,
				luot: daTangLuot.length,
			}).toEqual({
				biMat,
				status: 503,
				body: { error: "chua-cau-hinh-tro-ly-okr" },
				chuyen: 0,
				luot: 0,
			});
		}
		process.env.OKR_AGENT_BRIDGE_SECRET = BI_MAT;
	});
	test("401 khi khong dang nhap", async () => {
		expect((await goi(null, "/eve/v1/session", CUOC.cuaOkr)).status).toBe(401);
		expect(daChuyen).toHaveLength(0);
	});
	test("403 khi khong phai thanh vien", async () => {
		const res = await goi(NGOAI, "/eve/v1/session", CUOC.cuaNgoai);
		expect({
			status: res.status,
			chuyen: daChuyen.length,
			luot: daTangLuot.length,
		}).toEqual({
			status: 403,
			chuyen: 0,
			luot: 0,
		});
	});
	test("400 khi thieu hoac sai dang ma cuoc", async () => {
		for (const ma of [null, "CO HOA!", "ngan"]) {
			const res = await goi(NGUOI.okr, "/eve/v1/session", ma);
			expect({
				ma,
				status: res.status,
				body: await res.json(),
				chuyen: daChuyen.length,
			}).toEqual({
				ma,
				status: 400,
				body: { error: "thieu-cuoc-soan" },
				chuyen: 0,
			});
		}
	});
	for (const vai of ["owner", "admin", "member", "okr"] as const) {
		test(`vai ${vai}: 200 chuyen tiep toi OKR_AGENT_URL khi cuoc dang thuoc minh`, async () => {
			const id = await cuocCho(NGUOI[vai]);
			const res = await goi(NGUOI[vai], "/eve/v1/session", id);
			expect(
				{ vai, status: res.status, toi: daChuyen[0]?.url },
				"cua moi chan vai okr",
			).toEqual({ vai, status: 202, toi: `${OKR_AGENT_URL}/eve/v1/session` });
		});
	}
	test("403 khi cuoc cua nguoi khac; 403 khi cuoc khong dang", async () => {
		expect(
			(await goi(NGUOI.okr, "/eve/v1/session", CUOC.cuaNguoiKhac)).status,
		).toBe(403);
		expect(
			(await goi(NGUOI.okr, "/eve/v1/session", CUOC.daDuaVao)).status,
		).toBe(403);
		expect(daChuyen).toHaveLength(0);
	});
	test("JWT: audience crm-okr-agent, purpose okr-soan, cuocSoanId, vai, KHONG id doi tac, KHONG chuyen x-crm-*", async () => {
		await goi(NGUOI.okr, `/eve/v1/session/phien-${CUOC.cuaOkr}`, CUOC.cuaOkr);
		const h = daChuyen[0]?.headers;
		const token = h?.get("authorization")?.replace(/^Bearer /, "") ?? "";
		const c = claims(token);
		expect(Object.keys(c).sort(), "jwt mang id doi tac").toEqual([
			"aud",
			"cuocSoanId",
			"email",
			"exp",
			"iat",
			"iss",
			"name",
			"nbf",
			"purpose",
			"sub",
			"vai",
		]);
		expect({
			aud: c.aud,
			purpose: c.purpose,
			cuocSoanId: c.cuocSoanId,
			sub: c.sub,
			vai: c.vai,
		}).toEqual({
			aud: "crm-okr-agent",
			purpose: "okr-soan",
			cuocSoanId: CUOC.cuaOkr,
			sub: NGUOI.okr,
			vai: "okr",
		});
		const ok = await verifyJwtHmac(token, {
			algorithm: "HS256",
			audiences: ["crm-okr-agent"],
			issuer: "crm-app",
			secret: BI_MAT,
		});
		expect(ok.ok).toBe(true);
		const audCu = await verifyJwtHmac(token, {
			algorithm: "HS256",
			audiences: ["crm-agent"],
			issuer: "crm-app",
			secret: BI_MAT,
		});
		expect(audCu.ok, "the okr lot vao kenh crm-agent").toBe(false);
		expect(
			[...(h?.keys() ?? [])].filter((k) => k.startsWith("x-crm-")),
		).toEqual([]);
	});
	test("dem luot: POST session goi soanTangLuot; het-luot-cuoc → 429, khong chuyen", async () => {
		const moi = await cuocCho(NGUOI.okr);
		await goi(NGUOI.okr, "/eve/v1/session", moi);
		expect(daTangLuot).toEqual([moi]);
		await goi(NGUOI.okr, `/eve/v1/session/phien-${CUOC.cuaOkr}`, CUOC.cuaOkr);
		expect(daTangLuot).toEqual([CUOC.cuaOkr]);
		await goi(
			NGUOI.okr,
			`/eve/v1/session/phien-${CUOC.cuaOkr}/stream`,
			CUOC.cuaOkr,
			"GET",
		);
		expect(daTangLuot).toEqual([]);
		expect(daChuyen).toHaveLength(1);
		await goi(
			NGUOI.okr,
			`/eve/v1/session/phien-${CUOC.cuaOkr}/cancel`,
			CUOC.cuaOkr,
		);
		expect(daTangLuot).toEqual([]);
		await goi(NGUOI.okr, "/eve/v1/health", CUOC.cuaOkr, "GET");
		expect(daTangLuot).toEqual([]);
		await goi(
			NGUOI.okr,
			`/eve/v1/session/phien-${CUOC.cuaOkr}`,
			CUOC.cuaOkr,
			"GET",
		);
		expect(daTangLuot).toEqual([]);
		ketLuot = { ok: false, lyDo: "het-luot-cuoc" };
		const res = await goi(
			NGUOI.okr,
			"/eve/v1/session",
			await cuocCho(NGUOI.okr),
		);
		ketLuot = { ok: true, soLuot: 2 };
		expect({
			status: res.status,
			body: await res.json(),
			chuyen: daChuyen.length,
		}).toEqual({ status: 429, body: { error: "het-luot-cuoc" }, chuyen: 0 });
	});
	test("moi ly do tu choi luot co ten va trang thai rieng, khong luot nao toi tro ly", async () => {
		const trangThai = {
			"het-luot-cuoc": 429,
			"het-tran-thang": 429,
			"cuoc-khong-dang": 403,
			"don-vi-chua-bat": 403,
			"don-vi-luu-tru": 403,
			"chua-co-khoa-mo-hinh": 503,
		} satisfies Record<(typeof LY_DO_LUOT)[number], number>;
		for (const lyDo of LY_DO_LUOT) {
			ketLuot = { ok: false, lyDo };
			const res = await goi(
				NGUOI.okr,
				`/eve/v1/session/phien-${CUOC.cuaOkr}`,
				CUOC.cuaOkr,
			);
			expect({
				lyDo,
				status: res.status,
				body: await res.json(),
				chuyen: daChuyen.length,
			}).toEqual({
				lyDo,
				status: trangThai[lyDo],
				body: { error: lyDo },
				chuyen: 0,
			});
		}
		ketLuot = { ok: true, soLuot: 2 };
	});
	test("502 co ten khi khong dem duoc luot, khong chuyen", async () => {
		ketLuot = "nem";
		const res = await goi(
			NGUOI.okr,
			`/eve/v1/session/phien-${CUOC.cuaOkr}`,
			CUOC.cuaOkr,
		);
		ketLuot = { ok: true, soLuot: 2 };
		expect({
			status: res.status,
			body: await res.json(),
			chuyen: daChuyen.length,
		}).toEqual({
			status: 502,
			body: { error: "khong-dem-duoc-luot" },
			chuyen: 0,
		});
	});
	test("phien tren duong: phien chinh va phien cu cua cuoc qua; phien la 403", async () => {
		expect(
			(
				await goi(
					NGUOI.okr,
					`/eve/v1/session/phien-${CUOC.cuaOkr}/stream`,
					CUOC.cuaOkr,
					"GET",
				)
			).status,
		).toBe(202);
		expect(
			(
				await goi(
					NGUOI.okr,
					`/eve/v1/session/phien-cu-${CUOC.cuaOkr}/stream`,
					CUOC.cuaOkr,
					"GET",
				)
			).status,
		).toBe(202);
		const res = await goi(NGUOI.okr, "/eve/v1/session/phien-la", CUOC.cuaOkr);
		expect({
			status: res.status,
			chuyen: daChuyen.length,
			luot: daTangLuot.length,
		}).toEqual({
			status: 403,
			chuyen: 0,
			luot: 0,
		});
	});
	test("chi dang duong eve da liet ke moi qua; dang la 404 co ten, khong toi tro ly", async () => {
		for (const duong of [
			"/eve/v1/%6Fkr/session",
			"/eve/v1/eve/v1/session",
			`/eve/v1/Session/phien-${CUOC.cuaOkr}`,
			`/eve/v1/session/phien-${CUOC.cuaOkr}/`,
			"/eve/v1/session/..%2F..%2Fadmin",
			"/eve/v1/session%2F..%2Fadmin",
			"/eve/v1/dev/schedules/x",
			"/eve/v1/session/reset/stream/x",
			"/eve/v1/admin",
		]) {
			const res = await goi(NGUOI.okr, duong, CUOC.cuaOkr);
			expect({
				duong,
				status: res.status,
				body: await res.json(),
				chuyen: daChuyen.length,
				luot: daTangLuot.length,
			}).toEqual({
				duong,
				status: 404,
				body: { error: "duong-khong-phuc-vu" },
				chuyen: 0,
				luot: 0,
			});
		}
	});
	test('params y het Next giao: { path: ["session"] } mo phien; doan ma hoa duoc Next giai ma truoc', async () => {
		expect(
			pathTuUrl("http://localhost:3000/eve/agents/okr/eve/v1/session"),
		).toEqual(["session"]);
		const moi = await cuocCho(NGUOI.okr);
		phien = { user: { id: NGUOI.okr, email: "x@thu.test", name: "x" } };
		daChuyen.length = 0;
		const res = await POST(
			new Request("http://localhost:3000/eve/agents/okr/eve/v1/session", {
				method: "POST",
				headers: { "x-crm-cuoc-soan": moi },
				body: "{}",
			}),
			{ params: Promise.resolve({ path: ["session"] }) },
		);
		expect({ status: res.status, toi: daChuyen.map((c) => c.url) }).toEqual({
			status: 202,
			toi: [`${OKR_AGENT_URL}/eve/v1/session`],
		});
		const maHoa = await goi(
			NGUOI.okr,
			"/eve/v1/%73ession",
			await cuocCho(NGUOI.okr),
		);
		expect({ status: maHoa.status, toi: daChuyen.map((c) => c.url) }).toEqual({
			status: 202,
			toi: [`${OKR_AGENT_URL}/eve/v1/session`],
		});
	});
	test("cookie va authorization cua nguoi dung khong qua; chi the moi duc, khong x-crm-*", async () => {
		const theNguoiDung = "Bearer the-cua-nguoi-dung";
		await goi(
			NGUOI.okr,
			`/eve/v1/session/phien-${CUOC.cuaOkr}`,
			CUOC.cuaOkr,
			"POST",
			{
				cookie: "better-auth.session_token=bi-mat-phien",
				authorization: theNguoiDung,
				"x-crm-la": "khong-duoc-qua",
			},
		);
		const h = daChuyen[0]?.headers;
		const auth = h?.get("authorization") ?? "";
		const ok = await verifyJwtHmac(auth.replace(/^Bearer /, ""), {
			algorithm: "HS256",
			audiences: ["crm-okr-agent"],
			issuer: "crm-app",
			secret: BI_MAT,
		});
		expect({
			chuyen: daChuyen.length,
			cookie: h?.get("cookie") ?? null,
			theCu: auth === theNguoiDung,
			theMoi: ok.ok,
			xCrm: [...(h?.keys() ?? [])].filter((k) => k.startsWith("x-crm-")),
		}).toEqual({
			chuyen: 1,
			cookie: null,
			theCu: false,
			theMoi: true,
			xCrm: [],
		});
	});
	test("mo phien: ma eve thay cho giu, than giu nguyen; mo lan hai 409 da-co-phien; luot tren phien eve qua", async () => {
		const id = await cuocCho(NGUOI.okr);
		const cho = `${PHIEN_CHO_EVE}${id}`;
		const res = await goi(NGUOI.okr, "/eve/v1/session", id);
		const eve = daTraEve.at(-1) ?? "";
		expect({ status: res.status, body: await res.json() }).toEqual({
			status: 202,
			body: { ok: true, sessionId: eve, continuationToken: `eve:${eve}` },
		});
		expect(await docPhien(id)).toEqual({
			sessionId: eve,
			cacPhien: [cho, eve],
		});
		const lan2 = await goi(NGUOI.okr, "/eve/v1/session", id);
		expect({
			status: lan2.status,
			body: await lan2.json(),
			chuyen: daChuyen.length,
			luot: daTangLuot.length,
		}).toEqual({
			status: 409,
			body: { error: "da-co-phien" },
			chuyen: 0,
			luot: 0,
		});
		const luot = await goi(NGUOI.okr, `/eve/v1/session/${eve}`, id);
		expect({ status: luot.status, luot: daTangLuot }).toEqual({
			status: 202,
			luot: [id],
		});
		expect(await docPhien(id)).toEqual({
			sessionId: eve,
			cacPhien: [cho, eve],
		});
	});
	test("thu lai: cho giu moi thi mo lai duoc; phien eve cu van doc duoc", async () => {
		const id = await cuocCho(NGUOI.okr);
		await goi(NGUOI.okr, "/eve/v1/session", id);
		const eveCu = daTraEve.at(-1) ?? "";
		const choMoi = `${PHIEN_CHO_EVE}${id}-lai`;
		expect(await capNhatPhien(db, id, choMoi)).toEqual({ doi: true });
		const res = await goi(NGUOI.okr, "/eve/v1/session", id);
		const eveMoi = daTraEve.at(-1) ?? "";
		expect(res.status).toBe(202);
		expect(await docPhien(id)).toEqual({
			sessionId: eveMoi,
			cacPhien: [`${PHIEN_CHO_EVE}${id}`, eveCu, choMoi, eveMoi],
		});
		expect(
			(await goi(NGUOI.okr, `/eve/v1/session/${eveCu}/stream`, id, "GET"))
				.status,
		).toBe(202);
	});
	test("sau thu lai: gui tiep va huy luot tren phien cu → 409 phien-da-thay, khong toi tro ly, khong dem luot; doc luong phien cu van qua; gui tren phien song qua", async () => {
		const id = await cuocCho(NGUOI.okr);
		await goi(NGUOI.okr, "/eve/v1/session", id);
		const eveCu = daTraEve.at(-1) ?? "";
		await capNhatPhien(db, id, `${PHIEN_CHO_EVE}${id}-lai`);
		await goi(NGUOI.okr, "/eve/v1/session", id);
		const eveMoi = daTraEve.at(-1) ?? "";
		const ghiCu = [];
		for (const duong of [
			`/eve/v1/session/${eveCu}`,
			`/eve/v1/session/${eveCu}/cancel`,
		]) {
			const res = await goi(NGUOI.okr, duong, id);
			ghiCu.push({
				duong,
				status: res.status,
				body: await res.json(),
				chuyen: daChuyen.length,
				luot: daTangLuot.length,
			});
		}
		expect(ghiCu).toEqual(
			[`/eve/v1/session/${eveCu}`, `/eve/v1/session/${eveCu}/cancel`].map(
				(duong) => ({
					duong,
					status: 409,
					body: { error: "phien-da-thay" },
					chuyen: 0,
					luot: 0,
				}),
			),
		);
		const docCu = await goi(
			NGUOI.okr,
			`/eve/v1/session/${eveCu}/stream`,
			id,
			"GET",
		);
		const guiMoi = await goi(NGUOI.okr, `/eve/v1/session/${eveMoi}`, id);
		expect({
			docCu: docCu.status,
			guiMoi: guiMoi.status,
			luot: daTangLuot,
		}).toEqual({ docCu: 202, guiMoi: 202, luot: [id] });
	});
	test("ma eve chi o than cung doc duoc; khong doc duoc thi 502 co ten, cuoc giu cho giu", async () => {
		const id = await cuocCho(NGUOI.okr);
		traVe = "chi-than";
		const res = await goi(NGUOI.okr, "/eve/v1/session", id);
		traVe = "ca-hai";
		expect(res.status).toBe(202);
		expect((await docPhien(id)).sessionId).toBe(daTraEve.at(-1) ?? "");
		const id2 = await cuocCho(NGUOI.okr);
		traVe = "khong-co";
		const hong = await goi(NGUOI.okr, "/eve/v1/session", id2);
		traVe = "ca-hai";
		expect({ status: hong.status, body: await hong.json() }).toEqual({
			status: 502,
			body: { error: "khong-doc-duoc-phien" },
		});
		expect((await docPhien(id2)).sessionId).toBe(`${PHIEN_CHO_EVE}${id2}`);
	});
	test("tro ly tu choi mo phien thi tra nguyen, cuoc giu cho giu", async () => {
		const id = await cuocCho(NGUOI.okr);
		traVe = "loi";
		const res = await goi(NGUOI.okr, "/eve/v1/session", id);
		traVe = "ca-hai";
		expect(res.status).toBe(500);
		expect((await docPhien(id)).sessionId).toBe(`${PHIEN_CHO_EVE}${id}`);
	});
	test("hai lan mo cung luc tu mot cho giu: mot lan qua, lan kia 409 va khong tra phien", async () => {
		const id = await cuocCho(NGUOI.okr);
		const [a, b] = await Promise.all([
			goi(NGUOI.okr, "/eve/v1/session", id),
			goi(NGUOI.okr, "/eve/v1/session", id),
		]);
		const ketQua = await Promise.all(
			[a, b].map(async (r) => ({ status: r.status, body: await r.json() })),
		);
		expect(ketQua.map((k) => k.status).sort()).toEqual([202, 409]);
		const qua = ketQua.find((k) => k.status === 202);
		expect(ketQua.find((k) => k.status === 409)?.body).toEqual({
			error: "da-co-phien",
		});
		const sau = await docPhien(id);
		expect(sau.sessionId).toBe(qua?.body.sessionId);
		expect([...sau.cacPhien].sort()).toEqual(
			[`${PHIEN_CHO_EVE}${id}`, ...daTraEve.slice(-2)].sort(),
		);
	});
	test("dua tat dinh: cuoc doi sang cho giu khac trong luc tro ly tra loi → 409, cuoc giu cho giu moi, ma eve vao cacPhien", async () => {
		const id = await cuocCho(NGUOI.okr);
		const cho = `${PHIEN_CHO_EVE}${id}`;
		const choKhac = `${PHIEN_CHO_EVE}${id}-khac`;
		duaVoi = { id, cho: choKhac };
		const res = await goi(NGUOI.okr, "/eve/v1/session", id);
		duaVoi = null;
		const eve = daTraEve.at(-1) ?? "";
		expect({ status: res.status, body: await res.json() }).toEqual({
			status: 409,
			body: { error: "da-co-phien" },
		});
		expect(await docPhien(id)).toEqual({
			sessionId: choKhac,
			cacPhien: [cho, choKhac, eve],
		});
	});
	test("ghi phien hong → 502 co ten, cuoc giu cho giu, ma eve vao cacPhien", async () => {
		const id = await cuocCho(NGUOI.okr);
		const cho = `${PHIEN_CHO_EVE}${id}`;
		ghiHong = true;
		const res = await goi(NGUOI.okr, "/eve/v1/session", id);
		ghiHong = false;
		const eve = daTraEve.at(-1) ?? "";
		expect({ status: res.status, body: await res.json() }).toEqual({
			status: 502,
			body: { error: "khong-ghi-duoc-phien" },
		});
		expect(await docPhien(id)).toEqual({
			sessionId: cho,
			cacPhien: [cho, eve],
		});
	});
	test("doi chung: cua cu /eve/v1 van 403 vai okr", async () => {
		phien = { user: { id: NGUOI.okr, email: "x@thu.test", name: "x" } };
		daChuyen.length = 0;
		const res = await POST_CU(
			new Request("http://localhost:3000/eve/v1/session", {
				method: "POST",
				body: "{}",
			}),
		);
		expect({
			status: res.status,
			error: ((await res.json()) as { error?: string }).error,
			chuyen: daChuyen.length,
		}).toEqual({ status: 403, error: KHONG_TRONG_PHAM_VI, chuyen: 0 });
	});
});
