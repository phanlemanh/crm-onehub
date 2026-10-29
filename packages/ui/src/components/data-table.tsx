"use client";

import ArrowDown from "@carbon/icons-react/es/ArrowDown";
import ArrowsVertical from "@carbon/icons-react/es/ArrowsVertical";
import ArrowUp from "@carbon/icons-react/es/ArrowUp";
import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import CollapseAll from "@carbon/icons-react/es/CollapseAll";
import Column from "@carbon/icons-react/es/Column";
import ExpandAll from "@carbon/icons-react/es/ExpandAll";
import Filter from "@carbon/icons-react/es/Filter";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crm/ui/components/command";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { FieldError } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import { TablePagination } from "@crm/ui/components/table-pagination";
import { VungDangTai } from "@crm/ui/components/vung-dang-tai";
import {
	ToggleGroup,
	ToggleGroupItem,
} from "@crm/ui/components/toggle-group";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { useMessages } from "@crm/ui/components/locale-provider";
import { useSearchInput } from "@crm/ui/hooks/use-search-input";
import type { TableSelection } from "@crm/ui/hooks/use-table-selection";
import { ROW_ACCENT, ROW_ACCENT_EXPANDABLE } from "@crm/ui/lib/row-accent";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import { cn } from "@crm/ui/lib/utils";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import {
	Fragment,
	type ReactNode,
	useDeferredValue,
	useId,
	useMemo,
	useState,
} from "react";

export type DataTableColumn<TRow> = {
	id: string;
	header: ReactNode;
	cell: (row: TRow) => ReactNode;
	label?: string;
	sortable?: boolean;
	width?: string;
	align?: "left" | "right" | "center";
	headClassName?: string;
	cellClassName?: string;
	hideable?: boolean;
	defaultHidden?: boolean;
	hideBelow?: "sm" | "md" | "lg";
};

export type DataTableFacet = {
	id: string;
	label: string;
	options: { value: string; label: string }[];
	searchable?: boolean;
	search?: string;
	onSearchChange?: (search: string) => void;
	stale?: boolean;
	empty?: ReactNode;
	kieu?: "luaChon" | "chu" | "khoang";
	docSo?: (chu: string) => number | null;
	loiSo?: string;
	hienSo?: (so: number) => string;
};

export type DataTableTabs = {
	id: string;
	label?: string;
	allLabel?: string;
	allCount?: number;
	options: { value: string; label: string }[];
};

export type DataTableExpandable<TRow, TSub> = {
	isExpandable: (row: TRow) => boolean;
	getSubRows: (row: TRow) => TSub[];
	getSubRowId: (sub: TSub, row: TRow) => string;
	renderSubCell: (sub: TSub, columnId: string, row: TRow) => ReactNode;
	onSubRowClick?: (sub: TSub, row: TRow) => void;
	rowLabel?: (row: TRow) => string;
	moSan?: boolean;
};

export type DataTableSelection<TRow> = {
	state: TableSelection;
	actions: ReactNode;
	rowLabel?: (row: TRow) => string;
};

export type DataTableProps<TRow, TSub> = {
	query: TableQueryState;
	columns: DataTableColumn<TRow>[];
	getRowId: (row: TRow) => string;
	rows: TRow[];
	total: number;
	facetCounts?: Record<string, Record<string, number>>;
	loading?: boolean;
	refreshing?: boolean;
	facets?: DataTableFacet[];
	tabs?: DataTableTabs;
	onRowClick?: (row: TRow) => void;
	onRowHover?: (row: TRow) => void;
	expandable?: DataTableExpandable<TRow, TSub>;
	selection?: DataTableSelection<TRow>;
	actions?: ReactNode;
	leadingActions?: ReactNode;
	toggles?: ReactNode;
	search?: ReactNode;
	meta?: ReactNode;
	empty?: ReactNode;
	filteredEmpty?: ReactNode;
	searchActive?: boolean;
	onClearFilters?: () => void;
	className?: string;
	tableClassName?: string;
	layout?: DataTableLayout;
};

const LAYOUT_CLASS = {
	fill: {
		root: "flex min-h-0 flex-1 flex-col gap-3",
		container: "min-h-0 flex-1 overflow-auto rounded-lg border bg-card",
		emptyContainer: "",
	},
	content: {
		root: "flex flex-col gap-3",
		container: "overflow-x-auto rounded-lg border bg-card",
		emptyContainer: "min-h-40",
	},
} as const;

export type DataTableLayout = keyof typeof LAYOUT_CLASS;

const HIDE_BELOW_CLASS = {
	sm: "hidden sm:table-cell",
	md: "hidden md:table-cell",
	lg: "hidden lg:table-cell",
} as const;

const ALIGN_CLASS = {
	left: "",
	right: "text-right",
	center: "text-center",
} as const;

const FIXED_COLUMN = "w-[0.1%] min-w-10 max-w-10";

const HEAD_LABEL = {
	maxLines: 2,
	minWidthDivisor: 2,
	minWidthPadCh: 1,
} as const;

const HEAD_LABEL_CLAMP_CLASS = {
	1: "line-clamp-1",
	2: "line-clamp-2",
} as const;

const HEAD_LABEL_CLAMP = HEAD_LABEL_CLAMP_CLASS[HEAD_LABEL.maxLines];

function headLabelStyle<TRow>(column: DataTableColumn<TRow>) {
	if (typeof column.header !== "string") return undefined;
	const ch =
		Math.ceil(column.header.length / HEAD_LABEL.minWidthDivisor) +
		HEAD_LABEL.minWidthPadCh;
	return { minWidth: `${ch}ch` };
}

function columnLabel<TRow>(column: DataTableColumn<TRow>): string {
	if (column.label) return column.label;
	return typeof column.header === "string" ? column.header : column.id;
}

function SortIndicator({
	active,
	dir,
	className,
}: {
	active: boolean;
	dir: "asc" | "desc";
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex align-middle text-muted-foreground",
				className,
			)}
		>
			{active ? (
				dir === "asc" ? (
					<ArrowUp size={12} />
				) : (
					<ArrowDown size={12} />
				)
			) : (
				<ArrowsVertical size={12} className="opacity-40" />
			)}
		</span>
	);
}

export function facetValueOptions(
	counts: Record<string, number> | undefined,
	selected: string[],
): { value: string; label: string }[] {
	const known = Object.keys(counts ?? {}).sort();
	return [...known, ...selected.filter((value) => !known.includes(value))].map(
		(value) => ({ value, label: value }),
	);
}

function facetLabel(facet: DataTableFacet, selected: string[]): string {
	if (selected.length === 0) return facet.label;
	if (selected.length === 1) {
		const option = facet.options.find((o) => o.value === selected[0]);
		return option?.label ?? facet.label;
	}
	return `${facet.label} (${selected.length})`;
}

function toggle(selected: string[], value: string, checked: boolean): string[] {
	return checked ? [...selected, value] : selected.filter((v) => v !== value);
}

function FacetCount({ count }: { count: number | undefined }) {
	if (count === undefined) return null;
	return (
		<span
			data-slot="facet-count"
			className="text-muted-foreground tabular-nums"
		>
			{count}
		</span>
	);
}

const TIEN_TO_FACET = { chu: "has:", tu: "gte:", den: "lte:" } as const;

function thayTienTo(selected: string[], tienTo: string, moi: string | null) {
	const giu = selected.filter((value) => !value.startsWith(tienTo));
	return moi === null ? giu : [...giu, `${tienTo}${moi}`];
}

function giaTheoTienTo(selected: string[], tienTo: string): string {
	return (
		selected.find((value) => value.startsWith(tienTo))?.slice(tienTo.length) ??
		""
	);
}

function chanPhimMenu(event: React.KeyboardEvent) {
	if (event.key !== "Escape") event.stopPropagation();
}

function FacetChu({
	facet,
	selected,
	onChange,
}: {
	facet: DataTableFacet;
	selected: string[];
	onChange: (values: string[]) => void;
}) {
	const msg = useMessages();
	const [value, change] = useSearchInput(
		giaTheoTienTo(selected, TIEN_TO_FACET.chu),
		(next) =>
			onChange(thayTienTo(selected, TIEN_TO_FACET.chu, next.trim() || null)),
	);
	return (
		<div data-slot="facet-chu" className="p-1">
			<Input
				aria-label={msg.table.facetContainsLabel(facet.label)}
				placeholder={msg.table.facetContains}
				value={value}
				onChange={(event) => change(event.target.value)}
				onKeyDown={chanPhimMenu}
				spellCheck={false}
				autoComplete="off"
				translate="no"
			/>
		</div>
	);
}

function OSoFacet({
	facet,
	nhan,
	committed,
	commit,
}: {
	facet: DataTableFacet;
	nhan: string;
	committed: string;
	commit: (so: number | null) => void;
}) {
	const msg = useMessages();
	const docSo = facet.docSo ?? ((chu: string) => {
		const so = Number(chu);
		return Number.isFinite(so) ? so : null;
	});
	const [value, change] = useSearchInput(committed, (next) => {
		if (next.trim() === "") commit(null);
		else {
			const so = docSo(next);
			if (so !== null) commit(so);
		}
	});
	const hong = value.trim() !== "" && docSo(value) === null;
	return (
		<div className="flex min-w-0 flex-1 flex-col gap-1">
			<Input
				aria-label={msg.table.facetRangeLabel(facet.label, nhan)}
				aria-invalid={hong}
				placeholder={nhan}
				inputMode="decimal"
				value={value}
				onChange={(event) => change(event.target.value)}
				onKeyDown={chanPhimMenu}
				autoComplete="off"
			/>
			{hong && facet.loiSo ? <FieldError>{facet.loiSo}</FieldError> : null}
		</div>
	);
}

function FacetKhoang({
	facet,
	selected,
	onChange,
}: {
	facet: DataTableFacet;
	selected: string[];
	onChange: (values: string[]) => void;
}) {
	const msg = useMessages();
	const hienSo = facet.hienSo ?? String;
	const hien = (tienTo: string) => {
		const goc = giaTheoTienTo(selected, tienTo);
		return goc === "" ? "" : hienSo(Number(goc));
	};
	const ghi = (dau: "tu" | "den") => (so: number | null) =>
		onChange(
			thayTienTo(selected, TIEN_TO_FACET[dau], so === null ? null : String(so)),
		);
	return (
		<div data-slot="facet-khoang" className="flex gap-1 p-1">
			<OSoFacet
				facet={facet}
				nhan={msg.table.facetFrom}
				committed={hien(TIEN_TO_FACET.tu)}
				commit={ghi("tu")}
			/>
			<OSoFacet
				facet={facet}
				nhan={msg.table.facetTo}
				committed={hien(TIEN_TO_FACET.den)}
				commit={ghi("den")}
			/>
		</div>
	);
}

function FacetSubmenu({
	facet,
	selected,
	counts,
	onChange,
}: {
	facet: DataTableFacet;
	selected: string[];
	counts?: Record<string, number>;
	onChange: (values: string[]) => void;
}) {
	const countOf = (value: string) =>
		counts === undefined ? undefined : (counts[value] ?? 0);
	const msg = useMessages();
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<span className="flex-1">{facet.label}</span>
				{selected.length > 0 && (
					<span className="text-muted-foreground tabular-nums">({selected.length})</span>
				)}
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent className="max-h-72 min-w-52 overflow-hidden">
				{facet.searchable ? (
					<Command
						shouldFilter={facet.onSearchChange === undefined}
						className="max-h-72"
					>
						<CommandInput
							placeholder={msg.table.searchFacet(facet.label.toLowerCase())}
							value={facet.search}
							onValueChange={facet.onSearchChange}
							onKeyDown={(event) => event.stopPropagation()}
						/>
						<CommandList label={msg.table.facetOptions}>
							<CommandEmpty>{facet.empty ?? msg.table.facetEmpty}</CommandEmpty>
							<CommandGroup>
								{selected.length > 0 && (
									<CommandItem
										forceMount
										value={`${facet.id}:clear`}
										disabled={facet.stale}
										onSelect={() => onChange([])}
									>
										{msg.table.clearFilters}
									</CommandItem>
								)}
								{facet.options.map((option) => {
									const checked = selected.includes(option.value);
									return (
										<CommandItem
											key={option.value}
											value={option.label}
											disabled={facet.stale}
											data-checked={checked}
											onSelect={() =>
												onChange(toggle(selected, option.value, !checked))
											}
										>
											<Checkbox
												checked={checked}
												className="pointer-events-none"
											/>
											<span className="flex-1 truncate">{option.label}</span>
											<FacetCount count={countOf(option.value)} />
										</CommandItem>
									);
								})}
							</CommandGroup>
						</CommandList>
					</Command>
				) : (
					<div className="max-h-72 overflow-y-auto">
						{facet.kieu === "chu" && (
							<FacetChu facet={facet} selected={selected} onChange={onChange} />
						)}
						{facet.kieu === "khoang" && (
							<FacetKhoang
								facet={facet}
								selected={selected}
								onChange={onChange}
							/>
						)}
						{selected.length > 0 && (
							<>
								<DropdownMenuItem
									onSelect={(event) => {
										event.preventDefault();
										onChange([]);
									}}
								>
									{msg.table.clearFilters}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
							</>
						)}
						{facet.options.map((option) => {
							const checked = selected.includes(option.value);
							return (
								<DropdownMenuCheckboxItem
									key={option.value}
									checked={checked}
									onSelect={(event) => event.preventDefault()}
									onCheckedChange={(next) =>
										onChange(toggle(selected, option.value, next))
									}
								>
									<span className="flex-1">{option.label}</span>
									<FacetCount count={countOf(option.value)} />
								</DropdownMenuCheckboxItem>
							);
						})}
					</div>
				)}
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

export function DataTableFacetMenu({
	facets,
	filters,
	onFilterChange,
	counts,
}: {
	facets: DataTableFacet[];
	filters: Record<string, string[]>;
	onFilterChange: (id: string, values: string[]) => void;
	counts?: Record<string, Record<string, number>>;
}) {
	const msg = useMessages();
	if (facets.length === 0) return null;
	const activeCount = facets.filter(
		(facet) => (filters[facet.id]?.length ?? 0) > 0,
	).length;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="justify-start sm:justify-center"
				>
					<Filter data-icon="inline-start" />
					{msg.table.filters}
					{activeCount > 0 && (
						<span className="text-muted-foreground tabular-nums">({activeCount})</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="min-w-48">
				{facets.map((facet) => (
					<FacetSubmenu
						key={facet.id}
						facet={facet}
						selected={filters[facet.id] ?? []}
						counts={counts?.[facet.id]}
						onChange={(values) => onFilterChange(facet.id, values)}
					/>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function DataTable<TRow, TSub = unknown>({
	query,
	columns,
	getRowId,
	rows,
	total,
	facetCounts,
	loading,
	refreshing,
	facets,
	tabs,
	onRowClick,
	onRowHover,
	expandable,
	selection,
	actions,
	leadingActions,
	toggles,
	search,
	meta,
	empty,
	filteredEmpty,
	searchActive,
	onClearFilters,
	className,
	tableClassName,
	layout = "fill",
}: DataTableProps<TRow, TSub>) {
	const msg = useMessages();
	const bocVungBang = (bang: ReactNode) =>
		refreshing === undefined ? (
			bang
		) : (
			<VungDangTai dangTai={refreshing}>{bang}</VungDangTai>
		);
	const [expandedIds, setExpandedIds] = useQueryState(
		"expand",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const expanded = useMemo(() => new Set(expandedIds), [expandedIds]);
	const [gapIds, setGapIds] = useQueryState(
		"gap",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const gap = useMemo(() => new Set(gapIds), [gapIds]);
	const moSan = expandable?.moSan === true;
	const defaultHiddenIds = useMemo(
		() => columns.filter((column) => column.defaultHidden).map((c) => c.id),
		[columns],
	);
	const [hidden, setHidden] = useQueryState(
		"hide",
		parseAsArrayOf(parseAsString).withDefault(defaultHiddenIds),
	);
	const [filtersOpen, setFiltersOpen] = useState(false);
	const filtersId = useId();

	const hideable = columns.filter((column) => column.hideable !== false);
	const visibleColumns = columns.filter(
		(column) => !hidden.includes(column.id),
	);
	const sortableColumns = columns.filter((column) => column.sortable);

	const tabCounts = tabs ? facetCounts?.[tabs.id] : undefined;

	const deferredRows = useDeferredValue(rows);
	const anyExpandable =
		expandable != null &&
		deferredRows.some((row) => expandable.isExpandable(row));
	const selecting = selection != null && selection.state.count > 0;
	const idMoDuoc =
		moSan && expandable != null
			? deferredRows
					.filter((row) => expandable.isExpandable(row))
					.map((row) => getRowId(row))
			: [];
	const coDongGap = idMoDuoc.some((id) => gap.has(id));
	const nutMoGap =
		idMoDuoc.length > 0 ? (
			<Button
				type="button"
				variant="outline"
				size="sm"
				className="order-first self-start sm:order-none lg:self-auto"
				data-nut-mo-gap-tat-ca={coDongGap ? "mo" : "gap"}
				onClick={() => void setGapIds(coDongGap ? null : idMoDuoc)}
			>
				{coDongGap ? (
					<ExpandAll data-icon="inline-start" />
				) : (
					<CollapseAll data-icon="inline-start" />
				)}
				{coDongGap ? msg.table.moTatCa : msg.table.gapTatCa}
			</Button>
		) : null;

	const pageSize = query.pageSize;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	const availableFacets = useMemo(
		() =>
			(facets ?? []).filter(
				(facet) =>
					facet.options.length > 0 ||
					facet.searchable ||
					(query.filters[facet.id]?.length ?? 0) > 0,
			),
		[facets, query.filters],
	);

	const hasFilterControls =
		tabs != null ||
		availableFacets.length > 0 ||
		sortableColumns.length > 0 ||
		anyExpandable ||
		hideable.length > 0 ||
		actions != null ||
		leadingActions != null;
	const activeFacetFilterCount = availableFacets.filter(
		(facet) => (query.filters[facet.id]?.length ?? 0) > 0,
	).length;
	const activeFilterCount =
		(tabs && query.tab !== "all" ? 1 : 0) + activeFacetFilterCount;
	const filterActive =
		searchActive === true ||
		(tabs != null && query.tab !== "all") ||
		Object.entries(query.filters).some(
			([id, values]) => id !== query.tabId && values.length > 0,
		);

	return (
		<div className={cn(LAYOUT_CLASS[layout].root, className)}>
			{selecting && selection ? (
				<div className="flex h-8 items-center gap-2">
					<span className="truncate text-xs text-muted-foreground">
						{msg.table.selected(String(selection.state.count))}
					</span>
					<div className="ml-auto flex items-center gap-2">
						{selection.actions}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => selection.state.clear()}
						>
							{msg.table.clearSelection}
						</Button>
					</div>
				</div>
			) : null}
			<div
				className={cn(
					"flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between",
					selecting && "hidden",
				)}
				data-hang-cong-cu=""
			>
				{search}
				{hasFilterControls && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="w-full justify-between sm:hidden"
						aria-expanded={filtersOpen}
						aria-controls={filtersId}
						onClick={() => setFiltersOpen((open) => !open)}
					>
						<span className="flex items-center gap-2">
							<Filter />
							{msg.table.filters}
							{activeFilterCount > 0 && (
								<span className="text-muted-foreground tabular-nums">
									({activeFilterCount})
								</span>
							)}
						</span>
						<ChevronDown
							className={cn(
								"shrink-0 opacity-60 transition-transform",
								filtersOpen && "rotate-180",
							)}
						/>
					</Button>
				)}
				{/* `lg:contents` so the controls join the search on one row on desktop
				    while staying a group the Filters button can collapse on mobile —
				    search itself must never be inside that collapse. */}
				<div
					id={filtersId}
					className={cn(
						"flex-col gap-2 lg:contents",
						filtersOpen ? "flex" : "hidden sm:flex",
					)}
				>
					{tabs && (
						<div className="max-w-full overflow-x-auto">
							<ToggleGroup
								aria-label={tabs.label ?? msg.table.status}
								size="sm"
								type="single"
								value={query.tab}
								variant="outline"
								onValueChange={(value) => {
									if (value) query.setTab(value);
								}}
							>
								<ToggleGroupItem
									count={
										tabs.allCount ??
										(tabCounts === undefined
											? undefined
											: tabs.options.reduce(
													(tong, option) =>
														tong + (tabCounts[option.value] ?? 0),
													0,
												))
									}
									value="all"
								>
									{tabs.allLabel ?? "All"}
								</ToggleGroupItem>
								{tabs.options.map((option) => (
									<ToggleGroupItem
										count={
											tabCounts === undefined
												? undefined
												: (tabCounts[option.value] ?? 0)
										}
										key={option.value}
										value={option.value}
									>
										{option.label}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</div>
					)}

					{leadingActions}

					<div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center lg:ml-auto">
						<DataTableFacetMenu
							facets={availableFacets}
							filters={query.filters}
							onFilterChange={query.setFilter}
							counts={facetCounts}
						/>
						{(sortableColumns.length > 0 || anyExpandable) && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="justify-start sm:justify-center"
									>
										<ArrowsVertical data-icon="inline-start" />
										{msg.table.sort}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="min-w-48">
									<DropdownMenuLabel>{msg.table.sortBy}</DropdownMenuLabel>
									<DropdownMenuRadioGroup
										value={query.sort}
										onValueChange={query.setSort}
									>
										{anyExpandable && (
											<DropdownMenuRadioItem value="detail">
												{msg.table.sortByDetail}
											</DropdownMenuRadioItem>
										)}
										{sortableColumns.map((column) => (
											<DropdownMenuRadioItem key={column.id} value={column.id}>
												{columnLabel(column)}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
									<DropdownMenuSeparator />
									<DropdownMenuRadioGroup
										value={query.dir}
										onValueChange={(value) =>
											query.setDir(value === "desc" ? "desc" : "asc")
										}
									>
										<DropdownMenuRadioItem value="asc">
											{msg.table.ascending}
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="desc">
											{msg.table.descending}
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						{hideable.length > 0 && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="justify-start sm:justify-center"
									>
										<Column data-icon="inline-start" />
										{msg.table.columns}
										<span className="text-muted-foreground tabular-nums">
											({visibleColumns.length})
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="min-w-48">
									<DropdownMenuLabel>{msg.table.toggleColumns}</DropdownMenuLabel>
									{hideable.map((column) => (
										<DropdownMenuCheckboxItem
											key={column.id}
											checked={!hidden.includes(column.id)}
											onCheckedChange={(checked) =>
												setHidden((prev) => {
													const set = new Set(prev);
													if (checked) set.delete(column.id);
													else set.add(column.id);
													return [...set];
												})
											}
										>
											{columnLabel(column)}
										</DropdownMenuCheckboxItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
						{actions}
					</div>
				</div>
				{toggles ? (
					<div className="flex flex-wrap items-center gap-2" data-slot="data-table-toggles">
						{toggles}
					</div>
				) : null}
				{nutMoGap}
			</div>

			{bocVungBang(
				<Table
					className={cn(
						"[&_td]:max-w-0 [&_td:first-child]:pl-4 [&_th:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:last-child]:pr-4",
						tableClassName,
					)}
					containerClassName={cn(
						LAYOUT_CLASS[layout].container,
						deferredRows.length === 0 && LAYOUT_CLASS[layout].emptyContainer,
					)}
					overlay={
						deferredRows.length === 0 ? (
							<div className="absolute inset-x-0 top-11 bottom-0 flex items-center justify-center px-4 py-8 text-center text-muted-foreground">
								{loading ? (
									<Spinner />
								) : filterActive && filteredEmpty != null ? (
									filteredEmpty
								) : filterActive ? (
									<Empty>
										<EmptyHeader>
											<EmptyTitle>{msg.table.noMatch}</EmptyTitle>
											<EmptyDescription>
												{msg.table.noMatchDescription}
											</EmptyDescription>
										</EmptyHeader>
										{onClearFilters && (
											<EmptyContent>
												<Button
													variant="outline"
													size="sm"
													onClick={onClearFilters}
												>
													{msg.table.resetFilters}
												</Button>
											</EmptyContent>
										)}
									</Empty>
								) : (
									(empty ?? msg.table.noResults)
								)}
							</div>
						) : null
					}
				>
					<TableHeader className="sticky top-0 z-10 bg-muted [&_th]:bg-muted [&_tr]:border-0 [&_tr]:shadow-[inset_0_-1px_0_var(--border)]">
						<TableRow>
							{selection && (
								<TableHead
									className={cn("h-11 px-3", FIXED_COLUMN, HIDE_BELOW_CLASS.sm)}
								>
									<Checkbox
										checked={
											selection.state.allSelected
												? true
												: selection.state.someSelected
													? "indeterminate"
													: false
										}
										onCheckedChange={(checked) =>
											selection.state.toggleAll(checked === true)
										}
										disabled={deferredRows.length === 0}
										aria-label={msg.table.selectAllRows}
									/>
								</TableHead>
							)}
							{anyExpandable && (
								<TableHead className={cn("h-11 px-3", FIXED_COLUMN)}>
									<span className="sr-only">{msg.table.detailColumn}</span>
								</TableHead>
							)}
							{visibleColumns.map((column) => {
								const isActive = query.sort === column.id;
								return (
									<TableHead
										key={column.id}
										title={columnLabel(column)}
										className={cn(
											"h-11 overflow-hidden px-3 font-normal text-muted-foreground",
											column.width,
											ALIGN_CLASS[column.align ?? "left"],
											column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
											column.headClassName,
										)}
										aria-sort={
											isActive
												? query.dir === "asc"
													? "ascending"
													: "descending"
												: undefined
										}
									>
										{column.sortable ? (
											<Button
												variant="ghost"
												size="xs-wrap"
												onClick={() => query.toggleSort(column.id)}
												className={cn(
													"-ml-2 min-w-0 max-w-[calc(100%+0.5rem)] font-normal text-muted-foreground hover:text-foreground",
													column.align === "right" && "-mr-2 ml-0 text-right",
													column.align === "center" && "mx-auto",
												)}
											>
												<span
													data-slot="table-head-label"
													style={headLabelStyle(column)}
													className={HEAD_LABEL_CLAMP}
												>
													{column.align === "right" && (
														<SortIndicator
															active={isActive}
															dir={query.dir}
															className="mr-1"
														/>
													)}
													{column.header}
													{column.align !== "right" && (
														<SortIndicator
															active={isActive}
															dir={query.dir}
															className="ml-1"
														/>
													)}
												</span>
											</Button>
										) : (
											<span
												data-slot="table-head-label"
												style={headLabelStyle(column)}
												className={cn(HEAD_LABEL_CLAMP, "whitespace-normal")}
											>
												{column.header}
											</span>
										)}
									</TableHead>
								);
							})}
						</TableRow>
					</TableHeader>
					<TableBody>
						{deferredRows.map((row) => {
							const id = getRowId(row);
							const canExpand = expandable?.isExpandable(row) ?? false;
							const isOpen =
								canExpand && (moSan ? !gap.has(id) : expanded.has(id));
							const isSelected = selection?.state.has(id) ?? false;
							const clickable = canExpand || !!onRowClick;
							const handleClick = () => {
								if (canExpand && moSan) {
									setGapIds((prev) => {
										const set = new Set(prev ?? []);
										if (set.has(id)) set.delete(id);
										else set.add(id);
										const next = [...set];
										return next.length > 0 ? next : null;
									});
								} else if (canExpand) {
									setExpandedIds((prev) => {
										const set = new Set(prev ?? []);
										if (set.has(id)) set.delete(id);
										else set.add(id);
										const next = [...set];
										return next.length > 0 ? next : null;
									});
								} else {
									onRowClick?.(row);
								}
							};
							return (
								<Fragment key={id}>
									<TableRow
										data-state={isSelected ? "selected" : undefined}
										onClick={clickable ? handleClick : undefined}
										onMouseEnter={onRowHover ? () => onRowHover(row) : undefined}
										onFocus={onRowHover ? () => onRowHover(row) : undefined}
										className={
											clickable
												? anyExpandable
													? ROW_ACCENT_EXPANDABLE
													: ROW_ACCENT
												: undefined
										}
									>
										{selection && (
											<TableCell
												className={cn("w-10 px-3 py-3", HIDE_BELOW_CLASS.sm)}
												onClick={(event) => event.stopPropagation()}
											>
												<Checkbox
													checked={isSelected}
													onCheckedChange={(checked) =>
														selection.state.toggle(id, checked === true)
													}
													aria-label={
														selection.rowLabel
															? msg.table.selectRow(selection.rowLabel(row))
															: msg.table.selectRowFallback
													}
												/>
											</TableCell>
										)}
										{anyExpandable && (
											<TableCell className="w-10 px-3 py-3 text-center text-muted-foreground">
												{canExpand && (
													<ExpandRowButton
														label={
															expandable?.rowLabel?.(row) ??
															msg.table.rowFallback
														}
														open={isOpen}
														rowId={id}
														onToggle={handleClick}
													/>
												)}
											</TableCell>
										)}
										{visibleColumns.map((column) => (
											<TableCell
												key={column.id}
												className={cn(
													"overflow-hidden px-3 py-3",
													column.width,
													ALIGN_CLASS[column.align ?? "left"],
													column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
													column.cellClassName,
												)}
											>
												{column.cell(row)}
											</TableCell>
										))}
									</TableRow>
									{isOpen &&
										expandable?.getSubRows(row).map((sub) => {
											const subClickable = !!expandable.onSubRowClick;
											return (
												<TableRow
													key={expandable.getSubRowId(sub, row)}
													onClick={
														subClickable
															? () => expandable.onSubRowClick?.(sub, row)
															: undefined
													}
													className={cn(
														"bg-muted/30",
														subClickable &&
															(anyExpandable
																? ROW_ACCENT_EXPANDABLE
																: ROW_ACCENT),
													)}
												>
													{selection && (
														<TableCell
															className={cn(
																"w-10 px-3 py-2.5",
																HIDE_BELOW_CLASS.sm,
															)}
														/>
													)}
													{anyExpandable && (
														<TableCell className="w-10 px-3 py-2.5" />
													)}
													{visibleColumns.map((column) => (
														<TableCell
															key={column.id}
															className={cn(
																"overflow-hidden px-3 py-2.5 align-top",
																column.width,
																ALIGN_CLASS[column.align ?? "left"],
																column.hideBelow &&
																	HIDE_BELOW_CLASS[column.hideBelow],
																column.cellClassName,
															)}
														>
															{expandable.renderSubCell(sub, column.id, row)}
														</TableCell>
													))}
												</TableRow>
											);
										})}
								</Fragment>
							);
						})}
					</TableBody>
				</Table>,
			)}

			<TablePagination
				page={query.page}
				totalPages={totalPages}
				pageSize={pageSize}
				total={total}
				onPageChange={(page) => query.setPage(page)}
				loading={loading}
				meta={meta}
			/>
		</div>
	);
}

function ExpandRowButton({
	label,
	open,
	rowId,
	onToggle,
}: {
	label: string;
	open: boolean;
	rowId: string;
	onToggle: () => void;
}) {
	const msg = useMessages();
	return (
		<Button
			type="button"
			size="icon-sm"
			variant="ghost"
			className="group"
			aria-expanded={open}
			aria-label={
				open ? msg.table.collapseRow(label) : msg.table.expandRow(label)
			}
			data-mo-dong={rowId}
			onClick={(event) => {
				event.stopPropagation();
				onToggle();
			}}
		>
			<ChevronRight
				size={12}
				className="inline-block transition-transform group-aria-expanded:rotate-90 motion-reduce:transition-none"
			/>
		</Button>
	);
}
