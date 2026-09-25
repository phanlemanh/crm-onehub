"use client";

import Alarm from "@carbon/icons-react/es/Alarm";
import Asleep from "@carbon/icons-react/es/Asleep";
import Language from "@carbon/icons-react/es/Language";
import Logout from "@carbon/icons-react/es/Logout";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { NavItem } from "@crm/ui/components/nav-item";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import Link from "next/link";
import type { ReactNode } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";

type BeRong = "narrow" | "page" | "wide" | "full";

const BE_RONG: Record<BeRong, string> = {
	narrow: "max-w-(--container-narrow)",
	page: "max-w-(--container-page)",
	wide: "max-w-(--container-page-wide)",
	full: "",
};

type Muc = { nhan: string; state: string };

const NHOM: readonly { nhan: string; muc: readonly Muc[] }[] = [
	{
		nhan: "Không gian làm việc",
		muc: [
			{ nhan: "Chung", state: "ST-chung" },
			{ nhan: "Tiền tệ", state: "ST-chung" },
			{ nhan: "Trường", state: "ST-thanh-vien" },
		],
	},
	{
		nhan: "Con người",
		muc: [
			{ nhan: "Thành viên", state: "ST-thanh-vien" },
			{ nhan: "Tổ chức", state: "ST-thanh-vien" },
			{ nhan: "Điều phối 30 ngày", state: "ST-thanh-vien" },
		],
	},
	{
		nhan: "Kết nối và dữ liệu",
		muc: [
			{ nhan: "Kết nối", state: "ST-google" },
			{ nhan: "Theo dõi & phân tích", state: "ST-chung" },
		],
	},
	{
		nhan: "Bảo mật",
		muc: [
			{ nhan: "SSO", state: "ST-thanh-vien" },
			{ nhan: "Khoá API", state: "ST-thanh-vien" },
		],
	},
];

const DUONG = "/proto/khung-trang-cai-dat";

function ThanhBen({ dangMo, dangTai }: { dangMo: string; dangTai: boolean }) {
	return (
		<>
			<aside className="hidden w-56 shrink-0 border-r md:block">
				<nav aria-label="Cài đặt" className="flex flex-col gap-4 p-3">
					{NHOM.map((nhom) => (
						<div key={nhom.nhan} className="flex flex-col gap-0.5">
							<p className="px-3 pb-1 font-medium text-muted-foreground text-xs">
								{nhom.nhan}
							</p>
							{nhom.muc.map((muc) =>
								dangTai ? (
									<NavItem key={muc.nhan} disabled>
										{muc.nhan}
									</NavItem>
								) : (
									<NavItem key={muc.nhan} asChild active={muc.nhan === dangMo}>
										<Link href={`${DUONG}?state=${muc.state}`}>{muc.nhan}</Link>
									</NavItem>
								),
							)}
						</div>
					))}
				</nav>
			</aside>
			<nav
				aria-label="Cài đặt"
				className="flex gap-1 overflow-x-auto border-b p-2 md:hidden"
			>
				{NHOM.flatMap((nhom) => nhom.muc).map((muc) => (
					<NavItem
						key={muc.nhan}
						asChild
						active={muc.nhan === dangMo}
						className="w-auto shrink-0"
					>
						<Link href={`${DUONG}?state=${muc.state}`}>{muc.nhan}</Link>
					</NavItem>
				))}
			</nav>
		</>
	);
}

function DauUngDung({ moMenu }: { moMenu: boolean }) {
	return (
		<header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
			<span className="font-medium text-sm">OneHub CRM</span>
			<DropdownMenu open={moMenu || undefined}>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm">
						Manh Phan
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-56">
					<DropdownMenuLabel translate="no">manh@onehub.vn</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href={`${DUONG}?state=ST-nhac`}>
							<Icon icon={Alarm} />
							Nhắc buổi sáng
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Icon icon={Asleep} />
						Giao diện tối
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Icon icon={Language} />
						English
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Icon icon={Logout} />
						Đăng xuất
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}

function DuongDan({ cap }: { cap: { nhan: string; state?: string }[] }) {
	return (
		<nav aria-label="Đường dẫn">
			<ol className="flex items-center gap-1.5 text-muted-foreground text-sm">
				{cap.map((c, i) => (
					<li key={c.nhan} className="flex items-center gap-1.5">
						{c.state ? (
							<Link
								href={`${DUONG}?state=${c.state}`}
								className="hover:text-foreground"
							>
								{c.nhan}
							</Link>
						) : (
							<span aria-current="page" className="text-foreground">
								{c.nhan}
							</span>
						)}
						{i < cap.length - 1 ? <span aria-hidden="true">›</span> : null}
					</li>
				))}
			</ol>
		</nav>
	);
}

function Trang({
	beRong,
	tieuDe,
	moTa,
	duongDan,
	hanhDong,
	children,
}: {
	beRong: BeRong;
	tieuDe: ReactNode;
	moTa?: string;
	duongDan?: { nhan: string; state?: string }[];
	hanhDong?: ReactNode;
	children: ReactNode;
}) {
	return (
		<PageShell>
			<div className={`flex w-full flex-col gap-6 ${BE_RONG[beRong]}`}>
				{duongDan ? <DuongDan cap={duongDan} /> : null}
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>{tieuDe}</PageShellTitle>
						{moTa ? <PageShellDescription>{moTa}</PageShellDescription> : null}
					</PageShellHeading>
					{hanhDong ? <PageShellActions>{hanhDong}</PageShellActions> : null}
				</PageShellHeader>
				{children}
			</div>
		</PageShell>
	);
}

function TheCongTy() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Không gian làm việc</CardTitle>
				<CardDescription>
					Tên và website của OneHub, nơi CRM này đang chạy.
				</CardDescription>
				<CardAction>
					<Button disabled>Lưu</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<Field>
					<FieldLabel htmlFor="ten">Tên</FieldLabel>
					<Input id="ten" defaultValue="OneHub" translate="no" />
					<FieldDescription>
						Hiện ở mọi chỗ CRM nhắc tới OneHub.
					</FieldDescription>
				</Field>
			</CardContent>
		</Card>
	);
}

function TrangChung() {
	return (
		<Trang
			beRong="page"
			tieuDe="Chung"
			moTa="OneHub là ai, và tác nhân nghiên cứu nghĩ bằng model nào."
		>
			<TheCongTy />
			<Card>
				<CardHeader>
					<CardTitle>Tác nhân nghiên cứu</CardTitle>
					<CardDescription>
						Model tác nhân dùng để nghĩ, đi qua Vercel AI Gateway.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm" translate="no">
						anthropic/claude-sonnet-5
					</p>
				</CardContent>
			</Card>
		</Trang>
	);
}

function TrangThanhVien() {
	return (
		<Trang
			beRong="wide"
			tieuDe="Thành viên"
			moTa="Những người vào được CRM của bạn."
			hanhDong={<Button>Cho phép một email</Button>}
		>
			<Card>
				<CardContent>
					{["Manh Phan", "Linh Trần", "Quang Võ"].map((ten) => (
						<div
							key={ten}
							className="flex items-center justify-between text-sm"
						>
							<span translate="no">{ten}</span>
							<span className="text-muted-foreground">Quản trị</span>
						</div>
					))}
				</CardContent>
			</Card>
		</Trang>
	);
}

function TrangGoogle() {
	return (
		<Trang
			beRong="page"
			tieuDe={<span translate="no">Google</span>}
			duongDan={[{ nhan: "Kết nối", state: "ST-ket-noi" }, { nhan: "Google" }]}
		>
			<Card>
				<CardHeader>
					<CardTitle>
						<StatusIndicator size="sm" tone="success" label="Đã cắm" />
					</CardTitle>
					<CardDescription>
						Cuộc họp và luồng thư rơi về đúng công ty ngay khi chúng diễn ra.
					</CardDescription>
					<CardAction>
						<Button variant="contrast" size="sm">
							Kiểm ngay
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<p className="text-sm">Gmail · Lịch — đồng bộ lúc 08:12.</p>
				</CardContent>
			</Card>
		</Trang>
	);
}

function TrangKetNoi() {
	return (
		<Trang
			beRong="page"
			tieuDe="Kết nối"
			moTa="CRM lấy thông tin từ đâu, và nó được phép gửi gì thay mặt bạn."
			hanhDong={<Button variant="outline">Thêm kết nối</Button>}
		>
			<Card>
				<CardContent>
					{["Google", "Slack", "Zalo"].map((ten) => (
						<div
							key={ten}
							className="flex items-center justify-between text-sm"
						>
							<span translate="no">{ten}</span>
							<Button asChild variant="outline" size="sm">
								<Link href={`${DUONG}?state=ST-google`}>Quản lý</Link>
							</Button>
						</div>
					))}
				</CardContent>
			</Card>
		</Trang>
	);
}

function TrangSlackNguoi() {
	return (
		<Trang
			beRong="page"
			tieuDe="Người"
			moTa="Ai trên Slack là ai trong CRM."
			duongDan={[
				{ nhan: "Kết nối", state: "ST-ket-noi" },
				{ nhan: "Slack", state: "ST-google" },
				{ nhan: "Người" },
			]}
		>
			<Card>
				<CardContent>
					<p className="text-sm">12 người khớp · 2 chưa khớp.</p>
				</CardContent>
			</Card>
		</Trang>
	);
}

function TrangIntake() {
	return (
		<Trang
			beRong="narrow"
			tieuDe="Tiếp nhận"
			moTa="Gửi biểu mẫu từ website thẳng vào CRM qua một địa chỉ riêng."
			duongDan={[
				{ nhan: "Kết nối", state: "ST-ket-noi" },
				{ nhan: "Tiếp nhận" },
			]}
		>
			<div>
				<Button asChild variant="outline">
					<Link href={`${DUONG}?state=ST-ket-noi`}>Quay lại</Link>
				</Button>
			</div>
		</Trang>
	);
}

function TrangPhuongAnA() {
	return (
		<Trang
			beRong="page"
			tieuDe="Chung"
			moTa="OneHub là ai, và tác nhân nghiên cứu nghĩ bằng model nào."
			duongDan={[{ nhan: "Cài đặt", state: "ST-chung" }, { nhan: "Chung" }]}
		>
			<Alert>
				<AlertTitle>Hướng A — mọi trang đều có dòng đường dẫn</AlertTitle>
				<AlertDescription>
					Tiêu đề đứng yên ở mọi trang, kể cả trang con. Đổi lại, trang mục mang
					một dòng «Cài đặt › Chung» lặp đúng điều thanh bên đã nói. Máy khuyên
					hướng B (trang ST-google): chỉ trang con có đường dẫn — chuyển tab
					trên thanh bên vẫn giữ tiêu đề đứng yên, còn trang con lùi xuống một
					dòng vì nó sâu hơn một cấp.
				</AlertDescription>
			</Alert>
			<TheCongTy />
		</Trang>
	);
}

function TrangDangTai() {
	return (
		<Trang beRong="page" tieuDe="Chung">
			<Skeleton className="h-40 w-full rounded-lg" />
			<Skeleton className="h-24 w-full rounded-lg" />
		</Trang>
	);
}

function TrangNhac() {
	return (
		<Trang
			beRong="page"
			tieuDe="Nhắc buổi sáng"
			moTa="Chỉ áp cho bạn. Mỗi sáng 08:30 máy gom việc cần để ý và nhắn bạn ở một kênh."
		>
			<Card>
				<CardHeader>
					<CardTitle>Nối Zalo</CardTitle>
					<CardDescription>
						Nhắn mã 6 số cho bot Zalo để CRM biết Zalo đó là của bạn.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="font-medium text-2xl tabular-nums" translate="no">
						482 913
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
					<CardTitle>Gửi nhắc của tôi qua</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm">Tự động · Zalo · Slack</p>
				</CardContent>
			</Card>
		</Trang>
	);
}

const MUC_THEO_STATE: Record<string, string> = {
	"ST-chung": "Chung",
	"ST-thanh-vien": "Thành viên",
	"ST-ket-noi": "Kết nối",
	"ST-google": "Kết nối",
	"ST-slack-nguoi": "Kết nối",
	"ST-intake": "Kết nối",
	"ST-dang-tai": "",
	"ST-menu": "Chung",
	"ST-phuong-an-a": "Chung",
};

const TRANG_THEO_STATE: Record<string, () => ReactNode> = {
	"ST-chung": TrangChung,
	"ST-thanh-vien": TrangThanhVien,
	"ST-ket-noi": TrangKetNoi,
	"ST-google": TrangGoogle,
	"ST-slack-nguoi": TrangSlackNguoi,
	"ST-intake": TrangIntake,
	"ST-dang-tai": TrangDangTai,
	"ST-menu": TrangChung,
	"ST-phuong-an-a": TrangPhuongAnA,
};

export function KhungTrangCaiDatMau({ state }: { state: string }) {
	const laNhac = state === "ST-nhac";
	const NoiDung = TRANG_THEO_STATE[state] ?? TrangChung;

	return (
		<div
			data-proto-khung
			className="fixed inset-0 z-40 flex flex-col bg-background"
		>
			<DauUngDung moMenu={state === "ST-menu"} />
			<div className="flex min-h-0 flex-1 flex-col md:flex-row">
				{laNhac ? null : (
					<ThanhBen
						dangMo={MUC_THEO_STATE[state] ?? "Chung"}
						dangTai={state === "ST-dang-tai"}
					/>
				)}
				{laNhac ? <TrangNhac /> : <NoiDung />}
			</div>
		</div>
	);
}
