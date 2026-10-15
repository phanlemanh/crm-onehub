import { createRequire } from "node:module";
import { join } from "node:path";
import { TRO_LY_OKR_SOAN } from "../../../apps/agent-okr/agent/lib/config.ts";
import { GOC } from "./phien-hoi.mjs";

export const TRAN_RA_PHIEU = 12_000;

const yeuCauOkr = createRequire(join(GOC, "apps/agent-okr/package.json"));
const { xuongModelZdr } = await import(yeuCauOkr.resolve("@crm/ai-okr"));

export function taoModelPhieu() {
	return xuongModelZdr({
		modelId: TRO_LY_OKR_SOAN.judge.model,
		tags: TRO_LY_OKR_SOAN.tags,
		tranRaMoiLoiGoi: TRAN_RA_PHIEU,
		khoa: process.env[TRO_LY_OKR_SOAN.khoa.rieng],
	});
}
