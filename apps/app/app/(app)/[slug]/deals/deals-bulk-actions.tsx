"use client";

import Archive from "@carbon/icons-react/es/Archive";
import Undo from "@carbon/icons-react/es/Undo";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { formatCount } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
	BulkActionsMenu,
	BulkDeleteDialog,
	BulkOwnerMenu,
	baoLuuTruLoat,
	reportBulk,
} from "@/components/crm/bulk-actions";
import { useGiaiDoan } from "@/lib/giai-doan";
import { crmMessages } from "@/lib/messages/crm";
import { dealMessages } from "@/lib/messages/deals";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

function deals(count: number, locale: Locale): string {
	return formatCount(count, dealMessages(locale).noun, locale);
}

export function DealsBulkActions({
	ids,
	onDone,
	archived,
}: {
	ids: string[];
	onDone: () => void;
	archived: boolean;
}) {
	const locale = useLocale();
	const c = crmMessages(locale);
	const m = dealMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const users = useQuery(trpc.users.list.queryOptions());
	const reasonId = useId();
	const [closing, setClosing] = useState<string | null>(null);
	const giaiDoan = useGiaiDoan();
	const [reason, setReason] = useState("");
	const [confirming, setConfirming] = useState(false);

	const onError = (error: { message: string }) => toast.error(error.message);

	const assignOwner = useMutation(
		trpc.deals.bulkAssignOwner.mutationOptions({
			onSuccess: async (result) => {
				await cache.deal();
				reportBulk(
					result,
					(count) => m.bulk.reassigned(deals(count, locale)),
					locale,
				);
				onDone();
			},
			onError,
		}),
	);

	const setStage = useMutation(
		trpc.deals.bulkSetStage.mutationOptions({
			onSuccess: async (result) => {
				await cache.deal();
				reportBulk(
					result,
					(count) => m.bulk.moved(deals(count, locale)),
					locale,
				);
				setClosing(null);
				setReason("");
				onDone();
			},
			onError,
		}),
	);

	const hoanTac = useMutation(
		trpc.deals.bulkRestore.mutationOptions({
			onSuccess: async (result) => {
				await cache.deal();
				reportBulk(
					result,
					(count) => m.bulk.restored(deals(count, locale)),
					locale,
				);
			},
			onError: () => toast.error(c.bulk.hoanTacLoi),
		}),
	);

	const archive = useMutation(
		trpc.deals.bulkArchive.mutationOptions({
			onSuccess: async (result, variables) => {
				await cache.removedMany({ kind: "deal", ids: variables.ids });
				baoLuuTruLoat({
					result,
					done: (count) => m.bulk.archived(deals(count, locale)),
					locale,
					onHoanTac: () => hoanTac.mutate({ ids: variables.ids }),
				});
				onDone();
			},
			onError,
		}),
	);

	const restore = useMutation(
		trpc.deals.bulkRestore.mutationOptions({
			onSuccess: async (result) => {
				await cache.deal();
				reportBulk(
					result,
					(count) => m.bulk.restored(deals(count, locale)),
					locale,
				);
				onDone();
			},
			onError,
		}),
	);

	const purge = useMutation(
		trpc.deals.bulkPurge.mutationOptions({
			onSuccess: async (result, variables) => {
				await cache.removedMany({ kind: "deal", ids: variables.ids });
				reportBulk(
					result,
					(count) => m.bulk.deleted(deals(count, locale)),
					locale,
				);
				setConfirming(false);
				onDone();
			},
			onError,
		}),
	);

	if (archived) {
		const archivedPending = restore.isPending || purge.isPending;

		return (
			<>
				<BulkActionsMenu pending={archivedPending}>
					<DropdownMenuGroup>
						<DropdownMenuItem onSelect={() => restore.mutate({ ids })}>
							<Undo />
							{c.bulk.restore}
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem
							variant="destructive"
							onSelect={() => setConfirming(true)}
						>
							{c.bulk.deleteForever}
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</BulkActionsMenu>

				<BulkDeleteDialog
					open={confirming}
					onOpenChange={setConfirming}
					title={m.bulk.confirmDelete(deals(ids.length, locale))}
					description={m.bulk.deleteWarning}
					onConfirm={() => purge.mutate({ ids })}
					pending={purge.isPending}
				/>
			</>
		);
	}

	const pending =
		assignOwner.isPending || setStage.isPending || archive.isPending;

	return (
		<>
			<BulkActionsMenu pending={pending}>
				<BulkOwnerMenu
					users={users.data ?? []}
					onSelect={(ownerId) =>
						ownerId && assignOwner.mutate({ ids, ownerId })
					}
				/>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>{m.bulk.changeStage}</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="max-h-72 overflow-y-auto">
						<DropdownMenuGroup>
							{giaiDoan.stages.map((option) => (
								<DropdownMenuItem
									key={option.id}
									onSelect={() => {
										if (option.kind === "LOST") {
											setClosing(option.id);
											return;
										}
										setStage.mutate({ ids, stage: option.id });
									}}
								>
									<span translate="no">{option.label}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onSelect={() => archive.mutate({ ids })}>
						<Archive />
						{c.bulk.archive}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</BulkActionsMenu>

			<Dialog
				open={closing !== null}
				onOpenChange={(next) => {
					if (next) return;
					setClosing(null);
					setReason("");
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{m.bulk.closeLost(deals(ids.length, locale))}
						</DialogTitle>
						<DialogDescription>{m.bulk.sameReason}</DialogDescription>
					</DialogHeader>

					<form
						id="bulk-close-reason"
						className="px-4"
						onSubmit={(event) => {
							event.preventDefault();
							if (!closing) return;
							setStage.mutate({ ids, stage: closing, closedReason: reason });
						}}
					>
						<Field>
							<FieldLabel htmlFor={reasonId}>{c.close.reason}</FieldLabel>
							<Textarea
								id={reasonId}
								value={reason}
								onChange={(event) => setReason(event.target.value)}
								placeholder={m.bulk.reasonPlaceholder}
								rows={3}
							/>
						</Field>
					</form>

					<DialogFooter>
						<Button
							type="submit"
							form="bulk-close-reason"
							disabled={setStage.isPending || reason.trim() === ""}
						>
							{setStage.isPending ? <Spinner /> : null}
							{m.bulk.save}
						</Button>
						<DialogClose asChild>
							<Button variant="outline">{m.bulk.cancel}</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
