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
						.object({
							choice: z.string().optional(),
							actual: z.json().optional(),
							expected: z.json().optional(),
						})
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

const HT = TRO_LY_OKR_SOAN.danhGia.haTang;
const TIEN_TO_JUDGE = "judge.";
const NHAN_JUDGE = /\[([^\]]+)\]/;

export type HongChotMa = { id: string; ten: string; phienHong: boolean };
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
				ra.chotMa.push({
					id: e.id,
					ten: a.name,
					phienHong:
						a.metadata?.expected === HT.trangThaiPhien.cho &&
						a.metadata?.actual === HT.trangThaiPhien.hong,
				});
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
			ra.chotMa.push({ id: e.id, ten: `loi: ${e.error}`, phienHong: false });
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

const chiTietHong = z.object({
	statusCode: z.number().optional(),
	upstreamStatusCode: z.number().optional(),
	upstreamType: z.string().optional(),
	apiErrorMessage: z.string().optional(),
	upstreamMessage: z.string().optional(),
});

const suKienHong = z.object({
	sessionId: z.string(),
	type: z.enum(HT.suKienHong),
	data: z.object({
		code: z.string(),
		message: z.string(),
		details: chiTietHong.nullish(),
	}),
});

export type SuKienHong = z.infer<typeof suKienHong>;

export function docSuKienHong(hang: readonly unknown[]): SuKienHong[] {
	return hang.map((h) => suKienHong.parse(h));
}

export type LoaiHaTang = (typeof HT.loai)[keyof typeof HT.loai];

const thuoc = (ds: readonly string[], v: string | undefined) =>
	v !== undefined && ds.includes(v);

export function loaiHaTang(su: SuKienHong): LoaiHaTang | null {
	const ct = su.data.details ?? {};
	const ma = [ct.statusCode, ct.upstreamStatusCode].filter(
		(m) => m !== undefined,
	);
	const chu = [su.data.message, ct.apiErrorMessage, ct.upstreamMessage].join(
		" ",
	);
	if (
		thuoc(HT.kieu.nganSachKhoa, ct.upstreamType) ||
		HT.chu.nganSachKhoa.test(chu)
	)
		return HT.loai.nganSachKhoa;
	if (
		thuoc(HT.kieu.tinDung, ct.upstreamType) ||
		HT.chu.tinDung.test(chu) ||
		ma.includes(HT.ma.hetTien)
	)
		return HT.loai.tinDung;
	if (thuoc(HT.kieu.gioiHan, ct.upstreamType) || ma.includes(HT.ma.gioiHan))
		return HT.loai.gioiHan;
	if (ma.some((m) => m >= HT.ma.mayChuTu)) return HT.loai.mayChu;
	return null;
}

export type HaTang = {
	theoLoai: { loai: LoaiHaTang; soPhien: number; mau: string }[];
	soPhien: number;
	phienKhac: number;
};

export function phanLoaiHaTang(suKien: readonly SuKienHong[]): HaTang {
	const haTang = new Map<string, { loai: LoaiHaTang; mau: string }>();
	const phienHong = new Set<string>();
	for (const su of suKien) {
		if (su.type === "session.failed") phienHong.add(su.sessionId);
		const loai = loaiHaTang(su);
		if (loai === null || haTang.has(su.sessionId)) continue;
		const ct = su.data.details;
		haTang.set(su.sessionId, {
			loai,
			mau: (
				ct?.upstreamMessage ??
				ct?.apiErrorMessage ??
				su.data.message
			).slice(0, HT.tranCauMau),
		});
	}
	const theoLoai = new Map<LoaiHaTang, { soPhien: number; mau: string }>();
	for (const { loai, mau } of haTang.values()) {
		const cu = theoLoai.get(loai);
		theoLoai.set(loai, {
			soPhien: (cu?.soPhien ?? 0) + 1,
			mau: cu?.mau ?? mau,
		});
	}
	return {
		theoLoai: [...theoLoai].map(([loai, v]) => ({ loai, ...v })),
		soPhien: haTang.size,
		phienKhac: [...phienHong].filter((p) => !haTang.has(p)).length,
	};
}

export const KHONG_HA_TANG: HaTang = { theoLoai: [], soPhien: 0, phienKhac: 0 };

function moTaHaTang(h: HaTang): string {
	return h.theoLoai.map((l) => `${l.loai} (${l.soPhien} phien)`).join(", ");
}

export function ketLuanHaTang(phan: PhanLoaiHong, h: HaTang): KetLuan | null {
	if (h.soPhien === 0) return null;
	const evalPhienHong = new Set(
		phan.chotMa.filter((c) => c.phienHong).map((c) => c.id),
	);
	const conLai = phan.chotMa.filter((c) => !c.phienHong);
	if (
		evalPhienHong.size === 0 ||
		conLai.length > 0 ||
		h.phienKhac > 0 ||
		evalPhienHong.size > h.soPhien
	)
		return null;
	return {
		ma: 2,
		cau: `khong do duoc: ${moTaHaTang(h)} — loi ha tang AI Gateway, khong phai loi ma; ${evalPhienHong.size} eval dung vi phien hong; mau: «${h.theoLoai[0]?.mau ?? ""}» — chay lai sau khi nap tien hoac doi khoa`,
	};
}

const tinDung = z.object({
	balance: z.coerce.number(),
	total_used: z.coerce.number(),
});

export type TinDung = z.infer<typeof tinDung>;

export function docTinDung(chu: string): TinDung {
	return tinDung.parse(JSON.parse(chu));
}

export function ketLuanTinDung(t: TinDung): KetLuan {
	return t.balance > 0
		? { ma: 0, cau: null }
		: {
				ma: 2,
				cau: `khong do duoc: ${HT.loai.tinDung} (so du ${t.balance} USD, da dung ${t.total_used} USD) — chua chay eval`,
			};
}

export function ketLuanThuoc(v: {
	phan: PhanLoaiHong;
	soLanThu: number;
	khongGia: number;
	boQua: number;
	tyLe: number | null;
	tyLeNguong: number;
	maEve: number | null;
	haTang: HaTang;
}): KetLuan {
	const { phan } = v;
	const haTang = ketLuanHaTang(phan, v.haTang);
	if (haTang) return haTang;
	if (phan.chotMa.length > 0)
		return {
			ma: 1,
			cau: `chot ma hong ${phan.chotMa.length}: ${phan.chotMa.map((h) => `${h.id} ${h.ten}`).join("; ")}${v.haTang.soPhien > 0 ? ` (kem ${moTaHaTang(v.haTang)}; ${v.haTang.phienKhac} phien hong khong do ha tang)` : ""}`,
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
