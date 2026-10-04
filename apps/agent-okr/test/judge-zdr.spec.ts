import { describe, expect, spyOn, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { ModelCoSan } from "@crm/ai-okr";
import { gateway } from "ai";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { JUDGE_ZDR } from "../evals/okr-soan/judge";
import { KHUON_MO_DAU } from "../evals/okr-soan/tinh";
import { CAU_CHEN } from "./support/gieo-goi";

const THU_MUC_EVAL =
	process.env.THU_MUC_EVAL_SOAN ?? join(import.meta.dir, "..", "evals");
const CAU_HINH_EVAL = join(THU_MUC_EVAL, "evals.config.ts");
const THE_EVAL = join(import.meta.dir, "..", "evals", "okr-soan", "the.ts");
const THE_TEST = join(import.meta.dir, "support", "the-cua.ts");
const TACH_CAU_HOI_MAN = join(
	import.meta.dir,
	"..",
	"..",
	"app",
	"app",
	"(app)",
	"[slug]",
	"okr",
	"soan",
	"tach-cau-hoi.ts",
);
const KHOA_GIA = "khoa-gia-judge-zdr-khong-phai-khoa-that";
const CHAN_MANG = "judge-zdr: chan mang";
const LOI_GOI = [
	{ role: "user" as const, content: [{ type: "text" as const, text: "hi" }] },
];

function giaiMa(nguon: string): string {
	return nguon.replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) =>
		String.fromCharCode(Number.parseInt(h, 16)),
	);
}

function tepTs(thuMuc: string): string[] {
	const ra: string[] = [];
	for (const ten of readdirSync(thuMuc)) {
		const d = join(thuMuc, ten);
		if (statSync(d).isDirectory()) ra.push(...tepTs(d));
		else if (ten.endsWith(".ts")) ra.push(d);
	}
	return ra;
}

const hinhModel = z.looseObject({
	modelId: z.string(),
	doGenerate: z.instanceof(Function),
});

const modelCoSan = z.custom<ModelCoSan>((v) => hinhModel.safeParse(v).success);

const cauHinhJudge = z.object({
	model: z.unknown(),
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

const thanZdr = z.object({
	providerOptions: z.object({
		gateway: z.object({ zeroDataRetention: z.literal(true) }),
		google: z.object({
			thinkingConfig: z.object({ thinkingLevel: z.literal("low") }),
		}),
	}),
});

const JUDGE_THEO_LOI_GOI = /judge\.autoevals\.\w+\([^;]*\bmodel\s*:/s;

type ThanZdr = z.infer<typeof thanZdr>;

async function thanGuiDi(model: ModelCoSan): Promise<ThanZdr | null> {
	const khoaCu = process.env.AI_GATEWAY_API_KEY;
	const oidcCu = process.env.VERCEL_OIDC_TOKEN;
	process.env.AI_GATEWAY_API_KEY = KHOA_GIA;
	delete process.env.VERCEL_OIDC_TOKEN;
	let than: ThanZdr | null = null;
	const gia = Object.assign(
		async (_dich: Parameters<typeof fetch>[0], init?: RequestInit) => {
			than =
				thanZdr.safeParse(JSON.parse(String(init?.body ?? "null"))).data ??
				null;
			throw new Error(CHAN_MANG);
		},
		{ preconnect: globalThis.fetch.preconnect },
	);
	const chan = spyOn(globalThis, "fetch").mockImplementation(gia);
	try {
		await Promise.resolve(model.doGenerate({ prompt: LOI_GOI })).catch(
			() => null,
		);
	} finally {
		chan.mockRestore();
		if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
		else process.env.AI_GATEWAY_API_KEY = khoaCu;
		if (oidcCu !== undefined) process.env.VERCEL_OIDC_TOKEN = oidcCu;
	}
	return than;
}

async function judgeZdr(judge: CauHinhJudge): Promise<boolean> {
	const doc = cauHinhJudge.safeParse(judge);
	if (!doc.success) return false;
	const model = modelCoSan.safeParse(doc.data.model);
	if (!model.success) return false;
	if (
		doc.data.modelOptions?.providerOptions?.gateway?.zeroDataRetention !== true
	)
		return false;
	if (
		!(TRO_LY_OKR_SOAN.moHinhZdr as readonly string[]).includes(
			model.data.modelId,
		)
	)
		return false;
	return (await thanGuiDi(model.data)) !== null;
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
		let sai = !ds.success || JUDGE_THEO_LOI_GOI.test(nguon);
		for (const e of ds.success ? ds.data : [])
			if (e.judge ? !(await judgeZdr(e.judge)) : dungJudge) sai = true;
		if (sai) loi.push(`judge khong zdr: ${ten}`);
	}
	return { soTep: tep.length, loi };
}

describe("judge-zdr", () => {
	test("judge-zdr: mọi eval dưới evals/ có judge dựng qua xưởng ZDR, model thuộc danh sách của cấu hình", async () => {
		const { soTep, loi } = await kiemJudge(THU_MUC_EVAL);
		console.log(`judge-zdr: quet ${soTep} tep *.eval.ts duoi ${THU_MUC_EVAL}`);
		if (soTep === 0) throw new Error(`judge-zdr: 0 tep duoi ${THU_MUC_EVAL}`);
		expect(loi).toEqual([]);
		const cauHinh = z
			.object({ judge: cauHinhJudge.optional() })
			.parse((await import(CAU_HINH_EVAL)).default);
		if (!cauHinh.judge || !(await judgeZdr(cauHinh.judge)))
			throw new Error("judge khong zdr: evals.config.ts");
	}, 60_000);

	test("judge-zdr: đối chứng — bộ đọc bắt model thô không qua xưởng, thiếu cờ, model ngoài danh sách, chuỗi model, và judge truyền theo lời gọi", async () => {
		expect(await judgeZdr(JUDGE_ZDR)).toBe(true);
		expect(
			await judgeZdr({
				model: gateway(TRO_LY_OKR_SOAN.judge.model),
				modelOptions: JUDGE_ZDR.modelOptions,
			}),
		).toBe(false);
		expect(await judgeZdr({ model: JUDGE_ZDR.model })).toBe(false);
		expect(
			await judgeZdr({
				model: TRO_LY_OKR_SOAN.judge.model,
				modelOptions: JUDGE_ZDR.modelOptions,
			}),
		).toBe(false);
		expect(
			await judgeZdr({
				model: gateway("openai/gpt-5.4-mini"),
				modelOptions: JUDGE_ZDR.modelOptions,
			}),
		).toBe(false);
		expect(
			JUDGE_THEO_LOI_GOI.test(
				't.judge.autoevals.closedQA("gon", { model: "openai/gpt-5.4-mini" })',
			),
		).toBe(true);
	});
});

describe("eval-soan-khong-troi", () => {
	test("the.ts của eval giống hệt the-cua.ts của test", () => {
		expect(readFileSync(THE_EVAL, "utf8")).toBe(readFileSync(THE_TEST, "utf8"));
	});

	test("câu chèn của eval trùng câu chèn của bài hỏng-chèn", () => {
		expect(TRO_LY_OKR_SOAN.danhGia.cauChen).toBe(CAU_CHEN);
	});

	test("khuôn câu hỏi mở đầu của eval trùng bộ tách của màn soạn", () => {
		const man = readFileSync(TACH_CAU_HOI_MAN, "utf8");
		const khuon = (ten: string) => {
			const m = man.match(new RegExp(`const ${ten} = /(.+)/([a-z]*);`));
			if (!m?.[1]) throw new Error(`khong thay ${ten} trong tach-cau-hoi.ts`);
			return new RegExp(m[1], m[2]);
		};
		for (const [ten, cua] of [
			["DONG_HOI", KHUON_MO_DAU.hoi],
			["DONG_GOI_Y", KHUON_MO_DAU.goiY],
		] as const) {
			expect(giaiMa(cua.source)).toBe(giaiMa(khuon(ten).source));
			expect(cua.flags).toBe(khuon(ten).flags);
		}
	});
});
