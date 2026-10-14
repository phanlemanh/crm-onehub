"use client";

import Notification from "@carbon/icons-react/es/Notification";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { THONG_BAO } from "@crm/validation/thong-bao";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	DanhSachNhomThongBao,
	type DongThongBao,
} from "@/components/thong-bao/dong-thong-bao";
import { thongBaoMessages } from "@/lib/messages/thong-bao";
import { chiaHomNay } from "@/lib/thong-bao/dong";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceSlug, useWorkspaceUrl } from "@/lib/use-workspace-url";

export type TrangThaiChuong = "cho-tai" | "loi" | "xong";

export function soTrenChuong(so: number, tran: number): string | null {
	if (so <= 0) return null;
	return so > tran ? `${tran}+` : String(so);
}

export function ChuongThongBaoKhung({
	trangThai,
	soChuaDoc,
	tranSo,
	homNay,
	truocDo,
	hrefTatCa,
	dangDocHet,
	open,
	onOpenChange,
	onMo,
	onDocHet,
	onThuLai,
}: {
	trangThai: TrangThaiChuong;
	soChuaDoc: number;
	tranSo: number;
	homNay: DongThongBao[];
	truocDo: DongThongBao[];
	hrefTatCa: string;
	dangDocHet: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onMo: (id: string) => void;
	onDocHet: () => void;
	onThuLai: () => void;
}) {
	const m = thongBaoMessages(useLocale()).chuong;
	const so = soTrenChuong(soChuaDoc, tranSo);
	const nhan = so ? dien(m.nhanSo, { so }) : m.nhan;
	const rong = homNay.length === 0 && truocDo.length === 0;

	let than: React.ReactNode;
	if (trangThai === "cho-tai") {
		than = (
			<div className="flex flex-col gap-2 p-3" aria-busy="true">
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-9 w-full" />
			</div>
		);
	} else if (trangThai === "loi") {
		than = (
			<div className="p-3">
				<VungTaiLoi tieuDe={m.loiTieuDe} moTa={m.loiMoTa} onThuLai={onThuLai} />
			</div>
		);
	} else if (rong) {
		than = (
			<Empty size="compact">
				<EmptyHeader>
					<EmptyTitle>{m.rongTieuDe}</EmptyTitle>
					<EmptyDescription>{m.rongMoTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	} else {
		than = (
			<div className="max-h-[min(28rem,70dvh)] overflow-y-auto overscroll-contain py-1">
				<DanhSachNhomThongBao
					nhanChuaDoc={m.chuaDoc}
					nhom={[
						{ nhan: m.homNay, dong: homNay },
						{ nhan: m.truocDo, dong: truocDo },
					]}
					onMo={onMo}
				/>
			</div>
		);
	}

	return (
		<>
			<span role="status" aria-live="polite" className="sr-only">
				{nhan}
			</span>
			<Popover open={open} onOpenChange={onOpenChange}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						aria-label={nhan}
						data-slot="chuong-thong-bao"
					>
						<Notification aria-hidden="true" />
						{so ? (
							<span className="tabular-nums" data-slot="so-chua-doc">
								{so}
							</span>
						) : null}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					size="panel"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
						(e.currentTarget as HTMLElement | null)?.focus();
					}}
				>
					<div className="flex items-center justify-between gap-2 border-b px-4 py-2">
						<span className="font-semibold text-popover-foreground text-sm">
							{m.tieuDe}
						</span>
						<Button
							variant="ghost"
							size="sm"
							disabled={soChuaDoc === 0 || dangDocHet || trangThai !== "xong"}
							onClick={onDocHet}
						>
							{dangDocHet ? m.dangDocHet : m.docHet}
						</Button>
					</div>
					{than}
					<div className="border-t px-4 py-2">
						<Button variant="ghost" size="sm" asChild>
							<Link href={hrefTatCa}>{m.xemTatCa}</Link>
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
}

export function ChuongThongBao() {
	const locale = useLocale();
	const m = thongBaoMessages(locale).chuong;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const slug = useWorkspaceSlug();
	const workspaceUrl = useWorkspaceUrl();
	const [mo, setMo] = useState(false);
	const chuong = useQuery({
		...trpc.thongBao.chuong.queryOptions(),
		refetchInterval: THONG_BAO.hoiLaiMs,
		refetchOnWindowFocus: true,
	});
	const moMot = useMutation(
		trpc.thongBao.moMot.mutationOptions({
			onSuccess: () => void cache.thongBao(),
		}),
	);
	const docHet = useMutation(
		trpc.thongBao.docHet.mutationOptions({
			onSuccess: () => void cache.thongBao(),
			onError: () => toast.error(m.docHetLoi),
		}),
	);
	const { homNay, truocDo } = chiaHomNay(chuong.data?.dong ?? [], {
		locale,
		slug,
		now: new Date(),
	});
	return (
		<ChuongThongBaoKhung
			dangDocHet={docHet.isPending}
			homNay={homNay}
			hrefTatCa={workspaceUrl("/thong-bao")}
			onDocHet={() => docHet.mutate()}
			onMo={(id) => {
				moMot.mutate({ id });
				setMo(false);
			}}
			onOpenChange={setMo}
			onThuLai={() => void chuong.refetch()}
			open={mo}
			soChuaDoc={chuong.data?.soChuaDoc ?? 0}
			tranSo={THONG_BAO.tranSo}
			trangThai={chuong.isPending ? "cho-tai" : chuong.isError ? "loi" : "xong"}
			truocDo={truocDo}
		/>
	);
}
