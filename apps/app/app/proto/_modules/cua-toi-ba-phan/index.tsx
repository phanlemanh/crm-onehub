"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import Edit from "@carbon/icons-react/es/Edit";
import Pending from "@carbon/icons-react/es/Pending";
import UserFollow from "@carbon/icons-react/es/UserFollow";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from "@crm/ui/components/item";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import Link from "next/link";
import { CapNhatTuan } from "../ban-mau-okr/cap-nhat-tuan";
import { KR_CUA_TOI, KY, type MucTieuMau, NGUOI } from "../ban-mau-okr/du-lieu";
import {
	giaTri,
	ThanhTienDo,
	TinhTrangKr,
	TuTin,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import {
	canCapNhat,
	donViDan,
	type KrCuaNguoi,
	krCua,
	mucTieuThamGia,
	tomTat,
} from "./du-lieu";
import { type DauTrang, TrangMucTieu } from "./khung";

const KHONG_DAN =
	"Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu: mục tiêu thuộc về đơn vị và do trưởng đơn vị đặt.";
const TUAN = "tuần 30/11";
const HAN = "hạn thứ Sáu 4/12";

type Phan1 = "can-cap-nhat" | "dang-cap-nhat" | "da-gui" | "da-du" | "khong-kr";

type Man = {
	d: DauTrang;
	phan1: Phan1;
	can: KrCuaNguoi[];
	cua: KrCuaNguoi[];
	thamGia: MucTieuMau[];
	dan: string[];
};

const dau = (
	nguoi: string,
	duoc: boolean,
	donVi: string | null,
	ten: string,
): DauTrang => ({
	tab: "cua-toi",
	donVi,
	tenDonVi: ten,
	duoc,
	lyDo: duoc ? null : KHONG_DAN,
	phaLapKeHoach: false,
	soanKhoa: null,
	nguoi,
});

const thao: Man = {
	d: dau("Võ Phương Thảo", true, "cskh", "Chăm sóc khách hàng"),
	phan1: "can-cap-nhat",
	can: KR_CUA_TOI.slice(0, 3),
	cua: KR_CUA_TOI,
	thamGia: mucTieuThamGia(NGUOI.thao),
	dan: donViDan(NGUOI.thao).map((d) => d.id),
};

const khoa: Man = {
	d: dau("Đặng Anh Khoa", true, "taichinh", "Tài chính"),
	phan1: canCapNhat(NGUOI.khoa).length > 0 ? "can-cap-nhat" : "da-du",
	can: canCapNhat(NGUOI.khoa),
	cua: krCua(NGUOI.khoa),
	thamGia: mucTieuThamGia(NGUOI.khoa),
	dan: donViDan(NGUOI.khoa).map((d) => d.id),
};

const nga: Man = {
	d: dau("Bùi Thu Nga", false, null, "OneHub"),
	phan1: "can-cap-nhat",
	can: KR_CUA_TOI.slice(0, 3),
	cua: KR_CUA_TOI,
	thamGia: [],
	dan: [],
};

const MAN = {
	"ST-ctbp-can-cap-nhat": thao,
	"ST-ctbp-dang-cap-nhat": { ...thao, phan1: "dang-cap-nhat" },
	"ST-ctbp-dang-cap-nhat-390": { ...thao, phan1: "dang-cap-nhat" },
	"ST-ctbp-da-gui": { ...thao, phan1: "da-gui" },
	"ST-ctbp-da-du": { ...thao, phan1: "da-du", can: [] },
	"ST-ctbp-khong-kr": {
		...thao,
		phan1: "khong-kr",
		can: [],
		cua: [],
		thamGia: [],
	},
	"ST-ctbp-dan-mot": thao,
	"ST-ctbp-dan-hai": khoa,
	"ST-ctbp-don-vi-rong": khoa,
	"ST-ctbp-khong-dan": nga,
	"ST-ctbp-hoi-1-viec-tren": thao,
	"ST-ctbp-hoi-2-bang-muc-tieu": thao,
} satisfies Record<string, Man>;

const COT_KR: SimpleTableColumn[] = [
	{ id: "ten", header: "KR" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-56",
		className: "hidden sm:table-cell",
	},
	{
		id: "tinh-trang",
		header: "Tình trạng",
		width: "w-36",
		className: "hidden sm:table-cell",
	},
	{
		id: "tu-tin",
		header: "Tự tin",
		width: "w-28",
		className: "hidden sm:table-cell",
	},
];

function BangKr({ ds }: { ds: KrCuaNguoi[] }) {
	return (
		<SimpleTable columns={COT_KR} surface="page">
			{ds.map(({ kr, mucTieu }) => {
				const p = tienDo(kr);
				return (
					<SimpleTableRow data-kr={kr.id} key={kr.id}>
						<SimpleTableCell>
							<span className="flex flex-col gap-0.5">
								<span translate="no">{kr.ten}</span>
								<span className="text-muted-foreground text-xs" translate="no">
									{mucTieu.donVi} · {mucTieu.ten}
								</span>
								<span className="flex items-center gap-3 pt-1 sm:hidden">
									<span className="text-xs tabular-nums">{giaTri(kr)}</span>
									<TinhTrangKr loai={mucTieu.loai} phanTram={p} size="sm" />
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell className="hidden sm:table-cell">
							<span className="flex items-center gap-2">
								<ThanhTienDo nhan={kr.ten} phanTram={p} />
								<span className="w-24 shrink-0 text-right text-xs tabular-nums">
									{giaTri(kr)}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell className="hidden sm:table-cell">
							<TinhTrangKr loai={mucTieu.loai} phanTram={p} size="sm" />
						</SimpleTableCell>
						<SimpleTableCell className="hidden sm:table-cell">
							<TuTin coNhan={false} muc={kr.tuTin} size="sm" />
						</SimpleTableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}

function PhanCanCapNhat({ m }: { m: Man }) {
	const n = m.can.length;
	const cau =
		m.phan1 === "khong-kr"
			? "Bạn không phụ trách KR nào ở chu kỳ đang chạy."
			: m.phan1 === "da-du"
				? `Bạn đã cập nhật đủ cho ${TUAN}.`
				: m.phan1 === "da-gui"
					? `Đã gửi cập nhật tuần cho ${n} KR. Số mới đã vào trang đơn vị.`
					: `${n} KR chưa có số của ${TUAN}, ${HAN}.`;
	return (
		<section className="flex flex-col gap-3" data-phan="can-cap-nhat">
			<SectionHeading
				actions={
					m.phan1 === "can-cap-nhat" && n > 0 ? (
						<Button data-nut="cap-nhat-tai-cho" size="sm">
							<Icon data-icon="inline-start" icon={Edit} />
							Cập nhật {n} KR
						</Button>
					) : m.phan1 === "da-du" ? (
						<Button data-nut="sua-lan-gui" size="sm" variant="outline">
							Sửa lần gửi tuần này
						</Button>
					) : null
				}
				level={2}
			>
				Cần cập nhật tuần này
			</SectionHeading>
			<p className="text-muted-foreground text-sm">{cau}</p>
			{m.phan1 === "dang-cap-nhat" ? (
				<CapNhatTuan hinh="dang-dien" />
			) : m.phan1 === "can-cap-nhat" && n > 0 ? (
				<BangKr ds={m.can} />
			) : null}
		</section>
	);
}

function KhoiViec() {
	return (
		<Card data-khoi="viec-okr">
			<CardHeader>
				<CardTitle>Việc OKR khác</CardTitle>
				<CardDescription>2 việc chờ bạn.</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					<Item size="sm">
						<ItemMedia variant="icon">
							<Icon icon={UserFollow} />
						</ItemMedia>
						<ItemContent>
							<ItemTitle>Bạn được giao KR «Giảm thời gian phản hồi»</ItemTitle>
							<ItemDescription>Lê Thanh Mai giao hôm qua.</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button size="sm" variant="outline">
								Mở
							</Button>
						</ItemActions>
					</Item>
					<ItemSeparator />
					<Item size="sm">
						<ItemMedia variant="icon">
							<Icon icon={Pending} />
						</ItemMedia>
						<ItemContent>
							<ItemTitle>1 mục tiêu chờ bạn duyệt</ItemTitle>
							<ItemDescription>Kho vận gửi sáng nay.</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button size="sm" variant="outline">
								Mở
							</Button>
						</ItemActions>
					</Item>
				</ItemGroup>
			</CardContent>
		</Card>
	);
}

const TEN_DON_VI = {
	cskh: "Chăm sóc khách hàng",
	taichinh: "Tài chính",
	ketoan: "Kế toán",
} as Record<string, string>;

function TheDonVi({ id }: { id: string }) {
	const t = tomTat(id);
	const ten = TEN_DON_VI[id] ?? id;
	return (
		<Card data-don-vi-dan={id}>
			<CardHeader>
				<CardTitle translate="no">{ten}</CardTitle>
				<CardDescription>
					{t.soMucTieu === 0
						? `Chưa có mục tiêu nào ở ${KY.ten}.`
						: `${t.soMucTieu} mục tiêu · ${t.soKr} KR · trung bình ${t.tienDoTb}%`}
				</CardDescription>
				<CardAction>
					<Button asChild size="sm" variant="outline">
						<Link data-nut="mo-don-vi" href={`?state=ST-ctbp-dan-mot`}>
							Mở trang đơn vị
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			{t.soKr > 0 ? (
				<CardContent>
					<span className="flex flex-wrap items-center gap-x-4 gap-y-1">
						<StatusIndicator
							label={`${t.dem.success} KR đúng nhịp`}
							size="sm"
							tone="success"
						/>
						<StatusIndicator
							label={`${t.dem.warning} KR chậm nhịp`}
							size="sm"
							tone="warning"
						/>
						<StatusIndicator
							label={`${t.dem.error} KR trượt`}
							size="sm"
							tone="error"
						/>
					</span>
				</CardContent>
			) : null}
		</Card>
	);
}

function PhanDonViDan({ dan }: { dan: string[] }) {
	if (dan.length === 0) return null;
	return (
		<section className="flex flex-col gap-3" data-phan="don-vi-dan">
			<SectionHeading level={2}>Đơn vị bạn dẫn</SectionHeading>
			<div className="grid gap-3 md:grid-cols-2">
				{dan.map((id) => (
					<TheDonVi id={id} key={id} />
				))}
			</div>
		</section>
	);
}

function NhomThu({ ten, so }: { ten: string; so: number }) {
	if (so === 0) return null;
	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Button className="self-start" size="sm" variant="ghost">
					<Icon data-icon="inline-start" icon={ChevronDown} />
					{ten} ({so})
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent />
		</Collapsible>
	);
}

const COT_MT: SimpleTableColumn[] = [
	{ id: "ten", header: "Mục tiêu" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-56",
		className: "hidden sm:table-cell",
	},
	{ id: "kr", header: "KR", width: "w-20" },
];

function BangMucTieu({ ds }: { ds: MucTieuMau[] }) {
	return (
		<SimpleTable columns={COT_MT} surface="page">
			{ds.map((mt) => {
				const p = Math.round(
					mt.kr.reduce((t, k) => t + tienDo(k), 0) / Math.max(1, mt.kr.length),
				);
				return (
					<SimpleTableRow data-muc-tieu={mt.id} key={mt.id}>
						<SimpleTableCell>
							<span className="flex flex-col gap-0.5">
								<span translate="no">{mt.ten}</span>
								<span className="text-muted-foreground text-xs" translate="no">
									{mt.donVi}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell className="hidden sm:table-cell">
							<ThanhTienDo nhan={mt.ten} phanTram={p} />
						</SimpleTableCell>
						<SimpleTableCell className="tabular-nums">
							{mt.kr.length}
						</SimpleTableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}

function PhanKrPhuTrach({ m, giuBang }: { m: Man; giuBang?: boolean }) {
	return (
		<section className="flex flex-col gap-3" data-phan="kr-phu-trach">
			<SectionHeading level={2}>KR bạn phụ trách</SectionHeading>
			{m.cua.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>Bạn chưa phụ trách KR nào ở {KY.ten}</EmptyTitle>
						<EmptyDescription>
							OKR của đơn vị bạn nằm ở Theo đơn vị.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="outline">Sang Theo đơn vị</Button>
					</EmptyContent>
				</Empty>
			) : (
				<>
					<p className="text-muted-foreground text-sm">
						{m.cua.length} KR ở mọi đơn vị trong {KY.ten}.
					</p>
					<BangKr ds={m.cua} />
				</>
			)}
			{giuBang ? (
				<>
					<SectionHeading level={3}>Mục tiêu của bạn</SectionHeading>
					<BangMucTieu
						ds={[
							...new Map(
								[...m.cua.map((x) => x.mucTieu), ...m.thamGia].map((mt) => [
									mt.id,
									mt,
								]),
							).values(),
						]}
					/>
				</>
			) : null}
			<div className="flex flex-col gap-1">
				{giuBang ? null : (
					<NhomThu so={m.thamGia.length} ten="Mục tiêu bạn tham gia" />
				)}
				<NhomThu so={2} ten="Đang theo dõi" />
				<NhomThu so={1} ten="Đã bỏ" />
			</div>
		</section>
	);
}

export function CuaToiBaPhanMau({ state }: { state: string }) {
	const m: Man =
		state in MAN ? MAN[state as keyof typeof MAN] : MAN["ST-ctbp-can-cap-nhat"];
	return (
		<TrangMucTieu d={m.d} key={state}>
			<div className="flex flex-col gap-8">
				{state === "ST-ctbp-hoi-1-viec-tren" ? <KhoiViec /> : null}
				<PhanCanCapNhat m={m} />
				{state === "ST-ctbp-hoi-1-viec-tren" ? null : <KhoiViec />}
				<PhanDonViDan dan={m.dan} />
				<PhanKrPhuTrach
					giuBang={state === "ST-ctbp-hoi-2-bang-muc-tieu"}
					m={m}
				/>
			</div>
		</TrangMucTieu>
	);
}
