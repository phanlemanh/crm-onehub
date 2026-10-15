"use client";

import { Badge } from "@crm/ui/components/badge";
import {
	DataTable,
	type DataTableColumn,
	type DataTableExpandable,
} from "@crm/ui/components/data-table";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PaceIndicator } from "@crm/ui/components/okr-status";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { OwnerCell } from "@/components/crm/owner-cell";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { NhanGioiHan } from "@/components/okr/nhan-gioi-han";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { ChipGopY } from "../chip-gop-y";
import { type KetQua, type MucTieu, nhanKr } from "../kieu";
import {
	chuanLoc,
	type DemMatLoc,
	KhongKhop,
	type LocOkrGiaTri,
	laMatLoc,
	useMatLocOkr,
} from "../loc-okr";
import {
	NhanTinhTrang,
	NhanTrangThai,
	ThanhTienDo,
	TienDoMucTieuGon,
} from "../tien-do-kr";
import {
	CHIEU_SAP,
	COT_SAP,
	demLocNhanh,
	LOC_NHANH,
	locNhanh,
	sapXep,
	soKrCham,
	tinhTrangMucTieu,
} from "./bang-don-vi";

const TAB_LOC_NHANH = SEARCH_PARAM.okr.locNhanh;

const thamSoBang = {
	[SEARCH_PARAM.okr.locNhanh]: parseAsStringLiteral(LOC_NHANH),
	[SEARCH_PARAM.okr.sap]: parseAsStringLiteral(COT_SAP),
	[SEARCH_PARAM.okr.chieu]: parseAsStringLiteral(CHIEU_SAP).withDefault("asc"),
};

/**
 * Trạng thái truy vấn của bảng gắn đường dẫn: ô lọc nhanh và sắp xếp lọc trên
 * hàng máy chủ đã trả; năm bộ lọc của «Lọc» đi qua `loc` tới `okr.danhSach`.
 */
function useTruyVanBang(
	loc: LocOkrGiaTri,
	doiLoc: (thay: Partial<LocOkrGiaTri>) => void,
) {
	const [v, dat] = useQueryStates(thamSoBang);
	const tab = v[SEARCH_PARAM.okr.locNhanh];
	const cot = v[SEARCH_PARAM.okr.sap];
	const chieu = v[SEARCH_PARAM.okr.chieu];
	const query: TableQueryState = {
		sort: cot ?? "",
		dir: chieu,
		page: 1,
		pageSize: Number.MAX_SAFE_INTEGER,
		tab: tab ?? "all",
		tabId: TAB_LOC_NHANH,
		filters: {
			phuTrach: loc.phuTrach,
			loai: loc.loai,
			trangThai: loc.trangThai,
			tuTin: loc.tuTin,
			gopY: loc.gopY,
		},
		toggleSort: (id) => {
			const moi = COT_SAP.find((c) => c === id) ?? null;
			void dat({
				[SEARCH_PARAM.okr.sap]: moi,
				[SEARCH_PARAM.okr.chieu]:
					moi === cot && chieu === "asc" ? "desc" : "asc",
			});
		},
		setSort: (id) =>
			void dat({
				[SEARCH_PARAM.okr.sap]: COT_SAP.find((c) => c === id) ?? null,
			}),
		setDir: (d) => void dat({ [SEARCH_PARAM.okr.chieu]: d }),
		setPage: async () => {},
		setTab: (gia) =>
			void dat({
				[SEARCH_PARAM.okr.locNhanh]: LOC_NHANH.find((x) => x === gia) ?? null,
			}),
		setFilter: (id, values) => {
			if (laMatLoc(id)) doiLoc(chuanLoc(id, values));
		},
	};
	return { query, tab, cot, chieu };
}

/** Mục tiêu đã bỏ (chỉ lên bảng khi lọc trạng thái «Đã bỏ»): không mở KR, không tính tiến độ. */
const laDaBo = (mt: MucTieu) => mt.status === "da-bo";

function TenMucTieu({ mt }: { mt: MucTieu }) {
	const m = okrMessages(useLocale());
	const k = m.khoiMucTieu;
	const openRecord = useOpenRecord();
	const cham = soKrCham(mt);
	return (
		<span
			className="flex min-w-0 flex-col gap-1 whitespace-normal"
			data-da-bo={laDaBo(mt) ? "" : undefined}
			data-hang-muc-tieu={mt.id}
			data-muc-tieu={mt.id}
		>
			<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
				<button
					className="wrap-anywhere cursor-pointer text-start font-medium underline-offset-2 hover:underline focus-visible:underline"
					data-mo-muc-tieu={mt.id}
					onClick={(e) => {
						e.stopPropagation();
						openRecord({ kind: "objective", id: mt.id });
					}}
					translate="no"
					type="button"
				>
					{mt.title}
				</button>
				<span
					className="inline-flex flex-wrap items-center gap-2"
					data-nhom-nhan
				>
					{laDaBo(mt) ? null : (
						<Badge variant="outline">{m.loai[mt.kind]}</Badge>
					)}
					<NhanTrangThai status={mt.status} />
					{mt.hienThi === "gioi-han" ? (
						<NhanGioiHan moHop={null} soNguoiXem={mt.soNguoiXem} />
					) : null}
					{mt.soGopYCho > 0 ? <ChipGopY mt={mt} /> : null}
				</span>
			</span>
			<span className="text-muted-foreground text-xs">
				{k.soKr(mt.keyResults.length)}
				{mt.alignments.length > 0
					? ` · ${m.gopVao(mt.alignments.length)}`
					: null}
				{cham > 0 ? ` · ${k.soKrCham(cham)}` : null}
				<span className="lg:hidden">
					{" · "}
					<span translate="no">{mt.owner.name}</span>
				</span>
			</span>
			<span className="w-full pt-1 md:hidden">
				<TienDoMucTieuGon
					expected={mt.expected}
					kind={mt.kind}
					progress={mt.progress}
					soKr={mt.keyResults.length}
					ten={mt.title}
				/>
			</span>
		</span>
	);
}

function TienDo({
	ten,
	progress,
	expected,
}: {
	ten: string;
	progress: number;
	expected: number | null;
}) {
	return (
		<div className="flex min-w-0 items-center gap-2" data-o-tien-do>
			<ThanhTienDo expected={expected} progress={progress} ten={ten} />
			<span className="text-xs tabular-nums">{progress}%</span>
		</div>
	);
}

function useCot(): DataTableColumn<MucTieu>[] {
	const m = okrMessages(useLocale());
	const b = m.donViBang;
	return [
		{
			id: "ten",
			header: b.cot.mucTieu,
			hideable: false,
			cell: (mt) => <TenMucTieu mt={mt} />,
		},
		{
			id: "tien-do",
			header: b.cot.tienDo,
			sortable: true,
			width: "w-56",
			hideBelow: "md",
			cell: (mt) =>
				laDaBo(mt) || mt.keyResults.length === 0 ? (
					<span className="text-muted-foreground text-xs">
						{laDaBo(mt)
							? m.khoiMucTieu.khongTinhTienDo
							: m.khoiMucTieu.chuaCoKrDeTinh}
					</span>
				) : (
					<TienDo
						expected={mt.expected}
						progress={mt.progress}
						ten={mt.title}
					/>
				),
		},
		{
			id: "tinh-trang",
			header: b.cot.tinhTrang,
			sortable: true,
			width: "w-36",
			cell: (mt) =>
				laDaBo(mt) ? null : (
					<PaceIndicator pace={tinhTrangMucTieu(mt)} size="sm" />
				),
		},
		{
			id: "phu-trach",
			header: b.cot.phuTrach,
			width: "w-48",
			hideBelow: "lg",
			cell: (mt) => (
				<span translate="no">
					<OwnerCell owner={{ ...mt.owner, image: null }} />
				</span>
			),
		},
	];
}

function oKr(kr: KetQua, cot: string, mt: MucTieu): ReactNode {
	const laMoc = kr.kind === "moc";
	switch (cot) {
		case "ten":
			return (
				<span
					className="flex min-w-0 gap-3 whitespace-normal ps-4"
					data-kr={kr.id}
				>
					<span className="w-8 shrink-0 pt-px text-muted-foreground text-xs tabular-nums">
						{nhanKr(mt.keyResults.indexOf(kr) + 1)}
					</span>
					<span className="wrap-anywhere" translate="no">
						{kr.title}
					</span>
				</span>
			);
		case "tien-do":
			return (
				<TienDo
					expected={laMoc ? null : mt.expected}
					progress={kr.progress}
					ten={kr.title}
				/>
			);
		case "tinh-trang":
			return (
				<NhanTinhTrang
					expected={mt.expected}
					kind={mt.kind}
					laMoc={laMoc}
					progress={kr.progress}
				/>
			);
		case "phu-trach":
			return (
				<span translate="no">
					<OwnerCell owner={{ ...kr.owner, image: null }} />
				</span>
			);
		default:
			return null;
	}
}

/**
 * Bảng mục tiêu của một đơn vị trên DataTable: mỗi mục tiêu một dòng, mở ra
 * KR cùng cột; hàng công cụ là ô chọn + cách xem (trong `search`), ô lọc nhanh
 * (`tabs`), «Lọc» (năm mặt lọc máy chủ) và «Sắp xếp».
 */
export function BangDonVi({
	rows,
	loc,
	doiLoc,
	boLocMay,
	dem,
	tenNguoi,
	hangCongCu,
	chanBang,
	rong,
}: {
	rows: MucTieu[];
	loc: LocOkrGiaTri;
	doiLoc: (thay: Partial<LocOkrGiaTri>) => void;
	boLocMay: () => void;
	dem: DemMatLoc | undefined;
	tenNguoi: ReadonlyMap<string, string>;
	hangCongCu: ReactNode;
	chanBang: ReactNode;
	rong: ReactNode;
}) {
	const b = okrMessages(useLocale()).donViBang;
	const openRecord = useOpenRecord();
	const { query, tab, cot, chieu } = useTruyVanBang(loc, doiLoc);
	const facets = useMatLocOkr(dem, loc, tenNguoi);
	const cotBang = useCot();
	const hien = sapXep(locNhanh(rows, tab), cot, chieu);
	const boLoc = () => {
		query.setTab("all");
		boLocMay();
	};
	const moRong: DataTableExpandable<MucTieu, KetQua> = {
		isExpandable: (mt) => mt.keyResults.length > 0 && !laDaBo(mt),
		getSubRows: (mt) => mt.keyResults,
		getSubRowId: (kr) => kr.id,
		renderSubCell: oKr,
		onSubRowClick: (kr) => openRecord({ kind: "kr", id: kr.id }),
		rowLabel: (mt) => mt.title,
	};
	return (
		<div data-trang-thai={rows.length > 0 ? "ST-donvi-danhsach" : undefined}>
			<DataTable
				columns={cotBang}
				empty={rong}
				expandable={moRong}
				facetCounts={{ [TAB_LOC_NHANH]: demLocNhanh(rows) }}
				facets={facets}
				filteredEmpty={<KhongKhop boLoc={boLoc} />}
				getRowId={(mt) => mt.id}
				layout="content"
				meta={chanBang}
				onClearFilters={boLoc}
				query={query}
				rows={hien}
				search={hangCongCu}
				tabs={{
					id: TAB_LOC_NHANH,
					allLabel: b.locNhanh.tatCa,
					options: LOC_NHANH.map((v) => ({
						value: v,
						label: b.locNhanh[v],
					})),
				}}
				total={hien.length}
			/>
		</div>
	);
}
