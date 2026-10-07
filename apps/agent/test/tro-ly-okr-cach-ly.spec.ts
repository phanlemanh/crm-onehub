import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
import {
	chonMoHinhTheoViec,
	type MoHinhChon,
} from "../agent/lib/okr/chon-mo-hinh";
import { TRO_LY_OKR } from "../agent/lib/okr/config";
import { DANH_SACH_DOC } from "../agent/lib/okr/doc";
import {
	dungMoHinh,
	kepTranRaMoiLoiGoi,
	kepTranTomTat,
	MO_HINH_TOM_TAT,
	MO_HINH_TRO_LY_OKR,
	type MoHinhSong,
} from "../agent/lib/okr/mo-hinh";
import type { NguCanhKenh } from "../agent/lib/phien-con";
import troLyOkr from "../agent/subagents/tro_ly_okr/agent";

const GOC = join(import.meta.dir, "..", "agent");
const THU_MUC_CON =
	process.env.THU_MUC_TRO_LY ?? join(GOC, "subagents/tro_ly_okr");
const THU_MUC_EVAL =
	process.env.THU_MUC_EVAL_OKR ?? join(import.meta.dir, "..", "evals/okr");
const CAU_HINH_EVAL = join(import.meta.dir, "..", "evals/evals.config.ts");
const TOOL_SONG = ["nop_de_xuat", "nop_tom_tat"] as const;
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
const BANG_DOC_TOM_TAT = [
	"okrTomTat",
	"okrCheckIn",
	"okrCheckInSession",
	"okrKeyResult",
	"okrObjective",
	"department",
	"member",
	"user",
	"agentTask",
	"okrProgramConfig",
] as const;
const BANG_DOI_TAC = [
	"company",
	"companyEnrichment",
	"contact",
	"contactFact",
	"contactBrief",
	"deal",
	"dealStage",
	"dealContact",
	"campaign",
	"campaignTouch",
	"activity",
	"mailboxSync",
	"emailThread",
	"emailMessage",
	"calendarEvent",
	"calendarAttendee",
	"suppressedDomain",
	"suppressedContact",
	"trackedDomain",
	"trackedVisitor",
	"trackedEvent",
	"formSubmission",
] as const;

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

type CauHinhNha = {
	zeroDataRetention?: boolean;
	thinkingConfig?: { thinkingLevel?: string };
};

const GIOI_HAN = [
	"maxInputTokensPerSession",
	"maxOutputTokensPerSession",
	"sessionTimeoutMs",
] as const;

const soGioiHan = z.number();

type XuLyBuoc = (
	su: { type: string },
	ctx: NguCanhKenh,
) => Promise<MoHinhChon | null>;

const moHinhDong = z.object({
	kind: z.literal("eve:dynamic"),
	fallback: z.custom<MoHinhSong>((v) => v instanceof Object),
	events: z.strictObject({
		"step.started": z.custom<XuLyBuoc>((v) => v instanceof Function),
	}),
});

function kiemMoHinh(dinhNghia: {
	model: unknown;
	modelOptions?: {
		providerOptions?: {
			gateway?: CauHinhNha;
			google?: CauHinhNha;
			vertex?: CauHinhNha;
		};
	};
	limits?: Partial<Record<(typeof GIOI_HAN)[number], number>>;
}): string[] {
	const loi: string[] = [];
	const laDong =
		(dinhNghia.model as { kind?: string } | undefined)?.kind === "eve:dynamic";
	const dong = moHinhDong.safeParse(dinhNghia.model);
	if (laDong && !dong.success) loi.push("model dong ngoai step.started");
	if (!laDong && dinhNghia.model instanceof Function) loi.push("model dong");
	const model = (
		laDong && dong.success ? dong.data.fallback : dinhNghia.model
	) as { modelId?: string };
	if (model?.modelId !== TRO_LY_OKR.model)
		loi.push(`model la: ${model?.modelId}`);
	const po = dinhNghia.modelOptions?.providerOptions ?? {};
	if (po.gateway?.zeroDataRetention !== true) loi.push("thieu ZDR");
	for (const nha of ["google", "vertex"] as const) {
		if (po[nha]?.thinkingConfig?.thinkingLevel !== "low")
			loi.push(`thieu thinkingLevel: ${nha}`);
	}
	for (const k of GIOI_HAN) {
		if (!soGioiHan.safeParse(dinhNghia.limits?.[k]).success)
			loi.push(`thieu limit: ${k}`);
	}
	return loi;
}

describe("tro-ly-okr-cach-ly", () => {
	test("tập tool đúng bằng tập khai, tool dựng sẵn tắt, khuôn không vòng $ref", async () => {
		expect(await kiemTapTool(THU_MUC_CON)).toEqual([]);
	});

	test("model, ZDR, mức suy nghĩ và trần cố định ở cấp subagent; không khuôn kết quả", () => {
		expect(kiemMoHinh(troLyOkr as never)).toEqual([]);
		expect("outputSchema" in troLyOkr).toBe(false);
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

	test("danh sách đọc có bảng của tóm tắt tuần và không bảng đối tác nào", () => {
		const doc: readonly string[] = DANH_SACH_DOC;
		expect(BANG_DOC_TOM_TAT.filter((b) => !doc.includes(b))).toEqual([]);
		expect(
			doc.filter((b) => (BANG_DOI_TAC as readonly string[]).includes(b)),
		).toEqual([]);
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

describe("tuy-chon-moi-loi-goi", () => {
	test("model đã bọc tự gắn ZDR và mức suy nghĩ vào mọi lời gọi, giữ tuỳ chọn có sẵn, kẹp token ra", async () => {
		const bien = kepTranRaMoiLoiGoi.transformParams;
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
			"thieu ZDR trong loi goi",
		).toBe(true);
		expect(ra.providerOptions?.gateway?.order).toEqual(["vertex"]);
		expect(ra.providerOptions?.gateway?.tags).toEqual([...TRO_LY_OKR.tags]);
		for (const nha of ["google", "vertex"]) {
			expect(
				ra.providerOptions?.[nha],
				`thieu thinkingLevel trong loi goi: ${nha}`,
			).toEqual({
				thinkingConfig: { thinkingLevel: "low" },
			});
		}
		expect(ra.maxOutputTokens).toBe(TRO_LY_OKR.tranRaMoiLoiGoi);
		const trong = await bien({
			type: "generate",
			model: {} as never,
			params: { prompt: [] },
		});
		expect(
			trong.providerOptions?.gateway?.zeroDataRetention,
			"thieu ZDR khi khong co tuy chon",
		).toBe(true);
	});
});

describe("tran-tom-tat-moi-loi-goi", () => {
	const GIA_TRI_LON = 20_000;

	async function tranCuaMoHinh(
		kep: Parameters<typeof dungMoHinh>[0],
		xin: number | undefined,
	) {
		const daGoi: Parameters<MockLanguageModelV4["doGenerate"]>[0][] = [];
		const gia = new MockLanguageModelV4({
			doGenerate: async (vao) => {
				daGoi.push(vao);
				return {} as never;
			},
		});
		await (dungMoHinh(kep, gia) as unknown as MockLanguageModelV4).doGenerate({
			prompt: [],
			maxOutputTokens: xin,
		});
		return daGoi[0];
	}

	test("trần tóm tắt 8.000, trần góp ý 2.000, trần phiên 16.000 đủ hai lời gọi tóm tắt", () => {
		expect(TRO_LY_OKR.tranRaTomTatMoiLoiGoi).toBe(8_000);
		expect(TRO_LY_OKR.tranRaMoiLoiGoi).toBe(2_000);
		expect(TRO_LY_OKR.limits.maxOutputTokensPerSession).toBe(16_000);
		expect(TRO_LY_OKR.limits.maxOutputTokensPerSession).toBeGreaterThan(
			TRO_LY_OKR.tranRaTomTatMoiLoiGoi,
		);
	});

	test("model tóm tắt kẹp 8.000 cả khi xin nhiều hơn hay không xin, vẫn ZDR và thinkingLevel", async () => {
		for (const xin of [GIA_TRI_LON, undefined]) {
			const vao = await tranCuaMoHinh(kepTranTomTat, xin);
			expect(vao?.maxOutputTokens).toBe(TRO_LY_OKR.tranRaTomTatMoiLoiGoi);
			expect(vao?.providerOptions?.gateway?.zeroDataRetention).toBe(true);
			expect(vao?.providerOptions?.google).toEqual({
				thinkingConfig: { thinkingLevel: "low" },
			});
		}
		const nho = await tranCuaMoHinh(kepTranTomTat, 500);
		expect(nho?.maxOutputTokens).toBe(500);
	});

	test("model góp ý vẫn kẹp 2.000", async () => {
		const vao = await tranCuaMoHinh(kepTranRaMoiLoiGoi, GIA_TRI_LON);
		expect(vao?.maxOutputTokens).toBe(TRO_LY_OKR.tranRaMoiLoiGoi);
	});

	test("hai model cùng mã model, khác đối tượng", () => {
		expect(MO_HINH_TOM_TAT.modelId).toBe(TRO_LY_OKR.model);
		expect(MO_HINH_TRO_LY_OKR.modelId).toBe(TRO_LY_OKR.model);
		expect(MO_HINH_TOM_TAT).not.toBe(MO_HINH_TRO_LY_OKR);
	});

	test("chọn theo việc: tóm tắt được model 8.000, góp ý và không tìm được việc rơi về mặc định", async () => {
		const ctx = {};
		const viec = (kind: string) => async () => ({ kind }) as never;
		const tomTat = await chonMoHinhTheoViec(ctx, viec("okr-tom-tat-tuan"));
		expect(tomTat?.model).toBe(MO_HINH_TOM_TAT);
		expect(tomTat?.modelContextWindowTokens).toBe(TRO_LY_OKR.cuaSoNguCanh);
		expect(await chonMoHinhTheoViec(ctx, viec("okr-de-xuat"))).toBeNull();
		expect(await chonMoHinhTheoViec(ctx, async () => null)).toBeNull();
	});

	test("agent: model động chỉ ở step.started, mặc định là model 2.000, không tìm được phiên gốc thì không chọn", async () => {
		const model = moHinhDong.parse(troLyOkr.model);
		expect(model.kind).toBe("eve:dynamic");
		expect(model.fallback).toBe(MO_HINH_TRO_LY_OKR);
		expect(
			await model.events["step.started"]({ type: "step.started" }, {}),
		).toBeNull();
	});
});

const cauHinhJudge = z.object({
	model: z
		.union([
			z.string(),
			z.object({ modelId: z.string() }).transform((m) => m.modelId),
		])
		.optional(),
	modelOptions: z
		.object({
			providerOptions: z
				.object({
					gateway: z
						.object({ zeroDataRetention: z.boolean().optional() })
						.optional(),
				})
				.optional(),
		})
		.optional(),
});

type CauHinhJudge = z.input<typeof cauHinhJudge>;

const evalDaKhai = z.object({
	_tag: z.literal("EveEval"),
	judge: cauHinhJudge.optional(),
});

const JUDGE_THEO_LOI_GOI = /judge\.autoevals\.\w+\([^;]*\bmodel\s*:/s;

function judgeZdr(judge: CauHinhJudge): boolean {
	const doc = cauHinhJudge.safeParse(judge);
	if (!doc.success) return false;
	return (
		doc.data.modelOptions?.providerOptions?.gateway?.zeroDataRetention ===
			true &&
		(TRO_LY_OKR.moHinhZdr as readonly string[]).includes(doc.data.model ?? "")
	);
}

async function kiemJudge(
	thuMuc: string,
): Promise<{ soTep: number; loi: string[] }> {
	const tep = tepTs(thuMuc).filter((t) => t.endsWith(".eval.ts"));
	const loi: string[] = [];
	for (const t of tep) {
		const ten = relative(thuMuc, t);
		const mod = await import(t);
		const ds = z.array(evalDaKhai).safeParse([mod.default].flat());
		const nguon = readFileSync(t, "utf8");
		const dungJudge = /\bt\.judge\./.test(nguon);
		const sai =
			!ds.success ||
			ds.data.some((e) => (e.judge ? !judgeZdr(e.judge) : dungJudge)) ||
			JUDGE_THEO_LOI_GOI.test(nguon);
		if (sai) loi.push(`judge khong zdr: ${ten}`);
	}
	return { soTep: tep.length, loi };
}

describe("judge-zdr", () => {
	test("judge-zdr: mọi eval dưới evals/okr có judge ZDR thuộc danh sách của cấu hình", async () => {
		const { soTep, loi } = await kiemJudge(THU_MUC_EVAL);
		console.log(`judge-zdr: quet ${soTep} tep *.eval.ts duoi ${THU_MUC_EVAL}`);
		if (soTep === 0) throw new Error(`judge-zdr: 0 tep duoi ${THU_MUC_EVAL}`);
		expect(loi).toEqual([]);
		const cauHinh = z
			.object({ judge: cauHinhJudge.optional() })
			.parse((await import(CAU_HINH_EVAL)).default);
		if (cauHinh.judge && !judgeZdr(cauHinh.judge)) {
			throw new Error("judge khong zdr: evals.config.ts");
		}
	});

	test("judge-zdr: đối chứng — bộ đọc thấy judge thiếu cờ, model ngoài danh sách, và t.judge không khai judge", () => {
		expect(
			judgeZdr({
				model: TRO_LY_OKR.judge.model,
				modelOptions: TRO_LY_OKR.judge.modelOptions,
			}),
		).toBe(true);
		expect(judgeZdr({ model: TRO_LY_OKR.judge.model })).toBe(false);
		expect(
			judgeZdr({
				model: "openai/gpt-5.4-mini",
				modelOptions: TRO_LY_OKR.judge.modelOptions,
			}),
		).toBe(false);
		expect(
			JUDGE_THEO_LOI_GOI.test(
				't.judge.autoevals.closedQA("gon", { model: "openai/gpt-5.4-mini" })',
			),
		).toBe(true);
	});
});
