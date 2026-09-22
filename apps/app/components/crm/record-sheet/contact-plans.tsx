"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import { DetailSheetSection } from "@/components/detail-sheet";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { dien } from "./plan-copy";
import { useOpenRecord } from "./record-stack";

export function ContactPlans({ contactId }: { contactId: string }) {
	const locale = useLocale();
	const m = keHoachNoiMessages(locale).caNhan;
	const bac = onboardingMessages(locale).bac;
	const trpc = useTRPC();
	const openRecord = useOpenRecord();
	const query = useQuery(
		trpc.onboarding.plansOfContact.queryOptions({ contactId }),
	);

	if (!query.data || query.data.length === 0) return null;

	return (
		<DetailSheetSection title={m.tieuDe}>
			<ul className="flex flex-col">
				{query.data.map((dong) => (
					<li key={dong.planId}>
						<button
							type="button"
							data-ke-hoach={dong.planId}
							onClick={() => openRecord({ kind: "plan", id: dong.planId })}
							className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
						>
							<span className="truncate font-medium" translate="no">
								{dong.companyName}
							</span>
							<span className="shrink-0 text-muted-foreground">
								{dong.bac === null
									? m.chuaDat
									: dien(m.daDat, { bac: bac[dong.bac] })}
							</span>
						</button>
					</li>
				))}
			</ul>
		</DetailSheetSection>
	);
}
