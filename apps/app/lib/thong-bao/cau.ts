import type { Locale } from "@crm/ui/lib/locale";
import type { NoiDungThongBao } from "@crm/validation/thong-bao";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { thongBaoMessages } from "@/lib/messages/thong-bao";

function dienCau(mau: string, nd: NoiDungThongBao): string {
	switch (nd.loai) {
		case "okr-cap-nhat":
			return dien(mau, { soKr: nd.soKr });
		case "okr-cho-duyet":
		case "okr-duoc-giao":
		case "okr-hoi-y-gop":
		case "okr-hoi-y-cong-bo":
			return dien(mau, { nhan: nd.nhan });
		case "okr-tra-lai":
			return dien(mau, { nhan: nd.nhan, lyDo: nd.lyDo });
		case "buoc-qua-han":
		case "buoc-sap-han":
			return dien(mau, {
				nhan: nd.nhan,
				cty: nd.companyName,
				soNgay: nd.soNgay ?? 0,
			});
		case "ke-hoach-im":
		case "moc-ngay":
			return dien(mau, { cty: nd.companyName, soNgay: nd.soNgay ?? 0 });
		case "viec-qua-han":
		case "viec-sap-han":
		case "viec-cho-danh-gia":
			return dien(mau, { tieuDe: nd.tieuDe, soNgay: nd.soNgay ?? 0 });
		case "okr-kr-im":
			return dien(mau, { nhan: nd.nhan, soNgay: nd.soNgay });
		case "okr-nhac-ten":
			return dien(mau, { nguoi: nd.nguoiTen, nhan: nd.nhan });
		case "okr-ghi-nhan":
			return dien(mau, { nguoi: nd.nguoiGui, nhan: nd.nhan });
		case "okr-theo-doi":
			return dien(mau, {
				nhan: nd.nhan,
				capNhat: nd.capNhat,
				binhLuan: nd.binhLuan,
			});
		case "tai-lieu-cho-duyet":
			return dien(mau, { so: nd.so });
		case "okr-tom-tat":
			return dien(mau, { phong: nd.phongTen });
		case "ai-tran":
			return dien(mau, { muc: nd.muc });
		case "ai-doi-soat-lech":
			return dien(mau, { thang: nd.thang, lech: nd.lechPhanTram });
		case "tac-nhan-xong":
		case "tac-nhan-can-tra-loi":
		case "tac-nhan-hong":
			return dien(mau, { ten: nd.ten });
	}
}

const LOAI_TAC_NHAN = new Set<NoiDungThongBao["loai"]>([
	"tac-nhan-xong",
	"tac-nhan-can-tra-loi",
	"tac-nhan-hong",
]);

export function tenKhongDich(nd: NoiDungThongBao): string | null {
	if (!LOAI_TAC_NHAN.has(nd.loai) || !("ten" in nd)) return null;
	const ten = nd.ten.trim();
	return ten.length > 0 ? ten : null;
}

export function cauThongBao(locale: Locale, nd: NoiDungThongBao): string {
	const m = thongBaoMessages(locale);
	const ndDien =
		LOAI_TAC_NHAN.has(nd.loai) && "ten" in nd && !tenKhongDich(nd)
			? { ...nd, ten: m.chuong.tacNhanKhongTen }
			: nd;
	return dienCau(m.cau[nd.loai], ndDien);
}
