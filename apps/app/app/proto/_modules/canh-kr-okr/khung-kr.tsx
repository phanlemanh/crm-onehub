"use client";

import Add from "@carbon/icons-react/es/Add";
import Attachment from "@carbon/icons-react/es/Attachment";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Launch from "@carbon/icons-react/es/Launch";
import Locked from "@carbon/icons-react/es/Locked";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Portfolio from "@carbon/icons-react/es/Portfolio";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { PickListDialog } from "@crm/ui/components/pick-list-dialog";
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
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { NGUOI } from "../ban-mau-okr/du-lieu";
import { DangTai, TenNguoi } from "../ban-mau-okr/phan-chung";
import {
	BANG_CHUNG_K3,
	type BangChungMau,
	DEM_VIEC,
	DONG_GOC_MAT,
	DONG_K1,
	type DongCanh,
	KR_CANH,
	type KrCanh,
	LUA_CHON_KE_HOACH,
	MUC_TIEU,
	type SangKienMau,
	type ViecMau,
} from "./du-lieu";

export type HinhKhungKr =
	| "co-viec"
	| "rong"
	| "dang-tai"
	| "loi"
	| "chi-okr"
	| "goc-mat"
	| "khoa"
	| "them"
	| "gan"
	| "bang-chung"
	| "bang-chung-rong"
	| "bang-chung-sai";

const CELL = "px-3 py-2 align-top";

function SoViec({ kr, sua }: { kr: KrCanh; sua: boolean }) {
	const d = DEM_VIEC.get(kr.id);
	if (!d || d.tong + d.sangKien === 0) {
		return sua ? (
			<Button size="sm" variant="ghost" data-mo-khung-kr={kr.id}>
				<Icon icon={Add} data-icon="inline-start" />
				Thêm
			</Button>
		) : (
			<span className="text-muted-foreground">—</span>
		);
	}
	return (
		<Button
			size="sm"
			variant="ghost"
			data-mo-khung-kr={kr.id}
			aria-label={`Mở việc của KR ${kr.ten}`}
		>
			<span className="tabular-nums">
				{d.xong}/{d.tong}
			</span>
			{d.sangKien > 0 ? (
				<span className="text-muted-foreground">· {d.sangKien} sáng kiến</span>
			) : null}
		</Button>
	);
}

export function BangKrCoViec({ sua = true }: { sua?: boolean }) {
	const cot: SimpleTableColumn[] = [
		{ id: "ten", header: "KR" },
		{ id: "phu-trach", header: "Phụ trách" },
		{ id: "so", header: "Hiện tại", align: "right" },
		{ id: "viec", header: "Việc" },
	];
	return (
		<SimpleTable columns={cot}>
			{KR_CANH.map((kr) => (
				<SimpleTableRow key={kr.id} data-kr={kr.id}>
					<TableCell className={CELL}>
						<span className="flex flex-col gap-1">
							<span translate="no">{kr.ten}</span>
							{kr.kieu === "moc" && kr.xong ? (
								<span>
									<Badge variant="outline">
										<Icon icon={Attachment} data-icon="inline-start" />
										Có bằng chứng
									</Badge>
								</span>
							) : null}
						</span>
					</TableCell>
					<TableCell className={CELL}>
						<TenNguoi ten={kr.phuTrach.ten} />
					</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{kr.so}
					</TableCell>
					<TableCell className={CELL}>
						<SoViec kr={kr} sua={sua} />
					</TableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function DongViec({ v, khoa }: { v: ViecMau; khoa: boolean }) {
	return (
		<Item size="sm" variant="outline" data-viec={v.id}>
			<ItemMedia>
				<Checkbox
					aria-label={`Đánh dấu xong: ${v.tieuDe}`}
					checked={v.xong}
					disabled={khoa}
				/>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span
						className={v.xong ? "text-muted-foreground line-through" : ""}
						translate="no"
					>
						{v.tieuDe}
					</span>
				</ItemTitle>
				<ItemDescription>
					<span className="inline-flex flex-wrap items-center gap-2">
						<TenNguoi avatar={false} ten={v.nguoiLam.ten} />
						{v.daRoi ? <Badge variant="outline">đã rời</Badge> : null}
						{v.han ? (
							<span className={v.quaHan && !v.xong ? "text-destructive" : ""}>
								Hạn {v.han}
								{v.quaHan && !v.xong ? " · quá hạn" : ""}
							</span>
						) : null}
					</span>
				</ItemDescription>
			</ItemContent>
			{khoa ? null : (
				<ItemActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={`Thao tác với việc ${v.tieuDe}`}
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem>Sửa</DropdownMenuItem>
							<DropdownMenuItem>
								{v.daRoi ? "Giao lại" : "Đổi người làm"}
							</DropdownMenuItem>
							<DropdownMenuItem variant="destructive">Gỡ</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ItemActions>
			)}
		</Item>
	);
}

const TONE_SANG_KIEN = {
	"dang-chay": "success",
	"da-dong": "neutral",
	"da-luu-tru": "neutral",
	"da-xoa": "warning",
} as const;

const NHAN_SANG_KIEN = {
	"dang-chay": "Đang chạy",
	"da-dong": "Đã đóng",
	"da-luu-tru": "Đã lưu trữ",
	"da-xoa": "Đã xoá",
} as const;

function DongSangKien({
	s,
	chiOkr,
	khoa,
}: {
	s: SangKienMau;
	chiOkr: boolean;
	khoa: boolean;
}) {
	const loai = s.loai === "chien-dich" ? "chiến dịch" : "kế hoạch 30 ngày";
	return (
		<Item size="sm" variant="outline" data-sang-kien={s.id}>
			<ItemMedia variant="icon">
				<Icon icon={s.loai === "chien-dich" ? Bullhorn : Portfolio} />
			</ItemMedia>
			<ItemContent>
				{chiOkr ? (
					<>
						<ItemTitle>
							Một {loai}
							<Icon icon={Locked} aria-hidden="true" />
						</ItemTitle>
						<ItemDescription>
							Bạn không có quyền xem {loai} này.
						</ItemDescription>
					</>
				) : (
					<>
						<ItemTitle>
							<span translate="no">{s.ten}</span>
						</ItemTitle>
						<ItemDescription>
							<span className="inline-flex flex-wrap items-center gap-2">
								<StatusIndicator
									label={NHAN_SANG_KIEN[s.trangThai]}
									size="sm"
									tone={TONE_SANG_KIEN[s.trangThai]}
								/>
								<span>{s.chiTiet}</span>
							</span>
						</ItemDescription>
					</>
				)}
			</ItemContent>
			{chiOkr ? null : (
				<ItemActions>
					{s.trangThai === "da-xoa" ? null : (
						<Button aria-label={`Mở ${loai}`} size="icon-sm" variant="ghost">
							<Icon icon={Launch} />
						</Button>
					)}
					{khoa ? null : (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									aria-label={`Thao tác với sáng kiến ${s.ten}`}
									size="icon-sm"
									variant="ghost"
								>
									<Icon icon={OverflowMenuHorizontal} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem variant="destructive">
									Gỡ khỏi KR
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</ItemActions>
			)}
		</Item>
	);
}

function DongNhap() {
	return (
		<Item size="sm" variant="outline" data-dong-nhap>
			<ItemContent className="gap-2">
				<Field>
					<FieldLabel htmlFor="viec-moi">Việc</FieldLabel>
					<Input
						autoComplete="off"
						defaultValue="Gọi lại 20 đối tác cũ"
						id="viec-moi"
						name="tieu-de-viec"
						placeholder="Việc sẽ làm để đẩy KR này…"
					/>
					<FieldDescription>Enter để lưu, Esc để huỷ.</FieldDescription>
				</Field>
				<div className="grid gap-2 sm:grid-cols-2">
					<Field>
						<FieldLabel htmlFor="nguoi-lam">Người làm</FieldLabel>
						<Select defaultValue={NGUOI.khoa.id}>
							<SelectTrigger id="nguoi-lam">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[NGUOI.nga, NGUOI.khoa, NGUOI.thao, NGUOI.mai].map((n) => (
									<SelectItem key={n.id} value={n.id}>
										{n.ten}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel htmlFor="han-viec">Hạn (tuỳ chọn)</FieldLabel>
						<DatePicker id="han-viec" onChange={() => {}} value={null} />
					</Field>
				</div>
				<div className="flex justify-end gap-2">
					<Button size="sm" variant="ghost">
						Huỷ
					</Button>
					<Button size="sm">Lưu việc</Button>
				</div>
			</ItemContent>
		</Item>
	);
}

function TabViec({
	dong,
	chiOkr,
	khoa,
	them,
}: {
	dong: DongCanh[];
	chiOkr: boolean;
	khoa: boolean;
	them: boolean;
}) {
	const suaDuoc = !chiOkr && !khoa;
	return (
		<div className="flex flex-col gap-3">
			{khoa ? (
				<p className="text-muted-foreground text-sm">
					Kỳ đang chấm điểm — việc và sáng kiến chỉ đọc.
				</p>
			) : null}
			<ItemGroup className="gap-2">
				{dong.map((d) =>
					d.loai === "viec" ? (
						<DongViec key={d.id} khoa={khoa || chiOkr} v={d} />
					) : (
						<DongSangKien chiOkr={chiOkr} key={d.id} khoa={khoa} s={d} />
					),
				)}
				{them ? <DongNhap /> : null}
			</ItemGroup>
			{suaDuoc ? (
				<div className="flex flex-wrap gap-2">
					<Button size="sm" variant="outline" data-nut="them-viec">
						<Icon icon={Add} data-icon="inline-start" />
						Thêm việc
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="sm" variant="outline" data-nut="gan-sang-kien">
								Gắn…
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuItem>Kế hoạch 30 ngày</DropdownMenuItem>
							<DropdownMenuItem>Chiến dịch</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			) : null}
		</div>
	);
}

function DongBangChung({ b }: { b: BangChungMau }) {
	return (
		<Item size="sm" variant="outline" data-bang-chung={b.id}>
			<ItemMedia variant="icon">
				<Icon icon={Attachment} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<a
						className="underline-offset-4 hover:underline"
						href={b.url}
						rel="noopener noreferrer"
						target="_blank"
						translate="no"
					>
						{b.tenMien}
					</a>
				</ItemTitle>
				<ItemDescription>
					<span translate="no">{b.ghiChu}</span> · {b.nguoi.ten} · {b.ngay}
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							aria-label={`Thao tác với bằng chứng ${b.tenMien}`}
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem variant="destructive">Gỡ</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	);
}

function HopThoaiBangChung({ sai }: { sai: boolean }) {
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Đính bằng chứng</DialogTitle>
					<DialogDescription>
						Dán đường dẫn tới văn bản, biên bản hay trang cho thấy mốc đã xong.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<Field data-invalid={sai || undefined}>
						<FieldLabel htmlFor="duong-dan">Đường dẫn</FieldLabel>
						<Input
							aria-invalid={sai || undefined}
							autoComplete="off"
							defaultValue={
								sai
									? "drive.google.com/bien-ban"
									: "https://drive.google.com/bien-ban"
							}
							id="duong-dan"
							inputMode="url"
							name="duong-dan"
							spellCheck={false}
							type="url"
						/>
						{sai ? (
							<FieldError>
								Đường dẫn phải bắt đầu bằng http:// hoặc https://
							</FieldError>
						) : null}
					</Field>
					<Field>
						<FieldLabel htmlFor="ghi-chu-bc">Ghi chú (tuỳ chọn)</FieldLabel>
						<Textarea
							id="ghi-chu-bc"
							name="ghi-chu"
							placeholder="Bằng chứng này cho thấy gì…"
						/>
						<FieldDescription>Tối đa 300 ký tự.</FieldDescription>
					</Field>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled={sai}>Đính</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function TabBangChung({ rong }: { rong: boolean }) {
	if (rong) {
		return (
			<Empty className="rounded-lg border">
				<EmptyHeader>
					<EmptyTitle>Chưa có bằng chứng</EmptyTitle>
					<EmptyDescription>
						Đính đường dẫn cho thấy mốc này đã xong — không bắt buộc.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="sm" variant="outline">
						<Icon icon={Add} data-icon="inline-start" />
						Đính bằng chứng
					</Button>
				</EmptyContent>
			</Empty>
		);
	}
	return (
		<div className="flex flex-col gap-3">
			<ItemGroup className="gap-2">
				{BANG_CHUNG_K3.map((b) => (
					<DongBangChung b={b} key={b.id} />
				))}
			</ItemGroup>
			<div>
				<Button size="sm" variant="outline">
					<Icon icon={Add} data-icon="inline-start" />
					Đính bằng chứng
				</Button>
			</div>
		</div>
	);
}

function RongViec() {
	return (
		<Empty className="rounded-lg border">
			<EmptyHeader>
				<EmptyTitle>Chưa có việc hay sáng kiến nào cho KR này</EmptyTitle>
				<EmptyDescription>
					Ghi việc đơn vị sẽ làm, hoặc gắn một kế hoạch 30 ngày hay chiến dịch
					đang đẩy KR này.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button size="sm" variant="outline">
					<Icon icon={Add} data-icon="inline-start" />
					Thêm việc
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function LoiViec() {
	return (
		<Empty className="rounded-lg border">
			<EmptyHeader>
				<EmptyTitle>Không tải được việc của KR này</EmptyTitle>
				<EmptyDescription>Mạng hoặc máy chủ đang lỗi.</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button size="sm" variant="outline">
					Thử lại
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function krCua(hinh: HinhKhungKr): KrCanh {
	if (hinh.startsWith("bang-chung")) return KR_CANH[2] as KrCanh;
	if (hinh === "rong") return KR_CANH[3] as KrCanh;
	return KR_CANH[0] as KrCanh;
}

export function KhungKr({ hinh }: { hinh: HinhKhungKr }) {
	const kr = krCua(hinh);
	const tab = hinh.startsWith("bang-chung") ? "bang-chung" : "viec";
	const chiOkr = hinh === "chi-okr";
	const khoa = hinh === "khoa";
	let noiDung = null;
	if (hinh === "dang-tai") noiDung = <DangTai dong={3} />;
	else if (hinh === "loi") noiDung = <LoiViec />;
	else if (hinh === "rong") noiDung = <RongViec />;
	else if (tab === "bang-chung")
		noiDung = <TabBangChung rong={hinh === "bang-chung-rong"} />;
	else
		noiDung = (
			<TabViec
				chiOkr={chiOkr}
				dong={hinh === "goc-mat" ? DONG_GOC_MAT : DONG_K1}
				khoa={khoa}
				them={hinh === "them"}
			/>
		);
	return (
		<>
			<Sheet open>
				<SheetContent className="w-full sm:max-w-2xl" side="right">
					<SheetHeader>
						<SheetTitle>
							<span translate="no">{kr.ten}</span>
						</SheetTitle>
						<SheetDescription>
							KR của «{MUC_TIEU.ten}» · {kr.phuTrach.ten} phụ trách · {kr.so}
						</SheetDescription>
					</SheetHeader>
					<div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
						<Tabs value={tab}>
							<TabsList
								aria-label="Khung KR"
								className="w-full justify-start gap-6 border-b"
								variant="line"
							>
								<TabsTrigger value="viec">Việc và sáng kiến</TabsTrigger>
								{kr.kieu === "moc" ? (
									<TabsTrigger value="bang-chung">Bằng chứng</TabsTrigger>
								) : null}
							</TabsList>
						</Tabs>
						{noiDung}
					</div>
				</SheetContent>
			</Sheet>
			{hinh === "gan" ? (
				<PickListDialog
					cancelLabel="Huỷ"
					confirmLabel={(n) => (n > 0 ? `Gắn ${n} kế hoạch` : "Gắn")}
					description="Chọn kế hoạch 30 ngày đang đẩy KR này. Tên và tiến độ đọc thẳng từ kế hoạch, không chép."
					emptyLabel="Không có kế hoạch nào khớp"
					items={LUA_CHON_KE_HOACH}
					onConfirm={() => {}}
					onOpenChange={() => {}}
					onSelectedChange={() => {}}
					open
					searchPlaceholder="Tìm theo tên công ty…"
					selected={["p2"]}
					title="Gắn kế hoạch 30 ngày"
				/>
			) : null}
			{hinh === "bang-chung-sai" ? <HopThoaiBangChung sai /> : null}
		</>
	);
}

export function HopThoaiCapNhatMoc() {
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Cập nhật KR</DialogTitle>
					<DialogDescription translate="no">
						Bộ câu hỏi thường gặp công bố cho đối tác
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<Field>
						<FieldLabel>Mốc</FieldLabel>
						<ToggleGroup type="single" value="xong" variant="outline">
							<ToggleGroupItem value="chua">Chưa xong</ToggleGroupItem>
							<ToggleGroupItem value="xong">Xong</ToggleGroupItem>
						</ToggleGroup>
					</Field>
					<Field>
						<FieldLabel htmlFor="bc-cap-nhat">Bằng chứng (tuỳ chọn)</FieldLabel>
						<Input
							autoComplete="off"
							id="bc-cap-nhat"
							inputMode="url"
							name="bang-chung"
							placeholder="https://…"
							spellCheck={false}
							type="url"
						/>
						<FieldDescription>
							Đường dẫn tới văn bản cho thấy mốc đã xong. Lúc chấm cuối kỳ,
							người chấm sẽ thấy nó.
						</FieldDescription>
					</Field>
					<Field>
						<FieldLabel>Mức tự tin</FieldLabel>
						<ToggleGroup type="single" value="cao" variant="outline">
							<ToggleGroupItem value="cao">Cao</ToggleGroupItem>
							<ToggleGroupItem value="vua">Vừa</ToggleGroupItem>
							<ToggleGroupItem value="thap">Thấp</ToggleGroupItem>
						</ToggleGroup>
					</Field>
					<Field>
						<FieldLabel htmlFor="ghi-chu-cn">Ghi chú</FieldLabel>
						<Textarea id="ghi-chu-cn" name="ghi-chu" />
					</Field>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button>Gửi cập nhật</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function KhungMucTieuNen({
	children,
	tab = "kr",
}: {
	children?: React.ReactNode;
	tab?: "kr" | "trao-doi";
}) {
	return (
		<div
			className="flex flex-col gap-4 rounded-lg border p-4"
			data-khung-muc-tieu
		>
			<div className="flex flex-col gap-1">
				<span className="font-medium" translate="no">
					{MUC_TIEU.ten}
				</span>
				<span className="text-muted-foreground text-sm">
					{MUC_TIEU.donVi} · {MUC_TIEU.ky}
				</span>
			</div>
			<Tabs value={tab}>
				<TabsList
					aria-label="Khung mục tiêu"
					className="w-full justify-start gap-6 border-b"
					variant="line"
				>
					<TabsTrigger value="kr">KR</TabsTrigger>
					<TabsTrigger value="can-chinh">Căn chỉnh</TabsTrigger>
					<TabsTrigger value="vet">Vết</TabsTrigger>
					<TabsTrigger value="trao-doi">Trao đổi</TabsTrigger>
					<TabsTrigger value="dien-bien">Diễn biến</TabsTrigger>
				</TabsList>
			</Tabs>
			{children ?? <BangKrCoViec />}
		</div>
	);
}
