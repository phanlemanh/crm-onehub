import type { ReactNode } from "react";
import type { KrMau } from "../ban-mau-okr/du-lieu";
import type { MucTieuDu } from "./du-lieu";

export type DiemCam = {
	nhanMucTieu?: (mt: MucTieuDu) => ReactNode;
	duoiMucTieu?: (mt: MucTieuDu) => ReactNode;
	duoiKr?: (kr: KrMau, mt: MucTieuDu) => ReactNode;
	sauTenKr?: (kr: KrMau, mt: MucTieuDu) => ReactNode;
};

export function coNoiDung(noi: ReactNode): boolean {
	return noi !== null && noi !== undefined && noi !== false && noi !== "";
}
