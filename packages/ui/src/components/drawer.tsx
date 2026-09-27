"use client";

import { cn } from "@crm/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import {
	GiuContext,
	useGiuGoc,
	useGiuNoiDung,
} from "@crm/ui/components/giu-thay-doi";

const drawerTitleVariants = cva("font-heading font-medium text-foreground", {
	variants: {
		size: {
			default: "text-sm",
			lg: "text-lg leading-tight tracking-tight",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

const ThaKeoContext = React.createContext<((tiLe: number) => void) | null>(
	null,
);

function Drawer({
	open,
	defaultOpen,
	onOpenChange,
	coThayDoi,
	giuThayDoi,
	dismissible,
	onDrag,
	onRelease,
	closeThreshold,
	children,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
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
	const keoXa = React.useRef(0);
	const nguong = closeThreshold ?? 0.25;
	const thaKeo = (tiLe: number) => {
		if (g.coThayDoi && tiLe >= nguong) g.ngucCanh.hoiLai();
	};
	return (
		<GiuContext.Provider value={g.ngucCanh}>
			<ThaKeoContext.Provider value={thaKeo}>
				<DrawerPrimitive.Root
					data-slot="drawer"
					open={g.open}
					onOpenChange={g.onOpenChange}
					dismissible={g.coThayDoi ? false : dismissible}
					closeThreshold={closeThreshold}
					onDrag={(e, tiLe) => {
						keoXa.current = Math.max(keoXa.current, tiLe);
						onDrag?.(e, tiLe);
					}}
					onRelease={(e, conMo) => {
						thaKeo(keoXa.current);
						keoXa.current = 0;
						onRelease?.(e, conMo);
					}}
					{...props}
				>
					{children}
				</DrawerPrimitive.Root>
			</ThaKeoContext.Provider>
			{g.hopHoi}
		</GiuContext.Provider>
	);
}

function DrawerTrigger({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
	dongNgay,
	onClick,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Close> & {
	dongNgay?: boolean;
}) {
	const g = useGiuNoiDung();
	return (
		<DrawerPrimitive.Close
			data-slot="drawer-close"
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented || !g?.coThayDoi) return;
				if (dongNgay) g.dong();
				else g.hoiLai();
			}}
			{...props}
		/>
	);
}

function DrawerOverlay({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
	return (
		<DrawerPrimitive.Overlay
			data-slot="drawer-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-overlay supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
				className,
			)}
			{...props}
		/>
	);
}

function laChoKeo(target: EventTarget | null): target is HTMLElement {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return false;
	return target.closest("input, textarea, select, [data-vaul-no-drag]") === null;
}

function tiLeKeo(noi: HTMLElement, dx: number, dy: number): number {
	const khung = noi.getBoundingClientRect();
	const huong = noi.getAttribute("data-vaul-drawer-direction");
	if (huong === "top") return -dy / khung.height;
	if (huong === "left") return -dx / khung.width;
	if (huong === "right") return dx / khung.width;
	return dy / khung.height;
}

function DrawerContent({
	className,
	children,
	onInputCapture,
	onFocusCapture,
	onEscapeKeyDown,
	onPointerDown,
	onPointerUp,
	onPointerCancel,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
	const g = useGiuNoiDung();
	const thaKeo = React.useContext(ThaKeoContext);
	const diemDau = React.useRef<{ x: number; y: number } | null>(null);
	return (
		<DrawerPortal data-slot="drawer-portal">
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot="drawer-content"
				onInputCapture={(e) => {
					g?.danhDau(e.target, e.currentTarget);
					onInputCapture?.(e);
				}}
				onFocusCapture={(e) => {
					g?.nhoO(e.target, e.currentTarget);
					onFocusCapture?.(e);
				}}
				onEscapeKeyDown={(e) => {
					onEscapeKeyDown?.(e);
					if (g?.coThayDoi) {
						e.preventDefault();
						g.hoiLai();
					}
				}}
				onPointerDown={(e) => {
					onPointerDown?.(e);
					diemDau.current = null;
					if (!g?.coThayDoi || !laChoKeo(e.target)) return;
					e.target.setPointerCapture(e.pointerId);
					diemDau.current = { x: e.pageX, y: e.pageY };
				}}
				onPointerUp={(e) => {
					onPointerUp?.(e);
					const dau = diemDau.current;
					diemDau.current = null;
					if (!dau || window.getSelection()?.toString()) return;
					const dx = e.pageX - dau.x;
					const dy = e.pageY - dau.y;
					thaKeo?.(tiLeKeo(e.currentTarget, dx, dy));
				}}
				onPointerCancel={(e) => {
					onPointerCancel?.(e);
					diemDau.current = null;
				}}
				className={cn(
					"group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-xs/relaxed text-popover-foreground data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-none data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-none data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-none data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm",
					className,
				)}
				{...props}
			>
				<div className="mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-none bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn(
				"flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left",
				className,
			)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-footer"
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			{...props}
		/>
	);
}

function DrawerTitle({
	className,
	size,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Title> &
	VariantProps<typeof drawerTitleVariants>) {
	return (
		<DrawerPrimitive.Title
			data-slot="drawer-title"
			className={cn(drawerTitleVariants({ size }), className)}
			{...props}
		/>
	);
}

function DrawerDescription({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			className={cn("text-xs/relaxed text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerPortal,
	DrawerTitle,
	DrawerTrigger,
};
