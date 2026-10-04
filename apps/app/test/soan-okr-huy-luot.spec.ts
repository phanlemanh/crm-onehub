import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import * as cuocSoan from "@crm/db/okr-cuoc-soan";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import { AGENT_GIA, BI_MAT, taoKhung, yeuCau } from "./khung-cua-hoan";

const k = taoKhung("tl45-huy");
const daGoi: string[] = [];

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
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
	daGoi.push(String(input));
	return k.fetchGia(input, init);
}) as typeof fetch;

const { POST } = await import("@/app/eve/agents/okr/eve/v1/[...path]/route");

async function gui(duongCua: string, cuocSoanId: string) {
	const { request, ctx } = yeuCau(duongCua, cuocSoanId, OKR_SOAN_CUA.header);
	return POST(request, ctx);
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
	for (const n of [0, 5]) {
		test(`huy-qua-cua: huy toi tro ly va khong tinh luot n=${n}`, async () => {
			const { id, duongCua } = await k.cuoc("gui-tiep", n);
			k.trangThai.ketQua = 200;
			daGoi.length = 0;
			const res = await gui(`${duongCua}/cancel`, id);
			const than = await res.json();
			expect(daGoi.length, `huy-khong-toi-tro-ly n=${n}`).toBe(1);
			expect(daGoi[0]?.endsWith(`${duongCua}/cancel`)).toBe(true);
			expect(res.status).toBe(200);
			expect(than).toHaveProperty("ok", true);
			expect((await k.docCuoc(id)).soLuot, `huy-tinh-luot n=${n}`).toBe(n);
		});

		test(`huy-qua-cua: doi chung gui tiep thi tinh luot n=${n}`, async () => {
			const { id, duongCua } = await k.cuoc("gui-tiep", n);
			k.trangThai.ketQua = 202;
			const res = await gui(duongCua, id);
			expect(res.status).toBe(202);
			expect((await k.docCuoc(id)).soLuot).toBe(n + 1);
		});
	}
});
