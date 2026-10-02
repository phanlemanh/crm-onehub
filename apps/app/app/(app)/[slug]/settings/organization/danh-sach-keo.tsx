"use client";

import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { useState } from "react";
import { MenuDong, type MucMenu } from "./chi-tiet-chung";

export type MucKeo = { id: string; name: string; moTa: string; phu: string };

export function DanhSachKeo({
	loai,
	muc,
	menu,
	sua,
	dangGhi,
	ghi,
}: {
	loai: "bo-phan" | "phong-ban";
	muc: MucKeo[];
	menu: (x: MucKeo) => MucMenu[];
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
								className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2 pe-2"
								data-muc-keo={x.id}
								data-phong-ban={loai === "phong-ban" ? x.id : undefined}
							>
								<span className="truncate text-sm" translate="no" data-ten>
									{x.name}
								</span>
								<span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
									{x.phu}
									<MenuDong ten={x.name} sua={sua} muc={menu(x)} />
								</span>
							</div>
						</SortableItem>
					);
				})}
			</SortableList>
		</div>
	);
}
