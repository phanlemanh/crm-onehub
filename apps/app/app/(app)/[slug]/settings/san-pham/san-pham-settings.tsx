"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import {
	type ArchivedItem,
	ArchivedList,
} from "@crm/ui/components/archived-list";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
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
	EmptyDescription,
	EmptyHeader,
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
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { formatNgayGio } from "@crm/ui/lib/format";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { PageShellNote } from "@/components/page-shell-note";
import { LO_TRINH } from "@/lib/lo-trinh/cau-hinh";
import { NGHIA_TRANG_THAI_LAY } from "@/lib/lo-trinh/nghia-trang-thai-lay";
import { sanPhamMessages } from "@/lib/messages/san-pham";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { SheetNguoiXem } from "./sheet-nguoi-xem";
import { SheetSanPham } from "./sheet-san-pham";

export const ID_CHI_DOC = "san-pham-chi-doc";
const MOI = "moi";
const K = SEARCH_PARAM.sanPham;
const THAM_SO = { [K.sua]: parseAsString, [K.nguoiXem]: parseAsString };

const khongDoi = () => () => {};
const muiGio = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

function useDanhSach() {
	const trpc = useTRPC();
	return useQuery(trpc.sanPhamLoTrinh.danhSach.queryOptions());
}

type Hang = NonNullable<
	ReturnType<typeof useDanhSach>["data"]
>["sanPham"][number];

export function DongChiDoc() {
	const t = sanPhamMessages(useLocale());
	const ds = useDanhSach();
	if (ds.data?.quanTri !== false) return null;
	return (
		<PageShellNote data-san-pham-khong-quyen="" id={ID_CHI_DOC}>
			{t.trang.khongQuyen}
		</PageShellNote>
	);
}

export function NutThemSanPham() {
	const t = sanPhamMessages(useLocale());
	const ds = useDanhSach();
	const [, dat] = useQueryStates(THAM_SO);
	return (
		<Button
			data-nut="them-san-pham"
			disabled={ds.data?.quanTri !== true}
			aria-describedby={ds.data?.quanTri === false ? ID_CHI_DOC : undefined}
			onClick={() => void dat({ [K.sua]: MOI })}
		>
			<Icon icon={Add} data-icon="inline-start" />
			{t.trang.them}
		</Button>
	);
}

function MoTaHang({ sp }: { sp: Hang }) {
	const locale = useLocale();
	const t = sanPhamMessages(locale).the;
	const mui = useSyncExternalStore(khongDoi, muiGio, () => null);
	const phan = [`${sp.kho} · ${sp.nhanh} · ${sp.duongTep}`];
	if (sp.layLuc && mui)
		phan.push(
			t.layLuc(
				formatNgayGio(sp.layLuc, locale, { timeZone: mui, phan: "ngay-gio" }),
			),
		);
	return (
		<ItemDescription>
			<span translate="no">{phan.join(" · ")}</span>
			{sp.phienBanKhuon !== null ? (
				<span data-san-pham-khuon={sp.phienBanKhuon}>
					{" · "}
					{t.khuon(sp.phienBanKhuon)}
				</span>
			) : null}
		</ItemDescription>
	);
}

function HangSanPham({
	sp,
	quanTri,
	onSua,
	onNguoiXem,
	onDon,
}: {
	sp: Hang;
	quanTri: boolean;
	onSua: () => void;
	onNguoiXem: () => void;
	onDon: () => void;
}) {
	const locale = useLocale();
	const t = sanPhamMessages(locale);
	return (
		<Item size="sm" variant="outline" role="listitem" data-san-pham={sp.ma}>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{sp.ten}</span>
				</ItemTitle>
				<MoTaHang sp={sp} />
				<StatusIndicator
					data-san-pham-trang-thai={sp.trangThaiLay}
					size="sm"
					tone={toneTheoNghia(NGHIA_TRANG_THAI_LAY[sp.trangThaiLay])}
					label={t.trangThai[sp.trangThaiLay]}
					wrapLabel
				/>
			</ItemContent>
			<ItemActions>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							aria-label={t.the.thaoTac(sp.ten)}
							aria-describedby={quanTri ? undefined : ID_CHI_DOC}
							disabled={!quanTri}
							size="icon-sm"
							variant="ghost"
							data-nut="thao-tac-san-pham"
						>
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem data-muc="sua-san-pham" onSelect={onSua}>
							{t.the.sua}
						</DropdownMenuItem>
						<DropdownMenuItem data-muc="nguoi-xem" onSelect={onNguoiXem}>
							{t.the.nguoiXem}
						</DropdownMenuItem>
						<DropdownMenuItem
							data-muc={sp.coLichSu ? "luu-tru-san-pham" : "xoa-san-pham"}
							variant="destructive"
							onSelect={onDon}
						>
							{sp.coLichSu ? t.the.luuTru : t.the.xoa}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	);
}

export function SanPhamSettings() {
	const locale = useLocale();
	const t = sanPhamMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ds = useDanhSach();
	const quanTri = ds.data?.quanTri === true;
	const luuTruDs = useQuery({
		...trpc.sanPhamLoTrinh.daLuuTru.queryOptions(),
		enabled: quanTri,
	});
	const [thamSo, dat] = useQueryStates(THAM_SO);
	const [loiLuu, setLoiLuu] = useState<string | null>(null);
	const [hoiXoa, setHoiXoa] = useState<Hang | null>(null);
	const [hoiXoaVv, setHoiXoaVv] = useState<ArchivedItem | null>(null);
	const dong = () => {
		setLoiLuu(null);
		void dat({ [K.sua]: null, [K.nguoiXem]: null });
	};
	const lamMoi = () => cache.sanPhamLoTrinh();

	const tao = useMutation(
		trpc.sanPhamLoTrinh.tao.mutationOptions({
			onSuccess: async (_kq, vao) => {
				toast.success(t.bao.daTao(vao.ten));
				dong();
				await lamMoi();
			},
			onError: (e) => setLoiLuu(e.message),
		}),
	);
	const sua = useMutation(
		trpc.sanPhamLoTrinh.sua.mutationOptions({
			onSuccess: async () => {
				toast.success(t.bao.daLuu);
				dong();
				await lamMoi();
			},
			onError: (e) => setLoiLuu(e.message),
		}),
	);
	const nguoiXem = useMutation(
		trpc.sanPhamLoTrinh.datNguoiXem.mutationOptions({
			onSuccess: async () => {
				toast.success(t.bao.daLuu);
				dong();
				await lamMoi();
			},
			onError: (e) => toast.error(e.message),
		}),
	);
	const khoiPhuc = useMutation(trpc.sanPhamLoTrinh.khoiPhuc.mutationOptions());
	const luuTru = useMutation(trpc.sanPhamLoTrinh.luuTru.mutationOptions());
	const xoa = useMutation(trpc.sanPhamLoTrinh.xoa.mutationOptions());
	const xoaVv = useMutation(trpc.sanPhamLoTrinh.xoaVinhVien.mutationOptions());

	const donHang = (sp: Hang) => {
		if (!sp.coLichSu) {
			setHoiXoa(sp);
			return;
		}
		luuTru
			.mutateAsync({ ma: sp.ma })
			.then(async () => {
				await lamMoi();
				let daTra = false;
				toast.success(t.bao.daLuuTru(sp.ten), {
					action: {
						label: t.bao.hoanTac,
						onClick: () => {
							if (daTra) return;
							daTra = true;
							void khoiPhuc
								.mutateAsync({ ma: sp.ma })
								.then(lamMoi)
								.catch((e: Error) => {
									daTra = false;
									toast.error(e.message);
								});
						},
					},
				});
			})
			.catch((e: Error) => toast.error(e.message));
	};

	if (ds.isPending) return <KhungXuong hinh="danh-sach" />;
	if (ds.isError || !ds.data)
		return (
			<VungTaiLoi
				tieuDe={t.the.loiTai}
				moTa={ds.error?.message ?? ""}
				onThuLai={() => void ds.refetch()}
				dangTai={ds.isFetching}
			/>
		);

	const hang = ds.data.sanPham;
	const dangSua =
		thamSo[K.sua] === MOI
			? null
			: (hang.find((s) => s.ma === thamSo[K.sua]) ?? null);
	const moSheet = quanTri && (thamSo[K.sua] === MOI || dangSua !== null);
	const xemCua = hang.find((s) => s.ma === thamSo[K.nguoiXem]) ?? null;

	return (
		<div className="flex flex-col gap-6" data-trang-san-pham="">
			<Card>
				<CardHeader>
					<CardTitle>{t.the.tieuDe}</CardTitle>
					<CardDescription>{t.the.moTa}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3">
						<ItemGroup role="list">
							<Item
								size="sm"
								variant="outline"
								role="listitem"
								data-san-pham="crm"
							>
								<ItemContent>
									<ItemTitle>
										<span translate="no">CRM</span>
										<Badge variant="secondary" data-san-pham-khai-trong-ma="">
											{t.the.khaiTrongMa}
										</Badge>
									</ItemTitle>
									<ItemDescription>
										<span translate="no">{LO_TRINH.nguonCrmMoTa}</span>
									</ItemDescription>
								</ItemContent>
							</Item>
							{hang.map((sp) => (
								<HangSanPham
									key={sp.ma}
									sp={sp}
									quanTri={quanTri}
									onSua={() => void dat({ [K.sua]: sp.ma })}
									onNguoiXem={() => void dat({ [K.nguoiXem]: sp.ma })}
									onDon={() => donHang(sp)}
								/>
							))}
						</ItemGroup>
						{hang.length === 0 ? (
							<Empty data-san-pham-rong="">
								<EmptyHeader>
									<EmptyTitle>{t.the.rongTieuDe}</EmptyTitle>
									<EmptyDescription>{t.the.rongMoTa}</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : null}
					</div>
				</CardContent>
			</Card>
			{quanTri ? (
				<ArchivedList
					label={t.daLuuTru.nhan}
					restoreLabel={t.daLuuTru.khoiPhuc}
					purgeLabel={t.daLuuTru.xoaVinhVien}
					items={(luuTruDs.data ?? []).map((s) => ({
						id: s.ma,
						name: s.ten,
						purgeable: true,
					}))}
					pending={khoiPhuc.isPending}
					onRestore={(ma) =>
						khoiPhuc.mutate(
							{ ma },
							{
								onSuccess: () =>
									toast.success(
										t.bao.daKhoiPhuc(
											luuTruDs.data?.find((s) => s.ma === ma)?.ten ?? ma,
										),
									),
								onError: (e) => toast.error(e.message),
								onSettled: () => void lamMoi(),
							},
						)
					}
					onPurge={(muc) => setHoiXoaVv(muc)}
				/>
			) : null}
			{moSheet ? (
				<SheetSanPham
					key={thamSo[K.sua]}
					sp={dangSua}
					dangLuu={tao.isPending || sua.isPending}
					loi={loiLuu}
					onLuu={(vao) =>
						dangSua ? sua.mutate({ ...vao, ma: dangSua.ma }) : tao.mutate(vao)
					}
					onDong={dong}
				/>
			) : null}
			{quanTri && xemCua ? (
				<SheetNguoiXem
					key={xemCua.ma}
					ma={xemCua.ma}
					ten={xemCua.ten}
					dangLuu={nguoiXem.isPending}
					onLuu={(userIds) => nguoiXem.mutate({ ma: xemCua.ma, userIds })}
					onDong={dong}
				/>
			) : null}
			<ConfirmDialog
				open={hoiXoa !== null}
				onOpenChange={(mo) => {
					if (!mo) setHoiXoa(null);
				}}
				tieuDe={hoiXoa ? t.hoiXoa.tieuDe(hoiXoa.ten) : ""}
				than={t.hoiXoa.moTa}
				nut={t.hoiXoa.nut}
				thoi={t.sheet.huy}
				tone="destructive"
				pending={xoa.isPending}
				onConfirm={() => {
					if (!hoiXoa) return;
					const sp = hoiXoa;
					xoa.mutate(
						{ ma: sp.ma },
						{
							onSuccess: () => {
								setHoiXoa(null);
								toast.success(t.bao.daXoa(sp.ten));
							},
							onError: (e) => toast.error(e.message),
							onSettled: () => void lamMoi(),
						},
					);
				}}
			/>
			<ConfirmDialog
				open={hoiXoaVv !== null}
				onOpenChange={(mo) => {
					if (!mo) setHoiXoaVv(null);
				}}
				tieuDe={hoiXoaVv ? t.hoiXoaVinhVien.tieuDe(hoiXoaVv.name) : ""}
				than={t.hoiXoaVinhVien.moTa}
				nut={t.hoiXoaVinhVien.nut}
				thoi={t.sheet.huy}
				tone="destructive"
				pending={xoaVv.isPending}
				onConfirm={() => {
					if (!hoiXoaVv) return;
					const muc = hoiXoaVv;
					xoaVv.mutate(
						{ ma: muc.id },
						{
							onSuccess: () => {
								setHoiXoaVv(null);
								toast.success(t.bao.daXoa(muc.name));
							},
							onError: (e) => toast.error(e.message),
							onSettled: () => void lamMoi(),
						},
					);
				}}
			/>
		</div>
	);
}
