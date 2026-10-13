"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import type { NhomViec } from "@crm/validation/viec";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import { HanViec, TrangThaiViecNhan, type ViecDong } from "./trang-thai-viec";

function cot(m: ViecMessages, nhom: NhomViec): SimpleTableColumn[] {
	return [
		{ id: "viec", header: m.cot.viec },
		{ id: "trang-thai", header: m.cot.trangThai, width: "w-40" },
		{ id: "han", header: m.cot.han, width: "w-32" },
		{ id: "gan", header: m.cot.banGhi, className: "hidden lg:table-cell" },
		{
			id: "nguoi",
			header: nhom === "toi-giao" ? m.cot.nguoiThucHien : m.cot.nguoiGiao,
			width: "w-40",
		},
	];
}

export function BangViec({ ds, nhom }: { ds: ViecDong[]; nhom: NhomViec }) {
	const m = viecMessages(useLocale());
	const open = useOpenRecord();
	const nguoi = (v: ViecDong) =>
		nhom === "toi-giao" ? v.nguoiThucHien.name : v.nguoiGiao.name;
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable columns={cot(m, nhom)} surface="page">
					{ds.map((v) => (
						<SimpleTableRow
							clickable
							data-viec={v.id}
							key={v.id}
							onClick={() => open({ kind: "viec", id: v.id })}
						>
							<SimpleTableCell className="max-w-0 truncate font-medium">
								<span translate="no">{v.tieuDe}</span>
							</SimpleTableCell>
							<SimpleTableCell>
								<TrangThaiViecNhan trangThai={v.trangThai} />
							</SimpleTableCell>
							<SimpleTableCell>
								<HanViec viec={v} />
							</SimpleTableCell>
							<SimpleTableCell className="hidden max-w-0 truncate text-muted-foreground lg:table-cell">
								<span translate="no">{v.banGhi[0]?.ten ?? m.khongGan}</span>
							</SimpleTableCell>
							<SimpleTableCell className="max-w-0 truncate text-muted-foreground">
								<span translate="no">{nguoi(v)}</span>
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="gap-2 md:hidden">
				{ds.map((v) => (
					<Item asChild data-viec={v.id} key={v.id} variant="outline">
						<button
							onClick={() => open({ kind: "viec", id: v.id })}
							type="button"
						>
							<ItemContent>
								<ItemTitle translate="no">{v.tieuDe}</ItemTitle>
								<ItemDescription>
									<TrangThaiViecNhan trangThai={v.trangThai} />
									<span aria-hidden> · </span>
									<HanViec viec={v} />
								</ItemDescription>
							</ItemContent>
						</button>
					</Item>
				))}
			</ItemGroup>
		</>
	);
}
