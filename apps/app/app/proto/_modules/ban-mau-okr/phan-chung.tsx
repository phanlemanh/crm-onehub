"use client";

import Building from "@carbon/icons-react/es/Building";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Menu from "@carbon/icons-react/es/Menu";
import Partnership from "@carbon/icons-react/es/Partnership";
import Renew from "@carbon/icons-react/es/Renew";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import Settings from "@carbon/icons-react/es/Settings";
import Target from "@carbon/icons-react/es/Target";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import Logo from "@crm/ui/components/logo";
import { NavItem } from "@crm/ui/components/nav-item";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { cn } from "@crm/ui/lib/utils";
import type { ReactNode } from "react";
import {
	CHU_KY_KHAC,
	type KrMau,
	KY,
	type LoaiMucTieu,
	type MucTuTin,
	TOI,
} from "./du-lieu";

export type Vai = "chi-okr" | "day-du";

export type TrangOkr = "cua-toi" | "cap-nhat" | "theo-don-vi" | "toan-canh";

export type TrangKhung = TrangOkr | "hoi-y";

type MucDieuHuong = { key: string; nhan: string; icon: CarbonIcon };

const MUC_OKR: MucDieuHuong = { key: "okr", nhan: "OKR", icon: Target };
const MUC_CAI_DAT: MucDieuHuong = {
	key: "settings",
	nhan: "Cài đặt",
	icon: Settings,
};

const DIEU_HUONG = {
	"chi-okr": [MUC_OKR, MUC_CAI_DAT],
	"day-du": [
		{ key: "overview", nhan: "Tổng quan", icon: Dashboard },
		{ key: "chat", nhan: "Hội thoại", icon: Bot },
		{ key: "companies", nhan: "Công ty", icon: Building },
		{ key: "contacts", nhan: "Cá nhân", icon: UserMultiple },
		{ key: "deals", nhan: "Thoả thuận", icon: Partnership },
		{ key: "campaigns", nhan: "Chiến dịch", icon: Bullhorn },
		{ key: "onboarding", nhan: "30 ngày đầu", icon: Roadmap },
		MUC_OKR,
		MUC_CAI_DAT,
	],
} satisfies Record<Vai, MucDieuHuong[]>;

const TRANG: { value: TrangOkr; nhan: string }[] = [
	{ value: "cua-toi", nhan: "Của tôi" },
	{ value: "cap-nhat", nhan: "Cập nhật tuần" },
	{ value: "theo-don-vi", nhan: "Theo đơn vị" },
	{ value: "toan-canh", nhan: "Toàn cảnh" },
];

const TAB_HOI_Y = {
	value: "hoi-y",
	nhan: "Hỏi ý",
} satisfies { value: TrangKhung; nhan: string };

const TIEU_DE_TRANG = {
	"cua-toi": "OKR của tôi",
	"cap-nhat": "Cập nhật tuần của tôi",
	"theo-don-vi": "OKR theo đơn vị",
	"toan-canh": "Toàn cảnh OKR",
	"hoi-y": "Hỏi ý mục tiêu",
} satisfies Record<TrangKhung, string>;

function RailDieuHuong({ vai }: { vai: Vai }) {
	return (
		<nav
			aria-label="Điều hướng chính"
			className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex"
		>
			{DIEU_HUONG[vai].map((muc) => {
				const dangMo = muc.key === "okr";
				return (
					<NavItem active={dangMo} key={muc.key} size="icon" title={muc.nhan}>
						<Icon icon={muc.icon} />
						<span className="sr-only">{muc.nhan}</span>
					</NavItem>
				);
			})}
		</nav>
	);
}

function DieuHuongMayNho({ vai }: { vai: Vai }) {
	return (
		<Sheet open>
			<SheetContent className="w-64 gap-0 p-0" side="left">
				<SheetHeader>
					<SheetTitle>Điều hướng</SheetTitle>
				</SheetHeader>
				<nav
					aria-label="Điều hướng trên máy nhỏ"
					className="flex flex-1 flex-col gap-1 p-2"
				>
					{DIEU_HUONG[vai].map((muc) => (
						<NavItem active={muc.key === "okr"} key={muc.key}>
							<Icon icon={muc.icon} />
							<span>{muc.nhan}</span>
						</NavItem>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	);
}

export function KhungUngDung({
	vai,
	trang,
	moDieuHuong = false,
	nguoi,
	chuKy,
	nhanTabHoiY,
	congCuCungHangTab = false,
	children,
}: {
	vai: Vai;
	nguoi?: string;
	trang: TrangKhung;
	moDieuHuong?: boolean;
	chuKy?: string;
	nhanTabHoiY?: string;
	congCuCungHangTab?: boolean;
	children: ReactNode;
}) {
	return (
		<div
			className="ml-[calc(50%-50vw)] flex w-screen flex-col border-y bg-background"
			data-okr-khung={trang}
			data-vai={vai}
		>
			<header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
				<Button
					aria-label="Mở điều hướng"
					className="md:hidden"
					size="icon"
					variant="ghost"
				>
					<Icon icon={Menu} />
				</Button>
				<span className="hidden size-8 items-center justify-center md:flex">
					<Logo className="size-5" />
				</span>
				<span className="min-w-0 truncate font-medium text-sm" translate="no">
					OneHub
				</span>
				<span className="ml-auto flex items-center gap-2">
					<PersonAvatar
						name={nguoi ?? (vai === "chi-okr" ? TOI.ten : "Đỗ Hải Sơn")}
						size="sm"
					/>
				</span>
			</header>
			<div className="flex min-h-0 flex-1">
				<RailDieuHuong vai={vai} />
				<div className="flex min-w-0 flex-1 flex-col px-4 pt-4 pb-6 md:px-6 md:pt-6">
					<div className="mx-auto flex w-full min-w-0 max-w-7xl flex-1 flex-col gap-6">
						<DauTrangOkr
							chuKy={chuKy}
							congCuCungHangTab={congCuCungHangTab}
							nhanTabHoiY={nhanTabHoiY}
							trang={trang}
						/>
						{children}
					</div>
				</div>
			</div>
			{moDieuHuong ? <DieuHuongMayNho vai={vai} /> : null}
		</div>
	);
}

const LE_TAB_PX = 16;

function cuonTabDangDungVaoKhung(khung: HTMLDivElement | null) {
	const tab = khung?.querySelector<HTMLElement>(
		'[role="tab"][data-state="active"]',
	);
	if (!khung || !tab) return;
	const phai = tab.offsetLeft + tab.offsetWidth + LE_TAB_PX - khung.clientWidth;
	const trai = tab.offsetLeft - LE_TAB_PX;
	if (phai > khung.scrollLeft) khung.scrollLeft = phai;
	else if (trai < khung.scrollLeft) khung.scrollLeft = Math.max(0, trai);
}

function CongCuTrang({ chuKy }: { chuKy?: string }) {
	const kyChon = chuKy ?? KY.ten;
	const cacKy: readonly string[] = (CHU_KY_KHAC as readonly string[]).includes(
		kyChon,
	)
		? CHU_KY_KHAC
		: [kyChon, ...CHU_KY_KHAC];
	return (
		<>
			<Badge variant="outline">Dữ liệu mẫu</Badge>
			<Select defaultValue={kyChon}>
				<SelectTrigger aria-label="Chu kỳ" size="sm">
					<SelectValue />
				</SelectTrigger>
				<SelectContent align="end">
					{cacKy.map((ky) => (
						<SelectItem key={ky} value={ky}>
							{ky}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
}

function DauTrangOkr({
	trang,
	chuKy,
	nhanTabHoiY,
	congCuCungHangTab,
}: {
	trang: TrangKhung;
	chuKy?: string;
	nhanTabHoiY?: string;
	congCuCungHangTab: boolean;
}) {
	const tab = trang === "hoi-y" ? [...TRANG, TAB_HOI_Y] : TRANG;
	return (
		<header className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<h2 className="min-w-0 font-medium text-2xl tracking-tight md:text-3xl">
					{TIEU_DE_TRANG[trang]}
				</h2>
				<div
					className={
						congCuCungHangTab
							? "ml-auto flex items-center gap-2 md:hidden"
							: "ml-auto flex items-center gap-2"
					}
				>
					<CongCuTrang chuKy={chuKy} />
				</div>
			</div>
			<Tabs value={trang}>
				<div
					className={
						congCuCungHangTab
							? "flex items-center gap-4 md:border-b"
							: "flex items-center gap-4"
					}
				>
					<div
						className="relative -mx-4 min-w-0 flex-1 overflow-x-auto px-4 md:mx-0 md:px-0"
						data-khung-tab
						ref={cuonTabDangDungVaoKhung}
					>
						<TabsList
							aria-label="Khu OKR"
							className={
								congCuCungHangTab
									? "w-max min-w-full justify-start gap-6 border-b md:border-b-0"
									: "w-max min-w-full justify-start gap-6 border-b"
							}
							variant="line"
						>
							{tab.map((t) => (
								<TabsTrigger key={t.value} value={t.value}>
									{t.nhan}
									{t.value === "hoi-y" && nhanTabHoiY ? (
										<Badge data-nhan-tab variant="secondary">
											{nhanTabHoiY}
										</Badge>
									) : null}
								</TabsTrigger>
							))}
						</TabsList>
					</div>
					{congCuCungHangTab ? (
						<div className="hidden shrink-0 items-center gap-2 md:flex">
							<CongCuTrang chuKy={chuKy} />
						</div>
					) : null}
				</div>
			</Tabs>
		</header>
	);
}

export function tienDo(kr: KrMau): number {
	if (kr.kieu === "moc") return kr.hienTai >= 1 ? 100 : 0;
	const pham = kr.dich - kr.khoiDiem;
	if (pham === 0) return 0;
	const p = ((kr.hienTai - kr.khoiDiem) / pham) * 100;
	return Math.max(0, Math.min(100, Math.round(p)));
}

export function so(value: number): string {
	return value.toLocaleString("vi-VN");
}

export function giaTri(kr: KrMau, value: number = kr.hienTai): string {
	if (kr.kieu === "moc") return value >= 1 ? "Xong" : "Chưa xong";
	if (kr.donVi === "%") return `${so(value)}%`;
	return `${so(value)} ${kr.donVi}`;
}

type TinhTrang = { nhan: string; tone: StatusTone };

const NGUONG_THAM_VONG = 0.7;
const NGUONG_CHAM = 0.85;
const NGUONG_TRUOT = 0.5;

export function tinhTrang(phanTram: number, loai: LoaiMucTieu): TinhTrang {
	const tiLe = phanTram / KY.kyVong;
	if (loai === "tham-vong") {
		return tiLe >= NGUONG_THAM_VONG
			? { nhan: "Đúng nhịp", tone: "success" }
			: { nhan: "Chậm nhịp", tone: "warning" };
	}
	if (tiLe >= NGUONG_CHAM) return { nhan: "Đúng nhịp", tone: "success" };
	if (tiLe >= NGUONG_TRUOT) return { nhan: "Chậm nhịp", tone: "warning" };
	return { nhan: "Trượt", tone: "error" };
}

export const NHAN_TU_TIN = {
	cao: "Cao",
	vua: "Vừa",
	thap: "Thấp",
} satisfies Record<MucTuTin, string>;

export const TONE_TU_TIN = {
	cao: "success",
	vua: "warning",
	thap: "error",
} satisfies Record<MucTuTin, StatusTone>;

export function TuTin({
	muc,
	size = "default",
	coNhan = true,
}: {
	muc: MucTuTin;
	size?: "default" | "sm";
	coNhan?: boolean;
}) {
	return (
		<StatusIndicator
			label={
				coNhan ? `Tự tin ${NHAN_TU_TIN[muc].toLowerCase()}` : NHAN_TU_TIN[muc]
			}
			size={size}
			tone={TONE_TU_TIN[muc]}
		/>
	);
}

export function TinhTrangKr({
	phanTram,
	loai,
	size = "default",
	laMoc = false,
}: {
	phanTram: number;
	loai: LoaiMucTieu;
	size?: "default" | "sm";
	laMoc?: boolean;
}) {
	const t: TinhTrang = laMoc
		? phanTram >= 100
			? { nhan: "Đã xong", tone: "success" }
			: { nhan: "Mốc, chưa xong", tone: "neutral" }
		: tinhTrang(phanTram, loai);
	return <StatusIndicator label={t.nhan} size={size} tone={t.tone} />;
}

export function ThanhTienDo({
	phanTram,
	kyVong = KY.kyVong,
	nhan,
	className,
}: {
	phanTram: number;
	kyVong?: number | null;
	nhan: string;
	className?: string;
}) {
	return (
		<div
			aria-label={
				kyVong === null
					? `${nhan}: ${phanTram}%`
					: `${nhan}: ${phanTram}%, lẽ ra đã tới ${kyVong}%`
			}
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={phanTram}
			className={cn("relative flex h-3 w-full items-center", className)}
			role="progressbar"
			title={kyVong === null ? undefined : `Lẽ ra đã tới ${kyVong}%`}
		>
			<div className="h-1 w-full overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-muted-foreground"
					style={{ width: `${phanTram}%` }}
				/>
			</div>
			{kyVong === null ? null : (
				<span
					aria-hidden="true"
					className="absolute inset-y-0 w-0.5 rounded-full bg-foreground"
					data-ky-vong
					style={{ left: `calc(${kyVong}% - 1px)` }}
				/>
			)}
		</div>
	);
}

export function ChuThichVach() {
	return (
		<p className="flex items-center gap-2 text-muted-foreground text-xs">
			<span
				aria-hidden="true"
				className="h-3 w-0.5 rounded-full bg-foreground"
			/>
			Vạch đứng: lẽ ra đã tới {KY.kyVong}% vào {KY.homNay} ({KY.tuan})
		</p>
	);
}

export function LoaiMucTieuNhan({ loai }: { loai: LoaiMucTieu }) {
	return (
		<Badge variant="outline">
			{loai === "tham-vong" ? "Tham vọng" : "Cam kết"}
		</Badge>
	);
}

const KHUNG_TAI = ["mot", "hai", "ba", "bon", "nam", "sau"] as const;

export function DangTai({ dong = 4 }: { dong?: number }) {
	return (
		<div aria-busy="true" aria-live="polite" className="flex flex-col gap-4">
			<span className="sr-only">Đang tải OKR…</span>
			<Skeleton className="h-20 w-full" />
			{KHUNG_TAI.slice(0, dong).map((id) => (
				<div className="flex flex-col gap-2 rounded-lg border p-4" key={id}>
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-1/2" />
				</div>
			))}
		</div>
	);
}

export function Loi({ cau }: { cau: string }) {
	return (
		<Empty className="rounded-lg border">
			<EmptyHeader>
				<EmptyTitle>Không tải được OKR</EmptyTitle>
				<EmptyDescription>{cau}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button size="sm" variant="outline">
					<Icon icon={Renew} data-icon="inline-start" />
					Thử lại
				</Button>
			</EmptyContent>
		</Empty>
	);
}

export function TenNguoi({
	ten,
	avatar = true,
}: {
	ten: string;
	avatar?: boolean;
}) {
	return (
		<span className="inline-flex min-w-0 items-center gap-1.5" translate="no">
			{avatar ? <PersonAvatar name={ten} size="sm" /> : null}
			<span className="truncate">{ten}</span>
		</span>
	);
}
