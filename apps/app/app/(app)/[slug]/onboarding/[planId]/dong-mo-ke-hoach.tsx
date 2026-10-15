"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

export function DongMoKeHoach({
	planId,
	closedAt,
}: {
	planId: string;
	closedAt: string | null;
}) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [hoi, setHoi] = useState(false);
	const [huyViecMo, setHuyViecMo] = useState(true);
	const maHuy = useId();
	const dsBuoc = useQuery({
		...trpc.onboarding.listSteps.queryOptions({ planId }),
		enabled: hoi,
	});
	const soViecMo = (dsBuoc.data?.rows ?? []).filter(
		(b) =>
			b.completedAt === null &&
			b.viecTrangThai !== null &&
			b.viecTrangThai !== "XONG" &&
			b.viecTrangThai !== "HUY",
	).length;

	const dong = useMutation(trpc.onboarding.closePlan.mutationOptions());
	const moLai = useMutation(trpc.onboarding.reopenPlan.mutationOptions());

	const lamMoi = () =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: trpc.onboarding.planById.queryKey({ id: planId }),
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.onboarding.manDanhMuc.queryKey(),
			}),
			queryClient.invalidateQueries({
				queryKey: trpc.onboarding.bangCot.queryKey(),
			}),
		]);

	if (closedAt !== null) {
		return (
			<div
				className="flex items-center gap-2"
				data-trang-thai="ST-kehoach-da-dong"
			>
				<Badge variant="outline">{m.keHoach.daDong}</Badge>
				<Button
					variant="outline"
					disabled={moLai.isPending}
					onClick={() => {
						if (moLai.isPending) return;
						moLai.mutate(
							{ id: planId },
							{
								onSuccess: lamMoi,
								onError: (error) => toast.error(error.message),
							},
						);
					}}
				>
					{m.keHoach.moLai}
				</Button>
			</div>
		);
	}

	return (
		<>
			<Button variant="outline" onClick={() => setHoi(true)}>
				{m.keHoach.dong}
			</Button>
			<ConfirmDialog
				open={hoi}
				onOpenChange={(mo) => {
					if (!mo && !dong.isPending) setHoi(false);
				}}
				tieuDe={m.keHoach.xacNhanDongTieuDe}
				than={m.keHoach.xacNhanDongThan}
				nut={m.keHoach.dong}
				thoi={m.keHoach.giu}
				pending={dong.isPending}
				noiDung={
					soViecMo > 0 ? (
						<div className="flex items-center gap-2" data-o="huy-viec-mo">
							<Checkbox
								id={maHuy}
								checked={huyViecMo}
								onCheckedChange={(v) => setHuyViecMo(v === true)}
							/>
							<label htmlFor={maHuy} className="text-sm">
								{m.keHoach.huyViecMo.replace("{n}", String(soViecMo))}
							</label>
						</div>
					) : null
				}
				onConfirm={() => {
					if (dong.isPending) return;
					dong.mutate(
						soViecMo > 0 ? { id: planId, huyViecMo } : { id: planId },
						{
							onSuccess: async () => {
								setHoi(false);
								await lamMoi();
							},
							onError: (error) => {
								setHoi(false);
								toast.error(error.message);
							},
						},
					);
				}}
			/>
		</>
	);
}
