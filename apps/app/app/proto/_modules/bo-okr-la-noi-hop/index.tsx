"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import Presentation from "@carbon/icons-react/es/PresentationFile";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { StatGroup } from "@crm/ui/components/dashboard";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
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
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatCard } from "@crm/ui/components/stat-card";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	BO,
	CHUA_CAP_NHAT,
	DANG_BAN,
	type KrMau,
	type LanCapNhat,
	type LyDo,
	MOI_KR,
	MUC_TIEU,
} from "./du-lieu";

const DUONG = "/proto/bo-okr-la-noi-hop";

const ST = {
	theOkr: "ST-bln-the-okr",
	dangBan: "ST-bln-dang-ban",
	chuaCapNhat: "ST-bln-chua-cap-nhat",
	nganKr: "ST-bln-ngan-kr",
	daGui: "ST-bln-ngan-kr-da-gui",
	cuaToi: "ST-bln-cua-toi",
	huongB: "ST-bln-huong-b",
} as const;

const den = (state: string) => `${DUONG}?state=${state}`;

type Loc = "tat-ca" | "dang-ban" | "chua-cap-nhat";

const DICH_LOC: Record<Loc, string> = {
	"tat-ca": ST.theOkr,
	"dang-ban": ST.dangBan,
	"chua-cap-nhat": ST.chuaCapNhat,
};

function ThanhBen({ mucMo }: { mucMo: "cua-toi" | "bo-okr" }) {
	return (
		<AreaSidebar
			header={
				<Button className="justify-between" size="sm" variant="outline">
					{BO.chuKy}
					<Icon icon={ChevronDown} data-icon="inline-end" />
				</Button>
			}
			label="Mục tiêu"
		>
			<AreaSidebarGroup>
				<AreaSidebarItem active={mucMo === "cua-toi"} asChild>
					<Link href={den(ST.cuaToi)}>Của tôi</Link>
				</AreaSidebarItem>
			</AreaSidebarGroup>
			<AreaSidebarGroup label="OKR">
				<AreaSidebarItem active={mucMo === "bo-okr"} asChild>
					<Link href={den(ST.theOkr)}>Bộ OKR</Link>
				</AreaSidebarItem>
				<AreaSidebarItem disabled>Lấy ý kiến</AreaSidebarItem>
			</AreaSidebarGroup>
			<AreaSidebarGroup label="Báo cáo">
				{["Sức khoẻ", "Mọi KR", "Sơ đồ"].map((nhan) => (
					<AreaSidebarItem disabled key={nhan}>
						{nhan}
					</AreaSidebarItem>
				))}
			</AreaSidebarGroup>
		</AreaSidebar>
	);
}

function TheCon({ coHopTuan }: { coHopTuan: boolean }) {
	const the = coHopTuan
		? (["OKR", "Họp tuần", "Việc", "Sơ đồ góp vào"] as const)
		: (["OKR", "Việc", "Sơ đồ góp vào"] as const);
	const dangMo = coHopTuan ? "Họp tuần" : "OKR";
	return (
		<Tabs value={dangMo}>
			<TabsList variant="line">
				{the.map((t) =>
					t === "OKR" || t === "Họp tuần" ? (
						<TabsTrigger asChild key={t} value={t}>
							<Link
								aria-current={t === dangMo ? "page" : undefined}
								href={den(t === "OKR" ? ST.theOkr : ST.huongB)}
							>
								{t}
							</Link>
						</TabsTrigger>
					) : (
						<TabsTrigger disabled key={t} value={t}>
							{t}
						</TabsTrigger>
					),
				)}
			</TabsList>
		</Tabs>
	);
}

function HangSo() {
	return (
		<StatGroup data-hang-so-bo>
			<StatCard
				description={`Tuần ${BO.tuan}`}
				label="Đã cập nhật"
				value={`${MOI_KR.length - CHUA_CAP_NHAT.length}/${MOI_KR.length}`}
			/>
			<StatCard
				description="tự tin tụt, KR im, ghi chú mới"
				label="Đáng bàn"
				value={String(DANG_BAN.length)}
			/>
			<StatCard
				description="theo lần cập nhật mới nhất"
				label="Tự tin thấp"
				value={String(MOI_KR.filter((k) => k.tuTin === "thap").length)}
			/>
			<StatCard
				description={`Kết thúc ${BO.ketThuc}`}
				label="Ngày còn lại"
				value={BO.ngayConLai}
			/>
		</StatGroup>
	);
}

function NhanLyDo({ lyDo }: { lyDo: LyDo }) {
	switch (lyDo.loai) {
		case "tut":
			return (
				<StatusIndicator
					label={`Tụt từ ${lyDo.tu} xuống ${lyDo.den}`}
					size="sm"
					tone="error"
				/>
			);
		case "im":
			return (
				<StatusIndicator
					label={`Im ${lyDo.soNgay} ngày`}
					size="sm"
					tone="warning"
				/>
			);
		case "ghi-chu":
			return <StatusIndicator label="Ghi chú mới" size="sm" tone="info" />;
	}
}

function TienDo({ kr }: { kr: KrMau }) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="flex items-center gap-3">
				<Progress value={kr.tienDo} />
				<span className="w-9 shrink-0 text-right text-xs tabular-nums">
					{kr.tienDo}%
				</span>
			</span>
			<span className="text-muted-foreground text-xs tabular-nums">
				{kr.so}
				{kr.doi ? ` · ${kr.doi} so với tuần trước` : " · chưa đổi"}
			</span>
		</div>
	);
}

const COT: SimpleTableColumn[] = [
	{ id: "kr", header: "Mục tiêu và KR" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-[22%]",
		className: "hidden md:table-cell",
	},
	{
		id: "tu-tin",
		header: "Tự tin",
		width: "w-[11%]",
		className: "hidden md:table-cell",
	},
	{
		id: "ghi-chu",
		header: "Ghi chú mới nhất",
		width: "w-[26%]",
		className: "hidden lg:table-cell",
	},
];

function DongKr({ kr }: { kr: KrMau }) {
	return (
		<SimpleTableRow data-kr={kr.id}>
			<TableCell className="px-3 py-3 align-top whitespace-normal">
				<span className="flex gap-3 ps-4">
					<span className="flex min-w-0 flex-1 flex-col gap-1.5">
						<Link
							className="text-start text-sm underline-offset-2 hover:underline"
							href={den(ST.nganKr)}
							translate="no"
						>
							{kr.tieuDe}
						</Link>
						<span className="text-muted-foreground text-xs">
							Phụ trách {kr.chuTen}
							{kr.tuanNay ? "" : " · chưa cập nhật tuần này"}
						</span>
						{kr.lyDo.length > 0 ? (
							<span className="flex flex-wrap gap-x-4 gap-y-1">
								{kr.lyDo.map((l) => (
									<NhanLyDo key={l.loai} lyDo={l} />
								))}
							</span>
						) : null}
						<span className="flex flex-col gap-1.5 md:hidden">
							<TienDo kr={kr} />
							{kr.tuTin ? (
								<ConfidenceIndicator level={kr.tuTin} size="sm" />
							) : null}
						</span>
						{kr.ghiChu ? (
							<span className="text-sm lg:hidden" translate="no">
								«{kr.ghiChu}»
							</span>
						) : null}
					</span>
					<Button
						asChild
						className="self-start"
						data-nut="cap-nhat-dong-kr"
						size="sm"
						variant="outline"
					>
						<Link href={den(ST.nganKr)}>Cập nhật</Link>
					</Button>
				</span>
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top md:table-cell">
				<TienDo kr={kr} />
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top md:table-cell">
				{kr.tuTin ? <ConfidenceIndicator level={kr.tuTin} size="sm" /> : null}
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top text-sm whitespace-normal lg:table-cell">
				{kr.ghiChu ? (
					<span translate="no">«{kr.ghiChu}»</span>
				) : (
					<span className="text-muted-foreground">—</span>
				)}
			</TableCell>
		</SimpleTableRow>
	);
}

function Bang({ loc }: { loc: Loc }) {
	const giu = (kr: KrMau) =>
		loc === "tat-ca"
			? true
			: loc === "dang-ban"
				? kr.lyDo.length > 0
				: !kr.tuanNay;
	if (loc === "dang-ban")
		return (
			<SimpleTable columns={COT} surface="page">
				{DANG_BAN.map((kr) => (
					<DongKr key={kr.id} kr={kr} />
				))}
			</SimpleTable>
		);
	return (
		<SimpleTable columns={COT} surface="page">
			{MUC_TIEU.flatMap((mt) => {
				const kr = mt.kr.filter(giu);
				if (kr.length === 0) return [];
				return [
					<SimpleTableRow key={mt.id}>
						<TableCell
							className="px-3 py-3 font-medium whitespace-normal"
							colSpan={4}
						>
							<span translate="no">{mt.ten}</span>
							<span className="ps-2 font-normal text-muted-foreground text-xs tabular-nums">
								{mt.tienDo}%
							</span>
						</TableCell>
					</SimpleTableRow>,
					...kr.map((k) => <DongKr key={k.id} kr={k} />),
				];
			})}
		</SimpleTable>
	);
}

function HangCongCu({ loc }: { loc: Loc }) {
	const router = useRouter();
	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<ToggleGroup
				onValueChange={(v) => (v ? router.push(den(DICH_LOC[v as Loc])) : null)}
				size="sm"
				type="single"
				value={loc}
				variant="outline"
			>
				<ToggleGroupItem value="tat-ca">
					Tất cả{" "}
					<span className="text-muted-foreground tabular-nums">
						{MOI_KR.length}
					</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="dang-ban">
					Đáng bàn{" "}
					<span className="text-muted-foreground tabular-nums">
						{DANG_BAN.length}
					</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="chua-cap-nhat">
					Chưa cập nhật{" "}
					<span className="text-muted-foreground tabular-nums">
						{CHUA_CAP_NHAT.length}
					</span>
				</ToggleGroupItem>
			</ToggleGroup>
			<Button disabled size="sm" variant="outline">
				<Icon icon={Presentation} data-icon="inline-start" />
				Trình chiếu
			</Button>
		</div>
	);
}

function GhimKhuyen() {
	return (
		<Alert data-ghim-khuyen="">
			<AlertTitle>Máy khuyên hướng A — bộ OKR là nơi họp</AlertTitle>
			<AlertDescription>
				<p>
					Hướng A (đang xem): bỏ thẻ con «Họp tuần». Thẻ OKR có hàng số của
					tuần, mỗi KR hiện tự tin, mức đổi và ghi chú mới nhất; chip «Đáng bàn»
					xếp KR như bảng họp. Cập nhật ngay trong ngăn KR. Như Tability: họp
					trên chính plan.
				</p>
				<p>
					Hướng B: giữ thẻ «Họp tuần» nhưng nó chỉ là thẻ OKR đã bật sẵn chip
					«Đáng bàn» — cùng dòng, cùng cách cập nhật.{" "}
					<Link className="underline" href={den(ST.huongB)}>
						Xem hướng B
					</Link>
				</p>
			</AlertDescription>
		</Alert>
	);
}

function TheOkr({ loc, ghim }: { loc: Loc; ghim: boolean }) {
	return (
		<div className="flex flex-col gap-4" data-trang-thai={DICH_LOC[loc]}>
			{ghim ? <GhimKhuyen /> : null}
			<HangSo />
			<HangCongCu loc={loc} />
			{loc === "dang-ban" ? (
				<p className="text-muted-foreground text-xs">
					Xếp theo: tự tin tụt, rồi KR im lâu nhất, rồi ghi chú mới — đi lần
					lượt trong buổi họp tuần.
				</p>
			) : null}
			<Bang loc={loc} />
		</div>
	);
}

const KR_MO = MOI_KR[0];

const GOI_Y = [
	"Điều ghi lần trước đã xong chưa?",
	"Đang vướng gì, cần ai giúp?",
	"Tuần tới làm gì?",
];

function LichSu({ lan }: { lan: LanCapNhat[] }) {
	return (
		<div className="flex flex-col gap-2">
			<p className="font-medium text-sm">Các lần cập nhật</p>
			<ItemGroup className="gap-2">
				{lan.map((l) => (
					<Item key={l.ngay} variant="outline">
						<ItemContent>
							<ItemTitle>
								{l.so} · {l.ngay}
							</ItemTitle>
							<ItemDescription className="line-clamp-none">
								<span translate="no">{l.ghiChu}</span>
							</ItemDescription>
						</ItemContent>
						<ConfidenceIndicator level={l.tuTin} size="sm" />
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}

function FormTaiCho() {
	const truoc = KR_MO.lichSu[0];
	return (
		<Card data-cap-nhat-tai-cho="">
			<CardHeader>
				<CardTitle>Cập nhật tuần {BO.tuan}</CardTitle>
				<CardDescription>
					Lần trước {truoc.ngay}: {truoc.so} · tự tin thấp ·{" "}
					<span translate="no">«{truoc.ghiChu}»</span>
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor="bln-gia-tri">Giá trị</FieldLabel>
						<Input defaultValue="4" id="bln-gia-tri" inputMode="decimal" />
						<FieldDescription>Đích {KR_MO.dich}</FieldDescription>
					</Field>
					<Field>
						<FieldLabel>Mức tự tin</FieldLabel>
						<ToggleGroup size="sm" type="single" variant="outline">
							<ToggleGroupItem value="cao">Cao</ToggleGroupItem>
							<ToggleGroupItem value="vua">Vừa</ToggleGroupItem>
							<ToggleGroupItem value="thap">Thấp</ToggleGroupItem>
						</ToggleGroup>
					</Field>
				</div>
				<Field>
					<FieldLabel htmlFor="bln-ghi-chu">Ghi chú</FieldLabel>
					<Input
						id="bln-ghi-chu"
						maxLength={200}
						placeholder="Một dòng: điều gì đổi, cần ai giúp"
					/>
					<FieldDescription>{GOI_Y.join(" · ")}</FieldDescription>
				</Field>
			</CardContent>
			<CardFooter className="justify-end">
				<Button asChild size="sm">
					<Link href={den(ST.daGui)}>Gửi cập nhật</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}

function DaGuiTaiCho() {
	return (
		<Item data-da-cap-nhat="" variant="muted">
			<ItemContent>
				<ItemTitle>Đã cập nhật tuần {BO.tuan}</ItemTitle>
				<ItemDescription>5 hợp đồng · tự tin vừa · vừa xong</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button asChild size="sm" variant="outline">
					<Link href={den(ST.nganKr)}>Sửa</Link>
				</Button>
			</ItemActions>
		</Item>
	);
}

function NganKr({ daGui }: { daGui: boolean }) {
	const router = useRouter();
	const lan: LanCapNhat[] = daGui
		? [
				{
					ngay: "24/10, 09:12",
					so: "5 hợp đồng",
					tuTin: "vua",
					ghiChu: "Ký được một trong hai đối tác lớn, mẫu mới đã duyệt",
				},
				...KR_MO.lichSu,
			]
		: KR_MO.lichSu;
	return (
		<Sheet
			open
			onOpenChange={(mo) => (mo ? null : router.push(den(ST.theOkr)))}
		>
			<SheetContent data-ngan-kr="" side="right">
				<SheetHeader>
					<SheetDescription translate="no">{MUC_TIEU[0].ten}</SheetDescription>
					<SheetTitle translate="no">{KR_MO.tieuDe}</SheetTitle>
					<div className="flex items-center gap-1 pt-1 text-muted-foreground text-xs tabular-nums">
						1/{MOI_KR.length}
						<Button aria-label="KR trước" disabled size="icon" variant="ghost">
							<Icon icon={ChevronLeft} />
						</Button>
						<Button aria-label="KR kế" size="icon" variant="ghost">
							<Icon icon={ChevronRight} />
						</Button>
						<span className="ps-2">đi theo thứ tự đang xem trên bảng</span>
					</div>
				</SheetHeader>
				<SheetBody className="flex flex-col gap-6">
					<div className="flex flex-col gap-2">
						<div className="flex items-baseline justify-between">
							<span className="font-medium text-2xl tabular-nums">
								{daGui ? "5 hợp đồng" : KR_MO.so}
							</span>
							<span className="text-muted-foreground text-xs">
								đích {KR_MO.dich} · lẽ ra đã tới 42%
							</span>
						</div>
						<Progress value={daGui ? 42 : KR_MO.tienDo} />
					</div>
					{daGui ? <DaGuiTaiCho /> : <FormTaiCho />}
					<LichSu lan={lan} />
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

function CuaToi() {
	return (
		<div className="flex flex-col gap-3" data-trang-thai={ST.cuaToi}>
			<p className="font-medium text-sm">Cần cập nhật tuần này</p>
			<p className="text-muted-foreground text-xs">
				{CHUA_CAP_NHAT.length} KR bạn phụ trách chưa có số tuần {BO.tuan}. Bấm
				một KR để mở nó trong bộ OKR rồi cập nhật ngay trong ngăn.
			</p>
			<ItemGroup className="gap-2">
				{CHUA_CAP_NHAT.map((kr) => (
					<Item asChild key={kr.id} variant="outline">
						<Link href={den(ST.nganKr)}>
							<ItemContent>
								<ItemTitle translate="no">{kr.tieuDe}</ItemTitle>
								<ItemDescription>
									<span translate="no">{BO.ten}</span> · {kr.so} · đích{" "}
									{kr.dich}
								</ItemDescription>
							</ItemContent>
						</Link>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}

type Canh = {
	tieuDe: string;
	moTa: string;
	trangBo: boolean;
	coHopTuan?: boolean;
	than: ReactNode;
};

function canhCua(state: string): Canh {
	const bo = (than: ReactNode, coHopTuan = false): Canh => ({
		tieuDe: BO.ten,
		moTa: "Mục tiêu và KR của đơn vị trong chu kỳ đang xem.",
		trangBo: true,
		coHopTuan,
		than,
	});
	switch (state) {
		case ST.dangBan:
			return bo(<TheOkr ghim={false} loc="dang-ban" />);
		case ST.chuaCapNhat:
			return bo(<TheOkr ghim={false} loc="chua-cap-nhat" />);
		case ST.nganKr:
			return bo(
				<>
					<TheOkr ghim={false} loc="tat-ca" />
					<NganKr daGui={false} />
				</>,
			);
		case ST.daGui:
			return bo(
				<>
					<TheOkr ghim={false} loc="tat-ca" />
					<NganKr daGui />
				</>,
			);
		case ST.huongB:
			return bo(
				<div className="flex flex-col gap-4" data-trang-thai={ST.huongB}>
					<Alert>
						<AlertTitle>Hướng B — giữ thẻ «Họp tuần»</AlertTitle>
						<AlertDescription>
							Thẻ «Họp tuần» là đúng thẻ OKR với chip «Đáng bàn» bật sẵn: cùng
							dòng, cùng hàng số, cùng cách cập nhật. Được: người quen tìm «Họp
							tuần» thấy ngay. Mất: hai thẻ cho một bảng.{" "}
							<Link className="underline" href={den(ST.theOkr)}>
								Về hướng A
							</Link>
						</AlertDescription>
					</Alert>
					<TheOkr ghim={false} loc="dang-ban" />
				</div>,
				true,
			);
		case ST.cuaToi:
			return {
				tieuDe: "Của tôi",
				moTa: "Việc của bạn trong chu kỳ đang xem.",
				trangBo: false,
				than: <CuaToi />,
			};
		default:
			return bo(<TheOkr ghim loc="tat-ca" />);
	}
}

export function BoOkrLaNoiHopMau({ state }: { state: string }) {
	const canh = canhCua(state);
	return (
		<LocaleProvider locale="vi">
			<div className="flex min-h-svh flex-col md:flex-row">
				<ThanhBen mucMo={canh.trangBo ? "bo-okr" : "cua-toi"} />
				<PageShell>
					<PageShellHeader>
						<PageShellHeading>
							<PageShellTitle translate="no">{canh.tieuDe}</PageShellTitle>
							<PageShellDescription>{canh.moTa}</PageShellDescription>
						</PageShellHeading>
					</PageShellHeader>
					<PageShellContent className="flex flex-col gap-6">
						{canh.trangBo ? (
							<div className="flex flex-col gap-3 pb-1">
								<Breadcrumb>
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink asChild>
												<Link href={den(ST.theOkr)}>Bộ OKR</Link>
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbPage translate="no">{BO.ten}</BreadcrumbPage>
										</BreadcrumbItem>
									</BreadcrumbList>
								</Breadcrumb>
								<TheCon coHopTuan={canh.coHopTuan === true} />
							</div>
						) : null}
						{canh.than}
					</PageShellContent>
				</PageShell>
			</div>
		</LocaleProvider>
	);
}
