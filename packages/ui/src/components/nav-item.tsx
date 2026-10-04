"use client";

import type * as React from "react";
import { useLayoutEffect, useRef } from "react";
import { Button } from "@crm/ui/components/button";
import { cn } from "@crm/ui/lib/utils";

const THUT = { 0: "", 1: "", 2: "ps-8" } as const;

const HUONG = {
	vertical: "w-full",
	horizontal: "w-auto",
} as const;

function NavItem({
	active = false,
	level = 0,
	orientation = "vertical",
	size = "sm",
	className,
	children,
	...props
}: Omit<React.ComponentProps<typeof Button>, "variant" | "size"> & {
	active?: boolean;
	level?: 0 | 1 | 2;
	orientation?: keyof typeof HUONG;
	size?: "sm" | "icon";
}) {
	return (
		<Button
			data-slot="nav-item"
			variant={active ? "secondary" : "ghost"}
			size={size}
			aria-current={active ? "page" : undefined}
			className={cn(
				size === "icon"
					? null
					: ["justify-start font-normal", HUONG[orientation], THUT[level]],
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
				"px-3 pb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider",
				className,
			)}
			{...props}
		/>
	);
}

function NavStrip({ className, ...props }: React.ComponentProps<"nav">) {
	const khung = useRef<HTMLElement>(null);
	const daCanh = useRef<Element | null>(null);

	useLayoutEffect(() => {
		const k = khung.current;
		const the = k?.querySelector("[aria-current='page']") ?? null;
		if (!k || !the || the === daCanh.current) return;
		const hop = k.getBoundingClientRect();
		if (hop.width === 0) return;
		daCanh.current = the;
		const o = the.getBoundingClientRect();
		if (o.left >= hop.left && o.right <= hop.right) return;
		k.scrollLeft += o.left - hop.left - (hop.width - o.width) / 2;
	});

	return (
		<nav
			ref={khung}
			data-slot="nav-strip"
			className={cn("flex gap-1 overflow-x-auto border-b p-2", className)}
			{...props}
		/>
	);
}

export { NavGroup, NavGroupLabel, NavItem, NavStrip };
