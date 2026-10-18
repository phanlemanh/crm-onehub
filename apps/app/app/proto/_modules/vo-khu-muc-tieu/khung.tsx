"use client";

import Book from "@carbon/icons-react/es/Book";
import Building from "@carbon/icons-react/es/Building";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Launch from "@carbon/icons-react/es/Launch";
import Menu from "@carbon/icons-react/es/Menu";
import Milestone from "@carbon/icons-react/es/Milestone";
import Partnership from "@carbon/icons-react/es/Partnership";
import Roadmap from "@carbon/icons-react/es/Roadmap";
import Settings from "@carbon/icons-react/es/Settings";
import Target from "@carbon/icons-react/es/Target";
import TaskComplete from "@carbon/icons-react/es/TaskComplete";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Button } from "@crm/ui/components/button";
import { type CarbonIcon, Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import Logo from "@crm/ui/components/logo";
import {
	NavGroup,
	NavGroupLabel,
	NavItem,
	NavStrip,
} from "@crm/ui/components/nav-item";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import Link from "next/link";
import { type ReactNode, useId } from "react";
import { CHU_KY_KHAC, KY } from "../ban-mau-okr/du-lieu";
import { duong, LOI_TAT_DON_VI, STATE, type StateVo, TOI } from "./du-lieu";

type MucRail = { key: string; nhan: string; icon: CarbonIcon };

const RAIL: MucRail[] = [
	{ key: "overview", nhan: "Tổng quan", icon: Dashboard },
	{ key: "viec", nhan: "Việc của tôi", icon: TaskComplete },
	{ key: "chat", nhan: "Hội thoại", icon: Bot },
	{ key: "companies", nhan: "Công ty", icon: Building },
	{ key: "contacts", nhan: "Cá nhân", icon: UserMultiple },
	{ key: "deals", nhan: "Thoả thuận", icon: Partnership },
	{ key: "campaigns", nhan: "Chiến dịch", icon: Bullhorn },
	{ key: "onboarding", nhan: "30 ngày đầu", icon: Roadmap },
	{ key: "okr", nhan: "Mục tiêu", icon: Target },
	{ key: "tai-lieu", nhan: "Tài liệu", icon: Book },
	{ key: "lo-trinh", nhan: "Lộ trình", icon: Milestone },
	{ key: "settings", nhan: "Cài đặt", icon: Settings },
];

export type NoiDen =
	| "cua-toi"
	| "tat-ca-don-vi"
	| "don-vi:cskh"
	| "don-vi:vanhanh"
	| "suc-khoe"
	| "moi-kr"
	| "so-do"
	| "cap-nhat"
	| "lay-y-kien";

type Muc = { noi: NoiDen; nhan: string; state: StateVo };

type Nhom = { khoa: string; nhan: string | null; muc: Muc[] };

const NHOM: Nhom[] = [
	{
		khoa: "toi",
		nhan: null,
		muc: [{ noi: "cua-toi", nhan: "Của tôi", state: STATE.cuaToi }],
	},
	{
		khoa: "don-vi",
		nhan: "Đơn vị",
		muc: [
			{ noi: "tat-ca-don-vi", nhan: "Tất cả đơn vị", state: STATE.donVi },
			...LOI_TAT_DON_VI.map(
				(d): Muc => ({
					noi: `don-vi:${d.id}`,
					nhan: d.ten,
					state: STATE.trangDonVi,
				}),
			),
		],
	},
	{
		khoa: "cong-ty",
		nhan: "Cả công ty",
		muc: [
			{ noi: "suc-khoe", nhan: "Sức khoẻ", state: STATE.sucKhoe },
			{ noi: "moi-kr", nhan: "Mọi KR", state: STATE.moiKr },
			{ noi: "so-do", nhan: "Sơ đồ góp vào", state: STATE.soDo },
			{ noi: "cap-nhat", nhan: "Cập nhật", state: STATE.capNhat },
		],
	},
	{
		khoa: "ke-hoach",
		nhan: "Lập kế hoạch",
		muc: [{ noi: "lay-y-kien", nhan: "Lấy ý kiến", state: STATE.layYKien }],
	},
];

function ChonChuKy() {
	return (
		<Select defaultValue={KY.ten}>
			<SelectTrigger aria-label="Chu kỳ" className="w-full" size="sm">
				<SelectValue placeholder={KY.ten} />
			</SelectTrigger>
			<SelectContent align="start">
				{CHU_KY_KHAC.map((ky) => (
					<SelectItem key={ky} value={ky}>
						{ky}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function NhomThanhBen({ nhom, dangO }: { nhom: Nhom; dangO: NoiDen }) {
	const id = useId();
	return (
		<NavGroup aria-labelledby={nhom.nhan ? id : undefined}>
			{nhom.nhan ? <NavGroupLabel id={id}>{nhom.nhan}</NavGroupLabel> : null}
			{nhom.muc.map((m) => (
				<NavItem
					active={m.noi === dangO}
					asChild
					key={m.noi}
					level={m.noi.startsWith("don-vi:") ? 2 : 0}
				>
					<Link href={duong(m.state)}>{m.nhan}</Link>
				</NavItem>
			))}
		</NavGroup>
	);
}

function ThanhBenKhu({ dangO }: { dangO: NoiDen }) {
	return (
		<aside
			className="hidden w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r p-3 lg:flex"
			data-thanh-ben-khu
		>
			<ChonChuKy />
			<nav aria-label="Mục tiêu" className="flex flex-col gap-4">
				{NHOM.map((n) => (
					<NhomThanhBen dangO={dangO} key={n.khoa} nhom={n} />
				))}
			</nav>
			<div className="mt-auto border-t pt-3">
				<NavItem asChild>
					<Link href={duong(STATE.sucKhoe)}>
						Chương trình OKR
						<Icon data-icon="inline-end" icon={Launch} />
					</Link>
				</NavItem>
			</div>
		</aside>
	);
}

function DaiDienThoai({ dangO }: { dangO: NoiDen }) {
	return (
		<div className="flex flex-col lg:hidden" data-dai-dien-thoai>
			<div className="border-b p-2">
				<ChonChuKy />
			</div>
			<NavStrip aria-label="Mục tiêu">
				{NHOM.flatMap((n) => n.muc).map((m) => (
					<NavItem
						active={m.noi === dangO}
						asChild
						key={m.noi}
						orientation="horizontal"
					>
						<Link href={duong(m.state)}>{m.nhan}</Link>
					</NavItem>
				))}
			</NavStrip>
		</div>
	);
}

export function KhungKhu({
	dangO,
	anThanhBen,
	children,
}: {
	dangO: NoiDen;
	anThanhBen?: boolean;
	children: ReactNode;
}) {
	return (
		<div
			className="ml-[calc(50%-50vw)] flex h-[calc(100svh-9rem)] min-h-[640px] w-screen flex-col border-y bg-background"
			data-khung-app
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
					<PersonAvatar name={TOI.ten} size="sm" />
				</span>
			</header>
			<div className="flex min-h-0 flex-1">
				<nav
					aria-label="Điều hướng chính"
					className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex"
				>
					{RAIL.map((m) => (
						<NavItem
							active={m.key === "okr"}
							key={m.key}
							size="icon"
							title={m.nhan}
						>
							<Icon icon={m.icon} />
							<span className="sr-only">{m.nhan}</span>
						</NavItem>
					))}
				</nav>
				{anThanhBen ? null : <ThanhBenKhu dangO={dangO} />}
				<div className="flex min-h-0 min-w-0 flex-1 flex-col">
					{anThanhBen ? null : <DaiDienThoai dangO={dangO} />}
					{children}
				</div>
			</div>
		</div>
	);
}
