import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";

export function coHoiCuaVai(vai: string | null | undefined): boolean {
	return vai ? !laVaiChiOkr(toWorkspaceRole(vai)) : false;
}
