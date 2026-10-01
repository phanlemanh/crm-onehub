import { nopTomTat, TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { defineTool } from "eve/tools";
import { nopTomTatVao } from "../../../lib/okr/nop-tom-tat";

export default defineTool({
	description: `Submit the weekly summary for this Trợ lý OKR task. Call exactly once. Every sentence cites 1 to ${TRO_LY_OKR_TRAN.soNguonMoiCau} update ids from the data block. Answers da-ghi with how many sentences passed the checks, tu-choi when this task takes no weekly summary, or thieu-du-lieu when the department is gone.`,
	inputSchema: nopTomTat,
	execute: (input, ctx) => nopTomTatVao(input, ctx),
});
