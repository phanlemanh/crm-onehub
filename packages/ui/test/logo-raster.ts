import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const NGUONG_LOGO = {
	iou: 0.98,
	rmsKenh: 8,
	lechTamTiLe: 0.01,
	alphaDuc: 255,
	alphaCo: 127,
	lechKenhToiDa: 2,
	tiLeDiemLechToiDa: 0.005,
	lechNenTrang: 8,
	banKinhAnToan: 0.4,
} as const;

export type AnhRgba = { data: Uint8Array; rong: number; cao: number };
export type TamAnh = { x: number; y: number };

export function duongGoc(ten: string): string {
	return fileURLToPath(new URL(`../scripts/logo-goc/${ten}`, import.meta.url));
}

export async function docAnh(nguon: string | Uint8Array): Promise<AnhRgba> {
	const { data, info } = await sharp(nguon)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });
	return { data: new Uint8Array(data), rong: info.width, cao: info.height };
}

export function veSvg(svg: string): Promise<AnhRgba> {
	return docAnh(new TextEncoder().encode(svg));
}

export function dat(dieuKien: boolean, thongDiep: string): void {
	if (!dieuKien) throw new Error(thongDiep);
}

export function iouMem(
	a: AnhRgba,
	b: AnhRgba,
	tuX: number,
	denX: number,
): number {
	let giao = 0;
	let hop = 0;
	for (let y = 0; y < a.cao; y++) {
		for (let x = tuX; x < denX; x++) {
			const i = (y * a.rong + x) * 4 + 3;
			const pa = (a.data[i] ?? 0) / 255;
			const pb = (b.data[i] ?? 0) / 255;
			giao += Math.min(pa, pb);
			hop += Math.max(pa, pb);
		}
	}
	return hop === 0 ? 0 : giao / hop;
}

export function rmsKenh(a: AnhRgba, b: AnhRgba, kenh: number): number {
	let tong = 0;
	let dem = 0;
	for (let i = 0; i < a.data.length; i += 4) {
		if (a.data[i + 3] !== NGUONG_LOGO.alphaDuc) continue;
		if (b.data[i + 3] !== NGUONG_LOGO.alphaDuc) continue;
		const lech = (a.data[i + kenh] ?? 0) - (b.data[i + kenh] ?? 0);
		tong += lech * lech;
		dem++;
	}
	return dem === 0 ? Number.POSITIVE_INFINITY : Math.sqrt(tong / dem);
}

export function tamKhungBao(a: AnhRgba): TamAnh {
	let minX = a.rong;
	let maxX = -1;
	let minY = a.cao;
	let maxY = -1;
	for (let y = 0; y < a.cao; y++) {
		for (let x = 0; x < a.rong; x++) {
			if ((a.data[(y * a.rong + x) * 4 + 3] ?? 0) <= NGUONG_LOGO.alphaCo)
				continue;
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
	}
	return { x: (minX + maxX + 1) / 2, y: (minY + maxY + 1) / 2 };
}
