import { z } from "zod";
import { CUA_OKR, type MaLyDoHong } from "@/lib/cua-okr-config";
import { SOAN_UI } from "./cau-hinh";
import type { LyDoLuot } from "./kieu";

const laLyDoLuot = (ma: string): ma is LyDoLuot =>
	Object.hasOwn(CUA_OKR.trangThaiTuChoiLuot, ma);

const thanLoi = z
	.string()
	.transform((chu, ctx) => {
		try {
			return JSON.parse(chu);
		} catch {
			ctx.addIssue({ code: "custom", message: "khong-phai-json" });
			return z.NEVER;
		}
	})
	.pipe(z.object({ error: z.string() }));

const loiHttp = z.object({ status: z.number(), body: thanLoi });

export function lyDoTuChoiLuot(loi: Error | undefined): LyDoLuot | null {
	const http = loiHttp.safeParse(loi);
	if (!http.success) return null;
	const ma = http.data.body.error;
	if (!laLyDoLuot(ma)) return null;
	return CUA_OKR.trangThaiTuChoiLuot[ma] === http.data.status ? ma : null;
}

export function laChuaCauHinh(loi: Error | undefined): boolean {
	const http = loiHttp.safeParse(loi);
	return (
		http.success &&
		http.data.status === CUA_OKR.trangThaiChuaCauHinh &&
		http.data.body.error === CUA_OKR.loi.chuaCauHinh
	);
}

const PHIEN_KHAC_SONG: readonly string[] = [
	CUA_OKR.loi.daCoPhien,
	CUA_OKR.loi.phienDaThay,
];

export function laDaCoPhien(loi: Error | undefined): boolean {
	const http = loiHttp.safeParse(loi);
	return (
		http.success &&
		http.data.status === SOAN_UI.trangThaiDaCoPhien &&
		PHIEN_KHAC_SONG.includes(http.data.body.error)
	);
}

export type LyDoHong = { ma: MaLyDoHong; daHoan: boolean };

const thanLong = z
	.string()
	.transform((chu) => {
		try {
			return JSON.parse(chu);
		} catch {
			return null;
		}
	})
	.pipe(
		z
			.object({ error: z.string().optional(), luot: z.string().optional() })
			.catch({}),
	);

const loiCoStatus = z.object({ status: z.number(), body: thanLong });

const MA_CUA: ReadonlyMap<string, MaLyDoHong> = new Map([
	[CUA_OKR.loi.khongNoiDuoc, "khong-noi-duoc"],
	[CUA_OKR.loi.quaHan, "qua-han"],
	[CUA_OKR.loi.troLyTuChoi, "tro-ly-tu-choi"],
	[CUA_OKR.loi.troLyLoi, "tro-ly-loi"],
	[CUA_OKR.loi.khongDemDuocLuot, "chua-dem-duoc-luot"],
	[CUA_OKR.loi.khongDocDuocPhien, "chua-mo-duoc-phien"],
	[CUA_OKR.loi.khongGhiDuocPhien, "chua-mo-duoc-phien"],
	[CUA_OKR.loi.chuaDangNhap, "het-dang-nhap"],
]);

const TRANG_THAI_LOI_MAY_CHU = 500;

function maTheoStatus(status: number): MaLyDoHong {
	return status >= TRANG_THAI_LOI_MAY_CHU ? "tro-ly-loi" : "tro-ly-tu-choi";
}

const LOI_MANG: readonly string[] = CUA_OKR.loiMangTrinhDuyet;

function laLoiMang(loi: Error): boolean {
	return loi instanceof TypeError && LOI_MANG.includes(loi.message);
}

function coChoRieng(loi: Error): boolean {
	return lyDoTuChoiLuot(loi) !== null || laChuaCauHinh(loi) || laDaCoPhien(loi);
}

export function lyDoHong(vao: {
	loi: Error | undefined;
	qua45s: boolean;
	loiMoLai: unknown;
}): LyDoHong | null {
	if (vao.loiMoLai) return { ma: "chua-mo-lai-duoc", daHoan: false };
	const { loi } = vao;
	if (!loi)
		return { ma: vao.qua45s ? "qua-45s" : "dung-giua-chung", daHoan: false };
	if (coChoRieng(loi)) return null;
	const http = loiCoStatus.safeParse(loi);
	if (!http.success)
		return {
			ma: laLoiMang(loi) ? "mat-mang" : "dung-giua-chung",
			daHoan: false,
		};
	const { error, luot } = http.data.body;
	const ma =
		(error ? MA_CUA.get(error) : undefined) ?? maTheoStatus(http.data.status);
	return { ma, daHoan: luot === CUA_OKR.luotDaHoan };
}

const loiTrpc = z.object({ data: z.object({ code: z.string() }) });

export type LoiQuyet = { kieu: "xung-dot" } | { kieu: "mang" };

export function loiQuyetTu(e: unknown): LoiQuyet {
	const r = loiTrpc.safeParse(e);
	return r.success && r.data.data.code === "CONFLICT"
		? { kieu: "xung-dot" }
		: { kieu: "mang" };
}
