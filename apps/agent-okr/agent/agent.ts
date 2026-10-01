import "@crm/env/load";

import { xuongModelZdr } from "@crm/ai-okr";
import { defineAgent } from "eve";
import { TRO_LY_OKR_SOAN } from "./lib/config";

export default defineAgent({
	model: xuongModelZdr({
		modelId: TRO_LY_OKR_SOAN.model,
		tags: TRO_LY_OKR_SOAN.tags,
		tranRaMoiLoiGoi: TRO_LY_OKR_SOAN.tranRaMoiLoiGoi,
		khoa: process.env[TRO_LY_OKR_SOAN.khoa.rieng],
	}),
	modelContextWindowTokens: TRO_LY_OKR_SOAN.cuaSoNguCanh,
	limits: TRO_LY_OKR_SOAN.limits,
});
