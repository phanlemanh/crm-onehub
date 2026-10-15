"use client";

import Archive from "@carbon/icons-react/es/Archive";
import Book from "@carbon/icons-react/es/Book";
import { Alert, AlertAction, AlertDescription } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
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
import { Toggle } from "@crm/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { LOAI_TRANG, type LoaiTrang, TAI_LIEU } from "@crm/validation/tai-lieu";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type TaiLieuMessages, taiLieuMessages } from "@/lib/messages/tai-lieu";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import { duongTrang, duongTrangMoi, ngayTaiLieu } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DangTaiDanhSach } from "./dang-tai";
import { BO_LOC_TRONG, type ToiLoc } from "./danh-sach-loc";
import { LoiTai } from "./loi-tai";

const TAT_CA = "tat-ca";

function laLoai(v: string): v is LoaiTrang {
	return LOAI_TRANG.some((l) => l === v);
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

function BoLoc({
	donVi,
	chu,
	toi,
}: {
	donVi: string | null;
	chu: string | null;
	toi: ToiLoc;
}) {
	const m = taiLieuMessages(useLocale()).loc;
	const trpc = useTRPC();
	const router = useRouter();
	const bo = useQuery(trpc.taiLieu.boLoc.queryOptions());

	if (bo.isError && !bo.data) {
		return (
			<Alert data-bo-loc-loi="">
				<AlertDescription>{m.loiBoLoc}</AlertDescription>
				<AlertAction>
					<Button onClick={() => bo.refetch()} size="sm" variant="outline">
						{m.thuLai}
					</Button>
				</AlertAction>
			</Alert>
		);
	}

	const chon = (
		mua: { id: string; ten: string; so: number }[],
		tatCa: string,
	) => [
		{ value: TAT_CA, label: tatCa },
		...mua.map((x) => ({ value: x.id, label: x.ten, hint: String(x.so) })),
	];

	return (
		<>
			<Combobox
				aria-label={m.donVi}
				data-loc-don-vi=""
				empty={m.khongCo}
				onValueChange={(v) =>
					router.push(toi({ donVi: v === TAT_CA ? null : v, page: 1 }))
				}
				options={chon(bo.data?.donVi ?? [], m.tatCaDonVi)}
				placeholder={m.tatCaDonVi}
				searchPlaceholder={m.timDonVi}
				size="sm"
				translate="no"
				value={donVi ?? TAT_CA}
			/>
			<Combobox
				aria-label={m.chu}
				data-loc-chu=""
				empty={m.khongCo}
				onValueChange={(v) =>
					router.push(toi({ chu: v === TAT_CA ? null : v, page: 1 }))
				}
				options={chon(bo.data?.chuTrang ?? [], m.tatCaChu)}
				placeholder={m.tatCaChu}
				searchPlaceholder={m.timChu}
				size="sm"
				translate="no"
				value={chu ?? TAT_CA}
			/>
		</>
	);
}

export function DanhSachTrang({
	loai,
	donVi,
	chu,
	page,
	archived = false,
	toi,
}: {
	loai: LoaiTrang | null;
	donVi: string | null;
	chu: string | null;
	page: number;
	archived?: boolean;
	toi: ToiLoc;
}) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const lt = taiLieuLichSuMessages(locale).luuTru.danhSach;
	const trpc = useTRPC();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const ds = useQuery(
		trpc.taiLieu.list.queryOptions({
			loai: loai ?? undefined,
			donViId: donVi ?? undefined,
			chuTrangId: chu ?? undefined,
			page,
			archived,
		}),
	);

	if (ds.isError && !ds.data)
		return <LoiTai m={m} thuLai={() => ds.refetch()} />;
	if (!ds.data) return <DangTaiDanhSach />;

	const { rows, total, facetCounts } = ds.data;
	const tatCa = LOAI_TRANG.reduce((n, l) => n + facetCounts[l], 0);
	const coLoc = loai !== null || donVi !== null || chu !== null;

	const khongCoGi = tatCa === 0 && (ds.data.soDaLuuTru ?? 0) === 0;
	if (khongCoGi && donVi === null && chu === null && !archived)
		return <KhoRong m={m} url={url(duongTrangMoi())} />;
	const ngayCot = (t: { capNhat: string; luuTruLuc: string | null }) =>
		ngayTaiLieu(archived ? (t.luuTruLuc ?? t.capNhat) : t.capNhat, locale);

	const soTrang = Math.max(1, Math.ceil(total / TAI_LIEU.danhSach.coTrang));

	return (
		<div className="flex min-w-0 flex-col gap-4" data-danh-sach-trang="">
			<div className="flex flex-wrap items-center gap-2" data-bo-loc="">
				<div className="max-w-full overflow-x-auto">
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
						<ToggleGroupItem count={tatCa} value={TAT_CA}>
							{m.loc.tatCa}
						</ToggleGroupItem>
						{LOAI_TRANG.map((l) => (
							<ToggleGroupItem
								count={facetCounts[l]}
								data-loai={l}
								key={l}
								value={l}
							>
								{m.loai[l]}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</div>
				<BoLoc chu={chu} donVi={donVi} toi={toi} />
				<Toggle
					data-nut-da-luu-tru=""
					onPressedChange={(bat) =>
						router.push(toi({ archived: bat, loai: null, page: 1 }))
					}
					pressed={archived}
					size="sm"
					variant="outline"
				>
					<Icon icon={Archive} />
					{lt.nut}
				</Toggle>
				{coLoc ? (
					<Button asChild size="sm" variant="ghost">
						<Link data-bo-loc-xoa="" href={toi({ ...BO_LOC_TRONG, archived })}>
							{m.loc.boLoc}
						</Link>
					</Button>
				) : null}
			</div>
			{rows.length === 0 && archived && !coLoc ? (
				<Empty data-da-luu-tru-rong="">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Icon icon={Archive} />
						</EmptyMedia>
						<EmptyTitle>{lt.rong.tieuDe}</EmptyTitle>
						<EmptyDescription>{lt.rong.than}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : rows.length === 0 ? (
				<Empty data-loc-rong="">
					<EmptyHeader>
						<EmptyTitle>{m.rongLoc.tieuDe}</EmptyTitle>
						<EmptyDescription>{m.rongLoc.than}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button asChild variant="outline">
							<Link href={toi({ ...BO_LOC_TRONG, archived })}>
								{m.rongLoc.nut}
							</Link>
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
								{
									id: "cap-nhat",
									header: archived ? lt.cot : m.cot.capNhat,
									align: "right",
								},
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
										{ngayCot(t)}
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
												{ngayCot(t)}
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
