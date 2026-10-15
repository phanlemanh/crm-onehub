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
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalRelativeTime } from "@/components/local-date-time";
import {
	type KhoaApiMessages,
	khoaApiMessages,
} from "@/lib/messages/settings-khoa-api";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { apiKeysSearchParams } from "./api-keys-search-params";
import { NhanLoaiKhoa } from "./loai-khoa";

type ApiKeyRow = RouterOutputs["apiKeys"]["list"]["rows"][number];

function isExpired(expiresAt: string | null): boolean {
	return expiresAt !== null && new Date(expiresAt).getTime() < Date.now();
}

function columns(
	t: KhoaApiMessages,
	onRevoke: (apiKey: ApiKeyRow) => void,
	pending: boolean,
): DataTableColumn<ApiKeyRow>[] {
	return [
		{
			id: "name",
			header: t.bang.ten,
			sortable: true,
			hideable: false,
			width: "w-[28%]",
			cell: (row) => (
				<span className="flex min-w-0 items-center gap-2">
					<span className="truncate font-medium" translate="no">
						{row.name ?? t.bang.chuaDatTen}
					</span>
					<NhanLoaiKhoa t={t} loai={row.loai} />
				</span>
			),
		},
		{
			id: "start",
			header: t.bang.khoa,
			width: "w-[20%]",
			hideBelow: "sm",
			cell: (row) => (
				<Badge variant="mono" translate="no">
					{row.start ? `${row.start}…` : "—"}
				</Badge>
			),
		},
		{
			id: "createdAt",
			header: t.bang.ngayTao,
			sortable: true,
			width: "w-[16%]",
			hideBelow: "md",
			cell: (row) => (
				<span className="text-muted-foreground">
					<LocalRelativeTime date={row.createdAt} />
				</span>
			),
		},
		{
			id: "lastRequest",
			header: t.bang.dungLanCuoi,
			label: t.bang.dungLanCuoiDayDu,
			sortable: true,
			width: "w-[16%]",
			hideBelow: "lg",
			cell: (row) => (
				<span className="text-muted-foreground">
					{row.lastRequest ? (
						<LocalRelativeTime date={row.lastRequest} />
					) : (
						t.bang.chuaDung
					)}
				</span>
			),
		},
		{
			id: "expiresAt",
			header: t.bang.hetHan,
			sortable: true,
			width: "w-[14%]",
			hideBelow: "lg",
			cell: (row) =>
				row.expiresAt ? (
					<span
						className={
							isExpired(row.expiresAt)
								? "text-destructive"
								: "text-muted-foreground"
						}
					>
						<LocalRelativeTime date={row.expiresAt} />
					</span>
				) : (
					<span className="text-muted-foreground">{t.bang.khongHetHan}</span>
				),
		},
		{
			id: "actions",
			header: <span className="sr-only">{t.bang.hanhDong}</span>,
			label: t.bang.hanhDong,
			hideable: false,
			align: "right",
			width: "w-[6%]",
			cell: (row) => (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="ghost" size="icon" disabled={pending}>
							<Icon icon={TrashCan} />
							<span className="sr-only">
								{t.thuHoi.choKhoa(row.name ?? t.thuHoi.khoaNay)}
							</span>
						</Button>
					</AlertDialogTrigger>

					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								{t.thuHoi.nhan}{" "}
								<span translate="no">{row.name ?? t.thuHoi.khoaNay}</span>?
							</AlertDialogTitle>
							<AlertDialogDescription>{t.thuHoi.moTa}</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>{t.thuHoi.huy}</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								onClick={() => onRevoke(row)}
							>
								{t.thuHoi.nhan}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			),
		},
	];
}

export function ApiKeysTable() {
	const t = khoaApiMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { query, input } = useTableQuery(apiKeysSearchParams);

	const apiKeys = useQuery({
		...trpc.apiKeys.list.queryOptions(input),
		placeholderData: (previous) => previous,
	});

	const revoke = useMutation(
		trpc.apiKeys.revoke.mutationOptions({
			onSuccess: async () => {
				if (apiKeys.data?.rows.length === 1 && query.page > 1) {
					await query.setPage(query.page - 1);
				}
				await cache.apiKeys();
				toast.success(t.thuHoi.xong);
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
				(apiKey) => revoke.mutate({ id: apiKey.id }),
				revoke.isPending,
			)}
			rows={apiKeys.data?.rows ?? []}
			total={apiKeys.data?.total ?? 0}
			getRowId={(row) => row.id}
			loading={apiKeys.isFetching}
			empty={t.bang.trong}
		/>
	);
}
