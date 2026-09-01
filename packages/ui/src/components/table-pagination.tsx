"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import type { ReactNode } from "react";
import { useMemo } from "react";

export function TablePagination({
	page,
	totalPages,
	pageSize,
	total,
	onPageChange,
	loading = false,
	meta,
}: {
	page: number;
	totalPages: number;
	pageSize: number;
	total: number;
	onPageChange: (page: number) => void;
	loading?: boolean;
	meta?: ReactNode;
}) {
	const msg = useMessages();
	const locale = useLocale();
	const numberFormat = useMemo(
		() => new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US"),
		[locale],
	);
	const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const rangeEnd = Math.min(page * pageSize, total);

	return (
		<div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
			<span className="flex items-center gap-2 text-muted-foreground text-xs tabular-nums">
				{loading && <Spinner />}
				{meta ??
					(total === 0
						? msg.pagination.empty
						: msg.pagination.showing(
								numberFormat.format(rangeStart),
								numberFormat.format(rangeEnd),
								numberFormat.format(total),
							))}
			</span>
			{totalPages > 1 && (
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						disabled={page <= 1}
						onClick={() => onPageChange(Math.max(1, page - 1))}
					>
						<ChevronLeft data-icon="inline-start" />
						{msg.pagination.previous}
					</Button>
					<span className="text-muted-foreground text-xs tabular-nums">
						{page} / {totalPages}
					</span>
					<Button
						variant="contrast"
						size="sm"
						disabled={page >= totalPages}
						onClick={() => onPageChange(page + 1)}
					>
						{msg.pagination.next}
						<ChevronRight data-icon="inline-end" />
					</Button>
				</div>
			)}
		</div>
	);
}
