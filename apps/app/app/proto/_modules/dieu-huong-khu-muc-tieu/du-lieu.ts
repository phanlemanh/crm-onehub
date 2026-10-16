export type TabOkr = "cua-toi" | "theo-don-vi" | "toan-canh" | "hoi-y";

export const TAB_MAU: { value: TabOkr; nhan: string; state: string }[] = [
	{ value: "cua-toi", nhan: "Của tôi", state: "ST-dhk-cua-toi" },
	{ value: "theo-don-vi", nhan: "Theo đơn vị", state: "ST-dhk-don-vi" },
	{ value: "toan-canh", nhan: "Toàn cảnh", state: "ST-dhk-toan-canh" },
	{ value: "hoi-y", nhan: "Hỏi ý", state: "ST-dhk-hoi-y" },
];

export const NHAN_TAB = Object.fromEntries(
	TAB_MAU.map((t) => [t.value, t.nhan]),
) as Record<TabOkr, string>;
