import type { Locale } from "@crm/ui/lib/locale";

export type TenNganh = { ten: string; dich: boolean };

export const BANG_NGANH = {
	"Aerospace & Defense": "Hàng không vũ trụ & Quốc phòng",
	Technology: "Công nghệ",
	Finance: "Tài chính",
	Healthcare: "Y tế",
	"Retail & E-commerce": "Bán lẻ & Thương mại điện tử",
	Entertainment: "Giải trí",
	Education: "Giáo dục",
	"Government & Nonprofit": "Cơ quan nhà nước & Phi lợi nhuận",
	"Industrial & Energy": "Công nghiệp & Năng lượng",
	"Automotive & Transportation": "Ô tô & Phương tiện",
	"Lifestyle & Leisure": "Phong cách sống & Sở thích",
	"Luxury & Fashion": "Hàng xa xỉ & Thời trang",
	"News & Media": "Tin tức & Truyền thông",
	Sports: "Thể thao",
	"Real Estate & PropTech": "Bất động sản & PropTech",
	"Legal & Compliance": "Pháp lý & Tuân thủ",
	Telecommunications: "Viễn thông",
	"Agriculture & Food": "Nông nghiệp & Thực phẩm",
	"Professional Services & Agencies": "Tư vấn & Dịch vụ doanh nghiệp",
	"Chemicals & Materials": "Hoá chất & Vật liệu",
	"Logistics & Supply Chain": "Logistics & Chuỗi cung ứng",
	"Hospitality & Tourism": "Khách sạn & Du lịch",
	"Construction & Built Environment": "Xây dựng & Hạ tầng",
	"Consumer Packaged Goods (CPG)": "Hàng tiêu dùng nhanh",
} as const;

type NganhGoc = keyof typeof BANG_NGANH;

function laNganhGoc(goc: string): goc is NganhGoc {
	return Object.hasOwn(BANG_NGANH, goc);
}

export function tenNganh(
	industry: string | null | undefined,
	locale: Locale,
): TenNganh | null {
	const goc = industry?.trim();
	if (!goc) return null;
	if (locale !== "vi" || !laNganhGoc(goc)) return { ten: goc, dich: false };
	return { ten: BANG_NGANH[goc], dich: true };
}
