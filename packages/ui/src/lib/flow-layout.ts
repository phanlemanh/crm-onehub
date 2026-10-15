import {
	type EdgeLabel,
	Graph,
	type GraphLabel,
	layout,
	type NodeLabel,
} from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

export const FLOW_LAYOUT = {
	node: { width: 256, height: 112 },
	gap: { rank: 72, sibling: 32, edge: 24 },
	bend: { minPoints: 3 },
	fit: { padding: 0.12, maxZoom: 1 },
	center: { padding: 0.4, maxZoom: 1 },
	motion: { ms: 300 },
	zoom: { min: 0.25, max: 2 },
	grid: { gap: 24, dot: 2 },
} as const;

function boxOf(node: Node) {
	return {
		width: node.width ?? node.initialWidth ?? FLOW_LAYOUT.node.width,
		height: node.height ?? node.initialHeight ?? FLOW_LAYOUT.node.height,
	};
}

export type FlowPoint = { x: number; y: number };

export type FlowLayout<N extends Node> = {
	nodes: N[];
	bends: Map<string, FlowPoint[]>;
};

export function layoutTopDown<N extends Node, E extends Edge>(
	nodes: N[],
	edges: E[],
): FlowLayout<N> {
	const graph = new Graph<GraphLabel, NodeLabel, EdgeLabel>({
		directed: true,
		multigraph: false,
		compound: false,
	});

	graph.setGraph({
		rankdir: "TB",
		ranksep: FLOW_LAYOUT.gap.rank,
		nodesep: FLOW_LAYOUT.gap.sibling,
		edgesep: FLOW_LAYOUT.gap.edge,
		marginx: 0,
		marginy: 0,
	});
	graph.setDefaultEdgeLabel(() => ({}));

	const boxes = new Map<string, { width: number; height: number }>();
	for (const node of nodes) {
		const box = boxOf(node);
		boxes.set(node.id, box);
		graph.setNode(node.id, { ...box });
	}
	for (const edge of edges) {
		graph.setEdge(edge.source, edge.target);
	}

	layout(graph);

	const bends = new Map<string, FlowPoint[]>();
	for (const edge of edges) {
		const points = graph.edge(edge.source, edge.target)?.points ?? [];
		if (points.length > FLOW_LAYOUT.bend.minPoints) {
			bends.set(
				edge.id,
				points.slice(1, -1).map((p) => ({ x: p.x, y: p.y })),
			);
		}
	}

	return {
		bends,
		nodes: nodes.map((node) => {
			const placed = graph.node(node.id);
			const box = boxes.get(node.id);
			if (!placed || placed.x === undefined || placed.y === undefined || !box) {
				return node;
			}
			return {
				...node,
				position: {
					x: Math.round(placed.x - box.width / 2),
					y: Math.round(placed.y - box.height / 2),
				},
			};
		}),
	};
}

export function bendPath(
	from: FlowPoint,
	bends: FlowPoint[],
	to: FlowPoint,
): { path: string; mid: FlowPoint } {
	const points = [from, ...bends, to];
	let path = `M ${from.x} ${from.y}`;
	for (let i = 1; i < points.length - 1; i += 1) {
		const p = points[i];
		const next = points[i + 1];
		if (!p || !next) continue;
		path += ` Q ${p.x} ${p.y} ${(p.x + next.x) / 2} ${(p.y + next.y) / 2}`;
	}
	path += ` L ${to.x} ${to.y}`;
	const mid = points[Math.floor(points.length / 2)] ?? to;
	return { path, mid };
}

export function pathAround(edges: Edge[], focusId: string): Set<string> {
	const found = new Set<string>([focusId]);
	const walk = (start: string, upward: boolean) => {
		const queue = [start];
		for (let id = queue.pop(); id !== undefined; id = queue.pop()) {
			for (const edge of edges) {
				const from = upward ? edge.target : edge.source;
				const to = upward ? edge.source : edge.target;
				if (from === id && !found.has(to)) {
					found.add(to);
					queue.push(to);
				}
			}
		}
	};
	walk(focusId, true);
	walk(focusId, false);
	return found;
}

export function thoiGianChuyenDong(): number {
	const giam =
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
	return giam ? 0 : FLOW_LAYOUT.motion.ms;
}
