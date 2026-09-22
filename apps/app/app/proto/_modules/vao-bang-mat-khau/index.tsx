import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { Separator } from "@crm/ui/components/separator";
import { Spinner } from "@crm/ui/components/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";

const LIEN_KET =
	"https://crm.onehub.center/dat-mat-khau/8f3ac91b7d2e40c6a5ff1e0b";

const HANG = [
	{ ten: "Nguyễn Thu Hà", dia: "thuha@gmail.com", vai: "Thành viên" },
	{ ten: "Trần Minh Quân", dia: "quantm@gmail.com", vai: "Thành viên" },
	{ ten: "Lê Phương Anh", dia: "phuonganh@gmail.com", vai: "Quản trị" },
];

function ManNgoaiCong({
	tieuDe,
	moTa,
	children,
}: {
	tieuDe: string;
	moTa?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-[34rem] justify-center rounded-lg border bg-background px-6 py-12 text-foreground">
			<div className="flex w-full max-w-sm flex-col gap-8">
				<div className="flex flex-col gap-3 text-left">
					<h2 className="font-semibold text-2xl/8">{tieuDe}</h2>
					{moTa ? (
						<p className="text-muted-foreground text-sm/5">{moTa}</p>
					) : null}
				</div>
				{children}
			</div>
		</div>
	);
}

function HopThoai({
	tieuDe,
	moTa,
	children,
	chan,
}: {
	tieuDe: string;
	moTa?: string;
	children: React.ReactNode;
	chan: React.ReactNode;
}) {
	return (
		<div className="flex justify-center py-6">
			<div className="flex w-full max-w-md flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg">
				<div className="flex flex-col gap-2">
					<h2 className="font-semibold text-lg/6">{tieuDe}</h2>
					{moTa ? (
						<p className="text-muted-foreground text-sm/5">{moTa}</p>
					) : null}
				</div>
				{children}
				<div className="flex justify-end gap-2">{chan}</div>
			</div>
		</div>
	);
}

function ManThanhVien({
	nutTat,
	dangPhat,
	coVet,
}: {
	nutTat?: boolean;
	dangPhat?: boolean;
	coVet?: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Thành viên</CardTitle>
				<CardDescription>
					{HANG.length} người đang làm việc trong không gian này
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tên</TableHead>
							<TableHead>Địa chỉ</TableHead>
							<TableHead>Vai</TableHead>
							<TableHead className="sr-only">Phát liên kết</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{HANG.map((n, i) => (
							<TableRow key={n.dia}>
								<TableCell className="font-medium">
									<div className="flex flex-col gap-1">
										<span>{n.ten}</span>
										{coVet && i === 0 ? (
											<span className="text-muted-foreground text-xs">
												Lê Phương Anh đã phát liên kết · hôm nay 09:12
											</span>
										) : null}
									</div>
								</TableCell>
								<TableCell className="text-muted-foreground">{n.dia}</TableCell>
								<TableCell>
									<Badge variant="secondary">{n.vai}</Badge>
								</TableCell>
								<TableCell className="text-right">
									{dangPhat && i === 0 ? (
										<Button disabled size="sm" variant="outline">
											<Spinner />
											Đang phát
										</Button>
									) : (
										<Button
											disabled={nutTat}
											size="sm"
											title={
												nutTat ? "Cần quyền quản trị mới phát được" : undefined
											}
											variant="outline"
										>
											Phát liên kết
										</Button>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
			{nutTat ? (
				<CardFooter>
					<p className="text-muted-foreground text-sm/5">
						Chỉ chủ và quản trị phát được liên kết đặt mật khẩu.
					</p>
				</CardFooter>
			) : null}
		</Card>
	);
}

export function VaoBangMatKhauMau({ state }: { state: string }) {
	if (state === "ST-dangnhap-sai") {
		return (
			<ManNgoaiCong moTa="Đăng nhập để vào CRM" tieuDe="OneHub CRM">
				<Alert variant="destructive">
					<AlertTitle>Không đăng nhập được</AlertTitle>
					<AlertDescription>Địa chỉ hoặc mật khẩu không đúng.</AlertDescription>
				</Alert>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="dia-chi-sai">Địa chỉ email</FieldLabel>
						<Input
							defaultValue="thuha@gmail.com"
							id="dia-chi-sai"
							type="email"
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="mk-sai">Mật khẩu</FieldLabel>
						<Input id="mk-sai" type="password" />
					</Field>
				</FieldGroup>
				<Button className="w-full">Đăng nhập</Button>
			</ManNgoaiCong>
		);
	}

	if (state === "ST-datmk-nhap" || state === "ST-datmk-mkyeu") {
		const yeu = state === "ST-datmk-mkyeu";
		return (
			<ManNgoaiCong
				moTa="Liên kết này dùng được một lần, còn hạn 42 phút."
				tieuDe="Đặt mật khẩu"
			>
				<FieldGroup>
					<Field data-invalid={yeu || undefined}>
						<FieldLabel htmlFor="mk-moi">Mật khẩu mới</FieldLabel>
						<Input
							aria-invalid={yeu || undefined}
							defaultValue={yeu ? "matkhau" : undefined}
							id="mk-moi"
							type="password"
						/>
						{yeu ? (
							<FieldError>
								Mật khẩu này đã từng bị lộ trong một vụ rò dữ liệu. Chọn mật
								khẩu khác.
							</FieldError>
						) : (
							<FieldDescription>
								Ít nhất 12 ký tự. Không cần chữ hoa hay ký tự đặc biệt.
							</FieldDescription>
						)}
					</Field>
					<Field>
						<FieldLabel htmlFor="mk-lai">Gõ lại mật khẩu</FieldLabel>
						<Input
							defaultValue={yeu ? "matkhau" : undefined}
							id="mk-lai"
							type="password"
						/>
					</Field>
				</FieldGroup>
				<Button className="w-full">Đặt mật khẩu</Button>
			</ManNgoaiCong>
		);
	}

	if (state === "ST-datmk-chiaxau") {
		return (
			<ManNgoaiCong tieuDe="Liên kết đã hết hạn">
				<Alert variant="destructive">
					<AlertTitle>Liên kết này hết hạn rồi</AlertTitle>
					<AlertDescription>
						Mỗi liên kết chỉ sống một giờ. Nhắn người quản trị phát cho bạn một
						liên kết mới.
					</AlertDescription>
				</Alert>
			</ManNgoaiCong>
		);
	}

	if (state === "ST-datmk-xong") {
		return (
			<ManNgoaiCong tieuDe="Xong">
				<p className="text-sm/5">
					Mật khẩu đã đặt. Từ giờ bạn vào CRM được bằng địa chỉ email và mật
					khẩu này, kể cả khi mạng không vào được Google.
				</p>
				<Button className="w-full">Đăng nhập</Button>
			</ManNgoaiCong>
		);
	}

	if (state === "ST-hopthoai-colienket") {
		return (
			<HopThoai
				chan={
					<>
						<Button variant="outline">Đóng</Button>
						<Button>Chép liên kết</Button>
					</>
				}
				moTa="Gửi cho Nguyễn Thu Hà. Liên kết dùng được một lần, hết hạn sau một giờ."
				tieuDe="Liên kết đặt mật khẩu"
			>
				<Field>
					<FieldLabel htmlFor="lien-ket">Liên kết</FieldLabel>
					<Input id="lien-ket" readOnly value={LIEN_KET} />
					<FieldDescription>
						Người nhận mở liên kết rồi tự đặt mật khẩu. Bạn không thấy mật khẩu
						của họ.
					</FieldDescription>
				</Field>
			</HopThoai>
		);
	}

	if (state === "ST-hopthoai-dachep") {
		return (
			<HopThoai
				chan={<Button variant="outline">Đóng</Button>}
				moTa="Gửi cho Nguyễn Thu Hà. Liên kết dùng được một lần, hết hạn sau một giờ."
				tieuDe="Liên kết đặt mật khẩu"
			>
				<Field>
					<FieldLabel htmlFor="lien-ket-chep">Liên kết</FieldLabel>
					<Input id="lien-ket-chep" readOnly value={LIEN_KET} />
					<FieldDescription>
						Đã chép. Dán vào Zalo gửi cho Nguyễn Thu Hà.
					</FieldDescription>
				</Field>
			</HopThoai>
		);
	}

	if (state === "ST-hopthoai-loi") {
		return (
			<HopThoai
				chan={<Button variant="outline">Đóng</Button>}
				tieuDe="Liên kết đặt mật khẩu"
			>
				<Alert variant="destructive">
					<AlertTitle>Chưa phát được liên kết</AlertTitle>
					<AlertDescription>
						Máy chủ không trả lời. Thử lại sau ít phút.
					</AlertDescription>
				</Alert>
			</HopThoai>
		);
	}

	if (state === "ST-thanhvien-nutat") return <ManThanhVien nutTat />;
	if (state === "ST-thanhvien-dangphat") return <ManThanhVien dangPhat />;
	if (state === "ST-thanhvien-covet") return <ManThanhVien coVet />;

	return (
		<ManNgoaiCong moTa="Đăng nhập để vào CRM" tieuDe="OneHub CRM">
			<Button className="w-full" variant="outline">
				Tiếp tục với Google
			</Button>
			<div className="flex items-center gap-3">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-xs">hoặc</span>
				<Separator className="flex-1" />
			</div>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="dia-chi">Địa chỉ email</FieldLabel>
					<Input id="dia-chi" type="email" />
				</Field>
				<Field>
					<FieldLabel htmlFor="mk">Mật khẩu</FieldLabel>
					<Input id="mk" type="password" />
				</Field>
			</FieldGroup>
			<Button className="w-full">Đăng nhập</Button>
		</ManNgoaiCong>
	);
}
