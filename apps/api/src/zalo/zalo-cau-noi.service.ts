import {
	type DatBotPhanHoi,
	type DatBotYeuCau,
	datBotPhanHoi,
	type GuiThuPhanHoi,
	guiThuPhanHoi,
	ZALO_CAU_NOI,
} from "@crm/validation/zalo-cau-noi";
import { Injectable, Logger } from "@nestjs/common";
import type { z } from "zod";
import { bridge } from "../agent/bridge";
import { ZALO_API } from "./zalo.config";

export type KetCauNoi<T> = { ok: true; data: T } | { ok: false; lyDo: string };

@Injectable()
export class ZaloCauNoiService {
	private readonly logger = new Logger(ZaloCauNoiService.name);

	datBot(yeuCau: DatBotYeuCau): Promise<KetCauNoi<DatBotPhanHoi>> {
		return this.goi(ZALO_CAU_NOI.bot, yeuCau, datBotPhanHoi);
	}

	guiThu(userId: string): Promise<KetCauNoi<GuiThuPhanHoi>> {
		return this.goi(ZALO_CAU_NOI.guiThu, { userId }, guiThuPhanHoi);
	}

	private async goi<T>(
		duong: string,
		than: DatBotYeuCau | { userId: string },
		schema: z.ZodType<T>,
	): Promise<KetCauNoi<T>> {
		const cau = bridge();
		if (!cau) return { ok: false, lyDo: "khong-cau-noi" };
		try {
			const res = await fetch(cau.url(duong), {
				method: "POST",
				headers: {
					authorization: `Bearer ${cau.secret}`,
					"content-type": "application/json",
				},
				body: JSON.stringify(than),
				signal: AbortSignal.timeout(ZALO_API.cauNoi.timeoutMs),
			});
			if (!res.ok) return { ok: false, lyDo: `http-${res.status}` };
			return { ok: true, data: schema.parse(await res.json()) };
		} catch (loi) {
			this.logger.warn({
				message: "Zalo bridge call failed",
				duong,
				loi: loi instanceof Error ? loi.message : String(loi),
			});
			return { ok: false, lyDo: "khong-noi-duoc" };
		}
	}
}
