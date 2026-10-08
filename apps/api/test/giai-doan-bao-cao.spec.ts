import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { GIAI_DOAN_GOC, type LoaiGiaiDoan } from "@crm/db/giai-doan";
import { demChiSo } from "@crm/db/okr-chi-so";
import { DEAL_STAGE_KEYS } from "@crm/telemetry/allowlist";
import { ConversionService } from "../src/currency/conversion.service";
import { DashboardService } from "../src/dashboard/dashboard.service";
import { RollupService } from "../src/telemetry/rollup.service";

const suffix = process.env.TEST_RUN_ID ?? "giai-doan-bao-cao";
const domain = `gd-bao-cao-${suffix}.test`;
const userId = `user-gdbc-${suffix}`;
const tienTo = `gdbc-${suffix}`;
const DAY_MS = 24 * 60 * 60 * 1000;

const dashboard = new DashboardService(db, new ConversionService(db));

type BanRollup = { deals_by_stage: Record<string, number> };
type CoCrm = { crm(since: Date): Promise<BanRollup> };

type Gieo = { stage: string; closed: boolean; cents: number };

const moi = { OPEN: "", WON: "", LOST: "" } satisfies Record<
	LoaiGiaiDoan,
	string
>;
const nhan = { OPEN: "", WON: "", LOST: "" } satisfies Record<
	LoaiGiaiDoan,
	string
>;
let companyId = "";
let gieo: Gieo[] = [];

async function don() {
	await db.deal.deleteMany({ where: { company: { domain } } });
	await db.company.deleteMany({ where: { domain } });
	await db.dealStage.deleteMany({ where: { id: { startsWith: tienTo } } });
	await db.user.deleteMany({ where: { id: userId } });
}

async function taoThoaThuan(g: Gieo, closedAt: Date | null) {
	const base = await new ConversionService(db).reportingCurrency();
	await db.deal.create({
		data: {
			name: `Thoả thuận ${suffix}`,
			companyId,
			ownerId: userId,
			stage: g.stage,
			closedAt: g.closed ? closedAt : null,
			amount: g.cents / 100,
			currency: base,
			baseAmount: g.cents / 100,
			baseCurrency: base,
		},
	});
}

beforeAll(async () => {
	await don();
	await db.user.create({
		data: {
			id: userId,
			name: "Người báo cáo",
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
	for (const kind of ["OPEN", "WON", "LOST"] as const) {
		nhan[kind] = `Nhãn ${kind.toLowerCase()} ${suffix}`;
		moi[kind] = (
			await db.dealStage.create({
				data: {
					id: `${tienTo}-${kind}`,
					label: nhan[kind],
					kind,
					position: 60,
				},
			})
		).id;
	}
	gieo = [
		...Array.from({ length: 3 }, () => ({
			stage: GIAI_DOAN_GOC.CLOSED_WON,
			closed: true,
			cents: 1000,
		})),
		...Array.from({ length: 2 }, () => ({
			stage: moi.WON,
			closed: true,
			cents: 2000,
		})),
		{ stage: GIAI_DOAN_GOC.CLOSED_LOST, closed: true, cents: 0 },
		...Array.from({ length: 2 }, () => ({
			stage: GIAI_DOAN_GOC.UNQUALIFIED_TO_BUY,
			closed: true,
			cents: 0,
		})),
		{ stage: moi.LOST, closed: true, cents: 0 },
		{ stage: GIAI_DOAN_GOC.DEMO_BOOKED, closed: false, cents: 3000 },
		{ stage: GIAI_DOAN_GOC.CONTRACT_SENT, closed: false, cents: 4000 },
		{ stage: moi.OPEN, closed: false, cents: 5000 },
	];
	const closedAt = new Date(Date.now() - 5 * DAY_MS);
	for (const g of gieo) await taoThoaThuan(g, closedAt);
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

async function kyVong() {
	let wins = 0;
	let losses = 0;
	const moTheoId = new Map<string, { count: number; valueCents: number }>();
	for (const g of gieo) {
		const kind = await kindOf(g.stage);
		if (kind === "WON") wins += 1;
		if (kind === "LOST") losses += 1;
		if (kind === "OPEN") {
			const cu = moTheoId.get(g.stage) ?? { count: 0, valueCents: 0 };
			moTheoId.set(g.stage, {
				count: cu.count + 1,
				valueCents: cu.valueCents + g.cents,
			});
		}
	}
	const mo = await db.dealStage.findMany({
		where: { kind: "OPEN", archivedAt: null },
		orderBy: { position: "asc" },
		select: { id: true },
	});
	return {
		wins,
		losses,
		stages: mo.map(({ id }) => ({
			stage: id,
			...(moTheoId.get(id) ?? { count: 0, valueCents: 0 }),
		})),
	};
}

describe("tong-quan", () => {
	it("ty le chot tinh theo loai, gom giai doan moi va Unqualified", async () => {
		const mong = await kyVong();
		const tom = await dashboard.summary(userId, { scope: "me" } as never);
		expect(
			[tom.performance.wins, tom.performance.losses],
			`winRate ${tom.performance.wins}/${tom.performance.wins + tom.performance.losses} != ${mong.wins}/${mong.wins + mong.losses}`,
		).toEqual([mong.wins, mong.losses]);
		expect(tom.performance.winRate).toBeCloseTo(
			mong.wins / (mong.wins + mong.losses),
		);
		expect(tom.pipeline.stages).toEqual(mong.stages);
	});
});

describe("okr-telemetry", () => {
	it("chot-duoc dem moi giai doan WON, khong dem LOST moi", async () => {
		const tu = new Date(Date.now() - 10 * DAY_MS);
		const den = new Date(Date.now() + DAY_MS);
		const nguoi = { kieu: "nguoi" as const, id: userId };
		const dem = await demChiSo(
			db,
			{ chiSo: "thoa-thuan-chot-duoc", phamVi: nguoi as never },
			{ tu, den },
		);
		const mong = gieo.filter(
			(g) => g.stage === GIAI_DOAN_GOC.CLOSED_WON || g.stage === moi.WON,
		).length;
		expect(dem, `chot-duoc ${dem} != ${mong}`).toBe(mong);
	});

	it("deals-by-stage tap khoa dong", async () => {
		const goc = await db.dealStage.findUniqueOrThrow({
			where: { id: GIAI_DOAN_GOC.CONTRACT_SENT },
			select: { label: true },
		});
		const nhanMoi = `Đã gửi bản ký ${suffix}`;
		const cat = `${tienTo}-cat`;
		await db.dealStage.create({
			data: {
				id: cat,
				label: `Nhãn đã cất ${suffix}`,
				kind: "OPEN",
				position: 61,
				archivedAt: new Date(),
			},
		});
		await db.dealStage.update({
			where: { id: GIAI_DOAN_GOC.CONTRACT_SENT },
			data: { label: nhanMoi },
		});
		try {
			const rollup = new RollupService(db, {} as never);
			const [crm, cu, thoaThuan] = await Promise.all([
				(rollup as unknown as CoCrm).crm(new Date(0)),
				db.deal.groupBy({ by: ["stage"], _count: { _all: true } }),
				db.deal.findMany({
					select: { stage: true, giaiDoan: { select: { kind: true } } },
				}),
			]);
			const theoStage = crm.deals_by_stage;
			const tapGoc = new Set<string>(Object.values(GIAI_DOAN_GOC));
			const mong = new Map<string, number>();
			for (const t of thoaThuan) {
				const khoa = tapGoc.has(t.stage)
					? t.stage
					: `other_${t.giaiDoan.kind.toLowerCase()}`;
				mong.set(khoa, (mong.get(khoa) ?? 0) + 1);
			}

			expect(
				Object.keys(theoStage).sort(),
				"deals_by_stage co khoa ngoai tap dong",
			).toEqual([...DEAL_STAGE_KEYS].sort());
			for (const ma of tapGoc) {
				expect(theoStage[ma], `deals_by_stage ${ma}`).toBe(mong.get(ma) ?? 0);
			}
			for (const kind of ["open", "won", "lost"]) {
				const khoa = `other_${kind}`;
				expect(mong.get(khoa) ?? 0, `fixture thieu ${khoa}`).toBeGreaterThan(0);
				expect(theoStage[khoa], `deals_by_stage ${khoa}`).toBe(mong.get(khoa));
			}
			const tong = Object.values(theoStage).reduce((a, b) => a + b, 0);
			const tongCu = cu.reduce((a, r) => a + r._count._all, 0);
			expect(tong, `tong ${tong} != ${tongCu}`).toBe(tongCu);
			for (const id of [...Object.values(moi), cat]) {
				expect(Object.keys(theoStage).includes(id), `khoa ${id}`).toBe(false);
			}
			const chuoi = JSON.stringify(crm);
			for (const n of [...Object.values(nhan), nhanMoi]) {
				expect(chuoi.includes(n), `payload mang nhan ${n}`).toBe(false);
			}
		} finally {
			await db.dealStage.update({
				where: { id: GIAI_DOAN_GOC.CONTRACT_SENT },
				data: { label: goc.label },
			});
		}
	});
});
