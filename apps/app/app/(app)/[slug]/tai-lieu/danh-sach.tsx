"use client";

import Add from "@carbon/icons-react/es/Add";
import Book from "@carbon/icons-react/es/Book";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
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
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { Locale } from "@crm/ui/lib/locale";
import { LOAI_TRANG, type LoaiTrang, TAI_LIEU } from "@crm/validation/tai-lieu";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { type TaiLieuMessages, taiLieuMessages } from "@/lib/messages/tai-lieu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import {
	duongDanhSach,
	duongDeXuat,
	duongTrang,
	duongTrangMoi,
	ngayTaiLieu,
	type TabTaiLieu,
} from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DangTaiDanhSach } from "./dang-tai";

const TAT_CA = "tat-ca";

type Loc = { tab: TabTaiLieu; loai: LoaiTrang | null; page: number };

function thamSo(loc: Loc): string {
	const q = new URLSearchParams();
	if (loc.tab !== "trang") q.set(SEARCH_PARAM.taiLieu.tab, loc.tab);
	if (loc.loai) q.set(SEARCH_PARAM.taiLieu.loai, loc.loai);
	if (loc.page > 1) q.set(SEARCH_PARAM.list.page, String(loc.page));
	const s = q.toString();
	return s ? `?${s}` : "";
}

function laLoai(v: string): v is LoaiTrang {
	return LOAI_TRANG.some((l) => l === v);
}

export function DanhSach({ tab, loai, page }: Loc) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const cho = useQuery(trpc.taiLieu.proposals.queryOptions());
	const soCho = cho.data?.choToiDuyet ?? 0;
	const toi = (sua: Partial<Loc>) =>
		`${url(duongDanhSach())}${thamSo({ tab, loai, page, ...sua })}`;

	return (
		<>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Button asChild>
						<Link href={url(duongTrangMoi())}>
							<Icon icon={Add} />
							{m.trangMoi}
						</Link>
					</Button>
				</PageShellActions>
			</PageShellHeader>
			<Tabs value={tab}>
				<TabsList aria-label={m.tab.nhan} variant="line">
					<TabsTrigger asChild value="trang">
						<Link
							aria-current={tab === "trang" ? "page" : undefined}
							href={toi({ tab: "trang", page: 1 })}
						>
							{m.tab.trang}
						</Link>
					</TabsTrigger>
					<TabsTrigger asChild value="cho-duyet">
						<Link
							aria-current={tab === "cho-duyet" ? "page" : undefined}
							data-tab-cho-duyet=""
							href={toi({ tab: "cho-duyet", loai: null, page: 1 })}
						>
							{m.tab.choDuyet}
							{soCho > 0 ? (
								<Badge data-so-cho-duyet={soCho} variant="secondary">
									{soCho}
								</Badge>
							) : null}
						</Link>
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<PageShellContent>
				{tab === "cho-duyet" ? (
					<ChoDuyet />
				) : (
					<DanhSachTrang loai={loai} page={page} toi={toi} />
				)}
			</PageShellContent>
		</>
	);
}

function DanhSachTrang({
	loai,
	page,
	toi,
}: {
	loai: LoaiTrang | null;
	page: number;
	toi: (sua: Partial<Loc>) => string;
}) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const trpc = useTRPC();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const ds = useQuery(
		trpc.taiLieu.list.queryOptions({ loai: loai ?? undefined, page }),
	);

	if (ds.isError && !ds.data)
		return <LoiTai m={m} thuLai={() => ds.refetch()} />;
	if (!ds.data) return <DangTaiDanhSach />;

	const { rows, total, facetCounts } = ds.data;
	const tatCa = LOAI_TRANG.reduce((n, l) => n + facetCounts[l], 0);

	if (tatCa === 0) return <KhoRong m={m} url={url(duongTrangMoi())} />;

	const soTrang = Math.max(1, Math.ceil(total / TAI_LIEU.danhSach.coTrang));

	return (
		<div className="flex min-w-0 flex-col gap-4" data-danh-sach-trang="">
			<div className="overflow-x-auto">
				<ToggleGroup
					aria-label={m.loc.nhan}
					onValueChange={(v) => {
						if (v === "") return;
						router.push(toi({ loai: laLoai(v) ? v : null, page: 1 }));
					}}
					size="sm"
					type="single"
					value={loai ?? TAT_CA}
					variant="outline"
				>
					<ToggleGroupItem value={TAT_CA}>
						{m.loc.tatCa}
						<span className="text-muted-foreground tabular-nums">{tatCa}</span>
					</ToggleGroupItem>
					{LOAI_TRANG.map((l) => (
						<ToggleGroupItem data-loai={l} key={l} value={l}>
							{m.loai[l]}
							<span className="text-muted-foreground tabular-nums">
								{facetCounts[l]}
							</span>
						</ToggleGroupItem>
					))}
				</ToggleGroup>
			</div>
			{rows.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{m.rongLoc.tieuDe}</EmptyTitle>
						<EmptyDescription>{m.rongLoc.than}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button asChild variant="outline">
							<Link href={toi({ loai: null, page: 1 })}>{m.rongLoc.nut}</Link>
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<>
					<div className="hidden md:block" data-bang-trang="">
						<SimpleTable
							columns={[
								{ id: "ten", header: m.cot.trang },
								{ id: "loai", header: m.cot.loai },
								{ id: "chu", header: m.cot.chuTrang },
								{ id: "don-vi", header: m.cot.donVi },
								{ id: "cap-nhat", header: m.cot.capNhat, align: "right" },
							]}
							surface="page"
						>
							{rows.map((t) => (
								<SimpleTableRow
									clickable
									data-trang={t.slug}
									key={t.slug}
									onClick={() => router.push(url(duongTrang(t.slug)))}
								>
									<TableCell>
										<span className="flex flex-wrap items-center gap-2">
											<Link
												className="font-medium"
												href={url(duongTrang(t.slug))}
												onClick={(e) => e.stopPropagation()}
												translate="no"
											>
												{t.ten}
											</Link>
											{t.coBanCho ? (
												<Badge variant="outline">{m.coBanCho}</Badge>
											) : null}
										</span>
									</TableCell>
									<TableCell>{m.loai[t.loai]}</TableCell>
									<TableCell translate="no">{t.chuTrang.name}</TableCell>
									<TableCell translate="no">
										{t.donVi?.name ?? <EmptyCellValue />}
									</TableCell>
									<TableCell className="text-right text-muted-foreground tabular-nums">
										{ngayTaiLieu(t.capNhat, locale)}
									</TableCell>
								</SimpleTableRow>
							))}
						</SimpleTable>
					</div>
					<div className="md:hidden" data-the-trang="">
						<ItemGroup>
							{rows.map((t) => (
								<Item asChild key={t.slug} variant="outline">
									<Link data-trang={t.slug} href={url(duongTrang(t.slug))}>
										<ItemContent>
											<ItemTitle translate="no">{t.ten}</ItemTitle>
											<ItemDescription>
												{m.loai[t.loai]} ·{" "}
												<span translate="no">{t.chuTrang.name}</span> ·{" "}
												{ngayTaiLieu(t.capNhat, locale)}
											</ItemDescription>
										</ItemContent>
										{t.coBanCho ? (
											<ItemActions>
												<Badge variant="outline">{m.coBanCho}</Badge>
											</ItemActions>
										) : null}
									</Link>
								</Item>
							))}
						</ItemGroup>
					</div>
					{soTrang > 1 ? (
						<nav
							aria-label={m.phanTrang.nhan}
							className="flex items-center justify-end gap-2"
						>
							<span className="text-muted-foreground text-xs tabular-nums">
								{page}/{soTrang}
							</span>
							<Button
								disabled={page <= 1}
								onClick={() => router.push(toi({ page: page - 1 }))}
								size="sm"
								variant="outline"
							>
								{m.phanTrang.truoc}
							</Button>
							<Button
								disabled={page >= soTrang}
								onClick={() => router.push(toi({ page: page + 1 }))}
								size="sm"
								variant="outline"
							>
								{m.phanTrang.sau}
							</Button>
						</nav>
					) : null}
				</>
			)}
		</div>
	);
}

function LoiTai({ m, thuLai }: { m: TaiLieuMessages; thuLai: () => void }) {
	return (
		<Empty data-loi-tai="">
			<EmptyHeader>
				<EmptyTitle>{m.loiTai.tieuDe}</EmptyTitle>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={thuLai} variant="outline">
					{m.loiTai.thuLai}
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function KhoRong({ m, url }: { m: TaiLieuMessages; url: string }) {
	return (
		<Empty data-kho-rong="">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={Book} />
				</EmptyMedia>
				<EmptyTitle>{m.rong.tieuDe}</EmptyTitle>
				<EmptyDescription>{m.rong.than}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button asChild>
					<Link href={url}>{m.rong.nut}</Link>
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function nhanTrangThai(
	m: TaiLieuMessages,
	r: { trangThai: keyof TaiLieuMessages["choDuyet"]["trangThai"]; cu: boolean },
): string | null {
	if (r.cu) return m.choDuyet.trangThai.CU;
	if (r.trangThai === "CHO_DUYET") return null;
	return m.choDuyet.trangThai[r.trangThai];
}

function ChoDuyet() {
	const locale: Locale = useLocale();
	const m = taiLieuMessages(locale);
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const cho = useQuery(trpc.taiLieu.proposals.queryOptions());

	if (cho.isError && !cho.data)
		return <LoiTai m={m} thuLai={() => cho.refetch()} />;
	if (!cho.data) return <DangTaiDanhSach />;

	if (cho.data.rows.length === 0)
		return (
			<Empty data-cho-duyet-rong="">
				<EmptyHeader>
					<EmptyTitle>{m.choDuyet.rong}</EmptyTitle>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild variant="outline">
						<Link href={url(duongDanhSach())}>{m.choDuyet.veDanhSach}</Link>
					</Button>
				</EmptyContent>
			</Empty>
		);

	return (
		<ItemGroup data-hang-cho-duyet="">
			{cho.data.rows.map((r) => {
				const nhan = nhanTrangThai(m, r);
				return (
					<Item asChild key={r.id} variant="outline">
						<Link data-de-xuat={r.id} href={url(duongDeXuat(r.id))}>
							<ItemContent>
								<ItemTitle translate="no">{r.ten}</ItemTitle>
								<ItemDescription>
									<span translate="no">{r.taoBoi.name}</span> ·{" "}
									{ngayTaiLieu(r.luc, locale)}
								</ItemDescription>
							</ItemContent>
							{nhan ? (
								<ItemActions>
									<Badge variant="outline">{nhan}</Badge>
								</ItemActions>
							) : null}
						</Link>
					</Item>
				);
			})}
		</ItemGroup>
	);
}
