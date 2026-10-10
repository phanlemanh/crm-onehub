import {
	type LoTrinhDuLieu,
	phanTichLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";
import { docDuLieu } from "./doc-du-lieu.js";

export type DauVaoLoTrinh =
	| { kieu: "tep-vang" }
	| { kieu: "chua-co-khoi"; cauMay: string }
	| { kieu: "khoi-hong"; cauMay: string }
	| { kieu: "co-du-lieu"; duLieu: LoTrinhDuLieu; canhBao: string[] };

export function docTrangLoTrinh(html: string | null): DauVaoLoTrinh {
	if (html === null) return { kieu: "tep-vang" };
	const { duLieu, canhBao } = docDuLieu(html);
	if (duLieu === null) {
		const cau = canhBao.join(" · ");
		return cau.includes("chưa mang")
			? { kieu: "chua-co-khoi", cauMay: cau }
			: { kieu: "khoi-hong", cauMay: cau };
	}
	const kq = phanTichLoTrinh(duLieu);
	if (!kq.ok)
		return { kieu: "khoi-hong", cauMay: `${kq.duongKhoa}: ${kq.thongDiep}` };
	return { kieu: "co-du-lieu", duLieu: kq.duLieu, canhBao };
}
