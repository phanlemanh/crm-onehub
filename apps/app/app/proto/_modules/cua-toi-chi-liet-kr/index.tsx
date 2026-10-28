"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import Renew from "@carbon/icons-react/es/Renew";
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
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
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
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
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
	BO,
	CAN_CAP_NHAT,
	CHU_KY,
	DA_CAP_NHAT,
	DON_VI_DAN,
	KR_PHU_TRACH,
	type KrCanCapNhat,
} from "./du-lieu";
import { HopCapNhat, NganKr, NganKrKhongThay } from "./ngan";

const DUONG = "/proto/cua-toi-chi-liet-kr";

const ST = {
	cuaToi: "ST-ctlk-cua-toi",
	moKr: "ST-ctlk-mo-kr",
	dongNgan: "ST-ctlk-dong-ngan",
	hopCapNhat: "ST-ctlk-hop-cap-nhat",
	daDu: "ST-ctlk-da-du",
	khongKr: "ST-ctlk-khong-kr",
	dangTai: "ST-ctlk-dang-tai",
	loi: "ST-ctlk-loi",
	tinNhac: "ST-ctlk-tin-nhac",
	krKhongThay: "ST-ctlk-kr-khong-thay",
} as const;

const den = (state: string) => `${DUONG}?state=${state}`;

const KR_MO = CAN_CAP_NHAT[0];
const KR_CUA_BO = CAN_CAP_NHAT.filter((k) => k.bo === BO.vung1);

function ThanhBen({ mucMo }: { mucMo: "cua-toi" | "bo-okr" }) {
	return (
		<AreaSidebar
			header={
				<Button className="justify-between" size="sm" variant="outline">
					{CHU_KY.ten}
					<Icon data-icon="inline-end" icon={ChevronDown} />
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
				<AreaSidebarItem active={mucMo === "bo-okr"} disabled>
					Bộ OKR
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

function DongKr({ kr }: { kr: KrCanCapNhat }) {
	return (
		<Item asChild variant="outline">
			<Link data-kr-can={kr.id} href={den(ST.moKr)}>
				<ItemContent>
					<ItemTitle className="line-clamp-2" translate="no">
						{kr.tieuDe}
					</ItemTitle>
					<ItemDescription>
						<span translate="no">{kr.bo}</span> ·{" "}
						<span translate="no">{kr.mucTieu}</span>
					</ItemDescription>
					<span className="text-muted-foreground text-xs sm:hidden">
						<span className="font-medium text-foreground tabular-nums">
							{kr.hienTai}
						</span>{" "}
						·{" "}
						{kr.lanTruoc ? `lần trước ${kr.lanTruoc}` : "chưa cập nhật lần nào"}
					</span>
				</ItemContent>
				<ItemActions className="shrink-0">
					<span className="hidden flex-col items-end gap-0.5 text-xs sm:flex">
						<span className="font-medium tabular-nums">{kr.hienTai}</span>
						<span className="text-muted-foreground">
							{kr.lanTruoc
								? `lần trước ${kr.lanTruoc}`
								: "chưa cập nhật lần nào"}
						</span>
					</span>
					{kr.tuTin ? (
						<span className="hidden sm:inline-flex">
							<ConfidenceIndicator level={kr.tuTin} size="sm" />
						</span>
					) : null}
					<Icon className="text-muted-foreground" icon={ChevronRight} />
				</ItemActions>
			</Link>
		</Item>
	);
}

function PhanCanCapNhat({
	the,
}: {
	the: "co" | "du" | "khong" | "tai" | "loi";
}) {
	const than =
		the === "tai" ? (
			<Skeleton className="h-24 w-full" data-khung-xuong="" />
		) : the === "loi" ? (
			<div className="flex flex-wrap items-center gap-3 text-sm" role="alert">
				<span className="text-destructive">Chưa tải được phần này.</span>
				<Button size="sm" variant="outline">
					<Icon data-icon="inline-start" icon={Renew} />
					Thử lại
				</Button>
			</div>
		) : the === "khong" ? (
			<p className="text-muted-foreground text-sm">
				Bạn không phụ trách KR nào ở chu kỳ đang chạy.
			</p>
		) : the === "du" ? (
			<p className="text-muted-foreground text-sm">
				Bạn đã cập nhật đủ {DA_CAP_NHAT + CAN_CAP_NHAT.length} KR cho tuần{" "}
				{CHU_KY.tuan}. Sửa một lần đã gửi thì mở KR đó.
			</p>
		) : (
			<>
				<p className="text-muted-foreground text-sm">
					{CAN_CAP_NHAT.length} KR chưa có số của tuần {CHU_KY.tuan}, hạn{" "}
					{CHU_KY.han}. Bấm một KR để mở nó trong bộ OKR rồi cập nhật.
				</p>
				<ItemGroup className="gap-2">
					{CAN_CAP_NHAT.map((kr) => (
						<DongKr key={kr.id} kr={kr} />
					))}
				</ItemGroup>
			</>
		);
	return (
		<section className="flex flex-col gap-3" data-phan="can-cap-nhat">
			<SectionHeading level={2}>Cần cập nhật tuần này</SectionHeading>
			{than}
		</section>
	);
}

function PhanDonViDan() {
	return (
		<section className="flex flex-col gap-3" data-phan="don-vi-dan">
			<SectionHeading level={2}>Đơn vị bạn dẫn</SectionHeading>
			{DON_VI_DAN.map((dv) => (
				<Card key={dv.ten}>
					<CardHeader>
						<CardTitle translate="no">{dv.ten}</CardTitle>
						<CardDescription>
							{dv.tomTat} · {dv.nhip}
						</CardDescription>
						<CardAction>
							<Button size="sm" variant="outline">
								Mở trang đơn vị
							</Button>
						</CardAction>
					</CardHeader>
				</Card>
			))}
		</section>
	);
}

function PhanKrPhuTrach() {
	return (
		<section className="flex flex-col gap-3" data-phan="kr-phu-trach">
			<SectionHeading level={2}>KR bạn phụ trách</SectionHeading>
			<p className="text-muted-foreground text-sm">
				{KR_PHU_TRACH.reduce((n, mt) => n + mt.kr.length, 0)} KR ở mọi đơn vị
				trong {CHU_KY.ten}. Bấm một KR để mở nó trong bộ OKR (Hỏi-2).
			</p>
			<ItemGroup className="gap-2">
				{KR_PHU_TRACH.map((mt) => (
					<Item key={mt.mucTieu} variant="outline">
						<ItemContent>
							<ItemTitle translate="no">{mt.mucTieu}</ItemTitle>
							<ItemDescription className="line-clamp-none">
								<span className="flex flex-col gap-1 pt-1">
									{mt.kr.map((kr) => (
										<Link
											className="underline-offset-2 hover:underline"
											data-mo-kr={kr.id}
											href={den(ST.moKr)}
											key={kr.id}
											translate="no"
										>
											{kr.tieuDe}
										</Link>
									))}
								</span>
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<span className="text-muted-foreground text-xs" translate="no">
								{mt.bo}
							</span>
						</ItemActions>
					</Item>
				))}
			</ItemGroup>
		</section>
	);
}

function CuaToi({
	the,
	sau,
}: {
	the: "co" | "du" | "khong" | "tai" | "loi";
	sau?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-8" data-trang-thai={`cua-toi-${the}`}>
			<PhanCanCapNhat the={the} />
			{the === "khong" ? null : (
				<>
					<PhanDonViDan />
					<PhanKrPhuTrach />
				</>
			)}
			{sau}
		</div>
	);
}

const THE_CON = ["OKR", "Họp tuần", "Việc", "Sơ đồ góp vào"] as const;

function TheCon() {
	return (
		<Tabs value="OKR">
			<TabsList variant="line">
				{THE_CON.map((the) => (
					<TabsTrigger
						aria-current={the === "OKR" ? "page" : undefined}
						disabled={the !== "OKR"}
						key={the}
						value={the}
					>
						{the}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}

const COT_BO: SimpleTableColumn[] = [
	{ id: "kr", header: "Mục tiêu và KR" },
	{
		id: "hien-tai",
		header: "Hiện tại",
		width: "w-[22%]",
		className: "hidden md:table-cell",
	},
];

function BoOkr() {
	return (
		<div className="flex flex-col gap-3">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href={den(ST.cuaToi)}>Bộ OKR</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage translate="no">{BO.vung1}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<TheCon />
			<SimpleTable columns={COT_BO} surface="page">
				{KR_CUA_BO.map((kr) => (
					<SimpleTableRow
						data-dang-mo={kr.id === KR_MO.id ? "" : undefined}
						data-state={kr.id === KR_MO.id ? "selected" : undefined}
						key={kr.id}
					>
						<TableCell className="px-3 py-3 whitespace-normal">
							<span className="flex flex-col gap-0.5">
								<span className="text-sm" translate="no">
									{kr.tieuDe}
								</span>
								<span className="text-muted-foreground text-xs" translate="no">
									{kr.mucTieu}
								</span>
							</span>
						</TableCell>
						<TableCell className="hidden px-3 py-3 text-sm tabular-nums md:table-cell">
							{kr.hienTai}
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</div>
	);
}

function TinNhac() {
	const hai = [
		{
			id: "mot",
			nhan: "Tin 08:30 khi chỉ 1 KR chờ",
			cau: `1 KR chờ cập nhật tuần này: «${KR_MO.tieuDe}»`,
			lienKet: "mở KR",
			dich: den(ST.moKr),
			giai: "Mở thẳng KR đó trong bộ OKR của nó (ngăn KR mở sẵn).",
		},
		{
			id: "nhieu",
			nhan: `Tin 08:30 khi ${CAN_CAP_NHAT.length} KR chờ`,
			cau: `${CAN_CAP_NHAT.length} KR chờ cập nhật tuần này`,
			lienKet: "mở Của tôi",
			dich: den(ST.cuaToi),
			giai: "Khuyến nghị Hỏi-1: mở Của tôi, phần «Cần cập nhật tuần này» liệt đủ các KR.",
		},
		{
			id: "cu",
			nhan: "Liên kết cũ đã gửi (/okr?tu=nhac)",
			cau: "4 KR chờ cập nhật tuần này",
			lienKet: "mở cập nhật",
			dich: den(ST.cuaToi),
			giai: "Tham số ?tu= bị bỏ qua: về Của tôi như trên, không mở bảng hàng loạt.",
		},
		{
			id: "mat",
			nhan: "KR trong tin đã bị xoá hay hết quyền",
			cau: "1 KR chờ cập nhật tuần này",
			lienKet: "mở KR",
			dich: den(ST.krKhongThay),
			giai: "Ngăn KR nói rõ không thấy KR, trên nền Của tôi.",
		},
	];
	return (
		<section className="flex flex-col gap-3" data-trang-thai={ST.tinNhac}>
			<SectionHeading level={2}>Tin nhắc 08:30 dẫn tới đâu</SectionHeading>
			<ItemGroup className="gap-2">
				{hai.map((t) => (
					<Item asChild data-tin={t.id} key={t.id} variant="outline">
						<Link href={t.dich}>
							<ItemContent>
								<ItemTitle>{t.nhan}</ItemTitle>
								<ItemDescription className="line-clamp-none">
									<span className="font-mono text-xs" translate="no">
										• {t.cau} — {t.lienKet}
									</span>
									<br />
									{t.giai}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Icon className="text-muted-foreground" icon={ChevronRight} />
							</ItemActions>
						</Link>
					</Item>
				))}
			</ItemGroup>
		</section>
	);
}

type Canh = { bo: boolean; tieuDe: string; moTa: string; than: ReactNode };

const CUA_TOI = {
	bo: false,
	tieuDe: "Của tôi",
	moTa: "Việc của bạn trong chu kỳ đang xem.",
} as const;

function canhCua(state: string): Canh {
	const vitri = KR_CUA_BO.findIndex((k) => k.id === KR_MO.id) + 1;
	switch (state) {
		case ST.moKr:
			return {
				bo: true,
				tieuDe: BO.vung1,
				moTa: "Mục tiêu và KR của đơn vị trong chu kỳ đang xem.",
				than: (
					<>
						<BoOkr />
						<NganKr
							capNhat={den(ST.hopCapNhat)}
							dongVe={den(ST.dongNgan)}
							kr={KR_MO}
							tong={KR_CUA_BO.length}
							viTri={vitri}
						/>
					</>
				),
			};
		case ST.hopCapNhat:
			return {
				bo: true,
				tieuDe: BO.vung1,
				moTa: "Mục tiêu và KR của đơn vị trong chu kỳ đang xem.",
				than: (
					<>
						<BoOkr />
						<HopCapNhat dongVe={den(ST.moKr)} kr={KR_MO} />
					</>
				),
			};
		case ST.dongNgan:
			return {
				bo: true,
				tieuDe: BO.vung1,
				moTa: "Mục tiêu và KR của đơn vị trong chu kỳ đang xem.",
				than: <BoOkr />,
			};
		case ST.daDu:
			return { ...CUA_TOI, than: <CuaToi the="du" /> };
		case ST.khongKr:
			return { ...CUA_TOI, than: <CuaToi the="khong" /> };
		case ST.dangTai:
			return { ...CUA_TOI, than: <CuaToi the="tai" /> };
		case ST.loi:
			return { ...CUA_TOI, than: <CuaToi the="loi" /> };
		case ST.tinNhac:
			return { ...CUA_TOI, than: <TinNhac /> };
		case ST.krKhongThay:
			return {
				...CUA_TOI,
				than: (
					<CuaToi sau={<NganKrKhongThay dongVe={den(ST.cuaToi)} />} the="co" />
				),
			};
		default:
			return { ...CUA_TOI, than: <CuaToi the="co" /> };
	}
}

export function CuaToiChiLietKrMau({ state }: { state: string }) {
	const canh = canhCua(state);
	return (
		<LocaleProvider locale="vi">
			<div className="flex min-h-svh flex-col md:flex-row">
				<ThanhBen mucMo={canh.bo ? "bo-okr" : "cua-toi"} />
				<PageShell>
					<PageShellHeader>
						<PageShellHeading>
							<PageShellTitle translate="no">{canh.tieuDe}</PageShellTitle>
							<PageShellDescription>{canh.moTa}</PageShellDescription>
						</PageShellHeading>
					</PageShellHeader>
					<PageShellContent className="flex flex-col gap-6">
						{canh.than}
					</PageShellContent>
				</PageShell>
			</div>
		</LocaleProvider>
	);
}
