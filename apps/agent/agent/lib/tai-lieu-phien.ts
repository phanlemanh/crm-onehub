import { db } from "@crm/db";
import { dongNguonMoCoi as dongNguonMoCoiTrong } from "@crm/db/tai-lieu-nguon-mo-coi";
import type { SendFn } from "eve/channels";
import { z } from "zod";
import { APP_AUTH } from "./app-auth";
import { type NguCanhKenh, phienGocCua } from "./phien-con";
import {
	attribute,
	type PurposeContext,
	purposeOf,
	type SessionPurpose,
} from "./session-purpose";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";

export const PURPOSE_MAY_SOAN = "may-soan" satisfies SessionPurpose;
const LY_DO = TAI_LIEU_AGENT.lyDo;
const CFG = TAI_LIEU_AGENT.phien;

const TIEN_TO_TOKEN = "may-soan:";

export function tokenMaySoan(nguonId: string): string {
	return `${TIEN_TO_TOKEN}${nguonId}`;
}

export function nguonTuToken(token: string | null | undefined): string | null {
	if (!token) return null;
	const moc = token.lastIndexOf(TIEN_TO_TOKEN);
	if (moc === -1) return null;
	return token.slice(moc + TIEN_TO_TOKEN.length) || null;
}

export async function nguonChoSoan(lo: number = CFG.lo): Promise<string[]> {
	const ds = await db.taiLieuNguon.findMany({
		where: { trangThai: "CHO_SOAN" },
		orderBy: [{ taiLuc: "asc" }, { id: "asc" }],
		take: lo,
		select: { id: true },
	});
	return ds.map((n) => n.id);
}

async function nhanMot(nguonId: string): Promise<{ taiBoiId: string } | null> {
	const [n] = await db.$queryRaw<{ taiBoiId: string }[]>`
		UPDATE "taiLieuNguon" n
		SET "trangThai" = 'DANG_SOAN', "soanLuc" = now(), "lyDo" = NULL, "phienId" = NULL,
			"banGocId" = (SELECT t."banDangDungId" FROM "taiLieuTrang" t WHERE t.id = n."trangId")
		WHERE n.id = ${nguonId} AND n."trangThai" = 'CHO_SOAN'
		RETURNING n."taiBoiId"
	`;
	return n ?? null;
}

export function tinMaySoan(nguonId: string): string {
	return `Soạn bản đề xuất cho nguồn ${nguonId}.`;
}

export async function guiMaySoan(
	nguonId: string,
	send: SendFn,
): ReturnType<SendFn> {
	const n = await nhanMot(nguonId);
	if (!n) throw new Error("This source is not waiting to be drafted.");
	try {
		const phien = await send(tinMaySoan(nguonId), {
			auth: {
				...APP_AUTH,
				attributes: {
					purpose: PURPOSE_MAY_SOAN,
					nguonId,
					userId: n.taiBoiId,
				},
			},
			continuationToken: tokenMaySoan(nguonId),
			title: "Máy soạn bản đề xuất",
			mode: "task",
		});
		await db.taiLieuNguon.updateMany({
			where: { id: nguonId, trangThai: "DANG_SOAN" },
			data: { phienId: phien.id },
		});
		return phien;
	} catch (error) {
		await dongNguon(nguonId, LY_DO.loiGui);
		throw error;
	}
}

export async function drainMaySoan(send: SendFn): Promise<number> {
	await dongMaySoanQuaHan();
	const ds = await nguonChoSoan();
	const kq = await Promise.allSettled(ds.map((id) => guiMaySoan(id, send)));
	return kq.filter((k) => k.status === "fulfilled").length;
}

export async function dongKhiPhienXong(token: string | null): Promise<boolean> {
	const nguonId = nguonTuToken(token);
	if (!nguonId) return false;
	const n = await db.taiLieuNguon.findUnique({
		where: { id: nguonId },
		select: { trangThai: true, lyDo: true },
	});
	if (n?.trangThai === "DANG_SOAN") {
		await dongNguon(nguonId, n.lyDo ?? LY_DO.khongNop);
	}
	return true;
}

export async function dongKhiPhienHong(
	token: string | null,
	lyDo: string,
): Promise<boolean> {
	const nguonId = nguonTuToken(token);
	if (!nguonId) return false;
	await dongNguon(nguonId, LY_DO.loiModel(lyDo.slice(0, CFG.chiToiDa)));
	return true;
}

async function dongNguon(nguonId: string, lyDo: string): Promise<boolean> {
	const { count } = await db.taiLieuNguon.updateMany({
		where: { id: nguonId, trangThai: "DANG_SOAN" },
		data: { trangThai: "LOI", lyDo },
	});
	return count === 1;
}

export async function dongMaySoanQuaHan(bayGio = new Date()): Promise<number> {
	const han = new Date(bayGio.getTime() - TAI_LIEU_AGENT.soan.thoiGianMs);
	const { count } = await db.taiLieuNguon.updateMany({
		where: { trangThai: "DANG_SOAN", soanLuc: { lt: han } },
		data: { trangThai: "LOI", lyDo: LY_DO.hetGio },
	});
	return count;
}

export function dongNguonMoCoi(): Promise<number> {
	return dongNguonMoCoiTrong(db, LY_DO.moCoi);
}

export function laPhienMaySoan(ctx: PurposeContext): boolean {
	return purposeOf(ctx) === PURPOSE_MAY_SOAN;
}

export type NguCanhMaySoan = PurposeContext & NguCanhKenh;

export async function nguonCuaPhien(
	ctx: NguCanhMaySoan,
	cho: (ms: number) => Promise<void> = (ms) =>
		new Promise((r) => setTimeout(r, ms)),
): Promise<string> {
	if (laPhienMaySoan(ctx)) {
		const id = attribute(ctx, "nguonId");
		if (!id) throw new Error("This drafting session is missing nguonId.");
		return id;
	}
	const goc = phienGocCua(ctx);
	if (!goc) throw new Error("This session is not a drafting session.");
	const { soLan, cachMs } = CFG.timNguon;
	for (let lan = 0; lan < soLan; lan += 1) {
		const n = await db.taiLieuNguon.findFirst({
			where: { phienId: goc },
			select: { id: true },
		});
		if (n) return n.id;
		await cho(cachMs);
	}
	throw new Error("This session is not a drafting session.");
}

const loiCoCau = z.object({ message: z.string().trim().min(1) });

export const ketQuaMaySoan = z.object({
	result: z.object({
		kind: z.literal("subagent-result"),
		subagentName: z.literal("may_soan"),
		isError: z.boolean(),
		output: loiCoCau.nullable().catch(null),
	}),
});

export type KetQuaMaySoan = z.infer<typeof ketQuaMaySoan>;

export async function dongTheoKetQua(
	kq: KetQuaMaySoan,
	ctx: PurposeContext,
): Promise<void> {
	if (!laPhienMaySoan(ctx)) return;
	const nguonId = attribute(ctx, "nguonId");
	if (!nguonId) return;
	if (kq.result.isError) {
		const chi = (kq.result.output?.message ?? "không rõ").slice(
			0,
			CFG.chiToiDa,
		);
		await dongNguon(nguonId, LY_DO.loiModel(chi));
		return;
	}
	const n = await db.taiLieuNguon.findUnique({
		where: { id: nguonId },
		select: { trangThai: true, lyDo: true },
	});
	if (n?.trangThai !== "DANG_SOAN") return;
	await dongNguon(nguonId, n.lyDo ?? LY_DO.khongNop);
}
