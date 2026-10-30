"use client";

import { Button } from "@crm/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { dinhDangSo, moiNhat } from "../lich-su-moi-lan-cap-nhat/tinh";
import type { KrNgan } from "./du-lieu";
import { giaTriMoiNhat } from "./tinh";

const CHU = {
	tieuDe: "KR của bộ, theo thứ tự bàn",
	capNhat: "Cập nhật",
} as const;

const COT: SimpleTableColumn[] = [
	{ id: "kr", header: "KR" },
	{ id: "hien-tai", header: "Hiện tại", align: "right", width: "w-32" },
	{ id: "tu-tin", header: "Tự tin", width: "w-28" },
	{ id: "hanh-dong", srLabel: CHU.capNhat, align: "right", width: "w-28" },
];

function TenKr({ kr }: { kr: KrNgan }) {
	return (
		<span className="flex flex-col gap-0.5">
			<span className="text-sm" translate="no">
				{kr.tieuDe}
			</span>
			<span className="text-muted-foreground text-xs">
				Phụ trách <span translate="no">{kr.chuTen}</span>
			</span>
		</span>
	);
}

export function BangHopTuan({
	ds,
	dangMo,
	onCapNhat,
}: {
	ds: readonly KrNgan[];
	dangMo: number | null;
	onCapNhat: (viTri: number) => void;
}) {
	return (
		<section className="flex flex-col gap-3" data-bang-hop-tuan>
			<SectionHeading>{CHU.tieuDe}</SectionHeading>
			<div className="hidden md:block">
				<SimpleTable columns={COT} variant="panel">
					{ds.map((kr, i) => (
						<SimpleTableRow
							data-dong-hop-tuan={kr.id}
							data-dang-mo={i === dangMo ? "" : undefined}
							key={kr.id}
						>
							<SimpleTableCell>
								<TenKr kr={kr} />
							</SimpleTableCell>
							<SimpleTableCell numeric>
								{dinhDangSo(kr, giaTriMoiNhat(kr))}
							</SimpleTableCell>
							<SimpleTableCell>
								{moiNhat(kr) ? (
									<ConfidenceIndicator
										level={moiNhat(kr)?.tuTin ?? "vua"}
										size="sm"
									/>
								) : null}
							</SimpleTableCell>
							<SimpleTableCell align="right">
								<Button
									data-nut="cap-nhat-dong-hop-tuan"
									onClick={() => onCapNhat(i)}
									size="sm"
									variant="outline"
								>
									{CHU.capNhat}
								</Button>
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="md:hidden">
				{ds.map((kr, i) => (
					<Item key={kr.id} size="sm" variant="outline">
						<ItemContent>
							<ItemTitle translate="no">{kr.tieuDe}</ItemTitle>
							<ItemDescription className="tabular-nums">
								{dinhDangSo(kr, giaTriMoiNhat(kr))}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button onClick={() => onCapNhat(i)} size="sm" variant="outline">
								{CHU.capNhat}
							</Button>
						</ItemActions>
					</Item>
				))}
			</ItemGroup>
		</section>
	);
}
