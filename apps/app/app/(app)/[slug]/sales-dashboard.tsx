"use client";

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import type { ChartConfig } from "@crm/ui/components/chart";
import { DashboardRow, StatGroup } from "@crm/ui/components/dashboard";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatCard, type StatDelta } from "@crm/ui/components/stat-card";
import {
	formatCount,
	formatMoney,
	formatMoneyCompact,
	formatMonth,
	formatPercent,
} from "@crm/ui/lib/format";
import Link from "next/link";
import type { ReactNode } from "react";
import { AreaTrend, DonutStat } from "@/components/dashboard-charts";
import { dealStageColor, dealStageLabel } from "@/lib/deal-stage";
import { tongQuanMessages } from "@/lib/messages/tong-quan";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type Summary = RouterOutputs["dashboard"]["summary"];

function changeDelta(
	current: number,
	previous: number,
	label: string,
): StatDelta | undefined {
	if (previous === 0) return undefined;
	const change = Math.round(((current - previous) / previous) * 100);
	return {
		value: `${change >= 0 ? "+" : ""}${change}%`,
		direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
		label,
	};
}

export function SalesDashboard({ summary }: { summary: Summary }) {
	const locale = useLocale();
	const workspaceUrl = useWorkspaceUrl();
	const m = tongQuanMessages(locale);
	const trendConfig: ChartConfig = {
		won: { label: m.trend.won, color: "var(--success)" },
		created: { label: m.trend.created, color: "var(--chart-1)" },
	};
	const soThoaThuan = (n: number) => formatCount(n, m.stats.dealNoun, locale);
	const thang = (iso: string) => formatMonth(iso, locale);

	const {
		pipeline,
		wonThisMonth,
		wonPrevMonth,
		performance,
		trend,
		closingThisMonthTotal,
		reportingCurrency,
		unconverted,
	} = summary;

	const money = (cents: number) =>
		formatMoneyCompact(cents, reportingCurrency, locale);
	const exact = (value: number | string) =>
		formatMoney(Number(value), reportingCurrency, locale);

	const hasTrend = trend.some((point) => point.won > 0 || point.created > 0);

	const stageSlices = pipeline.stages.flatMap((stage) =>
		stage.valueCents > 0
			? [
					{
						key: stage.stage,
						label: dealStageLabel(stage.stage),
						value: stage.valueCents,
						color: dealStageColor(stage.stage),
						count: stage.count,
					},
				]
			: [],
	);

	return (
		<div className="flex flex-col gap-6">
			<StatGroup>
				<StatCard
					label={m.stats.closedWon}
					value={money(wonThisMonth.valueCents)}
					delta={changeDelta(
						wonThisMonth.valueCents,
						wonPrevMonth.valueCents,
						m.stats.vsLastMonth,
					)}
					description={m.stats.closedWonDesc(
						soThoaThuan(wonThisMonth.count),
						money(wonPrevMonth.valueCents),
					)}
				/>
				<StatCard
					label={m.stats.openPipeline}
					value={money(pipeline.totalCents)}
					description={m.stats.openPipelineDesc(
						soThoaThuan(pipeline.totalDeals),
						money(closingThisMonthTotal.valueCents),
					)}
				/>
				<StatCard
					label={m.stats.winRate(String(performance.windowDays))}
					value={
						performance.winRate === null
							? "—"
							: formatPercent(performance.winRate, locale)
					}
					description={
						performance.wins + performance.losses === 0
							? m.stats.nothingClosed
							: m.stats.wonLost(
									String(performance.wins),
									String(performance.losses),
								)
					}
				/>
				<StatCard
					label={m.stats.avgDeal(String(performance.windowDays))}
					value={
						performance.avgDealCents === null
							? "—"
							: money(performance.avgDealCents)
					}
					description={
						performance.avgCycleDays === null
							? m.stats.noWins
							: m.stats.avgCycle(String(performance.avgCycleDays))
					}
				/>
			</StatGroup>

			{unconverted.count > 0 ? (
				<p className="text-muted-foreground text-xs">
					{m.unconverted.sentence(
						soThoaThuan(unconverted.count),
						unconverted.currencies.join(", "),
						reportingCurrency,
					)}{" "}
					<Link
						href={workspaceUrl("/settings/currencies")}
						className="underline hover:no-underline"
					>
						{m.unconverted.setOne}
					</Link>
					.
				</p>
			) : null}

			<DashboardRow split="hero">
				<ChartPanel title={m.trend.title} description={m.trend.description}>
					{hasTrend ? (
						<div className="flex flex-1 flex-col justify-center py-4">
							<AreaTrend
								data={trend}
								config={trendConfig}
								xKey="month"
								formatX={thang}
								height={196}
								variant="gradient"
								bloom="high"
								showLegend
								formatValue={exact}
							/>
						</div>
					) : (
						<EmptyChart label={m.trend.empty} />
					)}
				</ChartPanel>

				<ChartPanel title={m.byStage.title} description={m.byStage.description}>
					{stageSlices.length > 0 ? (
						<div className="flex flex-1 flex-col justify-between gap-1 pt-4">
							<DonutStat
								data={stageSlices}
								height={168}
								centerValue={money(pipeline.totalCents)}
								centerLabel={m.byStage.center}
								formatValue={exact}
							/>
							<ul className="flex flex-col px-5 pb-1 md:px-6">
								{stageSlices.map((slice) => (
									<li key={slice.key} className="border-t first:border-t-0">
										<Link
											href={`${workspaceUrl("/deals")}?stage=${slice.key}`}
											className="flex items-center gap-2.5 py-2 text-xs hover:underline"
										>
											<span
												aria-hidden
												className="size-1.5 shrink-0"
												style={{ backgroundColor: slice.color }}
											/>
											<span className="min-w-0 flex-1 truncate" lang="en">
												{slice.label}
											</span>
											<span className="shrink-0 text-muted-foreground tabular-nums">
												{slice.count}
											</span>
											<span className="w-16 shrink-0 text-right font-medium tabular-nums">
												{money(slice.value)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					) : (
						<EmptyChart label={m.byStage.empty} />
					)}
				</ChartPanel>
			</DashboardRow>
		</div>
	);
}

function ChartPanel({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<Card className="min-w-0">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<div className="flex flex-1 flex-col border">{children}</div>
		</Card>
	);
}

function EmptyChart({ label }: { label: string }) {
	return (
		<div className="flex flex-1 items-center justify-center px-5 py-10 text-muted-foreground text-sm md:px-6">
			{label}
		</div>
	);
}
