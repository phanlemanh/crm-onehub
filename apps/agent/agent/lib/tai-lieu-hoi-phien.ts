import { db } from "@crm/db";
import { HOI_KHO_KINDS } from "@crm/db/agent-tasks";
import { ghiKetQuaHoi } from "@crm/db/tai-lieu-hoi";
import type { LyDoLoi } from "@crm/validation/tai-lieu-hoi";
import type { SendFn } from "eve/channels";
import { z } from "zod";
import { APP_AUTH } from "./app-auth";
import { attribute, type PurposeContext, purposeOf } from "./session-purpose";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";
import { completeTask } from "./tasks";

const HOI = TAI_LIEU_AGENT.hoi;

export const PURPOSE_KHO = "kho";
const TIEN_TO_TOKEN = "kho:";
const VIEC_DONG_THEO_HANG = "Câu kho đã đóng trước khi gửi.";
const payloadHoiKho = z.object({ hoiId: z.string().min(1) });
const HET_TRAN = /budget exceeded|insufficient_funds|credit balance|\b402\b/i;

export function tokenHoiKho(hoiId: string): string {
	return `${TIEN_TO_TOKEN}${hoiId}`;
}

export function hoiTuToken(token: string | null | undefined): string | null {
	if (!token) return null;
	const i = token.lastIndexOf(TIEN_TO_TOKEN);
	if (i === -1) return null;
	const truoc = token.slice(0, i);
	if (truoc !== "" && truoc !== "crm:") return null;
	return token.slice(i + TIEN_TO_TOKEN.length) || null;
}

export function phanLoaiLoi(
	thongDiep: string,
): Extract<LyDoLoi, "het-tran" | "loi-model"> {
	return HET_TRAN.test(thongDiep) ? "het-tran" : "loi-model";
}

async function dongLoi(hoiId: string, lyDo: LyDoLoi): Promise<boolean> {
	return ghiKetQuaHoi(db, hoiId, { trangThai: "LOI", lyDo }, new Date());
}

async function nhanHoi(
	hoiId: string,
): Promise<{ cauHoi: string; nguoiHoiId: string } | null> {
	const [h] = await db.$queryRaw<
		{ cauHoi: string | null; nguoiHoiId: string }[]
	>`
		UPDATE "taiLieuHoi"
		SET "phienId" = ${`gui:${hoiId}`}
		WHERE id = ${hoiId} AND "trangThai" = 'DANG_HOI' AND kenh = 'CRM' AND "phienId" IS NULL
		RETURNING "cauHoi", "nguoiHoiId"
	`;
	if (!h?.cauHoi) return null;
	return { cauHoi: h.cauHoi, nguoiHoiId: h.nguoiHoiId };
}

async function dongViecMoCoi(chiHoi?: readonly string[]): Promise<void> {
	const viec = await db.agentTask.findMany({
		where: { kind: { in: [...HOI_KHO_KINDS] }, finishedAt: null },
		select: { id: true, payload: true },
	});
	const theoHoi = new Map<string, string[]>();
	for (const v of viec) {
		const hoiId = payloadHoiKho.safeParse(v.payload);
		if (!hoiId.success) continue;
		if (chiHoi && !chiHoi.includes(hoiId.data.hoiId)) continue;
		theoHoi.set(hoiId.data.hoiId, [
			...(theoHoi.get(hoiId.data.hoiId) ?? []),
			v.id,
		]);
	}
	if (theoHoi.size === 0) return;
	const conMo = await db.taiLieuHoi.findMany({
		where: {
			id: { in: [...theoHoi.keys()] },
			trangThai: "DANG_HOI",
		},
		select: { id: true },
	});
	const giu = new Set(conMo.map((h) => h.id));
	for (const [hoiId, ids] of theoHoi) {
		if (giu.has(hoiId)) continue;
		for (const id of ids) await completeTask(id, VIEC_DONG_THEO_HANG);
	}
}

async function dongViecCua(hoiId: string, ketQua: string): Promise<void> {
	const viec = await db.agentTask.findMany({
		where: {
			kind: { in: [...HOI_KHO_KINDS] },
			finishedAt: null,
			payload: { path: ["hoiId"], equals: hoiId },
		},
		select: { id: true },
	});
	for (const v of viec) await completeTask(v.id, ketQua);
}

export async function guiHoiKho(
	hoiId: string,
	send: SendFn,
): Promise<Awaited<ReturnType<SendFn>> | null> {
	const h = await nhanHoi(hoiId);
	if (!h) {
		await dongViecMoCoi([hoiId]);
		return null;
	}
	try {
		const phien = await send(h.cauHoi, {
			auth: {
				...APP_AUTH,
				attributes: { purpose: PURPOSE_KHO, hoiId, userId: h.nguoiHoiId },
			},
			continuationToken: tokenHoiKho(hoiId),
			title: "Trợ lý AI đọc kho",
			mode: "task",
		});
		await db.taiLieuHoi.updateMany({
			where: { id: hoiId, phienId: `gui:${hoiId}` },
			data: { phienId: phien.id },
		});
		await dongViecCua(hoiId, "Đã mở phiên trợ lý kho.");
		return phien;
	} catch (error) {
		await dongLoi(hoiId, "loi-model");
		await dongViecCua(hoiId, "Không mở được phiên trợ lý kho.");
		throw error;
	}
}

export async function hoiKhoCho(): Promise<string[]> {
	const ds = await db.taiLieuHoi.findMany({
		where: { trangThai: "DANG_HOI", kenh: "CRM", phienId: null },
		orderBy: { hoiLuc: "asc" },
		take: HOI.loGui,
		select: { id: true },
	});
	return ds.map((h) => h.id);
}

export async function dongHoiKhoQuaHan(
	now: Date = new Date(),
): Promise<number> {
	const { count } = await db.taiLieuHoi.updateMany({
		where: {
			trangThai: "DANG_HOI",
			hoiLuc: { lt: new Date(now.getTime() - HOI.hanTraLoiMs) },
		},
		data: { trangThai: "LOI", lyDo: "qua-han", xongLuc: now },
	});
	await dongViecMoCoi();
	return count;
}

export async function drainHoiKho(send: SendFn): Promise<number> {
	await dongHoiKhoQuaHan();
	const ds = await hoiKhoCho();
	const kq = await Promise.allSettled(ds.map((id) => guiHoiKho(id, send)));
	return kq.filter((k) => k.status === "fulfilled" && k.value).length;
}

export async function dongHoiKhoKhiPhienXong(
	token: string | null | undefined,
): Promise<boolean> {
	const hoiId = hoiTuToken(token);
	if (!hoiId) return false;
	await dongLoi(hoiId, "loi-model");
	return true;
}

export async function dongHoiKhoKhiPhienHong(
	token: string | null | undefined,
	lyDo: string,
): Promise<boolean> {
	const hoiId = hoiTuToken(token);
	if (!hoiId) return false;
	await dongLoi(hoiId, phanLoaiLoi(lyDo));
	return true;
}

export const ketQuaTroLyKho = z.object({
	result: z.object({
		kind: z.literal("subagent-result"),
		subagentName: z.literal("tro_ly_kho"),
		isError: z.boolean().optional(),
		output: z.object({ message: z.string() }).nullable().catch(null),
	}),
});
export type KetQuaTroLyKho = z.infer<typeof ketQuaTroLyKho>;

async function hoiCuaPhienGoc(ctx: PurposeContext): Promise<string | null> {
	const purpose = purposeOf(ctx);
	const hoiId = attribute(ctx, "hoiId");
	if (!hoiId) return null;
	if (purpose === PURPOSE_KHO) return hoiId;
	if (purpose !== "zalo") return null;
	const hang = await db.taiLieuHoi.findUnique({
		where: { zaloHoiId: hoiId },
		select: { id: true },
	});
	return hang?.id ?? null;
}

export async function dongTheoKetQuaCon(
	kq: KetQuaTroLyKho,
	ctx: PurposeContext,
): Promise<void> {
	const hoiId = await hoiCuaPhienGoc(ctx);
	if (!hoiId) return;
	if (kq.result.isError) {
		await dongLoi(hoiId, phanLoaiLoi(kq.result.output?.message ?? ""));
		return;
	}
	await dongLoi(hoiId, "loi-model");
}
