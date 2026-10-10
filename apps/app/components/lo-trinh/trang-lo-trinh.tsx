"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
	DataTableFacetMenu,
} from "@crm/ui/components/data-table";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { formatDay } from "@crm/ui/lib/format";
import type { LoTrinhDuLieu } from "@crm/validation/lo-trinh-du-lieu";
import { useQueryStates } from "nuqs";
import { type ReactNode, useMemo, useSyncExternalStore } from "react";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { homNayNguoiXem } from "@/lib/lo-trinh/ngay";
import { type LoTrinhMessages, loTrinhMessages } from "@/lib/messages/lo-trinh";
import { BangCot } from "./bang-cot";
import { DaBac } from "./da-bac";
import { HoSoViec } from "./ho-so-viec";
import { ChiTietDoi } from "./khung-trong";
import { OMoc } from "./o-moc";
import { ChamTrangThai, OTrangThai } from "./o-trang-thai";
import {
	CACH_XEM,
	type CachXem,
	CHIA_COT,
	type ChiaCot,
	loTrinhListParams,
	loTrinhParsers,
	VONG_DOI,
	type VongDoi,
} from "./tham-so";
import {
	type BoLocChon,
	demLoc,
	hopLoc,
	hopTim,
	KHONG_MOC,
	KHONG_NHOM,
	khoaMocCua,
	locHopLe,
	phangViec,
	sapXep,
	TRE,
	thuocVongDoi,
	tuyChonLoc,
	type Viec,
} from "./viec";
import { XemMoc } from "./xem-moc";

const khongDoi = () => () => {};

function useHomNay(): string | null {
	return useSyncExternalStore(
		khongDoi,
		() => homNayNguoiXem(new Date()),
		() => null,
	);
}

function cotBang(m: LoTrinhMessages): DataTableColumn<Viec>[] {
	return [
		{
			id: "viec",
			header: m.cot.viec,
			cell: (v) => (
				<span
					className="flex min-w-0 flex-col gap-0.5 whitespace-normal"
					data-viec-khoa={v.khoa}
				>
					<span className="font-medium" translate="no">
						{v.cau_giao}
					</span>
					<span className="text-muted-foreground text-xs" translate="no">
						{v.ma}
						{v.nhom ? ` · ${v.nhom}` : ""}
						{v.co.length ? ` · ${m.moc.lechKeHoach(String(v.co.length))}` : ""}
					</span>
					<span className="sm:hidden">
						<ChamTrangThai v={v} />
					</span>
				</span>
			),
		},
		{
			id: "loTrinh",
			header: m.cot.loTrinh,
			cell: (v) => (
				<span data-lo-trinh-ten={v.loTen} translate="no">
					{v.loTen}
				</span>
			),
			hideBelow: "md",
			width: "w-[14%]",
		},
		{
			id: "trangThai",
			header: m.cot.trangThai,
			cell: (v) => <OTrangThai v={v} />,
			sortable: true,
			hideBelow: "sm",
			width: "w-[22%]",
		},
		{
			id: "moc",
			header: m.cot.moc,
			cell: (v) => <OMoc v={v} />,
			sortable: true,
			align: "right",
			width: "w-[16%]",
		},
	];
}

const NHAN_VONG_DOI = {
	"chua-xong": "chuaXong",
	"da-giao": "daGiao",
	khac: "xepLaiSau",
	"tat-ca": "tatCa",
} as const satisfies Record<VongDoi, keyof LoTrinhMessages["vongDoi"]>;

const NHAN_XEM = {
	bang: "bang",
	"bang-cot": "bangCot",
	moc: "mocXem",
} as const satisfies Record<CachXem, keyof LoTrinhMessages["thanhCongCu"]>;

const NHAN_CHIA = {
	"trang-thai": "chiaTrangThai",
	nhom: "chiaNhom",
	"lo-trinh": "chiaLoTrinh",
} as const satisfies Record<ChiaCot, keyof LoTrinhMessages["thanhCongCu"]>;

function VongDoiChon({
	m,
	value,
	dem,
	onChange,
}: {
	m: LoTrinhMessages;
	value: VongDoi;
	dem: Record<VongDoi, number>;
	onChange: (next: VongDoi) => void;
}) {
	return (
		<ToggleGroup
			aria-label={m.loc.vongDoi}
			data-lo-trinh-vong-doi={value}
			onValueChange={(next) => {
				const chon = VONG_DOI.find((x) => x === next);
				if (chon) onChange(chon);
			}}
			size="sm"
			spacing={0}
			type="single"
			value={value}
			variant="outline"
		>
			{VONG_DOI.map((x) => (
				<ToggleGroupItem data-dem={dem[x]} data-vong-doi={x} key={x} value={x}>
					{m.vongDoi[NHAN_VONG_DOI[x]]}
					<span className="text-muted-foreground tabular-nums">{dem[x]}</span>
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

function ChiaCotChon({
	m,
	value,
	onChange,
}: {
	m: LoTrinhMessages;
	value: ChiaCot;
	onChange: (next: ChiaCot) => void;
}) {
	return (
		<ToggleGroup
			aria-label={m.thanhCongCu.chiaCot}
			onValueChange={(next) => {
				const chon = CHIA_COT.find((x) => x === next);
				if (chon) onChange(chon);
			}}
			size="sm"
			spacing={0}
			type="single"
			value={value}
			variant="outline"
		>
			{CHIA_COT.map((x) => (
				<ToggleGroupItem data-chia={x} key={x} value={x}>
					{m.thanhCongCu[NHAN_CHIA[x]]}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

export function TrangLoTrinh({
	duLieu,
	canhBao,
}: {
	duLieu: LoTrinhDuLieu;
	canhBao: string[];
}) {
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	const homNay = useHomNay();
	const { query, input } = useTableQuery(loTrinhListParams);
	const [lt, setLt] = useQueryStates(loTrinhParsers);
	const viec = useMemo(() => phangViec(duLieu, homNay), [duLieu, homNay]);
	const tuyChon = useMemo(() => tuyChonLoc(duLieu, viec), [duLieu, viec]);
	const loc: BoLocChon = locHopLe(
		{ loTrinh: input.loTrinh, nhom: input.nhom, moc: input.moc },
		tuyChon,
	);
	const timDuoc = viec.filter((v) => hopTim(v, input.q));
	const quaLoc = timDuoc.filter((v) => hopLoc(v, loc));
	const quaVongDoi = quaLoc.filter((v) => thuocVongDoi(v, lt.vongDoi));
	const thuTu = sapXep(quaVongDoi, input.sort, input.dir);
	const trang = thuTu.slice(
		(input.page - 1) * input.pageSize,
		input.page * input.pageSize,
	);
	const demVongDoi = Object.fromEntries(
		VONG_DOI.map((x) => [x, quaLoc.filter((v) => thuocVongDoi(v, x)).length]),
	) as Record<VongDoi, number>;
	const facetCounts = {
		loTrinh: demLoc(timDuoc, loc, "loTrinh"),
		nhom: demLoc(timDuoc, loc, "nhom"),
		moc: demLoc(timDuoc, loc, "moc"),
	};
	const tenLo = new Map(duLieu.lo_trinh.map((l) => [l.tep, l.ten ?? l.tep]));
	const facets: DataTableFacet[] = [
		{
			id: "loTrinh",
			label: m.loc.loTrinh,
			options: tuyChon.loTrinh.map((g) => ({
				value: g,
				label: tenLo.get(g) ?? g,
			})),
		},
		{
			id: "nhom",
			label: m.loc.nhom,
			options: tuyChon.nhom.map((g) => ({
				value: g,
				label: g === KHONG_NHOM ? m.loc.khongNhom : g,
			})),
		},
		{
			id: "moc",
			label: m.loc.moc,
			searchable: true,
			options: [
				{ value: TRE, label: m.loc.treMoc },
				...duLieu.lo_trinh.flatMap((lo) =>
					lo.moc
						.filter((x) => x.hang.length > 0)
						.map((x) => ({
							value: khoaMocCua(lo.tep, x),
							label: `${formatDay(x.ngay, locale)} · ${x.ten}`,
						})),
				),
				{ value: KHONG_MOC, label: m.loc.chuaHenMoc },
			],
		},
	];
	const daGiao = quaLoc.filter((v) => v.nhom_trang_thai === "da-giao").length;
	const soTre = quaLoc.filter((v) => v.tre).length;
	const soTreVung = timDuoc.filter(
		(v) => v.tre && hopLoc(v, loc, "moc"),
	).length;
	const meta = (
		<span data-lo-trinh-meta>
			{m.meta(String(thuTu.length), String(daGiao), String(quaLoc.length))}
			{soTre ? m.metaTre(String(soTre)) : ""}
		</span>
	);
	const moViec = (khoa: string) => setLt({ viec: khoa });
	const xem = (
		<ViewSwitch
			items={CACH_XEM.map((x) => ({
				value: x,
				label: m.thanhCongCu[NHAN_XEM[x]],
			}))}
			label={m.thanhCongCu.cachXem}
			onValueChange={(next) => {
				const chon = CACH_XEM.find((x) => x === next);
				if (chon) setLt({ xemLoTrinh: chon });
			}}
			value={lt.xemLoTrinh}
		/>
	);
	const nutDaBac = (
		<Button
			aria-pressed={lt.daBac}
			data-lo-trinh-nut-da-bac
			onClick={() => setLt({ daBac: !lt.daBac })}
			size="sm"
			variant="outline"
		>
			{m.thanhCongCu.daBac}
		</Button>
	);
	const vongDoi = (
		<VongDoiChon
			dem={demVongDoi}
			m={m}
			onChange={(next) => {
				setLt({ vongDoi: next });
				query.setPage(1);
			}}
			value={lt.vongDoi}
		/>
	);
	const thanhCongCu = (rieng: ReactNode) => (
		<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
			<ListSearch placeholder={m.thanhCongCu.tim} />
			{rieng}
			<DataTableFacetMenu
				counts={facetCounts}
				facets={facets}
				filters={query.filters}
				onFilterChange={query.setFilter}
			/>
			<div className="flex gap-2 sm:ml-auto">
				{xem}
				{nutDaBac}
			</div>
		</div>
	);
	const loLoi = duLieu.lo_trinh.filter((l) => l.loi);
	return (
		<div
			className="flex min-w-0 flex-col gap-4"
			data-lo-trinh-trang="co-du-lieu"
		>
			{canhBao.length ? (
				<Alert data-lo-trinh-canh-bao variant="warning">
					<AlertTitle>{m.canhBao.khuonMoiTieuDe}</AlertTitle>
					<AlertDescription>{m.canhBao.khuonMoiMoTa}</AlertDescription>
					<ChiTietDoi chu={canhBao.join(" · ")} />
				</Alert>
			) : null}
			{loLoi.map((l) => (
				<Alert
					data-lo-trinh-lo-loi={l.tep}
					data-lo-trinh-trang="lo-loi"
					key={l.tep}
					variant="destructive"
				>
					<AlertTitle>
						{m.canhBao.loLoiTieuDe} <span translate="no">{l.ten ?? l.tep}</span>
					</AlertTitle>
					<AlertDescription>{m.canhBao.loLoiMoTa}</AlertDescription>
					<ChiTietDoi chu={l.loi ?? ""} />
				</Alert>
			))}
			{!lt.daBac && soTreVung > 0 && !loc.moc.includes(TRE) ? (
				<Alert data-lo-trinh-tre={soTreVung} variant="warning">
					<AlertTitle>{m.tre.tieuDe(String(soTreVung))}</AlertTitle>
					<AlertDescription>{m.tre.moTa}</AlertDescription>
					<AlertAction>
						<Button
							onClick={() => {
								query.setFilter("moc", [TRE]);
								setLt({ vongDoi: "tat-ca" });
							}}
							size="sm"
							variant="outline"
						>
							{m.tre.nut}
						</Button>
					</AlertAction>
				</Alert>
			) : null}
			{lt.daBac ? (
				<div className="flex flex-col gap-3" data-lo-trinh-da-bac-mo>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<span className="text-muted-foreground text-sm">
							{m.daBac.moTa}
						</span>
						{nutDaBac}
					</div>
					<DaBac duLieu={duLieu} />
				</div>
			) : lt.xemLoTrinh === "moc" ? (
				<div className="flex min-w-0 flex-col gap-3">
					{thanhCongCu(vongDoi)}
					<XemMoc
						duLieu={duLieu}
						homNay={homNay}
						moViec={moViec}
						viec={thuTu}
					/>
					<span className="text-muted-foreground text-sm">{meta}</span>
				</div>
			) : lt.xemLoTrinh === "bang-cot" ? (
				<div className="flex min-w-0 flex-col gap-3">
					{thanhCongCu(
						<ChiaCotChon
							m={m}
							onChange={(next) => setLt({ chiaCot: next })}
							value={lt.chiaCot}
						/>,
					)}
					<BangCot chia={lt.chiaCot} moViec={moViec} viec={quaLoc} />
					<span className="text-muted-foreground text-sm">{meta}</span>
				</div>
			) : (
				<DataTable
					actions={
						<>
							{xem}
							{nutDaBac}
						</>
					}
					columns={cotBang(m)}
					facetCounts={facetCounts}
					facets={facets}
					getRowId={(v) => v.khoa}
					leadingActions={vongDoi}
					meta={meta}
					onClearFilters={() => {
						for (const f of facets) query.setFilter(f.id, []);
						setLt({ vongDoi: "tat-ca" });
					}}
					onRowClick={(v) => moViec(v.khoa)}
					query={query}
					rows={trang}
					search={<ListSearch placeholder={m.thanhCongCu.tim} />}
					searchActive={input.q !== ""}
					total={thuTu.length}
				/>
			)}
			<HoSoViec
				dong={() => setLt({ viec: null })}
				khoa={lt.viec}
				moViec={moViec}
				viec={viec}
			/>
		</div>
	);
}
