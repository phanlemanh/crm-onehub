"use client";

import Book from "@carbon/icons-react/es/Book";
import Building from "@carbon/icons-react/es/Building";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Close from "@carbon/icons-react/es/Close";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Milestone from "@carbon/icons-react/es/Milestone";
import Partnership from "@carbon/icons-react/es/Partnership";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import Settings from "@carbon/icons-react/es/Settings";
import Target from "@carbon/icons-react/es/Target";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Button } from "@crm/ui/components/button";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { cn } from "@crm/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { AgentBuilderSidebar } from "@/components/agent-builder/agent-builder-sidebar";
import { usePrefetchSection } from "@/components/crm/section-prefetch";
import { useMobileNav } from "@/components/mobile-nav";
import {
	laMucHoiThoai,
	MUC_RAIL,
	type MucRail,
	type MucRailKey,
	mucDangMo,
} from "@/lib/khung-dieu-huong";
import { khungUngDungMessages } from "@/lib/messages/khung-ung-dung";
import { mucRailChoVai } from "@/lib/pham-vi-man";
import { useTRPC } from "@/lib/trpc/client";
import { useHydrated } from "@/lib/use-hydrated";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const ICON = {
	overview: Dashboard,
	chat: Bot,
	companies: Building,
	contacts: UserMultiple,
	deals: Partnership,
	campaigns: Bullhorn,
	onboarding: Roadmap,
	okr: Target,
	taiLieu: Book,
	loTrinh: Milestone,
	settings: Settings,
} satisfies Record<MucRailKey, CarbonIcon>;

const LOP_ICON_HOI_THOAI = "size-5";

type RailItem = {
	muc: MucRail;
	label: string;
	href: string;
	section: string;
	icon: CarbonIcon;
	iconClassName?: string;
};

function RailLink({
	item,
	active,
	onPrefetch,
}: {
	item: RailItem;
	active: boolean;
	onPrefetch: () => void;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					asChild
					variant="ghost"
					size="icon"
					className={cn(
						"text-muted-foreground",
						active &&
							"bg-muted text-foreground hover:bg-muted hover:text-foreground",
					)}
				>
					<Link
						href={item.href}
						prefetch
						onMouseEnter={onPrefetch}
						onFocus={onPrefetch}
						aria-current={active ? "page" : undefined}
						transitionTypes={["nav-lateral"]}
					>
						<Icon icon={item.icon} className={item.iconClassName} />
						<span className="sr-only">{item.label}</span>
					</Link>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right">{item.label}</TooltipContent>
		</Tooltip>
	);
}

function MobileRailLink({
	item,
	active,
	onNavigate,
	onPrefetch,
}: {
	item: RailItem;
	active: boolean;
	onNavigate: () => void;
	onPrefetch: () => void;
}) {
	return (
		<Button
			asChild
			variant="ghost"
			className={cn(
				"justify-start gap-3 text-muted-foreground",
				active &&
					"bg-muted text-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			<Link
				href={item.href}
				prefetch
				onMouseEnter={onPrefetch}
				onFocus={onPrefetch}
				aria-current={active ? "page" : undefined}
				onClick={onNavigate}
				transitionTypes={[
					laMucHoiThoai(item.muc) ? "nav-forward" : "nav-lateral",
				]}
			>
				<Icon icon={item.icon} className={item.iconClassName} />
				<span>{item.label}</span>
			</Link>
		</Button>
	);
}

function MobileRailIconLink({
	item,
	active,
	onNavigate,
	onPrefetch,
}: {
	item: RailItem;
	active: boolean;
	onNavigate: () => void;
	onPrefetch: () => void;
}) {
	return (
		<Button
			asChild
			variant="ghost"
			size="icon"
			className={cn(
				"text-muted-foreground",
				active &&
					"bg-muted text-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			<Link
				href={item.href}
				prefetch
				onMouseEnter={onPrefetch}
				onFocus={onPrefetch}
				aria-current={active ? "page" : undefined}
				onClick={onNavigate}
			>
				<Icon icon={item.icon} className={item.iconClassName} />
				<span className="sr-only">{item.label}</span>
			</Link>
		</Button>
	);
}

export function AppIconRailFallback() {
	const m = khungUngDungMessages(useLocale());
	return (
		<nav
			aria-label={m.nav.primary}
			aria-busy="true"
			className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex [view-transition-name:app-rail]"
		>
			{MUC_RAIL.map((muc) => (
				<Button
					key={muc.href}
					variant="ghost"
					size="icon"
					disabled
					className="text-muted-foreground"
				>
					<Icon
						icon={ICON[muc.key]}
						className={laMucHoiThoai(muc) ? LOP_ICON_HOI_THOAI : undefined}
					/>
					<span className="sr-only">{m.rail[muc.key]}</span>
				</Button>
			))}
		</nav>
	);
}

export type RailWorkspace = { viewerRole: string | null };

export function AppIconRail({
	workspace,
}: {
	workspace: RailWorkspace | null;
}) {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();
	const { open, setOpen } = useMobileNav();
	const prefetchSection = usePrefetchSection();
	const m = khungUngDungMessages(useLocale());
	const trpc = useTRPC();
	const hydrated = useHydrated();
	const workspaceQuery = useQuery(trpc.workspace.get.queryOptions());
	const nguon = (hydrated ? workspaceQuery.data : undefined) ?? workspace;
	const viewerRole = nguon?.viewerRole ?? null;

	const items = useMemo(
		() =>
			mucRailChoVai(viewerRole).map(
				(muc): RailItem => ({
					muc,
					label: m.rail[muc.key],
					section: muc.href,
					href: workspaceUrl(muc.href),
					icon: ICON[muc.key],
					iconClassName: laMucHoiThoai(muc) ? LOP_ICON_HOI_THOAI : undefined,
				}),
			),
		[workspaceUrl, m, viewerRole],
	);
	if (!nguon) return <AppIconRailFallback />;
	const active = (item: RailItem) =>
		mucDangMo(item.muc, pathname, workspaceUrl);
	const inChat = items.some((item) => laMucHoiThoai(item.muc) && active(item));

	return (
		<>
			<nav
				aria-label={m.nav.primary}
				className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex [view-transition-name:app-rail]"
			>
				{items.map((item) => (
					<RailLink
						key={item.href}
						item={item}
						active={active(item)}
						onPrefetch={() => prefetchSection(item.section)}
					/>
				))}
			</nav>

			<Sheet open={open} onOpenChange={setOpen}>
				{inChat ? (
					<SheetContent
						side="left"
						showCloseButton={false}
						className="w-5/6 max-w-sm flex-row gap-0 p-0"
					>
						<SheetHeader className="sr-only">
							<SheetTitle>{m.nav.mobileChat}</SheetTitle>
						</SheetHeader>
						<nav
							aria-label={m.nav.mobileChat}
							className="flex w-14 shrink-0 flex-col items-center gap-1 border-r py-3"
						>
							<Button
								variant="ghost"
								size="icon"
								aria-label={m.nav.close}
								onClick={() => setOpen(false)}
							>
								<Icon icon={Close} />
							</Button>
							<div className="my-1 h-px w-5 bg-border" />
							{items.map((item) => (
								<MobileRailIconLink
									key={item.href}
									item={item}
									active={active(item)}
									onNavigate={() => setOpen(false)}
									onPrefetch={() => prefetchSection(item.section)}
								/>
							))}
						</nav>
						<AgentBuilderSidebar
							className="flex flex-1"
							onNavigate={() => setOpen(false)}
						/>
					</SheetContent>
				) : (
					<SheetContent side="left" className="w-64 gap-0 p-0">
						<SheetHeader>
							<SheetTitle>{m.nav.title}</SheetTitle>
						</SheetHeader>
						<nav
							aria-label={m.nav.mobile}
							className="flex flex-1 flex-col gap-1 p-2"
						>
							{items.map((item) => (
								<MobileRailLink
									key={item.href}
									item={item}
									active={active(item)}
									onNavigate={() => setOpen(false)}
									onPrefetch={() => prefetchSection(item.section)}
								/>
							))}
						</nav>
					</SheetContent>
				)}
			</Sheet>
		</>
	);
}
