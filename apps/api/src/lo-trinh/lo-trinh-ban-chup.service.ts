import type { Db } from "@crm/db";
import type { BanChupVao } from "@crm/validation/ban-chup-lo-trinh";
import { Injectable, Logger } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import {
	ghiBanChupVaBaoTinHieu,
	type KetQuaGhiVaBao,
	type TuyChonDoiCho,
} from "./tin-hieu-doi-cho";

@Injectable()
export class LoTrinhBanChupService {
	private readonly logger = new Logger(LoTrinhBanChupService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	ghi(
		vao: BanChupVao,
		tuyChon: Pick<TuyChonDoiCho, "ghiThongBao"> = {},
	): Promise<KetQuaGhiVaBao> {
		return ghiBanChupVaBaoTinHieu(this.db, vao, new Date(), {
			...tuyChon,
			canhBao: (o) => this.logger.warn(o),
		});
	}
}
