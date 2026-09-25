"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { TreeNav, type TreeNavNode } from "@crm/ui/components/tree-nav";
import { useState } from "react";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import type { RouterOutputs } from "@/lib/trpc/types";
import { NhanTinhTrang, ThanhTienDo } from "./tien-do-kr";

export type NutDayDu = RouterOutputs["okr"]["cayCanChinh"]["roots"][number];

type DuLieuNut = { loai: "nut"; nut: NutDayDu } | { loai: "nhom" };

const NHOM_CHUA = "chua-can-chinh";

function dung(ds: NutDayDu[], cha: string): TreeNavNode<DuLieuNut>[] {
	return ds.map((nut, i) => {
		const id = `${cha}/${nut.id}-${i}`;
		return {
			id,
			name: nut.title,
			data: { loai: "nut", nut },
			children: dung(nut.children, id),
		};
	});
}

function moHet(ds: TreeNavNode<DuLieuNut>[]): string[] {
	return ds.flatMap((n) =>
		(n.children?.length ?? 0) > 0 ? [n.id, ...moHet(n.children ?? [])] : [],
	);
}

function NhanNut({ nut }: { nut: NutDayDu }) {
	const m = okrMessages(useLocale());
	const mt = okrToanCanhMessages(useLocale());
	const laKr = nut.loai === "kr";
	return (
		<span
			className="flex w-full min-w-0 items-start gap-4 py-0.5"
			data-nut-can-chinh={nut.id}
		>
			<span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
				<span
					className={
						laKr || nut.lapLai
							? "whitespace-normal text-muted-foreground"
							: "whitespace-normal font-medium"
					}
					translate="no"
				>
					{laKr ? `${m.cot.kr} · ${nut.title}` : nut.title}
				</span>
				{laKr ? null : (
					<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
						<span translate="no">{nut.unitName}</span>
						{nut.gop > 1 ? (
							<Badge variant="outline">{m.gopVao(nut.gop)}</Badge>
						) : null}
						{nut.lapLai ? <span>{mt.cay.cungHien}</span> : null}
					</span>
				)}
			</span>
			<span className="hidden w-48 shrink-0 flex-col gap-1 sm:flex">
				<span className="flex items-center gap-2">
					<ThanhTienDo
						expected={nut.expected}
						progress={nut.progress}
						ten={nut.title}
					/>
					<span className="w-9 shrink-0 text-right text-xs tabular-nums">
						{nut.progress}%
					</span>
				</span>
				{laKr ? null : (
					<NhanTinhTrang
						expected={nut.expected}
						kind={nut.kind}
						progress={nut.progress}
					/>
				)}
			</span>
		</span>
	);
}

export function CayCanChinh({
	roots,
	chuaCanChinh,
}: {
	roots: NutDayDu[];
	chuaCanChinh: NutDayDu[];
}) {
	const mt = okrToanCanhMessages(useLocale());
	const openRecord = useOpenRecord();
	const nodes: TreeNavNode<DuLieuNut>[] = [
		...dung(roots, "goc"),
		...(chuaCanChinh.length > 0
			? [
					{
						id: NHOM_CHUA,
						name: mt.cay.chuaCanChinh,
						data: { loai: "nhom" } as const,
						children: dung(chuaCanChinh, NHOM_CHUA),
					},
				]
			: []),
	];
	const [mo, setMo] = useState<string[]>(() => moHet(nodes));
	const theoKhoa = new Map<string, NutDayDu>();
	const ghi = (ds: TreeNavNode<DuLieuNut>[]) => {
		for (const n of ds) {
			if (n.data.loai === "nut") theoKhoa.set(n.id, n.data.nut);
			ghi(n.children ?? []);
		}
	};
	ghi(nodes);

	return (
		<TreeNav
			className="rounded-lg border p-2"
			expanded={mo}
			itemAttrs={(n) => ({
				"data-cay-khoa": n.id,
				"data-cap-nut": n.data.loai === "nut" ? n.data.nut.loai : "nhom",
			})}
			label={mt.cay.canChinh}
			nodes={nodes}
			onExpandedChange={setMo}
			onSelect={(khoa) => {
				const nut = theoKhoa.get(khoa);
				if (nut) openRecord({ kind: "objective", id: nut.objectiveId });
			}}
			renderLabel={(n) =>
				n.data.loai === "nut" ? (
					<NhanNut nut={n.data.nut} />
				) : (
					<span className="text-muted-foreground text-xs">{n.name}</span>
				)
			}
		/>
	);
}
