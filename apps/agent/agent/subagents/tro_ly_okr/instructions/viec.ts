import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { defineDynamic, defineInstructions } from "eve/instructions";
import { docViecOkr } from "../../../lib/okr/doc";
import { dungGoiDeXuat, goiThanhChiDan } from "../../../lib/okr/goi-ngu-canh";
import { attribute, purposeOf } from "../../../lib/session-purpose";

export default defineDynamic({
	events: {
		"session.started": async (_event, ctx) => {
			if (purposeOf(ctx) !== "okr") return null;
			const taskId = attribute(ctx, "okrTaskId");
			if (!taskId) return null;
			const hang = await docViecOkr(taskId);
			if (!hang || hang.kind !== "okr-de-xuat" || hang.finishedAt) return null;
			const viec = okrTroLyViec.safeParse(hang.payload);
			if (!viec.success || viec.data.viec !== "de-xuat") return null;
			const goi = await dungGoiDeXuat(viec.data.objectiveId);
			return goi ? defineInstructions({ markdown: goiThanhChiDan(goi) }) : null;
		},
	},
});
