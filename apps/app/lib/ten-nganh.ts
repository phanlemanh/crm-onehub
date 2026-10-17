import type { Locale } from "@crm/ui/lib/locale";

export type TenNganh = { ten: string; dich: boolean };

// Khoá là đúng danh sách ngành cố định của context.dev (Industries.Eic.industry).
// ten-nganh.test.ts so khoá với bản thư viện tác nhân đang cài — lệch là đỏ.
export const BANG_NGANH: Record<string, string> = {
	"Aerospace & Defense": "Hàng không vũ trụ & Quốc phòng",
	Technology: "Công nghệ",
	Finance: "Tài chính",
	Healthcare: "Y tế",
	"Retail & E-commerce": "Bán lẻ & Thương mại điện tử",
	Entertainment: "Giải trí",
	Education: "Giáo dục",
	"Government & Nonprofit": "Nhà nước & Phi lợi nhuận",
	"Industrial & Energy": "Công nghiệp & Năng lượng",
	"Automotive & Transportation": "Ô tô & Vận tải",
	"Lifestyle & Leisure": "Phong cách sống & Thư giãn",
	"Luxury & Fashion": "Hàng xa xỉ & Thời trang",
	"News & Media": "Tin tức & Truyền thông",
	Sports: "Thể thao",
	"Real Estate & PropTech": "Bất động sản & Công nghệ bất động sản",
	"Legal & Compliance": "Pháp lý & Tuân thủ",
	Telecommunications: "Viễn thông",
	"Agriculture & Food": "Nông nghiệp & Thực phẩm",
	"Professional Services & Agencies": "Dịch vụ chuyên nghiệp & Agency",
	"Chemicals & Materials": "Hoá chất & Vật liệu",
	"Logistics & Supply Chain": "Logistics & Chuỗi cung ứng",
	"Hospitality & Tourism": "Khách sạn & Du lịch",
	"Construction & Built Environment": "Xây dựng & Công trình",
	"Consumer Packaged Goods (CPG)": "Hàng tiêu dùng đóng gói",
};

export function tenNganh(
	industry: string | null | undefined,
	locale: Locale,
): TenNganh | null {
	const goc = industry?.trim();
	if (!goc) return null;
	if (locale !== "vi" || !Object.hasOwn(BANG_NGANH, goc))
		return { ten: goc, dich: false };
	return { ten: BANG_NGANH[goc], dich: true };
}
