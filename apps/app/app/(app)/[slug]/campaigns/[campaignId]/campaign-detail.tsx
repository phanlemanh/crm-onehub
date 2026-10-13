"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { ButtonGroup } from "@crm/ui/components/button-group";
import { StatGroup } from "@crm/ui/components/dashboard";
import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { Link } from "@crm/ui/components/link";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import { StatCard } from "@crm/ui/components/stat-card";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { formatPercent } from "@crm/ui/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import NextLink from "next/link";
import { parseAsBoolean, useQueryState } from "nuqs";
import { type ReactNode, useMemo } from "react";
import { toast } from "sonner";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalDateTime } from "@/components/local-date-time";
import {
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	type CampaignMessages,
	campaignMessages,
} from "@/lib/messages/campaigns";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import {
	MEMBERS_PARAM,
	memberInput,
	membersSearchParams,
} from "./members-search-params";

type Campaign = RouterOutputs["campaigns"]["byId"];
type CampaignStatus = Campaign["status"];
type Stats = Campaign["stats"];
type MemberRow = RouterOutputs["campaigns"]["members"]["rows"][number];
type Outcome = NonNullable<MemberRow["lastOutcome"]>;

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
};

const OUTCOMES = [
	"NO_ANSWER",
	"ANSWERED",
	"MEETING",
	"DECLINED",
	"WRONG_NUMBER",
] as const satisfies readonly Outcome[];

const STATUS_VARIANT = {
	DRAFT: "outline",
	RUNNING: "secondary",
	FINISHED: "ghost",
} as const;

const NO_VALUE = "—";

function statusLabel(m: CampaignMessages, status: CampaignStatus): string {
	if (status === "DRAFT") return m.status.draft;
	if (status === "RUNNING") return m.status.running;
	return m.status.finished;
}

function outcomeLabel(m: CampaignMessages, outcome: Outcome): string {
	if (outcome === "NO_ANSWER") return m.outcome.noAnswer;
	if (outcome === "ANSWERED") return m.outcome.answered;
	if (outcome === "MEETING") return m.outcome.meeting;
	if (outcome === "DECLINED") return m.outcome.declined;
	return m.outcome.wrongNumber;
}

function StatsRow({ label, stats }: { label: string; stats: Stats }) {
	const locale = useLocale();
	const m = campaignMessages(locale);
	const counter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
	const count = (value: number | null) =>
		value === null ? NO_VALUE : counter.format(value);
	const rate = (value: number | null) =>
		value === null ? NO_VALUE : formatPercent(value, locale);
	const beside = (word: string, value: number) =>
		stats.called === 0 ? m.stats.noRate : `${word} ${counter.format(value)}`;

	return (
		<section className="flex flex-col gap-3">
			<h2 className="font-medium text-sm">{label}</h2>
			<StatGroup>
				<StatCard label={m.stats.members} value={count(stats.members)} />
				<StatCard label={m.stats.called} value={count(stats.called)} />
				<StatCard
					label={m.stats.answerRate}
					value={rate(stats.answerRate)}
					description={beside(m.stats.answered, stats.answered)}
				/>
				<StatCard
					label={m.stats.meetingRate}
					value={rate(stats.meetingRate)}
					description={beside(m.stats.meetings, stats.meetings)}
				/>
			</StatGroup>
		</section>
	);
}

function ControlRow({ control }: { control: Campaign["control"] }) {
	const m = campaignMessages(useLocale());

	if (control === null) {
		return (
			<section className="flex flex-col gap-3">
				<h2 className="font-medium text-sm">{m.stats.control}</h2>
				<p className="text-muted-foreground text-sm">{m.stats.noControl}</p>
			</section>
		);
	}

	return <StatsRow label={m.stats.control} stats={control} />;
}

function MembersEmpty() {
	const m = campaignMessages(useLocale());
	const workspaceUrl = useWorkspaceUrl();

	return (
		<div className="flex flex-col items-center gap-3">
			<span>{m.empty.members}</span>
			<Button asChild variant="outline" size="sm">
				<NextLink href={workspaceUrl("/contacts")}>
					{m.detail.openView}
				</NextLink>
			</Button>
		</div>
	);
}

function MembersTable({
	campaignId,
	status,
}: {
	campaignId: string;
	status: CampaignStatus;
}) {
	const locale = useLocale();
	const m = campaignMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();
	const counter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

	const { query, input } = useTableQuery(membersSearchParams);
	const [uncalled, setUncalled] = useQueryState(
		MEMBERS_PARAM.uncalled,
		parseAsBoolean.withDefault(false),
	);

	const members = useQuery({
		...trpc.campaigns.members.queryOptions(
			memberInput(campaignId, input, uncalled),
		),
		placeholderData: (previous) => previous,
	});

	const touch = useMutation(
		trpc.campaigns.touch.mutationOptions({
			onSuccess: async () => {
				await cache.campaign(campaignId);
				await cache.activity();
			},
			onError: (error) =>
				toast.error(m.error.touch, { description: error.message }),
		}),
	);

	if (members.isPending) {
		return (
			<div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground text-sm">
				<Spinner />
				{m.loading.members}
			</div>
		);
	}

	const columns: DataTableColumn<MemberRow>[] = [
		{
			id: "name",
			header: m.memberColumns.name,
			hideable: false,
			width: "w-[17%]",
			cell: (row) => (
				<Button
					variant="link"
					size="xs"
					onClick={() => openRecord({ kind: "contact", id: row.id })}
				>
					<span className="truncate" translate="no">
						{row.name}
					</span>
				</Button>
			),
		},
		{
			id: "phone",
			header: m.memberColumns.phone,
			width: "w-[11%]",
			cell: (row) =>
				row.phone === null ? (
					<span className="text-muted-foreground">{m.empty.noPhone}</span>
				) : (
					<Link href={`tel:${row.phone}`} translate="no">
						{row.phone}
					</Link>
				),
		},
		{
			id: "tier",
			header: m.memberColumns.tier,
			width: "w-[9%]",
			hideBelow: "md",
			cell: (row) =>
				row.tier === null ? (
					<EmptyCellValue />
				) : (
					<span className="truncate" translate="no">
						{row.tier}
					</span>
				),
		},
		{
			id: "listingsNew30d",
			header: m.memberColumns.listingsNew30d,
			align: "right",
			width: "w-[8%]",
			hideBelow: "lg",
			cell: (row) =>
				row.listingsNew30d === null ? (
					<EmptyCellValue />
				) : (
					<span className="tabular-nums">
						{counter.format(row.listingsNew30d)}
					</span>
				),
		},
		{
			id: "districts",
			header: m.memberColumns.districts,
			width: "w-[8%]",
			hideBelow: "lg",
			cell: (row) =>
				row.districts === null ? (
					<EmptyCellValue />
				) : (
					<span className="truncate text-muted-foreground" translate="no">
						{row.districts}
					</span>
				),
		},
		{
			id: "lastOutcome",
			header: m.memberColumns.lastOutcome,
			width: "w-[9%]",
			cell: (row) =>
				row.lastOutcome === null ? (
					<EmptyCellValue />
				) : (
					<Badge variant="outline">{outcomeLabel(m, row.lastOutcome)}</Badge>
				),
		},
	];

	if (status === "RUNNING") {
		columns.push({
			id: "record",
			header: m.memberColumns.record,
			hideable: false,
			width: "w-[38%]",
			cell: (row) => (
				<ButtonGroup>
					{OUTCOMES.map((outcome) => {
						const saving =
							touch.isPending &&
							touch.variables?.contactId === row.id &&
							touch.variables?.outcome === outcome;

						return (
							<Button
								key={outcome}
								variant="outline"
								size="xs"
								disabled={touch.isPending}
								onClick={() =>
									touch.mutate({ id: campaignId, contactId: row.id, outcome })
								}
							>
								{saving ? <Spinner /> : null}
								{saving ? m.detail.saving : outcomeLabel(m, outcome)}
							</Button>
						);
					})}
				</ButtonGroup>
			),
		});
	}

	return (
		<DataTable
			query={query}
			search={<ListSearch placeholder={m.detail.search} />}
			actions={
				<Button
					variant={uncalled ? "contrast" : "outline"}
					size="sm"
					onClick={() => setUncalled(uncalled ? null : true)}
				>
					{m.detail.uncalledOnly}
				</Button>
			}
			columns={columns}
			rows={members.data?.rows ?? []}
			total={members.data?.total ?? 0}
			getRowId={(row) => row.id}
			loading={members.isFetching}
			empty={<MembersEmpty />}
		/>
	);
}

export function CampaignDetail({
	id,
	duongDan,
}: {
	id: string;
	duongDan?: ReactNode;
}) {
	const m = campaignMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();

	const campaign = useQuery(trpc.campaigns.byId.queryOptions({ id }));

	const settle = {
		onSuccess: async () => {
			await cache.campaign(id);
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	const start = useMutation(trpc.campaigns.start.mutationOptions(settle));
	const finish = useMutation(trpc.campaigns.finish.mutationOptions(settle));
	const views = useQuery(
		trpc.savedViews.list.queryOptions({ entity: "CONTACT" }),
	);
	const repoint = useMutation(
		trpc.campaigns.repoint.mutationOptions({
			onSuccess: async () => {
				await cache.campaign(id);
				await cache.savedViews("contact");
				toast.success(m.detail.segmentChanged);
			},
			onError: (error: { message: string }) => toast.error(error.message),
		}),
	);

	if (campaign.isError && !campaign.data)
		return (
			<>
				<PageShellHeader breadcrumb={duongDan} />
				<VungTaiLoi
					dangTai={campaign.isFetching}
					data-trang-thai="ST-chiendich-loi"
					moTa={m.detail.loadErrorBody}
					onThuLai={() => campaign.refetch()}
					tieuDe={m.detail.loadErrorTitle}
				/>
			</>
		);
	if (!campaign.data) {
		return (
			<PageShellHeader breadcrumb={duongDan}>
				<div className="basis-full">
					<KhungXuong coTieuDe hinh="tong-quan" />
				</div>
			</PageShellHeader>
		);
	}

	const row = campaign.data;

	return (
		<>
			<PageShellHeader breadcrumb={duongDan}>
				<PageShellHeading>
					<PageShellTitle translate="no">{row.name}</PageShellTitle>
					<PageShellDescription>
						<span translate="no">{row.segmentName}</span>
						{row.startedAt === null ? null : (
							<>
								{" · "}
								{m.detail.startedAt}{" "}
								<LocalDateTime date={row.startedAt} options={DATE_OPTIONS} />
							</>
						)}
						{row.finishedAt === null ? null : (
							<>
								{" · "}
								{m.detail.finishedAt}{" "}
								<LocalDateTime date={row.finishedAt} options={DATE_OPTIONS} />
							</>
						)}
					</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Badge variant={STATUS_VARIANT[row.status]}>
						{statusLabel(m, row.status)}
					</Badge>
					<Select
						value={row.savedViewId}
						disabled={repoint.isPending}
						onValueChange={(savedViewId) => repoint.mutate({ id, savedViewId })}
					>
						<SelectTrigger aria-label={m.detail.changeSegment} size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(views.data ?? []).map((view) => (
								<SelectItem key={view.id} value={view.id}>
									<span translate="no">{view.name}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{row.status === "DRAFT" ? (
						<Button
							disabled={start.isPending}
							onClick={() => start.mutate({ id })}
						>
							{start.isPending ? <Spinner /> : null}
							{m.detail.start}
						</Button>
					) : null}
					{row.status === "RUNNING" ? (
						<Button
							variant="outline"
							disabled={finish.isPending}
							onClick={() => finish.mutate({ id })}
						>
							{finish.isPending ? <Spinner /> : null}
							{m.detail.finish}
						</Button>
					) : null}
				</PageShellActions>
			</PageShellHeader>

			<PageShellContent className="min-h-0">
				<div className="flex flex-col gap-4">
					<StatsRow label={m.stats.thisCampaign} stats={row.stats} />
					<ControlRow control={row.control} />
				</div>

				{row.script === null ? null : (
					<section className="flex flex-col gap-2">
						<h2 className="font-medium text-sm">{m.detail.script}</h2>
						<p
							className="whitespace-pre-wrap text-muted-foreground text-sm"
							translate="no"
						>
							{row.script}
						</p>
					</section>
				)}

				<MembersTable campaignId={id} status={row.status} />
			</PageShellContent>
		</>
	);
}
