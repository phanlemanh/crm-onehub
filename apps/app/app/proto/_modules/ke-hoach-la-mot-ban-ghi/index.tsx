"use client";

import Add from "@carbon/icons-react/es/Add";
import Calendar from "@carbon/icons-react/es/Calendar";
import Close from "@carbon/icons-react/es/Close";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import UserFollow from "@carbon/icons-react/es/UserFollow";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { Progress } from "@crm/ui/components/progress";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import {
	BAC,
	BUOC_CO_DU_LIEU,
	type BuocMau,
	GHI_DANH,
	GHI_DANH_80,
	type GhiDanhMau,
	HANG_NEN,
	KE_HOACH,
	VET,
} from "./du-lieu";

type Hinh = {
	tab: "buoc" | "moi-gioi" | "hoat-dong";
	buoc: BuocMau[];
	ghiDanh: GhiDanhMau[];
	dong: boolean;
	dangTai: boolean;
	loi: boolean;
	dangGhi: string | null;
};

const MAC_DINH: Hinh = {
	tab: "buoc",
	buoc: BUOC_CO_DU_LIEU.map((b) => ({ ...b, quaHan: false })),
	ghiDanh: GHI_DANH,
	dong: false,
	dangTai: false,
	loi: false,
	dangGhi: null,
};

const HINH_THEO_STATE = {
	"ST-kehoach-codulieu": MAC_DINH,
	"ST-kehoach-quahan": { ...MAC_DINH, buoc: BUOC_CO_DU_LIEU },
	"ST-kehoach-dangtai": { ...MAC_DINH, dangTai: true },
	"ST-kehoach-loi": { ...MAC_DINH, loi: true },
	"ST-kehoach-khongbuoc": { ...MAC_DINH, buoc: [] },
	"ST-kehoach-dadong": { ...MAC_DINH, buoc: BUOC_CO_DU_LIEU, dong: true },
	"ST-kehoach-dangghi": { ...MAC_DINH, buoc: BUOC_CO_DU_LIEU, dangGhi: "b3" },
	"ST-kehoach-phieurong": { ...MAC_DINH, tab: "moi-gioi", ghiDanh: [] },
	"ST-kehoach-phieu80": { ...MAC_DINH, tab: "moi-gioi", ghiDanh: GHI_DANH_80 },
	"ST-kehoach-hoatdong": { ...MAC_DINH, tab: "hoat-dong" },
} satisfies Record<string, Hinh>;

function BangNen() {
	return (
		<section
			aria-label="Danh mục 30 ngày phía sau sheet"
			className="flex flex-col gap-3"
		>
			<h2 className="font-medium text-lg">30 ngày đầu</h2>
			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Đối tác</TableHead>
							<TableHead>Đang tắc ở</TableHead>
							<TableHead className="text-right">Im lặng</TableHead>
							<TableHead className="text-right">Bước</TableHead>
							<TableHead className="text-right">Ngày</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{HANG_NEN.map((h) => (
							<TableRow key={h.doiTac}>
								<TableCell className="font-medium" translate="no">
									{h.doiTac}
								</TableCell>
								<TableCell translate="no">{h.tac}</TableCell>
								<TableCell className="text-right tabular-nums">
									{h.im}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{h.buoc}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{h.ngay}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</section>
	);
}

function NguoiDuocGiao({ buoc, khoa }: { buoc: BuocMau; khoa: boolean }) {
	return (
		<Button disabled={khoa} size="sm" variant="ghost">
			{buoc.nguoi ? (
				<>
					<PersonAvatar name={buoc.nguoi.ten} size="sm" />
					<span translate="no">{buoc.nguoi.ten}</span>
				</>
			) : (
				<>
					<Icon icon={UserFollow} data-icon="inline-start" />
					<span className="text-muted-foreground">Chưa giao</span>
				</>
			)}
		</Button>
	);
}

function DongBuoc({ buoc, hinh }: { buoc: BuocMau; hinh: Hinh }) {
	const dangGhi = hinh.dangGhi === buoc.id;
	const khoa = hinh.dong || dangGhi;

	return (
		<li className="flex items-center gap-2 py-1.5">
			{dangGhi ? (
				<Spinner />
			) : (
				<Checkbox
					aria-label={
						buoc.xong
							? `Bỏ đánh dấu xong ${buoc.nhan}`
							: `Đánh dấu xong ${buoc.nhan}`
					}
					checked={buoc.xong}
					disabled={khoa}
				/>
			)}
			<span className="flex min-w-0 flex-1 items-center gap-2">
				<span
					className={
						buoc.xong
							? "min-w-0 truncate text-muted-foreground text-sm line-through"
							: "min-w-0 truncate font-medium text-sm"
					}
					translate="no"
				>
					{buoc.nhan}
				</span>
				{buoc.quaHan && !buoc.xong ? (
					<Badge variant="outline">Quá hạn</Badge>
				) : null}
			</span>
			<NguoiDuocGiao buoc={buoc} khoa={khoa} />
			<Button disabled={khoa} size="sm" variant="ghost">
				<Icon icon={Calendar} data-icon="inline-start" />
				<span
					className={
						buoc.quaHan
							? "font-medium tabular-nums"
							: "text-muted-foreground tabular-nums"
					}
				>
					{buoc.han}
				</span>
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label={`Thao tác với ${buoc.nhan}`}
						disabled={khoa}
						size="icon-sm"
						variant="ghost"
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem>Lên</DropdownMenuItem>
					<DropdownMenuItem>Xuống</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant="destructive">Bỏ bước</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</li>
	);
}

function TabBuoc({ hinh }: { hinh: Hinh }) {
	const nhom = [...new Set(hinh.buoc.map((b) => b.boPhan))];

	return (
		<DetailSheetBody>
			<DetailSheetSection title="Chi tiết">
				<DetailSheetProperties>
					<DetailSheetProperty label="Khuôn">
						{KE_HOACH.khuon}
					</DetailSheetProperty>
					<DetailSheetProperty label="Bắt đầu">
						{KE_HOACH.batDau}
					</DetailSheetProperty>
					<DetailSheetProperty label="Mục tiêu">
						{KE_HOACH.mucTieu}
					</DetailSheetProperty>
					<DetailSheetProperty label="Cầm trịch">
						<span translate="no">{KE_HOACH.camTrich.ten}</span>
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>

			{hinh.dong ? (
				<p className="px-5 pt-3 text-muted-foreground text-xs">
					Kế hoạch đã đóng — mở lại để sửa.
				</p>
			) : null}

			{hinh.buoc.length === 0 ? (
				<DetailSheetEmpty
					action={
						<Button size="sm" variant="outline">
							<Icon icon={Add} data-icon="inline-start" />
							Thêm bước
						</Button>
					}
					description="Kế hoạch này không dựng từ khuôn có bước. Thêm bước đầu tiên và chọn bộ phận giữ nó."
					icon={Calendar}
					title="Kế hoạch chưa có bước nào"
				/>
			) : (
				nhom.map((boPhan) => {
					const buoc = hinh.buoc.filter((b) => b.boPhan === boPhan);
					const xong = buoc.filter((b) => b.xong).length;
					return (
						<DetailSheetSection
							key={boPhan}
							title={`${boPhan} · ${xong}/${buoc.length} xong`}
						>
							<ul className="flex flex-col">
								{buoc.map((b) => (
									<DongBuoc buoc={b} hinh={hinh} key={b.id} />
								))}
							</ul>
							{hinh.dong ? null : (
								<Button className="self-start" size="sm" variant="ghost">
									<Icon icon={Add} data-icon="inline-start" />
									Thêm bước
								</Button>
							)}
						</DetailSheetSection>
					);
				})
			)}
		</DetailSheetBody>
	);
}

const COT_MOI_GIOI = [
	{ id: "ten", header: "Tên", width: "w-[28%]", className: "pl-5" },
	...BAC.map((nhan, i) => ({ id: `bac-${i}`, header: nhan, width: "w-[16%]" })),
	{ id: "go", srLabel: "Gỡ khỏi phễu", width: "w-10" },
];

function TabMoiGioi({ hinh }: { hinh: Hinh }) {
	const tong = hinh.ghiDanh.length;

	if (tong === 0) {
		return (
			<DetailSheetBody>
				<DetailSheetEmpty
					action={
						<Button size="sm" variant="outline">
							<Icon icon={Add} data-icon="inline-start" />
							Thêm môi giới
						</Button>
					}
					description="Thêm tay, hoặc chờ số từ nền tảng khi đường nối đã bật."
					icon={UserFollow}
					title="Chưa ghi danh môi giới nào"
				/>
			</DetailSheetBody>
		);
	}

	return (
		<DetailSheetBody>
			<DetailSheetSection title={`Phễu · ${tong} môi giới`}>
				<div className="grid grid-cols-2 gap-x-6 gap-y-3">
					{BAC.map((nhan, i) => {
						const dat = hinh.ghiDanh.filter((g) => g.bac[i] !== null).length;
						return (
							<div className="flex flex-col gap-1.5" key={nhan}>
								<div className="flex items-baseline justify-between gap-3 text-sm">
									<span>{nhan}</span>
									<span className="tabular-nums">
										{dat}/{tong}
									</span>
								</div>
								<Progress value={(dat / tong) * 100} />
							</div>
						);
					})}
				</div>
			</DetailSheetSection>
			<SimpleTable columns={COT_MOI_GIOI}>
				{hinh.ghiDanh.map((g) => (
					<SimpleTableRow key={g.id}>
						<TableCell className="pl-5 font-medium" translate="no">
							{g.ten}
						</TableCell>
						{g.bac.map((ngay, i) => (
							<TableCell className="tabular-nums" key={BAC[i]}>
								{ngay ?? <EmptyCellValue />}
							</TableCell>
						))}
						<TableCell>
							<Button
								aria-label={`Gỡ ${g.ten} khỏi phễu`}
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={Close} />
							</Button>
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</DetailSheetBody>
	);
}

function TabHoatDong() {
	return (
		<DetailSheetBody>
			<DetailSheetSection title="Hoạt động">
				<ul className="flex flex-col gap-3">
					{VET.map((v) => (
						<li className="flex gap-2.5" key={v.id}>
							<PersonAvatar name={v.nguoi} size="sm" />
							<div className="min-w-0 flex-1 text-sm">
								<p className={v.laGhiChu ? "" : "text-muted-foreground"}>
									<span className="font-medium text-foreground" translate="no">
										{v.nguoi}
									</span>{" "}
									{v.cau}
								</p>
								<p className="text-muted-foreground text-xs">{v.luc}</p>
							</div>
						</li>
					))}
				</ul>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

function MenuKeHoach({ dong }: { dong: boolean }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Thao tác với kế hoạch"
					size="icon-sm"
					variant="ghost"
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>
					{dong ? "Mở lại kế hoạch" : "Đóng kế hoạch"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SheetKeHoach({ hinh }: { hinh: Hinh }) {
	const [tab, setTab] = useState<string>(hinh.tab);
	const xong = hinh.buoc.filter((b) => b.xong).length;

	const tabs: DetailSheetTab[] = [
		{
			value: "buoc",
			label: "Bước",
			count: hinh.buoc.length,
			content: <TabBuoc hinh={hinh} />,
		},
		{
			value: "moi-gioi",
			label: "Môi giới",
			count: hinh.ghiDanh.length,
			content: <TabMoiGioi hinh={hinh} />,
		},
		{ value: "hoat-dong", label: "Hoạt động", content: <TabHoatDong /> },
	];

	return (
		<DetailSheet onOpenChange={() => undefined} open>
			<DetailSheetHeader
				actions={<MenuKeHoach dong={hinh.dong} />}
				description={
					<>
						Kế hoạch 30 ngày · khuôn {KE_HOACH.khuon} ·{" "}
						<button
							className="text-foreground underline-offset-2 hover:underline"
							type="button"
						>
							Hồ sơ công ty
						</button>
					</>
				}
				media={<EntityLogo name={KE_HOACH.doiTac} size="lg" />}
				note={
					hinh.dong ? <Badge variant="secondary">Đã đóng 30/09</Badge> : null
				}
				title={<span translate="no">{KE_HOACH.doiTac}</span>}
			/>
			{hinh.dangTai ? (
				<div
					aria-live="polite"
					className="flex min-h-0 flex-1 items-center justify-center"
				>
					<Spinner />
				</div>
			) : hinh.loi ? (
				<div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
					<p className="font-medium text-sm">Không tải được bản ghi</p>
					<p className="text-muted-foreground text-xs">
						Máy chủ không trả lời. Đóng sheet rồi mở lại.
					</p>
				</div>
			) : (
				<>
					<DetailSheetStats>
						<DetailSheetStat label="Ngày">
							<span className="tabular-nums">{KE_HOACH.ngay}</span>
						</DetailSheetStat>
						<DetailSheetStat label="Bước">
							<span className="tabular-nums">
								{xong}/{hinh.buoc.length}
							</span>
						</DetailSheetStat>
						<DetailSheetStat label="Im lặng">
							<span className="tabular-nums">3 ngày</span>
						</DetailSheetStat>
						<DetailSheetStat label="Cầm trịch">
							<span className="flex items-center gap-1.5" translate="no">
								<PersonAvatar name={KE_HOACH.camTrich.ten} size="sm" />
								{KE_HOACH.camTrich.ten}
							</span>
						</DetailSheetStat>
					</DetailSheetStats>
					<DetailSheetTabs onValueChange={setTab} tabs={tabs} value={tab} />
				</>
			)}
		</DetailSheet>
	);
}

export function KeHoachLaMotBanGhiMau({ state }: { state: string }) {
	const hinh: Hinh =
		state in HINH_THEO_STATE
			? HINH_THEO_STATE[state as keyof typeof HINH_THEO_STATE]
			: MAC_DINH;

	return (
		<>
			<BangNen />
			<SheetKeHoach hinh={hinh} key={state} />
		</>
	);
}
