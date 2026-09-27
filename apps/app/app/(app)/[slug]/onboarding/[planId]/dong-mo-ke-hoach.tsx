"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
				onConfirm={() => {
					if (dong.isPending) return;
					dong.mutate(
						{ id: planId },
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
