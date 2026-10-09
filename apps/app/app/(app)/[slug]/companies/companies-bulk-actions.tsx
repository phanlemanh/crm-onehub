"use client";

import Archive from "@carbon/icons-react/es/Archive";
import Renew from "@carbon/icons-react/es/Renew";
import Undo from "@carbon/icons-react/es/Undo";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@crm/ui/components/dropdown-menu";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatCount } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
	BulkActionsMenu,
	BulkDeleteDialog,
	BulkOwnerMenu,
	baoHoanTacLoat,
	baoLuuTruLoat,
	reportBulk,
} from "@/components/crm/bulk-actions";
import { companyMessages } from "@/lib/messages/companies";
import { crmMessages } from "@/lib/messages/crm";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

function companies(count: number, locale: Locale): string {
	const m = companyMessages(locale);
	return formatCount(count, m.noun, locale, m.nounPlural);
}

export function CompaniesBulkActions({
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
	const m = companyMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const users = useQuery(trpc.users.list.queryOptions());
	const [confirming, setConfirming] = useState(false);

	const onError = (error: { message: string }) => toast.error(error.message);

	const assignOwner = useMutation(
		trpc.companies.bulkAssignOwner.mutationOptions({
			onSuccess: async (result) => {
				await cache.company();
				reportBulk(
					result,
					(count) => m.bulk.reassigned(companies(count, locale)),
					locale,
				);
				onDone();
			},
			onError,
		}),
	);

	const enrich = useMutation(
		trpc.companies.bulkEnrich.mutationOptions({
			onSuccess: async (result) => {
				await cache.company();
				reportBulk(
					result,
					(count) => m.bulk.enriching(companies(count, locale)),
					locale,
				);
				onDone();
			},
			onError,
		}),
	);

	const hoanTac = useMutation(
		trpc.companies.bulkRestore.mutationOptions({
			onSuccess: async (result) => {
				await cache.company();
				baoHoanTacLoat({
					result,
					restored: (count) => m.bulk.restored(companies(count, locale)),
					locale,
				});
			},
			onError: () => toast.error(c.bulk.hoanTacLoi),
		}),
	);

	const archive = useMutation(
		trpc.companies.bulkArchive.mutationOptions({
			onSuccess: async (result, variables) => {
				await cache.removedMany({ kind: "company", ids: variables.ids });
				baoLuuTruLoat({
					result,
					done: (count) => m.bulk.archived(companies(count, locale)),
					locale,
					onHoanTac: () => hoanTac.mutate({ ids: variables.ids }),
				});
				onDone();
			},
			onError,
		}),
	);

	const restore = useMutation(
		trpc.companies.bulkRestore.mutationOptions({
			onSuccess: async (result) => {
				await cache.company();
				reportBulk(
					result,
					(count) => m.bulk.restored(companies(count, locale)),
					locale,
				);
				onDone();
			},
			onError,
		}),
	);

	const purge = useMutation(
		trpc.companies.bulkPurge.mutationOptions({
			onSuccess: async (result, variables) => {
				await cache.removedMany({ kind: "company", ids: variables.ids });
				reportBulk(
					result,
					(count) => m.bulk.deleted(companies(count, locale)),
					locale,
				);
				setConfirming(false);
				onDone();
			},
			onError,
		}),
	);

	if (archived) {
		const pending = restore.isPending || purge.isPending;

		return (
			<>
				<BulkActionsMenu pending={pending}>
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
					title={m.bulk.confirmDelete(companies(ids.length, locale))}
					description={c.bulk.cannotUndo}
					onConfirm={() => purge.mutate({ ids })}
					pending={purge.isPending}
				/>
			</>
		);
	}

	const pending =
		assignOwner.isPending || enrich.isPending || archive.isPending;

	return (
		<BulkActionsMenu pending={pending}>
			<BulkOwnerMenu
				users={users.data ?? []}
				unassignedLabel={c.bulk.nobody}
				onSelect={(ownerId) => assignOwner.mutate({ ids, ownerId })}
			/>
			<DropdownMenuGroup>
				<DropdownMenuItem onSelect={() => enrich.mutate({ ids })}>
					<Renew />
					{c.bulk.reEnrich}
				</DropdownMenuItem>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem onSelect={() => archive.mutate({ ids })}>
					<Archive />
					{c.bulk.archive}
				</DropdownMenuItem>
			</DropdownMenuGroup>
		</BulkActionsMenu>
	);
}
