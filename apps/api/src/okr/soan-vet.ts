import { OKR } from "./okr-config";

const TIEN_TO = OKR.soan.ghiChuVet;

export const tienToVetCuoc = (cuocSoanId: string) => `${TIEN_TO}${cuocSoanId}:`;

export const ghiChuVetSoan = (cuocSoanId: string, deXuatId: string) =>
	`${tienToVetCuoc(cuocSoanId)}${deXuatId}`;

export function cuocCuaVet(note: string | null): string | null {
	if (!note?.startsWith(TIEN_TO)) return null;
	return note.slice(TIEN_TO.length).split(":")[0] ?? null;
}
