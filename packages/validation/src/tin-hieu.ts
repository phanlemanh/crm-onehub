import { z } from "zod";

export const TIN_HIEU = {
	tranMoiNgay: 10,
	doDaiToiDa: 2000,
	nguongDem: 200,
	doDaiTieuDe: 120,
	doDaiMan: 200,
	ngayDem: 30,
	phien: "crm",
	thuMucNguon: "tin-hieu/crm",
	loi: {
		quaTran:
			"Hôm nay bạn đã gửi {tran} tín hiệu — gửi tiếp được từ 0 giờ ngày mai.",
		daLayVe: "Đội sản phẩm đã lấy tín hiệu này về — không xoá được nữa.",
		khongCo: "Không có tín hiệu này.",
	},
} as const;

export const guiTinHieuInput = z.object({
	chu: z
		.string()
		.max(TIN_HIEU.doDaiToiDa)
		.refine((chu) => chu.trim().length > 0),
	man: z.string(),
});
export type GuiTinHieuInput = z.infer<typeof guiTinHieuInput>;

export const xoaTinHieuInput = z.object({ id: z.string().min(1) });

export function idTep(so: number): string {
	return `${TIN_HIEU.phien}-${so}`;
}

export function lamSachMan(duong: string): string {
	const cat = duong.split(/[?#]/)[0] ?? "";
	return (cat || "/").slice(0, TIN_HIEU.doDaiMan);
}

export function tachNoiDung(chu: string) {
	const sach = chu.trim();
	const dongDau =
		sach
			.split("\n")
			.map((d) => d.trim())
			.find((d) => d.length > 0) ?? "";
	const tieuDe =
		dongDau.length > TIN_HIEU.doDaiTieuDe
			? `${dongDau.slice(0, TIN_HIEU.doDaiTieuDe)}…`
			: dongDau;
	return { tieuDe, moTa: sach === dongDau ? null : sach };
}

export const tepTinHieu = z.object({
	phien: z.literal(TIN_HIEU.phien),
	loai: z.literal("tin-hieu"),
	hang: z.null(),
	noi_dung: z.object({
		tieu_de: z.string().min(1),
		man: z.string(),
		mo_ta: z.string().optional(),
	}),
	luc: z.string().datetime(),
});
export type TepTinHieu = z.infer<typeof tepTinHieu>;

export function tepTuBanGhi(row: {
	tieuDe: string;
	moTa: string | null;
	man: string;
	guiLuc: Date;
}): TepTinHieu {
	const noiDung: TepTinHieu["noi_dung"] = { tieu_de: row.tieuDe, man: row.man };
	if (row.moTa) noiDung.mo_ta = row.moTa;
	return {
		phien: TIN_HIEU.phien,
		loai: "tin-hieu",
		hang: null,
		noi_dung: noiDung,
		luc: row.guiLuc.toISOString(),
	};
}

export function vietTep(tep: TepTinHieu): string {
	return `${JSON.stringify(tepTinHieu.parse(tep), null, 2)}\n`;
}

export const keoVeOutput = z.object({
	tep: z.array(
		z.object({
			id: z.string(),
			tep: tepTinHieu,
			phongBan: z.string().nullable(),
		}),
	),
});
export type KeoVeOutput = z.infer<typeof keoVeOutput>;

export const CHO_TIN_HIEU = [
	"chua-gom",
	"le",
	"da-phu",
	"nhom-chua-cat",
	"chan-troi",
	"hang-chua-ho-so",
	"hang-co-ho-so",
] as const;
export type ChoTinHieu = (typeof CHO_TIN_HIEU)[number];

export const duongTinHieu = z.object({
	id: z.string(),
	loai: z.string(),
	tieu_de: z.string(),
	luc: z.string(),
	cho: z.enum(CHO_TIN_HIEU),
	nhom: z.string().nullable(),
	ten_nhom: z.string().nullable(),
	ly_do: z.string().nullable(),
	ho_so_phu: z.string().nullable(),
	hang: z.string().nullable(),
	ho_so: z.string().nullable(),
	trang_thai: z.string().nullable(),
	cau: z.string().min(1),
});
export type DuongTinHieu = z.infer<typeof duongTinHieu>;

export type KetQuaDuong =
	| { kieu: "co"; banGhi: DuongTinHieu[] }
	| { kieu: "khong-co" }
	| { kieu: "hong"; loi: string };

export function parseDuongTinHieu(raw: unknown): KetQuaDuong {
	if (raw === undefined) return { kieu: "khong-co" };
	const kq = z.array(duongTinHieu).safeParse(raw);
	if (!kq.success) {
		const van = kq.error.issues[0];
		return {
			kieu: "hong",
			loi: `tin_hieu${van ? `.${van.path.join(".")}` : ""}: ${van?.message ?? "sai khuôn"}`,
		};
	}
	return { kieu: "co", banGhi: kq.data };
}
