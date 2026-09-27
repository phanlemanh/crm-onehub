"use client";

import TrashCan from "@carbon/icons-react/es/TrashCan";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@crm/ui/components/alert-dialog";
import { Button } from "@crm/ui/components/button";
import { CopyValue } from "@crm/ui/components/copy-value";
import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { type SsoMessages, ssoMessages } from "@/lib/messages/settings-sso";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { ssoSearchParams } from "./sso-search-params";

type ProviderRow = RouterOutputs["sso"]["list"]["rows"][number];

function columns(
	t: SsoMessages,
	canConfigure: boolean,
	onRemove: (provider: ProviderRow) => void,
	pending: boolean,
): DataTableColumn<ProviderRow>[] {
	return [
		{
			id: "providerId",
			header: t.bang.nhaCungCap,
			sortable: true,
			hideable: false,
			width: "w-[30%]",
			cell: (row) => (
				<span className="flex min-w-0 flex-col">
					<span className="truncate font-medium" translate="no">
						{row.name}
					</span>
					<span className="truncate text-muted-foreground text-xs">
						{row.type === "saml" ? t.bang.chuanSaml : t.bang.chuanOidc}
						{row.clientIdLastFour ? t.bang.maClient(row.clientIdLastFour) : ""}
					</span>
				</span>
			),
		},
		{
			id: "domain",
			header: t.bang.tenMien,
			sortable: true,
			width: "w-[22%]",
			hideBelow: "sm",
			cell: (row) => (
				<span className="truncate text-muted-foreground" translate="no">
					{row.domains.join(", ")}
				</span>
			),
		},
		{
			id: "issuer",
			header: t.bang.issuer,
			sortable: true,
			width: "w-[22%]",
			hideBelow: "md",
			cell: (row) => (
				<span className="truncate text-muted-foreground" translate="no">
					{row.issuer}
				</span>
			),
		},
		{
			id: "callbackURL",
			header: t.bang.uriChuyenHuong,
			width: "w-[20%]",
			hideBelow: "lg",
			cell: (row) => (
				<span className="flex min-w-0 items-center gap-1 text-muted-foreground">
					<span className="truncate" translate="no">
						{row.callbackURL}
					</span>
					<CopyValue value={row.callbackURL} label={t.bang.uriChuyenHuong} />
				</span>
			),
		},
		{
			id: "actions",
			header: <span className="sr-only">{t.bang.hanhDong}</span>,
			label: t.bang.hanhDong,
			hideable: false,
			align: "right",
			width: "w-[6%]",
			cell: (row) =>
				canConfigure ? (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="ghost" size="icon" disabled={pending}>
								<Icon icon={TrashCan} />
								<span className="sr-only">{t.go.choNha(row.name)}</span>
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									{t.go.nhan} <span translate="no">{row.name}</span>?
								</AlertDialogTitle>
								<AlertDialogDescription>{t.go.moTa}</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>{t.go.huy}</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									onClick={() => onRemove(row)}
								>
									{t.go.nhan}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				) : null,
		},
	];
}

export function SsoTable() {
	const t = ssoMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { query, input } = useTableQuery(ssoSearchParams);

	const settings = useQuery(trpc.sso.settings.queryOptions());
	const providers = useQuery({
		...trpc.sso.list.queryOptions(input),
		placeholderData: (previous) => previous,
	});

	const remove = useMutation(
		trpc.sso.remove.mutationOptions({
			onSuccess: async () => {
				await cache.sso();
				toast.success(t.go.xong);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<DataTable
			query={query}
			search={<ListSearch placeholder={t.bang.tim} />}
			columns={columns(
				t,
				settings.data?.canConfigure ?? false,
				(provider) => remove.mutate({ providerId: provider.providerId }),
				remove.isPending,
			)}
			rows={providers.data?.rows ?? []}
			total={providers.data?.total ?? 0}
			getRowId={(row) => row.providerId}
			loading={providers.isFetching}
			empty={t.bang.trong}
		/>
	);
}
