import type { Db } from "@crm/db";
import { docBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import { phanTichBanChupLuu } from "@crm/validation/ban-chup-lo-trinh";
import {
	type BanDung,
	chonNguon,
	type NguonLoTrinh,
} from "@/lib/lo-trinh/chon-nguon";
import type { NguonTrangThai } from "./trang-thai";

export type BanChupTho =
	| {
			kieu: "co";
			sha: string;
			commitLuc: string;
			layLuc: string;
			duLieu: unknown;
	  }
	| { kieu: "khong" }
	| { kieu: "loi"; lyDo: string }
	| { kieu: "hong"; lyDo: string };

export type NguonTinHieu = {
	kieu: NguonLoTrinh["kieu"];
	dauVao: NguonTrangThai;
};

export async function docBanChupTho(
	db: Db,
	nguon: string,
): Promise<BanChupTho> {
	try {
		const hang = await docBanChupLoTrinh(db, nguon);
		if (hang === null) return { kieu: "khong" };
		const kq = phanTichBanChupLuu(hang);
		if (!kq.ok)
			return { kieu: "hong", lyDo: `${kq.duongKhoa}: ${kq.thongDiep}` };
		return {
			kieu: "co",
			sha: kq.banChup.sha,
			commitLuc: kq.banChup.commitLuc,
			layLuc: kq.banChup.layLuc,
			duLieu: hang.duLieu,
		};
	} catch (loi) {
		return {
			kieu: "loi",
			lyDo: loi instanceof Error ? loi.message : String(loi),
		};
	}
}

export async function docNguonTinHieu(nguon: {
	docBanChup: () => Promise<BanChupTho>;
	docBanDung: () => Promise<NguonTrangThai>;
	banDung: BanDung;
	ghiCanhBao: (o: { ca: "loi" | "hong"; lyDo: string }) => void;
}): Promise<NguonTinHieu> {
	let kq: BanChupTho;
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
	const banChup = kq.kieu === "co" ? kq : null;
	const chon = chonNguon(banChup, nguon.banDung);
	if (chon.kieu === "ban-chup" && banChup !== null)
		return { kieu: "ban-chup", dauVao: { duLieu: banChup.duLieu } };
	return { kieu: "ban-dung", dauVao: await nguon.docBanDung() };
}
