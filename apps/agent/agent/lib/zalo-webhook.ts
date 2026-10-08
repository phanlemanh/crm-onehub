import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@crm/db";
import { SETTINGS_ID } from "@crm/db/settings";
import {
	type MoTaThanWebhook,
	moTaThanWebhook,
	parseZaloWebhook,
	type ZaloTinWebhook,
} from "@crm/validation/zalo-webhook";
import { zaloKhoaWebhook, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";
import { type PhuThuocHoi, xuLyTinDen } from "./zalo-nhan";

export type BienWebhook = { token: string | null; khoa: string | null };

export type PhuThuocWebhook = {
	fetcher?: typeof fetch;
	now?: () => Date;
	env?: BienWebhook;
	hoi?: PhuThuocHoi;
	datKhoaLech?: () => Promise<number>;
};

type LyDoTuChoiWebhook =
	(typeof ZALO.nhatKy.tuChoiWebhook)[keyof typeof ZALO.nhatKy.tuChoiWebhook];

function ghiTuChoi(status: number, lyDo: LyDoTuChoiWebhook): void {
	console.error(`[zalo] webhook ${status} ly_do=${lyDo}`);
}

export async function datKhoaLech(): Promise<number> {
	const lyDo = ZALO.nhatKy.tuChoiWebhook.khoaLech;
	const { count } = await db.appSetting.updateMany({
		where: {
			id: SETTINGS_ID,
			OR: [{ zaloWebhookLyDo: null }, { zaloWebhookLyDo: { not: lyDo } }],
		},
		data: { zaloWebhookLyDo: lyDo },
	});
	return count;
}

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

function ghiSaiKhuon(moTa: MoTaThanWebhook, lyDo: string): void {
	console.error(
		`[zalo] webhook sai khuon khoa=${moTa.khoa.join(",")} khoa_message=${moTa.khoaMessage.join(",")} message_id=${moTa.messageId ?? "?"}: ${lyDo}`,
	);
}

function docCapNhat(tho: string): ZaloTinWebhook | null {
	let than: unknown;
	try {
		than = JSON.parse(tho);
	} catch {
		ghiSaiKhuon(moTaThanWebhook(undefined), "than khong phai JSON");
		return null;
	}
	if (moTaThanWebhook(than).messageId === ZALO.nhatKy.maThu) {
		console.error(`[zalo] ${ZALO.nhatKy.maThu}`);
		return null;
	}
	try {
		return parseZaloWebhook(than);
	} catch (loi) {
		ghiSaiKhuon(moTaThanWebhook(than), String(loi));
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
	if (!bien.token || !bien.khoa) {
		ghiTuChoi(ZALO.http.khongCo, ZALO.nhatKy.tuChoiWebhook.chuaCoBot);
		return traVe(ZALO.http.khongCo);
	}
	const header = request.headers.get(ZALO.webhook.header);
	if (!header) {
		ghiTuChoi(ZALO.http.cam, ZALO.nhatKy.tuChoiWebhook.thieuKhoa);
		return traVe(ZALO.http.cam);
	}
	if (!khopKhoa(header, bien.khoa)) {
		ghiTuChoi(ZALO.http.cam, ZALO.nhatKy.tuChoiWebhook.khoaLech);
		await (deps.datKhoaLech ?? datKhoaLech)();
		return traVe(ZALO.http.cam);
	}
	const tin = docCapNhat(await request.text());
	if (tin) {
		const ket = await xuLyTinDen(bien.token, tin.message, {
			fetcher: deps.fetcher ?? fetch,
			now: (deps.now ?? (() => new Date()))(),
			hoi: deps.hoi,
		});
		if (ket === "loi") return traVe(ZALO.http.loiMayChu);
	}
	return traVe(ZALO.http.ok);
}
