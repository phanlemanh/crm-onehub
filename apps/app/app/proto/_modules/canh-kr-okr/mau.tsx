"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Template from "@carbon/icons-react/es/Template";
import TrashCan from "@carbon/icons-react/es/TrashCan";
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
import { Textarea } from "@crm/ui/components/textarea";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { MAU_OKR, type MauOkr } from "./du-lieu";

const KIEU_KR_MAU = [
	"Tăng tới",
	"Giảm xuống",
	"Giữ trên",
	"Giữ dưới",
	"Mốc",
	"Phần trăm",
] as const;

export type HinhMau =
	| "danh-sach"
	| "rong"
	| "khong-quyen"
	| "sheet"
	| "chon-mau"
	| "tu-mau";

function DongMau({ m, khoa }: { m: MauOkr; khoa: boolean }) {
	return (
		<Item size="sm" variant="outline" data-mau={m.id}>
			<ItemMedia variant="icon">
				<Icon icon={Template} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{m.ten}</span>
				</ItemTitle>
				<ItemDescription>
					{m.cap} · {m.apCho} · {m.soKr} KR ·{" "}
					{m.daDung > 0 ? `đã dùng ${m.daDung} lần` : "chưa dùng"}
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							aria-label={`Thao tác với mẫu ${m.ten}`}
							disabled={khoa}
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>Sửa</DropdownMenuItem>
						<DropdownMenuItem>Lưu trữ</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</ItemActions>
		</Item>
	);
}

function TheMau({ hinh }: { hinh: HinhMau }) {
	const khoa = hinh === "khong-quyen";
	return (
		<Card data-the-mau>
			<CardHeader>
				<CardTitle>Mẫu OKR</CardTitle>
				<CardDescription>
					Khung mục tiêu và KR cho từng nhóm đơn vị. Người đặt mục tiêu chọn mẫu
					rồi điền số của mình; sửa mẫu không đổi mục tiêu đã tạo.
				</CardDescription>
				<CardAction>
					<Button disabled={khoa} size="sm" variant="outline">
						<Icon icon={Add} data-icon="inline-start" />
						Thêm mẫu
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				{hinh === "rong" ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Chưa có mẫu nào</EmptyTitle>
							<EmptyDescription>
								Mẫu giúp các phòng ban cùng loại không phải viết lại từ đầu mỗi
								mùa đặt OKR.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button size="sm" variant="outline">
								<Icon icon={Add} data-icon="inline-start" />
								Thêm mẫu
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					<ItemGroup className="gap-2">
						{MAU_OKR.map((m) => (
							<DongMau khoa={khoa} key={m.id} m={m} />
						))}
					</ItemGroup>
				)}
			</CardContent>
		</Card>
	);
}

function SheetMau() {
	const m = MAU_OKR[1] as MauOkr;
	return (
		<Sheet open>
			<SheetContent className="w-full sm:max-w-xl" side="right">
				<SheetHeader>
					<SheetTitle>Thêm mẫu OKR</SheetTitle>
					<SheetDescription>
						Mẫu hiện trong «Đặt mục tiêu» của đúng các đơn vị chọn ở đây.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
					<Field>
						<FieldLabel htmlFor="ten-mau">Tên mẫu</FieldLabel>
						<Input
							autoComplete="off"
							defaultValue={m.ten}
							id="ten-mau"
							name="ten-mau"
						/>
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor="cap-mau">Cấp</FieldLabel>
							<Select defaultValue="phong-ban">
								<SelectTrigger id="cap-mau">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="bo-phan">Bộ phận</SelectItem>
									<SelectItem value="phong-ban">Phòng ban</SelectItem>
									<SelectItem value="ca-nhan">Cá nhân</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel htmlFor="loai-mau">Loại mục tiêu</FieldLabel>
							<Select defaultValue="cam-ket">
								<SelectTrigger id="loai-mau">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cam-ket">Cam kết</SelectItem>
									<SelectItem value="tham-vong">Tham vọng</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>
					<Field>
						<FieldLabel>Áp cho</FieldLabel>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline">Chăm sóc khách hàng</Badge>
							<Badge variant="outline">Hỗ trợ môi giới</Badge>
							<Button size="sm" variant="ghost">
								Chọn đơn vị…
							</Button>
						</div>
						<FieldDescription>
							Để trống thì mẫu áp cho mọi phòng ban.
						</FieldDescription>
					</Field>
					<Field>
						<FieldLabel htmlFor="cau-muc-tieu">Câu mục tiêu gợi ý</FieldLabel>
						<Textarea
							defaultValue={m.cauMucTieu}
							id="cau-muc-tieu"
							name="cau-muc-tieu"
						/>
					</Field>
					<div className="flex flex-col gap-3">
						<span className="font-medium text-sm">KR mẫu</span>
						{m.kr.map((k, i) => (
							<Item key={k.ten} size="sm" variant="outline">
								<ItemContent className="gap-2">
									<Field>
										<FieldLabel htmlFor={`kr-mau-${i}`}>KR {i + 1}</FieldLabel>
										<Input defaultValue={k.ten} id={`kr-mau-${i}`} />
									</Field>
									<div className="grid gap-2 sm:grid-cols-4">
										<Field className="sm:col-span-2">
											<FieldLabel htmlFor={`kieu-mau-${i}`}>Kiểu</FieldLabel>
											<Select defaultValue={k.kieu}>
												<SelectTrigger id={`kieu-mau-${i}`}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{KIEU_KR_MAU.map((x) => (
														<SelectItem key={x} value={x}>
															{x}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
										<Field data-invalid={i === 0 || undefined}>
											<FieldLabel htmlFor={`khoi-mau-${i}`}>
												Khởi điểm
											</FieldLabel>
											<Input
												aria-invalid={i === 0 || undefined}
												defaultValue={i === 0 ? "4" : ""}
												id={`khoi-mau-${i}`}
												inputMode="decimal"
											/>
										</Field>
										<Field data-invalid={i === 0 || undefined}>
											<FieldLabel htmlFor={`dich-mau-${i}`}>Đích</FieldLabel>
											<Input
												aria-invalid={i === 0 || undefined}
												defaultValue={i === 0 ? "8" : ""}
												id={`dich-mau-${i}`}
												inputMode="decimal"
											/>
										</Field>
									</div>
									{i === 0 ? (
										<FieldError>
											KR «Giảm xuống» cần đích nhỏ hơn khởi điểm.
										</FieldError>
									) : null}
								</ItemContent>
								<ItemActions>
									<Button
										aria-label={`Bỏ KR mẫu ${i + 1}`}
										size="icon-sm"
										variant="ghost"
									>
										<Icon icon={TrashCan} />
									</Button>
								</ItemActions>
							</Item>
						))}
						<div>
							<Button size="sm" variant="outline">
								<Icon icon={Add} data-icon="inline-start" />
								Thêm KR mẫu
							</Button>
						</div>
					</div>
				</div>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Huỷ</Button>
					</SheetClose>
					<Button disabled>Lưu mẫu</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function HopThoaiDatMucTieu({ tuMau }: { tuMau: boolean }) {
	const m = MAU_OKR[1] as MauOkr;
	return (
		<Dialog open>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Đặt mục tiêu — Chăm sóc khách hàng</DialogTitle>
					<DialogDescription>
						{tuMau
							? `Bắt đầu từ mẫu «${m.ten}». Điền số của đơn vị rồi tạo bản nháp.`
							: "Viết mục tiêu, hoặc bắt đầu từ một mẫu của đơn vị."}
					</DialogDescription>
				</DialogHeader>
				{tuMau ? (
					<div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
						<Field>
							<FieldLabel htmlFor="mt-tu-mau">Mục tiêu</FieldLabel>
							<Textarea
								defaultValue={m.cauMucTieu}
								id="mt-tu-mau"
								name="muc-tieu"
							/>
						</Field>
						{m.kr.map((k, i) => (
							<Item key={k.ten} size="sm" variant="outline">
								<ItemContent className="gap-2">
									<ItemTitle>
										<span translate="no">{k.ten}</span>
									</ItemTitle>
									<ItemDescription>
										{k.kieu}
										{k.donVi ? ` · ${k.donVi}` : ""}
									</ItemDescription>
									{k.kieu === "Mốc" ? null : (
										<div className="grid gap-2 sm:grid-cols-2">
											<Field data-invalid={i === 1 || undefined}>
												<FieldLabel htmlFor={`khoi-tu-mau-${i}`}>
													Khởi điểm
												</FieldLabel>
												<Input
													aria-invalid={i === 1 || undefined}
													defaultValue={i === 0 ? "8" : ""}
													id={`khoi-tu-mau-${i}`}
													inputMode="decimal"
												/>
											</Field>
											<Field data-invalid={i === 1 || undefined}>
												<FieldLabel htmlFor={`dich-tu-mau-${i}`}>
													Đích
												</FieldLabel>
												<Input
													aria-invalid={i === 1 || undefined}
													defaultValue={i === 0 ? "2" : ""}
													id={`dich-tu-mau-${i}`}
													inputMode="decimal"
												/>
											</Field>
										</div>
									)}
									{i === 1 ? (
										<FieldError>Điền khởi điểm và đích của đơn vị.</FieldError>
									) : null}
								</ItemContent>
							</Item>
						))}
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<span className="font-medium text-sm">Bắt đầu từ mẫu</span>
						<ItemGroup className="gap-2">
							{MAU_OKR.filter((x) => x.cap === "Phòng ban").map((x) => (
								<Item asChild key={x.id} size="sm" variant="outline">
									<button type="button">
										<ItemMedia variant="icon">
											<Icon icon={Template} />
										</ItemMedia>
										<ItemContent>
											<ItemTitle>
												<span translate="no">{x.ten}</span>
											</ItemTitle>
											<ItemDescription>
												<span translate="no">{x.cauMucTieu}</span> · {x.soKr} KR
											</ItemDescription>
										</ItemContent>
									</button>
								</Item>
							))}
						</ItemGroup>
						<Field>
							<FieldLabel htmlFor="mt-tay">Hoặc viết mục tiêu</FieldLabel>
							<Textarea
								id="mt-tay"
								name="muc-tieu"
								placeholder="Đơn vị muốn đạt gì trong kỳ này…"
							/>
						</Field>
					</div>
				)}
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button>Tạo bản nháp</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function MauOkrMan({ hinh }: { hinh: HinhMau }) {
	if (hinh === "chon-mau") return <HopThoaiDatMucTieu tuMau={false} />;
	if (hinh === "tu-mau") return <HopThoaiDatMucTieu tuMau />;
	return (
		<PageShell>
			<div
				className="flex w-full max-w-(--container-page) flex-col gap-6"
				data-cai-dat-okr
			>
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>Chương trình OKR</PageShellTitle>
						{hinh === "khong-quyen" ? (
							<PageShellDescription>
								Chỉ quản trị sửa được chương trình và mẫu OKR.
							</PageShellDescription>
						) : null}
					</PageShellHeading>
				</PageShellHeader>
				<TheMau hinh={hinh} />
				{hinh === "sheet" ? <SheetMau /> : null}
			</div>
		</PageShell>
	);
}
