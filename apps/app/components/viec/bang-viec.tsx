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
import { formatDay } from "@crm/ui/lib/format";
import type { NhomViec } from "@crm/validation/viec";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { duAnMessages } from "@/lib/messages/du-an";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import { DongDuAnViec } from "./dong-du-an";
import { HanViec, TrangThaiViecNhan, type ViecDong } from "./trang-thai-viec";

function cot(
	m: ViecMessages,
	nhom: NhomViec,
	batDau: string | null,
): SimpleTableColumn[] {
	return [
		{ id: "viec", header: m.cot.viec },
		{ id: "trang-thai", header: m.cot.trangThai, width: "w-40" },
		...(batDau ? [{ id: "bat-dau", header: batDau, width: "w-32" }] : []),
		{ id: "han", header: m.cot.han, width: "w-32" },
		{ id: "gan", header: m.cot.banGhi, className: "hidden lg:table-cell" },
		{
			id: "nguoi",
			header: nhom === "toi-giao" ? m.cot.nguoiThucHien : m.cot.nguoiGiao,
			width: "w-40",
		},
	];
}

export function BangViec({
	ds,
	nhom,
	batDau = false,
	onMoDuAn,
}: {
	ds: ViecDong[];
	nhom: NhomViec;
	batDau?: boolean;
	onMoDuAn?: (id: string) => void;
}) {
	const locale = useLocale();
	const m = viecMessages(locale);
	const d = duAnMessages(locale).viec;
	const open = useOpenRecord();
	const nguoi = (v: ViecDong) =>
		nhom === "toi-giao" ? v.nguoiThucHien.name : v.nguoiGiao.name;
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable
					columns={cot(m, nhom, batDau ? d.batDau : null)}
					surface="page"
				>
					{ds.map((v) => (
						<SimpleTableRow
							clickable
							data-viec={v.id}
							key={v.id}
							onClick={() => open({ kind: "viec", id: v.id })}
						>
							<SimpleTableCell className="max-w-0 truncate font-medium">
								<span translate="no">{v.tieuDe}</span>
								{onMoDuAn && v.duAn ? (
									<DongDuAnViec duAn={v.duAn} onMo={onMoDuAn} />
								) : null}
							</SimpleTableCell>
							<SimpleTableCell>
								<TrangThaiViecNhan trangThai={v.trangThai} />
							</SimpleTableCell>
							{batDau ? (
								<SimpleTableCell className="text-muted-foreground tabular-nums">
									{v.batDauNgay ? formatDay(v.batDauNgay, locale) : "—"}
								</SimpleTableCell>
							) : null}
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
								{onMoDuAn && v.duAn ? (
									<DongDuAnViec duAn={v.duAn} onMo={onMoDuAn} />
								) : null}
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
