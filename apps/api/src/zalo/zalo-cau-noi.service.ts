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

export const NGUYEN_NHAN_CAU_NOI = [
	"thieu-cau-noi",
	"khong-toi-duoc",
	"sai-khoa",
	"tac-tu-loi",
	"sai-khuon",
] as const;
export type NguyenNhanCauNoi = (typeof NGUYEN_NHAN_CAU_NOI)[number];

type Hong = { nguyenNhan: NguyenNhanCauNoi; status?: number };

export type KetCauNoi<T> = { ok: true; data: T } | ({ ok: false } & Hong);

@Injectable()
export class ZaloCauNoiService {
	private readonly logger = new Logger(ZaloCauNoiService.name);

	datBot(yeuCau: DatBotYeuCau): Promise<KetCauNoi<DatBotPhanHoi>> {
		return this.goi(ZALO_CAU_NOI.bot, yeuCau, datBotPhanHoi);
	}

	guiThu(userId: string): Promise<KetCauNoi<GuiThuPhanHoi>> {
		return this.goi(ZALO_CAU_NOI.guiThu, { userId }, guiThuPhanHoi);
	}

	private hong<T>(duong: string, ket: Hong, loi?: string): KetCauNoi<T> {
		this.logger.warn({
			message: "Zalo bridge call failed",
			duong,
			...ket,
			loi,
		});
		return { ok: false, ...ket };
	}

	private async goi<T>(
		duong: string,
		than: DatBotYeuCau | { userId: string },
		schema: z.ZodType<T>,
	): Promise<KetCauNoi<T>> {
		const cau = bridge();
		if (!cau) return this.hong(duong, { nguyenNhan: "thieu-cau-noi" });
		let res: Response;
		try {
			res = await fetch(cau.url(duong), {
				method: "POST",
				headers: {
					authorization: `Bearer ${cau.secret}`,
					"content-type": "application/json",
				},
				body: JSON.stringify(than),
				signal: AbortSignal.timeout(ZALO_API.cauNoi.timeoutMs),
			});
		} catch (loi) {
			return this.hong(
				duong,
				{ nguyenNhan: "khong-toi-duoc" },
				loi instanceof Error ? loi.name : "khong-ro",
			);
		}
		if (res.status === ZALO_API.cauNoi.chuaQuyen) {
			return this.hong(duong, { nguyenNhan: "sai-khoa", status: res.status });
		}
		if (!res.ok) {
			return this.hong(duong, { nguyenNhan: "tac-tu-loi", status: res.status });
		}
		let thanPhanHoi: unknown;
		try {
			thanPhanHoi = await res.json();
		} catch (loi) {
			if (loi instanceof SyntaxError) {
				return this.hong(duong, { nguyenNhan: "sai-khuon" }, "khong-phai-json");
			}
			return this.hong(
				duong,
				{ nguyenNhan: "khong-toi-duoc" },
				loi instanceof Error ? loi.name : "khong-ro",
			);
		}
		const ket = schema.safeParse(thanPhanHoi);
		if (!ket.success) {
			return this.hong(
				duong,
				{ nguyenNhan: "sai-khuon" },
				ket.error.issues.map((i) => i.path.join(".")).join(","),
			);
		}
		return { ok: true, data: ket.data };
	}
}
