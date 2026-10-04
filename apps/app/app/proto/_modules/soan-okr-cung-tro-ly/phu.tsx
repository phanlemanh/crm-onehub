"use client";

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
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
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
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	CUOC_GAN_DAY,
	DON_VI,
	DON_VI_CHON,
	DONG_NGAN_CUOC,
	dinhDang,
	KY_SOAN,
	SO_DO_SOAN,
} from "./du-lieu";

export type HinhPhu =
	| "tochuc-mo-ta"
	| "tochuc-chuc-danh"
	| "kho-tao-chien-luoc"
	| "kho-duyet-canh-bao"
	| "kho-duyet-qua-tran"
	| "caidat-nac-soan"
	| "sodo-soan"
	| "sodo-soan-rong"
	| "sodo-soan-ngan";

const CELL = "px-3 py-2.5 align-middle";

const MO_TA_DON_VI =
	"Phòng bán dịch vụ vận tải đường bộ cho khách miền Bắc: 14 khách lớn ký hợp đồng năm, còn lại là khách chuyến. Tuyến chính Hà Nội – Hải Phòng, Hà Nội – Lạng Sơn. Bảy người, ba theo khách lớn, bốn theo khách mới.";

function Trang({
	tieuDe,
	moTa,
	children,
}: {
	tieuDe: string;
	moTa: string;
	children: React.ReactNode;
}) {
	return (
		<PageShell>
			<div className="flex w-full max-w-(--container-page) flex-col gap-6">
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>{tieuDe}</PageShellTitle>
						<PageShellDescription>{moTa}</PageShellDescription>
					</PageShellHeading>
				</PageShellHeader>
				{children}
			</div>
		</PageShell>
	);
}

function TheToChuc({ hinh }: { hinh: "tochuc-mo-ta" | "tochuc-chuc-danh" }) {
	const laDonVi = hinh === "tochuc-mo-ta";
	return (
		<Card data-the={hinh}>
			<CardHeader>
				<CardTitle translate="no">
					{laDonVi ? DON_VI.ten : DON_VI.truong}
				</CardTitle>
				<CardDescription>
					{laDonVi
						? `${DON_VI.cap} · Trưởng ${DON_VI.truong} · ${DON_VI.soNguoi} người`
						: `${DON_VI.ten} · trưởng phòng ban`}
				</CardDescription>
				<CardAction>
					<Button size="sm">Lưu</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					{laDonVi ? (
						<Field>
							<FieldLabel htmlFor="mo-ta-don-vi">Mô tả</FieldLabel>
							<Textarea
								id="mo-ta-don-vi"
								defaultValue={MO_TA_DON_VI}
								maxLength={500}
								translate="no"
							/>
							<FieldDescription>
								Trợ lý OKR đọc mô tả này khi soạn ·{" "}
								<span className="tabular-nums">{MO_TA_DON_VI.length}/500</span>{" "}
								ký tự
							</FieldDescription>
						</Field>
					) : (
						<Field>
							<FieldLabel htmlFor="chuc-danh">Chức danh</FieldLabel>
							<Input
								id="chuc-danh"
								defaultValue="Trưởng phòng Kinh doanh miền Bắc"
								maxLength={80}
								translate="no"
							/>
							<FieldDescription>
								Trợ lý OKR đọc mô tả này khi soạn · tối đa 80 ký tự
							</FieldDescription>
						</Field>
					)}
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

const LOAI_TRANG = [
	{ id: "quy-trinh", nhan: "Quy trình" },
	{ id: "chinh-sach", nhan: "Chính sách" },
	{ id: "chien-luoc", nhan: "Chiến lược" },
	{ id: "huong-dan", nhan: "Hướng dẫn" },
];

function TheTaoTrang() {
	return (
		<Card data-the="kho-tao-chien-luoc">
			<CardHeader>
				<CardTitle>Trang mới</CardTitle>
				<CardDescription>
					Trang đi qua duyệt rồi mới thành bản đang dùng.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="ten-trang">Tên trang</FieldLabel>
						<Input
							id="ten-trang"
							defaultValue="Chiến lược năm 2027"
							translate="no"
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="loai-trang">Loại trang</FieldLabel>
						<Select defaultValue="chien-luoc">
							<SelectTrigger id="loai-trang" className="w-full sm:w-56">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{LOAI_TRANG.map((l) => (
									<SelectItem key={l.id} value={l.id}>
										{l.nhan}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FieldDescription>
							Trợ lý OKR đọc bản đang dùng của loại này
						</FieldDescription>
					</Field>
					<Field>
						<FieldLabel htmlFor="noi-dung-trang">Nội dung</FieldLabel>
						<Textarea
							id="noi-dung-trang"
							defaultValue="Năm 2027 Hải Đăng nhắm hai điều: cảng Hải Phòng là cửa ngõ thứ hai, và mọi khách lớn gia hạn cả năm…"
							translate="no"
						/>
					</Field>
				</FieldGroup>
			</CardContent>
			<CardFooter className="justify-end gap-2">
				<Button variant="outline">Huỷ</Button>
				<Button>Tạo trang</Button>
			</CardFooter>
		</Card>
	);
}

function TheDuyet({ quaTran }: { quaTran: boolean }) {
	return (
		<Card data-the={quaTran ? "kho-duyet-qua-tran" : "kho-duyet-canh-bao"}>
			<CardHeader>
				<CardTitle translate="no">Chiến lược năm 2027</CardTitle>
				<CardDescription>
					Loại Chiến lược · bản đề xuất của Đỗ Hải Sơn · 28/11
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{quaTran ? null : (
					<Alert variant="warning" role="note">
						<AlertTitle>
							Có chữ về lương, thưởng, xếp hạng — Trợ lý OKR không được nhắc tới
							những thứ này
						</AlertTitle>
						<AlertDescription>
							Đoạn 4 «thưởng quý theo xếp hạng phòng». Duyệt vẫn được; Trợ lý sẽ
							bỏ đoạn đó khi đọc.
						</AlertDescription>
					</Alert>
				)}
				<div className="flex flex-col gap-2" translate="no">
					<p>
						Năm 2027 Hải Đăng nhắm hai điều: cảng Hải Phòng là cửa ngõ thứ hai,
						và mọi khách lớn gia hạn cả năm.
					</p>
					<p>
						Miền Bắc giữ 14 khách lớn; miền Nam mở tuyến miền Tây; Điều phối đưa
						chuyến đúng hẹn lên 95%.
					</p>
					{quaTran ? (
						<p className="text-muted-foreground">
							… còn 22 đoạn nữa (24.310 ký tự).
						</p>
					) : (
						<p>Thưởng quý theo xếp hạng phòng: nhất 3%, nhì 2%.</p>
					)}
				</div>
				{quaTran ? (
					<FieldError>
						Trang chiến lược tối đa 20.000 ký tự (đang 24.310)
					</FieldError>
				) : null}
			</CardContent>
			<CardFooter className="justify-end gap-2">
				<Button variant="outline">Trả lại</Button>
				<Button disabled={quaTran}>Duyệt</Button>
			</CardFooter>
		</Card>
	);
}

const PHAM_VI = [
	{ id: "tat", nhan: "Không đơn vị nào" },
	{ id: "toan-cong-ty", nhan: "Toàn công ty" },
	{ id: "danh-sach", nhan: "Chọn đơn vị" },
];

function DongNac({
	ma,
	nhan,
	phamVi,
	donVi,
	moTa,
}: {
	ma: string;
	nhan: string;
	phamVi: string;
	donVi: string[];
	moTa: string;
}) {
	const ten = DON_VI_CHON.filter((d) => donVi.includes(d.id));
	return (
		<Field data-nac={ma}>
			<FieldLabel htmlFor={`nac-${ma}`}>{nhan}</FieldLabel>
			<Select defaultValue={phamVi}>
				<SelectTrigger id={`nac-${ma}`} className="w-full sm:w-56">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{PHAM_VI.map((p) => (
						<SelectItem key={p.id} value={p.id}>
							{p.nhan}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{phamVi === "danh-sach" ? (
				<div className="flex flex-wrap items-center gap-2">
					<ul className="flex flex-wrap gap-1.5" aria-label={nhan}>
						{ten.map((d) => (
							<li key={d.id}>
								<Badge variant="token" translate="no">
									{d.ten}
								</Badge>
							</li>
						))}
					</ul>
					<Button variant="outline" size="sm">
						Chọn đơn vị…
					</Button>
				</div>
			) : null}
			<FieldDescription>{moTa}</FieldDescription>
		</Field>
	);
}

function TheNacSoan() {
	return (
		<Card data-the="caidat-nac-soan">
			<CardHeader>
				<CardTitle>Trợ lý OKR</CardTitle>
				<CardAction>
					<Button size="sm">Lưu</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<FieldSet>
						<FieldLegend>Soạn OKR</FieldLegend>
						<DongNac
							ma="soan-bat"
							nhan="Bật cho"
							phamVi="danh-sach"
							donVi={["kd-bac"]}
							moTa="Trưởng đơn vị thấy nút «Soạn OKR cùng Trợ lý» khi chu kỳ đang lập kế hoạch."
						/>
						<DongNac
							ma="soan-an"
							nhan="Chế độ ẩn cho"
							phamVi="danh-sach"
							donVi={["kd-nam", "dieu-phoi"]}
							moTa="Chỉ quản trị thấy nút; cuộc soạn không đưa vào bộ OKR của đơn vị, chỉ tính vào số đo. Tính vào trần tháng."
						/>
					</FieldSet>
					<Field>
						<FieldLabel htmlFor="tran-thang">Trần tháng đặt OKR</FieldLabel>
						<InputGroup className="w-full sm:w-56">
							<InputGroupInput
								id="tran-thang"
								inputMode="decimal"
								placeholder="Bằng trần thường…"
							/>
							<InputGroupAddon align="inline-end">
								<InputGroupText>USD</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
						<FieldDescription>
							Trống = bằng trần thường (20 USD). Tính riêng cho mùa đặt OKR vì
							cuộc soạn tốn hơn góp ý.
						</FieldDescription>
					</Field>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

function BangSoDo() {
	return (
		<SimpleTable
			surface="page"
			columns={[
				{ id: "so", header: "Số đo" },
				{ id: "bat", header: "Bật", width: "w-40", align: "right" },
				{ id: "an", header: "Ẩn", width: "w-20", align: "right" },
			]}
		>
			{SO_DO_SOAN.map((h) => (
				<SimpleTableRow key={h.nhan}>
					<TableCell className={CELL}>{h.nhan}</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{h.bat}
					</TableCell>
					<TableCell className={`${CELL} text-right tabular-nums`}>
						{h.an}
					</TableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function TheSoDo({ rong }: { rong: boolean }) {
	return (
		<Card data-the="sodo-soan">
			<CardHeader>
				<CardTitle>Soạn OKR cùng Trợ lý — {KY_SOAN.ten}</CardTitle>
				<CardDescription>
					Số đo của nấc bật và chế độ ẩn; bấm một cuộc để xem bản nháp cuối.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				{rong ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Chu kỳ này chưa có cuộc soạn nào</EmptyTitle>
							<EmptyDescription>
								Số đo hiện khi trưởng đơn vị mở cuộc đầu tiên, hoặc khi một đơn
								vị ở chế độ ẩn được soạn thử.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<>
						<BangSoDo />
						<SimpleTable
							surface="page"
							columns={[
								{ id: "dv", header: "Đơn vị" },
								{ id: "nac", header: "Nấc", width: "w-24" },
								{ id: "luot", header: "Lượt", width: "w-16", align: "right" },
								{ id: "dong", header: "Dòng", width: "w-24", align: "right" },
								{
									id: "chi",
									header: "Chi phí",
									width: "w-20",
									align: "right",
								},
							]}
						>
							{CUOC_GAN_DAY.map((c) => (
								<SimpleTableRow key={c.id}>
									<TableCell className={CELL}>
										<span translate="no">{c.donVi}</span>
										<span className="block text-muted-foreground tabular-nums">
											{dinhDang.ngayNgan(c.ngay)}
										</span>
									</TableCell>
									<TableCell className={CELL}>{c.nac}</TableCell>
									<TableCell className={`${CELL} text-right tabular-nums`}>
										{dinhDang.so(c.luot)}
									</TableCell>
									<TableCell className={`${CELL} text-right tabular-nums`}>
										{c.dong}
										{c.biLoai ? ` (+${c.biLoai} loại)` : ""}
									</TableCell>
									<TableCell className={`${CELL} text-right tabular-nums`}>
										{dinhDang.usd(c.chiPhi)}
									</TableCell>
								</SimpleTableRow>
							))}
						</SimpleTable>
					</>
				)}
			</CardContent>
		</Card>
	);
}

function NganCuoc() {
	const c = CUOC_GAN_DAY[0];
	if (!c) return null;
	return (
		<Sheet open>
			<SheetContent size="md" data-ngan="cuoc">
				<SheetHeader>
					<SheetTitle translate="no">{c.donVi}</SheetTitle>
					<SheetDescription>
						{c.nac} · {dinhDang.so(c.luot)} lượt · {dinhDang.usd(c.chiPhi)} ·{" "}
						{dinhDang.ngayNgan(c.ngay)}
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-3 px-4">
					<p className="text-muted-foreground">
						Bản nháp cuối, kể cả dòng bị loại — cuộc ở chế độ ẩn nên không ai
						trong đơn vị thấy.
					</p>
					<ItemGroup aria-label="Bản nháp cuối">
						{DONG_NGAN_CUOC.map((d) => (
							<Item key={d.id} size="sm" variant="outline" data-dong={d.id}>
								<ItemContent>
									<ItemDescription>{d.loai}</ItemDescription>
									<ItemTitle translate="no">{d.chu}</ItemTitle>
									<span className="flex items-center gap-2">
										<StatusIndicator
											size="sm"
											tone={d.ma ? "warning" : "neutral"}
											label={d.trangThai}
										/>
										{d.ma ? <Badge variant="mono">{d.ma}</Badge> : null}
									</span>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function ManPhu({ hinh }: { hinh: HinhPhu }) {
	if (hinh === "tochuc-mo-ta" || hinh === "tochuc-chuc-danh") {
		return (
			<Trang
				tieuDe="Tổ chức"
				moTa="Bộ phận, phòng ban và người; mô tả ở đây là bối cảnh Trợ lý OKR đọc."
			>
				<TheToChuc hinh={hinh} />
			</Trang>
		);
	}
	if (hinh === "kho-tao-chien-luoc") {
		return (
			<Trang tieuDe="Kho tài liệu" moTa="Trang mới đi qua duyệt.">
				<TheTaoTrang />
			</Trang>
		);
	}
	if (hinh === "kho-duyet-canh-bao" || hinh === "kho-duyet-qua-tran") {
		return (
			<Trang
				tieuDe="Kho tài liệu"
				moTa="Duyệt bản đề xuất — bản đang dùng là bản Trợ lý OKR đọc."
			>
				<TheDuyet quaTran={hinh === "kho-duyet-qua-tran"} />
			</Trang>
		);
	}
	return (
		<Trang
			tieuDe="Chương trình OKR"
			moTa="Chu kỳ, luật chung và Trợ lý OKR của cả công ty."
		>
			{hinh === "caidat-nac-soan" ? (
				<TheNacSoan />
			) : (
				<TheSoDo rong={hinh === "sodo-soan-rong"} />
			)}
			{hinh === "sodo-soan-ngan" ? <NganCuoc /> : null}
		</Trang>
	);
}
