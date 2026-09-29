import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { GIAI_DOAN_GOC, type LoaiGiaiDoan } from "@crm/db/giai-doan";
import { ActivitiesService } from "../src/activities/activities.service";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ActivityStampService } from "../src/crm/activity-stamp.service";
import { ConversionService } from "../src/currency/conversion.service";
import { DealsService } from "../src/deals/deals.service";
import { FieldsService } from "../src/fields/fields.service";
import { withDiscardedCrmEvents } from "./agent-trigger.stub";

const suffix = process.env.TEST_RUN_ID ?? "giai-doan-spec";
const domain = `giai-doan-${suffix}.test`;
const userId = `user-gdtt-${suffix}`;
const tienTo = `gdtt-${suffix}`;

const agent = {
	withCrmEvents: withDiscardedCrmEvents,
} as unknown as AgentTriggerService;

const stamp = new ActivityStampService(db);
const deals = new DealsService(
	db,
	agent,
	stamp,
	new ConversionService(db),
	new FieldsService(db, { fieldBackfill: async () => undefined } as never),
);
const activities = new ActivitiesService(db, stamp);

let companyId = "";
const moi: Record<LoaiGiaiDoan, string> = { OPEN: "", WON: "", LOST: "" };

async function taoGiaiDoan(kind: LoaiGiaiDoan, ten: string, position = 50) {
	const g = await db.dealStage.create({
		data: {
			id: `${tienTo}-${ten}`,
			label: `${ten} ${suffix}`,
			kind,
			position,
		},
		select: { id: true },
	});
	return g.id;
}

async function taoThoaThuan(stage: string, ten = "Thoả thuận") {
	const d = await db.deal.create({
		data: { name: `${ten} ${suffix}`, companyId, ownerId: userId, stage },
		select: { id: true },
	});
	return d.id;
}

async function don() {
	await db.activity.deleteMany({ where: { company: { domain } } });
	await db.deal.deleteMany({ where: { company: { domain } } });
	await db.company.deleteMany({ where: { domain } });
	await db.dealStage.deleteMany({ where: { id: { startsWith: tienTo } } });
	await db.user.deleteMany({ where: { id: userId } });
}

beforeAll(async () => {
	await don();
	await db.user.create({
		data: {
			id: userId,
			name: "Người thử",
			email: `${userId}@example.test`,
			emailVerified: true,
		},
	});
	companyId = (
		await db.company.create({
			data: { name: `Công ty ${suffix}`, domain },
			select: { id: true },
		})
	).id;
	moi.OPEN = await taoGiaiDoan("OPEN", "mo");
	moi.WON = await taoGiaiDoan("WON", "chot");
	moi.LOST = await taoGiaiDoan("LOST", "thua");
});

afterAll(don);

async function doc(id: string) {
	return db.deal.findUniqueOrThrow({
		where: { id },
		select: { stage: true, closedAt: true, closedReason: true },
	});
}

describe("theo-loai", () => {
	it("chuyen vao tung loai hanh xu theo kind cua giai doan moi", async () => {
		const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED);

		await deals.setStage({ id: a, stage: moi.WON }, userId);
		expect((await doc(a)).closedAt, "OPEN->WON moi: closedAt").not.toBeNull();

		await deals.setStage({ id: a, stage: moi.OPEN }, userId);
		const mo = await doc(a);
		expect([mo.closedAt, mo.closedReason], "WON moi->OPEN moi").toEqual([
			null,
			null,
		]);

		await expect(
			deals.setStage({ id: a, stage: moi.LOST }, userId),
			"LOST moi khong ly do duoc chap nhan",
		).rejects.toThrow("Say why");
		expect((await doc(a)).stage).toBe(moi.OPEN);

		await deals.setStage(
			{ id: a, stage: moi.LOST, closedReason: "Hết nhu cầu" },
			userId,
		);
		const thua = await doc(a);
		expect(thua.closedReason).toBe("Hết nhu cầu");
		expect(thua.closedAt).not.toBeNull();

		await deals.setStage({ id: a, stage: GIAI_DOAN_GOC.DEMO_BOOKED }, userId);
		const goc = await doc(a);
		expect([goc.closedAt, goc.closedReason], "LOST moi->OPEN goc").toEqual([
			null,
			null,
		]);
	});

	it("tao moi khong chon giai doan vao OPEN dau tien, ke ca sau khi sap lai", async () => {
		const dau = await db.dealStage.findFirstOrThrow({
			where: { kind: "OPEN", archivedAt: null },
			orderBy: { position: "asc" },
			select: { id: true, position: true },
		});
		const a = await deals.create({
			name: `Tạo mới ${suffix}`,
			companyId,
			ownerId: userId,
		});
		expect((await doc(a.id)).stage).toBe(dau.id);

		await db.dealStage.update({
			where: { id: moi.OPEN },
			data: { position: dau.position - 1 },
		});
		try {
			const b = await deals.create({
				name: `Tạo mới sau sắp ${suffix}`,
				companyId,
				ownerId: userId,
			});
			expect((await doc(b.id)).stage).toBe(moi.OPEN);
		} finally {
			await db.dealStage.update({
				where: { id: moi.OPEN },
				data: { position: 50 },
			});
		}
	});

	it("bulkSetStage vao LOST moi bat ly do", async () => {
		const ids = [
			await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Lô 1"),
			await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Lô 2"),
		];
		await expect(
			deals.bulkSetStage({ ids, stage: moi.LOST }, userId),
			"bulkSetStage LOST moi khong ly do duoc chap nhan",
		).rejects.toThrow("Say why");
		for (const id of ids) {
			expect((await doc(id)).stage).toBe(GIAI_DOAN_GOC.DEMO_BOOKED);
		}

		await deals.bulkSetStage(
			{ ids, stage: moi.LOST, closedReason: "Đổi hướng" },
			userId,
		);
		for (const id of ids) {
			const d = await doc(id);
			expect(d.closedAt).not.toBeNull();
			expect(d.closedReason).toBe("Đổi hướng");
		}
	});
});

describe("timeline-meta-hong", () => {
	it("meta null hoac sai hinh tra stageChange null, khong nem", async () => {
		const a = await taoThoaThuan(GIAI_DOAN_GOC.DEMO_BOOKED, "Meta hỏng");
		for (const meta of [null, { foo: 1 }]) {
			await db.activity.create({
				data: {
					type: "STAGE_CHANGE",
					subject: "Stage changed",
					companyId,
					dealId: a,
					createdById: userId,
					meta: meta ?? undefined,
				},
			});
		}
		const { entries } = await activities.timeline({
			dealId: a,
			limit: 10,
			filter: "all",
		} as never);
		expect(entries).toHaveLength(2);
		expect(entries.map((e) => e.stageChange)).toEqual([null, null]);
	});
});
