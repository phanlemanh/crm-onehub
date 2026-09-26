"use client";

import Book from "@carbon/icons-react/es/Book";
import Building from "@carbon/icons-react/es/Building";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Partnership from "@carbon/icons-react/es/Partnership";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import Settings from "@carbon/icons-react/es/Settings";
import Target from "@carbon/icons-react/es/Target";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import Logo from "@crm/ui/components/logo";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { cn } from "@crm/ui/lib/utils";
import type { ReactNode } from "react";
import { PageShellTitle } from "@/components/page-shell";

export type Muc = "tai-lieu" | "chat";

export type TabKho = "trang" | "cho-duyet" | "nguon";

const DIEU_HUONG: { key: string; nhan: string; icon: CarbonIcon }[] = [
	{ key: "overview", nhan: "Tổng quan", icon: Dashboard },
	{ key: "chat", nhan: "Hội thoại", icon: Bot },
	{ key: "companies", nhan: "Công ty", icon: Building },
	{ key: "contacts", nhan: "Cá nhân", icon: UserMultiple },
	{ key: "deals", nhan: "Thoả thuận", icon: Partnership },
	{ key: "onboarding", nhan: "30 ngày đầu", icon: Roadmap },
	{ key: "okr", nhan: "OKR", icon: Target },
	{ key: "tai-lieu", nhan: "Tài liệu", icon: Book },
	{ key: "settings", nhan: "Cài đặt", icon: Settings },
];

export function KhungUngDung({
	muc,
	children,
}: {
	muc: Muc;
	children: ReactNode;
}) {
	return (
		<div
			className="ml-[calc(50%-50vw)] flex w-screen flex-col border-y bg-background"
			data-kho-muc={muc}
		>
			<header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
				<span className="flex size-8 items-center justify-center">
					<Logo className="size-5" />
				</span>
				<span className="min-w-0 truncate font-medium text-sm" translate="no">
					OneHub
				</span>
				<span className="ml-auto">
					<PersonAvatar name="Nguyễn Thu Hà" size="sm" />
				</span>
			</header>
			<div className="flex min-h-[640px]">
				<nav
					aria-label="Điều hướng chính"
					className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex"
				>
					{DIEU_HUONG.map((d) => {
						const dangMo = d.key === muc;
						return (
							<Button
								aria-current={dangMo ? "page" : undefined}
								className={cn(
									"text-muted-foreground",
									dangMo &&
										"bg-muted text-foreground hover:bg-muted hover:text-foreground",
								)}
								key={d.key}
								size="icon"
								title={d.nhan}
								variant="ghost"
							>
								<Icon icon={d.icon} />
								<span className="sr-only">{d.nhan}</span>
							</Button>
						);
					})}
				</nav>
				<main className="flex min-w-0 flex-1 flex-col">{children}</main>
			</div>
		</div>
	);
}

export function DauKho({
	tab,
	soChoDuyet,
	onTab,
	hanhDong,
}: {
	tab: TabKho | null;
	soChoDuyet: number;
	onTab: (tab: TabKho) => void;
	hanhDong?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3 border-b px-6 pt-5 pb-3">
			<div className="flex flex-wrap items-center gap-3">
				<PageShellTitle>Tài liệu</PageShellTitle>
				<div className="ml-auto flex items-center gap-2">{hanhDong}</div>
			</div>
			<Tabs onValueChange={(v) => onTab(v as TabKho)} value={tab ?? "trang"}>
				<TabsList>
					<TabsTrigger value="trang">Trang</TabsTrigger>
					<TabsTrigger value="cho-duyet">
						Chờ duyệt
						{soChoDuyet > 0 ? (
							<Badge className="ml-1" variant="secondary">
								{soChoDuyet}
							</Badge>
						) : null}
					</TabsTrigger>
					<TabsTrigger value="nguon">Nguồn</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
}
