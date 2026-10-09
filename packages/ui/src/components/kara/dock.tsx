"use client";

import { cn } from "@crm/ui/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export type KaraDockSide = "rail" | "fill";

const SIDE: Record<KaraDockSide, string> = {
	rail: "w-(--container-assist-rail) shrink-0 border-l",
	fill: "w-(--container-assist) min-w-0 shrink",
};

export type KaraDockProps = Omit<ComponentProps<"section">, "className"> & {
	side: KaraDockSide;
	alone?: boolean;
};

export function KaraDock({ side, alone = false, ...props }: KaraDockProps) {
	return (
		<section
			data-slot="kara-dock"
			data-side={side}
			className={cn(
				"flex min-h-0 flex-col",
				alone ? "min-w-0 flex-1" : SIDE[side],
			)}
			{...props}
		/>
	);
}

export function KaraDockHeader({ children }: { children: ReactNode }) {
	return (
		<div
			data-slot="kara-dock-header"
			className="flex h-11 shrink-0 items-center justify-between gap-3 border-b px-4"
		>
			{children}
		</div>
	);
}

export function KaraDockBody({ children }: { children: ReactNode }) {
	return (
		<div
			data-slot="kara-dock-body"
			className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
		>
			{children}
		</div>
	);
}

export function KaraDockFooter({
	children,
	divided = false,
}: {
	children: ReactNode;
	divided?: boolean;
}) {
	return (
		<div
			data-slot="kara-dock-footer"
			className={cn("shrink-0 px-4", divided ? "border-t py-3" : "pb-4")}
		>
			{children}
		</div>
	);
}
