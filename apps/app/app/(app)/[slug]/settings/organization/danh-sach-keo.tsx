"use client";

import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { useState } from "react";

export type MucKeo = { id: string; name: string; phu: string };

export function DanhSachKeo({
	muc,
	sua,
	dangGhi,
	ghi,
}: {
	muc: MucKeo[];
	sua: boolean;
	dangGhi: boolean;
	ghi: (moi: string[], id: string, xong: () => void) => void;
}) {
	const [tam, setTam] = useState<string[] | null>(null);
	const theoId = new Map(muc.map((x) => [x.id, x]));
	const ids = (tam ?? muc.map((x) => x.id)).filter((id) => theoId.has(id));
	const khoa = !sua || dangGhi;

	return (
		<div className="rounded-lg border">
			<SortableList
				ids={ids}
				onReorder={(moi) => {
					if (khoa) return;
					const id = [...moi].sort(
						(a, b) =>
							Math.abs(moi.indexOf(b) - ids.indexOf(b)) -
							Math.abs(moi.indexOf(a) - ids.indexOf(a)),
					)[0];
					if (id === undefined) return;
					setTam(moi);
					ghi(moi, id, () => setTam(null));
				}}
			>
				{ids.map((id) => {
					const x = theoId.get(id) as MucKeo;
					return (
						<SortableItem key={x.id} id={x.id} label={x.name} disabled={khoa}>
							<div
								className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2"
								data-muc-keo={x.id}
							>
								<span className="truncate text-sm" translate="no" data-ten>
									{x.name}
								</span>
								<span className="shrink-0 text-muted-foreground text-xs">
									{x.phu}
								</span>
							</div>
						</SortableItem>
					);
				})}
			</SortableList>
		</div>
	);
}
