import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import * as cuocSoan from "@crm/db/okr-cuoc-soan";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { CUA_OKR } from "@/lib/cua-okr-config";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import {
	AGENT_GIA,
	BI_MAT,
	CHO_TRO_LY_THU_MS,
	type KetQuaTroLy,
	MAU_LUONG,
	taoKhung,
	yeuCau,
} from "./khung-cua-hoan";

const k = taoKhung("r1h-tru");
const LUOT_TOI_DA = TRO_LY_OKR_TRAN.soan.luotMoiCuoc;
const SAN_O = 44;

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
mock.module("@/lib/cua-okr-config", () => ({
	CUA_OKR: { ...CUA_OKR, choTroLyMs: CHO_TRO_LY_THU_MS },
}));

const BIEN = ["OKR_AGENT_BRIDGE_SECRET", "OKR_AGENT_URL"] as const;
const bienThat = BIEN.map((ten) => [ten, process.env[ten]] as const);
process.env.OKR_AGENT_BRIDGE_SECRET = BI_MAT;
process.env.OKR_AGENT_URL = AGENT_GIA;
const fetchThat = globalThis.fetch;
globalThis.fetch = k.fetchGia as typeof fetch;

const { GET, POST } = await import(
	"@/app/eve/agents/okr/eve/v1/[...path]/route"
);

async function gui(duongCua: string, cuocSoanId: string, signal?: AbortSignal) {
	const { request, ctx } = yeuCau(
		duongCua,
		cuocSoanId,
		OKR_SOAN_CUA.header,
		signal,
	);
	return POST(request, ctx);
}

const docLuot = async (id: string) => (await k.docCuoc(id)).soLuot;

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

const KET_QUA_HONG: readonly KetQuaHong[] = [
	"nem",
	"treo",
	400,
	401,
	403,
	404,
	409,
	422,
	500,
	502,
	503,
];
const DUONG = ["mo-phien", "gui-tiep"] as const;
const N = [0, LUOT_TOI_DA - 1] as const;
const O = DUONG.flatMap((duong) =>
	KET_QUA_HONG.flatMap((ket) => N.map((n) => ({ duong, ket, n }))),
);

type KetQuaHong = Exclude<KetQuaTroLy, "luong-cham">;

function statusMongDoi(ket: KetQuaHong): number {
	if (ket === "nem") return 502;
	if (ket === "treo") return 504;
	return ket;
}

type ThanLoiCua = { error: string; detail?: string; luot?: string };

function thanMongDoi(ket: KetQuaHong): ThanLoiCua {
	const luot = CUA_OKR.luotDaHoan;
	if (ket === "nem")
		return {
			error: CUA_OKR.loi.khongNoiDuoc,
			detail: "connect ECONNREFUSED tro-ly-gia",
			luot,
		};
	if (ket === "treo") return { error: CUA_OKR.loi.quaHan, luot };
	if (ket >= 500) return { error: CUA_OKR.loi.troLyLoi, luot };
	return { error: CUA_OKR.loi.troLyTuChoi, luot };
}

describe("hong-khong-tru", () => {
	test("hong-khong-tru: san ma tran", () => {
		if (O.length < SAN_O) throw new Error("ma tran rong");
		expect(O.length).toBe(SAN_O);
	});

	for (const { duong, ket, n } of O) {
		test(`hong-khong-tru: ${duong} ${ket} n=${n}`, async () => {
			const { id, duongCua } = await k.cuoc(duong, n);
			k.trangThai.ketQua = ket;
			k.trangThai.soLanFetch = 0;
			const res = await gui(duongCua, id);
			k.trangThai.ketQua = 202;
			expect(
				await docLuot(id),
				`tru-luot-khi-hong ${duong} ${ket} n=${n}`,
			).toBe(n);
			expect(res.status, `status ${duong} ${ket}`).toBe(statusMongDoi(ket));
			expect(await res.json(), `than ${duong} ${ket}`).toEqual(
				thanMongDoi(ket),
			);
			expect(k.trangThai.soLanFetch).toBe(1);
		});
	}

	for (const duong of DUONG) {
		test(`hong-khong-tru: doi chung ${duong} 202 thi tinh luot`, async () => {
			const { id, duongCua } = await k.cuoc(duong, 0);
			k.trangThai.ketQua = 202;
			const res = await gui(duongCua, id);
			expect(res.status).toBe(202);
			expect(await docLuot(id)).toBe(1);
			expect(await res.json()).not.toHaveProperty("luot");
		});
	}
});

describe("mo-phien-khong-dung-duoc", () => {
	test("mo-phien-khong-dung-duoc: tro ly 202 khong ma phien -> 502 co luot, khong tru", async () => {
		const { id, duongCua } = await k.cuoc("mo-phien", 0);
		const fetchCu = globalThis.fetch;
		globalThis.fetch = (async () =>
			Response.json({ ok: true }, { status: 202 })) as unknown as typeof fetch;
		const res = await gui(duongCua, id);
		globalThis.fetch = fetchCu;
		expect(
			{ status: res.status, than: await res.json() },
			"tru-luot-mo-phien khong-doc-duoc-phien",
		).toEqual({
			status: 502,
			than: { error: CUA_OKR.loi.khongDocDuocPhien, luot: CUA_OKR.luotDaHoan },
		});
		expect(await docLuot(id), "tru-luot-mo-phien khong-doc-duoc-phien").toBe(0);
	});

	test("mo-phien-khong-dung-duoc: thua dua -> 409 co luot, khong tru, ma eve vao cacPhien", async () => {
		const { id, duongCua } = await k.cuoc("mo-phien", 0);
		const choKhac = `${(await k.docCuoc(id)).sessionId}-khac`;
		k.trangThai.truocKhiTra = async () => {
			const truoc = await k.docCuoc(id);
			await cuocSoan.capNhatPhien(db, id, choKhac, truoc.sessionId);
		};
		const res = await gui(duongCua, id);
		k.trangThai.truocKhiTra = null;
		const eve = `${k.suffix}-eve-${k.trangThai.soLanFetch}`;
		expect(
			{ status: res.status, than: await res.json() },
			"tru-luot-mo-phien da-co-phien",
		).toEqual({
			status: 409,
			than: { error: CUA_OKR.loi.daCoPhien, luot: CUA_OKR.luotDaHoan },
		});
		const sau = await k.docCuoc(id);
		expect(sau.soLuot, "tru-luot-mo-phien da-co-phien").toBe(0);
		expect(sau.cacPhien).toContain(eve);
	});

	test("mo-phien-khong-dung-duoc: doi chung 202 co ma phien -> tinh luot, ghi phien", async () => {
		const { id, duongCua } = await k.cuoc("mo-phien", 0);
		k.trangThai.ketQua = 202;
		const res = await gui(duongCua, id);
		const than = (await res.json()) as { sessionId: string };
		expect(res.status).toBe(202);
		const sau = await k.docCuoc(id);
		expect(sau.soLuot).toBe(1);
		expect(sau.sessionId).toBe(than.sessionId);
	});
});

describe("tran-van-chan", () => {
	test("tran-van-chan: luot hong xen giua khong an tran, khong noi tran", async () => {
		const { id, duongCua } = await k.cuoc("gui-tiep", 0);
		const MAU: readonly KetQuaTroLy[] = [202, 502, "nem"];
		k.trangThai.soLanFetch = 0;
		let qua = 0;
		let hong = 0;
		for (let i = 0; qua < LUOT_TOI_DA; i += 1) {
			const ket = MAU[i % MAU.length] ?? 202;
			k.trangThai.ketQua = ket;
			const res = await gui(duongCua, id);
			if (ket === 202) {
				expect(res.status).toBe(202);
				qua += 1;
			} else {
				hong += 1;
			}
			expect(await docLuot(id), `tran-thung: ${qua}`).toBe(qua);
		}
		expect(k.trangThai.soLanFetch).toBe(LUOT_TOI_DA + hong);
		k.trangThai.ketQua = 202;
		const thua = await gui(duongCua, id);
		expect(
			{ status: thua.status, than: await thua.json() },
			`tran-thung: ${qua + 1}`,
		).toEqual({ status: 429, than: { error: "het-luot-cuoc" } });
		expect(k.trangThai.soLanFetch).toBe(LUOT_TOI_DA + hong);
	});

	test("tran-van-chan: hai luot song song o tran - 1 chi mot luot toi tro ly", async () => {
		const { id, duongCua } = await k.cuoc("gui-tiep", LUOT_TOI_DA - 1);
		k.trangThai.ketQua = 202;
		k.trangThai.soLanFetch = 0;
		const kq = await Promise.all([gui(duongCua, id), gui(duongCua, id)]);
		expect(kq.map((r) => r.status).sort()).toEqual([202, 429]);
		expect(k.trangThai.soLanFetch, "tran-thung: song song").toBe(1);
		expect(await docLuot(id)).toBe(LUOT_TOI_DA);
	});
});

describe("nguoi-huy", () => {
	for (const n of [0, 5]) {
		test(`nguoi-huy: nguoi dung huy thi khong hoan n=${n}`, async () => {
			const { id, duongCua } = await k.cuoc("gui-tiep", n);
			k.trangThai.ketQua = "treo";
			const huy = new AbortController();
			const cho = gui(duongCua, id, huy.signal);
			await Bun.sleep(20);
			huy.abort();
			const res = await cho;
			k.trangThai.ketQua = 202;
			expect(await docLuot(id), `hoan-khi-nguoi-huy n=${n}`).toBe(n + 1);
			expect(await res.json()).not.toHaveProperty("luot");
		});

		test(`nguoi-huy: doi chung loi thuong khong huy thi hoan n=${n}`, async () => {
			const { id, duongCua } = await k.cuoc("gui-tiep", n);
			k.trangThai.ketQua = "nem";
			const res = await gui(duongCua, id);
			k.trangThai.ketQua = 202;
			expect(res.status).toBe(502);
			expect(await docLuot(id)).toBe(n);
		});

		test(`nguoi-huy: doi chung qua han cua cat thi hoan n=${n}`, async () => {
			const { id, duongCua } = await k.cuoc("gui-tiep", n);
			k.trangThai.ketQua = "treo";
			const res = await gui(duongCua, id);
			k.trangThai.ketQua = 202;
			expect({ status: res.status, than: await res.json() }).toEqual({
				status: 504,
				than: { error: CUA_OKR.loi.quaHan, luot: CUA_OKR.luotDaHoan },
			});
			expect(await docLuot(id)).toBe(n);
		});
	}
});

describe("luong-khong-cat", () => {
	const O_LUONG = [
		{ ten: "luong-get", method: "GET", duoi: "/stream" },
		{ ten: "post-gui-tiep", method: "POST", duoi: "" },
	] as const;

	for (const o of O_LUONG) {
		test(`luong-khong-cat: ${o.ten} dai hon thoi han van doc tron`, async () => {
			const n = 2;
			const { id, duongCua } = await k.cuoc("gui-tiep", n);
			k.trangThai.ketQua = "luong-cham";
			const { request, ctx } = yeuCau(
				`${duongCua}${o.duoi}`,
				id,
				OKR_SOAN_CUA.header,
				undefined,
				o.method,
			);
			const res = await (o.method === "GET" ? GET : POST)(request, ctx);
			const than = await res.text().catch((loi: Error) => `LOI ${loi.message}`);
			k.trangThai.ketQua = 202;
			expect(than, `luong-bi-cat ${o.ten}`).toBe(MAU_LUONG.join(""));
			expect(await docLuot(id)).toBe(o.method === "POST" ? n + 1 : n);
		});
	}
});
