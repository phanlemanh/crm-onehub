import type { Db, Prisma } from "@crm/db";
import { chiTieuThang, doiSoatGanNhat, thangVN } from "@crm/db/ai-chi-phi";
import {
	NHOM_CUA_TINH_NANG,
	NHOM_VIEC_AI,
	TINH_NANG,
} from "@crm/db/ai-chi-phi-danh-muc";
import { danhSachDeXuat } from "@crm/db/okr-de-xuat";
import {
	boGioiHan,
	dieuKienXemMucTieu,
	type NguCanhXem,
} from "@crm/db/okr-hien-thi";
import {
	banTuanChoQuanTri,
	docTomTatChoNguoiXem,
	nacTomTatPhong,
	trangThaiTuan,
} from "@crm/db/okr-tom-tat";
import {
	cauHinhAiLuc,
	donViCuaMucTieu,
	KHONG_XEM_DUOC,
	ketQuaKiemGanNhat,
	tranThangCuaThang,
	troLyOkrSanSang,
	xepViecTroLy,
} from "@crm/db/okr-tro-ly";
import {
	type LyDoKhongSanSang,
	nacCuaDonVi,
	nguonCuaKetQua,
	TRO_LY_OKR_TRAN,
} from "@crm/db/okr-tro-ly-danh-muc";
import { docDiemXuHuong, xuHuongKr as tinhXuHuong } from "@crm/db/okr-xu-huong";
import { kiemOkr } from "@crm/validation/okr-kiem";
import {
	type GoiKiem,
	khoaDong,
	kiemDongDeXuat,
} from "@crm/validation/okr-kiem-de-xuat";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import { kieuKr } from "@crm/validation/okr-kr";
import type {
	TroLyTomTatInput,
	TroLyTomTatOutput,
	TroLyTomTatPhanHoiInput,
	TroLyTomTatPhanHoiOutput,
	TroLyTomTatQuanTriInput,
	TroLyTomTatQuanTriOutput,
} from "@crm/validation/okr-tom-tat";
import {
	type DongGopY,
	dongTuHang,
	LY_DO_KHONG_QUYET,
	type LyDoKhongQuyet,
	maLoaiDeXuat,
	okrTroLyViec,
	trangThaiDeXuat,
} from "@crm/validation/okr-tro-ly";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { z } from "zod";
import { AgentTriggerService } from "../agent/agent-trigger.service";
import { InjectDatabase } from "../database/database.constants";
import {
	type AiChiTieuOutput,
	type DongHien,
	type DongLuot,
	type LuotTroLy,
	type TroLyAnInput,
	type TroLyAnOutput,
	type TroLyDanhSachOutput,
	type TroLyDeXuatOutput,
	type TroLyDichInput,
	type TroLyQuyetInput,
	type TroLyQuyetOutput,
	type TroLySoDoOutput,
	updateKrInput,
	updateObjectiveInput,
	type XuHuongKrOutput,
} from "./okr.contracts";
import { OkrService } from "./okr.service";
import { chonDonVi, donViCua, OkrAccessService } from "./okr-access.service";
import { OKR } from "./okr-config";
import { OKR_XEM } from "./okr-xem.config";
import {
	docThang,
	doTreMs,
	ghiChuVet,
	type LuotThang,
	lamTronTien,
	soDoCua,
} from "./tro-ly-so-do";

type Tx = Prisma.TransactionClient;
type OkrDeXuat = Prisma.OkrDeXuatModel;

const T = OKR.thongDiep;

export const CAU_CUA_LY_DO_KHONG_QUYET = {
	"ky-da-an": [T.chuKy.kyDaAn],
	"ky-da-khoa": [T.kyDaKhoa],
	"muc-tieu-da-bo": [T.daBo],
	"dang-cho-duyet": [T.dangChoDuyet],
	"khong-sua-duoc-kr": [T.khongSuaDuocKr],
	"khong-sua-duoc-don-vi": [T.khongSuaDuocDonVi],
	"so-sai-kieu": Object.values(T.soTheoKieu),
	"can-chinh-gioi-han": [T.canChinh.gioiHanKhongCanChinh],
	"can-chinh-chinh-no": [T.canChinh.chinhNo],
	"can-chinh-cung-cap": [T.canChinh.cungCap],
	"can-chinh-chua-cong-bo": [T.canChinh.chuaCongBo],
	"can-chinh-khac-chu-ky": [T.canChinh.khacChuKy],
	"can-chinh-da-gan": [T.canChinh.daGan],
} satisfies Record<LyDoKhongQuyet, readonly string[]>;

export function lyDoKhongQuyetCua(loi: unknown): LyDoKhongQuyet | null {
	if (
		!(loi instanceof BadRequestException || loi instanceof ForbiddenException)
	)
		return null;
	const ma = LY_DO_KHONG_QUYET.find((m) =>
		CAU_CUA_LY_DO_KHONG_QUYET[m].some((cau) => cau === loi.message),
	);
	return ma ?? null;
}

const SAU_SO = 1e6;

const tron = (usd: number) => Math.round(usd * SAU_SO) / SAU_SO;

const TRAM = 100;

function phanTramTran(chi: number, tran: number): number {
	if (tran > 0) return Math.round((chi / tran) * TRAM);
	return chi > 0 ? TRAM : 0;
}

const CACH_CUA_LOAI = {
	"viet-lai": ["nhan", "sua", "bac"],
	hoi: ["bac", "bo-qua"],
	"can-chinh": ["nhan", "bac"],
} as const satisfies Record<DongGopY["loai"], readonly string[]>;

const TRANG_THAI_CUA_CACH = {
	nhan: "nhan",
	sua: "sua",
	bac: "bac",
	"bo-qua": "bo-qua",
} as const satisfies Record<TroLyQuyetInput["cach"], string>;

type MucTieuGoi = {
	title: string;
	whyNow: string;
	keyResults: { id: string; title: string }[];
};

function giaTriHienTai(mt: MucTieuGoi, dong: DongGopY): string | null {
	if (dong.truong === "title") return mt.title;
	if (dong.truong === "whyNow") return mt.whyNow;
	return mt.keyResults.find((k) => k.id === dong.keyResultId)?.title ?? null;
}

function conHieuLuc(mt: MucTieuGoi, dong: DongGopY): boolean {
	return dong.loai !== "viet-lai" || dong.truoc === giaTriHienTai(mt, dong);
}

function hopLe<R>(doc: z.ZodSafeParseResult<R>): R {
	if (doc.success) return doc.data;
	throw new BadRequestException(
		doc.error.issues[0]?.message ?? T.troLy.cachKhongHop,
	);
}

function noiDungDong(id: string, dong: DongGopY) {
	return {
		id,
		loai: dong.loai,
		objectiveId: dong.objectiveId,
		keyResultId: dong.keyResultId,
		truong: dong.truong,
		truoc: dong.truoc,
		sau: dong.sau,
		maVanDe: dong.maVanDe,
		targetObjectiveId: dong.targetObjectiveId,
		targetKeyResultId: dong.targetKeyResultId,
		lyDo: dong.lyDo,
	};
}

function dongLuotTu(hang: OkrDeXuat): DongLuot {
	return {
		...noiDungDong(hang.id, dongTuHang(hang)),
		trangThai: trangThaiDeXuat.parse(hang.trangThai),
		maLoai: hang.maLoai === null ? null : maLoaiDeXuat.parse(hang.maLoai),
	};
}

@Injectable()
export class TroLyOkrService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		@Inject(OkrAccessService) private readonly quyenOkr: OkrAccessService,
		@Inject(AgentTriggerService) private readonly trigger: AgentTriggerService,
		@Inject(OkrService) private readonly okr: OkrService,
	) {}

	async aiChiTieu(userId: string, now = new Date()): Promise<AiChiTieuOutput> {
		await this.quyenOkr.assertQuanTri(userId);
		const thang = thangVN(now);
		const [chi, cauHinh, sanSang, dangKiem, doiSoat, kiem] = await Promise.all([
			chiTieuThang(this.db, thang, now),
			cauHinhAiLuc(this.db, now),
			troLyOkrSanSang(this.db, {
				viec: "de-xuat",
				nacViec: "an",
				now,
				coTacTu: this.trigger.canReachAgent(),
			}),
			this.db.agentTask.count({
				where: { kind: "okr-kiem-san-sang", finishedAt: null },
			}),
			doiSoatGanNhat(this.db, now),
			ketQuaKiemGanNhat(this.db, now),
		]);
		const theoNhom = NHOM_VIEC_AI.map((nhom) => {
			const cua = TINH_NANG.filter((t) => NHOM_CUA_TINH_NANG[t] === nhom);
			return {
				nhom,
				soBuoc: cua.reduce((s, t) => s + chi.theoTinhNang[t].soBuoc, 0),
				usd: tron(cua.reduce((s, t) => s + chi.theoTinhNang[t].usd, 0)),
			};
		});
		const tranUsd = await tranThangCuaThang(this.db, cauHinh, thang);
		return {
			thang,
			theoNhom,
			tongUsd: tron(chi.tongUsd),
			troLyOkr: {
				chiUsd: tron(chi.troLyOkrUsd),
				tranUsd,
				phanTram: phanTramTran(chi.troLyOkrUsd, tranUsd),
			},
			sanSang,
			nguonKhoa: kiem ? nguonCuaKetQua(kiem.ketQua) : null,
			dangKiem: dangKiem > 0,
			doiSoat,
		};
	}

	private async assertSuaDich(
		userId: string,
		dich: TroLyDichInput,
	): Promise<{ cycleId: string }> {
		const { q, mt } = await this.quyenOkr.assertXemMucTieu(
			userId,
			dich.objectiveId,
		);
		if (!dich.keyResultId) {
			if (this.quyenOkr.suaDuocDonVi(q, userId, mt))
				return { cycleId: mt.cycleId };
			if (await this.coKrSuaDuoc(userId, dich.objectiveId))
				return { cycleId: mt.cycleId };
			throw new ForbiddenException(T.khongSuaDuocDonVi);
		}
		const kr = await this.quyenOkr.assertSuaKr(userId, dich.keyResultId);
		if (kr.objectiveId !== dich.objectiveId)
			throw new BadRequestException(T.troLy.krKhacMucTieu);
		return { cycleId: mt.cycleId };
	}

	private async coKrSuaDuoc(
		userId: string,
		objectiveId: string,
	): Promise<boolean> {
		const dem = await this.db.okrKeyResult.count({
			where: { objectiveId, ownerUserId: userId },
		});
		return dem > 0;
	}

	private async lyDoNac(
		client: Db | Tx,
		objectiveId: string,
		now: Date,
	): Promise<LyDoKhongSanSang | null> {
		const [ct, donVi] = await Promise.all([
			cauHinhAiLuc(client, now),
			donViCuaMucTieu(client, objectiveId),
		]);
		const nac = nacCuaDonVi(ct, "de-xuat", donVi);
		if (nac === "bat") return null;
		return nac === "an" ? "don-vi-chua-bat" : nac;
	}

	async troLySanSang(userId: string, dich: TroLyDichInput, now = new Date()) {
		await this.assertSuaDich(userId, dich);
		return troLyOkrSanSang(this.db, {
			viec: "de-xuat",
			objectiveId: dich.objectiveId,
			nguoiYeuCau: userId,
			now,
			coTacTu: this.trigger.canReachAgent(),
		});
	}

	async troLyDeXuat(
		userId: string,
		dich: TroLyDichInput,
		now = new Date(),
	): Promise<TroLyDeXuatOutput> {
		const { cycleId } = await this.assertSuaDich(userId, dich);
		await this.okr.assertKyChuaAn(this.db, cycleId);
		const kq = await xepViecTroLy(this.db, {
			viec: "de-xuat",
			objectiveId: dich.objectiveId,
			keyResultId: dich.keyResultId ?? null,
			nguoiYeuCau: userId,
			nac: "bat",
			now,
		});
		if (!kq.bat) {
			if (kq.lyDo === KHONG_XEM_DUOC)
				throw new NotFoundException(T.khongThayMucTieu);
			return { bat: false, lyDo: kq.lyDo };
		}
		if (!kq.dungLai) this.trigger.troLyOkrDaXep();
		return kq;
	}

	private async goiKiem(userId: string, nc: NguCanhXem, objectiveId: string) {
		const [mt, hang, thanhVien] = await Promise.all([
			this.db.okrObjective.findFirstOrThrow({
				where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
				select: {
					id: true,
					title: true,
					whyNow: true,
					hienThi: true,
					keyResults: {
						orderBy: { position: "asc" },
						select: {
							id: true,
							title: true,
							kind: true,
							startValue: true,
							targetValue: true,
							currentValue: true,
							unit: true,
						},
					},
				},
			}),
			this.db.okrDeXuat.findMany({
				where: { objectiveId, trangThai: { in: ["bac", "bo-qua"] } },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			}),
			this.db.member.findMany({ select: { user: { select: { name: true } } } }),
		]);
		const dich =
			mt.hienThi === boGioiHan.hienThi
				? await this.okr.alignmentTargets(userId, objectiveId)
				: { targets: [] };
		const daBac = hang
			.map((h) => dongTuHang(h))
			.filter((d) => conHieuLuc(mt, d));
		const goi: GoiKiem = {
			mucTieu: { id: mt.id, title: mt.title, whyNow: mt.whyNow },
			krs: mt.keyResults.map((k) => ({
				id: k.id,
				title: k.title,
				startValue: k.startValue.toNumber(),
				targetValue: k.targetValue.toNumber(),
				currentValue: k.currentValue.toNumber(),
				unit: k.unit,
			})),
			dichCanChinh: dich.targets.map((d) =>
				d.keyResultId === null
					? { id: d.objectiveId, loai: "muc-tieu" as const, title: d.label }
					: { id: d.keyResultId, loai: "kr" as const, title: d.label },
			),
			luatDaHoi: kiemOkr({
				title: mt.title,
				whyNow: mt.whyNow,
				keyResults: mt.keyResults.map((k) => ({
					title: k.title,
					kind: kieuKr.parse(k.kind),
					startValue: k.startValue.toNumber(),
					targetValue: k.targetValue.toNumber(),
				})),
			}).map((r) => ({
				ma: r.ma,
				keyResultId:
					r.krIndex === null ? null : (mt.keyResults[r.krIndex]?.id ?? null),
			})),
			khoaDaBac: [...new Set(daBac.map((d) => khoaDong(d)))],
			khoaDangCho: [],
			tenThanhVien: thanhVien
				.map((m) => m.user.name)
				.filter((ten) => ten.trim() !== ""),
			tuCam: TRO_LY_OKR_TRAN.tuCam,
		};
		return goi;
	}

	private async tapDuocDoc(
		userId: string,
		mt: {
			level: string;
			divisionId: string | null;
			departmentId: string | null;
			personUserId: string | null;
			keyResults: { id: string; ownerUserId: string }[];
		},
		keyResultId: string | undefined,
	): Promise<string[] | "moi" | null> {
		const q = await this.quyenOkr.quyen(userId);
		const objective = donViCua(mt);
		const krSua = mt.keyResults
			.filter((k) =>
				this.quyenOkr.ghiDuocKr(q, userId, {
					ownerUserId: k.ownerUserId,
					objective,
				}),
			)
			.map((k) => k.id);
		if (keyResultId) {
			if (!mt.keyResults.some((k) => k.id === keyResultId)) return null;
			if (!krSua.includes(keyResultId))
				throw new ForbiddenException(T.khongSuaDuocKr);
			return [keyResultId];
		}
		if (this.quyenOkr.suaDuocDonVi(q, userId, objective)) return "moi";
		if (krSua.length > 0) return krSua;
		throw new ForbiddenException(T.khongSuaDuocDonVi);
	}

	async troLyDanhSach(
		userId: string,
		dich: TroLyDichInput,
		now = new Date(),
	): Promise<TroLyDanhSachOutput> {
		const rong = (lyDo: LyDoKhongSanSang | null): TroLyDanhSachOutput => ({
			dong: [],
			dangSoan: false,
			maKetThuc: null,
			docLuc: null,
			lyDo,
		});
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		const mt = await this.db.okrObjective.findFirst({
			where: { AND: [{ id: dich.objectiveId }, dieuKienXemMucTieu(nc)] },
			select: {
				...chonDonVi,
				keyResults: { select: { id: true, ownerUserId: true } },
			},
		});
		if (!mt) return rong(null);
		const tap = await this.tapDuocDoc(userId, mt, dich.keyResultId);
		if (tap === null) return rong(null);
		if (mt.status === "da-bo") return rong(null);
		const lyDo = await this.lyDoNac(this.db, mt.id, now);
		if (lyDo !== null) return rong(lyDo);
		const goi = await this.goiKiem(userId, nc, mt.id);
		const ds = await danhSachDeXuat(this.db, {
			objectiveId: mt.id,
			keyResultIds: tap,
			nac: "bat",
			now,
			kiemLai: (hang) => kiemDongDeXuat(dongTuHang(hang), goi),
		});
		const tenDich = new Map(goi.dichCanChinh.map((d) => [d.id, d.title]));
		return {
			dong: ds.dong.map((h): DongHien => {
				const dong = dongTuHang(h);
				const dichId = dong.targetObjectiveId ?? dong.targetKeyResultId;
				return {
					...noiDungDong(h.id, dong),
					tenDich: dichId === null ? null : (tenDich.get(dichId) ?? null),
				};
			}),
			dangSoan: ds.dangSoan,
			maKetThuc: ds.maKetThuc,
			docLuc: ds.docLuc?.toISOString() ?? null,
			lyDo: null,
		};
	}

	private async xemDuoc(
		tx: Tx,
		userId: string,
		objectiveId: string,
	): Promise<boolean> {
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		const dem = await tx.okrObjective.count({
			where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
		});
		return dem > 0;
	}

	private async assertSuaDong(tx: Tx, userId: string, dong: DongGopY) {
		const krId =
			dong.truong === "kr.title" || dong.loai === "hoi"
				? dong.keyResultId
				: null;
		if (krId) {
			await this.quyenOkr.assertSuaKr(userId, krId, tx);
			return;
		}
		await this.quyenOkr.assertSuaMucTieu(userId, dong.objectiveId, tx);
	}

	private async assertConHieuLuc(tx: Tx, dong: DongGopY) {
		if (dong.loai !== "viet-lai") return;
		const mt = await tx.okrObjective.findUniqueOrThrow({
			where: { id: dong.objectiveId },
			select: {
				title: true,
				whyNow: true,
				keyResults: { select: { id: true, title: true } },
			},
		});
		if (!conHieuLuc(mt, dong)) throw new ConflictException(T.troLy.daCu);
	}

	private async ghiTheoDong(
		tx: Tx,
		userId: string,
		deXuatId: string,
		dong: DongGopY,
		giaTri: string | null,
	) {
		const ghi = { note: ghiChuVet(deXuatId) };
		if (dong.loai === "can-chinh") {
			await this.okr.addAlignmentTrong(
				tx,
				userId,
				{
					objectiveId: dong.objectiveId,
					targetObjectiveId: dong.targetObjectiveId,
					targetKeyResultId: dong.targetKeyResultId,
				},
				ghi,
			);
			return;
		}
		if (dong.truong === "kr.title") {
			const vao = hopLe(
				updateKrInput.safeParse({ id: dong.keyResultId, title: giaTri }),
			);
			await this.okr.updateKeyResultTrong(tx, userId, vao, ghi);
			return;
		}
		if (dong.truong === null)
			throw new BadRequestException(T.troLy.cachKhongHop);
		const vao = hopLe(
			updateObjectiveInput.safeParse({
				id: dong.objectiveId,
				[dong.truong]: giaTri,
			}),
		);
		await this.okr.updateObjectiveTrong(tx, userId, vao, ghi);
	}

	async troLyQuyet(
		userId: string,
		input: TroLyQuyetInput,
		now = new Date(),
	): Promise<TroLyQuyetOutput> {
		return this.db
			.$transaction(async (tx): Promise<TroLyQuyetOutput> => {
				const moc = await tx.okrDeXuat.findUnique({
					where: { id: input.deXuatId },
					select: { objectiveId: true },
				});
				const mt = moc
					? await tx.okrObjective.findUnique({
							where: { id: moc.objectiveId },
							select: { id: true, cycleId: true },
						})
					: null;
				if (mt) {
					await this.okr.assertKyChuaAn(tx, mt.cycleId);
					await tx.$queryRaw`SELECT id FROM "okrObjective" WHERE id = ${mt.id} FOR UPDATE`;
				}
				const hang = await tx.okrDeXuat.findUnique({
					where: { id: input.deXuatId },
				});
				if (
					hang?.nac !== "bat" ||
					!(await this.xemDuoc(tx, userId, hang.objectiveId))
				)
					throw new NotFoundException(T.troLy.khongCoDeXuat(input.deXuatId));
				const dong = dongTuHang(hang);
				await this.assertSuaDong(tx, userId, dong);
				if (
					!(CACH_CUA_LOAI[dong.loai] as readonly string[]).includes(input.cach)
				)
					throw new BadRequestException(T.troLy.cachKhongHop);
				if (input.cach === "sua" && !input.giaTri)
					throw new BadRequestException(T.troLy.canGiaTri);
				const lyDo = await this.lyDoNac(tx, dong.objectiveId, now);
				if (lyDo !== null) return { ok: false, lyDo };
				if (hang.trangThai !== "cho")
					throw new ConflictException(T.troLy.daQuyet);
				const ghiOkr = input.cach === "nhan" || input.cach === "sua";
				if (ghiOkr) await this.assertConHieuLuc(tx, dong);
				const giaTri =
					input.cach === "sua"
						? (input.giaTri ?? null)
						: input.cach === "nhan" && dong.loai === "viet-lai"
							? dong.sau
							: null;
				const { count } = await tx.okrDeXuat.updateMany({
					where: { id: hang.id, trangThai: "cho" },
					data: {
						trangThai: TRANG_THAI_CUA_CACH[input.cach],
						giaTriCuoi: giaTri,
						nguoiQuyet: userId,
						quyetLuc: now,
					},
				});
				if (count === 0) throw new ConflictException(T.troLy.daQuyet);
				if (ghiOkr) await this.ghiTheoDong(tx, userId, hang.id, dong, giaTri);
				return { ok: true };
			})
			.catch((loi: unknown): TroLyQuyetOutput => {
				const lyDo = lyDoKhongQuyetCua(loi);
				if (lyDo === null) throw loi;
				return { ok: false, lyDo };
			});
	}

	private async luotTu(ds: LuotThang[]): Promise<LuotTroLy[]> {
		const viec = ds.map((l) => {
			const doc = okrTroLyViec.safeParse(l.payload);
			return doc.success && doc.data.viec === "de-xuat" ? doc.data : null;
		});
		const mucTieu = await this.db.okrObjective.findMany({
			where: {
				id: { in: viec.flatMap((v) => (v ? [v.objectiveId] : [])) },
			},
			select: { id: true, title: true },
		});
		const ten = new Map(mucTieu.map((m) => [m.id, m.title]));
		return ds.map((l, i) => {
			const v = viec[i] ?? null;
			return {
				taskId: l.id,
				nac: l.nac,
				objectiveId: v?.objectiveId ?? null,
				tenMucTieu: v ? (ten.get(v.objectiveId) ?? null) : null,
				keyResultId: v?.keyResultId ?? null,
				nguoiYeuCau: v?.nguoiYeuCau ?? null,
				taoLuc: l.taoLuc.toISOString(),
				xongLuc: l.xongLuc?.toISOString() ?? null,
				ketQua: l.ketQua,
				doTreMs: doTreMs(l),
				chiPhiUsd: lamTronTien(l.tien),
				dong: l.dong.map(dongLuotTu),
			};
		});
	}

	async troLyAn(
		userId: string,
		input: TroLyAnInput,
		now = new Date(),
	): Promise<TroLyAnOutput> {
		await this.quyenOkr.assertQuanTri(userId);
		const thang = input.thang ?? thangVN(now);
		const nac = input.nac ?? "an";
		const so = await docThang(this.db, thang);
		const luot = so.luot
			.filter((l) => l.nac === nac)
			.slice(0, OKR.troLy.soLuotGanDay);
		return { thang, luot: await this.luotTu(luot) };
	}

	async troLySoDo(
		userId: string,
		input: { thang?: string },
		now = new Date(),
	): Promise<TroLySoDoOutput> {
		await this.quyenOkr.assertQuanTri(userId);
		const thang = input.thang ?? thangVN(now);
		const so = await docThang(this.db, thang);
		return { thang, bat: soDoCua(so, "bat"), an: soDoCua(so, "an") };
	}

	async troLyTomTat(
		userId: string,
		input: TroLyTomTatInput,
		now = new Date(),
	): Promise<TroLyTomTatOutput> {
		await this.quyenOkr.quyen(userId);
		const nac = await nacTomTatPhong(this.db, {
			departmentId: input.departmentId,
			now,
		});
		if (nac !== "bat")
			return { ban: null, dangSoan: false, chuaCapNhat: false };
		const v = { cycleId: input.cycleId, departmentId: input.departmentId, now };
		const [ban, tuan] = await Promise.all([
			docTomTatChoNguoiXem(this.db, { ...v, nguoiXem: userId }, LUAT_TOM_TAT),
			trangThaiTuan(this.db, v, LUAT_TOM_TAT),
		]);
		return { ban, ...tuan };
	}

	async troLyTomTatPhanHoi(
		userId: string,
		input: TroLyTomTatPhanHoiInput,
		now = new Date(),
	): Promise<TroLyTomTatPhanHoiOutput> {
		await this.quyenOkr.quyen(userId);
		const hang = await this.db.okrTomTat.findUnique({
			where: { id: input.tomTatId },
			select: { cycleId: true, departmentId: true },
		});
		const ban = hang
			? await docTomTatChoNguoiXem(
					this.db,
					{ ...hang, nguoiXem: userId, now },
					LUAT_TOM_TAT,
				)
			: null;
		if (ban?.id !== input.tomTatId)
			throw new NotFoundException(T.troLy.khongCoTomTat(input.tomTatId));
		await this.db.okrTomTatPhanHoi.upsert({
			where: { tomTatId_userId: { tomTatId: input.tomTatId, userId } },
			create: {
				tomTatId: input.tomTatId,
				userId,
				huuIch: input.huuIch,
				luc: now,
			},
			update: { huuIch: input.huuIch, luc: now },
		});
		return { ok: true };
	}

	async troLyTomTatQuanTri(
		userId: string,
		input: TroLyTomTatQuanTriInput,
		now = new Date(),
	): Promise<TroLyTomTatQuanTriOutput> {
		const q = await this.quyenOkr.quyen(userId);
		if (!q.quanTriChuongTrinh)
			throw new ForbiddenException(OKR_XEM.thongDiep.chiQuanTri);
		return banTuanChoQuanTri(
			this.db,
			{ cycleId: input.cycleId, now },
			LUAT_TOM_TAT,
		);
	}

	async xuHuongKr(
		userId: string,
		keyResultId: string,
		now = new Date(),
	): Promise<XuHuongKrOutput> {
		const nc = this.quyenOkr.nguCanhXem(
			await this.quyenOkr.quyen(userId),
			userId,
		);
		const kr = await this.db.okrKeyResult.findFirst({
			where: { id: keyResultId, objective: dieuKienXemMucTieu(nc) },
			select: { objectiveId: true },
		});
		if (!kr) throw new NotFoundException(T.khongThayMucTieu);
		if ((await this.lyDoNac(this.db, kr.objectiveId, now)) !== null)
			return null;
		const diem = await docDiemXuHuong(this.db, keyResultId);
		return diem ? tinhXuHuong(diem.diem, diem.ketThucKy, diem.kieu) : null;
	}
}
