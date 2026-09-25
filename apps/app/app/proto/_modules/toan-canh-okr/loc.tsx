"use client";

import Close from "@carbon/icons-react/es/Close";
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
	type DataTableFacet,
	DataTableFacetMenu,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import { KhoiMucTieu } from "../ban-mau-okr/cua-toi";
import { MT_KD1, MT_KD2, NGUOI } from "../ban-mau-okr/du-lieu";
import { ChuThichVach, TenNguoi } from "../ban-mau-okr/phan-chung";

export type HinhLoc = "co-ket-qua" | "khong-khop";

const MAT_LOC: DataTableFacet[] = [
	{
		id: "phuTrach",
		label: "Người phụ trách",
		searchable: true,
		options: [NGUOI.hung, NGUOI.mai, NGUOI.duc, NGUOI.tuan].map((p) => ({
			value: p.id,
			label: p.ten,
		})),
	},
	{
		id: "loai",
		label: "Loại",
		options: [
			{ value: "cam-ket", label: "Cam kết" },
			{ value: "tham-vong", label: "Tham vọng" },
		],
	},
	{
		id: "trangThai",
		label: "Trạng thái",
		options: [
			{ value: "cong-bo", label: "Đã công bố" },
			{ value: "nhap", label: "Nháp" },
			{ value: "da-bo", label: "Đã bỏ" },
		],
	},
	{
		id: "tuTin",
		label: "Mức tự tin",
		options: [
			{ value: "cao", label: "Cao" },
			{ value: "vua", label: "Vừa" },
			{ value: "thap", label: "Thấp" },
		],
	},
];

const NHAN_GIA_TRI = new Map(
	MAT_LOC.flatMap((m) =>
		m.options.map((o) => [`${m.id}:${o.value}`, `${m.label}: ${o.label}`]),
	),
);

export function TheoDonViLoc({ hinh }: { hinh: HinhLoc }) {
	const [loc, setLoc] = useState<Record<string, string[]>>(
		hinh === "khong-khop"
			? { tuTin: ["thap"], phuTrach: ["duc"] }
			: { tuTin: ["thap"] },
	);
	const dangLoc = Object.entries(loc).flatMap(([id, vals]) =>
		vals.map((v) => `${id}:${v}`),
	);

	return (
		<div className="flex flex-col gap-6" data-ban-mau="theo-don-vi-loc">
			<Card>
				<CardHeader>
					<CardTitle>
						<span translate="no">Kinh doanh</span>
					</CardTitle>
					<CardDescription>
						Bộ phận · Trưởng <TenNguoi avatar={false} ten={NGUOI.lan.ten} /> ·
						gồm cả hai phòng ban bên dưới · 3 mục tiêu · 7 KR
					</CardDescription>
					<CardAction>
						<ToggleGroup
							aria-label="Cách xem"
							size="sm"
							type="single"
							value="danh-sach"
							variant="outline"
						>
							<ToggleGroupItem value="danh-sach">Danh sách</ToggleGroupItem>
							<ToggleGroupItem value="cay">Cây căn chỉnh</ToggleGroupItem>
							<ToggleGroupItem value="hop-tuan">Họp tuần</ToggleGroupItem>
						</ToggleGroup>
					</CardAction>
				</CardHeader>
			</Card>
			<div className="flex flex-wrap items-center gap-2">
				<DataTableFacetMenu
					facets={MAT_LOC}
					filters={loc}
					onFilterChange={(id, values) =>
						setLoc((cu) => ({ ...cu, [id]: values }))
					}
				/>
				{dangLoc.map((k) => (
					<Badge key={k} variant="secondary">
						{NHAN_GIA_TRI.get(k)}
						<Icon icon={Close} data-icon="inline-end" />
					</Badge>
				))}
				{dangLoc.length > 0 ? (
					<Button onClick={() => setLoc({})} size="sm" variant="ghost">
						Bỏ lọc
					</Button>
				) : null}
				<span className="ml-auto">
					<ChuThichVach />
				</span>
			</div>
			<p className="text-muted-foreground text-sm">
				Lọc ở máy chủ: mục tiêu có ít nhất một KR khớp «Mức tự tin» thì hiện, và
				chỉ các KR khớp được mở sẵn. Chọn bộ phận là gồm cả phòng ban con.
			</p>
			{hinh === "khong-khop" ? (
				<Empty className="rounded-lg border">
					<EmptyHeader>
						<EmptyTitle>Không mục tiêu nào khớp bộ lọc</EmptyTitle>
						<EmptyDescription>
							<span translate="no">{NGUOI.duc.ten}</span> không phụ trách KR nào
							đang tự tin thấp ở Kinh doanh.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={() => setLoc({})} size="sm" variant="outline">
							Bỏ lọc
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<div className="flex flex-col gap-4">
					<KhoiMucTieu mucTieu={MT_KD1} />
					<KhoiMucTieu mucTieu={MT_KD2} />
				</div>
			)}
		</div>
	);
}
