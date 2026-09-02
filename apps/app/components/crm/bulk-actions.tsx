"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crm/ui/components/alert-dialog";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import type { Locale } from "@crm/ui/lib/locale";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { crmMessages } from "@/lib/messages/crm";

export type BulkResult = {
	requested: number;
	succeeded: number;
	failed: number;
	message: string | null;
};

export function reportBulk(
	result: BulkResult,
	done: (count: number) => string,
	locale: Locale,
): void {
	const m = crmMessages(locale);
	if (result.succeeded === 0) {
		toast.error(result.message ?? m.misc.nothingChanged);
		return;
	}

	if (result.failed > 0) {
		toast.error(
			m.bulkMenu.leftAlone(
				done(result.succeeded),
				String(result.failed),
				result.message ? ` — ${result.message}` : ".",
			),
		);
		return;
	}

	toast.success(done(result.succeeded));
}

export function BulkActionsMenu({
	pending,
	open,
	onOpenChange,
	children,
}: {
	pending?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: ReactNode;
}) {
	const m = crmMessages(useLocale());
	return (
		<DropdownMenu open={open} onOpenChange={onOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" disabled={pending}>
					{pending ? <Spinner /> : null}
					{m.bulkMenu.actions}
					<ChevronDown data-icon="inline-end" className="opacity-60" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-52">
				{children}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function BulkOwnerMenu({
	users,
	onSelect,
	unassignedLabel,
}: {
	users: { id: string; name: string }[];
	onSelect: (ownerId: string | null) => void;
	unassignedLabel?: string;
}) {
	const m = crmMessages(useLocale());
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>{m.bulkMenu.assignOwner}</DropdownMenuSubTrigger>
			<DropdownMenuSubContent className="max-h-72 overflow-y-auto">
				<DropdownMenuGroup>
					{unassignedLabel && (
						<DropdownMenuItem onSelect={() => onSelect(null)}>
							{unassignedLabel}
						</DropdownMenuItem>
					)}
					{users.length === 0 ? (
						<DropdownMenuLabel>{m.bulkMenu.nobodyElse}</DropdownMenuLabel>
					) : (
						users.map((user) => (
							<DropdownMenuItem
								key={user.id}
								onSelect={() => onSelect(user.id)}
							>
								{user.name}
							</DropdownMenuItem>
						))
					)}
				</DropdownMenuGroup>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

export function BulkDeleteDialog({
	open,
	onOpenChange,
	title,
	description,
	onConfirm,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	onConfirm: () => void;
}) {
	const m = crmMessages(useLocale());
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>{m.bulkMenu.cancel}</AlertDialogCancel>
					<AlertDialogAction variant="destructive" onClick={onConfirm}>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
