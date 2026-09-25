"use client";

import type * as React from "react";
import { Button } from "@crm/ui/components/button";
import { cn } from "@crm/ui/lib/utils";

const THUT = { 0: "", 1: "", 2: "ps-8" } as const;

const HUONG = {
	vertical: "w-full",
	horizontal: "w-auto shrink-0",
} as const;

function NavItem({
	active = false,
	level = 0,
	orientation = "vertical",
	className,
	children,
	...props
}: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & {
	active?: boolean;
	level?: 0 | 1 | 2;
	orientation?: keyof typeof HUONG;
}) {
	return (
		<Button
			data-slot="nav-item"
			variant={active ? "secondary" : "ghost"}
			size="sm"
			aria-current={active ? "page" : undefined}
			className={cn(
				"justify-start font-normal",
				HUONG[orientation],
				THUT[level],
				className,
			)}
			{...props}
		>
			{children}
		</Button>
	);
}

function NavGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="nav-group"
			role="group"
			className={cn("flex flex-col gap-0.5", className)}
			{...props}
		/>
	);
}

function NavGroupLabel({ className, ...props }: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="nav-group-label"
			className={cn(
				"px-3 pb-1 font-medium text-muted-foreground text-xs",
				className,
			)}
			{...props}
		/>
	);
}

export { NavGroup, NavGroupLabel, NavItem };
