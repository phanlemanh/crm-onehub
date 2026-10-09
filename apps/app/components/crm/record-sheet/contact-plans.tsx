"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useQuery } from "@tanstack/react-query";
import { DetailSheetSection } from "@/components/detail-sheet";
import { crmMessages } from "@/lib/messages/crm";
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

	const vungCon = crmMessages(locale).vungCon;

	if (query.isPending) {
		return (
			<DetailSheetSection title={m.tieuDe}>
				<div aria-busy="true" className="flex flex-col gap-2">
					<span className="sr-only">{vungCon.dangTai}</span>
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</DetailSheetSection>
		);
	}

	if (query.isError) {
		return (
			<DetailSheetSection title={m.tieuDe}>
				<VungTaiLoi
					tieuDe={keHoachNoiMessages(locale).congTy.loi}
					moTa={vungCon.loiMoTa}
					onThuLai={() => void query.refetch()}
					dangTai={query.isFetching}
				/>
			</DetailSheetSection>
		);
	}

	if (!query.data || query.data.length === 0) return null;

	return (
		<DetailSheetSection title={m.tieuDe}>
			<ul className="flex flex-col">
				{query.data.map((dong) => (
					<li key={dong.planId}>
						<Button
							variant="ghost"
							data-ke-hoach={dong.planId}
							onClick={() => openRecord({ kind: "plan", id: dong.planId })}
							className="w-full justify-between"
						>
							<span className="truncate font-medium" translate="no">
								{dong.companyName}
							</span>
							<span className="shrink-0 text-muted-foreground">
								{dong.bac === null
									? m.chuaDat
									: dien(m.daDat, { bac: bac[dong.bac] })}
							</span>
						</Button>
					</li>
				))}
			</ul>
		</DetailSheetSection>
	);
}
