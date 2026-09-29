import { chuanNfc, TAI_LIEU } from "./tai-lieu";

const TU = /[\p{L}\p{N}]+/gu;
const CHU_SO = /[\p{L}\p{N}]/u;
const DAU = /\p{M}/gu;

export type TruyVanTim = { tsquery: string; tu: string[] };
export type DoanTrich = { truoc: string; khop: string; sau: string };

function boDauMotKyTu(c: string): string {
	const bo = c
		.normalize("NFD")
		.replace(DAU, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
	return Array.from(bo)[0] ?? c;
}

export function boDauTungKyTu(s: string): string {
	return Array.from(s, boDauMotKyTu).join("");
}

export function dungTruyVan(q: string): TruyVanTim | null {
	const gon = Array.from(chuanNfc(q).toLowerCase())
		.slice(0, TAI_LIEU.tim.toiDa)
		.join("");
	const tu = gon.match(TU) ?? [];
	if (tu.join("").length < TAI_LIEU.tim.toiThieu) return null;
	return { tsquery: `${tu.join(" & ")}:*`, tu };
}

function laChuSo(c: string | undefined): boolean {
	return c !== undefined && CHU_SO.test(c);
}

function khopTai(
	bo: readonly string[],
	viTri: number,
	tu: readonly string[],
	tienTo: boolean,
): boolean {
	if (laChuSo(bo[viTri - 1])) return false;
	for (let i = 0; i < tu.length; i += 1) {
		if (bo[viTri + i] !== tu[i]) return false;
	}
	return tienTo || !laChuSo(bo[viTri + tu.length]);
}

function timKhop(
	bo: readonly string[],
	tu: readonly string[],
): { dau: number; dai: number } | null {
	const mau = tu.map((t) => Array.from(boDauTungKyTu(t)));
	for (let viTri = 0; viTri < bo.length; viTri += 1) {
		for (let i = 0; i < mau.length; i += 1) {
			const m = mau[i] as string[];
			if (m.length > 0 && khopTai(bo, viTri, m, i === mau.length - 1)) {
				return { dau: viTri, dai: m.length };
			}
		}
	}
	return null;
}

function dauCat(chu: readonly string[], tu: number, ben: number): number {
	const dau = Math.max(0, tu - ben);
	if (dau === 0) return 0;
	for (let i = dau; i < tu; i += 1) {
		if (chu[i - 1] === " ") return i;
	}
	return tu;
}

function cuoiCat(chu: readonly string[], tu: number, ben: number): number {
	const cuoi = Math.min(chu.length, tu + ben);
	if (cuoi === chu.length) return cuoi;
	for (let i = cuoi; i > tu; i -= 1) {
		if (chu[i] === " ") return i;
	}
	return tu;
}

export function doanTrich(
	chu: string,
	tu: readonly string[],
	ben: number,
): DoanTrich | null {
	const kyTu = Array.from(chu);
	const khop = timKhop(Array.from(boDauTungKyTu(chu)), tu);
	if (!khop) return null;
	const het = khop.dau + khop.dai;
	const dau = dauCat(kyTu, khop.dau, ben);
	const cuoi = cuoiCat(kyTu, het, ben);
	return {
		truoc: kyTu.slice(dau, khop.dau).join(""),
		khop: kyTu.slice(khop.dau, het).join(""),
		sau: kyTu.slice(het, cuoi).join(""),
	};
}
