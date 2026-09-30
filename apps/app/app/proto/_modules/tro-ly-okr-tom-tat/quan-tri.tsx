"use client";

import { Badge } from "@crm/ui/components/badge";
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
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Sheet,
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
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { cn } from "@crm/ui/lib/utils";
import {
	BAN_MO,
	type HangQuanTri,
	NHAN_MA_BO,
	PHONG,
	QUAN_TRI,
	type TrangThaiBan,
} from "./du-lieu";

export type HinhQuanTri = "co" | "rong" | "ngan";

const TRANG_THAI = {
	"da-hien": { nhan: "Đã hiện", tone: "success" },
	"qua-kiem-an": { nhan: "Qua bộ kiểm, chỉ quản trị thấy", tone: "info" },
	"giu-lai": { nhan: "Giữ lại", tone: "warning" },
	"khong-lam-duoc": { nhan: "Không làm được", tone: "error" },
	"dang-soan": { nhan: "Đang soạn", tone: "neutral" },
	"chua-cap-nhat": { nhan: "Chưa có cập nhật", tone: "neutral" },
} satisfies Record<TrangThaiBan, { nhan: string; tone: StatusTone }>;

const CELL = "px-3 py-2.5 align-top";

const COT = [
	{ id: "phong", header: "Phòng ban" },
	{
		id: "nac",
		header: "Nấc",
		width: "w-28",
		className: "hidden md:table-cell",
	},
	{
		id: "trang-thai",
		header: "Trạng thái",
		className: "hidden md:table-cell",
	},
	{ id: "cau", header: "Câu", width: "w-16", align: "right" },
	{
		id: "bo",
		header: "Câu bị bỏ",
		width: "w-24",
		align: "right",
		className: "hidden md:table-cell",
	},
	{
		id: "phan-hoi",
		header: "Hữu ích / không",
		width: "w-32",
		align: "right",
		className: "hidden md:table-cell",
	},
] satisfies SimpleTableColumn[];

function So({ n }: { n: number | null }) {
	return (
		<span className={cn("tabular-nums", n === null && "text-muted-foreground")}>
			{n ?? "—"}
		</span>
	);
}

function Nac({ nac }: { nac: HangQuanTri["nac"] }) {
	return nac === "bat" ? (
		<Badge variant="secondary">Bật</Badge>
	) : (
		<Badge variant="outline">Chế độ ẩn</Badge>
	);
}

function TrangThai({ h }: { h: HangQuanTri }) {
	const t = TRANG_THAI[h.trangThai];
	return (
		<StatusIndicator
			busy={h.trangThai === "dang-soan"}
			label={t.nhan}
			size="sm"
			tone={t.tone}
		/>
	);
}

function DongQuanTri({ h }: { h: HangQuanTri }) {
	const coBan = h.cau !== null;
	return (
		<SimpleTableRow clickable={coBan} data-phong={h.id}>
			<TableCell className={`${CELL} whitespace-normal`}>
				<span className="block text-sm" translate="no">
					{h.phong}
				</span>
				<span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
					<Nac nac={h.nac} />
					<TrangThai h={h} />
					{h.bo ? (
						<span className="text-muted-foreground text-xs tabular-nums">
							bỏ {h.bo}
						</span>
					) : null}
				</span>
			</TableCell>
			<TableCell className={`${CELL} hidden md:table-cell`}>
				<Nac nac={h.nac} />
			</TableCell>
			<TableCell className={`${CELL} hidden md:table-cell`}>
				<TrangThai h={h} />
			</TableCell>
			<TableCell className={`${CELL} text-right`}>
				<So n={h.cau} />
			</TableCell>
			<TableCell className={`${CELL} hidden text-right md:table-cell`}>
				<So n={h.bo} />
			</TableCell>
			<TableCell className={`${CELL} hidden text-right md:table-cell`}>
				{h.huuIch === null ? (
					<So n={null} />
				) : (
					<span className="tabular-nums">
						{h.huuIch} / {h.khongHuuIch}
					</span>
				)}
			</TableCell>
		</SimpleTableRow>
	);
}

function NganMotBan() {
	const tong = BAN_MO.con.length + BAN_MO.bo.length;
	return (
		<Sheet open>
			<SheetContent data-ngan-ban size="md">
				<SheetHeader>
					<SheetTitle>
						<span translate="no">{BAN_MO.phong}</span> · tuần {BAN_MO.tuan}
					</SheetTitle>
					<SheetDescription>
						Bật · Giữ lại — bỏ {BAN_MO.bo.length}/{tong} câu, quá 30% nên không
						hiện cho ai.
					</SheetDescription>
				</SheetHeader>
				<div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-4 pb-6">
					<section aria-labelledby="cau-con" className="flex flex-col gap-3">
						<h3 className="font-medium" id="cau-con">
							Câu còn lại · {BAN_MO.con.length}
						</h3>
						{BAN_MO.con.map((c) => (
							<div className="flex flex-col gap-1 border-b pb-3" key={c.van}>
								<p translate="no">{c.van}</p>
								<p className="text-muted-foreground">
									Nguồn: <span translate="no">{c.nguon}</span>
								</p>
							</div>
						))}
					</section>
					<section aria-labelledby="cau-bo" className="flex flex-col gap-3">
						<h3 className="font-medium" id="cau-bo">
							Câu bị bỏ · {BAN_MO.bo.length}
						</h3>
						{BAN_MO.bo.map((c) => (
							<div
								className="flex flex-col gap-1 border-b pb-3"
								data-ma-bo={c.ma}
								key={c.ma}
							>
								<p>
									<del className="text-muted-foreground" translate="no">
										{c.van}
									</del>
								</p>
								<StatusIndicator
									label={NHAN_MA_BO[c.ma]}
									size="sm"
									tone="warning"
								/>
								<p className="text-muted-foreground">{c.chiTiet}</p>
							</div>
						))}
					</section>
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function QuanTriTomTat({ hinh }: { hinh: HinhQuanTri }) {
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
			<Card data-khoi="tom-tat-quan-tri">
				<CardHeader>
					<CardTitle>Tóm tắt tuần của Trợ lý OKR</CardTitle>
					<CardDescription>
						Tuần {PHONG.tuan} · mọi phòng ban có việc tóm tắt, cả nấc bật và chế
						độ ẩn. Bấm một phòng để xem câu còn lại và câu bị bỏ.
					</CardDescription>
				</CardHeader>
				{hinh === "rong" ? (
					<CardContent>
						<Empty>
							<EmptyHeader>
								<EmptyTitle>Tuần này chưa có tóm tắt nào</EmptyTitle>
								<EmptyDescription>
									Việc tóm tắt chạy lúc 06:00 sáng hôm sau ngày cập nhật của chu
									kỳ, cho phòng ban ở nấc bật hay chế độ ẩn có ít nhất một lần
									Cập nhật tuần.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</CardContent>
				) : (
					<SimpleTable columns={COT} surface="page">
						{QUAN_TRI.map((h) => (
							<DongQuanTri h={h} key={h.id} />
						))}
					</SimpleTable>
				)}
			</Card>
			{hinh === "ngan" ? <NganMotBan /> : null}
		</div>
	);
}
