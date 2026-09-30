import { defineDynamic, defineInstructions } from "eve/instructions";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../lib/config";
import { goiSoan, goiThanhChiDan } from "../lib/goi-soan";

const phienSoan = z.object({
	purpose: z.literal(TRO_LY_OKR_SOAN.purpose),
	cuocSoanId: z.string().trim().min(1),
	vai: z.enum(TRO_LY_OKR_SOAN.vaiDuocVao),
});

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
