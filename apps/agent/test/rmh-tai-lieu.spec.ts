import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

type YeuCau = { url: string; headers: Record<string, string>; than: string };

const daGui: YeuCau[] = [];
const fetchGoc = globalThis.fetch;

function batFetch() {
	daGui.length = 0;
	globalThis.fetch = (async (
		url: string | URL | Request,
		init?: RequestInit,
	) => {
		daGui.push({
			url: String(url),
			headers: Object.fromEntries(new Headers(init?.headers).entries()),
			than: typeof init?.body === "string" ? init.body : "",
		});
		return new Response(
			JSON.stringify({ error: { message: "chan trong bai" } }),
			{
				status: 400,
				headers: { "content-type": "application/json" },
			},
		);
	}) as typeof fetch;
}

function traFetch() {
	globalThis.fetch = fetchGoc;
}

const { createGateway } = await import("@ai-sdk/gateway");
const { default: troLyKho } = await import(
	"../agent/subagents/tro_ly_kho/agent"
);
const { default: maySoan } = await import("../agent/subagents/may_soan/agent");
const { TAI_LIEU_AGENT } = await import("../agent/lib/tai-lieu-config");
const { chiPhiUsd } = await import("../agent/lib/tai-lieu-nop");

const DAY = dirname(fileURLToPath(import.meta.url));
const HO_SO = join(DAY, "..", "..", "..", "_acceptance", "re-mo-hinh-mac-dinh");
const MOT_TRIEU = 1_000_000;
const DUNG_SAI = 1e-9;

const anhChup = z
	.object({
		entry: z.object({
			id: z.string(),
			pricing: z.object({ input: z.string(), output: z.string() }),
		}),
	})
	.parse(
		JSON.parse(
			readFileSync(
				join(HO_SO, "evidence", "gateway-gemini-3-8-flash-2026-10-15.json"),
				"utf8",
			),
		),
	).entry;

const giaDuyet = (() => {
	const o = readFileSync(join(HO_SO, "opportunity.md"), "utf8");
	const m = o.match(/vào ([\d,]+), ra ([\d,]+) USD mỗi triệu token/);
	if (!m?.[1] || !m[2])
		throw new Error("opportunity.md thiếu dòng giá đã duyệt");
	return {
		vao: Number(m[1].replace(",", ".")),
		ra: Number(m[2].replace(",", ".")),
	};
})();

const giaAnhChup = {
	vao: Number(anhChup.pricing.input) * MOT_TRIEU,
	ra: Number(anhChup.pricing.output) * MOT_TRIEU,
};

type Duong = { ten: string; agent: typeof troLyKho };
const DUONG: readonly Duong[] = [
	{ ten: "may_soan", agent: maySoan },
	{ ten: "tro_ly_kho", agent: troLyKho },
];

type ModelLuot = {
	modelId: string;
	doGenerate: (vao: unknown) => Promise<unknown>;
};

const LOI_NHAN_GOC = { role: "user", content: [{ type: "text", text: "thu" }] };

async function guiQua(model: ModelLuot) {
	batFetch();
	try {
		await model.doGenerate({ prompt: [LOI_NHAN_GOC] }).catch(() => null);
	} finally {
		traFetch();
	}
	const yc = daGui[0];
	const than = yc ? JSON.parse(yc.than || "{}") : {};
	const maModel =
		yc?.headers["ai-language-model-id"] ?? (than.modelId as string | undefined);
	const zdr = JSON.stringify(than).includes('"zeroDataRetention":true');
	return { maModel, zdr, coGui: yc !== undefined };
}

async function modelCuaSubagent(d: Duong): Promise<ModelLuot> {
	const dong = d.agent.model as unknown as {
		events: Record<string, (e: unknown, ctx: unknown) => unknown>;
	};
	const chon = (await dong.events["step.started"]?.(
		{ type: "step.started" },
		{},
	)) as { model: ModelLuot };
	return chon.model;
}

function khongZdr(m: ModelLuot): ModelLuot {
	return createGateway()(m.modelId) as unknown as ModelLuot;
}

function lechGia(
	ten: string,
	gia: { vao: number; ra: number },
	nguon: { vao: number; ra: number },
): string[] {
	const lech: string[] = [];
	if (Math.abs(gia.vao - nguon.vao) > DUNG_SAI) lech.push(`${ten}: vào`);
	if (Math.abs(gia.ra - nguon.ra) > DUNG_SAI) lech.push(`${ten}: ra`);
	return lech;
}

describe("rmh-tai-lieu", () => {
	test("rmh-tai-lieu: ma trận hai đường thật × hai khẳng định viết trước", async () => {
		expect(DUONG.map((d) => d.ten)).toEqual(["may_soan", "tro_ly_kho"]);
		const ket: string[] = [];
		for (const d of DUONG) {
			const { maModel, zdr, coGui } = await guiQua(await modelCuaSubagent(d));
			if (!coGui)
				throw new Error(`${d.ten}: không bắt được yêu cầu nào gửi Gateway`);
			ket.push(`${d.ten}:${maModel}`);
			ket.push(`${d.ten}:zdr=${String(zdr)}`);
		}
		expect(ket).toEqual([
			`may_soan:${anhChup.id}`,
			"may_soan:zdr=true",
			`tro_ly_kho:${anhChup.id}`,
			"tro_ly_kho:zdr=true",
		]);
	});

	test("rmh-tai-lieu: chiều đỏ — bọc model của lượt không qua ZDR thì cờ vắng", async () => {
		for (const d of DUONG) {
			const { zdr, coGui } = await guiQua(khongZdr(await modelCuaSubagent(d)));
			expect({ duong: d.ten, coGui, zdr }).toEqual({
				duong: d.ten,
				coGui: true,
				zdr: false,
			});
		}
	});

	test("rmh-tai-lieu: giá Gemini khớp giá đã duyệt và ảnh chụp danh mục Gateway", () => {
		const gia =
			TAI_LIEU_AGENT.bangGia[anhChup.id as keyof typeof TAI_LIEU_AGENT.bangGia];
		if (!gia) throw new Error(`bangGia thiếu ${anhChup.id}`);
		const trongMa = { vao: gia.vaoMoiTrieu, ra: gia.raMoiTrieu };
		expect([
			...lechGia(`${anhChup.id} so giá đã duyệt`, trongMa, giaDuyet),
			...lechGia(`${anhChup.id} so ảnh chụp`, trongMa, giaAnhChup),
		]).toEqual([]);
		expect(chiPhiUsd(anhChup.id, MOT_TRIEU, 2 * MOT_TRIEU)).toBeCloseTo(
			giaDuyet.vao + 2 * giaDuyet.ra,
			9,
		);
		expect(chiPhiUsd("zai/glm-5.2-fast", MOT_TRIEU, MOT_TRIEU)).toBeCloseTo(
			2.8 + 8.8,
			9,
		);
		expect(chiPhiUsd("model-la/khong-co", MOT_TRIEU, MOT_TRIEU)).toBeNull();
	});

	test("rmh-tai-lieu: chiều đỏ — bảng giá đảo vào/ra thì lệch cả hai nguồn, ghim tên model", () => {
		const dao = { vao: giaDuyet.ra, ra: giaDuyet.vao };
		expect([
			...lechGia(`${anhChup.id} so giá đã duyệt`, dao, giaDuyet),
			...lechGia(`${anhChup.id} so ảnh chụp`, dao, giaAnhChup),
		]).toEqual([
			`${anhChup.id} so giá đã duyệt: vào`,
			`${anhChup.id} so giá đã duyệt: ra`,
			`${anhChup.id} so ảnh chụp: vào`,
			`${anhChup.id} so ảnh chụp: ra`,
		]);
	});
});
