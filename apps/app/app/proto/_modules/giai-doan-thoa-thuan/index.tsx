"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
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
import { NavItem } from "@crm/ui/components/nav-item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Skeleton } from "@crm/ui/components/skeleton";
import { SortableItem, SortableList } from "@crm/ui/components/sortable-list";
import { useState } from "react";
import {
	PageShell,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	dayDenTran,
	GIAI_DOAN_MAU,
	type GiaiDoanMau,
	type LoaiGiaiDoan,
	THE,
	TRAN_GIAI_DOAN,
} from "./du-lieu";

const THANH_BEN = [
	{
		nhan: "Không gian làm việc",
		muc: ["Chung", "Tiền tệ", "Trường", "Giai đoạn thoả thuận"],
	},
	{
		nhan: "Con người",
		muc: ["Thành viên", "Tổ chức", "Chương trình OKR", "Điều phối 30 ngày"],
	},
	{ nhan: "Kết nối và dữ liệu", muc: ["Kết nối", "Theo dõi & phân tích"] },
	{ nhan: "Bảo mật", muc: ["SSO", "Khoá API"] },
] as const;

const DANG_MO = "Giai đoạn thoả thuận";

type HopThoai =
	| { kieu: "them"; loai: LoaiGiaiDoan; loi?: string }
	| { kieu: "doi-ten"; giaiDoan: GiaiDoanMau }
	| { kieu: "xoa"; giaiDoan: GiaiDoanMau }
	| null;

function ThanhBen() {
	return (
		<aside className="hidden w-56 shrink-0 border-r md:block">
			<nav aria-label="Cài đặt" className="flex flex-col gap-4 p-3">
				{THANH_BEN.map((nhom) => (
					<div key={nhom.nhan} className="flex flex-col gap-0.5">
						<p className="px-3 pb-1 font-medium text-muted-foreground text-xs">
							{nhom.nhan}
						</p>
						{nhom.muc.map((muc) => (
							<NavItem key={muc} active={muc === DANG_MO}>
								{muc}
							</NavItem>
						))}
					</div>
				))}
			</nav>
		</aside>
	);
}

function Khung({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex rounded-lg border">
			<ThanhBen />
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

function DauTrang({
	khongQuyen,
	datTran,
}: {
	khongQuyen: boolean;
	datTran: boolean;
}) {
	return (
		<PageShellHeader>
			<PageShellHeading>
				<PageShellTitle>Giai đoạn thoả thuận</PageShellTitle>
				<PageShellDescription>
					{khongQuyen
						? "Chỉ chủ sở hữu và quản trị viên đổi được giai đoạn."
						: datTran
							? `Đã đủ ${TRAN_GIAI_DOAN} giai đoạn — xoá bớt trước khi thêm.`
							: "Các bước một thoả thuận hợp tác đi qua, áp cho mọi thoả thuận."}
				</PageShellDescription>
			</PageShellHeading>
		</PageShellHeader>
	);
}

function MenuHang({
	giaiDoan,
	khoa,
	laCuoi,
	mo,
}: {
	giaiDoan: GiaiDoanMau;
	khoa: boolean;
	laCuoi: boolean;
	mo: (h: HopThoai) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={khoa}>
				<Button
					variant="ghost"
					size="icon-xs"
					aria-label={`Thao tác với ${giaiDoan.nhan}`}
				>
					<Icon icon={OverflowMenuVertical} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onSelect={() => mo({ kieu: "doi-ten", giaiDoan })}>
					Đổi tên
				</DropdownMenuItem>
				<DropdownMenuItem
					variant="destructive"
					disabled={laCuoi}
					onSelect={() => mo({ kieu: "xoa", giaiDoan })}
				>
					{laCuoi ? "Xoá — cần ít nhất một giai đoạn loại này" : "Xoá"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function TheLoai({
	the,
	giaiDoan,
	khoa,
	datTran,
	mo,
	sapXep,
}: {
	the: (typeof THE)[number];
	giaiDoan: GiaiDoanMau[];
	khoa: boolean;
	datTran: boolean;
	mo: (h: HopThoai) => void;
	sapXep: (ids: string[]) => void;
}) {
	const laCuoi = giaiDoan.length === 1;
	return (
		<Card>
			<CardHeader>
				<CardTitle>{the.tieuDe}</CardTitle>
				<CardDescription>{the.moTa}</CardDescription>
				<CardAction>
					<Button
						variant="outline"
						size="sm"
						disabled={khoa || datTran}
						onClick={() => mo({ kieu: "them", loai: the.loai })}
					>
						<Icon icon={Add} data-icon="inline-start" />
						Thêm giai đoạn
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<SortableList ids={giaiDoan.map((g) => g.id)} onReorder={sapXep}>
					{giaiDoan.map((g) => (
						<SortableItem key={g.id} id={g.id} label={g.nhan} disabled={khoa}>
							<div className="flex min-w-0 flex-1 items-center justify-between gap-2 py-2">
								<span className="min-w-0 break-words text-sm" translate="no">
									{g.nhan}
								</span>
								<span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
									{g.soThoaThuan} thoả thuận
									<MenuHang giaiDoan={g} khoa={khoa} laCuoi={laCuoi} mo={mo} />
								</span>
							</div>
						</SortableItem>
					))}
				</SortableList>
			</CardContent>
		</Card>
	);
}

function HopThoaiTen({
	hopThoai,
	dong,
}: {
	hopThoai: Extract<HopThoai, { kieu: "them" | "doi-ten" }>;
	dong: () => void;
}) {
	const doiTen = hopThoai.kieu === "doi-ten";
	const [nhan, setNhan] = useState(doiTen ? hopThoai.giaiDoan.nhan : "");
	const loi = hopThoai.kieu === "them" ? hopThoai.loi : undefined;
	const hopLe = nhan.trim().length > 0 && nhan.trim().length <= 40;
	return (
		<Dialog open onOpenChange={(o) => !o && dong()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{doiTen ? "Đổi tên giai đoạn" : "Thêm giai đoạn"}
					</DialogTitle>
					<DialogDescription>
						{doiTen
							? "Tên mới hiện ở mọi nơi, kể cả lịch sử cũ."
							: `Giai đoạn mới đứng cuối nhóm «${THE.find((t) => t.loai === hopThoai.loai)?.tieuDe}».`}
					</DialogDescription>
				</DialogHeader>
				<Field data-invalid={loi ? true : undefined}>
					<FieldLabel htmlFor="ten-giai-doan">Tên</FieldLabel>
					<Input
						id="ten-giai-doan"
						value={nhan}
						maxLength={40}
						aria-invalid={loi ? true : undefined}
						onChange={(e) => setNhan(e.target.value)}
					/>
					{loi ? (
						<FieldError>{loi}</FieldError>
					) : (
						<FieldDescription>
							Tối đa 40 ký tự, không trùng giai đoạn khác.
						</FieldDescription>
					)}
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled={!hopLe} onClick={dong}>
						Lưu
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function HopThoaiXoa({
	giaiDoan,
	tatCa,
	dong,
}: {
	giaiDoan: GiaiDoanMau;
	tatCa: GiaiDoanMau[];
	dong: () => void;
}) {
	const [dich, setDich] = useState<string>("");
	if (giaiDoan.soThoaThuan === 0) {
		return (
			<ConfirmDialog
				open
				onOpenChange={(o) => !o && dong()}
				tieuDe={`Xoá «${giaiDoan.nhan}»?`}
				than="Giai đoạn biến khỏi bảng cột và menu. Lịch sử cũ vẫn giữ tên của nó."
				nut="Xoá"
				thoi="Huỷ"
				pending={false}
				onConfirm={dong}
			/>
		);
	}
	const cungLoai = tatCa.filter(
		(g) => g.loai === giaiDoan.loai && g.id !== giaiDoan.id,
	);
	return (
		<Dialog open onOpenChange={(o) => !o && dong()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{`Xoá «${giaiDoan.nhan}»`}</DialogTitle>
					<DialogDescription>
						{`Còn ${giaiDoan.soThoaThuan} thoả thuận ở giai đoạn này. Chuyển chúng sang giai đoạn khác cùng nhóm rồi xoá.`}
					</DialogDescription>
				</DialogHeader>
				<Field>
					<FieldLabel htmlFor="dich-giai-doan">Chuyển sang</FieldLabel>
					<Select value={dich} onValueChange={setDich}>
						<SelectTrigger id="dich-giai-doan" className="w-full">
							<SelectValue placeholder="Chọn giai đoạn" />
						</SelectTrigger>
						<SelectContent>
							{cungLoai.map((g) => (
								<SelectItem key={g.id} value={g.id}>
									<span translate="no">{g.nhan}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FieldDescription>
						Mỗi thoả thuận có một dòng lịch sử chuyển giai đoạn.
					</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button variant="destructive" disabled={dich === ""} onClick={dong}>
						Chuyển và xoá
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DangTai() {
	return (
		<div className="flex flex-col gap-6">
			{THE.map((t) => (
				<Card key={t.loai}>
					<CardHeader>
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-64" />
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						<Skeleton className="h-6 w-full" />
						<Skeleton className="h-6 w-full" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function Loi() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>Không tải được danh sách giai đoạn</EmptyTitle>
				<EmptyDescription>Kiểm tra kết nối rồi thử lại.</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button variant="outline">Thử lại</Button>
			</EmptyContent>
		</Empty>
	);
}

function hopThoaiBanDau(state: string): HopThoai {
	const thuong = GIAI_DOAN_MAU;
	if (state === "ST-them") return { kieu: "them", loai: "OPEN" };
	if (state === "ST-them-tu-choi")
		return {
			kieu: "them",
			loai: "OPEN",
			loi: "Đã có giai đoạn tên «Contract sent».",
		};
	if (state === "ST-xoa-trong")
		return {
			kieu: "xoa",
			giaiDoan: thuong.find((g) => g.id === "CONTRACT_SENT") as GiaiDoanMau,
		};
	if (state === "ST-xoa-chuyen")
		return {
			kieu: "xoa",
			giaiDoan: thuong.find((g) => g.id === "CLOSED_LOST") as GiaiDoanMau,
		};
	return null;
}

export function GiaiDoanThoaThuanProto({ state }: { state: string }) {
	const [danhSach, setDanhSach] = useState<GiaiDoanMau[]>(
		state === "ST-dat-tran" ? dayDenTran() : [...GIAI_DOAN_MAU],
	);
	const [hopThoai, setHopThoai] = useState<HopThoai>(hopThoaiBanDau(state));
	const khongQuyen = state === "ST-khong-quyen";
	const datTran = danhSach.length >= TRAN_GIAI_DOAN;

	const sapXep = (loai: LoaiGiaiDoan) => (ids: string[]) => {
		const theoId = new Map(danhSach.map((g) => [g.id, g]));
		const moi = ids.map((id) => theoId.get(id) as GiaiDoanMau);
		setDanhSach([...danhSach.filter((g) => g.loai !== loai), ...moi]);
	};

	const than =
		state === "ST-dang-tai" ? (
			<DangTai />
		) : state === "ST-loi" ? (
			<Loi />
		) : (
			<div className="flex flex-col gap-6">
				{THE.map((t) => (
					<TheLoai
						key={t.loai}
						the={t}
						giaiDoan={danhSach.filter((g) => g.loai === t.loai)}
						khoa={khongQuyen}
						datTran={datTran}
						mo={setHopThoai}
						sapXep={sapXep(t.loai)}
					/>
				))}
			</div>
		);

	return (
		<Khung>
			<PageShell width="page">
				<DauTrang khongQuyen={khongQuyen} datTran={datTran} />
				{than}
			</PageShell>
			{hopThoai?.kieu === "them" || hopThoai?.kieu === "doi-ten" ? (
				<HopThoaiTen hopThoai={hopThoai} dong={() => setHopThoai(null)} />
			) : null}
			{hopThoai?.kieu === "xoa" ? (
				<HopThoaiXoa
					giaiDoan={hopThoai.giaiDoan}
					tatCa={danhSach}
					dong={() => setHopThoai(null)}
				/>
			) : null}
		</Khung>
	);
}
