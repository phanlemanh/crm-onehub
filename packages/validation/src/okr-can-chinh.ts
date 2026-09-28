import { CAP_MUC_TIEU, type CapMucTieu, HANG_CAP } from "./okr-muc-tieu";

export type NguonCanChinh = {
	level: CapMucTieu;
	cycleId: string;
	cycleParentId: string | null;
};

export function capDichCanChinh(level: CapMucTieu): CapMucTieu[] {
	return CAP_MUC_TIEU.filter((c) => HANG_CAP[c] < HANG_CAP[level]);
}

export function chuKyDichCanChinh(nguon: NguonCanChinh): string[] {
	return [nguon.cycleId, ...(nguon.cycleParentId ? [nguon.cycleParentId] : [])];
}

export function hopLeLamDichCanChinh(
	nguon: NguonCanChinh,
	dich: { status: string; level: CapMucTieu; cycleId: string },
): boolean {
	return (
		dich.status === "cong-bo" &&
		capDichCanChinh(nguon.level).includes(dich.level) &&
		chuKyDichCanChinh(nguon).includes(dich.cycleId)
	);
}
