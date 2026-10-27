"use client";

import Maximize from "@carbon/icons-react/es/Maximize";
import Minimize from "@carbon/icons-react/es/Minimize";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useIsMobile } from "@crm/ui/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { ReactNode } from "react";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DUONG_SO_DO } from "../tab-okr";
import { useToanManHinh } from "../toan-man-hinh";

function TenTam({ tam }: { tam: string }) {
	const trpc = useTRPC();
	const q = useQuery(trpc.okr.quanhMucTieu.queryOptions({ objectiveId: tam }));
	const ten = q.data?.nut.find((n) => n.id === q.data.tamId)?.tieuDe;
	if (ten === undefined) return <Skeleton className="h-4 w-32" />;
	return <span translate="no">{ten}</span>;
}

function NutToanManHinh() {
	const t = okrVoKhuMessages(useLocale()).soDo;
	const { bat, dat } = useToanManHinh();
	const hep = useIsMobile();
	if (hep) return null;
	return (
		<Button
			aria-pressed={bat}
			data-nut="toan-man-hinh"
			onClick={() => dat(!bat)}
			size="sm"
			variant="outline"
		>
			<Icon data-icon="inline-start" icon={bat ? Minimize : Maximize} />
			{bat ? t.thoatToanManHinh : t.toanManHinh}
		</Button>
	);
}

export function DaiCongCu({
	tam,
	loc,
	coTam = tam !== null,
}: {
	tam: string | null;
	loc?: ReactNode;
	coTam?: boolean;
}) {
	const locale = useLocale();
	const t = okrVoKhuMessages(locale);
	const url = useWorkspaceUrl();
	return (
		<div
			aria-label={t.soDo.daiCongCu}
			className="flex flex-wrap items-center gap-3"
			data-dai-cong-cu
			role="toolbar"
		>
			<Breadcrumb className="min-w-0 flex-1">
				<BreadcrumbList>
					<BreadcrumbItem>{t.nhom.baoCao}</BreadcrumbItem>
					<BreadcrumbSeparator />
					{coTam ? (
						<>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={url(DUONG_SO_DO)}>{t.soDo.tieuDe}</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>
									{tam ? (
										<TenTam tam={tam} />
									) : (
										<Skeleton className="h-4 w-32" />
									)}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					) : (
						<BreadcrumbItem>
							<BreadcrumbPage>{t.soDo.soDoGopVao}</BreadcrumbPage>
						</BreadcrumbItem>
					)}
				</BreadcrumbList>
			</Breadcrumb>
			{coTam ? (
				<Button asChild data-nut="ve-ca-cong-ty" size="sm" variant="ghost">
					<Link href={url(DUONG_SO_DO)}>{t.soDo.veCaCongTy}</Link>
				</Button>
			) : (
				loc
			)}
			<NutToanManHinh />
		</div>
	);
}
