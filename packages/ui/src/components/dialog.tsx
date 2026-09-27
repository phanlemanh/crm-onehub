"use client";

import { Button } from "@crm/ui/components/button";
import { cn } from "@crm/ui/lib/utils";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";
import {
	GiuContext,
	useGiuGoc,
	useGiuNoiDung,
} from "@crm/ui/components/giu-thay-doi";
import { useMessages } from "@crm/ui/components/locale-provider";

function Dialog({
	open,
	defaultOpen,
	onOpenChange,
	coThayDoi,
	giuThayDoi,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
	coThayDoi?: boolean;
	giuThayDoi?: boolean;
}) {
	const g = useGiuGoc({
		open,
		defaultOpen,
		onOpenChange,
		coThayDoi,
		giuThayDoi,
	});
	return (
		<GiuContext.Provider value={g.ngucCanh}>
			<DialogPrimitive.Root
				data-slot="dialog"
				open={g.open}
				onOpenChange={g.onOpenChange}
				{...props}
			>
				{children}
			</DialogPrimitive.Root>
			{g.hopHoi}
		</GiuContext.Provider>
	);
}

function DialogTrigger({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
	...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
	dongNgay,
	onClick,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
	dongNgay?: boolean;
}) {
	const g = useGiuNoiDung();
	return (
		<DialogPrimitive.Close
			data-slot="dialog-close"
			onClick={(e) => {
				onClick?.(e);
				if (dongNgay && !e.defaultPrevented) g?.boQuaLanToi();
			}}
			{...props}
		/>
	);
}

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				"fixed inset-0 isolate z-50 bg-overlay duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
				className,
			)}
			{...props}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
	size,
	onInputCapture,
	onFocusCapture,
	onInteractOutside,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
	size?: "default" | "wide" | "table";
}) {
	const msg = useMessages();
	const g = useGiuNoiDung();
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				data-size={size ?? "default"}
				className={cn(
					"fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg bg-popover p-4 text-xs/relaxed text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					size === "wide" && "sm:max-w-(--container-sheet)",
					size === "table" && "sm:max-w-(--container-page-wide)",
					className,
				)}
				onInputCapture={(e) => {
					g?.danhDau(e.target);
					onInputCapture?.(e);
				}}
				onFocusCapture={(e) => {
					g?.nhoO(e.target);
					onFocusCapture?.(e);
				}}
				onInteractOutside={(e) => {
					onInteractOutside?.(e);
					if (g?.coThayDoi) e.preventDefault();
				}}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close data-slot="dialog-close" asChild>
						<Button
							variant="ghost"
							className="absolute top-2 right-2"
							size="icon-sm"
						>
							<XIcon />
							<span className="sr-only">{msg.dialog.close}</span>
						</Button>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn("flex flex-col gap-1 text-left", className)}
			{...props}
		/>
	);
}

function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: React.ComponentProps<"div"> & {
	showCloseButton?: boolean;
}) {
	const msg = useMessages();
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close asChild>
					<Button variant="outline">{msg.dialog.close}</Button>
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogTitle({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn(
				"font-heading text-sm font-medium wrap-anywhere",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				"text-xs/relaxed text-muted-foreground wrap-anywhere *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
