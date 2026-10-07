"use client";

import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Skeleton } from "@crm/ui/components/skeleton";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export function HopThoaiDongKy({
	ky,
	open,
	onOpenChange,
}: {
	ky: ChuKy;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const c = okrKhepMessages(useLocale()).caiDat.dong;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const bang = useQuery({
		...trpc.okr.bangCham.queryOptions(open ? { cycleId: ky.id } : skipToken),
		staleTime: 0,
	});

	const dong = useMutation(
		trpc.okr.setCyclePhase.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				toast.success(c.daDong(ky.name));
				onOpenChange(false);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const hocTap = bang.data?.hocTapChuaGhi ?? [];
	if (bang.data && bang.data.conLai === 0 && hocTap.length === 0)
		return (
			<ConfirmDialog
				tone="default"
				tieuDe={c.hoiTieuDe(ky.name)}
				than={c.hoiThan(ky.name)}
				nut={c.nut}
				thoi={c.huy}
				open={open}
				pending={dong.isPending}
				onOpenChange={(mo) => {
					if (!mo && !dong.isPending) onOpenChange(false);
				}}
				onConfirm={() => {
					if (!dong.isPending) dong.mutate({ id: ky.id, phase: "da-dong" });
				}}
			/>
		);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent data-hop-dong-ky={ky.id}>
				<DialogHeader>
					<DialogTitle>{c.chanTieuDe(ky.name)}</DialogTitle>
					<DialogDescription>
						{bang.data
							? bang.data.conLai > 0
								? c.chanMoTa(String(bang.data.conLai))
								: c.hocTapMoTa
							: bang.isError
								? c.loi
								: c.dangDem}
					</DialogDescription>
				</DialogHeader>
				{bang.data && hocTap.length > 0 ? (
					<div className="flex flex-col gap-2">
						{bang.data.conLai > 0 ? (
							<SectionHeading level={4}>{c.hocTapMoTa}</SectionHeading>
						) : null}
						<ItemGroup data-hoc-tap-chua-ghi>
							{hocTap.map((m) => (
								<Item
									key={m.id}
									size="sm"
									variant="outline"
									data-hoc-tap={m.id}
								>
									<ItemContent>
										<ItemTitle>
											<span translate="no">{m.ten}</span>
										</ItemTitle>
									</ItemContent>
								</Item>
							))}
						</ItemGroup>
					</div>
				) : null}
				{bang.data && bang.data.conLai > 0 ? (
					<ItemGroup data-chua-cham>
						{bang.data.chuaCham.map((d) => (
							<Item
								key={d.khoa}
								size="sm"
								variant="outline"
								data-don-vi-chua-cham={d.khoa}
							>
								<ItemContent>
									<ItemTitle>
										<span translate="no">{d.ten}</span>
									</ItemTitle>
								</ItemContent>
								<ItemActions>
									<span className="text-sm tabular-nums">
										{c.soKr(String(d.conLai))}
									</span>
								</ItemActions>
							</Item>
						))}
					</ItemGroup>
				) : bang.data || bang.isError ? null : (
					<div aria-busy="true" className="flex flex-col gap-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				)}
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{c.dongHop}</Button>
					</DialogClose>
					<Button disabled data-nut="dong-ky">
						{c.nut}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
