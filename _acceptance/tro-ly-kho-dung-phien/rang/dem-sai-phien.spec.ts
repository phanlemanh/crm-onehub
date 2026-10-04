import { afterAll, describe, expect, test } from "bun:test";
import type { SendFn } from "eve/channels";
import { AgentTriggerService } from "../../../apps/api/src/agent/agent-trigger.service.ts";
import { TaiLieuHoiService } from "../../../apps/api/src/tai-lieu/tai-lieu-hoi.service.ts";
import { ghiBuoc } from "../../../apps/agent/agent/lib/so-chi-phi.ts";
import { guiHoiKho } from "../../../apps/agent/agent/lib/tai-lieu-hoi-phien.ts";
import loiDan from "../../../apps/agent/agent/subagents/tro_ly_kho/instructions.ts";
import {
	type CtxBatDauEve,
	ctxBatDauThat,
	donTroLyKho,
	gieoNguoi,
	ma,
} from "../../../apps/agent/test/support/tro-ly-kho-gia.ts";
import { db } from "../../../packages/db/src/index.ts";
import { demSaiPhien, LOAI_SAI_CHO } from "./dem-sai-phien.ts";

type BatDau = (
	e: { type: "session.started" },
	c: CtxBatDauEve,
) => Promise<{ markdown?: string } | null>;

const batDau = (loiDan as unknown as { events: { "session.started": BatDau } })
	.events["session.started"];

async function ghiGoc(goc: string, purpose: string, kenh: string) {
	await ghiBuoc(
		{
			meta: { id: ma("buoc"), at: new Date().toISOString() },
			data: { usage: { inputTokens: 10, outputTokens: 2, costUsd: 0.001 } },
		} as never,
		{
			session: {
				id: goc,
				auth: { current: { attributes: { purpose } }, initiator: null },
			},
			channel: { kind: kenh },
		} as never,
		null,
	);
}

const sendTra = (goc: string) =>
	(async () => ({ id: goc })) as unknown as SendFn;

async function chupAnh() {
	const [su, chi] = await Promise.all([
		db.agentEvent.findMany({ select: { id: true }, orderBy: { id: "asc" } }),
		db.aiChiPhi.findMany({ select: { id: true }, orderBy: { id: "asc" } }),
	]);
	return JSON.stringify({ su, chi });
}

afterAll(async () => {
	await db.agentEvent.deleteMany({ where: { type: LOAI_SAI_CHO } });
	await donTroLyKho();
});

describe("kd-dem", () => {
	test("kd-dem: bang viet truoc, dau sai cho sinh bang duong hong that, chi doc", async () => {
		const A = ma("ses-research-a");
		const B = ma("ses-research-b");
		const C = ma("ses-builder-c");
		const K = ma("ses-kho-k");
		const Z = ma("ses-zalo-z");
		await ghiGoc(A, "research", "crm");
		await ghiGoc(B, "research", "crm");
		await ghiGoc(C, "builder", "crm");
		await ghiGoc(K, "kho", "crm");
		await ghiGoc(Z, "zalo", "zalo");
		for (const goc of [A, B, C]) {
			await batDau({ type: "session.started" }, ctxBatDauThat(goc)).catch(
				() => null,
			);
		}
		const nguoi = await gieoNguoi("member");
		const { hoiId } = await new TaiLieuHoiService(
			db,
			new AgentTriggerService(db),
		).hoi({ id: nguoi.id, role: nguoi.role } as never, {
			cauHoi: "Nghỉ phép năm có chuyển sang năm sau không?",
		});
		await guiHoiKho(hoiId, sendTra(K));
		await batDau({ type: "session.started" }, ctxBatDauThat(K));
		await db.zaloHoi.create({
			data: {
				messageId: ma("msg"),
				crmUserId: nguoi.id,
				zaloChatId: ma("chat"),
				sessionId: Z,
				ketQua: "dang-hoi",
			},
		});
		await batDau({ type: "session.started" }, ctxBatDauThat(Z));

		const truoc = await chupAnh();
		const kq = await demSaiPhien(db);
		const sau = await chupAnh();
		if ((kq.saiCho["crm.nghien-cuu"] ?? 0) !== 2) {
			throw new Error(
				`kd-dem: phien con hong truoc model khong duoc dem ${JSON.stringify(kq)}`,
			);
		}
		expect(kq).toEqual({
			saiCho: { "crm.nghien-cuu": 2, "crm.dung-tac-nhan": 1 },
		});
		expect(sau).toBe(truoc);
	});
});
