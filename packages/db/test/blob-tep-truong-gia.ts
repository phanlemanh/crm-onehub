import type { KhoTepTruong } from "../src/blob-tep-truong";

export type KhoTepTruongGia = KhoTepTruong & {
	daPut: Map<string, Uint8Array>;
	daXoa: string[];
	daKyPut: { pathname: string; mime: string; toiDa: number }[];
	xoaHong: Set<string>;
	tat: boolean;
	put(pathname: string, byte: Uint8Array): void;
};

export const GOC_KHO_GIA = "https://blob-tep-gia.test";

export function khoTepTruongGia(): KhoTepTruongGia {
	const kho: KhoTepTruongGia = {
		daPut: new Map(),
		daXoa: [],
		daKyPut: [],
		xoaHong: new Set(),
		tat: false,

		put(pathname, byte) {
			kho.daPut.set(pathname, byte);
		},

		bat: () => !kho.tat,

		async kyPut(pathname, { mime, toiDa }) {
			if (kho.tat) throw new Error("kho tep gia tat");
			kho.daKyPut.push({ pathname, mime, toiDa });
			const hetHan = Date.now() + 600_000;
			return { url: `${GOC_KHO_GIA}/put/${pathname}?han=${hetHan}`, hetHan };
		},

		async doc(pathname) {
			if (kho.tat) return null;
			return kho.daPut.get(pathname) ?? null;
		},

		async xoa(pathname) {
			if (kho.tat || kho.xoaHong.has(pathname)) {
				throw new Error(`kho tep gia xoa hong ${pathname}`);
			}
			kho.daXoa.push(pathname);
			kho.daPut.delete(pathname);
		},

		async kyGet(pathname, giay) {
			if (kho.tat) throw new Error("kho tep gia tat");
			const hetHan = Date.now() + giay * 1_000;
			return { url: `${GOC_KHO_GIA}/get/${pathname}?han=${hetHan}`, hetHan };
		},
	};
	return kho;
}
