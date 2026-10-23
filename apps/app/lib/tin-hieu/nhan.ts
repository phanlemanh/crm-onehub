import type { KhoaChoTinHieu } from "@crm/validation/tin-hieu-cho";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";

export function nhanCuaCho(khoa: KhoaChoTinHieu, m: TinHieuMessages): string {
	const n = m.nhan;
	switch (khoa) {
		case "cho-gom":
			return n.choGom;
		case "le":
			return n.le;
		case "da-phu":
			return n.daCoViec;
		case "nhom-chua-cat":
			return n.daVaoNhom;
		case "chan-troi":
			return n.deSau;
		case "chua-bat-dau":
			return n.chuaBatDau;
		case "dang-lam":
			return n.dangLam;
		case "da-giao":
			return n.daGiao;
		case "hang-khac":
			return n.khac;
	}
}
