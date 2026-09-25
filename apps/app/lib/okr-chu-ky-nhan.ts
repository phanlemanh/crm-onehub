export const OKR_CHU_KY = {
	muiGio: "Asia/Ho_Chi_Minh",
	soQuy: 4,
	thangMoiQuy: 3,
} as const;

export type GoiYChuKy = { nam: number; quy: { so: number; nam: number } };

export function homNayVn(luc: Date): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: OKR_CHU_KY.muiGio,
	}).format(luc);
}

export function goiYChuKy(homNay: string): GoiYChuKy {
	const nam = Number(homNay.slice(0, 4));
	const quy = Math.ceil(Number(homNay.slice(5, 7)) / OKR_CHU_KY.thangMoiQuy);
	return quy === OKR_CHU_KY.soQuy
		? { nam, quy: { so: 1, nam: nam + 1 } }
		: { nam, quy: { so: quy + 1, nam } };
}

export function canNhanLoai(
	ten: string,
	nhanLoai: string,
	locale: string,
): boolean {
	return !ten
		.toLocaleLowerCase(locale)
		.includes(nhanLoai.toLocaleLowerCase(locale));
}
