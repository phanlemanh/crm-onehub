import { z } from "zod";

export const HANH_DONG_VET = [
	"tao-chu-ky",
	"sua-chu-ky",
	"go-chu-ky",
	"an-chu-ky",
	"hien-chu-ky",
	"doi-pha",
	"cau-hinh",
	"tao",
	"sua",
	"cong-bo",
	"bo",
	"xoa-muc-tieu",
	"dung-lai",
	"tao-kr",
	"sua-kr",
	"xoa-kr",
	"gan-can-chinh",
	"go-can-chinh",
	"nhap-bang-tinh",
	"cap-nhat-tuan",
	"binh-luan",
	"theo-doi",
	"bo-theo-doi",
	"chuyen-viec",
	"mo-hop-tuan",
	"doi-nguon",
	"ghi-so-api",
	"mo-ra",
	"dong-ra",
	"doi-dich",
	"cham-kr",
	"nhin-lai",
	"mang-sang",
	"mo-lai-ky",
	"them-viec",
	"sua-viec",
	"xong-viec",
	"go-viec",
	"gan-sang-kien",
	"dinh-bang-chung",
	"go-bang-chung",
	"ghi-nhan",
	"go-ghi-nhan",
	"sua-mau",
	"mo-hoi-y",
	"sua-hoi-y",
	"doi-nguoi-chon",
	"niem-phong",
	"cong-bo-hoi-y",
	"doi-hien-thi",
	"gui-duyet",
	"duyet",
	"tra-lai",
	"rut-duyet",
	"chuyen-don-vi",
] as const;

export type HanhDongVet = (typeof HANH_DONG_VET)[number];

export const okrVetSnapshot = z.record(
	z.string(),
	z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())]),
);

export type OkrVetSnapshot = z.infer<typeof okrVetSnapshot>;

export function parseOkrVet(value: unknown): OkrVetSnapshot | null {
	if (value === null || value === undefined) return null;
	const r = okrVetSnapshot.safeParse(value);
	if (!r.success) throw new Error(`Vết OKR không đọc được: ${r.error.message}`);
	return r.data;
}
