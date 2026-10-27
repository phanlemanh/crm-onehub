"use client";

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
import { DUONG } from "./du-lieu";

export type TheBco = "danh-sach" | "hop-tuan" | "viec" | "cay";

const THE: { id: TheBco; nhan: string; state: string }[] = [
	{ id: "danh-sach", nhan: "OKR", state: "ST-bco-coso" },
	{ id: "hop-tuan", nhan: "Họp tuần", state: "ST-bco-the-hop-tuan" },
	{ id: "viec", nhan: "Việc", state: "ST-bco-the-hop-tuan" },
	{ id: "cay", nhan: "Sơ đồ góp vào", state: "ST-bco-the-hop-tuan" },
];

const NHOM: { nhan?: string; muc: { nhan: string; dangMo?: boolean }[] }[] = [
	{ muc: [{ nhan: "Của tôi" }] },
	{
		nhan: "OKR",
		muc: [{ nhan: "Bộ OKR", dangMo: true }, { nhan: "Lấy ý kiến" }],
	},
	{
		nhan: "Báo cáo",
		muc: [{ nhan: "Sức khoẻ" }, { nhan: "Mọi KR" }, { nhan: "Sơ đồ" }],
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

export function KhungBo({
	tenBo,
	the,
	children,
}: {
	tenBo: string;
	the: TheBco;
	children: ReactNode;
}) {
	return (
		<div
			className="ml-[calc(50%-50vw)] flex w-screen flex-col border-y bg-background"
			data-khung-bco
		>
			<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
				<span className="min-w-0 truncate font-medium text-sm" translate="no">
					OneHub
				</span>
				<span className="ml-auto">
					<PersonAvatar name="Nguyễn Thị Thu Thảo" size="sm" />
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
							<div className="flex flex-col gap-3 pb-1">
								<Breadcrumb data-vi-tri-bo="mot-bo">
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink asChild>
												<Link href={DUONG}>Bộ OKR</Link>
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbPage translate="no">{tenBo}</BreadcrumbPage>
										</BreadcrumbItem>
									</BreadcrumbList>
								</Breadcrumb>
								<Tabs value={the}>
									<div
										className="max-w-full overflow-x-auto"
										data-the-con-bo=""
									>
										<TabsList aria-label="Phần của bộ OKR" variant="line">
											{THE.map((t) => (
												<TabsTrigger asChild key={t.id} value={t.id}>
													<Link
														aria-current={the === t.id ? "page" : undefined}
														data-the={t.id}
														href={`${DUONG}?state=${t.state}`}
													>
														{t.nhan}
													</Link>
												</TabsTrigger>
											))}
										</TabsList>
									</div>
								</Tabs>
							</div>
							{children}
						</div>
					</PageShellContent>
				</PageShell>
			</div>
		</div>
	);
}
