export const LICH_LAM_VIEC = {
	ngayNghiTuanMacDinh: [6, 7],
	timToiDaNgay: 3660,
	ngayMs: 24 * 60 * 60 * 1000,
} as const;

export type LichLam = {
	ngayNghiTuan: readonly number[];
	ngayLe: readonly string[];
};

function sangMs(ngay: string): number {
	const [y, m, d] = ngay.split("-").map(Number);
	return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1);
}

function sangNgay(ms: number): string {
	return new Date(ms).toISOString().slice(0, 10);
}

function thuIso(ngay: string): number {
	const thu = new Date(sangMs(ngay)).getUTCDay();
	return thu === 0 ? 7 : thu;
}

export function congNgay(ngay: string, n: number): string {
	return sangNgay(sangMs(ngay) + n * LICH_LAM_VIEC.ngayMs);
}

export function laNgayLam(ngay: string, lich: LichLam): boolean {
	return (
		!lich.ngayNghiTuan.includes(thuIso(ngay)) && !lich.ngayLe.includes(ngay)
	);
}

export function ngayLamKe(ngay: string, lich: LichLam): string {
	let x = ngay;
	for (let i = 0; i < LICH_LAM_VIEC.timToiDaNgay; i += 1) {
		x = congNgay(x, 1);
		if (laNgayLam(x, lich)) return x;
	}
	throw new Error(`Lịch làm việc không còn ngày làm việc nào sau ${ngay}.`);
}

export function congNgayLam(ngay: string, n: number, lich: LichLam): string {
	let x = ngay;
	for (let i = 0; i < n; i += 1) x = ngayLamKe(x, lich);
	return x;
}

export function soNgayLam(tu: string, den: string, lich: LichLam): number {
	let dem = 0;
	for (let x = tu; x <= den; x = congNgay(x, 1)) {
		if (laNgayLam(x, lich)) dem += 1;
	}
	return dem;
}
