import type { ReactNode } from "react";
import type { KetQua, MucTieu } from "./kieu";

export type DiemCam = {
	nhanMucTieu?: (mt: MucTieu) => ReactNode;
	duoiMucTieu?: (mt: MucTieu) => ReactNode;
	duoiKr?: (kr: KetQua, mt: MucTieu | null) => ReactNode;
	sauTenKr?: (kr: KetQua, mt: MucTieu | null) => ReactNode;
};

export function coNoiDung(noi: ReactNode): boolean {
	return noi !== null && noi !== undefined && noi !== false && noi !== "";
}
