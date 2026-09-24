"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import Enterprise from "@carbon/icons-react/es/Enterprise";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import Renew from "@carbon/icons-react/es/Renew";
import Search from "@carbon/icons-react/es/Search";
import Upload from "@carbon/icons-react/es/Upload";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crm/ui/components/alert-dialog";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { Combobox } from "@crm/ui/components/combobox";
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
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Skeleton } from "@crm/ui/components/skeleton";
import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { StepList, StepListItem } from "@crm/ui/components/step-list";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import type { ReactNode } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	type BoPhanMau,
	CAY_HAI_CAP,
	CHUA_CO_PHONG_BAN,
	CHUA_XEP,
	NGUOI_MAU,
	type NguoiMau,
	type PhongBanMau,
} from "../cau-truc-to-chuc/du-lieu";

type Chon =
	| { loai: "goc" }
	| { loai: "bo-phan"; id: string }
	| { loai: "phong-ban"; id: string }
	| { loai: "chua-co-phong-ban" };

const PB_TRONG: PhongBanMau = {
	id: "phapche",
	ten: "Pháp chế",
	soBuoc: 1,
	truong: null,
	thanhVien: [],
};

const moiPhongBan = CAY_HAI_CAP.flatMap((bp) => bp.phongBan);
const phongBan = (id: string) =>
	[...moiPhongBan, ...CHUA_XEP].find((p) => p.id === id) ?? PB_TRONG;
const boPhan = (id: string) =>
	CAY_HAI_CAP.find((b) => b.id === id) as BoPhanMau;
const moiNguoi = Object.values(NGUOI_MAU);
const noiLamCua = (n: NguoiMau) =>
	moiPhongBan.find((p) => p.thanhVien.some((t) => t.id === n.id))?.ten ?? null;
const soNguoi = moiNguoi.length + CHUA_CO_PHONG_BAN.length - 1;
const coPhongBan = moiNguoi.filter((n) => noiLamCua(n) !== null).length;
const chuaTruong = [...moiPhongBan, ...CHUA_XEP].filter((p) => !p.truong);

function KhungTrang({
	children,
	chiDoc = false,
}: {
	children: ReactNode;
	chiDoc?: boolean;
}) {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Tổ chức</PageShellTitle>
					<PageShellDescription>
						Bộ phận, phòng ban, người và trưởng — một cây dùng chung cho cả CRM.
					</PageShellDescription>
				</PageShellHeading>
				<PageShellActions>
					<Button variant="outline" disabled={chiDoc}>
						<Icon icon={Upload} data-icon="inline-start" />
						Nhập từ bảng tính
					</Button>
					<Button disabled={chiDoc}>
						<Icon icon={Add} data-icon="inline-start" />
						Thêm bộ phận
					</Button>
				</PageShellActions>
			</PageShellHeader>
			{chiDoc ? (
				<p className="text-muted-foreground text-sm">
					Chỉ quản trị sửa được cây tổ chức. Bạn đang xem.
				</p>
			) : null}
			{children}
		</PageShell>
	);
}

function OSo({ chon }: { chon: "chua-co" | "chua-truong" | null }) {
	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2" data-o-so>
			<Button
				variant="outline"
				aria-pressed={chon === "chua-co"}
				className="h-auto justify-between py-3"
			>
				<span className="flex flex-col items-start gap-1">
					<span className="text-muted-foreground text-xs">
						Thành viên có phòng ban chính
					</span>
					<span className="font-medium text-lg tabular-nums">
						{coPhongBan}/{soNguoi}
					</span>
				</span>
				<span className="text-xs">
					Xem {soNguoi - coPhongBan} người chưa có
				</span>
			</Button>
			<Button
				variant="outline"
				aria-pressed={chon === "chua-truong"}
				className="h-auto justify-between py-3"
			>
				<span className="flex flex-col items-start gap-1">
					<span className="text-muted-foreground text-xs">
						Phòng ban chưa có trưởng
					</span>
					<span className="font-medium text-lg tabular-nums">
						{chuaTruong.length}
					</span>
				</span>
				<span className="text-xs">Xem các phòng ban</span>
			</Button>
		</div>
	);
}

function NutCay({
	dangChon,
	muc,
	children,
}: {
	dangChon: boolean;
	muc: number;
	children: ReactNode;
}) {
	return (
		<Button
			variant={dangChon ? "secondary" : "ghost"}
			size="sm"
			aria-current={dangChon ? "page" : undefined}
			className={
				muc === 2 ? "w-full justify-start ps-8" : "w-full justify-start"
			}
		>
			{children}
		</Button>
	);
}

function Cay({ chon, loc }: { chon: Chon; loc: "chua-truong" | null }) {
	const la = (p: PhongBanMau) => !loc || !p.truong;
	return (
		<nav aria-label="Cây tổ chức" className="flex flex-col gap-1 p-2">
			<InputGroup>
				<InputGroupAddon>
					<Icon icon={Search} />
				</InputGroupAddon>
				<InputGroupInput placeholder="Tìm người hoặc đơn vị" />
			</InputGroup>
			<NutCay dangChon={chon.loai === "goc"} muc={0}>
				<Icon icon={Enterprise} data-icon="inline-start" />
				OneHub
			</NutCay>
			{CAY_HAI_CAP.filter((bp) => bp.phongBan.some(la)).map((bp) => (
				<div key={bp.id} className="flex flex-col gap-1" data-bo-phan={bp.id}>
					<NutCay
						dangChon={chon.loai === "bo-phan" && chon.id === bp.id}
						muc={1}
					>
						<Icon icon={ChevronDown} data-icon="inline-start" />
						<span translate="no">{bp.ten}</span>
					</NutCay>
					{bp.phongBan.filter(la).map((p) => (
						<NutCay
							key={p.id}
							dangChon={chon.loai === "phong-ban" && chon.id === p.id}
							muc={2}
						>
							<span translate="no">{p.ten}</span>
							<span className="ms-auto text-muted-foreground text-xs tabular-nums">
								{p.truong ? p.thanhVien.length : "chưa có trưởng"}
							</span>
						</NutCay>
					))}
				</div>
			))}
			<p className="px-2 pt-2 text-muted-foreground text-xs">
				Chưa xếp vào bộ phận
			</p>
			{CHUA_XEP.filter(la).map((p) => (
				<NutCay
					key={p.id}
					dangChon={chon.loai === "phong-ban" && chon.id === p.id}
					muc={2}
				>
					<span translate="no">{p.ten}</span>
					<span className="ms-auto text-muted-foreground text-xs tabular-nums">
						{p.truong ? p.thanhVien.length : "chưa có trưởng"}
					</span>
				</NutCay>
			))}
			{loc ? null : (
				<NutCay dangChon={chon.loai === "chua-co-phong-ban"} muc={0}>
					<Icon icon={UserMultiple} data-icon="inline-start" />
					Chưa có phòng ban
					<span className="ms-auto text-muted-foreground text-xs tabular-nums">
						{CHUA_CO_PHONG_BAN.length}
					</span>
				</NutCay>
			)}
		</nav>
	);
}

function MenuDong({ ten, muc }: { ten: string; muc: string[] }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon-xs"
					aria-label={`Thao tác với ${ten}`}
				>
					<Icon icon={OverflowMenuVertical} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{muc.map((m) => (
					<DropdownMenuItem key={m}>{m}</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function DongNguoi({
	n,
	nhan,
	chiDoc,
	phu,
}: {
	n: NguoiMau;
	nhan?: string;
	chiDoc: boolean;
	phu?: string;
}) {
	return (
		<li className="flex items-center gap-3 px-3 py-2" data-nguoi={n.id}>
			<PersonAvatar size="sm" name={n.ten} email={n.email} />
			<span className="flex min-w-0 flex-1 flex-col items-start gap-1">
				<span className="truncate text-sm" translate="no">
					{n.ten}
				</span>
				<span className="truncate text-muted-foreground text-xs" translate="no">
					{phu ?? n.email}
				</span>
				{nhan ? <Badge variant="outline">{nhan}</Badge> : null}
			</span>
			{chiDoc ? null : (
				<MenuDong
					ten={n.ten}
					muc={[
						"Vị trí trong tổ chức",
						"Chuyển phòng ban",
						"Bỏ khỏi phòng ban",
					]}
				/>
			)}
		</li>
	);
}

function TieuDeChiTiet({
	duong,
	ten,
	menu,
	chiDoc,
}: {
	duong?: string;
	ten: string;
	menu: string[];
	chiDoc: boolean;
}) {
	return (
		<div className="flex items-start justify-between gap-3">
			<div className="flex min-w-0 flex-col">
				{duong ? (
					<span className="text-muted-foreground text-xs" translate="no">
						{duong} ›
					</span>
				) : null}
				<h2 className="truncate font-medium text-lg" translate="no">
					{ten}
				</h2>
			</div>
			{chiDoc ? null : <MenuDong ten={ten} muc={menu} />}
		</div>
	);
}

function ChiTietPhongBan({
	p,
	chiDoc,
	trongKhung = false,
}: {
	p: PhongBanMau;
	chiDoc: boolean;
	trongKhung?: boolean;
}) {
	const bp = CAY_HAI_CAP.find((b) => b.phongBan.some((x) => x.id === p.id));
	const trong = p.thanhVien.length === 0;
	return (
		<section className="flex flex-col gap-5 p-4" data-chi-tiet="phong-ban">
			{trongKhung ? null : (
				<TieuDeChiTiet
					duong={bp?.ten ?? "Chưa xếp vào bộ phận"}
					ten={p.ten}
					menu={["Đổi tên", "Chuyển sang bộ phận khác", "Lưu trữ"]}
					chiDoc={chiDoc}
				/>
			)}
			<Field>
				<FieldLabel htmlFor="truong-pb">Trưởng phòng ban</FieldLabel>
				<Combobox
					id="truong-pb"
					options={p.thanhVien.map((n) => ({ value: n.id, label: n.ten }))}
					value={p.truong?.id ?? ""}
					onValueChange={() => {}}
					placeholder={trong ? "Chưa có người để chọn" : "Chưa có trưởng"}
					disabled={chiDoc || trong}
				/>
				<FieldDescription>
					{trong
						? "Thêm người vào phòng ban trước, rồi chọn trưởng trong số họ."
						: "Chọn trong số người của phòng ban này."}
				</FieldDescription>
			</Field>
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-2">
					<h3 className="font-medium text-sm">Người · {p.thanhVien.length}</h3>
					<Button variant="outline" size="sm" disabled={chiDoc}>
						<Icon icon={Add} data-icon="inline-start" />
						Thêm người
					</Button>
				</div>
				{trong ? (
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={UserMultiple} />
							</EmptyMedia>
							<EmptyTitle>Phòng ban chưa có ai</EmptyTitle>
							<EmptyDescription>
								Thêm người từ danh sách thành viên CRM, hoặc nhập cả phòng ban
								từ bảng tính.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button disabled={chiDoc}>
								<Icon icon={Add} data-icon="inline-start" />
								Thêm người
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					<ul className="divide-y rounded-lg border">
						{p.thanhVien.map((n) => (
							<DongNguoi
								key={n.id}
								n={n}
								chiDoc={chiDoc}
								nhan={p.truong?.id === n.id ? "Trưởng phòng ban" : undefined}
								phu={
									p.truong && p.truong.id !== n.id
										? `Quản lý: ${p.truong.ten}`
										: undefined
								}
							/>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}

function ChiTietBoPhan({ bp, chiDoc }: { bp: BoPhanMau; chiDoc: boolean }) {
	return (
		<section className="flex flex-col gap-5 p-4" data-chi-tiet="bo-phan">
			<TieuDeChiTiet
				duong="OneHub"
				ten={bp.ten}
				menu={["Đổi tên", "Lưu trữ"]}
				chiDoc={chiDoc}
			/>
			<Field>
				<FieldLabel htmlFor="truong-bp">Trưởng bộ phận</FieldLabel>
				<Combobox
					id="truong-bp"
					options={moiNguoi.map((n) => ({
						value: n.id,
						label: n.ten,
						hint: noiLamCua(n) ?? "Chưa có phòng ban",
					}))}
					value={bp.truong?.id ?? ""}
					onValueChange={() => {}}
					placeholder="Chưa có trưởng"
					disabled={chiDoc}
				/>
				<FieldDescription>
					Chọn được bất kỳ thành viên nào của CRM.
				</FieldDescription>
			</Field>
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="font-medium text-sm">
						Phòng ban · {bp.phongBan.length}
					</h3>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" disabled={chiDoc}>
							Gắn phòng ban có sẵn
						</Button>
						<Button variant="outline" size="sm" disabled={chiDoc}>
							<Icon icon={Add} data-icon="inline-start" />
							Phòng ban mới
						</Button>
					</div>
				</div>
				<div className="rounded-lg border">
					<SortableList ids={bp.phongBan.map((p) => p.id)} onReorder={() => {}}>
						{bp.phongBan.map((p) => (
							<SortableItem
								key={p.id}
								id={p.id}
								label={p.ten}
								disabled={chiDoc}
							>
								<div className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2">
									<span className="truncate text-sm" translate="no">
										{p.ten}
									</span>
									<span className="text-muted-foreground text-xs">
										{p.truong
											? `${p.thanhVien.length} người`
											: "chưa có trưởng"}
									</span>
								</div>
							</SortableItem>
						))}
					</SortableList>
				</div>
				<p className="text-muted-foreground text-xs">
					Kéo để sắp thứ tự, hoặc dùng phím Space rồi mũi tên lên xuống.
				</p>
			</div>
		</section>
	);
}

function ChiTietGoc({ chiDoc }: { chiDoc: boolean }) {
	return (
		<section className="flex flex-col gap-5 p-4" data-chi-tiet="goc">
			<TieuDeChiTiet ten="OneHub" menu={[]} chiDoc />
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-2">
					<h3 className="font-medium text-sm">
						Bộ phận · {CAY_HAI_CAP.length}
					</h3>
					<Button variant="outline" size="sm" disabled={chiDoc}>
						<Icon icon={Add} data-icon="inline-start" />
						Thêm bộ phận
					</Button>
				</div>
				<div className="rounded-lg border">
					<SortableList ids={CAY_HAI_CAP.map((b) => b.id)} onReorder={() => {}}>
						{CAY_HAI_CAP.map((b) => (
							<SortableItem
								key={b.id}
								id={b.id}
								label={b.ten}
								disabled={chiDoc}
							>
								<div className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2">
									<span className="truncate text-sm" translate="no">
										{b.ten}
									</span>
									<span className="text-muted-foreground text-xs">
										{b.phongBan.length} phòng ban
									</span>
								</div>
							</SortableItem>
						))}
					</SortableList>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<h3 className="font-medium text-sm">
					Chưa xếp vào bộ phận · {CHUA_XEP.length}
				</h3>
				<ul className="divide-y rounded-lg border">
					{CHUA_XEP.map((p) => (
						<li
							key={p.id}
							className="flex items-center justify-between gap-2 px-3 py-2"
						>
							<span className="text-sm" translate="no">
								{p.ten}
							</span>
							<Button variant="outline" size="sm" disabled={chiDoc}>
								Gắn vào bộ phận
							</Button>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

function ChiTietChuaCo({ chiDoc }: { chiDoc: boolean }) {
	return (
		<section
			className="flex flex-col gap-4 p-4"
			data-chi-tiet="chua-co-phong-ban"
		>
			<TieuDeChiTiet ten="Chưa có phòng ban" menu={[]} chiDoc />
			<p className="text-muted-foreground text-sm">
				Những thành viên này chưa được tính vào dòng độ phủ. Xếp mỗi người vào
				một phòng ban chính.
			</p>
			<ul className="divide-y rounded-lg border">
				{CHUA_CO_PHONG_BAN.map((n) => (
					<li key={n.id} className="flex items-center gap-3 px-3 py-2">
						<PersonAvatar size="sm" name={n.ten} email={n.email} />
						<span className="min-w-0 flex-1 truncate text-sm" translate="no">
							{n.ten}
						</span>
						<Button variant="outline" size="sm" disabled={chiDoc}>
							Xếp phòng ban
						</Button>
					</li>
				))}
			</ul>
		</section>
	);
}

function ChiTiet({ chon, chiDoc }: { chon: Chon; chiDoc: boolean }) {
	if (chon.loai === "goc") return <ChiTietGoc chiDoc={chiDoc} />;
	if (chon.loai === "bo-phan")
		return <ChiTietBoPhan bp={boPhan(chon.id)} chiDoc={chiDoc} />;
	if (chon.loai === "chua-co-phong-ban")
		return <ChiTietChuaCo chiDoc={chiDoc} />;
	return <ChiTietPhongBan p={phongBan(chon.id)} chiDoc={chiDoc} />;
}

function HaiCot({
	chon,
	chiDoc = false,
	loc = null,
	oSo = null,
}: {
	chon: Chon;
	chiDoc?: boolean;
	loc?: "chua-truong" | null;
	oSo?: "chua-co" | "chua-truong" | null;
}) {
	return (
		<KhungTrang chiDoc={chiDoc}>
			<OSo chon={oSo} />
			<div className="grid grid-cols-1 rounded-lg border lg:grid-cols-[18rem_minmax(0,1fr)]">
				<div className="border-b lg:border-e lg:border-b-0">
					<Cay chon={chon} loc={loc} />
				</div>
				<div className="hidden lg:block">
					<ChiTiet chon={chon} chiDoc={chiDoc} />
				</div>
			</div>
		</KhungTrang>
	);
}

function HopChonNhieu({
	tieuDe,
	moTa,
	muc,
	nut,
}: {
	tieuDe: string;
	moTa: string;
	muc: { id: string; ten: string; phu: string | null; chon: boolean }[];
	nut: string;
}) {
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{tieuDe}</DialogTitle>
					<DialogDescription>{moTa}</DialogDescription>
				</DialogHeader>
				<InputGroup>
					<InputGroupAddon>
						<Icon icon={Search} />
					</InputGroupAddon>
					<InputGroupInput placeholder="Tìm theo tên" />
				</InputGroup>
				<ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
					{muc.map((m) => (
						<li key={m.id}>
							<label
								className="flex items-center gap-3 rounded-md px-2 py-2"
								htmlFor={`chon-${m.id}`}
							>
								<Checkbox id={`chon-${m.id}`} checked={m.chon} />
								<span className="flex min-w-0 flex-1 flex-col">
									<span className="truncate text-sm" translate="no">
										{m.ten}
									</span>
									{m.phu ? (
										<span
											className="truncate text-muted-foreground text-xs"
											translate="no"
										>
											{m.phu}
										</span>
									) : null}
								</span>
							</label>
						</li>
					))}
				</ul>
				<DialogFooter>
					<Button variant="outline">Huỷ</Button>
					<Button>{nut}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function HopNhap({ buoc }: { buoc: 1 | 2 | 3 }) {
	return (
		<Dialog open>
			<DialogContent className="sm:max-w-(--container-sheet)">
				<DialogHeader>
					<DialogTitle>Nhập từ bảng tính</DialogTitle>
					<DialogDescription>
						Bốn cột theo thứ tự: email · phòng ban · bộ phận · trưởng.
					</DialogDescription>
				</DialogHeader>
				<StepList activeStep={buoc} label="Các bước nhập" markCompleted>
					<StepListItem step={1} activeStep={buoc} title="Dán hoặc chọn tệp" />
					<StepListItem step={2} activeStep={buoc} title="Xem trước" />
					<StepListItem step={3} activeStep={buoc} title="Kết quả" />
				</StepList>
				{buoc === 1 ? (
					<Field>
						<FieldLabel htmlFor="nhap-chu">
							Dán các dòng từ bảng tính
						</FieldLabel>
						<Textarea
							id="nhap-chu"
							rows={8}
							translate="no"
							placeholder="lan@onehub.vn	Kinh doanh vùng 1	Kinh doanh	phòng ban"
						/>
						<FieldDescription>
							Hoặc chọn tệp .csv — tối đa 1000 dòng.
						</FieldDescription>
					</Field>
				) : null}
				{buoc === 2 ? (
					<div className="flex flex-col gap-3">
						<p className="text-sm">
							8 dòng hợp lệ · 2 dòng hỏng · sẽ tạo phòng ban{" "}
							<span translate="no">«Kho vận»</span> và bộ phận{" "}
							<span translate="no">«Vận hành», «Tài chính»</span>
						</p>
						<ul aria-label="Dòng hỏng" className="flex flex-col gap-1 text-sm">
							<li className="text-destructive">
								Dòng 10: Email này chưa là thành viên CRM
							</li>
							<li className="text-destructive">Dòng 11: Thiếu phòng ban</li>
						</ul>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Dòng</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Phòng ban</TableHead>
									<TableHead>Bộ phận</TableHead>
									<TableHead>Kết quả</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{[
									[
										"9",
										"tuan.bui@onehub.vn",
										"Kho vận",
										"Vận hành",
										"Hợp lệ · phòng ban mới",
									],
									["10", "quang.ly@onehub.vn", "Kế toán", "Tài chính", "Hỏng"],
									["11", "ha.do@onehub.vn", "", "Tài chính", "Hỏng"],
								].map(([d, e, p, b, k]) => (
									<TableRow key={d}>
										<TableCell className="tabular-nums">{d}</TableCell>
										<TableCell translate="no">{e}</TableCell>
										<TableCell translate="no">{p}</TableCell>
										<TableCell translate="no">{b}</TableCell>
										<TableCell>{k}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				) : null}
				{buoc === 3 ? (
					<div className="flex flex-col gap-2 text-sm">
						<p>Đã ghi 8 người. Tạo mới 1 phòng ban, 2 bộ phận.</p>
						<ul className="list-disc ps-5 text-muted-foreground">
							<li>
								Phòng ban mới: <span translate="no">Kho vận</span>
							</li>
							<li>
								Bộ phận mới: <span translate="no">Vận hành, Tài chính</span>
							</li>
							<li>2 dòng bị bỏ — xem lại ở bước trước.</li>
						</ul>
					</div>
				) : null}
				<DialogFooter>
					<Button variant="outline">{buoc === 3 ? "Đóng" : "Huỷ"}</Button>
					{buoc === 1 ? <Button>Xem trước</Button> : null}
					{buoc === 2 ? <Button>Ghi 8 dòng · bỏ 2 dòng hỏng</Button> : null}
					{buoc === 3 ? <Button>Xem cây</Button> : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function XacNhanLuuTru() {
	return (
		<AlertDialog open>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Lưu trữ Pháp chế?</AlertDialogTitle>
					<AlertDialogDescription>
						Phòng ban biến khỏi cây và các ô chọn. Khôi phục được bất cứ lúc nào
						ở mục Đã lưu trữ.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Giữ lại</AlertDialogCancel>
					<AlertDialogAction>Lưu trữ</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function TrangThai({ state }: { state: string }): ReactNode {
	switch (state) {
		case "ST-goc":
			return <HaiCot chon={{ loai: "goc" }} />;
		case "ST-bo-phan":
			return <HaiCot chon={{ loai: "bo-phan", id: "kinhdoanh" }} />;
		case "ST-gan-phong-ban":
			return (
				<>
					<HaiCot chon={{ loai: "bo-phan", id: "kinhdoanh" }} />
					<HopChonNhieu
						tieuDe="Gắn phòng ban vào Kinh doanh"
						moTa="Chọn một hay nhiều phòng ban. Phòng ban đang thuộc bộ phận khác sẽ chuyển sang Kinh doanh."
						nut="Gắn 2 phòng ban"
						muc={[
							{
								id: "phapche",
								ten: "Pháp chế",
								phu: "Chưa xếp vào bộ phận",
								chon: true,
							},
							{
								id: "cskh",
								ten: "Chăm sóc khách hàng",
								phu: "Đang ở Vận hành",
								chon: true,
							},
							{
								id: "kho",
								ten: "Kho vận",
								phu: "Đang ở Vận hành",
								chon: false,
							},
							{
								id: "ketoan",
								ten: "Kế toán",
								phu: "Đang ở Tài chính",
								chon: false,
							},
						]}
					/>
				</>
			);
		case "ST-phong-ban":
			return <HaiCot chon={{ loai: "phong-ban", id: "kd1" }} />;
		case "ST-phong-ban-trong":
			return <HaiCot chon={{ loai: "phong-ban", id: "phapche" }} />;
		case "ST-them-nguoi":
			return (
				<>
					<HaiCot chon={{ loai: "phong-ban", id: "kd1" }} />
					<HopChonNhieu
						tieuDe="Thêm người vào Kinh doanh vùng 1"
						moTa="Phòng ban này thành phòng ban chính của người được chọn. Ai đang ở phòng ban khác sẽ chuyển sang."
						nut="Thêm 2 người"
						muc={[
							{
								id: "quan",
								ten: "Phan Minh Quân",
								phu: "Chưa có phòng ban",
								chon: true,
							},
							{
								id: "tuan",
								ten: "Hoàng Quốc Tuấn",
								phu: "Đang ở Kho vận — sẽ chuyển",
								chon: true,
							},
							{
								id: "vy",
								ten: "Trịnh Hà Vy",
								phu: "Chưa có phòng ban",
								chon: false,
							},
						]}
					/>
				</>
			);
		case "ST-chua-co-phong-ban":
			return <HaiCot chon={{ loai: "chua-co-phong-ban" }} oSo="chua-co" />;
		case "ST-chua-truong":
			return (
				<HaiCot
					chon={{ loai: "phong-ban", id: "kho" }}
					loc="chua-truong"
					oSo="chua-truong"
				/>
			);
		case "ST-chi-doc":
			return <HaiCot chon={{ loai: "phong-ban", id: "kd1" }} chiDoc />;
		case "ST-hep":
			return (
				<>
					<HaiCot chon={{ loai: "phong-ban", id: "kd1" }} />
					<Sheet open>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>Kinh doanh vùng 1</SheetTitle>
								<SheetDescription>Kinh doanh ›</SheetDescription>
							</SheetHeader>
							<ChiTietPhongBan p={phongBan("kd1")} chiDoc={false} trongKhung />
						</SheetContent>
					</Sheet>
				</>
			);
		case "ST-nhap-1":
			return (
				<>
					<HaiCot chon={{ loai: "goc" }} />
					<HopNhap buoc={1} />
				</>
			);
		case "ST-nhap-2":
			return (
				<>
					<HaiCot chon={{ loai: "goc" }} />
					<HopNhap buoc={2} />
				</>
			);
		case "ST-nhap-3":
			return (
				<>
					<HaiCot chon={{ loai: "goc" }} />
					<HopNhap buoc={3} />
				</>
			);
		case "ST-luu-tru":
			return (
				<>
					<HaiCot chon={{ loai: "phong-ban", id: "phapche" }} />
					<XacNhanLuuTru />
				</>
			);
		case "ST-trong":
			return (
				<KhungTrang>
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={Enterprise} />
							</EmptyMedia>
							<EmptyTitle>Dựng cây tổ chức của bạn</EmptyTitle>
							<EmptyDescription>
								Nhập danh sách nhân sự từ bảng tính để có ngay bộ phận, phòng
								ban và người, hoặc thêm từng bộ phận.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<div className="flex flex-wrap justify-center gap-2">
								<Button>
									<Icon icon={Upload} data-icon="inline-start" />
									Nhập từ bảng tính
								</Button>
								<Button variant="outline">
									<Icon icon={Add} data-icon="inline-start" />
									Thêm bộ phận
								</Button>
							</div>
						</EmptyContent>
					</Empty>
				</KhungTrang>
			);
		case "ST-dang-tai":
			return (
				<KhungTrang>
					<p className="text-muted-foreground text-sm" role="status">
						Đang tải cây tổ chức…
					</p>
					<div className="grid grid-cols-1 gap-3 lg:grid-cols-[18rem_minmax(0,1fr)]">
						<Skeleton className="h-72" />
						<Skeleton className="h-72" />
					</div>
				</KhungTrang>
			);
		case "ST-loi":
			return (
				<KhungTrang>
					<Empty className="border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={WarningAlt} />
							</EmptyMedia>
							<EmptyTitle>Không tải được cây tổ chức</EmptyTitle>
							<EmptyDescription>
								Máy chủ không trả lời. Thử lại sau ít phút.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button variant="outline">
								<Icon icon={Renew} data-icon="inline-start" />
								Thử lại
							</Button>
						</EmptyContent>
					</Empty>
				</KhungTrang>
			);
		default:
			return <HaiCot chon={{ loai: "goc" }} />;
	}
}

export function ToChucDanhSachChiTietMau({ state }: { state: string }) {
	return <TrangThai state={state} />;
}
