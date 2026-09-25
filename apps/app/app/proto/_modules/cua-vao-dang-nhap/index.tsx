import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import GoogleLogo from "@crm/ui/components/brand-logos/google";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { LogoLockup } from "@crm/ui/components/logo-lockup";
import { Separator } from "@crm/ui/components/separator";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StepList, StepListItem } from "@crm/ui/components/step-list";
import type { ReactNode } from "react";

const PHUT_LIEN_KET = 60;

const CHU = {
	tieuDe: "Đăng nhập vào CRM",
	moTa: "Dùng đúng địa chỉ email đã được cho phép.",
	google: "Tiếp tục với Google",
	hoac: "hoặc",
	diaChi: "Địa chỉ email",
	matKhau: "Mật khẩu",
	quenMatKhau: "Quên mật khẩu?",
	dangNhap: "Đăng nhập",
	lanDau: "Lần đầu vào?",
	lanDauMoTa: "CRM chỉ mở cho địa chỉ quản trị viên đã cho phép.",
	laGi: "CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.",
	shellEyebrow: "CRM",
	loi: {
		chuaChoPhep: {
			tieuDe: "Địa chỉ này chưa được cho phép vào",
			moTa: "Nhờ quản trị viên cho phép đúng địa chỉ email bạn vừa dùng.",
		},
		daHuy: {
			tieuDe: "Bạn đã dừng đăng nhập giữa chừng",
			moTa: "Bấm lại nút đăng nhập để thử lần nữa.",
		},
		chung: {
			tieuDe: "Chưa đăng nhập được",
			moTa: "Thử lại; nếu vẫn không được, nhờ quản trị viên xem giúp.",
		},
	},
} as const;

type Buoc = { tieuDe: string; moTa: string };

const BUOC_CHO_PHEP: Buoc = {
	tieuDe: "Nhờ quản trị viên cho phép địa chỉ email bạn sẽ dùng",
	moTa: "Ở Cài đặt › Thành viên › Cho phép một địa chỉ.",
};

const BUOC_GOOGLE: Buoc = {
	tieuDe: "Đăng nhập bằng Google, đúng địa chỉ đó",
	moTa: "Địa chỉ khác sẽ bị từ chối.",
};

const BUOC_MAT_KHAU_PHU: Buoc = {
	tieuDe: "Muốn dùng mật khẩu? Xin liên kết đặt mật khẩu",
	moTa: `Quản trị viên bấm Phát liên kết ở Cài đặt › Thành viên. Liên kết dùng một lần, hết hạn sau ${PHUT_LIEN_KET} phút.`,
};

const BUOC_MAT_KHAU_CHINH: Buoc = {
	tieuDe: "Xin liên kết đặt mật khẩu",
	moTa: BUOC_MAT_KHAU_PHU.moTa,
};

type Loi = keyof typeof CHU.loi;

type Canh = {
	coGoogle: boolean;
	loi: Loi | null;
	dangTai: boolean;
	huong: "deu-nhau" | "tien-do";
	ghim: ReactNode;
};

const MAC_DINH: Canh = {
	coGoogle: true,
	loi: null,
	dangTai: false,
	huong: "deu-nhau",
	ghim: null,
};

function canhCua(state: string): Canh {
	switch (state) {
		case "ST-sign-in-chi-mat-khau":
			return { ...MAC_DINH, coGoogle: false };
		case "ST-sign-in-chua-cho-phep":
			return { ...MAC_DINH, loi: "chuaChoPhep" };
		case "ST-sign-in-da-huy":
			return { ...MAC_DINH, loi: "daHuy" };
		case "ST-sign-in-loi-chung":
			return { ...MAC_DINH, loi: "chung" };
		case "ST-sign-in-dang-tai":
			return { ...MAC_DINH, dangTai: true };
		case "ST-phan-ky-deu-nhau":
			return {
				...MAC_DINH,
				ghim: (
					<GhimHuong
						ten="Hướng «Đều nhau» — máy khuyên"
						truc="Trục: các bước là hướng dẫn tĩnh hay tiến độ."
						dongCo="Động cơ: ba bước ngang hàng; người mới đọc cả ba trước khi bấm, không bước nào trông như chưa mở."
						danhDoi="Đánh đổi: StepList sinh ra cho tiến độ — cần thêm chế độ tĩnh ở packages/ui thay vì đặt bước đang làm vượt số bước."
					/>
				),
			};
		case "ST-phan-ky-tien-do":
			return {
				...MAC_DINH,
				huong: "tien-do",
				ghim: (
					<GhimHuong
						ten="Hướng «Tiến độ»"
						truc="Trục: các bước là hướng dẫn tĩnh hay tiến độ."
						dongCo="Động cơ: dùng StepList đúng như thiết kế; mắt dừng ở việc phải làm đầu tiên."
						danhDoi="Đánh đổi: bước 2–3 mờ như chưa tới lượt, và trình đọc màn hình nghe bước 1 là «bước hiện tại» dù trang không biết người đang ở đâu."
					/>
				),
			};
		default:
			return MAC_DINH;
	}
}

function GhimHuong({
	ten,
	truc,
	dongCo,
	danhDoi,
}: {
	ten: string;
	truc: string;
	dongCo: string;
	danhDoi: string;
}) {
	return (
		<Alert>
			<AlertTitle>{ten}</AlertTitle>
			<AlertDescription>
				<p>{truc}</p>
				<p>{dongCo}</p>
				<p>{danhDoi}</p>
			</AlertDescription>
		</Alert>
	);
}

function KhoiHuongDan({
	coGoogle,
	huong,
}: {
	coGoogle: boolean;
	huong: Canh["huong"];
}) {
	const buoc = coGoogle
		? [BUOC_CHO_PHEP, BUOC_GOOGLE, BUOC_MAT_KHAU_PHU]
		: [BUOC_CHO_PHEP, BUOC_MAT_KHAU_CHINH];
	const dangLam = huong === "tien-do" ? 1 : buoc.length + 1;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{CHU.lanDau}</CardTitle>
				<CardDescription>{CHU.lanDauMoTa}</CardDescription>
			</CardHeader>
			<CardContent>
				<StepList activeStep={dangLam} label={CHU.lanDau}>
					{buoc.map((b, i) => (
						<StepListItem
							activeStep={dangLam}
							description={b.moTa}
							key={b.tieuDe}
							step={i + 1}
							title={b.tieuDe}
						/>
					))}
				</StepList>
			</CardContent>
		</Card>
	);
}

function CotGioiThieu({ canh }: { canh: Canh }) {
	return (
		<section
			aria-label={CHU.lanDau}
			className="flex flex-col gap-6 bg-muted px-6 py-8 sm:px-10 lg:order-first lg:justify-between lg:p-12"
		>
			<div className="hidden lg:flex">
				<LogoLockup aria-hidden="true" className="h-5 w-auto" />
			</div>
			<div className="flex w-full max-w-md flex-col gap-6">
				<KhoiHuongDan coGoogle={canh.coGoogle} huong={canh.huong} />
			</div>
			<p className="text-muted-foreground text-sm">{CHU.laGi}</p>
		</section>
	);
}

function KhungDangNhap({ canh }: { canh: Canh }) {
	return (
		<section className="flex flex-col bg-background px-6 py-8 sm:px-10 lg:px-14">
			<div className="flex flex-1 items-center justify-center py-8">
				<div className="flex w-full max-w-sm flex-col gap-8">
					<div className="flex flex-col gap-3">
						<LogoLockup className="h-6 w-auto self-start" />
						<div className="flex flex-col gap-1">
							<h2 className="font-semibold text-2xl/8 tracking-tight">
								{CHU.tieuDe}
							</h2>
							<p className="text-muted-foreground text-sm/5">{CHU.moTa}</p>
						</div>
					</div>

					{canh.loi ? (
						<Alert variant="destructive">
							<Icon icon={Warning} />
							<AlertTitle>{CHU.loi[canh.loi].tieuDe}</AlertTitle>
							<AlertDescription>{CHU.loi[canh.loi].moTa}</AlertDescription>
						</Alert>
					) : null}

					{canh.dangTai ? (
						<div className="flex flex-col gap-4">
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
						</div>
					) : (
						<>
							{canh.coGoogle ? (
								<>
									<Button className="w-full" type="button" variant="outline">
										<GoogleLogo className="size-4" data-icon="inline-start" />
										{CHU.google}
									</Button>
									<div className="flex items-center gap-3">
										<Separator className="flex-1" />
										<span className="text-muted-foreground text-xs">
											{CHU.hoac}
										</span>
										<Separator className="flex-1" />
									</div>
								</>
							) : null}
							<form className="flex flex-col gap-4">
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor="proto-dia-chi">
											{CHU.diaChi}
										</FieldLabel>
										<Input autoComplete="off" id="proto-dia-chi" type="email" />
									</Field>
									<Field>
										<FieldLabel htmlFor="proto-mk">{CHU.matKhau}</FieldLabel>
										<Input autoComplete="off" id="proto-mk" type="password" />
									</Field>
								</FieldGroup>
								<a
									className="self-start text-muted-foreground text-sm underline-offset-4 hover:underline"
									href="#quen-mat-khau"
								>
									{CHU.quenMatKhau}
								</a>
								<Button className="w-full" type="button">
									{CHU.dangNhap}
								</Button>
							</form>
						</>
					)}
				</div>
			</div>
		</section>
	);
}

function ShellKhongKhoi() {
	return (
		<div className="grid min-h-[40rem] overflow-hidden rounded-lg border bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
			<section className="relative hidden overflow-hidden bg-muted p-8 lg:flex lg:flex-col lg:justify-between xl:p-12">
				<LogoLockup className="h-5 w-auto" />
				<div className="flex flex-col gap-4">
					<p className="font-mono text-muted-foreground text-xs/4 uppercase">
						{CHU.shellEyebrow}
					</p>
					<p className="max-w-[18ch] font-semibold text-4xl text-balance">
						{CHU.laGi}
					</p>
				</div>
			</section>
			<section className="flex flex-col items-center justify-center px-6 py-8">
				<div className="flex w-full max-w-sm flex-col gap-3">
					<LogoLockup className="h-6 w-auto self-start" />
					<h2 className="font-semibold text-2xl/8 tracking-tight">
						Đặt mật khẩu
					</h2>
					<p className="text-muted-foreground text-sm/5">
						Liên kết này dùng được một lần và hết hạn sau {PHUT_LIEN_KET} phút.
					</p>
				</div>
			</section>
		</div>
	);
}

export function CuaVaoDangNhapMau({ state }: { state: string }) {
	if (state === "ST-shell-khong-khoi") return <ShellKhongKhoi />;

	const canh = canhCua(state);

	return (
		<div className="flex flex-col gap-4">
			{canh.ghim}
			<div className="grid min-h-[40rem] overflow-hidden rounded-lg border bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
				<KhungDangNhap canh={canh} />
				<CotGioiThieu canh={canh} />
			</div>
		</div>
	);
}
