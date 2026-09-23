"use client";

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

export function applyMoves(
	columns: DealBoardColumn[],
	moved: ReadonlyMap<string, Moved>,
): DealBoardColumn[] {
	if (moved.size === 0) return columns;
	const cards = new Map(
		columns.flatMap((column) => column.cards.map((card) => [card.id, card])),
	);
	return columns.map((column) => {
		const staying = column.cards.filter((card) => {
			const move = moved.get(card.id);
			return !move || move.to === column.stage;
		});
		const arriving = [...moved.entries()].flatMap(([id, move]) => {
			const card = cards.get(id);
			if (!card || move.to !== column.stage) return [];
			if (column.cards.some((c) => c.id === id)) return [];
			return [card];
		});
		return { ...column, cards: [...arriving, ...staying] };
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
