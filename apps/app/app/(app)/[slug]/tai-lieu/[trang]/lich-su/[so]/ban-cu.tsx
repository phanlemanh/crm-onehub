"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { DiffTrang } from "@crm/ui/components/diff-trang";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { MarkdownReader } from "@crm/ui/components/markdown-reader";
import { Separator } from "@crm/ui/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { KhoiDoi, SoDoi } from "@crm/validation/tai-lieu-diff";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { duongDeXuat, duongLichSu, ngayTaiLieu } from "@/lib/tai-lieu-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const KIEU_XEM = ["so-sanh", "toan-van"] as const;
type KieuXem = (typeof KIEU_XEM)[number];

export type PhienBanCu = {
	slug: string;
	tenTrang: string;
	so: number;
	noiDung: string;
	duyetLuc: string;
	nguoiDuyet: string;
	laBanDangDung: boolean;
	daLuuTru: boolean;
	khoi: KhoiDoi[];
	dai: SoDoi[];
};

type LoiMay = { message: string; data?: { httpStatus?: number } | null };

function laKieuXem(v: string): v is KieuXem {
	return KIEU_XEM.some((k) => k === v);
}

export function BanCu({ ban }: { ban: PhienBanCu }) {
	const locale = useLocale();
	const m = taiLieuLichSuMessages(locale).banCu;
	const doc = taiLieuMessages(locale).doc;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const [kieu, setKieu] = useState<KieuXem>("so-sanh");
	const [loi, setLoi] = useState<string | null>(null);

	const quayLai = useMutation(
		trpc.taiLieu.quayLai.mutationOptions({
			onSuccess: async (r) => {
				await cache.taiLieu(ban.slug);
				router.push(url(duongDeXuat(r.deXuatId)));
			},
			onError: (e: LoiMay) =>
				setLoi(
					dien(m.loiTao, {
						loi:
							e.data?.httpStatus !== undefined && e.data.httpStatus < 500
								? e.message
								: m.mayChu,
					}),
				),
		}),
	);

	const toanVan = (
		<div translate="no">
			<MarkdownReader
				calloutLabels={doc.ghiChu}
				missingLabel={doc.chuaCoTrang}
				sourceBackLabel={doc.veChoTrich}
				sourcesLabel={doc.nguon}
			>
				{ban.noiDung}
			</MarkdownReader>
		</div>
	);

	return (
		<>
			<PageShellHeader
				breadcrumb={
					<div>
						<Button asChild size="sm" variant="ghost">
							<Link href={url(duongLichSu(ban.slug))}>
								<Icon icon={ArrowLeft} />
								{m.veLichSu}
							</Link>
						</Button>
					</div>
				}
			>
				<PageShellHeading>
					<PageShellTitle translate="no">{ban.tenTrang}</PageShellTitle>
					<PageShellDescription>
						<span translate="no">
							{dien(m.moTa, {
								so: ban.so,
								ngay: ngayTaiLieu(ban.duyetLuc, locale),
								ten: ban.nguoiDuyet,
							})}
						</span>
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<section
					className="flex min-w-0 max-w-3xl flex-col gap-4"
					data-ban-cu={ban.so}
				>
					{ban.laBanDangDung ? (
						<p
							className="text-muted-foreground text-sm"
							data-la-ban-dang-dung=""
						>
							{m.laBanDangDung}
						</p>
					) : (
						<div className="flex flex-wrap items-center gap-2">
							<ToggleGroup
								aria-label={m.kieuXem}
								onValueChange={(v) => {
									if (laKieuXem(v)) setKieu(v);
								}}
								size="sm"
								type="single"
								value={kieu}
								variant="outline"
							>
								<ToggleGroupItem data-kieu="so-sanh" value="so-sanh">
									{m.soSanh}
								</ToggleGroupItem>
								<ToggleGroupItem data-kieu="toan-van" value="toan-van">
									{m.toanVan}
								</ToggleGroupItem>
							</ToggleGroup>
							{ban.daLuuTru ? null : (
								<Button
									data-nut-quay-lai=""
									disabled={quayLai.isPending}
									onClick={() => {
										setLoi(null);
										quayLai.mutate({ slug: ban.slug, so: ban.so });
									}}
									size="sm"
									variant="outline"
								>
									{quayLai.isPending
										? m.dangTao
										: dien(m.quayLai, { so: ban.so })}
								</Button>
							)}
						</div>
					)}
					{ban.daLuuTru && !ban.laBanDangDung ? (
						<p className="text-muted-foreground text-sm" data-ban-cu-luu-tru="">
							{m.daLuuTru}
						</p>
					) : null}
					<div aria-live="polite">
						{loi ? (
							<Alert data-loi-quay-lai="" role="status">
								<AlertDescription>{loi}</AlertDescription>
							</Alert>
						) : null}
					</div>
					<Separator />
					{kieu === "so-sanh" && !ban.laBanDangDung ? (
						<DiffTrang
							dai={ban.dai}
							khoi={ban.khoi}
							nhanBo={m.nhanBo}
							nhanDaiSo={m.nhanDaiSo}
							nhanThem={m.nhanThem}
						/>
					) : (
						toanVan
					)}
				</section>
			</PageShellContent>
		</>
	);
}
