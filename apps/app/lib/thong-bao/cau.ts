import type { Locale } from "@crm/ui/lib/locale";
import type { NoiDungThongBao } from "@crm/validation/thong-bao";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { thongBaoMessages } from "@/lib/messages/thong-bao";

function thamSo(nd: NoiDungThongBao): Record<string, string | number> {
	switch (nd.loai) {
		case "okr-cap-nhat":
			return { soKr: nd.soKr };
		case "okr-cho-duyet":
		case "okr-duoc-giao":
		case "okr-hoi-y-gop":
		case "okr-hoi-y-cong-bo":
			return { nhan: nd.nhan };
		case "okr-tra-lai":
			return { nhan: nd.nhan, lyDo: nd.lyDo };
		case "buoc-qua-han":
		case "buoc-sap-han":
			return { nhan: nd.nhan, cty: nd.companyName, soNgay: nd.soNgay ?? 0 };
		case "ke-hoach-im":
		case "moc-ngay":
			return { cty: nd.companyName, soNgay: nd.soNgay ?? 0 };
		case "viec-qua-han":
		case "viec-sap-han":
		case "viec-cho-danh-gia":
			return { tieuDe: nd.tieuDe, soNgay: nd.soNgay ?? 0 };
		case "okr-kr-im":
			return { nhan: nd.nhan, soNgay: nd.soNgay };
		case "okr-nhac-ten":
			return { nguoi: nd.nguoiTen, nhan: nd.nhan };
		case "okr-ghi-nhan":
			return { nguoi: nd.nguoiGui, nhan: nd.nhan };
		case "okr-theo-doi":
			return { nhan: nd.nhan, capNhat: nd.capNhat, binhLuan: nd.binhLuan };
		case "tai-lieu-cho-duyet":
			return { so: nd.so };
		case "okr-tom-tat":
			return { phong: nd.phongTen };
		case "ai-tran":
			return { muc: nd.muc };
		case "ai-doi-soat-lech":
			return { thang: nd.thang, lech: nd.lechPhanTram };
	}
}

export function cauThongBao(locale: Locale, nd: NoiDungThongBao): string {
	return dien(thongBaoMessages(locale).cau[nd.loai], thamSo(nd));
}
