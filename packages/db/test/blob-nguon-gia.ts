import { BLOB_NGUON, hetHanSau, type KhoNguon } from "../src/blob-nguon";

export type KhoNguonGia = KhoNguon & {
	daPut: Map<string, Uint8Array>;
	daXoa: string[];
	kyGetCuoi: number | null;
};

const GOC_GIA = "https://blob-gia.test";

export function khoNguonGia(): KhoNguonGia {
	const kho: KhoNguonGia = {
		daPut: new Map(),
		daXoa: [],
		kyGetCuoi: null,

		bat: () => true,

		async kyPut(pathname) {
			return {
				url: `${GOC_GIA}/put/${pathname}`,
				hetHan: hetHanSau(BLOB_NGUON.giayKyPut),
			};
		},

		async doc(pathname) {
			return kho.daPut.get(pathname) ?? null;
		},

		async xoa(pathname) {
			kho.daXoa.push(pathname);
			kho.daPut.delete(pathname);
		},

		async kyGet(pathname, giay) {
			kho.kyGetCuoi = giay;
			return {
				url: `${GOC_GIA}/get/${pathname}`,
				hetHan: hetHanSau(giay),
			};
		},
	};
	return kho;
}
