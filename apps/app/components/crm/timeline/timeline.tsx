"use client";

import Chat from "@carbon/icons-react/es/Chat";
import Checkmark from "@carbon/icons-react/es/Checkmark";
import Email from "@carbon/icons-react/es/Email";
import Events from "@carbon/icons-react/es/Events";
import Task from "@carbon/icons-react/es/Task";
import Time from "@carbon/icons-react/es/Time";
import { Alert, AlertAction, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { KaraRetry } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { dateFormat } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { cn } from "@crm/ui/lib/utils";
import {
	type QueryClient,
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { DetailSheetEmpty, SECTION_TITLE } from "@/components/detail-sheet";
import { type CrmMessages, crmMessages } from "@/lib/messages/crm";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useHydrated } from "@/lib/use-hydrated";
import { ActivityComposer } from "./activity-composer";
import { TimelineEntry, type TimelineEntryData } from "./timeline-entry";
import {
	historyFilter,
	TIMELINE_TABS,
	type TimelineTab,
	timelineTabParser,
} from "./timeline-search-params";

export type TimelineAnchor =
	| { companyId: string }
	| { contactId: string }
	| { dealId: string }
	| { planId: string };

function tabLabels(m: CrmMessages) {
	const t = m.timeline.tabs;
	return {
		all: t.all,
		notes: t.notes,
		email: t.emails,
		meetings: t.meetings,
		upcoming: t.upcoming,
		done: t.done,
	} satisfies Record<TimelineTab, string>;
}

function emptyStates(m: CrmMessages) {
	const e = m.timeline.empty;
	return {
		all: { title: e.allTitle, description: e.allBody },
		notes: { title: e.notesTitle, description: e.notesBody },
		email: { title: e.emailTitle, description: e.emailBody },
		meetings: { title: e.meetingsTitle, description: e.meetingsBody },
		upcoming: { title: e.upcomingTitle, description: e.upcomingBody },
		done: { title: e.doneTitle, description: e.doneBody },
	} satisfies Record<TimelineTab, { title: string; description: string }>;
}

const EMPTY_ICONS = {
	all: Time,
	notes: Chat,
	email: Email,
	meetings: Events,
	upcoming: Task,
	done: Checkmark,
} satisfies Record<TimelineTab, CarbonIcon>;

const DAY_OPTIONS: Intl.DateTimeFormatOptions = {
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
};

function dayLabel(day: string, local: boolean, locale: Locale): string {
	const now = new Date();
	const today = dayKey(now.toISOString(), local);
	const yesterdayDate = local
		? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
		: new Date(Date.now() - 86_400_000);
	const yesterday = dayKey(yesterdayDate.toISOString(), local);

	const m = crmMessages(locale).timeline;
	if (day === today) return m.today;
	if (day === yesterday) return m.yesterday;
	return dateFormat(locale, DAY_OPTIONS).format(new Date(`${day}T00:00:00`));
}

function byDay(entries: TimelineEntryData[], local: boolean, locale: Locale) {
	const groups = new Map<
		string,
		{ day: string; label: string; entries: TimelineEntryData[] }
	>();

	for (const entry of entries) {
		const day = dayKey(entry.occurredAt ?? entry.createdAt, local);

		const group = groups.get(day);
		if (group) {
			group.entries.push(entry);
		} else {
			groups.set(day, {
				day,
				label: dayLabel(day, local, locale),
				entries: [entry],
			});
		}
	}

	return [...groups.values()];
}

function dayKey(value: string, local: boolean): string {
	if (!local) return value.slice(0, 10);
	const date = new Date(value);
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("-");
}

function TimelineDay({
	label,
	entries,
	anchor,
}: {
	label: string;
	entries: TimelineEntryData[];
	anchor: TimelineAnchor;
}) {
	return (
		<section>
			<h3 className={cn("sticky top-0 z-10 bg-popover py-2", SECTION_TITLE)}>
				{label}
			</h3>
			<ul className="divide-y" data-slot="timeline">
				{entries.map((entry) => (
					<TimelineEntry key={entry.id} entry={entry} anchor={anchor} />
				))}
			</ul>
		</section>
	);
}

type LoiTheoLuot = { xemCu: boolean; lamMoi: boolean };

const KHONG_LOI: LoiTheoLuot = { xemCu: false, lamMoi: false };

type LuotTai = {
	isFetching: boolean;
	isError: boolean;
	isFetchNextPageError: boolean;
	errorUpdateCount: number;
	dataUpdatedAt: number;
	soTrang: number | null;
};

type MocDaThay = { loi: number; du: number; soTrang: number };

type NhoLoi = { loi: LoiTheoLuot; moc: MocDaThay };

const NHO_MOI: NhoLoi = {
	loi: KHONG_LOI,
	moc: { loi: -1, du: 0, soTrang: 0 },
};

const nhoTheoClient = new WeakMap<QueryClient, Map<string, NhoLoi>>();

function soTheoClient(client: QueryClient): Map<string, NhoLoi> {
	const coSan = nhoTheoClient.get(client);
	if (coSan) return coSan;
	const moi = new Map<string, NhoLoi>();
	nhoTheoClient.set(client, moi);
	return moi;
}

function buocKe(nho: NhoLoi, luot: LuotTai): NhoLoi {
	const {
		isFetching,
		isError,
		isFetchNextPageError,
		errorUpdateCount,
		dataUpdatedAt,
		soTrang,
	} = luot;
	if (isFetching || soTrang === null) return nho;
	const { moc, loi } = nho;
	if (isError) {
		if (errorUpdateCount === moc.loi) return nho;
		return {
			loi: isFetchNextPageError
				? { ...loi, xemCu: true }
				: { ...loi, lamMoi: true },
			moc: { loi: errorUpdateCount, du: dataUpdatedAt, soTrang },
		};
	}
	if (dataUpdatedAt === moc.du) return nho;
	const trangKeDuoc = moc.du !== 0 && soTrang > moc.soTrang;
	return {
		loi: trangKeDuoc ? { ...loi, xemCu: false } : KHONG_LOI,
		moc: { loi: errorUpdateCount, du: dataUpdatedAt, soTrang },
	};
}

function useLoiTheoLuot(luot: LuotTai, khoa: string): LoiTheoLuot {
	const client = useQueryClient();
	const so = soTheoClient(client);
	const [, veLai] = useState(0);
	const {
		isFetching,
		isError,
		isFetchNextPageError,
		errorUpdateCount,
		dataUpdatedAt,
		soTrang,
	} = luot;

	useEffect(() => {
		const truoc = so.get(khoa) ?? NHO_MOI;
		const ke = buocKe(truoc, {
			isFetching,
			isError,
			isFetchNextPageError,
			errorUpdateCount,
			dataUpdatedAt,
			soTrang,
		});
		if (ke === truoc) return;
		so.set(khoa, ke);
		veLai((n) => n + 1);
	}, [
		so,
		khoa,
		isFetching,
		isError,
		isFetchNextPageError,
		errorUpdateCount,
		dataUpdatedAt,
		soTrang,
	]);

	return so.get(khoa)?.loi ?? KHONG_LOI;
}

export function Timeline({ anchor }: { anchor: TimelineAnchor }) {
	const trpc = useTRPC();
	const hydrated = useHydrated();
	const locale = useLocale();
	const m = crmMessages(locale);

	const [tab, setTab] = useQueryState(
		SEARCH_PARAM.record.timeline,
		timelineTabParser,
	);

	const counts = useQuery(trpc.activities.timelineCounts.queryOptions(anchor));

	const pinned = useQuery({
		...trpc.activities.timeline.queryOptions({
			...anchor,
			filter: "upcoming",
			limit: 10,
		}),
		enabled: tab === "all",
	});

	const history = useInfiniteQuery({
		...trpc.activities.timeline.infiniteQueryOptions(
			{ ...anchor, filter: historyFilter(tab) },
			{ getNextPageParam: (page) => page.nextCursor ?? undefined },
		),
	});

	const entries = history.data?.pages.flatMap((page) => page.entries) ?? [];
	const pinnedEntries = tab === "all" ? (pinned.data?.entries ?? []) : [];
	const chuaCoTrang = history.data === undefined;
	const loi = useLoiTheoLuot(
		{
			isFetching: history.isFetching,
			isError: history.isError,
			isFetchNextPageError: history.isFetchNextPageError,
			errorUpdateCount: history.errorUpdateCount,
			dataUpdatedAt: history.dataUpdatedAt,
			soTrang: history.data?.pages.length ?? null,
		},
		JSON.stringify([anchor, tab]),
	);
	const thongBaoLamMoi = loi.lamMoi ? (
		<div className="pt-3">
			<Alert data-dtg-loi="lam-moi">
				<AlertDescription>{m.timeline.lamMoiLoi}</AlertDescription>
				<AlertAction>
					<KaraRetry
						onClick={() => void history.refetch()}
						disabled={history.isFetching}
					/>
				</AlertAction>
			</Alert>
		</div>
	) : null;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex shrink-0 flex-col gap-2 border-b px-5 py-3">
				<ActivityComposer anchor={anchor} />

				<div className="min-w-0 overflow-x-auto">
					<ToggleGroup
						type="single"
						value={tab}
						onValueChange={(next) => {
							if (next) void setTab(next as TimelineTab);
						}}
						size="sm"
						spacing={0}
					>
						{TIMELINE_TABS.map((option) => (
							<ToggleGroupItem key={option} value={option}>
								{tabLabels(m)[option]}
								{counts.data?.[option] ? (
									<span className="tabular-nums opacity-60">
										{counts.data[option]}
									</span>
								) : null}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
			</div>

			{history.isPending ? (
				<div className="flex min-h-0 flex-1 items-center justify-center">
					<Spinner />
				</div>
			) : history.isError && chuaCoTrang ? (
				<div className="flex min-h-0 flex-1 items-center justify-center p-5">
					<VungTaiLoi
						tieuDe={m.timeline.loiTieuDe}
						moTa={m.vungCon.loiMoTa}
						onThuLai={() => void history.refetch()}
						dangTai={history.isFetching}
					/>
				</div>
			) : entries.length === 0 && pinnedEntries.length === 0 ? (
				<div className="flex min-h-0 flex-1 flex-col">
					{thongBaoLamMoi ? <div className="px-5">{thongBaoLamMoi}</div> : null}
					<DetailSheetEmpty
						icon={EMPTY_ICONS[tab]}
						title={emptyStates(m)[tab].title}
						description={emptyStates(m)[tab].description}
					/>
				</div>
			) : (
				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4">
					{thongBaoLamMoi}
					{pinnedEntries.length > 0 ? (
						<TimelineDay
							label={m.timeline.outstanding}
							entries={pinnedEntries}
							anchor={anchor}
						/>
					) : null}

					{byDay(entries, hydrated, locale).map((group) => (
						<TimelineDay
							key={group.day}
							label={group.label}
							entries={group.entries}
							anchor={anchor}
						/>
					))}

					{loi.xemCu ? (
						<div className="mt-4">
							<Alert data-dtg-loi="xem-cu">
								<AlertDescription>{m.timeline.xemCuLoi}</AlertDescription>
								<AlertAction>
									<KaraRetry
										onClick={() => void history.fetchNextPage()}
										disabled={history.isFetchingNextPage}
									/>
								</AlertAction>
							</Alert>
						</div>
					) : history.hasNextPage ? (
						<Button
							variant="outline"
							size="sm"
							className="mt-4 self-start"
							disabled={history.isFetchingNextPage}
							onClick={() => history.fetchNextPage()}
						>
							{history.isFetchingNextPage ? <Spinner /> : null}
							{m.timeline.showOlder}
						</Button>
					) : null}
				</div>
			)}
		</div>
	);
}
