"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { cn } from "@crm/ui/lib/utils";
import { parseStageChangeMeta } from "@crm/validation/giai-doan";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import { LocalDateTime, LocalRelativeTime } from "@/components/local-date-time";
import { activityLabel } from "@/lib/activity-presentation";
import { crmMessages } from "@/lib/messages/crm";
import { quaHan } from "@/lib/qua-han";
import type { RouterOutputs } from "@/lib/trpc/types";
import { ActivityIcon } from "./activity-icon";
import { EmailThreadEntry } from "./email-thread-entry";
import { MeetingEntry } from "./meeting-entry";
import { dongVet } from "./plan-change-line";
import type { TimelineAnchor } from "./timeline";

export type TimelineEntryData =
	RouterOutputs["activities"]["timeline"]["entries"][number];

const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
	hour: "numeric",
	minute: "2-digit",
};

function tuMeta(entry: TimelineEntryData) {
	if (entry.type !== "STAGE_CHANGE") return null;
	const meta = parseStageChangeMeta(entry.meta);
	if (!meta) return null;
	return {
		from: meta.from ? { id: meta.from, label: meta.from } : null,
		to: { id: meta.to, label: meta.to },
	};
}

function anchorId(anchor: TimelineAnchor): string {
	if ("companyId" in anchor) return anchor.companyId;
	if ("contactId" in anchor) return anchor.contactId;
	if ("planId" in anchor) return anchor.planId;
	return anchor.dealId;
}

export function TimelineEntry({
	entry,
	anchor,
}: {
	entry: TimelineEntryData;
	anchor: TimelineAnchor;
}) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const isTask = entry.type === "TASK";
	const completedAt =
		entry.completedAt === null ? null : new Date(entry.completedAt);
	const done = completedAt !== null;
	const overdue =
		isTask &&
		entry.dueAt !== null &&
		quaHan(new Date(entry.dueAt), completedAt, new Date());

	const change =
		entry.stageChange === undefined ? tuMeta(entry) : entry.stageChange;
	const when = entry.occurredAt ?? entry.createdAt;

	const synced = entry.meta?.synced === true;
	const author = synced
		? entry.emailThread
			? m.timeline.viaGmail
			: m.timeline.viaCalendar
		: entry.createdBy.name;

	const headline = change ? (
		<>
			{change.from ? (
				<>
					<span translate="no">{change.from.label}</span>
					{" → "}
				</>
			) : null}
			<span translate="no">{change.to.label}</span>
		</>
	) : entry.type === "PLAN_CHANGE" ? (
		dongVet(entry.meta, locale)
	) : (
		entry.subject
	);

	const here = anchorId(anchor);
	const deal = entry.deal && entry.deal.id !== here ? entry.deal : null;
	const contact =
		entry.contact && entry.contact.id !== here ? entry.contact : null;

	const footnotes = Boolean(
		deal || contact || (isTask && !done && entry.dueAt),
	);

	return (
		<li className="flex gap-2.5 py-2">
			<span className="mt-0.5 shrink-0 text-muted-foreground">
				<span role="img" aria-label={activityLabel(entry.type, locale)}>
					<ActivityIcon type={entry.type} />
				</span>
			</span>

			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex min-w-0 items-baseline gap-3">
					<div className="min-w-0 flex-1 space-y-0.5">
						{headline ? (
							<p
								translate={change ? undefined : "no"}
								className={cn(
									"wrap-anywhere font-medium",
									done && "text-muted-foreground line-through",
								)}
							>
								{headline}
							</p>
						) : null}

						{entry.body ? (
							<p
								translate="no"
								className={cn(
									"whitespace-pre-wrap text-pretty wrap-anywhere",
									headline && "text-muted-foreground",
								)}
							>
								{entry.body}
							</p>
						) : null}

						{!headline && !entry.body ? (
							<p className="text-muted-foreground">
								{activityLabel(entry.type, locale)}
							</p>
						) : null}
					</div>

					<span className="shrink-0 text-muted-foreground">
						<span className="hidden sm:inline">{author} · </span>
						<span className="tabular-nums">
							<LocalDateTime date={when} options={TIME_OPTIONS} />
						</span>
					</span>
				</div>

				{entry.calendarEvent ? (
					<MeetingEntry
						eventId={entry.calendarEvent.id}
						startsAt={entry.calendarEvent.startsAt}
						endsAt={entry.calendarEvent.endsAt}
						isAllDay={entry.calendarEvent.isAllDay}
						attendeeCount={entry.calendarEvent.attendeeCount}
						conferenceUrl={entry.calendarEvent.conferenceUrl}
					/>
				) : null}

				{entry.emailThread ? (
					<EmailThreadEntry
						threadId={entry.emailThread.id}
						messageCount={entry.emailThread.messageCount}
					/>
				) : null}

				{footnotes ? (
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
						{isTask && !done && entry.dueAt ? (
							<StatusIndicator
								tone={overdue ? "error" : "info"}
								label={
									<>
										{overdue ? m.closing.overdue : m.timeline.due}{" "}
										<LocalRelativeTime date={entry.dueAt} />
									</>
								}
							/>
						) : null}

						{deal ? (
							<RecordLink kind="deal" id={deal.id}>
								{deal.name}
							</RecordLink>
						) : null}

						{contact ? (
							<RecordLink kind="contact" id={contact.id}>
								{[contact.firstName, contact.lastName]
									.filter(Boolean)
									.join(" ")}
							</RecordLink>
						) : null}
					</div>
				) : null}
			</div>
		</li>
	);
}
