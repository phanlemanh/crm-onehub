import type { ReactNode } from "react";
import { BanMauOkrMau } from "./_modules/ban-mau-okr";
import { CanhKrOkrMau } from "./_modules/canh-kr-okr";
import { CauTrucToChucMau } from "./_modules/cau-truc-to-chuc";
import { CuaVaoDangNhapMau } from "./_modules/cua-vao-dang-nhap";
import { CuaVaoVaMau } from "./_modules/cua-vao-va";
import { DieuPhoi30NgayDauMau } from "./_modules/dieu-phoi-30-ngay-dau";
import { DoiTenOnehubCenterMau } from "./_modules/doi-ten-onehub-center";
import { DonOkrNhapSai } from "./_modules/don-okr-nhap-sai";
import { DotHoiYTuongOkrMau } from "./_modules/dot-hoi-y-tuong-okr";
import { DuongProtoMau } from "./_modules/duong-proto";
import { GiaiDoanThoaThuanProto } from "./_modules/giai-doan-thoa-thuan";
import { GioiHanDuyetCayOkrMau } from "./_modules/gioi-han-duyet-cay-okr";
import { GopYDungChoMau } from "./_modules/gop-y-dung-cho";
import { GuiTinHieuMau } from "./_modules/gui-tin-hieu-trong-crm";
import { KanbanViecMau } from "./_modules/kanban-viec";
import { KeHoachLaMotBanGhiMau } from "./_modules/ke-hoach-la-mot-ban-ghi";
import { KeoThaThoaThuanMau } from "./_modules/keo-tha-thoa-thuan";
import { KhepKyOkrMau } from "./_modules/khep-ky-okr";
import { KhoTaiLieuMau } from "./_modules/kho-tai-lieu";
import { KhungBanGhiKaraMau } from "./_modules/khung-ban-ghi-kara";
import { KhungOkrTruocR1Mau } from "./_modules/khung-okr-truoc-r1";
import { KhungTaoOkrNhuDealMau } from "./_modules/khung-tao-okr-nhu-deal";
import { KhungTrangCaiDatMau } from "./_modules/khung-trang-cai-dat";
import { LichSuVaLuuTruTrangMau } from "./_modules/lich-su-va-luu-tru-trang";
import { MayNhacTruocNguoiMau } from "./_modules/may-nhac-truoc-nguoi";
import { MoiPhiaDeuThayKeHoachMau } from "./_modules/moi-phia-deu-thay-ke-hoach";
import { MoiTinHieuChoQuanTriMau } from "./_modules/moi-tin-hieu-cho-quan-tri";
import { MucTieuVaKrMau } from "./_modules/muc-tieu-va-kr";
import { NenKaraMau } from "./_modules/nen-kara";
import { NganHoSoMau } from "./_modules/ngan-ho-so-trong-lo-trinh";
import { NhacQuaZaloMau } from "./_modules/nhac-qua-zalo";
import { NoiZaloChoNguoiMoiMau } from "./_modules/noi-zalo-cho-nguoi-moi";
import { OkrToChucVaMau } from "./_modules/okr-to-chuc-va";
import { SoanOkrCungTroLyMau } from "./_modules/soan-okr-cung-tro-ly";
import { SoanOkrTrangRiengMau } from "./_modules/soan-okr-trang-rieng";
import { SoanOkrTrongKhungMau } from "./_modules/soan-okr-trong-khung";
import { SuaAnChuKyOkrMau } from "./_modules/sua-an-chu-ky-okr";
import { SuaGiaoDienTinHieuMau } from "./_modules/sua-giao-dien-tin-hieu";
import { ThanhVienVaoDungMau } from "./_modules/thanh-vien-vao-dung";
import { TinHieuTuVeKhoMau } from "./_modules/tin-hieu-tu-ve-kho";
import { ToChucDanhSachChiTietMau } from "./_modules/to-chuc-danh-sach-chi-tiet";
import { ToanCanhOkrMau } from "./_modules/toan-canh-okr";
import { TrangLoTrinhMau } from "./_modules/trang-lo-trinh-trong-crm";
import { TroLyOkrDeXuatMau } from "./_modules/tro-ly-okr-de-xuat";
import { TroLyOkrNenMau } from "./_modules/tro-ly-okr-nen";
import { TroLyOkrTomTatMau } from "./_modules/tro-ly-okr-tom-tat";
import { VaoBangMatKhauMau } from "./_modules/vao-bang-mat-khau";
import { ViecChungMau } from "./_modules/viec-chung";
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
	"don-okr-nhap-sai": DonOkrNhapSai,
	"dot-hoi-y-tuong-okr": DotHoiYTuongOkrMau,
	"duong-proto-cho-design-pass": DuongProtoMau,
	"gioi-han-duyet-cay-okr": GioiHanDuyetCayOkrMau,
	"gop-y-dung-cho": GopYDungChoMau,
	"ke-hoach-la-mot-ban-ghi": KeHoachLaMotBanGhiMau,
	"keo-tha-thoa-thuan": KeoThaThoaThuanMau,
	"khep-ky-okr": KhepKyOkrMau,
	"khung-trang-cai-dat": KhungTrangCaiDatMau,
	"nen-kara": NenKaraMau,
	"kho-tai-lieu": KhoTaiLieuMau,
	"lich-su-va-luu-tru-trang": LichSuVaLuuTruTrangMau,
	"may-soan-de-xuat": KhoTaiLieuMau,
	"tim-va-dieu-huong-kho": KhoTaiLieuMau,
	"tro-ly-doc-kho": KhoTaiLieuMau,
	"to-chuc-danh-sach-chi-tiet": ToChucDanhSachChiTietMau,
	"toan-canh-okr": ToanCanhOkrMau,
	"ngan-ho-so-trong-lo-trinh": NganHoSoMau,
	"trang-lo-trinh-trong-crm": TrangLoTrinhMau,
	"khung-okr-truoc-r1": KhungOkrTruocR1Mau,
	"okr-to-chuc-va": OkrToChucVaMau,
	"khung-tao-okr-nhu-deal": KhungTaoOkrNhuDealMau,
	"tro-ly-okr-de-xuat": TroLyOkrDeXuatMau,
	"tro-ly-okr-nen": TroLyOkrNenMau,
	"tro-ly-okr-tom-tat": TroLyOkrTomTatMau,
	"may-nhac-truoc-nguoi": MayNhacTruocNguoiMau,
	"moi-phia-deu-thay-ke-hoach": MoiPhiaDeuThayKeHoachMau,
	"muc-tieu-va-kr": MucTieuVaKrMau,
	"nhac-qua-zalo": NhacQuaZaloMau,
	"soan-okr-cung-tro-ly": SoanOkrCungTroLyMau,
	"soan-okr-trang-rieng": SoanOkrTrangRiengMau,
	"soan-okr-trong-khung": SoanOkrTrongKhungMau,
	"noi-zalo-cho-nguoi-moi": NoiZaloChoNguoiMoiMau,
	"sua-an-chu-ky-okr": SuaAnChuKyOkrMau,
	"sua-giao-dien-tin-hieu": SuaGiaoDienTinHieuMau,
	"thanh-vien-vao-dung": ThanhVienVaoDungMau,
	"cua-vao-va": CuaVaoVaMau,
	"vao-bang-email-va-mat-khau": VaoBangMatKhauMau,
	"khung-ban-ghi-kara": KhungBanGhiKaraMau,
	"gui-tin-hieu-trong-crm": GuiTinHieuMau,
	"moi-tin-hieu-cho-quan-tri": MoiTinHieuChoQuanTriMau,
	"tin-hieu-tu-ve-kho": TinHieuTuVeKhoMau,
	"kanban-viec": KanbanViecMau,
	"viec-chung": ViecChungMau,
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
