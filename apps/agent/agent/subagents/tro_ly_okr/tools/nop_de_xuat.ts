import { nopDeXuat } from "@crm/validation/okr-tro-ly";
import { defineTool } from "eve/tools";
import { nopDeXuatVao } from "../../../lib/okr/nop-de-xuat";

export default defineTool({
	description:
		"Submit the proposals for this Trợ lý OKR task. Call exactly once. Lines must use ids from the data block. Answers da-ghi with how many lines passed the checks, or thieu-du-lieu when the Objective is gone.",
	inputSchema: nopDeXuat,
	execute: (input, ctx) => nopDeXuatVao(input, ctx),
});
