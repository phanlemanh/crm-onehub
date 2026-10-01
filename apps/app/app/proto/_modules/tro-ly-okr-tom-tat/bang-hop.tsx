"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { Icon } from "@crm/ui/components/icon";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { ReactNode } from "react";
import {
	giaTri,
	NHAN_TU_TIN,
	TenNguoi,
	ThanhTienDo,
	TuTin,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import {
	CON_LAI,
	DANG_BAN,
	type DongHop,
	type LyDoBan,
	PHONG,
} from "./du-lieu";

function NhanLyDo({ lyDo }: { lyDo: LyDoBan }) {
	switch (lyDo.loai) {
		case "tu-tin-tut":
			return (
				<StatusIndicator
					label={`Tụt từ ${NHAN_TU_TIN[lyDo.tu].toLowerCase()} xuống ${NHAN_TU_TIN[lyDo.xuong].toLowerCase()}`}
					size="sm"
					tone="error"
				/>
			);
		case "im":
			return (
				<StatusIndicator
					label={`Im ${lyDo.ngay} ngày`}
					size="sm"
					tone="warning"
				/>
			);
		case "ghi-chu-moi":
			return <StatusIndicator label="Ghi chú mới" size="sm" tone="info" />;
	}
}

const COT = [
	{ id: "kr", header: "KR và vì sao đáng bàn" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-[26%]",
		className: "hidden md:table-cell",
	},
	{
		id: "ghi-chu",
		header: "Ghi chú mới nhất",
		width: "w-[30%]",
		className: "hidden lg:table-cell",
	},
] satisfies SimpleTableColumn[];

function TienDoDong({ dong }: { dong: DongHop }) {
	const { kr } = dong;
	const laMoc = kr.kieu === "moc";
	return (
		<div className="flex flex-col gap-1.5">
			<ThanhTienDo
				kyVong={laMoc ? null : PHONG.kyVong}
				nhan={kr.ten}
				phanTram={tienDo(kr)}
			/>
			<div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
				<TuTin muc={kr.tuTin} size="sm" />
				<span className="tabular-nums">
					{giaTri(kr)} / {laMoc ? "mốc" : giaTri(kr, kr.dich)}
				</span>
			</div>
		</div>
	);
}

function GhiChuDong({ dong }: { dong: DongHop }) {
	const { kr } = dong;
	if (!kr.ghiChu) return <span className="text-muted-foreground">—</span>;
	return (
		<figure className="flex flex-col gap-1">
			<blockquote translate="no">«{kr.ghiChu}»</blockquote>
			<figcaption className="text-muted-foreground text-xs">
				cập nhật {kr.capNhatLuc ?? "—"}
			</figcaption>
		</figure>
	);
}

function DongBan({ dong }: { dong: DongHop }) {
	const { kr, mucTieu, lyDo } = dong;
	return (
		<SimpleTableRow clickable data-kr={kr.id}>
			<TableCell className="px-3 py-3 align-top whitespace-normal">
				<div className="flex flex-col gap-1.5">
					<span className="text-sm" translate="no">
						{kr.ten}
					</span>
					<span className="text-muted-foreground text-xs">
						<span translate="no">{mucTieu.ten}</span> · Phụ trách{" "}
						<TenNguoi avatar={false} ten={kr.phuTrach.ten} />
					</span>
					{lyDo.length > 0 ? (
						<span className="flex flex-wrap gap-x-4 gap-y-1">
							{lyDo.map((l) => (
								<NhanLyDo key={l.loai} lyDo={l} />
							))}
						</span>
					) : null}
					<span className="md:hidden">
						<TienDoDong dong={dong} />
					</span>
				</div>
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top md:table-cell">
				<TienDoDong dong={dong} />
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top text-sm whitespace-normal lg:table-cell">
				<GhiChuDong dong={dong} />
			</TableCell>
		</SimpleTableRow>
	);
}

function BangBan({ dong }: { dong: DongHop[] }) {
	return (
		<SimpleTable columns={COT} surface="page">
			{dong.map((d) => (
				<DongBan dong={d} key={d.kr.id} />
			))}
		</SimpleTable>
	);
}

function TheDonVi({ chuaCapNhat }: { chuaCapNhat: boolean }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<span translate="no">{PHONG.ten}</span>
				</CardTitle>
				<CardDescription>
					Phòng ban · Trưởng <TenNguoi avatar={false} ten={PHONG.truong.ten} />{" "}
					· {PHONG.nhanTuan} · đã cập nhật {chuaCapNhat ? 0 : PHONG.daCapNhat}/
					{PHONG.tongKr} KR
				</CardDescription>
				<CardAction>
					<ToggleGroup
						aria-label="Cách xem"
						size="sm"
						type="single"
						value="hop-tuan"
						variant="outline"
					>
						<ToggleGroupItem value="danh-sach">Danh sách</ToggleGroupItem>
						<ToggleGroupItem value="cay">Cây căn chỉnh</ToggleGroupItem>
						<ToggleGroupItem value="hop-tuan">Họp tuần</ToggleGroupItem>
					</ToggleGroup>
				</CardAction>
			</CardHeader>
		</Card>
	);
}

function PhanConLai() {
	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Button className="self-start" size="sm" variant="ghost">
					<Icon icon={ChevronDown} data-icon="inline-start" />
					Còn lại {CON_LAI.length} KR — không có gì mới
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<BangBan dong={CON_LAI} />
			</CollapsibleContent>
		</Collapsible>
	);
}

export function BangHopTuan({
	khoi,
	chuaCapNhat = false,
}: {
	khoi: ReactNode;
	chuaCapNhat?: boolean;
}) {
	const dangBan = chuaCapNhat
		? DANG_BAN.filter((d) => d.lyDo.some((l) => l.loai === "im"))
		: DANG_BAN;
	return (
		<div className="flex flex-col gap-6" data-ban-mau="hop-tuan">
			<TheDonVi chuaCapNhat={chuaCapNhat} />
			{khoi}
			<section aria-labelledby="dang-ban" className="flex flex-col gap-3">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<h3 className="font-medium text-sm" id="dang-ban">
						Đáng bàn tuần này{" "}
						<Badge variant="secondary">{dangBan.length}</Badge>
					</h3>
					<p className="text-muted-foreground text-xs">
						Tuần {PHONG.tuan} · đã cập nhật {chuaCapNhat ? 0 : PHONG.daCapNhat}/
						{PHONG.tongKr} KR
					</p>
				</div>
				<p className="text-muted-foreground text-xs">
					Xếp theo: tự tin tụt, rồi KR im lâu nhất, rồi ghi chú mới. Mỗi dòng là
					một KR — bảng không liệt kê người chưa cập nhật.
				</p>
				<BangBan dong={dangBan} />
				<PhanConLai />
			</section>
		</div>
	);
}
