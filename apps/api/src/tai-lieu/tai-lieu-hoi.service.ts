import type { Db, Prisma } from "@crm/db";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { demHoiTrongNgay, demHoiTrongThang } from "@crm/db/tai-lieu-hoi";
import { TAI_LIEU } from "@crm/validation/tai-lieu";
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
	BadRequestException,
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
import { laQuanTri, type NguoiGoi } from "./quyen";
import { TAI_LIEU_API } from "./tai-lieu-config";

const T = TAI_LIEU_API.thongDiep;
const TOI_DA = TAI_LIEU.tim.sucKhoeToiDa;
const NGUOI = { select: { id: true, name: true } } as const;

type Khoi<D> = { rows: D[]; total: number };

import type {
	DongBaoSai,
	DongChuaTraLoi,
	TaiLieuBaoSaiInput,
	TaiLieuHoiInput,
	TaiLieuHoiKetQuaOutput,
	TaiLieuHoiOutput,
	TaiLieuXuLyBaoSaiInput,
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

	async baoSai(
		nguoi: NguoiGoi,
		input: TaiLieuBaoSaiInput,
	): Promise<{ soViec: number }> {
		chanVaiChiOkr(nguoi);
		const hang = await this.db.taiLieuHoi.findFirst({
			where: { id: input.hoiId, nguoiHoiId: nguoi.id },
			select: { trangThai: true, traLoi: true },
		});
		if (!hang) throw new NotFoundException(T.khongCo);
		if (hang.trangThai !== "TRA_LOI")
			throw new BadRequestException(T.baoSaiChiTraLoi);
		const phienBan = new Map<string, number>();
		for (const cau of parseTraLoi(hang.traLoi).cau)
			for (const t of cau.trich)
				if (!phienBan.has(t.slug)) phienBan.set(t.slug, t.phienBan);
		const trang = await this.db.taiLieuTrang.findMany({
			where: { slug: { in: [...phienBan.keys()] } },
			select: { id: true, slug: true },
		});
		await this.db.taiLieuBaoSai.createMany({
			data: trang.map((t) => ({
				hoiId: input.hoiId,
				trangId: t.id,
				phienBan: phienBan.get(t.slug) ?? 0,
				nguoiBaoId: nguoi.id,
				cauHoi: input.cauHoi,
				ghiChu: input.ghiChu ? input.ghiChu : null,
			})),
			skipDuplicates: true,
		});
		const soViec = await this.db.taiLieuBaoSai.count({
			where: { hoiId: input.hoiId, nguoiBaoId: nguoi.id },
		});
		return { soViec };
	}

	private async slugCuaChu(nguoi: NguoiGoi): Promise<string[]> {
		const trang = await this.db.taiLieuTrang.findMany({
			where: { chuTrangId: nguoi.id },
			select: { slug: true },
		});
		return trang.map((t) => t.slug);
	}

	private khongDuoc(slugCuaChu: readonly string[]): Error {
		return slugCuaChu.length > 0
			? new ForbiddenException(T.khongDuocXuLy)
			: new NotFoundException(T.khongCo);
	}

	async danhSachChuaTraLoi(nguoi: NguoiGoi): Promise<Khoi<DongChuaTraLoi>> {
		const coBan = { trangThai: "TU_CHOI", xuLyLuc: null };
		let where: Prisma.TaiLieuHoiWhereInput = coBan;
		if (!laQuanTri(nguoi.role)) {
			const slug = await this.slugCuaChu(nguoi);
			if (slug.length === 0) return { rows: [], total: 0 };
			where = {
				...coBan,
				OR: slug.map((s) => ({ ganNhat: { array_contains: [{ slug: s }] } })),
			};
		}
		const [hang, total] = await Promise.all([
			this.db.taiLieuHoi.findMany({
				where,
				orderBy: { hoiLuc: "desc" },
				take: TOI_DA,
				select: { id: true, cauHoi: true, ganNhat: true },
			}),
			this.db.taiLieuHoi.count({ where }),
		]);
		return {
			rows: hang.map((h) => ({
				hoiId: h.id,
				cauHoi: h.cauHoi ?? "",
				ganNhat: parseGanNhat(h.ganNhat ?? []),
			})),
			total,
		};
	}

	async xuLyChuaTraLoi(nguoi: NguoiGoi, hoiId: string): Promise<{ ok: true }> {
		const hang = await this.db.taiLieuHoi.findFirst({
			where: { id: hoiId, trangThai: "TU_CHOI" },
			select: { ganNhat: true },
		});
		if (!hang) throw new NotFoundException(T.khongCo);
		if (!laQuanTri(nguoi.role)) {
			const slug = await this.slugCuaChu(nguoi);
			const gan = parseGanNhat(hang.ganNhat ?? []);
			if (!gan.some((g) => slug.includes(g.slug))) throw this.khongDuoc(slug);
		}
		await this.db.taiLieuHoi.updateMany({
			where: { id: hoiId, xuLyLuc: null },
			data: { xuLyLuc: new Date(), xuLyBoiId: nguoi.id },
		});
		return { ok: true };
	}

	async danhSachBaoSai(nguoi: NguoiGoi): Promise<Khoi<DongBaoSai>> {
		const where: Prisma.TaiLieuBaoSaiWhereInput = laQuanTri(nguoi.role)
			? { trangThai: "MO" }
			: { trangThai: "MO", trang: { chuTrangId: nguoi.id } };
		const [hang, total] = await Promise.all([
			this.db.taiLieuBaoSai.findMany({
				where,
				orderBy: { taoLuc: "desc" },
				take: TOI_DA,
				select: {
					id: true,
					phienBan: true,
					cauHoi: true,
					ghiChu: true,
					trang: { select: { slug: true, ten: true, chuTrang: NGUOI } },
				},
			}),
			this.db.taiLieuBaoSai.count({ where }),
		]);
		return {
			rows: hang.map((h) => ({
				id: h.id,
				slug: h.trang.slug,
				ten: h.trang.ten,
				phienBan: h.phienBan,
				cauHoi: h.cauHoi,
				ghiChu: h.ghiChu,
				chuTrang: h.trang.chuTrang,
			})),
			total,
		};
	}

	async xuLyBaoSai(
		nguoi: NguoiGoi,
		input: TaiLieuXuLyBaoSaiInput,
	): Promise<{ ok: true }> {
		const viec = await this.db.taiLieuBaoSai.findUnique({
			where: { id: input.id },
			select: { trang: { select: { chuTrangId: true } } },
		});
		if (!viec) throw new NotFoundException(T.khongCo);
		if (!laQuanTri(nguoi.role) && viec.trang.chuTrangId !== nguoi.id)
			throw this.khongDuoc(await this.slugCuaChu(nguoi));
		await this.db.taiLieuBaoSai.updateMany({
			where: { id: input.id, trangThai: "MO" },
			data: {
				trangThai: "DA_XU_LY",
				ketLuan: input.ketLuan,
				xuLyLuc: new Date(),
				xuLyBoiId: nguoi.id,
			},
		});
		return { ok: true };
	}
}
