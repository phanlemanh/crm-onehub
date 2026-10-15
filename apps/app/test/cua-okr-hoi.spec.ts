import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { NOT_A_MEMBER } from "@crm/auth";
import { db } from "@crm/db";
import { ghiPhienEve, taoCuocHoi } from "@crm/db/okr-cuoc-hoi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { OKR_HOI_TRAN } from "@crm/validation/okr-tra-loi";
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

type DichVuHoi = {
	tangLuot: (
		userId: string,
		cuocHoiId: string,
	) => Promise<{ ok: true } | { ok: false; lyDo: string }>;
};
type BuocChiPhi = {
	type: "step.completed";
	data: {
		usage: { inputTokens: number; outputTokens: number; costUsd: number };
	};
	meta: { id: string; at: string };
};
type NguCanhChiPhi = {
	session: {
		id: string;
		auth: {
			initiator: {
				principalId: string;
				principalType: "user";
				attributes: Record<string, string>;
			};
			current: null;
		};
	};
	channel: { kind: "eve" };
};
type XuLyChiPhi = (e: BuocChiPhi, c: NguCanhChiPhi) => Promise<void>;

const DUONG_DICH_VU = "../../api/src/okr/hoi.service.ts";
const DUONG_HOOK = "../../agent-okr/agent/hooks/chi-phi.ts";
const { HoiService } = await import(DUONG_DICH_VU);
const hoi: DichVuHoi = new HoiService(db);
const hookChiPhi = (await import(DUONG_HOOK)).default as {
	events: { "step.completed": XuLyChiPhi };
};

let phien: { user: { id: string; email: string; name: string } } | null = null;
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
					return hoi.tangLuot(phien?.user.id ?? "", vao.cuocHoiId);
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
	cuoc.ngoai = (await taoCuocHoi(db, NGOAI)).id;
});

const loiCua = async (ra: Response) =>
	((await ra.json()) as { error: string }).error;

async function tuChoiKhongDemKhongChuyen(
	ra: Promise<Response>,
	status: number,
	ma: string,
) {
	const truocLuot = daTangLuot.length;
	const truoc = daChuyen.length;
	const kq = await ra;
	expect({ status: kq.status, ma: await loiCua(kq) }).toEqual({ status, ma });
	expect(daTangLuot.length).toBe(truocLuot);
	expect(daChuyen.length).toBe(truoc);
}

afterAll(async () => {
	globalThis.fetch = fetchThat;
	const ids = [...Object.values(NGUOI), NGOAI];
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: suffix } } });
	await db.okrLuotHoi.deleteMany({ where: { userId: { in: ids } } });
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

	test("cuoc hoi cua nguoi khac: 403 cuoc-khong-thuoc-ban, khong dem luot, khong chuyen", async () => {
		vao(NGUOI.okr);
		await tuChoiKhongDemKhongChuyen(
			goi(["session"], hdrHoi(cuoc.khac ?? "")),
			403,
			"cuoc-khong-thuoc-ban",
		);
	});

	test("duong phien la: 403 phien-khong-thuoc-cuoc, khong dem luot, khong chuyen", async () => {
		vao(NGUOI.member);
		await tuChoiKhongDemKhongChuyen(
			goi(["session", "phien-la-khong-co"], hdrHoi(cuoc.member ?? "")),
			403,
			"phien-khong-thuoc-cuoc",
		);
	});

	test("phien cu da bi thay trong cuoc: 409 phien-da-thay, khong dem luot, khong chuyen", async () => {
		vao(NGUOI.member);
		const cu = `${suffix}-eve-cu`;
		await ghiPhienEve(db, cuoc.member ?? "", cu);
		const sau = await db.okrCuocHoi.findUniqueOrThrow({
			where: { id: cuoc.member ?? "" },
		});
		expect(sau.sessionId).not.toBe(cu);
		expect(sau.cacPhien).toContain(cu);
		await tuChoiKhongDemKhongChuyen(
			goi(["session", cu], hdrHoi(cuoc.member ?? "")),
			409,
			"phien-da-thay",
		);
	});

	test("nguoi khong co hang member hoi tren cuoc cua chinh minh: 403 NOT_A_MEMBER, khong dem luot, khong chuyen", async () => {
		vao(NGOAI);
		await tuChoiKhongDemKhongChuyen(
			goi(["session"], hdrHoi(cuoc.ngoai ?? "")),
			403,
			NOT_A_MEMBER,
		);
	});

	test("hai header cuoc cung luc: 400", async () => {
		vao(NGUOI.member);
		const ra = await goi(["session"], {
			...hdrHoi(cuoc.member ?? ""),
			"x-crm-cuoc-soan": "cuoc-soan-bat-ky-1",
		});
		expect(ra.status).toBe(400);
	});

	test("hdo-tran: luot 39 thi cau 40 qua, cau 41 tra 429 het-luot-ngay; tran thang cham qua hook chi-phi thi 429 het-tran-thang", async () => {
		vao(NGUOI.khac);
		const dau = daChuyen.length;
		expect((await goi(["session"], hdrHoi(cuoc.khac ?? ""))).status).toBe(202);
		const phienEve = (
			await db.okrCuocHoi.findUniqueOrThrow({ where: { id: cuoc.khac ?? "" } })
		).sessionId;
		const demLuot = () =>
			db.okrLuotHoi.count({ where: { userId: NGUOI.khac } });
		while ((await demLuot()) < OKR_HOI_TRAN.cauMoiNgay - 1)
			expect((await hoi.tangLuot(NGUOI.khac, cuoc.khac ?? "")).ok).toBe(true);
		expect(await demLuot()).toBe(OKR_HOI_TRAN.cauMoiNgay - 1);
		const cau40 = await goi(["session", phienEve], hdrHoi(cuoc.khac ?? ""));
		expect(cau40.status).toBe(202);
		expect(daChuyen.length).toBe(dau + 2);
		expect(await demLuot()).toBe(OKR_HOI_TRAN.cauMoiNgay);
		const cau41 = await goi(["session", phienEve], hdrHoi(cuoc.khac ?? ""));
		expect({ status: cau41.status, ma: await loiCua(cau41) }).toEqual({
			status: 429,
			ma: "het-luot-ngay",
		});
		expect(daChuyen.length).toBe(dau + 2);
		expect(await demLuot()).toBe(OKR_HOI_TRAN.cauMoiNgay);

		vao(NGUOI.member);
		await hookChiPhi.events["step.completed"](
			{
				type: "step.completed",
				data: {
					usage: {
						inputTokens: 1000,
						outputTokens: 100,
						costUsd: OKR_HOI_TRAN.usdMoiThang,
					},
				},
				meta: { id: `${suffix}-buoc-tran`, at: new Date().toISOString() },
			},
			{
				session: {
					id: `${suffix}-phien-tran`,
					auth: {
						initiator: {
							principalId: NGUOI.member,
							principalType: "user",
							attributes: {
								purpose: "okr-hoi",
								cuocHoiId: cuoc.member ?? "",
								vai: "member",
							},
						},
						current: null,
					},
				},
				channel: { kind: "eve" },
			},
		);
		const hang = await db.aiChiPhi.findMany({
			where: { id: { startsWith: suffix } },
			select: { tinhNang: true },
		});
		expect(hang).toEqual([{ tinhNang: OKR_HOI_TRAN.tinhNang }]);
		const truoc = daChuyen.length;
		const thang = await goi(
			[
				"session",
				(
					await db.okrCuocHoi.findUniqueOrThrow({
						where: { id: cuoc.member ?? "" },
					})
				).sessionId,
			],
			hdrHoi(cuoc.member ?? ""),
		);
		expect({ status: thang.status, ma: await loiCua(thang) }).toEqual({
			status: 429,
			ma: "het-tran-thang",
		});
		expect(daChuyen.length).toBe(truoc);
	});
});
