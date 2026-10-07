import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ketQuaTroLy } from "@crm/validation/okr-tro-ly";
import { defineAgent } from "eve";
import { MUC_TOM_TAT } from "../agent/lib/okr/chi-dan-tom-tat";
import agentTroLy from "../agent/subagents/tro_ly_okr/agent";

const CHI_DAN_GOP_Y = readFileSync(
	join(import.meta.dir, "../agent/subagents/tro_ly_okr/instructions.md"),
	"utf8",
);

function loiPhienCon(dinhNghia: ReturnType<typeof defineAgent>): string[] {
	return "outputSchema" in dinhNghia ? ["phien con khai outputSchema"] : [];
}

function loiChiDan(chu: string): string[] {
	const loi: string[] = [];
	if (/trangThai|final_output/.test(chu)) loi.push("chi dan doi khuon ket qua");
	if (!chu.includes("`done`")) loi.push("chi dan khong ket bang done");
	return loi;
}

describe("khong-khuon-ra", () => {
	test("phien con tro_ly_okr khong khai outputSchema", () => {
		expect(loiPhienCon(agentTroLy)).toEqual([]);
	});

	test("chi dan gop y va tom tat khong doi khuon ket qua, ket bang done", () => {
		expect([...loiChiDan(CHI_DAN_GOP_Y), ...loiChiDan(MUC_TOM_TAT)]).toEqual(
			[],
		);
	});

	test("doi chung: dinh nghia co outputSchema va chi dan doi khuon bi bat", () => {
		const coKhuon = defineAgent({
			description: "x",
			outputSchema: ketQuaTroLy,
		});
		expect(loiPhienCon(coKhuon)).toEqual(["phien con khai outputSchema"]);
		expect(loiChiDan('Then finish with `{"trangThai":"da-nop"}`.')).toEqual([
			"chi dan doi khuon ket qua",
			"chi dan khong ket bang done",
		]);
	});
});
