"use client";

import {
	CartesianGrid,
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	Line,
	LineChart,
	ReferenceLine,
	XAxis,
	YAxis,
} from "@crm/ui/components/chart";
import { useMessages } from "@crm/ui/components/locale-provider";
import { cn } from "@crm/ui/lib/utils";

export type TargetLinePoint = {
	x: string;
	value: number | null;
	expected: number | null;
};

function TargetLineChart({
	label,
	data,
	target,
	targetLabel,
	formatValue,
	domain,
	height,
	className,
}: {
	label: string;
	data: TargetLinePoint[];
	target: number;
	targetLabel: string;
	formatValue?: (v: number) => string;
	domain?: [number, number];
	height?: number;
	className?: string;
}) {
	const msg = useMessages();
	const dinh = formatValue ?? ((v: number) => String(v));
	const config = {
		value: { label: msg.bieuDo.giaTri, color: "var(--foreground)" },
		expected: { label: msg.bieuDo.leRa, color: "var(--muted-foreground)" },
	} satisfies ChartConfig;

	return (
		<figure
			data-slot="target-line-chart"
			className={cn("flex flex-col gap-2", className)}
		>
			<ChartContainer
				aria-label={label}
				className="aspect-auto w-full"
				config={config}
				role="img"
				style={{ height: height ?? 224 }}
			>
				<LineChart
					accessibilityLayer
					data={data}
					margin={{ top: 24, right: 16, bottom: 0, left: 0 }}
				>
					<CartesianGrid stroke="var(--border)" vertical={false} />
					<XAxis axisLine={false} dataKey="x" tickLine={false} tickMargin={12} />
					<YAxis
						axisLine={false}
						domain={domain ?? ["auto", "auto"]}
						tickFormatter={(v: number) => dinh(v)}
						tickLine={false}
						width={48}
					/>
					<ChartTooltip
						content={
							<ChartTooltipContent
								indicator="line"
								valueFormatter={(v) => dinh(Number(v))}
							/>
						}
					/>
					<ReferenceLine
						data-muc="dich"
						ifOverflow="extendDomain"
						label={{
							value: targetLabel,
							position: "insideTopRight",
							fill: "var(--foreground)",
							fontSize: 12,
						}}
						stroke="var(--foreground)"
						y={target}
					/>
					<Line
						dataKey="expected"
						dot={false}
						isAnimationActive={false}
						stroke="var(--color-expected)"
						strokeDasharray="4 4"
						strokeWidth={2}
						type="linear"
					/>
					<Line
						connectNulls={false}
						dataKey="value"
						dot={{ r: 4 }}
						isAnimationActive={false}
						stroke="var(--color-value)"
						strokeWidth={2}
						type="linear"
					/>
				</LineChart>
			</ChartContainer>
			<figcaption className="text-muted-foreground text-xs">
				{msg.bieuDo.chuGiai}
			</figcaption>
			<table className="sr-only">
				<caption>{label}</caption>
				<thead>
					<tr>
						<th scope="col">{msg.bieuDo.tuan}</th>
						<th scope="col">{msg.bieuDo.giaTri}</th>
						<th scope="col">{msg.bieuDo.leRa}</th>
					</tr>
				</thead>
				<tbody>
					{data.map((d) => (
						<tr key={d.x}>
							<th scope="row">{d.x}</th>
							<td>{d.value === null ? "—" : dinh(d.value)}</td>
							<td>{d.expected === null ? "—" : dinh(d.expected)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</figure>
	);
}

export { TargetLineChart };
