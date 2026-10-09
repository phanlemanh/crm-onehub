import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import { defineDynamic, defineInstructions } from "eve/instructions";
import { MUC_TOM_TAT } from "../../../lib/okr/chi-dan-tom-tat";
import { TRO_LY_OKR } from "../../../lib/okr/config";
import {
	dungGoiDeXuat,
	goiThanhChiDan,
	goiTomTatThanhChiDan,
} from "../../../lib/okr/goi-ngu-canh";
import { goiTomTatCuaViec } from "../../../lib/okr/nop-tom-tat";
import { type ViecCon, viecCuaPhienCon } from "../../../lib/okr/viec-con";

async function chiDanDeXuat(hang: ViecCon): Promise<string | null> {
	const viec = okrTroLyViec.safeParse(hang.payload);
	if (!viec.success || viec.data.viec !== "de-xuat") return null;
	const goi = await dungGoiDeXuat(
		viec.data.objectiveId,
		viec.data.nguoiYeuCau,
		{ keyResultId: viec.data.keyResultId, nac: viec.data.nac },
	);
	return goi ? goiThanhChiDan(goi) : null;
}

async function chiDanTomTat(hang: ViecCon): Promise<string | null> {
	const goi = await goiTomTatCuaViec(hang);
	return goi ? `${MUC_TOM_TAT}\n\n${goiTomTatThanhChiDan(goi)}` : null;
}

async function chiDanCua(hang: ViecCon): Promise<string | null> {
	if (hang.kind === "okr-de-xuat") return chiDanDeXuat(hang);
	if (hang.kind === "okr-tom-tat-tuan") return chiDanTomTat(hang);
	return null;
}

export default defineDynamic({
	events: {
		"session.started": async (_event, ctx) => {
			const hang = await viecCuaPhienCon(ctx);
			if (!hang)
				return defineInstructions({
					markdown: TRO_LY_OKR.ngoaiPhien.chiDanKhongViec,
				});
			if (hang.finishedAt) return null;
			const markdown = await chiDanCua(hang);
			return markdown ? defineInstructions({ markdown }) : null;
		},
	},
});
