import type { ReactNode } from "react";
import { BanMauOkrMau } from "./_modules/ban-mau-okr";
import { CanhKrOkrMau } from "./_modules/canh-kr-okr";
import { CauTrucToChucMau } from "./_modules/cau-truc-to-chuc";
import { CuaVaoDangNhapMau } from "./_modules/cua-vao-dang-nhap";
import { DieuPhoi30NgayDauMau } from "./_modules/dieu-phoi-30-ngay-dau";
import { DoiTenOnehubCenterMau } from "./_modules/doi-ten-onehub-center";
import { DuongProtoMau } from "./_modules/duong-proto";
import { GiaiDoanThoaThuanProto } from "./_modules/giai-doan-thoa-thuan";
import { KeHoachLaMotBanGhiMau } from "./_modules/ke-hoach-la-mot-ban-ghi";
import { KeoThaThoaThuanMau } from "./_modules/keo-tha-thoa-thuan";
import { KhepKyOkrMau } from "./_modules/khep-ky-okr";
import { KhoTaiLieuMau } from "./_modules/kho-tai-lieu";
import { KhungTrangCaiDatMau } from "./_modules/khung-trang-cai-dat";
import { MayNhacTruocNguoiMau } from "./_modules/may-nhac-truoc-nguoi";
import { MoiPhiaDeuThayKeHoachMau } from "./_modules/moi-phia-deu-thay-ke-hoach";
import { NhacQuaZaloMau } from "./_modules/nhac-qua-zalo";
import { NoiZaloChoNguoiMoiMau } from "./_modules/noi-zalo-cho-nguoi-moi";
import { ToChucDanhSachChiTietMau } from "./_modules/to-chuc-danh-sach-chi-tiet";
import { ToanCanhOkrMau } from "./_modules/toan-canh-okr";
import { TroLyOkrNenMau } from "./_modules/tro-ly-okr-nen";
import { VaoBangMatKhauMau } from "./_modules/vao-bang-mat-khau";
import { PROTO_CATALOG } from "./catalog";

export type ProtoComponent = (props: { state: string }) => ReactNode;

const BANG_GHEP = {
	"giai-doan-thoa-thuan": GiaiDoanThoaThuanProto,
	"ban-mau-okr": BanMauOkrMau,
	"canh-kr-okr": CanhKrOkrMau,
	"cau-truc-to-chuc": CauTrucToChucMau,
	"cua-vao-dang-nhap": CuaVaoDangNhapMau,
	"dieu-phoi-30-ngay-dau": DieuPhoi30NgayDauMau,
	"doi-ten-onehub-center": DoiTenOnehubCenterMau,
	"duong-proto-cho-design-pass": DuongProtoMau,
	"ke-hoach-la-mot-ban-ghi": KeHoachLaMotBanGhiMau,
	"keo-tha-thoa-thuan": KeoThaThoaThuanMau,
	"khep-ky-okr": KhepKyOkrMau,
	"khung-trang-cai-dat": KhungTrangCaiDatMau,
	"kho-tai-lieu": KhoTaiLieuMau,
	"may-soan-de-xuat": KhoTaiLieuMau,
	"to-chuc-danh-sach-chi-tiet": ToChucDanhSachChiTietMau,
	"toan-canh-okr": ToanCanhOkrMau,
	"tro-ly-okr-nen": TroLyOkrNenMau,
	"may-nhac-truoc-nguoi": MayNhacTruocNguoiMau,
	"moi-phia-deu-thay-ke-hoach": MoiPhiaDeuThayKeHoachMau,
	"nhac-qua-zalo": NhacQuaZaloMau,
	"noi-zalo-cho-nguoi-moi": NoiZaloChoNguoiMoiMau,
	"vao-bang-email-va-mat-khau": VaoBangMatKhauMau,
} satisfies Record<string, ProtoComponent>;

export const PROTO_COMPONENTS = new Map(Object.entries(BANG_GHEP));

export function mucMoCoi(): string[] {
	const trongSo = PROTO_CATALOG.map((muc) => muc.slug);
	const trongBang = [...PROTO_COMPONENTS.keys()];

	return [
		...trongSo.filter((s) => !trongBang.includes(s)),
		...trongBang.filter((s) => !trongSo.includes(s)),
	];
}
