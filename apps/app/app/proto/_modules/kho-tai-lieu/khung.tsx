"use client";

import Book from "@carbon/icons-react/es/Book";
import Building from "@carbon/icons-react/es/Building";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Partnership from "@carbon/icons-react/es/Partnership";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import Search from "@carbon/icons-react/es/Search";
import Settings from "@carbon/icons-react/es/Settings";
import Target from "@carbon/icons-react/es/Target";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crm/ui/components/command";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import Logo from "@crm/ui/components/logo";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { cn } from "@crm/ui/lib/utils";
import { type ReactNode, useEffect, useState } from "react";
import { PageShellTitle } from "@/components/page-shell";
import { NHOM, TRANG } from "./du-lieu";

export type Muc = "tai-lieu" | "chat";

export type TabKho = "trang" | "cho-duyet" | "nguon" | "suc-khoe";

const TAB_KHO: readonly TabKho[] = ["trang", "cho-duyet", "nguon", "suc-khoe"];

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

function TimNhanh({ moSan }: { moSan: boolean }) {
	const [mo, setMo] = useState(moSan);
	useEffect(() => {
		const bam = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setMo((m) => !m);
			}
		};
		window.addEventListener("keydown", bam);
		return () => window.removeEventListener("keydown", bam);
	}, []);
	return (
		<>
			<Button onClick={() => setMo(true)} variant="outline">
				<Icon icon={Search} />
				Tìm nhanh
				<kbd className="text-muted-foreground text-xs">⌘K</kbd>
			</Button>
			<CommandDialog
				description="Tìm trang theo tên hoặc nội dung, có dấu hay không dấu"
				onOpenChange={setMo}
				open={mo}
				title="Tìm nhanh trong kho tài liệu"
			>
				<Command>
					<CommandInput placeholder="Gõ tên trang, ví dụ «hoa hong»" />
					<CommandList>
						<CommandEmpty>
							Không có trang nào khớp. Câu hỏi này sẽ vào hàng «chưa có trang».
						</CommandEmpty>
						{NHOM.map((n) => (
							<CommandGroup heading={n.nhan} key={n.id}>
								{TRANG.filter((t) => t.nhom === n.id).map((t) => (
									<CommandItem
										key={t.id}
										onSelect={() => setMo(false)}
										value={`${t.ten} ${boDau(t.ten)}`}
									>
										<Icon icon={Book} />
										<span translate="no">{t.ten}</span>
									</CommandItem>
								))}
							</CommandGroup>
						))}
					</CommandList>
				</Command>
			</CommandDialog>
		</>
	);
}

function boDau(chu: string): string {
	return chu
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D");
}

export function DauKho({
	tab,
	soChoDuyet,
	onTab,
	hanhDong,
	moTimNhanh = false,
}: {
	tab: TabKho | null;
	soChoDuyet: number;
	onTab: (tab: TabKho) => void;
	hanhDong?: ReactNode;
	moTimNhanh?: boolean;
}) {
	return (
		<div className="flex flex-col gap-3 border-b px-6 pt-5 pb-3">
			<div className="flex flex-wrap items-center gap-3">
				<PageShellTitle>Tài liệu</PageShellTitle>
				<div className="ml-auto flex items-center gap-2">
					<TimNhanh moSan={moTimNhanh} />
					{hanhDong}
				</div>
			</div>
			<Tabs
				onValueChange={(v) => {
					const tab = TAB_KHO.find((t) => t === v);
					if (tab) onTab(tab);
				}}
				value={tab ?? "trang"}
			>
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
					<TabsTrigger value="suc-khoe">Sức khoẻ</TabsTrigger>
				</TabsList>
			</Tabs>
		</div>
	);
}
