export const PHAM_VI = { cuaToi: "cua-toi", tatCa: "tat-ca-du-an" } as const;

export const KIEU_XEM_VIEC = ["gantt", "danh-sach", "bang"] as const;

export type KieuXemViec = (typeof KIEU_XEM_VIEC)[number];

export type PhamVi =
	| { loai: "cua-toi" }
	| { loai: "tat-ca" }
	| { loai: "du-an"; id: string };

export function docPhamVi(tho: string | null | undefined): PhamVi {
	if (!tho || tho === PHAM_VI.cuaToi) return { loai: "cua-toi" };
	if (tho === PHAM_VI.tatCa) return { loai: "tat-ca" };
	return { loai: "du-an", id: tho };
}

export function giaTriPhamVi(phamVi: PhamVi): string | null {
	if (phamVi.loai === "cua-toi") return null;
	if (phamVi.loai === "tat-ca") return PHAM_VI.tatCa;
	return phamVi.id;
}

export function kieuXemCo(phamVi: PhamVi): readonly KieuXemViec[] {
	return phamVi.loai === "du-an"
		? KIEU_XEM_VIEC
		: KIEU_XEM_VIEC.filter((k) => k !== "gantt");
}

export function kieuXemCua(
	tho: KieuXemViec | null,
	phamVi: PhamVi,
): KieuXemViec {
	const co = kieuXemCo(phamVi);
	if (tho && co.includes(tho)) return tho;
	return phamVi.loai === "du-an" ? "gantt" : "danh-sach";
}

export function ngayNgan(ngay: string): string {
	const [, thang, ngayThang] = ngay.split("-");
	return `${ngayThang}/${thang}`;
}

export function khoangNgay(
	tu: string | null,
	den: string | null,
): string | null {
	if (!tu || !den) return null;
	return tu === den ? ngayNgan(tu) : `${ngayNgan(tu)} – ${ngayNgan(den)}`;
}
