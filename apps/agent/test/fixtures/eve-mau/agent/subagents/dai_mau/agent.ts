import { TRO_LY_OKR } from "@mau/agent/agent/lib/okr/config";
import {
	MO_HINH_TRO_LY_OKR,
	TUY_CHON_MO_HINH,
} from "@mau/agent/agent/lib/okr/mo-hinh";
import { defineAgent } from "eve";

export default defineAgent({
	description: "Fixture child that writes long text with the Trợ lý OKR model.",
	model: MO_HINH_TRO_LY_OKR,
	modelContextWindowTokens: TRO_LY_OKR.cuaSoNguCanh,
	modelOptions: TUY_CHON_MO_HINH,
});
