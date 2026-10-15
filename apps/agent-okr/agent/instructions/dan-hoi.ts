import { OKR_PHIEN_HOI } from "@crm/validation/okr-phien-hoi";
import { defineDynamic, defineInstructions } from "eve/instructions";
import { loiDanHoi } from "../lib/loi-dan-hoi";
import { thuocTinhPhien } from "../lib/phien";

export default defineDynamic({
	events: {
		"session.started": (_event, ctx) =>
			ctx.session.auth.initiator?.attributes.purpose === OKR_PHIEN_HOI.purpose
				? defineInstructions({
						markdown: loiDanHoi(thuocTinhPhien(ctx).vai),
					})
				: null,
	},
});
