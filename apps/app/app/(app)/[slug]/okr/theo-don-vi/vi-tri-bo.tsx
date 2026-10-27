"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import { useLocale } from "@crm/ui/components/locale-provider";
import Link from "next/link";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

export function useHrefDanhSachBo(ky: string | null): string {
	const url = useWorkspaceUrl();
	const q = new URLSearchParams();
	if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
	return `${url("/okr/bo-okr")}${q.size > 0 ? `?${q}` : ""}`;
}

export function ViTriBo({
	ky,
	tenBo,
}: {
	ky: string | null;
	tenBo?: string | null;
}) {
	const nhan = okrVoKhuMessages(useLocale()).boOkr.viTri;
	const veDanhSach = useHrefDanhSachBo(ky);
	if (tenBo === undefined)
		return (
			<Breadcrumb data-vi-tri-bo="danh-sach">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>{nhan}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	return (
		<Breadcrumb data-vi-tri-bo="mot-bo">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link data-ve-bo-okr="" href={veDanhSach}>
							{nhan}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				{tenBo ? (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage translate="no">{tenBo}</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				) : null}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
