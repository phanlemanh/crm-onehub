import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { GIAI_DOAN_GOC, type LoaiGiaiDoan } from "@crm/db/giai-doan";
import { dealListItem, parseDealListResult } from "@crm/validation/deal-list";
import { readDealHistory } from "../agent/lib/accounts";
import { listDeals } from "../agent/lib/lookup";
import { dealPreamble } from "../agent/lib/preamble";
import listDealsTool from "../agent/tools/list_deals";

const suffix = process.env.TEST_RUN_ID ?? "giai-doan-agent";
const domain = `gd-agent-${suffix}.test`;
const userId = `user-gda-${suffix}`;
const tienTo = `gdtt-agent-${suffix}`;

const moi = { OPEN: "", WON: "", LOST: "" } satisfies Record<
	LoaiGiaiDoan,
	string
>;
const nhan = { OPEN: "", WON: "", LOST: "" } satisfies Record<
	LoaiGiaiDoan,
	string
>;
const thoaThuan: { id: string; stage: string }[] = [];

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
			name: "Người agent",
			email: `${userId}@example.test`,
			emailVerified: true,
		},
	});
	const company = await db.company.create({
		data: { name: `Công ty agent ${suffix}`, domain },
		select: { id: true },
	});
	for (const kind of ["OPEN", "WON", "LOST"] as const) {
		nhan[kind] = `Bước ${kind.toLowerCase()} ${suffix}`;
		moi[kind] = (
			await db.dealStage.create({
				data: {
					id: `${tienTo}-${kind}`,
					label: nhan[kind],
					kind,
					position: 70,
				},
			})
		).id;
	}
	for (const stage of [...Object.values(moi), GIAI_DOAN_GOC.CONTRACT_SENT]) {
		const d = await db.deal.create({
			data: {
				name: `Agent ${thoaThuan.length} ${suffix}`,
				companyId: company.id,
				ownerId: userId,
				stage,
			},
			select: { id: true },
		});
		thoaThuan.push({ id: d.id, stage });
	}
	await db.activity.create({
		data: {
			type: "STAGE_CHANGE",
			subject: "Stage changed",
			companyId: company.id,
			dealId: thoaThuan[0]?.id,
			createdById: userId,
			meta: { from: GIAI_DOAN_GOC.DEMO_BOOKED, to: moi.OPEN },
		},
	});
});

afterAll(don);

async function kindOf(id: string): Promise<LoaiGiaiDoan> {
	return (
		await db.dealStage.findUniqueOrThrow({
			where: { id },
			select: { kind: true },
		})
	).kind;
}

describe("giai-doan-agent", () => {
	it("list_deals open, won, lost theo loai cua giai doan", async () => {
		const ids = new Set(thoaThuan.map((t) => t.id));
		let soCa = 0;
		for (const [status, kind] of [
			["open", "OPEN"],
			["won", "WON"],
			["lost", "LOST"],
		] as const) {
			const mong: string[] = [];
			for (const t of thoaThuan) {
				if ((await kindOf(t.stage)) === kind) mong.push(t.id);
			}
			const ra = await listDeals({ status, ownerId: userId, limit: 100 });
			const co = ra.deals.map((d) => d.id).filter((id) => ids.has(id));
			expect(
				co.sort(),
				`${status}: thieu thoa thuan o giai doan ${kind} moi`,
			).toEqual(mong.sort());
			soCa += 1;
		}
		expect(soCa).toBe(3);
	});

	it("lich su va phan mo dau in nhan, khong in id", async () => {
		const dealId = thoaThuan[0]?.id as string;
		const lichSu = JSON.stringify(await readDealHistory(dealId));
		expect(lichSu.includes(nhan.OPEN), "lich su thieu nhan").toBe(true);
		expect(lichSu.includes(moi.OPEN), "lich su in id").toBe(false);
		const moDau = JSON.stringify(
			await dealPreamble(dealId, { dispatched: false }),
		);
		expect(moDau.includes(nhan.OPEN), "mo dau thieu nhan").toBe(true);
		expect(moDau.includes(moi.OPEN), "mo dau in id").toBe(false);
	});
});

const TRUONG_BO_DOC_APP = [
	"id",
	"name",
	"stage",
	"stageId",
	"amount",
	"currency",
	"company",
	"owner",
	"daysSinceLastActivity",
	"neverActive",
	"expectedCloseDate",
];

describe("stage-id", () => {
	it("list_deals tra stageId va nhan hien hanh o moi status", async () => {
		const theoId = new Map(thoaThuan.map((t) => [t.id, t.stage]));
		for (const status of ["open", "won", "lost"] as const) {
			const ra = await listDeals({ status, ownerId: userId, limit: 100 });
			const cua = ra.deals.filter((d) => theoId.has(d.id));
			expect(cua.length, `${status}: khong co thoa thuan`).toBeGreaterThan(0);
			for (const d of cua) {
				const ma = theoId.get(d.id) as string;
				const gd = await db.dealStage.findUniqueOrThrow({
					where: { id: ma },
					select: { label: true },
				});
				expect(d.stageId, "list_deals thieu stageId").toBe(ma);
				expect(d.stage).toBe(gd.label);
			}
		}
	});

	it("dau ra cong cu doc qua dealListResultOf van giu stageId", async () => {
		const theoId = new Map(thoaThuan.map((t) => [t.id, t.stage]));
		const ra = await listDealsTool.execute(
			{ status: "all", ownerId: userId, limit: 100 },
			{} as never,
		);
		const doc = parseDealListResult(ra);
		expect(doc === null, "bo doc cua app tra null").toBe(false);
		const cua = (doc?.deals ?? []).filter((d) => theoId.has(d.id));
		expect(cua.length).toBe(thoaThuan.length);
		for (const d of cua) {
			expect(d.stageId, "ban ghi mat stageId").toBe(theoId.get(d.id) ?? "");
		}
		const goc = new Map(ra.deals.map((d) => [d.id, d]));
		for (const d of cua) {
			const that = goc.get(d.id);
			for (const khoa of new Set([
				...TRUONG_BO_DOC_APP,
				...Object.keys(dealListItem.shape),
			])) {
				expect(
					JSON.stringify(d[khoa as keyof typeof d]),
					`parse lam mat truong ${khoa}`,
				).toBe(JSON.stringify(that?.[khoa as keyof typeof that]));
			}
		}
		const model = listDealsTool.toModelOutput?.(ra as never) as {
			value: { deals: { id: string; stageId?: string }[] };
		};
		const choModel = model.value.deals.filter((d) => theoId.has(d.id));
		expect(choModel.length).toBe(thoaThuan.length);
		for (const d of choModel) {
			expect(d.stageId, "model khong thay stageId").toBe(
				theoId.get(d.id) ?? "",
			);
		}
	});
});
