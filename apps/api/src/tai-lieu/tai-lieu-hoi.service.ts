import type { Db } from "@crm/db";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { demHoiTrongNgay, demHoiTrongThang } from "@crm/db/tai-lieu-hoi";
import {
	LY_DO_LOI,
	parseGanNhat,
	parseTraLoi,
	TAI_LIEU_HOI,
} from "@crm/validation/tai-lieu-hoi";
import {
	KHONG_TRONG_PHAM_VI,
	laVaiChiOkr,
} from "@crm/validation/vai-workspace";
import {
	ForbiddenException,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import type { NguoiGoi } from "./quyen";
import { TAI_LIEU_API } from "./tai-lieu-config";
import type {
	TaiLieuHoiInput,
	TaiLieuHoiKetQuaOutput,
	TaiLieuHoiOutput,
} from "./tai-lieu-hoi.contracts";

const lyDoLoi = z.enum(LY_DO_LOI);

function dien(mau: string, so: number): string {
	return mau.replace("{so}", String(so));
}

export function chanVaiChiOkr(nguoi: NguoiGoi): void {
	if (laVaiChiOkr(nguoi.role))
		throw new ForbiddenException(KHONG_TRONG_PHAM_VI);
}

@Injectable()
export class TaiLieuHoiService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(AgentTriggerService) private readonly trigger: AgentTriggerService,
	) {}

	async hoi(
		nguoi: NguoiGoi,
		input: TaiLieuHoiInput,
	): Promise<TaiLieuHoiOutput> {
		chanVaiChiOkr(nguoi);
		const now = new Date();
		const hoiId = await this.db.$transaction(async (tx) => {
			await lockIdempotencyKey(tx, `${TAI_LIEU_API.khoaHoi}${nguoi.id}`);
			const ngay = await demHoiTrongNgay(tx, nguoi.id, now);
			if (ngay >= TAI_LIEU_HOI.tran.ngay)
				throw new HttpException(
					dien(TAI_LIEU_HOI.tranNgay, TAI_LIEU_HOI.tran.ngay),
					HttpStatus.TOO_MANY_REQUESTS,
				);
			const thang = await demHoiTrongThang(tx, now);
			if (thang >= TAI_LIEU_HOI.tran.thang)
				throw new HttpException(
					dien(TAI_LIEU_HOI.tranThang, TAI_LIEU_HOI.tran.thang),
					HttpStatus.TOO_MANY_REQUESTS,
				);
			const hang = await tx.taiLieuHoi.create({
				data: { nguoiHoiId: nguoi.id, kenh: "CRM", cauHoi: input.cauHoi },
				select: { id: true },
			});
			await this.trigger.hoiKho(hang.id, tx);
			return hang.id;
		});
		this.trigger.danhThucHoiKho();
		return { hoiId };
	}

	async ketQua(
		nguoi: NguoiGoi,
		hoiId: string,
	): Promise<TaiLieuHoiKetQuaOutput> {
		chanVaiChiOkr(nguoi);
		const hang = await this.db.taiLieuHoi.findFirst({
			where: { id: hoiId, nguoiHoiId: nguoi.id },
			select: { trangThai: true, traLoi: true, ganNhat: true, lyDo: true },
		});
		if (!hang) throw new NotFoundException(TAI_LIEU_API.thongDiep.khongCo);
		if (hang.trangThai === "TRA_LOI")
			return { trangThai: "TRA_LOI", traLoi: parseTraLoi(hang.traLoi) };
		if (hang.trangThai === "TU_CHOI")
			return {
				trangThai: "TU_CHOI",
				ganNhat: parseGanNhat(hang.ganNhat ?? []),
			};
		if (hang.trangThai === "LOI")
			return { trangThai: "LOI", lyDo: lyDoLoi.parse(hang.lyDo) };
		return { trangThai: "DANG_HOI" };
	}
}
