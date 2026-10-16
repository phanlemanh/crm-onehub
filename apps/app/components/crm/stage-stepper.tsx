"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { cn } from "@crm/ui/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { DealStageIndicator } from "@/components/crm/deal-stage";
import { useGiaiDoan } from "@/lib/giai-doan";
import { crmMessages } from "@/lib/messages/crm";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export function StageStepper({
	dealId,
	stage,
}: {
	dealId: string;
	stage: string;
}) {
	const trpc = useTRPC();
	const giaiDoan = useGiaiDoan();
	const cache = useCrmCache();
	const m = crmMessages(useLocale());

	const setStage = useMutation(
		trpc.deals.setStage.mutationOptions({
			onSuccess: async (result) => {
				await cache.deal(dealId);
				if (result.changed) toast.success(m.close.stageUpdated);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const mo = giaiDoan.open.map((g) => g.id);
	const chot = giaiDoan.stages.filter((g) => g.kind === "WON").map((g) => g.id);
	const hienChot = chot.includes(stage) ? stage : chot[0];
	const rail = hienChot ? [...mo, hienChot] : mo;
	const exited = giaiDoan.laThua(stage);
	const steps = exited ? mo : rail;
	const currentIndex = steps.indexOf(stage);

	return (
		<ol className="flex w-full gap-1">
			{steps.map((option, index) => {
				const reached = !exited && index <= currentIndex;
				const current = !exited && option === stage;
				return (
					<li key={option} className="flex min-w-0 flex-1">
						<button
							type="button"
							aria-current={current ? "step" : undefined}
							disabled={setStage.isPending}
							onClick={() => setStage.mutate({ id: dealId, stage: option })}
							className={cn(
								"min-w-0 flex-1 border-t-2 pt-2 text-left text-xs transition-colors disabled:pointer-events-none disabled:opacity-50",
								reached
									? "border-foreground text-foreground"
									: "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
								current && "font-medium",
							)}
						>
							<span className="block wrap-anywhere md:truncate">
								{current && chot.includes(option) ? (
									<DealStageIndicator
										stage={stage}
										wrapLabel
										className="text-xs"
									/>
								) : (
									<span translate="no">{giaiDoan.label(option)}</span>
								)}
							</span>
						</button>
					</li>
				);
			})}

			{exited ? (
				<li className="flex min-w-0 flex-1">
					<div className="min-w-0 flex-1 border-foreground border-t-2 pt-2">
						<DealStageIndicator stage={stage} wrapLabel className="text-xs" />
					</div>
				</li>
			) : null}
		</ol>
	);
}
