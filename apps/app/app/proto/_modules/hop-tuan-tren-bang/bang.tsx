"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemFooter,
	ItemGroup,
} from "@crm/ui/components/item";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import type { ReactNode } from "react";
import type { KrHop, PhanBang } from "./du-lieu";
import { DongLyDo, GhiChuMoiNhat, OMucDoi, TienDoKr } from "./o-dong";
import { mucDoi, tenMucTieu } from "./tinh";

export type HanhDongBang = {
	onMoKr: (phan: PhanBang, viTri: number) => void;
	onCapNhat: (krId: string) => void;
};

const COT: SimpleTableColumn[] = [
	{ id: "kr", header: "KR và vì sao đáng bàn" },
	{ id: "tien-do", header: "Tiến độ", width: "w-[18%]" },
	{
		id: "ghi-chu",
		header: "Ghi chú mới nhất",
		width: "w-[28%]",
		className: "hidden lg:table-cell",
	},
	{
		id: "muc-doi",
		header: "Mức đổi",
		width: "w-[16%]",
		className: "hidden lg:table-cell",
	},
	{ id: "hanh-dong", srLabel: "Cập nhật", align: "right" },
];

function TenKr({ kr, onMo }: { kr: KrHop; onMo: () => void }) {
	return (
		<span className="flex flex-col items-start gap-0.5">
			<button
				className="text-start text-sm underline-offset-2 hover:underline focus-visible:underline"
				data-mo-kr={kr.id}
				onClick={onMo}
				translate="no"
				type="button"
			>
				{kr.tieuDe}
			</button>
			<span className="text-muted-foreground text-xs">
				<span translate="no">{tenMucTieu(kr)}</span> · Phụ trách{" "}
				<span translate="no">{kr.chuTen}</span>
			</span>
		</span>
	);
}

function KhoiNhan({ nhan, children }: { nhan: string; children: ReactNode }) {
	return (
		<span className="flex flex-col gap-1">
			<span className="text-muted-foreground text-xs">{nhan}</span>
			{children}
		</span>
	);
}

function GhiChuVaDoi({ kr }: { kr: KrHop }) {
	return (
		<span className="flex flex-col gap-3" data-xep-chong={kr.id}>
			<KhoiNhan nhan="Ghi chú mới nhất">
				<GhiChuMoiNhat kr={kr} />
			</KhoiNhan>
			<KhoiNhan nhan="Mức đổi">
				<OMucDoi doi={mucDoi(kr)} />
			</KhoiNhan>
		</span>
	);
}

function NutCapNhat({ kr, onCapNhat }: { kr: KrHop; onCapNhat: () => void }) {
	return (
		<Button
			aria-label={`Cập nhật ${kr.tieuDe}`}
			data-nut="cap-nhat-dong"
			onClick={onCapNhat}
			size="sm"
			variant="outline"
		>
			Cập nhật
		</Button>
	);
}

function BangRong({
	ds,
	phan,
	hanhDong,
}: {
	ds: KrHop[];
	phan: PhanBang;
	hanhDong: HanhDongBang;
}) {
	return (
		<SimpleTable columns={COT} surface="page">
			{ds.map((kr, i) => (
				<SimpleTableRow data-kr-hop={kr.id} key={kr.id}>
					<SimpleTableCell className="py-3 align-top whitespace-normal">
						<span className="flex flex-col gap-2">
							<TenKr kr={kr} onMo={() => hanhDong.onMoKr(phan, i)} />
							<DongLyDo kr={kr} />
							<span className="lg:hidden">
								<GhiChuVaDoi kr={kr} />
							</span>
						</span>
					</SimpleTableCell>
					<SimpleTableCell className="py-3 align-top">
						<TienDoKr kr={kr} />
					</SimpleTableCell>
					<SimpleTableCell className="hidden py-3 align-top whitespace-normal lg:table-cell">
						<GhiChuMoiNhat kr={kr} />
					</SimpleTableCell>
					<SimpleTableCell className="hidden py-3 align-top whitespace-normal lg:table-cell">
						<OMucDoi doi={mucDoi(kr)} />
					</SimpleTableCell>
					<SimpleTableCell align="right" className="py-3 align-top">
						<NutCapNhat kr={kr} onCapNhat={() => hanhDong.onCapNhat(kr.id)} />
					</SimpleTableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function DanhSachHep({
	ds,
	phan,
	hanhDong,
}: {
	ds: KrHop[];
	phan: PhanBang;
	hanhDong: HanhDongBang;
}) {
	return (
		<ItemGroup className="gap-2">
			{ds.map((kr, i) => (
				<Item data-kr-hop={kr.id} key={kr.id} variant="outline">
					<ItemContent>
						<span className="flex flex-col gap-3">
							<TenKr kr={kr} onMo={() => hanhDong.onMoKr(phan, i)} />
							<DongLyDo kr={kr} />
							<TienDoKr kr={kr} />
							<GhiChuVaDoi kr={kr} />
						</span>
					</ItemContent>
					<ItemFooter>
						<NutCapNhat kr={kr} onCapNhat={() => hanhDong.onCapNhat(kr.id)} />
					</ItemFooter>
				</Item>
			))}
		</ItemGroup>
	);
}

function PhanKr({
	ds,
	phan,
	hanhDong,
}: {
	ds: KrHop[];
	phan: PhanBang;
	hanhDong: HanhDongBang;
}) {
	return (
		<>
			<div className="hidden md:block" data-khung="rong">
				<BangRong ds={ds} hanhDong={hanhDong} phan={phan} />
			</div>
			<div className="md:hidden" data-khung="hep">
				<DanhSachHep ds={ds} hanhDong={hanhDong} phan={phan} />
			</div>
		</>
	);
}

export function PhanConLai({
	so,
	mo,
	onDoi,
	children,
}: {
	so: number;
	mo: boolean;
	onDoi: (mo: boolean) => void;
	children: ReactNode;
}) {
	return (
		<Collapsible
			data-con-lai={mo ? "mo" : "dong"}
			onOpenChange={onDoi}
			open={mo}
		>
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					<Icon
						icon={mo ? ChevronDown : ChevronRight}
						data-icon="inline-start"
					/>
					Còn lại ({so}) — không có gì mới
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">{children}</CollapsibleContent>
		</Collapsible>
	);
}

const XEP_THEO =
	"Xếp theo: tự tin tụt, rồi KR im lâu nhất, rồi ghi chú mới. ‹ › trong chi tiết KR đi đúng thứ tự này, rồi sang phần Còn lại.";

export function DauBang({
	dangBan,
	xepTheo = XEP_THEO,
}: {
	dangBan: number;
	xepTheo?: string;
}) {
	return (
		<div className="flex flex-col gap-1">
			<SectionHeading id="dang-ban" level={2}>
				Đáng bàn tuần này <Badge variant="secondary">{dangBan}</Badge>
			</SectionHeading>
			<p className="text-muted-foreground text-xs">{xepTheo}</p>
		</div>
	);
}

export function BangHop({
	dangBan,
	conLai,
	moConLai,
	onDoiConLai,
	hanhDong,
}: {
	dangBan: KrHop[];
	conLai: KrHop[];
	moConLai: boolean;
	onDoiConLai: (mo: boolean) => void;
	hanhDong: HanhDongBang;
}) {
	return (
		<section
			aria-labelledby="dang-ban"
			className="flex flex-col gap-4"
			data-bang-hop="de-xuat"
		>
			<DauBang dangBan={dangBan.length} />
			<PhanKr ds={dangBan} hanhDong={hanhDong} phan="dang-ban" />
			<PhanConLai mo={moConLai} onDoi={onDoiConLai} so={conLai.length}>
				<PhanKr ds={conLai} hanhDong={hanhDong} phan="con-lai" />
			</PhanConLai>
		</section>
	);
}
