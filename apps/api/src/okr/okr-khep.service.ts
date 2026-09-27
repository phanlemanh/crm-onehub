import type { Db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { MoRaInput } from "@crm/validation/okr-khep";
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { ngayLuu } from "./khep";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;

@Injectable()
export class OkrKhepService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
	) {}

	async moRa(userId: string, input: MoRaInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${input.cycleId} FOR UPDATE`;
			await this.okr.assertKyGhiDuoc(tx, input.cycleId);
			const c = await tx.okrCycle.findUniqueOrThrow({
				where: { id: input.cycleId },
			});
			if (c.phase !== "dang-chay")
				throw new BadRequestException(T.khep.raChiKhiDangChay);
			if (input.tuNgay < ngayVN(c.startsOn) || input.denNgay > ngayVN(c.endsOn))
				throw new BadRequestException(T.khep.raNgoaiKy);
			const chong = await tx.okrCuaSoRa.findFirst({
				where: {
					cycleId: c.id,
					dongLuc: null,
					tuNgay: { lte: ngayLuu(input.denNgay) },
					denNgay: { gte: ngayLuu(input.tuNgay) },
				},
			});
			if (chong) throw new BadRequestException(T.khep.raChong);
			const r = await tx.okrCuaSoRa.create({
				data: {
					cycleId: c.id,
					tuNgay: ngayLuu(input.tuNgay),
					denNgay: ngayLuu(input.denNgay),
					moBoiUserId: userId,
				},
			});
			await this.okr.vet(tx, userId, "mo-ra", { cycleId: c.id }, null, {
				tuNgay: input.tuNgay,
				denNgay: input.denNgay,
			});
			return { id: r.id, canhBao: null };
		});
	}

	async dongRa(userId: string, id: string) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const r = await tx.okrCuaSoRa.findUnique({ where: { id } });
			if (!r) throw new NotFoundException(T.khep.khongCoCuaSoRa(id));
			await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${r.cycleId} FOR UPDATE`;
			await this.okr.assertKyGhiDuoc(tx, r.cycleId);
			const dongLuc = new Date();
			const { count } = await tx.okrCuaSoRa.updateMany({
				where: { id, dongLuc: null },
				data: { dongLuc, dongBoiUserId: userId },
			});
			if (count === 0) throw new BadRequestException(T.khep.raDaDong);
			await this.okr.vet(
				tx,
				userId,
				"dong-ra",
				{ cycleId: r.cycleId },
				{ tuNgay: ngayVN(r.tuNgay), denNgay: ngayVN(r.denNgay) },
				{ dongLuc: dongLuc.toISOString() },
			);
			return { id, canhBao: null };
		});
	}
}
