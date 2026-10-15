import { OKR_PHIEN_SOAN } from "@crm/validation/okr-phien-soan";
import { defineDynamic, defineInstructions } from "eve/instructions";
import { LOI_DAN_SOAN } from "../lib/loi-dan-soan";

export default defineDynamic({
	events: {
		"session.started": (_event, ctx) =>
			ctx.session.auth.initiator?.attributes.purpose === OKR_PHIEN_SOAN.purpose
				? defineInstructions({ markdown: LOI_DAN_SOAN })
				: null,
	},
});
