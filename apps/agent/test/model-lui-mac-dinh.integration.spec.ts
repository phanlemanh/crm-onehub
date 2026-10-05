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
import { db } from "@crm/db";
import { DEFAULT_AGENT_MODEL, writeAgentModel } from "@crm/db/settings";
import { docDanhMucGateway } from "@crm/validation/gateway-danh-muc";
import { modelChoLuot, modelTheoVai } from "../agent/lib/model";
import { MODEL_DANH_MUC } from "../agent/lib/model-config";
import {
	datNguonDanhMuc,
	docDanhMuc,
	docDanhMucTuMang,
} from "../agent/lib/model-danh-muc";

const DA_CHON = "openai/gpt-x";
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
		const api = new Set(docDanhMucGateway(JSON.parse(than)).map((m) => m.id));
		expect([...ra.co].sort()).toEqual([...api].sort());
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
