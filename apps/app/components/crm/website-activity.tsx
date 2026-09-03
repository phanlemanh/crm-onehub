"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { useQuery } from "@tanstack/react-query";
import {
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { LocalRelativeTime } from "@/components/local-date-time";
import { crmMessages } from "@/lib/messages/crm";
import { useTRPC } from "@/lib/trpc/client";

type Touch = {
	source: string;
	medium: string | null;
	campaign: string | null;
	at: string | null;
};

export function WebsiteActivity({
	companyId,
	contactId,
}: {
	companyId?: string;
	contactId?: string;
}) {
	const trpc = useTRPC();
	const locale = useLocale();
	const m = crmMessages(locale).web;

	const company = useQuery({
		...trpc.tracking.companyActivity.queryOptions({
			companyId: companyId ?? "",
		}),
		enabled: Boolean(companyId),
	});

	const contact = useQuery({
		...trpc.tracking.contactActivity.queryOptions({
			contactId: contactId ?? "",
		}),
		enabled: Boolean(contactId) && !companyId,
	});

	const activity = companyId ? company.data : contact.data;

	if (!activity?.identified) return null;
	if (activity.pages.length === 0 && !activity.firstTouch) return null;

	const topPage = activity.pages[0];
	const first = activity.firstTouch;
	const last = activity.lastTouch;
	const channelChanged =
		first != null &&
		last != null &&
		channel(last, locale) !== channel(first, locale);
	const campaign = last?.campaign ?? first?.campaign ?? null;

	return (
		<DetailSheetSection title={m.title}>
			<DetailSheetProperties>
				<DetailSheetProperty label={m.pageViews}>
					<span className="tabular-nums">
						{activity.views.toLocaleString()}
					</span>
					{activity.lastSeenAt ? (
						<span className="text-muted-foreground">
							{m.lastSeen}
							<LocalRelativeTime date={activity.lastSeenAt} />
						</span>
					) : null}
				</DetailSheetProperty>

				{first ? (
					<DetailSheetProperty label={m.originalSource}>
						{channel(first, locale)}
					</DetailSheetProperty>
				) : null}

				{topPage ? (
					<DetailSheetProperty label={m.topPage}>
						<span className="flex min-w-0 items-baseline gap-1">
							<span className="truncate font-mono" title={topPage.path}>
								{topPage.path}
							</span>
							<span className="shrink-0 text-muted-foreground">
								{"· "}
								{m.views(String(topPage.views))}
							</span>
						</span>
					</DetailSheetProperty>
				) : null}

				{channelChanged ? (
					<DetailSheetProperty label={m.latestSource}>
						{channel(last, locale)}
					</DetailSheetProperty>
				) : null}

				{first?.at ? (
					<DetailSheetProperty label={m.firstSeen}>
						<LocalRelativeTime date={first.at} />
					</DetailSheetProperty>
				) : null}

				{campaign ? (
					<DetailSheetProperty label={m.campaign}>
						{campaign}
					</DetailSheetProperty>
				) : null}
			</DetailSheetProperties>
		</DetailSheetSection>
	);
}

function channel(touch: Touch | null, locale: Locale): string {
	if (!touch) return crmMessages(locale).web.unknown;
	if (!touch.medium || touch.medium === "direct") return touch.source;
	return `${touch.source} · ${touch.medium}`;
}
