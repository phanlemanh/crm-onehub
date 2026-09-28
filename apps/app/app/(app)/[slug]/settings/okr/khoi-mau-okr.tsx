"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Template from "@carbon/icons-react/es/Template";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
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
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { LuuMauInput } from "@crm/validation/okr-mau";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import type { MauChon } from "@/lib/okr-mau";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { MAU_MOI, parseMau, THAM_SO_MAU } from "./okr-settings-search-params";
import { type DonViTheoNhom, SheetMauOkr } from "./sheet-mau-okr";
import { DangTaiThe, LoiThe, LY_DO_KHONG_QUYEN } from "./trang-thai-cai-dat";

type CayDonVi = {
	divisions: {
		id: string;
		name: string;
		departments: { id: string; name: string }[];
	}[];
	chuaXep: { id: string; name: string }[];
};

function donViTheoNhom(cay: CayDonVi | undefined): DonViTheoNhom {
	const boPhan = (cay?.divisions ?? []).map((b) => ({
		id: b.id,
		label: b.name,
	}));
	const phongBan = [
		...(cay?.divisions ?? []).flatMap((b) =>
			b.departments.map((d) => ({ id: d.id, label: d.name, hint: b.name })),
		),
		...(cay?.chuaXep ?? []).map((d) => ({ id: d.id, label: d.name })),
	];
	return { "bo-phan": boPhan, "phong-ban": phongBan };
}

function DongMau({
	mau,
	lyDo,
	khoa,
	onSua,
	onLuuTru,
	onKhoiPhuc,
}: {
	mau: MauChon;
	lyDo: string | undefined;
	khoa: boolean;
	onSua: () => void;
	onLuuTru: () => void;
	onKhoiPhuc: () => void;
}) {
	const locale = useLocale();
	const t = okrCanhKrMessages(locale).mau.dong;
	const h = okrMessages(locale).hopThoai;
	const apCho =
		mau.donViIds.length === 0
			? t.moiDonVi[mau.cap]
			: dien(t.soDonVi, { n: mau.donViIds.length });
	const dung = mau.daDung > 0 ? dien(t.daDung, { n: mau.daDung }) : t.chuaDung;
	return (
		<Item
			size="sm"
			variant="outline"
			role="listitem"
			data-mau={mau.id}
			data-luu-tru={mau.luuTru || undefined}
		>
			<ItemMedia variant="icon">
				<Icon icon={Template} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{mau.ten}</span>
					{mau.luuTru ? <Badge variant="outline">{t.luuTru}</Badge> : null}
				</ItemTitle>
				<ItemDescription>
					{[
						h.capMucTieu[mau.cap],
						apCho,
						dien(t.soKr, { n: mau.soKr }),
						dung,
					].join(" · ")}
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							aria-label={dien(t.thaoTac, { ten: mau.ten })}
							aria-describedby={lyDo}
							disabled={khoa}
							size="icon-sm"
							variant="ghost"
							data-nut="thao-tac-mau"
						>
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem data-muc="sua-mau" onSelect={onSua}>
							{t.sua}
						</DropdownMenuItem>
						{mau.luuTru ? (
							<DropdownMenuItem data-muc="khoi-phuc-mau" onSelect={onKhoiPhuc}>
								{t.khoiPhuc}
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								data-muc="luu-tru-mau"
								variant="destructive"
								onSelect={onLuuTru}
							>
								{t.luuTruNut}
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	);
}

export function KhoiMauOkr() {
	const locale = useLocale();
	const t = okrCanhKrMessages(locale).mau;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ds = useQuery(trpc.okr.mau.queryOptions({}));
	const quanTri = ds.data?.quanTri === true;
	const cay = useQuery({
		...trpc.org.tree.queryOptions(),
		enabled: quanTri,
	});
	const [mo, setMo] = useQueryState(THAM_SO_MAU, parseMau);
	const [hoiLuuTru, setHoiLuuTru] = useState<MauChon | null>(null);
	const [loiLuu, setLoiLuu] = useState<string | null>(null);
	const lyDo = quanTri ? undefined : LY_DO_KHONG_QUYEN;

	const dongSheet = () => {
		setLoiLuu(null);
		void setMo(null);
	};
	const luu = useMutation(
		trpc.okr.luuMau.mutationOptions({
			onSuccess: async () => {
				toast.success(t.sheet.daLuu);
				dongSheet();
				await cache.okr();
			},
			onError: (e) => setLoiLuu(e.message),
		}),
	);
	const luuTru = useMutation(
		trpc.okr.luuTruMau.mutationOptions({
			onSuccess: async () => {
				toast.success(t.bao.daLuuTru);
				setHoiLuuTru(null);
				await cache.okr();
			},
			onError: (e) => toast.error(e.message),
		}),
	);
	const khoiPhuc = useMutation(
		trpc.okr.khoiPhucMau.mutationOptions({
			onSuccess: async () => {
				toast.success(t.bao.daKhoiPhuc);
				await cache.okr();
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	const danhSach = ds.data?.mau ?? [];
	const dangSua =
		mo === null || mo === MAU_MOI
			? null
			: (danhSach.find((x) => x.id === mo) ?? null);
	const moSheet = quanTri && (mo === MAU_MOI || dangSua !== null);

	const nutThem = (dau: string) => (
		<Button
			size="sm"
			variant="outline"
			disabled={!quanTri}
			aria-describedby={lyDo}
			data-nut={dau}
			onClick={() => void setMo(MAU_MOI)}
		>
			<Icon icon={Add} data-icon="inline-start" />
			{t.the.them}
		</Button>
	);

	return (
		<Card data-the="mau-okr">
			<CardHeader>
				<CardTitle>{t.the.tieuDe}</CardTitle>
				<CardDescription>{t.the.moTa}</CardDescription>
				<CardAction>{nutThem("them-mau")}</CardAction>
			</CardHeader>
			{ds.isError ? (
				<LoiThe thuLai={() => void ds.refetch()} />
			) : ds.isPending ? (
				<DangTaiThe />
			) : danhSach.length === 0 ? (
				<CardContent>
					<Empty data-trang-thai="ST-mau-rong">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={Template} />
							</EmptyMedia>
							<EmptyTitle>{t.the.rong.tieuDe}</EmptyTitle>
							<EmptyDescription>{t.the.rong.moTa}</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>{nutThem("them-mau-rong")}</EmptyContent>
					</Empty>
				</CardContent>
			) : (
				<CardContent>
					<ItemGroup
						aria-label={t.the.tieuDe}
						data-trang-thai={
							quanTri ? "ST-mau-danh-sach" : "ST-mau-khong-quyen"
						}
					>
						{danhSach.map((mau) => (
							<DongMau
								key={mau.id}
								mau={mau}
								lyDo={lyDo}
								khoa={!quanTri}
								onSua={() => void setMo(mau.id)}
								onLuuTru={() => setHoiLuuTru(mau)}
								onKhoiPhuc={() => khoiPhuc.mutate({ id: mau.id })}
							/>
						))}
					</ItemGroup>
				</CardContent>
			)}
			{moSheet ? (
				<SheetMauOkr
					key={mo}
					mau={dangSua}
					donVi={donViTheoNhom(cay.data)}
					dangLuu={luu.isPending}
					loi={loiLuu}
					onLuu={(vao: LuuMauInput) => luu.mutate(vao)}
					onDong={dongSheet}
				/>
			) : null}
			<ConfirmDialog
				open={hoiLuuTru !== null}
				onOpenChange={(open) => {
					if (!open && !luuTru.isPending) setHoiLuuTru(null);
				}}
				tieuDe={dien(t.hoiLuuTru.tieuDe, { ten: hoiLuuTru?.ten ?? "" })}
				than={t.hoiLuuTru.than}
				nut={t.hoiLuuTru.nut}
				thoi={t.hoiLuuTru.thoi}
				pending={luuTru.isPending}
				onConfirm={() => {
					if (hoiLuuTru) luuTru.mutate({ id: hoiLuuTru.id });
				}}
			/>
		</Card>
	);
}
