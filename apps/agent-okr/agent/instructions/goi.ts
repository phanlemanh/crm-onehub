import { defineDynamic, defineInstructions } from "eve/instructions";
import { goiSoan, goiThanhChiDan } from "../lib/goi-soan";
import { phienSoan } from "../lib/phien";

export default defineDynamic({
	events: {
		"session.started": async (_event, ctx) => {
			const phien = phienSoan.safeParse(
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
