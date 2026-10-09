"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
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
	const crm = crmMessages(locale);
	const m = crm.web;

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

	const query = companyId ? company : contact;
	const activity = query.data;

	if (query.isLoading)
		return (
			<DetailSheetSection title={m.title}>
				<div aria-busy="true" className="flex flex-col gap-2">
					<span className="sr-only">{crm.vungCon.dangTai}</span>
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</DetailSheetSection>
		);

	if (query.isError)
		return (
			<DetailSheetSection title={m.title}>
				<VungTaiLoi
					tieuDe={m.loiTieuDe}
					moTa={crm.vungCon.loiMoTa}
					onThuLai={() => void query.refetch()}
					dangTai={query.isFetching}
				/>
			</DetailSheetSection>
		);

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
