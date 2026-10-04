import { describe, expect, test } from "bun:test";
import { type LanguageModelMiddleware, wrapLanguageModel } from "ai";
import { mockModel } from "eve/evals";
import {
	bocModelZdr,
	type ModelCoSan,
	middlewareZdr,
	tuyChonZdr,
	xuongModelZdr,
} from "../src/index";

type ThamSoGoi = Parameters<
	NonNullable<LanguageModelMiddleware["transformParams"]>
>[0]["params"];

const THE = ["onehub:thu"] as const;
const LOI_GOI = {
	prompt: [
		{ role: "user" as const, content: [{ type: "text" as const, text: "hi" }] },
	],
};
const modelGia = () => mockModel("chao") as ModelCoSan;
const DAU_MONG_DOI = { zeroDataRetention: true, thinkingLevel: "low" };

describe("xuong-model-zdr", () => {
	test("transformParams ghim ZDR, thẻ, thinkingLevel low cho google và vertex, kẹp trần ra, giữ tuỳ chọn có sẵn", async () => {
		const mw = middlewareZdr({ tags: THE, tranRaMoiLoiGoi: 2_000 });
		const bien = mw.transformParams;
		if (!bien) throw new Error("thieu transformParams");
		const ra = await bien({
			type: "stream",
			model: {} as never,
			params: {
				prompt: [],
				maxOutputTokens: 9_000,
				providerOptions: { gateway: { order: ["vertex"] } },
			},
		});
		expect(
			ra.providerOptions?.gateway?.zeroDataRetention,
			"loi goi khong zdr",
		).toBe(true);
		expect(ra.providerOptions?.gateway?.order).toEqual(["vertex"]);
		expect(ra.providerOptions?.gateway?.tags).toEqual([...THE]);
		for (const nha of ["google", "vertex"]) {
			expect(ra.providerOptions?.[nha], `thieu thinkingLevel: ${nha}`).toEqual({
				thinkingConfig: { thinkingLevel: "low" },
			});
		}
		expect(ra.maxOutputTokens).toBe(2_000);
		const trong = await bien({
			type: "generate",
			model: {} as never,
			params: { prompt: [] },
		});
		expect(trong.providerOptions?.gateway?.zeroDataRetention).toBe(true);
		expect(trong.maxOutputTokens).toBe(2_000);
		const nho = await bien({
			type: "generate",
			model: {} as never,
			params: { prompt: [], maxOutputTokens: 500 },
		});
		expect(nho.maxOutputTokens).toBe(500);
	});

	test("tuyChonZdr là đối tượng khai được ở modelOptions", () => {
		expect(tuyChonZdr(THE)).toEqual({
			providerOptions: {
				gateway: { zeroDataRetention: true, tags: [...THE] },
				google: { thinkingConfig: { thinkingLevel: "low" } },
				vertex: { thinkingConfig: { thinkingLevel: "low" } },
			},
		});
	});

	test("model bọc từ mã giữ modelId của cổng", () => {
		const tuMa = xuongModelZdr({
			modelId: "google/gemini-3.8-flash",
			tags: THE,
			tranRaMoiLoiGoi: 2_000,
		});
		expect(tuMa.modelId).toBe("google/gemini-3.8-flash");
	});

	test("model bọc từ LanguageModel đóng dấu onehub vào providerMetadata của lời gọi", async () => {
		const gia = bocModelZdr(modelGia(), { tags: THE, tranRaMoiLoiGoi: 2_000 });
		const kq = await gia.doGenerate(LOI_GOI);
		expect(kq.providerMetadata?.onehub).toEqual(DAU_MONG_DOI);
		const luong = await gia.doStream(LOI_GOI);
		const doc = luong.stream.getReader();
		const phan = [];
		for (let p = await doc.read(); !p.done; p = await doc.read())
			phan.push(p.value);
		const cuoi = phan.find((p) => p.type === "finish");
		expect(cuoi?.providerMetadata?.onehub).toEqual(DAU_MONG_DOI);
	});

	test("model bọc từ LanguageModel gửi xuống model gốc lời gọi đã ghim ZDR và kẹp trần ra", async () => {
		const daNhan: ThamSoGoi[] = [];
		const ghi = wrapLanguageModel({
			model: modelGia(),
			middleware: {
				transformParams: async ({ params }) => {
					daNhan.push(params);
					return params;
				},
			},
		}) as ModelCoSan;
		const bo = bocModelZdr(ghi, { tags: THE, tranRaMoiLoiGoi: 3_000 });
		await bo.doGenerate({ ...LOI_GOI, maxOutputTokens: 9_000 });
		expect(daNhan[0]?.maxOutputTokens).toBe(3_000);
		expect(
			daNhan[0]?.providerOptions?.gateway?.zeroDataRetention,
			"loi goi khong zdr",
		).toBe(true);
	});
});
