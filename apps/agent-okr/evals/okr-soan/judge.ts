import { type ModelCoSan, tuyChonZdr, xuongModelZdr } from "@crm/ai-okr";
import { type LanguageModelMiddleware, wrapLanguageModel } from "ai";
import type { EveEvalJudgeConfig } from "eve/evals";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";
import { ghiTongKet } from "./tong-ket";

type BocSinh = NonNullable<LanguageModelMiddleware["wrapGenerate"]>;
type ThamSoJudge = Parameters<BocSinh>[0]["params"];
type KetQuaJudge = Awaited<ReturnType<Parameters<BocSinh>[0]["doGenerate"]>>;

export type LanJudge = { lanThu: number; loi: string | null };

const congCuEp = z.object({ type: z.literal("tool"), toolName: z.string() });

const luaChonCuaCongCu = z.object({
	properties: z.object({
		choice: z.object({ enum: z.array(z.string()).min(1) }),
	}),
});

const dauVaoChon = z
	.string()
	.transform((chu, ctx) => {
		try {
			return JSON.parse(chu);
		} catch {
			ctx.addIssue({ code: "custom", message: "input khong phai json" });
			return z.NEVER;
		}
	})
	.pipe(z.object({ choice: z.string() }));

export function loiTraLoiJudge(
	params: ThamSoJudge,
	noiDung: KetQuaJudge["content"],
): string | null {
	const ep = congCuEp.safeParse(params.toolChoice);
	if (!ep.success) return null;
	const ten = ep.data.toolName;
	const goi = noiDung.flatMap((c) =>
		c.type === "tool-call" && c.toolName === ten ? [c] : [],
	)[0];
	if (!goi) return `khong goi ${ten}`;
	const vao = dauVaoChon.safeParse(goi.input);
	if (!vao.success)
		return `${ten} sai khuon: ${vao.error.issues[0]?.message ?? "?"}`;
	const congCu = params.tools?.flatMap((c) =>
		c.type === "function" && c.name === ten ? [c] : [],
	)[0];
	const luaChon = luaChonCuaCongCu.safeParse(congCu?.inputSchema);
	const chon = vao.data.choice.trim();
	if (luaChon.success && !luaChon.data.properties.choice.enum.includes(chon))
		return `choice ngoai danh sach: ${chon}`;
	return null;
}

export function thuLaiJudge(
	soLan: number,
	ghi: (lan: LanJudge) => void,
): LanguageModelMiddleware {
	return {
		wrapGenerate: async ({ doGenerate, params }) => {
			let lanThu = 1;
			let kq = await doGenerate();
			let loi = loiTraLoiJudge(params, kq.content);
			while (loi !== null && lanThu < soLan) {
				lanThu += 1;
				kq = await doGenerate();
				loi = loiTraLoiJudge(params, kq.content);
			}
			ghi({ lanThu, loi });
			return kq;
		},
	};
}

const MODEL_JUDGE: ModelCoSan = wrapLanguageModel({
	model: xuongModelZdr({
		modelId: TRO_LY_OKR_SOAN.judge.model,
		tags: TRO_LY_OKR_SOAN.tags,
		tranRaMoiLoiGoi: TRO_LY_OKR_SOAN.judge.tranRaMoiLoiGoi,
	}),
	middleware: thuLaiJudge(TRO_LY_OKR_SOAN.judge.soLanThu, (lan) =>
		ghiTongKet({ loai: "judge", ...lan }),
	),
	modelId: TRO_LY_OKR_SOAN.judge.model,
});

export type JudgeZdr = {
	model: ModelCoSan;
	modelOptions: ReturnType<typeof tuyChonZdr>;
};

export const JUDGE_ZDR: JudgeZdr = {
	model: MODEL_JUDGE,
	modelOptions: tuyChonZdr(TRO_LY_OKR_SOAN.tags),
} satisfies EveEvalJudgeConfig;
