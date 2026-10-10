"use client";

import { Item, ItemContent, ItemTitle } from "@crm/ui/components/item";
import { ChamTrangThai } from "./o-trang-thai";
import type { Viec } from "./viec";

export function DongLienQuan({
	x,
	moViec,
}: {
	x: Viec;
	moViec: (khoa: string) => void;
}) {
	return (
		<Item asChild size="xs" variant="outline">
			<button
				className="text-start"
				data-viec-khoa={x.khoa}
				onClick={() => moViec(x.khoa)}
				type="button"
			>
				<ItemContent>
					<ItemTitle translate="no">{x.cau_giao}</ItemTitle>
				</ItemContent>
				<ChamTrangThai v={x} />
			</button>
		</Item>
	);
}
