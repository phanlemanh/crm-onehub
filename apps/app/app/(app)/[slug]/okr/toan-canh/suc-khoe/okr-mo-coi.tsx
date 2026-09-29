"use client";

import CheckmarkOutline from "@carbon/icons-react/es/CheckmarkOutline";
import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
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
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { HopChuyenOkr } from "@/app/(app)/[slug]/settings/organization/hop-chuyen-okr";
import {
	chuyenOkrParsers,
	type NguonChuyenOkr,
} from "@/app/(app)/[slug]/settings/organization/to-chuc-search-params";
import { okrTaiCoCauMessages } from "@/lib/messages/okr-tai-co-cau";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type MucMoCoi = RouterOutputs["okr"]["moCoi"][number];

type HanhDongMoCoi =
	| { loai: "chuyen"; nguon: NguonChuyenOkr }
	| { loai: "dat-truong"; href: string }
	| { loai: "nguoi-roi"; href: string };

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

function donViCay(m: MucMoCoi): NguonChuyenOkr | null {
	const { level, id } = m.donVi;
	if (id === null) return null;
	if (level === "phong-ban" || level === "bo-phan") return { level, id };
	return null;
}

function hanhDongCua(
	m: MucMoCoi,
	url: (path: string) => string,
): HanhDongMoCoi[] {
	const dv = donViCay(m);
	const toChuc = (d: NguonChuyenOkr) =>
		`${url("/settings/organization")}?${new URLSearchParams({
			[SEARCH_PARAM.toChuc.don]:
				`${d.level === "phong-ban" ? "pb" : "bp"}:${d.id}`,
		})}`;
	const thanhVien = url("/settings/members");
	const ra: HanhDongMoCoi[] = [];
	const them = (h: HanhDongMoCoi) => {
		if (!ra.some((x) => x.loai === h.loai)) ra.push(h);
	};
	for (const ly of m.lyDo) {
		if (ly === "don-vi-luu-tru" && dv) them({ loai: "chuyen", nguon: dv });
		if (ly === "khong-ai-sua" && dv)
			them({ loai: "dat-truong", href: toChuc(dv) });
		if (ly === "khong-ai-sua" && m.donVi.level === "ca-nhan")
			them({ loai: "nguoi-roi", href: thanhVien });
		if (ly === "phu-trach-roi" || ly === "kr-phu-trach-roi")
			them({ loai: "nguoi-roi", href: thanhVien });
	}
	return ra;
}

function DongMoCoi({
	muc,
	moChuyen,
}: {
	muc: MucMoCoi;
	moChuyen: (n: NguonChuyenOkr) => void;
}) {
	const m = okrTaiCoCauMessages(useLocale()).moCoi;
	const url = useWorkspaceUrl();
	return (
		<Item size="sm" variant="outline" data-mo-coi={muc.objectiveId}>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{muc.tieuDe}</span>
				</ItemTitle>
				<ItemDescription>
					{m.cap[muc.donVi.level]} · <span translate="no">{muc.donVi.ten}</span>
				</ItemDescription>
				<span className="flex flex-wrap gap-1">
					{muc.lyDo.map((ly) => (
						<Badge key={ly} variant="outline" data-ly-do={ly}>
							{m.lyDo[ly]}
						</Badge>
					))}
				</span>
			</ItemContent>
			<ItemActions>
				{hanhDongCua(muc, url).map((h) =>
					h.loai === "chuyen" ? (
						<Button
							key={h.loai}
							variant="outline"
							size="sm"
							aria-haspopup="dialog"
							data-hanh-dong={h.loai}
							onClick={() => moChuyen(h.nguon)}
						>
							{m.hanhDong.chuyen}
						</Button>
					) : (
						<Button
							key={h.loai}
							variant="outline"
							size="sm"
							asChild
							data-hanh-dong={h.loai}
						>
							<Link href={h.href}>
								{h.loai === "dat-truong"
									? m.hanhDong.datTruong
									: m.hanhDong.nguoiRoi}
							</Link>
						</Button>
					),
				)}
			</ItemActions>
		</Item>
	);
}

function DangTaiMoCoi({ chu }: { chu: string }) {
	return (
		<ItemGroup aria-busy="true" className="gap-2">
			<span className="sr-only" role="status">
				{chu}
			</span>
			{KHUNG_TAI.map((id) => (
				<Item key={id} size="sm" variant="outline">
					<ItemContent>
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-1/2" />
						<Skeleton className="h-5 w-28" />
					</ItemContent>
					<ItemActions>
						<Skeleton className="h-8 w-24" />
					</ItemActions>
				</Item>
			))}
		</ItemGroup>
	);
}

export function KhoiMoCoi() {
	const m = okrTaiCoCauMessages(useLocale()).moCoi;
	const trpc = useTRPC();
	const moCoi = useQuery(trpc.okr.moCoi.queryOptions({}));
	const [{ chuyenOkr }, datUrl] = useQueryStates(chuyenOkrParsers);
	const moChuyen = (n: NguonChuyenOkr | null) =>
		void datUrl({ [SEARCH_PARAM.toChuc.chuyenOkr]: n });

	let than: ReactNode;
	let trangThai: string;
	if (moCoi.isPending) {
		trangThai = "ST-mocoi-dang-tai";
		than = <DangTaiMoCoi chu={m.dangTai} />;
	} else if (moCoi.isError) {
		trangThai = "ST-mocoi-loi";
		than = (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={WarningAlt} />
					</EmptyMedia>
					<EmptyTitle>{m.loi.tieuDe}</EmptyTitle>
					<EmptyDescription>{m.loi.moTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button
						variant="outline"
						size="sm"
						onClick={() => void moCoi.refetch()}
					>
						<Icon icon={Renew} data-icon="inline-start" />
						{m.loi.thuLai}
					</Button>
				</EmptyContent>
			</Empty>
		);
	} else if (moCoi.data.length === 0) {
		trangThai = "ST-mocoi-rong";
		than = (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={CheckmarkOutline} />
					</EmptyMedia>
					<EmptyTitle>{m.rong.tieuDe}</EmptyTitle>
					<EmptyDescription>{m.rong.moTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	} else {
		trangThai = "ST-mocoi-co";
		than = (
			<ItemGroup className="gap-2">
				{moCoi.data.map((muc) => (
					<DongMoCoi key={muc.objectiveId} muc={muc} moChuyen={moChuyen} />
				))}
			</ItemGroup>
		);
	}

	return (
		<Card data-khoi-mo-coi data-trang-thai={trangThai}>
			<CardHeader>
				<CardTitle>{m.tieuDe}</CardTitle>
				<CardDescription>{m.moTa}</CardDescription>
			</CardHeader>
			<CardContent>{than}</CardContent>
			{chuyenOkr ? (
				<HopChuyenOkr
					key={`${chuyenOkr.level}:${chuyenOkr.id}`}
					nguon={chuyenOkr}
					dong={() => moChuyen(null)}
				/>
			) : null}
		</Card>
	);
}
