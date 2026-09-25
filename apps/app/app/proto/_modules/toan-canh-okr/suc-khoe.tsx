"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatCard } from "@crm/ui/components/stat-card";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { cn } from "@crm/ui/lib/utils";
import { KY } from "../ban-mau-okr/du-lieu";
import { DangTai, Loi, TenNguoi, ThanhTienDo } from "../ban-mau-okr/phan-chung";
import { type HangSucKhoe, SUC_KHOE } from "./du-lieu";

export type HinhSucKhoe =
	| "co-du-lieu"
	| "cai-dat"
	| "tuan-dau"
	| "khong-quyen"
	| "dang-tai"
	| "loi";

const COT = [
	{ id: "don-vi", header: "Đơn vị", width: "w-[24%]" },
	{ id: "dung-tuan", header: "Cập nhật đúng tuần", width: "w-[24%]" },
	{ id: "im", header: "KR im", align: "right" },
	{ id: "khoi-diem", header: "Chưa có khởi điểm", align: "right" },
	{ id: "kenh", header: "Chưa nối kênh nhắc", align: "right" },
] satisfies SimpleTableColumn[];

function So({ n }: { n: number }) {
	return (
		<span className={cn("tabular-nums", n === 0 && "text-muted-foreground")}>
			{n}
		</span>
	);
}

function DongSucKhoe({ h, tuanDau }: { h: HangSucKhoe; tuanDau: boolean }) {
	const phanTram = Math.round((h.dungTuan / h.tongKr) * 100);
	return (
		<SimpleTableRow data-don-vi={h.id}>
			<TableCell className="px-3 py-2.5 align-top whitespace-normal">
				<span
					className={cn(
						"block",
						h.cap === "bo-phan" ? "font-medium" : "ps-4 text-muted-foreground",
					)}
					translate="no"
				>
					{h.ten}
				</span>
				<span className={cn("block text-xs", h.cap === "phong-ban" && "ps-4")}>
					{h.truong ? (
						<TenNguoi avatar={false} ten={h.truong.ten} />
					) : (
						<StatusIndicator label="Chưa có trưởng" size="sm" tone="warning" />
					)}
				</span>
			</TableCell>
			<TableCell className="px-3 py-2.5 align-top">
				{tuanDau ? (
					<span className="text-muted-foreground">—</span>
				) : (
					<span className="flex items-center gap-3">
						<ThanhTienDo
							kyVong={null}
							nhan={`${h.ten} cập nhật đúng tuần`}
							phanTram={phanTram}
						/>
						<span className="w-12 shrink-0 text-right text-xs tabular-nums">
							{h.dungTuan}/{h.tongKr}
						</span>
					</span>
				)}
			</TableCell>
			<TableCell className="px-3 py-2.5 text-right align-top">
				<So n={tuanDau ? 0 : h.krIm} />
			</TableCell>
			<TableCell className="px-3 py-2.5 text-right align-top">
				<So n={h.chuaCongBo} />
			</TableCell>
			<TableCell className="px-3 py-2.5 text-right align-top">
				<So n={h.chuaNoiKenh} />
			</TableCell>
		</SimpleTableRow>
	);
}

function NoiDungSucKhoe({ tuanDau }: { tuanDau: boolean }) {
	return (
		<>
			<StatGroup className="rounded-lg">
				<StatCard
					description={
						tuanDau ? "Hạn đầu tiên: Thứ Hai 09/11" : "Tuần 23/11 – 29/11"
					}
					label="KR cập nhật đúng tuần"
					value={tuanDau ? "—" : "30/46"}
				/>
				<StatCard
					description="Không có lần cập nhật nào từ 14 ngày"
					label="KR im"
					value={tuanDau ? "—" : "6"}
				/>
				<StatCard
					description="Thuộc mục tiêu chưa công bố"
					label="KR chưa có khởi điểm"
					value="6"
				/>
				<StatCard
					description="Không nhận được tin nhắc buổi sáng"
					label="Người chưa nối kênh nhắc"
					value="10"
				/>
			</StatGroup>
			<Card>
				<CardHeader>
					<CardTitle>Theo đơn vị</CardTitle>
					<CardDescription>
						Để biết nên kèm đơn vị nào — không để chấm điểm người. Bộ phận gộp
						số của các phòng ban thụt vào bên dưới.
					</CardDescription>
				</CardHeader>
				<SimpleTable columns={COT}>
					{SUC_KHOE.map((h) => (
						<DongSucKhoe h={h} key={h.id} tuanDau={tuanDau} />
					))}
				</SimpleTable>
			</Card>
		</>
	);
}

export function SucKhoe({ hinh }: { hinh: HinhSucKhoe }) {
	if (hinh === "dang-tai") return <DangTai dong={2} />;
	if (hinh === "loi")
		return (
			<Loi cau="Không tính được sức khoẻ chương trình. Toàn cảnh vẫn xem được." />
		);
	if (hinh === "khong-quyen")
		return (
			<Empty className="rounded-lg border">
				<EmptyHeader>
					<EmptyTitle>Chỉ quản trị xem được sức khoẻ chương trình</EmptyTitle>
					<EmptyDescription>
						Số theo đơn vị của {KY.ten} vẫn xem được ở Toàn cảnh.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);

	if (hinh === "cai-dat")
		return (
			<div className="flex flex-col gap-4" data-ban-mau="suc-khoe-cai-dat">
				<p className="text-muted-foreground text-sm">
					Hướng B — một section dưới Cài đặt › Chương trình OKR, cạnh bảng chu
					kỳ và cấu hình. Khung Cài đặt rộng 820px nên bảng năm cột bị ép.
				</p>
				<NoiDungSucKhoe tuanDau={false} />
			</div>
		);

	return (
		<div className="flex flex-col gap-6" data-ban-mau="suc-khoe">
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
			<p className="text-muted-foreground text-sm">
				Hướng A (máy khuyên) — trang riêng trong khu OKR, đi từ nút «Sức khoẻ
				chương trình» ở đầu Toàn cảnh; chỉ quản trị thấy nút. Bảng theo đơn vị
				dùng đủ bề ngang.
			</p>
			<NoiDungSucKhoe tuanDau={hinh === "tuan-dau"} />
		</div>
	);
}
