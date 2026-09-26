import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import GoogleLogo from "@crm/ui/components/brand-logos/google";
import { Button } from "@crm/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { LogoLockup } from "@crm/ui/components/logo-lockup";
import { Separator } from "@crm/ui/components/separator";

const PHUT_LIEN_KET = 60;

const CHU = {
	tieuDe: "Đăng nhập vào OneHub Center",
	moTa: "Dùng đúng địa chỉ email đã được cho phép.",
	google: "Tiếp tục với Google",
	hoac: "hoặc",
	diaChi: "Địa chỉ email",
	matKhau: "Mật khẩu",
	quenMatKhau: "Quên mật khẩu?",
	dangNhap: "Đăng nhập",
	lanDau: "Lần đầu vào?",
	lanDauMoTa: "OneHub Center chỉ mở cho địa chỉ quản trị viên đã cho phép.",
	neo: "OneHub Center: đối tác, kế hoạch 30 ngày và OKR.",
	loiTieuDe: "Địa chỉ này chưa được cho phép vào",
	loiMoTa: "Nhờ quản trị viên cho phép đúng địa chỉ email bạn vừa dùng.",
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

const BUOC_MAT_KHAU: Buoc = {
	tieuDe: "Muốn dùng mật khẩu? Xin liên kết đặt mật khẩu",
	moTa: `Quản trị viên phát liên kết ở Cài đặt › Thành viên. Liên kết dùng một lần, hết hạn sau ${PHUT_LIEN_KET} phút.`,
};

const BUOC_MAT_KHAU_CHINH: Buoc = {
	tieuDe: "Xin liên kết đặt mật khẩu",
	moTa: BUOC_MAT_KHAU.moTa,
};

type Canh = { coGoogle: boolean; coLoi: boolean };

function canhCua(state: string): Canh {
	switch (state) {
		case "ST-sign-in-loi":
			return { coGoogle: true, coLoi: true };
		case "ST-sign-in-chi-mat-khau":
			return { coGoogle: false, coLoi: false };
		default:
			return { coGoogle: true, coLoi: false };
	}
}

function LuoiChamTam() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[22px_22px] [mask-image:radial-gradient(ellipse_80%_70%_at_30%_45%,black,transparent)]"
			data-slot="luoi-cham"
		/>
	);
}

function BuocNoi({ buoc }: { buoc: Buoc[] }) {
	return (
		<ol aria-label={CHU.lanDau} className="flex flex-col">
			{buoc.map((b, i) => (
				<li className="relative flex gap-4 pb-7 last:pb-0" key={b.tieuDe}>
					{i < buoc.length - 1 ? (
						<span
							aria-hidden="true"
							className="absolute top-8 bottom-1 left-3.5 w-px bg-border"
						/>
					) : null}
					<span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background font-medium text-xs">
						{i + 1}
					</span>
					<span className="flex min-w-0 flex-col gap-1 pt-0.5">
						<span className="font-medium text-sm/6">{b.tieuDe}</span>
						<span className="text-muted-foreground text-sm">{b.moTa}</span>
					</span>
				</li>
			))}
		</ol>
	);
}

function CotTrai({ coGoogle }: { coGoogle: boolean }) {
	const buoc = coGoogle
		? [BUOC_CHO_PHEP, BUOC_GOOGLE, BUOC_MAT_KHAU]
		: [BUOC_CHO_PHEP, BUOC_MAT_KHAU_CHINH];

	return (
		<section className="relative flex flex-col gap-10 overflow-hidden bg-muted px-6 py-10 sm:px-10 lg:order-first lg:min-h-svh lg:p-12">
			<LuoiChamTam />
			<div className="relative hidden lg:flex">
				<LogoLockup aria-hidden="true" className="h-5 w-auto" />
			</div>
			<div className="relative flex flex-1 flex-col justify-center gap-14">
				<p className="hidden max-w-[18ch] font-semibold text-5xl/tight text-balance tracking-tight lg:block 2xl:text-6xl/tight">
					{CHU.neo}
				</p>
				<div
					className="flex w-full max-w-xl flex-col gap-5"
					data-khoi-huong-dan=""
				>
					<div className="flex flex-col gap-1.5">
						<p className="font-mono text-muted-foreground text-xs/4 uppercase">
							{CHU.lanDau}
						</p>
						<p className="text-muted-foreground text-sm">{CHU.lanDauMoTa}</p>
					</div>
					<BuocNoi buoc={buoc} />
				</div>
			</div>
			<p className="relative text-muted-foreground text-sm lg:hidden">
				{CHU.neo}
			</p>
		</section>
	);
}

function CotPhai({ canh }: { canh: Canh }) {
	return (
		<section className="flex flex-col bg-background px-6 py-8 sm:px-10 lg:min-h-svh lg:px-14">
			<div className="flex flex-1 items-center justify-center py-8">
				<div className="flex w-full max-w-sm flex-col gap-8">
					<div className="flex flex-col gap-3">
						<LogoLockup className="h-6 w-auto self-start" />
						<div className="flex flex-col gap-1">
							<h1 className="font-semibold text-2xl/8 tracking-tight">
								{CHU.tieuDe}
							</h1>
							<p className="text-muted-foreground text-sm/5">{CHU.moTa}</p>
						</div>
					</div>

					{canh.coLoi ? (
						<Alert variant="destructive">
							<Icon icon={Warning} />
							<AlertTitle>{CHU.loiTieuDe}</AlertTitle>
							<AlertDescription>{CHU.loiMoTa}</AlertDescription>
						</Alert>
					) : null}

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
								<FieldLabel htmlFor="dtoc-dia-chi">{CHU.diaChi}</FieldLabel>
								<Input autoComplete="off" id="dtoc-dia-chi" type="email" />
							</Field>
							<Field>
								<FieldLabel htmlFor="dtoc-mk">{CHU.matKhau}</FieldLabel>
								<Input autoComplete="off" id="dtoc-mk" type="password" />
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
				</div>
			</div>
		</section>
	);
}

function ShellKhac() {
	return (
		<div className="fixed inset-0 z-50 grid overflow-auto bg-background text-foreground lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
			<section className="relative hidden overflow-hidden bg-muted p-12 lg:flex lg:flex-col lg:justify-between">
				<LuoiChamTam />
				<LogoLockup className="relative h-5 w-auto self-start" />
				<p className="relative max-w-[18ch] font-semibold text-5xl/tight text-balance tracking-tight">
					{CHU.neo}
				</p>
			</section>
			<section className="flex flex-col items-center justify-center px-6 py-8">
				<div className="flex w-full max-w-sm flex-col gap-3">
					<LogoLockup className="h-6 w-auto self-start" />
					<h1 className="font-semibold text-2xl/8 tracking-tight">
						Đặt mật khẩu
					</h1>
					<p className="text-muted-foreground text-sm/5">
						Liên kết này dùng được một lần và hết hạn sau {PHUT_LIEN_KET} phút.
					</p>
				</div>
			</section>
		</div>
	);
}

function DauTrang() {
	return (
		<div className="fixed inset-0 z-50 flex flex-col gap-6 overflow-auto bg-background p-12 text-foreground">
			{[
				{ ten: "Chưa đặt tên, hoặc tên cũ «CRM»", nhan: "OneHub Center" },
				{ ten: "Không gian «OneMount Realty»", nhan: "OneMount Realty" },
			].map((ca) => (
				<div className="flex flex-col gap-2" key={ca.ten}>
					<p className="text-muted-foreground text-xs">{ca.ten}</p>
					<header className="flex h-12 items-center gap-3 border-b">
						<LogoLockup aria-hidden="true" className="h-5 w-auto" />
						<Separator className="h-5" orientation="vertical" />
						<span className="font-medium text-sm" translate="no">
							{ca.nhan}
						</span>
					</header>
				</div>
			))}
		</div>
	);
}

export function DoiTenOnehubCenterMau({ state }: { state: string }) {
	if (state === "ST-shell-khac") return <ShellKhac />;
	if (state === "ST-dau-trang") return <DauTrang />;

	const canh = canhCua(state);

	return (
		<div className="fixed inset-0 z-50 overflow-auto bg-background text-foreground">
			<div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
				<CotPhai canh={canh} />
				<CotTrai coGoogle={canh.coGoogle} />
			</div>
		</div>
	);
}
