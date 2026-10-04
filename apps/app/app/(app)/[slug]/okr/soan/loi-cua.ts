import { z } from "zod";
import { CUA_OKR } from "@/lib/cua-okr-config";
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
