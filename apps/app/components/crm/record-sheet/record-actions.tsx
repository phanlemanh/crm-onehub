"use client";

import Archive from "@carbon/icons-react/es/Archive";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import Undo from "@carbon/icons-react/es/Undo";
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
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { companyMessages } from "@/lib/messages/companies";
import { contactMessages } from "@/lib/messages/contacts";
import { crmMessages } from "@/lib/messages/crm";
import { dealMessages } from "@/lib/messages/deals";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import {
	type RecordKind,
	type RecordRef,
	useRecordStack,
} from "./record-stack";

function recordNoun(kind: RecordKind, locale: Locale): string {
	if (kind === "company") return companyMessages(locale).noun;
	if (kind === "contact") return contactMessages(locale).noun;
	return dealMessages(locale).noun;
}

const RECORD_PROCEDURES = {
	company: "companies",
	contact: "contacts",
	deal: "deals",
} satisfies Record<RecordKind, "companies" | "contacts" | "deals">;

function useArchiveRecord(record: RecordRef) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();

	const handlers = {
		onSuccess: (archived: { name: string }) => {
			toast.success(
				m.sheet.archived(
					archived.name ||
						m.sheet.fallbackName(recordNoun(record.kind, locale)),
				),
			);
			void cache[record.kind](record.id);
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].archive.mutationOptions(handlers),
	);
}

function useRestoreRecord(record: RecordRef) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();

	const handlers = {
		onSuccess: (restored: { name: string }) => {
			toast.success(
				m.sheet.restored(
					restored.name ||
						m.sheet.fallbackName(recordNoun(record.kind, locale)),
				),
			);
			void cache[record.kind](record.id);
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].restore.mutationOptions(handlers),
	);
}

function usePurgeRecord(record: RecordRef) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { close } = useRecordStack();

	const handlers = {
		onSuccess: (purged: { name: string }) => {
			toast.success(
				m.sheet.deletedForever(
					purged.name || m.sheet.fallbackName(recordNoun(record.kind, locale)),
				),
			);
			void cache.removed(record);
			close();
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].purge.mutationOptions(handlers),
	);
}

export function RecordActions({
	record,
	name,
	consequence,
	archivedAt,
}: {
	record: RecordRef;
	name: string;
	consequence: string;
	archivedAt: string | null;
}) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const [confirming, setConfirming] = useState(false);
	const archive = useArchiveRecord(record);
	const restore = useRestoreRecord(record);
	const purge = usePurgeRecord(record);

	const pending = archive.isPending || restore.isPending || purge.isPending;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon-sm" disabled={pending}>
						<Icon icon={OverflowMenuVertical} />
						<span className="sr-only">{m.sheet.moreActions}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-44">
					{archivedAt ? (
						<>
							<DropdownMenuItem
								onSelect={() => restore.mutate({ id: record.id })}
							>
								<Icon icon={Undo} />
								{m.sheet.restore(recordNoun(record.kind, locale))}
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onSelect={() => setConfirming(true)}
							>
								<Icon icon={TrashCan} />
								{m.sheet.deleteForever(recordNoun(record.kind, locale))}
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem
							onSelect={() => archive.mutate({ id: record.id })}
						>
							<Icon icon={Archive} />
							{m.sheet.archive(recordNoun(record.kind, locale))}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={confirming} onOpenChange={setConfirming}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{m.sheet.confirmDelete(name)}</AlertDialogTitle>
						<AlertDialogDescription>{consequence}</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>{m.sheet.cancel}</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => purge.mutate({ id: record.id })}
						>
							{m.sheet.confirmDeleteForever}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
