import { ActivityType, type Db, type Prisma } from "@crm/db";
import {
	dauNgayVN,
	NHAC,
	ngayVN,
	type ViecNhac,
	viecCanNhac,
} from "@crm/db/onboarding-nhac";
import {
	banGhiCua,
	CHON_VIEC,
	dieuKienXemViec,
	ngayHan,
	TRANG_THAI_MO,
	VIEC,
} from "@crm/db/viec";
import { activityMeta } from "@crm/validation/activity-meta";
import { Injectable } from "@nestjs/common";
import { toCents } from "../crm/values";
import { ConversionService } from "../currency/conversion.service";
import { InjectDatabase } from "../database/database.constants";
import { ONBOARDING } from "../onboarding/onboarding-config";
import type { DashboardSummaryInput } from "./dashboard.contracts";

const OWNER_SELECT = {
	id: true,
	name: true,
	email: true,
	image: true,
} as const;

const TREND_MONTHS = 6;

const RATE_WINDOW_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

type NhacKeHoach = ViecNhac & { loai: "ke-hoach-im" | "moc-ngay" };

function laNhacKeHoach(m: ViecNhac): m is NhacKeHoach {
	return m.loai === "ke-hoach-im" || m.loai === "moc-ngay";
}

function monthIso(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthStart(from: Date, offset: number): Date {
	return new Date(from.getFullYear(), from.getMonth() + offset, 1);
}

function monthKey(date: Date): number {
	return date.getFullYear() * 12 + date.getMonth();
}

@Injectable()
export class DashboardService {
	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly conversion: ConversionService,
	) {}

	async summary(actingUserId: string, input: DashboardSummaryInput) {
		const mine = input.scope === "me";
		const owned = mine ? { ownerId: actingUserId } : {};

		const now = new Date();
		const viecCanLamQuaHan = {
			type: ActivityType.TASK,
			completedAt: null,
			dueAt: { lt: dauNgayVN(now) },
			createdById: mine ? actingUserId : undefined,
			viecChep: { is: null },
		} satisfies Prisma.ActivityWhereInput;
		const startOfMonth = monthStart(now, 0);
		const startOfNextMonth = monthStart(now, 1);
		const startOfPrevMonth = monthStart(now, -1);
		const trendStart = monthStart(now, -(TREND_MONTHS - 1));
		const rateStart = new Date(now.getTime() - RATE_WINDOW_DAYS * DAY_MS);

		const base = await this.conversion.reportingCurrency();
		const counted = this.conversion.countedWhere(base);
		const openStages = await this.db.dealStage.findMany({
			where: { kind: "OPEN", archivedAt: null },
			orderBy: { position: "asc" },
			select: { id: true },
		});

		const [
			openByStage,
			openValueByStage,
			recentDeals,
			closingThisMonthTotals,
			biggestOpen,
			overdueTasks,
			recentActivity,
			unconverted,
		] = await Promise.all([
			this.db.deal.groupBy({
				by: ["stage"],
				where: { ...owned, giaiDoan: { kind: "OPEN" } },
				_count: { _all: true },
			}),
			this.db.deal.groupBy({
				by: ["stage"],
				where: {
					AND: [{ ...owned, giaiDoan: { kind: "OPEN" } }, counted],
				},
				_sum: { baseAmount: true },
			}),
			this.db.deal.findMany({
				where: {
					...owned,
					OR: [
						{ createdAt: { gte: trendStart } },
						{ closedAt: { gte: trendStart } },
					],
				},
				select: {
					baseAmount: true,
					baseCurrency: true,
					giaiDoan: { select: { kind: true } },
					createdAt: true,
					closedAt: true,
				},
			}),
			this.db.deal.aggregate({
				where: {
					AND: [
						{
							...owned,
							giaiDoan: { kind: "OPEN" },
							expectedCloseDate: { gte: startOfMonth, lt: startOfNextMonth },
						},
						counted,
					],
				},
				_count: { _all: true },
				_sum: { baseAmount: true },
			}),
			this.db.deal.findMany({
				where: { ...owned, giaiDoan: { kind: "OPEN" } },
				orderBy: [
					{ baseAmount: { sort: "desc", nulls: "last" } },
					{ expectedCloseDate: "asc" },
				],
				take: 6,
				select: {
					id: true,
					name: true,
					stage: true,
					amount: true,
					currency: true,
					baseAmount: true,
					baseCurrency: true,
					expectedCloseDate: true,
					stageChangedAt: true,
					company: {
						select: {
							id: true,
							name: true,
							iconUrl: true,
							iconDarkUrl: true,
							iconTone: true,
						},
					},
					owner: { select: OWNER_SELECT },
				},
			}),
			this.db.activity.findMany({
				where: viecCanLamQuaHan,
				orderBy: [{ dueAt: "asc" }],
				take: 10,
				select: {
					id: true,
					subject: true,
					dueAt: true,
					createdBy: { select: { id: true, name: true } },
					company: { select: { id: true, name: true } },
					deal: { select: { id: true, name: true } },
				},
			}),
			this.db.activity.findMany({
				where: {
					createdById: mine ? actingUserId : undefined,
					NOT: { type: ActivityType.TASK, viecChep: { isNot: null } },
				},
				orderBy: [{ createdAt: "desc" }],
				take: 12,
				select: {
					id: true,
					type: true,
					subject: true,
					body: true,
					createdAt: true,
					meta: true,
					createdBy: { select: OWNER_SELECT },
					company: { select: { id: true, name: true } },
					deal: { select: { id: true, name: true } },
				},
			}),
			this.conversion.unconverted(owned),
		]);

		const stages = openStages.map(({ id: stage }) => {
			const group = openByStage.find((row) => row.stage === stage);
			const value = openValueByStage.find((row) => row.stage === stage);
			return {
				stage,
				count: group?._count._all ?? 0,
				valueCents: toCents(value?._sum.baseAmount ?? null) ?? 0,
			};
		});

		const firstBucket = monthKey(trendStart);
		const trend = Array.from({ length: TREND_MONTHS }, (_, index) => ({
			month: monthIso(monthStart(trendStart, index)),
			won: 0,
			created: 0,
		}));

		const wonThisMonth = { count: 0, valueCents: 0 };
		const wonPrevMonth = { count: 0, valueCents: 0 };
		let wins = 0;
		let losses = 0;
		let valuedWins = 0;
		let wonCents = 0;
		let cycleDays = 0;

		for (const deal of recentDeals) {
			const valued =
				deal.baseCurrency === base ? toCents(deal.baseAmount) : null;
			const cents = valued ?? 0;

			const created = trend[monthKey(deal.createdAt) - firstBucket];
			if (created) created.created += cents;

			const { closedAt, giaiDoan } = deal;
			if (!closedAt) continue;
			const won = giaiDoan.kind === "WON";

			if (won) {
				const closed = trend[monthKey(closedAt) - firstBucket];
				if (closed) closed.won += cents;

				if (closedAt >= startOfMonth && closedAt < startOfNextMonth) {
					wonThisMonth.count += 1;
					wonThisMonth.valueCents += cents;
				} else if (closedAt >= startOfPrevMonth && closedAt < startOfMonth) {
					wonPrevMonth.count += 1;
					wonPrevMonth.valueCents += cents;
				}
			}

			if (closedAt < rateStart) continue;
			if (won) {
				wins += 1;
				if (valued !== null) {
					valuedWins += 1;
					wonCents += cents;
				}
				cycleDays += (closedAt.getTime() - deal.createdAt.getTime()) / DAY_MS;
			} else if (giaiDoan.kind === "LOST") {
				losses += 1;
			}
		}

		const decided = wins + losses;

		return {
			scope: input.scope,
			reportingCurrency: base,
			unconverted,
			pipeline: {
				stages,
				totalCents: stages.reduce((total, s) => total + s.valueCents, 0),
				totalDeals: stages.reduce((total, s) => total + s.count, 0),
			},
			wonThisMonth,
			wonPrevMonth,
			performance: {
				windowDays: RATE_WINDOW_DAYS,
				wins,
				losses,
				winRate: decided === 0 ? null : wins / decided,
				avgDealCents:
					valuedWins === 0 ? null : Math.round(wonCents / valuedWins),
				avgCycleDays: wins === 0 ? null : Math.round(cycleDays / wins),
			},
			trend,
			closingThisMonthTotal: {
				count: closingThisMonthTotals._count._all,
				valueCents: toCents(closingThisMonthTotals._sum.baseAmount) ?? 0,
			},
			biggestOpen: biggestOpen
				.map(
					({
						amount,
						baseAmount,
						baseCurrency,
						expectedCloseDate,
						stageChangedAt,
						...deal
					}) => ({
						...deal,
						amountCents: toCents(amount),
						baseAmountCents: baseCurrency === base ? toCents(baseAmount) : null,
						expectedCloseDate: expectedCloseDate?.toISOString() ?? null,
						stageChangedAt: stageChangedAt.toISOString(),
					}),
				)
				.sort((a, b) => (b.baseAmountCents ?? -1) - (a.baseAmountCents ?? -1)),
			mySteps: await this.buocCuaToi(actingUserId, now),
			quaHan: await this.demQuaHan(viecCanLamQuaHan, actingUserId, mine, now),
			...(await this.viecTrucTiep(actingUserId, now)),
			viecQuaHan: await this.viecQuaHan(actingUserId, mine, now),
			overdueTasks: overdueTasks.map(({ dueAt, ...task }) => ({
				...task,
				dueAt: dueAt?.toISOString() ?? null,
			})),
			recentActivity: recentActivity.map(({ createdAt, meta, ...entry }) => ({
				...entry,
				createdAt: createdAt.toISOString(),
				meta: activityMeta.parse(meta),
			})),
		};
	}

	private async demQuaHan(
		viecCanLam: Prisma.ActivityWhereInput,
		actingUserId: string,
		mine: boolean,
		now: Date,
	) {
		const [viec, buoc, viecChung] = await Promise.all([
			this.db.activity.count({ where: viecCanLam }),
			this.db.onboardingStep.count({
				where: {
					assigneeId: actingUserId,
					completedAt: null,
					plan: { closedAt: null },
					dueAt: { lt: dauNgayVN(now) },
				},
			}),
			this.db.viec.count({
				where: this.dieuKienViecQuaHan(actingUserId, mine, now),
			}),
		]);
		return { viec: viec + viecChung, buoc };
	}

	private dieuKienViecQuaHan(
		actingUserId: string,
		mine: boolean,
		now: Date,
	): Prisma.ViecWhereInput {
		return {
			AND: [
				{
					trangThai: { in: [...TRANG_THAI_MO] },
					hanNgay: { lt: dauNgayVN(now) },
				},
				mine
					? { nguoiThucHienId: actingUserId }
					: dieuKienXemViec(actingUserId),
			],
		};
	}

	private async viecQuaHan(actingUserId: string, mine: boolean, now: Date) {
		const hang = await this.db.viec.findMany({
			where: this.dieuKienViecQuaHan(actingUserId, mine, now),
			orderBy: [{ hanNgay: "asc" }, { id: "asc" }],
			take: VIEC.tranTongQuan,
			select: CHON_VIEC,
		});
		return hang.map((h) => ({
			loai: "viec" as const,
			id: h.id,
			tieuDe: h.tieuDe,
			hanNgay: h.hanNgay ? ngayHan(h.hanNgay) : "",
			nguoiThucHien: { id: h.nguoiThucHien.id, name: h.nguoiThucHien.name },
			banGhi: h.gan[0] ? banGhiCua(h.gan[0]) : null,
		}));
	}

	private async buocCuaToi(actingUserId: string, now: Date) {
		const han = new Date(
			dauNgayVN(now).getTime() + (ONBOARDING.viecCuaToi.cuaSoNgay + 1) * DAY_MS,
		);
		const buoc = await this.db.onboardingStep.findMany({
			where: {
				assigneeId: actingUserId,
				completedAt: null,
				plan: { closedAt: null },
				dueAt: { lt: han },
			},
			orderBy: [{ dueAt: "asc" }, { id: "asc" }],
			take: ONBOARDING.viecCuaToi.tran,
			select: {
				id: true,
				label: true,
				dueAt: true,
				planId: true,
				plan: { select: { company: { select: { id: true, name: true } } } },
			},
		});
		return buoc.map((b) => ({
			stepId: b.id,
			nhan: b.label,
			dueAt: ngayVN(b.dueAt),
			planId: b.planId,
			company: b.plan.company,
		}));
	}

	private async viecTrucTiep(userId: string, now: Date) {
		const ds =
			(await viecCanNhac(this.db, { now, userId, cuaSo: "truc-tiep" })).get(
				userId,
			) ?? [];
		const taiLieu = ds.find((v) => v.loai === "tai-lieu-cho-duyet");
		return {
			keHoachCanDeY: this.keHoachCanDeY(ds),
			taiLieuChoDuyet: taiLieu?.loai === "tai-lieu-cho-duyet" ? taiLieu.so : 0,
		};
	}

	private keHoachCanDeY(ds: ViecNhac[]) {
		return ds
			.filter(laNhacKeHoach)
			.slice(0, NHAC.tran)
			.map(
				({
					loai,
					planId,
					companyName,
					goiY,
					soNgay,
					soBuocXong,
					soBuocTong,
					targetDays,
				}) => ({
					loai,
					planId,
					companyName,
					goiY,
					soNgay: soNgay ?? 0,
					soBuocXong,
					soBuocTong,
					targetDays,
				}),
			);
	}
}
