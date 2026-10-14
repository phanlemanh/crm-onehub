import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";
import { TRO_LY_OKR_TRAN } from "./okr-tro-ly-danh-muc";
import { DIEU_KIEN_DANG_DUNG } from "./tai-lieu-tim";

type DbHoacTx = Db | Prisma.TransactionClient;

export const LOAI_TRANG_CHIEN_LUOC = "chien-luoc";

export type KiemChienLuoc = {
	soKyTu: number;
	tranKyTu: number;
	quaTran: boolean;
	canhBaoTuCam: string[];
};

export type TrangChienLuoc = {
	ten: string;
	xacMinhDen: Date | null;
	noiDung: string;
};

function chuanHoa(s: string): string {
	return s
		.normalize("NFC")
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join(" ");
}

export function tuCamTrong(vanBan: string): string[] {
	const van = ` ${chuanHoa(vanBan)} `;
	return TRO_LY_OKR_TRAN.tuCamTrangChienLuoc.filter((tu) =>
		van.includes(` ${chuanHoa(tu)} `),
	);
}

export function kiemTrangChienLuoc(noiDung: string): KiemChienLuoc {
	const soKyTu = noiDung.normalize("NFC").length;
	const tranKyTu = TRO_LY_OKR_TRAN.trangChienLuocKyTu;
	return {
		soKyTu,
		tranKyTu,
		quaTran: soKyTu > tranKyTu,
		canhBaoTuCam: tuCamTrong(noiDung),
	};
}

export async function docTrangChienLuocDangDung(
	db: DbHoacTx,
): Promise<TrangChienLuoc[]> {
	const rows = await db.taiLieuTrang.findMany({
		where: { loai: LOAI_TRANG_CHIEN_LUOC, ...DIEU_KIEN_DANG_DUNG },
		orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
		select: {
			ten: true,
			xacMinhDen: true,
			banDangDung: { select: { noiDung: true } },
		},
	});
	return rows.flatMap((r) =>
		r.banDangDung
			? [
					{
						ten: r.ten,
						xacMinhDen: r.xacMinhDen,
						noiDung: r.banDangDung.noiDung,
					},
				]
			: [],
	);
}
