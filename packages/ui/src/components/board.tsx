"use client";

import Draggable from "@carbon/icons-react/es/Draggable";
import type { Announcements } from "@dnd-kit/core";
import { type ElementType, type ReactNode, useState } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./icon";
import { useMessages } from "./locale-provider";
import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanColumnContent,
	KanbanItem,
	KanbanItemHandle,
	type KanbanMoveEvent,
	KanbanOverlay,
} from "./reui/kanban";

export type BoardCard = {
	id: string;
	href: string;
	title: string;
	subtitle?: string | null;
	meta?: ReactNode;
};

export type BoardColumn = {
	id: string;
	label: string;
	count: number;
	cards: BoardCard[];
	userLabel?: boolean;
	summary?: ReactNode;
};

export type BoardMove = {
	cardId: string;
	from: string;
	to: string;
	order?: string[];
};

export type BoardDrop = {
	cardId: string;
	from: string;
	to: string;
	fromIndex: number;
	toIndex: number;
};

export type BoardProps = {
	columns: BoardColumn[];
	label: string;
	linkComponent?: ElementType;
	className?: string;
	onMove?: (move: BoardMove) => void;
	pendingIds?: readonly string[];
	renderCard?: (card: BoardCard, column: BoardColumn) => ReactNode;
	announcements?: Announcements;
	canDrop?: (cardId: string, columnId: string) => boolean;
	reorder?: boolean;
	emptyLabel?: string;
};

export function boardDrop(
	drop: BoardDrop,
	columns: BoardColumn[],
	options: {
		canDrop?: (cardId: string, columnId: string) => boolean;
		reorder?: boolean;
	},
): BoardMove | null {
	if (options.canDrop && !options.canDrop(drop.cardId, drop.to)) return null;
	const same = drop.from === drop.to;
	if (same && !options.reorder) return null;
	if (!options.reorder) {
		return { cardId: drop.cardId, from: drop.from, to: drop.to };
	}
	const ids = (columns.find((c) => c.id === drop.to)?.cards ?? []).map(
		(c) => c.id,
	);
	const rest = ids.filter((id) => id !== drop.cardId);
	const at =
		drop.toIndex < 0 || drop.toIndex > rest.length ? rest.length : drop.toIndex;
	if (same && ids.indexOf(drop.cardId) === at) return null;
	const order = [...rest.slice(0, at), drop.cardId, ...rest.slice(at)];
	return { cardId: drop.cardId, from: drop.from, to: drop.to, order };
}

const COLUMN_CLASS =
	"flex w-64 shrink-0 flex-col gap-2 rounded-md bg-muted p-2 transition-opacity data-[khong-nhan=true]:opacity-50";

const CARD_CLASS =
	"flex flex-col gap-0.5 rounded-md border bg-background p-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring";

function ColumnHeader({ column }: { column: BoardColumn }) {
	if (!column.summary) {
		return (
			<h3 className="flex items-baseline justify-between gap-2 px-1 text-sm font-medium">
				<span
					className="min-w-0 break-words"
					translate={column.userLabel ? "no" : undefined}
				>
					{column.label}
				</span>
				<span className="shrink-0 tabular-nums text-muted-foreground">
					{column.count}
				</span>
			</h3>
		);
	}
	return (
		<h3 className="flex flex-col gap-0.5 px-1 text-sm">
			<span className="flex items-baseline justify-between gap-2 font-medium">
				<span
					className="min-w-0 break-words"
					translate={column.userLabel ? "no" : undefined}
				>
					{column.label}
				</span>
				<span className="shrink-0 tabular-nums text-muted-foreground">
					{column.count}
				</span>
			</span>
			<span className="tabular-nums text-xs text-muted-foreground">
				{column.summary}
			</span>
		</h3>
	);
}

function CardBody({ card }: { card: BoardCard }) {
	return (
		<>
			<span className="break-words font-medium" translate="no">
				{card.title}
			</span>
			{card.subtitle ? (
				<span
					className="break-words text-xs text-muted-foreground"
					translate="no"
				>
					{card.subtitle}
				</span>
			) : null}
			{card.meta}
		</>
	);
}

export function Board({
	columns,
	label,
	linkComponent: LinkComponent = "a",
	className,
	onMove,
	pendingIds,
	renderCard,
	announcements,
	canDrop,
	reorder,
	emptyLabel,
}: BoardProps) {
	const msg = useMessages();
	const [dragging, setDragging] = useState<string | null>(null);
	const empty = emptyLabel ?? msg.board.empty;

	if (onMove) {
		const value = Object.fromEntries(
			columns.map((column) => [column.id, column.cards]),
		);
		const cardById = new Map(
			columns.flatMap((column) => column.cards.map((card) => [card.id, card])),
		);
		const pending = new Set(pendingIds);
		const handleMove = (event: KanbanMoveEvent) => {
			const move = boardDrop(
				{
					cardId: String(event.event.active.id),
					from: event.activeContainer,
					to: event.overContainer,
					fromIndex: event.activeIndex,
					toIndex: event.overIndex,
				},
				columns,
				{ canDrop, reorder },
			);
			if (move) onMove(move);
		};

		return (
			<section
				aria-label={label}
				className={cn(
					"min-w-0 max-w-full overflow-x-auto rounded-lg border bg-card",
					className,
				)}
			>
				<Kanban
					value={value}
					onValueChange={() => undefined}
					getItemValue={(card: BoardCard) => card.id}
					onMove={handleMove}
					onDragStart={(event) => setDragging(String(event.active.id))}
					onDragEnd={() => setDragging(null)}
					onDragCancel={() => setDragging(null)}
					accessibility={announcements ? { announcements } : undefined}
				>
					<KanbanBoard asChild className="flex w-max gap-3 p-3 select-none">
						<ol>
							{columns.map((column) => {
								const hidden = column.count - column.cards.length;
								return (
									<KanbanColumn key={column.id} value={column.id} asChild>
										<li
											data-board-column={column.id}
											data-khong-nhan={
												dragging !== null &&
												canDrop !== undefined &&
												!canDrop(dragging, column.id)
													? "true"
													: undefined
											}
											className={cn(
												COLUMN_CLASS,
												"ring-ring data-[over=true]:ring-2",
											)}
										>
											<ColumnHeader column={column} />
											<KanbanColumnContent value={column.id} asChild>
												<ul className="flex min-h-16 flex-col gap-2">
													{column.cards.length === 0 ? (
														<li className="px-1 py-2 text-xs text-muted-foreground">
															{empty}
														</li>
													) : null}
													{column.cards.map((card) => (
														<KanbanItem
															key={card.id}
															value={card.id}
															disabled={pending.has(card.id)}
															asChild
														>
															<li
																data-board-card={card.id}
																className="flex gap-1 rounded-md border bg-background p-2 text-sm"
															>
																<KanbanItemHandle
																	aria-label={msg.board.drag(card.title)}
																	className="-ms-1 flex w-4 shrink-0 items-start justify-center pt-0.5 text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:w-11"
																>
																	<Icon icon={Draggable} />
																</KanbanItemHandle>
																<div className="flex min-w-0 flex-1 flex-col gap-0.5">
																	{renderCard ? (
																		renderCard(card, column)
																	) : (
																		<CardBody card={card} />
																	)}
																</div>
															</li>
														</KanbanItem>
													))}
												</ul>
											</KanbanColumnContent>
											{hidden > 0 ? (
												<p className="px-1 text-xs text-muted-foreground">
													{msg.board.more(String(hidden))}
												</p>
											) : null}
										</li>
									</KanbanColumn>
								);
							})}
						</ol>
					</KanbanBoard>
					<KanbanOverlay>
						{({ value: activeId }) => {
							const card = cardById.get(String(activeId));
							return card ? (
								<div className="w-60 rounded-md border bg-background p-2 text-sm font-medium">
									<span translate="no">{card.title}</span>
								</div>
							) : null;
						}}
					</KanbanOverlay>
				</Kanban>
			</section>
		);
	}

	return (
		<section
			aria-label={label}
			className={cn(
				"min-w-0 max-w-full overflow-x-auto rounded-lg border bg-card",
				className,
			)}
		>
			<ol className="flex w-max gap-3 p-3">
				{columns.map((column) => {
					const hidden = column.count - column.cards.length;
					return (
						<li
							key={column.id}
							data-board-column={column.id}
							className={COLUMN_CLASS}
						>
							<ColumnHeader column={column} />
							{column.count === 0 ? (
								<p className="px-1 py-2 text-xs text-muted-foreground">
									{empty}
								</p>
							) : (
								<ul className="flex flex-col gap-2">
									{column.cards.map((card) => (
										<li key={card.id}>
											<LinkComponent
												href={card.href}
												data-board-card={card.id}
												className={CARD_CLASS}
											>
												<CardBody card={card} />
											</LinkComponent>
										</li>
									))}
								</ul>
							)}
							{hidden > 0 ? (
								<p className="px-1 text-xs text-muted-foreground">
									{msg.board.more(String(hidden))}
								</p>
							) : null}
						</li>
					);
				})}
			</ol>
		</section>
	);
}
