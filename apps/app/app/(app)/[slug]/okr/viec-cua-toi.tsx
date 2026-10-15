"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Chat from "@carbon/icons-react/es/Chat";
import CheckmarkOutline from "@carbon/icons-react/es/CheckmarkOutline";
import Edit from "@carbon/icons-react/es/Edit";
import Idea from "@carbon/icons-react/es/Idea";
import Pending from "@carbon/icons-react/es/Pending";
import Renew from "@carbon/icons-react/es/Renew";
import Reply from "@carbon/icons-react/es/Reply";
import Time from "@carbon/icons-react/es/Time";
import Trophy from "@carbon/icons-react/es/Trophy";
import UserFollow from "@carbon/icons-react/es/UserFollow";
import View from "@carbon/icons-react/es/View";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import type { LoiVao } from "@crm/validation/okr-cap-nhat";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { okrGioiHanMessages } from "@/lib/messages/okr-gioi-han";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import type { ViecOkr } from "./kieu";

export type NoiHienViec = "tong-quan" | "cua-toi";

export type KhiHienViec = "luon" | "khi-lien-quan" | "khi-co-viec";

const LOI_VAO_THE: LoiVao = "viec-cua-toi";

const ICON_VIEC = {
	"okr-cap-nhat": Edit,
	"okr-kr-im": Time,
	"okr-duoc-giao": UserFollow,
	"okr-nhac-ten": Chat,
	"okr-ghi-nhan": Trophy,
	"okr-theo-doi": View,
	"okr-cho-duyet": Pending,
	"okr-tra-lai": Reply,
	"okr-hoi-y-gop": Idea,
	"okr-hoi-y-cong-bo": Bullhorn,
} satisfies Record<ViecOkr["loai"], typeof Edit>;

function khoaViec(v: ViecOkr): string {
	switch (v.loai) {
		case "okr-cap-nhat":
			return `${v.loai}:${v.krIds.join(",")}`;
		case "okr-kr-im":
			return `${v.loai}:${v.keyResultId}:${v.chuTen ?? ""}`;
		case "okr-duoc-giao":
			return `${v.loai}:${v.keyResultId ?? v.objectiveId}`;
		case "okr-nhac-ten":
			return `${v.loai}:${v.commentId}`;
		case "okr-ghi-nhan":
			return `${v.loai}:${v.ghiNhanId}`;
		case "okr-theo-doi":
		case "okr-cho-duyet":
		case "okr-tra-lai":
			return `${v.loai}:${v.objectiveId}`;
		case "okr-hoi-y-gop":
		case "okr-hoi-y-cong-bo":
			return `${v.loai}:${v.hoiYId}`;
	}
}

function ghep(mau: string, gia: Record<string, ReactNode>): ReactNode {
	return mau
		.split(/\{(\w+)\}/)
		.map((phan, i) =>
			i % 2 === 0 ? (
				phan
			) : (
				<Fragment key={phan}>{gia[phan] ?? `{${phan}}`}</Fragment>
			),
		);
}

function Ten({ children }: { children: string }) {
	return <span translate="no">{children}</span>;
}

function TieuDeViec({ viec }: { viec: ViecOkr }) {
	const locale = useLocale();
	const m = okrMessages(locale).viecCuaToi.cau;
	const g = okrGioiHanMessages(locale).viec;
	switch (viec.loai) {
		case "okr-cap-nhat":
			return ghep(m.capNhat, { n: viec.soKr });
		case "okr-kr-im":
			return viec.chuTen === null
				? ghep(m.krIm, { n: viec.soNgay })
				: ghep(m.krImCuaNguoi, {
						nguoi: <Ten>{viec.chuTen}</Ten>,
						n: viec.soNgay,
					});
		case "okr-duoc-giao":
			return viec.keyResultId ? m.giaoKr : m.giaoMucTieu;
		case "okr-nhac-ten":
			return ghep(m.nhacTen, { nguoi: <Ten>{viec.nguoiTen}</Ten> });
		case "okr-ghi-nhan":
			return ghep(m.ghiNhan, { nguoi: <Ten>{viec.nguoiGui}</Ten> });
		case "okr-theo-doi":
			return ghep(
				viec.capNhat === 0
					? m.theoDoiBinhLuan
					: viec.binhLuan === 0
						? m.theoDoiCapNhat
						: m.theoDoi,
				{ capNhat: viec.capNhat, binhLuan: viec.binhLuan },
			);
		case "okr-hoi-y-gop":
			return m.hoiYGop;
		case "okr-hoi-y-cong-bo":
			return m.hoiYCongBo;
		case "okr-cho-duyet":
			return ghep(g.choDuyet, { ten: <Ten>{viec.nhan}</Ten> });
		case "okr-tra-lai":
			return ghep(g.traLai, {
				nguoi: <Ten>{viec.nguoiTraLai}</Ten>,
				ten: <Ten>{viec.nhan}</Ten>,
			});
	}
}

function MoTaViec({ viec }: { viec: ViecOkr }) {
	const g = okrGioiHanMessages(useLocale()).viec;
	switch (viec.loai) {
		case "okr-cho-duyet":
			return viec.nguoiGui === null ? null : (
				<ItemDescription>
					{ghep(g.nguoiGui, { nguoi: <Ten>{viec.nguoiGui}</Ten> })}
				</ItemDescription>
			);
		case "okr-tra-lai":
			return <ItemDescription translate="no">{viec.lyDo}</ItemDescription>;
		default:
			return <ItemDescription translate="no">{viec.nhan}</ItemDescription>;
	}
}

function DichViec({ viec }: { viec: ViecOkr }) {
	const m = okrMessages(useLocale()).viecCuaToi;
	const url = useWorkspaceUrl();
	const openRecord = useOpenRecord();
	if (viec.loai === "okr-cap-nhat") {
		const thamSo = new URLSearchParams({ [SEARCH_PARAM.okr.tu]: LOI_VAO_THE });
		return (
			<Button asChild size="sm">
				<Link href={`${url("/okr")}?${thamSo}`}>
					{m.capNhatTuan}
					<Icon icon={ArrowRight} data-icon="inline-end" />
				</Link>
			</Button>
		);
	}
	if (viec.loai === "okr-hoi-y-gop" || viec.loai === "okr-hoi-y-cong-bo") {
		const thamSo = new URLSearchParams({ [SEARCH_PARAM.okr.ky]: viec.cycleId });
		return (
			<Button asChild size="sm" variant="outline">
				<Link href={`${url("/okr/hoi-y")}?${thamSo}`}>{m.moHoiY}</Link>
			</Button>
		);
	}
	return (
		<Button
			size="sm"
			variant="outline"
			data-mo-muc-tieu={viec.objectiveId}
			onClick={() => openRecord({ kind: "objective", id: viec.objectiveId })}
		>
			{m.moMucTieu}
		</Button>
	);
}

function DongViec({ viec }: { viec: ViecOkr }) {
	return (
		<Item data-viec-okr={viec.loai} role="listitem" size="sm">
			<ItemMedia variant="icon">
				<Icon icon={ICON_VIEC[viec.loai]} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span>
						<TieuDeViec viec={viec} />
					</span>
				</ItemTitle>
				<MoTaViec viec={viec} />
			</ItemContent>
			<ItemActions>
				<DichViec viec={viec} />
			</ItemActions>
		</Item>
	);
}

function KhungThe({
	noi,
	trangThai,
	children,
}: {
	noi: NoiHienViec;
	trangThai: string;
	children: ReactNode;
}) {
	const m = okrMessages(useLocale()).viecCuaToi;
	return (
		<Card
			data-khoi="viec-okr"
			data-the-viec-okr={noi}
			data-trang-thai={trangThai}
		>
			<CardHeader>
				<CardTitle>{m.tieuDe[noi]}</CardTitle>
				<CardDescription>{m.moTa}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

export function ViecOkrCuaToi({
	noi,
	khiHien,
	anKhiLoi,
}: {
	noi: NoiHienViec;
	khiHien: KhiHienViec;
	anKhiLoi: boolean;
}) {
	const m = okrMessages(useLocale()).viecCuaToi;
	const trpc = useTRPC();
	const viecQuery = useQuery(trpc.okr.viecCuaToi.queryOptions());

	if (viecQuery.isError) {
		if (anKhiLoi) return null;
		return (
			<KhungThe noi={noi} trangThai="ST-viecokr-loi">
				<Item role="status" size="sm">
					<ItemMedia variant="icon">
						<Icon icon={WarningAlt} />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{m.loi.title}</ItemTitle>
						<ItemDescription>{m.loi.body}</ItemDescription>
					</ItemContent>
					<ItemActions>
						<Button
							size="sm"
							variant="outline"
							onClick={() => void viecQuery.refetch()}
						>
							<Icon icon={Renew} data-icon="inline-start" />
							{m.loi.action}
						</Button>
					</ItemActions>
				</Item>
			</KhungThe>
		);
	}

	const duLieu = viecQuery.data;
	if (!duLieu) {
		if (khiHien !== "luon") return null;
		return (
			<KhungThe noi={noi} trangThai="ST-viecokr-dangtai">
				<div aria-busy="true" className="flex flex-col gap-2">
					<span className="sr-only" role="status">
						{m.dangTai}
					</span>
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-3 w-1/2" />
				</div>
			</KhungThe>
		);
	}

	const { viec, lienQuanOkr } = duLieu;
	const hien =
		khiHien === "luon" ||
		(khiHien === "khi-lien-quan" ? lienQuanOkr : viec.length > 0);
	if (!hien) return null;

	if (viec.length === 0) {
		return (
			<KhungThe noi={noi} trangThai="ST-viecokr-rong">
				<Item data-viec-okr-rong="" size="sm">
					<ItemMedia variant="icon">
						<Icon icon={CheckmarkOutline} />
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{m.rong}</ItemTitle>
					</ItemContent>
				</Item>
			</KhungThe>
		);
	}

	return (
		<KhungThe noi={noi} trangThai="ST-viecokr-coviec">
			<ItemGroup aria-label={m.danhSach}>
				{viec.map((v, i) => (
					<Fragment key={khoaViec(v)}>
						{i > 0 ? <ItemSeparator /> : null}
						<DongViec viec={v} />
					</Fragment>
				))}
			</ItemGroup>
		</KhungThe>
	);
}
