import { z } from "zod";
import { chuanNfc } from "./tai-lieu";
import { coSoTronVen, rutSoChu } from "./tai-lieu-so";

export const KENH_HOI = ["CRM", "ZALO"] as const;
export type KenhHoi = (typeof KENH_HOI)[number];

export const TRANG_THAI_HOI = [
	"DANG_HOI",
	"TRA_LOI",
	"TU_CHOI",
	"LOI",
] as const;
export type TrangThaiHoi = (typeof TRANG_THAI_HOI)[number];

export const LY_DO_TU_CHOI = ["khong-co-trang", "trich-truot"] as const;
export type LyDoTuChoi = (typeof LY_DO_TU_CHOI)[number];

export const LY_DO_LOI = ["het-tran", "loi-model", "qua-han"] as const;
export type LyDoLoi = (typeof LY_DO_LOI)[number];

export const TRANG_THAI_BAO_SAI = ["MO", "DA_XU_LY"] as const;
export type TrangThaiBaoSai = (typeof TRANG_THAI_BAO_SAI)[number];

export const KET_LUAN_BAO_SAI = ["SAI", "DUNG"] as const;
export type KetLuanBaoSai = (typeof KET_LUAN_BAO_SAI)[number];

export const TAI_LIEU_HOI = {
	cauHoi: { toiThieu: 2, toiDa: 500 },
	ghiChu: { toiDa: 500 },
	trich: { toiThieu: 12, cauToiDa: 8, trichMoiCau: 4, chuToiDa: 600 },
	ganNhatToiDa: 3,
	tran: { ngay: 20, thang: 600 },
	tuChoi: "Chưa có trang đã duyệt nào trả lời câu này. Mình không đoán.",
	ganNhat: "Trang gần nhất: {ten}",
	hetTran: "Trợ lý AI tạm dừng vì hết hạn mức tháng.",
	chuaTraLoi: "Chưa trả lời được lúc này.",
	quaHan:
		"Trang «{ten}» đã quá hạn xác minh từ {ngay}; hỏi chủ trang {chu} trước khi làm theo.",
	tranNgay: "Hôm nay bạn đã hỏi đủ {so} câu. Hỏi lại từ ngày mai.",
	tranThang: "Kho đã dùng hết {so} câu hỏi của tháng này.",
} as const;

export const trichDaKiem = z.object({
	slug: z.string().min(1),
	ten: z.string().min(1),
	phienBan: z.number().int().positive(),
	duyetLuc: z.string().min(1),
	doan: z.string().min(1),
});
export type TrichDaKiem = z.infer<typeof trichDaKiem>;

export const cauDaKiem = z.object({
	chu: z.string().min(1),
	trich: z.array(trichDaKiem).min(1),
});
export type CauDaKiem = z.infer<typeof cauDaKiem>;

export const trangQuaHan = z.object({
	slug: z.string().min(1),
	ten: z.string().min(1),
	xacMinhDen: z.string().min(1),
	chuTrang: z.string().min(1),
});
export type TrangQuaHan = z.infer<typeof trangQuaHan>;

export const traLoiDaKiem = z.object({
	cau: z.array(cauDaKiem).min(1),
	quaHan: z.array(trangQuaHan),
});
export type TraLoiDaKiem = z.infer<typeof traLoiDaKiem>;

export const trangGanNhat = z.object({
	slug: z.string().min(1),
	ten: z.string().min(1),
});
export const ganNhat = z.array(trangGanNhat).max(TAI_LIEU_HOI.ganNhatToiDa);
export type GanNhat = z.infer<typeof ganNhat>;

export function parseTraLoi(v: unknown): TraLoiDaKiem {
	const r = traLoiDaKiem.safeParse(v);
	if (!r.success)
		throw new Error(`câu trả lời kho không đọc được: ${r.error.message}`);
	return r.data;
}

export function parseGanNhat(v: unknown): GanNhat {
	const r = ganNhat.safeParse(v);
	if (!r.success)
		throw new Error(`trang gần nhất không đọc được: ${r.error.message}`);
	return r.data;
}

export type BanDangDung = {
	slug: string;
	ten: string;
	phienBan: number;
	duyetLuc: string;
	noiDung: string;
	xacMinhDen: string | null;
	chuTrang: string;
};

export type BanNop = {
	cau: {
		chu: string;
		trich: { slug: string; phienBan: number; doan: string }[];
	}[];
};

export type LoiKiem = {
	loai:
		| "qua-nhieu"
		| "cau-rong"
		| "cau-khong-trich"
		| "trang-khong-co"
		| "phien-ban-cu"
		| "trich-ngan"
		| "trich-khong-co"
		| "so-khong-trich";
	chi: string;
};

export type KetQuaKiemTraLoi =
	| { ok: true; traLoi: TraLoiDaKiem }
	| { ok: false; loi: LoiKiem[] };

export function canhBaoQuaHan(
	trang: readonly BanDangDung[],
	dauHomNay: Date,
): TrangQuaHan[] {
	const da = new Set<string>();
	const ra: TrangQuaHan[] = [];
	for (const t of trang) {
		if (da.has(t.slug) || t.xacMinhDen === null) continue;
		if (new Date(t.xacMinhDen).getTime() >= dauHomNay.getTime()) continue;
		da.add(t.slug);
		ra.push({
			slug: t.slug,
			ten: t.ten,
			xacMinhDen: t.xacMinhDen,
			chuTrang: t.chuTrang,
		});
	}
	return ra;
}

export function chuanTrich(s: string): string {
	return chuanNfc(s).replace(/\s+/g, " ").trim();
}

export type ChuThuong = (md: string) => string;

function kiemMotTrich(
	t: { slug: string; phienBan: number; doan: string },
	trang: ReadonlyMap<string, BanDangDung>,
	chuThuong: ChuThuong,
): LoiKiem | null {
	const ban = trang.get(t.slug);
	if (!ban) return { loai: "trang-khong-co", chi: t.slug };
	if (t.phienBan !== ban.phienBan)
		return {
			loai: "phien-ban-cu",
			chi: `${t.slug}: bản đang dùng là ${ban.phienBan}`,
		};
	const tho = chuanTrich(t.doan);
	const thuong = chuanTrich(chuThuong(t.doan));
	if (thuong.length < TAI_LIEU_HOI.trich.toiThieu)
		return { loai: "trich-ngan", chi: tho };
	const khopTho = chuanTrich(ban.noiDung).includes(tho);
	const khopThuong = chuanTrich(chuThuong(ban.noiDung)).includes(thuong);
	if (!khopTho && !khopThuong) return { loai: "trich-khong-co", chi: tho };
	return null;
}

export function kiemTraLoi(
	ban: BanNop,
	trang: ReadonlyMap<string, BanDangDung>,
	dauHomNay: Date,
	chuThuong: ChuThuong,
): KetQuaKiemTraLoi {
	const hien = (doan: string) => chuanTrich(chuThuong(doan));
	const T = TAI_LIEU_HOI.trich;
	if (ban.cau.length === 0 || ban.cau.length > T.cauToiDa)
		return {
			ok: false,
			loi: [{ loai: "qua-nhieu", chi: `từ 1 tới ${T.cauToiDa} câu` }],
		};
	const loi: LoiKiem[] = [];
	ban.cau.forEach((cau, i) => {
		const ten = `câu ${i + 1}`;
		if (chuanNfc(cau.chu).trim().length === 0) {
			loi.push({ loai: "cau-rong", chi: ten });
			return;
		}
		if (cau.trich.length === 0) {
			loi.push({ loai: "cau-khong-trich", chi: ten });
			return;
		}
		if (cau.trich.length > T.trichMoiCau || cau.chu.length > T.chuToiDa) {
			loi.push({ loai: "qua-nhieu", chi: ten });
			return;
		}
		const loiTrich = cau.trich
			.map((t) => kiemMotTrich(t, trang, chuThuong))
			.filter((l): l is LoiKiem => l !== null);
		loi.push(...loiTrich);
		if (loiTrich.length > 0) return;
		const doan = cau.trich.map((t) => hien(t.doan));
		for (const so of rutSoChu(cau.chu)) {
			if (!doan.some((d) => coSoTronVen(d, so)))
				loi.push({ loai: "so-khong-trich", chi: `${ten}: ${so}` });
		}
	});
	if (loi.length > 0) return { ok: false, loi };
	const duocTrich: BanDangDung[] = [];
	const cau = ban.cau.map((c) => ({
		chu: chuanNfc(c.chu).trim(),
		trich: c.trich.map((t) => {
			const b = trang.get(t.slug) as BanDangDung;
			duocTrich.push(b);
			return {
				slug: b.slug,
				ten: b.ten,
				phienBan: b.phienBan,
				duyetLuc: b.duyetLuc,
				doan: hien(t.doan),
			};
		}),
	}));
	return {
		ok: true,
		traLoi: { cau, quaHan: canhBaoQuaHan(duocTrich, dauHomNay) },
	};
}

function dien(mau: string, gia: Record<string, string>): string {
	return mau.replace(/\{(\w+)\}/g, (_, k: string) => gia[k] ?? "");
}

export function dongQuaHan(
	t: TraLoiDaKiem,
	fmtNgay: (iso: string) => string,
): string[] {
	return t.quaHan.map((q) =>
		dien(TAI_LIEU_HOI.quaHan, {
			ten: q.ten,
			ngay: fmtNgay(q.xacMinhDen),
			chu: q.chuTrang,
		}),
	);
}

export function dungTraLoi(
	t: TraLoiDaKiem,
	fmtNgay: (iso: string) => string,
): string {
	const than = t.cau.map((c) =>
		[
			c.chu,
			...c.trich.map(
				(x) =>
					`— «${x.doan}» (${x.ten}, phiên bản ${x.phienBan}, duyệt ${fmtNgay(x.duyetLuc)})`,
			),
		].join("\n"),
	);
	return [...dongQuaHan(t, fmtNgay), ...than].join("\n\n");
}

export function dungTraLoiZalo(
	t: TraLoiDaKiem,
	fmtNgay: (iso: string) => string,
): string {
	const than = t.cau.map((c) =>
		[
			c.chu.replace(/\*\*|__|`/g, ""),
			...c.trich.map((x) => `«${x.doan}» — ${x.ten}, phiên bản ${x.phienBan}`),
		].join("\n"),
	);
	return [...dongQuaHan(t, fmtNgay), ...than].join("\n\n");
}

export function dungTuChoi(gan: readonly { ten: string }[]): string {
	if (gan.length === 0) return TAI_LIEU_HOI.tuChoi;
	return `${TAI_LIEU_HOI.tuChoi}\n${dien(TAI_LIEU_HOI.ganNhat, {
		ten: gan.map((g) => g.ten).join(", "),
	})}`;
}

export function cauLoiHoi(lyDo: LyDoLoi): string {
	return lyDo === "het-tran" ? TAI_LIEU_HOI.hetTran : TAI_LIEU_HOI.chuaTraLoi;
}
