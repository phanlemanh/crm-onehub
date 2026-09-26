import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { ALLOWED_PROPERTIES, permitted } from "@crm/telemetry";
import type { FunnelService } from "../src/telemetry/funnel.service";
import { RollupService } from "../src/telemetry/rollup.service";

const TIEN_TO = "tzh-";
const GIO_MS = 60 * 60 * 1000;
const NGAY_MS = 24 * GIO_MS;

type Gom = { gather(since: Date): Promise<{ properties: Record<string, unknown> }> };

async function donDep(): Promise<void> {
	await db.zaloHoi.deleteMany({ where: { messageId: { startsWith: TIEN_TO } } });
}

beforeEach(donDep);
afterAll(donDep);

describe("zalo-hoi", () => {
	it("dem cau hoi Zalo theo ket qua trong 24 gio va trung vi do tre", async () => {
		const now = Date.now();
		const hang = [
			{ ketQua: "da-tra-loi", doTreMs: 1_000, truoc: 1 },
			{ ketQua: "da-tra-loi", doTreMs: 5_000, truoc: 2 },
			{ ketQua: "da-tra-loi", doTreMs: 9_000, truoc: 3 },
			{ ketQua: "tu-choi-vai", doTreMs: null, truoc: 4 },
			{ ketQua: "loi", doTreMs: null, truoc: 5 },
			{ ketQua: "da-tra-loi", doTreMs: 90_000, truoc: 72 },
			{ ketQua: "tu-choi-vai", doTreMs: null, truoc: 72 },
		];
		await db.zaloHoi.createMany({
			data: hang.map((h, i) => ({
				messageId: `${TIEN_TO}${i}`,
				crmUserId: `${TIEN_TO}nguoi-${i}`,
				zaloChatId: `${TIEN_TO}chat-${i}`,
				hoiLuc: new Date(now - h.truoc * GIO_MS),
				ketQua: h.ketQua,
				doTreMs: h.doTreMs,
			})),
		});

		const rollup = new RollupService(db, {} as FunnelService) as unknown as Gom;
		const { properties } = await rollup.gather(new Date(now - NGAY_MS));
		const gui = permitted(properties as Parameters<typeof permitted>[0]);

		expect(gui.zalo_questions, "zalo_questions").toEqual({
			"da-tra-loi": 3,
			"tu-choi-vai": 1,
			loi: 1,
		});
		expect(gui.zalo_answer_latency_median_s).toBe(5);
		expect(ALLOWED_PROPERTIES).toContain("zalo_questions");
		expect(ALLOWED_PROPERTIES).toContain("zalo_answer_latency_median_s");
		const json = JSON.stringify(gui);
		for (const cam of [TIEN_TO, "messageId", "crmUserId", "zaloChatId"]) {
			expect(json).not.toContain(cam);
		}
	});
});
