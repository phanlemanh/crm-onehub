"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatDay, toDay } from "@crm/ui/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { OwnerCell } from "@/components/crm/owner-cell";
import { Timeline } from "@/components/crm/timeline/timeline";
import {
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
} from "@/components/detail-sheet";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { PlanBrokers } from "./plan-brokers";
import { dien } from "./plan-copy";
import { PlanSteps } from "./plan-steps";
import { lyDoLoi, RecordSheetFrame } from "./record-parts";
import { useOpenRecord, useRecordSheetView } from "./record-stack";
import { LoiTheoDoi, TheoDoiKeHoach } from "./theo-doi-ke-hoach";

export type PlanDetail = RouterOutputs["onboarding"]["planById"];

function MenuKeHoach({ plan }: { plan: PlanDetail }) {
	const m = onboardingMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [hoi, setHoi] = useState(false);
	const xong = {
		onSuccess: () => {
			setHoi(false);
			void cache.plan(plan.id);
		},
		onError: (loi: { message: string }) => toast.error(loi.message),
	};
	const dong = useMutation(trpc.onboarding.closePlan.mutationOptions(xong));
	const moLai = useMutation(trpc.onboarding.reopenPlan.mutationOptions(xong));
	const daDong = plan.closedAt !== null;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button aria-label={m.menu} size="icon-sm" variant="ghost">
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{daDong ? (
						<DropdownMenuItem
							disabled={moLai.isPending}
							onSelect={() => moLai.mutate({ id: plan.id })}
						>
							{m.reopenPlan}
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem onSelect={() => setHoi(true)}>
							{m.closePlan}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDialog
				nut={m.confirmClose.action}
				onConfirm={() => {
					if (!dong.isPending) dong.mutate({ id: plan.id });
				}}
				onOpenChange={(mo) => {
					if (!mo && !dong.isPending) setHoi(false);
				}}
				open={hoi}
				pending={dong.isPending}
				than={m.confirmClose.body}
				thoi={m.confirmClose.cancel}
				tieuDe={m.confirmClose.title}
			/>
		</>
	);
}

function DaiSo({ plan }: { plan: PlanDetail }) {
	const m = onboardingMessages(useLocale()).sheet;

	return (
		<DetailSheetStats>
			<DetailSheetStat label={m.stats.day}>
				<span className="tabular-nums">
					{plan.ngayThu}/{plan.targetDays}
				</span>
			</DetailSheetStat>
			<DetailSheetStat label={m.stats.steps}>
				<span className="tabular-nums">
					{plan.buocXong}/{plan.buocTong}
				</span>
			</DetailSheetStat>
			<DetailSheetStat label={m.stats.silent}>
				<span className="tabular-nums">{dien(m.days, { n: plan.imNgay })}</span>
			</DetailSheetStat>
			<DetailSheetStat label={m.stats.owner}>
				<span translate="no">
					<OwnerCell owner={plan.owner} />
				</span>
			</DetailSheetStat>
		</DetailSheetStats>
	);
}

export function PlanSheet({ planId }: { planId: string }) {
	const locale = useLocale();
	const m = onboardingMessages(locale).sheet;
	const trpc = useTRPC();
	const openRecord = useOpenRecord();
	const { tab, setTab } = useRecordSheetView("steps");
	const [loiTheoDoi, setLoiTheoDoi] = useState(false);

	const query = useQuery(trpc.onboarding.planById.queryOptions({ id: planId }));
	const plan = query.data;

	const tabs: DetailSheetTab[] = plan
		? [
				{
					value: "steps",
					label: m.tabs.steps,
					count: plan.buocTong,
					content: <PlanSteps plan={plan} />,
				},
				{
					value: "brokers",
					label: m.tabs.brokers,
					content: (
						<PlanBrokers planId={plan.id} closed={plan.closedAt !== null} />
					),
				},
				{
					value: "activity",
					label: m.tabs.activity,
					content: <Timeline anchor={{ planId: plan.id }} />,
				},
			]
		: [];

	return (
		<RecordSheetFrame
			loading={query.isPending}
			error={query.error?.message ?? null}
			lyDo={lyDoLoi(query.error)}
			onRetry={() => void query.refetch()}
			title={plan?.company.name ?? m.subtitle}
			description={
				plan ? (
					<>
						{plan.templateName === null
							? m.subtitle
							: dien(m.subtitleKhuon, { khuon: plan.templateName })}
						{" · "}
						<button
							className="text-foreground underline-offset-2 hover:underline"
							onClick={() =>
								openRecord({ kind: "company", id: plan.company.id })
							}
							type="button"
						>
							{m.companyLink}
						</button>
					</>
				) : undefined
			}
			note={
				plan?.closedAt ? (
					<Badge variant="secondary">
						{dien(m.closedNote, {
							ngay: formatDay(toDay(new Date(plan.closedAt)), locale),
						})}
					</Badge>
				) : null
			}
			media={
				plan ? (
					<EntityLogo
						darkSrc={plan.company.iconDarkUrl}
						name={plan.company.name}
						size="lg"
						src={plan.company.iconUrl ?? plan.company.logoUrl}
						tone={plan.company.iconTone as EntityLogoTone | null | undefined}
					/>
				) : null
			}
			actions={
				plan ? (
					<>
						<TheoDoiKeHoach onLoi={setLoiTheoDoi} plan={plan} />
						<MenuKeHoach plan={plan} />
					</>
				) : null
			}
			stats={
				plan ? (
					<>
						{loiTheoDoi ? <LoiTheoDoi /> : null}
						<DaiSo plan={plan} />
					</>
				) : null
			}
			tabs={tabs}
			tab={tab}
			onTabChange={setTab}
		/>
	);
}
