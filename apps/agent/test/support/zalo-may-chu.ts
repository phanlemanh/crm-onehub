import { type ChonZaloGia, zaloGia } from "./zalo-gia";

export function zaloMayChu(chon: ChonZaloGia = {}) {
	const gia = zaloGia(chon);
	const mayChu = Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		fetch: async (req) =>
			gia.fetcher(req.url, { method: "POST", body: await req.text() }),
	});
	return {
		url: `http://127.0.0.1:${mayChu.port}`,
		goi: gia.goi,
		soGoi: gia.soGoi,
		dung: () => mayChu.stop(true),
	};
}
