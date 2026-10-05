import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	GatewayInternalServerError,
	GatewayModelNotFoundError,
	GatewayRateLimitError,
} from "@ai-sdk/gateway";
import { db } from "@crm/db";
import { DEFAULT_AGENT_MODEL, writeAgentModel } from "@crm/db/settings";
import type { Cache } from "cache-manager";
import { z } from "zod";
import {
	type CatalogModel,
	ModelCatalogService,
} from "../../api/src/settings/model-catalog.service";
import telemetry from "../agent/hooks/telemetry";
import { MODEL_GOC, modelChoLuot, modelTheoVai } from "../agent/lib/model";
import { MODEL_DANH_MUC } from "../agent/lib/model-config";
import {
	datNguonDanhMuc,
	docDanhMuc,
	docDanhMucTuMang,
} from "../agent/lib/model-danh-muc";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import agentRunner from "../agent/subagents/agent_runner/agent";
import troLyKho from "../agent/subagents/tro_ly_kho/agent";

const DA_CHON = "openai/gpt-x";

const duLieuKhongTimThay = z.object({ modelId: z.string() });
const FIXTURE = join(
	dirname(fileURLToPath(import.meta.url)),
	"fixtures",
	"gateway-models-2026-10-05.json",
);

type DangDanhMuc = "co" | "thieu" | "mang" | "503" | "hong";

function dongModel(id: string) {
	return {
		id,
		name: id,
		owned_by: id.split("/")[0],
		type: "language",
		tags: ["tool-use"],
		context_window: 200_000,
		pricing: null,
	};
}

function layVeGia(dang: DangDanhMuc | "rong"): typeof fetch {
	return (async () => {
		if (dang === "mang") throw new TypeError("fetch failed");
		if (dang === "503") return new Response("loi", { status: 503 });
		if (dang === "hong") return Response.json({ khong: "phai danh muc" });
		if (dang === "rong") return Response.json({ data: [] });
		return Response.json({
			data: [dongModel(dang === "co" ? DA_CHON : "khac/model-y")],
		});
	}) as unknown as typeof fetch;
}

async function voiNguon<T>(
	layVe: typeof fetch,
	lam: () => Promise<T>,
): Promise<T> {
	const hoanLai = datNguonDanhMuc(() => docDanhMucTuMang(layVe));
	try {
		return await lam();
	} finally {
		hoanLai();
	}
}

const DUONG = [
	{
		ten: "tro-ly",
		goi: async () => (await modelTheoVai("tro-ly"))?.model ?? null,
	},
	{
		ten: "tac-nhan",
		goi: async () => (await modelTheoVai("tac-nhan"))?.model ?? null,
	},
	{
		ten: "luot",
		goi: async () => {
			const luot = await modelChoLuot();
			return luot.id === DEFAULT_AGENT_MODEL.id &&
				Object.keys(luot.thuocTinh).length === 0
				? null
				: luot.id;
		},
	},
] as const;

const DANG: readonly DangDanhMuc[] = ["co", "thieu", "mang", "503", "hong"];

beforeAll(async () => {
	await writeAgentModel(db, { id: DA_CHON, contextWindowTokens: 200_000 });
});

afterAll(async () => {
	await writeAgentModel(db, null);
	await db.agentEvent.deleteMany({
		where: { type: MODEL_DANH_MUC.suKienLui },
	});
});

afterEach(() => {
	setSystemTime();
});

describe("model-lui", () => {
	test("model-lui: ma tran 3 duong x 5 danh muc viet truoc", async () => {
		const O = DUONG.flatMap((d) => DANG.map((dang) => ({ d, dang })));
		expect(O.length).toBe(15);
		const sai: string[] = [];
		for (const { d, dang } of O) {
			const ra = await voiNguon(layVeGia(dang), d.goi);
			const mong = dang === "thieu" ? null : DA_CHON;
			if (ra !== mong) {
				sai.push(
					dang === "thieu"
						? `model-lui: thieu id van tra model da chon (${d.ten})`
						: `model-lui: ${d.ten} ${dang} tra ${ra}`,
				);
			}
		}
		expect(sai).toEqual([]);
	});

	test("model-lui: bao bi go dung mot lan moi id moi tien trinh", async () => {
		for (const d of DUONG) await voiNguon(layVeGia("thieu"), d.goi);
		const hang = await db.agentEvent.findMany({
			where: {
				type: MODEL_DANH_MUC.suKienLui,
				data: { path: ["modelId"], equals: DA_CHON },
			},
		});
		expect(hang.length).toBe(1);
	});

	test("model-lui: danh muc rong la khong doc duoc, giu model da chon", async () => {
		expect(await docDanhMucTuMang(layVeGia("rong"))).toBe("khong-doc-duoc");
		expect(await voiNguon(layVeGia("rong"), DUONG[0].goi)).toBe(DA_CHON);
	});

	test("model-lui: than that cua Gateway doc ra du id, agent va API cung tap", async () => {
		const than = readFileSync(FIXTURE, "utf8");
		const ra = await docDanhMucTuMang(
			(async () => new Response(than)) as unknown as typeof fetch,
		);
		if (ra === "khong-doc-duoc") {
			throw new Error("model-lui: than that doc ra rong");
		}
		expect(ra.co.size).toBeGreaterThan(0);
		expect(ra.co.has(DEFAULT_AGENT_MODEL.id)).toBe(true);
		const kho = new Map<string, CatalogModel[]>();
		const dichVuApi = new ModelCatalogService({
			get: async (k: string) => kho.get(k),
			set: async (k: string, v: CatalogModel[]) => {
				kho.set(k, v);
			},
		} as unknown as Cache);
		const fetchGoc = globalThis.fetch;
		globalThis.fetch = (async () =>
			new Response(than)) as unknown as typeof fetch;
		const cuaApi = await dichVuApi.models().finally(() => {
			globalThis.fetch = fetchGoc;
		});
		if (!cuaApi) throw new Error("model-lui: API khong doc duoc than that");
		const api = new Set(cuaApi.map((m) => m.id));
		if ([...ra.co].sort().join() !== [...api].sort().join()) {
			throw new Error(
				"model-lui: agent va API doc than that ra tap id khac nhau",
			);
		}
		const khac = [...ra.co].find((id) => id !== DEFAULT_AGENT_MODEL.id);
		if (!khac) throw new Error("model-lui: fixture thieu model thu hai");
		await writeAgentModel(db, { id: khac, contextWindowTokens: 200_000 });
		try {
			const chon = await voiNguon(
				(async () => new Response(than)) as unknown as typeof fetch,
				DUONG[0].goi,
			);
			expect(chon).toBe(khac);
		} finally {
			await writeAgentModel(db, {
				id: DA_CHON,
				contextWindowTokens: 200_000,
			});
		}
	});
});

describe("danh-muc", () => {
	test("danh-muc: nho tam 5 phut, qua han thi doc lai", async () => {
		expect(MODEL_DANH_MUC.ttlMs).toBe(5 * 60_000);
		let goi = 0;
		const dem = (async () => {
			goi += 1;
			return Response.json({ data: [dongModel(DA_CHON)] });
		}) as unknown as typeof fetch;
		const bat = Date.now();
		setSystemTime(new Date(bat));
		const hoanLai = datNguonDanhMuc(() => docDanhMucTuMang(dem));
		try {
			await docDanhMuc();
			await docDanhMuc();
			await docDanhMuc();
			if (goi !== 1) throw new Error("danh-muc: goi Gateway 3 lan trong ttl");
			setSystemTime(new Date(bat + MODEL_DANH_MUC.ttlMs + 1));
			await docDanhMuc();
			expect(goi).toBe(2);
		} finally {
			hoanLai();
		}
	});

	test(
		"danh-muc: Gateway treo qua timeoutMs thi la khong doc duoc",
		async () => {
			const treo = ((_url: string, init?: RequestInit) =>
				new Promise<Response>((_, tuChoi) => {
					init?.signal?.addEventListener("abort", () =>
						tuChoi(new Error("het gio")),
					);
				})) as unknown as typeof fetch;
			const bat = performance.now();
			expect(await docDanhMucTuMang(treo)).toBe("khong-doc-duoc");
			expect(performance.now() - bat).toBeLessThan(
				MODEL_DANH_MUC.timeoutMs + 1_000,
			);
		},
		MODEL_DANH_MUC.timeoutMs + 5_000,
	);
});

describe("khong-tim-thay", () => {
	test("khong-tim-thay: ma tran 4 loi buoc, chi model khong tim thay ghi su kien", async () => {
		const goc = new GatewayModelNotFoundError({
			message: "Model not found",
			statusCode: 404,
			modelId: DA_CHON,
		});
		const hetTien = new GatewayInternalServerError({
			message: "A positive credit balance is required",
			statusCode: 402,
		});
		const gioiHan = new GatewayRateLimitError({ message: "Rate limited" });
		const O = [
			{
				ten: "model-not-found",
				code: "MODEL_CALL_FAILED",
				details: {
					gatewayName: goc.name,
					gatewayType: goc.type,
					statusCode: goc.statusCode,
				},
				ghi: 1,
			},
			{
				ten: "402",
				code: "MODEL_CALL_FAILED",
				details: {
					gatewayName: hetTien.name,
					gatewayType: hetTien.type,
					statusCode: 402,
				},
				ghi: 0,
			},
			{
				ten: "429",
				code: "MODEL_CALL_FAILED",
				details: { gatewayName: gioiHan.name, gatewayType: gioiHan.type },
				ghi: 0,
			},
			{ ten: "khac", code: "TOOL_FAILED", details: undefined, ghi: 0 },
		] as const;
		expect(O.length).toBe(4);
		const sai: string[] = [];
		for (const o of O) {
			const sessionId = `r1e-ktt-${o.ten}-${Date.now()}`;
			await telemetry.events["step.failed"]?.(
				{
					type: "step.failed",
					data: {
						code: o.code,
						message: "model call failed",
						details: o.details,
					},
				} as never,
				{
					session: { id: sessionId, auth: { current: null, initiator: null } },
				} as never,
			);
			const hangGhi = await db.agentEvent.findMany({
				where: { sessionId, type: MODEL_DANH_MUC.suKienHong },
				select: { data: true },
			});
			if (hangGhi.length !== o.ghi) {
				sai.push(
					o.ten === "402"
						? "khong-tim-thay: loi 402 bi dem la model bi go"
						: `khong-tim-thay: ${o.ten} ghi ${hangGhi.length} hang`,
				);
			}
			for (const h of hangGhi) {
				const id = duLieuKhongTimThay.parse(h.data).modelId;
				if (id !== DA_CHON) {
					sai.push(`khong-tim-thay: hang mang modelId ${id}, mong ${DA_CHON}`);
				}
			}
		}
		expect(sai).toEqual([]);
	});
});

describe("khong-tim-thay", () => {
	test("khong-tim-thay: hang mang model phien da chon luc bat dau, khong tinh lai luc hong, nam khung viet truoc", async () => {
		const goc = new GatewayModelNotFoundError({
			message: "Model not found",
			statusCode: 404,
		});
		const phien = (ten: string, attributes: Record<string, string> = {}) => ({
			session: {
				id: `r1e-ktt-chon-${ten}-${Date.now()}`,
				auth: { current: { attributes }, initiator: null },
			},
		});
		type Phien = ReturnType<typeof phien>;
		const choGhi = async (sessionId: string) => {
			for (let i = 0; i < 50; i += 1) {
				const co = await db.agentEvent.count({
					where: { sessionId, type: MODEL_DANH_MUC.suKienChon },
				});
				if (co > 0) return;
				await new Promise((r) => setTimeout(r, 20));
			}
			throw new Error(`khong-tim-thay: ${sessionId} khong ghi model phien`);
		};
		const KHUNG = [
			{
				ten: "phien thuong, model bi go sau khi bat dau",
				ctx: phien("thuong"),
				bat: (c: Phien) =>
					voiNguon(
						layVeGia("co"),
						() =>
							MODEL_GOC.events["session.started"]?.(
								{ type: "session.started" } as never,
								c as never,
							) ?? Promise.resolve(null),
					),
				mong: DA_CHON,
			},
			{
				ten: "phien kho",
				ctx: phien("kho", { purpose: "kho" }),
				bat: (c: Phien) =>
					Promise.resolve(
						MODEL_GOC.events["session.started"]?.(
							{ type: "session.started" } as never,
							c as never,
						),
					),
				mong: TAI_LIEU_AGENT.hoi.maModel,
			},
			{
				ten: "luot tac nhan",
				ctx: phien("luot", {
					purpose: "team-agent",
					modelId: "ghim/model-luot",
					modelContextWindowTokens: "200000",
				}),
				bat: (c: Phien) =>
					Promise.resolve(
						(
							agentRunner.model as unknown as {
								events: Record<string, (e: never, c: never) => unknown>;
							}
						).events["session.started"]?.(
							{ type: "session.started" } as never,
							c as never,
						),
					),
				mong: "ghim/model-luot",
			},
			{
				ten: "phien con tro_ly_kho",
				ctx: phien("con-kho"),
				bat: (c: Phien) =>
					Promise.resolve(
						(
							troLyKho.model as unknown as {
								events: Record<string, (e: never, c: never) => unknown>;
							}
						).events["step.started"]?.(
							{ type: "step.started" } as never,
							c as never,
						),
					),
				mong: TAI_LIEU_AGENT.hoi.maModel,
			},
		] as const;
		expect(KHUNG.length).toBe(4);
		const sai: string[] = [];
		const luiTruoc = await db.agentEvent.count({
			where: { type: MODEL_DANH_MUC.suKienLui },
		});
		for (const k of KHUNG) {
			await k.bat(k.ctx);
			await choGhi(k.ctx.session.id);
			await voiNguon(layVeGia("thieu"), () =>
				Promise.resolve(
					telemetry.events["step.failed"]?.(
						{
							type: "step.failed",
							data: {
								code: "MODEL_CALL_FAILED",
								message: "model call failed",
								details: { gatewayName: goc.name, gatewayType: goc.type },
							},
						} as never,
						k.ctx as never,
					),
				),
			);
			const hang = await db.agentEvent.findMany({
				where: { sessionId: k.ctx.session.id, type: MODEL_DANH_MUC.suKienHong },
				select: { data: true },
			});
			const ids = hang.map((h) => duLieuKhongTimThay.parse(h.data).modelId);
			if (ids.length !== 1 || ids[0] !== k.mong) {
				sai.push(
					`khong-tim-thay: ${k.ten} ghi ${JSON.stringify(ids)}, mong ${k.mong}`,
				);
			}
		}
		const luiSau = await db.agentEvent.count({
			where: { type: MODEL_DANH_MUC.suKienLui },
		});
		if (luiSau !== luiTruoc) {
			sai.push(
				`khong-tim-thay: hook tao ${luiSau - luiTruoc} hang bi-go-lui gia`,
			);
		}
		const khongGhi = phien("khong-ghi");
		await telemetry.events["step.failed"]?.(
			{
				type: "step.failed",
				data: {
					code: "MODEL_CALL_FAILED",
					message: "model call failed",
					details: { gatewayName: goc.name, gatewayType: goc.type },
				},
			} as never,
			khongGhi as never,
		);
		const hangKhongGhi = await db.agentEvent.findMany({
			where: {
				sessionId: khongGhi.session.id,
				type: MODEL_DANH_MUC.suKienHong,
			},
			select: { data: true },
		});
		const idKhongGhi = hangKhongGhi.map(
			(h) => duLieuKhongTimThay.parse(h.data).modelId,
		);
		if (idKhongGhi.length !== 1 || idKhongGhi[0] !== DA_CHON) {
			sai.push(
				`khong-tim-thay: phien khong co ban ghi ghi ${JSON.stringify(idKhongGhi)}`,
			);
		}
		expect(sai).toEqual([]);
	});
});
