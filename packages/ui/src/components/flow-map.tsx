"use client";

import "@xyflow/react/dist/style.css";
import FitToScreen from "@carbon/icons-react/es/FitToScreen";
import ZoomIn from "@carbon/icons-react/es/ZoomIn";
import ZoomOut from "@carbon/icons-react/es/ZoomOut";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { ButtonGroup } from "@crm/ui/components/button-group";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import {
	bendPath,
	FLOW_LAYOUT,
	type FlowPoint,
	layoutTopDown,
	pathAround,
	thoiGianChuyenDong,
} from "@crm/ui/lib/flow-layout";
import { cn } from "@crm/ui/lib/utils";
import {
	Background,
	BackgroundVariant,
	BaseEdge,
	type Edge,
	type EdgeProps,
	type EdgeTypes,
	EdgeLabelRenderer,
	getSmoothStepPath,
	Handle,
	MiniMap,
	type Node,
	type NodeTypes,
	Panel,
	Position,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
	useStore,
} from "@xyflow/react";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";

export type { Edge, Node, NodeProps } from "@xyflow/react";

export type FlowMapEdgeData = {
	kind: "lien" | "dut" | "an";
	label?: string;
	state?: "lit" | "dim";
	bends?: FlowPoint[];
};

export type FlowMapEdge = Edge<FlowMapEdgeData, "flow-map">;

const FLOW_THEME = [
	"[--xy-background-color:transparent]",
	"[--xy-background-pattern-color:var(--border)]",
	"[--xy-edge-stroke:color-mix(in_oklab,var(--muted-foreground)_55%,transparent)]",
	"[--xy-edge-stroke-selected:var(--foreground)]",
	"[--xy-edge-label-background-color:var(--card)]",
	"[--xy-edge-label-color:var(--muted-foreground)]",
	"[--xy-minimap-background-color:var(--card)]",
	"[--xy-minimap-mask-background-color:color-mix(in_oklab,var(--muted)_70%,transparent)]",
	"[--xy-minimap-node-background-color:color-mix(in_oklab,var(--muted-foreground)_35%,transparent)]",
	"[--xy-attribution-background-color:transparent]",
	"[--xy-node-boxshadow-selected:0_0_0_2px_var(--ring)]",
].join(" ");

function crispAt(zoom: number) {
	return (value: number) => (Math.round(value * zoom - 0.5) + 0.5) / zoom;
}

function FlowMapEdgeView({
	data,
	id,
	sourcePosition,
	sourceX,
	sourceY,
	targetPosition,
	targetX,
	targetY,
}: EdgeProps<FlowMapEdge>) {
	const zoom = useStore((s) => s.transform[2]);
	const crisp = crispAt(zoom);
	const source = { x: crisp(sourceX), y: crisp(sourceY) };
	const target = { x: crisp(targetX), y: crisp(targetY) };
	const centerY = crisp((source.y + target.y) / 2);
	const bent = data?.bends
		? bendPath(source, data.bends, target)
		: null;
	const [smooth] = getSmoothStepPath({
		borderRadius: 8,
		centerX: crisp((source.x + target.x) / 2),
		centerY,
		sourcePosition,
		sourceX: source.x,
		sourceY: source.y,
		targetPosition,
		targetX: target.x,
		targetY: target.y,
	});
	const path = bent ? bent.path : smooth;
	const labelAt = bent ? bent.mid : { x: target.x, y: centerY };
	const lit = data?.state === "lit";
	const dim = data?.state === "dim";

	return (
		<>
			<BaseEdge
				id={id}
				path={path}
				style={{
					stroke: lit ? "var(--foreground)" : undefined,
					strokeWidth: (lit ? 1.5 : 1) / zoom,
					strokeDasharray:
						data?.kind === "dut" ? `${6 / zoom} ${4 / zoom}` : undefined,
					opacity: dim ? 0.25 : 1,
				}}
			/>
			{data?.label ? (
				<EdgeLabelRenderer>
					<div
						className="nodrag nopan pointer-events-none absolute"
						data-dim={dim || undefined}
						style={{
							transform: `translate(-50%, -50%) translate(${labelAt.x}px, ${labelAt.y}px)`,
							opacity: dim ? 0.25 : 1,
						}}
					>
						<Badge variant="outline">{data.label}</Badge>
					</div>
				</EdgeLabelRenderer>
			) : null}
		</>
	);
}

const EDGE_TYPES: EdgeTypes = { "flow-map": FlowMapEdgeView };

export function FlowMapCard({
	active,
	className,
	children,
	...props
}: ComponentProps<"div"> & { active?: boolean }) {
	return (
		<div
			className={cn(
				"flex size-full cursor-pointer flex-col gap-2 overflow-hidden rounded-lg border bg-card p-3 text-card-foreground text-sm transition-colors hover:border-foreground/30 data-active:border-ring data-active:ring-2 data-active:ring-ring/40",
				className,
			)}
			data-active={active || undefined}
			data-slot="flow-map-card"
			{...props}
		>
			<Handle
				className="pointer-events-none opacity-0"
				isConnectable={false}
				position={Position.Top}
				type="target"
			/>
			{children}
			<Handle
				className="pointer-events-none opacity-0"
				isConnectable={false}
				position={Position.Bottom}
				type="source"
			/>
		</div>
	);
}

export function FlowMapNode({ children }: { children: ReactNode }) {
	return (
		<>
			<Handle
				className="pointer-events-none opacity-0"
				isConnectable={false}
				position={Position.Top}
				type="target"
			/>
			{children}
			<Handle
				className="pointer-events-none opacity-0"
				isConnectable={false}
				position={Position.Bottom}
				type="source"
			/>
		</>
	);
}

function FlowMapControls({ thoiGian }: { thoiGian: number }) {
	const msg = useMessages().soDo;
	const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow();
	const zoom = useStore((s) => s.transform[2]);
	const percent = String(Math.round(zoom * 100));
	const nut = [
		{ nhan: msg.thuNho, Icon: ZoomOut, chay: () => zoomOut({ duration: thoiGian }), tat: zoom <= FLOW_LAYOUT.zoom.min },
		{ nhan: msg.phongTo, Icon: ZoomIn, chay: () => zoomIn({ duration: thoiGian }), tat: zoom >= FLOW_LAYOUT.zoom.max },
		{ nhan: msg.vuaKhung, Icon: FitToScreen, chay: () => fitView({ ...FLOW_LAYOUT.fit, duration: thoiGian }), tat: false },
	];

	return (
		<Panel position="bottom-left">
			<TooltipProvider delayDuration={300}>
				<ButtonGroup aria-label={msg.dieuKhien}>
					{nut.map((n) => (
						<Tooltip key={n.nhan}>
							<TooltipTrigger asChild>
								<Button
									aria-label={n.nhan}
									disabled={n.tat}
									onClick={n.chay}
									size="icon-sm"
									variant="outline"
								>
									<n.Icon aria-hidden />
								</Button>
							</TooltipTrigger>
							<TooltipContent>{n.nhan}</TooltipContent>
						</Tooltip>
					))}
					<Button
						aria-label={msg.mucPhong(percent)}
						onClick={() => zoomTo(1, { duration: thoiGian })}
						size="sm"
						variant="outline"
					>
						<span className="tabular-nums">{percent}%</span>
					</Button>
				</ButtonGroup>
			</TooltipProvider>
		</Panel>
	);
}

type FlowMapProps<N extends Node> = {
	label: string;
	nodes: N[];
	edges: FlowMapEdge[];
	nodeTypes: NodeTypes;
	focusId?: string | null;
	centerId?: string | null;
	overview?: boolean;
	className?: string;
	onNodeClick?: (id: string) => void;
};

function FlowMapInner<N extends Node>({
	label,
	nodes,
	edges,
	nodeTypes,
	focusId,
	centerId,
	overview,
	className,
	onNodeClick,
}: FlowMapProps<N>) {
	const [hoverId, setHoverId] = useState<string | null>(null);
	const [thoiGian] = useState(thoiGianChuyenDong);
	const { fitView } = useReactFlow();
	const { nodes: placed, bends } = useMemo(
		() => layoutTopDown(nodes, edges),
		[nodes, edges],
	);
	const lightId = hoverId ?? focusId ?? null;
	const lit = useMemo(
		() => (lightId ? pathAround(edges, lightId) : null),
		[edges, lightId],
	);

	const shownNodes = useMemo(
		() =>
			placed.map((n) => ({
				...n,
				draggable: false,
				connectable: false,
				style: lit ? { ...n.style, opacity: lit.has(n.id) ? 1 : 0.35 } : n.style,
			})),
		[placed, lit],
	);
	const shownEdges = useMemo(
		() =>
			edges.filter((e) => e.data?.kind !== "an").map((e) => {
				const onPath = lit ? lit.has(e.source) && lit.has(e.target) : false;
				const state: FlowMapEdgeData["state"] = lit ? (onPath ? "lit" : "dim") : undefined;
				return {
					...e,
					type: "flow-map" as const,
					focusable: false,
					data: {
						kind: e.data?.kind ?? "lien",
						label: e.data?.label,
						state,
						bends: bends.get(e.id),
					},
				};
			}),
		[edges, lit, bends],
	);

	return (
		<section
			aria-label={label}
			className={cn(
				"relative h-full min-h-0 w-full touch-manipulation overflow-hidden rounded-lg border bg-muted/30",
				FLOW_THEME,
				className,
			)}
			data-flow-map
		>
			<ReactFlow
				edgeTypes={EDGE_TYPES}
				edges={shownEdges}
				fitView
				fitViewOptions={
					centerId
						? { ...FLOW_LAYOUT.center, nodes: [{ id: centerId }] }
						: FLOW_LAYOUT.fit
				}
				maxZoom={FLOW_LAYOUT.zoom.max}
				minZoom={FLOW_LAYOUT.zoom.min}
				nodeTypes={nodeTypes}
				nodes={shownNodes}
				nodesConnectable={false}
				nodesDraggable={false}
				onNodeClick={(_, node) => {
					onNodeClick?.(node.id);
					requestAnimationFrame(() => {
						void fitView({
							...FLOW_LAYOUT.center,
							nodes: [{ id: node.id }],
							duration: thoiGian,
						});
					});
				}}
				onNodeMouseEnter={(_, node) => setHoverId(node.id)}
				onNodeMouseLeave={() => setHoverId(null)}
				panOnScroll
				proOptions={{ hideAttribution: true }}
				zoomOnDoubleClick={false}
				zoomOnScroll={false}
			>
				<Background
					gap={FLOW_LAYOUT.grid.gap}
					size={FLOW_LAYOUT.grid.dot}
					variant={BackgroundVariant.Dots}
				/>
				{overview ? (
					<MiniMap className="max-md:hidden" pannable position="bottom-right" zoomable />
				) : null}
				<FlowMapControls thoiGian={thoiGian} />
			</ReactFlow>
		</section>
	);
}

export function FlowMap<N extends Node>(props: FlowMapProps<N>) {
	return (
		<ReactFlowProvider>
			<FlowMapInner {...props} />
		</ReactFlowProvider>
	);
}
