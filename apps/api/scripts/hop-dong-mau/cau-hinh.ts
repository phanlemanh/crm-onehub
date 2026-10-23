export const HOP_DONG_MAU = {
	nguoi: {
		id: "mau-hop-dong-nguoi",
		memberId: "mau-hop-dong-member",
		ten: "Người tải hợp đồng mẫu · mẫu",
		thu: "hop-dong@mau.onehub.test",
		vai: "admin",
	},
	congTy: "Công ty Đối tác Mẫu A · mẫu",
	thoaThuanKhongTep: "HĐ mẫu không tệp · mẫu",
	truong: { entity: "DEAL", nhan: "Hợp đồng" },
	ma: { hong: 1, chan: 2, sai: 4, khoTat: 6 },
	lenh: "bun run hop-dong:mau",
	trangThai: { daGan: "đã gắn", daCo: "đã có" },
	thongDiep: {
		tienToChan: "Từ chối nạp bộ hợp đồng mẫu",
		coLa: (co: readonly string[]) =>
			`Lệnh không nhận cờ nào, nhận: ${co.join(", ")}. Chạy trần: bun run hop-dong:mau.`,
		thieuWorkspace:
			"Kho chưa có workspace — workspace sinh ở lần đăng nhập đầu. Đăng nhập một lần (hoặc `cd apps/api && bun run dev:session <thư của anh>`) rồi chạy lại bun run hop-dong:mau.",
		khoTat:
			"Kho tệp chưa bật: đặt TEP_BAN_GHI_BLOB_TOKEN trong .env ở gốc kho (khoá của kho Blob riêng tư cho ô Tệp) rồi chạy lại bun run hop-dong:mau.",
		truongLechKieu: (nhan: string, khoa: string, kieu: string) =>
			`Thoả thuận đã có trường «${nhan}» (khoá ${khoa}) kiểu ${kieu}, không phải Tệp. Đổi tên trường ấy ở Cài đặt › Trường rồi chạy lại.`,
		truongLuuTru: (nhan: string, khoa: string) =>
			`Trường «${nhan}» (khoá ${khoa}) của Thoả thuận đang lưu trữ. Khôi phục nó ở Cài đặt › Trường rồi chạy lại.`,
		banGhiLuuTru: (ten: string) =>
			`Bản ghi mẫu «${ten}» đang lưu trữ. Khôi phục nó rồi chạy lại.`,
		putHong: (tenTep: string, ma: number) =>
			`Tải ${tenTep} lên kho tệp hỏng (HTTP ${ma}). Chạy lại lệnh: tệp đã gắn được giữ, tệp dở được dọn sau hạn phiếu.`,
		tomTat: (gan: number, co: number) =>
			`Bộ hợp đồng mẫu: ${gan} tệp vừa gắn, ${co} tệp đã có.`,
	},
} as const;

export type MaThoatHopDongMau =
	(typeof HOP_DONG_MAU.ma)[keyof typeof HOP_DONG_MAU.ma];

export class LoiHopDongMau extends Error {
	constructor(
		readonly ma: MaThoatHopDongMau,
		cau: string,
	) {
		super(cau);
	}
}
