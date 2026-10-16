const GIAY_MS = 1000;
const PHUT_GIAY = 60;

export const CHO_TAC_NHAN = {
	nguongLauMs: 200 * GIAY_MS,
	nhipMs: GIAY_MS,
	hienTuMs: GIAY_MS,
} as const;

export function dongHoDaTroi(daTroiMs: number): string | null {
	if (daTroiMs < CHO_TAC_NHAN.hienTuMs) return null;
	const giay = Math.floor(daTroiMs / GIAY_MS);
	const phut = Math.floor(giay / PHUT_GIAY);
	const du = giay % PHUT_GIAY;
	return `${phut}:${String(du).padStart(2, "0")}`;
}

export function laLauHonThuongLe(daTroiMs: number): boolean {
	return daTroiMs >= CHO_TAC_NHAN.nguongLauMs;
}

export function daTroiTuLucGui(batDauLuc: string | null, now: number): number {
	if (!batDauLuc || now <= 0) return 0;
	const goc = Date.parse(batDauLuc);
	return Number.isNaN(goc) ? 0 : Math.max(0, now - goc);
}
