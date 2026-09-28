import { type NguCanhKenh, phienGocCua } from "../phien-con";
import { TRO_LY_OKR } from "./config";
import { docViecTheoPhienGoc } from "./doc";

export type ViecCon = NonNullable<
	Awaited<ReturnType<typeof docViecTheoPhienGoc>>
>;

export async function viecCuaPhienCon(
	ctx: NguCanhKenh,
	cho: (ms: number) => Promise<void> = (ms) =>
		new Promise((r) => setTimeout(r, ms)),
): Promise<ViecCon | null> {
	const goc = phienGocCua(ctx);
	if (!goc) return null;
	const { soLan, cachMs } = TRO_LY_OKR.timViecCon;
	for (let lan = 0; lan < soLan; lan += 1) {
		const hang = await docViecTheoPhienGoc(goc);
		if (hang) return hang;
		await cho(cachMs);
	}
	return null;
}
