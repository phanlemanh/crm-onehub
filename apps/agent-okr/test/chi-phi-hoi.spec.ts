import { afterAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TINH_NANG } from "@crm/db/ai-chi-phi-danh-muc";
import chiPhi from "../agent/hooks/chi-phi";

const T = `cphoi${(process.env.TEST_RUN_ID ?? "x").slice(0, 8)}`;

type XuLy = (
	event: ReturnType<typeof buoc>,
	nguCanh: ReturnType<typeof ctx>,
) => Promise<void>;
const xuLy = (chiPhi as unknown as { events: { "step.completed": XuLy } })
	.events["step.completed"];

const ctx = (sessionId: string, attributes: Record<string, string>) => ({
	session: {
		id: sessionId,
		auth: {
			initiator: { principalId: "nguoi-1", principalType: "user", attributes },
			current: null,
		},
	},
	channel: { kind: "eve" },
});

const buoc = (id: string) => ({
	type: "step.completed",
	data: { usage: { inputTokens: 120, outputTokens: 30, costUsd: 0.0021 } },
	meta: { id, at: "2026-10-14T05:00:00.000Z" },
});

afterAll(async () => {
	await db.aiChiPhi.deleteMany({ where: { id: { startsWith: T } } });
});

describe("hdo chi phi", () => {
	test("okr.hoi-dap co trong danh muc", () => {
		expect((TINH_NANG as readonly string[]).includes("okr.hoi-dap")).toBe(true);
	});

	test("phien hoi ghi okr.hoi-dap voi taskId la cuoc hoi; phien soan van okr.soan", async () => {
		await xuLy(
			buoc(`${T}-hoi`),
			ctx(`${T}-phien-hoi`, {
				purpose: "okr-hoi",
				cuocHoiId: `${T}-cuoc-hoi`,
				vai: "member",
			}),
		);
		await xuLy(
			buoc(`${T}-soan`),
			ctx(`${T}-phien-soan`, {
				purpose: "okr-soan",
				cuocSoanId: `${T}-cuoc-soan`,
				vai: "member",
			}),
		);
		const hang = await db.aiChiPhi.findMany({
			where: { id: { startsWith: T } },
			select: { sessionId: true, tinhNang: true, taskId: true },
			orderBy: { sessionId: "asc" },
		});
		expect(hang).toEqual([
			{
				sessionId: `${T}-phien-hoi`,
				tinhNang: "okr.hoi-dap",
				taskId: `${T}-cuoc-hoi`,
			},
			{
				sessionId: `${T}-phien-soan`,
				tinhNang: "okr.soan",
				taskId: `${T}-cuoc-soan`,
			},
		]);
	});
});
