import { z } from "zod";
import { LICH_LAM_VIEC, type LichLam } from "./lich-lam-viec";
import { SETTINGS_ID } from "./settings";
import type { DbGhi } from "./zalo-lien-ket";

export const DU_AN = {
	tenToiDa: 120,
	moTaToiDa: 4000,
	viecToiDa: 300,
	mocToiDa: 50,
	phuThuocToiDa: 600,
	ngayLeToiDa: 200,
	tenNgayLeToiDa: 80,
	thongDiep: {
		khongCoDuAn: (id: string) => `Không có dự án nào mang mã ${id}.`,
		daDong: "Dự án đã đóng.",
		batDauSauHan: "Ngày bắt đầu phải trước hay trùng hạn.",
		batDauTruocViecCho: (ten: string, han: string) =>
			`Việc này phải bắt đầu sau khi «${ten}» xong (hạn ${ngayNgan(han)}).`,
		vong: (chuoi: string[]) =>
			`Phụ thuộc này tạo vòng: ${chuoi.map((t) => `«${t}»`).join(" → ")}.`,
		khacDuAn: "Hai việc phải cùng một dự án.",
		tuCho: "Một việc không chờ chính nó.",
		daCoPhuThuoc: "Hai việc này đã có phụ thuộc.",
		thieuNgay: "Đặt ngày bắt đầu và hạn cho cả hai việc trước.",
		chiGiaoThucHienPhaiCho: (ten: string) =>
			`Chỉ người giao và người thực hiện của «${ten}» được đặt việc phải chờ.`,
		chiNguoiTaoDong:
			"Chỉ người tạo dự án và quản trị được đóng, mở lại hay xoá dự án.",
		coLichSu: "Dự án đã có lịch sử nên không xoá được; hãy đóng dự án.",
		viecToiDa: "Một dự án chứa tối đa 300 việc.",
		ngayLeTrung: "Ngày này đã là ngày lễ.",
		tenTrong: "Tên không được để trống.",
	},
} as const;

export function ngayNgan(ngay: string): string {
	const [, m, d] = ngay.split("-");
	return `${d}/${m}`;
}

export async function docLichLam(tx: DbGhi): Promise<LichLam> {
	const [cai, le] = await Promise.all([
		tx.appSetting.findUnique({
			where: { id: SETTINGS_ID },
			select: { ngayNghiTuan: true },
		}),
		tx.ngayNghi.findMany({ select: { ngay: true }, orderBy: { ngay: "asc" } }),
	]);
	const tuan = cai?.ngayNghiTuan ?? [];
	return {
		ngayNghiTuan:
			tuan.length > 0 ? tuan : [...LICH_LAM_VIEC.ngayNghiTuanMacDinh],
		ngayLe: le.map((h) => h.ngay.toISOString().slice(0, 10)),
	};
}

export const LOAI_VET_DU_AN = [
	"tao",
	"doi-noi-dung",
	"them-viec",
	"bot-viec",
	"them-moc",
	"sua-moc",
	"xoa-moc",
	"dong",
	"mo-lai",
] as const;

export type LoaiVetDuAn = (typeof LOAI_VET_DU_AN)[number];

const viecNgan = z.object({ id: z.string(), tieuDe: z.string() });
const mocNgan = z.object({ id: z.string(), ten: z.string(), ngay: z.string() });
const noiDung = z.object({ ten: z.string(), moTa: z.string().nullable() });

export const vetDuAn = z.discriminatedUnion("loai", [
	z.object({ loai: z.literal("tao"), truoc: z.null(), sau: noiDung }),
	z.object({ loai: z.literal("doi-noi-dung"), truoc: noiDung, sau: noiDung }),
	z.object({ loai: z.literal("them-viec"), truoc: z.null(), sau: viecNgan }),
	z.object({ loai: z.literal("bot-viec"), truoc: viecNgan, sau: z.null() }),
	z.object({ loai: z.literal("them-moc"), truoc: z.null(), sau: mocNgan }),
	z.object({ loai: z.literal("sua-moc"), truoc: mocNgan, sau: mocNgan }),
	z.object({ loai: z.literal("xoa-moc"), truoc: mocNgan, sau: z.null() }),
	z.object({ loai: z.literal("dong"), truoc: z.null(), sau: z.null() }),
	z.object({ loai: z.literal("mo-lai"), truoc: z.null(), sau: z.null() }),
]);

export type VetDuAn = z.infer<typeof vetDuAn>;

export function parseVetDuAn(hang: {
	loai: string;
	truoc: unknown;
	sau: unknown;
}): VetDuAn {
	return vetDuAn.parse({ loai: hang.loai, truoc: hang.truoc, sau: hang.sau });
}

export async function coLichSuDuAn(
	tx: DbGhi,
	duAnId: string,
): Promise<boolean> {
	const n = await tx.duAnVet.count({
		where: { duAnId, loai: { not: "tao" } },
	});
	return n > 0;
}
