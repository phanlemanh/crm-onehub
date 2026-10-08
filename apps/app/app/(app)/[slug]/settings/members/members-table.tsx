"use client";

import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
} from "@crm/ui/components/data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { skipToken, useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { ListSearch } from "@/components/data-table/list-search";
import { useTableQuery } from "@/components/data-table/use-table-query";
import { LocalRelativeTime } from "@/components/local-date-time";
import { keHoachNoiMessages } from "@/lib/messages/ke-hoach-noi";
import { okrMessages } from "@/lib/messages/okr";
import {
	type ThanhVienMessages,
	thanhVienMessages,
} from "@/lib/messages/settings-thanh-vien";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { ChuyenOkrDialog } from "./chuyen-okr-dialog";
import { ChuyenViecDialog } from "./chuyen-viec-dialog";
import { membersSearchParams } from "./members-search-params";
import { PhatChiaButton } from "./phat-chia-button";
import { VetLine } from "./vet-line";

type Role = keyof ThanhVienMessages["vaiTro"];

type MemberRow = RouterOutputs["workspace"]["members"]["rows"][number];

function roles(t: ThanhVienMessages): Role[] {
	return Object.keys(t.vaiTro) as Role[];
}

function columns(
	t: ThanhVienMessages,
	canChangeRoles: boolean,
	canManageMembers: boolean,
	canIssuePasswordLink: boolean,
	onChangeRole: (member: MemberRow, role: Role) => void,
	onRemove: (member: MemberRow) => void,
	onDaPhat: () => void,
	pending: boolean,
	onChuyenViec: ((member: MemberRow) => void) | null,
	nhanChuyenViec: string,
	onChuyenOkr: ((member: MemberRow) => void) | null,
	nhanChuyenOkr: string,
): DataTableColumn<MemberRow>[] {
	return [
		{
			id: "name",
			header: t.bang.ten,
			sortable: true,
			hideable: false,
			width: "w-[26%]",
			cellClassName: "whitespace-normal align-top",
			cell: (row) => (
				<span className="flex min-w-0 items-center gap-2">
					<PersonAvatar
						translate="no"
						size="sm"
						src={row.image}
						name={row.name}
						email={row.email}
					/>
					<span className="flex min-w-0 flex-col">
						<span className="flex items-center gap-2">
							<span className="truncate font-medium" translate="no">
								{row.name}
							</span>
							{row.isViewer ? (
								<span className="text-muted-foreground text-xs">
									{t.bang.ban}
								</span>
							) : null}
						</span>
						{row.passwordLinkIssuedByName && row.passwordLinkIssuedAt ? (
							<VetLine
								t={t}
								ten={row.passwordLinkIssuedByName}
								luc={row.passwordLinkIssuedAt}
							/>
						) : null}
					</span>
				</span>
			),
		},
		{
			id: "email",
			header: t.bang.email,
			sortable: true,
			width: "w-[27%]",
			hideBelow: "md",
			cell: (row) => (
				<span className="truncate text-muted-foreground" translate="no">
					{row.email}
				</span>
			),
		},
		{
			id: "role",
			header: t.bang.vaiTro,
			sortable: true,
			width: "w-[15%]",
			cell: (row) => (
				<span className="text-muted-foreground">{t.vaiTro[row.role]}</span>
			),
		},
		{
			id: "joinedAt",
			header: t.bang.thamGia,
			label: t.bang.thamGiaDayDu,
			sortable: true,
			align: "right",
			width: "w-[12%]",
			hideBelow: "lg",
			cell: (row) => (
				<span className="text-muted-foreground">
					<LocalRelativeTime date={row.joinedAt} />
				</span>
			),
		},
		{
			id: "phatChia",
			header: <span className="sr-only">{t.phatChia.nut}</span>,
			label: t.phatChia.nut,
			hideable: false,
			align: "right",
			width: "w-[14%]",
			cell: (row) => (
				<PhatChiaButton
					t={t}
					email={row.email}
					ten={row.name}
					coQuyen={canIssuePasswordLink}
					onDaPhat={onDaPhat}
				/>
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
				canChangeRoles || canManageMembers || onChuyenViec || onChuyenOkr ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" disabled={pending}>
								<Icon icon={OverflowMenuHorizontal} />
								<span className="sr-only">{t.bang.doiVaiTro(row.name)}</span>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{canChangeRoles
								? roles(t).map((role) => (
										<DropdownMenuItem
											key={role}
											data-checked={row.role === role}
											onSelect={() => {
												if (row.role === role) return;
												onChangeRole(row, role);
											}}
										>
											{t.vaiTro[role]}
										</DropdownMenuItem>
									))
								: null}

							{onChuyenViec ? (
								<DropdownMenuItem onSelect={() => onChuyenViec(row)}>
									{nhanChuyenViec}
								</DropdownMenuItem>
							) : null}

							{onChuyenOkr ? (
								<DropdownMenuItem onSelect={() => onChuyenOkr(row)}>
									{nhanChuyenOkr}
								</DropdownMenuItem>
							) : null}

							{canManageMembers && !row.isViewer ? (
								<DropdownMenuItem
									variant="destructive"
									onSelect={() => onRemove(row)}
								>
									{t.go}
								</DropdownMenuItem>
							) : null}
						</DropdownMenuContent>
					</DropdownMenu>
				) : null,
		},
	];
}

export function MembersTable() {
	const locale = useLocale();
	const t = thanhVienMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { query, input, currentView, applyView } =
		useTableQuery(membersSearchParams);
	const tieuDeId = useId();

	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const members = useQuery({
		...trpc.workspace.members.queryOptions(input),
		placeholderData: (previous) => previous,
	});
	const tatCa = useQuery(
		trpc.workspace.members.queryOptions(membersSearchParams.defaultInput()),
	);
	const soDaVao = tatCa.data?.total;

	const setRole = useMutation(
		trpc.workspace.setMemberRole.mutationOptions({
			onSuccess: async () => {
				await cache.workspace();
				toast.success(t.bang.daDoi);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const [dangGo, setDangGo] = useState<MemberRow | null>(null);
	const [dangChuyen, setDangChuyen] = useState<MemberRow | null>(null);
	const [dangChuyenOkr, setDangChuyenOkr] = useState<MemberRow | null>(null);
	const quyenKeHoach = useQuery(trpc.onboarding.access.queryOptions());
	const k = keHoachNoiMessages(locale).chuyen;
	const kOkr = okrMessages(locale).chuyen;

	const okrCuaNguoiGo = useQuery(
		trpc.okr.transferPreview.queryOptions(
			dangGo ? { fromUserId: dangGo.userId } : skipToken,
			{ staleTime: 0 },
		),
	);
	const soOkr = okrCuaNguoiGo.data
		? okrCuaNguoiGo.data.kr + okrCuaNguoiGo.data.mucTieu
		: 0;
	let canhBaoGo: ReactNode = null;
	if (dangGo && okrCuaNguoiGo.isPending)
		canhBaoGo = (
			<p
				className="text-muted-foreground text-sm"
				role="status"
				data-go-dang-doc
			>
				{t.xacNhan.go.dangDoc}
			</p>
		);
	else if (okrCuaNguoiGo.isError)
		canhBaoGo = (
			<p
				className="text-muted-foreground text-sm"
				role="status"
				data-go-loi-doc
			>
				{t.xacNhan.go.loiDoc}
			</p>
		);
	else if (okrCuaNguoiGo.data && soOkr > 0)
		canhBaoGo = (
			<Alert variant="warning" data-go-co-okr>
				<AlertDescription>
					{dien(t.xacNhan.go.coOkr, {
						kr: okrCuaNguoiGo.data.kr,
						mucTieu: okrCuaNguoiGo.data.mucTieu,
					})}
				</AlertDescription>
			</Alert>
		);

	const remove = useMutation(
		trpc.workspace.removeMember.mutationOptions({
			onSuccess: async () => {
				setDangGo(null);
				await cache.workspace();
				await members.refetch();
				toast.success(t.xacNhan.go.xong);
			},
			onError: (error) => {
				setDangGo(null);
				toast.error(error.message);
			},
		}),
	);

	const facetCounts = members.data?.facetCounts;

	const facets: DataTableFacet[] = [
		{
			id: "role",
			label: t.bang.vaiTro,
			options: roles(t).map((role) => ({
				value: role,
				label: t.vaiTro[role],
			})),
		},
	];

	return (
		<section aria-labelledby={tieuDeId}>
			<Card>
				<CardHeader>
					<CardTitle id={tieuDeId}>
						{soDaVao === undefined
							? t.bang.tieuDe
							: t.dem(t.bang.tieuDe, soDaVao)}
					</CardTitle>
					<CardDescription>{t.bang.moTa}</CardDescription>
				</CardHeader>

				<DataTable
					layout="content"
					query={query}
					search={<ListSearch placeholder={t.bang.tim} />}
					columns={columns(
						t,
						workspace.data?.canChangeRoles ?? false,
						workspace.data?.canManageMembers ?? false,
						workspace.data?.canIssuePasswordLink ?? false,
						(member, role) => setRole.mutate({ memberId: member.id, role }),
						(member) => setDangGo(member),
						() => {
							void members.refetch();
						},
						setRole.isPending || remove.isPending,
						quyenKeHoach.data?.canManage
							? (member) => setDangChuyen(member)
							: null,
						k.menu,
						quyenKeHoach.data?.canManage
							? (member) => setDangChuyenOkr(member)
							: null,
						kOkr.menu,
					)}
					rows={members.data?.rows ?? []}
					total={members.data?.total ?? 0}
					facetCounts={facetCounts}
					facets={facets}
					getRowId={(row) => row.id}
					loading={members.isFetching}
					empty={t.bang.trong}
					searchActive={input.q !== ""}
					onClearFilters={() =>
						applyView({ ...currentView, q: "", filters: {} })
					}
				/>
			</Card>

			<ChuyenViecDialog
				nguoi={
					dangChuyen === null
						? null
						: { userId: dangChuyen.userId, name: dangChuyen.name }
				}
				onDong={() => setDangChuyen(null)}
			/>

			<ChuyenOkrDialog
				nguoi={
					dangChuyenOkr === null
						? null
						: { userId: dangChuyenOkr.userId, name: dangChuyenOkr.name }
				}
				onDong={() => setDangChuyenOkr(null)}
			/>

			<ConfirmDialog
				tieuDe={t.xacNhan.go.tieuDe}
				than={t.xacNhan.go.than}
				nut={t.xacNhan.go.nut}
				thoi={t.xacNhan.thoi}
				open={dangGo !== null}
				onOpenChange={(next) => {
					if (!next) setDangGo(null);
				}}
				onConfirm={() => {
					if (dangGo) remove.mutate({ memberId: dangGo.id });
				}}
				pending={remove.isPending}
				noiDung={canhBaoGo}
				nutPhu={
					soOkr > 0 && quyenKeHoach.data?.canManage
						? {
								nut: kOkr.menu,
								onClick: () => {
									const x = dangGo;
									setDangGo(null);
									setDangChuyenOkr(x);
								},
							}
						: null
				}
			/>
		</section>
	);
}
