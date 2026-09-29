import type { Db } from "@crm/db";
import type { TraLaiInput } from "@crm/validation/okr-hien-thi";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { OkrService } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
const CHO_DUYET = "cho-duyet";
const NHAP = "nhap";

@Injectable()
export class OkrDuyetService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
	) {}

	async guiDuyet(userId: string, id: string) {
		const { mt } = await this.quyenOkr.assertSuaMucTieuCoQuyen(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, mt.cycleId);
			const trangThai = await this.okr.khoaMucTieu(tx, mt.id);
			if (trangThai === CHO_DUYET)
				throw new BadRequestException(T.dangChoDuyet);
			if (trangThai !== NHAP)
				throw new BadRequestException(T.duyet.chiGuiTuNhap);
			const ct = await this.okr.program(tx);
			if (!ct.duyetCongBo || mt.level === "onehub")
				throw new BadRequestException(T.duyet.khongCanDuyet);
			if (
				(await tx.okrKeyResult.count({ where: { objectiveId: mt.id } })) === 0
			)
				throw new BadRequestException(T.duyet.guiCanKr);
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: { status: CHO_DUYET },
			});
			await this.okr.vet(
				tx,
				userId,
				"gui-duyet",
				{ objectiveId: mt.id },
				{ status: NHAP },
				{ status: CHO_DUYET },
			);
			return { id: mt.id, canhBao: null };
		});
	}

	private async assertDuyetDuoc(userId: string, id: string) {
		const { q, mt } = await this.quyenOkr.assertXemMucTieu(userId, id);
		if (!this.quyenOkr.duyetDuoc(q, userId, mt))
			throw new ForbiddenException(T.duyet.khongDuyetDuoc);
		return mt;
	}

	async duyetMucTieu(userId: string, id: string) {
		const mt = await this.assertDuyetDuoc(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, mt.cycleId);
			if ((await this.okr.khoaMucTieu(tx, mt.id)) !== CHO_DUYET)
				throw new BadRequestException(T.duyet.khongConChoDuyet);
			return this.okr.congBoTrongGiaoDich(
				tx,
				userId,
				{ id: mt.id, status: CHO_DUYET },
				{ hanhDong: "duyet", tuDuyet: false },
			);
		});
	}

	async traLaiMucTieu(userId: string, input: TraLaiInput) {
		const mt = await this.assertDuyetDuoc(userId, input.objectiveId);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, mt.cycleId);
			if ((await this.okr.khoaMucTieu(tx, mt.id)) !== CHO_DUYET)
				throw new BadRequestException(T.duyet.khongConChoDuyet);
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: { status: NHAP },
			});
			await this.okr.vet(
				tx,
				userId,
				"tra-lai",
				{ objectiveId: mt.id },
				{ status: CHO_DUYET },
				{ status: NHAP },
				input.lyDo,
			);
			return { id: mt.id, canhBao: null };
		});
	}

	async rutDuyet(userId: string, id: string) {
		const { mt } = await this.quyenOkr.assertXemMucTieu(userId, id);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, mt.cycleId);
			if ((await this.okr.khoaMucTieu(tx, mt.id)) !== CHO_DUYET)
				throw new BadRequestException(T.duyet.khongConChoDuyet);
			const gui = await tx.okrTrail.findFirst({
				where: { objectiveId: mt.id, action: "gui-duyet" },
				orderBy: [{ at: "desc" }, { id: "desc" }],
				select: { actorUserId: true },
			});
			if (gui?.actorUserId !== userId)
				throw new ForbiddenException(T.duyet.khongPhaiNguoiGui);
			await tx.okrObjective.update({
				where: { id: mt.id },
				data: { status: NHAP },
			});
			await this.okr.vet(
				tx,
				userId,
				"rut-duyet",
				{ objectiveId: mt.id },
				{ status: CHO_DUYET },
				{ status: NHAP },
			);
			return { id: mt.id, canhBao: null };
		});
	}
}
