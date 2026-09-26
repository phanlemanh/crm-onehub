import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function diemGop() {
	return execFileSync(
		"git",
		["-C", GOC, "merge-base", "HEAD", "origin/onehub"],
		{ encoding: "utf8" },
	).trim();
}

export const VONG = Object.freeze({
	truoc: diemGop(),
	sau: "HEAD",
});

export const HO_SO_BI_CHAM = [
	"agent-builder-noi-tieng-viet",
	"bang-thanh-vien-giu-hang",
	"bo-dung-chung-nhan-chuoi",
	"cai-dat-con-lai-noi-tieng-viet",
	"cau-truc-to-chuc",
	"chan-lai-component-ra-man",
	"cho-phep-ai-vao-o-man-hinh",
	"chu-cuoi-cung-tien-de",
	"chu-mac-dinh-thu-vien-ngoai",
	"claimdue-chi-thay-dong-cua-minh",
	"cron-theo-ban-khai",
	"cua-so-tro-chuyen-noi-tieng-viet",
	"dat-okr-trong-crm",
	"do-quyen-luot-bang-hanh-vi",
	"duong-proto-cho-design-pass",
	"go-la-cat-quyen-that",
	"han-viec-theo-ngay",
	"ke-hoach-la-mot-ban-ghi",
	"khoa-cu-khong-mo-khoa-moi",
	"khoa-lo-giu-tran",
	"khoa-rieng-dien-node",
	"khung-trang-cai-dat",
	"lam-moi-chuyen-viec-qua-loi-chung",
	"lenh-chung-khong-an-cache-doi",
	"lenh-dung-do-khong-ai-thay",
	"logo-onehub",
	"loi-tac-tu-zalo-noi-dung-nguyen-nhan",
	"ma-tran-phai-co-chieu-song",
	"man-cai-dat-noi-tieng-viet",
	"may-nhac-truoc-nguoi",
	"moi-bai-kiem-dom-deu-chay",
	"moi-phia-deu-thay-ke-hoach",
	"mot-duong-ghi-phong-ban",
	"nen-chat-ai-elements",
	"neo-dan-so-khong-cung",
	"ngay-gieo-theo-gio-vn",
	"nhac-qua-zalo",
	"noi-zalo-cho-nguoi-moi",
	"o-cam-chay-duoc-that",
	"o-so-tien-doc-theo-tieng",
	"okr-soat-anh-luot-3",
	"ten-dong-tien-bao-cao",
	"thanh-vien-hai-khoi-cung-khuon",
	"thuoc-o-soan-don-dep",
	"tiep-thi-tuyen-doi-tac",
	"tieu-de-cot-doc-tron",
	"to-chuc-danh-sach-chi-tiet",
	"tong-quan-va-khung-noi-tieng-viet",
	"tra-loi-tin-nhac",
	"truong-tu-tao-o-cai-dat",
	"vai-chi-okr",
	"vao-bang-email-va-mat-khau",
	"vung-cuon-la-khoi-chua",
	"zalo-gio-theo-mui-gio-xuong",
	"zalo-goi-thu-hong-hien-dung-bot",
	"zalo-webhook-doc-khuon-that",
];
