import type { Db } from "@crm/db";
import { chiTieuThang, doiSoatGanNhat, thangVN } from "@crm/db/ai-chi-phi";
import {
	NHOM_CUA_TINH_NANG,
	NHOM_VIEC_AI,
	TINH_NANG,
} from "@crm/db/ai-chi-phi-danh-muc";
import { cauHinhAiLuc, troLyOkrSanSang } from "@crm/db/okr-tro-ly";
import { Inject, Injectable } from "@nestjs/common";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import type { AiChiTieuOutput } from "./okr.contracts";
import { OkrAccessService } from "./okr-access.service";

const SAU_SO = 1e6;

const tron = (usd: number) => Math.round(usd * SAU_SO) / SAU_SO;

@Injectable()
export class TroLyOkrService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(AgentTriggerService) private readonly trigger: AgentTriggerService,
	) {}

	async aiChiTieu(userId: string, now = new Date()): Promise<AiChiTieuOutput> {
		await this.quyenOkr.assertQuanTri(userId);
		const thang = thangVN(now);
		const [chi, cauHinh, sanSang, dangKiem, doiSoat] = await Promise.all([
			chiTieuThang(this.db, thang, now),
			cauHinhAiLuc(this.db, now),
			troLyOkrSanSang(this.db, {
				viec: "de-xuat",
				now,
				coTacTu: this.trigger.canReachAgent(),
			}),
			this.db.agentTask.count({
				where: { kind: "okr-kiem-san-sang", finishedAt: null },
			}),
			doiSoatGanNhat(this.db, now),
		]);
		const theoNhom = NHOM_VIEC_AI.map((nhom) => {
			const cua = TINH_NANG.filter((t) => NHOM_CUA_TINH_NANG[t] === nhom);
			return {
				nhom,
				soBuoc: cua.reduce((s, t) => s + chi.theoTinhNang[t].soBuoc, 0),
				usd: tron(cua.reduce((s, t) => s + chi.theoTinhNang[t].usd, 0)),
			};
		});
		const tranUsd = cauHinh.aiTranThangUsd;
		return {
			thang,
			theoNhom,
			tongUsd: tron(chi.tongUsd),
			troLyOkr: {
				chiUsd: tron(chi.troLyOkrUsd),
				tranUsd,
				phanTram: Math.round((chi.troLyOkrUsd / tranUsd) * 100),
			},
			sanSang,
			dangKiem: dangKiem > 0,
			doiSoat,
		};
	}
}
