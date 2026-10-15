import { db } from "@crm/db";
import { docBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import { cacheLife } from "next/cache";
import { LO_TRINH } from "./cau-hinh";
import { type KetQuaDocBanChup, ketQuaTuHang } from "./doc-trang";

export async function docBanChupCrm(): Promise<KetQuaDocBanChup> {
	"use cache";
	cacheLife({ revalidate: LO_TRINH.nhipLamMoiMs / 1000 });
	try {
		return ketQuaTuHang(await docBanChupLoTrinh(db, LO_TRINH.nguonCrm));
	} catch (loi) {
		return {
			kieu: "loi",
			lyDo: loi instanceof Error ? loi.message : String(loi),
		};
	}
}
