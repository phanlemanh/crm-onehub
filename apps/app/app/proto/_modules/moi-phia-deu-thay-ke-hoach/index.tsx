"use client";

import Roadmap from "@carbon/icons-react/es/Roadmap";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardPanel,
	CardTitle,
} from "@crm/ui/components/card";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import {
	CONG_TY,
	COT_NGUOI_GIAO,
	DONG_TASKS,
	type DongTasksMau,
	KE_HOACH_CONG_TY,
	type KeHoachCongTyMau,
	THANH_VIEN,
} from "./du-lieu";

type TabKeHoach = "codulieu" | "rong" | "dangtai" | "loi";

const COT_KE_HOACH = [
	{ id: "ten", header: "Kế hoạch", width: "w-[34%]", className: "pl-5" },
	{
		id: "ngay",
		header: "Ngày",
		width: "w-[12%]",
		align: "right" as const,
		className: "max-sm:hidden",
	},
	{ id: "buoc", header: "Bước", width: "w-[12%]", align: "right" as const },
	{
		id: "tac",
		header: "Đang tắc ở",
		width: "w-[24%]",
		className: "max-sm:hidden",
	},
	{
		id: "cam",
		header: "Cầm trịch",
		width: "w-[18%]",
		className: "max-sm:hidden",
	},
];

function DongKeHoach({ hang }: { hang: KeHoachCongTyMau }) {
	return (
		<SimpleTableRow className="cursor-pointer">
			<TableCell className="pl-5">
				<span className="flex min-w-0 items-center gap-2">
					<span className="truncate font-medium" translate="no">
						{hang.ten}
					</span>
					{hang.dong ? <Badge variant="secondary">Đã đóng</Badge> : null}
				</span>
			</TableCell>
			<TableCell className="text-right tabular-nums max-sm:hidden">
				{hang.ngay}
			</TableCell>
			<TableCell className="text-right tabular-nums">{hang.buoc}</TableCell>
			<TableCell className="max-sm:hidden" translate="no">
				{hang.tacO ?? <EmptyCellValue />}
			</TableCell>
			<TableCell className="max-sm:hidden" translate="no">
				{hang.camTrich}
			</TableCell>
		</SimpleTableRow>
	);
}

function TabBaMuoiNgay({ hinh }: { hinh: TabKeHoach }) {
	if (hinh === "dangtai") {
		return (
			<DetailSheetBody>
				<div aria-live="polite" className="flex justify-center py-10">
					<Spinner />
				</div>
			</DetailSheetBody>
		);
	}
	if (hinh === "loi") {
		return (
			<DetailSheetBody>
				<div className="flex flex-col items-center gap-2 py-10 text-center">
					<p className="font-medium text-sm">Không tải được kế hoạch</p>
					<Button size="sm" variant="outline">
						Thử lại
					</Button>
				</div>
			</DetailSheetBody>
		);
	}
	if (hinh === "rong") {
		return (
			<DetailSheetBody>
				<DetailSheetEmpty
					action={<Button size="sm">Tạo kế hoạch</Button>}
					description="Tạo từ một khuôn; công ty đã điền sẵn."
					icon={Roadmap}
					title="Chưa có kế hoạch 30 ngày cho công ty này"
				/>
			</DetailSheetBody>
		);
	}
	return (
		<DetailSheetBody>
			<SimpleTable columns={COT_KE_HOACH}>
				{KE_HOACH_CONG_TY.map((hang) => (
					<DongKeHoach hang={hang} key={hang.id} />
				))}
				<SimpleTableRow>
					<TableCell className="pl-5 text-muted-foreground" colSpan={5}>
						+ Tạo kế hoạch
					</TableCell>
				</SimpleTableRow>
			</SimpleTable>
		</DetailSheetBody>
	);
}

function TongQuanCongTy() {
	return (
		<DetailSheetBody>
			<DetailSheetSection title="Chi tiết">
				<DetailSheetProperties>
					<DetailSheetProperty label="Lĩnh vực">
						{CONG_TY.linhVuc}
					</DetailSheetProperty>
					<DetailSheetProperty label="Chủ sở hữu">
						<EmptyCellValue />
					</DetailSheetProperty>
					<DetailSheetProperty label="Hạng đối tác">
						<EmptyCellValue />
					</DetailSheetProperty>
					<DetailSheetProperty label="Giá trị đang mở">
						<EmptyCellValue />
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

function SheetCongTy({ tab, hinh }: { tab: string; hinh: TabKeHoach }) {
	const [dang, setDang] = useState(tab);
	const tabs: DetailSheetTab[] = [
		{ value: "tong-quan", label: "Tổng quan", content: <TongQuanCongTy /> },
		{ value: "ca-nhan", label: "Cá nhân", count: 3, content: <span /> },
		{ value: "thoa-thuan", label: "Thoả thuận", count: 2, content: <span /> },
		{
			value: "ba-muoi-ngay",
			label: "30 ngày đầu",
			count: hinh === "rong" ? 0 : KE_HOACH_CONG_TY.length,
			content: <TabBaMuoiNgay hinh={hinh} />,
		},
		{ value: "hoat-dong", label: "Hoạt động", content: <span /> },
	];

	return (
		<DetailSheet onOpenChange={() => undefined} open>
			<DetailSheetHeader
				description={`${CONG_TY.linhVuc} · ${CONG_TY.thanhPho}`}
				media={<EntityLogo name={CONG_TY.ten} size="lg" />}
				title={<span translate="no">{CONG_TY.ten}</span>}
			/>
			<DetailSheetTabs onValueChange={setDang} tabs={tabs} value={dang} />
		</DetailSheet>
	);
}

function SheetCaNhan() {
	return (
		<DetailSheet onOpenChange={() => undefined} open>
			<DetailSheetHeader
				description="Môi giới · Nhà Xanh"
				title={<span translate="no">Trịnh Cẩm Thương</span>}
			/>
			<DetailSheetBody>
				<DetailSheetSection title="30 ngày đầu">
					<button
						className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
						type="button"
					>
						<span translate="no">One Mount</span>
						<span className="text-muted-foreground">đã đạt Có tài khoản</span>
					</button>
				</DetailSheetSection>
			</DetailSheetBody>
		</DetailSheet>
	);
}

function DongTasks({ dong }: { dong: DongTasksMau }) {
	return (
		<SimpleTableRow>
			<TableCell className="w-8">
				<Checkbox aria-label="Đánh dấu xong" checked={false} />
			</TableCell>
			<TableCell>
				<span className="flex min-w-0 flex-col" translate="no">
					<span className="truncate">{dong.nhan}</span>
					<span className="truncate text-muted-foreground">
						{dong.congTy}
						{dong.loai === "buoc" ? " · Kế hoạch 30 ngày" : ""}
					</span>
				</span>
			</TableCell>
			<TableCell className="text-right">
				<StatusIndicator
					label={dong.han}
					tone={dong.quaHan ? "error" : "neutral"}
				/>
			</TableCell>
		</SimpleTableRow>
	);
}

function TheTasks({ chiSapHan }: { chiSapHan: boolean }) {
	const dong = chiSapHan ? DONG_TASKS.filter((d) => !d.quaHan) : DONG_TASKS;
	const quaHan = dong.filter((d) => d.quaHan).length;
	return (
		<Card className="max-w-xl">
			<CardHeader>
				<CardTitle>Việc</CardTitle>
				<CardDescription>
					{quaHan > 0
						? `${quaHan} quá hạn`
						: `Không có gì quá hạn · ${dong.length} bước sắp hạn`}
				</CardDescription>
			</CardHeader>
			<CardPanel>
				<SimpleTable
					columns={[
						{ id: "tich", srLabel: "Xong", width: "w-8" },
						{ id: "viec", header: "Việc" },
						{ id: "han", header: "Hạn", align: "right", width: "w-32" },
					]}
					surface="page"
					variant="panel"
				>
					{dong.map((d) => (
						<DongTasks dong={d} key={d.id} />
					))}
				</SimpleTable>
			</CardPanel>
		</Card>
	);
}

function BangCotNguoiGiao() {
	return (
		<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
			{COT_NGUOI_GIAO.map((cot) => (
				<section className="flex flex-col gap-2" key={cot.ten}>
					<h3 className="font-medium text-sm" translate="no">
						{cot.ten}{" "}
						<span className="text-muted-foreground tabular-nums">
							{cot.the.length}
						</span>
					</h3>
					{cot.the.map((the) => (
						<div className="rounded-lg border bg-card p-3 text-sm" key={the}>
							<span translate="no">{the}</span>
						</div>
					))}
				</section>
			))}
		</div>
	);
}

function HopThoaiChuyen({ coViec }: { coViec: boolean }) {
	const [nguoi, setNguoi] = useState("");
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Chuyển việc 30 ngày của Hương Lê</DialogTitle>
					<DialogDescription>
						{coViec
							? "Hương Lê đang cầm trịch 2 kế hoạch và có 5 bước chưa xong. Chọn người nhận tất cả."
							: "Hương Lê không cầm trịch kế hoạch nào đang chạy và không có bước nào chưa xong."}
					</DialogDescription>
				</DialogHeader>
				{coViec ? (
					<Select onValueChange={setNguoi} value={nguoi}>
						<SelectTrigger aria-label="Người nhận">
							<SelectValue placeholder="Chọn người nhận" />
						</SelectTrigger>
						<SelectContent>
							{THANH_VIEN.filter((t) => t !== "Hương Lê").map((t) => (
								<SelectItem key={t} value={t}>
									{t}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : null}
				<DialogFooter>
					<Button variant="outline">Huỷ</Button>
					<Button disabled={!coViec || nguoi === ""}>Chuyển</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

const HINH = {
	"ST-congty-codulieu": () => (
		<SheetCongTy hinh="codulieu" tab="ba-muoi-ngay" />
	),
	"ST-congty-rong": () => <SheetCongTy hinh="rong" tab="ba-muoi-ngay" />,
	"ST-congty-dangtai": () => <SheetCongTy hinh="dangtai" tab="ba-muoi-ngay" />,
	"ST-congty-loi": () => <SheetCongTy hinh="loi" tab="ba-muoi-ngay" />,
	"ST-congty-lechsua": () => <SheetCongTy hinh="codulieu" tab="tong-quan" />,
	"ST-canhan-coghidanh": () => <SheetCaNhan />,
	"ST-tongquan-cobuoc": () => <TheTasks chiSapHan={false} />,
	"ST-tongquan-saphan": () => <TheTasks chiSapHan />,
	"ST-danhmuc-cotnguoigiao": () => <BangCotNguoiGiao />,
	"ST-chuyen-hoi": () => <HopThoaiChuyen coViec />,
	"ST-chuyen-khongviec": () => <HopThoaiChuyen coViec={false} />,
} as const;

export function MoiPhiaDeuThayKeHoachMau({ state }: { state: string }) {
	const ve =
		state in HINH
			? HINH[state as keyof typeof HINH]
			: HINH["ST-congty-codulieu"];
	return ve();
}
