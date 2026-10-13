"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { ArchivedList } from "@crm/ui/components/archived-list";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { SortableSaveList } from "@crm/ui/components/sortable-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageShellNote } from "@/components/page-shell-note";
import {
	type GiaiDoanHien,
	type LoaiGiaiDoanHien,
	useGiaiDoan,
} from "@/lib/giai-doan";
import { settingsMessages } from "@/lib/messages/settings";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { HopThoaiGiaiDoan, useHopThoaiGiaiDoan } from "./hop-thoai-giai-doan";

const LOAI: readonly LoaiGiaiDoanHien[] = ["OPEN", "WON", "LOST"];
export const ID_LY_DO_GIAI_DOAN = "giai-doan-ly-do";

export function LyDoGiaiDoan() {
	const t = settingsMessages(useLocale()).giaiDoan;
	const giaiDoan = useGiaiDoan();
	if (giaiDoan.dangTai || giaiDoan.loi) return null;
	if (!giaiDoan.canManage) {
		return (
			<PageShellNote
				data-trang-thai="ST-giaidoan-khongquyen"
				id={ID_LY_DO_GIAI_DOAN}
			>
				{t.khongQuyen}
			</PageShellNote>
		);
	}
	if (giaiDoan.stages.length >= giaiDoan.tran) {
		return (
			<PageShellNote id={ID_LY_DO_GIAI_DOAN}>
				{t.datTranLuuTru.replace("{so}", String(giaiDoan.tran))}
			</PageShellNote>
		);
	}
	return null;
}

function DangTai() {
	return (
		<div className="flex flex-col gap-6" aria-busy="true">
			{LOAI.map((kind) => (
				<Card key={kind}>
					<CardHeader>
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-64" />
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Skeleton className="h-6 w-full" />
						<Skeleton className="h-6 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function MenuHang({
	g,
	khoa,
	laCuoi,
	onDoiTen,
	onLuuTru,
}: {
	g: GiaiDoanHien;
	khoa: boolean;
	laCuoi: boolean;
	onDoiTen: () => void;
	onLuuTru: () => void;
}) {
	const t = settingsMessages(useLocale()).giaiDoan;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={khoa}>
				<Button
					variant="ghost"
					size="icon-xs"
					aria-label={t.thaoTac.replace("{ten}", g.label)}
					data-menu-giai-doan
				>
					<Icon icon={OverflowMenuVertical} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onSelect={onDoiTen}>{t.doiTen}</DropdownMenuItem>
				<DropdownMenuItem disabled={laCuoi} onSelect={onLuuTru}>
					{laCuoi ? `${t.luuTru} — ${t.xoaCuoiCung}` : t.luuTru}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function TheLoai({
	kind,
	cua,
	khoa,
	datTran,
	coLyDo,
	sapXep,
	luuTru,
	hop,
}: {
	kind: LoaiGiaiDoanHien;
	cua: GiaiDoanHien[];
	khoa: boolean;
	datTran: boolean;
	coLyDo: boolean;
	sapXep: (kind: LoaiGiaiDoanHien, ids: string[]) => Promise<unknown>;
	luuTru: (g: GiaiDoanHien) => void;
	hop: ReturnType<typeof useHopThoaiGiaiDoan>;
}) {
	const theoId = new Map(cua.map((g) => [g.id, g]));
	const t = settingsMessages(useLocale()).giaiDoan;
	const tieuDe = {
		OPEN: { tieuDe: t.mo, moTa: t.moMoTa },
		WON: { tieuDe: t.chot, moTa: t.chotMoTa },
		LOST: { tieuDe: t.khongThanh, moTa: t.khongThanhMoTa },
	}[kind];

	return (
		<Card data-the-giai-doan={kind}>
			<CardHeader>
				<CardTitle>{tieuDe.tieuDe}</CardTitle>
				<CardDescription>{tieuDe.moTa}</CardDescription>
				<CardAction>
					<Button
						variant="outline"
						size="sm"
						disabled={khoa || datTran}
						aria-describedby={coLyDo ? ID_LY_DO_GIAI_DOAN : undefined}
						onClick={() => hop.moThem(kind)}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{t.them}
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<SortableSaveList
					ids={cua.map((g) => g.id)}
					label={(id) => theoId.get(id)?.label ?? id}
					disabled={khoa}
					onSave={({ ids }) => sapXep(kind, ids)}
				>
					{(id, locked) => {
						const g = theoId.get(id);
						if (!g) return null;
						return (
							<div
								className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2"
								data-hang-giai-doan={g.id}
							>
								<span
									className="min-w-0 break-words text-sm"
									translate="no"
									data-nhan-giai-doan
								>
									{g.label}
								</span>
								<span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
									{t.soThoaThuan.replace("{so}", String(g.dealCount))}
									<MenuHang
										g={g}
										khoa={locked}
										laCuoi={cua.length === 1}
										onDoiTen={() => hop.moDoiTen(g.id)}
										onLuuTru={() => luuTru(g)}
									/>
								</span>
							</div>
						);
					}}
				</SortableSaveList>
			</CardContent>
		</Card>
	);
}

function DaLuuTruGiaiDoan({ canManage }: { canManage: boolean }) {
	const t = settingsMessages(useLocale()).giaiDoan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const daCat = useQuery(trpc.giaiDoan.archived.queryOptions());
	const restore = useMutation(trpc.giaiDoan.restore.mutationOptions());
	const nhom = { OPEN: t.mo, WON: t.chot, LOST: t.khongThanh };
	const rows = daCat.data ?? [];
	const theoId = new Map(rows.map((g) => [g.id, g]));

	if (daCat.data === undefined && daCat.errorUpdateCount > 0) {
		return (
			<Empty border="solid" data-da-luu-tru-loi>
				<EmptyHeader>
					<EmptyTitle>{t.loiTaiDaLuuTru}</EmptyTitle>
					<EmptyDescription>{t.loiTaiMoTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button
						variant="outline"
						disabled={daCat.isFetching}
						onClick={() => void daCat.refetch()}
					>
						{t.thuLai}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	if (daCat.data === undefined) {
		return <Skeleton className="h-8 w-40" data-da-luu-tru-dang-tai />;
	}

	return (
		<ArchivedList
			label={t.daLuuTru}
			restoreLabel={t.khoiPhuc}
			purgeLabel={t.xoaVinhVien}
			items={rows.map((g) => ({
				id: g.id,
				name: g.label,
				kind: nhom[g.kind],
				purgeable: false,
			}))}
			disabled={!canManage}
			pending={restore.isPending}
			onRestore={(id) => {
				const g = theoId.get(id);
				if (!g || restore.isPending) return;
				restore.mutate(
					{ id },
					{
						onSuccess: () =>
							toast.success(t.daKhoiPhucTen.replace("{ten}", g.label)),
						onError: (error) => toast.error(error.message),
						onSettled: () => cache.giaiDoan(),
					},
				);
			}}
			onPurge={() => undefined}
		/>
	);
}

export function GiaiDoanSettings() {
	const t = settingsMessages(useLocale()).giaiDoan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const giaiDoan = useGiaiDoan();
	const hop = useHopThoaiGiaiDoan();

	const reorder = useMutation(trpc.giaiDoan.reorder.mutationOptions());
	const archive = useMutation(trpc.giaiDoan.archive.mutationOptions());
	const restore = useMutation(trpc.giaiDoan.restore.mutationOptions());

	const sapXep = (kind: LoaiGiaiDoanHien, ids: string[]) =>
		reorder.mutateAsync({ kind, ids }).finally(() => cache.giaiDoan());

	const hoanTacLuuTru = (g: GiaiDoanHien, truoc: string[]) =>
		restore.mutateAsync({ id: g.id }).then(
			() =>
				reorder
					.mutateAsync({ kind: g.kind, ids: truoc })
					.then(() => toast.success(t.daKhoiPhucTen.replace("{ten}", g.label)))
					.catch((error: Error) => toast.error(error.message))
					.then(() => true)
					.finally(() => void cache.giaiDoan()),
			(error: Error) => {
				toast.error(error.message);
				void cache.giaiDoan();
				return false;
			},
		);

	const luuTru = (g: GiaiDoanHien) => {
		if (g.dealCount > 0) {
			hop.moXoa(g.id);
			return;
		}
		const truoc = giaiDoan.stages
			.filter((x) => x.kind === g.kind)
			.map((x) => x.id);
		archive
			.mutateAsync({ id: g.id })
			.then(async () => {
				await Promise.all([cache.giaiDoan(), cache.deal()]);
				let daTra = false;
				toast.success(t.daLuuTruTen.replace("{ten}", g.label), {
					action: {
						label: t.hoanTac,
						onClick: () => {
							if (daTra) return;
							daTra = true;
							void hoanTacLuuTru(g, truoc).then((duoc) => {
								daTra = duoc;
							});
						},
					},
				});
			})
			.catch((error: Error) => toast.error(error.message));
	};

	if (giaiDoan.loi) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{t.loiTai}</EmptyTitle>
					<EmptyDescription>{t.loiTaiMoTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" onClick={giaiDoan.thuLai}>
						{t.thuLai}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	if (giaiDoan.dangTai) return <DangTai />;

	const khoa = !giaiDoan.canManage || archive.isPending;
	const datTran = giaiDoan.stages.length >= giaiDoan.tran;

	return (
		<div className="flex flex-col gap-6">
			{LOAI.map((kind) => (
				<TheLoai
					key={kind}
					kind={kind}
					cua={giaiDoan.stages.filter((g) => g.kind === kind)}
					khoa={khoa}
					datTran={datTran}
					coLyDo={!giaiDoan.canManage || datTran}
					sapXep={sapXep}
					luuTru={luuTru}
					hop={hop}
				/>
			))}
			<DaLuuTruGiaiDoan canManage={giaiDoan.canManage} />
			<HopThoaiGiaiDoan hop={hop} stages={giaiDoan.stages} />
		</div>
	);
}
