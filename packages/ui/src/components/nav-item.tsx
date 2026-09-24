"use client";

import type * as React from "react";
import { Button } from "@crm/ui/components/button";
import { cn } from "@crm/ui/lib/utils";

const THUT = { 0: "", 1: "", 2: "ps-8" } as const;

function NavItem({
	active = false,
	level = 0,
	className,
	children,
	...props
}: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & {
	active?: boolean;
	level?: 0 | 1 | 2;
}) {
	return (
		<Button
			data-slot="nav-item"
			variant={active ? "secondary" : "ghost"}
			size="sm"
			aria-current={active ? "page" : undefined}
			className={cn("w-full justify-start font-normal", THUT[level], className)}
			{...props}
		>
			{children}
		</Button>
	);
}

export { NavItem };
