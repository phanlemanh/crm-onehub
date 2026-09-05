"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { cn } from "@crm/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
	type SettingsMessages,
	settingsMessages,
} from "@/lib/messages/settings";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type SettingsNavItem = {
	khoa: keyof SettingsMessages["thanhBen"];
	href: string;
};

const ROOT = "/settings";

const ITEMS: SettingsNavItem[] = [
	{ khoa: "chung", href: ROOT },
	{ khoa: "theoDoi", href: `${ROOT}/tracking` },
	{ khoa: "ketNoi", href: `${ROOT}/connections` },
	{ khoa: "tienTe", href: `${ROOT}/currencies` },
	{ khoa: "thanhVien", href: `${ROOT}/members` },
	{ khoa: "khoaApi", href: `${ROOT}/api-keys` },
	{ khoa: "sso", href: `${ROOT}/sso` },
];

function isActive(href: string, root: string, pathname: string): boolean {
	return href === root ? pathname === href : pathname.startsWith(href);
}

function NavLink({
	item,
	nhan,
	active,
	className,
}: {
	item: SettingsNavItem;
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
					{ITEMS.map((item) => (
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
				{ITEMS.map((item) => (
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

	const root = workspaceUrl(ROOT);
	const items = useMemo(
		() => ITEMS.map((item) => ({ ...item, href: workspaceUrl(item.href) })),
		[workspaceUrl],
	);

	return (
		<>
			<aside className="hidden w-56 shrink-0 border-r md:block [view-transition-name:settings-sidebar]">
				<nav aria-label={t.thanhBen.nhan} className="flex flex-col gap-0.5 p-3">
					{items.map((item) => (
						<NavLink
							key={item.href}
							item={item}
							nhan={t.thanhBen[item.khoa]}
							active={isActive(item.href, root, pathname)}
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
						active={isActive(item.href, root, pathname)}
						className="shrink-0 px-3"
					/>
				))}
			</nav>
		</>
	);
}
