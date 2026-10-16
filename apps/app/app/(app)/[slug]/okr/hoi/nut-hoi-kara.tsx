"use client";

import { Button } from "@crm/ui/components/button";
import { KaraMark } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useMutationState } from "@tanstack/react-query";
import { useRecordStack } from "@/components/crm/record-sheet/record-stack";
import { okrHoiMessages } from "@/lib/messages/okr-hoi";
import { useTRPC } from "@/lib/trpc/client";

export function NutHoiKara() {
	const m = okrHoiMessages(useLocale());
	const trpc = useTRPC();
	const { open } = useRecordStack();
	const mo = useMutation(
		trpc.okr.hoiMo.mutationOptions({
			onSuccess: (kq) => open({ kind: "hoi-okr", id: kq.cuocHoiId }),
		}),
	);
	const lanCuoi = useMutationState({
		filters: { mutationKey: trpc.okr.hoiMo.mutationKey() },
		select: (lan) => lan.state.status,
	}).at(-1);
	const dangMo = mo.isPending || lanCuoi === "pending";
	const loi = mo.isError || lanCuoi === "error";
	return (
		<div className="flex flex-col items-end gap-1">
			<Button
				variant="outline"
				data-nut="hoi-kara"
				disabled={dangMo}
				onClick={() => mo.mutate({})}
			>
				<KaraMark />
				{dangMo ? m.nut.dangMo : m.nut.hoi}
			</Button>
			{loi ? (
				<p className="text-muted-foreground text-sm" role="status">
					{m.nut.loiMo}
				</p>
			) : null}
		</div>
	);
}
