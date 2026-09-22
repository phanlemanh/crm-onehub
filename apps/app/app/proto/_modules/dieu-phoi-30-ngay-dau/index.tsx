import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Progress } from "@crm/ui/components/progress";
import { Separator } from "@crm/ui/components/separator";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { BAC_MAU, BUOC_MAU, HANG_DANH_MUC, MAU_SO } from "./du-lieu";

function KhungMan({
	tieuDe,
	mo,
	children,
}: {
	tieuDe: string;
	mo: string;
	children: React.ReactNode;
}) {
	return (
		<section aria-labelledby="proto-man" className="flex flex-col gap-4">
			<header className="flex flex-col gap-1">
				<h2 className="font-medium text-lg" id="proto-man">
					{tieuDe}
				</h2>
				<p className="text-muted-foreground text-sm">{mo}</p>
			</header>
			{children}
		</section>
	);
}

function BangDanhMuc() {
	return (
		<div className="rounded-lg border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Đối tác</TableHead>
						<TableHead>Đang tắc ở</TableHead>
						<TableHead className="text-right tabular-nums">Im</TableHead>
						<TableHead className="text-right tabular-nums">Bước</TableHead>
						<TableHead className="text-right tabular-nums">Ngày</TableHead>
						<TableHead>Bộ phận</TableHead>
						<TableHead>Cầm trịch</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{HANG_DANH_MUC.map((hang) => (
						<TableRow key={hang.id}>
							<TableCell className="min-w-0 max-w-[11rem] truncate font-medium">
								{hang.doiTac}
							</TableCell>
							<TableCell className="min-w-0 max-w-[11rem] truncate">
								{hang.tacO}
							</TableCell>
							<TableCell className="whitespace-nowrap text-right tabular-nums">
								{hang.imNgay === 0 ? "—" : `${hang.imNgay}n`}
							</TableCell>
							<TableCell className="whitespace-nowrap text-right tabular-nums">
								{hang.buocXong}/{hang.buocTong}
							</TableCell>
							<TableCell className="whitespace-nowrap text-right tabular-nums">
								{hang.ngay}/{hang.tran}
							</TableCell>
							<TableCell>
								<Badge variant="outline">{hang.boPhan}</Badge>
							</TableCell>
							<TableCell>{hang.camTrich}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

function ThanhLoc() {
	return (
		<div className="flex flex-col gap-2">
			<nav aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
				<Badge>Đang chạy 3</Badge>
				<Badge variant="outline">Đang tắc 2</Badge>
				<Badge variant="outline">Chưa giao 1</Badge>
				<Badge variant="outline">Đã đóng 7</Badge>
			</nav>
			<span className="text-muted-foreground text-xs">
				Bộ lọc nằm trong đường dẫn — gửi liên kết là gửi đúng góc nhìn này
			</span>
		</div>
	);
}

function DanhMucCoDuLieu() {
	return (
		<KhungMan
			mo="Ba đối tác đang trong ba mươi ngày đầu"
			tieuDe="Danh mục 30 ngày"
		>
			<ThanhLoc />
			<BangDanhMuc />
		</KhungMan>
	);
}

function DanhMucDangTai() {
	return (
		<KhungMan mo="Đang tải…" tieuDe="Danh mục 30 ngày">
			<div aria-live="polite" className="flex flex-col gap-2">
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		</KhungMan>
	);
}

function DanhMucRong() {
	return (
		<KhungMan mo="Chưa có đối tác nào đang onboard" tieuDe="Danh mục 30 ngày">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chưa có kế hoạch nào</EmptyTitle>
					<EmptyDescription>
						Tạo kế hoạch cho một đối tác vừa ký, chọn khuôn theo loại đối tác.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button>Tạo kế hoạch từ khuôn</Button>
				</EmptyContent>
			</Empty>
		</KhungMan>
	);
}

function DanhMucChuaCoKhuon() {
	return (
		<KhungMan mo="Chưa có khuôn nào để tạo kế hoạch" tieuDe="Danh mục 30 ngày">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chưa có khuôn kế hoạch nào</EmptyTitle>
					<EmptyDescription>
						Kế hoạch ba mươi ngày dựng từ một khuôn theo loại đối tác. Soạn
						khuôn đầu tiên rồi quay lại đây.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button>Đi tới Cài đặt › Khuôn</Button>
				</EmptyContent>
			</Empty>
		</KhungMan>
	);
}

function DanhMucLoi() {
	return (
		<KhungMan mo="Không tải được danh sách" tieuDe="Danh mục 30 ngày">
			<Alert variant="destructive">
				<AlertTitle>Không tải được danh mục</AlertTitle>
				<AlertDescription>
					Máy chủ không trả lời. Thử tải lại; còn lỗi thì báo đội kỹ thuật kèm
					giờ anh thấy màn này.
				</AlertDescription>
			</Alert>
			<div>
				<Button variant="outline">Tải lại</Button>
			</div>
		</KhungMan>
	);
}

function BangBuoc() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Bước của kế hoạch</CardTitle>
				<CardDescription>
					3/5 xong · 1 bước chưa giao cho ai · Kỹ thuật 1, Đào tạo 1 đang dở
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{BUOC_MAU.map((buoc) => (
					<div className="flex flex-col gap-1" key={buoc.id}>
						<div className="flex items-baseline justify-between gap-3">
							<span
								className={`min-w-0 truncate text-sm ${buoc.xong ? "text-muted-foreground line-through" : "font-medium"}`}
							>
								{buoc.nhan}
							</span>
							<span
								className={`shrink-0 text-xs tabular-nums ${buoc.quaHan ? "font-medium text-foreground" : "text-muted-foreground"}`}
							>
								{buoc.han}
							</span>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline">{buoc.boPhan}</Badge>
							{buoc.quaHan ? <Badge variant="outline">Quá hạn</Badge> : null}
							{buoc.nguoi === null ? (
								<Badge variant="secondary">Chưa giao cho ai</Badge>
							) : (
								<span className="text-muted-foreground text-xs">
									{buoc.nguoi}
								</span>
							)}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

function PheuMoiGioi() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Phễu môi giới</CardTitle>
				<CardDescription>
					Mẫu số {MAU_SO} người đang làm nghề trên sàn
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{BAC_MAU.map((bac) => (
					<div className="flex flex-col gap-1.5" key={bac.id}>
						<div className="flex items-baseline justify-between gap-3">
							<span className="min-w-0 truncate text-sm">{bac.nhan}</span>
							<span className="shrink-0 text-sm tabular-nums">
								{bac.dat}/{MAU_SO}
							</span>
						</div>
						<Progress value={(bac.dat / MAU_SO) * 100} />
					</div>
				))}
			</CardContent>
		</Card>
	);
}

function HoSoCoDuLieu() {
	return (
		<KhungMan
			mo="Ngày thứ 21 trên 30 · cầm trịch: Hà"
			tieuDe="Sàn Bất động sản An Khang"
		>
			<div className="grid gap-4 md:grid-cols-2">
				<BangBuoc />
				<PheuMoiGioi />
			</div>
		</KhungMan>
	);
}

function HoSoPheuRong() {
	return (
		<KhungMan
			mo="Ngày thứ 4 trên 30 · cầm trịch: Hà"
			tieuDe="Nhà đất Phương Nam Group Hà Nội"
		>
			<div className="grid gap-4 md:grid-cols-2">
				<BangBuoc />
				<Card>
					<CardHeader>
						<CardTitle>Phễu môi giới</CardTitle>
					</CardHeader>
					<CardContent>
						<Empty>
							<EmptyHeader>
								<EmptyTitle>Chưa ghi danh môi giới nào</EmptyTitle>
								<EmptyDescription>
									Thêm tay từng người, hoặc chờ số từ nền tảng khi đường nối đã
									bật.
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button variant="outline">Thêm môi giới</Button>
							</EmptyContent>
						</Empty>
					</CardContent>
				</Card>
			</div>
		</KhungMan>
	);
}

function HoSoKhongKhuon() {
	return (
		<KhungMan
			mo="Ngày thứ 2 trên 30 · kế hoạch tạo tay"
			tieuDe="Môi giới độc lập Trần Văn Bảo"
		>
			<Alert>
				<AlertTitle>Kế hoạch này không dựng từ khuôn nào</AlertTitle>
				<AlertDescription>
					Bước phải thêm tay. Muốn dùng lại về sau thì lưu bộ bước này thành một
					khuôn.
				</AlertDescription>
			</Alert>
			<Separator />
			<div className="grid gap-4 md:grid-cols-2">
				<BangBuoc />
				<PheuMoiGioi />
			</div>
		</KhungMan>
	);
}

function KhuonRong() {
	return (
		<KhungMan mo="Cài đặt › Khuôn kế hoạch" tieuDe="Khuôn kế hoạch">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chưa có khuôn nào</EmptyTitle>
					<EmptyDescription>
						Một khuôn giữ bộ bước cho một loại đối tác. Sàn môi giới và ngân
						hàng cần bộ bước khác nhau.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button>Soạn khuôn đầu tiên</Button>
				</EmptyContent>
			</Empty>
		</KhungMan>
	);
}

const BANG_STATE = {
	"ST-danhmuc-codulieu": DanhMucCoDuLieu,
	"ST-danhmuc-loading": DanhMucDangTai,
	"ST-danhmuc-empty": DanhMucRong,
	"ST-danhmuc-chuacokhuon": DanhMucChuaCoKhuon,
	"ST-danhmuc-loi": DanhMucLoi,
	"ST-hoso-codulieu": HoSoCoDuLieu,
	"ST-hoso-phieurong": HoSoPheuRong,
	"ST-hoso-khongkhuon": HoSoKhongKhuon,
	"ST-khuon-empty": KhuonRong,
} as const;

export function DieuPhoi30NgayDauMau({ state }: { state: string }) {
	const Man = BANG_STATE[state as keyof typeof BANG_STATE];
	if (Man === undefined) return null;
	return <Man />;
}
