import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "zod";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import { DANH_SACH_DOC } from "../agent/lib/okr/doc";
import troLyOkr from "../agent/subagents/tro_ly_okr/agent";

const GOC = join(import.meta.dir, "..", "agent");
const THU_MUC_CON =
	process.env.THU_MUC_TRO_LY ?? join(GOC, "subagents/tro_ly_okr");
const TOOL_SONG = ["nop_de_xuat"] as const;
const TOOL_TAT = [
	"ask_question",
	"bash",
	"glob",
	"grep",
	"read_file",
	"todo",
	"web_fetch",
	"web_search",
	"write_file",
] as const;
const BANG_GHI_DUOC = new Set(["okrDeXuat", "okrTomTat"]);

function tepTs(thuMuc: string): string[] {
	const ra: string[] = [];
	for (const ten of readdirSync(thuMuc)) {
		const d = join(thuMuc, ten);
		if (statSync(d).isDirectory()) ra.push(...tepTs(d));
		else if (ten.endsWith(".ts")) ra.push(d);
	}
	return ra;
}

async function kiemTapTool(thuMuc: string): Promise<string[]> {
	const loi: string[] = [];
	const song: string[] = [];
	const tat: string[] = [];
	for (const f of readdirSync(join(thuMuc, "tools")).filter((t) =>
		t.endsWith(".ts"),
	)) {
		const mod = await import(join(thuMuc, "tools", f));
		const ten = f.replace(/\.ts$/, "");
		if (mod.default.kind === "eve:disabled-tool") tat.push(ten);
		else {
			song.push(ten);
			const s = JSON.stringify(
				z.toJSONSchema(mod.default.inputSchema, { target: "draft-7" }),
			);
			if (s.includes("$ref")) loi.push(`$ref vong: ${ten}`);
			if (JSON.parse(s).type !== "object")
				loi.push(`goc khong phai object: ${ten}`);
		}
	}
	for (const t of song)
		if (!(TOOL_SONG as readonly string[]).includes(t))
			loi.push(`tool ngoai tap: ${t}`);
	for (const t of TOOL_SONG)
		if (!song.includes(t)) loi.push(`thieu tool: ${t}`);
	for (const t of TOOL_TAT)
		if (!tat.includes(t)) loi.push(`tool dung san chua tat: ${t}`);
	return loi;
}

function kiemMoHinh(dinhNghia: {
	model: unknown;
	modelOptions?: { providerOptions?: Record<string, Record<string, unknown>> };
	limits?: Record<string, unknown>;
}): string[] {
	const loi: string[] = [];
	const model = dinhNghia.model as { modelId?: string; kind?: string };
	if (model?.kind === "eve:dynamic" || typeof dinhNghia.model === "function")
		loi.push("model dong");
	if (model?.modelId !== TRO_LY_OKR.model)
		loi.push(`model la: ${model?.modelId}`);
	const po = dinhNghia.modelOptions?.providerOptions ?? {};
	if (po.gateway?.zeroDataRetention !== true) loi.push("thieu ZDR");
	for (const nha of ["google", "vertex"]) {
		const cfg = po[nha]?.thinkingConfig as
			| { thinkingLevel?: string }
			| undefined;
		if (cfg?.thinkingLevel !== "low") loi.push(`thieu thinkingLevel: ${nha}`);
	}
	for (const k of [
		"maxInputTokensPerSession",
		"maxOutputTokensPerSession",
		"sessionTimeoutMs",
	]) {
		if (typeof dinhNghia.limits?.[k] !== "number")
			loi.push(`thieu limit: ${k}`);
	}
	return loi;
}

describe("tro-ly-okr-cach-ly", () => {
	test("tập tool đúng bằng tập khai, tool dựng sẵn tắt, khuôn không vòng $ref", async () => {
		expect(await kiemTapTool(THU_MUC_CON)).toEqual([]);
	});

	test("model, ZDR, mức suy nghĩ và trần cố định ở cấp subagent", () => {
		expect(kiemMoHinh(troLyOkr as never)).toEqual([]);
		const s = z.toJSONSchema(
			(troLyOkr as { outputSchema: z.ZodType }).outputSchema,
			{ target: "draft-7" },
		);
		expect(s.type).toBe("object");
		expect(JSON.stringify(s)).not.toContain("$ref");
	});

	test("đối chứng: bộ đọc thấy thiếu cờ khi định nghĩa sai", () => {
		expect(
			kiemMoHinh({
				model: { modelId: TRO_LY_OKR.model },
				modelOptions: {
					providerOptions: {
						gateway: { zeroDataRetention: true },
						google: { thinkingConfig: { thinkingLevel: "low" } },
					},
				},
				limits: {
					maxInputTokensPerSession: 1,
					maxOutputTokensPerSession: 1,
					sessionTimeoutMs: 1,
				},
			}),
		).toEqual(["thieu thinkingLevel: vertex"]);
	});

	test("sandbox deny-all", () => {
		const s = readFileSync(join(THU_MUC_CON, "sandbox/sandbox.ts"), "utf8");
		expect(s.match(/networkPolicy: "deny-all"/g)?.length).toBe(3);
	});

	test("mã của Trợ lý OKR chỉ ghi hai bảng đầu ra và chỉ đọc bảng cho phép", () => {
		const tep = [
			...tepTs(THU_MUC_CON),
			...tepTs(join(GOC, "lib/okr")),
			join(GOC, "hooks/okr-uy-quyen.ts"),
		];
		const ghiSai: string[] = [];
		for (const t of tep) {
			const s = readFileSync(t, "utf8");
			for (const m of s.matchAll(
				/\bdb\.(okr\w+)\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\(/g,
			)) {
				if (!BANG_GHI_DUOC.has(m[1] ?? ""))
					ghiSai.push(`${relative(GOC, t)}: ${m[1]}.${m[2]}`);
			}
		}
		expect(ghiSai).toEqual([]);
		const doc = readFileSync(join(GOC, "lib/okr/doc.ts"), "utf8");
		const cham = [...doc.matchAll(/\bdb\.(\w+)\.(\w+)\(/g)].map(
			(m) => `${m[1]}.${m[2]}`,
		);
		expect(
			cham.filter(
				(c) =>
					!(DANH_SACH_DOC as readonly string[]).includes(
						c.split(".")[0] ?? "",
					) || !/^find|^count/.test(c.split(".")[1] ?? ""),
			),
		).toEqual([]);
		expect(cham.length).toBeGreaterThan(0);
	});
});
