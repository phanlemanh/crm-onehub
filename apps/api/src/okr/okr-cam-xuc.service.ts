import type { Db } from "@crm/db";
import { tomTatCamXucCua } from "@crm/db/okr-cam-xuc";
import type { NguCanhXem } from "@crm/db/okr-hien-thi";
import {
	LOAI_CAM_XUC,
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

const laTrung = (loi: unknown): boolean =>
	typeof loi === "object" &&
	loi !== null &&
	"code" in loi &&
	loi.code === MA_TRUNG;

@Injectable()
export class OkrCamXucService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

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
		const lan = await this.db.okrCheckIn.findUnique({
			where: { id: input.checkInId },
			select: {
				keyResultId: true,
				keyResult: { select: { objectiveId: true } },
			},
		});
		if (!lan) throw new NotFoundException(OKR.thongDiep.khongThayMucTieu);
		const objectiveId = lan.keyResult.objectiveId;
		const { nc, mt } = await this.quyenOkr.assertXemMucTieu(
			userId,
			objectiveId,
		);
		const khoa = {
			checkInId: input.checkInId,
			userId,
			loai: input.loai,
		};
		const dich = { objectiveId, keyResultId: lan.keyResultId };
		await this.db
			.$transaction(async (tx) => {
				await this.okr.assertKyChuaAn(tx, mt.cycleId);
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
			.catch((loi: unknown) => {
				if (!laTrung(loi)) throw loi;
			});
		const tom = await this.tomTat(this.db, [input.checkInId], userId, nc);
		return tom.get(input.checkInId) ?? [];
	}
}

function khoaVet(khoa: { checkInId: string; loai: string }) {
	return { checkInId: khoa.checkInId, loai: khoa.loai };
}
