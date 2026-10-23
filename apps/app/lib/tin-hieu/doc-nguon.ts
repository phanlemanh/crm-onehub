import { db } from "@crm/db";
import { docBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import { cacheLife } from "next/cache";
import { LO_TRINH } from "@/lib/lo-trinh/cau-hinh";
import { banDungHienTai } from "@/lib/lo-trinh/chon-nguon";
import { docTepLoTrinh } from "@/lib/lo-trinh/doc-tep";
import { type BanChupTho, docBanChupTho, docNguonTinHieu } from "./nguon";
import { type NguonTrangThai, nguonTuHtml } from "./trang-thai";

async function docBanChupThoCrm(): Promise<BanChupTho> {
	"use cache";
	cacheLife({ revalidate: LO_TRINH.nhipLamMoiMs / 1000 });
	return docBanChupTho(() => docBanChupLoTrinh(db, LO_TRINH.nguonCrm));
}

async function docBanVe(): Promise<string | null> {
	"use cache";
	return docTepLoTrinh();
}

async function docBanDung(): Promise<NguonTrangThai> {
	return nguonTuHtml(await docBanVe());
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
