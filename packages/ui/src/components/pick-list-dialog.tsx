"use client";

import Search from "@carbon/icons-react/es/Search";
import { useEffect, useRef, useState } from "react";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldError } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";

type PickListItem = { id: string; label: string; hint?: string };

const khoaTim = (s: string) =>
	s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("vi").trim();

function PickListDialog({
	open,
	onOpenChange,
	title,
	description,
	searchPlaceholder,
	items,
	selected,
	onSelectedChange,
	confirmLabel,
	cancelLabel,
	emptyLabel,
	onConfirm,
	pending = false,
	error = null,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	searchPlaceholder: string;
	items: PickListItem[];
	selected: string[];
	onSelectedChange: (ids: string[]) => void;
	confirmLabel: (n: number) => string;
	cancelLabel: string;
	emptyLabel: string;
	onConfirm: () => void;
	pending?: boolean;
	error?: string | null;
}) {
	const [tim, setTim] = useState("");
	const oTim = useRef<HTMLInputElement>(null);
	const hien = items.filter(
		(m) => tim === "" || khoaTim(m.label).includes(khoaTim(tim)),
	);
	const doi = (id: string, chon: boolean) =>
		onSelectedChange(
			chon
				? [...selected.filter((x) => x !== id), id]
				: selected.filter((x) => x !== id),
		);

	useEffect(() => {
		if (error) oTim.current?.focus();
	}, [error]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent data-slot="pick-list-dialog">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<Field>
					<InputGroup>
						<InputGroupAddon>
							<Icon icon={Search} />
						</InputGroupAddon>
						<InputGroupInput
							ref={oTim}
							type="search"
							aria-label={searchPlaceholder}
							placeholder={searchPlaceholder}
							value={tim}
							aria-invalid={error ? true : undefined}
							onChange={(e) => setTim(e.target.value)}
						/>
					</InputGroup>
					{error ? <FieldError>{error}</FieldError> : null}
				</Field>
				{items.length === 0 ? (
					<p className="text-muted-foreground text-sm">{emptyLabel}</p>
				) : (
					<ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
						{hien.map((m) => (
							<li key={m.id} data-slot="pick-list-item" data-id={m.id}>
								<label
									className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
									htmlFor={`pick-${m.id}`}
								>
									<Checkbox
										id={`pick-${m.id}`}
										checked={selected.includes(m.id)}
										disabled={pending}
										onCheckedChange={(v) => doi(m.id, v === true)}
									/>
									<span className="flex min-w-0 flex-1 flex-col">
										<span className="truncate text-sm" translate="no">
											{m.label}
										</span>
										{m.hint ? (
											<span
												className="truncate text-muted-foreground text-xs"
												translate="no"
											>
												{m.hint}
											</span>
										) : null}
									</span>
								</label>
							</li>
						))}
					</ul>
				)}
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={pending}>
							{cancelLabel}
						</Button>
					</DialogClose>
					<Button
						disabled={pending || selected.length === 0}
						onClick={onConfirm}
					>
						{confirmLabel(selected.length)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { PickListDialog, type PickListItem };
