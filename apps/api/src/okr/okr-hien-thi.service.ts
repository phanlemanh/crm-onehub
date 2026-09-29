import type { Db } from "@crm/db";
import {
	type DatHienThiInput,
	MUC_HIEN_THI,
} from "@crm/validation/okr-hien-thi";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type { DatHienThiOutput } from "./okr.contracts";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
const mucHienThi = z.enum(MUC_HIEN_THI);

@Injectable()
export class OkrHienThiService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	async datHienThi(
		userId: string,
		input: DatHienThiInput,
	): Promise<DatHienThiOutput> {
		const mt = await this.quyenOkr.assertSuaMucTieu(userId, input.objectiveId);
		const nguoiXem = [...new Set(input.nguoiXem)].sort();
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, mt.cycleId);
			await tx.$queryRaw`SELECT id FROM "okrObjective" WHERE id = ${mt.id} FOR UPDATE`;
			const cu = await tx.okrObjective.findUniqueOrThrow({
				where: { id: mt.id },
				select: {
					status: true,
					hienThi: true,
					nguoiXem: { select: { userId: true } },
				},
			});
			if (cu.status === "cho-duyet")
				throw new BadRequestException(T.dangChoDuyet);
			if (cu.status === "da-bo") throw new BadRequestException(T.daBo);
			await this.okr.assertThanhVien(
				tx,
				nguoiXem,
				() => T.hienThi.nguoiXemKhongConThanhVien,
			);
			if (input.hienThi === "gioi-han") {
				const canChinh = await tx.okrAlignment.count({
					where: {
						OR: [
							{ objectiveId: mt.id },
							{ targetObjectiveId: mt.id },
							{ targetKeyResult: { objectiveId: mt.id } },
						],
					},
				});
				if (canChinh > 0)
					throw new BadRequestException(T.hienThi.conCanChinh(canChinh));
			}
			const cuXem = cu.nguoiXem.map((x) => x.userId).sort();
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: {
					hienThi: input.hienThi,
					nguoiXem: {
						deleteMany: { userId: { notIn: nguoiXem } },
						createMany: {
							data: nguoiXem
								.filter((u) => !cuXem.includes(u))
								.map((u) => ({ userId: u, createdById: userId })),
							skipDuplicates: true,
						},
					},
				},
			});
			await this.okr.vet(
				tx,
				userId,
				"doi-hien-thi",
				{ objectiveId: mt.id },
				{ hienThi: mucHienThi.parse(cu.hienThi), nguoiXem: cuXem },
				{ hienThi: input.hienThi, nguoiXem },
			);
			return { id: mt.id, hienThi: input.hienThi, nguoiXem };
		});
	}
}
