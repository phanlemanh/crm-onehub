import { z } from "zod";
import { SOAN_UI } from "./cau-hinh";
import type { SoDaGo } from "./kieu";
import { khoaKr } from "./moc-nop";

type Kho = Pick<Storage, "getItem" | "setItem">;

const soDaLuu = z.record(
	z.string(),
	z.object({
		khoiDiem: z.string(),
		dich: z.string(),
		khoaDong: z.string().optional(),
	}),
);

export const khoaSo = (kr: { chaKhoa: string; khoa: string }): string =>
	khoaKr(kr.chaKhoa, kr.khoa);

function khoMacDinh(): Kho | undefined {
	try {
		return globalThis.sessionStorage ?? undefined;
	} catch {
		return undefined;
	}
}

function docThu(kho: Kho, khoa: string): unknown {
	try {
		return JSON.parse(kho.getItem(khoa) ?? "{}");
	} catch {
		return null;
	}
}

export function docSoDaLuu(
	cuocSoanId: string,
	kho: Kho | undefined = khoMacDinh(),
): SoDaGo {
	if (!kho) return {};
	const r = soDaLuu.safeParse(docThu(kho, SOAN_UI.khoaSo + cuocSoanId));
	return r.success ? r.data : {};
}

export function ghiSoDaLuu(
	cuocSoanId: string,
	so: SoDaGo,
	kho: Kho | undefined = khoMacDinh(),
): boolean {
	if (!kho) return false;
	try {
		kho.setItem(SOAN_UI.khoaSo + cuocSoanId, JSON.stringify(so));
		return true;
	} catch {
		return false;
	}
}
