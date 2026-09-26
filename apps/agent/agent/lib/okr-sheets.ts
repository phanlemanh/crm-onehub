import { db } from "@crm/db";
import { OKR_SO } from "@crm/db/okr-so-config";
import { docSoOkr, soKr } from "@crm/validation/okr-kr";
import {
	type LyDoDocSheet,
	parseDocSheetPayload,
	parseOkrNguon,
} from "@crm/validation/okr-nguon";
import { z } from "zod";
import type { DocO } from "./okr-chup";
import { completeTask, type LeasedTask } from "./tasks";

export type KetQuaDoc = { giaTri: number } | { loi: LyDoDocSheet };

type CauHinhSheets = { email: string; khoa: string };

type TokenNho = { email: string; token: string; hetMs: number };

const THUAT_TOAN = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" } as const;

const THU_LAI = "thu-lai";

const CO_TOKEN = "co-token";

const tokenNho = new WeakMap<typeof fetch, TokenNho>();

const tokenPhan = z.object({ access_token: z.string().min(1) });

function soHopLe(n: number | null): KetQuaDoc {
	return n !== null && soKr.safeParse(n).success
		? { giaTri: n }
		: { loi: "khong-phai-so" };
}

const oSheets = z.union([
	z.number().transform((n) => soHopLe(n)),
	z
		.string()
		.transform(
			(s): KetQuaDoc =>
				s.trim() === "" ? { loi: "o-trong" } : soHopLe(docSoOkr(s)),
		),
	z.boolean().transform((): KetQuaDoc => ({ loi: "khong-phai-so" })),
]);

const valuesPhan = z.object({ values: z.array(z.array(oSheets)).optional() });

export class LoiTokenSheets extends Error {
	readonly status: number;

	constructor(status: number) {
		super(`token HTTP ${status}`);
		this.name = "LoiTokenSheets";
		this.status = status;
	}
}

export function cauHinhSheets(): CauHinhSheets | null {
	const email = process.env.GOOGLE_SHEETS_EMAIL?.trim();
	const khoa = process.env.GOOGLE_SHEETS_KHOA?.trim();
	return email && khoa ? { email, khoa } : null;
}

function ghiDe(
	ten: "OKR_SHEETS_TOKEN_URL" | "OKR_SHEETS_API_URL",
): string | null {
	if (process.env.NODE_ENV === "production") return null;
	return process.env[ten]?.trim().replace(/\/+$/, "") || null;
}

function b64u(b: ArrayBuffer | Uint8Array): string {
	return Buffer.from(new Uint8Array(b)).toString("base64url");
}

function b64uChu(chu: string): string {
	return b64u(new TextEncoder().encode(chu));
}

export async function kySheetsJwt(
	email: string,
	khoaPem: string,
	nowS: number,
): Promise<string> {
	const der = Buffer.from(
		khoaPem
			.replace(/\\n/g, "\n")
			.replace(/-----[^-]+-----/g, "")
			.replace(/\s/g, ""),
		"base64",
	);
	const khoa = await crypto.subtle.importKey(
		"pkcs8",
		new Uint8Array(der),
		THUAT_TOAN,
		false,
		["sign"],
	);
	const dau = b64uChu(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const than = b64uChu(
		JSON.stringify({
			iss: email,
			scope: OKR_SO.sheets.scope,
			aud: OKR_SO.sheets.tokenUrl,
			iat: nowS,
			exp: nowS + OKR_SO.sheets.tokenGiayHieuLuc,
		}),
	);
	const ky = await crypto.subtle.sign(
		THUAT_TOAN,
		khoa,
		new TextEncoder().encode(`${dau}.${than}`),
	);
	return `${dau}.${than}.${b64u(ky)}`;
}

function tokenConHan(f: typeof fetch, now: Date): string | null {
	const nho = tokenNho.get(f);
	const email = cauHinhSheets()?.email;
	return nho && nho.email === email && nho.hetMs > now.getTime()
		? nho.token
		: null;
}

export async function layTokenSheets(
	f: typeof fetch,
	now: Date,
	signal?: AbortSignal,
): Promise<string> {
	const cau = cauHinhSheets();
	if (!cau) throw new LoiTokenSheets(0);
	const nho = tokenConHan(f, now);
	if (nho) return nho;
	const nowMs = now.getTime();
	const jwt = await kySheetsJwt(cau.email, cau.khoa, Math.floor(nowMs / 1000));
	const res = await f(ghiDe("OKR_SHEETS_TOKEN_URL") ?? OKR_SO.sheets.tokenUrl, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: jwt,
		}),
		signal,
	});
	if (!res.ok) throw new LoiTokenSheets(res.status);
	const { access_token } = tokenPhan.parse(await res.json());
	tokenNho.set(f, {
		email: cau.email,
		token: access_token,
		hetMs: nowMs + OKR_SO.sheets.tokenDungMs,
	});
	return access_token;
}

const LOI_KHONG_TAM_THOI = new Set(["DataError", "SyntaxError", "ZodError"]);

const maLoiPrisma = z.object({ code: z.string().min(1).max(20) });

export function tenLoi(e: Error | null): string {
	const ma = maLoiPrisma.safeParse(e);
	if (ma.success) return ma.data.code;
	return e?.name ?? "loi-la";
}

function thuLaiDuoc(status: number): boolean {
	return status === 429 || status >= 500;
}

function baoLoi<T>(ketQua: T, chiTiet: string): T {
	console.warn(`[okr-sheets] đọc ô không được: ${chiTiet}`);
	return ketQua;
}

async function motLanGoi(
	f: typeof fetch,
	sheetId: string,
	o: string,
	signal: AbortSignal,
): Promise<KetQuaDoc | typeof THU_LAI | typeof CO_TOKEN> {
	try {
		const token = tokenConHan(f, new Date());
		if (token === null) {
			await layTokenSheets(f, new Date(), signal);
			return CO_TOKEN;
		}
		const goc = ghiDe("OKR_SHEETS_API_URL") ?? OKR_SO.sheets.apiUrl;
		const res = await f(
			`${goc}/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(o)}?valueRenderOption=UNFORMATTED_VALUE`,
			{ headers: { authorization: `Bearer ${token}` }, signal },
		);
		if (res.status === 401) {
			tokenNho.delete(f);
			return baoLoi(THU_LAI, "HTTP 401");
		}
		if (res.status === 403) return { loi: "chua-chia-se" };
		if (res.status === 404) return { loi: "khong-thay" };
		if (thuLaiDuoc(res.status)) return baoLoi(THU_LAI, `HTTP ${res.status}`);
		if (!res.ok) return baoLoi({ loi: "google-loi" }, `HTTP ${res.status}`);
		const than = valuesPhan.safeParse(await res.json());
		if (!than.success)
			return baoLoi({ loi: "google-loi" }, "thân trả về sai khuôn");
		return than.data.values?.[0]?.[0] ?? { loi: "o-trong" };
	} catch (e) {
		if (e instanceof LoiTokenSheets && !thuLaiDuoc(e.status))
			return baoLoi({ loi: "google-loi" }, e.message);
		const ten = tenLoi(e instanceof Error ? e : null);
		if (e instanceof Error && LOI_KHONG_TAM_THOI.has(e.name))
			return baoLoi({ loi: "google-loi" }, ten);
		return baoLoi(THU_LAI, ten);
	}
}

export function docOSheet(f: typeof fetch): DocO {
	return async (sheetId, o) => {
		if (!cauHinhSheets()) return { loi: "tat" };
		const moiLanMs = OKR_SO.sheets.tranMs / OKR_SO.sheets.soLanThu;
		for (let lan = 0; lan < OKR_SO.sheets.soLanThu; lan += 1) {
			const kq = await motLanGoi(f, sheetId, o, AbortSignal.timeout(moiLanMs));
			if (kq !== THU_LAI && kq !== CO_TOKEN) return kq;
		}
		return { loi: "google-loi" };
	};
}

export async function chayDocSheet(
	task: LeasedTask,
	f: typeof fetch = globalThis.fetch,
): Promise<void> {
	try {
		await docVaGhi(task, f);
	} catch (e) {
		const ten = tenLoi(e instanceof Error ? e : null);
		console.error(`[okr-sheets] việc đọc ô ${task.id} hỏng: ${ten}`);
		await completeTask(task.id, `đọc ô: lỗi ${ten}`);
	}
}

async function docVaGhi(task: LeasedTask, f: typeof fetch): Promise<void> {
	const { keyResultId } = parseDocSheetPayload(task.payload);
	const hang = await db.okrNguonKr.findUnique({ where: { keyResultId } });
	const nguon = hang ? parseOkrNguon(hang) : null;
	if (nguon?.loai !== "bang-tinh" || !nguon.sheetId || !nguon.sheetO) {
		await completeTask(task.id, "đọc ô: nguồn không còn là bảng tính");
		return;
	}
	const kq = soHopLeKq(await docOSheet(f)(nguon.sheetId, nguon.sheetO));
	const now = new Date();
	await db.okrNguonKr.updateMany({
		where: {
			keyResultId,
			loai: "bang-tinh",
			sheetId: nguon.sheetId,
			sheetO: nguon.sheetO,
		},
		data:
			"giaTri" in kq
				? { docLuc: now, docGiaTri: kq.giaTri, docLoi: null, thuLuc: null }
				: { docLuc: now, docGiaTri: null, docLoi: kq.loi },
	});
	await completeTask(
		task.id,
		"giaTri" in kq ? "đọc ô: được" : `đọc ô: ${kq.loi}`,
	);
}

export function soHopLeKq(kq: KetQuaDoc): KetQuaDoc {
	return "giaTri" in kq ? soHopLe(kq.giaTri) : kq;
}
