import { createHash, timingSafeEqual } from "node:crypto";
import {
	khoaCapDauCua,
	messageIdCua,
	parseZaloGetUpdates,
	type ZaloUpdate,
} from "@crm/validation/zalo-update";
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

function docCapNhat(tho: string): ZaloUpdate | null {
	let than: ReturnType<typeof JSON.parse>;
	try {
		than = JSON.parse(tho);
	} catch {
		console.error("[zalo] webhook than khong phai JSON");
		return null;
	}
	try {
		return parseZaloGetUpdates(than);
	} catch (loi) {
		console.error(
			`[zalo] webhook sai khuon khoa=${khoaCapDauCua(than)} message_id=${messageIdCua(than) ?? "?"}: ${String(loi)}`,
		);
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
	const cap = docCapNhat(await request.text());
	if (cap?.loai === "tin") {
		const ket = await xuLyTinDen(bien.token, cap.message, {
			fetcher: deps.fetcher ?? fetch,
			now: (deps.now ?? (() => new Date()))(),
		});
		if (ket === "loi") return traVe(ZALO.http.loiMayChu);
	}
	return traVe(ZALO.http.ok);
}
