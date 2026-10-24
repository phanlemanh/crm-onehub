"use client";

import Add from "@carbon/icons-react/es/Add";
import ChartNetwork from "@carbon/icons-react/es/ChartNetwork";
import NotificationFilled from "@carbon/icons-react/es/NotificationFilled";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
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
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatCard } from "@crm/ui/components/stat-card";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KrMau, MUC_TIEU } from "./du-lieu";

export type CheDoPhieu = "hom-nay" | "de-xuat" | "dang-cap-nhat";

const MT = MUC_TIEU[0];

const THE = ["KR", "Góp vào", "Diễn biến", "Trao đổi", "Lịch sử"] as const;

function DauPhieu() {
	return (
		<SheetHeader>
			<SheetDescription translate="no">
				Kinh doanh vùng 1 · Quý 4 · 2026
			</SheetDescription>
			<SheetTitle translate="no">{MT.ten}</SheetTitle>
			<div className="flex flex-wrap items-center gap-2 pt-1">
				<Badge variant="secondary">Tham vọng</Badge>
				<Badge variant="secondary">Đã công bố</Badge>
				<span className="ms-auto flex items-center gap-1">
					<Button size="sm" variant="outline">
						<Icon icon={ChartNetwork} data-icon="inline-start" />
						Xem sơ đồ mục tiêu
					</Button>
					<Button size="sm" variant="outline">
						<Icon icon={NotificationFilled} data-icon="inline-start" />
						Đang theo dõi
					</Button>
					<Button aria-label="Thao tác mục tiêu" size="icon" variant="ghost">
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</span>
			</div>
		</SheetHeader>
	);
}

function SoMucTieu() {
	return (
		<StatGroup>
			<StatCard
				description="lẽ ra đã tới 42%"
				label="Tiến độ"
				value={`${MT.tienDo}%`}
			/>
			<StatCard
				description="1 KR tự tin thấp"
				label="Tình trạng"
				value="Chậm nhịp"
			/>
			<StatCard
				description="1 KR chưa có số tuần này"
				label="Đã cập nhật"
				value="1/2"
			/>
		</StatGroup>
	);
}

function TheCon() {
	return (
		<Tabs value="KR">
			<TabsList variant="line">
				{THE.map((t) => (
					<TabsTrigger disabled={t !== "KR"} key={t} value={t}>
						{t}
						{t === "KR" ? (
							<Badge variant="secondary">{MT.kr.length}</Badge>
						) : null}
						{t === "Diễn biến" ? <Badge variant="secondary">15</Badge> : null}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}

function KhoiKara() {
	return (
		<div className="flex flex-col gap-3 text-sm">
			<div className="flex flex-col gap-1">
				<p className="font-medium text-muted-foreground text-xs uppercase">
					Vì sao lúc này
				</p>
				<p translate="no">
					Mạng lưới miền Bắc mới có 4 đối tác hoạt động; không mở thêm trong quý
					này thì mục tiêu doanh thu năm sau không đạt.
				</p>
			</div>
			<p className="text-muted-foreground text-xs">
				Kara không thấy gì cần sửa · tiêu đề, «vì sao lúc này» và các KR đọc ổn.
			</p>
		</div>
	);
}

function TienDoHomNay({ kr }: { kr: KrMau }) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs tabular-nums">
				{kr.so} / {kr.dich}
			</span>
			<Progress value={kr.tienDo} />
			<StatusIndicator
				label={kr.tienDo < 40 ? "Chậm nhịp" : "Đúng nhịp"}
				size="sm"
				tone={kr.tienDo < 40 ? "warning" : "success"}
			/>
		</div>
	);
}

const COT_HOM_NAY: SimpleTableColumn[] = [
	{ id: "kr", header: "KR" },
	{ id: "phu-trach", header: "Phụ trách", width: "w-[22%]" },
	{ id: "tien-do", header: "Tiến độ", width: "w-[24%]" },
	{ id: "thao-tac", header: "Thao tác", width: "w-[18%]" },
];

function BangHomNay() {
	return (
		<SimpleTable columns={COT_HOM_NAY} surface="page">
			{MT.kr.map((kr, i) => (
				<SimpleTableRow key={kr.id}>
					<TableCell className="px-3 py-3 align-top whitespace-normal">
						<span className="flex gap-3">
							<span className="text-muted-foreground text-xs">KR{i + 1}</span>
							<span className="flex flex-col gap-1">
								<span className="text-sm" translate="no">
									{kr.tieuDe}
								</span>
								<span className="text-muted-foreground text-xs">Tăng tới</span>
							</span>
						</span>
					</TableCell>
					<TableCell className="px-3 py-3 align-top text-sm whitespace-normal">
						<span translate="no">{kr.chuTen}</span>
					</TableCell>
					<TableCell className="px-3 py-3 align-top">
						<TienDoHomNay kr={kr} />
					</TableCell>
					<TableCell className="px-3 py-3 align-top">
						<span className="flex items-center gap-1">
							<Button size="sm" variant="ghost">
								<Icon icon={Add} data-icon="inline-start" />
								Thêm việc
							</Button>
							<Button
								aria-label="Thao tác KR — Cập nhật KR nằm ở đây"
								size="icon"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</span>
					</TableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

const COT_DE_XUAT: SimpleTableColumn[] = [
	{ id: "kr", header: "KR" },
	{ id: "tien-do", header: "Tiến độ", width: "w-[24%]" },
	{ id: "tu-tin", header: "Tự tin", width: "w-[14%]" },
	{ id: "thao-tac", srLabel: "Thao tác", width: "w-[18%]" },
];

function DongDeXuat({
	kr,
	i,
	moForm,
}: {
	kr: KrMau;
	i: number;
	moForm: boolean;
}) {
	return (
		<>
			<SimpleTableRow data-kr-phieu={kr.id}>
				<TableCell className="px-3 py-3 align-top whitespace-normal">
					<span className="flex gap-3">
						<span className="text-muted-foreground text-xs">KR{i + 1}</span>
						<span className="flex min-w-0 flex-col gap-1">
							<span className="text-sm" translate="no">
								{kr.tieuDe}
							</span>
							<span className="text-muted-foreground text-xs">
								Phụ trách {kr.chuTen}
							</span>
							{kr.ghiChu ? (
								<span className="text-sm" translate="no">
									«{kr.ghiChu}»
								</span>
							) : (
								<span className="text-muted-foreground text-xs">
									Chưa có ghi chú tuần này
								</span>
							)}
						</span>
					</span>
				</TableCell>
				<TableCell className="px-3 py-3 align-top">
					<div className="flex flex-col gap-1.5">
						<span className="text-xs tabular-nums">
							{kr.so} / {kr.dich}
						</span>
						<Progress value={kr.tienDo} />
						<span className="text-muted-foreground text-xs tabular-nums">
							{kr.doi ? `${kr.doi} so với tuần trước` : "chưa đổi"}
						</span>
					</div>
				</TableCell>
				<TableCell className="px-3 py-3 align-top">
					{kr.tuTin ? <ConfidenceIndicator level={kr.tuTin} size="sm" /> : null}
				</TableCell>
				<TableCell className="px-3 py-3 align-top">
					<span className="flex items-center gap-1">
						{moForm ? null : (
							<Button
								asChild
								data-nut="cap-nhat-phieu"
								size="sm"
								variant="outline"
							>
								<Link href="/proto/bo-okr-la-noi-hop?state=ST-bln-phieu-cap-nhat">
									Cập nhật
								</Link>
							</Button>
						)}
						<Button aria-label="Thao tác KR" size="icon" variant="ghost">
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</span>
				</TableCell>
			</SimpleTableRow>
			{moForm ? (
				<SimpleTableRow data-form-tai-dong={kr.id}>
					<TableCell className="px-3 pb-4 whitespace-normal" colSpan={4}>
						<FormTaiDong kr={kr} />
					</TableCell>
				</SimpleTableRow>
			) : null}
		</>
	);
}

function FormTaiDong({ kr }: { kr: KrMau }) {
	const truoc = kr.lichSu[0];
	return (
		<div className="flex flex-col gap-3 ps-8">
			{truoc ? (
				<p className="text-muted-foreground text-xs">
					Lần trước {truoc.ngay}: {truoc.so} ·{" "}
					<span translate="no">«{truoc.ghiChu}»</span>
				</p>
			) : null}
			<div className="grid gap-3 sm:grid-cols-[1fr_auto]">
				<Field>
					<FieldLabel htmlFor="phieu-gia-tri">Giá trị mới</FieldLabel>
					<Input defaultValue="4" id="phieu-gia-tri" inputMode="decimal" />
				</Field>
				<Field>
					<FieldLabel>Mức tự tin</FieldLabel>
					<ToggleGroup size="sm" type="single" variant="outline">
						<ToggleGroupItem value="cao">Cao</ToggleGroupItem>
						<ToggleGroupItem value="vua">Vừa</ToggleGroupItem>
						<ToggleGroupItem value="thap">Thấp</ToggleGroupItem>
					</ToggleGroup>
				</Field>
			</div>
			<Field>
				<FieldLabel htmlFor="phieu-ghi-chu">Ghi chú</FieldLabel>
				<Input
					id="phieu-ghi-chu"
					maxLength={200}
					placeholder="Một dòng: điều gì đổi, cần ai giúp"
				/>
				<FieldDescription>
					Điều ghi lần trước đã xong chưa? · Đang vướng gì, cần ai giúp? · Tuần
					tới làm gì?
				</FieldDescription>
			</Field>
			<span className="flex justify-end gap-2">
				<Button asChild size="sm" variant="outline">
					<Link href="/proto/bo-okr-la-noi-hop?state=ST-bln-phieu-de-xuat">
						Huỷ
					</Link>
				</Button>
				<Button asChild size="sm">
					<Link href="/proto/bo-okr-la-noi-hop?state=ST-bln-phieu-de-xuat">
						Gửi cập nhật
					</Link>
				</Button>
			</span>
		</div>
	);
}

function BangDeXuat({ moForm }: { moForm: boolean }) {
	return (
		<SimpleTable columns={COT_DE_XUAT} surface="page">
			{MT.kr.map((kr, i) => (
				<DongDeXuat i={i} key={kr.id} kr={kr} moForm={moForm && i === 0} />
			))}
		</SimpleTable>
	);
}

export function PhieuMucTieuMau({
	cheDo,
	dongVe,
}: {
	cheDo: CheDoPhieu;
	dongVe: string;
}) {
	const router = useRouter();
	return (
		<Sheet open onOpenChange={(mo) => (mo ? null : router.push(dongVe))}>
			<SheetContent data-phieu-muc-tieu={cheDo} side="right" size="lg">
				<DauPhieu />
				<SheetBody className="flex flex-col gap-5 *:shrink-0">
					{cheDo === "hom-nay" ? (
						<Alert>
							<AlertTitle>Hôm nay trên production (24/10)</AlertTitle>
							<AlertDescription>
								Bảng KR chỉ có Phụ trách và Tiến độ. «Thêm việc» là việc và sáng
								kiến; lệnh Cập nhật KR nằm ẩn trong menu «…». Không thấy tự tin
								hay ghi chú tuần này.
							</AlertDescription>
						</Alert>
					) : (
						<Alert>
							<AlertTitle>Đề xuất — cập nhật ngay trong phiếu</AlertTitle>
							<AlertDescription>
								Mỗi KR hiện ghi chú mới nhất, mức đổi và tự tin; nút «Cập nhật»
								hiện trên dòng và mở mẫu cập nhật ngay dưới dòng, không hộp
								riêng. Việc và sáng kiến chuyển vào menu «…».
							</AlertDescription>
						</Alert>
					)}
					<SoMucTieu />
					<TheCon />
					<KhoiKara />
					{cheDo === "hom-nay" ? (
						<BangHomNay />
					) : (
						<BangDeXuat moForm={cheDo === "dang-cap-nhat"} />
					)}
					<span className="flex items-center justify-between text-muted-foreground text-xs">
						Tiến độ mục tiêu {MT.tienDo}% từ {MT.kr.length} KR.
						<Button size="sm" variant="ghost">
							<Icon icon={Add} data-icon="inline-start" />
							Thêm KR
						</Button>
					</span>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}
