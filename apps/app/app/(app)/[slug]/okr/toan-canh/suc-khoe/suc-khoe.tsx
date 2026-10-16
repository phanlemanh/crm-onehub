"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatCard } from "@crm/ui/components/stat-card";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { cn } from "@crm/ui/lib/utils";
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useChuKy } from "../../chon-chu-ky";
import { khoaDon, okrParsers } from "../../okr-search-params";
import { ChuaChuKy, DangTai } from "../../trang-thai-okr";
import { LoiXem } from "../toan-canh";
import { KhoiMoCoi } from "./okr-mo-coi";
import { TomTatQuanTri } from "./tom-tat-quan-tri";

type HangSucKhoe = RouterOutputs["okr"]["sucKhoe"]["hang"][number];

function So({ n }: { n: number }) {
	return (
		<span className={cn("tabular-nums", n === 0 && "text-muted-foreground")}>
			{n}
		</span>
	);
}

function DongSucKhoe({ h }: { h: HangSucKhoe }) {
	const mt = okrToanCanhMessages(useLocale());
	const phong = h.cap === "phong-ban";
	return (
		<SimpleTableRow data-hang-suc-khoe={h.key}>
			<TableCell className="px-3 py-2.5 whitespace-normal">
				<span
					className={cn(
						"block",
						phong ? "ps-4 text-muted-foreground" : "font-medium",
					)}
					translate="no"
				>
					{h.ten}
				</span>
				{h.cap === "goc" ? null : (
					<span className={cn("block text-xs", phong && "ps-4")}>
						{h.truong ? (
							<span translate="no">{h.truong.name}</span>
						) : (
							<StatusIndicator
								label={mt.sucKhoe.chuaCoTruong}
								size="sm"
								tone="warning"
							/>
						)}
					</span>
				)}
			</TableCell>
			<TableCell className="px-3 py-2.5 text-right">
				<So n={h.tongKr} />
			</TableCell>
			<TableCell className="hidden px-3 py-2.5 text-right md:table-cell">
				<So n={h.dungTuan} />
			</TableCell>
			<TableCell className="hidden px-3 py-2.5 text-right md:table-cell">
				<So n={h.krIm} />
			</TableCell>
			<TableCell className="px-3 py-2.5 text-right">
				<So n={h.chuaKhoiDiem} />
			</TableCell>
			<TableCell className="px-3 py-2.5 text-right">
				<So n={h.chuaNoiKenh} />
			</TableCell>
		</SimpleTableRow>
	);
}

export function SucKhoe() {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const [thamSo] = useQueryStates(okrParsers);
	const ky = thamSo[SEARCH_PARAM.okr.ky];
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	const quanTri = access.data?.canManageProgram === true;
	const sk = useQuery(
		trpc.okr.sucKhoe.queryOptions(
			currentId === null || !quanTri ? skipToken : { cycleId: currentId },
		),
	);
	const don = thamSo[SEARCH_PARAM.okr.don];
	const giu = new URLSearchParams();
	if (ky) giu.set(SEARCH_PARAM.okr.ky, ky);
	if (don) giu.set(SEARCH_PARAM.okr.don, khoaDon(don));
	const veToanCanh = `${url("/okr/toan-canh")}${giu.size > 0 ? `?${giu}` : ""}`;

	const dau = (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={veToanCanh}>{m.tab["toan-canh"]}</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{mt.toanCanh.suKhoe}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);

	let than: ReactNode;
	if (access.isError || cycles.isError)
		than = (
			<LoiXem
				cau={mt.sucKhoe.loi}
				thuLai={() => {
					if (access.isError) void access.refetch();
					if (cycles.isError) void cycles.refetch();
				}}
				trangThai="ST-suckhoe-loi"
			/>
		);
	else if (access.isPending || cycles.isPending) than = <DangTai />;
	else if (!quanTri)
		than = (
			<Empty data-trang-thai="ST-suckhoe-khongquyen">
				<EmptyHeader>
					<EmptyTitle>{mt.sucKhoe.khongQuyen}</EmptyTitle>
					<EmptyDescription>{mt.sucKhoe.khongQuyenMoTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	else if (currentId === null) than = <ChuaChuKy quanTri={quanTri} />;
	else if (sk.isPending) than = <DangTai />;
	else if (sk.isError)
		than = (
			<LoiXem
				cau={mt.sucKhoe.loi}
				thuLai={() => void sk.refetch()}
				trangThai="ST-suckhoe-loi"
			/>
		);
	else {
		const cot: SimpleTableColumn[] = [
			{ id: "don-vi", header: mt.toanCanh.cotDonVi },
			{ id: "kr", header: mt.sucKhoe.krDangTinh, align: "right" },
			{
				id: "dung-tuan",
				header: mt.sucKhoe.dungTuan,
				align: "right",
				className: "hidden md:table-cell",
			},
			{
				id: "kr-im",
				header: mt.sucKhoe.krIm,
				align: "right",
				className: "hidden md:table-cell",
			},
			{ id: "chua-cong-bo", header: mt.sucKhoe.chuaCongBo, align: "right" },
			{ id: "chua-noi-kenh", header: mt.sucKhoe.chuaNoiKenh, align: "right" },
		];
		than = (
			<div
				className="flex flex-col gap-6"
				data-trang-thai="ST-suckhoe-codulieu"
			>
				<StatGroup>
					<StatCard
						description={mt.sucKhoe.dungTuanMoTa}
						label={mt.sucKhoe.dungTuan}
						value={`${sk.data.tongQuan.dungTuan}/${sk.data.tongQuan.tongKr}`}
					/>
					<StatCard
						description={mt.sucKhoe.krImMoTa}
						label={mt.sucKhoe.krIm}
						value={sk.data.tongQuan.krIm}
					/>
					<StatCard
						description={mt.sucKhoe.chuaCongBoMoTa}
						label={mt.sucKhoe.chuaCongBo}
						value={sk.data.tongQuan.chuaKhoiDiem}
					/>
					<StatCard
						description={mt.sucKhoe.chuaNoiKenhMoTa}
						label={mt.sucKhoe.chuaNoiKenh}
						value={sk.data.tongQuan.chuaNoiKenh}
					/>
				</StatGroup>
				<Card>
					<CardHeader>
						<CardTitle>{mt.toanCanh.theoDonVi}</CardTitle>
						<CardDescription>{mt.sucKhoe.moTa}</CardDescription>
					</CardHeader>
					<SimpleTable columns={cot} surface="page">
						{sk.data.hang.map((h) => (
							<DongSucKhoe h={h} key={h.key} />
						))}
					</SimpleTable>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			{dau}
			{than}
			{quanTri && currentId !== null ? (
				<TomTatQuanTri cycleId={currentId} key={currentId} />
			) : null}
			{quanTri ? <KhoiMoCoi /> : null}
		</div>
	);
}
