export type TruongDenDong = "title" | "startValue" | "targetValue" | "nguoi";

export type DichDenDong = { dong: string; truong: TruongDenDong };

const O_CUA = {
	title: "[data-o-nhap=ten]",
	startValue: "[data-o-nhap=khoi]",
	targetValue: "[data-o-nhap=dich]",
	nguoi: "[role=combobox]",
} as const satisfies Record<TruongDenDong, string>;

export function oDenDong(
	goc: ParentNode,
	dich: DichDenDong,
): HTMLElement | null {
	const dong = goc.querySelector(dich.dong);
	if (dong === null) return null;
	const o =
		dong.querySelector(O_CUA[dich.truong]) ?? dong.querySelector(O_CUA.title);
	return o instanceof HTMLElement ? o : null;
}
