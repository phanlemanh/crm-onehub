"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { Combobox } from "@crm/ui/components/combobox";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
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
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
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
	DetailSheetTabs,
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
	DONG_SU_KIEN,
	LICH_SU,
	NGHIA_TRANG_THAI,
	NGUOI_CHON,
	NHAN_TRANG_THAI,
	SO_DA_HUY,
	SO_DA_XONG,
	TOI,
	type TrangThaiViec,
	VIEC_DANG_LAM,
	VIEC_DANG_THEO_DOI,
	VIEC_GIAO_CHO_TOI,
	VIEC_QUA_HAN,
	VIEC_TOI_GIAO,
	type ViecMau,
} from "./du-lieu";

type Nhom = "giao-cho-toi" | "toi-giao" | "dang-theo-doi";

const VIEC_THEO_NHOM: Record<Nhom, ViecMau[]> = {
	"giao-cho-toi": VIEC_GIAO_CHO_TOI,
	"toi-giao": VIEC_TOI_GIAO,
	"dang-theo-doi": VIEC_DANG_THEO_DOI,
};

function TrangThai({ viec }: { viec: Pick<ViecMau, "trangThai"> }) {
	if (viec.trangThai === "huy") {
		return (
			<span className="text-muted-foreground text-sm">
				{NHAN_TRANG_THAI.huy}
			</span>
		);
	}
	return (
		<StatusIndicator
			tone={toneTheoNghia(NGHIA_TRANG_THAI[viec.trangThai])}
			label={NHAN_TRANG_THAI[viec.trangThai]}
		/>
	);
}

function Han({ viec }: { viec: Pick<ViecMau, "han" | "quaHan"> }) {
	if (viec.quaHan && viec.han) {
		return <StatusIndicator tone={toneTheoNghia("hong")} label={viec.han} />;
	}
	return <span className="text-muted-foreground">{viec.han ?? "—"}</span>;
}

function tenNguoi(ten: string) {
	return ten === TOI ? CHU.toi : ten;
}

function ChipNhom({
	nhom,
	onNhom,
}: {
	nhom: Nhom;
	onNhom: (nhom: Nhom) => void;
}) {
	const muc: { value: Nhom; nhan: string }[] = [
		{ value: "giao-cho-toi", nhan: CHU.nhomGiaoChoToi },
		{ value: "toi-giao", nhan: CHU.nhomToiGiao },
		{ value: "dang-theo-doi", nhan: CHU.nhomTheoDoi },
	];
	return (
		<div className="max-w-full overflow-x-auto">
			<ToggleGroup
				type="single"
				variant="outline"
				size="sm"
				value={nhom}
				onValueChange={(v) => v && onNhom(v as Nhom)}
			>
				{muc.map((m) => (
					<ToggleGroupItem key={m.value} value={m.value}>
						{m.nhan}
						<span className="text-muted-foreground tabular-nums">
							{VIEC_THEO_NHOM[m.value].length}
						</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

const COT: SimpleTableColumn[] = [
	{ id: "viec", header: CHU.cotViec },
	{ id: "trang-thai", header: CHU.cotTrangThai, width: "w-40" },
	{ id: "han", header: CHU.cotHan, width: "w-32" },
	{ id: "gan", header: CHU.cotGan, className: "hidden lg:table-cell" },
	{ id: "nguoi", header: CHU.cotNguoiGiao, width: "w-40" },
];

function BangViec({ ds }: { ds: ViecMau[] }) {
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable columns={COT} surface="page">
					{ds.map((v) => (
						<SimpleTableRow key={v.id} clickable data-viec={v.id}>
							<TableCell className="max-w-0 truncate font-medium">
								<span translate="no">{v.tieuDe}</span>
							</TableCell>
							<TableCell>
								<TrangThai viec={v} />
							</TableCell>
							<TableCell>
								<Han viec={v} />
							</TableCell>
							<TableCell className="hidden max-w-0 truncate text-muted-foreground lg:table-cell">
								<span translate="no">{v.banGhi ?? CHU.khongGan}</span>
							</TableCell>
							<TableCell className="truncate text-muted-foreground">
								<span translate="no">{tenNguoi(v.nguoiGiao)}</span>
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="gap-2 md:hidden">
				{ds.map((v) => (
					<Item key={v.id} variant="outline" data-viec={v.id} asChild>
						<button type="button">
							<ItemContent>
								<ItemTitle translate="no">{v.tieuDe}</ItemTitle>
								<ItemDescription>
									<TrangThai viec={v} />
									<span className="mx-2">·</span>
									<Han viec={v} />
								</ItemDescription>
							</ItemContent>
						</button>
					</Item>
				))}
			</ItemGroup>
		</>
	);
}

function DongGap({ nhan }: { nhan: string }) {
	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Button variant="ghost" size="sm">
					{nhan}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent />
		</Collapsible>
	);
}

function KhungTrang({ children }: { children: React.ReactNode }) {
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
			<PageShellContent>{children}</PageShellContent>
		</PageShell>
	);
}

function ViecCuaToi({ state }: { state: string }) {
	const [nhom, datNhom] = useState<Nhom>("giao-cho-toi");

	if (state === "ST-viec-cua-toi-cho-tai") {
		return (
			<KhungTrang>
				<div className="flex flex-col gap-3" aria-busy="true">
					<Skeleton className="h-8 w-80" />
					{[0, 1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-10 w-full" />
					))}
				</div>
			</KhungTrang>
		);
	}
	if (state === "ST-viec-cua-toi-loi") {
		return (
			<KhungTrang>
				<VungTaiLoi
					tieuDe={CHU.loiTieuDe}
					moTa={CHU.loiMoTa}
					onThuLai={() => {}}
				/>
			</KhungTrang>
		);
	}
	if (state === "ST-viec-cua-toi-rong") {
		return (
			<KhungTrang>
				<Empty border="solid">
					<EmptyHeader>
						<EmptyTitle>{CHU.rongTieuDe}</EmptyTitle>
						<EmptyDescription>{CHU.rongMoTa}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="outline">{CHU.giaoViec}</Button>
					</EmptyContent>
				</Empty>
			</KhungTrang>
		);
	}

	return (
		<KhungTrang>
			<div className="flex flex-col gap-4">
				<ChipNhom nhom={nhom} onNhom={datNhom} />
				<BangViec ds={VIEC_THEO_NHOM[nhom]} />
				<div className="flex flex-wrap gap-2">
					<DongGap nhan={CHU.daXong(SO_DA_XONG)} />
					<DongGap nhan={CHU.daHuy(SO_DA_HUY)} />
				</div>
			</div>
		</KhungTrang>
	);
}

type CaKhung = {
	trangThai: TrangThaiViec;
	nut: string[];
	chiXem: boolean;
	tab: "chi-tiet" | "lich-su";
};

function caKhung(state: string): CaKhung {
	switch (state) {
		case "ST-khung-viec-nguoi-giao-cho-danh-gia":
			return {
				trangThai: "cho-danh-gia",
				nut: [CHU.xong, CHU.lamLai, CHU.huy],
				chiXem: false,
				tab: "chi-tiet",
			};
		case "ST-khung-viec-chi-xem":
			return { trangThai: "dang-lam", nut: [], chiXem: true, tab: "chi-tiet" };
		case "ST-khung-viec-lich-su":
			return {
				trangThai: "dang-lam",
				nut: [CHU.guiDanhGia, CHU.xong],
				chiXem: false,
				tab: "lich-su",
			};
		case "ST-khung-viec-da-khep":
			return {
				trangThai: "xong",
				nut: [CHU.lamLai],
				chiXem: false,
				tab: "chi-tiet",
			};
		default:
			return {
				trangThai: "dang-lam",
				nut: [CHU.guiDanhGia, CHU.xong],
				chiXem: false,
				tab: "chi-tiet",
			};
	}
}

function KhungViec({ state }: { state: string }) {
	const ca = caKhung(state);
	const [tab, datTab] = useState<string>(ca.tab);
	const viec = VIEC_DANG_LAM;
	const daKhep = ca.trangThai === "xong" || ca.trangThai === "huy";

	const chiTiet = (
		<DetailSheetBody>
			<DetailSheetSection title={CHU.tabChiTiet}>
				<DetailSheetProperties>
					<DetailSheetProperty label={CHU.cotTrangThai}>
						<TrangThai viec={{ trangThai: ca.trangThai }} />
					</DetailSheetProperty>
					<DetailSheetProperty label={CHU.han}>{viec.han}</DetailSheetProperty>
					<DetailSheetProperty label={CHU.nguoiGiao}>
						<span translate="no">{viec.nguoiGiao}</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={CHU.nguoiThucHien}>
						<span translate="no">{viec.nguoiThucHien}</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={CHU.nguoiTheoDoi}>
						<span translate="no">Nguyễn Hải Yến</span>
					</DetailSheetProperty>
					<DetailSheetProperty label={CHU.ganVoi}>
						<Badge variant="outline">
							<span translate="no">{viec.banGhi}</span>
						</Badge>
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
			{ca.chiXem ? (
				<DetailSheetSection>
					<p className="text-muted-foreground text-sm">{CHU.chiXem}</p>
				</DetailSheetSection>
			) : null}
		</DetailSheetBody>
	);

	const lichSu = (
		<DetailSheetBody>
			<DetailSheetSection>
				<ItemGroup className="gap-1">
					{LICH_SU.map((vet) => (
						<Item key={`${vet.luc}-${vet.lam}`} size="sm">
							<ItemContent>
								<ItemTitle>
									<span>
										<span translate="no">{vet.ai}</span> {vet.lam}
									</span>
								</ItemTitle>
								<ItemDescription>
									{vet.luc} · {vet.nguon}
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</DetailSheetSection>
		</DetailSheetBody>
	);

	return (
		<DetailSheet open onOpenChange={() => {}}>
			<DetailSheetHeader
				title={<span translate="no">{viec.tieuDe}</span>}
				description={daKhep ? NHAN_TRANG_THAI[ca.trangThai] : viec.banGhi}
				actions={
					ca.nut.length > 0 ? (
						<div className="flex gap-2">
							{ca.nut.map((n) => (
								<Button
									key={n}
									size="sm"
									variant={n === CHU.xong && !daKhep ? "default" : "outline"}
								>
									{n}
								</Button>
							))}
						</div>
					) : undefined
				}
			/>
			<DetailSheetTabs
				value={tab}
				onValueChange={datTab}
				tabs={[
					{ value: "chi-tiet", label: CHU.tabChiTiet, content: chiTiet },
					{
						value: "lich-su",
						label: CHU.tabLichSu,
						count: LICH_SU.length,
						content: lichSu,
					},
				]}
			/>
		</DetailSheet>
	);
}

function KhoiViec() {
	const mo = VIEC_GIAO_CHO_TOI.slice(0, 3);
	return (
		<section className="flex flex-col gap-2" data-khoi-viec="">
			<SectionHeading actions={<Badge variant="secondary">{mo.length}</Badge>}>
				{CHU.khoiViec}
			</SectionHeading>
			<ItemGroup className="gap-1">
				{mo.map((v) => (
					<Item key={v.id} variant="outline" size="sm" asChild>
						<button type="button">
							<ItemContent>
								<ItemTitle translate="no">{v.tieuDe}</ItemTitle>
								<ItemDescription>
									<TrangThai viec={v} />
									<span className="mx-2">·</span>
									<Han viec={v} />
									<span className="mx-2">·</span>
									<span translate="no">{tenNguoi(v.nguoiThucHien)}</span>
								</ItemDescription>
							</ItemContent>
						</button>
					</Item>
				))}
			</ItemGroup>
			<div className="flex gap-2">
				<DongGap nhan={CHU.daXong(SO_DA_XONG)} />
				<DongGap nhan={CHU.daHuy(0)} />
			</div>
		</section>
	);
}

function DongSuKien() {
	return (
		<ItemGroup className="gap-1">
			{DONG_SU_KIEN.map((s) => (
				<Item key={s.id} size="sm">
					<ItemContent>
						<ItemTitle>{s.loai}</ItemTitle>
						<ItemDescription translate="no">{s.chu}</ItemDescription>
					</ItemContent>
					<span className="text-muted-foreground text-xs">{s.luc}</span>
				</Item>
			))}
		</ItemGroup>
	);
}

function OSoan({ loi }: { loi: boolean }) {
	const [nguoi, datNguoi] = useState("khoa");
	const [han, datHan] = useState<string | null>("2026-10-14");
	return (
		<div className="flex flex-col gap-3 rounded-lg border p-3" data-o-soan="">
			<ToggleGroup type="single" variant="outline" size="sm" value="viec">
				<ToggleGroupItem value="ghi-chu">{CHU.loaiGhiChu}</ToggleGroupItem>
				<ToggleGroupItem value="viec">{CHU.loaiViec}</ToggleGroupItem>
			</ToggleGroup>
			<Input
				aria-label={CHU.cotViec}
				defaultValue="Gửi bảng phí mới cho anh Tuấn"
				placeholder={CHU.tieuDeViec}
				autoComplete="off"
			/>
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
					<DatePicker value={han} onChange={datHan} placeholder={CHU.chonHan} />
				</Field>
			</div>
			<div className="flex flex-col items-end gap-1">
				<Button>{CHU.giaoViec}</Button>
				{loi ? <FieldError>{CHU.loiTao}</FieldError> : null}
			</div>
		</div>
	);
}

function TheHoatDong({ state }: { state: string }) {
	const tron = state === "ST-khoi-viec-phuong-an-tron";
	const coKhoi =
		state === "ST-khoi-viec-ban-ghi" ||
		state === "ST-o-soan-viec" ||
		state === "ST-o-soan-viec-loi";
	const coOSoan = state === "ST-o-soan-viec" || state === "ST-o-soan-viec-loi";
	const [tab, datTab] = useState("hoat-dong");

	const noiDung = (
		<DetailSheetBody>
			<DetailSheetSection>
				<div className="flex flex-col gap-4">
					{tron ? (
						<p
							className="rounded-lg border border-dashed p-3 text-muted-foreground text-sm"
							data-ghim-khuyen=""
						>
							{CHU.phuongAnTron}. {CHU.mayKhuyen}
						</p>
					) : null}
					{coOSoan ? <OSoan loi={state === "ST-o-soan-viec-loi"} /> : null}
					{coKhoi ? <KhoiViec /> : null}
					{tron ? (
						<ItemGroup className="gap-1">
							<Item size="sm" variant="outline">
								<ItemContent>
									<ItemTitle>{CHU.loaiViec}</ItemTitle>
									<ItemDescription translate="no">
										{VIEC_DANG_LAM.tieuDe}
									</ItemDescription>
								</ItemContent>
							</Item>
						</ItemGroup>
					) : null}
					<DongSuKien />
					{tron ? (
						<Item size="sm" variant="outline">
							<ItemContent>
								<ItemTitle>{CHU.loaiViec}</ItemTitle>
								<ItemDescription translate="no">
									{VIEC_QUA_HAN.tieuDe}
								</ItemDescription>
							</ItemContent>
							<span className="text-muted-foreground text-xs">06/10</span>
						</Item>
					) : null}
				</div>
			</DetailSheetSection>
		</DetailSheetBody>
	);

	return (
		<DetailSheet open onOpenChange={() => {}}>
			<DetailSheetHeader
				title={<span translate="no">Thoả thuận An Phát · gói đại lý</span>}
				description={<span translate="no">Công ty An Phát</span>}
			/>
			<DetailSheetTabs
				value={tab}
				onValueChange={datTab}
				tabs={[
					{ value: "tong-quan", label: "Tổng quan", content: null },
					{ value: "hoat-dong", label: "Hoạt động", content: noiDung },
				]}
			/>
		</DetailSheet>
	);
}

export function ViecChungMau({ state }: { state: string }) {
	let noiDung: React.ReactNode;
	if (state.startsWith("ST-viec-cua-toi"))
		noiDung = <ViecCuaToi state={state} />;
	else if (state.startsWith("ST-khung-viec"))
		noiDung = <KhungViec state={state} />;
	else noiDung = <TheHoatDong state={state} />;
	return <LocaleProvider locale="vi">{noiDung}</LocaleProvider>;
}
