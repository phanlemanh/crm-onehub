import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import {
	type ChiPhi,
	type DongChi,
	GOC,
	type HangChiPhi,
	type KeHoach,
	khuonChiPhi,
	khuonKeHoach,
	MTV,
	type SuKienChon,
	z,
} from "./khuon";

const khuonSoDu = z.object({ balance: z.coerce.number() });

export function keHoach(ev: string = MTV.evidence): KeHoach {
	return khuonKeHoach.parse(
		JSON.parse(readFileSync(join(ev, MTV.tep.keHoach), "utf8")),
	);
}

export function docChiPhi(ev: string = MTV.evidence): ChiPhi {
	const tep = join(ev, MTV.tep.chiPhi);
	if (!existsSync(tep)) return { tran_usd: keHoach(ev).tran_usd, luot: [] };
	return khuonChiPhi.parse(JSON.parse(readFileSync(tep, "utf8")));
}

export const tongChi = (c: ChiPhi) =>
	c.luot.reduce((s, l) => s + (l.usd ?? 0), 0);

export function conTran(ev: string = MTV.evidence): boolean {
	return tongChi(docChiPhi(ev)) < keHoach(ev).tran_usd;
}

export type VaoChi = Omit<DongChi, "luc"> & { luc?: string };

export function ghiLuot(vao: VaoChi, ev: string = MTV.evidence) {
	const muc: DongChi = { ...vao, luc: vao.luc ?? new Date().toISOString() };
	const c = docChiPhi(ev);
	c.tran_usd = keHoach(ev).tran_usd;
	const i = c.luot.findIndex((l) => l.vai === muc.vai && l.luot === muc.luot);
	if (i >= 0) c.luot[i] = muc;
	else c.luot.push(muc);
	c.luot.sort((a, b) => a.luc.localeCompare(b.luc));
	writeFileSync(join(ev, MTV.tep.chiPhi), `${JSON.stringify(c, null, 2)}\n`);
}

export function ungVienChon(ds: readonly string[]): string[] {
	const i = process.argv.indexOf("--ung-vien");
	if (i < 0) return [...ds];
	const ma = process.argv[i + 1] ?? "";
	if (!ds.includes(ma))
		throw new Error(`--ung-vien ${ma} khong co trong ke-hoach.json cua vai`);
	return [ma];
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

const COT = `id, at, "sessionId", "phienCha", "tinhNang", "modelId", "inputTokens", "cacheReadTokens", "outputTokens", "costUsd"`;

const khuonHangPg = z.object({
	id: z.string(),
	at: z.union([z.date(), z.string()]),
	sessionId: z.string(),
	phienCha: z.string().nullable(),
	tinhNang: z.string().nullable(),
	modelId: z.string().nullable(),
	inputTokens: z.number().nullable(),
	cacheReadTokens: z.number().nullable(),
	outputTokens: z.number().nullable(),
	costUsd: z.union([z.string(), z.number()]).nullable(),
});

const hangTuPg = (h: z.infer<typeof khuonHangPg>): HangChiPhi => ({
	id: h.id,
	at: h.at instanceof Date ? h.at.toISOString() : String(h.at),
	sessionId: h.sessionId,
	phienCha: h.phienCha,
	tinhNang: h.tinhNang,
	modelId: h.modelId,
	inputTokens: h.inputTokens,
	cacheReadTokens: h.cacheReadTokens,
	outputTokens: h.outputTokens,
	costUsd: h.costUsd === null ? null : Number(h.costUsd),
});

function moPg(url: string) {
	const pg = createRequire(join(GOC, "packages/db/package.json"))("pg");
	return new pg.Client({ connectionString: url });
}

export async function ketXuatPhien(
	url: string,
	phien: string,
): Promise<{ hang: HangChiPhi[]; suKien: SuKienChon }> {
	const c = moPg(url);
	await c.connect();
	try {
		const r = await c.query(
			`select ${COT} from "aiChiPhi" where "sessionId" = $1 or "phienCha" = $1 order by at asc`,
			[phien],
		);
		const hang = z.array(khuonHangPg).parse(r.rows).map(hangTuPg);
		const con = [
			...new Set(
				hang.filter((h) => h.sessionId !== phien).map((h) => h.sessionId),
			),
		];
		const sk = con.length
			? await c.query(
					`select "sessionId", data->>'modelId' as "modelId" from "agentEvent" where type = $1 and "sessionId" = any($2) order by "emittedAt" asc`,
					[MTV.suKienChon, con],
				)
			: { rows: [] };
		const suKien = z
			.array(
				z.object({ sessionId: z.string(), modelId: z.string().nullable() }),
			)
			.parse(sk.rows)
			.flatMap((x) =>
				x.modelId ? [{ sessionId: x.sessionId, modelId: x.modelId }] : [],
			);
		return { hang, suKien };
	} finally {
		await c.end();
	}
}

export async function ketXuatTinhNang(
	url: string,
	tinhNang: string,
	tu: Date,
): Promise<HangChiPhi[]> {
	const c = moPg(url);
	await c.connect();
	try {
		const r = await c.query(
			`select ${COT} from "aiChiPhi" where "tinhNang" = $1 and at >= $2 order by at asc, id asc`,
			[tinhNang, new Date(tu.getTime() - MTV.lechKetXuatMs)],
		);
		return z.array(khuonHangPg).parse(r.rows).map(hangTuPg);
	} finally {
		await c.end();
	}
}
