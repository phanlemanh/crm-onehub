export type LoaiGiaiDoan = "OPEN" | "WON" | "LOST";

export const GIAI_DOAN = {
	tran: { tong: 20 },
	nhan: { toiDa: 40 },
	loai: ["OPEN", "WON", "LOST"],
} as const;

export const GIAI_DOAN_GOC = {
	DEMO_BOOKED: "DEMO_BOOKED",
	QUALIFIED_TO_BUY: "QUALIFIED_TO_BUY",
	DECISION_MAKER_BOUGHT_IN: "DECISION_MAKER_BOUGHT_IN",
	CONTRACT_SENT: "CONTRACT_SENT",
	CLOSED_WON: "CLOSED_WON",
	CLOSED_LOST: "CLOSED_LOST",
	UNQUALIFIED_TO_BUY: "UNQUALIFIED_TO_BUY",
} as const;

export function laDaDong(kind: LoaiGiaiDoan): boolean {
	return kind !== "OPEN";
}

export function laThua(kind: LoaiGiaiDoan): boolean {
	return kind === "LOST";
}

export function laChotDuoc(kind: LoaiGiaiDoan): boolean {
	return kind === "WON";
}
