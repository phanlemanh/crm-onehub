"use client";

import { Badge } from "@crm/ui/components/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { giaTri, LoaiMucTieuNhan } from "../ban-mau-okr/phan-chung";
import { CUA_TOI, kieuKr, type MucTieuDu, NHAN_TRANG_THAI } from "./du-lieu";
import { TienDoKrMau } from "./o-tien-do";

const COT: SimpleTableColumn[] = [
	{ id: "ten", header: "KR" },
	{ id: "phuTrach", header: "Phụ trách", width: "w-40" },
	{ id: "tienDo", header: "Tiến độ", width: "w-48" },
	{ id: "dich", header: "Đích", width: "w-40", align: "right" },
];

function KhoiCu({ mt }: { mt: MucTieuDu }) {
	return (
		<Card data-khoi-cu={mt.id}>
			<CardHeader>
				<CardTitle translate="no">{mt.ten}</CardTitle>
				<CardDescription>
					<span translate="no">{mt.donVi}</span> · Phụ trách{" "}
					<span translate="no">{mt.phuTrach.ten}</span>
				</CardDescription>
				<CardAction>
					<LoaiMucTieuNhan loai={mt.loai} />
					<Badge variant={mt.trangThai === "cong-bo" ? "secondary" : "outline"}>
						{NHAN_TRANG_THAI[mt.trangThai]}
					</Badge>
				</CardAction>
			</CardHeader>
			<SimpleTable columns={COT}>
				{mt.kr.map((kr) => (
					<SimpleTableRow key={kr.id}>
						<SimpleTableCell className="whitespace-normal py-2.5">
							<span className="flex flex-col gap-1">
								<span translate="no">{kr.ten}</span>
								<span className="text-muted-foreground text-xs">
									{kieuKr(kr)}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell className="py-2.5" translate="no">
							{kr.phuTrach.ten}
						</SimpleTableCell>
						<SimpleTableCell className="py-2.5">
							<TienDoKrMau kr={kr} loai={mt.loai} />
						</SimpleTableCell>
						<SimpleTableCell className="py-2.5" numeric translate="no">
							{kr.kieu === "moc"
								? giaTri(kr)
								: `${giaTri(kr)} / ${giaTri(kr, kr.dich)}`}
						</SimpleTableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</Card>
	);
}

export function DanhSachHienTai() {
	return (
		<div className="flex flex-col gap-6" data-ban-hien-tai>
			{CUA_TOI.map((mt) => (
				<KhoiCu key={mt.id} mt={mt} />
			))}
		</div>
	);
}
