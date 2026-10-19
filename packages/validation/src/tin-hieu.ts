import { z } from "zod";

export const TIN_HIEU = {
	tranMoiNgay: 10,
	doDaiMoiO: 1000,
	nguongDem: 200,
	doDaiTieuDe: 120,
	doDaiMan: 200,
	ngayDem: 30,
	ngayCoCho: 7,
	coTrangTatCa: 50,
	phien: "crm",
	thuMucNguon: "tin-hieu/crm",
	loi: {
		quaTran:
			"Hôm nay bạn đã gửi {tran} tín hiệu — gửi tiếp được từ 0 giờ ngày mai.",
		daLayVe: "Đội sản phẩm đã lấy tín hiệu này về — không xoá được nữa.",
		khongCo: "Không có tín hiệu này.",
	},
} as const;

const oChu = z
	.string()
	.max(TIN_HIEU.doDaiMoiO)
	.refine((chu) => chu.trim().length > 0);

export const guiTinHieuInput = z.object({
	muonLam: oChu,
	daXayRa: oChu,
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

export function dungNoiDung(input: { muonLam: string; daXayRa: string }) {
	const daXayRa = input.daXayRa.trim();
	const dongDau =
		daXayRa
			.split("\n")
			.map((d) => d.trim())
			.find((d) => d.length > 0) ?? "";
	const tieuDe =
		dongDau.length > TIN_HIEU.doDaiTieuDe
			? `${dongDau.slice(0, TIN_HIEU.doDaiTieuDe)}…`
			: dongDau;
	return { tieuDe, muonLam: input.muonLam.trim(), daXayRa };
}

export const tepTinHieu = z.object({
	phien: z.literal(TIN_HIEU.phien),
	loai: z.literal("tin-hieu"),
	hang: z.null(),
	noi_dung: z.object({
		tieu_de: z.string().min(1),
		muon_lam: z.string().min(1),
		da_xay_ra: z.string().min(1),
		man: z.string(),
	}),
	luc: z.string().datetime(),
});
export type TepTinHieu = z.infer<typeof tepTinHieu>;

export function tepTuBanGhi(row: {
	tieuDe: string;
	muonLam: string;
	daXayRa: string;
	man: string;
	guiLuc: Date;
}): TepTinHieu {
	return {
		phien: TIN_HIEU.phien,
		loai: "tin-hieu",
		hang: null,
		noi_dung: {
			tieu_de: row.tieuDe,
			muon_lam: row.muonLam,
			da_xay_ra: row.daXayRa,
			man: row.man,
		},
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
			phongBanId: z.string().nullable().optional(),
			keoVeLuc: z.string().datetime().optional(),
		}),
	),
	dongDauLuc: z.string().datetime().nullable().optional(),
});
export type KeoVeOutput = z.infer<typeof keoVeOutput>;

export function bocPhanHoiKeoVe(
	tep: KeoVeOutput["tep"],
	dongDauLuc?: string | null,
): KeoVeOutput {
	return dongDauLuc === undefined ? { tep } : { tep, dongDauLuc };
}

export function docPhanHoiKeoVeDayDu(body: unknown): KeoVeOutput {
	const kq = keoVeOutput.safeParse(body);
	if (!kq.success)
		throw new Error(
			`lệnh kéo về lệch vỏ phản hồi REST: ${kq.error.issues[0]?.message ?? "sai vỏ"}`,
		);
	return kq.data;
}

export function docPhanHoiKeoVe(body: unknown): KeoVeOutput["tep"] {
	return docPhanHoiKeoVeDayDu(body).tep;
}

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
	cau_nguoi_gui: z.string().min(1).optional(),
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

const MS_NGAY = 86_400_000;

export type DongDem = {
	id: string;
	luc: string;
	phongBan: { khoa: string; ten: string } | null;
};

export type NguongSong = {
	trongKy: number;
	soPhong: number;
	theoPhong: [string, number][];
	khongPhong: number;
	quaHan: number;
	chuaCoCho: number;
};

export function demNguongSong(
	ds: DongDem[],
	now: Date,
	coCho: ReadonlySet<string>,
): NguongSong {
	const tuoi = (luc: string) => (now.getTime() - Date.parse(luc)) / MS_NGAY;
	const trong = ds.filter((d) => tuoi(d.luc) <= TIN_HIEU.ngayDem);
	const theoKhoa = new Map<string, { ten: string; so: number }>();
	let khongPhong = 0;
	for (const d of trong) {
		if (d.phongBan === null) {
			khongPhong += 1;
			continue;
		}
		const cu = theoKhoa.get(d.phongBan.khoa);
		theoKhoa.set(d.phongBan.khoa, {
			ten: d.phongBan.ten,
			so: (cu?.so ?? 0) + 1,
		});
	}
	const qua = ds.filter((d) => tuoi(d.luc) > TIN_HIEU.ngayCoCho);
	return {
		trongKy: trong.length,
		soPhong: theoKhoa.size,
		theoPhong: [...theoKhoa.values()]
			.sort((a, b) => a.ten.localeCompare(b.ten, "vi") || b.so - a.so)
			.map((x): [string, number] => [x.ten, x.so]),
		khongPhong,
		quaHan: qua.length,
		chuaCoCho: qua.filter((d) => !coCho.has(d.id)).length,
	};
}

export function coChoSauGom(kq: KetQuaDuong): Set<string> {
	if (kq.kieu !== "co") return new Set();
	return new Set(
		kq.banGhi.filter((b) => b.cho !== "chua-gom").map((b) => b.id),
	);
}

export function dongDemTuKeoVe(tep: KeoVeOutput["tep"]): DongDem[] {
	return tep.map((t) => ({
		id: t.id,
		luc: t.tep.luc,
		phongBan:
			t.phongBan === null
				? null
				: { khoa: t.phongBanId ?? t.phongBan, ten: t.phongBan },
	}));
}

export function dongDemTuTatCa(
	rows: {
		ma: string;
		guiLuc: Date | string;
		phongBan: { id: string; ten: string } | null;
	}[],
): DongDem[] {
	return rows.map((r) => ({
		id: r.ma,
		luc: new Date(r.guiLuc).toISOString(),
		phongBan: r.phongBan ? { khoa: r.phongBan.id, ten: r.phongBan.ten } : null,
	}));
}

const nhomHangKhoi = z.object({
	lo_trinh: z.array(
		z.object({
			hang: z.array(z.object({ ma: z.string(), nhom_trang_thai: z.string() })),
		}),
	),
});

export function docNhomHang(duLieu: unknown): Map<string, string> {
	const kq = nhomHangKhoi.safeParse(duLieu);
	if (!kq.success) return new Map();
	return new Map(
		kq.data.lo_trinh.flatMap((lo) =>
			lo.hang.map((h) => [h.ma, h.nhom_trang_thai] as const),
		),
	);
}
