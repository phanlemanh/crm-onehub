"use client";

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
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTableNote } from "@crm/ui/components/simple-table";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { TrangThai } from "@/components/tin-hieu/danh-sach-tin-hieu";
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

function cot(m: TinHieuMessages): DataTableColumn<DongTatCa>[] {
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
		{
			id: "trang-thai",
			header: m.trang.cot.trangThai,
			width: "w-28 md:w-[24%]",
			cellClassName: "whitespace-normal",
			cell: (d) => <TrangThai gon trangThai={d.trangThai} />,
		},
	];
}

export function BangTatCa({
	dong,
	banVeDocDuoc,
}: {
	dong: DongTatCa[];
	banVeDocDuoc: boolean;
}) {
	const m = tinHieuMessages(useLocale());
	const t = m.tatCa;
	const { query, input } = useTableQuery(tatCaListParams);
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
				columns={cot(m)}
				empty={
					<Empty>
						<EmptyHeader>
							<EmptyTitle>{t.rongTieuDe}</EmptyTitle>
							<EmptyDescription>{t.rongMoTa}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				}
				facetCounts={demTheoLoc(dong, loc)}
				facets={facets}
				getRowId={(d) => d.id}
				layout="content"
				meta={dien(t.meta, { so: String(quaLoc.length) })}
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
