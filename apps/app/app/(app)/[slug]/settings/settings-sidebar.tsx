"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { cn } from "@crm/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
	GOC_CAI_DAT,
	MUC_CAI_DAT,
	type MucCaiDat,
	mucCaiDatDangMo,
} from "@/lib/cai-dat-dieu-huong";
import { settingsMessages } from "@/lib/messages/settings";
import { mucCaiDatChoVai } from "@/lib/pham-vi-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

function NavLink({
	item,
	nhan,
	active,
	className,
}: {
	item: MucCaiDat;
	nhan: string;
	active: boolean;
	className: string;
}) {
	return (
		<Button
			asChild
			variant="ghost"
			className={cn(
				"justify-start font-normal text-muted-foreground",
				active &&
					"bg-muted text-foreground hover:bg-muted hover:text-foreground",
				className,
			)}
		>
			<Link
				href={item.href}
				prefetch
				aria-current={active ? "page" : undefined}
				transitionTypes={["nav-lateral"]}
			>
				{nhan}
			</Link>
		</Button>
	);
}

export function SettingsSidebarFallback() {
	const t = settingsMessages(useLocale());

	return (
		<>
			<aside className="hidden w-56 shrink-0 border-r md:block [view-transition-name:settings-sidebar]">
				<nav
					aria-label={t.thanhBen.nhan}
					aria-busy="true"
					className="flex flex-col gap-0.5 p-3"
				>
					{MUC_CAI_DAT.map((item) => (
						<Button
							key={item.href}
							variant="ghost"
							disabled
							className="w-full justify-start px-3 font-normal text-muted-foreground"
						>
							{t.thanhBen[item.khoa]}
						</Button>
					))}
				</nav>
			</aside>

			<nav
				aria-label={t.thanhBen.nhan}
				aria-busy="true"
				className="flex gap-1 overflow-x-auto border-b p-2 md:hidden [view-transition-name:settings-sidebar]"
			>
				{MUC_CAI_DAT.map((item) => (
					<Button
						key={item.href}
						variant="ghost"
						disabled
						className="shrink-0 justify-start px-3 font-normal text-muted-foreground"
					>
						{t.thanhBen[item.khoa]}
					</Button>
				))}
			</nav>
		</>
	);
}

export function SettingsSidebar() {
	const t = settingsMessages(useLocale());
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();
	const trpc = useTRPC();
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const viewerRole = workspace.data?.viewerRole ?? null;
	const daBiet = workspace.data !== undefined;

	const root = workspaceUrl(GOC_CAI_DAT);
	const items = useMemo(
		() =>
			mucCaiDatChoVai(viewerRole).map((item) => ({
				...item,
				href: workspaceUrl(item.href),
			})),
		[workspaceUrl, viewerRole],
	);

	if (!daBiet) return <SettingsSidebarFallback />;

	return (
		<>
			<aside className="hidden w-56 shrink-0 border-r md:block [view-transition-name:settings-sidebar]">
				<nav aria-label={t.thanhBen.nhan} className="flex flex-col gap-0.5 p-3">
					{items.map((item) => (
						<NavLink
							key={item.href}
							item={item}
							nhan={t.thanhBen[item.khoa]}
							active={mucCaiDatDangMo(item.href, root, pathname)}
							className="w-full px-3"
						/>
					))}
				</nav>
			</aside>

			<nav
				aria-label={t.thanhBen.nhan}
				className="flex gap-1 overflow-x-auto border-b p-2 md:hidden [view-transition-name:settings-sidebar]"
			>
				{items.map((item) => (
					<NavLink
						key={item.href}
						item={item}
						nhan={t.thanhBen[item.khoa]}
						active={mucCaiDatDangMo(item.href, root, pathname)}
						className="shrink-0 px-3"
					/>
				))}
			</nav>
		</>
	);
}
