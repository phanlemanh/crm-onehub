"use client";

import type * as React from "react";
import { cn } from "@crm/ui/lib/utils";

function StatTile({
	label,
	value,
	action,
	pressed = false,
	className,
	...props
}: Omit<React.ComponentProps<"button">, "children"> & {
	label: React.ReactNode;
	value: React.ReactNode;
	action?: React.ReactNode;
	pressed?: boolean;
}) {
	return (
		<button
			type="button"
			data-slot="stat-tile"
			aria-pressed={pressed}
			className={cn(
				"flex w-full items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-start outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-muted",
				className,
			)}
			{...props}
		>
			<span className="flex min-w-0 flex-col gap-1">
				<span className="text-muted-foreground text-xs">{label}</span>
				<span className="font-medium text-lg tabular-nums">{value}</span>
			</span>
			{action ? <span className="shrink-0 text-xs">{action}</span> : null}
		</button>
	);
}

export { StatTile };
