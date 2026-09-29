"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Checkbox } from "@crm/ui/components/checkbox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { OKR_HOI_Y, taoChuDeInput } from "@crm/validation/okr-hoi-y";
import { useMutation } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import {
	type OkrHoiYMessages,
	okrHoiYMessages,
} from "@/lib/messages/okr-hoi-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ChuNguoi, DoanChu, demSo, dien, ghep } from "./chu";
import { DaiMoc } from "./dai-moc";
import {
	type ChuDe,
	coTen,
	HOI_Y_MAN,
	type HoiY,
	type YXem,
} from "./man-hoi-y";

type Gan = {
	vaoChuDe: (yIds: string[], chuDeId: string) => void;
	yLa: (yId: string) => void;
	moTao: (yIds: string[]) => void;
	dangGan: boolean;
};

function useGan(hoiYId: string, sauGan: () => void): Gan & { hop: ReactNode } {
	const m = okrHoiYMessages(useLocale()).gom;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [taoCho, setTaoCho] = useState<string[] | null>(null);
	const gan = useMutation(
		trpc.okr.ganY.mutationOptions({
			onSuccess: async (_kq, vao) => {
				sauGan();
				toast.success(demSo(m.daGan.mot, m.daGan.nhieu, vao.yIds.length));
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const tao = useMutation(
		trpc.okr.taoChuDe.mutationOptions({
			onSuccess: async (kq) => {
				const yIds = taoCho ?? [];
				setTaoCho(null);
				if (yIds.length > 0) gan.mutate({ yIds, chuDeId: kq.id });
				else await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	return {
		vaoChuDe: (yIds, chuDeId) => gan.mutate({ yIds, chuDeId }),
		yLa: (yId) => gan.mutate({ yIds: [yId], yLa: true }),
		moTao: setTaoCho,
		dangGan: gan.isPending || tao.isPending,
		hop: (
			<HopTenChuDe
				dangLuu={tao.isPending}
				giaTri=""
				key={taoCho ? "mo" : "dong"}
				moTa={taoCho && taoCho.length > 0 ? m.taoMoTa : m.taoRongMoTa}
				nut={m.tao}
				onDong={() => setTaoCho(null)}
				onLuu={(ten) => tao.mutate({ hoiYId, ten })}
				open={taoCho !== null}
				tieuDe={m.taoTieuDe}
			/>
		),
	};
}

function HopTenChuDe({
	open,
	tieuDe,
	moTa,
	nut,
	giaTri,
	dangLuu,
	onLuu,
	onDong,
}: {
	open: boolean;
	tieuDe: string;
	moTa: string;
	nut: string;
	giaTri: string;
	dangLuu: boolean;
	onLuu: (ten: string) => void;
	onDong: () => void;
}) {
	const m = okrHoiYMessages(useLocale()).gom;
	const id = useId();
	const [ten, setTen] = useState(giaTri);
	const [thu, setThu] = useState(false);
	const sai = thu && !taoChuDeInput.shape.ten.safeParse(ten).success;
	return (
		<Dialog onOpenChange={(mo) => (mo ? undefined : onDong())} open={open}>
			<DialogContent>
				<form
					noValidate
					onSubmit={(e) => {
						e.preventDefault();
						setThu(true);
						if (taoChuDeInput.shape.ten.safeParse(ten).success)
							onLuu(ten.trim());
					}}
				>
					<DialogHeader>
						<DialogTitle>{tieuDe}</DialogTitle>
						<DialogDescription>{moTa}</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<Field data-invalid={sai ? true : undefined}>
							<FieldLabel htmlFor={id}>{m.ten}</FieldLabel>
							<Input
								aria-invalid={sai ? true : undefined}
								id={id}
								maxLength={OKR_HOI_Y.tenChuDe.max}
								onChange={(e) => setTen(e.target.value)}
								translate="no"
								value={ten}
							/>
							{sai ? (
								<FieldError>
									{dien(m.loiTen, {
										tu: OKR_HOI_Y.tenChuDe.min,
										den: OKR_HOI_Y.tenChuDe.max,
									})}
								</FieldError>
							) : (
								<FieldDescription>
									{dien(m.tenMoTa, {
										tu: OKR_HOI_Y.tenChuDe.min,
										den: OKR_HOI_Y.tenChuDe.max,
									})}
								</FieldDescription>
							)}
						</Field>
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								{m.huy}
							</Button>
						</DialogClose>
						<Button disabled={dangLuu} type="submit">
							{nut}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function MenuDuaVao({
	chuDe,
	yIds,
	boQua,
	gan,
}: {
	chuDe: ChuDe[];
	yIds: string[];
	boQua: string | null;
	gan: Gan;
}) {
	const m = okrHoiYMessages(useLocale()).gom;
	const [dau] = yIds;
	return (
		<DropdownMenuContent align="end">
			<DropdownMenuLabel>{m.duaVaoNhan}</DropdownMenuLabel>
			<DropdownMenuGroup>
				{chuDe
					.filter((c) => c.loai === "chu-de" && c.id !== boQua)
					.map((c) => (
						<DropdownMenuItem
							data-dua-vao={c.id}
							key={c.id}
							onSelect={() => gan.vaoChuDe(yIds, c.id)}
						>
							<span translate="no">{c.ten}</span>
						</DropdownMenuItem>
					))}
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem
					disabled={yIds.length !== 1 || dau === undefined}
					onSelect={() => {
						if (dau) gan.yLa(dau);
					}}
				>
					{m.yLaMuc}
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => gan.moTao(yIds)}>
					<Icon icon={Add} />
					{m.chuDeMoiMuc}
				</DropdownMenuItem>
			</DropdownMenuGroup>
		</DropdownMenuContent>
	);
}

function NutMenuY({
	y,
	chuDe,
	boQua,
	gan,
}: {
	y: YXem;
	chuDe: ChuDe[];
	boQua: string | null;
	gan: Gan;
}) {
	const m = okrHoiYMessages(useLocale()).gom;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label={dien(m.viecY, { chu: y.noiDung })}
					disabled={gan.dangGan}
					size="icon-sm"
					variant="ghost"
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<MenuDuaVao boQua={boQua} chuDe={chuDe} gan={gan} yIds={[y.id]} />
		</DropdownMenu>
	);
}

function DongPhuY({ y }: { y: YXem }) {
	const m = okrHoiYMessages(useLocale()).gom;
	if (!coTen(y)) return null;
	return (
		<ItemDescription data-tac-gia>
			{ghep(m.tacGia, {
				ten: <ChuNguoi>{y.tacGia.ten}</ChuNguoi>,
				n: y.soDongY,
			})}
		</ItemDescription>
	);
}

export function DanhSachYChuaGom({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).gom;
	const [chon, setChon] = useState<string[]>([]);
	const gan = useGan(h.hoiY.id, () => setChon([]));
	const chuDe = h.chuDe ?? [];
	const chuaGom = h.y.ds.filter((y) => y.chuDeId === null);
	const conChon = chon.filter((id) => chuaGom.some((y) => y.id === id));

	return (
		<Card data-khoi="y-chua-gom" id={HOI_Y_MAN.neo.yChuaGom} tabIndex={-1}>
			{conChon.length > 0 ? (
				<CardHeader data-khoi="thanh-chon">
					<CardTitle>
						{demSo(m.daChon.mot, m.daChon.nhieu, conChon.length)}
					</CardTitle>
					<CardAction>
						<div
							aria-label={m.viecDaChon}
							className="flex items-center gap-1"
							role="toolbar"
						>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button disabled={gan.dangGan} size="sm" variant="outline">
										{m.duaVao}
									</Button>
								</DropdownMenuTrigger>
								<MenuDuaVao
									boQua={null}
									chuDe={chuDe}
									gan={gan}
									yIds={conChon}
								/>
							</DropdownMenu>
							<Button onClick={() => setChon([])} size="sm" variant="ghost">
								{m.boChon}
							</Button>
						</div>
					</CardAction>
				</CardHeader>
			) : (
				<CardHeader>
					<CardTitle>{dien(m.chuaGom, { n: chuaGom.length })}</CardTitle>
					<CardDescription>{m.chuaGomMoTa}</CardDescription>
					<CardAction>
						<Button onClick={() => gan.moTao([])} size="sm" variant="outline">
							<Icon data-icon="inline-start" icon={Add} />
							{m.chuDeMoi}
						</Button>
					</CardAction>
				</CardHeader>
			)}
			<CardContent>
				{chuaGom.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>{m.daGomHet}</EmptyTitle>
						</EmptyHeader>
					</Empty>
				) : (
					<ItemGroup>
						{chuaGom.map((y) => (
							<Item data-y={y.id} key={y.id} variant="outline">
								<ItemMedia>
									<Checkbox
										aria-label={dien(m.chonY, { chu: y.noiDung })}
										checked={conChon.includes(y.id)}
										onCheckedChange={(v) =>
											setChon((cu) =>
												v === true
													? [...cu, y.id]
													: cu.filter((id) => id !== y.id),
											)
										}
									/>
								</ItemMedia>
								<ItemContent>
									<DoanChu>{y.noiDung}</DoanChu>
									<DongPhuY y={y} />
								</ItemContent>
								<ItemActions>
									<NutMenuY boQua={null} chuDe={chuDe} gan={gan} y={y} />
								</ItemActions>
							</Item>
						))}
					</ItemGroup>
				)}
			</CardContent>
			{gan.hop}
		</Card>
	);
}

export function YTrongChuDe({ h, c }: { h: HoiY; c: ChuDe }) {
	const gan = useGan(h.hoiY.id, () => {});
	return (
		<ItemGroup>
			{c.y.map((y) => (
				<Item data-y={y.id} key={y.id} size="xs">
					<ItemContent>
						<DoanChu>{y.noiDung}</DoanChu>
						<DongPhuY y={y} />
					</ItemContent>
					<ItemActions>
						<NutMenuY boQua={c.id} chuDe={h.chuDe ?? []} gan={gan} y={y} />
					</ItemActions>
				</Item>
			))}
			{gan.hop}
		</ItemGroup>
	);
}

export function MenuChuDe({ c }: { c: ChuDe }) {
	const m = okrHoiYMessages(useLocale()).gom;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [doiTen, setDoiTen] = useState(false);
	const [go, setGo] = useState(false);
	const sua = useMutation(
		trpc.okr.suaChuDe.mutationOptions({
			onSuccess: async () => {
				setDoiTen(false);
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const xoa = useMutation(
		trpc.okr.goChuDe.mutationOptions({
			onSuccess: async () => {
				setGo(false);
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	if (c.loai !== "chu-de") return null;
	const conY = c.y.length > 0 || c.bangChung.soNguoi > 0;
	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label={dien(m.viecChuDe, { chu: c.ten })}
						size="icon-sm"
						variant="ghost"
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuGroup>
						<DropdownMenuItem onSelect={() => setDoiTen(true)}>
							{m.doiTen}
						</DropdownMenuItem>
						<DropdownMenuItem
							disabled={conY}
							onSelect={() => setGo(true)}
							variant="destructive"
						>
							{conY ? m.goChuDeConY : m.goChuDe}
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<HopTenChuDe
				dangLuu={sua.isPending}
				giaTri={c.ten}
				key={doiTen ? "mo" : "dong"}
				moTa={dien(m.tenMoTa, {
					tu: OKR_HOI_Y.tenChuDe.min,
					den: OKR_HOI_Y.tenChuDe.max,
				})}
				nut={m.luu}
				onDong={() => setDoiTen(false)}
				onLuu={(ten) => sua.mutate({ chuDeId: c.id, ten })}
				open={doiTen}
				tieuDe={m.doiTenTieuDe}
			/>
			<ConfirmDialog
				nut={m.goChuDe}
				onConfirm={() => xoa.mutate({ chuDeId: c.id })}
				onOpenChange={setGo}
				open={go}
				pending={xoa.isPending}
				than={m.goThan}
				thoi={m.giu}
				tieuDe={m.goTieuDe}
			/>
		</>
	);
}

export function moTaBangChung(c: ChuDe, t: OkrHoiYMessages): string {
	const gia = {
		y: c.y.length,
		nguoi: c.bangChung.soNguoi,
		donVi: c.bangChung.soDonVi,
	};
	return c.bangChung.soDongY === undefined
		? dien(t.gom.bangChung, gia)
		: dien(t.gom.bangChungDongY, { ...gia, dongY: c.bangChung.soDongY });
}

function TheChuDeGom({ h, c }: { h: HoiY; c: ChuDe }) {
	const t = okrHoiYMessages(useLocale());
	return (
		<Card data-chu-de={c.id}>
			<CardHeader>
				<CardTitle translate="no">{c.ten}</CardTitle>
				<CardDescription>{moTaBangChung(c, t)}</CardDescription>
				<CardAction>
					<MenuChuDe c={c} />
				</CardAction>
			</CardHeader>
			<CardContent>
				<YTrongChuDe c={c} h={h} />
			</CardContent>
		</Card>
	);
}

function TheChuDeMoi({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).gom;
	const gan = useGan(h.hoiY.id, () => {});
	return (
		<>
			<Button onClick={() => gan.moTao([])} size="sm" variant="outline">
				<Icon data-icon="inline-start" icon={Add} />
				{m.chuDeMoi}
			</Button>
			{gan.hop}
		</>
	);
}

export function KhoiGom({ h, bayGio }: { h: HoiY; bayGio: number }) {
	const m = okrHoiYMessages(useLocale()).gom;
	const chuDe = (h.chuDe ?? []).filter((c) => c.loai === "chu-de");
	const yLa = (h.chuDe ?? []).filter((c) => c.loai === "y-la");
	return (
		<div className="flex flex-col gap-6" data-khoi="gom">
			<DaiMoc bayGio={bayGio} h={h} />
			<Card>
				<CardHeader>
					<CardTitle>{m.tieuDe}</CardTitle>
					<CardDescription>
						{ghep(m.moTa, {
							n: h.y.ds.length,
							ten: <ChuNguoi>{h.nguoiChon.name}</ChuNguoi>,
						})}
					</CardDescription>
				</CardHeader>
			</Card>
			<DanhSachYChuaGom h={h} />
			<Card data-khoi="chu-de">
				<CardHeader>
					<CardTitle>{dien(m.chuDe, { n: chuDe.length })}</CardTitle>
					<CardAction>
						<TheChuDeMoi h={h} />
					</CardAction>
				</CardHeader>
				<CardContent>
					{chuDe.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>{m.chuDeRong}</EmptyTitle>
								<EmptyDescription>{m.chuDeRongMoTa}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<div className="grid gap-6 md:grid-cols-2">
							{chuDe.map((c) => (
								<TheChuDeGom c={c} h={h} key={c.id} />
							))}
						</div>
					)}
				</CardContent>
			</Card>
			{yLa.length > 0 ? (
				<Card data-khoi="y-la">
					<CardHeader>
						<CardTitle>{dien(m.yLa, { n: yLa.length })}</CardTitle>
						<CardDescription>{m.yLaMoTa}</CardDescription>
					</CardHeader>
					<CardContent>
						{yLa.map((c) => (
							<YTrongChuDe c={c} h={h} key={c.id} />
						))}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
