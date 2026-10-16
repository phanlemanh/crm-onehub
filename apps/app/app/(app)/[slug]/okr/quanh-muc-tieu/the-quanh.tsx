"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import { cn } from "@crm/ui/lib/utils";
import type { KeyboardEvent } from "react";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrQuanhMessages } from "@/lib/messages/okr-quanh";
import type { RouterOutputs } from "@/lib/trpc/types";

export type QuanhMucTieu = RouterOutputs["okr"]["quanhMucTieu"];
export type NutQuanh = QuanhMucTieu["nut"][number];

export function useMoNut(): (nut: NutQuanh) => void {
	const openRecord = useOpenRecord();
	return (nut) =>
		openRecord({ kind: nut.loai === "kr" ? "kr" : "objective", id: nut.id });
}

export function TheQuanh({
	nut,
	laTam,
	bien,
}: {
	nut: NutQuanh;
	laTam: boolean;
	bien: "khung" | "dong";
}) {
	const m = okrQuanhMessages(useLocale());
	const mo = useMoNut();
	const phim = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key !== "Enter" && e.key !== " ") return;
		e.preventDefault();
		mo(nut);
	};
	const tienDo = Math.round(nut.tienDo);

	return (
		<button
			aria-current={laTam || undefined}
			className={cn(
				"flex min-w-0 flex-col items-start gap-1.5 rounded-lg border bg-card p-3 text-start text-card-foreground text-sm outline-none transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring",
				bien === "khung" && "size-full",
				laTam && "border-ring ring-2 ring-ring/40",
			)}
			data-active={laTam || undefined}
			data-loai={nut.loai}
			data-quanh-the={nut.id}
			onClick={() => mo(nut)}
			onKeyDown={phim}
			type="button"
		>
			<span className="flex w-full min-w-0 items-center gap-2">
				{nut.congTy ? (
					<Badge data-cong-ty variant="secondary">
						{m.congTy}
					</Badge>
				) : null}
			</span>
			<span
				className={cn(
					"line-clamp-2 min-w-0",
					nut.loai === "muc-tieu" && "font-medium",
				)}
				data-ten
				title={nut.tieuDe}
				translate="no"
			>
				{nut.tieuDe}
			</span>
			{nut.loai === "muc-tieu" ? (
				<span
					className="w-full truncate text-muted-foreground text-xs"
					translate="no"
				>
					{nut.donVi}
				</span>
			) : null}
			<span className="flex w-full items-center gap-2">
				<Progress className="h-1.5 flex-1" value={tienDo} />
				<span className="text-muted-foreground text-xs tabular-nums">
					{m.tienDo(tienDo)}
				</span>
			</span>
		</button>
	);
}
