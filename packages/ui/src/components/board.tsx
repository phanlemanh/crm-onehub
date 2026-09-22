"use client";

import type { ElementType, ReactNode } from "react";
import { useMessages } from "./locale-provider";
import { cn } from "../lib/utils";

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
};

export type BoardProps = {
	columns: BoardColumn[];
	label: string;
	linkComponent?: ElementType;
	className?: string;
};

export function Board({
	columns,
	label,
	linkComponent: LinkComponent = "a",
	className,
}: BoardProps) {
	const msg = useMessages();

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
							className="flex w-64 shrink-0 flex-col gap-2 rounded-md bg-muted p-2"
						>
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
							{column.count === 0 ? (
								<p className="px-1 py-2 text-xs text-muted-foreground">
									{msg.board.empty}
								</p>
							) : (
								<ul className="flex flex-col gap-2">
									{column.cards.map((card) => (
										<li key={card.id}>
											<LinkComponent
												href={card.href}
												data-board-card={card.id}
												className="flex flex-col gap-0.5 rounded-md border bg-background p-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
											>
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
