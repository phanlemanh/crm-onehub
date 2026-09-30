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

export function coDauChen(chu: string): boolean {
	const thuong = chu.normalize("NFC").toLowerCase();
	return TRO_LY_OKR_SOAN.danhGia.dauChen.some((d) =>
		thuong.includes(d.normalize("NFC")),
	);
}
