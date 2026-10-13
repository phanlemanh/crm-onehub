"use client";

import Archive from "@carbon/icons-react/es/Archive";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import Undo from "@carbon/icons-react/es/Undo";
import { Alert, AlertAction, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { baoDaLuuTru } from "@crm/ui/lib/bao-luu-tru";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation } from "@tanstack/react-query";
import { type ReactNode, type SyntheticEvent, useState } from "react";
import { toast } from "sonner";
import { LocalDateTime } from "@/components/local-date-time";
import { companyMessages } from "@/lib/messages/companies";
import { contactMessages } from "@/lib/messages/contacts";
import { crmMessages } from "@/lib/messages/crm";
import { dealMessages } from "@/lib/messages/deals";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { type EntityKind, useRecordStack } from "./record-stack";

type EntityRef = { kind: EntityKind; id: string };

function recordNoun(kind: EntityKind, locale: Locale): string {
	if (kind === "company") return companyMessages(locale).noun;
	if (kind === "contact") return contactMessages(locale).noun;
	return dealMessages(locale).noun;
}

const RECORD_PROCEDURES = {
	company: "companies",
	contact: "contacts",
	deal: "deals",
} satisfies Record<EntityKind, "companies" | "contacts" | "deals">;

function useArchiveRecord(record: EntityRef, onHoanTac: () => void) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();

	const handlers = {
		onSuccess: (archived: { name: string }) => {
			baoDaLuuTru({
				thongDiep: m.sheet.archived(
					archived.name ||
						m.sheet.fallbackName(recordNoun(record.kind, locale)),
				),
				nhanHoanTac: m.sheet.hoanTac,
				onHoanTac,
			});
			void cache[record.kind](record.id);
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].archive.mutationOptions(handlers),
	);
}

function useRestoreRecord(record: EntityRef, tuHoanTac = false) {
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
		onError: (error: { message: string }) =>
			toast.error(tuHoanTac ? m.sheet.hoanTacLoi : error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].restore.mutationOptions(handlers),
	);
}

function usePurgeRecord(record: EntityRef) {
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
	record: EntityRef;
	name: string;
	consequence: string;
	archivedAt: string | null;
}) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const [confirming, setConfirming] = useState(false);
	const restore = useRestoreRecord(record);
	const hoanTac = useRestoreRecord(record, true);
	const archive = useArchiveRecord(record, () =>
		hoanTac.mutate({ id: record.id }),
	);
	const purge = usePurgeRecord(record);

	const pending =
		archive.isPending ||
		restore.isPending ||
		hoanTac.isPending ||
		purge.isPending;

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

			<ConfirmDialog
				open={confirming}
				onOpenChange={setConfirming}
				tieuDe={m.sheet.confirmDelete(name)}
				than={consequence}
				nut={m.sheet.confirmDeleteForever}
				thoi={m.sheet.cancel}
				onConfirm={() => purge.mutate({ id: record.id })}
				pending={purge.isPending}
			/>
		</>
	);
}

export const NGAY_LUU_TRU: Intl.DateTimeFormatOptions = {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
};

export function DaiLuuTru({
	record,
	archivedAt,
}: {
	record: EntityRef;
	archivedAt: string;
}) {
	const m = crmMessages(useLocale());
	const restore = useRestoreRecord(record);
	return (
		<div className="shrink-0 border-b p-3">
			<Alert data-dai-luu-tru="">
				<Icon icon={Archive} />
				<AlertTitle>
					{m.sheet.daLuuTruNgay}{" "}
					<LocalDateTime date={archivedAt} options={NGAY_LUU_TRU} />
				</AlertTitle>
				<AlertAction>
					<Button
						variant="outline"
						size="sm"
						disabled={restore.isPending}
						onClick={() => restore.mutate({ id: record.id })}
					>
						<Icon icon={Undo} data-icon="inline-start" />
						{m.bulk.restore}
					</Button>
				</AlertAction>
			</Alert>
		</div>
	);
}

const CHO_SUA =
	"button, input, textarea, select, [role=combobox], [role=button], [contenteditable=true]";

export function KhoaLuuTru({
	khoa,
	children,
}: {
	khoa: boolean;
	children: ReactNode;
}) {
	const chan = (event: SyntheticEvent) => {
		if (!khoa) return;
		if (!(event.target instanceof Element)) return;
		if (!event.target.closest(CHO_SUA)) return;
		event.preventDefault();
		event.stopPropagation();
	};
	return (
		<fieldset
			disabled={khoa}
			data-khoa-luu-tru={khoa ? "" : undefined}
			className="contents"
			onPointerDownCapture={chan}
			onMouseDownCapture={chan}
			onClickCapture={chan}
			onKeyDownCapture={chan}
		>
			{children}
		</fieldset>
	);
}
