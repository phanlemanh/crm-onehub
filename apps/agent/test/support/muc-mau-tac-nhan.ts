import type { NoiDungThongBao } from "@crm/validation/thong-bao";

export const MUC_MAU_TAC_NHAN = {
	"tac-nhan-xong": {
		loai: "tac-nhan-xong",
		conversationId: "hoi-thoai-mau",
		luotId: "luot-mau",
		ten: "Tóm tắt deal mỗi sáng",
	},
	"tac-nhan-can-tra-loi": {
		loai: "tac-nhan-can-tra-loi",
		conversationId: "hoi-thoai-mau",
		luotId: "luot-mau",
		ten: "Tóm tắt deal mỗi sáng",
	},
	"tac-nhan-hong": {
		loai: "tac-nhan-hong",
		conversationId: "hoi-thoai-mau",
		luotId: "luot-mau",
		ten: "Tóm tắt deal mỗi sáng",
	},
} satisfies Record<
	"tac-nhan-xong" | "tac-nhan-can-tra-loi" | "tac-nhan-hong",
	NoiDungThongBao
>;
