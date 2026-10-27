import { type Db, Prisma } from "@crm/db";
import { tomTatCamXucCua } from "@crm/db/okr-cam-xuc";
import { dieuKienXemMucTieu, type NguCanhXem } from "@crm/db/okr-hien-thi";
import {
	LOAI_CAM_XUC,
	type NguoiThaCamXucOutput,
	type ThaCamXucInput,
	type TomTatCamXuc,
} from "@crm/validation/okr-cam-xuc";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";
import { OKR_CAM_XUC } from "./okr-xem.config";

type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0];

const MA_TRUNG = "P2002";

@Injectable()
export class OkrCamXucService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	private async lanXemDuoc(userId: string, checkInId: string) {
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		const lan = await this.db.okrCheckIn.findFirst({
			where: {
				id: checkInId,
				keyResult: { objective: dieuKienXemMucTieu(nc) },
			},
			select: {
				keyResultId: true,
				keyResult: {
					select: {
						objectiveId: true,
						objective: { select: { cycleId: true } },
					},
				},
			},
		});
		if (!lan) throw new NotFoundException(OKR.thongDiep.khongThayMucTieu);
		return { nc, lan };
	}

	tomTat(
		db: Db | Tx,
		checkInIds: readonly string[],
		nguoiXemId: string,
		nc: NguCanhXem,
	): Promise<Map<string, TomTatCamXuc>> {
		return tomTatCamXucCua(db, checkInIds, nc, {
			thuTu: LOAI_CAM_XUC,
			tenToiDa: OKR_CAM_XUC.tenToiDa,
			nguoiXemId,
		});
	}

	async thaCamXuc(
		userId: string,
		input: ThaCamXucInput,
		now = new Date(),
	): Promise<TomTatCamXuc> {
		const { nc, lan } = await this.lanXemDuoc(userId, input.checkInId);
		const objectiveId = lan.keyResult.objectiveId;
		const cycleId = lan.keyResult.objective.cycleId;
		const khoa = {
			checkInId: input.checkInId,
			userId,
			loai: input.loai,
		};
		const dich = { objectiveId, keyResultId: lan.keyResultId };
		await this.db
			.$transaction(async (tx) => {
				await this.okr.assertKyChuaAn(tx, cycleId);
				const go = await tx.okrCamXuc.deleteMany({ where: khoa });
				if (go.count > 0) {
					await this.okr.vet(
						tx,
						userId,
						"go-cam-xuc",
						dich,
						khoaVet(khoa),
						null,
					);
					return;
				}
				await tx.okrCamXuc.create({ data: { ...khoa, createdAt: now } });
				await this.okr.vet(
					tx,
					userId,
					"tha-cam-xuc",
					dich,
					null,
					khoaVet(khoa),
				);
			})
			.catch((loi) => {
				if (
					!(loi instanceof Prisma.PrismaClientKnownRequestError) ||
					loi.code !== MA_TRUNG
				)
					throw loi;
			});
		const tom = await this.tomTat(this.db, [input.checkInId], userId, nc);
		return tom.get(input.checkInId) ?? [];
	}

	async nguoiThaCamXuc(
		userId: string,
		checkInId: string,
	): Promise<NguoiThaCamXucOutput> {
		const { nc } = await this.lanXemDuoc(userId, checkInId);
		const tom = await tomTatCamXucCua(this.db, [checkInId], nc, {
			thuTu: LOAI_CAM_XUC,
			tenToiDa: Number.MAX_SAFE_INTEGER,
			nguoiXemId: userId,
		});
		return (tom.get(checkInId) ?? []).map((m) => ({
			loai: m.loai,
			nguoi: m.nguoi,
		}));
	}
}

function khoaVet(khoa: { checkInId: string; loai: string }) {
	return { checkInId: khoa.checkInId, loai: khoa.loai };
}
