import { z } from "zod";

export const LOAI_TRA_LOI = ["tra-loi", "khong-biet", "ngoai-pham-vi"] as const;
export const LOAI_TRICH = ["objective", "kr"] as const;

export const OKR_HOI_TRAN = {
	cauMoiNgay: 40,
	usdMoiThang: 10,
	mui: "Asia/Ho_Chi_Minh",
	tinhNang: "okr.hoi-dap",
	cauHoiToiDa: 500,
	cauToiDa: 8,
	trichMoiCau: 8,
} as const;

const ma = z.string().trim().min(1).max(120);

export const trichOkr = z.object({ loai: z.enum(LOAI_TRICH), id: ma });

export const nopTraLoiInput = z.object({
	loai: z.enum(LOAI_TRA_LOI),
	cauHoi: z.string().trim().min(1).max(OKR_HOI_TRAN.cauHoiToiDa),
	cau: z
		.array(
			z.object({
				chu: z.string().trim().min(1).max(600),
				trich: z.array(trichOkr).max(OKR_HOI_TRAN.trichMoiCau),
			}),
		)
		.max(OKR_HOI_TRAN.cauToiDa)
		.optional(),
});

export type NopTraLoiInput = z.infer<typeof nopTraLoiInput>;
export type TrichOkr = z.infer<typeof trichOkr>;

export const cauTraLoiDung = z.object({
	loai: z.enum(LOAI_TRA_LOI),
	cau: z.array(
		z.object({
			chu: z.string(),
			trich: z.array(trichOkr.extend({ ten: z.string() })),
		}),
	),
});

export type CauTraLoiDung = z.infer<typeof cauTraLoiDung>;

export type GiaTriTrich = {
	loai: (typeof LOAI_TRICH)[number];
	id: string;
	truong: number[];
};

export type KetQuaKiemSo =
	| { ok: true }
	| { ok: false; so: string; lop: "truong" | "dem" | "la" };

const SO = /\d+(?:[.,]\d+)*/g;
const DEM = /^\s*(Mục tiêu|KR)(?![\p{L}\p{N}])/iu;
const MIEN = /(năm|quý)\s*$/iu;

export function docSo(chuoi: string): number | null {
	const s = chuoi.trim();
	if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replaceAll(".", ""));
	if (/^\d{1,3}(,\d{3}){2,}$/.test(s)) return Number(s.replaceAll(",", ""));
	if (/^\d+([.,]\d+)?$/.test(s)) return Number(s.replace(",", "."));
	return null;
}

function khop(n: number, v: number): boolean {
	return Math.abs(n - v) < 1e-9 || Math.round(n) === Math.round(v);
}

export function kiemSoCau(chu: string, trich: GiaTriTrich[]): KetQuaKiemSo {
	for (const m of chu.matchAll(SO)) {
		const so = m[0];
		const dau = m.index ?? 0;
		if (MIEN.test(chu.slice(0, dau))) continue;
		const n = docSo(so);
		if (n === null) return { ok: false, so, lop: "la" };
		const dem = DEM.exec(chu.slice(dau + so.length));
		if (dem) {
			const loai = dem[1]?.toLowerCase() === "kr" ? "kr" : "objective";
			if (trich.filter((t) => t.loai === loai).length === n) continue;
			return { ok: false, so, lop: "dem" };
		}
		if (trich.some((t) => t.truong.some((v) => khop(n, v)))) continue;
		return { ok: false, so, lop: trich.length > 0 ? "truong" : "la" };
	}
	return { ok: true };
}

export const LY_DO_LUOT_HOI = ["het-luot-ngay", "het-tran-thang"] as const;

export const hoiMoInput = z.object({});
export const hoiMoOutput = z.object({ cuocHoiId: z.string() });
export const hoiTangLuotInput = z.object({ cuocHoiId: ma });
export const hoiTangLuotOutput = z.discriminatedUnion("ok", [
	z.object({ ok: z.literal(true) }),
	z.object({ ok: z.literal(false), lyDo: z.enum(LY_DO_LUOT_HOI) }),
]);
export const hoiCuaToiOutput = z.array(
	z.object({ id: z.string(), createdAt: z.string() }),
);

export type HoiMoOutput = z.infer<typeof hoiMoOutput>;
export type HoiTangLuotOutput = z.infer<typeof hoiTangLuotOutput>;
export type HoiCuaToiOutput = z.infer<typeof hoiCuaToiOutput>;

export const hoiPhanHoiInput = z.object({
	cuocHoiId: ma,
	maTraLoi: ma,
	huuIch: z.boolean(),
});
export const hoiPhanHoiOutput = z.object({ ok: z.literal(true) });
export type HoiPhanHoiInput = z.infer<typeof hoiPhanHoiInput>;
