export type FieldTemplate = {
	label: string;
	type: "SELECT" | "USER" | "NUMBER";
	options?: readonly string[];
};

const PHAN_KHUC = ["Căn hộ", "Nhà phố", "Đất nền", "Cho thuê", "Dự án"] as const;

const MUC_DO_HOP_TAC = [
	"Chưa tiếp xúc",
	"Đang thăm dò",
	"Đang hợp tác",
	"Tạm dừng",
] as const;

const NGUON = ["Giới thiệu", "Hội thảo", "Tự tìm", "Chiến dịch gọi"] as const;

export const FIELD_TEMPLATES = {
	COMPANY: [
		{
			label: "Loại hình",
			type: "SELECT",
			options: [
				"Sàn giao dịch",
				"Công ty môi giới",
				"Đại lý phân phối",
				"Tổ chức tín dụng",
			],
		},
		{ label: "Phân khúc chính", type: "SELECT", options: PHAN_KHUC },
		{
			label: "Quy mô môi giới",
			type: "SELECT",
			options: ["Dưới 10", "10–50", "50–200", "Trên 200"],
		},
		{ label: "Mức độ hợp tác", type: "SELECT", options: MUC_DO_HOP_TAC },
		{ label: "Nguồn quen", type: "SELECT", options: NGUON },
		{ label: "Người phụ trách", type: "USER" },
	],
	CONTACT: [
		{ label: "Phân khúc chuyên", type: "SELECT", options: PHAN_KHUC },
		{
			label: "Vai trò trong sàn",
			type: "SELECT",
			options: ["Chủ sàn", "Trưởng nhóm", "Môi giới", "Trợ lý"],
		},
		{
			label: "Kênh liên lạc quen",
			type: "SELECT",
			options: ["Zalo", "Điện thoại", "Email", "Facebook"],
		},
		{ label: "Mức độ hợp tác", type: "SELECT", options: MUC_DO_HOP_TAC },
		{ label: "Người phụ trách", type: "USER" },
	],
	DEAL: [
		{
			label: "Hình thức hợp tác",
			type: "SELECT",
			options: [
				"Giới thiệu khách",
				"Phân phối dự án",
				"Đồng môi giới",
				"Cung cấp dữ liệu",
			],
		},
		{
			label: "Nguồn thoả thuận",
			type: "SELECT",
			options: ["Giới thiệu", "Hội thảo", "Chiến dịch gọi", "Tự tìm"],
		},
		{ label: "Tỷ lệ chia hoa hồng", type: "NUMBER" },
		{ label: "Người phụ trách", type: "USER" },
	],
} satisfies Record<"COMPANY" | "CONTACT" | "DEAL", readonly FieldTemplate[]>;
