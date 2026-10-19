"use client";

import Rocket from "@carbon/icons-react/es/Rocket";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TaoKeHoach } from "@/app/(app)/[slug]/onboarding/tao-ke-hoach";
import { recordSheetMessages } from "@/lib/messages/record-sheet";
import { useTRPC } from "@/lib/trpc/client";
import { dienNode } from "./plan-copy";

export function TheGoiYKeHoach({ dealId }: { dealId: string }) {
	const m = recordSheetMessages(useLocale()).deal.goiYKeHoach;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [dangTao, setDangTao] = useState(false);
	const khoa = trpc.onboarding.goiYCuaDeal.queryKey({ dealId });
	const query = useQuery(trpc.onboarding.goiYCuaDeal.queryOptions({ dealId }));
	const boQua = useMutation(
		trpc.onboarding.boQuaGoiY.mutationOptions({
			onMutate: () => {
				const truoc = queryClient.getQueryData(khoa);
				queryClient.setQueryData(khoa, null);
				return { truoc };
			},
			onError: (loi, _bien, ngu) => {
				queryClient.setQueryData(khoa, ngu?.truoc ?? null);
				toast.error(`${loi.message} ${m.taiLai}`);
			},
		}),
	);

	const goiY = query.data;
	if (!goiY) return null;

	const doiMo = (mo: boolean) => {
		setDangTao(mo);
		if (!mo) void queryClient.invalidateQueries({ queryKey: khoa });
	};

	return (
		<Alert data-goi-y-ke-hoach={goiY.id}>
			<Icon icon={Rocket} />
			<AlertTitle>
				{dienNode(m.tieuDe, {
					congTy: (
						<span className="break-words" translate="no">
							{goiY.companyName}
						</span>
					),
				})}
			</AlertTitle>
			<AlertDescription>
				<p>{m.moTa}</p>
				<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
					<Button
						aria-haspopup="dialog"
						data-nut="mo-ke-hoach"
						onClick={() => setDangTao(true)}
						size="sm"
					>
						{m.mo}
					</Button>
					<Button
						data-nut="bo-qua-goi-y"
						disabled={boQua.isPending}
						onClick={() => boQua.mutate({ id: goiY.id })}
						size="sm"
						variant="outline"
					>
						{m.boQua}
					</Button>
				</div>
			</AlertDescription>
			<TaoKeHoach
				congTyCoDinh={{ id: goiY.companyId, name: goiY.companyName }}
				mo={dangTao}
				doiMo={doiMo}
			/>
		</Alert>
	);
}
