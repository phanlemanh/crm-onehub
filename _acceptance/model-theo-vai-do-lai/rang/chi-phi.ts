import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type ChiPhi, khuonChiPhi, khuonKeHoach, MTV, z } from "./khuon";

const tepChiPhi = join(MTV.evidence, MTV.tep.chiPhi);
const khuonSoDu = z.object({ balance: z.coerce.number() });

export function keHoach() {
	return khuonKeHoach.parse(
		JSON.parse(readFileSync(join(MTV.evidence, MTV.tep.keHoach), "utf8")),
	);
}

export function docChiPhi(): ChiPhi {
	if (!existsSync(tepChiPhi)) return { tran_usd: keHoach().tran_usd, luot: [] };
	return khuonChiPhi.parse(JSON.parse(readFileSync(tepChiPhi, "utf8")));
}

export const tongChi = (c: ChiPhi) =>
	c.luot.reduce((s, l) => s + (l.usd ?? 0), 0);

export function conTran(): boolean {
	const c = docChiPhi();
	return tongChi(c) < c.tran_usd;
}

export function ghiLuot(vao: Omit<ChiPhi["luot"][number], "luc">) {
	const muc = { ...vao, luc: new Date().toISOString() };
	const c = docChiPhi();
	const i = c.luot.findIndex((l) => l.vai === muc.vai && l.luot === muc.luot);
	if (i >= 0) c.luot[i] = muc;
	else c.luot.push(muc);
	c.luot.sort((a, b) => a.luc.localeCompare(b.luc));
	writeFileSync(tepChiPhi, `${JSON.stringify(c, null, 2)}\n`);
}

export function khoaGateway(): string {
	const k =
		process.env.AI_GATEWAY_API_KEY?.trim() ||
		process.env.KHO_TAI_LIEU_AI_GATEWAY_API_KEY?.trim();
	if (!k) throw new Error("thieu AI_GATEWAY_API_KEY");
	return k;
}

export async function soDuGateway(): Promise<number | null> {
	try {
		const r = await fetch(`${MTV.urlGateway}/credits`, {
			headers: { authorization: `Bearer ${khoaGateway()}` },
			signal: AbortSignal.timeout(10_000),
		});
		if (!r.ok) return null;
		return khuonSoDu.parse(await r.json()).balance;
	} catch {
		return null;
	}
}

export const chenhLech = (truoc: number | null, sau: number | null) =>
	truoc === null || sau === null
		? null
		: Number(Math.max(0, truoc - sau).toFixed(6));
