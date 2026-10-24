export function phanTuHien(chon: string): HTMLElement | null {
	const ds = [...document.querySelectorAll<HTMLElement>(chon)];
	return ds.find((e) => e.getClientRects().length > 0) ?? ds[0] ?? null;
}

export function tieuDiemNutThaoTac(ma: string): boolean {
	const nut = phanTuHien(`[data-thao-tac-tin-hieu='${ma}']`);
	nut?.focus();
	return nut !== null;
}
