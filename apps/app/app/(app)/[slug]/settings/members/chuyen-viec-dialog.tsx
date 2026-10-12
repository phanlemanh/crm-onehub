"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { dien, dienNode } from "@/components/crm/record-sheet/plan-copy";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export { dienNode };

export type NguoiDi = { userId: string; name: string };

export function ChuyenViecDialog({
	nguoi,
	onDong,
}: {
	nguoi: NguoiDi | null;
	onDong: () => void;
}) {
	const k = keHoachNoiMessages(useLocale()).chuyen;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [nhan, setNhan] = useState("");
	const [loi, setLoi] = useState<string | null>(null);
	const mo = nguoi !== null;

	const xemTruoc = useQuery({
		...trpc.onboarding.transferPreview.queryOptions({
			fromUserId: nguoi?.userId ?? "",
		}),
		enabled: mo,
	});
	const dsNguoi = useQuery({
		...trpc.onboarding.nguoiNhanViec.queryOptions(),
		enabled: mo,
	});

	const dong = () => {
		setNhan("");
		setLoi(null);
		onDong();
	};

	const chuyen = useMutation(
		trpc.onboarding.transferWork.mutationOptions({
			onSuccess: async (kq) => {
				const tenNhan = dsNguoi.data?.find((u) => u.id === nhan)?.name ?? nhan;
				toast.success(
					dien(k.xong, {
						keHoach: String(kq.keHoach),
						buoc: String(kq.buoc),
						ten: tenNhan,
					}),
				);
				await cache.workTransferred();
				dong();
			},
			onError: (error) => setLoi(error.message),
		}),
	);

	const so = xemTruoc.data;
	const coViec = so !== undefined && (so.keHoach > 0 || so.buoc > 0);
	const ten = <span translate="no">{nguoi?.name ?? ""}</span>;
	const luaChon = (dsNguoi.data ?? [])
		.filter((u) => u.id !== nguoi?.userId)
		.map((u) => ({ value: u.id, label: u.name }));

	return (
		<Dialog
			open={mo}
			onOpenChange={(tiep) => {
				if (!tiep && !chuyen.isPending) dong();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dienNode(k.tieuDe, { ten })}</DialogTitle>
					<DialogDescription>
						{xemTruoc.isError ? (
							k.loiXemTruoc
						) : so === undefined ? (
							<Spinner />
						) : coViec ? (
							dienNode(k.coViec, {
								ten,
								keHoach: String(so.keHoach),
								buoc: String(so.buoc),
							})
						) : (
							dienNode(k.khongViec, { ten })
						)}
					</DialogDescription>
					{xemTruoc.isError ? (
						<Button
							size="sm"
							variant="outline"
							onClick={() => xemTruoc.refetch()}
						>
							{k.thuLai}
						</Button>
					) : null}
				</DialogHeader>
				{coViec ? (
					<Combobox
						aria-label={k.nguoiNhan}
						disabled={dsNguoi.isPending}
						empty={k.khongAi}
						onValueChange={setNhan}
						options={luaChon}
						placeholder={dsNguoi.isPending ? k.dangTai : k.chon}
						searchPlaceholder={k.timNguoi}
						value={nhan}
					/>
				) : null}
				{loi ? (
					<p className="text-destructive text-sm" role="alert">
						{loi}
					</p>
				) : null}
				<DialogFooter>
					<DialogClose asChild>
						<Button disabled={chuyen.isPending} variant="outline">
							{k.huy}
						</Button>
					</DialogClose>
					<Button
						disabled={!coViec || nhan === "" || chuyen.isPending}
						onClick={() => {
							if (nguoi === null || nhan === "") return;
							setLoi(null);
							chuyen.mutate({ fromUserId: nguoi.userId, toUserId: nhan });
						}}
					>
						{k.xacNhan}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
