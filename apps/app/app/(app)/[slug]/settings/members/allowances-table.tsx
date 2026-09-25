"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	CardTable,
	type CardTableColumn,
	CardTableEmpty,
} from "@crm/ui/components/card-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TableCell } from "@crm/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { LocalRelativeTime } from "@/components/local-date-time";
import {
	type ThanhVienMessages,
	thanhVienMessages,
} from "@/lib/messages/settings-thanh-vien";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { ConfirmDialog } from "./confirm-dialog";
import { PhatChiaButton } from "./phat-chia-button";
import { VetLine } from "./vet-line";

type Allowance = RouterOutputs["workspace"]["allowances"]["rows"][number];
type Role = keyof ThanhVienMessages["vaiTro"];

const CELL = "px-3 py-2.5 align-middle";

const HANG_KHUNG_XUONG = ["khung-1", "khung-2", "khung-3"] as const;

function columns(t: ThanhVienMessages): CardTableColumn[] {
	return [
		{ id: "diaChi", header: t.duocPhepVao.diaChi },
		{ id: "vaiTro", header: t.duocPhepVao.vaiTro, width: "w-28" },
		{ id: "nguoiChoPhep", header: t.duocPhepVao.nguoiChoPhep, width: "w-36" },
		{ id: "luc", header: t.duocPhepVao.luc, width: "w-28", align: "right" },
		{ id: "phatChia", srLabel: t.phatChia.nut, width: "w-32", align: "right" },
		{
			id: "hanhDong",
			srLabel: t.duocPhepVao.hanhDong,
			width: "w-14",
			align: "right",
		},
	];
}

export function AllowancesTable() {
	const t = thanhVienMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const tieuDeId = useId();

	const [dangRut, setDangRut] = useState<Allowance | null>(null);

	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const allowances = useQuery({
		...trpc.workspace.allowances.queryOptions(),
		enabled: workspace.data?.canManageMembers ?? false,
	});

	const rut = useMutation(
		trpc.workspace.revokeAllowance.mutationOptions({
			onSuccess: async () => {
				setDangRut(null);
				await cache.workspace();
				toast.success(t.xacNhan.rut.xong);
			},
			onError: (error) => {
				setDangRut(null);
				toast.error(error.message);
			},
		}),
	);

	if (!workspace.data?.canManageMembers) return null;

	const cot = columns(t);
	const rows = allowances.data?.rows.filter((row) => row.status === "pending");

	return (
		<section
			aria-labelledby={tieuDeId}
			aria-busy={rows === undefined && !allowances.isError}
		>
			<Card>
				<CardHeader>
					<CardTitle id={tieuDeId}>
						{rows === undefined
							? t.duocPhepVao.tieuDe
							: t.dem(t.duocPhepVao.tieuDe, rows.length)}
					</CardTitle>
					<CardDescription>{t.duocPhepVao.moTa}</CardDescription>
				</CardHeader>

				{allowances.isError ? (
					<CardTableEmpty>{allowances.error.message}</CardTableEmpty>
				) : rows === undefined ? (
					<CardTable columns={cot}>
						{HANG_KHUNG_XUONG.map((hang) => (
							<SimpleTableRow key={hang}>
								{cot.map((o) => (
									<TableCell key={o.id} className={CELL}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</SimpleTableRow>
						))}
					</CardTable>
				) : rows.length === 0 ? (
					<CardTableEmpty>{t.duocPhepVao.trong}</CardTableEmpty>
				) : (
					<CardTable columns={cot}>
						{rows.map((row) => (
							<SimpleTableRow key={row.id}>
								<TableCell className={CELL} translate="no">
									<span className="flex min-w-0 flex-col gap-1">
										<span className="truncate" title={row.email}>
											{row.email}
										</span>
										{row.passwordLinkIssuedByName &&
										row.passwordLinkIssuedAt ? (
											<VetLine
												t={t}
												ten={row.passwordLinkIssuedByName}
												luc={row.passwordLinkIssuedAt}
											/>
										) : null}
									</span>
								</TableCell>
								<TableCell className={`${CELL} text-muted-foreground`}>
									{t.vaiTro[row.role as Role]}
								</TableCell>
								<TableCell
									className={`${CELL} truncate text-muted-foreground`}
									translate="no"
								>
									{row.invitedByName ?? "—"}
								</TableCell>
								<TableCell
									className={`${CELL} text-right text-muted-foreground tabular-nums`}
								>
									<LocalRelativeTime date={row.createdAt} />
								</TableCell>
								<TableCell className={`${CELL} text-right`}>
									<PhatChiaButton
										t={t}
										email={row.email}
										ten={row.email}
										coQuyen={workspace.data?.canIssuePasswordLink ?? false}
										onDaPhat={() => {
											void cache.workspace();
										}}
									/>
								</TableCell>
								<TableCell className={`${CELL} text-right`}>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												aria-label={t.duocPhepVao.menu(row.email)}
												disabled={rut.isPending}
											>
												<Icon icon={OverflowMenuHorizontal} />
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent align="end">
											<DropdownMenuItem
												variant="destructive"
												onSelect={() => setDangRut(row)}
											>
												{t.duocPhepVao.rut}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</SimpleTableRow>
						))}
					</CardTable>
				)}
			</Card>

			<ConfirmDialog
				tieuDe={t.xacNhan.rut.tieuDe}
				than={t.xacNhan.rut.than}
				nut={t.xacNhan.rut.nut}
				thoi={t.xacNhan.thoi}
				open={dangRut !== null}
				onOpenChange={(next) => {
					if (!next) setDangRut(null);
				}}
				onConfirm={() => {
					if (dangRut) rut.mutate({ allowanceId: dangRut.id });
				}}
				pending={rut.isPending}
			/>
		</section>
	);
}
