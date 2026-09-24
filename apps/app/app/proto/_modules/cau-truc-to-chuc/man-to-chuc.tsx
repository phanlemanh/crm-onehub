"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import Close from "@carbon/icons-react/es/Close";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Search from "@carbon/icons-react/es/Search";
import Upload from "@carbon/icons-react/es/Upload";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Dialog,
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
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import {
	type BoPhanMau,
	CAY_HAI_CAP,
	CHUA_CO_PHONG_BAN,
	CHUA_XEP,
	DA_LUU_TRU,
	NGUOI_MAU,
	type NguoiMau,
	PHONG_BAN_PHANG,
	PHONG_BAN_PHU,
	type PhongBanMau,
} from "./du-lieu";

const SO_THANH_VIEN =
	new Set(PHONG_BAN_PHANG.flatMap((p) => p.thanhVien.map((n) => n.id))).size +
	CHUA_CO_PHONG_BAN.length;
const SO_CO_PHONG_BAN = SO_THANH_VIEN - CHUA_CO_PHONG_BAN.length;
const SO_CHUA_CO_TRUONG = PHONG_BAN_PHANG.filter((p) => !p.truong).length;

function MenuDonVi({
	ten,
	loai,
}: {
	ten: string;
	loai: "bo-phan" | "phong-ban";
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label={`Thao tác với ${ten}`}
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>Đổi tên</DropdownMenuItem>
				<DropdownMenuItem>
					{loai === "bo-phan" ? "Đặt trưởng bộ phận" : "Đặt trưởng phòng ban"}
				</DropdownMenuItem>
				{loai === "bo-phan" ? (
					<DropdownMenuItem>Thêm phòng ban</DropdownMenuItem>
				) : (
					<DropdownMenuItem>Chuyển sang bộ phận khác</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem>Lưu trữ</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function Nguoi({
	nguoi,
	nhan,
	sua,
}: {
	nguoi: NguoiMau;
	nhan: string | null;
	sua: boolean;
}) {
	const noiDung = (
		<>
			<PersonAvatar size="sm" name={nguoi.ten} email={nguoi.email} />
			<span translate="no">{nguoi.ten}</span>
			{nhan ? <Badge variant="outline">{nhan}</Badge> : null}
		</>
	);
	if (!sua) {
		return <span className="flex items-center gap-1 text-xs">{noiDung}</span>;
	}
	return (
		<Button variant="ghost" size="xs" aria-haspopup="dialog">
			{noiDung}
		</Button>
	);
}

function PhongBan({ phongBan, sua }: { phongBan: PhongBanMau; sua: boolean }) {
	const phu = PHONG_BAN_PHU[phongBan.id] ?? [];
	return (
		<li
			className="flex flex-col gap-2 py-2 ps-8 pe-1"
			data-phong-ban={phongBan.id}
		>
			<span className="flex items-center justify-between gap-2 text-sm">
				<span className="min-w-0 truncate" translate="no">
					{phongBan.ten}
				</span>
				<span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs tabular-nums">
					{phongBan.thanhVien.length + phu.length} người
					{sua ? <MenuDonVi ten={phongBan.ten} loai="phong-ban" /> : null}
				</span>
			</span>
			<span className="flex flex-wrap items-center gap-1">
				{phongBan.truong ? null : (
					<span className="text-muted-foreground text-xs">Chưa có trưởng</span>
				)}
				{phongBan.thanhVien.map((n) => (
					<Nguoi
						key={n.id}
						nguoi={n}
						sua={sua}
						nhan={phongBan.truong?.id === n.id ? "Trưởng phòng ban" : null}
					/>
				))}
				{phu.map((n) => (
					<Nguoi key={n.id} nguoi={n} sua={sua} nhan="phụ" />
				))}
			</span>
		</li>
	);
}

function BoPhan({ boPhan, sua }: { boPhan: BoPhanMau; sua: boolean }) {
	return (
		<Collapsible defaultOpen asChild>
			<li data-bo-phan={boPhan.id}>
				<span className="flex items-center gap-1">
					<CollapsibleTrigger asChild>
						<Button variant="ghost" className="min-w-0 flex-1 justify-start">
							<Icon
								icon={ChevronRight}
								className="transition-transform group-aria-expanded/button:rotate-90"
							/>
							<span
								className="min-w-0 flex-1 truncate text-start"
								translate="no"
							>
								{boPhan.ten}
							</span>
							<span className="font-normal text-muted-foreground text-xs tabular-nums">
								{boPhan.phongBan.length} phòng ban
							</span>
						</Button>
					</CollapsibleTrigger>
					{sua ? <MenuDonVi ten={boPhan.ten} loai="bo-phan" /> : null}
				</span>
				<span className="flex items-center gap-1 ps-8 pb-1 text-muted-foreground text-xs">
					{boPhan.truong ? (
						<Nguoi nguoi={boPhan.truong} sua={sua} nhan="Trưởng bộ phận" />
					) : (
						"Chưa có trưởng bộ phận"
					)}
				</span>
				<CollapsibleContent asChild>
					<ul className="divide-y">
						{boPhan.phongBan.map((p) => (
							<PhongBan key={p.id} phongBan={p} sua={sua} />
						))}
					</ul>
				</CollapsibleContent>
			</li>
		</Collapsible>
	);
}

export function ManToChuc({ sua }: { sua: boolean }) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm" aria-live="polite">
					<span className="font-medium tabular-nums">
						{SO_CO_PHONG_BAN}/{SO_THANH_VIEN}
					</span>{" "}
					thành viên có phòng ban chính ·{" "}
					<span className="font-medium tabular-nums">{SO_CHUA_CO_TRUONG}</span>{" "}
					phòng ban chưa có trưởng
				</p>
				{sua ? (
					<span className="flex flex-wrap gap-2">
						<Button variant="outline">
							<Icon icon={Upload} data-icon="inline-start" />
							Nhập từ bảng tính
						</Button>
						<Button>
							<Icon icon={Add} data-icon="inline-start" />
							Thêm bộ phận
						</Button>
					</span>
				) : null}
			</div>
			<InputGroup>
				<InputGroupAddon>
					<Icon icon={Search} />
				</InputGroupAddon>
				<InputGroupInput
					aria-label="Tìm người, bộ phận hoặc phòng ban"
					placeholder="Tìm người, bộ phận hoặc phòng ban"
				/>
			</InputGroup>
			<ul
				className="flex flex-col gap-1 rounded-lg border p-2"
				aria-label="Cây tổ chức"
			>
				{CAY_HAI_CAP.map((b) => (
					<BoPhan key={b.id} boPhan={b} sua={sua} />
				))}
				<li data-bo-phan="chua-xep" className="flex flex-col gap-1 pt-2">
					<span className="px-3 text-muted-foreground text-xs">
						Chưa xếp vào bộ phận
					</span>
					<ul className="divide-y">
						{CHUA_XEP.map((p) => (
							<PhongBan key={p.id} phongBan={p} sua={sua} />
						))}
					</ul>
				</li>
				<li data-nhom="chua-co-phong-ban" className="flex flex-col gap-1 pt-2">
					<span className="px-3 text-muted-foreground text-xs">
						Chưa có phòng ban · {CHUA_CO_PHONG_BAN.length} người
					</span>
					<span className="flex flex-wrap gap-1 px-3 pb-2">
						{CHUA_CO_PHONG_BAN.map((n) => (
							<Nguoi key={n.id} nguoi={n} sua={sua} nhan={null} />
						))}
					</span>
				</li>
			</ul>
			{sua ? (
				<Collapsible>
					<CollapsibleTrigger asChild>
						<Button variant="ghost" className="justify-start">
							<Icon icon={ChevronRight} />
							Đã lưu trữ · {DA_LUU_TRU.length}
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<ul className="divide-y rounded-lg border">
							{DA_LUU_TRU.map((d) => (
								<li
									key={d.id}
									className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
								>
									<span translate="no">{d.ten}</span>
									<span className="flex gap-2">
										<Button variant="outline" size="sm">
											Khôi phục
										</Button>
										<Button variant="destructive" size="sm">
											Xoá hẳn
										</Button>
									</span>
								</li>
							))}
						</ul>
					</CollapsibleContent>
				</Collapsible>
			) : null}
		</div>
	);
}

function ChonPhongBan({ macDinh, nhan }: { macDinh: string; nhan: string }) {
	return (
		<Select defaultValue={macDinh}>
			<SelectTrigger aria-label={nhan}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{CAY_HAI_CAP.map((b) => (
					<SelectGroup key={b.id}>
						<SelectLabel translate="no">{b.ten}</SelectLabel>
						{b.phongBan.map((p) => (
							<SelectItem key={p.id} value={p.id} translate="no">
								{p.ten}
							</SelectItem>
						))}
					</SelectGroup>
				))}
				<SelectGroup>
					<SelectLabel>Chưa xếp vào bộ phận</SelectLabel>
					{CHUA_XEP.map((p) => (
						<SelectItem key={p.id} value={p.id} translate="no">
							{p.ten}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

export function HopThoaiViTri({ ghiDe }: { ghiDe: boolean }) {
	const { MAI, HUNG, LAN } = NGUOI_MAU;
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Vị trí trong tổ chức — <span translate="no">{MAI.ten}</span>
					</DialogTitle>
					<DialogDescription translate="no">{MAI.email}</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel>Phòng ban chính</FieldLabel>
					<ChonPhongBan macDinh="kd1" nhan="Phòng ban chính" />
				</Field>
				<Field>
					<FieldLabel>Phòng ban phụ</FieldLabel>
					<span className="flex flex-wrap gap-1">
						<Badge variant="secondary" translate="no">
							Chăm sóc khách hàng
						</Badge>
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label="Bỏ phòng ban phụ Chăm sóc khách hàng"
						>
							<Icon icon={Close} />
						</Button>
					</span>
					<Button variant="outline" size="sm">
						<Icon icon={Add} data-icon="inline-start" />
						Thêm phòng ban phụ
					</Button>
				</Field>
				<Field>
					<FieldLabel>Quản lý trực tiếp</FieldLabel>
					<span className="flex items-center gap-1 text-xs">
						<PersonAvatar
							size="sm"
							name={ghiDe ? LAN.ten : HUNG.ten}
							email={ghiDe ? LAN.email : HUNG.email}
						/>
						<span translate="no">{ghiDe ? LAN.ten : HUNG.ten}</span>
					</span>
					<FieldDescription>
						{ghiDe
							? "Đã chọn tay. Trưởng phòng ban chính là Trần Văn Hùng."
							: "Theo trưởng phòng ban chính. Đổi trưởng phòng ban thì quản lý đổi theo."}
					</FieldDescription>
					<span className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm">
							Chọn người khác
						</Button>
						{ghiDe ? (
							<Button variant="ghost" size="sm">
								Về theo trưởng phòng ban
							</Button>
						) : null}
					</span>
				</Field>
				<DialogFooter>
					<Button variant="outline">Huỷ</Button>
					<Button>Lưu</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

type DongNhap = {
	so: number;
	email: string;
	phongBan: string;
	boPhan: string;
	truong: string;
	loi: string | null;
};

const LO_XEM_TRUOC: readonly DongNhap[] = [
	{
		so: 2,
		email: "hung@onehub.vn",
		phongBan: "Kinh doanh vùng 1",
		boPhan: "Kinh doanh",
		truong: "phòng ban",
		loi: null,
	},
	{
		so: 3,
		email: "mai@onehub.vn",
		phongBan: "Kinh doanh vùng 1",
		boPhan: "Kinh doanh",
		truong: "",
		loi: null,
	},
	{
		so: 4,
		email: "quan@onehub.vn",
		phongBan: "Pháp chế",
		boPhan: "Vận hành",
		truong: "phòng ban",
		loi: null,
	},
	{
		so: 5,
		email: "vy@onehub.vn",
		phongBan: "Marketing số",
		boPhan: "Tăng trưởng",
		truong: "bộ phận",
		loi: null,
	},
	{
		so: 6,
		email: "an@onehub.vn",
		phongBan: "Kế toán",
		boPhan: "Tài chính",
		truong: "",
		loi: "Email này chưa là thành viên CRM",
	},
	{
		so: 7,
		email: "duc@onehub.vn",
		phongBan: "Kinh doanh vùng 2",
		boPhan: "Vận hành",
		truong: "",
		loi: "Phòng ban «Kinh doanh vùng 2» đang thuộc bộ phận «Kinh doanh»",
	},
	{
		so: 8,
		email: "thao@onehub.vn",
		phongBan: "Chăm sóc khách hàng",
		boPhan: "Vận hành",
		truong: "có",
		loi: "Cột trưởng chỉ nhận «phòng ban», «bộ phận» hoặc để trống",
	},
];

const LO_HONG_HET: readonly DongNhap[] = LO_XEM_TRUOC.filter((d) => d.loi);

function BangXemTruoc({ dong }: { dong: readonly DongNhap[] }) {
	const hong = dong.filter((d) => d.loi);
	return (
		<>
			{hong.length > 0 ? (
				<ul
					className="flex flex-col gap-1 text-destructive text-sm"
					aria-label="Dòng hỏng"
				>
					{hong.map((d) => (
						<li key={d.so}>
							Dòng {d.so}: {d.loi}
						</li>
					))}
				</ul>
			) : null}
			<div className="max-h-80 overflow-auto rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Dòng</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phòng ban</TableHead>
							<TableHead>Bộ phận</TableHead>
							<TableHead>Trưởng</TableHead>
							<TableHead>Kết quả</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dong.map((d) => (
							<TableRow key={d.so} data-hong={d.loi ? "co" : "khong"}>
								<TableCell className="tabular-nums">{d.so}</TableCell>
								<TableCell translate="no">{d.email}</TableCell>
								<TableCell translate="no">{d.phongBan}</TableCell>
								<TableCell translate="no">{d.boPhan}</TableCell>
								<TableCell>{d.truong}</TableCell>
								<TableCell>
									{d.loi ? (
										<span className="text-destructive">Hỏng</span>
									) : (
										<span className="text-muted-foreground">Hợp lệ</span>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	);
}

export function HopThoaiNhap({
	buoc,
}: {
	buoc: "trong" | "xem-truoc" | "hong-het";
}) {
	const dong = buoc === "hong-het" ? LO_HONG_HET : LO_XEM_TRUOC;
	const hopLe = dong.filter((d) => !d.loi).length;
	const hong = dong.length - hopLe;
	return (
		<Dialog open>
			<DialogContent className="sm:max-w-(--container-sheet)">
				<DialogHeader>
					<DialogTitle>Nhập từ bảng tính</DialogTitle>
					<DialogDescription>
						Bốn cột theo thứ tự: email · phòng ban · bộ phận · trưởng. Cột
						trưởng để trống, hoặc ghi «phòng ban» hay «bộ phận».
					</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel>Dán các dòng từ bảng tính</FieldLabel>
					<Textarea
						rows={buoc === "trong" ? 8 : 3}
						placeholder={
							"lan@onehub.vn\tKinh doanh vùng 1\tKinh doanh\tphòng ban"
						}
						defaultValue={
							buoc === "trong"
								? ""
								: dong
										.map((d) =>
											[d.email, d.phongBan, d.boPhan, d.truong].join("\t"),
										)
										.join("\n")
						}
					/>
					<FieldDescription>
						Hoặc chọn tệp .csv — tối đa 1000 dòng.
					</FieldDescription>
				</Field>
				{buoc === "trong" ? null : (
					<>
						<p className="text-sm" aria-live="polite">
							<span className="font-medium tabular-nums">{hopLe}</span> dòng hợp
							lệ · <span className="font-medium tabular-nums">{hong}</span> dòng
							hỏng
							{hopLe > 0 ? " · sẽ tạo 1 phòng ban, 1 bộ phận" : ""}
						</p>
						<BangXemTruoc dong={dong} />
					</>
				)}
				<DialogFooter>
					<Button variant="outline">
						<Icon icon={Upload} data-icon="inline-start" />
						Chọn tệp .csv
					</Button>
					{buoc === "trong" ? (
						<Button>Xem trước</Button>
					) : (
						<Button disabled={hopLe === 0}>
							{hopLe === 0
								? "Không có dòng nào để ghi"
								: `Ghi ${hopLe} dòng · bỏ ${hong} dòng hỏng`}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function LocDieuPhoi() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap gap-2">
				<Select defaultValue="kinhdoanh">
					<SelectTrigger aria-label="Bộ phận">
						<span className="text-muted-foreground">Bộ phận:</span>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{CAY_HAI_CAP.map((b) => (
							<SelectItem key={b.id} value={b.id} translate="no">
								{b.ten}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select defaultValue="tat-ca">
					<SelectTrigger aria-label="Phòng ban đang cầm">
						<span className="text-muted-foreground">Phòng ban đang cầm:</span>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="tat-ca">Tất cả</SelectItem>
						{CAY_HAI_CAP[0]?.phongBan.map((p) => (
							<SelectItem key={p.id} value={p.id} translate="no">
								{p.ten}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<dl className="grid max-w-sm grid-cols-2 gap-2 rounded-lg border p-3 text-sm">
				<dt className="text-muted-foreground">Bắt đầu</dt>
				<dd>01/10/2026</dd>
				<dt className="text-muted-foreground">Thời lượng</dt>
				<dd className="tabular-nums">30 ngày</dd>
			</dl>
		</div>
	);
}
