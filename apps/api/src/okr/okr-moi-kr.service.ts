import type { Db } from "@crm/db";
import { Inject, Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { CAP_CONG_TY, cayDonVi, dongCuaMucTieu, locDongMoiKr } from "./moi-kr";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import type { MoiKrInput, MoiKrOutput } from "./okr-moi-kr.contracts";

@Injectable()
export class OkrMoiKrService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	async moiKr(userId: string, input: MoiKrInput): Promise<MoiKrOutput> {
		const q = await this.quyenOkr.quyen(userId);
		const mts = await this.okr.docMucTieu(
			this.db,
			{
				cycleId: input.cycleId,
				status: "cong-bo",
				level: { in: [...CAP_CONG_TY] },
			},
			userId,
			q,
			{ nguCanh: this.quyenOkr.nguCanhXem(q, userId) },
		);
		return locDongMoiKr(dongCuaMucTieu(mts), input.loc, cayDonVi(q.cay));
	}
}
