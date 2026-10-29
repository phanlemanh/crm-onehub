"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useMessages } from "@crm/ui/components/locale-provider";
import { cn } from "@crm/ui/lib/utils";
import { Slot } from "radix-ui";
import type * as React from "react";

function Breadcrumb({
	className,
	"aria-label": nhan,
	...props
}: React.ComponentProps<"nav">) {
	const msg = useMessages();
	return (
		<nav
			aria-label={nhan ?? msg.breadcrumb.nhan}
			data-slot="breadcrumb"
			className={cn(className)}
			{...props}
		/>
	);
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
	return (
		<ol
			data-slot="breadcrumb-list"
			className={cn(
				"flex flex-wrap items-center gap-1.5 wrap-break-word text-muted-foreground text-sm",
				className,
			)}
			{...props}
		/>
	);
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="breadcrumb-item"
			className={cn("inline-flex items-center gap-1", className)}
			{...props}
		/>
	);
}

function BreadcrumbLink({
	asChild,
	className,
	...props
}: React.ComponentProps<"a"> & {
	asChild?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "a";

	return (
		<Comp
			data-slot="breadcrumb-link"
			className={cn("transition-colors hover:text-foreground", className)}
			{...props}
		/>
	);
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="breadcrumb-page"
			aria-current="page"
			className={cn("font-normal text-foreground", className)}
			{...props}
		/>
	);
}

function BreadcrumbSeparator({
	children,
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			data-slot="breadcrumb-separator"
			role="presentation"
			aria-hidden="true"
			className={cn("[&>svg]:size-3.5", className)}
			{...props}
		>
			{children ?? <Icon icon={ChevronRight} />}
		</li>
	);
}

function BreadcrumbEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="breadcrumb-ellipsis"
			role="presentation"
			aria-hidden="true"
			className={cn(
				"flex size-5 items-center justify-center [&>svg]:size-4",
				className,
			)}
			{...props}
		>
			<Icon icon={OverflowMenuHorizontal} />
		</span>
	);
}

function BreadcrumbMenu({
	label,
	children,
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuTrigger> & {
	label: React.ReactNode;
}) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				data-slot="breadcrumb-menu"
				className={cn(
					"inline-flex min-w-0 items-center gap-1 rounded-sm text-foreground outline-none transition-colors hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:text-foreground/80 [&>svg]:size-3.5 [&>svg]:shrink-0",
					className,
				)}
				{...props}
			>
				<span
					data-slot="breadcrumb-page"
					aria-current="page"
					className="wrap-anywhere text-start"
				>
					{label}
				</span>
				<Icon icon={ChevronDown} />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-72 max-w-[calc(100vw-2rem)]"
			>
				{children}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbMenu,
	BreadcrumbPage,
	BreadcrumbSeparator,
};
