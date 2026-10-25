import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { type DonChonOkr, khoaDon } from "../okr-search-params";

export type ThamSoTrang = Record<string, string | string[] | undefined>;

export function thamSoCuaTrang(thamSo: ThamSoTrang): URLSearchParams {
	const ra = new URLSearchParams();
	for (const [khoa, giaTri] of Object.entries(thamSo)) {
		if (giaTri === undefined) continue;
		for (const mot of Array.isArray(giaTri) ? giaTri : [giaTri])
			ra.append(khoa, mot);
	}
	return ra;
}

export function laHopTuanKhongDon(thamSo: URLSearchParams): boolean {
	return (
		thamSo.get(SEARCH_PARAM.okr.xem) === "hop-tuan" &&
		!thamSo.has(SEARCH_PARAM.okr.don)
	);
}

export function duongChuyenHopTuan(
	thamSo: URLSearchParams,
	don: DonChonOkr,
): string | null {
	if (!laHopTuanKhongDon(thamSo)) return null;
	const dich = new URLSearchParams([
		[SEARCH_PARAM.okr.don, khoaDon(don)],
		...thamSo,
	]);
	return `?${dich.toString()}`;
}
