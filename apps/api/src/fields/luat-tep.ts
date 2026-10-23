import { coTheXoaTep, quyenMoTep } from "@crm/auth";

export const LUAT_TEP = Symbol("LUAT_TEP");

export type LuatTep = {
	quyenMoTep: typeof quyenMoTep;
	coTheXoaTep: typeof coTheXoaTep;
};

export const LUAT_TEP_THAT: LuatTep = { quyenMoTep, coTheXoaTep };

export const luatTepProvider = { provide: LUAT_TEP, useValue: LUAT_TEP_THAT };
