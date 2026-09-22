"use client";

import Close from "@carbon/icons-react/es/Close";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { type Bac, OBac } from "@/app/(app)/[slug]/onboarding/[planId]/o-bac";
import { ThemMoiGioi } from "@/app/(app)/[slug]/onboarding/[planId]/them-moi-gioi";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { dien } from "./plan-copy";

type GhiDanh = RouterOutputs["onboarding"]["listEnrollments"][number];

const BAC: readonly Bac[] = ["accountAt", "courseAt", "activeAt", "dealAt"];

function HangMoiGioi({
	ghiDanh,
	planId,
	khoa,
}: {
	ghiDanh: GhiDanh;
	planId: string;
	khoa: boolean;
}) {
	const m = onboardingMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [hoi, setHoi] = useState(false);
	const go = useMutation(
		trpc.onboarding.removeEnrollment.mutationOptions({
			onSuccess: () => {
				setHoi(false);
				void cache.plan(planId);
			},
			onError: (loi) => toast.error(loi.message),
		}),
	);

	return (
		<SimpleTableRow data-ghi-danh={ghiDanh.id}>
			<TableCell className="pl-5 font-medium" translate="no">
				{ghiDanh.contactName}
			</TableCell>
			{BAC.map((bac) => (
				<TableCell key={bac}>
					<OBac
						bac={bac}
						enrollmentId={ghiDanh.id}
						ngay={ghiDanh[bac] === null ? null : String(ghiDanh[bac])}
						planId={planId}
						tenNguoi={ghiDanh.contactName}
					/>
				</TableCell>
			))}
			<TableCell>
				<Button
					aria-label={dien(m.removeBroker, { ten: ghiDanh.contactName })}
					disabled={khoa || go.isPending}
					onClick={() => setHoi(true)}
					size="icon-sm"
					variant="ghost"
				>
					<Icon icon={Close} />
				</Button>
				<ConfirmDialog
					nut={m.confirmRemoveBroker.action}
					onConfirm={() => {
						if (go.isPending) return;
						go.mutate({ planId, contactId: ghiDanh.contactId });
					}}
					onOpenChange={(mo) => {
						if (!mo && !go.isPending) setHoi(false);
					}}
					open={hoi}
					pending={go.isPending}
					than={m.confirmRemoveBroker.body}
					thoi={m.confirmRemoveBroker.cancel}
					tieuDe={dien(m.confirmRemoveBroker.title, {
						ten: ghiDanh.contactName,
					})}
				/>
			</TableCell>
		</SimpleTableRow>
	);
}

export function PlanBrokers({
	planId,
	closed,
}: {
	planId: string;
	closed: boolean;
}) {
	const t = onboardingMessages(useLocale());
	const m = t.sheet;
	const trpc = useTRPC();
	const ghiDanh = useQuery(
		trpc.onboarding.listEnrollments.queryOptions({ id: planId }),
	);
	const ds = ghiDanh.data ?? [];
	const tong = ds.length;
	const daTrongPheu = ds.map((e) => e.contactId);

	if (ghiDanh.isSuccess && tong === 0) {
		return (
			<DetailSheetBody>
				<DetailSheetEmpty
					action={
						closed ? undefined : (
							<ThemMoiGioi daTrongPheu={daTrongPheu} planId={planId} />
						)
					}
					description={m.noBrokers.body}
					icon={UserMultiple}
					title={m.noBrokers.title}
				/>
			</DetailSheetBody>
		);
	}

	const cot = [
		{ id: "ten", header: m.brokerName, width: "w-[28%]", className: "pl-5" },
		...BAC.map((bac) => ({ id: bac, header: t.bac[bac], width: "w-[16%]" })),
		{ id: "go", srLabel: m.confirmRemoveBroker.action, width: "w-10" },
	];

	return (
		<DetailSheetBody>
			<DetailSheetSection title={dien(m.funnel, { n: tong })}>
				<div className="grid grid-cols-2 gap-x-6 gap-y-3">
					{BAC.map((bac) => {
						const dat = ds.filter((e) => e[bac] !== null).length;
						return (
							<div className="flex flex-col gap-1.5" key={bac}>
								<div className="flex items-baseline justify-between gap-3 text-sm">
									<span>{t.bac[bac]}</span>
									<span className="tabular-nums">
										{dat}/{tong}
									</span>
								</div>
								<Progress value={tong === 0 ? 0 : (dat / tong) * 100} />
							</div>
						);
					})}
				</div>
			</DetailSheetSection>
			<SimpleTable columns={cot}>
				{ds.map((e) => (
					<HangMoiGioi ghiDanh={e} key={e.id} khoa={closed} planId={planId} />
				))}
			</SimpleTable>
			{closed ? null : (
				<div className="px-5 py-3">
					<ThemMoiGioi daTrongPheu={daTrongPheu} planId={planId} />
				</div>
			)}
		</DetailSheetBody>
	);
}
