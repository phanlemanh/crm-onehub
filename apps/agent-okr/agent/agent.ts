import "@crm/env/load";

import { xuongModelZdr } from "@crm/ai-okr";
import { db } from "@crm/db";
import { defineAgent } from "eve";
import { TRO_LY_OKR_SOAN } from "./lib/config";

void db.$queryRaw`select 1`.catch((loi: Error) =>
	console.warn(`[agent-okr] chưa nối được kho: ${loi.message}`),
);

export default defineAgent({
	model: xuongModelZdr({
		modelId: TRO_LY_OKR_SOAN.model,
		tags: TRO_LY_OKR_SOAN.tags,
		tranRaMoiLoiGoi: TRO_LY_OKR_SOAN.tranRaMoiLoiGoi,
	}),
	modelContextWindowTokens: TRO_LY_OKR_SOAN.cuaSoNguCanh,
	limits: TRO_LY_OKR_SOAN.limits,
});
