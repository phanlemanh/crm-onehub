"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import DocumentImport from "@carbon/icons-react/es/DocumentImport";
import Filter from "@carbon/icons-react/es/Filter";
import Information from "@carbon/icons-react/es/Information";
import Notification from "@carbon/icons-react/es/Notification";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { KaraMark } from "@crm/ui/components/kara";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import type { ReactNode } from "react";
import {
	DetailSheet,
	DetailSheetHeader,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	SECTION_TITLE,
} from "@/components/detail-sheet";
import { SheetTitle } from "@/components/responsive-sheet";
import {
	KhungUngDung,
	LoaiMucTieuNhan,
	TenNguoi,
} from "../ban-mau-okr/phan-chung";
import { DONG_HN } from "../gop-y-dung-cho/du-lieu";
import { NHAN_TRANG_THAI, tienDoMucTieu } from "../muc-tieu-va-kr/du-lieu";
import { moTaKr, TienDoKrMau } from "../muc-tieu-va-kr/o-tien-do";

export const STATE = {
	khungKr: "ST-khung-kr",
	khungEn: "ST-khung-tab",
	dienThoai: "ST-khung-dienthoai",
	chip: "ST-danhsach-chip",
	soanTiep: "ST-donvi-soan-tiep",
	soanChuaCauHinh: "ST-donvi-soan-chuacauhinh",
	soanDangTai: "ST-donvi-soan-dangtai",
	hoiLai: "ST-hienthi-hoilai",
} as const;

const LE = "px-5 py-3";

const MT = DONG_HN;
const MOT_KR = { ...DONG_HN, id: "mot-kr", kr: DONG_HN.kr.slice(0, 1) };
const TEN_DAI = "Nguyễn Thị Phương Thảo Hoàng";

const COT_KR: SimpleTableColumn[] = [
	{ id: "ten", header: "KR" },
	{
		id: "phuTrach",
		header: "Phụ trách",
		width: "w-40",
		className: "hidden sm:table-cell",
	},
	{
		id: "tienDo",
		header: "Tiến độ",
		width: "w-52",
		className: "hidden sm:table-cell",
	},
	{ id: "menu", srLabel: "Thao tác", width: "w-12" },
];

type Chu = {
	tabs: [string, string, string, string, string];
	tienDoTu: (x: number, n: number) => string;
	viSao: string;
	tienDo: string;
	tinhTrang: string;
	phuTrach: string;
};

const CHU = {
	vi: {
		tabs: ["KR", "Căn chỉnh", "Vết", "Trao đổi", "Diễn biến"],
		tienDoTu: (x, n) => `Tiến độ mục tiêu ${x}% tính từ ${n} KR.`,
		viSao: "Vì sao lúc này",
		tienDo: "Tiến độ",
		tinhTrang: "Tình trạng",
		phuTrach: "Phụ trách",
	},
	en: {
		tabs: ["KR", "Alignment", "Changes", "Discussion", "History"],
		tienDoTu: (x, n) =>
			`Objective progress ${x}% from ${n} ${n === 1 ? "KR" : "KRs"}.`,
		viSao: "Why now",
		tienDo: "Progress",
		tinhTrang: "Status",
		phuTrach: "Owner",
	},
} satisfies Record<"vi" | "en", Chu>;

function BangKrMau({ mt }: { mt: typeof MT }) {
	return (
		<SimpleTable columns={COT_KR}>
			{mt.kr.map((kr, i) => (
				<SimpleTableRow data-kr={kr.id} key={kr.id}>
					<SimpleTableCell className="whitespace-normal align-top">
						<div className="flex min-w-0 gap-3">
							<span className="w-8 shrink-0 text-muted-foreground text-xs tabular-nums">
								KR{i + 1}
							</span>
							<div className="flex min-w-0 flex-col gap-1">
								<span translate="no">{kr.ten}</span>
								<span className="text-muted-foreground text-xs">
									{moTaKr(kr)}
								</span>
								<div className="pt-1 sm:hidden">
									<TienDoKrMau kr={kr} loai={mt.loai} />
								</div>
							</div>
						</div>
					</SimpleTableCell>
					<SimpleTableCell className="hidden align-top sm:table-cell">
						<TenNguoi ten={kr.phuTrach.ten} />
					</SimpleTableCell>
					<SimpleTableCell className="hidden align-top sm:table-cell">
						<TienDoKrMau kr={kr} loai={mt.loai} />
					</SimpleTableCell>
					<SimpleTableCell>
						<Button aria-label="Thao tác KR" size="icon-sm" variant="ghost">
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</SimpleTableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function ThanKr({ mt, chu }: { mt: typeof MT; chu: Chu }) {
	const tienDoMt = tienDoMucTieu(mt) ?? 0;
	return (
		<>
			<DetailSheetSection title={chu.viSao}>
				<p className="text-pretty text-sm" translate="no">
					{"viSao" in mt ? mt.viSao : ""}
				</p>
			</DetailSheetSection>
			<div className={LE}>
				<KaraMark scope="2 góp ý chờ" />
			</div>
			<div className={LE} data-slot="detail-sheet-table">
				<BangKrMau mt={mt} />
			</div>
			<p className="px-5 text-muted-foreground text-xs" data-tien-do-tu>
				{chu.tienDoTu(tienDoMt, mt.kr.length)}
			</p>
			<div className={LE}>
				<Button size="sm" variant="outline">
					<Icon icon={Add} data-icon="inline-start" />
					Thêm KR
				</Button>
			</div>
		</>
	);
}

function DauKhung({ mt }: { mt: typeof MT }) {
	return (
		<DetailSheetHeader
			actions={
				<>
					<Button aria-label="Theo dõi" size="icon-sm" variant="ghost">
						<Icon icon={Notification} />
					</Button>
					<Button aria-label="Thao tác mục tiêu" size="icon-sm" variant="ghost">
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</>
			}
			description={<span translate="no">{`${mt.donVi} · Quý 4`}</span>}
			media={<EntityLogo name={mt.ten} size="lg" />}
			note={
				<>
					<LoaiMucTieuNhan loai={mt.loai} />
					<Badge variant="outline">{NHAN_TRANG_THAI["cong-bo"]}</Badge>
				</>
			}
			title={<span translate="no">{mt.ten}</span>}
		/>
	);
}

function SoKhung({ chu, mt }: { chu: Chu; mt: typeof MT }) {
	return (
		<DetailSheetStats>
			<DetailSheetStat label={chu.tienDo}>
				<span className="tabular-nums">{tienDoMucTieu(mt) ?? 0}%</span>
				<span className="text-muted-foreground"> · lẽ ra 40%</span>
			</DetailSheetStat>
			<DetailSheetStat label={chu.tinhTrang}>Chậm nhịp</DetailSheetStat>
			<DetailSheetStat label={chu.phuTrach}>
				<TenNguoi ten={mt.phuTrach.ten} />
			</DetailSheetStat>
		</DetailSheetStats>
	);
}

function KhungMayTinh({ mt, chu }: { mt: typeof MT; chu: Chu }) {
	return (
		<DetailSheet onOpenChange={() => undefined} open>
			<DauKhung mt={mt} />
			<SoKhung chu={chu} mt={mt} />
			<Tabs className="flex min-h-0 flex-1 flex-col gap-0" defaultValue="kr">
				<TabsList
					className="w-full shrink-0 justify-start gap-6 border-b px-5"
					variant="line"
				>
					{chu.tabs.map((t, i) => (
						<TabsTrigger key={t} value={i === 0 ? "kr" : `t${i}`}>
							{t}
							{i === 0 ? (
								<span className="text-muted-foreground tabular-nums">
									{mt.kr.length}
								</span>
							) : null}
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent
					className="flex min-h-0 flex-1 flex-col overflow-y-auto"
					value="kr"
				>
					<ThanKr chu={chu} mt={mt} />
				</TabsContent>
			</Tabs>
		</DetailSheet>
	);
}

function KhungDienThoai() {
	const chu = CHU.vi;
	return (
		<DetailSheet onOpenChange={() => undefined} open>
			<div
				className="flex min-h-0 flex-1 flex-col overflow-y-auto"
				data-cuon-ca-khung
			>
				<div className="flex items-start gap-3 border-b px-5 py-3 text-left">
					<EntityLogo name={MT.ten} size="lg" />
					<div className="flex min-w-0 flex-1 flex-col gap-0.5">
						<SheetTitle size="lg" className="wrap-anywhere">
							<span translate="no">{MT.ten}</span>
						</SheetTitle>
						<span className="text-muted-foreground text-sm">
							Kinh doanh · Quý 4
						</span>
						<span className="flex flex-wrap gap-2 pt-0.5">
							<LoaiMucTieuNhan loai={MT.loai} />
							<Badge variant="outline">{NHAN_TRANG_THAI["cong-bo"]}</Badge>
						</span>
					</div>
					<Button aria-label="Thao tác mục tiêu" size="icon-sm" variant="ghost">
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</div>
				<dl className="grid grid-cols-3 divide-x border-b bg-muted/40">
					<div className="flex min-w-0 flex-col gap-1 px-4 py-2.5">
						<dt className="text-muted-foreground text-xs">{chu.tienDo}</dt>
						<dd className="font-medium text-sm">
							<span className="tabular-nums">35%</span>
							<span className="block text-muted-foreground text-xs">
								lẽ ra 40%
							</span>
						</dd>
					</div>
					<div className="flex min-w-0 flex-col gap-1 px-4 py-2.5">
						<dt className="text-muted-foreground text-xs">{chu.tinhTrang}</dt>
						<dd className="font-medium text-sm">Chậm nhịp</dd>
					</div>
					<div className="flex min-w-0 flex-col gap-1 px-4 py-2.5">
						<dt className="text-muted-foreground text-xs">{chu.phuTrach}</dt>
						<dd className="wrap-anywhere font-medium text-sm" translate="no">
							{TEN_DAI}
						</dd>
					</div>
				</dl>
				<Tabs className="flex flex-col gap-0" defaultValue="kr">
					<div className="sticky top-0 z-10 border-b bg-background">
						<TabsList
							className="w-full justify-start gap-5 overflow-x-auto px-5"
							variant="line"
						>
							{chu.tabs.map((t, i) => (
								<TabsTrigger key={t} value={i === 0 ? "kr" : `t${i}`}>
									{t}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					<TabsContent value="kr">
						<ThanKr chu={chu} mt={MT} />
					</TabsContent>
				</Tabs>
			</div>
		</DetailSheet>
	);
}

function ChipKara({ so }: { so: number }) {
	return (
		<Badge asChild variant="outline">
			<button data-chip-gop-y type="button">
				<KaraMark scope={`${so} góp ý`} />
			</button>
		</Badge>
	);
}

function HangMucTieu({ mt, chip }: { mt: typeof MT; chip?: number }) {
	return (
		<SimpleTableRow clickable data-hang-muc-tieu={mt.id} expandable>
			<SimpleTableCell className="w-12 align-top">
				<Button aria-label="Thu gọn" size="icon-sm" variant="ghost">
					<Icon className="rotate-90" icon={ChevronRight} />
				</Button>
			</SimpleTableCell>
			<SimpleTableCell className="whitespace-normal align-top">
				<span className="flex min-w-0 flex-col gap-1">
					<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<span className="wrap-anywhere font-medium" translate="no">
							{mt.ten}
						</span>
						<span
							className="inline-flex shrink-0 items-center gap-2"
							data-nhom-nhan
						>
							<LoaiMucTieuNhan loai={mt.loai} />
							<Badge variant="outline">{NHAN_TRANG_THAI["cong-bo"]}</Badge>
							{chip ? <ChipKara so={chip} /> : null}
						</span>
					</span>
					<span className="text-muted-foreground text-xs">
						{mt.donVi} · {mt.kr.length} KR
					</span>
				</span>
			</SimpleTableCell>
			<SimpleTableCell className="hidden w-48 md:table-cell">
				<TenNguoi ten={mt.phuTrach.ten} />
			</SimpleTableCell>
			<SimpleTableCell className="hidden w-40 md:table-cell">
				<span className="tabular-nums">{tienDoMucTieu(mt) ?? 0}%</span>
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

const COT_MT: SimpleTableColumn[] = [
	{ id: "mo", srLabel: "Mở", width: "w-12" },
	{ id: "ten", header: "Mục tiêu" },
	{ id: "pt", header: "Phụ trách", className: "hidden md:table-cell" },
	{ id: "td", header: "Tiến độ", className: "hidden md:table-cell" },
];

function DanhSachChip() {
	const khac = { ...MT, id: "khac", ten: "Giữ khách cũ quay lại mỗi quý" };
	return (
		<div className="flex flex-col gap-8 p-6">
			<section className="flex flex-col gap-3">
				<h2 className={SECTION_TITLE}>Của tôi</h2>
				<SimpleTable columns={COT_MT} header="sr-only">
					<HangMucTieu chip={2} mt={MT} />
					<HangMucTieu mt={khac} />
				</SimpleTable>
			</section>
			<section className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
				<div className="text-muted-foreground text-sm">Cây đơn vị</div>
				<div className="flex flex-col gap-3">
					<h2 className={SECTION_TITLE}>Theo đơn vị</h2>
					<SimpleTable columns={COT_MT} header="sr-only">
						<HangMucTieu chip={2} mt={MT} />
						<HangMucTieu mt={khac} />
					</SimpleTable>
				</div>
			</section>
		</div>
	);
}

type DangSoan = "tiep" | "chua-cau-hinh" | "dang-tai";

function NhomSoan({ dang }: { dang: DangSoan }) {
	const khoa = dang !== "tiep";
	const chu = dang === "tiep" ? "Tiếp cuộc đang soạn" : "Soạn OKR cùng Trợ lý";
	return (
		<span className="ml-auto inline-flex items-center gap-1" data-nhom-soan>
			<Button disabled={khoa} size="sm" variant="outline">
				{chu}
			</Button>
			{dang === "dang-tai" ? null : (
				<Popover defaultOpen>
					<PopoverTrigger asChild>
						<Button
							aria-label="Thông tin cuộc soạn"
							data-nut="thong-tin-soan"
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={Information} />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end">
						{dang === "tiep" ? (
							<PopoverHeader>
								<PopoverTitle>Cuộc đang soạn</PopoverTitle>
								<PopoverDescription>
									Mở 02/10 · 3 lượt · 2 dòng chưa quyết
								</PopoverDescription>
								<div className="pt-2">
									<Button size="sm" variant="ghost">
										1/3 cuộc
									</Button>
								</div>
							</PopoverHeader>
						) : (
							<PopoverHeader>
								<PopoverTitle>Chưa bật soạn nháp</PopoverTitle>
								<PopoverDescription>
									Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị
									viên OneHub cần bật nó.
								</PopoverDescription>
							</PopoverHeader>
						)}
					</PopoverContent>
				</Popover>
			)}
		</span>
	);
}

function ThanhDonVi({ dang }: { dang: DangSoan }) {
	return (
		<div className="p-6">
			<Card>
				<CardHeader>
					<CardTitle>Kinh doanh miền Bắc</CardTitle>
					<CardDescription>
						Phòng ban · Trưởng Nguyễn Thị Lan · 2 mục tiêu · 5 KR
					</CardDescription>
				</CardHeader>
				<div className="flex flex-wrap items-center gap-2 px-6" data-hang-nut>
					<ViewSwitch
						items={[
							{ value: "danh-sach", label: "Danh sách" },
							{ value: "cay", label: "Cây căn chỉnh" },
							{ value: "hop-tuan", label: "Họp tuần" },
						]}
						label="Cách xem"
						onValueChange={() => undefined}
						value="danh-sach"
					/>
					<Button size="sm" variant="outline">
						<Icon icon={Filter} data-icon="inline-start" />
						Lọc
					</Button>
					<Button size="sm" variant="outline">
						<Icon icon={DocumentImport} data-icon="inline-start" />
						Nhập từ bảng tính
					</Button>
					<Button size="sm">
						<Icon icon={Add} data-icon="inline-start" />
						Thêm mục tiêu
					</Button>
					<NhomSoan dang={dang} />
				</div>
			</Card>
		</div>
	);
}

function HoiLai() {
	return (
		<>
			<KhungMayTinh chu={CHU.vi} mt={MT} />
			<ConfirmDialog
				nut="Bỏ thay đổi"
				pending={false}
				onConfirm={() => undefined}
				onOpenChange={() => undefined}
				open
				than="Bạn đã chọn «Giới hạn» và thêm 1 người xem nhưng chưa lưu. Sang tab Căn chỉnh sẽ bỏ các thay đổi này."
				thoi="Ở lại"
				tieuDe="Bỏ thay đổi?"
				tone="destructive"
			/>
		</>
	);
}

function Lop({ state }: { state: string }): ReactNode {
	switch (state) {
		case STATE.khungEn:
			return <KhungMayTinh chu={CHU.en} mt={MOT_KR} />;
		case STATE.dienThoai:
			return <KhungDienThoai />;
		case STATE.chip:
			return <DanhSachChip />;
		case STATE.soanTiep:
			return <ThanhDonVi dang="tiep" />;
		case STATE.soanChuaCauHinh:
			return <ThanhDonVi dang="chua-cau-hinh" />;
		case STATE.soanDangTai:
			return <ThanhDonVi dang="dang-tai" />;
		case STATE.hoiLai:
			return <HoiLai />;
		default:
			return <KhungMayTinh chu={CHU.vi} mt={MT} />;
	}
}

export function KhungOkrTruocR1Mau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<KhungUngDung key={state} trang="theo-don-vi" vai="day-du">
				<Lop state={state} />
			</KhungUngDung>
		</LocaleProvider>
	);
}
