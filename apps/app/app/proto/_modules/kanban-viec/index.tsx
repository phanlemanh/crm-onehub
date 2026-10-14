"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import {
	Board,
	type BoardCard,
	type BoardColumn,
	type BoardMove,
} from "@crm/ui/components/board";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	BANG_DANG_THEO_DOI,
	BANG_GIAO_CHO_TOI,
	CHU,
	type Cot,
	DONG_TU,
	NGHIA_COT,
	NGUOI_CHON,
	NHAN_COT,
	SO_HUY,
	SO_XONG_TONG,
	THU_TU_COT,
	type TheMau,
	TOI,
	VIEC_CHA,
	VIEC_CON,
} from "./du-lieu";

type Nhom = "giao-cho-toi" | "dang-theo-doi";

function tenNguoi(ten: string) {
	return ten === TOI ? "Tôi" : ten;
}

function NoiDungThe({
	the,
	menuMo,
	nhom,
	onChuyen,
}: {
	the: TheMau;
	menuMo: boolean;
	nhom: Nhom;
	onChuyen: (the: TheMau, dich: Cot) => void;
}) {
	const coMenu = nhom !== "dang-theo-doi";
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<span className="break-words font-medium" translate="no">
				{the.tieuDe}
			</span>
			{the.cha ? (
				<span className="break-words text-muted-foreground text-xs">
					<span translate="no">{CHU.thuoc(the.cha)}</span>
				</span>
			) : null}
			<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
				{the.han ? (
					the.quaHan ? (
						<StatusIndicator tone={toneTheoNghia("hong")} label={the.han} />
					) : (
						<span className="text-muted-foreground tabular-nums">
							{the.han}
						</span>
					)
				) : null}
				{nhom === "dang-theo-doi" ? (
					<span className="text-muted-foreground" translate="no">
						{tenNguoi(the.nguoiThucHien)}
					</span>
				) : null}
				{the.con ? (
					<Badge variant="secondary">
						<span className="tabular-nums">
							{CHU.conXong(the.con.xong, the.con.tong)}
						</span>
					</Badge>
				) : null}
			</span>
			{coMenu && the.cot !== "xong" ? (
				<div>
					<DropdownMenu defaultOpen={menuMo}>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								disabled={the.chuyenDuoc.length === 0}
							>
								{CHU.chuyenSang}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuLabel>
								{CHU.chuyenSangCua(the.tieuDe)}
							</DropdownMenuLabel>
							{the.chuyenDuoc.map((dich) => (
								<DropdownMenuItem
									key={dich}
									onSelect={() => onChuyen(the, dich)}
								>
									{DONG_TU[dich]}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : null}
			{coMenu && the.cot === "cho-danh-gia" && the.chuyenDuoc.length === 0 ? (
				<span className="text-muted-foreground text-xs">
					{CHU.choDanhGiaKhoa}
				</span>
			) : null}
		</div>
	);
}

function cotBang(theList: TheMau[], rong: boolean): BoardColumn[] {
	return THU_TU_COT.map((cot) => {
		const the = rong ? [] : theList.filter((t) => t.cot === cot);
		const tong = the.length;
		return {
			id: cot,
			label: NHAN_COT[cot],
			count: tong,
			cards: the.map((t) => ({ id: t.id, href: `#${t.id}`, title: t.tieuDe })),
		};
	});
}

function XuongBangMau() {
	return (
		<div className="flex gap-3 overflow-hidden rounded-lg border bg-card p-3">
			{THU_TU_COT.map((cot) => (
				<div key={cot} className="flex w-64 shrink-0 flex-col gap-2">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
			))}
		</div>
	);
}

function BangViec({ state }: { state: string }) {
	const nhomBanDau: Nhom =
		state === "ST-bang-viec-chi-xem" ? "dang-theo-doi" : "giao-cho-toi";
	const [nhom, datNhom] = useState<Nhom>(nhomBanDau);
	const [kieu, datKieu] = useState("bang");
	const [the, datThe] = useState<TheMau[]>(BANG_GIAO_CHO_TOI);
	const [hoiCha, datHoiCha] = useState(state === "ST-bang-viec-hoi-dong-cha");
	const [tuChoi, datTuChoi] = useState(state === "ST-bang-viec-tu-choi");

	const danhSach = nhom === "dang-theo-doi" ? BANG_DANG_THEO_DOI : the;
	const rong = state === "ST-bang-viec-rong";
	const cot = cotBang(danhSach, rong);
	const theoId = new Map(danhSach.map((t) => [t.id, t]));

	const chuyen = (muc: TheMau, dich: Cot) => {
		if (!muc.chuyenDuoc.includes(dich)) {
			datTuChoi(true);
			return;
		}
		if (dich === "xong" && muc.con && muc.con.xong < muc.con.tong) {
			datHoiCha(true);
			return;
		}
		datThe((cu) => cu.map((t) => (t.id === muc.id ? { ...t, cot: dich } : t)));
	};

	const onMove = (move: BoardMove) => {
		const muc = theoId.get(move.cardId);
		if (muc) chuyen(muc, move.to as Cot);
	};

	const renderCard = (card: BoardCard) => {
		const muc = theoId.get(card.id);
		if (!muc) return null;
		return (
			<NoiDungThe
				the={muc}
				nhom={nhom}
				menuMo={state === "ST-bang-viec-menu" && muc.id === "v1"}
				onChuyen={chuyen}
			/>
		);
	};

	let than: React.ReactNode;
	if (state === "ST-bang-viec-cho-tai") than = <XuongBangMau />;
	else if (state === "ST-bang-viec-loi")
		than = (
			<VungTaiLoi
				tieuDe={CHU.loiTieuDe}
				moTa={CHU.loiMoTa}
				onThuLai={() => {}}
			/>
		);
	else
		than = (
			<div className="flex flex-col gap-3">
				{tuChoi ? (
					<Alert variant="destructive">
						<AlertTitle>{CHU.tuChoiTieuDe}</AlertTitle>
						<AlertDescription>{CHU.tuChoiMoTa}</AlertDescription>
					</Alert>
				) : null}
				<Board
					columns={cot}
					label={CHU.nhanBang}
					onMove={nhom === "dang-theo-doi" ? undefined : onMove}
					renderCard={renderCard}
				/>
				{rong ? null : (
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm">
							{CHU.xongCu(SO_XONG_TONG - 1)}
						</Button>
						<Button variant="outline" size="sm">
							{CHU.daHuy(SO_HUY)}
						</Button>
					</div>
				)}
			</div>
		);

	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{CHU.tieuDeTrang}</PageShellTitle>
					<PageShellDescription>{CHU.moTaTrang}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Button>{CHU.giaoViec}</Button>
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="max-w-full overflow-x-auto">
							<ToggleGroup
								type="single"
								variant="outline"
								size="sm"
								value={nhom}
								onValueChange={(v) => v && datNhom(v as Nhom)}
							>
								<ToggleGroupItem value="giao-cho-toi">
									{CHU.nhomGiaoChoToi}
									<span className="text-muted-foreground tabular-nums">6</span>
								</ToggleGroupItem>
								<ToggleGroupItem value="toi-giao">
									{CHU.nhomToiGiao}
									<span className="text-muted-foreground tabular-nums">3</span>
								</ToggleGroupItem>
								<ToggleGroupItem value="dang-theo-doi">
									{CHU.nhomTheoDoi}
									<span className="text-muted-foreground tabular-nums">2</span>
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<ViewSwitch
							label={CHU.kieuXem}
							value={kieu}
							onValueChange={datKieu}
							items={[
								{ value: "danh-sach", label: CHU.danhSach },
								{ value: "bang", label: CHU.bang },
							]}
						/>
					</div>
					{than}
				</div>
			</PageShellContent>
			<ConfirmDialog
				tieuDe={CHU.hoiDongTieuDe}
				than={CHU.hoiDongThan(2)}
				nut={CHU.hoiDongNut}
				thoi={CHU.thoi}
				open={hoiCha}
				onOpenChange={datHoiCha}
				onConfirm={() => {
					datThe((cu) =>
						cu.map((t) => (t.id === VIEC_CHA.id ? { ...t, cot: "xong" } : t)),
					);
					datHoiCha(false);
				}}
				pending={false}
			/>
		</PageShell>
	);
}

function OSoanCon() {
	const [nguoi, datNguoi] = useState("yen");
	const [han, datHan] = useState<string | null>("2026-10-24");
	return (
		<div className="flex flex-col gap-3" data-o-soan-con="">
			<Field>
				<FieldLabel htmlFor="tieu-de-viec-con">{CHU.tieuDeViecCon}</FieldLabel>
				<Input
					id="tieu-de-viec-con"
					name="tieuDeViecCon"
					autoComplete="off"
					placeholder={CHU.goiYTieuDe}
				/>
			</Field>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field>
					<FieldLabel>{CHU.nguoiThucHien}</FieldLabel>
					<Combobox
						options={NGUOI_CHON}
						value={nguoi}
						onValueChange={datNguoi}
						translate="no"
					/>
				</Field>
				<Field>
					<FieldLabel>{CHU.han}</FieldLabel>
					<DatePicker value={han} onChange={datHan} placeholder={CHU.han} />
				</Field>
			</div>
			<FieldDescription>
				Việc con mang theo thoả thuận gắn với việc cha.
			</FieldDescription>
			<div>
				<Button size="sm" variant="outline">
					{CHU.them}
				</Button>
			</div>
		</div>
	);
}

function KhungViec({ state }: { state: string }) {
	const laCon = state === "ST-khung-viec-la-con";
	const dangSoan = state === "ST-khung-viec-con-soan";
	const conMo = VIEC_CON.filter((c) => c.nghia !== null);
	const xong = conMo.filter((c) => c.nghia === "xong").length;

	const tieuDe = laCon
		? (VIEC_CON[2]?.tieuDe ?? VIEC_CHA.tieuDe)
		: VIEC_CHA.tieuDe;
	return (
		<DetailSheet open onOpenChange={() => {}}>
			<DetailSheetHeader
				title={<span translate="no">{tieuDe}</span>}
				description={
					<span translate="no">Thoả thuận An Phát · gói đại lý</span>
				}
				actions={
					<div className="flex gap-2">
						<Button size="sm" variant="outline">
							{laCon ? "Bắt đầu" : "Gửi đánh giá"}
						</Button>
						<Button size="sm">Xong</Button>
					</div>
				}
			/>
			<DetailSheetBody>
				<DetailSheetSection title={CHU.chiTiet}>
					<DetailSheetProperties>
						{laCon ? (
							<DetailSheetProperty label={CHU.thuocViec}>
								<Button variant="link" size="sm">
									<span translate="no">{VIEC_CHA.tieuDe}</span>
								</Button>
							</DetailSheetProperty>
						) : null}
						<DetailSheetProperty label={CHU.trangThai}>
							<StatusIndicator
								tone={toneTheoNghia(NGHIA_COT[laCon ? "chua-lam" : "dang-lam"])}
								label={NHAN_COT[laCon ? "chua-lam" : "dang-lam"]}
							/>
						</DetailSheetProperty>
						<DetailSheetProperty label={CHU.han}>
							{laCon ? "20/10" : "31/10"}
						</DetailSheetProperty>
						<DetailSheetProperty label={CHU.nguoiGiao}>
							<span translate="no">Lê Minh Quân</span>
						</DetailSheetProperty>
						<DetailSheetProperty label={CHU.nguoiThucHien}>
							<span translate="no">{TOI}</span>
						</DetailSheetProperty>
						<DetailSheetProperty label={CHU.ganVoi}>
							<Badge variant="outline">
								<span translate="no">Thoả thuận An Phát · gói đại lý</span>
							</Badge>
						</DetailSheetProperty>
					</DetailSheetProperties>
				</DetailSheetSection>
				{laCon ? null : (
					<DetailSheetSection>
						<SectionHeading
							level={4}
							actions={
								dangSoan ? null : (
									<Button size="sm" variant="outline">
										{CHU.themViecCon}
									</Button>
								)
							}
						>
							{CHU.viecCon(xong, conMo.length)}
						</SectionHeading>
						{dangSoan ? <OSoanCon /> : null}
						<ItemGroup className="gap-1">
							{VIEC_CON.map((c) => (
								<Item key={c.id} size="sm" asChild>
									<button type="button" className="text-start">
										<ItemContent>
											<ItemTitle>
												<span translate="no">{c.tieuDe}</span>
											</ItemTitle>
											<ItemDescription>
												{c.nghia ? (
													<StatusIndicator
														tone={toneTheoNghia(c.nghia)}
														label={c.nhan}
													/>
												) : (
													<span className="text-muted-foreground">
														{c.nhan}
													</span>
												)}
												<span className="mx-2">·</span>
												<span translate="no">{tenNguoi(c.nguoiThucHien)}</span>
											</ItemDescription>
										</ItemContent>
									</button>
								</Item>
							))}
						</ItemGroup>
					</DetailSheetSection>
				)}
			</DetailSheetBody>
		</DetailSheet>
	);
}

export function KanbanViecMau({ state }: { state: string }) {
	const noiDung = state.startsWith("ST-khung-viec") ? (
		<KhungViec state={state} />
	) : (
		<BangViec state={state} />
	);
	return <LocaleProvider locale="vi">{noiDung}</LocaleProvider>;
}
