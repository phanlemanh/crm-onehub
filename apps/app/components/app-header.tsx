"use client";

import Alarm from "@carbon/icons-react/es/Alarm";
import Asleep from "@carbon/icons-react/es/Asleep";
import Language from "@carbon/icons-react/es/Language";
import Light from "@carbon/icons-react/es/Light";
import Logout from "@carbon/icons-react/es/Logout";
import Menu from "@carbon/icons-react/es/Menu";
import SendAlt from "@carbon/icons-react/es/SendAlt";
import UserAvatar from "@carbon/icons-react/es/UserAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@crm/ui/components/avatar";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { useLocale } from "@crm/ui/components/locale-provider";
import Logo from "@crm/ui/components/logo";
import { Separator } from "@crm/ui/components/separator";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { EnrichmentQueue } from "@/components/enrichment-queue";
import { useMobileNav } from "@/components/mobile-nav";
import { ChuongThongBao } from "@/components/thong-bao/chuong-thong-bao";
import { NutGuiDauTrang } from "@/components/tin-hieu/hop-gui-tin-hieu";
import { NutGuiTinHieu } from "@/components/tin-hieu/nut-gui-tin-hieu";
import {
	COOKIE_MAX_AGE,
	COOKIE_PATH,
	COOKIE_SAME_SITE,
	LANG_COOKIE,
	type Locale,
} from "@/lib/locale/locale";
import { khungUngDungMessages } from "@/lib/messages/khung-ung-dung";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { mucRailChoVai } from "@/lib/pham-vi-man";
import { signOutAndRedirect } from "@/lib/sign-out";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { workspaceLabel } from "@/lib/workspace-label";

type User = { name: string; email: string; image: string | null };

export function AppHeader({ user }: { user: User }) {
	const { setOpen: setMobileNavOpen } = useMobileNav();
	const trpc = useTRPC();
	const workspaceUrl = useWorkspaceUrl();
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const label = workspaceLabel(workspace.data?.name);
	const coHangLamGiau = mucRailChoVai(workspace.data?.viewerRole ?? null).some(
		(muc) => muc.key === "companies",
	);
	const t = khungUngDungMessages(useLocale());

	return (
		<header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 [view-transition-name:app-header]">
			<div className="flex shrink-0 items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					aria-label={t.nav.open}
					onClick={() => setMobileNavOpen(true)}
				>
					<Menu />
				</Button>
				<Link
					href={workspaceUrl()}
					aria-label={t.header.homepage}
					className="hidden size-8 items-center justify-center text-foreground md:flex"
				>
					<Logo className="size-5" />
				</Link>
				<Separator orientation="vertical" className="mx-1 h-5 bg-transparent" />
				<span className="min-w-0 truncate font-medium text-sm" translate="no">
					{label}
				</span>
			</div>

			<div className="ml-auto flex shrink-0 items-center gap-1.5">
				{coHangLamGiau ? <EnrichmentQueue /> : null}
				<ChuongThongBao />
				<NutGuiTinHieu nut={<NutGuiDauTrang />} />
				<UserMenu
					user={user}
					onSignOut={() => {
						signOutAndRedirect(t.header.signOutFailed).catch(() =>
							toast.error(t.header.signOutFailed),
						);
					}}
				/>
			</div>
		</header>
	);
}

export function AppHeaderFallback() {
	const t = khungUngDungMessages(useLocale());
	return (
		<header
			className="flex h-12 shrink-0 items-center gap-2 border-b px-3 [view-transition-name:app-header]"
			aria-busy="true"
		>
			<div className="flex shrink-0 items-center gap-1">
				<span className="hidden size-8 items-center justify-center text-foreground md:flex">
					<Logo className="size-5" />
				</span>
				<Separator orientation="vertical" className="mx-1 h-5 bg-transparent" />
				<Skeleton className="h-4 w-24" />
			</div>

			<div className="ml-auto flex shrink-0 items-center gap-1.5">
				<Skeleton className="h-8 w-8 md:w-32" />
				<Avatar className="size-7">
					<AvatarFallback />
				</Avatar>
			</div>
			<span role="status" className="sr-only">
				{t.header.loading}
			</span>
		</header>
	);
}

export function UserMenu({
	user,
	onSignOut,
}: {
	user: User;
	onSignOut: () => void;
}) {
	const { resolvedTheme, setTheme } = useTheme();
	const isDark = resolvedTheme === "dark";
	const locale = useLocale();
	const router = useRouter();
	const t = khungUngDungMessages(locale);
	const workspaceUrl = useWorkspaceUrl();
	const tiengKia: Locale = locale === "vi" ? "en" : "vi";

	const chooseLocale = (next: Locale) => {
		document.cookie = `${LANG_COOKIE}=${next}; Max-Age=${COOKIE_MAX_AGE}; Path=${COOKIE_PATH}; SameSite=${COOKIE_SAME_SITE}`;
		router.refresh();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label={t.header.accountMenu}
					className="hover:bg-transparent aria-expanded:bg-transparent dark:hover:bg-transparent"
				>
					<Avatar className="size-7">
						{user.image && <AvatarImage alt={user.name} src={user.image} />}
						<AvatarFallback className="text-xs" translate="no">
							{initials(user.name)}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-56">
				<DropdownMenuLabel className="flex items-center gap-2">
					<UserAvatar />
					<span className="min-w-0 truncate" translate="no">
						{user.email}
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href={workspaceUrl("/reminders")}>
						<Alarm />
						{t.header.nhacBuoiSang}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();
						setTheme(isDark ? "light" : "dark");
					}}
				>
					{isDark ? <Light /> : <Asleep />}
					{isDark ? t.header.lightMode : t.header.darkMode}
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();
						chooseLocale(tiengKia);
					}}
				>
					<Language />
					{t.header.otherLocale}
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href={workspaceUrl("/tin-hieu")}>
						<SendAlt />
						{tinHieuMessages(locale).menu}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={onSignOut}>
					<Logout />
					{t.header.signOut}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function initials(name: string): string {
	return (
		name
			.split(" ")
			.map((part) => part[0])
			.filter(Boolean)
			.slice(0, 2)
			.join("")
			.toUpperCase() || "?"
	);
}
