import { db } from "@crm/db";
import { cacheLife } from "next/cache";
import { LO_TRINH } from "@/lib/lo-trinh/cau-hinh";
import { banDungHienTai } from "@/lib/lo-trinh/chon-nguon";
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import { type BanChupTho, docBanChupTho, docNguonTinHieu } from "./nguon";

async function docBanChupThoCrm(): Promise<BanChupTho> {
	"use cache";
	cacheLife({ revalidate: LO_TRINH.nhipLamMoiMs / 1000 });
	return docBanChupTho(db, LO_TRINH.nguonCrm);
}

async function docBanDung(): Promise<string | null> {
	"use cache";
	return docTepLoTrinh();
}

function ghiCanhBao(o: { ca: "loi" | "hong"; lyDo: string }) {
	console.warn("tin-hieu: roi ve ban dung", o);
}

export function docNguonTinHieuTrang() {
	return docNguonTinHieu({
		docBanChup: docBanChupThoCrm,
		docBanDung,
		banDung: banDungHienTai(),
		ghiCanhBao,
	});
}
