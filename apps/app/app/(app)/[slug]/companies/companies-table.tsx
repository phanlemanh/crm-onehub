"use client";

import Archive from "@carbon/icons-react/es/Archive";
import { Button } from "@crm/ui/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
	facetValueOptions,
} from "@crm/ui/components/data-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import { ForeignText } from "@crm/ui/components/foreign-text";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useTableSelection } from "@crm/ui/hooks/use-table-selection";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { EnrichmentIndicator } from "@/components/crm/enrichment-status";
import { useFieldColumns } from "@/components/crm/fields/field-columns";
import { useFieldFacets } from "@/components/crm/fields/field-facets";
import { OwnerCell } from "@/components/crm/owner-cell";
import { usePrefetchRecord } from "@/components/crm/record-sheet/record-prefetch";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { ListSearch } from "@/components/data-table/list-search";
import { SavedViewsMenu } from "@/components/data-table/saved-views-menu";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalRelativeTime } from "@/components/local-date-time";
import { activityFacetOptions } from "@/lib/activity-recency";
import {
	ENRICHMENT_POLL_MS,
	enrichmentFacetOptions,
	isEnriching,
} from "@/lib/enrichment-status";
import {
	type CompanyMessages,
	companyMessages,
} from "@/lib/messages/companies";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { CompaniesBulkActions } from "./companies-bulk-actions";
import { companiesSearchParams } from "./companies-search-params";

type CompanyRow = RouterOutputs["companies"]["list"]["rows"][number];

function columnsFor(m: CompanyMessages): DataTableColumn<CompanyRow>[] {
	return [
		{
			id: "name",
			header: m.headers.name,
			sortable: true,
			hideable: false,
			width: "w-[18%]",
			cell: (row) => (
				<span className="flex min-w-0 items-center gap-2.5">
					<EntityLogo
						src={row.iconUrl ?? row.logoUrl}
						darkSrc={row.iconDarkUrl}
						tone={row.iconTone as EntityLogoTone | null | undefined}
						name={row.name}
						size="sm"
					/>
					<span className="truncate font-medium" translate="no">
						{row.name}
					</span>
				</span>
			),
		},
		{
			id: "domain",
			header: m.headers.domain,
			sortable: true,
			width: "w-[12%]",
			hideBelow: "md",
			cell: (row) =>
				row.domain ? (
					<span className="truncate text-muted-foreground">{row.domain}</span>
				) : (
					<EmptyCellValue />
				),
		},
		{
			id: "industry",
			header: m.headers.industry,
			sortable: true,
			width: "w-[12%]",
			hideBelow: "lg",
			cell: (row) =>
				row.industry ? (
					<ForeignText className="truncate" lang="en">
						{row.industry}
					</ForeignText>
				) : (
					<EmptyCellValue />
				),
		},
		{
			id: "owner",
			header: m.headers.owner,
			sortable: true,
			width: "w-[13%]",
			hideBelow: "md",
			cell: (row) => <OwnerCell owner={row.owner} />,
		},
		{
			id: "contacts",
			header: m.headers.contacts,
			sortable: true,
			align: "right",
			width: "w-[16%]",
			hideBelow: "lg",
			cell: (row) => <span className="tabular-nums">{row.contactCount}</span>,
		},
		{
			id: "deals",
			header: m.headers.openDeals,
			sortable: true,
			align: "right",
			width: "w-[20%]",
			hideBelow: "sm",
			cell: (row) => <span className="tabular-nums">{row.openDealCount}</span>,
		},
		{
			id: "createdAt",
			header: m.headers.created,
			label: m.labels.createdDate,
			sortable: true,
			align: "right",
			width: "w-[12%]",
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
			width: "w-[18%]",
			hideBelow: "sm",
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
		{
			id: "enrichment",
			header: m.headers.enrichment,
			label: m.labels.enrichmentStatus,
			defaultHidden: true,
			width: "w-[12%]",
			cell: (row) => (
				<EnrichmentIndicator
					status={row.enrichmentStatus}
					queued={row.queued}
				/>
			),
		},
	];
}

function archivedColumn(m: CompanyMessages): DataTableColumn<CompanyRow> {
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

export function CompaniesTable() {
	const locale = useLocale();
	const m = companyMessages(locale);
	const openRecord = useOpenRecord();
	const trpc = useTRPC();
	const prefetchRecord = usePrefetchRecord();
	const table = useTableQuery(companiesSearchParams);
	const { query, input, setArchived, currentView, applyView } = table;

	const companies = useQuery({
		...trpc.companies.list.queryOptions(input),
		placeholderData: (previous) => previous,
		refetchInterval: (query) =>
			query.state.data?.rows.some((row) =>
				isEnriching(row.enrichmentStatus, row.queued),
			)
				? ENRICHMENT_POLL_MS
				: false,
	});
	const users = useQuery(trpc.users.list.queryOptions());

	const rows = companies.data?.rows ?? [];
	const selection = useTableSelection(
		useMemo(() => rows.map((row) => row.id), [rows]),
	);

	const facetCounts = companies.data?.facetCounts;
	const fieldFacets = useFieldFacets("COMPANY");

	const facets: DataTableFacet[] = [
		{
			id: "owner",
			label: m.facets.owner,
			options: [
				{ value: "unassigned", label: m.facets.unassigned },
				...(users.data ?? []).map((user) => ({
					value: user.id,
					label: user.name,
				})),
			],
		},
		{
			id: "industry",
			label: m.facets.industry,
			options: facetValueOptions(
				facetCounts?.industry,
				query.filters.industry ?? [],
			),
		},
		{
			id: "enrichment",
			label: m.facets.enrichment,
			options: enrichmentFacetOptions(locale),
		},
		{
			id: "activity",
			label: m.facets.activity,
			options: activityFacetOptions(locale),
		},
		...fieldFacets,
	];

	const fieldColumns = useFieldColumns<CompanyRow>("COMPANY");
	const columns = useMemo(
		() =>
			input.archived
				? [...columnsFor(m), archivedColumn(m), ...fieldColumns]
				: [...columnsFor(m), ...fieldColumns],
		[fieldColumns, input.archived, m],
	);

	return (
		<DataTable
			query={query}
			search={<ListSearch placeholder={m.search} />}
			actions={
				<>
					<SavedViewsMenu entity="COMPANY" table={table} />
					<Button
						variant={input.archived ? "contrast" : "outline"}
						size="sm"
						className="justify-start sm:justify-center"
						onClick={() => setArchived(!input.archived)}
					>
						<Archive data-icon="inline-start" />
						{m.archivedToggle}
					</Button>
				</>
			}
			columns={columns}
			rows={rows}
			total={companies.data?.total ?? 0}
			facetCounts={facetCounts}
			facets={facets}
			selection={{
				state: selection,
				actions: (
					<CompaniesBulkActions
						ids={selection.ids}
						onDone={selection.clear}
						archived={input.archived}
					/>
				),
				rowLabel: (row) => row.name,
			}}
			getRowId={(row) => row.id}
			loading={companies.isFetching}
			onRowHover={(row) => prefetchRecord({ kind: "company", id: row.id })}
			onRowClick={(row) => openRecord({ kind: "company", id: row.id })}
			empty={input.archived ? m.emptyArchived : m.empty}
			searchActive={input.q !== ""}
			onClearFilters={() => applyView({ ...currentView, q: "", filters: {} })}
		/>
	);
}
