import type { RouterOutputs } from "@/lib/trpc/types";
import type { KetQua } from "./kieu";

type ChiTiet = RouterOutputs["okr"]["objective"];

export function coTheCapNhat(mt: ChiTiet, kr: KetQua): boolean {
	return kr.hienTaiQuaCapNhat && mt.canEditKr.includes(kr.id);
}

export function coNutCapNhat(mt: ChiTiet, kr: KetQua): boolean {
	return coTheCapNhat(mt, kr) && mt.kyGhiDuoc && mt.status !== "da-bo";
}
