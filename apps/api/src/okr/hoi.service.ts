import type { Db } from "@crm/db";
import {
	chiPhiThangHoiDap,
	cuocHoiCua,
	demLuotNgay,
	ghiLuot,
	laPlaceholder,
	taoCuocHoi,
} from "@crm/db/okr-cuoc-hoi";
import { ngayVN } from "@crm/db/onboarding-nhac";
import {
	type HoiMoOutput,
	type HoiPhanHoiInput,
	type HoiPhienInput,
	type HoiPhienOutput,
	type HoiTangLuotOutput,
	OKR_HOI_TRAN,
} from "@crm/validation/okr-tra-loi";
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { OKR } from "./okr-config";

@Injectable()
export class HoiService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async mo(userId: string): Promise<HoiMoOutput> {
		const c = await taoCuocHoi(this.db, userId);
		return { cuocHoiId: c.id };
	}

	async tangLuot(
		userId: string,
		cuocHoiId: string,
		now = new Date(),
	): Promise<HoiTangLuotOutput> {
		const cuoc = await cuocHoiCua(this.db, cuocHoiId);
		if (!cuoc || cuoc.nguoiHoiUserId !== userId)
			throw new ForbiddenException("cuoc-khong-thuoc");
		const ngay = ngayVN(now);
		if ((await demLuotNgay(this.db, userId, ngay)) >= OKR_HOI_TRAN.cauMoiNgay)
			return { ok: false, lyDo: "het-luot-ngay" };
		if ((await chiPhiThangHoiDap(this.db, now)) >= OKR_HOI_TRAN.usdMoiThang)
			return { ok: false, lyDo: "het-tran-thang" };
		await ghiLuot(this.db, { cuocHoiId, userId, ngay });
		return { ok: true };
	}

	async phien(userId: string, input: HoiPhienInput): Promise<HoiPhienOutput> {
		const cuoc = await cuocHoiCua(this.db, input.cuocHoiId);
		if (!cuoc || cuoc.nguoiHoiUserId !== userId)
			throw new NotFoundException(OKR.thongDiep.hoi.khongCoCuoc);
		return { phien: laPlaceholder(cuoc.sessionId) ? null : cuoc.sessionId };
	}

	async phanHoi(
		userId: string,
		input: HoiPhanHoiInput,
		now = new Date(),
	): Promise<{ ok: true }> {
		const cuoc = await cuocHoiCua(this.db, input.cuocHoiId);
		if (!cuoc || cuoc.nguoiHoiUserId !== userId)
			throw new ForbiddenException("cuoc-khong-thuoc");
		const khoa = {
			cuocHoiId: input.cuocHoiId,
			maTraLoi: input.maTraLoi,
			userId,
		};
		await this.db.okrHoiPhanHoi.upsert({
			where: { cuocHoiId_maTraLoi_userId: khoa },
			create: { ...khoa, huuIch: input.huuIch, luc: now },
			update: { huuIch: input.huuIch, luc: now },
		});
		return { ok: true };
	}
}
