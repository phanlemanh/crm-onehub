"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
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
import { Textarea } from "@crm/ui/components/textarea";

type Viec = "sua" | "go" | "an" | "hien-lai" | "mo-ra" | "sang-cham" | "mo-lai";

type Dong = {
	id: string;
	ten: string;
	loai: "Năm" | "Quý";
	tu: string;
	den: string;
	pha: string;
	tone: StatusTone;
	phu: string | null;
	viec: Viec[];
	anKhoa: string | null;
};

const DONG: Dong[] = [
	{
		id: "nam-2026",
		ten: "Năm 2026",
		loai: "Năm",
		tu: "01/01/2026",
		den: "31/12/2026",
		pha: "Đang chạy",
		tone: "success",
		phu: null,
		viec: ["sua", "an", "mo-ra", "sang-cham"],
		anKhoa: "Còn 2 quý đang hiện — ẩn hoặc gỡ quý trước",
	},
	{
		id: "quy-3",
		ten: "Quý 3/2026",
		loai: "Quý",
		tu: "01/07/2026",
		den: "30/09/2026",
		pha: "Đã đóng",
		tone: "neutral",
		phu: null,
		viec: ["an", "mo-lai"],
		anKhoa: null,
	},
	{
		id: "quy-4",
		ten: "Quý 4/2026",
		loai: "Quý",
		tu: "01/10/2026",
		den: "31/12/2026",
		pha: "Đang chạy",
		tone: "success",
		phu: null,
		viec: ["sua", "an", "mo-ra", "sang-cham"],
		anKhoa: null,
	},
	{
		id: "nam-2027",
		ten: "Năm 2027",
		loai: "Năm",
		tu: "01/01/2027",
		den: "31/12/2027",
		pha: "Lập kế hoạch",
		tone: "info",
		phu: null,
		viec: ["sua", "go"],
		anKhoa: null,
	},
	{
		id: "nam-2026-thu",
		ten: "Năm 2026 (thử)",
		loai: "Năm",
		tu: "01/01/2026",
		den: "31/12/2026",
		pha: "Đã ẩn",
		tone: "neutral",
		phu: "Ẩn 30/09 lúc pha Lập kế hoạch · Mở thử trước khi chốt lịch, còn 1 mục tiêu nháp",
		viec: ["hien-lai"],
		anKhoa: null,
	},
];

const NHAN_VIEC = {
	sua: "Sửa chu kỳ",
	go: "Gỡ chu kỳ",
	an: "Ẩn chu kỳ",
	"hien-lai": "Hiện lại",
	"mo-ra": "Mở rà giữa kỳ",
	"sang-cham": "Sang chấm điểm",
	"mo-lai": "Mở lại kỳ",
} as const satisfies Record<Viec, string>;

const VIEC_CU: readonly Viec[] = ["mo-ra", "sang-cham", "mo-lai"];

const COT: SimpleTableColumn[] = [
	{ id: "ten", header: "Tên" },
	{ id: "loai", header: "Loại", width: "w-24" },
	{ id: "tu", header: "Từ", width: "w-32" },
	{ id: "den", header: "Đến", width: "w-32" },
	{ id: "pha", header: "Pha", width: "w-36" },
	{ id: "hanhDong", srLabel: "Việc với chu kỳ", width: "w-12" },
];

type HinhMau =
	| { man: "bang"; menu: string | null; khoa: boolean }
	| { man: "sua"; dong: string; chiTen: boolean }
	| { man: "go" }
	| { man: "an" }
	| { man: "hien-lai" };

const HINH_THEO_STATE = {
	"ST-bang-an": { man: "bang", menu: null, khoa: false },
	"ST-menu-trong": { man: "bang", menu: "nam-2027", khoa: false },
	"ST-menu-co-du-lieu": { man: "bang", menu: "quy-4", khoa: false },
	"ST-menu-nam-con-quy": { man: "bang", menu: "nam-2026", khoa: false },
	"ST-menu-da-an": { man: "bang", menu: "nam-2026-thu", khoa: false },
	"ST-sua-moi-o": { man: "sua", dong: "nam-2027", chiTen: false },
	"ST-sua-chi-ten": { man: "sua", dong: "quy-4", chiTen: true },
	"ST-go": { man: "go" },
	"ST-an-ly-do": { man: "an" },
	"ST-hien-lai": { man: "hien-lai" },
	"ST-khong-quyen": { man: "bang", menu: null, khoa: true },
} satisfies Record<string, HinhMau>;

function MenuDong({
	dong,
	mo,
	khoa,
}: {
	dong: Dong;
	mo: boolean;
	khoa: boolean;
}) {
	const moi = dong.viec.filter((v) => !VIEC_CU.includes(v));
	const cu = dong.viec.filter((v) => VIEC_CU.includes(v));
	return (
		<DropdownMenu open={mo}>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Việc với chu kỳ"
					size="icon-sm"
					variant="ghost"
					disabled={khoa}
					data-menu-chu-ky={dong.id}
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				{moi.map((v) =>
					v === "an" && dong.anKhoa ? (
						<DropdownMenuItem key={v} disabled data-viec-chu-ky={v}>
							<span className="flex flex-col gap-0.5">
								<span>{NHAN_VIEC[v]}</span>
								<span className="text-muted-foreground text-xs">
									{dong.anKhoa}
								</span>
							</span>
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem key={v} data-viec-chu-ky={v}>
							{NHAN_VIEC[v]}
						</DropdownMenuItem>
					),
				)}
				{moi.length > 0 && cu.length > 0 ? <DropdownMenuSeparator /> : null}
				{cu.map((v) => (
					<DropdownMenuItem key={v} data-viec-chu-ky={v}>
						{NHAN_VIEC[v]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function BangChuKy({ menu, khoa }: { menu: string | null; khoa: boolean }) {
	return (
		<Card data-the="chu-ky">
			<CardHeader>
				<CardTitle>Chu kỳ</CardTitle>
				<CardDescription>
					Mở năm trước, rồi các quý trong năm. Pha chỉ đi tới.
				</CardDescription>
				<CardAction>
					<Button disabled={khoa}>
						<Icon icon={Add} data-icon="inline-start" />
						Mở chu kỳ
					</Button>
				</CardAction>
			</CardHeader>
			<SimpleTable columns={COT}>
				{DONG.map((d) => (
					<SimpleTableRow key={d.id} data-chu-ky={d.id}>
						<TableCell className="px-3 py-3 align-top whitespace-normal">
							<span className="flex flex-col gap-0.5">
								<span
									translate="no"
									className={
										d.pha === "Đã ẩn" ? "text-muted-foreground" : undefined
									}
								>
									{d.ten}
								</span>
								{d.phu ? (
									<span className="text-muted-foreground text-xs">{d.phu}</span>
								) : null}
							</span>
						</TableCell>
						<TableCell className="px-3 py-3 align-top text-muted-foreground">
							{d.loai}
						</TableCell>
						<TableCell className="px-3 py-3 align-top tabular-nums">
							{d.tu}
						</TableCell>
						<TableCell className="px-3 py-3 align-top tabular-nums">
							{d.den}
						</TableCell>
						<TableCell className="px-3 py-3 align-top">
							<StatusIndicator label={d.pha} size="sm" tone={d.tone} />
						</TableCell>
						<TableCell className="px-3 py-3 align-top text-right">
							<MenuDong dong={d} mo={menu === d.id} khoa={khoa} />
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</Card>
	);
}

const THU = [
	"Thứ Hai",
	"Thứ Ba",
	"Thứ Tư",
	"Thứ Năm",
	"Thứ Sáu",
	"Thứ Bảy",
	"Chủ Nhật",
];

function SheetSua({ dong, chiTen }: { dong: Dong; chiTen: boolean }) {
	return (
		<Sheet open>
			<SheetContent side="right" data-sheet-sua-chu-ky>
				<SheetHeader>
					<SheetTitle>
						Sửa <span translate="no">{dong.ten}</span>
					</SheetTitle>
					<SheetDescription>
						{chiTen
							? `${dong.ten} đã có mục tiêu — chỉ sửa được tên. Ngày, khoảng nghỉ và ngày cập nhật tuần giữ nguyên để số đã tính không lệch.`
							: `${dong.ten} chưa có dữ liệu — sửa được mọi ô trừ loại và năm.`}
					</SheetDescription>
				</SheetHeader>
				<form className="flex-1 overflow-y-auto px-4">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="sua-loai">Loại</FieldLabel>
							<Input id="sua-loai" value={dong.loai} disabled readOnly />
						</Field>
						{dong.loai === "Quý" ? (
							<Field>
								<FieldLabel htmlFor="sua-nam">Thuộc năm</FieldLabel>
								<Input
									id="sua-nam"
									value="Năm 2026"
									translate="no"
									disabled
									readOnly
								/>
							</Field>
						) : null}
						<Field>
							<FieldLabel htmlFor="sua-ten">Tên</FieldLabel>
							<Input
								id="sua-ten"
								defaultValue={dong.ten}
								translate="no"
								autoComplete="off"
								maxLength={80}
							/>
						</Field>
						<div className="grid items-start gap-3 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="sua-dau">Ngày đầu</FieldLabel>
								{chiTen ? (
									<Input id="sua-dau" value="01/10/2026" disabled readOnly />
								) : (
									<DatePicker
										id="sua-dau"
										value="2027-01-01"
										onChange={() => {}}
									/>
								)}
							</Field>
							<Field>
								<FieldLabel htmlFor="sua-cuoi">Ngày cuối</FieldLabel>
								{chiTen ? (
									<Input id="sua-cuoi" value="31/12/2026" disabled readOnly />
								) : (
									<DatePicker
										id="sua-cuoi"
										value="2027-12-31"
										onChange={() => {}}
									/>
								)}
							</Field>
						</div>
						<Field>
							<FieldLabel htmlFor="sua-thu">Ngày cập nhật tuần</FieldLabel>
							<Select defaultValue="1" disabled={chiTen}>
								<SelectTrigger id="sua-thu" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{THU.map((t, i) => (
										<SelectItem key={t} value={String(i + 1)}>
											{t}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{chiTen ? (
								<FieldDescription>
									Khoá vì chu kỳ đã có dữ liệu. Sai ngày thì ẩn chu kỳ này rồi
									mở chu kỳ đúng.
								</FieldDescription>
							) : null}
						</Field>
					</FieldGroup>
				</form>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Huỷ</Button>
					</SheetClose>
					<Button disabled>Lưu</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function HopAn() {
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Ẩn <span translate="no">Quý 4/2026</span>?
					</DialogTitle>
					<DialogDescription>
						Chu kỳ biến khỏi ô chọn kỳ, không nhận ghi mới, không sinh nhắc,
						không làm đích mang sang. Dữ liệu bên trong giữ nguyên; hiện lại
						được từ bảng này.
					</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel htmlFor="ly-do-an">Lý do ẩn</FieldLabel>
					<Textarea id="ly-do-an" rows={3} translate="no" />
					<FieldDescription>
						Từ 10 đến 500 ký tự. Lý do nằm trong vết của chu kỳ.
					</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled>Ẩn chu kỳ</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function SuaAnChuKyOkrMau({ state }: { state: string }) {
	const hinh: HinhMau =
		state in HINH_THEO_STATE
			? HINH_THEO_STATE[state as keyof typeof HINH_THEO_STATE]
			: HINH_THEO_STATE["ST-bang-an"];
	const dongCua = (id: string): Dong => {
		const d = DONG.find((x) => x.id === id);
		if (!d) throw new Error(`khong co dong ${id}`);
		return d;
	};

	return (
		<div
			className="mx-auto flex w-full max-w-[820px] flex-col gap-6 py-6"
			data-ban-mau={state}
			key={state}
		>
			<Card>
				<CardHeader>
					<CardTitle>Chương trình OKR</CardTitle>
					<CardDescription>
						{hinh.man === "bang" && hinh.khoa
							? "Chỉ quản trị đổi được chu kỳ và cấu hình chương trình."
							: "Các chu kỳ OKR của công ty, và cách chương trình chạy trong mỗi chu kỳ."}
					</CardDescription>
				</CardHeader>
			</Card>
			<BangChuKy
				menu={hinh.man === "bang" ? hinh.menu : null}
				khoa={hinh.man === "bang" && hinh.khoa}
			/>
			{hinh.man === "sua" ? (
				<SheetSua dong={dongCua(hinh.dong)} chiTen={hinh.chiTen} />
			) : null}
			{hinh.man === "go" ? (
				<ConfirmDialog
					tone="destructive"
					tieuDe="Gỡ Năm 2027?"
					than="Năm 2027 chưa có mục tiêu, lần hỏi ý hay quý nào. Gỡ xong chu kỳ biến khỏi bảng; vết tạo và gỡ vẫn còn trong sổ vết."
					nut="Gỡ chu kỳ"
					thoi="Huỷ"
					open
					pending={false}
					onOpenChange={() => {}}
					onConfirm={() => {}}
				/>
			) : null}
			{hinh.man === "an" ? <HopAn /> : null}
			{hinh.man === "hien-lai" ? (
				<ConfirmDialog
					tone="default"
					tieuDe="Hiện lại Năm 2026 (thử)?"
					than="Chu kỳ quay lại ô chọn kỳ với pha như lúc ẩn (Lập kế hoạch), nhận ghi và nhắc lại."
					nut="Hiện lại"
					thoi="Huỷ"
					open
					pending={false}
					onOpenChange={() => {}}
					onConfirm={() => {}}
				/>
			) : null}
		</div>
	);
}
