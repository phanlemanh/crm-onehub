import {
	afterAll,
	beforeAll,
	describe,
	expect,
	mock,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import * as cuocSoan from "@crm/db/okr-cuoc-soan";
import { CUA_OKR } from "@/lib/cua-okr-config";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import { AGENT_GIA, BI_MAT, taoKhung, yeuCau } from "./khung-cua-hoan";

const k = taoKhung("r1h-hong");
const co = { hoanHong: false, ghiHong: false };

const hoanThat = cuocSoan.hoanLuot;
const capNhatThat = cuocSoan.capNhatPhien;
const tangThat = cuocSoan.tangLuot;

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
				mutate: (vao: { cuocSoanId: string }) => tangThat(db, vao.cuocSoanId),
			},
		},
	}),
}));
mock.module("@crm/db/okr-cuoc-soan", () => ({
	...cuocSoan,
	hoanLuot: async (...vao: Parameters<typeof hoanThat>) => {
		if (co.hoanHong) throw new Error("kho hong khi hoan");
		return hoanThat(...vao);
	},
	capNhatPhien: async (...vao: Parameters<typeof capNhatThat>) => {
		if (co.ghiHong) throw new Error("kho hong khi ghi phien");
		return capNhatThat(...vao);
	},
}));

const BIEN = ["OKR_AGENT_BRIDGE_SECRET", "OKR_AGENT_URL"] as const;
const bienThat = BIEN.map((ten) => [ten, process.env[ten]] as const);
process.env.OKR_AGENT_BRIDGE_SECRET = BI_MAT;
process.env.OKR_AGENT_URL = AGENT_GIA;
const fetchThat = globalThis.fetch;
globalThis.fetch = k.fetchGia as typeof fetch;

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
	co.hoanHong = false;
	co.ghiHong = false;
	globalThis.fetch = fetchThat;
	for (const [ten, giaTri] of bienThat) {
		if (giaTri === undefined) delete process.env[ten];
		else process.env[ten] = giaTri;
	}
	await k.don();
});

describe("hoan-hong", () => {
	test("hoan-hong: kho hong khi hoan -> van tra loi goc, khong luot, ghi mot dong canh bao", async () => {
		const { id, duongCua } = await k.cuoc("gui-tiep", 2);
		const ghi = spyOn(console, "error").mockImplementation(() => {});
		co.hoanHong = true;
		k.trangThai.ketQua = 502;
		const res = await gui(duongCua, id);
		co.hoanHong = false;
		k.trangThai.ketQua = 202;
		const loiGoi = ghi.mock.calls.map((goi) => goi.map(String).join(" "));
		ghi.mockRestore();
		expect(res.status, "hoan-hong status").toBe(502);
		expect(await res.json(), "hoan-hong than").not.toHaveProperty("luot");
		expect(
			loiGoi.filter(
				(dong) => dong.includes("hoan-luot-hong") && dong.includes(id),
			),
			"hoan-hong khong ghi canh bao",
		).toHaveLength(1);
		expect((await k.docCuoc(id)).soLuot).toBe(3);
	});

	test("hoan-hong: doi chung kho lanh -> luot da-hoan, soLuot giu nguyen", async () => {
		const { id, duongCua } = await k.cuoc("gui-tiep", 2);
		k.trangThai.ketQua = 502;
		const res = await gui(duongCua, id);
		k.trangThai.ketQua = 202;
		expect(await res.json()).toEqual({
			error: CUA_OKR.loi.troLyLoi,
			luot: CUA_OKR.luotDaHoan,
		});
		expect((await k.docCuoc(id)).soLuot).toBe(2);
	});
});

describe("mo-phien-khong-dung-duoc", () => {
	test("mo-phien-khong-dung-duoc: ghi phien hong -> 502 co luot, khong tru", async () => {
		const { id, duongCua } = await k.cuoc("mo-phien", 0);
		co.ghiHong = true;
		k.trangThai.ketQua = 202;
		const res = await gui(duongCua, id);
		co.ghiHong = false;
		expect(
			{ status: res.status, than: await res.json() },
			"tru-luot-mo-phien khong-ghi-duoc-phien",
		).toEqual({
			status: 502,
			than: { error: CUA_OKR.loi.khongGhiDuocPhien, luot: CUA_OKR.luotDaHoan },
		});
		expect(
			(await k.docCuoc(id)).soLuot,
			"tru-luot-mo-phien khong-ghi-duoc-phien",
		).toBe(0);
	});
});
