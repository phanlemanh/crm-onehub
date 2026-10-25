"use client";

import CollapseAll from "@carbon/icons-react/es/CollapseAll";
import ExpandAll from "@carbon/icons-react/es/ExpandAll";
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
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import {
	ConfidenceIndicator,
	PaceIndicator,
} from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import {
	CHU_KY,
	type ChuKyBco,
	DON_VI,
	type HangSoBco,
	HOM_NAY,
	type KrBco,
	MUC_TIEU_CA_NHAN,
	MUC_TIEU_PHONG_BAN,
	type MucTieuBco,
	SO_BO_PHAN,
	SO_CA_NHAN,
	SO_CHUA_CONG_BO,
	SO_PHONG_BAN,
} from "./du-lieu";
import { KhungBo, type TheBco } from "./khung";

type HinhHangSo = "co" | "dang-tai" | "loi" | "khong";
type MoDau = "tat-ca" | "gap-het" | "gap-mot";

type Canh = {
	don: keyof typeof DON_VI;
	the: TheBco;
	hangSo: HinhHangSo;
	so: HangSoBco;
	chuKy: ChuKyBco;
	homNay: string;
	moDau: MoDau;
	rows: MucTieuBco[];
};

const MAC_DINH: Canh = {
	don: "phongBan",
	the: "danh-sach",
	hangSo: "co",
	so: SO_PHONG_BAN,
	chuKy: CHU_KY,
	homNay: HOM_NAY,
	moDau: "tat-ca",
	rows: MUC_TIEU_PHONG_BAN,
};

const CANH = new Map<string, Canh>([
	["ST-bco-coso", MAC_DINH],
	["ST-bco-gap-mot", { ...MAC_DINH, moDau: "gap-mot" }],
	["ST-bco-dagap", { ...MAC_DINH, moDau: "gap-het" }],
	["ST-bco-bo-phan", { ...MAC_DINH, don: "boPhan", so: SO_BO_PHAN }],
	["ST-bco-dangtai", { ...MAC_DINH, hangSo: "dang-tai" }],
	["ST-bco-loi", { ...MAC_DINH, hangSo: "loi" }],
	["ST-bco-chuacongbo", { ...MAC_DINH, so: SO_CHUA_CONG_BO, rows: [] }],
	["ST-bco-chuabatdau", { ...MAC_DINH, homNay: "2026-09-28" }],
	["ST-bco-ngay-cuoi", { ...MAC_DINH, homNay: "2026-12-31" }],
	["ST-bco-daketthuc", { ...MAC_DINH, homNay: "2027-01-04" }],
	["ST-bco-the-hop-tuan", { ...MAC_DINH, the: "hop-tuan", hangSo: "khong" }],
	[
		"ST-bco-ca-nhan",
		{
			...MAC_DINH,
			don: "caNhan",
			so: SO_CA_NHAN,
			rows: MUC_TIEU_CA_NHAN,
		},
	],
]);

const NGAY_MS = 86_400_000;

const ngay = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

const ngayNgan = (iso: string) => {
	const [, thang, ngayThang] = iso.split("-");
	return `${ngayThang}/${thang}`;
};

function oNgayConLai(chuKy: ChuKyBco, homNay: string) {
	if (ngay(homNay) < ngay(chuKy.batDau))
		return { giaTri: "—", moTa: `Bắt đầu ${ngayNgan(chuKy.batDau)}` };
	if (ngay(homNay) > ngay(chuKy.ketThuc))
		return { giaTri: "0", moTa: `Đã kết thúc ${ngayNgan(chuKy.ketThuc)}` };
	const con = Math.round((ngay(chuKy.ketThuc) - ngay(homNay)) / NGAY_MS) + 1;
	return { giaTri: String(con), moTa: `đến ${ngayNgan(chuKy.ketThuc)}` };
}

function moTaTienDo(so: HangSoBco) {
	if (so.kyVong === null) return "Chưa có mục tiêu công bố để so";
	if (so.kyVong === 0) return "Mục tiêu vừa công bố, chưa có kỳ vọng để so";
	return `Lẽ ra đã tới ${so.kyVong}%`;
}

function HangSo({ canh }: { canh: Canh }) {
	const [hinh, datHinh] = useState(canh.hangSo);
	useEffect(() => datHinh(canh.hangSo), [canh.hangSo]);
	if (hinh === "khong") return null;
	if (hinh === "loi")
		return (
			<VungTaiLoi
				data-trang-thai="ST-bocoso-loi"
				moTa="Bảng mục tiêu bên dưới vẫn dùng được."
				onThuLai={() => datHinh("co")}
				tieuDe="Không tải được số của bộ"
			/>
		);
	if (hinh === "dang-tai")
		return (
			<StatGroup aria-busy="true" data-hang-so-bo="dang-tai">
				{["ngay", "tien-do", "cap-nhat", "tu-tin"].map((k) => (
					<StatCard
						description={<Skeleton className="h-4 w-24" />}
						key={k}
						label={<Skeleton className="h-4 w-20" />}
						value={<Skeleton className="h-8 w-14" />}
					/>
				))}
			</StatGroup>
		);
	const so = canh.so;
	const ngayCon = oNgayConLai(canh.chuKy, canh.homNay);
	return (
		<StatGroup data-hang-so-bo="co">
			<StatCard
				description={ngayCon.moTa}
				label="Ngày còn lại"
				value={ngayCon.giaTri}
			/>
			<StatCard
				description={moTaTienDo(so)}
				label="Tiến độ"
				value={so.tienDo === null ? "—" : `${so.tienDo}%`}
			/>
			<StatCard
				label="KR đã cập nhật tuần này"
				value={`${so.daCapNhat}/${so.soKr}`}
			/>
			<StatCard label="KR tự tin thấp" value={String(so.tuTinThap)} />
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

const COT: DataTableColumn<MucTieuBco>[] = [
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
					{mt.canBan ? <Badge variant="secondary">Cần bàn</Badge> : null}
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
		sortable: true,
		width: "w-56",
		hideBelow: "md",
		cell: (mt) =>
			mt.kr.length === 0 ? (
				<span className="text-muted-foreground text-xs">
					Chưa có KR để tính
				</span>
			) : (
				<TienDoO ten={mt.ten} tienDo={mt.tienDo} />
			),
	},
	{
		id: "tinh-trang",
		header: "Tình trạng",
		sortable: true,
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

function oKr(kr: KrBco, cot: string, mt: MucTieuBco) {
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

const MO_RONG: DataTableExpandable<MucTieuBco, KrBco> = {
	isExpandable: (mt) => mt.kr.length > 0,
	getSubRows: (mt) => mt.kr,
	getSubRowId: (kr) => kr.id,
	renderSubCell: oKr,
	rowLabel: (mt) => mt.ten,
};

function idMoDuoc(rows: MucTieuBco[]) {
	return rows.filter((mt) => MO_RONG.isExpandable(mt)).map((mt) => mt.id);
}

function moDauTheo(moDau: MoDau, rows: MucTieuBco[]) {
	const ids = idMoDuoc(rows);
	if (moDau === "gap-het") return [];
	if (moDau === "gap-mot") return ids.slice(1);
	return ids;
}

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

function BangBo({ canh }: { canh: Canh }) {
	const [moIds, datMoIds] = useQueryState(
		"expand",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	useEffect(() => {
		void datMoIds(moDauTheo(canh.moDau, canh.rows));
	}, [canh.moDau, canh.rows, datMoIds]);
	const tatCa = idMoDuoc(canh.rows);
	const coGap = tatCa.some((id) => !moIds.includes(id));
	const nut =
		tatCa.length === 0 ? null : (
			<Button
				data-nut-mo-gap-tat-ca={coGap ? "mo" : "gap"}
				onClick={() => void datMoIds(coGap ? tatCa : [])}
				size="sm"
				variant="outline"
			>
				<Icon data-icon="inline-start" icon={coGap ? ExpandAll : CollapseAll} />
				{coGap ? "Mở tất cả" : "Gập tất cả"}
			</Button>
		);
	const soKr = canh.rows.reduce((t, mt) => t + mt.kr.length, 0);
	const dv = DON_VI[canh.don];
	return (
		<DataTable
			actions={<span className="hidden sm:contents">{nut}</span>}
			columns={COT}
			empty={
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Bộ chưa có mục tiêu công bố</EmptyTitle>
						<EmptyDescription>
							Trưởng đơn vị soạn mục tiêu cho Quý 4 2026 rồi công bố.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			}
			expandable={MO_RONG}
			facetCounts={{
				nhanh: { "can-ban": canh.rows.filter((mt) => mt.canBan).length },
			}}
			getRowId={(mt) => mt.id}
			layout="content"
			meta={
				<span className="tabular-nums">
					{`${canh.rows.length} mục tiêu · ${soKr} KR`}
					{dv.truong ? (
						<>
							{" · Trưởng "}
							<span translate="no">{dv.truong}</span>
						</>
					) : null}
					{" · thuộc "}
					<span translate="no">{dv.cha}</span>
				</span>
			}
			query={QUERY}
			search={<span className="flex sm:hidden">{nut}</span>}
			rows={canh.rows}
			tabs={{
				id: "nhanh",
				allLabel: "Tất cả",
				allCount: canh.rows.length,
				options: [
					{ value: "can-ban", label: "Cần bàn" },
					{ value: "chua-gop", label: "Chưa góp vào đâu" },
				],
			}}
			total={canh.rows.length}
		/>
	);
}

function TheKhac() {
	return (
		<Empty border="solid">
			<EmptyHeader>
				<EmptyTitle>Thẻ Họp tuần giữ nguyên</EmptyTitle>
				<EmptyDescription>
					Vòng này không đổi thẻ này: không có bốn ô số của thẻ OKR ở đây.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

export function BoOkrCoSoMau({ state }: { state: string }) {
	const canh = CANH.get(state) ?? MAC_DINH;
	return (
		<LocaleProvider locale="vi">
			<div data-trang-thai={state}>
				<KhungBo tenBo={DON_VI[canh.don].ten} the={canh.the}>
					<HangSo canh={canh} />
					{canh.the === "danh-sach" ? <BangBo canh={canh} /> : <TheKhac />}
				</KhungBo>
			</div>
		</LocaleProvider>
	);
}
