import {
	ActivityType,
	CampaignStatus,
	type Db,
	type Prisma,
	type TouchOutcome,
} from "@crm/db";
import {
	parseSavedViewFilters,
	type SavedViewFilters,
} from "@crm/validation/saved-view";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import type {
	ContactListInput,
	ContactRow,
} from "../contacts/contacts.contracts";
import { ContactsService } from "../contacts/contacts.service";
import { InjectDatabase } from "../database/database.constants";
import type {
	CampaignCreateInput,
	CampaignDetail,
	CampaignMember,
	CampaignMembers,
	CampaignMembersInput,
	CampaignStats,
	CampaignSummary,
	CampaignTouchInput,
	CampaignTouchResult,
} from "./campaigns.contracts";
import {
	ANSWERED_OUTCOMES,
	CAMPAIGNS,
	FIELD_FILTER_PREFIX,
	MEMBER_FIELDS,
	OUTCOME_LABELS,
} from "./campaigns-config";

type CampaignOwner = { id: string; name: string } | null;

type CampaignCounts = { called: number; answered: number };

type MemberPage = { rows: ContactRow[]; total: number };

type CampaignRow = {
	id: string;
	name: string;
	status: CampaignStatus;
	script: string | null;
	savedViewId: string;
	savedView: { id: string; name: string; entity: string; filters: unknown };
	owner: CampaignOwner;
	startedAt: Date | null;
	finishedAt: Date | null;
	createdAt: Date;
};

const CAMPAIGN_SELECT = {
	id: true,
	name: true,
	status: true,
	script: true,
	savedViewId: true,
	savedView: { select: { id: true, name: true, entity: true, filters: true } },
	owner: { select: { id: true, name: true } },
	startedAt: true,
	finishedAt: true,
	createdAt: true,
} as const;

const memberText = z.string().trim().min(1).nullable().catch(null);

const memberNumber = z.number().nullable().catch(null);

function rate(part: number, whole: number): number | null {
	return whole === 0 ? null : part / whole;
}

function fullName(row: ContactRow): string {
	return [row.firstName, row.lastName].filter((part) => part).join(" ");
}

@Injectable()
export class CampaignsService {
	private readonly logger = new Logger(CampaignsService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly contacts: ContactsService,
	) {}

	async list(): Promise<CampaignSummary[]> {
		const rows = await this.db.campaign.findMany({
			orderBy: { createdAt: "desc" },
			select: CAMPAIGN_SELECT,
		});

		const counts = await this.countsFor(rows.map((row) => row.id));

		return rows.map((row) => this.summarize(row, counts.get(row.id)));
	}

	async byId(id: string): Promise<CampaignDetail> {
		const row = await this.require(id);
		const filters = parseSavedViewFilters(row.savedView.filters);

		const [stats, control, members] = await Promise.all([
			this.statsFor({ campaignId: id }),
			this.controlFor(id),
			this.memberCount(filters),
		]);

		const counts = await this.countsFor([id]);

		return {
			...this.summarize(row, counts.get(id)),
			script: row.script,
			startedAt: row.startedAt?.toISOString() ?? null,
			finishedAt: row.finishedAt?.toISOString() ?? null,
			stats: { ...stats, members },
			control,
		};
	}

	async create(
		input: CampaignCreateInput,
		userId: string,
	): Promise<CampaignDetail> {
		const view = await this.db.savedView.findUnique({
			where: { id: input.savedViewId },
			select: { id: true, entity: true },
		});
		if (!view) {
			throw new NotFoundException(
				`No saved view with id ${input.savedViewId}.`,
			);
		}
		if (view.entity !== "CONTACT") {
			throw new BadRequestException(
				`A campaign segment must be a contact view; ${input.savedViewId} is a ${view.entity} view.`,
			);
		}

		const created = await this.db.campaign.create({
			data: {
				name: input.name,
				script: input.script ?? null,
				savedViewId: input.savedViewId,
				ownerId: input.ownerId ?? null,
				createdById: userId,
			},
			select: { id: true },
		});

		this.logger.log({ message: "Campaign created", campaignId: created.id });

		return this.byId(created.id);
	}

	async start(id: string): Promise<CampaignDetail> {
		const campaign = await this.require(id);
		if (campaign.status !== CampaignStatus.DRAFT) {
			throw new ConflictException(
				`This campaign is ${campaign.status}; only a DRAFT campaign starts.`,
			);
		}

		await this.db.campaign.update({
			where: { id },
			data: { status: CampaignStatus.RUNNING, startedAt: new Date() },
		});

		this.logger.log({ message: "Campaign started", campaignId: id });

		return this.byId(id);
	}

	async finish(id: string): Promise<CampaignDetail> {
		const campaign = await this.require(id);
		if (campaign.status !== CampaignStatus.RUNNING) {
			throw new ConflictException(
				`This campaign is ${campaign.status}; only a RUNNING campaign finishes.`,
			);
		}

		await this.db.campaign.update({
			where: { id },
			data: { status: CampaignStatus.FINISHED, finishedAt: new Date() },
		});

		this.logger.log({ message: "Campaign finished", campaignId: id });

		return this.byId(id);
	}

	async members(input: CampaignMembersInput): Promise<CampaignMembers> {
		const campaign = await this.require(input.id);
		const filters = parseSavedViewFilters(campaign.savedView.filters);
		const base = this.contactListFor(filters, input.q);

		const page = input.uncalledOnly
			? await this.uncalledPage(base, campaign.id, input)
			: await this.viewPage(base, input.page, input.pageSize);

		const ids = page.rows.map((row) => row.id);
		const [phones, outcomes] = await Promise.all([
			this.phonesFor(ids),
			this.lastOutcomes(campaign.id, ids),
		]);

		return {
			rows: page.rows.map((row) => this.toMember(row, phones, outcomes)),
			total: page.total,
		};
	}

	async touch(
		input: CampaignTouchInput,
		userId: string,
	): Promise<CampaignTouchResult> {
		const campaign = await this.db.campaign.findUnique({
			where: { id: input.id },
			select: { id: true, name: true, status: true },
		});
		if (!campaign) {
			throw new NotFoundException(`No campaign with id ${input.id}.`);
		}
		if (campaign.status !== CampaignStatus.RUNNING) {
			throw new ConflictException(
				`This campaign is ${campaign.status}; only a RUNNING campaign accepts call outcomes.`,
			);
		}

		return this.db.$transaction(async (tx) => {
			const activity = await tx.activity.create({
				data: {
					type: ActivityType.CALL,
					subject: `${OUTCOME_LABELS[input.outcome]} · ${campaign.name}`,
					body: input.note ?? null,
					occurredAt: new Date(),
					contactId: input.contactId,
					createdById: userId,
				},
				select: { id: true },
			});

			return tx.campaignTouch.create({
				data: {
					campaignId: campaign.id,
					contactId: input.contactId,
					activityId: activity.id,
					outcome: input.outcome,
					note: input.note ?? null,
					createdById: userId,
				},
				select: {
					id: true,
					contactId: true,
					outcome: true,
					activityId: true,
				},
			});
		});
	}

	async statsFor(
		where: Prisma.CampaignTouchWhereInput,
	): Promise<CampaignStats> {
		const [called, answered, meetings] = await Promise.all([
			this.db.campaignTouch.findMany({
				where,
				select: { contactId: true },
				distinct: ["contactId"],
			}),
			this.db.campaignTouch.findMany({
				where: { ...where, outcome: { in: [...ANSWERED_OUTCOMES] } },
				select: { contactId: true },
				distinct: ["contactId"],
			}),
			this.db.campaignTouch.findMany({
				where: { ...where, outcome: "MEETING" },
				select: { contactId: true },
				distinct: ["contactId"],
			}),
		]);

		return {
			members: null,
			called: called.length,
			answered: answered.length,
			meetings: meetings.length,
			answerRate: rate(answered.length, called.length),
			meetingRate: rate(meetings.length, called.length),
		};
	}

	async controlFor(campaignId: string): Promise<CampaignStats | null> {
		const others = await this.db.campaign.count({
			where: { id: { not: campaignId } },
		});
		if (others === 0) return null;

		return this.statsFor({ campaignId: { not: campaignId } });
	}

	async usedViewIds(savedViewId: string): Promise<string[]> {
		const rows = await this.db.campaign.findMany({
			where: { savedViewId },
			select: { name: true },
		});

		return rows.map((row) => row.name);
	}

	private async require(id: string): Promise<CampaignRow> {
		const row = await this.db.campaign.findUnique({
			where: { id },
			select: CAMPAIGN_SELECT,
		});
		if (!row) throw new NotFoundException(`No campaign with id ${id}.`);

		return row;
	}

	private summarize(
		row: CampaignRow,
		counts: CampaignCounts | undefined,
	): CampaignSummary {
		return {
			id: row.id,
			name: row.name,
			status: row.status,
			segmentName: row.savedView.name,
			savedViewId: row.savedViewId,
			called: counts?.called ?? 0,
			answered: counts?.answered ?? 0,
			owner: row.owner,
			createdAt: row.createdAt.toISOString(),
		};
	}

	private async countsFor(
		campaignIds: string[],
	): Promise<Map<string, CampaignCounts>> {
		const counts = new Map<string, CampaignCounts>();
		if (campaignIds.length === 0) return counts;

		const [called, answered] = await Promise.all([
			this.db.campaignTouch.findMany({
				where: { campaignId: { in: campaignIds } },
				select: { campaignId: true, contactId: true },
				distinct: ["campaignId", "contactId"],
			}),
			this.db.campaignTouch.findMany({
				where: {
					campaignId: { in: campaignIds },
					outcome: { in: [...ANSWERED_OUTCOMES] },
				},
				select: { campaignId: true, contactId: true },
				distinct: ["campaignId", "contactId"],
			}),
		]);

		for (const id of campaignIds) counts.set(id, { called: 0, answered: 0 });
		for (const row of called) {
			const entry = counts.get(row.campaignId);
			if (entry) entry.called += 1;
		}
		for (const row of answered) {
			const entry = counts.get(row.campaignId);
			if (entry) entry.answered += 1;
		}

		return counts;
	}

	private contactListFor(
		filters: SavedViewFilters,
		q: string,
	): ContactListInput {
		const facets = new Map<string, string[]>();
		const fields: ContactListInput["fields"] = {};

		for (const [key, selected] of Object.entries(filters.filters)) {
			if (key.startsWith(FIELD_FILTER_PREFIX)) {
				fields[key.slice(FIELD_FILTER_PREFIX.length)] = selected;
				continue;
			}
			facets.set(key, selected);
		}

		return {
			q: q.length > 0 ? q : filters.q,
			sort: filters.sort,
			dir: filters.dir,
			page: 1,
			pageSize: CAMPAIGNS.members.pageSize,
			owner: facets.get("owner") ?? [],
			company: facets.get("company") ?? [],
			source: facets.get("source") ?? [],
			title: facets.get("title") ?? [],
			seniority: facets.get("seniority") ?? [],
			persona: facets.get("persona") ?? [],
			activity: facets.get("activity") ?? [],
			fields,
			archived: filters.archived,
		};
	}

	private async memberCount(filters: SavedViewFilters): Promise<number> {
		const page = await this.contacts.list({
			...this.contactListFor(filters, ""),
			page: 1,
			pageSize: 1,
		});

		return page.total;
	}

	private async viewPage(
		base: ContactListInput,
		page: number,
		pageSize: number,
	): Promise<MemberPage> {
		const result = await this.contacts.list({ ...base, page, pageSize });

		return { rows: result.rows, total: result.total };
	}

	private async uncalledPage(
		base: ContactListInput,
		campaignId: string,
		input: CampaignMembersInput,
	): Promise<MemberPage> {
		const called = await this.calledContactIds(campaignId);
		const { scanPageSize, scanCap } = CAMPAIGNS.members;
		const skip = (input.page - 1) * input.pageSize;
		const rows: ContactRow[] = [];
		let total = 0;
		let scanned = 0;
		let scanPage = 1;

		for (;;) {
			const chunk = await this.contacts.list({
				...base,
				page: scanPage,
				pageSize: scanPageSize,
			});

			for (const row of chunk.rows) {
				if (called.has(row.id)) continue;
				if (total >= skip && rows.length < input.pageSize) rows.push(row);
				total += 1;
			}

			scanned += chunk.rows.length;
			if (scanned >= chunk.total || scanned >= scanCap) break;
			scanPage += 1;
		}

		return { rows, total };
	}

	private async calledContactIds(campaignId: string): Promise<Set<string>> {
		const rows = await this.db.campaignTouch.findMany({
			where: { campaignId },
			select: { contactId: true },
			distinct: ["contactId"],
		});

		return new Set(rows.map((row) => row.contactId));
	}

	private async phonesFor(
		contactIds: string[],
	): Promise<Map<string, string | null>> {
		if (contactIds.length === 0) return new Map();

		const rows = await this.db.contact.findMany({
			where: { id: { in: contactIds } },
			select: { id: true, phone: true },
		});

		return new Map(rows.map((row) => [row.id, row.phone]));
	}

	private async lastOutcomes(
		campaignId: string,
		contactIds: string[],
	): Promise<Map<string, TouchOutcome>> {
		if (contactIds.length === 0) return new Map();

		const rows = await this.db.campaignTouch.findMany({
			where: { campaignId, contactId: { in: contactIds } },
			orderBy: { createdAt: "desc" },
			select: { contactId: true, outcome: true },
			distinct: ["contactId"],
		});

		return new Map(rows.map((row) => [row.contactId, row.outcome]));
	}

	private toMember(
		row: ContactRow,
		phones: Map<string, string | null>,
		outcomes: Map<string, TouchOutcome>,
	): CampaignMember {
		return {
			id: row.id,
			name: fullName(row),
			phone: phones.get(row.id) ?? null,
			tier: memberText.parse(row.fields[MEMBER_FIELDS.tier]),
			listingsNew30d: memberNumber.parse(
				row.fields[MEMBER_FIELDS.listingsNew30d],
			),
			districts: memberText.parse(row.fields[MEMBER_FIELDS.districts]),
			lastOutcome: outcomes.get(row.id) ?? null,
		};
	}
}
