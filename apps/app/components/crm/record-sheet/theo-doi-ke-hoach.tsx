"use client";

import View from "@carbon/icons-react/es/View";
import ViewFilled from "@carbon/icons-react/es/ViewFilled";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { nhacMessages } from "@/lib/messages/nhac";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type KeHoach = RouterOutputs["onboarding"]["planById"];
type KetQua = RouterOutputs["onboarding"]["watch"];

export function TheoDoiKeHoach({
	plan,
	onLoi,
}: {
	plan: KeHoach;
	onLoi: (loi: boolean) => void;
}) {
	const m = nhacMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [ket, setKet] = useState<{ goc: KeHoach; ra: KetQua } | null>(null);
	const moi = ket?.goc === plan ? ket.ra : null;
	const dang = moi?.dangTheoDoi ?? plan.dangTheoDoi;
	const so = moi?.soNguoiTheoDoi ?? plan.nguoiTheoDoi.length;

	const xong = {
		onSuccess: (ra: KetQua) => {
			setKet({ goc: plan, ra });
			void cache.plan(plan.id);
		},
		onError: () => onLoi(true),
	};
	const bat = useMutation(trpc.onboarding.watch.mutationOptions(xong));
	const tat = useMutation(trpc.onboarding.unwatch.mutationOptions(xong));
	const dangGui = bat.isPending || tat.isPending;

	const nhan = dang ? m.dangTheoDoi : m.theoDoi;
	const nhanDu = so > 0 ? `${nhan} · ${so}` : nhan;

	const bam = () => {
		onLoi(false);
		(dang ? tat : bat).mutate({ planId: plan.id });
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					aria-label={nhanDu}
					aria-pressed={dang}
					disabled={dangGui}
					onClick={bam}
					size="sm"
					variant="outline"
				>
					<Icon icon={dang ? ViewFilled : View} />
					<span className="hidden sm:inline">{nhan}</span>
					{so > 0 ? (
						<>
							<span aria-hidden className="hidden sm:inline">
								·
							</span>
							<span className="tabular-nums" data-so-theo-doi>
								{so}
							</span>
						</>
					) : null}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<span className="flex flex-col">
					<span>{nhanDu}</span>
					{plan.nguoiTheoDoi.length > 0 ? (
						<span>
							{m.nguoiTheoDoi}:{" "}
							<span translate="no">
								{plan.nguoiTheoDoi.map((nguoi) => nguoi.name).join(", ")}
							</span>
						</span>
					) : (
						<span>{m.chuaAi}</span>
					)}
				</span>
			</TooltipContent>
		</Tooltip>
	);
}

export function LoiTheoDoi() {
	const m = nhacMessages(useLocale());

	return (
		<div aria-live="polite" className="border-b px-5 py-3" role="status">
			<Alert variant="destructive">
				<AlertTitle>{m.khongLuu}</AlertTitle>
				<AlertDescription>{m.khongLuuMoTa}</AlertDescription>
			</Alert>
		</div>
	);
}
