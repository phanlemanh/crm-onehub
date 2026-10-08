"use client";

import Draggable from "@carbon/icons-react/es/Draggable";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	restrictToParentElement,
	restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { cn } from "@crm/ui/lib/utils";
import { useMessages } from "@crm/ui/components/locale-provider";

export function SortableList({
	ids,
	onReorder,
	children,
}: {
	ids: string[];
	onReorder: (ids: string[], move: { id: string; from: number; to: number }) => void;
	children: ReactNode;
}) {
	const id = useId();
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const onDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const from = ids.indexOf(String(active.id));
		const to = ids.indexOf(String(over.id));
		if (from === -1 || to === -1) return;

		onReorder(arrayMove(ids, from, to), { id: String(active.id), from, to });
	};

	return (
		<DndContext
			id={id}
			sensors={sensors}
			collisionDetection={closestCenter}
			modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			onDragEnd={onDragEnd}
		>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				{children}
			</SortableContext>
		</DndContext>
	);
}

export function SortableItem({
	id,
	label,
	className,
	disabled = false,
	children,
}: {
	id: string;
	label: string;
	className?: string;
	disabled?: boolean;
	children: ReactNode;
}) {
	const msg = useMessages();
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, disabled });

	return (
		<div
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={cn(
				"flex items-center gap-2.5",
				isDragging && "relative z-10 bg-background",
				className,
			)}
		>
			<Button
				ref={setActivatorNodeRef}
				type="button"
				variant="ghost"
				size="icon-xs"
				className="cursor-grab text-muted-foreground"
				disabled={disabled}
				{...attributes}
				{...listeners}
				aria-roledescription={undefined}
			>
				<Icon icon={Draggable} />
				<span className="sr-only">{msg.sortableList.reorder(label)}</span>
			</Button>
			{children}
		</div>
	);
}

export type SortableChange = { ids: string[]; id: string; index: number };

function sameIds(a: string[], b: string[]): boolean {
	return a.length === b.length && a.every((id, i) => id === b[i]);
}

export function SortableSaveList({
	ids,
	label,
	disabled = false,
	onSave,
	children,
}: {
	ids: string[];
	label: (id: string) => string;
	disabled?: boolean;
	onSave: (change: SortableChange) => Promise<unknown>;
	children: (id: string, locked: boolean) => ReactNode;
}) {
	const msg = useMessages();
	const [tam, setTam] = useState<{ goc: string[]; ids: string[] } | null>(
		null,
	);
	const [dangLuu, setDangLuu] = useState(false);
	const song = useRef(true);
	const moiNhat = useRef(ids);
	moiNhat.current = ids;
	useEffect(() => {
		song.current = true;
		return () => {
			song.current = false;
		};
	}, []);

	const hien = tam && sameIds(tam.goc, ids) ? tam.ids : ids;
	const locked = disabled || dangLuu;
	const hienThi = (thuTu: string[]) =>
		setTam({ goc: moiNhat.current, ids: thuTu });

	const luu = (
		change: SortableChange,
		truoc: string[],
		xong: () => void,
	): Promise<boolean> => {
		hienThi(change.ids);
		setDangLuu(true);
		return onSave(change).then(
			() => {
				if (!song.current) return true;
				setDangLuu(false);
				xong();
				return true;
			},
			(error: Error) => {
				if (!song.current) return false;
				hienThi(truoc);
				setDangLuu(false);
				toast.error(error.message);
				return false;
			},
		);
	};

	const sap = (
		next: string[],
		move: { id: string; from: number; to: number },
	) => {
		if (locked) return;
		const truoc = hien;
		let daTra = false;
		const hoanTac = () => {
			if (daTra || !song.current) return;
			daTra = true;
			void luu({ ids: truoc, id: move.id, index: move.from }, next, () =>
				toast.success(msg.sortableList.restored),
			).then((duoc) => {
				daTra = duoc;
			});
		};
		void luu({ ids: next, id: move.id, index: move.to }, truoc, () =>
			toast(msg.sortableList.saved, {
				action: { label: msg.sortableList.undo, onClick: hoanTac },
			}),
		);
	};

	return (
		<div className="flex flex-col gap-2">
			<SortableList ids={hien} onReorder={sap}>
				{hien.map((id) => (
					<SortableItem key={id} id={id} label={label(id)} disabled={locked}>
						{children(id, locked)}
					</SortableItem>
				))}
			</SortableList>
			<p data-slot="sortable-hint" className="text-muted-foreground text-xs">
				{msg.sortableList.hint}
			</p>
		</div>
	);
}
