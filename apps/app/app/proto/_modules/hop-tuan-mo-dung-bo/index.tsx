"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import { Badge } from "@crm/ui/components/badge";
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
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyContent,
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
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import Link from "next/link";
import type { ReactNode } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { HopCapNhatMau, NganKrMau } from "./cap-nhat";
import {
	CHU_KY,
	CON_LAI,
	DANG_BAN,
	DON_VI_CO_KR,
	type DongHopMau,
	GOC,
	type LyDoHop,
	PHONG_BAN,
	PHONG_BAN_RONG,
} from "./du-lieu";

const DUONG = "/proto/hop-tuan-mo-dung-bo";

const ST = {
	nganKr: "ST-htmb-ngan-kr",
	hopCapNhat: "ST-htmb-hop-cap-nhat",
	cuaToi: "ST-htmb-cua-toi",
	theOkr: "ST-htmb-the-okr",
	boOkrToiDan: "ST-htmb-bo-okr-toi-dan",
	homNay: "ST-htmb-hom-nay",
	coDuLieu: "ST-htmb-co-du-lieu",
	chuaKrGoc: "ST-htmb-chua-kr-onehub",
	chuaKrPhongBan: "ST-htmb-chua-kr-phong-ban",
	chuKyChuaChay: "ST-htmb-chu-ky-chua-chay",
	chuaAiCapNhat: "ST-htmb-chua-ai-cap-nhat",
	dangTai: "ST-htmb-dang-tai",
} as const;

const den = (state: string) => `${DUONG}?state=${state}`;

const THE_CON = ["OKR", "Họp tuần", "Việc", "Sơ đồ góp vào"] as const;

function ThanhBen({ mucMo }: { mucMo: "cua-toi" | "bo-okr" }) {
	return (
		<AreaSidebar
			header={
				<Button className="justify-between" size="sm" variant="outline">
					{CHU_KY.ten}
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
					<Link href={den(ST.boOkrToiDan)}>Bộ OKR</Link>
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

const DICH_THE = {
	OKR: ST.theOkr,
	"Họp tuần": ST.coDuLieu,
	Việc: null,
	"Sơ đồ góp vào": null,
} satisfies Record<(typeof THE_CON)[number], string | null>;

function TheCon({ dangMo }: { dangMo: (typeof THE_CON)[number] }) {
	return (
		<Tabs value={dangMo}>
			<TabsList variant="line">
				{THE_CON.map((the) => {
					const dich = DICH_THE[the];
					if (!dich)
						return (
							<TabsTrigger disabled key={the} value={the}>
								{the}
							</TabsTrigger>
						);
					return (
						<TabsTrigger asChild key={the} value={the}>
							<Link
								aria-current={the === dangMo ? "page" : undefined}
								data-the-con={the}
								href={den(dich)}
							>
								{the}
							</Link>
						</TabsTrigger>
					);
				})}
			</TabsList>
		</Tabs>
	);
}

const MUC_TIEU_OKR = [
	{
		ten: "Mở rộng mạng lưới đối tác miền Bắc",
		kr: [DANG_BAN[0], DANG_BAN[1]],
	},
	{
		ten: "Giữ chân đối tác hiện có",
		kr: [DANG_BAN[2], ...CON_LAI],
	},
];

const COT_OKR: SimpleTableColumn[] = [
	{ id: "kr", header: "Mục tiêu và KR" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-[26%]",
		className: "hidden md:table-cell",
	},
	{
		id: "phu-trach",
		header: "Phụ trách",
		width: "w-[18%]",
		className: "hidden lg:table-cell",
	},
];

function TheOkr() {
	return (
		<div className="flex flex-col gap-3" data-trang-thai={ST.theOkr}>
			<SimpleTable columns={COT_OKR} surface="page">
				{MUC_TIEU_OKR.flatMap((mt) => [
					<SimpleTableRow key={mt.ten}>
						<TableCell
							className="px-3 py-3 font-medium whitespace-normal"
							colSpan={3}
						>
							<span translate="no">{mt.ten}</span>
						</TableCell>
					</SimpleTableRow>,
					...mt.kr.map((kr) => (
						<SimpleTableRow key={kr.id}>
							<TableCell className="px-3 py-3 align-top whitespace-normal">
								<span className="flex gap-3 ps-4">
									<span className="flex min-w-0 flex-1 flex-col gap-1">
										<Link
											className="text-start text-sm underline-offset-2 hover:underline"
											data-mo-kr={kr.id}
											href={den(ST.nganKr)}
											translate="no"
										>
											{kr.tieuDe}
										</Link>
										<span className="md:hidden">
											<TienDo dong={kr} />
										</span>
									</span>
									<Button
										asChild
										data-nut="cap-nhat-dong-kr"
										size="sm"
										variant="outline"
									>
										<Link href={den(ST.hopCapNhat)}>Cập nhật</Link>
									</Button>
								</span>
							</TableCell>
							<TableCell className="hidden px-3 py-3 align-top md:table-cell">
								<TienDo dong={kr} />
							</TableCell>
							<TableCell className="hidden px-3 py-3 align-top text-sm lg:table-cell">
								<span translate="no">{kr.chuTen}</span>
							</TableCell>
						</SimpleTableRow>
					)),
				])}
			</SimpleTable>
			<p className="text-muted-foreground text-xs">
				Cập nhật chỉ đi qua KR trong bộ (quyết định 24/10, như Tability): bấm
				tên KR mở ngăn KR có nút «Cập nhật» ở đầu, hoặc bấm «Cập nhật» trên
				dòng. Bấm thẻ con «Họp tuần» để sang bảng họp của bộ này.
			</p>
		</div>
	);
}

function CuaToi() {
	return (
		<div className="flex flex-col gap-6" data-trang-thai={ST.cuaToi}>
			<div className="flex flex-col gap-3" data-can-cap-nhat="">
				<p className="font-medium text-sm">Cần cập nhật tuần này</p>
				<p className="text-muted-foreground text-xs">
					2 KR bạn phụ trách chưa có số tuần {CHU_KY.tuan}. Bấm một KR để mở nó
					trong bộ OKR rồi cập nhật — không có bảng cập nhật hàng loạt.
				</p>
				<ItemGroup className="gap-2">
					{[DANG_BAN[0], CON_LAI[0]].map((kr) => (
						<Item asChild key={kr.id} variant="outline">
							<Link data-kr-can={kr.id} href={den(ST.nganKr)}>
								<ItemContent>
									<ItemTitle translate="no">{kr.tieuDe}</ItemTitle>
									<ItemDescription>
										<span translate="no">{PHONG_BAN}</span> · lần trước{" "}
										{kr.tienDo}%
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									<span className="hidden text-muted-foreground text-xs sm:inline">
										Mở KR
									</span>
								</ItemActions>
							</Link>
						</Item>
					))}
				</ItemGroup>
			</div>
			<div className="flex flex-col gap-3">
				<p className="font-medium text-sm">Đơn vị bạn dẫn</p>
				<ItemGroup className="gap-2">
					<Item asChild variant="outline">
						<Link data-don-vi-dan="" href={den(ST.theOkr)}>
							<ItemContent>
								<ItemTitle translate="no">{PHONG_BAN}</ItemTitle>
								<ItemDescription>
									Phòng ban · 3 mục tiêu · đã cập nhật 3/5 KR tuần này
								</ItemDescription>
							</ItemContent>
						</Link>
					</Item>
				</ItemGroup>
			</div>
		</div>
	);
}

function HangSo({ daCapNhat }: { daCapNhat: string }) {
	return (
		<StatGroup data-hang-so-hop>
			<StatCard
				description={`Tuần ${CHU_KY.tuan}`}
				label="Đã cập nhật"
				value={daCapNhat}
			/>
			<StatCard
				description="KR cần bàn tuần này"
				label="Đáng bàn"
				value={daCapNhat.startsWith("0/") ? "0" : String(DANG_BAN.length)}
			/>
			<StatCard
				description="theo lần cập nhật mới nhất"
				label="Tự tin thấp"
				value={daCapNhat.startsWith("0/") ? "0" : "2"}
			/>
			<StatCard
				description={`Kết thúc ${CHU_KY.ketThuc}`}
				label="Ngày còn lại"
				value={CHU_KY.ngayConLai}
			/>
		</StatGroup>
	);
}

function HangSoCho() {
	return (
		<StatGroup data-hang-so-hop>
			{["a", "b", "c", "d"].map((k) => (
				<div className="flex flex-col gap-2 p-4" key={k}>
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-8 w-16" />
					<Skeleton className="h-3 w-28" />
				</div>
			))}
		</StatGroup>
	);
}

function NhanLyDo({ lyDo }: { lyDo: LyDoHop }) {
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

function TienDo({ dong }: { dong: DongHopMau }) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="flex items-center gap-3">
				<Progress value={dong.tienDo} />
				<span className="w-9 shrink-0 text-right text-xs tabular-nums">
					{dong.tienDo}%
				</span>
			</span>
			{dong.tuTin ? <ConfidenceIndicator level={dong.tuTin} size="sm" /> : null}
		</div>
	);
}

const COT: SimpleTableColumn[] = [
	{ id: "kr", header: "KR và vì sao đáng bàn" },
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-[26%]",
		className: "hidden md:table-cell",
	},
	{
		id: "ghi-chu",
		header: "Ghi chú mới nhất",
		width: "w-[30%]",
		className: "hidden lg:table-cell",
	},
];

function Bang({ dong }: { dong: DongHopMau[] }) {
	return (
		<SimpleTable columns={COT} surface="page">
			{dong.map((d) => (
				<SimpleTableRow key={d.id}>
					<TableCell className="px-3 py-3 align-top whitespace-normal">
						<div className="flex flex-col gap-1.5">
							<span className="text-sm" translate="no">
								{d.tieuDe}
							</span>
							<span className="text-muted-foreground text-xs">
								<span translate="no">{d.mucTieu}</span>
								{" · "}
								Phụ trách {d.chuTen}
							</span>
							{d.lyDo.length > 0 ? (
								<span className="flex flex-wrap gap-x-4 gap-y-1">
									{d.lyDo.map((l) => (
										<NhanLyDo key={l.loai} lyDo={l} />
									))}
								</span>
							) : null}
							<span className="md:hidden">
								<TienDo dong={d} />
							</span>
						</div>
					</TableCell>
					<TableCell className="hidden px-3 py-3 align-top md:table-cell">
						<TienDo dong={d} />
					</TableCell>
					<TableCell className="hidden px-3 py-3 align-top text-sm whitespace-normal lg:table-cell">
						{d.ghiChu ? (
							<span translate="no">«{d.ghiChu}»</span>
						) : (
							<span className="text-muted-foreground">—</span>
						)}
					</TableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function ConLai() {
	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Button className="self-start" size="sm" variant="ghost">
					<Icon icon={ChevronDown} data-icon="inline-start" />
					Còn lại {CON_LAI.length} KR — không có gì mới
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<Bang dong={CON_LAI} />
			</CollapsibleContent>
		</Collapsible>
	);
}

function CoDuLieu() {
	return (
		<section className="flex flex-col gap-3" data-trang-thai={ST.coDuLieu}>
			<p className="font-medium text-sm">
				Đáng bàn tuần này <Badge variant="secondary">{DANG_BAN.length}</Badge>
			</p>
			<p className="text-muted-foreground text-xs">
				Xếp theo: tự tin tụt, rồi KR im lâu nhất, rồi ghi chú mới. Mỗi dòng là
				một KR — bảng không liệt kê người chưa cập nhật.
			</p>
			<Bang dong={DANG_BAN} />
			<ConLai />
		</section>
	);
}

function DonViCoKr() {
	return (
		<div className="flex flex-col gap-2" data-don-vi-co-kr>
			<p className="font-medium text-sm">Đơn vị có KR</p>
			<ItemGroup className="gap-2">
				{DON_VI_CO_KR.map((dv) => (
					<Item asChild key={dv.khoa} variant="outline">
						<Link href={den(ST.coDuLieu)}>
							<ItemContent>
								<ItemTitle translate="no">{dv.ten}</ItemTitle>
								<ItemDescription>
									{dv.cap} · {dv.soKr} KR · đã cập nhật {dv.daCapNhat}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<span className="hidden text-muted-foreground text-xs sm:inline">
									Mở Họp tuần
								</span>
							</ItemActions>
						</Link>
					</Item>
				))}
			</ItemGroup>
		</div>
	);
}

function ManRong({
	state,
	tieuDe,
	moTa,
	children,
	duoi,
}: {
	state: string;
	tieuDe: ReactNode;
	moTa?: ReactNode;
	children?: ReactNode;
	duoi?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4" data-trang-thai={state}>
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>{tieuDe}</EmptyTitle>
					{moTa ? <EmptyDescription>{moTa}</EmptyDescription> : null}
				</EmptyHeader>
				{children ? <EmptyContent>{children}</EmptyContent> : null}
			</Empty>
			{duoi}
		</div>
	);
}

const BO_TOI_DAN = [
	{
		ten: "Kinh doanh vùng 1",
		truong: "Anh",
		mucTieu: 3,
		tienDo: "47%",
		thap: 2,
	},
];

function DanhSachToiDan() {
	return (
		<div className="flex flex-col gap-4" data-trang-thai={ST.boOkrToiDan}>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>Bộ OKR</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<ToggleGroup size="sm" type="single" value="toi-dan" variant="outline">
				<ToggleGroupItem count={12} value="tat-ca">
					Tất cả
				</ToggleGroupItem>
				<ToggleGroupItem count={1} value="toi-dan">
					Tôi dẫn
				</ToggleGroupItem>
				<ToggleGroupItem count={3} value="theo-doi">
					Đang theo dõi
				</ToggleGroupItem>
			</ToggleGroup>
			<ItemGroup className="gap-2">
				{BO_TOI_DAN.map((bo) => (
					<Item asChild key={bo.ten} variant="outline">
						<Link data-bo={bo.ten} href={den(ST.theOkr)}>
							<ItemContent>
								<ItemTitle translate="no">{bo.ten}</ItemTitle>
								<ItemDescription>
									Trưởng: {bo.truong} · {bo.mucTieu} mục tiêu · tiến độ{" "}
									{bo.tienDo} · {bo.thap} KR tự tin thấp
								</ItemDescription>
							</ItemContent>
						</Link>
					</Item>
				))}
			</ItemGroup>
			<p className="text-muted-foreground text-xs">
				Bấm bộ để mở trang của bộ ở thẻ OKR, rồi bấm thẻ con «Họp tuần» — như mở
				plan của đội trên Tability.
			</p>
		</div>
	);
}

function XemMoiBo() {
	return (
		<Button asChild size="sm" variant="outline">
			<Link href={den(ST.chuaKrGoc)}>Xem mọi bộ OKR</Link>
		</Button>
	);
}

type Canh = {
	bo: string;
	danhSach?: boolean;
	cuaToi?: boolean;
	the?: (typeof THE_CON)[number];
	than: ReactNode;
};

function canhCua(state: string): Canh {
	switch (state) {
		case ST.cuaToi:
			return { bo: "Của tôi", danhSach: true, cuaToi: true, than: <CuaToi /> };
		case ST.nganKr:
			return {
				bo: PHONG_BAN,
				the: "OKR",
				than: (
					<>
						<TheOkr />
						<NganKrMau capNhat={den(ST.hopCapNhat)} dongVe={den(ST.theOkr)} />
					</>
				),
			};
		case ST.hopCapNhat:
			return {
				bo: PHONG_BAN,
				the: "OKR",
				than: (
					<>
						<TheOkr />
						<HopCapNhatMau dongVe={den(ST.theOkr)} />
					</>
				),
			};
		case ST.theOkr:
			return { bo: PHONG_BAN, the: "OKR", than: <TheOkr /> };
		case ST.boOkrToiDan:
			return { bo: "Mục tiêu", danhSach: true, than: <DanhSachToiDan /> };
		case ST.homNay:
			return {
				bo: GOC,
				than: (
					<div className="flex flex-col gap-3" data-trang-thai={state}>
						<p className="text-muted-foreground text-xs">
							Tuần {CHU_KY.tuan} · đã cập nhật 0/0 KR
						</p>
						<ManRong
							moTa="Bảng họp tuần xếp KR theo mức tự tin tụt, KR im và ghi chú mới — từ sau lần cập nhật tuần đầu tiên."
							state={state}
							tieuDe="Chưa có lần cập nhật nào để bàn"
						/>
					</div>
				),
			};
		case ST.chuaKrGoc:
			return {
				bo: GOC,
				than: (
					<ManRong
						moTa="Các đơn vị dưới đây có KR trong chu kỳ — chọn một đơn vị để họp."
						state={state}
						tieuDe={
							<>
								<span translate="no">{GOC}</span> chưa có KR công bố trong{" "}
								<span translate="no">{CHU_KY.ten}</span>.
							</>
						}
						duoi={<DonViCoKr />}
					/>
				),
			};
		case ST.chuaKrPhongBan:
			return {
				bo: PHONG_BAN_RONG,
				than: (
					<ManRong
						moTa="Khi phòng công bố mục tiêu và KR, Họp tuần có số từ tuần đó."
						state={state}
						tieuDe={
							<>
								<span translate="no">{PHONG_BAN_RONG}</span> chưa có KR công bố
								trong <span translate="no">{CHU_KY.ten}</span>.
							</>
						}
					>
						<XemMoiBo />
					</ManRong>
				),
			};
		case ST.chuKyChuaChay:
			return {
				bo: PHONG_BAN,
				than: (
					<ManRong
						state={state}
						tieuDe={
							<>
								Chu kỳ <span translate="no">{CHU_KY.chuKyMoi}</span> bắt đầu{" "}
								{CHU_KY.batDauMoi} — Họp tuần có số từ tuần đầu của chu kỳ.
							</>
						}
					/>
				),
			};
		case ST.chuaAiCapNhat:
			return {
				bo: PHONG_BAN,
				than: (
					<div className="flex flex-col gap-4">
						<HangSo daCapNhat={`0/${DANG_BAN.length + CON_LAI.length}`} />
						<ManRong
							moTa="Bảng họp tuần xếp KR theo mức tự tin tụt, KR im và ghi chú mới — từ sau lần cập nhật tuần đầu tiên."
							state={state}
							tieuDe="Chưa có lần cập nhật nào để bàn"
						/>
					</div>
				),
			};
		case ST.dangTai:
			return {
				bo: PHONG_BAN,
				than: (
					<div className="flex flex-col gap-4" data-trang-thai={state}>
						<HangSoCho />
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-48 w-full" />
					</div>
				),
			};
		default:
			return {
				bo: PHONG_BAN,
				than: (
					<div className="flex flex-col gap-4">
						<HangSo daCapNhat={`3/${DANG_BAN.length + CON_LAI.length}`} />
						<CoDuLieu />
					</div>
				),
			};
	}
}

export function HopTuanMoDungBoMau({ state }: { state: string }) {
	const canh = canhCua(state);
	return (
		<LocaleProvider locale="vi">
			<div className="flex min-h-svh flex-col md:flex-row">
				<ThanhBen mucMo={canh.cuaToi ? "cua-toi" : "bo-okr"} />
				<PageShell>
					<PageShellHeader>
						<PageShellHeading>
							<PageShellTitle translate="no">{canh.bo}</PageShellTitle>
							<PageShellDescription>
								{canh.danhSach
									? canh.cuaToi
										? "Việc của bạn trong chu kỳ đang xem."
										: "Mỗi đơn vị một bộ OKR trong chu kỳ."
									: "Mục tiêu và KR của đơn vị trong chu kỳ đang xem."}
							</PageShellDescription>
						</PageShellHeading>
					</PageShellHeader>
					<PageShellContent className="flex flex-col gap-6">
						{canh.danhSach ? null : (
							<div className="flex flex-col gap-3 pb-1">
								<Breadcrumb>
									<BreadcrumbList>
										<BreadcrumbItem>
											<BreadcrumbLink asChild>
												<Link href={den(ST.boOkrToiDan)}>Bộ OKR</Link>
											</BreadcrumbLink>
										</BreadcrumbItem>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbPage translate="no">{canh.bo}</BreadcrumbPage>
										</BreadcrumbItem>
									</BreadcrumbList>
								</Breadcrumb>
								<TheCon dangMo={canh.the ?? "Họp tuần"} />
							</div>
						)}
						{canh.than}
					</PageShellContent>
				</PageShell>
			</div>
		</LocaleProvider>
	);
}
