"use client";

import {
	hotkeysCoreFeature,
	selectionFeature,
	syncDataLoaderFeature,
} from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import type { ReactNode } from "react";
import { Tree, TreeItem, TreeItemLabel } from "@crm/ui/components/reui/tree";
import { cn } from "@crm/ui/lib/utils";

export type TreeNavNode<T> = {
	id: string;
	name: string;
	data: T;
	children?: TreeNavNode<T>[];
};

type NutNoi<T> = { id: string; name: string; node: TreeNavNode<T> | null };

type TreeNavProps<T> = {
	label: string;
	nodes: TreeNavNode<T>[];
	expanded: string[];
	onExpandedChange: (ids: string[]) => void;
	selectedId?: string | null;
	onSelect?: (id: string) => void;
	renderLabel: (node: TreeNavNode<T>) => ReactNode;
	itemAttrs?: (node: TreeNavNode<T>) => {
		[khoa: `data-${string}`]: string | undefined;
	};
	indent?: number;
	className?: string;
};

const GOC = "__goc-cay__";

function chiMuc<T>(nodes: TreeNavNode<T>[]) {
	const bang = new Map<string, NutNoi<T>>([
		[GOC, { id: GOC, name: "", node: null }],
	]);
	const con = new Map<string, string[]>([[GOC, nodes.map((n) => n.id)]]);
	const di = (ds: TreeNavNode<T>[]) => {
		for (const n of ds) {
			bang.set(n.id, { id: n.id, name: n.name, node: n });
			con.set(
				n.id,
				(n.children ?? []).map((c) => c.id),
			);
			di(n.children ?? []);
		}
	};
	di(nodes);
	return { bang, con };
}

function CayNoi<T>({
	label,
	nodes,
	expanded,
	onExpandedChange,
	selectedId,
	onSelect,
	renderLabel,
	itemAttrs,
	indent,
	className,
}: TreeNavProps<T>) {
	const { bang, con } = chiMuc(nodes);
	const tree = useTree<NutNoi<T>>({
		rootItemId: GOC,
		getItemName: (item) => item.getItemData().name,
		isItemFolder: (item) => (con.get(item.getId())?.length ?? 0) > 0,
		dataLoader: {
			getItem: (id) => bang.get(id) ?? { id, name: "", node: null },
			getChildren: (id) => con.get(id) ?? [],
		},
		state: {
			expandedItems: expanded,
			selectedItems: selectedId ? [selectedId] : [],
		},
		setSelectedItems: () => undefined,
		setExpandedItems: (cap) =>
			onExpandedChange(typeof cap === "function" ? cap(expanded) : cap),
		initialState: { focusedItem: selectedId ?? nodes[0]?.id ?? null },
		onPrimaryAction: (item) => onSelect?.(item.getId()),
		features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
	});

	return (
		<Tree
			aria-label={label}
			className={cn("gap-0.5", className)}
			indent={indent ?? 16}
			tree={tree}
		>
			{tree.getItems().map((item) => {
				const nut = item.getItemData().node;
				if (!nut) return null;
				const dangChon = nut.id === (selectedId ?? null);
				return (
					<TreeItem
						{...itemAttrs?.(nut)}
						aria-selected={dangChon}
						data-id={nut.id}
						data-nav-selected={dangChon}
						item={item}
						key={item.getId()}
						onKeyDown={(e) => {
							if (e.key !== "Enter") return;
							e.preventDefault();
							onSelect?.(nut.id);
						}}
					>
						<TreeItemLabel className={cn(dangChon && "bg-accent")}>
							{renderLabel(nut)}
						</TreeItemLabel>
					</TreeItem>
				);
			})}
		</Tree>
	);
}

function TreeNav<T>(props: TreeNavProps<T>) {
	const khoa: string[] = [];
	const di = (ds: TreeNavNode<T>[], cap: number) => {
		for (const n of ds) {
			khoa.push(`${cap}:${n.id}`);
			di(n.children ?? [], cap + 1);
		}
	};
	di(props.nodes, 0);
	return <CayNoi key={khoa.join("|")} {...props} />;
}

export { TreeNav };
