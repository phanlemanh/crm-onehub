export const DONG_HO_HOI_Y = Symbol("DONG_HO_HOI_Y");

export type DongHo = () => Date;

export const MOC_SAU_KHOA_CHU_KY = Symbol("MOC_SAU_KHOA_CHU_KY");

export type MocSauKhoa = (buoc: string, id: string) => Promise<void>;
