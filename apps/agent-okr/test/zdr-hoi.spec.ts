import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import tacNhan from "../agent/agent";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";

const GOC = join(import.meta.dir, "..", "..", "..");
const RANG = join(GOC, "_acceptance", "hoi-dap-okr", "rang");
const CAM = [/@ai-sdk\//, /createGateway/, /\bgateway\(/, /from "@crm\/ai"/];

export type KetQuaSoatModel = { goiModel: boolean; loi: string[] };

export function lenhDoGoiModel(chu: string): KetQuaSoatModel {
	const goiModel = /\bgenerateText\b|\bstreamText\b|\bgenerateObject\b/.test(
		chu,
	);
	const loi: string[] = [];
	if (goiModel && !/@crm\/ai-okr/.test(chu))
		loi.push("goi model ma khong qua @crm/ai-okr");
	if (goiModel && !/xuongModelZdr/.test(chu))
		loi.push("goi model ma khong dung xuongModelZdr");
	for (const re of CAM) if (re.test(chu)) loi.push(`nhap cam: ${re}`);
	return { goiModel, loi };
}

describe("hdo zdr", () => {
	test("model cua agent-okr la xuongModelZdr tinh, mot model", () => {
		const d = tacNhan as unknown as {
			model: { modelId?: string; kind?: string };
		};
		expect(d.model?.kind).not.toBe("eve:dynamic");
		expect(d.model?.modelId).toBe(TRO_LY_OKR_SOAN.model);
		const nguon = readFileSync(
			join(import.meta.dir, "..", "agent", "agent.ts"),
			"utf8",
		);
		expect(nguon).toContain("xuongModelZdr(");
		expect(nguon).not.toContain("defineDynamic");
	});

	test("moi lenh do cua hoi-dap-okr goi model chi qua xuongModelZdr", () => {
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
