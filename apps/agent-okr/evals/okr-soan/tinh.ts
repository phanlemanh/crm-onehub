import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";

const MO_DAU = TRO_LY_OKR_SOAN.danhGia.moDau;

export const KHUON_MO_DAU = {
	hoi: /^\s*\d+[.)]\s+(.+\?)\s*$/,
	goiY: /^\s*[-•*]?\s*gợi ý:\s*(.+)$/i,
	dongSo: /^\s*\d+[.)]/,
	tachGoiY: /\s*[·|]\s*/,
} as const;

export type CauHoiMoDau = { hoi: string; goiY: string[] };

export function tachCauHoi(chu: string): CauHoiMoDau[] {
	const ra: CauHoiMoDau[] = [];
	for (const dong of chu.split("\n")) {
		const hoi = dong.match(KHUON_MO_DAU.hoi);
		if (hoi?.[1]) {
			ra.push({ hoi: hoi[1].trim(), goiY: [] });
			continue;
		}
		const goiY = dong.match(KHUON_MO_DAU.goiY);
		const cuoi = ra.at(-1);
		if (goiY?.[1] && cuoi)
			cuoi.goiY = goiY[1]
				.split(KHUON_MO_DAU.tachGoiY)
				.map((g) => g.trim())
				.filter(Boolean);
	}
	return ra;
}

export function loiMoDau(chu: string): string[] {
	const cau = tachCauHoi(chu);
	const loi: string[] = [];
	if (cau.length < MO_DAU.cauHoi.min || cau.length > MO_DAU.cauHoi.max)
		loi.push(`so cau hoi ${cau.length}`);
	for (const [i, c] of cau.entries())
		if (c.goiY.length !== MO_DAU.soGoiY)
			loi.push(`cau ${i + 1} co ${c.goiY.length} goi y`);
	for (const dong of chu.split("\n"))
		if (KHUON_MO_DAU.dongSo.test(dong) && !KHUON_MO_DAU.hoi.test(dong))
			loi.push(`dong so khong phai cau hoi: ${dong.trim()}`);
	return loi;
}

export function nhomLanNop<T extends { inputHash: string; createdAt: Date }>(
	hang: readonly T[],
): T[][] {
	const nhom = new Map<string, T[]>();
	for (const h of hang)
		nhom.set(h.inputHash, [...(nhom.get(h.inputHash) ?? []), h]);
	const dau = (ds: T[]) => Math.min(...ds.map((h) => h.createdAt.getTime()));
	return [...nhom.values()].sort((a, b) => dau(a) - dau(b));
}

export function phanVi(so: readonly number[], p: number): number | null {
	if (so.length === 0) return null;
	const xep = [...so].sort((a, b) => a - b);
	const viTri = p * (xep.length - 1);
	const duoi = Math.floor(viTri);
	const tren = Math.ceil(viTri);
	const a = xep[duoi] ?? 0;
	const b = xep[tren] ?? a;
	return a + (b - a) * (viTri - duoi);
}

export type PhiaAB = "A" | "B";

export function xepAB<T>(
	coGoi: T,
	khongGoi: T,
	ngauNhien: () => number,
): { A: T; B: T; phiaCoGoi: PhiaAB } {
	return ngauNhien() < 0.5
		? { A: coGoi, B: khongGoi, phiaCoGoi: "A" }
		: { A: khongGoi, B: coGoi, phiaCoGoi: "B" };
}

export function goiThang(phiaCoGoi: PhiaAB, aThang: boolean): boolean {
	return aThang === (phiaCoGoi === "A");
}

export function tyLeThang(
	ds: readonly { phiaCoGoi: PhiaAB; aThang: boolean }[],
): number | null {
	if (ds.length === 0) return null;
	return ds.filter((d) => goiThang(d.phiaCoGoi, d.aThang)).length / ds.length;
}

export type DongChiPhi = { costUsd: number | null };

export function loiChiPhi(dong: readonly DongChiPhi[]): string[] {
	return dong.flatMap((d, i) =>
		d.costUsd === null
			? [`dong ${i + 1} costUsd null`]
			: d.costUsd > 0
				? []
				: [`dong ${i + 1} costUsd ${d.costUsd}`],
	);
}

export type TongChiPhi = { usd: number; thieu: number };

export function tongChiPhi(dong: readonly DongChiPhi[]): TongChiPhi {
	return {
		usd: dong.reduce((a, d) => a + (d.costUsd ?? 0), 0),
		thieu: dong.filter((d) => d.costUsd === null).length,
	};
}

export function xaoTron<T>(ds: readonly T[], ngauNhien: () => number): T[] {
	const ra = [...ds];
	for (let i = ra.length - 1; i > 0; i--) {
		const j = Math.floor(ngauNhien() * (i + 1));
		const a = ra[i];
		const b = ra[j];
		if (a === undefined || b === undefined) continue;
		ra[i] = b;
		ra[j] = a;
	}
	return ra;
}

const suKienCoLuc = z.object({
	type: z.string(),
	meta: z.object({ at: z.iso.datetime({ offset: true }) }),
});

export type TachLuot = {
	soBuoc: number;
	moHinhMs: number;
	congCuMs: number;
	soCongCu: number;
};

type CapThoiGian = { dem: number; ms: number };

function ghepCap(
	suKien: readonly { type: string; luc: number }[],
	mo: string,
	dong: string,
): CapThoiGian {
	let ms = 0;
	let dem = 0;
	let batDau: number | null = null;
	for (const e of suKien) {
		if (e.type === mo) batDau = e.luc;
		else if (e.type === dong && batDau !== null) {
			ms += e.luc - batDau;
			dem += 1;
			batDau = null;
		}
	}
	return { dem, ms };
}

export function tachLuot(suKien: readonly unknown[]): TachLuot {
	const coLuc = suKien.flatMap((e) => {
		const d = suKienCoLuc.safeParse(e);
		return d.success
			? [{ type: d.data.type, luc: Date.parse(d.data.meta.at) }]
			: [];
	});
	const moHinh = ghepCap(coLuc, "step.started", "step.completed");
	const congCu = ghepCap(coLuc, "actions.requested", "action.result");
	return {
		soBuoc: moHinh.dem,
		moHinhMs: moHinh.ms,
		congCuMs: congCu.ms,
		soCongCu: congCu.dem,
	};
}

export type LuotDo = { ms: number; soCongCu: number };

export type PhanViLoai = { n: number; p50: number | null; p90: number | null };

export type PhanViTheoLoai = { hoiDap: PhanViLoai; nopBanNhap: PhanViLoai };

export function phanViTheoLoaiLuot(luot: readonly LuotDo[]): PhanViTheoLoai {
	const PV = TRO_LY_OKR_SOAN.danhGia.doTre.phanVi;
	const cua = (ms: number[]): PhanViLoai => ({
		n: ms.length,
		p50: phanVi(ms, PV.p50),
		p90: phanVi(ms, PV.p90),
	});
	return {
		hoiDap: cua(luot.filter((l) => l.soCongCu === 0).map((l) => l.ms)),
		nopBanNhap: cua(luot.filter((l) => l.soCongCu > 0).map((l) => l.ms)),
	};
}

export function khoangWilson(
	thang: number,
	tong: number,
): { duoi: number; tren: number } | null {
	if (tong === 0) return null;
	const z95 = 1.96;
	const p = thang / tong;
	const mau = 1 + (z95 * z95) / tong;
	const giua = (p + (z95 * z95) / (2 * tong)) / mau;
	const lech =
		(z95 * Math.sqrt((p * (1 - p)) / tong + (z95 * z95) / (4 * tong * tong))) /
		mau;
	return { duoi: giua - lech, tren: giua + lech };
}

export function coDauChen(chu: string): boolean {
	const thuong = chu.normalize("NFC").toLowerCase();
	return TRO_LY_OKR_SOAN.danhGia.dauChen.some((d) =>
		thuong.includes(d.normalize("NFC")),
	);
}
