"use client";

import { normalizeCurrency } from "@crm/db/currency";
import type { DealStage } from "@crm/db/enums";
import { useMutation } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { LOSING_STAGES } from "@/lib/deal-stage";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

export type DealBoard = RouterOutputs["deals"]["board"];
export type DealBoardColumn = DealBoard["columns"][number];

type Moved = { from: DealStage; to: DealStage };

const closeReasonParams = {
	[SEARCH_PARAM.dialog.closeDeal]: parseAsString,
	[SEARCH_PARAM.dialog.closeStage]: parseAsString,
};

export function isDealStage(
	board: DealBoard | undefined,
	value: string,
): value is DealStage {
	return board?.columns.some((column) => column.stage === value) ?? false;
}

type DealCard = DealBoardColumn["cards"][number];

const isPending = (card: DealCard) =>
	card.amountCents !== null && !card.counted;

const baseSum = (cards: DealCard[]) =>
	cards.reduce((total, card) => total + (card.baseAmountCents ?? 0), 0);

const currencyList = (codes: string[]) =>
	[...new Set(codes.map(normalizeCurrency))].sort();

function moveHeader(
	column: DealBoardColumn,
	leaving: DealCard[],
	arriving: DealCard[],
	cards: DealCard[],
): DealBoardColumn {
	const count = column.count - leaving.length + arriving.length;
	const countedOut = leaving.filter((card) => card.counted);
	const countedIn = arriving.filter((card) => card.counted);
	const countedCount =
		column.countedCount - countedOut.length + countedIn.length;
	const pendingCount =
		column.unconverted.count -
		leaving.filter(isPending).length +
		arriving.filter(isPending).length;
	const currencies =
		pendingCount === 0
			? []
			: count === cards.length
				? currencyList(cards.filter(isPending).map((card) => card.currency))
				: currencyList([
						...column.unconverted.currencies,
						...arriving.filter(isPending).map((card) => card.currency),
					]);
	return {
		...column,
		count,
		countedCount,
		valueCents:
			countedCount === 0
				? null
				: (column.valueCents ?? 0) - baseSum(countedOut) + baseSum(countedIn),
		unconverted: { count: pendingCount, currencies },
		cards,
	};
}

export function applyMoves(
	columns: DealBoardColumn[],
	moved: ReadonlyMap<string, Moved>,
): DealBoardColumn[] {
	if (moved.size === 0) return columns;
	const home = new Map(
		columns.flatMap((column) =>
			column.cards.map((card) => [card.id, { card, stage: column.stage }]),
		),
	);
	const relocated = [...moved.entries()].flatMap(([id, move]) => {
		const found = home.get(id);
		if (!found || found.stage === move.to) return [];
		return [{ card: found.card, from: found.stage, to: move.to }];
	});
	if (relocated.length === 0) return columns;
	return columns.map((column) => {
		const leaving = relocated
			.filter((move) => move.from === column.stage)
			.map((move) => move.card);
		const arriving = relocated
			.filter((move) => move.to === column.stage)
			.map((move) => move.card);
		if (leaving.length === 0 && arriving.length === 0) return column;
		const gone = new Set(leaving.map((card) => card.id));
		const cards = [
			...arriving,
			...column.cards.filter((card) => !gone.has(card.id)),
		];
		return moveHeader(column, leaving, arriving, cards);
	});
}

export function useDealBoardMove(board: DealBoard | undefined) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [, setCloseParams] = useQueryStates(closeReasonParams);
	const [moved, setMoved] = useState<ReadonlyMap<string, Moved>>(new Map());

	const forget = (id: string) =>
		setMoved((current) => {
			const next = new Map(current);
			next.delete(id);
			return next;
		});

	const setStage = useMutation(
		trpc.deals.setStage.mutationOptions({
			onSuccess: async (_, variables) => {
				await cache.deal(variables.id);
				forget(variables.id);
			},
			onError: (error, variables) => {
				forget(variables.id);
				toast.error(error.message);
			},
		}),
	);

	const move = (cardId: string, from: string, to: string) => {
		if (from === to) return;
		if (!isDealStage(board, from) || !isDealStage(board, to)) return;
		if (LOSING_STAGES.includes(to)) {
			void setCloseParams({
				[SEARCH_PARAM.dialog.closeDeal]: cardId,
				[SEARCH_PARAM.dialog.closeStage]: to,
			});
			return;
		}
		setMoved((current) => new Map(current).set(cardId, { from, to }));
		setStage.mutate({ id: cardId, stage: to });
	};

	return {
		columns: applyMoves(board?.columns ?? [], moved),
		move,
		pendingIds: [...moved.keys()],
	};
}
