"use client";

import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
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
import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { useLamMoiDieuPhoi } from "./lam-moi";
import { type BoPhanSua, ThemBoPhan } from "./them-bo-phan";

export type BoPhanDong = { id: string; name: string };

export function DanhSachBoPhan({
	boPhan,
	khoa,
}: {
	boPhan: BoPhanDong[];
	khoa: boolean;
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiDieuPhoi();

	const [thuTuTam, setThuTuTam] = useState<string[] | null>(null);
	const [dangSua, setDangSua] = useState<BoPhanSua | null>(null);
	const [hoiLuuTru, setHoiLuuTru] = useState<BoPhanDong | null>(null);

	const sap = useMutation(trpc.onboarding.reorderDepartments.mutationOptions());
	const luuTru = useMutation(
		trpc.onboarding.archiveDepartment.mutationOptions(),
	);
	const dangHoanTac = useRef(false);
	const khoiPhuc = useMutation(
		trpc.onboarding.restoreDepartment.mutationOptions(),
	);

	const theoId = new Map(boPhan.map((d) => [d.id, d]));
	const ids = thuTuTam ?? boPhan.map((d) => d.id);
	const hienThi = ids.flatMap((id) => {
		const d = theoId.get(id);
		return d === undefined ? [] : [d];
	});

	const hoanTac = (d: BoPhanDong) => {
		if (dangHoanTac.current) return;
		dangHoanTac.current = true;
		khoiPhuc.mutate(
			{ id: d.id },
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
			{boPhan.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{m.settings.departments}</EmptyTitle>
						<EmptyDescription>{m.settings.noDepartment}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : null}
			<SortableList
				ids={ids}
				onReorder={(moi) => {
					if (khoa || sap.isPending) return;
					setThuTuTam(moi);
					sap.mutate(
						{ ids: moi },
						{
							onSuccess: async () => {
								await lamMoi();
								setThuTuTam(null);
							},
							onError: (error) => {
								setThuTuTam(null);
								toast.error(error.message);
							},
						},
					);
				}}
			>
				{hienThi.map((d) => (
					<SortableItem
						key={d.id}
						id={d.id}
						label={d.name}
						disabled={khoa || sap.isPending}
					>
						<span
							className="min-w-0 flex-1 truncate text-sm"
							translate="no"
							data-bo-phan={d.id}
						>
							{d.name}
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-xs" disabled={khoa}>
									<Icon icon={OverflowMenuVertical} />
									<span className="sr-only">{`${m.quanLy.menu} ${d.name}`}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onSelect={() => setDangSua({ id: d.id, name: d.name })}
								>
									{m.quanLy.doiTen}
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => setHoiLuuTru(d)}>
									{m.quanLy.luuTru}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SortableItem>
				))}
			</SortableList>

			{dangSua ? (
				<ThemBoPhan
					key={dangSua.id}
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
					const d = hoiLuuTru;
					if (d === null || luuTru.isPending) return;
					luuTru.mutate(
						{ id: d.id },
						{
							onSuccess: async () => {
								setHoiLuuTru(null);
								await lamMoi();
								toast(m.quanLy.daLuuTruTen.replace("{ten}", d.name), {
									action: {
										label: m.quanLy.hoanTac,
										onClick: () => hoanTac(d),
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
