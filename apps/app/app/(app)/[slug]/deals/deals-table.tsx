"use client";

import Archive from "@carbon/icons-react/es/Archive";
import { Button } from "@crm/ui/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
	DataTableFacetMenu,
} from "@crm/ui/components/data-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { useTableSelection } from "@crm/ui/hooks/use-table-selection";
import { formatMoney } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useMemo } from "react";
import { closingOptions } from "@/components/crm/closing-window";
import { CompanyCell } from "@/components/crm/company-cell";
import { useFieldColumns } from "@/components/crm/fields/field-columns";
import { useFieldFacets } from "@/components/crm/fields/field-facets";
import { OwnerCell } from "@/components/crm/owner-cell";
import { usePrefetchRecord } from "@/components/crm/record-sheet/record-prefetch";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { DealStageMenu } from "@/components/crm/stage-change";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalDay, LocalRelativeTime } from "@/components/local-date-time";
import { useGiaiDoan } from "@/lib/giai-doan";
import { type DealMessages, dealMessages } from "@/lib/messages/deals";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { DealsBoard } from "./deals-board";
import { DealsBulkActions } from "./deals-bulk-actions";
import {
	DEALS_VIEWS,
	dealBoardInputFrom,
	dealsSearchParams,
	dealsViewParsers,
	showsBoard,
} from "./deals-search-params";

type DealRow = RouterOutputs["deals"]["list"]["rows"][number];

function columnsFor(
	m: DealMessages,
	locale: Locale,
): DataTableColumn<DealRow>[] {
	return [
		{
			id: "name",
			header: m.headers.name,
			sortable: true,
			hideable: false,
			width: "w-[17%]",
			cell: (row) => <span className="truncate font-medium">{row.name}</span>,
		},
		{
			id: "company",
			header: m.headers.company,
			sortable: true,
			width: "w-[18%]",
			cell: (row) => <CompanyCell company={row.company} />,
		},
		{
			id: "stage",
			header: m.headers.stage,
			sortable: true,
			width: "w-[18%]",
			cell: (row) => <DealStageMenu dealId={row.id} stage={row.stage} />,
		},
		{
			id: "amount",
			header: m.headers.amount,
			sortable: true,
			align: "right",
			width: "w-[12%]",
			hideBelow: "sm",
			cell: (row) =>
				row.amountCents === null ? (
					<EmptyCellValue />
				) : (
					<span className="tabular-nums">
						{formatMoney(row.amountCents, row.currency, locale)}
					</span>
				),
		},
		{
			id: "owner",
			header: m.headers.owner,
			sortable: true,
			width: "w-[14%]",
			hideBelow: "md",
			cell: (row) => <OwnerCell owner={row.owner} />,
		},
		{
			id: "expectedCloseDate",
			header: m.headers.closeDate,
			sortable: true,
			width: "w-[12%]",
			hideBelow: "lg",
			cell: (row) =>
				row.expectedCloseDate ? (
					<span className="text-muted-foreground">
						<LocalDay date={row.expectedCloseDate} />
					</span>
				) : (
					<EmptyCellValue />
				),
		},
		{
			id: "createdAt",
			header: m.headers.created,
			label: m.labels.createdDate,
			sortable: true,
			align: "right",
			width: "w-[10%]",
			defaultHidden: true,
			cell: (row) => (
				<span className="text-muted-foreground">
					<LocalRelativeTime date={row.createdAt} />
				</span>
			),
		},
		{
			id: "lastActivity",
			header: m.headers.lastActivity,
			sortable: true,
			align: "right",
			width: "w-[19%]",
			hideBelow: "lg",
			cell: (row) => (
				<span className="text-muted-foreground">
					{row.lastActivityAt ? (
						<LocalRelativeTime date={row.lastActivityAt} />
					) : (
						<EmptyCellValue />
					)}
				</span>
			),
		},
	];
}

function archivedColumn(m: DealMessages): DataTableColumn<DealRow> {
	return {
		id: "archivedAt",
		header: m.headers.archived,
		label: m.labels.archivedDate,
		sortable: true,
		align: "right",
		width: "w-[12%]",
		cell: (row) => (
			<span className="text-muted-foreground">
				{row.archivedAt ? (
					<LocalRelativeTime date={row.archivedAt} />
				) : (
					<EmptyCellValue />
				)}
			</span>
		),
	};
}

export function DealsTable() {
	const locale = useLocale();
	const m = dealMessages(locale);
	const openRecord = useOpenRecord();
	const trpc = useTRPC();
	const prefetchRecord = usePrefetchRecord();
	const { query, input, setArchived, currentView, applyView } =
		useTableQuery(dealsSearchParams);
	const [{ view }, setView] = useQueryStates(dealsViewParsers);
	const board = showsBoard(view, input.archived);

	const deals = useQuery({
		...trpc.deals.list.queryOptions(input),
		placeholderData: (previous) => previous,
	});
	const users = useQuery(trpc.users.list.queryOptions());

	const rows = deals.data?.rows ?? [];
	const selection = useTableSelection(
		useMemo(() => rows.map((row) => row.id), [rows]),
	);
	const settledIds = useMemo(() => {
		const matching = new Set(
			rows
				.filter((row) => Boolean(row.archivedAt) === input.archived)
				.map((row) => row.id),
		);
		return selection.ids.filter((id) => matching.has(id));
	}, [rows, input.archived, selection.ids]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: clearing on archived-mode change is the entire purpose of this effect.
	useEffect(() => {
		selection.clear();
	}, [input.archived]);

	const toggleArchived = (next: boolean) => {
		selection.clear();
		if (!next && query.sort === "archivedAt") query.setSort("");
		setArchived(next);
	};

	const facetCounts = deals.data?.facetCounts;
	const fieldFacets = useFieldFacets("DEAL");
	const giaiDoan = useGiaiDoan();

	const facets: DataTableFacet[] = [
		{
			id: "owner",
			label: m.facets.owner,
			options: (users.data ?? []).map((user) => ({
				value: user.id,
				label: user.name,
			})),
		},
		{
			id: "stage",
			label: m.facets.stage,
			options: giaiDoan.stages.map((option) => ({
				value: option.id,
				label: option.label,
			})),
		},
		{
			id: "closing",
			label: m.facets.closing,
			options: closingOptions(locale).map((option) => ({
				value: option.value,
				label: option.label,
			})),
		},
		...fieldFacets,
	];

	const openValueCents = deals.data?.openValueCents;
	const reportingCurrency = deals.data?.reportingCurrency;
	const unconverted = deals.data?.unconverted;
	const uncounted = unconverted?.count ?? 0;
	const openPipelineCents = openValueCents ?? (uncounted > 0 ? 0 : null);

	const fieldColumns = useFieldColumns<DealRow>("DEAL");
	const columns = useMemo(
		() =>
			input.archived
				? [...columnsFor(m, locale), archivedColumn(m), ...fieldColumns]
				: [...columnsFor(m, locale), ...fieldColumns],
		[fieldColumns, input.archived, m, locale],
	);

	const viewToggle = (
		<ViewSwitch
			disabled={input.archived}
			items={DEALS_VIEWS.map((v) => ({ value: v, label: m.view[v] }))}
			label={m.view.label}
			value={board ? "board" : "table"}
			onValueChange={(next) => {
				const chosen = DEALS_VIEWS.find((v) => v === next);
				if (chosen) void setView({ view: chosen });
			}}
		/>
	);

	const archivedButton = (
		<Button
			variant={input.archived ? "contrast" : "outline"}
			size="sm"
			className="justify-start sm:justify-center"
			aria-pressed={input.archived}
			onClick={() => toggleArchived(!input.archived)}
		>
			<Archive data-icon="inline-start" />
			{m.archivedToggle}
		</Button>
	);

	if (board) {
		return (
			<div className="flex min-w-0 flex-col gap-3">
				<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
					<ListSearch placeholder={m.search} />
					<DataTableFacetMenu
						facets={facets.filter((facet) => facet.id !== "stage")}
						filters={query.filters}
						onFilterChange={query.setFilter}
						counts={facetCounts}
					/>
					<div className="flex gap-2 sm:ml-auto">
						{archivedButton}
						{viewToggle}
					</div>
				</div>
				<DealsBoard input={dealBoardInputFrom(input)} />
			</div>
		);
	}

	return (
		<DataTable
			query={query}
			search={<ListSearch placeholder={m.search} />}
			leadingActions={viewToggle}
			actions={archivedButton}
			columns={columns}
			rows={rows}
			total={deals.data?.total ?? 0}
			facetCounts={facetCounts}
			facets={facets}
			tabs={{
				id: "status",
				label: m.tabs.label,
				allLabel: m.tabs.all,
				options: [
					{ value: "open", label: m.tabs.open },
					{ value: "closed", label: m.tabs.closed },
				],
			}}
			selection={{
				state: selection,
				actions: (
					<DealsBulkActions
						ids={settledIds}
						onDone={selection.clear}
						archived={input.archived}
					/>
				),
				rowLabel: (row) => row.name,
			}}
			getRowId={(row) => row.id}
			loading={deals.isFetching}
			onRowHover={(row) => prefetchRecord({ kind: "deal", id: row.id })}
			onRowClick={(row) => openRecord({ kind: "deal", id: row.id })}
			empty={input.archived ? m.emptyArchived : m.empty}
			searchActive={input.q !== ""}
			onClearFilters={() =>
				applyView({ ...currentView, q: "", filters: { status: ["all"] } })
			}
			meta={
				input.archived || openPipelineCents === null ? undefined : (
					<span>
						{m.meta.count(String(deals.data?.total ?? 0))} ·{" "}
						<span className="tabular-nums">
							{formatMoney(openPipelineCents, reportingCurrency, locale)}
						</span>{" "}
						{m.meta.openPipeline}
						{unconverted && unconverted.count > 0 ? (
							<span className="text-muted-foreground">
								{" · "}
								{m.meta.notCounted(
									String(unconverted.count),
									unconverted.currencies.join(", "),
								)}
							</span>
						) : null}
					</span>
				)
			}
		/>
	);
}
