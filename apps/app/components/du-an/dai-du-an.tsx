"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { duAnMessages } from "@/lib/messages/du-an";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { khoangNgay, ngayNgan } from "./pham-vi";
import { HopDuAn } from "./tao-du-an";
import { HopThemMoc } from "./them-moc";

type DuAnDong = RouterOutputs["duAn"]["get"];

type Hoi = "dong" | "xoa" | "sua" | "moc" | null;

export function DaiDuAn({
	duAn,
	onDaXoa,
}: {
	duAn: DuAnDong;
	onDaXoa: () => void;
}) {
	const m = duAnMessages(useLocale()).dai;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [hoi, setHoi] = useState<Hoi>(null);
	const dong = useMutation(trpc.duAn.dong.mutationOptions());
	const moLai = useMutation(trpc.duAn.moLai.mutationOptions());
	const xoa = useMutation(trpc.duAn.xoa.mutationOptions());
	const conMo = Math.max(0, duAn.soViec - duAn.soXong);
	const khoang = khoangNgay(duAn.batDauSom, duAn.hanMuon);
	const tomTat = duAn.dong
		? m.daDong
		: (duAn.moTa ??
			(khoang
				? dien(m.tomTat, {
						n: duAn.soViec,
						tu: ngayNgan(duAn.batDauSom ?? ""),
						den: ngayNgan(duAn.hanMuon ?? ""),
					})
				: dien(m.tomTatRong, { n: duAn.soViec })));

	const chay = async (
		lam: () => Promise<unknown>,
		xong: string,
		sau?: () => void,
	) => {
		try {
			await lam();
			await cache.viec();
			toast.success(xong);
			setHoi(null);
			sau?.();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : xong);
		}
	};

	const dongDuAn = () =>
		chay(() => dong.mutateAsync({ id: duAn.id }), m.daDongToast);

	const coSua = !duAn.dong;
	const coMenu = coSua || duAn.quyen.dong || duAn.quyen.xoa;

	return (
		<Item data-dai-du-an={duAn.id} variant="outline">
			<ItemContent>
				<ItemTitle translate="no">{duAn.ten}</ItemTitle>
				<ItemDescription>
					<span translate={duAn.moTa && !duAn.dong ? "no" : undefined}>
						{tomTat}
					</span>
				</ItemDescription>
				{duAn.mocKe ? (
					<StatusIndicator
						data-moc-ke=""
						label={
							<span translate="no">
								{dien(m.mocKe, {
									ten: duAn.mocKe.ten,
									ngay: ngayNgan(duAn.mocKe.ngay),
								})}
							</span>
						}
						tone={duAn.mocKe.tre ? "error" : "neutral"}
					/>
				) : null}
			</ItemContent>
			{coMenu ? (
				<ItemActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button aria-label={m.thaoTac} size="icon" variant="ghost">
								<OverflowMenuHorizontal aria-hidden="true" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{coSua ? (
								<>
									<DropdownMenuItem onSelect={() => setHoi("sua")}>
										{m.sua}
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => setHoi("moc")}>
										{m.themMoc}
									</DropdownMenuItem>
								</>
							) : null}
							{duAn.quyen.dong && !duAn.dong ? (
								<DropdownMenuItem
									data-dong-du-an=""
									onSelect={() => {
										if (conMo > 0) setHoi("dong");
										else void dongDuAn();
									}}
								>
									{m.dong}
								</DropdownMenuItem>
							) : null}
							{duAn.quyen.dong && duAn.dong ? (
								<DropdownMenuItem
									data-mo-lai-du-an=""
									onSelect={() =>
										void chay(
											() => moLai.mutateAsync({ id: duAn.id }),
											m.daMoLaiToast,
										)
									}
								>
									{m.moLai}
								</DropdownMenuItem>
							) : null}
							{duAn.quyen.xoa ? (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										data-xoa-du-an=""
										onSelect={() => setHoi("xoa")}
										variant="destructive"
									>
										{m.xoa}
									</DropdownMenuItem>
								</>
							) : null}
						</DropdownMenuContent>
					</DropdownMenu>
				</ItemActions>
			) : null}
			<ConfirmDialog
				nut={m.vanDong}
				onConfirm={() => void dongDuAn()}
				onOpenChange={(mo) => setHoi(mo ? "dong" : null)}
				open={hoi === "dong"}
				pending={dong.isPending}
				than={m.hoiDongThan}
				thoi={m.thoi}
				tieuDe={dien(m.hoiDong, { n: conMo })}
				tone="default"
			/>
			<ConfirmDialog
				nut={m.nutXoa}
				onConfirm={() =>
					void chay(
						() => xoa.mutateAsync({ id: duAn.id }),
						m.daXoaToast,
						onDaXoa,
					)
				}
				onOpenChange={(mo) => setHoi(mo ? "xoa" : null)}
				open={hoi === "xoa"}
				pending={xoa.isPending}
				than={m.hoiXoaThan}
				thoi={m.thoi}
				tieuDe={dien(m.hoiXoa, { ten: duAn.ten })}
			/>
			<HopDuAn
				onOpenChange={(mo) => setHoi(mo ? "sua" : null)}
				onXong={() => setHoi(null)}
				open={hoi === "sua"}
				sua={{ id: duAn.id, ten: duAn.ten, moTa: duAn.moTa }}
			/>
			<HopThemMoc
				duAnId={duAn.id}
				onOpenChange={(mo) => setHoi(mo ? "moc" : null)}
				open={hoi === "moc"}
			/>
		</Item>
	);
}
