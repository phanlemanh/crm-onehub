import { defineEvalConfig } from "eve/evals";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { JUDGE_ZDR } from "./okr-soan/judge";

export default defineEvalConfig({
	maxConcurrency: 1,
	timeoutMs: TRO_LY_OKR_SOAN.danhGia.timeoutMs,
	judge: JUDGE_ZDR,
});
