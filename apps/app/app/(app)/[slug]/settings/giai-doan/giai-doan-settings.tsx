"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
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
import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageShellDescription } from "@/components/page-shell";
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

export function LyDoGiaiDoan() {
	const t = settingsMessages(useLocale()).giaiDoan;
	const giaiDoan = useGiaiDoan();
	if (giaiDoan.dangTai || giaiDoan.loi) return null;
	if (!giaiDoan.canManage) {
		return <PageShellDescription>{t.khongQuyen}</PageShellDescription>;
	}
	if (giaiDoan.stages.length >= giaiDoan.tran) {
		return (
			<PageShellDescription>
				{t.datTran.replace("{so}", String(giaiDoan.tran))}
			</PageShellDescription>
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
	onXoa,
}: {
	g: GiaiDoanHien;
	khoa: boolean;
	laCuoi: boolean;
	onDoiTen: () => void;
	onXoa: () => void;
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
				<DropdownMenuItem
					variant="destructive"
					disabled={laCuoi}
					onSelect={onXoa}
				>
					{laCuoi ? `${t.xoa} — ${t.xoaCuoiCung}` : t.xoa}
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
	sapXep,
	hop,
}: {
	kind: LoaiGiaiDoanHien;
	cua: GiaiDoanHien[];
	khoa: boolean;
	datTran: boolean;
	sapXep: (kind: LoaiGiaiDoanHien, ids: string[]) => void;
	hop: ReturnType<typeof useHopThoaiGiaiDoan>;
}) {
	const [tam, setTam] = useState<string[] | null>(null);
	const theoId = new Map(cua.map((g) => [g.id, g]));
	const ids = (tam ?? cua.map((g) => g.id)).filter((id) => theoId.has(id));
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
						onClick={() => hop.moThem(kind)}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{t.them}
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<SortableList
					ids={ids}
					onReorder={(moi) => {
						if (khoa) return;
						setTam(moi);
						sapXep(kind, moi);
					}}
				>
					{ids.map((id) => {
						const g = theoId.get(id) as GiaiDoanHien;
						return (
							<SortableItem
								key={g.id}
								id={g.id}
								label={g.label}
								disabled={khoa}
							>
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
											khoa={khoa}
											laCuoi={cua.length === 1}
											onDoiTen={() => hop.moDoiTen(g.id)}
											onXoa={() => hop.moXoa(g.id)}
										/>
									</span>
								</div>
							</SortableItem>
						);
					})}
				</SortableList>
			</CardContent>
		</Card>
	);
}

export function GiaiDoanSettings() {
	const t = settingsMessages(useLocale()).giaiDoan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const giaiDoan = useGiaiDoan();
	const hop = useHopThoaiGiaiDoan();
	const dangHoanTac = useRef(false);

	const reorder = useMutation(
		trpc.giaiDoan.reorder.mutationOptions({
			onSettled: () => cache.giaiDoan(),
			onError: (error) => toast.error(error.message),
		}),
	);

	const sapXep = (kind: LoaiGiaiDoanHien, ids: string[]) => {
		const cu = giaiDoan.stages.filter((g) => g.kind === kind).map((g) => g.id);
		reorder.mutate(
			{ kind, ids },
			{
				onSuccess: () =>
					toast(t.daSapXep, {
						action: {
							label: t.hoanTac,
							onClick: () => {
								if (dangHoanTac.current) return;
								dangHoanTac.current = true;
								reorder.mutate(
									{ kind, ids: cu },
									{
										onSettled: () => {
											dangHoanTac.current = false;
										},
									},
								);
							},
						},
					}),
			},
		);
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

	const khoa = !giaiDoan.canManage || reorder.isPending;
	const datTran = giaiDoan.stages.length >= giaiDoan.tran;

	return (
		<div className="flex flex-col gap-6">
			{LOAI.map((kind) => (
				<TheLoai
					key={`${kind}:${giaiDoan.stages
						.filter((g) => g.kind === kind)
						.map((g) => g.id)
						.join(",")}`}
					kind={kind}
					cua={giaiDoan.stages.filter((g) => g.kind === kind)}
					khoa={khoa}
					datTran={datTran}
					sapXep={sapXep}
					hop={hop}
				/>
			))}
			<HopThoaiGiaiDoan hop={hop} stages={giaiDoan.stages} />
		</div>
	);
}
