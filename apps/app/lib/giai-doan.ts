"use client";

import type { StatusTone } from "@crm/ui/components/status-indicator";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export type LoaiGiaiDoanHien = "OPEN" | "WON" | "LOST";

export type GiaiDoanHien = {
	id: string;
	label: string;
	kind: LoaiGiaiDoanHien;
	position: number;
	dealCount: number;
};

const MAU_MO = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
] as const;

const MAU_DONG = "var(--chart-5)";

export const NGHIA_GIAI_DOAN = {
	OPEN: "dangChay",
	WON: "xong",
	LOST: "hong",
} as const satisfies Record<LoaiGiaiDoanHien, NghiaTrangThai>;

export function mauGiaiDoan(
	giaiDoan: GiaiDoanHien | undefined,
	open: readonly GiaiDoanHien[],
): string {
	if (giaiDoan?.kind !== "OPEN") return MAU_DONG;
	const i = open.findIndex((g) => g.id === giaiDoan.id);
	return MAU_MO[i % MAU_MO.length] ?? MAU_DONG;
}

export function toneGiaiDoan(giaiDoan: GiaiDoanHien | undefined): StatusTone {
	return toneTheoNghia(giaiDoan ? NGHIA_GIAI_DOAN[giaiDoan.kind] : "nhap");
}

export function useGiaiDoan() {
	const trpc = useTRPC();
	const query = useQuery(trpc.giaiDoan.list.queryOptions());
	const stages = (query.data?.stages ?? []) as GiaiDoanHien[];
	const theoId = new Map(stages.map((g) => [g.id, g]));
	const open = stages.filter((g) => g.kind === "OPEN");

	return {
		stages,
		open,
		theoId,
		canManage: query.data?.canManage ?? false,
		tran: query.data?.tran ?? 0,
		dangTai: query.isPending,
		loi: query.isError,
		thuLai: () => void query.refetch(),
		label: (id: string) => theoId.get(id)?.label ?? id,
		laThua: (id: string) => theoId.get(id)?.kind === "LOST",
		laDaDong: (id: string) => {
			const kind = theoId.get(id)?.kind;
			return kind !== undefined && kind !== "OPEN";
		},
		mau: (id: string) => mauGiaiDoan(theoId.get(id), open),
		tone: (id: string) => toneGiaiDoan(theoId.get(id)),
	};
}
