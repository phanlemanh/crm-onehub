import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import type { TrangThaiLay } from "@crm/validation/san-pham-lo-trinh";

export const NGHIA_TRANG_THAI_LAY = {
	"chua-lay": "dangChay",
	"da-lay": "xong",
	"chua-cau-hinh": "cho",
	"chua-cai": "cho",
	"khong-thay-kho": "hong",
	"khong-thay-tep": "hong",
	"khoi-hong": "hong",
	"qua-tran": "hong",
	"loi-github": "hong",
} as const satisfies Record<TrangThaiLay, NghiaTrangThai>;
