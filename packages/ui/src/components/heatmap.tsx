"use client";

import * as React from "react";
import { useMessages } from "@crm/ui/components/locale-provider";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { cn } from "@crm/ui/lib/utils";

export type HeatmapRow = { id: string; label: React.ReactNode; indent?: boolean };
export type HeatmapColumn = { id: string; label: string; current?: boolean };
export type HeatmapLegend = { cao: string; trong: string };

const BAC_NHIET = [
	{ toi: 0, nen: "bg-foreground/5", chu: "text-foreground" },
	{ toi: 25, nen: "bg-foreground/15", chu: "text-foreground" },
	{ toi: 50, nen: "bg-foreground/30", chu: "text-foreground" },
	{ toi: 75, nen: "bg-foreground/65", chu: "text-background" },
	{ toi: Number.POSITIVE_INFINITY, nen: "bg-foreground/85", chu: "text-background" },
] as const;

function bacNhiet(v: number): number {
	return BAC_NHIET.findIndex((b) => v <= b.toi);
}

function Heatmap({
	caption,
	rows,
	columns,
	values,
	formatValue,
	legend,
	className,
}: {
	caption: string;
	rows: HeatmapRow[];
	columns: HeatmapColumn[];
	values: (number | null)[][];
	formatValue?: (v: number) => string;
	legend?: HeatmapLegend;
	className?: string;
}) {
	const msg = useMessages();
	const khung = React.useRef<HTMLDivElement>(null);
	const dinh = formatValue ?? ((v: number) => `${v}%`);

	useMountEffect(() => {
		const el = khung.current;
		const cot = el?.querySelector<HTMLElement>("[data-current]");
		if (el && cot && el.scrollWidth > el.clientWidth) {
			el.scrollLeft = cot.offsetLeft + cot.offsetWidth - el.clientWidth + 8;
		}
	});

	return (
		<div data-slot="heatmap" className={cn("flex flex-col gap-3", className)}>
			<div className="relative overflow-x-auto rounded-lg border" ref={khung}>
				<table className="w-full border-separate border-spacing-1 p-2 text-xs">
					<caption className="sr-only">{caption}</caption>
					<thead>
						<tr>
							<th
								className="sticky left-0 z-10 min-w-36 bg-background px-2 text-left font-medium text-muted-foreground"
								scope="col"
							>
								{msg.heatmap.donVi}
							</th>
							{columns.map((c) => (
								<th
									className={cn(
										"min-w-11 px-1 text-center font-normal text-muted-foreground tabular-nums",
										c.current && "font-medium text-foreground",
									)}
									data-current={c.current ? "" : undefined}
									key={c.id}
									scope="col"
								>
									{c.label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((r, i) => (
							<tr data-row={r.id} key={r.id}>
								<th
									className={cn(
										"sticky left-0 z-10 bg-background px-2 text-left font-normal",
										r.indent ? "ps-6 text-muted-foreground" : "font-medium",
									)}
									scope="row"
								>
									{r.label}
								</th>
								{columns.map((c, j) => {
									const v = values[i]?.[j] ?? null;
									if (v === null) {
										return (
											<td
												className="h-8 rounded-sm border border-dashed"
												data-bac="rong"
												key={c.id}
											>
												<span className="sr-only">{msg.heatmap.chuaCo}</span>
											</td>
										);
									}
									const bac = bacNhiet(v);
									const b = BAC_NHIET[bac] ?? BAC_NHIET[0];
									return (
										<td
											className={cn(
												"h-8 rounded-sm text-center tabular-nums",
												b.nen,
												b.chu,
											)}
											data-bac={bac}
											key={c.id}
										>
											{dinh(v)}
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div
				className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs"
				data-slot="heatmap-legend"
			>
				<span>{legend?.cao ?? msg.heatmap.chuGiai}</span>
				<span aria-hidden="true" className="flex items-center gap-1">
					{BAC_NHIET.map((b) => (
						<span className={cn("size-3 rounded-sm", b.nen)} key={b.nen} />
					))}
				</span>
				<span className="flex items-center gap-1">
					<span aria-hidden="true" className="size-3 rounded-sm border border-dashed" />
					{legend?.trong ?? msg.heatmap.oRong}
				</span>
			</div>
		</div>
	);
}

export { BAC_NHIET, Heatmap, bacNhiet };
