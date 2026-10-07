import { expect, setSystemTime, spyOn } from "bun:test";
import { db } from "@crm/db";
import { VIEC_OKR } from "@crm/db/agent-tasks";
import { ghiChiPhi } from "@crm/db/ai-chi-phi";
import type { TinhNang } from "@crm/db/ai-chi-phi-danh-muc";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import type { DongGopY } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { completeTask, noteSession } from "../../agent/agent/lib/tasks";
import nopDeXuat from "../../agent/agent/subagents/tro_ly_okr/tools/nop_de_xuat";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { idMau, xoaBoOkrMau } from "../scripts/okr-mau/nap";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { goiTrpc, type Loai } from "./ma-tran-thu";
import { lamSachOkr, napMau, nguoiMau } from "./okr-mau-san";
import { dungKho, mintPhien } from "./phien-thu";

export const TIEN_TO_TLO = `tlo-${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}-`;
export const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
export const CHO_DB = 120_000;
export const CHO_MA_TRAN = 600_000;

export const mt = (ma: string) => idMau("mt", ma);
export const kr = (ma: string) => idMau("kr", ma);
export const nguoi = (ma: string) => nguoiMau(ma);

export type TraLoi = { status: number; data: unknown; loi: string };

type GiaTriVao =
	| string
	| number
	| boolean
	| null
	| readonly string[]
	| undefined;
export type Vao = Readonly<Record<string, GiaTriVao>>;

let dongHo = MOC_MAU.getTime();

export function datDongHo(luc: Date): void {
	dongHo = luc.getTime();
	setSystemTime(luc);
}

export function tienDongHo(ms = 1_000): Date {
	dongHo += ms;
	setSystemTime(new Date(dongHo));
	return new Date(dongHo);
}

export async function dungUngDung(): Promise<NestExpressApplication> {
	const app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
	spyOn(app.get(AgentTriggerService), "canReachAgent").mockReturnValue(true);
	return app;
}

const PHIEN_SONG_MS = 365 * 24 * 60 * 60 * 1000;

export async function phienMau(ma: string): Promise<string> {
	const { cookie, token } = await mintPhien(nguoi(ma));
	await db.session.update({
		where: { token },
		data: { expiresAt: new Date(Date.now() + PHIEN_SONG_MS) },
	});
	return cookie;
}

export async function goi(
	app: NestExpressApplication,
	ten: string,
	loai: Loai,
	vao: Vao | undefined,
	cookie: string,
): Promise<TraLoi> {
	const res = await goiTrpc(
		app,
		ten,
		loai,
		vao as Parameters<typeof goiTrpc>[3],
		{ cookie },
	);
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

export async function goiRest(
	app: NestExpressApplication,
	method: "GET" | "POST" | "PUT",
	duong: string,
	vao: Vao,
	cookie: string,
): Promise<TraLoi> {
	const trongDuong = new Set<string>();
	const url = duong.replace(/\{([^}]+)\}/g, (_, khoa: string) => {
		trongDuong.add(khoa);
		return encodeURIComponent(String(vao[khoa]));
	});
	const conLai = Object.fromEntries(
		Object.entries(vao).filter(
			([k, v]) => !trongDuong.has(k) && v !== undefined,
		),
	);
	const server = app.getHttpServer();
	const day = `${REST_BRIDGE_PATH}${url}`;
	const res =
		method === "GET"
			? await request(server).get(day).query(conLai).set("cookie", cookie)
			: await request(server)
					[method === "POST" ? "post" : "put"](day)
					.set("cookie", cookie)
					.set("content-type", "application/json")
					.send(JSON.stringify(conLai));
	const ok = res.status < 300;
	return {
		status: res.status,
		data: ok ? res.body : undefined,
		loi: ok ? "" : String(res.body?.message ?? ""),
	};
}

export function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

export const NAC_CAU_HINH = {
	tat: { aiOn: false },
	an: {
		aiOn: true,
		aiDeXuatPhamVi: "tat",
		aiDeXuatDonVi: [],
		aiDeXuatAnPhamVi: "toan-cong-ty",
		aiDeXuatAnDonVi: [],
	},
	bat: {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiDeXuatDonVi: [],
		aiDeXuatAnPhamVi: "tat",
		aiDeXuatAnDonVi: [],
	},
} as const satisfies Record<"tat" | "an" | "bat", OkrProgramSua>;

export async function ghiCauHinh(
	app: NestExpressApplication,
	cookieQuanTri: string,
	sua: OkrProgramSua,
): Promise<void> {
	tienDongHo();
	ok(
		await goi(app, "okr.setProgram", "mutation", sua, cookieQuanTri),
		"setProgram",
	);
	tienDongHo();
}

export function dongMau(
	p: Partial<DongGopY> & Pick<DongGopY, "loai" | "objectiveId">,
): DongGopY {
	return {
		keyResultId: null,
		truong: null,
		truoc: null,
		sau: null,
		maVanDe: null,
		targetObjectiveId: null,
		targetKeyResultId: null,
		lyDo: "Câu gọn hơn, nói rõ kết quả.",
		...p,
	};
}

export const phienGocCua = (taskId: string) => `${TIEN_TO_TLO}goc-${taskId}`;

function nguCanhCon(phienGoc: string) {
	return {
		agent: { name: "tro_ly_okr" },
		channel: {
			kind: "subagent",
			continuationToken: `subagent:${phienGoc}:goi-tro-ly`,
		},
		session: {
			id: `${phienGoc}-con`,
			parent: { sessionId: phienGoc, rootSessionId: phienGoc },
		},
	};
}

type KetQuaNop = {
	ketQua: string;
	lyDo: string;
	soDong: number;
	biLoai: number;
};
type CongCuNop = {
	execute: (
		input: { dong: DongGopY[] },
		ctx: ReturnType<typeof nguCanhCon>,
	) => Promise<KetQuaNop>;
};

export async function nopThat(
	taskId: string,
	dong: DongGopY[],
	luc?: Date,
): Promise<KetQuaNop> {
	await db.agentTask.update({
		where: { id: taskId },
		data: {
			attempts: { increment: 1 },
			startedAt: new Date(),
			leasedUntil: new Date(Date.now() + VIEC_OKR.leaseMs),
		},
	});
	const phienGoc = phienGocCua(taskId);
	await noteSession(taskId, phienGoc);
	if (luc) datDongHo(luc);
	else tienDongHo();
	const kq = await (nopDeXuat as unknown as CongCuNop).execute(
		{ dong },
		nguCanhCon(phienGoc),
	);
	if (!luc) tienDongHo();
	if (!(await completeTask(taskId, "da-nop"))) {
		const hang = await db.agentTask.findUniqueOrThrow({
			where: { id: taskId },
			select: { outcome: true },
		});
		if (hang.outcome !== "da-nop")
			throw new Error(
				`viec ${taskId} da dong ${hang.outcome} truoc khi nop xong`,
			);
	}
	return kq;
}

export async function xepGieo(v: {
	objectiveId: string;
	keyResultId?: string | null;
	nguoiYeuCau?: string;
}): Promise<string> {
	tienDongHo();
	const xep = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId: v.objectiveId,
		keyResultId: v.keyResultId ?? null,
		nguoiYeuCau: v.nguoiYeuCau ?? `${TIEN_TO_TLO}gieo`,
		nac: "bat",
	});
	if (!xep.bat) throw new Error(`khong xep duoc: ${xep.lyDo}`);
	if (xep.dungLai) throw new Error(`dung lai viec cu: ${xep.taskId}`);
	return xep.taskId;
}

export async function gieoDong(
	objectiveId: string,
	keyResultId: string | null,
	dong: DongGopY[],
): Promise<string[]> {
	const taskId = await xepGieo({ objectiveId, keyResultId });
	const kq = await nopThat(taskId, dong);
	const hang = await db.okrDeXuat.findMany({
		where: { taskId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: { id: true, trangThai: true, maLoai: true },
	});
	const loai = hang.filter((h) => h.trangThai !== "cho");
	if (kq.biLoai > 0 || loai.length > 0)
		throw new Error(
			`nop co dong bi loai: ${loai.map((h) => h.maLoai).join(", ")}`,
		);
	return hang.map((h) => h.id);
}

export async function doiDauVao(
	app: NestExpressApplication,
	cookie: string,
	keyResultId: string,
): Promise<void> {
	const { weight } = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: keyResultId },
		select: { weight: true },
	});
	tienDongHo();
	ok(
		await goi(
			app,
			"okr.updateKeyResult",
			"mutation",
			{ id: keyResultId, weight: weight.toNumber() === 1 ? 2 : 1 },
			cookie,
		),
		"doi dau vao",
	);
}

export async function gieoChiPhi(v: {
	id: string;
	taskId: string | null;
	usd: string;
	tinhNang?: TinhNang;
	sessionId?: string;
	phienCha?: string | null;
}): Promise<void> {
	await ghiChiPhi(db, {
		id: `${TIEN_TO_TLO}${v.id}`,
		at: new Date(),
		sessionId: v.sessionId ?? `${TIEN_TO_TLO}phien-${v.id}`,
		phienCha: v.phienCha ?? null,
		kenh: null,
		tinhNang: v.tinhNang ?? "okr.de-xuat",
		taskId: v.taskId,
		modelId: null,
		inputTokens: 100,
		cacheReadTokens: 0,
		outputTokens: 10,
		costUsd: Number(v.usd),
	});
}

export async function donTroLy(): Promise<void> {
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: TIEN_TO_TLO } } });
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ kind: "okr-de-xuat" },
				{ kind: "okr-kiem-san-sang", finishedAt: null },
				{ subject: { startsWith: TIEN_TO_TLO } },
			],
		},
	});
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { startsWith: OKR_MAU.tienTo } },
	});
}

export async function batDauMau(): Promise<void> {
	datDongHo(MOC_MAU);
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await donTroLy();
	await dungKho();
	await napMau(MOC_MAU);
	await db.agentTask.create({
		data: {
			kind: "okr-kiem-san-sang",
			reason: "okr-kiem-san-sang",
			subject: `${TIEN_TO_TLO}kiem`,
			dueAt: new Date(MOC_MAU.getTime() - 60_000),
			finishedAt: new Date(MOC_MAU.getTime() - 60_000),
			outcome: "san-sang",
		},
	});
}

export async function ketThucMau(app: NestExpressApplication): Promise<void> {
	await donTroLy();
	await db.session.deleteMany({
		where: { userId: { startsWith: OKR_MAU.tienTo } },
	});
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await app.close();
	setSystemTime();
}

export async function trangThaiDong(id: string): Promise<string> {
	return (
		await db.okrDeXuat.findUniqueOrThrow({
			where: { id },
			select: { trangThai: true },
		})
	).trangThai;
}
