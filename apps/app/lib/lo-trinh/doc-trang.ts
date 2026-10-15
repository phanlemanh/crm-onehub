import {
	type BanChupDoc,
	type HangBanChupLuu,
	phanTichBanChupLuu,
} from "@crm/validation/ban-chup-lo-trinh";
import {
	type DuLieuChoXem,
	phanTichLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";
import type { WorkspaceRole } from "@crm/validation/vai-workspace";
import { choVaiXem } from "./cho-vai";
import { type BanDung, chonNguon, type NguonLoTrinh } from "./chon-nguon";
import { docDuLieu } from "./doc-du-lieu.js";

export type DauVaoLoTrinh =
	| { kieu: "tep-vang" }
	| { kieu: "chua-co-khoi"; cauMay: string }
	| { kieu: "khoi-hong"; cauMay: string }
	| {
			kieu: "co-du-lieu";
			duLieu: DuLieuChoXem;
			canhBao: string[];
			nguon?: NguonLoTrinh;
	  };

export type KetQuaDocBanChup =
	| { kieu: "co"; banChup: BanChupDoc }
	| { kieu: "khong" }
	| { kieu: "loi"; lyDo: string }
	| { kieu: "hong"; lyDo: string };

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
	return {
		kieu: "co-du-lieu",
		duLieu: kq.duLieu,
		canhBao: kq.duLieu.phien_ban === 1 ? [] : canhBao,
	};
}

export function ketQuaTuHang(hang: HangBanChupLuu | null): KetQuaDocBanChup {
	if (hang === null) return { kieu: "khong" };
	const kq = phanTichBanChupLuu(hang);
	return kq.ok
		? { kieu: "co", banChup: kq.banChup }
		: { kieu: "hong", lyDo: `${kq.duongKhoa}: ${kq.thongDiep}` };
}

export async function docDauVaoChoVai(
	vai: WorkspaceRole | null,
	nguon: {
		docBanChup: () => Promise<KetQuaDocBanChup>;
		docBanDung: () => Promise<DauVaoLoTrinh>;
		banDung: BanDung;
		ghiCanhBao: (o: { ca: "loi" | "hong"; lyDo: string }) => void;
	},
): Promise<DauVaoLoTrinh> {
	let kq: KetQuaDocBanChup;
	try {
		kq = await nguon.docBanChup();
	} catch (loi) {
		kq = {
			kieu: "loi",
			lyDo: loi instanceof Error ? loi.message : String(loi),
		};
	}
	if (kq.kieu === "loi" || kq.kieu === "hong")
		nguon.ghiCanhBao({ ca: kq.kieu, lyDo: kq.lyDo });
	const banChup = kq.kieu === "co" ? kq.banChup : null;
	const chon = chonNguon(banChup, nguon.banDung);
	if (chon.kieu === "ban-chup" && banChup !== null)
		return choVaiXem(
			{
				kieu: "co-du-lieu",
				duLieu: banChup.duLieu,
				canhBao: banChup.duLieu.phien_ban === 1 ? [] : banChup.canhBao,
				nguon: chon,
			},
			vai,
		);
	const banDung = await nguon.docBanDung();
	return choVaiXem(
		banDung.kieu === "co-du-lieu" ? { ...banDung, nguon: chon } : banDung,
		vai,
	);
}
