"use client";

import { Badge } from "@crm/ui/components/badge";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageShellContent } from "@/components/page-shell";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongDanhSach } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { BangNguon } from "./bang-nguon";
import { ChoDuyet } from "./cho-duyet";
import { BO_LOC_TRONG, type Loc, thamSo } from "./danh-sach-loc";
import { DanhSachTrang } from "./danh-sach-trang";
import { HoiKho } from "./hoi";
import { SucKhoe } from "./suc-khoe";

export function DanhSach({
	tab,
	loai,
	donVi = null,
	chu = null,
	nhom = "cho",
	page,
	archived = false,
	coHoi = false,
}: Pick<Loc, "tab" | "loai" | "page"> &
	Partial<Pick<Loc, "donVi" | "chu" | "nhom" | "archived">> & {
		coHoi?: boolean;
	}) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const cho = useQuery(trpc.taiLieu.proposals.queryOptions());
	const soCho = cho.data?.choToiDuyet ?? 0;
	const toi = (sua: Partial<Loc>) =>
		`${url(duongDanhSach())}${thamSo({ tab, loai, donVi, chu, nhom, page, archived, ...sua })}`;

	return (
		<>
			<Tabs value={tab}>
				<TabsList aria-label={m.tab.nhan} variant="line">
					<TabsTrigger asChild value="trang">
						<Link
							aria-current={tab === "trang" ? "page" : undefined}
							href={toi({ tab: "trang", nhom: "cho", page: 1, archived: false })}
						>
							{m.tab.trang}
						</Link>
					</TabsTrigger>
					<TabsTrigger asChild value="cho-duyet">
						<Link
							aria-current={tab === "cho-duyet" ? "page" : undefined}
							data-tab-cho-duyet=""
							href={toi({ ...BO_LOC_TRONG, tab: "cho-duyet" })}
						>
							{m.tab.choDuyet}
							{soCho > 0 ? (
								<Badge data-so-cho-duyet={soCho} variant="secondary">
									{soCho}
								</Badge>
							) : null}
						</Link>
					</TabsTrigger>
					<TabsTrigger asChild value="nguon">
						<Link
							aria-current={tab === "nguon" ? "page" : undefined}
							data-tab-nguon=""
							href={toi({ ...BO_LOC_TRONG, tab: "nguon" })}
						>
							{m.tab.nguon}
						</Link>
					</TabsTrigger>
					<TabsTrigger asChild value="suc-khoe">
						<Link
							aria-current={tab === "suc-khoe" ? "page" : undefined}
							data-tab-suc-khoe=""
							href={toi({ ...BO_LOC_TRONG, tab: "suc-khoe" })}
						>
							{m.tab.sucKhoe}
						</Link>
					</TabsTrigger>
					{coHoi ? (
						<TabsTrigger asChild value="hoi">
							<Link
								aria-current={tab === "hoi" ? "page" : undefined}
								data-tab-hoi=""
								href={toi({ ...BO_LOC_TRONG, tab: "hoi" })}
							>
								{m.tab.hoi}
							</Link>
						</TabsTrigger>
					) : null}
				</TabsList>
			</Tabs>
			<PageShellContent>
				{tab === "cho-duyet" ? (
					<ChoDuyet nhom={nhom} page={page} toi={toi} />
				) : tab === "suc-khoe" ? (
					<SucKhoe />
				) : tab === "nguon" ? (
					<BangNguon />
				) : tab === "hoi" && coHoi ? (
					<HoiKho />
				) : (
					<DanhSachTrang
						archived={archived}
						chu={chu}
						donVi={donVi}
						loai={loai}
						page={page}
						toi={toi}
					/>
				)}
			</PageShellContent>
		</>
	);
}
