import { ActivityType } from "@crm/db";
import { activityMeta } from "@crm/validation/activity-meta";
import { z } from "zod";

const COMPOSABLE_TYPES = [
	ActivityType.NOTE,
	ActivityType.CALL,
	ActivityType.EMAIL,
	ActivityType.MEETING,
] as const;

const composableEnum = z.enum(COMPOSABLE_TYPES);

const ALL_ACTIVITY_TYPES = [
	ActivityType.NOTE,
	ActivityType.CALL,
	ActivityType.EMAIL,
	ActivityType.MEETING,
	ActivityType.TASK,
	ActivityType.STAGE_CHANGE,
	ActivityType.ENRICHMENT,
	ActivityType.PLAN_CHANGE,
] as const;

const activityTypeOutput = z.enum(ALL_ACTIVITY_TYPES);

const TIMELINE_FILTERS = ["all", "notes", "email", "meetings"] as const;

export type TimelineFilter = (typeof TIMELINE_FILTERS)[number];

export const timelineInput = z.object({
	companyId: z.string().optional(),
	contactId: z.string().optional(),
	dealId: z.string().optional(),
	planId: z.string().optional(),
	filter: z.enum(TIMELINE_FILTERS).default("all"),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(100).default(30),
});

export type TimelineInput = z.infer<typeof timelineInput>;

export const timelineCountsInput = z.object({
	companyId: z.string().optional(),
	contactId: z.string().optional(),
	dealId: z.string().optional(),
	planId: z.string().optional(),
});

export const activityCreateInput = z
	.object({
		type: composableEnum,
		subject: z.string().trim().optional(),
		body: z.string().trim().optional(),
		occurredAt: z.string().optional(),
		companyId: z.string().optional(),
		contactId: z.string().optional(),
		dealId: z.string().optional(),
		planId: z.string().optional(),
	})
	.refine(
		(input) =>
			input.companyId || input.contactId || input.dealId || input.planId,
		{
			message:
				"An activity has to be about a company, a contact, a deal or a 30-day plan.",
		},
	);

export type ActivityCreateInput = z.infer<typeof activityCreateInput>;

const activityAuthorOutput = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	image: z.string().nullable(),
});

const activityCompanyRefOutput = z
	.object({
		id: z.string(),
		name: z.string(),
	})
	.nullable();

const activityContactRefOutput = z
	.object({
		id: z.string(),
		firstName: z.string(),
		lastName: z.string().nullable(),
	})
	.nullable();

const activityDealRefOutput = z
	.object({
		id: z.string(),
		name: z.string(),
	})
	.nullable();

const activityEmailThreadOutput = z
	.object({
		id: z.string(),
		messageCount: z.number(),
		lastMessageAt: z.string(),
	})
	.nullable();

const activityCalendarEventOutput = z
	.object({
		id: z.string(),
		startsAt: z.string(),
		endsAt: z.string(),
		isAllDay: z.boolean(),
		location: z.string().nullable(),
		conferenceUrl: z.string().nullable(),
		attendeeCount: z.number(),
	})
	.nullable();

const stageRefOutput = z.object({ id: z.string(), label: z.string() });

export const activityStageChangeOutput = z
	.object({ from: stageRefOutput.nullable(), to: stageRefOutput })
	.nullable();

export const activityEntryOutput = z.object({
	id: z.string(),
	type: activityTypeOutput,
	subject: z.string().nullable(),
	body: z.string().nullable(),
	occurredAt: z.string().nullable(),
	dueAt: z.string().nullable(),
	completedAt: z.string().nullable(),
	meta: activityMeta,
	createdAt: z.string(),
	createdBy: activityAuthorOutput,
	company: activityCompanyRefOutput,
	contact: activityContactRefOutput,
	deal: activityDealRefOutput,
	planId: z.string().nullable(),
	emailThread: activityEmailThreadOutput,
	calendarEvent: activityCalendarEventOutput,
	stageChange: activityStageChangeOutput.optional(),
});

export type ActivityEntry = z.infer<typeof activityEntryOutput>;

export const timelineOutput = z.object({
	entries: z.array(activityEntryOutput),
	nextCursor: z.string().nullable(),
});

export type TimelineResult = z.infer<typeof timelineOutput>;

export const timelineCountsOutput = z.object({
	all: z.number(),
	notes: z.number(),
	email: z.number(),
	meetings: z.number(),
});

export type TimelineCounts = z.infer<typeof timelineCountsOutput>;

export const activityCreateOutput = activityEntryOutput;
