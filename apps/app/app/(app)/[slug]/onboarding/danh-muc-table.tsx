"use client";

import { Button } from "@crm/ui/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
	DataTableFacetMenu,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { usePrefetchRecord } from "@/components/crm/record-sheet/record-prefetch";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DanhMucBangCot } from "./danh-muc-bang-cot";
import {
	CachChiaToggle,
	CachXemToggle,
	KhongKhop,
	TrangThaiToggle,
	useBoLoc,
} from "./danh-muc-cong-cu";
import {
	chiaTheoTrangThai,
	danhMucInput,
	danhMucSearchParams,
	onboardingParsers,
} from "./onboarding-search-params";
import { TaoKeHoach } from "./tao-ke-hoach";

type Messages = ReturnType<typeof onboardingMessages>;

export type DanhMucRow = {
	id: string;
	companyName: string;
	tacO: string | null;
	boPhanTac: string | null;
	imNgay: number;
	buocXong: number;
	buocTong: number;
	ngayThu: number;
	targetDays: number;
};

type TuyChon = { value: string; label: string };

function soImLang(m: Messages, imNgay: number): string {
	return m.cells.silentDays.replace("{n}", String(imNgay));
}

function cotBang(m: Messages): DataTableColumn<DanhMucRow>[] {
	return [
		{
			id: "companyName",
			header: m.columns.partner,
			sortable: true,
			hideable: false,
			width: "w-[19%]",
			cell: (hang) => (
				<span className="truncate font-medium" translate="no">
					{hang.companyName}
				</span>
			),
		},
		{
			id: "tacO",
			header: m.columns.stuckOn,
			width: "w-[13.5%]",
			cell: (hang) =>
				hang.tacO ? (
					<span className="truncate" translate="no">
						{hang.tacO}
					</span>
				) : (
					<EmptyCellValue />
				),
		},
		{
			id: "imNgay",
			header: m.columns.silent,
			sortable: true,
			align: "right",
			width: "w-[17.5%]",
			cell: (hang) =>
				hang.imNgay === 0 ? (
					<EmptyCellValue />
				) : (
					<span className="tabular-nums">{soImLang(m, hang.imNgay)}</span>
				),
		},
		{
			id: "buocXong",
			header: m.columns.steps,
			sortable: true,
			align: "right",
			width: "w-[15%]",
			hideBelow: "sm",
			cell: (hang) => (
				<span className="tabular-nums">{`${hang.buocXong}/${hang.buocTong}`}</span>
			),
		},
		{
			id: "startedAt",
			header: m.columns.days,
			sortable: true,
			align: "right",
			width: "w-[15%]",
			hideBelow: "sm",
			cell: (hang) => (
				<span className="tabular-nums">{`${hang.ngayThu}/${hang.targetDays}`}</span>
			),
		},
		{
			id: "boPhanTac",
			header: m.columns.department,
			width: "w-[20%]",
			hideBelow: "md",
			cell: (hang) =>
				hang.boPhanTac ? (
					<span className="truncate text-muted-foreground" translate="no">
						{hang.boPhanTac}
					</span>
				) : (
					<EmptyCellValue />
				),
		},
	];
}

function tuyChonCoDem(
	nguon: { id: string; name: string }[],
	dem: Record<string, number> | undefined,
	daChon: string[],
): TuyChon[] {
	return nguon.flatMap((muc) => {
		const so = dem?.[muc.id] ?? 0;
		if (so === 0 && !daChon.includes(muc.id)) return [];
		return [{ value: muc.id, label: muc.name }];
	});
}

export function DanhMucTable() {
	const locale = useLocale();
	const m = onboardingMessages(locale);
	const trpc = useTRPC();
	const searchParams = useSearchParams();
	const openRecord = useOpenRecord();
	const prefetchRecord = usePrefetchRecord();
	const url = useWorkspaceUrl();
	const boLoc = useBoLoc();

	const { query, input: list } = useTableQuery(danhMucSearchParams);
	const [ob, setOb] = useQueryStates(onboardingParsers);
	const input = danhMucInput(list, ob);
	const laBangCot = ob.cachXem === "bang-cot";

	const danhMuc = useQuery({
		...trpc.onboarding.manDanhMuc.queryOptions(input),
		placeholderData: (truoc) => truoc,
	});
	const bangCot = useQuery({
		...trpc.onboarding.bangCot.queryOptions({
			...input,
			cachChia: ob.cachChia,
		}),
		enabled: laBangCot,
		placeholderData: (truoc) => truoc,
	});
	const boPhanList = useQuery(trpc.onboarding.listDepartments.queryOptions());
	const users = useQuery(trpc.users.list.queryOptions());

	const hrefCua = (planId: string) => {
		const q = new URLSearchParams(searchParams);
		q.set(SEARCH_PARAM.record.stack, `plan:${planId}`);
		return `?${q}`;
	};

	const coLoi = danhMuc.isError;
	const data = coLoi ? undefined : danhMuc.data;

	if (data?.trangThai === "ST-danhmuc-chuacokhuon") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{m.empty.noTemplate.title}</EmptyTitle>
					<EmptyDescription>{m.empty.noTemplate.body}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<a href={url("/settings/onboarding")}>
							{m.empty.noTemplate.action}
						</a>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	if (data?.trangThai === "ST-danhmuc-empty") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{m.empty.noPlan.title}</EmptyTitle>
					<EmptyDescription>{m.empty.noPlan.body}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<TaoKeHoach nhanNut={m.empty.noPlan.action} bienThe="default" />
				</EmptyContent>
			</Empty>
		);
	}

	const loiView = coLoi ? (
		<Empty data-trang-thai="ST-danhmuc-loi">
			<EmptyHeader>
				<EmptyTitle>{m.error.title}</EmptyTitle>
				<EmptyDescription>{m.error.body}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={() => danhMuc.refetch()} variant="outline">
					{m.error.action}
				</Button>
			</EmptyContent>
		</Empty>
	) : null;
	const dangTaiDau = danhMuc.isPending ? (
		<span aria-live="polite">{m.loading}</span>
	) : undefined;
	const facetCounts = data?.facetCounts;

	const khongKhop = data?.trangThai === "ST-danhmuc-khongkhop";
	const facets: DataTableFacet[] = [
		{
			id: "division",
			label: m.facets.division,
			options: tuyChonCoDem(
				data?.boPhanCapTren ?? [],
				facetCounts?.division,
				list.division,
			),
		},
		{
			id: "boPhan",
			label: m.facets.department,
			options: tuyChonCoDem(
				boPhanList.data ?? [],
				facetCounts?.boPhan,
				list.boPhan,
			),
		},
		{
			id: "nguoiCam",
			label: m.facets.owner,
			options: tuyChonCoDem(
				users.data ?? [],
				facetCounts?.nguoiCam,
				list.nguoiCam,
			),
		},
		{
			id: "nguoiGiao",
			label: keHoachNoiMessages(locale).danhMuc.nguoiGiao,
			options: tuyChonCoDem(
				users.data ?? [],
				facetCounts?.nguoiGiao,
				list.nguoiGiao,
			),
		},
	];

	const trangThai = chiaTheoTrangThai(ob) ? null : (
		<TrangThaiToggle
			m={m}
			value={ob.trangThai}
			counts={facetCounts?.trangThai}
			onChange={(next) => {
				setOb({ trangThai: next });
				query.setPage(1);
			}}
		/>
	);
	const cachXem = (
		<CachXemToggle
			m={m}
			value={ob.cachXem}
			onChange={(next) => setOb({ cachXem: next })}
		/>
	);
	const khongKhopView = <KhongKhop m={m} onClear={boLoc} />;

	if (!laBangCot) {
		return (
			<DataTable
				query={query}
				search={<ListSearch placeholder={m.search} />}
				leadingActions={trangThai}
				actions={cachXem}
				columns={cotBang(m)}
				getRowId={(hang) => hang.id}
				rows={data?.rows ?? []}
				total={data?.total ?? 0}
				facetCounts={facetCounts}
				facets={facets}
				loading={danhMuc.isFetching}
				meta={dangTaiDau}
				onRowClick={(hang) => openRecord({ kind: "plan", id: hang.id })}
				onRowHover={(hang) => prefetchRecord({ kind: "plan", id: hang.id })}
				empty={loiView ?? (khongKhop ? khongKhopView : undefined)}
				filteredEmpty={loiView ?? (khongKhop ? khongKhopView : undefined)}
			/>
		);
	}

	return (
		<div className="flex min-w-0 flex-col gap-3">
			<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
				<ListSearch placeholder={m.search} />
				{trangThai}
				<DataTableFacetMenu
					facets={facets.filter(
						(facet) =>
							facet.options.length > 0 ||
							(query.filters[facet.id]?.length ?? 0) > 0,
					)}
					filters={query.filters}
					onFilterChange={query.setFilter}
				/>
				<CachChiaToggle
					m={m}
					value={ob.cachChia}
					onChange={(next) => setOb({ cachChia: next })}
				/>
				<div className="sm:ml-auto">{cachXem}</div>
			</div>
			{loiView ? (
				loiView
			) : khongKhop ? (
				khongKhopView
			) : bangCot.isError ? (
				<Empty data-trang-thai="ST-bangcot-loi">
					<EmptyHeader>
						<EmptyTitle>{m.boardError.title}</EmptyTitle>
						<EmptyDescription>{m.boardError.body}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => bangCot.refetch()} variant="outline">
							{m.error.action}
						</Button>
					</EmptyContent>
				</Empty>
			) : bangCot.data ? (
				<div
					aria-busy={bangCot.isPlaceholderData}
					data-trang-thai={
						bangCot.isPlaceholderData
							? "ST-bangcot-dangtai"
							: "ST-bangcot-codulieu"
					}
					className={bangCot.isPlaceholderData ? "opacity-60" : undefined}
				>
					<DanhMucBangCot
						m={m}
						cachChia={bangCot.data.cachChia}
						cot={bangCot.data.cot}
						hrefCua={hrefCua}
					/>
				</div>
			) : (
				<Skeleton className="h-64 w-full" />
			)}
		</div>
	);
}
