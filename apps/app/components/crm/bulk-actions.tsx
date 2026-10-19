"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
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
import { baoDaLuuTru } from "@crm/ui/lib/bao-luu-tru";
import type { Locale } from "@crm/ui/lib/locale";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { crmMessages } from "@/lib/messages/crm";

export type BulkResult = {
	requested: number;
	succeeded: number;
	skipped: number;
	failed: number;
	errored: number;
	message: string | null;
	changedIds: string[];
};

function soLoi(result: BulkResult): number {
	return Number.isFinite(result.errored) ? result.errored : 0;
}

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

export function baoHoanTacLoat({
	result,
	restored,
	locale,
}: {
	result: BulkResult;
	restored: (count: number) => string;
	locale: Locale;
}): void {
	const m = crmMessages(locale);
	if (result.succeeded === 0 && result.failed === 0 && result.skipped > 0) {
		toast.success(m.bulk.daVeTruoc(String(result.skipped)));
		return;
	}
	if (result.succeeded === 0) {
		toast.error(m.bulk.hoanTacLoi);
		return;
	}
	if (result.failed > 0) {
		toast.warning(
			`${restored(result.succeeded)} ${m.bulk.hoanTacThieu(String(result.failed))}`,
		);
		return;
	}
	toast.success(restored(result.succeeded));
}

export function baoLuuTruLoat({
	result,
	done,
	locale,
	onHoanTac,
}: {
	result: BulkResult;
	done: (count: number) => string;
	locale: Locale;
	onHoanTac: (changedIds: string[]) => void;
}): void {
	const m = crmMessages(locale);
	const loi = soLoi(result);
	const boQua = result.skipped + result.failed - loi;
	const phanLoi = loi > 0 ? m.bulk.chuaLuuTru(String(loi)) : null;
	if (result.changedIds.length === 0) {
		if (phanLoi) {
			toast.error(
				[boQua > 0 ? m.bulk.boQua(String(boQua)) : null, phanLoi]
					.filter(Boolean)
					.join(" "),
			);
			return;
		}
		toast.warning(m.bulk.khongDoi(String(boQua)));
		return;
	}
	baoDaLuuTru({
		thongDiep: [
			done(result.succeeded),
			boQua > 0 ? m.bulk.boQua(String(boQua)) : null,
			phanLoi,
		]
			.filter(Boolean)
			.join(" "),
		nhanHoanTac: m.sheet.hoanTac,
		onHoanTac: () => onHoanTac(result.changedIds),
	});
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
	pending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	onConfirm: () => void;
	pending: boolean;
}) {
	const m = crmMessages(useLocale());
	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			tieuDe={title}
			than={description}
			nut={m.bulkMenu.confirmDelete}
			thoi={m.bulkMenu.cancel}
			onConfirm={onConfirm}
			pending={pending}
		/>
	);
}
