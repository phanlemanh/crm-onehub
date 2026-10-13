"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import type { DuLieuChoXem } from "@crm/validation/lo-trinh-du-lieu";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { KhungTrong } from "./khung-trong";

export function DaBac({ duLieu }: { duLieu: DuLieuChoXem }) {
	const m = loTrinhMessages(useLocale());
	const dong = duLieu.lo_trinh.flatMap((lo) =>
		lo.da_bac.map((b) => ({ ...b, loTep: lo.tep, loTen: lo.ten ?? lo.tep })),
	);
	if (!dong.length)
		return (
			<KhungTrong
				ca="khong-da-bac"
				moTa={m.trong.khongDaBacMoTa}
				tieuDe={m.trong.khongDaBacTieuDe}
			/>
		);
	return (
		<div data-lo-trinh-da-bac-ds>
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "viec", header: m.daBac.cotViec },
						{ id: "lo", header: m.daBac.cotLoTrinh, width: "10rem" },
					]}
					surface="page"
				>
					{dong.map((b) => (
						<SimpleTableRow
							data-lo-trinh-da-bac={`${b.loTep}#${b.ma}`}
							key={`${b.loTep}#${b.ma}`}
						>
							<TableCell className="whitespace-normal" translate="no">
								<span className="flex flex-col gap-0.5">
									<span className="font-medium">{b.ly_do}</span>
									<span className="text-muted-foreground text-xs">{b.ma}</span>
								</span>
							</TableCell>
							<TableCell translate="no">{b.loTen}</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<div className="md:hidden">
				<ItemGroup>
					{dong.map((b) => (
						<Item key={`${b.loTep}#${b.ma}`} variant="outline">
							<ItemContent>
								<ItemTitle translate="no">{b.ly_do}</ItemTitle>
								<ItemDescription translate="no">
									{b.ma} · {b.loTen}
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</div>
		</div>
	);
}
