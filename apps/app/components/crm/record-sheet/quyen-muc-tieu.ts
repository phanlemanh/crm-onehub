import type { RouterOutputs } from "@/lib/trpc/types";

type ChiTiet = RouterOutputs["okr"]["objective"];
type KrCuaMt = ChiTiet["keyResults"][number];

export const ghiDuoc = (mt: ChiTiet) => mt.canEdit && mt.status !== "da-bo";

export const suaNoiDung = (mt: ChiTiet) => ghiDuoc(mt) && mt.choDuyet === null;

const moChoGhi = (mt: ChiTiet) =>
	mt.status !== "da-bo" && mt.choDuyet === null && mt.kyGhiDuoc;

export const suaTaiChoMucTieu = (mt: ChiTiet) => suaNoiDung(mt) && mt.kyGhiDuoc;

export const suaTaiChoKr = (mt: ChiTiet, kr: KrCuaMt) => ({
	ten: moChoGhi(mt) && mt.canEditKr.includes(kr.id),
	nguoi: moChoGhi(mt) && mt.canEditKr.includes(kr.id) && mt.canEdit,
});
