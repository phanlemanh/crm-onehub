"use client";

import { AreaSidebar } from "@crm/ui/components/area-sidebar";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { khungMessages } from "@/lib/messages/agent-builder-khung";

export function AgentBuilderShell({
	children,
	sidebar,
}: {
	children: React.ReactNode;
	sidebar: React.ReactNode;
}) {
	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
			{sidebar}
			<div className="flex min-w-0 flex-1 flex-col">{children}</div>
		</div>
	);
}

export function AgentBuilderSidebarFallback() {
	const t = khungMessages(useLocale());
	return (
		<AreaSidebar
			label={t.thanhBen.danhSachHoiThoai}
			busy
			header={
				<div className="flex h-7 items-center pl-3 font-medium text-xs">
					{t.thanhBen.hoiThoai}
				</div>
			}
		>
			<div className="flex flex-col gap-2 px-3" aria-hidden="true">
				<Skeleton className="h-2.5 w-16" />
				<Skeleton className="h-7 w-full" />
				<Skeleton className="h-7 w-full" />
			</div>
			<span role="status" className="sr-only">
				{t.thanhBen.dangMoDieuHuong}
			</span>
		</AreaSidebar>
	);
}
