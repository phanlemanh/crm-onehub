import type { Db, Prisma } from "@crm/db";
import { type KrInput, kiemSoTheoKieu, krInput } from "@crm/validation/okr-kr";
import {
	CAP_MAU,
	type CapMau,
	type LuuMauInput,
	type MauKr,
	type MauNoiDung,
	parseMauNoiDung,
	type TaoTuMauInput,
} from "@crm/validation/okr-mau";
import { mucTieuInput } from "@crm/validation/okr-muc-tieu";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { type ZodError, z } from "zod";
import { InjectDatabase } from "../database/database.constants";
import type { MauInput, MauOutput } from "./okr.contracts";
import { donViCua, OkrService } from "./okr.service";
import {
	type DonViCuaMucTieu,
	OkrAccessService,
	type Quyen,
} from "./okr-access.service";
import { OKR } from "./okr-config";

const T = OKR.thongDiep;
type Tx = Prisma.TransactionClient;
type KrVao = TaoTuMauInput["krs"][number];

const capMau = z.enum(CAP_MAU);

const chonMau = {
	id: true,
	ten: true,
	cap: true,
	donViIds: true,
	noiDung: true,
	archivedAt: true,
} as const;

function cauZod(loi: ZodError): string {
	return loi.issues
		.map((i) => `${i.path.map(String).join(".")}: ${i.message}.`)
		.join(" ");
}

type SoKr = Pick<KrInput, "startValue" | "targetValue">;

function soCua(thu: number, mau: MauKr, vao: KrVao): SoKr {
	if (mau.kind === "moc") return OKR.mau.moc;
	const { startValue, targetValue } = vao;
	if (startValue === null)
		throw new BadRequestException(T.mau.thieuSo(thu, mau.title, "khởi điểm"));
	if (targetValue === null)
		throw new BadRequestException(T.mau.thieuSo(thu, mau.title, "đích"));
	return { startValue, targetValue };
}

function krTuMau(thu: number, mau: MauKr, vao: KrVao): KrInput {
	const so = soCua(thu, mau, vao);
	const r = krInput.safeParse({
		title: mau.title,
		kind: mau.kind,
		ownerUserId: vao.ownerUserId,
		startValue: so.startValue,
		targetValue: so.targetValue,
		currentValue: so.startValue,
		unit: mau.unit,
		dueOn: null,
		weight: OKR.mau.trongSoKr,
	});
	if (!r.success)
		throw new BadRequestException(
			T.mau.krHong(thu, mau.title, cauZod(r.error)),
		);
	const loi = kiemSoTheoKieu(
		r.data.kind,
		r.data.startValue,
		r.data.targetValue,
	);
	if (loi)
		throw new BadRequestException(
			T.mau.krHong(thu, mau.title, T.soTheoKieu[loi]),
		);
	return r.data;
}

@Injectable()
export class OkrMauService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrService) private readonly okr: OkrService,
		@Inject(OkrAccessService) private readonly access: OkrAccessService,
	) {}

	async mau(userId: string, input: MauInput): Promise<MauOutput> {
		const quanTri = await this.access.quanTriChuongTrinh(userId);
		const moiMau =
			quanTri && input.cap === undefined && input.donViId === undefined;
		const rows = await this.db.okrMau.findMany({
			where: moiMau
				? {}
				: {
						archivedAt: null,
						cap: input.cap,
						OR:
							input.donViId === undefined
								? undefined
								: [
										{ donViIds: { isEmpty: true } },
										{ donViIds: { has: input.donViId } },
									],
					},
			orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			select: { ...chonMau, _count: { select: { mucTieu: true } } },
		});
		return {
			quanTri,
			mau: rows.map((r) => {
				const noiDung = parseMauNoiDung(r.noiDung);
				return {
					id: r.id,
					ten: r.ten,
					cap: capMau.parse(r.cap),
					donViIds: r.donViIds,
					soKr: noiDung.krs.length,
					daDung: r._count.mucTieu,
					luuTru: r.archivedAt !== null,
					noiDung,
				};
			}),
		};
	}

	private async assertQuanTri(userId: string) {
		if (!(await this.access.quanTriChuongTrinh(userId)))
			throw new ForbiddenException(T.mau.canQuanTri);
	}

	private async donViMau(tx: Tx, cap: CapMau, ids: string[]) {
		const can = [...new Set(ids)];
		if (can.length === 0) return can;
		const chon = { id: true, name: true, archivedAt: true } as const;
		const where = { id: { in: can } };
		const co =
			cap === "bo-phan"
				? await tx.division.findMany({ where, select: chon })
				: await tx.department.findMany({ where, select: chon });
		const theoId = new Map(co.map((d) => [d.id, d]));
		for (const id of can) {
			const dv = theoId.get(id);
			if (!dv) throw new BadRequestException(T.khongCoDonVi(id));
			if (dv.archivedAt !== null)
				throw new BadRequestException(T.mau.donViDaLuuTru(dv.name));
		}
		return can;
	}

	private async mauCo(tx: Tx, id: string) {
		const row = await tx.okrMau.findUnique({ where: { id }, select: chonMau });
		if (!row) throw new NotFoundException(T.mau.khongCoMau(id));
		return {
			...row,
			cap: capMau.parse(row.cap),
			noiDung: parseMauNoiDung(row.noiDung),
		};
	}

	async luuMau(userId: string, input: LuuMauInput) {
		await this.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const donViIds = await this.donViMau(tx, input.cap, input.donViIds);
			const data = {
				ten: input.ten,
				cap: input.cap,
				donViIds,
				noiDung: input.noiDung,
			};
			if (input.id === null) {
				const moi = await tx.okrMau.create({
					data: { ...data, taoBoiUserId: userId },
				});
				await this.okr.vet(tx, userId, "sua-mau", {}, null, {
					mauId: moi.id,
					ten: moi.ten,
				});
				return { id: moi.id, canhBao: null };
			}
			const cu = await this.mauCo(tx, input.id);
			await tx.okrMau.update({ where: { id: cu.id }, data });
			await this.okr.vet(
				tx,
				userId,
				"sua-mau",
				{},
				{ mauId: cu.id, ten: cu.ten },
				{ mauId: cu.id, ten: input.ten },
			);
			return { id: cu.id, canhBao: null };
		});
	}

	private async doiLuuTru(userId: string, id: string, luuTru: boolean) {
		await this.assertQuanTri(userId);
		return this.db.$transaction(async (tx) => {
			const cu = await this.mauCo(tx, id);
			if ((cu.archivedAt !== null) === luuTru) return { id, canhBao: null };
			await tx.okrMau.update({
				where: { id },
				data: { archivedAt: luuTru ? new Date() : null },
			});
			await this.okr.vet(
				tx,
				userId,
				"sua-mau",
				{},
				{ mauId: id, ten: cu.ten, luuTru: !luuTru },
				{ mauId: id, ten: cu.ten, luuTru },
			);
			return { id, canhBao: null };
		});
	}

	luuTruMau(userId: string, id: string) {
		return this.doiLuuTru(userId, id, true);
	}

	khoiPhucMau(userId: string, id: string) {
		return this.doiLuuTru(userId, id, false);
	}

	private assertApDung(
		mau: { cap: CapMau; donViIds: string[] },
		dv: DonViCuaMucTieu,
		q: Quyen,
	) {
		if (mau.cap !== dv.level) throw new BadRequestException(T.mau.khacCap);
		if (mau.donViIds.length === 0) return;
		const donVi =
			dv.level === "bo-phan"
				? dv.divisionId
				: dv.level === "phong-ban"
					? dv.departmentId
					: dv.personUserId === null
						? null
						: (q.phongBanChinh.get(dv.personUserId) ?? null);
		if (donVi === null || !mau.donViIds.includes(donVi))
			throw new BadRequestException(T.mau.khongApDung);
	}

	private mucTieuTuMau(input: TaoTuMauInput, noiDung: MauNoiDung) {
		const r = mucTieuInput.safeParse({
			cycleId: input.cycleId,
			unit: input.unit,
			title: noiDung.cauMucTieu,
			kind: noiDung.loai,
			ownerUserId: input.ownerUserId,
			participantIds: [],
			whyNow: "",
		});
		if (!r.success)
			throw new BadRequestException(T.mau.mucTieuHong(cauZod(r.error)));
		return r.data;
	}

	async taoTuMau(userId: string, input: TaoTuMauInput) {
		const dv = donViCua(input.unit);
		const q = await this.access.assertNhapDuoc(userId, dv);
		return this.db.$transaction(async (tx) => {
			await this.okr.assertKyGhiDuoc(tx, input.cycleId);
			const mau = await this.mauCo(tx, input.mauId);
			if (mau.archivedAt !== null)
				throw new BadRequestException(T.mau.daLuuTru);
			this.assertApDung(mau, dv, q);
			const ct = await this.okr.program(tx);
			if (dv.level === "ca-nhan" && !ct.personalOn)
				throw new BadRequestException(T.caNhanTat);
			const mt = this.mucTieuTuMau(input, mau.noiDung);
			const krMau = mau.noiDung.krs;
			if (input.krs.length !== krMau.length)
				throw new BadRequestException(T.mau.soKrKhac(krMau.length));
			await this.okr.assertThanhVien(tx, [
				mt.ownerUserId,
				...input.krs.map((k) => k.ownerUserId),
				...(dv.personUserId ? [dv.personUserId] : []),
			]);
			const canhBaoMucTieu = await this.okr.kiemTranMucTieu(
				tx,
				mt.cycleId,
				dv,
				1,
			);
			const viTri = await tx.okrObjective.count({
				where: { cycleId: mt.cycleId },
			});
			const objective = await tx.okrObjective.create({
				data: {
					cycleId: mt.cycleId,
					...dv,
					ownerUserId: mt.ownerUserId,
					kind: mt.kind,
					title: mt.title,
					whyNow: mt.whyNow,
					position: viTri,
				},
			});
			const canhBaoKr = this.okr.kiemTranKr(ct, 0, krMau.length);
			for (const [i, vao] of input.krs.entries()) {
				const mauKr = krMau[i];
				if (mauKr === undefined)
					throw new BadRequestException(T.mau.soKrKhac(krMau.length));
				const kr = krTuMau(i + 1, mauKr, vao);
				const taoRa = await tx.okrKeyResult.create({
					data: {
						objectiveId: objective.id,
						title: kr.title,
						kind: kr.kind,
						ownerUserId: kr.ownerUserId,
						startValue: kr.startValue,
						targetValue: kr.targetValue,
						currentValue: kr.currentValue,
						unit: kr.unit,
						dueOn: null,
						weight: kr.weight,
						position: i,
					},
				});
				await this.okr.vet(
					tx,
					userId,
					"tao-kr",
					{ objectiveId: objective.id, keyResultId: taoRa.id },
					null,
					{
						title: taoRa.title,
						kind: taoRa.kind,
						startValue: kr.startValue,
						targetValue: kr.targetValue,
					},
				);
			}
			await tx.okrMucTieuTuMau.create({
				data: { objectiveId: objective.id, mauId: mau.id },
			});
			await this.okr.vet(
				tx,
				userId,
				"tao",
				{ objectiveId: objective.id, cycleId: objective.cycleId },
				null,
				{
					title: objective.title,
					kind: objective.kind,
					level: objective.level,
					status: objective.status,
					tuMau: mau.id,
				},
			);
			const canhBao = [canhBaoMucTieu, canhBaoKr].filter(
				(c): c is string => c !== null,
			);
			return {
				id: objective.id,
				canhBao: canhBao.length === 0 ? null : canhBao.join(" "),
			};
		});
	}
}
