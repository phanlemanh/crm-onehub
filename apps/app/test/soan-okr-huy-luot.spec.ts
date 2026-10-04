import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import * as cuocSoan from "@crm/db/okr-cuoc-soan";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import { AGENT_GIA, BI_MAT, taoKhung, yeuCau } from "./khung-cua-hoan";

const k = taoKhung("tl45-huy");
type LoiGoi = { url: string; method: string; than: string };
const daGoi: LoiGoi[] = [];
type TraVe = { status: number; than: object };
let traHuy: TraVe | null = null;

const serverThat = await import("next/server");
mock.module("next/server", () => ({
	...serverThat,
	connection: async () => undefined,
}));
const sessionThat = await import("@/lib/session");
mock.module("@/lib/session", () => ({
	...sessionThat,
	getSession: async () => k.trangThai.phien,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({}),
	getServerTrpc: () => ({}),
	getServerTrpcClient: () => ({
		okr: {
			soanTangLuot: {
				mutate: (vao: { cuocSoanId: string }) =>
					cuocSoan.tangLuot(db, vao.cuocSoanId),
			},
		},
	}),
}));
mock.module("@crm/db/okr-cuoc-soan", () => ({ ...cuocSoan }));

const BIEN = ["OKR_AGENT_BRIDGE_SECRET", "OKR_AGENT_URL"] as const;
const bienThat = BIEN.map((ten) => [ten, process.env[ten]] as const);
process.env.OKR_AGENT_BRIDGE_SECRET = BI_MAT;
process.env.OKR_AGENT_URL = AGENT_GIA;
const fetchThat = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
	const url = String(input);
	const than = init?.body ? await new Response(init.body).text() : "";
	daGoi.push({ url, method: init?.method ?? "GET", than });
	if (url.endsWith("/cancel") && traHuy)
		return Response.json(traHuy.than, { status: traHuy.status });
	return k.fetchGia(input, init);
}) as typeof fetch;

const { POST } = await import("@/app/eve/agents/okr/eve/v1/[...path]/route");

async function gui(duongCua: string, cuocSoanId: string, than = "{}") {
	const { request, ctx } = yeuCau(duongCua, cuocSoanId, OKR_SOAN_CUA.header);
	return POST(new Request(request, { body: than }), ctx);
}

beforeAll(async () => {
	await k.gieo();
	k.dangNhap();
});
afterAll(async () => {
	globalThis.fetch = fetchThat;
	for (const [ten, giaTri] of bienThat) {
		if (giaTri === undefined) delete process.env[ten];
		else process.env[ten] = giaTri;
	}
	await k.don();
});

describe("huy-qua-cua", () => {
	const CA = (phien: string): Array<{ ten: string; tra: TraVe }> => [
		{
			ten: "accepted",
			tra: {
				status: 202,
				than: { ok: true, sessionId: phien, status: "accepted" },
			},
		},
		{
			ten: "no-active-turn",
			tra: {
				status: 202,
				than: { ok: true, sessionId: phien, status: "no_active_turn" },
			},
		},
		{
			ten: "loi-500",
			tra: {
				status: 500,
				than: { ok: false, error: "Failed to cancel the turn." },
			},
		},
	];
	for (const n of [0, 5]) {
		for (const ten of ["accepted", "no-active-turn", "loi-500"]) {
			test(`huy-qua-cua: huy toi tro ly nguyen ven va khong tinh luot n=${n} ${ten}`, async () => {
				const { id, duongCua } = await k.cuoc("gui-tiep", n);
				const phien = duongCua.split("/").at(-1) ?? "";
				const ca = CA(phien).find((x) => x.ten === ten);
				traHuy = ca?.tra ?? null;
				daGoi.length = 0;
				const res = await gui(
					`${duongCua}/cancel`,
					id,
					JSON.stringify({ turnId: "luot-7" }),
				);
				const than = await res.json();
				traHuy = null;
				const toiTroLy = daGoi.filter((g) =>
					g.url.endsWith(`${duongCua}/cancel`),
				);
				expect(daGoi.length, `huy-khong-toi-tro-ly n=${n}`).toBe(1);
				expect(toiTroLy.length).toBe(1);
				expect(toiTroLy[0]?.method).toBe("POST");
				expect(
					JSON.parse(toiTroLy[0]?.than ?? "null"),
					"than-yeu-cau-mat",
				).toEqual({
					turnId: "luot-7",
				});
				expect(res.status, `status-khong-bang-tro-ly ${ten}`).toBe(
					ca?.tra.status ?? -1,
				);
				expect(than, `than-khong-bang-tro-ly ${ten}`).toEqual(
					ca?.tra.than ?? null,
				);
				expect((await k.docCuoc(id)).soLuot, `huy-tinh-luot n=${n}`).toBe(n);
			});
		}

		test(`huy-qua-cua: doi chung gui tiep thi tinh luot n=${n}`, async () => {
			const { id, duongCua } = await k.cuoc("gui-tiep", n);
			k.trangThai.ketQua = 202;
			const res = await gui(duongCua, id);
			expect(res.status).toBe(202);
			expect((await k.docCuoc(id)).soLuot).toBe(n + 1);
		});
	}
});
