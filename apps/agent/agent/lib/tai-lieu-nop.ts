import { db, type Prisma } from "@crm/db";
import { taoDeXuatTaiLieu } from "@crm/db/tai-lieu-de-xuat";
import {
	chuanNfc,
	parseSuKienChiTiet,
	type SuKienChiTiet,
	TAI_LIEU,
} from "@crm/validation/tai-lieu";
import { chuanHoa } from "@crm/validation/tai-lieu-markdown";
import { kiemBanMay } from "@crm/validation/tai-lieu-so";
import { danhSachTrichDoan } from "@crm/validation/tai-lieu-trich-doan";
import { MOT_TRIEU, TAI_LIEU_AGENT } from "./tai-lieu-config";
import { nhanKhoaMaySoan } from "./tai-lieu-model";

const SOAN = TAI_LIEU_AGENT.soan;
const LY_DO = TAI_LIEU_AGENT.lyDo;
const GIA = new Map<string, { vaoMoiTrieu: number; raMoiTrieu: number }>(
	Object.entries(TAI_LIEU_AGENT.bangGia),
);

type SoMaySoan = Extract<SuKienChiTiet, { loai: "MAY_SOAN" }>;

const MO_TA_LOI = {
	"so-khong-trich": (chi: string) =>
		`số «${chi}» không có trong trích đoạn nào`,
	"trich-khong-co": (chi: string) => `trích «${chi}» không có trong nguồn`,
	"trich-ngan": (chi: string) =>
		`trích «${chi}» quá ngắn — chép cả câu hay cả hàng bảng chứa số`,
} as const;

export function chiPhiUsd(
	maModel: string,
	tokenVao: number,
	tokenRa: number,
): number | null {
	const gia = GIA.get(maModel);
	if (!gia) return null;
	return (tokenVao * gia.vaoMoiTrieu + tokenRa * gia.raMoiTrieu) / MOT_TRIEU;
}

export type TangSo = {
	tokenVao?: number;
	tokenRa?: number;
	bac?: number;
	deXuatId?: string;
};

export async function ghiSoMaySoan(
	nguonId: string,
	phien: string,
	tang: TangSo,
	tx?: Prisma.TransactionClient,
): Promise<SoMaySoan> {
	const lam = async (c: Prisma.TransactionClient) => {
		await c.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`may-soan:${phien}`}))`;
		const nguon = await c.taiLieuNguon.findUniqueOrThrow({
			where: { id: nguonId },
			select: { trangId: true, taiBoiId: true },
		});
		const cu = await c.taiLieuSuKien.findFirst({
			where: {
				trangId: nguon.trangId,
				loai: "MAY_SOAN",
				chiTiet: { path: ["phien"], equals: phien },
			},
			select: { id: true, chiTiet: true },
		});
		const truoc = cu ? parseSuKienChiTiet(cu.chiTiet) : null;
		const goc =
			truoc?.loai === "MAY_SOAN"
				? truoc
				: {
						loai: "MAY_SOAN" as const,
						deXuatId: null,
						nguonId,
						phien,
						maModel: SOAN.maModel,
						nhanKhoa: nhanKhoaMaySoan(),
						tokenVao: 0,
						tokenRa: 0,
						chiPhiUsd: null,
						soLanBac: 0,
					};
		const tokenVao = goc.tokenVao + (tang.tokenVao ?? 0);
		const tokenRa = goc.tokenRa + (tang.tokenRa ?? 0);
		const moi: SoMaySoan = {
			...goc,
			tokenVao,
			tokenRa,
			chiPhiUsd: chiPhiUsd(goc.maModel, tokenVao, tokenRa),
			soLanBac: goc.soLanBac + (tang.bac ?? 0),
			deXuatId: tang.deXuatId ?? goc.deXuatId,
		};
		if (cu) {
			await c.taiLieuSuKien.update({
				where: { id: cu.id },
				data: { chiTiet: moi },
			});
		} else {
			await c.taiLieuSuKien.create({
				data: {
					trangId: nguon.trangId,
					aiId: nguon.taiBoiId,
					loai: "MAY_SOAN",
					chiTiet: moi,
				},
			});
		}
		return moi;
	};
	return tx ? lam(tx) : db.$transaction(lam);
}

export type BanNop = {
	ten: string;
	noiDung: string;
	trichDoan: { menhDe: string; trich: string }[];
};

export type KetQuaNop =
	| { ok: true; deXuatId: string }
	| { ok: false; loi: string };

function sachBan(
	ban: BanNop,
):
	| { ok: true; ten: string; noiDung: string; trichDoan: BanNop["trichDoan"] }
	| { ok: false; chi: string } {
	const ten = chuanNfc(ban.ten).trim();
	if (ten.length < TAI_LIEU.ten.min || ten.length > TAI_LIEU.ten.max) {
		return { ok: false, chi: `tên dài ${ten.length} ký tự` };
	}
	const noiDung = chuanHoa(ban.noiDung);
	if (noiDung.trim() === "") return { ok: false, chi: "nội dung rỗng" };
	if (noiDung.length > TAI_LIEU.noiDung.max) {
		return { ok: false, chi: `nội dung dài ${noiDung.length} ký tự` };
	}
	const trich = danhSachTrichDoan.safeParse(ban.trichDoan);
	if (!trich.success) {
		return { ok: false, chi: "trích đoạn không đọc được" };
	}
	return { ok: true, ten, noiDung, trichDoan: trich.data };
}

async function tuChoi(
	nguonId: string,
	phien: string,
	lyDo: string,
	bac: number,
): Promise<KetQuaNop> {
	const so = await ghiSoMaySoan(nguonId, phien, { bac });
	const hetTran = so.soLanBac >= SOAN.tranBuoc;
	await db.taiLieuNguon.updateMany({
		where: { id: nguonId, trangThai: "DANG_SOAN" },
		data: hetTran ? { trangThai: "LOI", lyDo } : { lyDo },
	});
	return {
		ok: false,
		loi: hetTran
			? `${lyDo}. Đã hết ${SOAN.tranBuoc} lần nộp; dừng lại, không nộp nữa.`
			: `${lyDo}. Sửa đúng chỗ đó rồi nộp lại.`,
	};
}

export async function nopBanDeXuat(
	nguonId: string,
	phien: string,
	ban: BanNop,
): Promise<KetQuaNop> {
	const nguon = await db.taiLieuNguon.findUnique({
		where: { id: nguonId },
		select: {
			trangThai: true,
			chu: true,
			trangId: true,
			taiBoiId: true,
			banGocId: true,
		},
	});
	if (nguon?.trangThai !== "DANG_SOAN" || !nguon.chu) {
		return { ok: false, loi: "Nguồn này không còn chờ soạn; dừng lại." };
	}
	const banGoc = nguon.banGocId
		? await db.taiLieuPhienBan.findUnique({
				where: { id: nguon.banGocId },
				select: { noiDung: true },
			})
		: null;
	const sach = sachBan(ban);
	if (!sach.ok) return tuChoi(nguonId, phien, LY_DO.saiKhuon(sach.chi), 1);
	const kiem = kiemBanMay({
		noiDung: sach.noiDung,
		trichDoan: sach.trichDoan,
		chuNguon: nguon.chu,
		banGoc: banGoc?.noiDung ?? null,
	});
	if (!kiem.ok) {
		const chi = kiem.loi.map((l) => MO_TA_LOI[l.loai](l.chi)).join("; ");
		return tuChoi(nguonId, phien, LY_DO.biBac(chi), 1);
	}
	return db.$transaction(async (tx) => {
		const [khoa] = await tx.$queryRaw<{ trangThai: string }[]>`
			SELECT "trangThai" FROM "taiLieuNguon" WHERE id = ${nguonId} FOR UPDATE
		`;
		if (khoa?.trangThai !== "DANG_SOAN") {
			return { ok: false, loi: "Nguồn này không còn chờ soạn; dừng lại." };
		}
		const [trang] = await tx.$queryRaw<{ archivedAt: Date | null }[]>`
			SELECT "archivedAt" FROM "taiLieuTrang" WHERE id = ${nguon.trangId} FOR UPDATE
		`;
		if (trang?.archivedAt) {
			await tx.taiLieuNguon.update({
				where: { id: nguonId },
				data: { trangThai: "LOI", lyDo: LY_DO.daLuuTru },
			});
			return { ok: false, loi: `${LY_DO.daLuuTru} Dừng lại, không nộp nữa.` };
		}
		const { deXuatId } = await taoDeXuatTaiLieu(tx, {
			trangId: nguon.trangId,
			banGocId: nguon.banGocId,
			ten: sach.ten,
			noiDung: sach.noiDung,
			taoBoiId: nguon.taiBoiId,
			suKien: "DE_XUAT",
			nguonId,
			trichDoan: sach.trichDoan,
		});
		await tx.taiLieuNguon.update({
			where: { id: nguonId },
			data: { trangThai: "DA_SOAN", lyDo: null },
		});
		await ghiSoMaySoan(nguonId, phien, { deXuatId }, tx);
		return { ok: true, deXuatId };
	});
}
