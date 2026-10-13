import { Skeleton } from "@crm/ui/components/skeleton";
import { cn } from "@crm/ui/lib/utils";
import type * as React from "react";
import { PageLoadingStatus } from "./page-loading-status";
import { PageTransition } from "./page-transition";

const BE_RONG = {
	narrow: { className: "max-w-(--container-narrow)" },
	page: { className: "max-w-(--container-page)" },
	wide: { className: "max-w-(--container-page-wide)" },
	full: { className: "" },
} as const;

type BeRongTrang = keyof typeof BE_RONG;

function PageShell({
	className,
	contained = false,
	width,
	...props
}: React.ComponentProps<"div"> & {
	contained?: boolean;
	width?: BeRongTrang;
}) {
	return (
		<PageTransition>
			<main
				data-slot="page-shell-scroll"
				className={cn(
					"relative flex min-w-0 flex-1 flex-col px-4 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6",
					contained ? "min-h-0 overflow-hidden" : "overflow-y-auto",
				)}
			>
				<div
					data-slot="page-shell"
					className={cn(
						width
							? `flex w-full min-w-0 flex-1 flex-col gap-6 ${BE_RONG[width].className}`
							: "mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-6",
						className,
					)}
					{...props}
				/>
			</main>
		</PageTransition>
	);
}

function PageShellHeader({
	className,
	children,
	breadcrumb,
	...props
}: React.ComponentProps<"div"> & { breadcrumb?: React.ReactNode }) {
	return (
		<header
			data-slot="page-shell-header"
			className={cn(
				"flex flex-col gap-3 [view-transition-name:page-header]",
				className,
			)}
			{...props}
		>
			{breadcrumb}
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				{children}
			</div>
		</header>
	);
}

function PageShellHeading({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="page-shell-heading"
			className={cn("contents", className)}
			{...props}
		/>
	);
}

function PageShellTitle({ className, ...props }: React.ComponentProps<"h1">) {
	return (
		<h1
			data-slot="page-shell-title"
			className={cn(
				"min-w-0 flex-auto text-balance font-medium text-2xl tracking-tight md:text-3xl",
				className,
			)}
			{...props}
		/>
	);
}

function PageShellDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="page-shell-description"
			className={cn(
				"order-1 basis-full text-balance text-muted-foreground text-sm md:order-last",
				className,
			)}
			{...props}
		/>
	);
}

function PageShellNote({
	className,
	id,
	...props
}: React.ComponentProps<"p"> & { id: string }) {
	return (
		<p
			id={id}
			data-slot="page-shell-note"
			className={cn(
				"order-1 basis-full text-balance text-muted-foreground text-sm md:order-last",
				className,
			)}
			{...props}
		/>
	);
}

function PageShellActions({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="page-shell-actions"
			className={cn(
				"order-2 flex flex-wrap items-center gap-2 md:order-none",
				className,
			)}
			{...props}
		/>
	);
}

function PageShellContent({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="page-shell-content"
			className={cn(
				"@container/page-content flex flex-1 flex-col gap-6",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

function PageShellFallback() {
	return (
		<PageShell aria-busy="true">
			<div className="flex flex-col gap-6" aria-hidden="true">
				<div className="flex flex-col gap-3">
					<Skeleton className="h-8 w-48 max-w-full" />
					<Skeleton className="h-4 w-72 max-w-full" />
				</div>
				<div className="flex flex-col gap-3">
					<Skeleton className="h-14 w-full rounded-lg" />
					<Skeleton className="h-14 w-full rounded-lg" />
					<Skeleton className="h-40 w-full rounded-lg" />
				</div>
			</div>
			<PageLoadingStatus />
		</PageShell>
	);
}

export type { BeRongTrang };

export {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellFallback,
	PageShellHeader,
	PageShellHeading,
	PageShellNote,
	PageShellTitle,
};
