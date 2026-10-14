import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import { taoCuocHoi } from "@crm/db/okr-cuoc-hoi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { verifyJwtHmac } from "eve/channels/auth";

const suffix = `${process.env.TEST_RUN_ID ?? "cua-hoi"}-hoi`;
const NGUOI = {
	member: `${suffix}-member`,
	okr: `${suffix}-okr`,
	khac: `${suffix}-khac`,
} as const;
const NGOAI = `${suffix}-ngoai`;
const BI_MAT = "bi-mat-cua-okr-hoi-du-dai-32-ky-tu";
const AGENT_GIA = "http://127.0.0.1:65531";

type KetLuot =
	| { ok: true }
	| { ok: false; lyDo: "het-luot-ngay" | "het-tran-thang" };

let phien: { user: { id: string; email: string; name: string } } | null = null;
let ketLuot: KetLuot = { ok: true };
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
			hoiTangLuot: {
				mutate: async (vao: { cuocHoiId: string }) => {
					daTangLuot.push(vao.cuocHoiId);
					return ketLuot;
				},
			},
		},
	}),
}));

process.env.OKR_AGENT_BRIDGE_SECRET = BI_MAT;
process.env.OKR_AGENT_URL = AGENT_GIA;
let soEve = 0;
const fetchThat = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
	daChuyen.push({ url: String(input), headers: new Headers(init?.headers) });
	const eve = `${suffix}-eve-${++soEve}`;
	return Response.json(
		{ ok: true, sessionId: eve },
		{ status: 202, headers: { "x-eve-session-id": eve } },
	);
}) as typeof fetch;

const { POST } = await import("@/app/eve/agents/okr/eve/v1/[...path]/route");

const cuoc: Record<string, string> = {};

const goi = (duong: string[], hdr: Record<string, string>, method = "POST") =>
	POST(
		new Request(`http://localhost/eve/agents/okr/eve/v1/${duong.join("/")}`, {
			method,
			headers: { "content-type": "application/json", ...hdr },
			body:
				method === "GET"
					? undefined
					: JSON.stringify({ message: "KR nào trượt?" }),
		}),
		{ params: Promise.resolve({ path: duong }) },
	);

const vao = (id: string) => {
	phien = { user: { id, email: `${id}@thu.test`, name: id } };
};
const hdrHoi = (id: string) => ({ "x-crm-cuoc-hoi": id });

beforeAll(async () => {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
		update: {},
	});
	for (const [vai, id] of Object.entries(NGUOI)) {
		await db.user.create({
			data: { id, name: id, email: `${id}@thu.test` },
		});
		await db.member.create({
			data: {
				id: `${id}-mem`,
				organizationId: WORKSPACE_ID,
				userId: id,
				role: vai === "okr" ? "okr" : "member",
				createdAt: new Date(),
			},
		});
		cuoc[vai] = (await taoCuocHoi(db, id)).id;
	}
	await db.user.create({
		data: { id: NGOAI, name: NGOAI, email: `${NGOAI}@thu.test` },
	});
});

afterAll(async () => {
	globalThis.fetch = fetchThat;
	const ids = [...Object.values(NGUOI), NGOAI];
	await db.okrCuocHoi.deleteMany({ where: { nguoiHoiUserId: { in: ids } } });
	await db.member.deleteMany({ where: { userId: { in: ids } } });
	await db.user.deleteMany({ where: { id: { in: ids } } });
});

describe("hdo cua hoi", () => {
	test.each(["member", "okr"] as const)(
		"vai %s mo phien cua cuoc minh: chuyen, the mang okr-hoi, ghi ma phien eve",
		async (vai) => {
			const id = NGUOI[vai];
			vao(id);
			ketLuot = { ok: true };
			const truoc = daChuyen.length;
			const ra = await goi(["session"], hdrHoi(cuoc[vai] ?? ""));
			expect(ra.status).toBe(202);
			expect(daChuyen.length).toBe(truoc + 1);
			const the = daChuyen.at(-1)?.headers.get("authorization")?.slice(7) ?? "";
			const kq = await verifyJwtHmac(the, {
				algorithm: "HS256",
				audiences: ["crm-okr-agent"],
				issuer: "crm-app",
				secret: BI_MAT,
			});
			expect(kq.ok).toBe(true);
			if (kq.ok)
				expect(kq.sessionAuth.attributes).toMatchObject({
					purpose: "okr-hoi",
					cuocHoiId: cuoc[vai],
				});
			const sau = await db.okrCuocHoi.findUniqueOrThrow({
				where: { id: cuoc[vai] ?? "" },
			});
			expect(sau.sessionId.startsWith("cho-eve:")).toBe(false);
		},
	);

	test("cuoc hoi cua nguoi khac: 403, khong dem luot, khong chuyen", async () => {
		vao(NGUOI.okr);
		const truocLuot = daTangLuot.length;
		const truoc = daChuyen.length;
		const ra = await goi(["session"], hdrHoi(cuoc.khac ?? ""));
		expect(ra.status).toBe(403);
		expect(((await ra.json()) as { error: string }).error).toBe(
			"cuoc-khong-thuoc-ban",
		);
		expect(daTangLuot.length).toBe(truocLuot);
		expect(daChuyen.length).toBe(truoc);
	});

	test("duong phien la: 403", async () => {
		vao(NGUOI.member);
		const ra = await goi(
			["session", "phien-la-khong-co"],
			hdrHoi(cuoc.member ?? ""),
		);
		expect(ra.status).toBe(403);
	});

	test("nguoi khong co hang member: 403", async () => {
		vao(NGOAI);
		const ra = await goi(["session"], hdrHoi(cuoc.member ?? ""));
		expect(ra.status).toBe(403);
	});

	test("hai header cuoc cung luc: 400", async () => {
		vao(NGUOI.member);
		const ra = await goi(["session"], {
			...hdrHoi(cuoc.member ?? ""),
			"x-crm-cuoc-soan": "cuoc-soan-bat-ky-1",
		});
		expect(ra.status).toBe(400);
	});

	test("hdo-tran: het luot ngay va het tran thang tra 429, khong chuyen", async () => {
		vao(NGUOI.khac);
		ketLuot = { ok: true };
		const dau = daChuyen.length;
		expect((await goi(["session"], hdrHoi(cuoc.khac ?? ""))).status).toBe(202);
		expect(daChuyen.length).toBe(dau + 1);
		const phienEve = (
			await db.okrCuocHoi.findUniqueOrThrow({ where: { id: cuoc.khac ?? "" } })
		).sessionId;
		for (const lyDo of ["het-luot-ngay", "het-tran-thang"] as const) {
			ketLuot = { ok: false, lyDo };
			const ra = await goi(["session", phienEve], hdrHoi(cuoc.khac ?? ""));
			expect(ra.status).toBe(429);
			expect(((await ra.json()) as { error: string }).error).toBe(lyDo);
			expect(daChuyen.length).toBe(dau + 1);
		}
	});
});
