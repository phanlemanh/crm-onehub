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

export type TargetLinePreviewPoint = { x: string; value: number };

type DongCoDiemMoi = TargetLinePoint & { moi: number | null };

function voiDiemMoi(
	data: TargetLinePoint[],
	moi: TargetLinePreviewPoint,
): { dong: DongCoDiemMoi[]; viTri: number } {
	const trung = data.findIndex((d) => d.x === moi.x);
	const viTri = trung === -1 ? data.length : trung;
	const noi = data.reduce(
		(cuoi, d, i) => (i < viTri && d.value !== null ? i : cuoi),
		-1,
	);
	const dong = data.map((d, i) => ({
		...d,
		moi: i === viTri ? moi.value : i === noi ? d.value : null,
	}));
	return {
		dong:
			trung === -1
				? [...dong, { x: moi.x, value: null, expected: null, moi: moi.value }]
				: dong,
		viTri,
	};
}

function TargetLineChart({
	label,
	data,
	target,
	targetLabel,
	formatValue,
	domain,
	height,
	className,
	previewPoint,
	nhip = "tuan",
}: {
	label: string;
	data: TargetLinePoint[];
	target: number;
	targetLabel: string;
	formatValue?: (v: number) => string;
	domain?: [number, number];
	height?: number;
	className?: string;
	previewPoint?: TargetLinePreviewPoint;
	nhip?: "tuan" | "lan";
}) {
	const msg = useMessages();
	const dinh = formatValue ?? ((v: number) => String(v));
	const config = {
		value: { label: msg.bieuDo.giaTri, color: "var(--foreground)" },
		expected: { label: msg.bieuDo.leRa, color: "var(--muted-foreground)" },
	} satisfies ChartConfig;
	const xemTruoc = previewPoint ? voiDiemMoi(data, previewPoint) : null;

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
					data={xemTruoc ? xemTruoc.dong : data}
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
					{xemTruoc ? (
						<Line
							activeDot={false}
							connectNulls
							dataKey="moi"
							dot={({ cx, cy, index, value }) =>
								index === xemTruoc.viTri ? (
									<circle
										cx={cx}
										cy={cy}
										data-diem-moi={value}
										fill="var(--background)"
										key={index}
										r={4}
										stroke="var(--color-value)"
										strokeWidth={2}
									/>
								) : null
							}
							isAnimationActive={false}
							stroke="var(--color-value)"
							strokeDasharray="2 4"
							strokeWidth={2}
							tooltipType="none"
							type="linear"
						/>
					) : null}
				</LineChart>
			</ChartContainer>
			<figcaption className="text-muted-foreground text-xs">
				{nhip === "lan" ? msg.bieuDo.chuGiaiLan : msg.bieuDo.chuGiai}
			</figcaption>
			<table className="sr-only">
				<caption>{label}</caption>
				<thead>
					<tr>
						<th scope="col">
							{nhip === "lan" ? msg.bieuDo.lan : msg.bieuDo.tuan}
						</th>
						<th scope="col">{msg.bieuDo.giaTri}</th>
						<th scope="col">{msg.bieuDo.leRa}</th>
					</tr>
				</thead>
				<tbody>
					{data.map((d, i) => (
						<tr key={`${i}-${d.x}`}>
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
