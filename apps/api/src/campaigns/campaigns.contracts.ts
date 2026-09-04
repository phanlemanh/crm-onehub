import { z } from "zod";
import { CAMPAIGNS } from "./campaigns-config";

export const campaignStatus = z.enum(["DRAFT", "RUNNING", "FINISHED"]);

export const touchOutcome = z.enum([
	"NO_ANSWER",
	"ANSWERED",
	"MEETING",
	"DECLINED",
	"WRONG_NUMBER",
]);

export const campaignIdInput = z.object({ id: z.string() });

export const campaignCreateInput = z.object({
	name: z.string().trim().min(CAMPAIGNS.name.min).max(CAMPAIGNS.name.max),
	savedViewId: z.string(),
	script: z.string().trim().max(CAMPAIGNS.script.max).optional(),
	ownerId: z.string().nullable().optional(),
});

export const campaignMembersInput = z.object({
	id: z.string(),
	page: z.number().int().min(1).default(1),
	pageSize: z
		.number()
		.int()
		.min(1)
		.max(CAMPAIGNS.members.maxPageSize)
		.default(CAMPAIGNS.members.pageSize),
	uncalledOnly: z.boolean().default(false),
	q: z.string().trim().default(""),
});

export const campaignTouchInput = z.object({
	id: z.string(),
	contactId: z.string(),
	outcome: touchOutcome,
	note: z.string().trim().max(CAMPAIGNS.note.max).optional(),
});

const stats = z.object({
	members: z.number().nullable(),
	called: z.number(),
	answered: z.number(),
	meetings: z.number(),
	answerRate: z.number().nullable(),
	meetingRate: z.number().nullable(),
});

export const campaignSummaryOutput = z.object({
	id: z.string(),
	name: z.string(),
	status: campaignStatus,
	segmentName: z.string(),
	savedViewId: z.string(),
	called: z.number(),
	answered: z.number(),
	owner: z.object({ id: z.string(), name: z.string() }).nullable(),
	createdAt: z.string(),
});

export const campaignListOutput = z.array(campaignSummaryOutput);

export const campaignDetailOutput = campaignSummaryOutput.extend({
	script: z.string().nullable(),
	startedAt: z.string().nullable(),
	finishedAt: z.string().nullable(),
	stats,
	control: stats.nullable(),
});

export const campaignMemberOutput = z.object({
	id: z.string(),
	name: z.string(),
	phone: z.string().nullable(),
	tier: z.string().nullable(),
	listingsNew30d: z.number().nullable(),
	districts: z.string().nullable(),
	lastOutcome: touchOutcome.nullable(),
});

export const campaignMembersOutput = z.object({
	rows: z.array(campaignMemberOutput),
	total: z.number(),
});

export const campaignTouchOutput = z.object({
	id: z.string(),
	contactId: z.string(),
	outcome: touchOutcome,
	activityId: z.string(),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateInput>;
export type CampaignMembersInput = z.infer<typeof campaignMembersInput>;
export type CampaignTouchInput = z.infer<typeof campaignTouchInput>;
export type CampaignStats = z.infer<typeof stats>;
export type CampaignSummary = z.infer<typeof campaignSummaryOutput>;
export type CampaignDetail = z.infer<typeof campaignDetailOutput>;
export type CampaignMember = z.infer<typeof campaignMemberOutput>;
export type CampaignMembers = z.infer<typeof campaignMembersOutput>;
export type CampaignTouchResult = z.infer<typeof campaignTouchOutput>;
