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

export const DUONG_SO_DO = "/okr/so-do";
export const DUONG_MOI_KR = "/okr/moi-kr";

export const NHOM_THANH_BEN = [
	{ khoa: "dau", muc: ["cua-toi"] },
	{ khoa: "okr", muc: ["bo-okr", "lay-y-kien"] },
	{ khoa: "bao-cao", muc: ["suc-khoe", "moi-kr", "so-do"] },
] as const;

export type MucThanhBen = (typeof NHOM_THANH_BEN)[number]["muc"][number];

export const DUONG_MUC = {
	"cua-toi": DUONG["cua-toi"],
	"bo-okr": DUONG["theo-don-vi"],
	"lay-y-kien": DUONG["hoi-y"],
	"suc-khoe": DUONG["toan-canh"],
	"moi-kr": DUONG_MOI_KR,
	"so-do": DUONG_SO_DO,
} as const satisfies Record<MucThanhBen, string>;

export function mucDangMo(href: string, goc: string, duong: string): boolean {
	if (href === goc) return duong === href;
	return duong === href || duong.startsWith(`${href}/`);
}
