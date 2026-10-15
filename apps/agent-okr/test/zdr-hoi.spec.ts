import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import tacNhan from "../agent/agent";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";

const GOC = join(import.meta.dir, "..", "..", "..");
const RANG = join(GOC, "_acceptance", "hoi-dap-okr", "rang");
const KHOA_GATEWAY = "AI_GATEWAY_API_KEY";
const KHOA_GIA = "khoa-gia-chi-trong-bai-zdr";
const CAM = [/@ai-sdk\//, /createGateway/, /\bgateway\(/, /from "@crm\/ai"/];

export type KetQuaSoatModel = { goiModel: boolean; loi: string[] };

export function lenhDoGoiModel(chu: string): KetQuaSoatModel {
	const goiModel = /\bgenerateText\b|\bstreamText\b|\bgenerateObject\b/.test(
		chu,
	);
	const loi: string[] = [];
	if (goiModel && !/\btaoModelPhieu\(/.test(chu))
		loi.push("goi model ma khong qua taoModelPhieu cua model-phieu.mjs");
	for (const re of CAM) if (re.test(chu)) loi.push(`nhap cam: ${re}`);
	return { goiModel, loi };
}

type YeuCauBat = { url: string; than: string };
type GoiModel = {
	doGenerate: (p: { prompt: LoiNhan[] }) => Promise<unknown>;
	doStream: (p: { prompt: LoiNhan[] }) => Promise<unknown>;
};
type LoiNhan = {
	role: "user";
	content: { type: "text"; text: string }[];
};

const LOI_GOI = {
	prompt: [
		{ role: "user" as const, content: [{ type: "text" as const, text: "hi" }] },
	],
};

async function batYeuCau(model: GoiModel): Promise<YeuCauBat[]> {
	const bat: YeuCauBat[] = [];
	const cu = globalThis.fetch;
	const khoaCu = process.env[KHOA_GATEWAY];
	process.env[KHOA_GATEWAY] = khoaCu || KHOA_GIA;
	globalThis.fetch = (async (u: RequestInfo | URL, i?: RequestInit) => {
		bat.push({ url: String(u), than: String(i?.body ?? "") });
		return Response.json({ error: "bi-chan-trong-bai" }, { status: 400 });
	}) as typeof fetch;
	try {
		for (const goi of [model.doGenerate, model.doStream])
			await goi.call(model, LOI_GOI).catch(() => undefined);
	} finally {
		globalThis.fetch = cu;
		if (khoaCu === undefined) delete process.env[KHOA_GATEWAY];
		else process.env[KHOA_GATEWAY] = khoaCu;
	}
	return bat;
}

const zdrCua = (y: YeuCauBat) =>
	z
		.object({
			providerOptions: z.object({
				gateway: z.object({ zeroDataRetention: z.boolean().optional() }),
			}),
		})
		.safeParse(JSON.parse(y.than)).data?.providerOptions.gateway
		.zeroDataRetention === true;

describe("hdo zdr", () => {
	test("moi yeu cau ma model cua agent-okr gui di mang zeroDataRetention", async () => {
		const d = tacNhan as unknown as {
			model: GoiModel & { modelId?: string; kind?: string };
		};
		expect(d.model.kind).not.toBe("eve:dynamic");
		expect(d.model.modelId).toBe(TRO_LY_OKR_SOAN.model);
		const bat = await batYeuCau(d.model);
		expect(bat.length).toBe(2);
		expect(
			bat.filter((y) => !zdrCua(y)).map((y) => y.than.slice(0, 200)),
		).toEqual([]);
	});

	test("moi yeu cau ma model cham cua lenh do gui di mang zeroDataRetention", async () => {
		const duong = join(RANG, "model-phieu.mjs");
		const { taoModelPhieu } = (await import(duong)) as {
			taoModelPhieu: () => GoiModel;
		};
		const bat = await batYeuCau(taoModelPhieu());
		expect(bat.length).toBe(2);
		expect(
			bat.filter((y) => !zdrCua(y)).map((y) => y.than.slice(0, 200)),
		).toEqual([]);
	});

	test("moi lenh do cua hoi-dap-okr goi model chi qua taoModelPhieu", () => {
		const tep = readdirSync(RANG).filter(
			(t) => /\.(mjs|ts)$/.test(t) && !t.endsWith(".test.ts"),
		);
		const ket = tep.map((t) => ({
			t,
			...lenhDoGoiModel(readFileSync(join(RANG, t), "utf8")),
		}));
		expect(ket.filter((k) => k.goiModel).map((k) => k.t)).toContain(
			"do-hoi-dap.mjs",
		);
		expect(ket.flatMap((k) => k.loi.map((l) => `${k.t}: ${l}`))).toEqual([]);
	});

	test("chieu do: lenh do goi gateway truc tiep bi bat", () => {
		const hong =
			'import { gateway } from "@ai-sdk/gateway";\nawait generateText({ model: gateway("x") });';
		expect(lenhDoGoiModel(hong).loi.length).toBeGreaterThan(0);
	});
});
