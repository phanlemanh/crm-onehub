import { ActivityType, type Db, type Prisma } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import { activityMeta } from "@crm/validation/activity-meta";
import { parseStageChangeMeta } from "@crm/validation/giai-doan";
import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { ActivityStampService } from "../crm/activity-stamp.service";
import { blankToNull } from "../crm/values";
import { InjectDatabase } from "../database/database.constants";
import type {
	ActivityCreateInput,
	ActivityEntry,
	TimelineCounts,
	TimelineFilter,
	TimelineInput,
	TimelineResult,
} from "./activities.contracts";

const AUTHOR_SELECT = {
	id: true,
	name: true,
	email: true,
	image: true,
} as const;

const ENTRY_SELECT = {
	id: true,
	type: true,
	subject: true,
	body: true,
	occurredAt: true,
	dueAt: true,
	completedAt: true,
	meta: true,
	createdAt: true,
	createdBy: { select: AUTHOR_SELECT },
	company: { select: { id: true, name: true } },
	contact: { select: { id: true, firstName: true, lastName: true } },
	deal: { select: { id: true, name: true } },
	planId: true,

	emailThread: {
		select: {
			id: true,
			messageCount: true,
			lastMessageAt: true,
		},
	},
	calendarEvent: {
		select: {
			id: true,
			startsAt: true,
			endsAt: true,
			isAllDay: true,
			location: true,
			conferenceUrl: true,
			_count: { select: { attendees: true } },
		},
	},
} as const;

const CHUA_CHEP = {
	NOT: { type: ActivityType.TASK, viecChep: { isNot: null } },
} satisfies Prisma.ActivityWhereInput;

const NOTE_TYPES = [
	ActivityType.NOTE,
	ActivityType.CALL,
	ActivityType.EMAIL,
	ActivityType.MEETING,
];

@Injectable()
export class ActivitiesService {
	private readonly logger = new Logger(ActivitiesService.name);

	constructor(
		@InjectDatabase() private readonly db: Db,
		private readonly stamp: ActivityStampService,
	) {}

	async timeline(input: TimelineInput): Promise<TimelineResult> {
		const where: Prisma.ActivityWhereInput = {
			AND: [this.anchor(input), filterClause(input.filter), CHUA_CHEP],
		};

		const rows = await this.db.activity.findMany({
			where,
			take: input.limit + 1,
			cursor: input.cursor ? { id: input.cursor } : undefined,
			skip: input.cursor ? 1 : undefined,
			orderBy: [
				{ occurredAt: { sort: "desc", nulls: "last" } },
				{ id: "desc" },
			],
			select: ENTRY_SELECT,
		});

		const hasMore = rows.length > input.limit;
		const entries = hasMore ? rows.slice(0, input.limit) : rows;

		const nhan = await this.nhanGiaiDoan(entries);

		return {
			entries: entries.map((entry) => serializeEntry(entry, nhan)),
			nextCursor: hasMore ? (entries[entries.length - 1]?.id ?? null) : null,
		};
	}

	private async nhanGiaiDoan(entries: Entry[]): Promise<Map<string, string>> {
		const ids = new Set<string>();
		for (const entry of entries) {
			if (entry.type !== ActivityType.STAGE_CHANGE) continue;
			const change = parseStageChangeMeta(entry.meta);
			if (!change) continue;
			ids.add(change.to);
			if (change.from) ids.add(change.from);
		}
		if (ids.size === 0) return new Map();
		const rows = await this.db.dealStage.findMany({
			where: { id: { in: [...ids] } },
			select: { id: true, label: true },
		});
		return new Map(rows.map((row) => [row.id, row.label]));
	}

	async timelineCounts(
		input: Pick<TimelineInput, "companyId" | "contactId" | "dealId" | "planId">,
	): Promise<TimelineCounts> {
		const anchor = this.anchor(input);
		const dem = (filter: TimelineFilter) =>
			this.db.activity.count({
				where: { AND: [anchor, filterClause(filter), CHUA_CHEP] },
			});

		const [all, notes, email, meetings] = await Promise.all([
			dem("all"),
			dem("notes"),
			dem("email"),
			dem("meetings"),
		]);

		return { all, notes, email, meetings };
	}

	async create(
		input: ActivityCreateInput,
		actingUserId: string,
	): Promise<ActivityEntry> {
		const companyId = await this.resolveCompanyId(input);

		const activity = await this.db.activity.create({
			data: {
				type: input.type,
				subject: blankToNull(input.subject ?? ""),
				body: blankToNull(input.body ?? ""),
				occurredAt: parseDate(input.occurredAt) ?? new Date(),
				companyId,
				contactId: input.contactId ?? null,
				dealId: input.dealId ?? null,
				planId: input.planId ?? null,
				createdById: actingUserId,
			},
			select: ENTRY_SELECT,
		});

		await this.stamp.touch(
			{ companyId, contactId: input.contactId, dealId: input.dealId },
			activity.createdAt,
		);

		this.logger.log({
			message: "Activity logged",
			activityId: activity.id,
			type: activity.type,
		});

		return serializeEntry(activity);
	}

	private anchor(
		input: Pick<TimelineInput, "companyId" | "contactId" | "dealId" | "planId">,
	): Prisma.ActivityWhereInput {
		if (input.planId) return { planId: input.planId };
		if (input.dealId) return { dealId: input.dealId };
		if (input.contactId) return { contactId: input.contactId };
		if (input.companyId) return { companyId: input.companyId };
		throw new BadRequestException(
			"A timeline needs a company, a contact, a deal or a 30-day plan.",
		);
	}

	private async resolveCompanyId(
		input: ActivityCreateInput,
	): Promise<string | null> {
		if (input.companyId) return input.companyId;

		if (input.dealId) {
			const deal = await this.db.deal.findUnique({
				where: { id: input.dealId },
				select: { companyId: true },
			});
			if (!deal) {
				throw new NotFoundException(`No deal with id ${input.dealId}.`);
			}
			return deal.companyId;
		}

		if (input.contactId) {
			const contact = await this.db.contact.findUnique({
				where: { id: input.contactId },
				select: { companyId: true },
			});
			if (!contact) {
				throw new NotFoundException(`No contact with id ${input.contactId}.`);
			}
			return contact.companyId;
		}

		if (input.planId) {
			const plan = await this.db.onboardingPlan.findUnique({
				where: { id: input.planId },
				select: { companyId: true },
			});
			if (!plan) {
				throw new NotFoundException(`No 30-day plan with id ${input.planId}.`);
			}
			return plan.companyId;
		}

		return null;
	}
}

function filterClause(filter: TimelineFilter): Prisma.ActivityWhereInput {
	switch (filter) {
		case "notes":
			return { type: { in: NOTE_TYPES } };
		case "email":
			return { type: ActivityType.EMAIL };
		case "meetings":
			return { type: ActivityType.MEETING };
		case "all":
			return {};
	}
}

type Entry = Prisma.ActivityGetPayload<{ select: typeof ENTRY_SELECT }>;

function stageChangeOf(entry: Entry, nhan: Map<string, string>) {
	if (entry.type !== ActivityType.STAGE_CHANGE) return null;
	const change = parseStageChangeMeta(entry.meta);
	if (!change) return null;
	const ref = (id: string) => ({ id, label: nhan.get(id) ?? id });
	return { from: change.from ? ref(change.from) : null, to: ref(change.to) };
}

function serializeEntry(entry: Entry, nhan: Map<string, string> = new Map()) {
	return {
		stageChange: stageChangeOf(entry, nhan),
		...entry,
		occurredAt: entry.occurredAt?.toISOString() ?? null,
		dueAt: entry.dueAt?.toISOString() ?? null,
		completedAt: entry.completedAt?.toISOString() ?? null,
		createdAt: entry.createdAt.toISOString(),
		meta: activityMeta.parse(entry.meta),

		emailThread: entry.emailThread
			? {
					id: entry.emailThread.id,
					messageCount: entry.emailThread.messageCount,
					lastMessageAt: entry.emailThread.lastMessageAt.toISOString(),
				}
			: null,

		calendarEvent: entry.calendarEvent
			? {
					id: entry.calendarEvent.id,
					startsAt: entry.calendarEvent.startsAt.toISOString(),
					endsAt: entry.calendarEvent.endsAt.toISOString(),
					isAllDay: entry.calendarEvent.isAllDay,
					location: entry.calendarEvent.location,
					conferenceUrl: entry.calendarEvent.conferenceUrl,
					attendeeCount: entry.calendarEvent._count.attendees,
				}
			: null,
	};
}

function parseDate(value: string | null | undefined): Date | null {
	if (value === null || value === undefined || value === "") return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new BadRequestException(`"${value}" is not a date.`);
	}
	return date;
}
