"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import { Badge } from "@crm/ui/components/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import type { ReactNode } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { type DonBcd, DUONG, lanCan } from "./du-lieu";

export type TheBcd = "danh-sach" | "hop-tuan" | "viec" | "cay";

const THE: { id: TheBcd; nhan: string }[] = [
	{ id: "danh-sach", nhan: "OKR" },
	{ id: "hop-tuan", nhan: "Họp tuần" },
	{ id: "viec", nhan: "Việc" },
	{ id: "cay", nhan: "Sơ đồ góp vào" },
];

export const hrefBo = (khoa: string, the: TheBcd = "danh-sach") =>
	`${DUONG}?state=${the === "hop-tuan" ? "ST-bcd-hop-tuan" : "ST-bcd-mot-bo"}&don=${encodeURIComponent(khoa)}`;

const NHOM: { nhan?: string; muc: { nhan: string; dangMo?: boolean }[] }[] = [
	{ muc: [{ nhan: "Của tôi" }] },
	{
		nhan: "OKR",
		muc: [{ nhan: "Bộ OKR", dangMo: true }, { nhan: "Lấy ý kiến" }],
	},
	{
		nhan: "Báo cáo",
		muc: [{ nhan: "Toàn cảnh" }, { nhan: "Mọi KR" }, { nhan: "Sơ đồ" }],
	},
];

function ThanhBen() {
	return (
		<AreaSidebar
			header={<Badge variant="outline">Quý 4 2026 · dữ liệu mẫu</Badge>}
			label="Mục tiêu"
		>
			{NHOM.map((n) => (
				<AreaSidebarGroup key={n.muc[0]?.nhan} label={n.nhan}>
					{n.muc.map((m) => (
						<AreaSidebarItem active={m.dangMo} key={m.nhan}>
							{m.nhan}
						</AreaSidebarItem>
					))}
				</AreaSidebarGroup>
			))}
		</AreaSidebar>
	);
}

const demRieng = (d: DonBcd) =>
	d.soMucTieu === 0 ? "chưa có mục tiêu riêng" : `${d.soMucTieu} mục tiêu`;

function MucMenu({ d, the }: { d: DonBcd; the: TheBcd }) {
	return (
		<DropdownMenuItem asChild>
			<Link data-menu-don={d.khoa} href={hrefBo(d.khoa, the)}>
				<span className="min-w-0 flex-1 truncate" translate="no">
					{d.ten}
				</span>
				<span className="text-muted-foreground text-xs tabular-nums">
					{demRieng(d)}
				</span>
			</Link>
		</DropdownMenuItem>
	);
}

function NhomMenu({
	nhan,
	ds,
	the,
}: {
	nhan: string;
	ds: DonBcd[];
	the: TheBcd;
}) {
	if (ds.length === 0) return null;
	return (
		<DropdownMenuGroup data-nhom-menu={nhan}>
			<DropdownMenuLabel>{nhan}</DropdownMenuLabel>
			{ds.map((d) => (
				<MucMenu d={d} key={d.khoa} the={the} />
			))}
		</DropdownMenuGroup>
	);
}

export function ViTriMenu({
	don,
	the,
	moSan,
}: {
	don: DonBcd;
	the: TheBcd;
	moSan: boolean;
}) {
	const lc = lanCan(don.khoa);
	const nhom = [
		{ nhan: "Thuộc", ds: lc.cha ? [lc.cha] : [] },
		{ nhan: "Cùng cấp", ds: lc.cungCap },
		{ nhan: "Trực thuộc", ds: lc.trucThuoc },
	].filter((n) => n.ds.length > 0);
	return (
		<Breadcrumb data-vi-tri-bo="mot-bo">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`${DUONG}?state=ST-bcd-danh-sach`}>Bộ OKR</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<DropdownMenu defaultOpen={moSan} modal={false}>
						<DropdownMenuTrigger
							aria-label={`${don.ten} — đổi sang bộ khác`}
							className="flex items-center gap-1"
							data-menu-vi-tri=""
						>
							<BreadcrumbPage translate="no">{don.ten}</BreadcrumbPage>
							<Icon icon={ChevronDown} />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							{nhom.map((n, i) => (
								<div key={n.nhan}>
									{i > 0 ? <DropdownMenuSeparator /> : null}
									<NhomMenu ds={n.ds} nhan={n.nhan} the={the} />
								</div>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

function TheCon({ don, the }: { don: DonBcd; the: TheBcd }) {
	return (
		<Tabs value={the}>
			<div className="max-w-full overflow-x-auto" data-the-con-bo="">
				<TabsList aria-label="Phần của bộ OKR" variant="line">
					{THE.map((t) => (
						<TabsTrigger asChild key={t.id} value={t.id}>
							<Link
								aria-current={the === t.id ? "page" : undefined}
								data-the={t.id}
								href={hrefBo(don.khoa, t.id)}
							>
								{t.nhan}
							</Link>
						</TabsTrigger>
					))}
				</TabsList>
			</div>
		</Tabs>
	);
}

export function KhungTrang({
	dauTrang,
	children,
}: {
	dauTrang?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div
			className="ml-[calc(50%-50vw)] flex w-screen flex-col border-y bg-background"
			data-khung-bcd
		>
			<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
				<span className="min-w-0 truncate font-medium text-sm" translate="no">
					OneHub
				</span>
				<span className="ml-auto">
					<PersonAvatar name="Trần Quang Vinh" size="sm" />
				</span>
			</header>
			<div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
				<ThanhBen />
				<PageShell>
					<PageShellHeader>
						<PageShellHeading>
							<PageShellTitle>Mục tiêu</PageShellTitle>
							<PageShellDescription>
								Bộ OKR của từng đơn vị trong chu kỳ, và cách chúng góp vào nhau.
							</PageShellDescription>
						</PageShellHeading>
					</PageShellHeader>
					<PageShellContent>
						<div className="flex flex-col gap-6">
							{dauTrang}
							{children}
						</div>
					</PageShellContent>
				</PageShell>
			</div>
		</div>
	);
}

export function KhungBo({
	don,
	the,
	moMenu,
	children,
}: {
	don: DonBcd;
	the: TheBcd;
	moMenu: boolean;
	children: ReactNode;
}) {
	return (
		<KhungTrang
			dauTrang={
				<div className="flex flex-col gap-3 pb-1">
					<ViTriMenu don={don} moSan={moMenu} the={the} />
					<TheCon don={don} the={the} />
				</div>
			}
		>
			{children}
		</KhungTrang>
	);
}
