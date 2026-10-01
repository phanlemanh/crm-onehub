"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Chat from "@carbon/icons-react/es/Chat";
import Close from "@carbon/icons-react/es/Close";
import Edit from "@carbon/icons-react/es/Edit";
import Locked from "@carbon/icons-react/es/Locked";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Task from "@carbon/icons-react/es/Task";
import Time from "@carbon/icons-react/es/Time";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Combobox } from "@crm/ui/components/combobox";
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
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from "@crm/ui/components/item";
import { RadioGroup, RadioGroupItem } from "@crm/ui/components/radio-group";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { Textarea } from "@crm/ui/components/textarea";
import {
	TokenFieldAction,
	TokenFieldItem,
} from "@crm/ui/components/token-field";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { Fragment, type ReactNode } from "react";
import { TenNguoi } from "../ban-mau-okr/phan-chung";
import {
	GUI_DUYET_LUC,
	KY,
	LY_DO_DANG_GO,
	LY_DO_TOI_DA,
	LY_DO_TOI_THIEU,
	LY_DO_TRA_LAI,
	MT_DUYET,
	MT_GIOI_HAN,
	type MucTieuMau,
	NGUOI,
	NGUOI_XEM,
	NGUOI_XEM_TOI_DA,
	ngay,
	TRA_LAI_LUC,
	VIEC_CUA_TOI,
	type ViecDuyet,
} from "./du-lieu";

export type HinhKhung =
	| "gioi-han"
	| "cho-nguoi-gui"
	| "cho-nguoi-duyet"
	| "bi-tra-lai";

const TRANG_THAI = {
	nhap: "Nháp",
	"cho-duyet": "Chờ duyệt",
	"cong-bo": "Đã công bố",
} as const;

type TrangThai = keyof typeof TRANG_THAI;

const COT_KR: SimpleTableColumn[] = [
	{ id: "ten", header: "KR" },
	{ id: "phu-trach", header: "Phụ trách" },
	{ id: "so", header: "Hiện tại", align: "right" },
];

const CELL = "px-3 py-2 align-top";

function BangKr({ mt }: { mt: MucTieuMau }) {
	return (
		<SimpleTable columns={COT_KR}>
			{mt.kr.map((kr) => (
				<SimpleTableRow key={kr.id} data-kr={kr.id}>
					<TableCell className={`${CELL} whitespace-normal`}>
						<span translate="no">{kr.ten}</span>
					</TableCell>
					<TableCell className={CELL}>
						<TenNguoi ten={kr.phuTrach.ten} />
					</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{kr.so}
					</TableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function NhanGioiHan({ moGoiY }: { moGoiY: boolean }) {
	return (
		<Tooltip open={moGoiY || undefined}>
			<TooltipTrigger asChild>
				<Badge asChild variant="outline">
					<button
						aria-label={`Giới hạn: chỉ người liên quan và ${NGUOI_XEM.length} người xem có tên thấy`}
						data-nhan-gioi-han
						type="button"
					>
						<Icon icon={Locked} data-icon="inline-start" />
						Giới hạn
					</button>
				</Badge>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				Chỉ người liên quan và {NGUOI_XEM.length} người xem có tên thấy
			</TooltipContent>
		</Tooltip>
	);
}

function MenuMucTieu({ khoa }: { khoa: boolean }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Thao tác với mục tiêu"
					size="icon-sm"
					variant="ghost"
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem disabled={khoa}>Sửa</DropdownMenuItem>
				<DropdownMenuItem disabled={khoa}>Mức hiển thị…</DropdownMenuItem>
				<DropdownMenuItem disabled={khoa} variant="destructive">
					Bỏ mục tiêu
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function KhungMucTieu({
	mt,
	trangThai,
	gioiHan = false,
	moGoiY = false,
	dai,
	nut,
	khoaSua = false,
}: {
	mt: MucTieuMau;
	trangThai: TrangThai;
	gioiHan?: boolean;
	moGoiY?: boolean;
	dai?: ReactNode;
	nut?: ReactNode;
	khoaSua?: boolean;
}) {
	return (
		<Card data-khung-muc-tieu={mt.id} data-trang-thai-muc-tieu={trangThai}>
			<CardHeader>
				<CardTitle>
					<span translate="no">{mt.ten}</span>
				</CardTitle>
				<CardDescription>
					<span translate="no">{mt.donVi}</span> · {KY} ·{" "}
					<span translate="no">{mt.phuTrach.ten}</span> phụ trách
				</CardDescription>
				<CardAction>
					{nut}
					<Button
						aria-describedby={khoaSua ? "ly-do-khoa-sua" : undefined}
						disabled={khoaSua}
						size="sm"
						variant="outline"
					>
						<Icon icon={Edit} data-icon="inline-start" />
						Sửa
					</Button>
					<MenuMucTieu khoa={khoaSua} />
				</CardAction>
			</CardHeader>
			<div className="flex flex-wrap items-center gap-2" data-nhan-muc-tieu>
				<Badge variant="outline">{mt.loai}</Badge>
				<Badge variant={trangThai === "cong-bo" ? "secondary" : "outline"}>
					{TRANG_THAI[trangThai]}
				</Badge>
				{gioiHan ? <NhanGioiHan moGoiY={moGoiY} /> : null}
			</div>
			{dai}
			<Tabs value="kr">
				<div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
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
				</div>
			</Tabs>
			<BangKr mt={mt} />
		</Card>
	);
}

function NutDai({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
			{children}
		</div>
	);
}

function DaiChoNguoiGui() {
	return (
		<Alert data-dai="cho-nguoi-gui">
			<Icon icon={Time} />
			<AlertTitle>
				Chờ <span translate="no">{NGUOI.minh.ten}</span> duyệt · gửi{" "}
				{ngay(GUI_DUYET_LUC)}
			</AlertTitle>
			<AlertDescription>
				<p id="ly-do-khoa-sua">
					Mục tiêu đang chờ duyệt — rút lại để sửa nội dung, KR, căn chỉnh hay
					mức hiển thị.
				</p>
				<NutDai>
					<Button size="sm" variant="outline">
						Rút lại
					</Button>
				</NutDai>
			</AlertDescription>
		</Alert>
	);
}

function DaiChoNguoiDuyet() {
	return (
		<Alert data-dai="cho-nguoi-duyet">
			<Icon icon={Task} />
			<AlertTitle>
				<span translate="no">{NGUOI.ha.ten}</span> gửi duyệt ·{" "}
				{ngay(GUI_DUYET_LUC)}
			</AlertTitle>
			<AlertDescription>
				<p>
					Duyệt thì mục tiêu công bố ngay và khoá khởi điểm của KR. Trả lại thì
					mục tiêu về nháp, kèm lý do cho người gửi.
				</p>
				<NutDai>
					<Button size="sm">Duyệt và công bố</Button>
					<Button size="sm" variant="outline">
						Trả lại…
					</Button>
				</NutDai>
			</AlertDescription>
		</Alert>
	);
}

function DaiBiTraLai() {
	return (
		<Alert data-dai="bi-tra-lai" variant="warning">
			<Icon icon={WarningAlt} />
			<AlertTitle>
				<span translate="no">{NGUOI.minh.ten}</span> trả lại ·{" "}
				{ngay(TRA_LAI_LUC)}
			</AlertTitle>
			<AlertDescription>
				<p translate="no">{LY_DO_TRA_LAI}</p>
				<NutDai>
					<Button size="sm">Gửi duyệt</Button>
				</NutDai>
			</AlertDescription>
		</Alert>
	);
}

export function KhungTheoHinh({ hinh }: { hinh: HinhKhung }) {
	switch (hinh) {
		case "gioi-han":
			return (
				<KhungMucTieu gioiHan moGoiY mt={MT_GIOI_HAN} trangThai="cong-bo" />
			);
		case "cho-nguoi-gui":
			return (
				<KhungMucTieu
					dai={<DaiChoNguoiGui />}
					khoaSua
					mt={MT_DUYET}
					trangThai="cho-duyet"
				/>
			);
		case "cho-nguoi-duyet":
			return (
				<KhungMucTieu
					dai={<DaiChoNguoiDuyet />}
					khoaSua
					mt={MT_DUYET}
					trangThai="cho-duyet"
				/>
			);
		case "bi-tra-lai":
			return (
				<KhungMucTieu dai={<DaiBiTraLai />} mt={MT_DUYET} trangThai="nhap" />
			);
	}
}

export function KhongThay() {
	return (
		<Card data-khung-muc-tieu="khong-thay">
			<CardContent>
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Icon icon={WarningAlt} />
						</EmptyMedia>
						<EmptyTitle>Không tìm thấy mục tiêu này</EmptyTitle>
						<EmptyDescription>
							Đường dẫn có thể sai, hoặc mục tiêu không còn.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button size="sm" variant="outline">
							Đóng
						</Button>
					</EmptyContent>
				</Empty>
			</CardContent>
		</Card>
	);
}

const LUON_THAY =
	"người phụ trách, người phụ trách KR, người tham gia, trưởng sửa được mục tiêu, quản trị";

const LUA_CHON_NGUOI = [NGUOI.linh, NGUOI.khang, NGUOI.yen, NGUOI.phuc].map(
	(x) => ({ value: x.id, label: x.ten }),
);

export function HopMucHienThi({ conCanChinh }: { conCanChinh: boolean }) {
	return (
		<Dialog open>
			<DialogContent size="wide" data-hop="muc-hien-thi">
				<DialogHeader>
					<DialogTitle>Mức hiển thị</DialogTitle>
					<DialogDescription>
						Ai thấy «<span translate="no">{MT_GIOI_HAN.ten}</span>».
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<FieldSet data-invalid={conCanChinh || undefined}>
						<FieldLegend variant="label">Ai thấy mục tiêu này</FieldLegend>
						<RadioGroup value="gioi-han">
							<Field orientation="horizontal">
								<RadioGroupItem id="muc-cong-khai" value="cong-khai" />
								<FieldContent>
									<FieldLabel htmlFor="muc-cong-khai">Công khai</FieldLabel>
									<FieldDescription>
										Mọi người trong chương trình OKR thấy; mục tiêu vào số gộp
										và căn chỉnh được.
									</FieldDescription>
								</FieldContent>
							</Field>
							<Field orientation="horizontal">
								<RadioGroupItem
									aria-describedby={conCanChinh ? "loi-can-chinh" : undefined}
									aria-invalid={conCanChinh || undefined}
									id="muc-gioi-han"
									value="gioi-han"
								/>
								<FieldContent>
									<FieldLabel htmlFor="muc-gioi-han">
										<Icon icon={Locked} />
										Giới hạn
									</FieldLabel>
									<FieldDescription>
										Chỉ người liên quan và người xem có tên thấy. Không vào số
										gộp, không căn chỉnh được.
									</FieldDescription>
								</FieldContent>
							</Field>
						</RadioGroup>
						{conCanChinh ? (
							<FieldError id="loi-can-chinh">
								Mục tiêu còn 2 căn chỉnh — gỡ trước khi đặt giới hạn.
							</FieldError>
						) : null}
						{conCanChinh ? (
							<div>
								<Button size="sm" variant="outline">
									Mở tab Căn chỉnh
									<Icon icon={ArrowRight} data-icon="inline-end" />
								</Button>
							</div>
						) : null}
					</FieldSet>
					<Field>
						<FieldLabel htmlFor="nguoi-xem">Người xem có tên</FieldLabel>
						<Combobox
							id="nguoi-xem"
							onValueChange={() => {}}
							options={LUA_CHON_NGUOI}
							placeholder="Thêm người…"
							searchPlaceholder="Tìm thành viên…"
							translate="no"
							value=""
						/>
						<div className="flex flex-wrap gap-1" data-nguoi-xem>
							{NGUOI_XEM.map((x) => (
								<TokenFieldItem key={x.id}>
									<span className="truncate px-1" translate="no">
										{x.ten}
									</span>
									<TokenFieldAction aria-label={`Bỏ ${x.ten}`}>
										<Icon icon={Close} />
									</TokenFieldAction>
								</TokenFieldItem>
							))}
						</div>
						<FieldDescription>
							{NGUOI_XEM.length}/{NGUOI_XEM_TOI_DA} người · chỉ thành viên của
							không gian làm việc.
						</FieldDescription>
					</Field>
					<FieldDescription data-luon-thay>
						Luôn thấy: {LUON_THAY}.
					</FieldDescription>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled={conCanChinh}>Lưu</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function HopTraLai() {
	const dem = LY_DO_DANG_GO.length;
	return (
		<Dialog open>
			<DialogContent data-hop="tra-lai">
				<DialogHeader>
					<DialogTitle>Trả lại mục tiêu</DialogTitle>
					<DialogDescription>
						«<span translate="no">{MT_DUYET.ten}</span>» về nháp.{" "}
						<span translate="no">{NGUOI.ha.ten}</span> nhận lý do trong nhắc
						buổi sáng.
					</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel htmlFor="ly-do-tra-lai">Lý do</FieldLabel>
					<Textarea
						aria-describedby="dem-ly-do"
						defaultValue={LY_DO_DANG_GO}
						id="ly-do-tra-lai"
						maxLength={LY_DO_TOI_DA}
						name="ly-do"
						placeholder="Cần sửa gì trước khi duyệt…"
						translate="no"
					/>
					<FieldDescription id="dem-ly-do">
						{dem}/{LY_DO_TOI_DA} ký tự · cần ít nhất {LY_DO_TOI_THIEU}.
					</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled={dem < LY_DO_TOI_THIEU}>Trả lại</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

const ICON_VIEC = {
	"cho-duyet": Task,
	"cap-nhat": Edit,
	"nhac-ten": Chat,
} as const;

function DongViec({ v }: { v: ViecDuyet }) {
	return (
		<Item size="sm" data-viec={v.loai}>
			<ItemMedia variant="icon">
				<Icon icon={ICON_VIEC[v.loai]} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span>
						{v.cau}
						{v.ten ? (
							<>
								{" "}
								<span translate="no">{v.ten}</span>
							</>
						) : null}
					</span>
				</ItemTitle>
				<ItemDescription>{v.chiTiet}</ItemDescription>
			</ItemContent>
			<ItemActions>
				{v.loai === "cap-nhat" ? (
					<Button size="sm">
						Cập nhật tuần
						<Icon icon={ArrowRight} data-icon="inline-end" />
					</Button>
				) : (
					<Button size="sm" variant="outline">
						Mở mục tiêu
					</Button>
				)}
			</ItemActions>
		</Item>
	);
}

export function ViecCuaToi() {
	return (
		<Card data-viec-cua-toi>
			<CardHeader>
				<CardTitle>Việc OKR của tôi</CardTitle>
				<CardDescription>
					{VIEC_CUA_TOI.length} việc cần bạn — mục chờ duyệt ở lại tới khi bạn
					duyệt hoặc trả lại.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{VIEC_CUA_TOI.map((v, i) => (
						<Fragment key={v.id}>
							{i > 0 ? <ItemSeparator /> : null}
							<DongViec v={v} />
						</Fragment>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
