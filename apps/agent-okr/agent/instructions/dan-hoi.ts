import { OKR_PHIEN_HOI } from "@crm/validation/okr-phien-hoi";
import { defineDynamic, defineInstructions } from "eve/instructions";
import { LOI_DAN_HOI } from "../lib/loi-dan-hoi";

export default defineDynamic({
	events: {
		"session.started": (_event, ctx) =>
			ctx.session.auth.initiator?.attributes.purpose === OKR_PHIEN_HOI.purpose
				? defineInstructions({ markdown: LOI_DAN_HOI })
				: null,
	},
});
