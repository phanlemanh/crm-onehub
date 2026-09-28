"use client";

import Download from "@carbon/icons-react/es/Download";
import Information from "@carbon/icons-react/es/Information";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
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
	Empty,
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
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
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
import {
	DangTai,
	LoaiMucTieuNhan,
	Loi,
	so,
	TenNguoi,
} from "../ban-mau-okr/phan-chung";
import {
	cauDoc,
	daChamHet,
	diemChu,
	diemMucTieu,
	type KrChamMau,
	KY_CHAM,
	LUOI_DIEM,
	MT_CAM_KET,
	MT_THAM_VONG,
	type MucTieuChamMau,
} from "./du-lieu";

export type HinhCham =
	| "don-vi"
	| "sheet"
	| "ly-do"
	| "nhan-ra"
	| "da-xong"
	| "chi-okr"
	| "da-dong"
	| "rong"
	| "dang-tai"
	| "loi";

type CheDo = "cham" | "chi-doc" | "da-dong";

function soKr(k: KrChamMau, v: number): string {
	if (k.kieu === "moc") return v >= 1 ? "Xong" : "Chưa xong";
	if (k.donVi === "%") return `${so(v)}%`;
	return `${so(v)} ${k.donVi}`;
}

function NhanDoiDich({ k }: { k: KrChamMau }) {
	if (k.doiDichNgoaiRa.length === 0) return null;
	return (
		<span className="flex flex-col gap-1">
			<span>
				<Badge variant="outline">Đích sửa ngoài rà</Badge>
			</span>
			{k.doiDichNgoaiRa.map((d) => (
				<span className="text-muted-foreground text-xs" key={d.ngay}>
					{d.ngay}: {soKr(k, d.truoc)} → {soKr(k, d.sau)} ·{" "}
					<span translate="no">«{d.lyDo}»</span>
				</span>
			))}
		</span>
	);
}

function OChonDiem({
	k,
	cheDo,
	loiLyDo,
	kho,
}: {
	k: KrChamMau;
	cheDo: CheDo;
	loiLyDo: boolean;
	kho: "nho" | "lon";
}) {
	const dang = loiLyDo ? 0.6 : (k.diem ?? k.diemGoiY);
	const khacGoiY = dang !== k.diemGoiY;
	if (cheDo !== "cham" || !k.suaDuoc)
		return (
			<span className="flex flex-col gap-1 text-sm">
				<span className="tabular-nums">
					{k.diem === null ? "Chưa chấm" : diemChu(k.diem)}
				</span>
				{k.lyDo ? (
					<span className="text-muted-foreground text-xs" translate="no">
						«{k.lyDo}»
					</span>
				) : null}
				{cheDo === "cham" && !k.suaDuoc ? (
					<span className="text-muted-foreground text-xs">
						Người sửa được KR này chấm
					</span>
				) : null}
			</span>
		);
	return (
		<div className="flex flex-col gap-2">
			<Field>
				<FieldLabel className="sr-only" htmlFor={`diem-${kho}-${k.id}`}>
					Điểm của {k.ten}
				</FieldLabel>
				<Select defaultValue={String(dang)}>
					<SelectTrigger id={`diem-${kho}-${k.id}`} size="sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{LUOI_DIEM.map((d) => (
							<SelectItem key={d} value={String(d)}>
								{diemChu(d)}
								{d === k.diemGoiY ? " · gợi ý" : ""}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</Field>
			{khacGoiY ? (
				<Field data-invalid={loiLyDo || undefined}>
					<FieldLabel htmlFor={`ly-do-${kho}-${k.id}`}>Lý do chỉnh</FieldLabel>
					<Textarea
						aria-invalid={loiLyDo || undefined}
						defaultValue={loiLyDo ? "" : (k.lyDo ?? "")}
						id={`ly-do-${kho}-${k.id}`}
						rows={2}
					/>
					{loiLyDo ? (
						<FieldError>
							Cần lý do khi điểm khác gợi ý (ít nhất 10 ký tự).
						</FieldError>
					) : null}
				</Field>
			) : null}
			<Button className="self-start" size="sm" variant="outline">
				{k.diem === null ? "Lưu điểm" : "Lưu lại"}
			</Button>
		</div>
	);
}

const COT = [
	{ id: "kr", header: "KR" },
	{
		id: "so",
		header: "Khởi điểm → đích · số chốt",
		width: "w-[22%]",
		className: "hidden md:table-cell",
	},
	{
		id: "goi-y",
		header: "Gợi ý",
		width: "w-[10%]",
		className: "hidden md:table-cell",
	},
	{
		id: "diem",
		header: "Điểm",
		width: "w-[30%]",
		className: "hidden md:table-cell",
	},
] satisfies SimpleTableColumn[];

function DongKr({
	k,
	cheDo,
	loiLyDo,
}: {
	k: KrChamMau;
	cheDo: CheDo;
	loiLyDo: boolean;
}) {
	const so3 = (
		<span className="flex flex-col gap-0.5 text-sm tabular-nums">
			<span>
				{soKr(k, k.khoiDiem)} → {soKr(k, k.dich)}
			</span>
			<span className="text-muted-foreground text-xs">
				Số chốt {soKr(k, k.soChot)}
			</span>
		</span>
	);
	return (
		<SimpleTableRow data-kr={k.id}>
			<TableCell className="px-3 py-3 align-top whitespace-normal">
				<div className="flex flex-col gap-1.5">
					<span className="text-sm" translate="no">
						{k.ten}
					</span>
					<span className="text-muted-foreground text-xs">
						Phụ trách <TenNguoi avatar={false} ten={k.phuTrach.ten} />
					</span>
					<span className="md:hidden">{so3}</span>
					<span className="text-muted-foreground text-xs md:hidden">
						Gợi ý {diemChu(k.diemGoiY)}
					</span>
					<NhanDoiDich k={k} />
					<span className="md:hidden">
						<OChonDiem cheDo={cheDo} k={k} kho="nho" loiLyDo={loiLyDo} />
					</span>
				</div>
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top md:table-cell">
				{so3}
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top text-sm tabular-nums md:table-cell">
				{diemChu(k.diemGoiY)}
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top whitespace-normal md:table-cell">
				<OChonDiem cheDo={cheDo} k={k} kho="lon" loiLyDo={loiLyDo} />
			</TableCell>
		</SimpleTableRow>
	);
}

function KhoiMucTieu({
	mt,
	cheDo,
	loiLyDoKr,
}: {
	mt: MucTieuChamMau;
	cheDo: CheDo;
	loiLyDoKr: string | null;
}) {
	const diem = diemMucTieu(mt);
	const daCham = mt.kr.filter((k) => k.diem !== null).length;
	return (
		<Card data-muc-tieu={mt.id}>
			<CardHeader>
				<CardTitle>
					<span translate="no">{mt.ten}</span>
				</CardTitle>
				<CardDescription>
					<LoaiMucTieuNhan loai={mt.loai} /> · Phụ trách{" "}
					<TenNguoi avatar={false} ten={mt.phuTrach.ten} />
				</CardDescription>
				<div>
					{diem === null ? (
						<StatusIndicator
							label={`Đã chấm ${daCham}/${mt.kr.length} KR`}
							size="sm"
							tone="warning"
						/>
					) : (
						<StatusIndicator
							label={`Điểm ${diemChu(diem)} · ${cauDoc(mt.loai, diem)}`}
							size="sm"
							tone="neutral"
						/>
					)}
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<SimpleTable columns={COT}>
					{mt.kr.map((k) => (
						<DongKr
							cheDo={cheDo}
							k={k}
							key={k.id}
							loiLyDo={loiLyDoKr === k.id}
						/>
					))}
				</SimpleTable>
				<Field>
					<FieldLabel htmlFor={`hoc-${mt.id}`}>Điều học được</FieldLabel>
					{cheDo === "cham" ? (
						<>
							<Textarea
								defaultValue={mt.dieuHocDuoc}
								id={`hoc-${mt.id}`}
								placeholder="Điều gì đơn vị sẽ làm khác ở kỳ sau?"
								rows={3}
								translate="no"
							/>
							<FieldDescription>
								Không bắt buộc để đóng kỳ. Ai mở được mục tiêu đều đọc được.
							</FieldDescription>
						</>
					) : (
						<p className="text-sm" id={`hoc-${mt.id}`} translate="no">
							{mt.dieuHocDuoc || "Chưa ghi."}
						</p>
					)}
				</Field>
			</CardContent>
			{cheDo === "cham" ? (
				<CardFooter className="flex flex-wrap gap-2">
					<Button size="sm" variant="outline">
						Lưu điều học được
					</Button>
					<Button size="sm" variant="outline">
						Mang sang {KY_CHAM.ke}
					</Button>
				</CardFooter>
			) : null}
		</Card>
	);
}

function KhongPhaiDanhGia() {
	return (
		<Alert>
			<Icon icon={Information} />
			<AlertTitle>Điểm cuối kỳ không phải đánh giá nhân sự</AlertTitle>
			<AlertDescription>
				Điểm không nối vào lương, thưởng hay xếp hạng người. Máy gợi ý từ số
				chốt ngày {KY_CHAM.sangCham}; người chỉnh được, kèm lý do. Mục tiêu tham
				vọng đạt 0,7 là tốt.
			</AlertDescription>
		</Alert>
	);
}

function DauDonVi({ daDong }: { daDong: boolean }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<span translate="no">Chăm sóc khách hàng</span>
				</CardTitle>
				<CardDescription>
					Phòng ban · Trưởng <TenNguoi avatar={false} ten={NGUOI.thao.ten} /> ·{" "}
					{KY_CHAM.ten} · {daDong ? "đã đóng" : "đang chấm điểm"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="relative overflow-x-auto">
					<ToggleGroup
						aria-label="Cách xem"
						size="sm"
						type="single"
						value="cham"
						variant="outline"
					>
						<ToggleGroupItem value="danh-sach">Danh sách</ToggleGroupItem>
						<ToggleGroupItem value="cay">Cây căn chỉnh</ToggleGroupItem>
						<ToggleGroupItem value="hop-tuan">Họp tuần</ToggleGroupItem>
						<ToggleGroupItem value="cham">Chấm điểm</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</CardContent>
		</Card>
	);
}

function DaiKy({ daDong }: { daDong: boolean }) {
	return daDong ? (
		<Alert>
			<AlertTitle>{KY_CHAM.ten} đã đóng</AlertTitle>
			<AlertDescription>
				Số, điểm và điều học được chỉ còn để đọc. Tải cả kỳ ở Toàn cảnh.
			</AlertDescription>
		</Alert>
	) : (
		<Alert variant="warning">
			<AlertTitle>{KY_CHAM.ten} đang chấm điểm</AlertTitle>
			<AlertDescription>
				Quản trị đóng kỳ khi mọi KR đã chấm. Số của KR đã chốt ngày{" "}
				{KY_CHAM.sangCham}.
			</AlertDescription>
		</Alert>
	);
}

function HuongA({
	hinh,
}: {
	hinh: Exclude<HinhCham, "sheet" | "dang-tai" | "loi">;
}) {
	const daDong = hinh === "da-dong";
	const cheDo: CheDo = daDong
		? "da-dong"
		: hinh === "chi-okr"
			? "chi-doc"
			: "cham";
	const ds =
		hinh === "da-xong" || daDong
			? [daChamHet(MT_CAM_KET), MT_THAM_VONG]
			: hinh === "chi-okr"
				? [
						{
							...MT_CAM_KET,
							kr: MT_CAM_KET.kr.map((k) => ({ ...k, suaDuoc: false })),
						},
					]
				: [MT_CAM_KET, MT_THAM_VONG];
	const tongKr = ds.reduce((s, m) => s + m.kr.length, 0);
	const daCham = ds.reduce(
		(s, m) => s + m.kr.filter((k) => k.diem !== null).length,
		0,
	);
	return (
		<div className="flex flex-col gap-6" data-ban-mau="cham-don-vi">
			<DauDonVi daDong={daDong} />
			<p className="text-muted-foreground text-sm">
				Hướng A (máy khuyên) — «Chấm điểm» là cách xem thứ tư của «Theo đơn vị»,
				hiện khi kỳ ở pha chấm hoặc đã đóng. Đơn vị chấm cùng nhau trên một màn,
				như họp tuần.
			</p>
			<DaiKy daDong={daDong} />
			{hinh === "rong" ? (
				<Empty className="rounded-lg border">
					<EmptyHeader>
						<EmptyTitle>Không có mục tiêu đã công bố trong kỳ</EmptyTitle>
						<EmptyDescription>
							Đơn vị này không có gì để chấm ở {KY_CHAM.ten}. Mục tiêu nháp và
							mục tiêu đã bỏ không chấm.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<>
					{daDong ? null : <KhongPhaiDanhGia />}
					<p className="text-sm" data-tien-do-cham>
						{daCham === tongKr
							? `Đã chấm cả ${tongKr} KR của đơn vị. Quản trị đóng kỳ khi mọi đơn vị xong.`
							: `Đã chấm ${daCham}/${tongKr} KR.`}
					</p>
					{hinh === "chi-okr" ? (
						<p className="text-muted-foreground text-sm">
							Bạn đọc được điểm; người phụ trách KR, trưởng đơn vị hoặc quản trị
							chấm.
						</p>
					) : null}
					{ds.map((mt) => (
						<KhoiMucTieu
							cheDo={cheDo}
							key={mt.id}
							loiLyDoKr={hinh === "ly-do" ? "c1k4" : null}
							mt={
								hinh === "ly-do"
									? {
											...mt,
											kr: mt.kr.map((k) =>
												k.id === "c1k4" ? { ...k, suaDuoc: true } : k,
											),
										}
									: mt
							}
						/>
					))}
				</>
			)}
		</div>
	);
}

function HuongB() {
	return (
		<div className="flex flex-col gap-4" data-ban-mau="cham-sheet">
			<p className="text-muted-foreground text-sm">
				Hướng B — tab «Chấm điểm» trong sheet mục tiêu; chấm từng mục tiêu một,
				mở từ danh sách.
			</p>
			<Sheet open>
				<SheetContent className="w-full sm:max-w-3xl" side="right">
					<SheetHeader>
						<SheetTitle>
							<span translate="no">{MT_CAM_KET.ten}</span>
						</SheetTitle>
						<SheetDescription>
							Chăm sóc khách hàng · {KY_CHAM.ten}
						</SheetDescription>
					</SheetHeader>
					<div className="flex flex-col gap-4 overflow-y-auto px-4 pb-6">
						<Tabs value="cham">
							<TabsList
								aria-label="Khung mục tiêu"
								className="w-full justify-start gap-6 border-b"
								variant="line"
							>
								<TabsTrigger value="kr">KR</TabsTrigger>
								<TabsTrigger value="can-chinh">Căn chỉnh</TabsTrigger>
								<TabsTrigger value="vet">Vết</TabsTrigger>
								<TabsTrigger value="trao-doi">Trao đổi</TabsTrigger>
								<TabsTrigger value="cham">Chấm điểm</TabsTrigger>
							</TabsList>
						</Tabs>
						<KhongPhaiDanhGia />
						<KhoiMucTieu cheDo="cham" loiLyDoKr={null} mt={MT_CAM_KET} />
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}

export function ChamDiem({ hinh }: { hinh: HinhCham }) {
	if (hinh === "dang-tai") return <DangTai dong={3} />;
	if (hinh === "loi")
		return (
			<Loi cau="Không tải được bảng chấm. Điểm đã lưu vẫn còn; bấm Thử lại." />
		);
	if (hinh === "sheet") return <HuongB />;
	return <HuongA hinh={hinh} />;
}

export type HinhMangSang = "hoi" | "khong-ky";

export function MangSang({ hinh }: { hinh: HinhMangSang }) {
	return (
		<div className="flex flex-col gap-6">
			<HuongA hinh="don-vi" />
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Mang sang {KY_CHAM.ke}</DialogTitle>
						<DialogDescription>
							{hinh === "khong-ky"
								? "Chưa có chu kỳ kế để mang sang — quản trị mở chu kỳ trước."
								: `Tạo một mục tiêu nháp ở ${KY_CHAM.ke}, cùng đơn vị, loại và người phụ trách. Mục tiêu và điểm ở ${KY_CHAM.ten} giữ nguyên.`}
						</DialogDescription>
					</DialogHeader>
					{hinh === "hoi" ? (
						<div className="flex flex-col gap-3">
							<p className="font-medium text-sm">Chép 3 KR chưa trọn</p>
							<ItemGroup>
								{MT_CAM_KET.kr
									.filter((k) => (k.diem ?? k.diemGoiY) < 1)
									.map((k) => (
										<Item key={k.id} size="sm" variant="outline">
											<ItemContent>
												<ItemTitle>
													<span translate="no">{k.ten}</span>
												</ItemTitle>
												<ItemDescription>
													Khởi điểm mới {soKr(k, k.soChot)} (số chốt) · đích{" "}
													{soKr(k, k.dich)}
												</ItemDescription>
											</ItemContent>
										</Item>
									))}
							</ItemGroup>
							<p className="text-muted-foreground text-sm">
								Không chép: «{MT_CAM_KET.kr[0]?.ten}» — điểm 1, đã trọn. Căn
								chỉnh không chép; đặt lại ở kỳ mới.
							</p>
						</div>
					) : null}
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">
								{hinh === "khong-ky" ? "Đóng" : "Huỷ"}
							</Button>
						</DialogClose>
						{hinh === "hoi" ? <Button>Mang sang</Button> : null}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export function ToanCanhXuat() {
	return (
		<div className="flex flex-col gap-4" data-ban-mau="toan-canh-xuat">
			<Alert>
				<AlertTitle>{KY_CHAM.ten} đã đóng</AlertTitle>
				<AlertDescription>
					Số và điểm chỉ còn để đọc. Mở lại kỳ là việc của quản trị, có lý do và
					để vết.
				</AlertDescription>
			</Alert>
			<Card>
				<CardHeader>
					<CardTitle>Cả công ty · {KY_CHAM.ten}</CardTitle>
					<CardDescription>
						42 mục tiêu đã công bố · 168 KR đã chấm · 31 mục tiêu có điều học
						được
					</CardDescription>
					<CardAction>
						<Button size="sm" variant="outline">
							<Icon icon={Download} data-icon="inline-start" />
							Xuất
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className="text-muted-foreground text-sm">
					Tệp CSV một dòng mỗi KR: đơn vị, mục tiêu, KR, khởi điểm, đích, số
					chốt, điểm gợi ý, điểm, lý do chỉnh, đích sửa ngoài rà, điều học được,
					mang sang tới. Heatmap và bảng Toàn cảnh như bản mẫu đã duyệt nằm dưới
					thẻ này.
				</CardContent>
			</Card>
		</div>
	);
}
