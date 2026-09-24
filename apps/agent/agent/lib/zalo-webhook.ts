import { createHash, timingSafeEqual } from "node:crypto";
import {
	moTaThanWebhook,
	parseZaloWebhook,
	type ZaloTinWebhook,
} from "@crm/validation/zalo-webhook";
import { zaloKhoaWebhook, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";
import { xuLyTinDen } from "./zalo-nhan";

export type BienWebhook = { token: string | null; khoa: string | null };

export type PhuThuocWebhook = {
	fetcher?: typeof fetch;
	now?: () => Date;
	env?: BienWebhook;
};

function bam(giaTri: string): Buffer {
	return createHash("sha256").update(giaTri).digest();
}

function khopKhoa(header: string | null, khoa: string): boolean {
	if (!header) return false;
	return timingSafeEqual(bam(header), bam(khoa));
}

function traVe(status: number): Response {
	return new Response(null, { status });
}

function ghiSaiKhuon(than: unknown, lyDo: string): void {
	const moTa = moTaThanWebhook(than);
	console.error(
		`[zalo] webhook sai khuon khoa=${moTa.khoa.join(",")} khoa_message=${moTa.khoaMessage.join(",")} message_id=${moTa.messageId ?? "?"}: ${lyDo}`,
	);
}

function docCapNhat(tho: string): ZaloTinWebhook | null {
	let than: unknown;
	try {
		than = JSON.parse(tho);
	} catch {
		ghiSaiKhuon(undefined, "than khong phai JSON");
		return null;
	}
	try {
		return parseZaloWebhook(than);
	} catch (loi) {
		ghiSaiKhuon(than, String(loi));
		return null;
	}
}

export async function nhanWebhook(
	request: Request,
	deps: PhuThuocWebhook = {},
): Promise<Response> {
	const bien = deps.env ?? {
		token: await zaloToken(),
		khoa: await zaloKhoaWebhook(),
	};
	if (!bien.token || !bien.khoa) return traVe(ZALO.http.khongCo);
	if (!khopKhoa(request.headers.get(ZALO.webhook.header), bien.khoa)) {
		return traVe(ZALO.http.cam);
	}
	const tin = docCapNhat(await request.text());
	if (tin) {
		const ket = await xuLyTinDen(bien.token, tin.message, {
			fetcher: deps.fetcher ?? fetch,
			now: (deps.now ?? (() => new Date()))(),
		});
		if (ket === "loi") return traVe(ZALO.http.loiMayChu);
	}
	return traVe(ZALO.http.ok);
}
