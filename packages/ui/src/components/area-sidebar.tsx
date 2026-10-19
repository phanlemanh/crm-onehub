"use client";

import type * as React from "react";
import { createContext, useContext, useId } from "react";
import {
	NavGroup,
	NavGroupLabel,
	NavItem,
	NavStrip,
} from "@crm/ui/components/nav-item";

type AreaSidebarOrientation = "vertical" | "horizontal";

const OrientationContext =
	createContext<AreaSidebarOrientation>("vertical");

function useAreaSidebarOrientation(): AreaSidebarOrientation {
	return useContext(OrientationContext);
}

type AreaSidebarProps = {
	label: string;
	header?: React.ReactNode;
	footer?: React.ReactNode;
	busy?: boolean;
	placement?: "area" | "panel";
	children: React.ReactNode;
};

const KHUNG = {
	area: "hidden w-56 shrink-0 flex-col border-r md:flex [view-transition-name:area-sidebar]",
	panel: "flex min-h-0 min-w-0 flex-1 flex-col",
} as const;

function AreaSidebar({
	label,
	header,
	footer,
	busy,
	placement = "area",
	children,
}: AreaSidebarProps) {
	const doc = (
		<aside data-slot="area-sidebar" className={KHUNG[placement]}>
			{header ? (
				<div
					data-slot="area-sidebar-header"
					className="flex flex-col gap-2 px-3 pt-3"
				>
					{header}
				</div>
			) : null}
			<nav
				aria-label={label}
				aria-busy={busy || undefined}
				className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3"
			>
				<OrientationContext.Provider value="vertical">
					{children}
				</OrientationContext.Provider>
			</nav>
			{footer ? (
				<div data-slot="area-sidebar-footer" className="border-t p-3">
					{footer}
				</div>
			) : null}
		</aside>
	);

	if (placement === "panel") return doc;

	return (
		<>
			{doc}
			<div
				data-slot="area-sidebar-strip"
				className="flex flex-col md:hidden [view-transition-name:area-sidebar]"
			>
				{header ? (
					<div
						data-slot="area-sidebar-header"
						className="flex flex-col gap-2 border-b p-2"
					>
						{header}
					</div>
				) : null}
				<NavStrip aria-label={label} aria-busy={busy || undefined}>
					<OrientationContext.Provider value="horizontal">
						{children}
					</OrientationContext.Provider>
				</NavStrip>
			</div>
		</>
	);
}

function AreaSidebarGroup({
	label,
	children,
}: {
	label?: React.ReactNode;
	children: React.ReactNode;
}) {
	const id = useId();
	const huong = useAreaSidebarOrientation();

	if (huong === "horizontal") return <>{children}</>;

	return (
		<NavGroup aria-labelledby={label ? id : undefined}>
			{label ? <NavGroupLabel id={id}>{label}</NavGroupLabel> : null}
			{children}
		</NavGroup>
	);
}

function AreaSidebarItem(
	props: Omit<React.ComponentProps<typeof NavItem>, "orientation">,
) {
	return <NavItem orientation={useAreaSidebarOrientation()} {...props} />;
}

export {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
	type AreaSidebarOrientation,
	useAreaSidebarOrientation,
};
