"use client";

import CheckmarkOutline from "@carbon/icons-react/es/CheckmarkOutline";
import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
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
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
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
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { KY, type LyDoMoCoi, MO_COI, type MucMoCoi } from "./du-lieu";

export type HinhMoCoi = "co" | "rong" | "dang-tai" | "loi";

const NHAN_LY_DO = {
	"luu-tru": "Đơn vị đã lưu trữ",
	"khong-ai-sua": "Không ai sửa được",
	"da-roi": "Người phụ trách đã rời",
} satisfies Record<LyDoMoCoi, string>;

const HANH_DONG = {
	"luu-tru": "Chuyển OKR…",
	"khong-ai-sua": "Đặt trưởng",
	"da-roi": "Mở mục tiêu",
} satisfies Record<LyDoMoCoi, string>;

function DongMoCoi({ m }: { m: MucMoCoi }) {
	return (
		<Item size="sm" variant="outline" data-mo-coi={m.lyDo}>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{m.ten}</span>
				</ItemTitle>
				<ItemDescription>
					<span translate="no">{m.donVi}</span> · {m.chiTiet}
				</ItemDescription>
				<span>
					<Badge variant="outline">{NHAN_LY_DO[m.lyDo]}</Badge>
				</span>
			</ItemContent>
			<ItemActions>
				<Button size="sm" variant="outline">
					{HANH_DONG[m.lyDo]}
				</Button>
			</ItemActions>
		</Item>
	);
}

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

function DangTaiMoCoi() {
	return (
		<ItemGroup aria-busy="true" className="gap-2">
			<span className="sr-only" role="status">
				Đang tải OKR mồ côi…
			</span>
			{KHUNG_TAI.map((id) => (
				<Item key={id} size="sm" variant="outline">
					<ItemContent>
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-1/2" />
						<Skeleton className="h-5 w-28" />
					</ItemContent>
					<ItemActions>
						<Skeleton className="h-8 w-24" />
					</ItemActions>
				</Item>
			))}
		</ItemGroup>
	);
}

function NoiDungMoCoi({ hinh }: { hinh: HinhMoCoi }) {
	if (hinh === "dang-tai") return <DangTaiMoCoi />;
	if (hinh === "rong")
		return (
			<Empty data-trang-thai="ST-mocoi-rong">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={CheckmarkOutline} />
					</EmptyMedia>
					<EmptyTitle>Không có OKR mồ côi</EmptyTitle>
					<EmptyDescription>
						Mọi mục tiêu ở kỳ đang mở đều có đơn vị còn hoạt động và người trả
						lời.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	if (hinh === "loi")
		return (
			<Empty data-trang-thai="ST-mocoi-loi">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={WarningAlt} />
					</EmptyMedia>
					<EmptyTitle>Không tải được danh sách</EmptyTitle>
					<EmptyDescription>
						Mạng hoặc máy chủ đang lỗi. Số khác của sức khoẻ vẫn xem được.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="sm" variant="outline">
						<Icon icon={Renew} data-icon="inline-start" />
						Thử lại
					</Button>
				</EmptyContent>
			</Empty>
		);
	return (
		<ItemGroup className="gap-2">
			{MO_COI.map((m) => (
				<DongMoCoi key={m.id} m={m} />
			))}
		</ItemGroup>
	);
}

export function SucKhoeMoCoi({ hinh }: { hinh: HinhMoCoi }) {
	return (
		<div className="flex flex-col gap-6" data-suc-khoe>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="#">Toàn cảnh</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>Sức khoẻ chương trình</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
			<StatGroup className="rounded-lg">
				<StatCard
					description="Tuần 21/09 – 27/09"
					label="KR cập nhật đúng tuần"
					value="41/58"
				/>
				<StatCard
					description="Không có lần cập nhật nào từ 14 ngày"
					label="KR im"
					value="5"
				/>
				<StatCard
					description="Đơn vị lưu trữ, không ai sửa được, người đã rời"
					label="OKR mồ côi"
					value={hinh === "co" ? String(MO_COI.length) : "—"}
				/>
			</StatGroup>
			<Card data-khoi-mo-coi={hinh}>
				<CardHeader>
					<CardTitle>OKR mồ côi</CardTitle>
					<CardDescription>
						Mục tiêu ở {KY} mà không ai trả lời được: đơn vị đã lưu trữ, không
						ai sửa được, hoặc người phụ trách đã rời. Chỉ quản trị thấy khối
						này.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<NoiDungMoCoi hinh={hinh} />
				</CardContent>
			</Card>
		</div>
	);
}
