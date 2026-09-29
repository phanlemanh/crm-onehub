export type LoaiGiaiDoan = "OPEN" | "WON" | "LOST";

export type GiaiDoanMau = {
	id: string;
	nhan: string;
	loai: LoaiGiaiDoan;
	soThoaThuan: number;
};

export const TRAN_GIAI_DOAN = 20;

export const THE: readonly {
	loai: LoaiGiaiDoan;
	tieuDe: string;
	moTa: string;
}[] = [
	{
		loai: "OPEN",
		tieuDe: "Đang mở",
		moTa: "Thứ tự ở đây là thứ tự cột trên bảng cột và các bước trên thanh tiến trình.",
	},
	{
		loai: "WON",
		tieuDe: "Chốt được",
		moTa: "Thoả thuận vào đây được tính là chốt được trên Tổng quan và trong OKR.",
	},
	{
		loai: "LOST",
		tieuDe: "Không thành",
		moTa: "Chuyển thoả thuận vào đây phải ghi lý do.",
	},
];

export const GIAI_DOAN_MAU: readonly GiaiDoanMau[] = [
	{ id: "DEMO_BOOKED", nhan: "Demo booked", loai: "OPEN", soThoaThuan: 12 },
	{
		id: "QUALIFIED_TO_BUY",
		nhan: "Qualified to buy",
		loai: "OPEN",
		soThoaThuan: 8,
	},
	{
		id: "DECISION_MAKER_BOUGHT_IN",
		nhan: "Decision maker in",
		loai: "OPEN",
		soThoaThuan: 3,
	},
	{ id: "CONTRACT_SENT", nhan: "Contract sent", loai: "OPEN", soThoaThuan: 0 },
	{ id: "CLOSED_WON", nhan: "Closed won", loai: "WON", soThoaThuan: 21 },
	{ id: "CLOSED_LOST", nhan: "Closed lost", loai: "LOST", soThoaThuan: 9 },
	{
		id: "UNQUALIFIED_TO_BUY",
		nhan: "Unqualified",
		loai: "LOST",
		soThoaThuan: 4,
	},
];

export function dayDenTran(): GiaiDoanMau[] {
	const them = Array.from(
		{ length: TRAN_GIAI_DOAN - GIAI_DOAN_MAU.length },
		(_, i) => ({
			id: `mau-${i + 1}`,
			nhan: `Bước hợp tác ${i + 1}`,
			loai: "OPEN" as const,
			soThoaThuan: 0,
		}),
	);
	return [...GIAI_DOAN_MAU, ...them];
}
