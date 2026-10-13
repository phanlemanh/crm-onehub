"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import { Button } from "@crm/ui/components/button";
import { Empty, EmptyHeader, EmptyTitle } from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { duongPhienBan, duongTrang, ngayTaiLieu } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const DONG_CHO = ["mot", "hai", "ba"] as const;

export type DongLichSu = {
	so: number;
	ten: string;
	duyetLuc: string;
	nguoiDuyet: { id: string; name: string };
	nguoiDeXuat: { id: string; name: string };
	dangDung: boolean;
};

export function BangLichSu({
	slug,
	dong,
}: {
	slug: string;
	dong: readonly DongLichSu[];
}) {
	const locale = useLocale();
	const m = taiLieuLichSuMessages(locale).lichSu;
	const url = useWorkspaceUrl();
	const router = useRouter();
	const xep = [...dong].sort((a, b) => b.so - a.so);

	if (xep.length === 0)
		return (
			<Empty border="solid" data-lich-su-rong="">
				<EmptyHeader>
					<EmptyTitle>{m.chuaCo}</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);

	const dangDung = (d: DongLichSu) =>
		d.dangDung ? (
			<StatusIndicator label={m.dangDung} tone={toneTheoNghia("xong")} />
		) : null;

	return (
		<div className="flex min-w-0 flex-col gap-4" data-lich-su={slug}>
			{xep.length === 1 ? (
				<p className="text-muted-foreground text-sm" data-mot-ban="">
					{m.motBan}
				</p>
			) : null}
			<div className="hidden md:block" data-bang-lich-su="">
				<SimpleTable
					columns={[
						{ id: "so", header: m.cot.so },
						{ id: "duyet", header: m.cot.duyet },
						{ id: "de-xuat", header: m.cot.deXuat },
						{ id: "trang-thai", header: "", srLabel: m.cot.trangThai },
					]}
					surface="page"
				>
					{xep.map((d) => (
						<SimpleTableRow
							clickable
							data-phien-ban={d.so}
							key={d.so}
							onClick={() => router.push(url(duongPhienBan(slug, d.so)))}
						>
							<SimpleTableCell>
								<Link
									className="font-medium"
									href={url(duongPhienBan(slug, d.so))}
									onClick={(e) => e.stopPropagation()}
								>
									{dien(m.phienBan, { so: d.so })}
								</Link>
							</SimpleTableCell>
							<SimpleTableCell>
								<span translate="no">
									{dien(m.dongDuyet, {
										ngay: ngayTaiLieu(d.duyetLuc, locale),
										ten: d.nguoiDuyet.name,
									})}
								</span>
							</SimpleTableCell>
							<SimpleTableCell>
								<span translate="no">{d.nguoiDeXuat.name}</span>
							</SimpleTableCell>
							<SimpleTableCell>{dangDung(d)}</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<div className="md:hidden" data-the-lich-su="">
				<ItemGroup>
					{xep.map((d) => (
						<Item asChild key={d.so} variant="outline">
							<Link data-phien-ban={d.so} href={url(duongPhienBan(slug, d.so))}>
								<ItemContent>
									<ItemTitle>{dien(m.phienBan, { so: d.so })}</ItemTitle>
									<ItemDescription translate="no">
										{dien(m.dongNgan, {
											ngay: ngayTaiLieu(d.duyetLuc, locale),
											ten: d.nguoiDeXuat.name,
										})}
									</ItemDescription>
								</ItemContent>
								{d.dangDung ? <ItemActions>{dangDung(d)}</ItemActions> : null}
							</Link>
						</Item>
					))}
				</ItemGroup>
			</div>
		</div>
	);
}

function DangTaiLichSu() {
	return (
		<div aria-hidden className="flex flex-col gap-2" data-lich-su-dang-tai="">
			{DONG_CHO.map((k) => (
				<Skeleton className="h-12 w-full" key={k} />
			))}
		</div>
	);
}

export function ManLichSu({ slug, ten }: { slug: string; ten: string }) {
	const m = taiLieuLichSuMessages(useLocale()).lichSu;
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const lichSu = useQuery(trpc.taiLieu.lichSu.queryOptions({ slug }));

	return (
		<>
			<PageShellHeader
				breadcrumb={
					<div>
						<Button asChild size="sm" variant="ghost">
							<Link href={url(duongTrang(slug))}>
								<Icon icon={ArrowLeft} />
								{m.veTrang}
							</Link>
						</Button>
					</div>
				}
			>
				<PageShellHeading>
					<PageShellTitle translate="no">{ten}</PageShellTitle>
					<PageShellDescription>{m.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				{lichSu.isError && !lichSu.data ? (
					<VungTaiLoi
						dangTai={lichSu.isFetching}
						moTa={m.loi.moTa}
						onThuLai={() => lichSu.refetch()}
						tieuDe={m.loi.tieuDe}
					/>
				) : lichSu.data ? (
					<BangLichSu dong={lichSu.data} slug={slug} />
				) : (
					<DangTaiLichSu />
				)}
			</PageShellContent>
		</>
	);
}
