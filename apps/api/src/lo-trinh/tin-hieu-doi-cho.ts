import type { Db, Prisma } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import {
	BAN_CHUP_LO_TRINH,
	type BanChupVao,
	type KetQuaBanChup,
} from "@crm/validation/ban-chup-lo-trinh";
import {
	khoaThongBao,
	type NoiDungThongBao,
	THONG_BAO,
} from "@crm/validation/thong-bao";
import { TIN_HIEU } from "@crm/validation/tin-hieu";
import {
	choTinHieu,
	type DoiCho,
	doiCho,
	type KetQuaCho,
} from "@crm/validation/tin-hieu-cho";

type Tx = Prisma.TransactionClient;

export type GhiThongBaoDoiCho = (
	tx: Tx,
	data: Prisma.ThongBaoCreateManyInput[],
) => Promise<number>;

export type CanhBaoDoiCho = (o: {
	message: string;
	nguon: string;
	sha: string;
	ban: "cu" | "moi";
	lyDo: string;
}) => void;

export type TuyChonDoiCho = {
	ghiThongBao?: GhiThongBaoDoiCho;
	canhBao?: CanhBaoDoiCho;
};

export type KetQuaGhiVaBao = { ketQua: KetQuaBanChup; soThongBao: number };

export const DUONG_TIN_HIEU = "/tin-hieu";

const MA_TIN_HIEU = new RegExp(`^${TIN_HIEU.phien}-(\\d+)$`);

const ghiMacDinh: GhiThongBaoDoiCho = async (tx, data) =>
	(await tx.thongBao.createMany({ data, skipDuplicates: true })).count;

function laTrungKhoa(loi: unknown): boolean {
	return (
		typeof loi === "object" &&
		loi !== null &&
		"code" in loi &&
		loi.code === "P2002"
	);
}

function soCuaMa(ma: string): number | null {
	const khop = MA_TIN_HIEU.exec(ma);
	return khop?.[1] ? Number(khop[1]) : null;
}

function baoNeuKhongDoc(
	kq: KetQuaCho,
	ban: "cu" | "moi",
	vao: BanChupVao,
	canhBao: CanhBaoDoiCho | undefined,
): void {
	if (kq.kieu === "co") return;
	canhBao?.({
		message: "lo-trinh.ban-chup.tin-hieu-khong-doc-duoc",
		nguon: vao.nguon,
		sha: vao.sha,
		ban,
		lyDo: kq.kieu === "hong" ? kq.loi : "khong-co",
	});
}

async function thongBaoCuaLanDoi(
	tx: Tx,
	doi: DoiCho[],
	sha: string,
	now: Date,
): Promise<Prisma.ThongBaoCreateManyInput[]> {
	const theoSo = new Map(
		doi.flatMap((d) => {
			const so = soCuaMa(d.ma);
			return so === null ? [] : [[so, d] as const];
		}),
	);
	if (theoSo.size === 0) return [];
	const nguoiNhan = await tx.tinHieu.findMany({
		where: {
			so: { in: [...theoSo.keys()] },
			archivedAt: null,
			nguoiGui: { members: { some: {} } },
		},
		select: { so: true, tieuDe: true, nguoiGuiId: true },
	});
	const ngay = ngayVN(now);
	return nguoiNhan.flatMap((t) => {
		const d = theoSo.get(t.so);
		if (!d || t.nguoiGuiId === null) return [];
		const noiDung: NoiDungThongBao = {
			loai: "tin-hieu-doi-cho",
			ma: d.ma,
			tieuDe: t.tieuDe,
			khoa: d.cho.khoa,
			sha,
		};
		return [
			{
				nguoiNhanId: t.nguoiGuiId,
				nguon: THONG_BAO.nguon.tinHieu,
				khoa: khoaThongBao(noiDung, now),
				noiDung,
				duongDan: DUONG_TIN_HIEU,
				ngayDau: ngay,
				thayNgay: ngay,
				taoLuc: now,
			},
		];
	});
}

async function motLuot(
	db: Db,
	vao: BanChupVao,
	now: Date,
	tuyChon: TuyChonDoiCho,
): Promise<KetQuaGhiVaBao> {
	return db.$transaction(async (tx) => {
		const [cu] = await tx.$queryRaw<
			{ sha: string; commitLuc: Date; duLieu: Prisma.JsonValue }[]
		>`SELECT "sha", "commitLuc", "duLieu" FROM "BanChupLoTrinh" WHERE "nguon" = ${vao.nguon} FOR UPDATE`;
		const commitLuc = new Date(vao.commitLuc);
		const moi = {
			sha: vao.sha,
			commitLuc,
			layLuc: now,
			duLieu: vao.duLieu as Prisma.InputJsonObject,
			canhBao: vao.canhBao,
		};
		if (!cu) {
			await tx.banChupLoTrinh.create({ data: { nguon: vao.nguon, ...moi } });
			return { ketQua: "nhan", soThongBao: 0 };
		}
		if (cu.commitLuc.getTime() >= commitLuc.getTime())
			return {
				ketQua: cu.sha === vao.sha ? "trung" : "cu-hon",
				soThongBao: 0,
			};
		await tx.banChupLoTrinh.update({ where: { nguon: vao.nguon }, data: moi });
		if (vao.nguon !== BAN_CHUP_LO_TRINH.nguonCrm)
			return { ketQua: "nhan", soThongBao: 0 };
		const choCu = choTinHieu(cu.duLieu);
		const choMoi = choTinHieu(vao.duLieu);
		baoNeuKhongDoc(choCu, "cu", vao, tuyChon.canhBao);
		baoNeuKhongDoc(choMoi, "moi", vao, tuyChon.canhBao);
		const data = await thongBaoCuaLanDoi(
			tx,
			doiCho(choCu, choMoi),
			vao.sha,
			now,
		);
		const soThongBao =
			data.length === 0
				? 0
				: await (tuyChon.ghiThongBao ?? ghiMacDinh)(tx, data);
		return { ketQua: "nhan", soThongBao };
	});
}

export async function ghiBanChupVaBaoTinHieu(
	db: Db,
	vao: BanChupVao,
	now: Date,
	tuyChon: TuyChonDoiCho = {},
): Promise<KetQuaGhiVaBao> {
	try {
		return await motLuot(db, vao, now, tuyChon);
	} catch (loi) {
		if (!laTrungKhoa(loi)) throw loi;
		return motLuot(db, vao, now, tuyChon);
	}
}
