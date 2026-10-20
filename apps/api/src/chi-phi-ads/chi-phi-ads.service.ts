import type { Db, Prisma } from "@crm/db";
import { Injectable } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	ChiPhiAdsListInput,
	ChiPhiAdsListOutput,
	ChiPhiAdsUpsertInput,
} from "./chi-phi-ads.contracts";

/** Ngày lưu mốc 00:00 UTC — khoá upsert (ngay, nenTang, campaignId) ổn định mọi múi giờ. */
function ngayUtc(ngay: string): Date {
	return new Date(`${ngay}T00:00:00.000Z`);
}

@Injectable()
export class ChiPhiAdsService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async upsertBulk(input: ChiPhiAdsUpsertInput): Promise<{ upserted: number }> {
		const ops = input.rows.map((r) => {
			const ngay = ngayUtc(r.ngay);
			const chung = {
				accountId: r.accountId ?? "",
				campaignName: r.campaignName ?? "",
				spend: r.spend,
				currency: r.currency ?? "VND",
				clicks: r.clicks ?? 0,
				impressions: r.impressions ?? 0,
				conversions: r.conversions ?? 0,
				fetchedAt: r.fetchedAt ? new Date(r.fetchedAt) : null,
			};
			return this.db.chiPhiAds.upsert({
				where: {
					ngay_nenTang_campaignId: {
						ngay,
						nenTang: r.nenTang,
						campaignId: r.campaignId,
					},
				},
				create: {
					ngay,
					nenTang: r.nenTang,
					campaignId: r.campaignId,
					...chung,
				},
				update: chung,
			});
		});
		await this.db.$transaction(ops);
		return { upserted: ops.length };
	}

	async list(input: ChiPhiAdsListInput): Promise<ChiPhiAdsListOutput> {
		const where: Prisma.ChiPhiAdsWhereInput = {
			ngay: { gte: ngayUtc(input.from), lte: ngayUtc(input.to) },
		};
		if (input.nenTang) {
			where.nenTang = input.nenTang;
		}
		const rows = await this.db.chiPhiAds.findMany({
			where,
			orderBy: [{ ngay: "desc" }, { spend: "desc" }],
			take: 5000,
		});
		return {
			rows: rows.map((r) => ({
				ngay: r.ngay.toISOString().slice(0, 10),
				nenTang: r.nenTang,
				accountId: r.accountId,
				campaignId: r.campaignId,
				campaignName: r.campaignName,
				spend: r.spend,
				currency: r.currency,
				clicks: r.clicks,
				impressions: r.impressions,
				conversions: r.conversions,
			})),
			tongSpend: rows.reduce((s, r) => s + r.spend, 0),
		};
	}
}
