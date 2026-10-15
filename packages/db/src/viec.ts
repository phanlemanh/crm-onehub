import { z } from "zod";
import type { Prisma } from "./generated/prisma/client";
import { TrangThaiViec } from "./generated/prisma/enums";
import type { DbGhi } from "./zalo-lien-ket";

export const TRANG_THAI_VIEC = [
	TrangThaiViec.CHUA_LAM,
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
	TrangThaiViec.XONG,
	TrangThaiViec.HUY,
] as const;

export const TRANG_THAI_MO: readonly TrangThaiViec[] = [
	TrangThaiViec.CHUA_LAM,
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
];

export const TRANG_THAI_KHEP: readonly TrangThaiViec[] = [
	TrangThaiViec.XONG,
	TrangThaiViec.HUY,
];

export const DICH_ROI_CHUA_LAM: readonly TrangThaiViec[] = [
	TrangThaiViec.DANG_LAM,
	TrangThaiViec.CHO_DANH_GIA,
	TrangThaiViec.XONG,
];

export function roiChuaLamMoi(
	v: {
		roiChuaLamLuc: Date | null;
		nguoiThucHienId: string;
		trangThai: TrangThaiViec;
	},
	nguoiId: string,
	den: TrangThaiViec,
): boolean {
	return (
		v.roiChuaLamLuc === null &&
		v.nguoiThucHienId === nguoiId &&
		v.trangThai === TrangThaiViec.CHUA_LAM &&
		DICH_ROI_CHUA_LAM.includes(den)
	);
}

export type QuyenDoi = "G" | "GT";

export type DoThiViec = Record<
	TrangThaiViec,
	Partial<Record<TrangThaiViec, QuyenDoi>>
>;

export const DO_THI: DoThiViec = {
	CHUA_LAM: { DANG_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	DANG_LAM: { CHUA_LAM: "GT", CHO_DANH_GIA: "GT", XONG: "GT", HUY: "G" },
	CHO_DANH_GIA: { DANG_LAM: "G", XONG: "G", HUY: "G" },
	XONG: { DANG_LAM: "G" },
	HUY: { CHUA_LAM: "G" },
};

export const NHOM_VIEC = ["giao-cho-toi", "toi-giao", "dang-theo-doi"] as const;

export type NhomViec = (typeof NHOM_VIEC)[number];

export const NGUON_VIEC = [
	"web",
	"zalo",
	"api",
	"chuyen-viec",
	"tac-nhan",
	"chep-cu",
	"bang-keo",
	"bang-menu",
	"khuon",
	"ke-hoach",
	"dong-ke-hoach",
] as const;

export type NguonViec = (typeof NGUON_VIEC)[number];

export const LOAI_VET_VIEC = [
	"tao",
	"doi-trang-thai",
	"doi-nguoi-thuc-hien",
	"doi-han",
	"doi-noi-dung",
	"gan",
	"go",
	"theo-doi",
	"bo-theo-doi",
	"chuyen-viec",
	"go-do-ban-ghi-xoa",
	"them-viec-con",
] as const;

export const LOAI_BAN_GHI = ["company", "contact", "deal", "plan"] as const;

export type LoaiBanGhi = (typeof LOAI_BAN_GHI)[number];

export const LOAI_NHAC_VIEC = [
	"viec-qua-han",
	"viec-sap-han",
	"viec-cho-danh-gia",
] as const;

export type LoaiNhacViec = (typeof LOAI_NHAC_VIEC)[number];

const NHAN = {
	CHUA_LAM: "Chưa làm",
	DANG_LAM: "Đang làm",
	CHO_DANH_GIA: "Chờ đánh giá",
	XONG: "Xong",
	HUY: "Huỷ",
} as const satisfies Record<TrangThaiViec, string>;

const TEN_LOAI = {
	company: "công ty",
	contact: "cá nhân",
	deal: "thoả thuận",
	plan: "kế hoạch 30 ngày",
} as const satisfies Record<LoaiBanGhi, string>;

const PHUT_MS = 60_000;

export const VIEC = {
	tieuDeToiDa: 200,
	tieuDeViecCanLam: "Việc cần làm",
	chepThuTranMs: 10 * PHUT_MS,
	khoaMaLech: (ma: string) => `ma-lech:${ma}`,
	vaiChepDuoc: ["owner", "admin"] as readonly string[],
	moTaToiDa: 4000,
	theoDoiToiDa: 20,
	tranKhep: 50,
	tranTongQuan: 10,
	soDongCho: 5,
	muiGio: "Asia/Ho_Chi_Minh",
	nhan: NHAN,
	lam: {
		batDau: "bắt đầu việc",
		lamLai: "trả việc để làm lại",
		moLai: "mở lại việc",
		veChuaLam: "đưa việc về «Chưa làm»",
		guiDanhGia: "gửi việc để đánh giá",
		xong: "đánh dấu xong",
		huy: "huỷ việc",
		sua: "sửa việc",
		doiNguoi: "đổi người thực hiện",
		gan: "gắn hay gỡ bản ghi",
		theoDoiKhac: "thêm hay bỏ người theo dõi khác",
		xoa: "xoá việc",
		themCon: "thêm việc con",
	},
	thongDiep: {
		khongCoViec: (id: string) => `Không có việc nào mang mã ${id}.`,
		khongChuyenDuoc: (nguon: TrangThaiViec, dich: TrangThaiViec) =>
			`Không chuyển được việc từ «${NHAN[nguon]}» sang «${NHAN[dich]}».`,
		chiNguoiGiao: (lam: string) => `Chỉ người giao được ${lam}.`,
		chiGiaoVaThucHien: (lam: string) =>
			`Chỉ người giao và người thực hiện được ${lam}.`,
		coLichSu: "Việc đã có lịch sử nên không xoá được — huỷ việc thay vì xoá.",
		khongPhaiThanhVien: (id: string) =>
			`Người ${id} không phải thành viên đang hoạt động.`,
		vaiChiOkr: (ten: string) =>
			`${ten} mang vai «chỉ OKR» — không nhận được việc gắn dữ liệu đối tác.`,
		khongCoBanGhi: (loai: LoaiBanGhi, id: string) =>
			`Không có ${TEN_LOAI[loai]} nào mang mã ${id}.`,
		dungMotBanGhi:
			"Chọn đúng một bản ghi: công ty, cá nhân, thoả thuận hoặc kế hoạch 30 ngày.",
		vetHong: (id: string, chiTiet: string) =>
			`Vết việc ${id} không đọc được: ${chiTiet}`,
		ganHong: (id: string) => `Hàng gắn ${id} không trỏ tới bản ghi nào.`,
		chiQuanTriChep:
			"Chỉ quản trị chạy được lệnh chép việc cần làm — truyền --nguoi <email của một quản trị>.",
		khongPhaiBanChep: (id: string) =>
			`Việc ${id} không phải bản chép từ việc cần làm cũ.`,
		conKhongCoCon: "Việc con không có việc con.",
		chiThemConKhiMo: "Chỉ thêm việc con cho việc đang mở.",
		goBuocOKeHoach:
			"Việc này là một bước của kế hoạch 30 ngày — gỡ bước ở kế hoạch thay vì huỷ, xoá hay gỡ khỏi kế hoạch.",
		buocLuonCoHan:
			"Việc của bước luôn có hạn — đổi hạn ở bước; muốn bỏ thì gỡ bước ở kế hoạch.",
		buocLuonCoNguoi:
			"Việc của bước luôn có người làm — chọn người khác thay vì bỏ giao.",
	},
	bang: { xongGanDayNgay: 7 },
} as const;

const dinhNgayHan = new Intl.DateTimeFormat("en-CA", {
	timeZone: VIEC.muiGio,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

export function hanTheoNgayVN(d: Date): Date {
	return new Date(`${dinhNgayHan.format(d)}T00:00:00.000Z`);
}

export function hanhDong(nguon: TrangThaiViec, den: TrangThaiViec): string {
	if (den === TrangThaiViec.HUY) return VIEC.lam.huy;
	if (den === TrangThaiViec.XONG) return VIEC.lam.xong;
	if (den === TrangThaiViec.CHO_DANH_GIA) return VIEC.lam.guiDanhGia;
	if (den === TrangThaiViec.CHUA_LAM) {
		return nguon === TrangThaiViec.HUY ? VIEC.lam.moLai : VIEC.lam.veChuaLam;
	}
	return nguon === TrangThaiViec.CHUA_LAM ? VIEC.lam.batDau : VIEC.lam.lamLai;
}

export type VaiTrongViec = {
	giao: boolean;
	thucHien: boolean;
	theoDoi: boolean;
};

export function vaiCua(
	v: {
		nguoiGiaoId: string;
		nguoiThucHienId: string;
		theoDoi: { userId: string }[];
	},
	userId: string,
): VaiTrongViec {
	return {
		giao: v.nguoiGiaoId === userId,
		thucHien: v.nguoiThucHienId === userId,
		theoDoi: v.theoDoi.some((t) => t.userId === userId),
	};
}

export type KetQuyenDoi = "duoc" | "khong-hop-le" | "khong-quyen";

export function quyenDoi(
	nguon: TrangThaiViec,
	den: TrangThaiViec,
	vai: VaiTrongViec,
): KetQuyenDoi {
	const o = DO_THI[nguon][den];
	if (o === undefined) return "khong-hop-le";
	const duoc = o === "G" ? vai.giao : vai.giao || vai.thucHien;
	if (!duoc) return "khong-quyen";
	return "duoc";
}

export function dichDuoc(
	nguon: TrangThaiViec,
	vai: VaiTrongViec,
): TrangThaiViec[] {
	return TRANG_THAI_VIEC.filter((den) => quyenDoi(nguon, den, vai) === "duoc");
}

export function chuyenDuocCua(
	v: {
		trangThai: TrangThaiViec;
		nguoiGiaoId: string;
		nguoiThucHienId: string;
		theoDoi: { userId: string }[];
	},
	userId: string,
): TrangThaiViec[] {
	return dichDuoc(v.trangThai, vaiCua(v, userId));
}

export function laMoLai(nguon: TrangThaiViec, den: TrangThaiViec): boolean {
	return (
		(nguon === TrangThaiViec.CHO_DANH_GIA || TRANG_THAI_KHEP.includes(nguon)) &&
		TRANG_THAI_MO.includes(den)
	);
}

export type BanGhiGan = { loai: LoaiBanGhi; id: string };

export type CotGan = {
	companyId?: string;
	contactId?: string;
	dealId?: string;
	planId?: string;
};

export function cotGan(b: BanGhiGan): CotGan {
	switch (b.loai) {
		case "company":
			return { companyId: b.id };
		case "contact":
			return { contactId: b.id };
		case "deal":
			return { dealId: b.id };
		case "plan":
			return { planId: b.id };
	}
}

export function dieuKienGanCua(b: BanGhiGan): Prisma.ViecGanWhereInput {
	if (b.loai !== "company") return cotGan(b);
	return {
		OR: [
			{ companyId: b.id },
			{ deal: { companyId: b.id } },
			{ contact: { companyId: b.id } },
			{ plan: { companyId: b.id } },
		],
	};
}

export function dieuKienXemViec(userId: string): Prisma.ViecWhereInput {
	return {
		OR: [
			{ gan: { some: {} } },
			{ nguoiGiaoId: userId },
			{ nguoiThucHienId: userId },
			{ theoDoi: { some: { userId } } },
		],
	};
}

export function dieuKienNhom(
	nhom: NhomViec,
	userId: string,
): Prisma.ViecWhereInput {
	switch (nhom) {
		case "giao-cho-toi":
			return { nguoiThucHienId: userId };
		case "toi-giao":
			return { nguoiGiaoId: userId, nguoiThucHienId: { not: userId } };
		case "dang-theo-doi":
			return { theoDoi: { some: { userId } } };
	}
}

export function dieuKienViecMoCua(userId: string): Prisma.ViecWhereInput {
	return {
		trangThai: { in: [...TRANG_THAI_MO] },
		OR: [{ nguoiThucHienId: userId }, { nguoiGiaoId: userId }],
	};
}

export function demViecMoCua(tx: DbGhi, userId: string): Promise<number> {
	return tx.viec.count({ where: dieuKienViecMoCua(userId) });
}

const nguoiVet = z.object({ id: z.string(), ten: z.string() });

const banGhiVet = z.object({
	loai: z.enum(LOAI_BAN_GHI),
	id: z.string(),
	ten: z.string(),
});

const trangThaiVet = z.object({
	trangThai: z.enum(TRANG_THAI_VIEC),
	lyDo: z.string().optional(),
});

const hanVet = z.object({ hanNgay: z.string().nullable() });

const noiDungVet = z.object({
	tieuDe: z.string(),
	moTa: z.string().nullable(),
});

const haiNguoiVet = z.object({ nguoiGiao: nguoiVet, nguoiThucHien: nguoiVet });

export const vetViec = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("tao"),
		truoc: z.null(),
		sau: z.object({
			tieuDe: z.string(),
			nguoiThucHien: nguoiVet,
			hanNgay: z.string().nullable(),
			banGhi: z.array(banGhiVet),
			nguoiTheoDoi: z.array(nguoiVet),
			chep: z
				.object({
					activityGocId: z.string(),
					trangThai: z.enum(TRANG_THAI_VIEC),
					nguoiTaoGoc: nguoiVet.nullable(),
				})
				.optional(),
		}),
	}),
	z.object({
		loai: z.literal("doi-trang-thai"),
		truoc: trangThaiVet,
		sau: trangThaiVet,
	}),
	z.object({
		loai: z.literal("doi-nguoi-thuc-hien"),
		truoc: nguoiVet,
		sau: nguoiVet,
	}),
	z.object({ loai: z.literal("doi-han"), truoc: hanVet, sau: hanVet }),
	z.object({
		loai: z.literal("doi-noi-dung"),
		truoc: noiDungVet,
		sau: noiDungVet,
	}),
	z.object({ loai: z.literal("gan"), truoc: z.null(), sau: banGhiVet }),
	z.object({ loai: z.literal("go"), truoc: banGhiVet, sau: z.null() }),
	z.object({ loai: z.literal("theo-doi"), truoc: z.null(), sau: nguoiVet }),
	z.object({ loai: z.literal("bo-theo-doi"), truoc: nguoiVet, sau: z.null() }),
	z.object({
		loai: z.literal("chuyen-viec"),
		truoc: haiNguoiVet,
		sau: haiNguoiVet,
	}),
	z.object({
		loai: z.literal("go-do-ban-ghi-xoa"),
		truoc: banGhiVet,
		sau: z.object({ ten: z.string() }),
	}),
	z.object({
		loai: z.literal("them-viec-con"),
		truoc: z.null(),
		sau: z.object({ conId: z.string(), tieuDe: z.string() }),
	}),
]);

const viecCanLamMeta = z
	.object({ platformBrokerId: z.string().trim().min(1).optional() })
	.nullable();

export type ViecCanLamMeta = { platformBrokerId: string | null };

export function parseViecCanLamMeta(
	value: Prisma.JsonValue | null,
): ViecCanLamMeta {
	const meta = viecCanLamMeta.parse(value ?? null);
	return { platformBrokerId: meta?.platformBrokerId ?? null };
}

export type VetViec = z.infer<typeof vetViec>;

export type NguoiVet = z.infer<typeof nguoiVet>;

export type BanGhiVet = z.infer<typeof banGhiVet>;

export function parseVetViec(hang: {
	id: string;
	loai: string;
	truoc: unknown;
	sau: unknown;
}): VetViec {
	const ket = vetViec.safeParse({
		loai: hang.loai,
		truoc: hang.truoc,
		sau: hang.sau,
	});
	if (!ket.success) {
		throw new Error(VIEC.thongDiep.vetHong(hang.id, ket.error.message));
	}
	return ket.data;
}

export const nguonViec = z.enum(NGUON_VIEC);

export type HangVetDaDoc = { nguon: NguonViec; vet: VetViec };

export function parseHangVet(hang: {
	id: string;
	nguon: string;
	loai: string;
	truoc: unknown;
	sau: unknown;
}): HangVetDaDoc {
	const nguon = nguonViec.safeParse(hang.nguon);
	if (!nguon.success) {
		throw new Error(VIEC.thongDiep.vetHong(hang.id, `nguon ${hang.nguon}`));
	}
	return { nguon: nguon.data, vet: parseVetViec(hang) };
}

export const CHON_GAN = {
	id: true,
	viecId: true,
	companyId: true,
	contactId: true,
	dealId: true,
	planId: true,
	company: { select: { name: true } },
	contact: { select: { firstName: true, lastName: true } },
	deal: { select: { name: true } },
	plan: { select: { company: { select: { name: true } } } },
} as const satisfies Prisma.ViecGanSelect;

export type HangGan = Prisma.ViecGanGetPayload<{ select: typeof CHON_GAN }>;

const CHON_NGUOI = { select: { id: true, name: true, image: true } } as const;

export const CHON_VIEC = {
	id: true,
	tieuDe: true,
	moTa: true,
	trangThai: true,
	hanNgay: true,
	taoLuc: true,
	khepLuc: true,
	nguoiGiaoId: true,
	nguoiThucHienId: true,
	nguoiGiao: CHON_NGUOI,
	nguoiThucHien: CHON_NGUOI,
	theoDoi: {
		select: { userId: true, user: CHON_NGUOI },
		orderBy: { taoLuc: "asc" },
	},
	gan: { select: CHON_GAN, orderBy: { taoLuc: "asc" } },
} as const satisfies Prisma.ViecSelect;

export type HangViec = Prisma.ViecGetPayload<{ select: typeof CHON_VIEC }>;

export function tenKeHoach(congTy: string): string {
	return `Kế hoạch 30 ngày · ${congTy}`;
}

export function banGhiCua(g: HangGan): BanGhiVet {
	if (g.companyId && g.company) {
		return { loai: "company", id: g.companyId, ten: g.company.name };
	}
	if (g.contactId && g.contact) {
		const ten = [g.contact.firstName, g.contact.lastName]
			.filter(Boolean)
			.join(" ");
		return { loai: "contact", id: g.contactId, ten };
	}
	if (g.dealId && g.deal) {
		return { loai: "deal", id: g.dealId, ten: g.deal.name };
	}
	if (g.planId && g.plan) {
		return {
			loai: "plan",
			id: g.planId,
			ten: tenKeHoach(g.plan.company.name),
		};
	}
	throw new Error(VIEC.thongDiep.ganHong(g.id));
}

export function ngayHan(d: Date): string {
	return d.toISOString().slice(0, 10);
}

export function theoHan(
	a: { hanNgay: Date | null; taoLuc: Date },
	b: { hanNgay: Date | null; taoLuc: Date },
): number {
	const ha = a.hanNgay?.getTime() ?? Number.POSITIVE_INFINITY;
	const hb = b.hanNgay?.getTime() ?? Number.POSITIVE_INFINITY;
	return ha - hb || a.taoLuc.getTime() - b.taoLuc.getTime();
}

export async function docViecCuaBanGhi(
	db: DbGhi,
	b: BanGhiGan,
	userId: string,
): Promise<HangViec[]> {
	const hang = await db.viecGan.findMany({
		where: { ...dieuKienGanCua(b), viec: dieuKienXemViec(userId) },
		select: { viec: { select: CHON_VIEC } },
		orderBy: { taoLuc: "asc" },
	});
	return [...new Map(hang.map((h) => [h.viec.id, h.viec])).values()];
}
