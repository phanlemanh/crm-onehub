"use client";

import { Board, type BoardColumn } from "@crm/ui/components/board";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { formatMoney } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { useQuery } from "@tanstack/react-query";
import { OwnerCell } from "@/components/crm/owner-cell";
import { usePrefetchRecord } from "@/components/crm/record-sheet/record-prefetch";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { DealStageMenu } from "@/components/crm/stage-change";
import { LocalDay } from "@/components/local-date-time";
import { useGiaiDoan } from "@/lib/giai-doan";
import { type DealMessages, dealMessages } from "@/lib/messages/deals";
import { useTRPC } from "@/lib/trpc/client";
import type { DealBoardQueryInput } from "./deals-search-params";
import {
	type DealBoardColumn,
	isDealStage,
	useDealBoardMove,
} from "./use-deal-board-move";

type DealCard = DealBoardColumn["cards"][number];

function columnSummary(
	column: DealBoardColumn,
	currency: string,
	locale: Locale,
	m: DealMessages,
): string {
	const { count, currencies } = column.unconverted;
	const parts = [
		column.valueCents === null && count > 0
			? null
			: formatMoney(column.valueCents ?? 0, currency, locale),
		count > 0 ? m.meta.notCounted(String(count), currencies.join(", ")) : null,
	];
	return parts.filter((part) => part !== null).join(" · ");
}

export function DealsBoard({ input }: { input: DealBoardQueryInput }) {
	const locale = useLocale();
	const m = dealMessages(locale);
	const trpc = useTRPC();
	const board = useQuery({
		...trpc.deals.board.queryOptions(input),
		placeholderData: (previous) => previous,
	});
	const { columns, move, pendingIds } = useDealBoardMove(board.data);
	const giaiDoan = useGiaiDoan();

	if (board.isError) {
		return (
			<Empty data-trang-thai="ST-bangcot-loitai">
				<EmptyHeader>
					<EmptyTitle>{m.board.errorTitle}</EmptyTitle>
					<EmptyDescription>{m.board.errorBody}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" onClick={() => board.refetch()}>
						{m.board.retry}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	if (!board.data) {
		return (
			<div data-trang-thai="ST-bangcot-dangtai" aria-busy>
				<Skeleton className="h-64 w-full" />
				<p aria-live="polite" className="sr-only">
					{m.board.loading}
				</p>
			</div>
		);
	}

	const currency = board.data.reportingCurrency;
	const byId = new Map(
		columns.flatMap((column) => column.cards.map((card) => [card.id, card])),
	);
	const stageName = (id: string | number) => {
		const value = String(id);
		if (isDealStage(board.data, value)) return giaiDoan.label(value);
		const card = byId.get(value);
		return card ? giaiDoan.label(card.stage) : value;
	};

	const boardColumns: BoardColumn[] = columns.map((column) => ({
		id: column.stage,
		label: giaiDoan.label(column.stage),
		count: column.count,
		summary: columnSummary(column, currency, locale, m),
		cards: column.cards.map((card) => ({
			id: card.id,
			href: "",
			title: card.name,
			subtitle: card.company.name,
		})),
	}));

	const renderCard = (card: { id: string }) => {
		const deal = byId.get(card.id);
		return deal ? <DealBoardCard card={deal} /> : null;
	};

	return (
		<div
			aria-busy={board.isPlaceholderData}
			data-trang-thai={
				board.isPlaceholderData ? "ST-bangcot-dangtai" : "ST-bangcot-codulieu"
			}
		>
			<Board
				columns={boardColumns}
				label={m.board.label}
				onMove={({ cardId, from, to }) => move(cardId, from, to)}
				pendingIds={pendingIds}
				renderCard={renderCard}
				announcements={{
					onDragStart: ({ active }) =>
						m.board.pickedUp(byId.get(String(active.id))?.name ?? ""),
					onDragOver: ({ over }) =>
						over ? m.board.over(stageName(over.id)) : m.board.droppedOutside,
					onDragEnd: ({ over }) =>
						over ? m.board.dropped(stageName(over.id)) : m.board.droppedOutside,
					onDragCancel: () => m.board.cancelled,
				}}
			/>
		</div>
	);
}

function DealBoardCard({ card }: { card: DealCard }) {
	const locale = useLocale();
	const openRecord = useOpenRecord();
	const prefetchRecord = usePrefetchRecord();
	return (
		<>
			<button
				type="button"
				data-open-deal={card.id}
				className="flex min-w-0 flex-col gap-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
				onClick={() => openRecord({ kind: "deal", id: card.id })}
				onMouseEnter={() => prefetchRecord({ kind: "deal", id: card.id })}
			>
				<span className="break-words font-medium" translate="no">
					{card.name}
				</span>
				<span
					className="break-words text-xs text-muted-foreground"
					translate="no"
				>
					{card.company.name}
				</span>
			</button>
			<span className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
				<span className="tabular-nums text-foreground">
					{card.amountCents === null
						? null
						: formatMoney(card.amountCents, card.currency, locale)}
				</span>
				{card.expectedCloseDate ? (
					<span className="whitespace-nowrap tabular-nums">
						<LocalDay date={card.expectedCloseDate} />
					</span>
				) : null}
			</span>
			<span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
				<OwnerCell owner={card.owner} />
				<DealStageMenu dealId={card.id} stage={card.stage} wrapLabel />
			</span>
		</>
	);
}
