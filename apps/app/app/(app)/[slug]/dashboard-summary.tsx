"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardPanel,
	CardPanelEmpty,
	CardTitle,
} from "@crm/ui/components/card";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { formatCount, formatMoneyCompact } from "@crm/ui/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryState } from "nuqs";
import type { CSSProperties, ReactNode } from "react";
import { toast } from "sonner";
import { DealStageIndicator } from "@/components/crm/deal-stage";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { RecordLink } from "@/components/crm/record-sheet/record-link";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { ActivityIcon } from "@/components/crm/timeline/activity-icon";
import { LocalRelativeTime } from "@/components/local-date-time";
import { CELL, DongViecTongQuan } from "@/components/viec/dong-viec-tong-quan";
import { activityLabel } from "@/lib/activity-presentation";
import { useGiaiDoan } from "@/lib/giai-doan";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import { nhacMessages } from "@/lib/messages/nhac";
import {
	type TongQuanMessages,
	tongQuanMessages,
} from "@/lib/messages/tong-quan";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { buocQuaHan, DongBuoc, ngayCuaBuoc } from "./dong-buoc";
import { DongKeHoach } from "./dong-ke-hoach";
import { DongTaiLieu } from "./dong-tai-lieu";
import { KhoiKrCuaToi } from "./okr/khoi-kr-cua-toi";
import { ViecOkrCuaToi } from "./okr/viec-cua-toi";
import { overviewParsers } from "./overview-search-params";
import { SalesDashboard } from "./sales-dashboard";

function cot(m: TongQuanMessages) {
	const open: SimpleTableColumn[] = [
		{ id: "deal", header: m.open.cols.deal },
		{
			id: "stage",
			header: m.open.cols.stage,
			width: "w-32",
			className: "hidden lg:table-cell",
		},
		{
			id: "share",
			srLabel: m.open.cols.share,
			width: "w-24",
			className: "hidden sm:table-cell",
		},
		{ id: "value", header: m.open.cols.value, width: "w-24", align: "right" },
	];
	const tasks: SimpleTableColumn[] = [
		{ id: "done", srLabel: m.tasks.cols.done, width: "w-8" },
		{ id: "task", header: m.tasks.cols.task },
		{
			id: "overdue",
			header: m.tasks.cols.overdue,
			width: "w-24",
			align: "right",
		},
	];
	const activity: SimpleTableColumn[] = [
		{ id: "activity", header: m.activity.cols.activity },
		{
			id: "company",
			header: m.activity.cols.company,
			width: "w-44",
			className: "hidden md:table-cell",
		},
		{
			id: "deal",
			header: m.activity.cols.deal,
			width: "w-48",
			className: "hidden lg:table-cell",
		},
		{
			id: "who",
			header: m.activity.cols.who,
			width: "w-32",
			className: "hidden md:table-cell",
		},
		{ id: "when", header: m.activity.cols.when, width: "w-20", align: "right" },
	];
	return { open, tasks, activity };
}

export function DashboardSummary() {
	const giaiDoan = useGiaiDoan();
	const locale = useLocale();
	const m = tongQuanMessages(locale);
	const COT = cot(m);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();
	const workspaceUrl = useWorkspaceUrl();

	const [scope] = useQueryState(
		SEARCH_PARAM.overview.scope,
		overviewParsers[SEARCH_PARAM.overview.scope],
	);

	const summaryQuery = useQuery({
		...trpc.dashboard.summary.queryOptions({ scope }),
		placeholderData: (previous) => previous,
	});

	const queryClient = useQueryClient();
	const xongBuoc = useMutation(
		trpc.onboarding.setStepDone.mutationOptions({
			onError: (error) => toast.error(error.message),
		}),
	);

	const summary = summaryQuery.data;

	if (!summary) {
		return (
			<div className="flex flex-1 justify-center py-12">
				<Spinner />
			</div>
		);
	}

	const {
		biggestOpen,
		overdueTasks,
		recentActivity,
		mySteps,
		keHoachCanDeY,
		taiLieuChoDuyet,
		viecQuaHan,
	} = summary;
	const now = new Date();
	const theoHan = [
		...overdueTasks.map((viec) => ({
			loai: "viec" as const,
			id: viec.id,
			han:
				viec.dueAt === null ? Number.POSITIVE_INFINITY : Date.parse(viec.dueAt),
			viec,
		})),
		...viecQuaHan.map((viec) => ({
			loai: "viecChung" as const,
			id: viec.id,
			han: Date.parse(`${viec.hanNgay}T00:00:00Z`),
			viec,
		})),
		...mySteps.map((buoc) => ({
			loai: "buoc" as const,
			id: buoc.stepId,
			han: ngayCuaBuoc(buoc.dueAt).getTime(),
			buoc,
		})),
	].sort((a, b) => a.han - b.han || a.id.localeCompare(b.id));
	const keHoach = [
		...keHoachCanDeY.filter((k) => k.loai === "ke-hoach-im"),
		...keHoachCanDeY.filter((k) => k.loai === "moc-ngay"),
	].map((keHoach) => ({
		loai: "keHoach" as const,
		id: `${keHoach.loai}:${keHoach.planId}`,
		keHoach,
	}));
	const taiLieu =
		taiLieuChoDuyet > 0
			? [
					{
						loai: "taiLieu" as const,
						id: "tai-lieu-cho-duyet",
						so: taiLieuChoDuyet,
					},
				]
			: [];
	const dong = [...taiLieu, ...theoHan, ...keHoach];
	const dangHienQuaHan =
		overdueTasks.length +
		viecQuaHan.length +
		mySteps.filter((b) => buocQuaHan(b, now)).length;
	const soQuaHan = summary.quaHan.viec + summary.quaHan.buoc;
	const conSot = Math.max(0, soQuaHan - dangHienQuaHan);
	const soIm = keHoachCanDeY.filter((k) => k.loai === "ke-hoach-im").length;
	const moTaViec =
		soQuaHan > 0
			? m.tasks.pastDue(formatCount(soQuaHan, m.tasks.taskNoun, locale))
			: mySteps.length > 0
				? dien(keHoachNoiMessages(locale).tasks.sapHan, {
						n: String(mySteps.length),
					})
				: null;
	const moTaIm =
		soIm > 0 ? dien(nhacMessages(locale).moTaIm, { n: soIm }) : null;
	const moTaTasks =
		[moTaViec, moTaIm].filter((v) => v !== null).join(" · ") || m.tasks.allDone;

	const mine = scope === "me";
	const largestOpenCents = biggestOpen[0]?.baseAmountCents ?? 0;

	return (
		<div className="flex flex-col gap-6">
			<SalesDashboard summary={summary} />

			<div className="grid gap-6 @3xl/page-content:grid-cols-2">
				<Card className="min-w-0" data-khoi="deal-dang-mo">
					<CardHeader>
						<CardTitle>{m.open.title}</CardTitle>
						<CardDescription>{m.open.description}</CardDescription>
						<CardAction>
							<Button asChild variant="contrast" size="sm">
								<Link href={workspaceUrl("/deals")}>{m.open.button}</Link>
							</Button>
						</CardAction>
					</CardHeader>
					<CardPanel>
						{biggestOpen.length === 0 ? (
							<CardPanelEmpty>{m.open.empty}</CardPanelEmpty>
						) : (
							<SimpleTable variant="panel" surface="page" columns={COT.open}>
								{biggestOpen.map((deal) => (
									<SimpleTableRow
										key={deal.id}
										clickable
										onClick={() => openRecord({ kind: "deal", id: deal.id })}
									>
										<TableCell className={CELL}>
											<DealCell
												name={deal.name}
												company={deal.company}
												meta={<LocalRelativeTime date={deal.stageChangedAt} />}
											/>
										</TableCell>
										<TableCell className={`${CELL} hidden lg:table-cell`}>
											<DealStageIndicator stage={deal.stage} />
										</TableCell>
										<TableCell className={`${CELL} hidden sm:table-cell`}>
											<ValueMeter
												share={
													largestOpenCents > 0
														? ((deal.baseAmountCents ?? 0) / largestOpenCents) *
															100
														: 0
												}
												color={giaiDoan.mau(deal.stage)}
											/>
										</TableCell>
										<TableCell className={`${CELL} text-right tabular-nums`}>
											{deal.amountCents === null ? (
												<EmptyCellValue />
											) : (
												formatMoneyCompact(
													deal.amountCents,
													deal.currency,
													locale,
												)
											)}
										</TableCell>
									</SimpleTableRow>
								))}
							</SimpleTable>
						)}
					</CardPanel>
				</Card>

				<Card className="min-w-0" data-khoi="viec-qua-han">
					<CardHeader>
						<CardTitle>{m.tasks.title}</CardTitle>
						<CardDescription>{moTaTasks}</CardDescription>
					</CardHeader>
					<CardPanel>
						{dong.length === 0 ? (
							<CardPanelEmpty>{m.tasks.empty}</CardPanelEmpty>
						) : (
							<SimpleTable variant="panel" surface="page" columns={COT.tasks}>
								{dong.map((d) =>
									d.loai === "taiLieu" ? (
										<DongTaiLieu key={d.id} so={d.so} />
									) : d.loai === "keHoach" ? (
										<DongKeHoach key={d.id} dong={d.keHoach} />
									) : d.loai === "viecChung" ? (
										<DongViecTongQuan key={d.id} viec={d.viec} />
									) : d.loai === "buoc" ? (
										<DongBuoc
											key={d.id}
											buoc={d.buoc}
											now={now}
											dangGhi={xongBuoc.isPending}
											onXong={() =>
												xongBuoc.mutate(
													{ stepId: d.buoc.stepId, done: true },
													{
														onSuccess: async () => {
															await Promise.all([
																queryClient.invalidateQueries({
																	queryKey: trpc.dashboard.summary.queryKey(),
																}),
																cache.plan(d.buoc.planId),
															]);
														},
													},
												)
											}
										/>
									) : (
										<SimpleTableRow key={d.id} data-viec={d.viec.id}>
											<TableCell className={CELL}>
												<span
													role="img"
													aria-label={activityLabel("TASK", locale)}
													className="text-muted-foreground"
												>
													<ActivityIcon type="TASK" />
												</span>
											</TableCell>
											<TableCell className={CELL}>
												<span className="flex min-w-0 flex-col" translate="no">
													<span className="truncate">{d.viec.subject}</span>
													<span className="flex min-w-0 gap-1 text-muted-foreground">
														{mine ? null : (
															<>
																<span className="shrink-0">
																	{d.viec.createdBy.name}
																</span>
																{d.viec.deal || d.viec.company ? (
																	<span aria-hidden>·</span>
																) : null}
															</>
														)}
														{d.viec.deal ? (
															<RecordLink kind="deal" id={d.viec.deal.id}>
																{d.viec.deal.name}
															</RecordLink>
														) : d.viec.company ? (
															<RecordLink kind="company" id={d.viec.company.id}>
																{d.viec.company.name}
															</RecordLink>
														) : null}
													</span>
												</span>
											</TableCell>
											<TableCell className={`${CELL} text-right`}>
												<StatusIndicator
													tone="error"
													label={
														d.viec.dueAt ? (
															<LocalRelativeTime date={d.viec.dueAt} />
														) : (
															m.tasks.noDueDate
														)
													}
												/>
											</TableCell>
										</SimpleTableRow>
									),
								)}
							</SimpleTable>
						)}
					</CardPanel>
					{conSot > 0 ? (
						<CardFooter data-con-sot={conSot}>
							{dien(m.tasks.conSot, { n: conSot })}
						</CardFooter>
					) : null}
				</Card>
			</div>

			<ViecOkrCuaToi noi="tong-quan" khiHien="khi-lien-quan" anKhiLoi />
			<KhoiKrCuaToi />

			<Card className="min-w-0" data-khoi="hoat-dong">
				<CardHeader>
					<CardTitle>
						{mine ? m.activity.titleMine : m.activity.title}
					</CardTitle>
					<CardDescription>
						{mine ? m.activity.descMine : m.activity.desc}
					</CardDescription>
					<CardAction>
						<Button asChild variant="contrast" size="sm">
							<Link href={workspaceUrl("/companies")}>{m.activity.button}</Link>
						</Button>
					</CardAction>
				</CardHeader>
				{recentActivity.length === 0 ? (
					<CardTableEmpty>{m.activity.empty}</CardTableEmpty>
				) : (
					<SimpleTable columns={COT.activity}>
						{recentActivity.map((entry) => (
							<SimpleTableRow key={entry.id}>
								<TableCell className={CELL}>
									{entry.subject ? (
										<span className="truncate" translate="no">
											{entry.subject}
										</span>
									) : (
										<span className="truncate">
											{activityLabel(entry.type, locale)}
										</span>
									)}
								</TableCell>
								<TableCell className={`${CELL} hidden md:table-cell`}>
									{entry.company ? (
										<RecordLink kind="company" id={entry.company.id}>
											<span translate="no">{entry.company.name}</span>
										</RecordLink>
									) : (
										<EmptyCellValue />
									)}
								</TableCell>
								<TableCell className={`${CELL} hidden lg:table-cell`}>
									{entry.deal ? (
										<RecordLink kind="deal" id={entry.deal.id}>
											<span translate="no">{entry.deal.name}</span>
										</RecordLink>
									) : (
										<EmptyCellValue />
									)}
								</TableCell>
								<TableCell
									className={`${CELL} hidden truncate text-muted-foreground md:table-cell`}
									translate="no"
								>
									{entry.createdBy.name}
								</TableCell>
								<TableCell
									className={`${CELL} text-right text-muted-foreground`}
								>
									<LocalRelativeTime date={entry.createdAt} />
								</TableCell>
							</SimpleTableRow>
						))}
					</SimpleTable>
				)}
			</Card>
		</div>
	);
}

function DealCell({
	name,
	company,
	meta,
}: {
	name: string;
	company: {
		name: string;
		iconUrl: string | null;
		iconDarkUrl: string | null;
		iconTone: string | null;
	};
	meta?: ReactNode;
}) {
	return (
		<span className="flex min-w-0 items-center gap-2">
			<EntityLogo
				src={company.iconUrl}
				darkSrc={company.iconDarkUrl}
				tone={company.iconTone as EntityLogoTone | null | undefined}
				name={company.name}
				size="sm"
			/>
			<span className="flex min-w-0 flex-col" translate="no">
				<span className="truncate font-medium">{name}</span>
				<span className="truncate text-muted-foreground">
					{meta ? (
						<>
							{company.name} · {meta}
						</>
					) : (
						company.name
					)}
				</span>
			</span>
		</span>
	);
}

function ValueMeter({ share, color }: { share: number; color: string }) {
	return (
		<span
			className="bloom-low flex h-1.5 w-full overflow-hidden bg-muted"
			style={{ "--bloom-color": color } as CSSProperties}
		>
			<span
				className="h-full w-(--share)"
				style={
					{
						backgroundColor: color,
						"--share": `${Math.round(Math.max(Math.min(share, 100), 0))}%`,
					} as CSSProperties
				}
			/>
		</span>
	);
}
