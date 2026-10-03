import { appendFileSync, existsSync, readFileSync } from "node:fs";
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

const VERDICT_HONG = ["failed", "errored"];
const NHAN_CHAN_DOAN = new RegExp(
	`^(${TRO_LY_OKR_SOAN.danhGia.boiCanh.nhan}:.+|.+ tc\\d+)$`,
);

function nhanCua(ten: string): string {
	return ten.match(NHAN_JUDGE)?.[1] ?? ten;
}

export function phanLoaiHong(tom: TomTatChay): PhanLoaiHong {
	const ra: PhanLoaiHong = { chotMa: [], judgeHong: [], duoiNguong: [] };
	for (const e of tom.evals) {
		const hong = e.assertions.filter((a) => !a.passed);
		for (const a of hong) {
			if (
				!a.name.startsWith(TIEN_TO_JUDGE) ||
				!NHAN_CHAN_DOAN.test(nhanCua(a.name))
			)
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
		if (
			hong.length === 0 &&
			(e.error !== undefined || VERDICT_HONG.includes(e.verdict))
		)
			ra.chotMa.push({
				id: e.id,
				ten: `loi: ${e.error ?? e.verdict}`,
				phienHong: false,
			});
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

const TIEU_CHI = /^(.+) tc(\d+)$/;

export type DongTieuChi = { ca: string; diem: (number | null)[] };

export function bangTieuChi(tom: TomTatChay): DongTieuChi[] {
	const so = TRO_LY_OKR_SOAN.danhGia.boiCanh.tieuChi.length;
	const bang = new Map<string, (number | null)[]>();
	for (const a of tom.evals.flatMap((e) => e.assertions)) {
		if (!a.name.startsWith(TIEN_TO_JUDGE)) continue;
		const m = nhanCua(a.name).match(TIEU_CHI);
		if (!m?.[1] || !m[2]) continue;
		const dong = bang.get(m[1]) ?? Array.from({ length: so }, () => null);
		dong[Number(m[2]) - 1] =
			(a.metadata?.choice ?? null) === null ? null : a.score;
		bang.set(m[1], dong);
	}
	return [...bang].map(([ca, diem]) => ({ ca, diem }));
}

export type DemAB = { thang: number; daCham: number; khongCham: number };

export type KetQuaAB = {
	tyLeDaCham: number | null;
	tyLeXauNhat: number | null;
	tyLeTotNhat: number | null;
	dat: boolean;
	coTheDoi: boolean;
};

export function ketQuaAB(ab: DemAB, nguong: number): KetQuaAB {
	const tong = ab.daCham + ab.khongCham;
	const tyLeXauNhat = tong === 0 ? null : ab.thang / tong;
	const tyLeTotNhat = tong === 0 ? null : (ab.thang + ab.khongCham) / tong;
	const dat = tyLeXauNhat !== null && tyLeXauNhat >= nguong;
	return {
		tyLeDaCham: ab.daCham === 0 ? null : ab.thang / ab.daCham,
		tyLeXauNhat,
		tyLeTotNhat,
		dat,
		coTheDoi: !dat && tyLeTotNhat !== null && tyLeTotNhat >= nguong,
	};
}

const phanTram = (v: number | null) =>
	v === null ? "—" : `${Math.round(v * 100)}`;

const DT = TRO_LY_OKR_SOAN.danhGia.doTre;
const DO_DAI_SO_EVAL = 4;

export const CHOT_DO_TRE = {
	p50: `p50 <= ${DT.p50Ms} ms`,
	p90: `p90 <= ${DT.p90Ms} ms`,
	usd: `0 < chi phi moi cuoc <= ${DT.usdMoiCuoc} usd`,
} as const;

export const TIEN_TO_EVAL = {
	soan: "okr-soan/soan/",
	boiCanh: "okr-soan/soan-boi-canh/",
	doTre: "okr-soan/soan-do-tre/",
} as const;

export type CanKetQua = { soan: number; boiCanh: number; doTre: number };

function idEval(tienTo: string, so: number): string[] {
	return Array.from(
		{ length: so },
		(_, i) => `${tienTo}${String(i).padStart(DO_DAI_SO_EVAL, "0")}`,
	);
}

function coChot(e: TomTatChay["evals"][number], moTa: string): boolean {
	return e.assertions.some((a) => a.name.startsWith(`satisfies(${moTa})`));
}

export function thieuKetQua(tom: TomTatChay, can: CanKetQua): string[] {
	const co = new Map(tom.evals.map((e) => [e.id, e]));
	const doTre = idEval(TIEN_TO_EVAL.doTre, can.doTre);
	const thieu = [
		...idEval(TIEN_TO_EVAL.soan, can.soan),
		...idEval(TIEN_TO_EVAL.boiCanh, can.boiCanh),
		...doTre,
	].filter((id) => !co.has(id));
	for (const id of doTre) {
		const e = co.get(id);
		if (e && !coChot(e, CHOT_DO_TRE.usd))
			thieu.push(`${id} ${CHOT_DO_TRE.usd}`);
	}
	const daDo = doTre.flatMap((id) => {
		const e = co.get(id);
		return e ? [e] : [];
	});
	for (const moTa of [CHOT_DO_TRE.p50, CHOT_DO_TRE.p90])
		if (!daDo.some((e) => coChot(e, moTa)))
			thieu.push(`${TIEN_TO_EVAL.doTre} ${moTa}`);
	return thieu;
}

export const THIEU_TOM_TAT: KetLuan = {
	ma: 2,
	cau: "thieu ket qua: summary.json — khong xanh, chay lai",
};

export function docTomTatTep(
	duong: string,
): { tom: TomTatChay } | { ketLuan: KetLuan } {
	if (!existsSync(duong)) return { ketLuan: THIEU_TOM_TAT };
	return { tom: docTomTat(readFileSync(duong, "utf8")) };
}

export function soChotHong(tom: TomTatChay): number {
	return tom.evals.flatMap((e) => e.assertions).filter((a) => !a.passed).length;
}

export function ketLuanThuoc(v: {
	phan: PhanLoaiHong;
	soLanThu: number;
	khongGia: number;
	boQua: number;
	ab: DemAB;
	tyLeNguong: number;
	maEve: number | null;
	haTang: HaTang;
	soChotHong: number;
	thieu: readonly string[];
}): KetLuan {
	const { phan } = v;
	const haTang = ketLuanHaTang(phan, v.haTang);
	if (haTang) return haTang;
	if (phan.chotMa.length > 0)
		return {
			ma: 1,
			cau: `chot ma hong ${phan.chotMa.length}: ${phan.chotMa.map((h) => `${h.id} ${h.ten}`).join("; ")}${v.haTang.soPhien > 0 ? ` (kem ${moTaHaTang(v.haTang)}; ${v.haTang.phienKhac} phien hong khong do ha tang)` : ""}`,
		};
	if (v.thieu.length > 0)
		return {
			ma: 2,
			cau: `thieu ket qua: ${v.thieu.join(", ")} — khong xanh, chay lai`,
		};
	if (v.khongGia > 0)
		return {
			ma: 2,
			cau: `chi phi khong do duoc: ${v.khongGia} dong AiChiPhi costUsd null — khong xanh`,
		};
	if (v.boQua > 0) return { ma: 2, cau: `${v.boQua} eval bo qua — khong xanh` };
	const ab = ketQuaAB(v.ab, v.tyLeNguong);
	const nguong = v.tyLeNguong * 100;
	if (!ab.dat && ab.coTheDoi)
		return {
			ma: 2,
			cau: `judge hong, ket luan co the doi: ${v.ab.khongCham} cap A/B khong cham duoc sau ${v.soLanThu} lan thu; goi thang ${v.ab.thang}/${v.ab.daCham} cap da cham, xau nhat ${phanTram(ab.tyLeXauNhat)} %, tot nhat ${phanTram(ab.tyLeTotNhat)} % so voi ${nguong} % — chay lai`,
		};
	if (!ab.dat)
		return {
			ma: 1,
			cau: `ban co goi thang ${v.ab.thang}/${v.ab.daCham + v.ab.khongCham} cap (${phanTram(ab.tyLeXauNhat)} %) < ${nguong} %, ke ca khi moi cap khong cham duoc deu thang`,
		};
	const soChanDoan = phan.judgeHong.length + phan.duoiNguong.length;
	if (v.maEve !== 0 && (soChanDoan === 0 || v.soChotHong !== soChanDoan))
		return {
			ma: 1,
			cau: `eve eval ma ${v.maEve} ma khong ro nguyen nhan: ${v.soChotHong} chot hong trong summary, ${soChanDoan} da xep la judge chan doan`,
		};
	return { ma: 0, cau: null };
}
