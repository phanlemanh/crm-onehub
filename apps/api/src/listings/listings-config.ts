import { LISTING_TIERS } from "@crm/validation/listing-ingest";

export const TIER_LABELS = {
	cao: "Cao",
	vua: "Vừa",
	thap: "Thấp",
	ngu: "Ngủ",
} as const;

export const LISTING = {
	maxItems: 500,
	fields: [
		{
			key: "san_luong",
			label: "Sản lượng",
			type: "SELECT",
			options: LISTING_TIERS.map((tier) => TIER_LABELS[tier]),
			showOnTable: true,
			showOnFilter: true,
		},
		{
			key: "tin_dang",
			label: "Tin đang đăng",
			type: "NUMBER",
			showOnTable: true,
		},
		{
			key: "tin_moi_30_ngay",
			label: "Tin mới 30 ngày",
			type: "NUMBER",
			showOnTable: true,
		},
		{ key: "dia_ban", label: "Địa bàn", type: "TEXT", showOnTable: true },
		{
			key: "hinh_thai",
			label: "Hình thái",
			type: "SELECT",
			options: ["Công ty", "Cá nhân"],
			showOnFilter: true,
		},
		{
			key: "chung_chi",
			label: "Chứng chỉ",
			type: "SELECT",
			options: ["Có", "Không"],
			showOnFilter: true,
		},
		{
			key: "ten_chuyen_trang",
			label: "Tên chuyên trang",
			type: "TEXT",
			showOnTable: true,
		},
		{ key: "trang_nhatot", label: "Trang nhatot", type: "URL" },
		{ key: "san_cap_nhat_luc", label: "Sàn cập nhật lúc", type: "DATE" },
	],
} as const;

export type ListingFieldKey = (typeof LISTING.fields)[number]["key"];

export const MATCH_KEY: ListingFieldKey = "trang_nhatot";
