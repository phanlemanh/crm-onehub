"use client";

import Add from "@carbon/icons-react/es/Add";
import Book from "@carbon/icons-react/es/Book";
import Building from "@carbon/icons-react/es/Building";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Information from "@carbon/icons-react/es/Information";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
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

export type TabOkr =
	| "cua-toi"
	| "cap-nhat-tuan"
	| "theo-don-vi"
	| "toan-canh"
	| "hoi-y";

const TAB: { value: TabOkr; nhan: string; state: string }[] = [
	{ value: "cua-toi", nhan: "Của tôi", state: "ST-dhk-cua-toi" },
	{
		value: "cap-nhat-tuan",
		nhan: "Cập nhật tuần",
		state: "ST-dhk-cap-nhat-tuan",
	},
	{ value: "theo-don-vi", nhan: "Theo đơn vị", state: "ST-dhk-don-vi" },
	{ value: "toan-canh", nhan: "Toàn cảnh", state: "ST-dhk-toan-canh" },
	{ value: "hoi-y", nhan: "Hỏi ý", state: "ST-dhk-hoi-y" },
];

export const NHAN_TAB = Object.fromEntries(
	TAB.map((t) => [t.value, t.nhan]),
) as Record<TabOkr, string>;

const MO_TA = {
	"cua-toi": "Việc OKR của bạn tuần này, KR bạn phụ trách và đơn vị bạn dẫn.",
	"cap-nhat-tuan": "Cập nhật tiến độ tuần này cho các KR bạn phụ trách.",
	"theo-don-vi":
		"Bộ OKR của từng đơn vị trong chu kỳ, và cách chúng góp vào nhau.",
	"toan-canh": "Cả công ty trong một màn.",
	"hoi-y": "Cả công ty góp ý cho mục tiêu kỳ tới, trước khi đặt OKR.",
} satisfies Record<TabOkr, string>;

const ID_KHONG_THEM = "okr-khong-them-duoc";
export const DUONG = "/proto/dieu-huong-khu-muc-tieu";

export type CachSoan = "nut-vien" | "gom-vao-menu";

export type DauTrang = {
	tab: TabOkr;
	donVi: string | null;
	tenDonVi: string;
	duoc: boolean;
	lyDo: string | null;
	phaLapKeHoach: boolean;
	soanKhoa: string | null;
	cachSoan: CachSoan;
	menuMo?: boolean;
	nguoi: string;
};

export function duongTrang(state: string, donVi: string | null): string {
	const q = new URLSearchParams({ state });
	if (donVi) q.set("donOkr", `pb:${donVi}`);
	q.set("kyOkr", "q4-2026");
	return `${DUONG}?${q}`;
}

function KhungApp({ nguoi, children }: { nguoi: string; children: ReactNode }) {
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
					<PersonAvatar name={nguoi} size="sm" />
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

function NutSoan({ d }: { d: DauTrang }) {
	const khoa = !d.duoc || d.soanKhoa !== null;
	return (
		<span className="inline-flex items-center gap-1" data-nhom-soan>
			<Button
				aria-describedby={d.duoc ? undefined : ID_KHONG_THEM}
				disabled={khoa}
				size="sm"
				variant="outline"
			>
				Soạn OKR cùng Kara
			</Button>
			{d.duoc && d.soanKhoa ? (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							aria-label="Vì sao chưa soạn được"
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={Information} />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end">
						<p className="text-xs">{d.soanKhoa}</p>
					</PopoverContent>
				</Popover>
			) : null}
		</span>
	);
}

function HanhDong({ d }: { d: DauTrang }) {
	const gom = d.cachSoan === "gom-vao-menu";
	return (
		<PageShellActions>
			<ChonChuKy />
			<DropdownMenu defaultOpen={d.menuMo}>
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
					<DropdownMenuItem
						aria-describedby={d.duoc ? undefined : ID_KHONG_THEM}
						disabled={!d.duoc}
					>
						Nhập từ bảng tính
					</DropdownMenuItem>
					{gom && d.phaLapKeHoach ? (
						<DropdownMenuItem disabled={!d.duoc || d.soanKhoa !== null}>
							<span className="flex flex-col">
								Soạn OKR cùng Kara
								{d.duoc && d.soanKhoa ? (
									<span className="text-muted-foreground text-xs">
										{d.soanKhoa}
									</span>
								) : null}
							</span>
						</DropdownMenuItem>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>
			{!gom && d.phaLapKeHoach ? <NutSoan d={d} /> : null}
			<Button
				aria-describedby={d.duoc ? undefined : ID_KHONG_THEM}
				data-nut="them-muc-tieu"
				disabled={!d.duoc}
				size="sm"
			>
				<Icon data-icon="inline-start" icon={Add} />
				Thêm mục tiêu
			</Button>
		</PageShellActions>
	);
}

export function TrangMucTieu({
	d,
	children,
}: {
	d: DauTrang;
	children: ReactNode;
}) {
	return (
		<KhungApp nguoi={d.nguoi}>
			<PageShell>
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>Mục tiêu</PageShellTitle>
						<PageShellDescription>{MO_TA[d.tab]}</PageShellDescription>
						{d.lyDo ? (
							<PageShellNote id={ID_KHONG_THEM}>{d.lyDo}</PageShellNote>
						) : null}
					</PageShellHeading>
					<HanhDong d={d} />
				</PageShellHeader>
				<Tabs value={d.tab}>
					<TabsList aria-label="Khu mục tiêu" variant="line">
						{TAB.map((t) => (
							<TabsTrigger asChild key={t.value} value={t.value}>
								<Link
									aria-current={t.value === d.tab ? "page" : undefined}
									href={duongTrang(t.state, d.donVi)}
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
