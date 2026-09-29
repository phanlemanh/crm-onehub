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

function SaveBar({
	children,
	className,
	description,
	items,
	open,
	title,
	...props
}: React.ComponentProps<"div"> & {
	description?: React.ReactNode;
	items?: SaveBarItem[];
	open: boolean;
	title: React.ReactNode;
}) {
	const viewport = React.useContext(SaveBarViewportContext);
	const msg = useMessages();
	const idDanhSach = React.useId();
	const [moDanhSach, setMoDanhSach] = React.useState(false);

	const bar = (
		<div
			aria-hidden={!open}
			className={cn(
				"pointer-events-auto flex w-full max-w-(--container-2xl) gap-4 rounded-lg border bg-popover px-4 py-3 text-popover-foreground shadow-lg transition-[opacity,transform,display] transition-discrete duration-200 ease-out",
				open
					? "translate-y-0 opacity-100 starting:translate-y-[calc(100%+1.25rem)] starting:opacity-0"
					: "pointer-events-none hidden translate-y-[calc(100%+1.25rem)] opacity-0",
				items ? "items-start" : "items-center",
				className,
			)}
			data-slot="save-bar"
			data-state={open ? "open" : "closed"}
			inert={open ? undefined : true}
			role={items ? "status" : undefined}
			{...props}
		>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-sm">{title}</p>
				{description ? (
					<p className="truncate text-muted-foreground text-xs">{description}</p>
				) : null}
				{items ? (
					<ul
						className={cn(
							"mt-1 flex-col items-start",
							moDanhSach ? "flex" : "hidden md:flex",
						)}
						data-mo={moDanhSach}
						id={idDanhSach}
					>
						{items.map((item) => (
							<li key={item.id}>
								<Button asChild size="xs-wrap" variant="link">
									<a href={item.href}>{item.label}</a>
								</Button>
							</li>
						))}
					</ul>
				) : null}
			</div>

			<div className="flex shrink-0 items-center gap-2">
				{items ? (
					<Button
						aria-controls={idDanhSach}
						aria-expanded={moDanhSach}
						className="md:hidden"
						onClick={() => setMoDanhSach((mo) => !mo)}
						size="xs"
						type="button"
						variant="ghost"
					>
						{moDanhSach ? msg.saveBar.anDanhSach : msg.saveBar.hienDanhSach}
					</Button>
				) : null}
				{children}
			</div>
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
