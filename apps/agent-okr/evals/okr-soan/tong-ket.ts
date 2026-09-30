import { appendFileSync } from "node:fs";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";

export const dongTongKet = z.discriminatedUnion("loai", [
	z.object({
		loai: z.literal("soan"),
		ca: z.string(),
		cuocSoanId: z.string(),
		usd: z.number(),
		banNhap: z.string(),
		biLoai: z.array(z.object({ khoa: z.string(), maLoai: z.string() })),
	}),
	z.object({
		loai: z.literal("boi-canh"),
		ca: z.string(),
		A: z.string(),
		B: z.string(),
		phiaCoGoi: z.enum(["A", "B"]),
		usd: z.number(),
	}),
	z.object({
		loai: z.literal("do-tre"),
		ca: z.string(),
		cuoc: z.number().int(),
		ms: z.array(z.number()),
		tach: z
			.array(
				z.object({
					soBuoc: z.number().int(),
					moHinhMs: z.number(),
					congCuMs: z.number(),
					soCongCu: z.number().int().default(0),
				}),
			)
			.default([]),
		usd: z.number(),
	}),
	z.object({
		loai: z.literal("judge"),
		lanThu: z.number().int().min(1),
		loi: z.string().nullable(),
	}),
]);

export type DongTongKet = z.input<typeof dongTongKet>;

export function ghiTongKet(dong: DongTongKet): void {
	const tep = process.env[TRO_LY_OKR_SOAN.danhGia.env.tongKet]?.trim();
	if (tep) appendFileSync(tep, `${JSON.stringify(dongTongKet.parse(dong))}\n`);
}

export function docTongKet(chu: string): DongTongKet[] {
	return chu
		.split("\n")
		.filter((d) => d.trim() !== "")
		.map((d) => dongTongKet.parse(JSON.parse(d)));
}

const tomTatChay = z.object({
	totalEvals: z.number(),
	passed: z.number(),
	failed: z.number(),
	scored: z.number(),
	skipped: z.number(),
	evals: z.array(
		z.object({
			id: z.string(),
			verdict: z.string(),
			assertions: z.array(
				z.object({
					name: z.string(),
					score: z.number(),
					passed: z.boolean(),
					severity: z.string().optional(),
					message: z.string().optional(),
					metadata: z
						.object({ choice: z.string().optional() })
						.nullable()
						.optional(),
				}),
			),
			error: z.string().optional(),
			skipReason: z.string().optional(),
		}),
	),
});

export type TomTatChay = z.infer<typeof tomTatChay>;

export function docTomTat(chu: string): TomTatChay {
	return tomTatChay.parse(JSON.parse(chu));
}

const TIEN_TO_JUDGE = "judge.";
const NHAN_JUDGE = /\[([^\]]+)\]/;

export type HongChotMa = { id: string; ten: string };
export type HongJudge = { id: string; nhan: string; loi: string };
export type DuoiNguong = { id: string; nhan: string; diem: number };

export type PhanLoaiHong = {
	chotMa: HongChotMa[];
	judgeHong: HongJudge[];
	duoiNguong: DuoiNguong[];
};

function nhanCua(ten: string): string {
	return ten.match(NHAN_JUDGE)?.[1] ?? ten;
}

export function phanLoaiHong(tom: TomTatChay): PhanLoaiHong {
	const ra: PhanLoaiHong = { chotMa: [], judgeHong: [], duoiNguong: [] };
	for (const e of tom.evals) {
		const hong = e.assertions.filter((a) => !a.passed);
		for (const a of hong) {
			if (!a.name.startsWith(TIEN_TO_JUDGE))
				ra.chotMa.push({ id: e.id, ten: a.name });
			else if ((a.metadata?.choice ?? null) === null)
				ra.judgeHong.push({
					id: e.id,
					nhan: nhanCua(a.name),
					loi: a.message ?? "",
				});
			else
				ra.duoiNguong.push({ id: e.id, nhan: nhanCua(a.name), diem: a.score });
		}
		if (e.error !== undefined && hong.length === 0)
			ra.chotMa.push({ id: e.id, ten: `loi: ${e.error}` });
	}
	return ra;
}

export type ThongKeJudge = {
	soLoiGoi: number;
	phaiThuLai: number;
	tongLanThu: number;
	lanThuNhieuNhat: number;
	hongSauCung: number;
};

export function thongKeJudge(
	dong: readonly { lanThu: number; loi: string | null }[],
): ThongKeJudge {
	return {
		soLoiGoi: dong.length,
		phaiThuLai: dong.filter((d) => d.lanThu > 1).length,
		tongLanThu: dong.reduce((a, d) => a + d.lanThu, 0),
		lanThuNhieuNhat: Math.max(0, ...dong.map((d) => d.lanThu)),
		hongSauCung: dong.filter((d) => d.loi !== null).length,
	};
}

export type KetLuan = { ma: 0 | 1 | 2; cau: string | null };

export function ketLuanThuoc(v: {
	phan: PhanLoaiHong;
	soLanThu: number;
	khongGia: number;
	boQua: number;
	tyLe: number | null;
	tyLeNguong: number;
	maEve: number | null;
}): KetLuan {
	const { phan } = v;
	if (phan.chotMa.length > 0)
		return {
			ma: 1,
			cau: `chot ma hong ${phan.chotMa.length}: ${phan.chotMa.map((h) => `${h.id} ${h.ten}`).join("; ")}`,
		};
	if (phan.judgeHong.length > 0)
		return {
			ma: 2,
			cau: `judge khong cham duoc ${phan.judgeHong.length} ca sau ${v.soLanThu} lan thu (${phan.judgeHong.map((h) => h.nhan).join(", ")}) — khong xanh, chay lai`,
		};
	if (v.khongGia > 0)
		return {
			ma: 2,
			cau: `chi phi khong do duoc: ${v.khongGia} dong AiChiPhi costUsd null — khong xanh`,
		};
	if (v.boQua > 0) return { ma: 2, cau: `${v.boQua} eval bo qua — khong xanh` };
	if (phan.duoiNguong.length > 0)
		return {
			ma: 1,
			cau: `judge cham duoi nguong ${phan.duoiNguong.length}: ${phan.duoiNguong.map((h) => `${h.nhan} ${h.diem}`).join(", ")}`,
		};
	if (v.tyLe === null || v.tyLe < v.tyLeNguong)
		return {
			ma: 1,
			cau: `ban co goi thang ${v.tyLe === null ? "—" : Math.round(v.tyLe * 100)} % < ${v.tyLeNguong * 100} %`,
		};
	if (v.maEve !== 0)
		return { ma: 1, cau: `eve eval ma ${v.maEve} ma khong ro nguyen nhan` };
	return { ma: 0, cau: null };
}
