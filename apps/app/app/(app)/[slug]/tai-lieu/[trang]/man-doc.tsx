"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import Information from "@carbon/icons-react/es/Information";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	MarkdownReader,
	ReaderToc,
	readerHeadings,
} from "@crm/ui/components/markdown-reader";
import { Separator } from "@crm/ui/components/separator";
import type { LoaiTrang } from "@crm/validation/tai-lieu";
import Link from "next/link";
import { useMemo } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import {
	duongDanhSach,
	duongDeXuat,
	duongSuaTrang,
	ngayTaiLieu,
} from "@/lib/tai-lieu-man";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

export type TrangDoc = {
	slug: string;
	ten: string;
	loai: LoaiTrang;
	chuTrang: string;
	donVi: string | null;
	phienBan: { so: number; duyetLuc: string } | null;
	noiDung: string;
	choLanDau: boolean;
	soBanCho: number;
	deXuatChoId: string | null;
};

export function ManDoc({ trang }: { trang: TrangDoc }) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const d = m.doc;
	const url = useWorkspaceUrl();
	const mucLuc = useMemo(() => readerHeadings(trang.noiDung), [trang.noiDung]);

	return (
		<>
			<PageShellHeader
				breadcrumb={
					<div>
						<Button asChild size="sm" variant="ghost">
							<Link href={url(duongDanhSach())}>
								<Icon icon={ArrowLeft} />
								{d.veDanhSach}
							</Link>
						</Button>
					</div>
				}
			>
				<PageShellHeading>
					<PageShellTitle translate="no">{trang.ten}</PageShellTitle>
					<PageShellDescription>
						{m.loai[trang.loai]} ·{" "}
						<span data-phien-ban="">
							{trang.phienBan
								? dien(d.phienBan, {
										so: trang.phienBan.so,
										ngay: ngayTaiLieu(trang.phienBan.duyetLuc, locale),
									})
								: d.chuaCoPhienBan}
						</span>
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<div
					className="flex min-w-0 flex-col gap-6 xl:flex-row"
					data-man-doc={trang.slug}
				>
					<article className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4">
						{trang.choLanDau ? (
							<Alert data-cho-lan-dau="" role="status">
								<Icon icon={Information} />
								<AlertTitle>{d.choLanDauTieuDe}</AlertTitle>
								<AlertDescription>
									<span translate="no">
										{dien(d.choLanDauThan, { ten: trang.chuTrang })}
									</span>
								</AlertDescription>
							</Alert>
						) : null}
						<div className="flex flex-wrap items-center gap-2">
							{trang.soBanCho > 0 ? (
								<Badge data-co-ban-cho="" variant="outline">
									{dien(d.coBanCho, { so: trang.soBanCho })}
								</Badge>
							) : null}
							{trang.choLanDau ? null : (
								<Button asChild size="sm" variant="outline">
									<Link href={url(duongSuaTrang(trang.slug))}>
										{d.suaTrang}
									</Link>
								</Button>
							)}
							{trang.deXuatChoId ? (
								<Button asChild size="sm" variant="ghost">
									<Link href={url(duongDeXuat(trang.deXuatChoId))}>
										{d.xemBanCho}
									</Link>
								</Button>
							) : null}
						</div>
						{trang.choLanDau ? null : (
							<>
								<Separator />
								<div translate="no">
									<MarkdownReader
										calloutLabels={{
											note: d.ghiChu.note,
											tip: d.ghiChu.tip,
											important: d.ghiChu.important,
											warning: d.ghiChu.warning,
											caution: d.ghiChu.caution,
										}}
										missingLabel={d.chuaCoTrang}
										sourceBackLabel={d.veChoTrich}
										sourcesLabel={d.nguon}
									>
										{trang.noiDung}
									</MarkdownReader>
								</div>
							</>
						)}
					</article>
					<aside className="flex w-full shrink-0 flex-col gap-5 xl:sticky xl:top-4 xl:w-72 xl:self-start">
						<ReaderToc headings={mucLuc} label={d.mucLuc} />
						<section className="flex flex-col gap-1" data-chu-trang="">
							<p className="font-medium text-sm">{d.chuTrang}</p>
							<p className="text-sm" translate="no">
								{trang.chuTrang}
							</p>
							{trang.donVi ? (
								<p className="text-muted-foreground text-xs" translate="no">
									{trang.donVi}
								</p>
							) : null}
							<p className="text-muted-foreground text-xs">{d.chuTrangMoTa}</p>
						</section>
					</aside>
				</div>
			</PageShellContent>
		</>
	);
}
