import type { PhuThuocHoi } from "../../agent/lib/zalo-nhan";

export type GoiSend = {
	text: string;
	auth: unknown;
	continuationToken: string;
	luc: number;
};

export function eveGia(chon: { treMs?: number; nem?: boolean } = {}) {
	const send: GoiSend[] = [];
	const reset: string[] = [];
	const cho: Promise<unknown>[] = [];
	let so = 0;
	const deps: PhuThuocHoi = {
		hoi: async (y) => {
			send.push({
				text: y.text,
				auth: y.auth,
				continuationToken: y.continuationToken,
				luc: performance.now(),
			});
			if (chon.treMs) await Bun.sleep(chon.treMs);
			if (chon.nem) throw new Error("eve gia khong nhan");
			so += 1;
			return { id: `ses-gia-${so}` };
		},
		datLai: async (token) => {
			reset.push(token);
		},
		waitUntil: (p) => {
			cho.push(p);
		},
	};
	return { deps, send, reset, xong: () => Promise.all(cho) };
}
