import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { ketQuaLuot } from "../agent/lib/run-result";
import { runResultOf } from "../agent/lib/run-runtime";
import runner from "../agent/subagents/agent_runner/agent";
import finishRun from "../agent/subagents/agent_runner/tools/finish_run";
import ketQuaThat from "./fixtures/ket-qua-that.json";
import {
	phanLoaiTep,
	quetKhuonAgent,
	viPhamKhuon,
} from "./support/khuon-di-dong";

const KHUON_PHAI_CO = [
	"agent/tools/search_crm.ts",
	"agent/tools/read_crm_history.ts",
	"agent_builder/tools/inspect_context.ts",
	"agent_builder/tools/write_agent_file.ts",
	"agent_builder/tools/save_agent_draft.ts",
	"agent_runner/tools/inspect_run.ts",
	"agent_runner/tools/query_crm.ts",
	"agent_runner/tools/read_crm_record.ts",
	"agent_runner/tools/create_crm_activity.ts",
	"agent_runner/tools/post_slack_message.ts",
	"agent_runner/tools/finish_run.ts",
	"may_soan/tools/nop_ban_de_xuat.ts",
	"agent_builder/agent.ts#output",
	"agent_runner/agent.ts#output",
	"may_soan/agent.ts#output",
	"tro_ly_kho/tools/search_pages.ts",
	"tro_ly_kho/tools/read_page.ts",
	"tro_ly_kho/tools/nop_tra_loi.ts",
	"tro_ly_kho/agent.ts#output",
];

type CoOKetQua = { shape: { result: z.ZodType } };

function oKetQua(schema: CoOKetQua): z.ZodType {
	let hienTai = schema.shape.result;
	while (hienTai instanceof z.ZodOptional || hienTai instanceof z.ZodNullable) {
		hienTai = hienTai.unwrap() as z.ZodType;
	}
	return hienTai;
}

describe("khuon-di-dong", () => {
	it("khuon-di-dong: moi khuon model thay khong co $ref", async () => {
		const { daQuet, viPham } = await quetKhuonAgent();

		expect(viPham).toEqual([]);
		for (const ten of KHUON_PHAI_CO) {
			expect(
				daQuet.some((duong) => duong.endsWith(ten)),
				`thieu khuon ${ten}`,
			).toBe(true);
		}
		expect(
			daQuet.filter((duong) => duong.includes("/agent/tools/")).length,
		).toBeGreaterThanOrEqual(20);
		expect(
			daQuet.some((duong) => duong.includes("tools/zalo-chi-doc.ts#zalo:")),
			"cong cu dong phai duoc quet",
		).toBe(true);
	});

	it("khuon-di-dong: doi chung am — z.json bi bat", () => {
		expect(
			viPhamKhuon(
				"mau-json",
				z.object({ result: z.record(z.string(), z.json()) }),
			),
		).toEqual(["khuon co vong tham chieu: mau-json"]);
		expect(viPhamKhuon("mau-phang", z.object({ a: z.string() }))).toEqual([]);
	});

	it("khuon-di-dong: tep khong khuon, khong dau tat la vi pham", () => {
		expect(phanLoaiTep("gia.ts", {}, "export default {}")).toEqual({
			loai: "vi-pham",
			loi: "khong khuon, khong dau tat: gia.ts",
		});
		expect(phanLoaiTep("tat.ts", {}, "export default disableTool();")).toEqual({
			loai: "da-tat",
		});
	});
});

describe("ket-qua-phang", () => {
	it("ket-qua-phang: hai ket qua that luu nguyen", () => {
		for (const result of ketQuaThat) {
			const doc = finishRun.inputSchema.safeParse({
				summary: "kiem tra",
				result,
			});
			expect(doc.success).toBe(true);
			expect(doc.data?.result).toEqual(result);
			expect(runResultOf(result)).toEqual(result);
		}
	});

	it("ket-qua-phang: ket qua long bi tu choi, neu ten o", () => {
		const doc = finishRun.inputSchema.safeParse({
			summary: "kiem tra",
			result: { chiTiet: { a: 1 } },
		});
		expect(doc.success, "ket qua long phai bi tu choi").toBe(false);
		expect(doc.error?.issues[0]?.path).toContain("chiTiet");
		expect(runResultOf({ chiTiet: { a: 1 } })).toEqual({});
	});

	it("ket-qua-phang: danh sach qua 50 phan tu bi tu choi", () => {
		const doc = finishRun.inputSchema.safeParse({
			summary: "kiem tra",
			result: { danhSach: Array.from({ length: 51 }, (_, i) => i) },
		});
		expect(doc.success).toBe(false);
	});

	it("ket-qua-phang: ba cho dung chung mot khuon", () => {
		expect(oKetQua(finishRun.inputSchema)).toBe(ketQuaLuot);
		expect(oKetQua(runner.outputSchema)).toBe(ketQuaLuot);
	});
});
