"use client";

import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import { Badge } from "@crm/ui/components/badge";
import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import type { Locale } from "@crm/ui/lib/locale";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { OwnerCell } from "@/components/crm/owner-cell";
import { createListSearchParams } from "@/components/data-table/list-search-params";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalRelativeTime } from "@/components/local-date-time";
import {
	type CampaignMessages,
	campaignMessages,
} from "@/lib/messages/campaigns";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { listState } from "./campaign-state";

type CampaignRow = RouterOutputs["campaigns"]["list"][number];
type CampaignStatus = CampaignRow["status"];
type UserRow = RouterOutputs["users"]["list"][number];

const campaignsSearchParams = createListSearchParams({
	defaultSort: "createdAt",
	defaultDir: "desc",
});

const STATUS_RANK = { DRAFT: 0, RUNNING: 1, FINISHED: 2 } as const;

const STATUS_VARIANT = {
	DRAFT: "outline",
	RUNNING: "secondary",
	FINISHED: "ghost",
} as const;

function statusLabel(m: CampaignMessages, status: CampaignStatus): string {
	if (status === "DRAFT") return m.status.draft;
	if (status === "RUNNING") return m.status.running;
	return m.status.finished;
}

function compareRows(
	a: CampaignRow,
	b: CampaignRow,
	sort: string,
	locale: Locale,
): number {
	if (sort === "name") return a.name.localeCompare(b.name, locale);
	if (sort === "segment")
		return a.segmentName.localeCompare(b.segmentName, locale);
	if (sort === "status") return STATUS_RANK[a.status] - STATUS_RANK[b.status];
	if (sort === "called") return a.called - b.called;
	if (sort === "answered") return a.answered - b.answered;
	if (sort === "owner")
		return (a.owner?.name ?? "").localeCompare(b.owner?.name ?? "", locale);
	return Date.parse(a.createdAt) - Date.parse(b.createdAt);
}

function ownerCell(row: CampaignRow, owners: Map<string, UserRow>): ReactNode {
	const known = row.owner ? owners.get(row.owner.id) : undefined;
	if (known) return <OwnerCell owner={known} />;
	if (row.owner) return <span className="truncate">{row.owner.name}</span>;
	return <EmptyCellValue />;
}

function columnsFor(
	m: CampaignMessages,
	owners: Map<string, UserRow>,
): DataTableColumn<CampaignRow>[] {
	return [
		{
			id: "name",
			header: m.columns.name,
			sortable: true,
			hideable: false,
			width: "w-[24%]",
			cell: (row) => (
				<span className="truncate font-medium" translate="no">
					{row.name}
				</span>
			),
		},
		{
			id: "segment",
			header: m.columns.segment,
			sortable: true,
			width: "w-[20%]",
			hideBelow: "md",
			cell: (row) => (
				<span className="truncate text-muted-foreground" translate="no">
					{row.segmentName}
				</span>
			),
		},
		{
			id: "status",
			header: m.columns.status,
			sortable: true,
			width: "w-[12%]",
			cell: (row) => (
				<Badge variant={STATUS_VARIANT[row.status]}>
					{statusLabel(m, row.status)}
				</Badge>
			),
		},
		{
			id: "called",
			header: m.columns.called,
			sortable: true,
			align: "right",
			width: "w-[10%]",
			cell: (row) => <span className="tabular-nums">{row.called}</span>,
		},
		{
			id: "answered",
			header: m.columns.answered,
			sortable: true,
			align: "right",
			width: "w-[10%]",
			cell: (row) => <span className="tabular-nums">{row.answered}</span>,
		},
		{
			id: "owner",
			header: m.columns.owner,
			sortable: true,
			width: "w-[14%]",
			hideBelow: "lg",
			cell: (row) => ownerCell(row, owners),
		},
		{
			id: "createdAt",
			header: m.columns.created,
			sortable: true,
			align: "right",
			width: "w-[10%]",
			hideBelow: "sm",
			cell: (row) => (
				<span className="text-muted-foreground">
					<LocalRelativeTime date={row.createdAt} />
				</span>
			),
		},
	];
}

export function CampaignsTable() {
	const locale = useLocale();
	const m = campaignMessages(locale);
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const trpc = useTRPC();
	const { query } = useTableQuery(campaignsSearchParams);

	const campaigns = useQuery({
		...trpc.campaigns.list.queryOptions(),
		placeholderData: (previous) => previous,
	});
	const users = useQuery(trpc.users.list.queryOptions());

	const all = useMemo(() => campaigns.data ?? [], [campaigns.data]);

	const owners = useMemo(
		() => new Map((users.data ?? []).map((user) => [user.id, user])),
		[users.data],
	);

	const columns = useMemo(() => columnsFor(m, owners), [m, owners]);

	const rows = useMemo(() => {
		const sign = query.dir === "desc" ? -1 : 1;
		const sorted = [...all].sort(
			(a, b) => sign * compareRows(a, b, query.sort, locale),
		);
		const from = (query.page - 1) * query.pageSize;
		return sorted.slice(from, from + query.pageSize);
	}, [all, locale, query.dir, query.page, query.pageSize, query.sort]);

	const state = listState(all, campaigns.isPending);

	if (state === "loading") {
		return (
			<div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground text-sm">
				<Spinner />
				{m.loading.list}
			</div>
		);
	}

	if (state === "empty") {
		return (
			<Empty className="flex-1">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={Bullhorn} />
					</EmptyMedia>
					<EmptyTitle>{m.title}</EmptyTitle>
					<EmptyDescription>{m.empty.list}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<DataTable
			query={query}
			columns={columns}
			rows={rows}
			total={all.length}
			getRowId={(row) => row.id}
			loading={campaigns.isFetching}
			onRowClick={(row) => router.push(workspaceUrl(`/campaigns/${row.id}`))}
		/>
	);
}
