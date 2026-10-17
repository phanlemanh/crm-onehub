import type {
	GioMayViec,
	LoTrinhChoXem,
	MocLoTrinh,
} from "@crm/validation/lo-trinh-du-lieu";

export type LyDoChuaCoNgay = "ban-cu" | "chua-mo-viec" | "khong-doc-duoc";

export type DuKienMoc =
	| {
			kieu: "co-ngay";
			hoanTat: string;
			ngayTinh: string | null;
			quaTai: boolean;
			chuaDuSoDo: boolean;
			daQua: boolean;
	  }
	| { kieu: "chua-co"; lyDo: LyDoChuaCoNgay };

export function gioMayChuaDu(gioMay: GioMayViec | null): boolean {
	return gioMay === null || gioMay.co !== null;
}

export function duKienMoc(
	lo: LoTrinhChoXem,
	moc: MocLoTrinh,
	homNay: string | null,
): DuKienMoc | null {
	if (!moc.con_viec) return null;
	if (moc.du_kien === null)
		return {
			kieu: "chua-co",
			lyDo: moc.gio_may === null ? "ban-cu" : "chua-mo-viec",
		};
	if (moc.hoanTatHopLe === null)
		return { kieu: "chua-co", lyDo: "khong-doc-duoc" };
	const theoMa = new Map(lo.hang.map((h) => [h.ma, h]));
	const chuaDuSoDo = moc.hang.some((ma) => {
		const h = theoMa.get(ma);
		return (
			h !== undefined &&
			h.nhom_trang_thai !== "da-giao" &&
			gioMayChuaDu(h.gio_may)
		);
	});
	return {
		kieu: "co-ngay",
		hoanTat: moc.hoanTatHopLe,
		ngayTinh: moc.ngayTinhHopLe,
		quaTai: moc.qua_tai !== null,
		chuaDuSoDo,
		daQua: homNay !== null && moc.hoanTatHopLe < homNay,
	};
}
