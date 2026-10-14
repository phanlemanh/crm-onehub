"use client";

import Add from "@carbon/icons-react/es/Add";
import Book from "@carbon/icons-react/es/Book";
import Building from "@carbon/icons-react/es/Building";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Menu from "@carbon/icons-react/es/Menu";
import Milestone from "@carbon/icons-react/es/Milestone";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Partnership from "@carbon/icons-react/es/Partnership";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import Settings from "@carbon/icons-react/es/Settings";
import Target from "@carbon/icons-react/es/Target";
import TaskComplete from "@carbon/icons-react/es/TaskComplete";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { type CarbonIcon, Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import Logo from "@crm/ui/components/logo";
import { NavItem } from "@crm/ui/components/nav-item";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import type { ReactNode } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { PageShellNote } from "@/components/page-shell-note";
import { CHU_KY_KHAC, KY } from "../ban-mau-okr/du-lieu";
import { donVi, duongTrang, type NguoiXem, suaDuoc } from "./du-lieu";

type MucRail = { key: string; nhan: string; icon: CarbonIcon };

const RAIL: MucRail[] = [
	{ key: "overview", nhan: "Tổng quan", icon: Dashboard },
	{ key: "viec", nhan: "Việc của tôi", icon: TaskComplete },
	{ key: "chat", nhan: "Hội thoại", icon: Bot },
	{ key: "companies", nhan: "Công ty", icon: Building },
	{ key: "contacts", nhan: "Cá nhân", icon: UserMultiple },
	{ key: "deals", nhan: "Thoả thuận", icon: Partnership },
	{ key: "campaigns", nhan: "Chiến dịch", icon: Bullhorn },
	{ key: "onboarding", nhan: "30 ngày đầu", icon: Roadmap },
	{ key: "okr", nhan: "Mục tiêu", icon: Target },
	{ key: "tai-lieu", nhan: "Tài liệu", icon: Book },
	{ key: "lo-trinh", nhan: "Lộ trình", icon: Milestone },
	{ key: "settings", nhan: "Cài đặt", icon: Settings },
];

export type TabOkr = "cua-toi" | "theo-don-vi" | "toan-canh" | "hoi-y";

const TAB: { value: TabOkr; nhan: string }[] = [
	{ value: "cua-toi", nhan: "Của tôi" },
	{ value: "theo-don-vi", nhan: "Theo đơn vị" },
	{ value: "toan-canh", nhan: "Toàn cảnh" },
	{ value: "hoi-y", nhan: "Hỏi ý" },
];

const MO_TA = {
	"cua-toi": "Việc OKR của bạn tuần này, KR bạn phụ trách và đơn vị bạn dẫn.",
	"theo-don-vi":
		"Bộ OKR của từng đơn vị trong chu kỳ, và cách chúng góp vào nhau.",
	"toan-canh": "Cả công ty trong một màn.",
	"hoi-y": "Cả công ty góp ý cho mục tiêu kỳ tới, trước khi đặt OKR.",
} satisfies Record<TabOkr, string>;

const ID_KHONG_THEM = "okr-khong-them-duoc";

function duongTab(tab: TabOkr, donViId: string): string {
	if (tab === "toan-canh") return "/proto/so-do-can-chinh-okr";
	if (tab === "hoi-y") return "/proto/dot-hoi-y-tuong-okr";
	return duongTrang(
		tab === "cua-toi" ? "ST-dh-cua-toi" : "ST-dh-don-vi",
		donViId,
	);
}

function KhungApp({ xem, children }: { xem: NguoiXem; children: ReactNode }) {
	return (
		<div
			className="ml-[calc(50%-50vw)] flex w-screen flex-col border-y bg-background"
			data-khung-app
		>
			<header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
				<Button
					aria-label="Mở điều hướng"
					className="md:hidden"
					size="icon"
					variant="ghost"
				>
					<Icon icon={Menu} />
				</Button>
				<span className="hidden size-8 items-center justify-center md:flex">
					<Logo className="size-5" />
				</span>
				<span className="min-w-0 truncate font-medium text-sm" translate="no">
					OneHub
				</span>
				<span className="ml-auto flex items-center gap-2">
					<PersonAvatar name={xem.nguoi.ten} size="sm" />
				</span>
			</header>
			<div className="flex min-h-0 flex-1">
				<nav
					aria-label="Điều hướng chính"
					className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex"
				>
					{RAIL.map((m) => (
						<NavItem
							active={m.key === "okr"}
							key={m.key}
							size="icon"
							title={m.nhan}
						>
							<Icon icon={m.icon} />
							<span className="sr-only">{m.nhan}</span>
						</NavItem>
					))}
				</nav>
				{children}
			</div>
		</div>
	);
}

function ChonChuKy() {
	return (
		<Select defaultValue={KY.ten}>
			<SelectTrigger aria-label="Chu kỳ" size="sm">
				<SelectValue />
			</SelectTrigger>
			<SelectContent align="end">
				{CHU_KY_KHAC.map((ky) => (
					<SelectItem key={ky} value={ky}>
						{ky}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function HanhDong({ duoc }: { duoc: boolean }) {
	return (
		<PageShellActions>
			<ChonChuKy />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label="Thêm cách tạo mục tiêu"
						size="icon-sm"
						variant="outline"
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem disabled={!duoc}>
						Nhập từ bảng tính
					</DropdownMenuItem>
					<DropdownMenuItem disabled={!duoc}>
						Soạn cùng Trợ lý OKR
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<Button
				aria-describedby={duoc ? undefined : ID_KHONG_THEM}
				data-nut-chinh
				disabled={!duoc}
				size="sm"
			>
				<Icon data-icon="inline-start" icon={Add} />
				Thêm mục tiêu
			</Button>
		</PageShellActions>
	);
}

export function TrangMucTieu({
	tab,
	xem,
	donViId,
	children,
}: {
	tab: TabOkr;
	xem: NguoiXem;
	donViId: string;
	children: ReactNode;
}) {
	const duoc =
		tab === "cua-toi"
			? xem.quanTri || xem.danId !== null
			: suaDuoc(xem, donViId);
	const lyDo =
		tab === "cua-toi"
			? "Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu: mục tiêu thuộc về đơn vị và do trưởng đơn vị đặt. KR bạn phụ trách vẫn cập nhật ở đây."
			: `Bạn xem được ${donVi(donViId).ten} nhưng không thêm mục tiêu được: chỉ trưởng đơn vị này, trưởng đơn vị cấp trên và quản trị làm được.`;
	return (
		<KhungApp xem={xem}>
			<PageShell>
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>Mục tiêu</PageShellTitle>
						<PageShellDescription>{MO_TA[tab]}</PageShellDescription>
					</PageShellHeading>
					<HanhDong duoc={duoc} />
					{duoc ? null : (
						<PageShellNote id={ID_KHONG_THEM}>{lyDo}</PageShellNote>
					)}
				</PageShellHeader>
				<Tabs value={tab}>
					<TabsList aria-label="Khu Mục tiêu" variant="line">
						{TAB.map((t) => (
							<TabsTrigger asChild key={t.value} value={t.value}>
								<Link
									aria-current={t.value === tab ? "page" : undefined}
									href={duongTab(t.value, donViId)}
								>
									{t.nhan}
								</Link>
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
				<PageShellContent>{children}</PageShellContent>
			</PageShell>
		</KhungApp>
	);
}
