export const TAB = ["cua-toi", "theo-don-vi", "toan-canh", "hoi-y"] as const;
export type TabOkr = (typeof TAB)[number];

export const DUONG = {
	"cua-toi": "/okr",
	"theo-don-vi": "/okr/theo-don-vi",
	"toan-canh": "/okr/toan-canh",
	"hoi-y": "/okr/hoi-y",
} satisfies Record<TabOkr, string>;

export function tabTuDuong(duong: string | null): TabOkr {
	const phan = (duong ?? "").split("/").filter(Boolean);
	const con = phan[phan.indexOf("okr") + 1];
	return TAB.find((t) => t === con) ?? "cua-toi";
}
