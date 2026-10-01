import { thuocTinhPhienSoan } from "@crm/validation/okr-phien-soan";
import { defineDynamic, defineInstructions } from "eve/instructions";
import { goiSoan, goiThanhChiDan } from "../lib/goi-soan";

export default defineDynamic({
	events: {
		"session.started": async (_event, ctx) => {
			const phien = thuocTinhPhienSoan.safeParse(
				ctx.session.auth.initiator?.attributes ?? {},
			);
			if (!phien.success) return null;
			const goi = await goiSoan(phien.data.cuocSoanId, {
				vai: phien.data.vai,
				ghiDaCat: true,
			});
			return goi ? defineInstructions({ markdown: goiThanhChiDan(goi) }) : null;
		},
	},
});
