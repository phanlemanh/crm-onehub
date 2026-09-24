import {
	messageIdCua,
	parseZaloGetUpdates,
	type ZaloUpdate,
} from "@crm/validation/zalo-update";
import { zaloGoi, zaloToken } from "./zalo-api";
import { kiemBot } from "./zalo-bot";
import { ZALO } from "./zalo-config";
import { xuLyTinDen } from "./zalo-nhan";

export type PhuThuocPoll = {
	fetcher?: typeof fetch;
	now?: () => Date;
	timeoutGiay?: number;
};

export type KetQuaPoll = { xuLy: number; loi: number };

async function nhanTin(
	token: string,
	fetcher: typeof fetch,
	timeoutGiay: number,
): Promise<ZaloUpdate | "loi"> {
	const tho = await zaloGoi(fetcher, token, "getUpdates", {
		timeout: String(timeoutGiay),
	});
	try {
		return parseZaloGetUpdates(tho);
	} catch (loi) {
		console.error(
			`[zalo] tin hong message_id=${messageIdCua(tho) ?? "?"}: ${String(loi)}`,
		);
		return "loi";
	}
}

export async function pollZalo(deps: PhuThuocPoll = {}): Promise<KetQuaPoll> {
	const fetcher = deps.fetcher ?? fetch;
	const now = (deps.now ?? (() => new Date()))();
	const timeoutGiay = deps.timeoutGiay ?? ZALO.poll.timeoutGiay;
	const trangThai = await kiemBot({ fetcher, now: () => now });
	if (trangThai === "tat") return { xuLy: 0, loi: 0 };
	if (trangThai === "loi") return { xuLy: 0, loi: 1 };
	const token = await zaloToken();
	if (!token) return { xuLy: 0, loi: 0 };
	let xuLy = 0;
	let loi = 0;
	for (let lan = 0; lan < ZALO.poll.toiDaMoiNhip; lan++) {
		const cap = await nhanTin(token, fetcher, timeoutGiay);
		if (cap === "loi") {
			loi++;
			continue;
		}
		if (cap.loai === "het") break;
		const ket = await xuLyTinDen(token, cap.message, { fetcher, now });
		if (ket === "xong") xuLy++;
		if (ket === "loi") loi++;
	}
	return { xuLy, loi };
}

export type PhuThuocVongTay = {
	fetcher?: typeof fetch;
	now?: () => Date;
	conTiep: () => boolean;
	baoLuot?: (ket: KetQuaPoll) => void;
};

export async function vongTay(deps: PhuThuocVongTay): Promise<void> {
	while (deps.conTiep()) {
		const ket = await pollZalo({
			fetcher: deps.fetcher,
			now: deps.now,
			timeoutGiay: ZALO.pollTay.timeoutGiay,
		});
		deps.baoLuot?.(ket);
	}
}
