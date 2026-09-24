import {
	parseZaloDeleteWebhook,
	parseZaloSetWebhook,
} from "@crm/validation/zalo-update";
import { zaloGoi, zaloKhoaWebhook, zaloToken } from "./zalo-api";
import { ZALO } from "./zalo-config";
import type { BienWebhook } from "./zalo-webhook";

export type ThamSoWebhook = { url: string | null; xoa: boolean };

export type PhuThuocDangKy = { fetcher?: typeof fetch; env?: BienWebhook };

const CO_XOA = "--xoa";
const TIEN_TO_AN_TOAN = "https://";

export function docThamSo(argv: string[]): ThamSoWebhook {
	const xoa = argv.includes(CO_XOA);
	const url = argv.find((a) => a !== CO_XOA) ?? null;
	return { url, xoa };
}

export async function dangKyWebhook(
	thamSo: ThamSoWebhook,
	deps: PhuThuocDangKy = {},
): Promise<string> {
	const fetcher = deps.fetcher ?? fetch;
	const bien = deps.env ?? {
		token: await zaloToken(),
		khoa: await zaloKhoaWebhook(),
	};
	if (!bien.token) throw new Error("Thiếu ZALO_BOT_TOKEN.");
	if (thamSo.xoa) {
		parseZaloDeleteWebhook(
			await zaloGoi(fetcher, bien.token, "deleteWebhook", {}),
		);
		return "Đã gỡ webhook.";
	}
	if (!bien.khoa) throw new Error("Thiếu ZALO_WEBHOOK_SECRET.");
	const { min, max } = ZALO.webhook.khoa;
	if (bien.khoa.length < min || bien.khoa.length > max) {
		throw new Error(`ZALO_WEBHOOK_SECRET phải dài ${min}–${max} ký tự.`);
	}
	if (!thamSo.url?.startsWith(TIEN_TO_AN_TOAN)) {
		throw new Error(
			`URL webhook phải là https://… — nhận được: ${thamSo.url ?? "(trống)"}.`,
		);
	}
	const ket = parseZaloSetWebhook(
		await zaloGoi(fetcher, bien.token, "setWebhook", {
			url: thamSo.url,
			secret_token: bien.khoa,
		}),
	);
	return `outcome=${ket.outcome ?? "?"} hint=${ket.hint ?? "?"} url=${ket.url}`;
}
