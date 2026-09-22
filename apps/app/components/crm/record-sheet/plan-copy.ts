export function dien(
	mau: string,
	gia: Record<string, string | number>,
): string {
	return mau.replace(/\{(\w+)\}/g, (nguyen, khoa: string) =>
		khoa in gia ? String(gia[khoa]) : nguyen,
	);
}
