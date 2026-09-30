import { tuyChonZdr, xuongModelZdr } from "@crm/ai-okr";
import type { EveEvalJudgeConfig } from "eve/evals";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";

export const JUDGE_ZDR = {
	model: xuongModelZdr({
		modelId: TRO_LY_OKR_SOAN.judge.model,
		tags: TRO_LY_OKR_SOAN.tags,
		tranRaMoiLoiGoi: TRO_LY_OKR_SOAN.judge.tranRaMoiLoiGoi,
	}),
	modelOptions: tuyChonZdr(TRO_LY_OKR_SOAN.tags),
} satisfies EveEvalJudgeConfig;
