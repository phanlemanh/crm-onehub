import { createHmac, timingSafeEqual } from "node:crypto";

export type NoiDungPhieu = { userId: string; pathname: string };

function chuKy(khoa: string, n: NoiDungPhieu, hetHan: number): string {
	return createHmac("sha256", khoa)
		.update(`${n.userId}|${n.pathname}|${hetHan}`)
		.digest("base64url");
}

export function kyPhieu(khoa: string, n: NoiDungPhieu, hetHan: number): string {
	return `${hetHan}.${chuKy(khoa, n, hetHan)}`;
}

export function kiemPhieu(
	khoa: string,
	n: NoiDungPhieu,
	phieu: string,
	bayGio: number,
): boolean {
	const [soHan, gui] = phieu.split(".");
	const hetHan = Number(soHan);
	if (!gui || !Number.isSafeInteger(hetHan) || bayGio > hetHan) return false;
	const dung = Buffer.from(chuKy(khoa, n, hetHan));
	const nhan = Buffer.from(gui);
	return dung.length === nhan.length && timingSafeEqual(dung, nhan);
}
