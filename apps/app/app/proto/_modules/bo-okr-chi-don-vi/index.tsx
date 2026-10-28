"use client";

import ViewOff from "@carbon/icons-react/es/ViewOff";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	DataTable,
	type DataTableColumn,
	type DataTableExpandable,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import {
	ConfidenceIndicator,
	PaceIndicator,
} from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { StatCard } from "@crm/ui/components/stat-card";
import { TableCell } from "@crm/ui/components/table";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import {
	CAY,
	type DonBcd,
	DUONG,
	donCua,
	GOP_KHOI_KINH_DOANH,
	type KrBcd,
	MUC_TIEU_KHOI,
	MUC_TIEU_PHONG,
	type MucTieuBcd,
	TEN_KY,
} from "./du-lieu";
import { hrefBo, KhungBo, KhungTrang, type TheBcd } from "./khung";

type Canh = {
	don: string;
	the: TheBcd | "danh-sach-bo";
	moMenu: boolean;
	daBo: boolean;
	theoUrl: boolean;
};

const MAC_DINH: Canh = {
	don: "bp:kd",
	the: "danh-sach",
	moMenu: false,
	daBo: false,
	theoUrl: false,
};

const CANH = new Map<string, Canh>([
	["ST-bcd-khoi", MAC_DINH],
	["ST-bcd-menu", { ...MAC_DINH, moMenu: true }],
	["ST-bcd-da-bo", { ...MAC_DINH, daBo: true }],
	["ST-bcd-khoi-rong", { ...MAC_DINH, don: "bp:ht", moMenu: false }],
	["ST-bcd-phong", { ...MAC_DINH, don: "pb:kd-bac", moMenu: true }],
	["ST-bcd-goc", { ...MAC_DINH, don: "goc", moMenu: true }],
	["ST-bcd-danh-sach", { ...MAC_DINH, the: "danh-sach-bo" }],
	["ST-bcd-hop-tuan-goc", { ...MAC_DINH, don: "goc", the: "hop-tuan" }],
	["ST-bcd-hop-tuan", { ...MAC_DINH, the: "hop-tuan", theoUrl: true }],
	["ST-bcd-mot-bo", { ...MAC_DINH, theoUrl: true }],
]);

const mauCua = (d: DonBcd): MucTieuBcd[] => {
	if (d.khoa === "bp:kd") return MUC_TIEU_KHOI;
	if (d.khoa === "pb:kd-bac") return MUC_TIEU_PHONG;
	return Array.from({ length: d.soMucTieu }, (_, i) => ({
		...(MUC_TIEU_PHONG[i % MUC_TIEU_PHONG.length] as MucTieuBcd),
		id: `${d.khoa}-${i}`,
		ten: `${d.ten} — mục tiêu mẫu ${i + 1}`,
		phuTrach: d.truong ?? "Chưa giao",
	}));
};

function HangSo({ d }: { d: DonBcd }) {
	return (
		<StatGroup data-hang-so-bo="co">
			<StatCard description="đến 31/12" label="Ngày còn lại" value="65" />
			<StatCard
				description={
					d.kyVong === null
						? "Chưa có mục tiêu công bố để so"
						: `Lẽ ra đã tới ${d.kyVong}%`
				}
				label="Tiến độ"
				value={d.tienDo === null ? "—" : `${d.tienDo}%`}
			/>
			<StatCard
				label="KR đã cập nhật tuần này"
				value={`${d.daCapNhat}/${d.soKr}`}
			/>
			<StatCard label="KR tự tin thấp" value={String(d.tuTinThap)} />
		</StatGroup>
	);
}

function TienDoO({ tienDo, ten }: { tienDo: number; ten: string }) {
	return (
		<div className="flex min-w-0 items-center gap-2">
			<Progress aria-label={`Tiến độ ${ten}`} value={tienDo} />
			<span className="text-xs tabular-nums">{tienDo}%</span>
		</div>
	);
}

const COT: DataTableColumn<MucTieuBcd>[] = [
	{
		id: "ten",
		header: "Mục tiêu",
		hideable: false,
		cell: (mt) => (
			<span className="flex min-w-0 flex-col gap-1 whitespace-normal">
				<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<span className="wrap-anywhere font-medium" translate="no">
						{mt.ten}
					</span>
					<Badge variant="outline">{mt.loai}</Badge>
					{mt.daBo ? <Badge variant="secondary">Đã bỏ</Badge> : null}
					{mt.canBan && !mt.daBo ? (
						<Badge variant="secondary">Cần bàn</Badge>
					) : null}
				</span>
				<span className="text-muted-foreground text-xs">
					{mt.kr.length > 0 ? `${mt.kr.length} KR` : "Chưa có KR"}
				</span>
			</span>
		),
	},
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-56",
		hideBelow: "md",
		cell: (mt) => <TienDoO ten={mt.ten} tienDo={mt.tienDo} />,
	},
	{
		id: "tinh-trang",
		header: "Tình trạng",
		width: "w-36",
		hideBelow: "md",
		cell: (mt) => <PaceIndicator pace={mt.nhip} size="sm" />,
	},
	{
		id: "phu-trach",
		header: "Phụ trách",
		width: "w-48",
		hideBelow: "lg",
		cell: (mt) => <span translate="no">{mt.phuTrach}</span>,
	},
];

function oKr(kr: KrBcd, cot: string, mt: MucTieuBcd) {
	switch (cot) {
		case "ten":
			return (
				<span className="flex min-w-0 gap-3 whitespace-normal ps-4">
					<span className="w-8 shrink-0 text-muted-foreground text-xs tabular-nums">
						{`KR${mt.kr.indexOf(kr) + 1}`}
					</span>
					<span className="flex min-w-0 flex-col gap-1">
						<span className="wrap-anywhere" translate="no">
							{kr.ten}
						</span>
						<span className="text-muted-foreground text-xs tabular-nums md:hidden">
							{kr.giaTri} · {kr.tienDo}%
						</span>
					</span>
				</span>
			);
		case "tien-do":
			return <TienDoO ten={kr.ten} tienDo={kr.tienDo} />;
		case "tinh-trang":
			return kr.tuTin ? (
				<ConfidenceIndicator level={kr.tuTin} size="sm" />
			) : (
				<PaceIndicator pace={kr.nhip} size="sm" />
			);
		case "phu-trach":
			return <span translate="no">{kr.phuTrach}</span>;
		default:
			return null;
	}
}

const MO_RONG: DataTableExpandable<MucTieuBcd, KrBcd> = {
	isExpandable: (mt) => mt.kr.length > 0 && !mt.daBo,
	getSubRows: (mt) => mt.kr,
	getSubRowId: (kr) => kr.id,
	renderSubCell: oKr,
	rowLabel: (mt) => mt.ten,
	moSan: true,
};

const QUERY: TableQueryState = {
	sort: "",
	dir: "asc",
	page: 1,
	pageSize: Number.MAX_SAFE_INTEGER,
	tab: "all",
	tabId: "nhanh",
	filters: {},
	toggleSort: () => {},
	setSort: () => {},
	setDir: () => {},
	setPage: async () => {},
	setTab: () => {},
	setFilter: () => {},
};

function RongKhoi({ d }: { d: DonBcd }) {
	const soPhong = CAY.filter((x) => x.cha === d.khoa).length;
	if (d.cap === "bo-phan")
		return (
			<Empty data-rong-bo-phan="">
				<EmptyHeader>
					<EmptyTitle>
						<span translate="no">{d.ten}</span> chưa có mục tiêu riêng trong{" "}
						{TEN_KY}
					</EmptyTitle>
					<EmptyDescription>
						{`Mục tiêu của ${soPhong} phòng ban trực thuộc nằm trong bộ của từng phòng — mở menu ở tên khối trên dòng vị trí để sang.`}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline">Tạo mục tiêu cho khối</Button>
				</EmptyContent>
			</Empty>
		);
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>
					<span translate="no">{d.ten}</span> chưa có mục tiêu trong {TEN_KY}
				</EmptyTitle>
				<EmptyDescription>
					Trưởng đơn vị soạn mục tiêu cho chu kỳ rồi công bố.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function BangBo({ d, daBoSan }: { d: DonBcd; daBoSan: boolean }) {
	const [daBo, datDaBo] = useState(daBoSan);
	useEffect(() => datDaBo(daBoSan), [daBoSan]);
	const tatCa = mauCua(d);
	const dangChay = tatCa.filter((mt) => !mt.daBo);
	const boDi = tatCa.filter((mt) => mt.daBo);
	const rows = daBo ? boDi : dangChay;
	const soKr = rows.reduce((t, mt) => t + mt.kr.length, 0);
	const nutDaBo =
		boDi.length === 0 && !daBo ? null : (
			<Button
				aria-pressed={daBo}
				data-nut-da-bo={daBo ? "bat" : "tat"}
				onClick={() => datDaBo(!daBo)}
				size="sm"
				variant={daBo ? "contrast" : "outline"}
			>
				<Icon data-icon="inline-start" icon={ViewOff} />
				{`Đã bỏ (${boDi.length})`}
			</Button>
		);
	return (
		<DataTable
			actions={<span className="hidden sm:contents">{nutDaBo}</span>}
			search={<span className="flex sm:hidden">{nutDaBo}</span>}
			columns={COT}
			empty={
				daBo ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Không có mục tiêu nào đã bỏ</EmptyTitle>
						</EmptyHeader>
					</Empty>
				) : (
					<RongKhoi d={d} />
				)
			}
			expandable={MO_RONG}
			facetCounts={{
				nhanh: {
					"can-ban": rows.filter((mt) => mt.canBan).length,
					"chua-gop": 0,
				},
			}}
			getRowId={(mt) => mt.id}
			layout="content"
			meta={
				<span className="tabular-nums">
					{`${rows.length} mục tiêu · ${soKr} KR`}
					{d.truong ? (
						<>
							{" · Trưởng "}
							<span translate="no">{d.truong}</span>
						</>
					) : null}
				</span>
			}
			query={QUERY}
			rows={rows}
			tabs={{
				id: "nhanh",
				allLabel: "Tất cả",
				allCount: rows.length,
				options: [
					{ value: "can-ban", label: "Cần bàn" },
					{ value: "chua-gop", label: "Chưa góp vào đâu" },
				],
			}}
			total={rows.length}
		/>
	);
}

function HopTuanBo({ d }: { d: DonBcd }) {
	const kr = mauCua(d)
		.filter((mt) => !mt.daBo)
		.flatMap((mt) => mt.kr);
	if (kr.length === 0)
		return (
			<Empty border="solid" data-hop-tuan-rong="">
				<EmptyHeader>
					<EmptyTitle>
						<span translate="no">{d.ten}</span> chưa có KR công bố trong{" "}
						{TEN_KY}.
					</EmptyTitle>
					<EmptyDescription>
						Họp tuần của từng khối, phòng ban: chọn đơn vị ở menu{" "}
						<span translate="no">{d.ten}</span> trên dòng vị trí.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild size="sm" variant="outline">
						<Link href={`${DUONG}?state=ST-bcd-danh-sach`}>Xem mọi bộ OKR</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);
	return (
		<div className="flex flex-col gap-3" data-hop-tuan-bo="">
			<StatGroup>
				<StatCard
					label="KR đã cập nhật tuần này"
					value={`${d.daCapNhat}/${d.soKr}`}
				/>
				<StatCard label="KR tự tin thấp" value={String(d.tuTinThap)} />
			</StatGroup>
			<ItemGroup>
				{kr.map((k) => (
					<Item key={k.id} size="sm" variant="outline">
						<ItemContent>
							<ItemTitle translate="no">{k.ten}</ItemTitle>
							<ItemDescription>
								<span translate="no">{k.phuTrach}</span>
								{` · ${k.giaTri}`}
							</ItemDescription>
						</ItemContent>
						{k.tuTin ? <ConfidenceIndicator level={k.tuTin} size="sm" /> : null}
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}

const LOP_CAP = {
	goc: "font-medium",
	"bo-phan": "ps-6",
	"phong-ban": "ps-12",
} as const;

function DanhSachBo() {
	return (
		<div className="flex min-w-0 flex-col gap-4" data-danh-sach-bo="">
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "bo", header: "Bộ" },
						{ id: "truong", header: "Trưởng" },
						{ id: "muc-tieu", header: "Mục tiêu", align: "right" },
						{ id: "tien-do", header: "Tiến độ", align: "right" },
						{ id: "tu-tin", header: "KR tự tin thấp", align: "right" },
					]}
					surface="page"
				>
					{CAY.map((h) => (
						<SimpleTableRow data-bo={h.khoa} key={h.khoa}>
							<TableCell className={LOP_CAP[h.cap]}>
								<Link href={hrefBo(h.khoa)} translate="no">
									{h.ten}
								</Link>
							</TableCell>
							<TableCell translate="no">
								{h.truong ?? <EmptyCellValue />}
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{h.soMucTieu}
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{h.tienDo === null ? <EmptyCellValue /> : `${h.tienDo}%`}
							</TableCell>
							<TableCell className="text-right tabular-nums">
								{h.tuTinThap}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<div className="md:hidden">
				<ItemGroup>
					{CAY.map((h) => (
						<Item asChild key={h.khoa} variant="outline">
							<Link data-bo={h.khoa} href={hrefBo(h.khoa)}>
								<ItemContent>
									<ItemTitle translate="no">{h.ten}</ItemTitle>
									<ItemDescription>
										{`Mục tiêu ${h.soMucTieu} · Tiến độ ${h.tienDo === null ? "—" : `${h.tienDo}%`} · Tự tin thấp ${h.tuTinThap}`}
									</ItemDescription>
								</ItemContent>
							</Link>
						</Item>
					))}
				</ItemGroup>
			</div>
			<p className="text-muted-foreground text-xs">
				{`Mỗi hàng là số riêng của bộ đó. Khối Kinh doanh: ${CAY[1]?.soMucTieu} mục tiêu riêng; Toàn cảnh vẫn cộng cả bốn phòng (${GOP_KHOI_KINH_DOANH.soMucTieu} mục tiêu, ${GOP_KHOI_KINH_DOANH.tienDo}%).`}
			</p>
		</div>
	);
}

export function BoOkrChiDonViMau({ state }: { state: string }) {
	const canh = CANH.get(state) ?? MAC_DINH;
	const [donUrl] = useQueryState("don", parseAsString);
	const khoa = canh.theoUrl && donUrl ? donUrl : canh.don;
	const d = CAY.some((x) => x.khoa === khoa) ? donCua(khoa) : donCua("bp:kd");
	if (canh.the === "danh-sach-bo")
		return (
			<LocaleProvider locale="vi">
				<div data-trang-thai={state}>
					<KhungTrang>
						<DanhSachBo />
					</KhungTrang>
				</div>
			</LocaleProvider>
		);
	const the = canh.the;
	return (
		<LocaleProvider locale="vi">
			<div data-trang-thai={state}>
				<KhungBo
					don={d}
					key={`${state}-${d.khoa}`}
					moMenu={canh.moMenu}
					the={the}
				>
					{the === "hop-tuan" ? (
						<HopTuanBo d={d} />
					) : (
						<>
							<HangSo d={d} />
							<BangBo d={d} daBoSan={canh.daBo} />
						</>
					)}
				</KhungBo>
			</div>
		</LocaleProvider>
	);
}
