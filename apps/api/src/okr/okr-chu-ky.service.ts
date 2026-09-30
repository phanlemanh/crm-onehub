import type { Db, OkrCycleModel as OkrCycle, Prisma } from "@crm/db";
import { tinhTrangGiu } from "@crm/db/okr-chu-ky-hien";
import {
	type GoChuKyInput,
	type HienChuKyInput,
	LOAI_CHU_KY,
	PHA_CHU_KY,
	type SuaChuKyInput,
	type TinhTrangChuKy,
	viecChuKy,
} from "@crm/validation/okr-chu-ky";
import type { AnChuKyInput } from "@crm/validation/okr-khep";
import type { OkrVetSnapshot } from "@crm/validation/okr-vet";
import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import { MOC_SAU_KHOA_CHU_KY, type MocSauKhoa } from "./dong-ho";
import { ngay, OkrService, toDate } from "./okr.service";
import { OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
const C = T.chuKy;
type Tx = Prisma.TransactionClient;

const loaiChuKy = z.enum(LOAI_CHU_KY);
const phaChuKy = z.enum(PHA_CHU_KY);

const O_SUA = [
	"name",
	"startsOn",
	"endsOn",
	"breakStartsOn",
	"breakEndsOn",
	"updateWeekday",
] as const;

type OSua = (typeof O_SUA)[number];
type AnhSua = Pick<SuaChuKyInput, OSua>;

function anhSua(c: OkrCycle): AnhSua {
	return {
		name: c.name,
		startsOn: ngay(c.startsOn),
		endsOn: ngay(c.endsOn),
		breakStartsOn: c.breakStartsOn ? ngay(c.breakStartsOn) : null,
		breakEndsOn: c.breakEndsOn ? ngay(c.breakEndsOn) : null,
		updateWeekday: c.updateWeekday,
	};
}

function chiKhoa(a: AnhSua, khoa: readonly OSua[]): OkrVetSnapshot {
	return Object.fromEntries(khoa.map((k) => [k, a[k]]));
}

const chongNgay = (
	a: { startsOn: string; endsOn: string },
	b: { startsOn: Date; endsOn: Date },
) => ngay(b.startsOn) <= a.endsOn && a.startsOn <= ngay(b.endsOn);

export type KhoaChuKy = {
	c: OkrCycle;
	cha: OkrCycle | null;
	anhEm: OkrCycle[];
};

@Injectable()
export class OkrChuKyService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(MOC_SAU_KHOA_CHU_KY) private readonly moc: MocSauKhoa,
	) {}

	async khoaChuKy(tx: Tx, id: string): Promise<KhoaChuKy> {
		const dau = await tx.okrCycle.findUnique({
			where: { id },
			select: { parentId: true },
		});
		if (!dau) throw new NotFoundException(T.khongCoChuKy(id));
		await this.okr.khoaHoNam(tx, dau.parentId ?? id);
		await this.moc("khoa", id);
		const c = await tx.okrCycle.findUnique({ where: { id } });
		if (!c) throw new NotFoundException(T.khongCoChuKy(id));
		const cha =
			c.parentId === null
				? null
				: await tx.okrCycle.findUnique({ where: { id: c.parentId } });
		const anhEm =
			c.parentId === null
				? []
				: await tx.okrCycle.findMany({
						where: { parentId: c.parentId, id: { not: id } },
						orderBy: { id: "asc" },
					});
		return { c, cha, anhEm };
	}

	private async tinhTrang(tx: Tx, c: OkrCycle): Promise<TinhTrangChuKy> {
		const giu = (await tinhTrangGiu(tx, [c.id])).get(c.id);
		if (!giu) throw new NotFoundException(T.khongCoChuKy(c.id));
		return {
			phase: phaChuKy.parse(c.phase),
			kind: loaiChuKy.parse(c.kind),
			trong: giu.trong,
			daAn: c.anLuc !== null,
			quyConHien: giu.quyConHien,
		};
	}

	async suaChuKy(userId: string, input: SuaChuKyInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const { c, cha, anhEm } = await this.khoaChuKy(tx, input.id);
			const viec = viecChuKy(await this.tinhTrang(tx, c));
			if (!viec.suaTen)
				throw new BadRequestException(
					c.anLuc === null ? C.daDongKhongSua : C.daAnKhongSua,
				);
			const cu = anhSua(c);
			const moi: AnhSua = {
				name: input.name,
				startsOn: input.startsOn,
				endsOn: input.endsOn,
				breakStartsOn: input.breakStartsOn,
				breakEndsOn: input.breakEndsOn,
				updateWeekday: input.updateWeekday,
			};
			const doi = O_SUA.filter((k) => cu[k] !== moi[k]);
			if (!viec.suaMoiO && doi.some((k) => k !== "name"))
				throw new BadRequestException(C.chiSuaTen);
			if (doi.length === 0) return { id: c.id, canhBao: null };
			if (cha && (doi.includes("startsOn") || doi.includes("endsOn"))) {
				if (moi.startsOn < ngay(cha.startsOn) || moi.endsOn > ngay(cha.endsOn))
					throw new BadRequestException(T.quyNgoaiNam);
				const chong = anhEm.find((q) => q.anLuc === null && chongNgay(moi, q));
				if (chong) throw new BadRequestException(T.quyChong(chong.name));
			}
			await tx.okrCycle.update({
				where: { id: c.id },
				data: {
					name: moi.name,
					startsOn: toDate(moi.startsOn),
					endsOn: toDate(moi.endsOn),
					breakStartsOn: moi.breakStartsOn ? toDate(moi.breakStartsOn) : null,
					breakEndsOn: moi.breakEndsOn ? toDate(moi.breakEndsOn) : null,
					updateWeekday: moi.updateWeekday,
				},
			});
			await this.okr.vet(
				tx,
				userId,
				"sua-chu-ky",
				{ cycleId: c.id },
				chiKhoa(cu, doi),
				chiKhoa(moi, doi),
			);
			return { id: c.id, canhBao: null };
		});
	}

	async goChuKy(userId: string, input: GoChuKyInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const { c } = await this.khoaChuKy(tx, input.id);
			const viec = viecChuKy(await this.tinhTrang(tx, c));
			if (!viec.go) throw new BadRequestException(C.khongTrong);
			await tx.okrCycle.delete({ where: { id: c.id } });
			await this.okr.vet(
				tx,
				userId,
				"go-chu-ky",
				{ cycleId: c.id },
				{
					name: c.name,
					kind: c.kind,
					startsOn: ngay(c.startsOn),
					endsOn: ngay(c.endsOn),
					phase: c.phase,
				},
				null,
			);
			return { id: c.id, canhBao: null };
		});
	}

	async anChuKy(userId: string, input: AnChuKyInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const { c } = await this.khoaChuKy(tx, input.id);
			const t = await this.tinhTrang(tx, c);
			if (!viecChuKy(t).an)
				throw new BadRequestException(
					t.daAn ? C.daAn : t.trong ? C.trongThiGo : C.conQuyHien(t.quyConHien),
				);
			const anLuc = new Date();
			await tx.okrCycle.update({ where: { id: c.id }, data: { anLuc } });
			await this.okr.vet(
				tx,
				userId,
				"an-chu-ky",
				{ cycleId: c.id },
				{ anLuc: null },
				{ anLuc: anLuc.toISOString() },
				input.lyDo,
			);
			return { id: c.id, canhBao: null };
		});
	}

	async hienChuKy(userId: string, input: HienChuKyInput) {
		await this.quyenOkr.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const { c, cha, anhEm } = await this.khoaChuKy(tx, input.id);
			if (!viecChuKy(await this.tinhTrang(tx, c)).hienLai)
				throw new BadRequestException(C.chuaAn);
			if (cha && cha.anLuc !== null)
				throw new BadRequestException(C.namChaDaAn);
			const chong = anhEm.find(
				(q) => q.anLuc === null && chongNgay(anhSua(c), q),
			);
			if (chong) throw new BadRequestException(C.hienLaiChong(chong.name));
			await tx.okrCycle.update({ where: { id: c.id }, data: { anLuc: null } });
			await this.okr.vet(
				tx,
				userId,
				"hien-chu-ky",
				{ cycleId: c.id },
				{ anLuc: c.anLuc ? c.anLuc.toISOString() : null },
				{ anLuc: null },
			);
			return { id: c.id, canhBao: null };
		});
	}
}
