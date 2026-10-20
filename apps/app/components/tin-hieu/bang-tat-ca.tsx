"use client";

import Archive from "@carbon/icons-react/es/Archive";
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
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTableNote } from "@crm/ui/components/simple-table";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { TrangThai } from "@/components/tin-hieu/danh-sach-tin-hieu";
import {
	MenuLuuTru,
	type ThaoTacLuuTru,
} from "@/components/tin-hieu/menu-luu-tru";
import { tatCaListParams } from "@/components/tin-hieu/tham-so-tat-ca";
import { type TinHieuMessages, tinHieuMessages } from "@/lib/messages/tin-hieu";
import {
	type DongTatCa,
	demTheoLoc,
	KHONG_CON,
	KHONG_PHONG,
	locDong,
	tuyChonLoc,
} from "@/lib/tin-hieu/loc-tat-ca";

const GIO = new Intl.DateTimeFormat("vi-VN", {
	timeZone: "Asia/Ho_Chi_Minh",
	day: "2-digit",
	month: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});

function cotTrangThai(m: TinHieuMessages): DataTableColumn<DongTatCa> {
	return {
		id: "trang-thai",
		header: m.trang.cot.trangThai,
		width: "w-28 md:w-[24%]",
		cellClassName: "whitespace-normal",
		cell: (d) => <TrangThai gon trangThai={d.trangThai} />,
	};
}

function cotLuuTru(m: TinHieuMessages): DataTableColumn<DongTatCa>[] {
	const t = m.tatCa.luuTru;
	return [
		{
			id: "luu-tru-luc",
			header: t.cotLuc,
			width: "w-32",
			hideBelow: "md",
			cell: (d) => (
				<span className="tabular-nums" data-luu-tru-luc="">
					{d.luuTru ? GIO.format(new Date(d.luuTru.luc)) : null}
				</span>
			),
		},
		{
			id: "nguoi-luu-tru",
			header: t.cotNguoi,
			width: "w-32 md:w-36",
			cell: (d) =>
				d.luuTru?.nguoi ? (
					<span className="truncate" data-nguoi-luu-tru="" translate="no">
						{d.luuTru.nguoi.ten}
					</span>
				) : (
					<span className="text-muted-foreground" data-nguoi-luu-tru="">
						{m.tatCa.khongConTaiKhoan}
					</span>
				),
		},
	];
}

function cotThaoTac(
	m: TinHieuMessages,
	daLuuTru: boolean,
	thaoTac: ThaoTacLuuTru,
): DataTableColumn<DongTatCa> {
	return {
		id: "thao-tac",
		header: <span className="sr-only">{m.trang.cot.thaoTac}</span>,
		align: "right",
		width: "w-12",
		cell: (d) => <MenuLuuTru daLuuTru={daLuuTru} dong={d} thaoTac={thaoTac} />,
	};
}

function cotChung(m: TinHieuMessages): DataTableColumn<DongTatCa>[] {
	const t = m.tatCa;
	return [
		{
			id: "ma",
			header: t.cot.ma,
			width: "w-16",
			hideBelow: "sm",
			cell: (d) => (
				<span className="tabular-nums" data-tin-hieu-tat-ca={d.ma}>
					{d.ma}
				</span>
			),
		},
		{
			id: "ke",
			header: m.trang.cot.dieuDaKe,
			cell: (d) => (
				<div className="flex min-w-0 flex-col gap-0.5">
					<span
						className="line-clamp-2 whitespace-normal break-words"
						title={d.tieuDe}
						translate="no"
					>
						{d.tieuDe}
					</span>
					<SimpleTableNote
						className="line-clamp-1 whitespace-normal break-words"
						translate="no"
					>
						{dien(m.trang.muonLam, { muonLam: d.muonLam })}
					</SimpleTableNote>
				</div>
			),
		},
		{
			id: "nguoi",
			header: t.cot.nguoiGui,
			width: "w-32 md:w-36",
			cell: (d) =>
				d.nguoiGui ? (
					<span className="truncate" data-nguoi-gui="" translate="no">
						{d.nguoiGui.ten}
					</span>
				) : (
					<span className="text-muted-foreground" data-nguoi-gui="">
						{t.khongConTaiKhoan}
					</span>
				),
		},
		{
			id: "phong",
			header: t.cot.phongBan,
			width: "w-32",
			hideBelow: "md",
			cell: (d) =>
				d.phongBan ? (
					<span className="truncate" translate="no">
						{d.phongBan.ten}
					</span>
				) : (
					<span className="text-muted-foreground">{t.chuaCoPhongBan}</span>
				),
		},
		{
			id: "luc",
			header: m.trang.cot.guiLuc,
			width: "w-32",
			hideBelow: "md",
			cell: (d) => (
				<div className="flex min-w-0 flex-col gap-0.5">
					<span className="tabular-nums">{GIO.format(new Date(d.guiLuc))}</span>
					<SimpleTableNote className="truncate" translate="no">
						{d.man}
					</SimpleTableNote>
				</div>
			),
		},
	];
}

export function BangTatCa({
	dong,
	banVeDocDuoc,
	thaoTac,
}: {
	dong: DongTatCa[];
	banVeDocDuoc: boolean;
	thaoTac?: ThaoTacLuuTru;
}) {
	const m = tinHieuMessages(useLocale());
	const t = m.tatCa;
	const { query, input, setArchived } = useTableQuery(tatCaListParams);
	const daLuuTru = thaoTac !== undefined && input.archived;
	const cot = [
		...cotChung(m),
		...(daLuuTru ? cotLuuTru(m) : [cotTrangThai(m)]),
		...(thaoTac ? [cotThaoTac(m, daLuuTru, thaoTac)] : []),
	];
	const loc = {
		phongBan: input.phongBan,
		trangThaiTinHieu: input.trangThaiTinHieu,
		nguoiGui: input.nguoiGui,
	};
	const quaLoc = locDong(dong, loc);
	const trang = quaLoc.slice(
		(input.page - 1) * input.pageSize,
		input.page * input.pageSize,
	);
	const tuyChon = tuyChonLoc(dong);
	const facets: DataTableFacet[] = [
		{
			id: "phongBan",
			label: t.cot.phongBan,
			options: [
				...tuyChon.phongBan,
				...(tuyChon.coKhongPhong
					? [{ value: KHONG_PHONG, label: t.chuaCoPhongBan }]
					: []),
			],
		},
		{
			id: "trangThaiTinHieu",
			label: m.trang.cot.trangThai,
			options: tuyChon.trangThaiTinHieu,
		},
		{
			id: "nguoiGui",
			label: t.cot.nguoiGui,
			searchable: true,
			options: [
				...tuyChon.nguoiGui,
				...(tuyChon.coKhongCon
					? [{ value: KHONG_CON, label: t.khongConTaiKhoan }]
					: []),
			],
		},
	];
	return (
		<div className="flex flex-col gap-3">
			{banVeDocDuoc ? null : (
				<SimpleTableNote aria-live="polite" data-ban-ve-chua-doc="">
					{m.trang.banVeChuaDoc}
				</SimpleTableNote>
			)}
			<DataTable
				actions={
					thaoTac ? (
						<Button
							aria-pressed={input.archived}
							data-nut-da-luu-tru=""
							onClick={() => setArchived(!input.archived)}
							size="sm"
							variant={input.archived ? "contrast" : "outline"}
						>
							<Icon data-icon="inline-start" icon={Archive} />
							{t.luuTru.nut}
						</Button>
					) : undefined
				}
				columns={cot}
				empty={
					<Empty data-tat-ca-rong={daLuuTru ? "da-luu-tru" : "dang-dung"}>
						<EmptyHeader>
							<EmptyTitle>
								{daLuuTru ? t.luuTru.rongTieuDe : t.rongTieuDe}
							</EmptyTitle>
							<EmptyDescription>
								{daLuuTru ? t.luuTru.rongMoTa : t.rongMoTa}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				}
				facetCounts={demTheoLoc(dong, loc)}
				facets={facets}
				getRowId={(d) => d.id}
				layout="content"
				meta={dien(daLuuTru ? t.luuTru.meta : t.meta, {
					so: String(quaLoc.length),
				})}
				onClearFilters={() => {
					for (const f of facets) query.setFilter(f.id, []);
				}}
				query={query}
				rows={trang}
				total={quaLoc.length}
			/>
		</div>
	);
}

export function KhongQuyenTatCa({ nutVe }: { nutVe: React.ReactNode }) {
	const t = tinHieuMessages(useLocale()).tatCa;
	return (
		<Empty border="solid" data-tat-ca-khong-quyen="">
			<EmptyHeader>
				<EmptyTitle>{t.khongQuyen}</EmptyTitle>
				<EmptyDescription>{t.khongQuyenMoTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>{nutVe}</EmptyContent>
		</Empty>
	);
}
