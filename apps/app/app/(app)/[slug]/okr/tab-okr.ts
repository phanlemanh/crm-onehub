export const TAB = [
	"cua-toi",
	"cap-nhat-tuan",
	"theo-don-vi",
	"toan-canh",
	"hoi-y",
] as const;
export type TabOkr = (typeof TAB)[number];

export const DUONG = {
	"cua-toi": "/okr",
	"cap-nhat-tuan": "/okr/cap-nhat-tuan",
	"theo-don-vi": "/okr/theo-don-vi",
	"toan-canh": "/okr/toan-canh",
	"hoi-y": "/okr/hoi-y",
} satisfies Record<TabOkr, string>;

export function tabTuDuong(duong: string | null): TabOkr {
	const phan = (duong ?? "").split("/").filter(Boolean);
	const con = phan[phan.indexOf("okr") + 1];
	return TAB.find((t) => t === con) ?? "cua-toi";
}
