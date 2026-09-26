import { createHmac, timingSafeEqual } from "node:crypto";

export const DIA_CHI = {
	goc: "x-crm-dia-chi",
	ky: "x-crm-dia-chi-ky",
	tin: "x-crm-dia-chi-tin",
	nenTang: "x-real-ip",
} as const;

export function kyDiaChi(diaChi: string, khoa: string): string {
	return createHmac("sha256", khoa).update(diaChi).digest("hex");
}

export function diaChiDaKy(
	headers: Headers,
	khoa: string | undefined,
): string | null {
	const diaChi = headers.get(DIA_CHI.goc);
	const ky = headers.get(DIA_CHI.ky);
	if (!khoa || !diaChi || !ky) return null;

	const mong = Buffer.from(kyDiaChi(diaChi, khoa));
	const nhan = Buffer.from(ky);
	if (mong.length !== nhan.length || !timingSafeEqual(mong, nhan)) return null;

	return diaChi;
}

function boHeaderDiaChi(headers: Headers): Headers {
	const sach = new Headers(headers);
	sach.delete(DIA_CHI.goc);
	sach.delete(DIA_CHI.ky);
	sach.delete(DIA_CHI.tin);
	return sach;
}

export function headerProxyKyDiaChi(
	vao: Headers,
	khoa: string | undefined,
): Headers {
	const ra = boHeaderDiaChi(vao);
	const diaChi = vao.get(DIA_CHI.nenTang)?.trim();
	if (!khoa || !diaChi) return ra;

	ra.set(DIA_CHI.goc, diaChi);
	ra.set(DIA_CHI.ky, kyDiaChi(diaChi, khoa));
	return ra;
}

export function headerTinDiaChi(
	vao: Headers,
	khoa: string | undefined,
): Headers {
	const diaChi = diaChiDaKy(vao, khoa);
	const ra = boHeaderDiaChi(vao);
	if (diaChi) ra.set(DIA_CHI.tin, diaChi);
	return ra;
}
