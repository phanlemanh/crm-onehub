import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { db, EnrichmentStatus, Prisma } from "@crm/db";
import type { ChannelEvents } from "eve/channels";
import type { HookEvent } from "eve/hooks";
import mau from "../../api/test/fixtures/loi-hoi-thoai-events.json";
import { crmEvents, taskToken } from "../agent/channels/crm";
import audit from "../agent/hooks/audit";
import { builderToken } from "../agent/lib/custom-agent-dispatch";

type DuLieuLuot = Parameters<NonNullable<ChannelEvents["turn.failed"]>>[0];
type DuLieuPhien = Parameters<NonNullable<ChannelEvents["session.failed"]>>[0];
type SuKienLuot = Pick<HookEvent<"turn.failed">, "type" | "data">;
type XuLyAudit = (
	event: SuKienLuot & { meta: { id: string; at: string } },
	ctx: {
		session: {
			id: string;
			auth: {
				current: { attributes: Record<string, string> };
				initiator: null;
			};
		};
	},
) => Promise<void>;

const hau = crypto.randomUUID();
const nguoi = `log-loi-${hau}`;
const email = `log-loi-${hau}@example.test`;
const cauHoiCho = { kind: "question", id: "cau-hoi-cho" };

let hoiThoai = "";
let task = "";
let lienHe = "";

const kenh = (token: string) => ({
	continuationToken: token,
	setContinuationToken() {},
});

function xuLyLuot() {
	const xuLy = crmEvents["turn.failed"];
	if (!xuLy) throw new Error("kenh crm khong xu ly turn.failed");
	return xuLy;
}

function xuLyPhien() {
	const xuLy = crmEvents["session.failed"];
	if (!xuLy) throw new Error("kenh crm khong xu ly session.failed");
	return xuLy;
}

const dongHoiThoai = (goi: unknown[][]) =>
	goi
		.map((g) => String(g[0]))
		.filter((d) => d.includes("builder conversation"));

beforeAll(async () => {
	await db.user.create({
		data: { id: nguoi, name: nguoi, email: `${nguoi}@example.test` },
	});
	const conversation = await db.agentConversation.create({
		data: { userId: nguoi, kind: "BUILDER", pendingInputRequest: cauHoiCho },
		select: { id: true },
	});
	hoiThoai = conversation.id;
	const contact = await db.contact.create({
		data: {
			firstName: "Log",
			email,
			enrichmentStatus: EnrichmentStatus.RUNNING,
		},
		select: { id: true },
	});
	lienHe = contact.id;
	const row = await db.agentTask.create({
		data: {
			kind: "identify",
			reason: "test",
			dueAt: new Date(Date.now() - 1000),
			budget: 4,
			contactId: lienHe,
			startedAt: new Date(),
			attempts: 1,
		},
		select: { id: true },
	});
	task = row.id;
});

afterAll(async () => {
	await db.agentTask.deleteMany({ where: { id: task } });
	await db.contact.deleteMany({ where: { email } });
	await db.agentEvent.deleteMany({ where: { conversationId: hoiThoai } });
	await db.agentConversation.deleteMany({ where: { userId: nguoi } });
	await db.user.deleteMany({ where: { id: nguoi } });
});

describe("log-loi", () => {
	test("agent ghi log loi hoi thoai", async () => {
		const loi = spyOn(console, "error").mockImplementation(() => {});
		try {
			const luot = { code: "C1", message: "M1" } satisfies DuLieuLuot;
			await xuLyLuot()(luot, kenh(builderToken(hoiThoai)), undefined as never);

			expect(
				dongHoiThoai(loi.mock.calls),
				"agent ghi log loi hoi thoai",
			).toEqual([
				`[agent] builder conversation ${hoiThoai} turn.failed: C1 M1`,
			]);
			const sauLuot = await db.agentConversation.findUniqueOrThrow({
				where: { id: hoiThoai },
			});
			expect(sauLuot.continuationToken).toBe(builderToken(hoiThoai));
			expect(sauLuot.pendingInputRequest).toBeNull();

			await db.agentConversation.update({
				where: { id: hoiThoai },
				data: { pendingInputRequest: cauHoiCho },
			});
			loi.mockClear();
			const phien = { code: "C2", message: "M2" } satisfies DuLieuPhien;
			await xuLyPhien()(phien, kenh(builderToken(hoiThoai)));

			expect(dongHoiThoai(loi.mock.calls)).toEqual([
				`[agent] builder conversation ${hoiThoai} session.failed: C2 M2`,
			]);
			const sauPhien = await db.agentConversation.findUniqueOrThrow({
				where: { id: hoiThoai },
			});
			expect(sauPhien.continuationToken).toBe(builderToken(hoiThoai));
			expect(sauPhien.pendingInputRequest).toBeNull();

			loi.mockClear();
			const luotTask = { code: "C3", message: "M3" } satisfies DuLieuLuot;
			await xuLyLuot()(luotTask, kenh(taskToken(task)), undefined as never);

			expect(dongHoiThoai(loi.mock.calls)).toEqual([]);
			const contact = await db.contact.findUniqueOrThrow({
				where: { id: lienHe },
			});
			expect(contact.enrichmentStatus).toBe(EnrichmentStatus.FAILED);
		} finally {
			loi.mockRestore();
		}
	});
});

describe("ghi-su-kien", () => {
	test("fixture su kien loi la dau ra cua hook audit", async () => {
		const [dong] = mau;
		if (!dong) throw new Error("fixture su kien loi rong");
		const idSuKien = `evt_${hau}_audit`;
		const suKien = {
			type: "turn.failed",
			data: {
				code: "TOOL_EXECUTION_FAILED",
				message: "search_crm: query too short",
			},
		} satisfies SuKienLuot;
		const xuLy = audit.events["*"] as unknown as XuLyAudit;

		await xuLy(
			{ ...suKien, meta: { id: idSuKien, at: new Date().toISOString() } },
			{
				session: {
					id: `ses_${hau}`,
					auth: {
						current: {
							attributes: { purpose: "builder", conversationId: hoiThoai },
						},
						initiator: null,
					},
				},
			},
		);

		const hang = await db.agentEvent.findMany({
			where: { conversationId: hoiThoai, type: "turn.failed" },
		});
		expect(hang).toHaveLength(1);
		expect(
			hang[0]?.data ?? Prisma.DbNull,
			"fixture su kien loi la dau ra cua hook audit",
		).toEqual(dong.data);
	});
});
