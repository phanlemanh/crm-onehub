"use client";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { DaLuuTru } from "./da-luu-tru";
import { DanhSachBoPhan } from "./danh-sach-bo-phan";
import { DanhSachKhuon } from "./danh-sach-khuon";
import { SoanKhuon } from "./soan-khuon";
import { ThemBoPhan } from "./them-bo-phan";

export function CaiDatDieuPhoi() {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();

	const khuon = useQuery(trpc.onboarding.listTemplates.queryOptions());
	const boPhan = useQuery(trpc.onboarding.listDepartments.queryOptions());
	const quyen = useQuery(trpc.onboarding.access.queryOptions());

	if (khuon.isPending || boPhan.isPending || quyen.isPending) {
		return (
			<div aria-live="polite" className="flex flex-col gap-2">
				<span className="text-muted-foreground text-sm">{m.loading}</span>
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	const dsKhuon = khuon.data ?? [];
	const dsBoPhan = boPhan.data ?? [];
	const khoa = quyen.data?.canManage !== true;

	return (
		<div className="grid gap-4 md:grid-cols-2">
			{khoa ? (
				<p
					className="text-muted-foreground text-sm md:col-span-2"
					data-trang-thai="ST-caidat-khong-quyen"
				>
					{m.quanLy.canQuyen}
				</p>
			) : null}

			<Card>
				<CardHeader>
					<CardTitle>{m.settings.templates}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<DanhSachKhuon khuon={dsKhuon} boPhan={dsBoPhan} khoa={khoa} />
					<div>
						<SoanKhuon boPhan={dsBoPhan} khoa={khoa} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{m.settings.departments}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<DanhSachBoPhan boPhan={dsBoPhan} khoa={khoa} />
					<div>
						<ThemBoPhan khoa={khoa} />
					</div>
				</CardContent>
			</Card>

			<DaLuuTru khoa={khoa} />
		</div>
	);
}
