"use client";

import {
	type SortableChange,
	SortableSaveList,
} from "@crm/ui/components/sortable-list";
import { MenuDong, type MucMenu } from "./chi-tiet-chung";

export type MucKeo = { id: string; name: string; moTa: string; phu: string };

export function DanhSachKeo({
	loai,
	muc,
	menu,
	sua,
	ghi,
}: {
	loai: "bo-phan" | "phong-ban";
	muc: MucKeo[];
	menu: (x: MucKeo) => MucMenu[];
	sua: boolean;
	ghi: (change: SortableChange) => Promise<unknown>;
}) {
	const theoId = new Map(muc.map((x) => [x.id, x]));

	return (
		<SortableSaveList
			ids={muc.map((x) => x.id)}
			label={(id) => theoId.get(id)?.name ?? id}
			disabled={!sua}
			onSave={ghi}
		>
			{(id, locked) => {
				const x = theoId.get(id);
				if (!x) return null;
				return (
					<div
						className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2 pe-2"
						data-muc-keo={x.id}
						data-phong-ban={loai === "phong-ban" ? x.id : undefined}
					>
						<span className="truncate text-sm" translate="no" data-ten>
							{x.name}
						</span>
						<span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
							{x.phu}
							<MenuDong ten={x.name} sua={sua && !locked} muc={menu(x)} />
						</span>
					</div>
				);
			}}
		</SortableSaveList>
	);
}
