import { defineHook } from "eve/hooks";
import { docViecTheoPhienGoc } from "../../../lib/okr/doc";
import { giaHanLease } from "../../../lib/okr/viec";
import { phienGocCua } from "../../../lib/phien-con";

export default defineHook({
	events: {
		async "*"(_event, ctx) {
			const goc = phienGocCua(ctx);
			if (!goc) return;
			try {
				const hang = await docViecTheoPhienGoc(goc);
				if (hang) await giaHanLease(hang.id);
			} catch (loi) {
				console.warn(
					`[giu-viec] không gia hạn được việc của phiên ${goc}: ${loi instanceof Error ? loi.message : String(loi)}`,
				);
			}
		},
	},
});
