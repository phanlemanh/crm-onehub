import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { defineDynamic, defineInstructions } from "eve/instructions";
import { dungGoiDeXuat, goiThanhChiDan } from "../../../lib/okr/goi-ngu-canh";
import { viecCuaPhienCon } from "../../../lib/okr/viec-con";

export default defineDynamic({
	events: {
		"session.started": async (_event, ctx) => {
			const hang = await viecCuaPhienCon(ctx);
			if (hang?.kind !== "okr-de-xuat" || hang.finishedAt) return null;
			const viec = okrTroLyViec.safeParse(hang.payload);
			if (!viec.success || viec.data.viec !== "de-xuat") return null;
			const goi = await dungGoiDeXuat(
				viec.data.objectiveId,
				viec.data.nguoiYeuCau,
				{ keyResultId: viec.data.keyResultId, nac: viec.data.nac },
			);
			return goi ? defineInstructions({ markdown: goiThanhChiDan(goi) }) : null;
		},
	},
});
