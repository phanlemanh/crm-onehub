"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
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
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { GanttDuAn } from "@crm/ui/components/gantt-du-an";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
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
	CHU,
	DU_AN_DONG,
	DU_AN_MO,
	type DuAnMau,
	HOM_NAY,
	LICH,
	MOC,
	MOC_TRE,
	NGAY_LE,
	VIEC,
	VIEC_CUA_TOI,
	viecDaDoi,
} from "./du-lieu";

function DongDuAn({ da }: { da: DuAnMau }) {
	return (
		<SimpleTableRow clickable>
			<SimpleTableCell>
				<span className="font-medium" translate="no">
					{da.ten}
				</span>
			</SimpleTableCell>
			<SimpleTableCell numeric>
				{CHU.tienDo(da.soXong, da.soViec)}
			</SimpleTableCell>
			<SimpleTableCell numeric>{da.khoang}</SimpleTableCell>
			<SimpleTableCell>
				{da.mocKe ? (
					<StatusIndicator
						tone={da.mocTre ? "error" : "neutral"}
						label={
							<span translate="no">
								{da.mocTre ? `${da.mocKe} · ${CHU.tre}` : da.mocKe}
							</span>
						}
					/>
				) : (
					"—"
				)}
			</SimpleTableCell>
			<SimpleTableCell>{da.nguoiTao}</SimpleTableCell>
		</SimpleTableRow>
	);
}

function BangDuAn({ ds }: { ds: DuAnMau[] }) {
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable
					surface="page"
					columns={[
						{ id: "ten", header: CHU.cotTen },
						{ id: "tienDo", header: CHU.cotTienDo, align: "right" },
						{ id: "khoang", header: CHU.cotKhoang, align: "right" },
						{ id: "moc", header: CHU.cotMoc },
						{ id: "nguoiTao", header: CHU.cotNguoiTao },
					]}
				>
					{ds.map((da) => (
						<DongDuAn key={da.id} da={da} />
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="md:hidden">
				{ds.map((da) => (
					<Item key={da.id} variant="outline" asChild>
						<a href="#du-an">
							<ItemContent>
								<ItemTitle translate="no">{da.ten}</ItemTitle>
								<ItemDescription>
									{CHU.tienDo(da.soXong, da.soViec)} · {da.khoang}
									{da.mocKe ? ` · ${da.mocKe}` : ""}
								</ItemDescription>
							</ItemContent>
						</a>
					</Item>
				))}
			</ItemGroup>
		</>
	);
}

type PhamVi = "cua-toi" | "tat-ca" | "du-an";

function phamViCua(state: string): PhamVi {
	if (state === "ST-viec-cua-toi-du-an" || state === "ST-pham-vi-mo")
		return "cua-toi";
	if (state.startsWith("ST-du-an-ds") || state === "ST-du-an-tao")
		return "tat-ca";
	return "du-an";
}

function OPhamVi({
	phamVi,
	moSan,
	onTao,
}: {
	phamVi: PhamVi;
	moSan: boolean;
	onTao: () => void;
}) {
	const [mo, setMo] = useState(moSan);
	const nhan =
		phamVi === "cua-toi"
			? CHU.cuaToi
			: phamVi === "tat-ca"
				? CHU.tatCaDuAn
				: DU_AN_MO[0]?.ten;
	return (
		<DropdownMenu open={mo} onOpenChange={setMo}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" aria-label={CHU.phamVi}>
					<span className="text-muted-foreground">{CHU.phamVi}:</span>
					<span translate={phamVi === "du-an" ? "no" : undefined}>{nhan}</span>
					<ChevronDown aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem>{CHU.cuaToi}</DropdownMenuItem>
				<DropdownMenuItem>{CHU.tatCaDuAn}</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>{CHU.duAnDangMo}</DropdownMenuLabel>
					{DU_AN_MO.map((da) => (
						<DropdownMenuItem key={da.id}>
							<span translate="no">{da.ten}</span>
						</DropdownMenuItem>
					))}
					<DropdownMenuItem>{CHU.daDong(DU_AN_DONG.length)}</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={onTao}>{CHU.taoDuAnMo}</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function ViecCuaToi() {
	return (
		<div className="flex flex-col gap-2">
			<SimpleTable
				surface="page"
				columns={[
					{ id: "ten", header: CHU.cotViec },
					{ id: "han", header: CHU.han, align: "right" },
				]}
			>
				{VIEC_CUA_TOI.map((v) => (
					<SimpleTableRow key={v.id} clickable>
						<SimpleTableCell>
							<div className="flex min-w-0 flex-col">
								<span translate="no">{v.tieuDe}</span>
								{v.duAn ? (
									<a
										href="#pham-vi"
										className="text-muted-foreground text-xs"
										translate="no"
									>
										{CHU.dongDuAn(v.duAn)}
									</a>
								) : v.gan ? (
									<span
										className="text-muted-foreground text-xs"
										translate="no"
									>
										{v.gan}
									</span>
								) : null}
							</div>
						</SimpleTableCell>
						<SimpleTableCell numeric>{v.han}</SimpleTableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</div>
	);
}

function TatCaDuAn({ state, onTao }: { state: string; onTao: () => void }) {
	if (state === "ST-du-an-ds-cho-tai") {
		return (
			<div className="flex flex-col gap-2">
				{[1, 2, 3, 4, 5].map((n) => (
					<Skeleton key={n} className="h-10 w-full" />
				))}
			</div>
		);
	}
	if (state === "ST-du-an-ds-loi") {
		return (
			<VungTaiLoi tieuDe={CHU.loiDs} moTa={CHU.loiMoTa} onThuLai={() => {}} />
		);
	}
	if (state === "ST-du-an-ds-rong") {
		return (
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>{CHU.chuaCoDuAn}</EmptyTitle>
					<EmptyDescription>{CHU.chuaCoDuAnMoTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={onTao}>{CHU.taoDuAn}</Button>
				</EmptyContent>
			</Empty>
		);
	}
	return (
		<div className="flex flex-col gap-4">
			<BangDuAn ds={DU_AN_MO} />
			<Collapsible>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm">
						{CHU.daDong(DU_AN_DONG.length)}
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<BangDuAn ds={DU_AN_DONG} />
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}

function KhungXuongGantt() {
	return (
		<div className="grid grid-cols-[14rem_1fr] gap-2">
			{[1, 2, 3, 4, 5].map((n) => (
				<div key={n} className="contents">
					<Skeleton className="h-8" />
					<Skeleton className="h-8" />
				</div>
			))}
		</div>
	);
}

function DaiDuAn({ chiXem, onDong }: { chiXem: boolean; onDong: () => void }) {
	return (
		<Item variant="outline">
			<ItemContent>
				<ItemTitle translate="no">Triển khai Ngân hàng An Phát</ItemTitle>
				<ItemDescription>
					{chiXem ? CHU.daDongDong : "7 việc · 19/10 – 06/11 · Go-live 30/10"}
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" aria-label={CHU.thaoTacDuAn}>
							<OverflowMenuHorizontal aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{chiXem ? (
							<DropdownMenuItem>{CHU.moLai}</DropdownMenuItem>
						) : (
							<>
								<DropdownMenuItem>{CHU.suaDuAn}</DropdownMenuItem>
								<DropdownMenuItem>{CHU.themMoc}</DropdownMenuItem>
								<DropdownMenuItem onSelect={onDong}>
									{CHU.dong}
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	);
}

function NoiDungDuAn({ state }: { state: string }) {
	const chiXem = state === "ST-gantt-chi-xem";
	const daDoi = state === "ST-gantt-da-doi";
	const viec = daDoi ? viecDaDoi() : VIEC;
	const moc = daDoi || state === "ST-gantt-moc-tre" ? MOC_TRE : MOC;
	if (state === "ST-gantt-cho-tai") return <KhungXuongGantt />;
	if (state === "ST-gantt-loi") {
		return (
			<VungTaiLoi tieuDe={CHU.loiLich} moTa={CHU.loiMoTa} onThuLai={() => {}} />
		);
	}
	if (state === "ST-gantt-rong") {
		return (
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>{CHU.duAnChuaCoViec}</EmptyTitle>
					<EmptyDescription>{CHU.duAnChuaCoViecMoTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button>{CHU.giaoViec}</Button>
				</EmptyContent>
			</Empty>
		);
	}
	return (
		<div className="flex flex-col gap-4">
			{daDoi ? (
				<Alert>
					<AlertDescription>{CHU.daDoi}</AlertDescription>
				</Alert>
			) : null}
			<GanttDuAn
				className="h-[520px]"
				viec={viec}
				moc={moc}
				lich={LICH}
				homNay={HOM_NAY}
				chiDoc={chiXem}
				onDoiLich={() => {}}
				onDatNgay={() => {}}
				onMoViec={() => {}}
			/>
		</div>
	);
}

function ManViec({ state }: { state: string }) {
	const phamVi = phamViCua(state);
	const [tao, setTao] = useState(state === "ST-du-an-tao");
	const [hoiDong, setHoiDong] = useState(state === "ST-du-an-hoi-dong");
	const [xem, setXem] = useState(phamVi === "du-an" ? "gantt" : "danh-sach");
	const kieuXem = [
		...(phamVi === "du-an" ? [{ value: "gantt", label: CHU.gantt }] : []),
		{ value: "danh-sach", label: CHU.danhSach },
		{ value: "bang", label: CHU.bang },
	];
	const moTa =
		phamVi === "cua-toi"
			? CHU.moTaCuaToi
			: phamVi === "tat-ca"
				? CHU.moTaTatCa
				: CHU.moTaMotDuAn;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{CHU.viec}</PageShellTitle>
					<PageShellDescription>{moTa}</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					{state === "ST-gantt-chi-xem" ? null : (
						<Button>{CHU.giaoViec}</Button>
					)}
				</PageShellActions>
			</PageShellHeader>
			<PageShellContent>
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap items-center gap-2">
						<OPhamVi
							phamVi={phamVi}
							moSan={state === "ST-pham-vi-mo"}
							onTao={() => setTao(true)}
						/>
						<ViewSwitch
							label={CHU.kieuXem}
							value={xem}
							onValueChange={setXem}
							items={kieuXem}
						/>
					</div>
					{phamVi === "du-an" ? (
						<DaiDuAn
							chiXem={state === "ST-gantt-chi-xem"}
							onDong={() => setHoiDong(true)}
						/>
					) : null}
					{phamVi === "cua-toi" ? (
						<ViecCuaToi />
					) : phamVi === "tat-ca" ? (
						<TatCaDuAn state={state} onTao={() => setTao(true)} />
					) : (
						<NoiDungDuAn state={state} />
					)}
				</div>
			</PageShellContent>
			<Dialog open={tao} onOpenChange={setTao}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{CHU.taoDuAn}</DialogTitle>
					</DialogHeader>
					<Field>
						<FieldLabel htmlFor="ten-du-an">{CHU.tenDuAn}</FieldLabel>
						<Input
							id="ten-du-an"
							maxLength={120}
							autoComplete="off"
							placeholder="Triển khai Ngân hàng A…"
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="mo-ta-du-an">{CHU.moTa}</FieldLabel>
						<Textarea id="mo-ta-du-an" maxLength={4000} />
					</Field>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">{CHU.huy}</Button>
						</DialogClose>
						<Button>{CHU.tao}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<ConfirmDialog
				tieuDe={CHU.hoiDongTieuDe}
				than={CHU.hoiDongThan}
				nut={CHU.dong}
				thoi={CHU.thoi}
				open={hoiDong}
				onOpenChange={setHoiDong}
				onConfirm={() => setHoiDong(false)}
				pending={false}
			/>
		</PageShell>
	);
}

function KhungViecLich() {
	const [batDau, setBatDau] = useState<string | null>("2026-10-22");
	const [han, setHan] = useState<string | null>("2026-10-28");
	return (
		<DetailSheet open onOpenChange={() => {}}>
			<DetailSheetHeader
				title={<span translate="no">Chuẩn bị dữ liệu khách hàng</span>}
			/>
			<DetailSheetBody>
				<DetailSheetSection title="Chi tiết">
					<DetailSheetProperties>
						<DetailSheetProperty label={CHU.batDau}>
							<DatePicker value={batDau} onChange={setBatDau} />
						</DetailSheetProperty>
						<DetailSheetProperty label={CHU.han}>
							<DatePicker value={han} onChange={setHan} />
						</DetailSheetProperty>
						<DetailSheetProperty label={CHU.duAn}>
							<span translate="no">Triển khai Ngân hàng An Phát</span>
						</DetailSheetProperty>
					</DetailSheetProperties>
				</DetailSheetSection>
				<DetailSheetSection title={CHU.phaiCho(1)}>
					<ItemGroup>
						<Item variant="outline" size="sm">
							<ItemContent>
								<ItemTitle translate="no">Ký hợp đồng triển khai</ItemTitle>
								<ItemDescription>20/10 – 21/10</ItemDescription>
							</ItemContent>
						</Item>
					</ItemGroup>
					<Field>
						<FieldLabel>{CHU.themPhaiCho}</FieldLabel>
						<Combobox
							options={[
								{ value: "v-hop", label: "Họp khởi động với ngân hàng" },
								{
									value: "v-dt",
									label: "Đào tạo nhân viên quan hệ khách hàng",
								},
							]}
							value=""
							onValueChange={() => {}}
							placeholder="Chọn việc trong dự án…"
						/>
						<FieldError>{CHU.loiVong}</FieldError>
					</Field>
				</DetailSheetSection>
			</DetailSheetBody>
		</DetailSheet>
	);
}

function LichLamViec({ khongQuyen }: { khongQuyen: boolean }) {
	const [nghi, setNghi] = useState<string[]>(["6", "7"]);
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{CHU.lichLamViec}</PageShellTitle>
					<PageShellDescription>{CHU.lichMoTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<div className="flex flex-col gap-4">
					{khongQuyen ? (
						<FieldDescription>{CHU.khongDuQuyen}</FieldDescription>
					) : null}
					<Card>
						<CardHeader>
							<CardTitle>{CHU.nghiTuan}</CardTitle>
							<CardDescription>{CHU.nghiTuanMoTa}</CardDescription>
						</CardHeader>
						<CardContent>
							<ToggleGroup
								type="multiple"
								variant="outline"
								size="sm"
								value={nghi}
								onValueChange={setNghi}
								disabled={khongQuyen}
							>
								{CHU.thu.map((thu, i) => (
									<ToggleGroupItem
										key={thu}
										value={String(i + 1)}
										aria-label={CHU.thuDayDu[i]}
									>
										{thu}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>{CHU.ngayLe}</CardTitle>
							<CardDescription>{CHU.ngayLeMoTa}</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<ItemGroup>
								{NGAY_LE.map((le) => (
									<Item key={le.ngay} variant="outline" size="sm">
										<ItemContent>
											<ItemTitle translate="no">{le.ten}</ItemTitle>
											<ItemDescription className="tabular-nums">
												{le.ngay}
											</ItemDescription>
										</ItemContent>
										<ItemActions>
											<Button
												variant="ghost"
												size="icon"
												aria-label={CHU.xoaNgayLe(le.ten)}
												disabled={khongQuyen}
											>
												<TrashCan aria-hidden="true" />
											</Button>
										</ItemActions>
									</Item>
								))}
							</ItemGroup>
							<div>
								<Button variant="outline" disabled={khongQuyen}>
									{CHU.themNgayLe}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageShellContent>
		</PageShell>
	);
}

export function DuAnGanttMau({ state }: { state: string }) {
	const noiDung =
		state === "ST-khung-viec-lich" ? (
			<KhungViecLich />
		) : state.startsWith("ST-lich-lam-viec") ? (
			<LichLamViec khongQuyen={state === "ST-lich-lam-viec-khong-quyen"} />
		) : (
			<ManViec state={state} />
		);
	return <LocaleProvider locale="vi">{noiDung}</LocaleProvider>;
}
