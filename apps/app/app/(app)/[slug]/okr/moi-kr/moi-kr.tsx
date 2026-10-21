"use client";

import { Button } from "@crm/ui/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { PaceIndicator } from "@crm/ui/components/okr-status";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import { TINH_TRANG_KR, type TinhTrangKr } from "@crm/validation/okr-muc-tieu";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { useMoNganKr } from "@/components/crm/record-sheet/dien-bien-kr";
import { okrMoiKrMessages } from "@/lib/messages/okr-moi-kr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useChuKy } from "../chon-chu-ky";
import { DUONG_MUC } from "../tab-okr";
import { LoiXem } from "../toan-canh/toan-canh";
import { ChuaChuKy, DangTai } from "../trang-thai-okr";
import { moiKrParsers } from "./tham-so";

type MoiKrOutput = RouterOutputs["okr"]["moiKr"];
type Dong = MoiKrOutput["rows"][number];

const P = SEARCH_PARAM.okr;
const MAT = { donVi: P.donViKr, nguoi: P.nguoiKr } as const;
const laMat = (id: string): id is keyof typeof MAT => Object.hasOwn(MAT, id);

function useNhanTinhTrang() {
	const msg = useMessages();
	return {
		truot: msg.okr.truot,
		"cham-nhip": msg.okr.chamNhip,
		"dung-nhip": msg.okr.dungNhip,
		"chua-co-ky-vong": msg.okr.chuaCoKyVong,
		"moc-chua": msg.okr.mocChua,
		"moc-xong": msg.okr.mocXong,
	} satisfies Record<TinhTrangKr, string>;
}

function useCot(): DataTableColumn<Dong>[] {
	const t = okrMoiKrMessages(useLocale());
	return [
		{
			id: "kr",
			header: t.cot.kr,
			cell: (d) => (
				<span className="flex min-w-0 flex-col gap-0.5 whitespace-normal">
					<span className="font-medium" translate="no">
						{d.tieuDe}
					</span>
					<span className="text-muted-foreground text-xs" translate="no">
						{d.mucTieu}
					</span>
				</span>
			),
		},
		{
			id: "don-vi",
			header: t.cot.donVi,
			cell: (d) => <span translate="no">{d.donVi.ten}</span>,
		},
		{
			id: "phu-trach",
			header: t.cot.phuTrach,
			hideBelow: "md",
			cell: (d) => <span translate="no">{d.nguoi.name}</span>,
		},
		{
			id: "tien-do",
			header: t.cot.tienDo,
			align: "right",
			hideBelow: "md",
			cell: (d) => <span className="tabular-nums">{d.progress}%</span>,
		},
		{
			id: "tinh-trang",
			header: t.cot.tinhTrang,
			cell: (d) => <PaceIndicator pace={d.tinhTrang} size="sm" />,
		},
	];
}

function ChipTinhTrang({
	chon,
	dem,
	doi,
}: {
	chon: TinhTrangKr[];
	dem: MoiKrOutput["facetCounts"]["tinhTrang"];
	doi: (v: TinhTrangKr[]) => void;
}) {
	const t = okrMoiKrMessages(useLocale());
	const nhan = useNhanTinhTrang();
	const so = (v: TinhTrangKr) => dem.find((d) => d.value === v)?.count ?? 0;
	return (
		<ToggleGroup
			aria-label={t.locTinhTrang}
			data-chip-tinh-trang=""
			onValueChange={(v) => doi(TINH_TRANG_KR.filter((x) => v.includes(x)))}
			size="sm"
			spacing={0}
			type="multiple"
			value={chon}
			variant="outline"
		>
			{TINH_TRANG_KR.map((v) => (
				<ToggleGroupItem data-tinh-trang-chip={v} key={v} value={v}>
					{nhan[v]}
					<span className="text-muted-foreground tabular-nums">{so(v)}</span>
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

function Rong() {
	const t = okrMoiKrMessages(useLocale());
	const url = useWorkspaceUrl();
	return (
		<Empty data-trang-thai="ST-moikr-rong">
			<EmptyHeader>
				<EmptyTitle>{t.rong}</EmptyTitle>
				<EmptyDescription>{t.rongMoTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild size="sm" variant="outline">
					<Link href={url(DUONG_MUC["bo-okr"])}>{t.veBoOkr}</Link>
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function KhongKhop({ boLoc }: { boLoc: () => void }) {
	const t = okrMoiKrMessages(useLocale());
	return (
		<Empty data-trang-thai="ST-moikr-khongkhop">
			<EmptyHeader>
				<EmptyTitle>{t.khongKhop}</EmptyTitle>
				<EmptyDescription>{t.khongKhopMoTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={boLoc} size="sm" variant="outline">
					{t.boLoc}
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function useTruyVan(
	loc: Record<keyof typeof MAT, string[]>,
	dat: (thay: Record<string, string[] | null>) => void,
): TableQueryState {
	return {
		sort: "",
		dir: "asc",
		page: 1,
		pageSize: Number.MAX_SAFE_INTEGER,
		tab: "all",
		filters: { donVi: loc.donVi, nguoi: loc.nguoi },
		toggleSort: () => {},
		setSort: () => {},
		setDir: () => {},
		setPage: async () => {},
		setTab: () => {},
		setFilter: (id, values) => {
			if (laMat(id)) dat({ [MAT[id]]: values.length > 0 ? values : null });
		},
	};
}

function useMat(dem: MoiKrOutput["facetCounts"] | undefined): DataTableFacet[] {
	const t = okrMoiKrMessages(useLocale());
	const tuyChon = (ds: { value: string; count: number; name: string }[]) =>
		ds.map((d) => ({ value: d.value, label: `${d.name} · ${d.count}` }));
	return [
		{ id: "donVi", label: t.mat.donVi, options: tuyChon(dem?.donVi ?? []) },
		{ id: "nguoi", label: t.mat.nguoi, options: tuyChon(dem?.nguoi ?? []) },
	];
}

function BangMoiKr({ cycleId }: { cycleId: string }) {
	const t = okrMoiKrMessages(useLocale());
	const trpc = useTRPC();
	const moNganKr = useMoNganKr();
	const [loc, datLoc] = useQueryStates(moiKrParsers);
	const tinhTrang = loc[P.tinhTrangKr];
	const donVi = loc[P.donViKr];
	const nguoi = loc[P.nguoiKr];
	const ds = useQuery({
		...trpc.okr.moiKr.queryOptions({
			cycleId,
			loc: { tinhTrang, donVi, nguoi },
		}),
		placeholderData: keepPreviousData,
	});
	const query = useTruyVan({ donVi, nguoi }, (thay) => void datLoc(thay));
	const mat = useMat(ds.data?.facetCounts);
	const cot = useCot();
	const coLoc = tinhTrang.length + donVi.length + nguoi.length > 0;
	const boLoc = () =>
		void datLoc({
			[P.tinhTrangKr]: null,
			[P.donViKr]: null,
			[P.nguoiKr]: null,
		});
	if (ds.isError)
		return (
			<LoiXem
				cau={t.loi}
				thuLai={() => void ds.refetch()}
				trangThai="ST-moikr-loi"
			/>
		);
	if (ds.isPending)
		return (
			<div data-trang-thai="ST-moikr-cho">
				<DangTai />
			</div>
		);
	const rows = ds.data.rows;
	let rong: ReactNode = null;
	if (rows.length === 0) rong = coLoc ? <KhongKhop boLoc={boLoc} /> : <Rong />;
	return (
		<div
			className="flex flex-col gap-3"
			data-trang-thai={rows.length > 0 ? "ST-moikr-codulieu" : undefined}
		>
			<ChipTinhTrang
				chon={tinhTrang}
				dem={ds.data.facetCounts.tinhTrang}
				doi={(v) => void datLoc({ [P.tinhTrangKr]: v.length > 0 ? v : null })}
			/>
			{rong ?? (
				<DataTable
					columns={cot}
					facets={mat}
					filteredEmpty={<KhongKhop boLoc={boLoc} />}
					getRowId={(d) => d.keyResultId}
					layout="content"
					meta={
						<span
							className="text-muted-foreground text-sm tabular-nums"
							data-tong-kr=""
						>
							{t.tong}: {ds.data.total}
						</span>
					}
					onClearFilters={boLoc}
					onRowClick={(d) => moNganKr(d.keyResultId)}
					query={query}
					rows={rows}
					total={ds.data.total}
				/>
			)}
		</div>
	);
}

export function MoiKr() {
	const t = okrMoiKrMessages(useLocale());
	const trpc = useTRPC();
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	if (access.isError || cycles.isError)
		return (
			<LoiXem
				cau={t.loi}
				thuLai={() => {
					if (access.isError) void access.refetch();
					if (cycles.isError) void cycles.refetch();
				}}
				trangThai="ST-moikr-loi"
			/>
		);
	if (access.isPending || cycles.isPending)
		return (
			<div data-trang-thai="ST-moikr-cho">
				<DangTai />
			</div>
		);
	if (currentId === null)
		return (
			<div data-trang-thai="ST-moikr-chuachuky">
				<ChuaChuKy quanTri={access.data?.canManageProgram === true} />
			</div>
		);
	return <BangMoiKr cycleId={currentId} key={currentId} />;
}
