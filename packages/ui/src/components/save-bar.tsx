"use client";

import { Button } from "@crm/ui/components/button";
import { useMessages } from "@crm/ui/components/locale-provider";
import { cn } from "@crm/ui/lib/utils";
import * as React from "react";
import { createPortal } from "react-dom";

export type SaveBarItem = { id: string; label: React.ReactNode; href: string };

const SaveBarViewportContext = React.createContext<HTMLDivElement | null>(null);

function SaveBarViewport({ children }: { children: React.ReactNode }) {
	const [node, setNode] = React.useState<HTMLDivElement | null>(null);

	return (
		<SaveBarViewportContext.Provider value={node}>
			{children}
			<div
				className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-5"
				data-slot="save-bar-viewport"
				ref={setNode}
			/>
		</SaveBarViewportContext.Provider>
	);
}

type SaveBarLayout = "inline" | "checklist";

function SaveBarList({
	id,
	items,
	layout,
	open,
}: {
	id: string;
	items: SaveBarItem[];
	layout: SaveBarLayout;
	open: boolean;
}) {
	const msg = useMessages();
	const ref = React.useRef<HTMLUListElement>(null);
	const [overflows, setOverflows] = React.useState(false);

	React.useLayoutEffect(() => {
		const el = ref.current;
		if (!el || layout !== "checklist") return;
		const measure = () =>
			setOverflows(open && el.scrollHeight > el.clientHeight + 1);
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [items, layout, open]);

	return (
		<>
			<ul
				className={cn(
					"flex-col items-start",
					layout === "inline"
						? cn("mt-1", open ? "flex" : "hidden md:flex")
						: cn(
								"max-h-24 w-full overflow-y-auto overscroll-contain md:max-h-40",
								open ? "flex" : "hidden",
								overflows &&
									"mask-b-from-80% border-b",
							),
				)}
				data-mo={open}
				data-tran={overflows || undefined}
				id={id}
				ref={ref}
			>
				{items.map((item) => (
					<li key={item.id}>
						<Button asChild size="xs-wrap" variant="link">
							<a href={item.href}>{item.label}</a>
						</Button>
					</li>
				))}
			</ul>
			{overflows ? (
				<p className="text-muted-foreground text-xs" data-slot="save-bar-scroll-hint">
					{msg.saveBar.cuonThem}
				</p>
			) : null}
		</>
	);
}

function SaveBar({
	children,
	className,
	defaultOpen = false,
	description,
	items,
	layout = "inline",
	open,
	title,
	...props
}: React.ComponentProps<"div"> & {
	defaultOpen?: boolean;
	description?: React.ReactNode;
	items?: SaveBarItem[];
	layout?: SaveBarLayout;
	open: boolean;
	title: React.ReactNode;
}) {
	const viewport = React.useContext(SaveBarViewportContext);
	const msg = useMessages();
	const idDanhSach = React.useId();
	const [moDanhSach, setMoDanhSach] = React.useState(defaultOpen);
	const checklist = layout === "checklist";

	const toggle = items ? (
		<Button
			aria-controls={idDanhSach}
			aria-expanded={moDanhSach}
			className={checklist ? undefined : "md:hidden"}
			onClick={() => setMoDanhSach((mo) => !mo)}
			size="xs"
			type="button"
			variant="ghost"
		>
			{moDanhSach ? msg.saveBar.anDanhSach : msg.saveBar.hienDanhSach}
		</Button>
	) : null;

	const heading = (
		<>
			<p className={cn("font-medium text-sm", checklist ? "text-pretty" : "truncate")}>
				{title}
			</p>
			{description ? (
				<p className="truncate text-muted-foreground text-xs">{description}</p>
			) : null}
		</>
	);

	const bar = (
		<div
			aria-hidden={!open}
			className={cn(
				"pointer-events-auto flex w-full max-w-(--container-2xl) gap-4 rounded-lg border bg-popover px-4 py-3 text-popover-foreground shadow-lg transition-[opacity,transform,display] transition-discrete duration-200 ease-out",
				open
					? "translate-y-0 opacity-100 starting:translate-y-[calc(100%+1.25rem)] starting:opacity-0"
					: "pointer-events-none hidden translate-y-[calc(100%+1.25rem)] opacity-0",
				checklist ? "flex-col gap-2" : items ? "items-start" : "items-center",
				className,
			)}
			data-layout={layout}
			data-slot="save-bar"
			data-state={open ? "open" : "closed"}
			inert={open ? undefined : true}
			role={items ? "status" : undefined}
			{...props}
		>
			{checklist ? (
				<>
					<div className="flex items-start gap-4">
						<div className="min-w-0 flex-1">{heading}</div>
						<div className="flex shrink-0 items-center gap-2">
							{toggle}
							{children}
						</div>
					</div>
					{items ? (
						<SaveBarList
							id={idDanhSach}
							items={items}
							layout={layout}
							open={moDanhSach}
						/>
					) : null}
				</>
			) : (
				<>
					<div className="min-w-0 flex-1">
						{heading}
						{items ? (
							<SaveBarList
								id={idDanhSach}
								items={items}
								layout={layout}
								open={moDanhSach}
							/>
						) : null}
					</div>
					<div className="flex shrink-0 items-center gap-2">
						{toggle}
						{children}
					</div>
				</>
			)}
		</div>
	);

	if (viewport) return createPortal(bar, viewport);

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-5">
			{bar}
		</div>
	);
}

export { SaveBar, SaveBarViewport };
