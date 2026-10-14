const AN_TOAN = ["https://", "mailto:", "#"] as const;
const KHONG_MA_HOA = "http://";

export function lienKetAnToan(href: string): boolean {
	const s = href.trim().toLowerCase();
	if (s.startsWith("/")) return !s.startsWith("//");
	return AN_TOAN.some((dau) => s.startsWith(dau));
}

export function laLienKetHttp(href: string): boolean {
	return href.trim().toLowerCase().startsWith(KHONG_MA_HOA);
}
