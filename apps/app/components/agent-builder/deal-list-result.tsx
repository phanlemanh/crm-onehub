"use client";

import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { useKhoMan } from "@crm/ui/hooks/use-kho-man";
import { formatMoney } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { CompanyCell } from "@/components/crm/company-cell";
import { DealStageIndicator } from "@/components/crm/deal-stage";
import { OwnerCell } from "@/components/crm/owner-cell";
import { usePrefetchRecord } from "@/components/crm/record-sheet/record-prefetch";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { LocalDay } from "@/components/local-date-time";
import type { DealListItem, DealListResult } from "@/lib/agent-transcript";
import { useGiaiDoan } from "@/lib/giai-doan";
import {
	type KetQuaMessages,
	ketQuaMessages,
} from "@/lib/messages/agent-builder-ket-qua";
import { traBangChu } from "@/lib/tra-bang-chu";

function cotBang(t: KetQuaMessages): SimpleTableColumn[] {
	return [
		{ id: "deal", header: t.thoaThuan.cot.deal, width: "w-[20%]" },
		{ id: "company", header: t.thoaThuan.cot.company, width: "w-[18%]" },
		{ id: "stage", header: t.thoaThuan.cot.stage, width: "w-[18%]" },
		{
			id: "amount",
			header: t.thoaThuan.cot.amount,
			width: "w-[12%]",
			align: "right",
		},
		{ id: "owner", header: t.thoaThuan.cot.owner, width: "w-[14%]" },
		{ id: "close", header: t.thoaThuan.cot.closeDate, width: "w-[12%]" },
		{
			id: "idle",
			header: t.thoaThuan.cot.idle,
			width: "w-[8%]",
			align: "right",
		},
	];
}

export function DealListResultTable({ result }: { result: DealListResult }) {
	const locale = useLocale();
	const openRecord = useOpenRecord();
	const prefetchRecord = usePrefetchRecord();
	const count = result.deals.length;
	const t = ketQuaMessages(locale);
	const cot = cotBang(t);
	const title = tableTitle(result, t);
	const kho = useKhoMan();

	return (
		<section aria-label={title} className="flex w-full flex-col gap-3">
			{kho === "dien-thoai" ? null : (
				<div className={kho === "may-tinh" ? undefined : "hidden md:block"}>
					<SimpleTable
						columns={cot}
						className="min-w-[56rem] table-fixed [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4"
						headerHeight="h-11"
					>
						{count === 0 ? (
							<SimpleTableRow>
								<TableCell
									colSpan={cot.length}
									className="h-32 whitespace-normal py-8 text-center align-middle text-muted-foreground"
								>
									{t.thoaThuan.khongCo}
								</TableCell>
							</SimpleTableRow>
						) : (
							result.deals.map((deal) => {
								const record = { kind: "deal" as const, id: deal.id };

								return (
									<SimpleTableRow
										key={deal.id}
										clickable
										onClick={() => openRecord(record)}
										onFocus={() => prefetchRecord(record)}
										onMouseEnter={() => prefetchRecord(record)}
									>
										<TableCell className="overflow-hidden px-3 py-3">
											<span className="block truncate font-medium">
												{deal.name}
											</span>
										</TableCell>
										<TableCell className="overflow-hidden px-3 py-3">
											<CompanyCell company={deal.company} />
										</TableCell>
										<TableCell className="overflow-hidden px-3 py-3">
											<Stage stage={deal.stage} stageId={deal.stageId} />
										</TableCell>
										<TableCell className="overflow-hidden px-3 py-3 text-right">
											<Amount deal={deal} locale={locale} />
										</TableCell>
										<TableCell className="overflow-hidden px-3 py-3">
											<OwnerCell owner={deal.owner} />
										</TableCell>
										<TableCell className="overflow-hidden px-3 py-3">
											{deal.expectedCloseDate ? (
												<span className="text-muted-foreground">
													<LocalDay date={deal.expectedCloseDate} />
												</span>
											) : (
												<EmptyCellValue />
											)}
										</TableCell>
										<TableCell
											className="overflow-hidden px-3 py-3 text-right text-muted-foreground tabular-nums"
											title={
												deal.neverActive
													? t.thoaThuan.chuaCoHoatDong
													: undefined
											}
										>
											{deal.daysSinceLastActivity}d
										</TableCell>
									</SimpleTableRow>
								);
							})
						)}
					</SimpleTable>
				</div>
			)}
			{kho === "may-tinh" ? null : (
				<div
					className={kho === "dien-thoai" ? undefined : "md:hidden"}
					data-thoa-thuan-dt=""
				>
					{count === 0 ? (
						<p className="py-8 text-center text-muted-foreground text-sm">
							{t.thoaThuan.khongCo}
						</p>
					) : (
						<ItemGroup>
							{result.deals.map((deal) => {
								const record = { kind: "deal" as const, id: deal.id };
								return (
									<Item
										asChild
										key={deal.id}
										variant="outline"
										data-thoa-thuan={deal.id}
									>
										<button
											type="button"
											onClick={() => openRecord(record)}
											onFocus={() => prefetchRecord(record)}
										>
											<ItemContent>
												<ItemTitle translate="no" data-phan="ten">
													{deal.name}
												</ItemTitle>
												<ItemDescription translate="no" data-phan="cong-ty">
													{deal.company.name}
												</ItemDescription>
												<span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
													<span data-phan="giai-doan">
														<Stage stage={deal.stage} stageId={deal.stageId} />
													</span>
													<span data-phan="tien">
														<Amount deal={deal} locale={locale} />
													</span>
												</span>
											</ItemContent>
										</button>
									</Item>
								);
							})}
						</ItemGroup>
					)}
				</div>
			)}
			<div className="flex flex-wrap items-center justify-between gap-3 text-muted-foreground text-xs">
				<span>{tableMeta(result, locale, t)}</span>
				<span>
					{t.thoaThuan.tinhDen} <LocalDay date={result.asOf} />
				</span>
			</div>
		</section>
	);
}

function Amount({ deal, locale }: { deal: DealListItem; locale: Locale }) {
	return deal.amount === null ? (
		<EmptyCellValue />
	) : (
		<span className="tabular-nums">
			{formatMoney(Math.round(deal.amount * 100), deal.currency, locale)}
		</span>
	);
}

function Stage({ stage, stageId }: { stage: string; stageId: string | null }) {
	const giaiDoan = useGiaiDoan();
	const ma = stageId ?? stage;
	return giaiDoan.theoId.has(ma) ? (
		<DealStageIndicator stage={ma} />
	) : (
		<span className="text-muted-foreground" translate="no">
			{stage}
		</span>
	);
}

function tableTitle(result: DealListResult, t: KetQuaMessages): string {
	const count = result.deals.length;
	if (count === 0) return t.thoaThuan.khongKhop;
	const status =
		result.criteria.status === "all"
			? ""
			: ` ${traBangChu(t.thoaThuan.trangThai, result.criteria.status) ?? ""}`.trimEnd();
	const stale =
		result.criteria.inactiveForDays === null ? "" : ` ${t.thoaThuan.namIm}`;
	return `${t.thoaThuan.soThoaThuan(String(count))}${stale}${status}`;
}

function tableMeta(
	result: DealListResult,
	locale: Locale,
	t: KetQuaMessages,
): string {
	const details = [
		t.thoaThuan.soThoaThuan(String(result.deals.length)),
		pipelineTotal(result, locale, t),
		result.criteria.inactiveForDays === null
			? null
			: t.thoaThuan.ngayNamIm(String(result.criteria.inactiveForDays)),
		result.hasMore ? t.thoaThuan.conNua : null,
	].filter((detail): detail is string => Boolean(detail));

	return details.join(" · ");
}

function pipelineTotal(
	result: DealListResult,
	locale: Locale,
	t: KetQuaMessages,
): string | null {
	const deals = result.deals;
	const currencies = new Set(deals.map((deal) => deal.currency));
	if (currencies.size !== 1) return null;

	const currency = currencies.values().next().value;
	if (!currency) return null;

	const amount = deals.reduce((sum, deal) => sum + (deal.amount ?? 0), 0);
	const tien = formatMoney(Math.round(amount * 100), currency, locale);
	return result.criteria.status === "open"
		? t.thoaThuan.duongOng(tien)
		: t.thoaThuan.tongGiaTri(tien);
}
