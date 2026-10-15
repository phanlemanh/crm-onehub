import type { Db } from "@crm/db";
import { ghiBanChupLoTrinh } from "@crm/db/ban-chup-lo-trinh";
import type {
	BanChupVao,
	KetQuaBanChup,
} from "@crm/validation/ban-chup-lo-trinh";
import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";

@Injectable()
export class LoTrinhBanChupService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	ghi(vao: BanChupVao): Promise<KetQuaBanChup> {
		return ghiBanChupLoTrinh(this.db, vao, new Date());
	}
}
