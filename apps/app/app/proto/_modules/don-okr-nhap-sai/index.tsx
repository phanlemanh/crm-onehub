"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { KhungUngDung, ThanhTienDo } from "../ban-mau-okr/phan-chung";

type TrangThai = "nhap" | "cong-bo" | "da-bo";

type MucTieu = {
	id: string;
	ten: string;
	loai: "Cam kết" | "Tham vọng";
	trangThai: TrangThai;
	phuTrach: string;
	soKr: number;
	tienDo: number;
};

const NHAN_TRANG_THAI = {
	nhap: "Nháp",
	"cong-bo": "Đã công bố",
	"da-bo": "Đã bỏ",
} satisfies Record<TrangThai, string>;

const M_CONG_BO: MucTieu = {
	id: "m1",
	ten: "Giữ chân khách hàng doanh nghiệp quý 4",
	loai: "Cam kết",
	trangThai: "cong-bo",
	phuTrach: "Trần Thu Hà",
	soKr: 3,
	tienDo: 42,
};

const M_NHAP: MucTieu = {
	id: "m2",
	ten: "Rút thời gian phản hồi phiếu hỗ trợ",
	loai: "Tham vọng",
	trangThai: "nhap",
	phuTrach: "Lê Minh Quân",
	soKr: 2,
	tienDo: 0,
};

const M_BO_TRUNG: MucTieu = {
	id: "m3",
	ten: "Giữ chân khách hàng doanh nghiệp quý 4 (bản nhập trùng)",
	loai: "Cam kết",
	trangThai: "da-bo",
	phuTrach: "Trần Thu Hà",
	soKr: 1,
	tienDo: 0,
};

const M_BO_ZALO: MucTieu = {
	id: "m4",
	ten: "Mở kênh hỗ trợ qua Zalo",
	loai: "Tham vọng",
	trangThai: "da-bo",
	phuTrach: "Lê Minh Quân",
	soKr: 2,
	tienDo: 15,
};

const DANG_DUNG: MucTieu[] = [M_CONG_BO, M_NHAP];

const DA_BO: MucTieu[] = [M_BO_TRUNG, M_BO_ZALO];

const COT = [
	{ id: "mo", srLabel: "Mở rộng", width: "w-12" },
	{ id: "muc-tieu", header: "Mục tiêu" },
	{ id: "phu-trach", header: "Phụ trách", width: "w-44" },
	{ id: "tien-do", header: "Tiến độ", width: "w-56" },
];

function NhanTrangThai({ trangThai }: { trangThai: TrangThai }) {
	const variant =
		trangThai === "cong-bo"
			? "secondary"
			: trangThai === "da-bo"
				? "ghost"
				: "outline";
	return (
		<Badge data-variant={variant} variant={variant}>
			{NHAN_TRANG_THAI[trangThai]}
		</Badge>
	);
}

function HangMucTieu({ mt }: { mt: MucTieu }) {
	const daBo = mt.trangThai === "da-bo";
	return (
		<SimpleTableRow
			clickable
			data-da-bo={daBo ? "" : undefined}
			data-hang-muc-tieu={mt.id}
			expandable
			sub={daBo}
		>
			<SimpleTableCell className="w-12 align-top">
				<Button aria-label={`Mở ${mt.ten}`} size="icon-sm" variant="ghost">
					<Icon icon={ChevronRight} />
				</Button>
			</SimpleTableCell>
			<SimpleTableCell className="whitespace-normal align-top">
				<span className="flex min-w-0 flex-col gap-1">
					<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<span className="font-medium" translate="no">
							{mt.ten}
						</span>
						<span className="inline-flex flex-wrap items-center gap-2">
							{daBo ? null : <Badge variant="outline">{mt.loai}</Badge>}
							<NhanTrangThai trangThai={mt.trangThai} />
						</span>
					</span>
					<span className="text-muted-foreground text-xs">{mt.soKr} KR</span>
				</span>
			</SimpleTableCell>
			<SimpleTableCell className="hidden w-44 md:table-cell">
				<span translate="no">{mt.phuTrach}</span>
			</SimpleTableCell>
			<SimpleTableCell className="hidden w-56 md:table-cell">
				{daBo ? (
					<span className="text-muted-foreground text-xs">
						Không tính tiến độ
					</span>
				) : (
					<ThanhTienDo kyVong={null} nhan="Tiến độ" phanTram={mt.tienDo} />
				)}
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

function Bang({ ds }: { ds: MucTieu[] }) {
	return (
		<SimpleTable columns={COT} header="sr-only" surface="page">
			{ds.map((mt) => (
				<HangMucTieu key={mt.id} mt={mt} />
			))}
		</SimpleTable>
	);
}

function NhomDaBo({ ds, mo }: { ds: MucTieu[]; mo: boolean }) {
	return (
		<Collapsible data-nhom-da-bo defaultOpen={mo}>
			<CollapsibleTrigger asChild>
				<Button className="group" size="sm" variant="ghost">
					<Icon
						className="transition-transform group-aria-expanded:rotate-90 motion-reduce:transition-none"
						data-icon="inline-start"
						icon={ChevronRight}
					/>
					{`Đã bỏ (${ds.length})`}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-2">
				<Bang ds={ds} />
			</CollapsibleContent>
		</Collapsible>
	);
}

function DauDonVi({ soDangDung }: { soDangDung: number }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<span translate="no">Chăm sóc khách hàng</span>
				</CardTitle>
				<CardDescription>
					Phòng ban · Trưởng <span translate="no">Trần Thu Hà</span> ·{" "}
					{soDangDung} mục tiêu
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

function TheoDonVi({ hinh }: { hinh: "dong" | "mo" | "chi-da-bo" }) {
	const dangDung = hinh === "chi-da-bo" ? [] : DANG_DUNG;
	return (
		<KhungUngDung trang="theo-don-vi" vai="day-du">
			<DauDonVi soDangDung={dangDung.length} />
			{dangDung.length > 0 ? (
				<Bang ds={dangDung} />
			) : (
				<Empty className="rounded-lg border">
					<EmptyHeader>
						<EmptyTitle>Chăm sóc khách hàng chưa có mục tiêu nào</EmptyTitle>
						<EmptyDescription>
							Trưởng phòng ban thêm mục tiêu đầu tiên cho chu kỳ này.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
			<NhomDaBo ds={DA_BO} mo={hinh === "mo"} />
		</KhungUngDung>
	);
}

function CuaToi() {
	return (
		<KhungUngDung trang="cua-toi" vai="day-du">
			<Bang ds={[M_CONG_BO]} />
			<NhomDaBo ds={[M_BO_ZALO]} mo={false} />
		</KhungUngDung>
	);
}

type HinhNgan = "nhap-sach" | "co-lich-su" | "da-bo" | "hoi-xoa";

function NganMucTieu({ hinh }: { hinh: HinhNgan }) {
	const mt =
		hinh === "da-bo" ? M_BO_TRUNG : hinh === "co-lich-su" ? M_CONG_BO : M_NHAP;
	const sach = hinh !== "co-lich-su";
	return (
		<>
			<TheoDonVi hinh="dong" />
			<Sheet modal={false} open>
				<SheetContent data-ngan-muc-tieu={hinh}>
					<SheetHeader>
						<SheetTitle>
							<span translate="no">{mt.ten}</span>
						</SheetTitle>
						<SheetDescription>
							<span className="inline-flex items-center gap-2">
								<NhanTrangThai trangThai={mt.trangThai} /> {mt.soKr} KR
							</span>
						</SheetDescription>
						<div className="flex items-center gap-2" data-hang-nut>
							{hinh === "da-bo" ? (
								<Button data-nut="dung-lai" size="sm" variant="outline">
									Dùng lại
								</Button>
							) : null}
							<DropdownMenu modal={false} open={hinh !== "hoi-xoa"}>
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
									{hinh !== "da-bo" ? (
										<DropdownMenuItem>Sửa mục tiêu</DropdownMenuItem>
									) : null}
									{sach ? (
										<DropdownMenuItem variant="destructive">
											Xoá mục tiêu
										</DropdownMenuItem>
									) : (
										<DropdownMenuItem variant="destructive">
											Bỏ mục tiêu
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</SheetHeader>
					<SheetBody>
						<p className="text-muted-foreground text-sm">
							{hinh === "da-bo"
								? "Mục tiêu đã bỏ không tính vào tiến độ. Dùng lại thì nó về Nháp và phải gửi duyệt lại."
								: hinh === "co-lich-su"
									? "Mục tiêu đã công bố có lịch sử, nên chỉ bỏ được, không xoá được."
									: "Nháp này chưa ai cập nhật hay góp vào, nên xoá được hẳn."}
						</p>
					</SheetBody>
				</SheetContent>
			</Sheet>
			<ConfirmDialog
				nut="Xoá mục tiêu"
				onConfirm={() => {}}
				onOpenChange={() => {}}
				open={hinh === "hoi-xoa"}
				pending={false}
				than={`Mục tiêu và ${mt.soKr} KR của nó mất hẳn. Vết vẫn ghi lại việc xoá.`}
				thoi="Huỷ"
				tieuDe={`Xoá «${mt.ten}»?`}
			/>
		</>
	);
}

export function DonOkrNhapSai({ state }: { state: string }) {
	switch (state) {
		case "ST-donvi-dabo-mo":
			return <TheoDonVi hinh="mo" />;
		case "ST-donvi-chi-dabo":
			return <TheoDonVi hinh="chi-da-bo" />;
		case "ST-cuatoi-dabo-dong":
			return <CuaToi />;
		case "ST-ngan-nhap-sach":
			return <NganMucTieu hinh="nhap-sach" />;
		case "ST-ngan-co-lich-su":
			return <NganMucTieu hinh="co-lich-su" />;
		case "ST-ngan-da-bo":
			return <NganMucTieu hinh="da-bo" />;
		case "ST-ngan-hoi-xoa":
			return <NganMucTieu hinh="hoi-xoa" />;
		default:
			return <TheoDonVi hinh="dong" />;
	}
}
