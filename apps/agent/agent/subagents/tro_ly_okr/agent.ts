import { ketQuaTroLy } from "@crm/validation/okr-tro-ly";
import { defineAgent } from "eve";
import { TRO_LY_OKR } from "../../lib/okr/config";
import { MO_HINH_TRO_LY_OKR, TUY_CHON_MO_HINH } from "../../lib/okr/mo-hinh";

export default defineAgent({
	description:
		"Trợ lý OKR. Reads one OKR task by its id from the session attributes and submits proposals through nop_de_xuat or a weekly summary through nop_tom_tat. Takes no data from the message. Returns only a status code.",
	model: MO_HINH_TRO_LY_OKR,
	modelContextWindowTokens: TRO_LY_OKR.cuaSoNguCanh,
	modelOptions: TUY_CHON_MO_HINH,
	outputSchema: ketQuaTroLy,
	limits: TRO_LY_OKR.limits,
});
