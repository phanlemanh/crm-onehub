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

function ThanhBen({ hopTuanMo }: { hopTuanMo: boolean }) {
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
				<AreaSidebarItem asChild>
					<Link href={den(ST.coDuLieu)}>Của tôi</Link>
				</AreaSidebarItem>
			</AreaSidebarGroup>
			<AreaSidebarGroup label="OKR">
				<AreaSidebarItem active={!hopTuanMo} asChild>
					<Link href={den(ST.chuaKrGoc)}>Bộ OKR</Link>
				</AreaSidebarItem>
				<AreaSidebarItem active={hopTuanMo} asChild data-muc-moi="hop-tuan">
					<Link href={den(ST.coDuLieu)}>Họp tuần</Link>
				</AreaSidebarItem>
				<AreaSidebarItem asChild>
					<Link href={den(ST.coDuLieu)}>Lấy ý kiến</Link>
				</AreaSidebarItem>
			</AreaSidebarGroup>
			<AreaSidebarGroup label="Báo cáo">
				{["Sức khoẻ", "Mọi KR", "Sơ đồ"].map((nhan) => (
					<AreaSidebarItem asChild key={nhan}>
						<Link href={den(ST.coDuLieu)}>{nhan}</Link>
					</AreaSidebarItem>
				))}
			</AreaSidebarGroup>
		</AreaSidebar>
	);
}

function TheCon() {
	return (
		<Tabs value="Họp tuần">
			<TabsList variant="line">
				{THE_CON.map((the) => (
					<TabsTrigger asChild key={the} value={the}>
						<Link
							aria-current={the === "Họp tuần" ? "page" : undefined}
							href={den(ST.coDuLieu)}
						>
							{the}
						</Link>
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
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

function XemMoiBo() {
	return (
		<Button asChild size="sm" variant="outline">
			<Link href={den(ST.chuaKrGoc)}>Xem mọi bộ OKR</Link>
		</Button>
	);
}

type Canh = {
	bo: string;
	hopTuanMo: boolean;
	than: ReactNode;
};

function canhCua(state: string): Canh {
	switch (state) {
		case ST.homNay:
			return {
				bo: GOC,
				hopTuanMo: false,
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
				hopTuanMo: true,
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
				hopTuanMo: true,
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
				hopTuanMo: true,
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
				hopTuanMo: true,
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
				hopTuanMo: true,
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
				hopTuanMo: true,
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
				<ThanhBen hopTuanMo={canh.hopTuanMo} />
				<PageShell>
					<PageShellHeader>
						<PageShellHeading>
							<PageShellTitle translate="no">{canh.bo}</PageShellTitle>
							<PageShellDescription>
								Mục tiêu và KR của đơn vị trong chu kỳ đang xem.
							</PageShellDescription>
						</PageShellHeading>
					</PageShellHeader>
					<PageShellContent className="flex flex-col gap-6">
						<div className="flex flex-col gap-3 pb-1">
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link href={den(ST.chuaKrGoc)}>Bộ OKR</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator />
									<BreadcrumbItem>
										<BreadcrumbPage translate="no">{canh.bo}</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
							<TheCon />
						</div>
						{canh.than}
					</PageShellContent>
				</PageShell>
			</div>
		</LocaleProvider>
	);
}
