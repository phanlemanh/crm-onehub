"use client";

import { Button } from "@crm/ui/components/button";
import { Calendar } from "@crm/ui/components/calendar";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { formatDay, fromDay, toDay } from "@crm/ui/lib/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";

export type Bac = "accountAt" | "courseAt" | "activeAt" | "dealAt";

export function OBac({
	enrollmentId,
	planId,
	bac,
	ngay,
	tenNguoi,
}: {
	enrollmentId: string;
	planId: string;
	bac: Bac;
	ngay: string | null;
	tenNguoi: string;
}) {
	const locale = useLocale();
	const m = onboardingMessages(locale);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [mo, setMo] = useState(false);

	const danhDau = useMutation(
		trpc.onboarding.markEnrollmentStage.mutationOptions(),
	);

	const ghi = (at: string | null) => {
		if (danhDau.isPending) return;
		setMo(false);
		danhDau.mutate(
			{ id: enrollmentId, stage: bac, at },
			{
				onSuccess: () =>
					queryClient.invalidateQueries({
						queryKey: trpc.onboarding.listEnrollments.queryKey({ id: planId }),
					}),
				onError: (error) => toast.error(error.message),
			},
		);
	};

	const nhanBac = m.bac[bac];
	const ngayHien = ngay === null ? null : ngay.slice(0, 10);

	if (ngayHien === null) {
		return (
			<Button
				variant="outline"
				size="sm"
				disabled={danhDau.isPending}
				aria-label={m.bac.danhDau
					.replace("{bac}", nhanBac)
					.replace("{ten}", tenNguoi)}
				data-bac={bac}
				onClick={() => ghi(toDay(new Date()))}
			>
				—
			</Button>
		);
	}

	return (
		<Popover open={mo} onOpenChange={setMo}>
			<PopoverTrigger asChild>
				<Button
					variant="secondary"
					size="sm"
					disabled={danhDau.isPending}
					aria-label={m.bac.doiNgay
						.replace("{bac}", nhanBac)
						.replace("{ten}", tenNguoi)}
					data-bac={bac}
				>
					{formatDay(ngayHien, locale)}
				</Button>
			</PopoverTrigger>
			<PopoverContent size="fit" align="start">
				<Calendar
					mode="single"
					selected={fromDay(ngayHien)}
					onSelect={(chon) => {
						if (chon) ghi(toDay(chon));
					}}
				/>
				<div className="border-t p-1">
					<Button
						variant="ghost"
						size="sm"
						className="w-full justify-start"
						onClick={() => ghi(null)}
					>
						{m.bac.boDanhDau}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
