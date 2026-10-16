import type { LanguageModel } from "ai";
import type { NguCanhKenh } from "../phien-con";
import { TRO_LY_OKR } from "./config";
import { MO_HINH_TOM_TAT } from "./mo-hinh";
import { MO_HINH_DANG_CHAY } from "./mo-hinh-thu";
import { type ViecCon, viecCuaPhienCon } from "./viec-con";

export type MoHinhChon = {
	readonly model: LanguageModel;
	readonly modelContextWindowTokens: number;
};

export async function chonMoHinhTheoViec(
	ctx: NguCanhKenh,
	tim: (ctx: NguCanhKenh) => Promise<ViecCon | null> = viecCuaPhienCon,
): Promise<MoHinhChon | null> {
	const hang = await tim(ctx);
	if (hang?.kind !== TRO_LY_OKR.loaiViecTomTat) return null;
	return {
		model: MO_HINH_TOM_TAT,
		modelContextWindowTokens: MO_HINH_DANG_CHAY.cuaSoNguCanh,
	};
}
