import { hoiTacTu, type YeuCauHoi } from "../../agent/lib/zalo-hoi";
import { moPhien } from "../../agent/lib/zalo-tra-loi";
import { TOKEN } from "./tra-loi-gieo";
import { zaloGia } from "./zalo-gia";

export { hoiTacTu };

export async function moPhienGia(
	y: YeuCauHoi,
	sessionId: string,
): Promise<void> {
	await moPhien(y, {
		hoi: async () => ({ id: sessionId }),
		fetcher: zaloGia().fetcher,
		token: TOKEN,
		messageId: y.hoiId,
	});
}
