"use client";

import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { useLamMoiDieuPhoi } from "./lam-moi";
import { type BoPhanChon, type KhuonSua, SoanKhuon } from "./soan-khuon";

export type KhuonDong = KhuonSua;

export function DanhSachKhuon({
	khuon,
	boPhan,
	khoa,
}: {
	khuon: KhuonDong[];
	boPhan: BoPhanChon[];
	khoa: boolean;
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiDieuPhoi();

	const [dangSua, setDangSua] = useState<KhuonSua | null>(null);
	const [hoiLuuTru, setHoiLuuTru] = useState<KhuonDong | null>(null);

	const luuTru = useMutation(trpc.onboarding.archiveTemplate.mutationOptions());
	const dangHoanTac = useRef(false);
	const khoiPhuc = useMutation(
		trpc.onboarding.restoreTemplate.mutationOptions(),
	);

	const hoanTac = (k: KhuonDong) => {
		if (dangHoanTac.current) return;
		dangHoanTac.current = true;
		khoiPhuc.mutate(
			{ id: k.id },
			{
				onSuccess: lamMoi,
				onError: (error) => toast.error(error.message),
				onSettled: () => {
					dangHoanTac.current = false;
				},
			},
		);
	};

	return (
		<>
			{khuon.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{m.empty.noTemplate.title}</EmptyTitle>
						<EmptyDescription>{m.settings.noTemplate}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : null}
			{khuon.map((k) => (
				<div className="flex items-center justify-between gap-3" key={k.id}>
					<span
						className="min-w-0 truncate font-medium text-sm"
						translate="no"
						data-khuon={k.id}
					>
						{k.name}
					</span>
					<div className="flex shrink-0 items-center gap-2">
						{k.partnerType === null ? null : (
							<Badge variant="outline" translate="no">
								{k.partnerType}
							</Badge>
						)}
						<span className="text-muted-foreground text-xs tabular-nums">
							{k.steps.length}
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-xs" disabled={khoa}>
									<Icon icon={OverflowMenuVertical} />
									<span className="sr-only">{`${m.quanLy.menu} ${k.name}`}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onSelect={() => setDangSua(k)}>
									{m.quanLy.sua}
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => setHoiLuuTru(k)}>
									{m.quanLy.luuTru}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			))}

			{dangSua ? (
				<SoanKhuon
					key={dangSua.id}
					boPhan={boPhan}
					khoa={khoa}
					sua={dangSua}
					dangMo
					doiMo={(mo) => {
						if (!mo) setDangSua(null);
					}}
				/>
			) : null}

			<ConfirmDialog
				open={hoiLuuTru !== null}
				onOpenChange={(mo) => {
					if (!mo && !luuTru.isPending) setHoiLuuTru(null);
				}}
				tieuDe={m.quanLy.xacNhanLuuTruTieuDe.replace(
					"{ten}",
					hoiLuuTru?.name ?? "",
				)}
				than={m.quanLy.xacNhanLuuTruThan}
				nut={m.quanLy.luuTru}
				thoi={m.quanLy.giu}
				pending={luuTru.isPending}
				onConfirm={() => {
					const k = hoiLuuTru;
					if (k === null || luuTru.isPending) return;
					luuTru.mutate(
						{ id: k.id },
						{
							onSuccess: async () => {
								setHoiLuuTru(null);
								await lamMoi();
								toast(m.quanLy.daLuuTruTen.replace("{ten}", k.name), {
									action: {
										label: m.quanLy.hoanTac,
										onClick: () => hoanTac(k),
									},
								});
							},
							onError: (error) => {
								setHoiLuuTru(null);
								toast.error(error.message);
							},
						},
					);
				}}
			/>
		</>
	);
}
