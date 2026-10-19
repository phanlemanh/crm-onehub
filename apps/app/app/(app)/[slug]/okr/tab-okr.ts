export const TAB = ["cua-toi", "theo-don-vi", "toan-canh", "hoi-y"] as const;
export type TabOkr = (typeof TAB)[number];

export const DUONG = {
	"cua-toi": "/okr",
	"theo-don-vi": "/okr/bo-okr",
	"toan-canh": "/okr/suc-khoe",
	"hoi-y": "/okr/lay-y-kien",
} satisfies Record<TabOkr, string>;

const DOAN_MOI = {
	"bo-okr": "theo-don-vi",
	"lay-y-kien": "hoi-y",
	"suc-khoe": "toan-canh",
} as const satisfies Record<string, TabOkr>;

function laDoanMoi(doan: string): doan is keyof typeof DOAN_MOI {
	return Object.hasOwn(DOAN_MOI, doan);
}

export function tabTuDuong(duong: string | null): TabOkr {
	const phan = (duong ?? "").split("/").filter(Boolean);
	const con = phan[phan.indexOf("okr") + 1] ?? "";
	if (laDoanMoi(con)) return DOAN_MOI[con];
	return TAB.find((t) => t === con) ?? "cua-toi";
}
