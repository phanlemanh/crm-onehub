"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Board, type BoardColumn } from "@crm/ui/components/board";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import {
	Timeline,
	TimelineContent,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle,
} from "@crm/ui/components/reui/timeline";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { type ComponentProps, useMemo, useState } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import type {
	DauVao,
	DuLieu,
	Hang,
	LoTrinh,
	Moc,
	NhomTrangThai,
} from "./du-lieu";

const TONE = {
	"da-giao": "success",
	"dang-lam": "info",
	"chua-bat-dau": "neutral",
	khac: "neutral",
} as const satisfies Record<NhomTrangThai, StatusTone>;

const NHAN_NHOM = {
	"chua-bat-dau": "Chưa bắt đầu",
	"dang-lam": "Đang làm",
	"da-giao": "Đã giao",
	khac: "Khác",
} as const satisfies Record<NhomTrangThai, string>;

const THU_TU_COT = ["chua-bat-dau", "dang-lam", "da-giao", "khac"] as const;
const TRAN_THE_COT = 8;

const TAT_CA = "__tat-ca";
const KHONG_NHOM = "__khong-nhom";

function mocQuaConViec(moc: Moc, homNay: string) {
	return (
		/^\d{4}-\d{2}-\d{2}$/.test(moc.ngay) &&
		moc.ngay < homNay &&
		moc.con_viec === true
	);
}

function viecTre(loTrinh: LoTrinh, homNay: string) {
	const theoMa = new Map(loTrinh.hang.map((h) => [h.ma, h]));
	const ra: string[] = [];
	for (const m of loTrinh.moc) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(m.ngay) || !(m.ngay < homNay)) continue;
		for (const ma of m.hang) {
			const h = theoMa.get(ma);
			if (h && h.nhom_trang_thai !== "da-giao" && !ra.includes(ma)) ra.push(ma);
		}
	}
	return ra;
}

const dinhNgay = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

function ngayDep(ngay: string) {
	const [y, m, d] = ngay.split("-").map(Number);
	if (!y || !m || !d) return ngay;
	return dinhNgay.format(new Date(y, m - 1, d));
}

function mocCuaViec(loTrinh: LoTrinh) {
	const ra = new Map<string, Moc>();
	for (const m of loTrinh.moc)
		for (const ma of m.hang) if (!ra.has(ma)) ra.set(ma, m);
	return ra;
}

function ChiTietDoi({ chu }: { chu: string }) {
	return (
		<Collapsible data-lo-trinh-chi-tiet>
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					Chi tiết cho đội sản phẩm
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<p className="px-3 py-2 text-muted-foreground text-xs" translate="no">
					{chu}
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}

function KhungTrong({
	ca,
	tieuDe,
	moTa,
	cauMay,
}: {
	ca: string;
	tieuDe: string;
	moTa: string;
	cauMay?: string;
}) {
	return (
		<Empty data-lo-trinh-trang={ca}>
			<EmptyHeader>
				<EmptyTitle>{tieuDe}</EmptyTitle>
				<EmptyDescription>{moTa}</EmptyDescription>
			</EmptyHeader>
			{cauMay ? (
				<EmptyContent>
					<ChiTietDoi chu={cauMay} />
				</EmptyContent>
			) : null}
		</Empty>
	);
}

function TienDo({ loTrinh }: { loTrinh: LoTrinh }) {
	const { tien_do: t } = loTrinh;
	const phan = t.tong ? Math.round((t.da_giao / t.tong) * 100) : 0;
	return (
		<StatGroup>
			<StatCard
				data-tien-do="da_giao"
				description={`${phan}% kế hoạch`}
				label="Đã giao"
				value={`${t.da_giao}/${t.tong}`}
			/>
			<StatCard
				data-tien-do="dang_lam"
				description="Đang có người làm"
				label="Đang làm"
				value={t.dang_lam}
			/>
			<StatCard
				data-tien-do="chua_bat_dau"
				description="Đã lên kế hoạch, chưa mở"
				label="Chưa bắt đầu"
				value={t.chua_bat_dau}
			/>
			<StatCard
				data-tien-do="khac"
				description="Xếp lại sau hoặc đã bác"
				label="Khác"
				value={t.khac}
			/>
		</StatGroup>
	);
}

function TrangThai({ h }: { h: Hang }) {
	const nhan = NHAN_NHOM[h.nhom_trang_thai];
	return (
		<span className="flex flex-col gap-0.5">
			<StatusIndicator label={nhan} size="sm" tone={TONE[h.nhom_trang_thai]} />
			{h.trang_thai !== nhan ? (
				<span className="text-muted-foreground text-xs" translate="no">
					{h.trang_thai}
				</span>
			) : null}
		</span>
	);
}

function OMoc({ moc, tre }: { moc: Moc | undefined; tre: boolean }) {
	if (!moc) return <span className="text-muted-foreground">Chưa hẹn mốc</span>;
	return (
		<span
			className="inline-flex items-center gap-2"
			data-lo-trinh-moc-viec={moc.ngay}
		>
			{ngayDep(moc.ngay)}
			{tre ? <Badge variant="outline">Trễ</Badge> : null}
		</span>
	);
}

function locViec(loTrinh: LoTrinh, nhom: string) {
	return loTrinh.hang.filter((h) =>
		nhom === TAT_CA
			? true
			: nhom === KHONG_NHOM
				? h.nhom === ""
				: h.nhom === nhom,
	);
}

function DanhSachViec({
	loTrinh,
	nhom,
	homNay,
	moViec,
}: {
	loTrinh: LoTrinh;
	nhom: string;
	homNay: string | null;
	moViec: (ma: string) => void;
}) {
	const theoMoc = mocCuaViec(loTrinh);
	const tre = new Set(homNay === null ? [] : viecTre(loTrinh, homNay));
	const viec = locViec(loTrinh, nhom);
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "viec", header: "Việc" },
						{ id: "nhom", header: "Nhóm", width: "8rem" },
						{ id: "trang-thai", header: "Trạng thái", width: "15rem" },
						{ id: "moc", header: "Mốc", width: "9rem", align: "right" },
					]}
					surface="page"
				>
					{viec.map((h) => (
						<SimpleTableRow
							clickable
							data-viec-ma={h.ma}
							key={h.ma}
							onClick={() => moViec(h.ma)}
						>
							<TableCell className="whitespace-normal">
								<span className="flex flex-col gap-1">
									<span className="flex items-baseline gap-2">
										<Badge translate="no" variant="mono">
											{h.ma}
										</Badge>
										<span className="font-medium" translate="no">
											{h.cau_giao}
										</span>
									</span>
									{h.co.map((c) => (
										<span
											className="text-muted-foreground text-xs"
											key={c}
											translate="no"
										>
											{c}
										</span>
									))}
								</span>
							</TableCell>
							<TableCell translate="no">
								{h.nhom || <EmptyCellValue />}
							</TableCell>
							<TableCell>
								<TrangThai h={h} />
							</TableCell>
							<TableCell className="text-right text-muted-foreground tabular-nums">
								<OMoc moc={theoMoc.get(h.ma)} tre={tre.has(h.ma)} />
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<div className="md:hidden">
				<ItemGroup>
					{viec.map((h) => (
						<Item asChild data-viec-ma={h.ma} key={h.ma} variant="outline">
							<button onClick={() => moViec(h.ma)} type="button">
								<ItemContent>
									<ItemTitle translate="no">{h.cau_giao}</ItemTitle>
									<ItemDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
										<TrangThai h={h} />
										<span translate="no">
											{h.ma}
											{h.nhom ? ` · ${h.nhom}` : ""}
										</span>
										{theoMoc.get(h.ma) ? (
											<OMoc moc={theoMoc.get(h.ma)} tre={tre.has(h.ma)} />
										) : null}
									</ItemDescription>
									{h.co.map((c) => (
										<span
											className="text-muted-foreground text-xs"
											key={c}
											translate="no"
										>
											{c}
										</span>
									))}
								</ItemContent>
							</button>
						</Item>
					))}
				</ItemGroup>
			</div>
		</>
	);
}

function BoLoc({
	loTrinh,
	nhom,
	doiNhom,
}: {
	loTrinh: LoTrinh;
	nhom: string;
	doiNhom: (n: string) => void;
}) {
	const dem = new Map<string, number>();
	for (const h of loTrinh.hang) dem.set(h.nhom, (dem.get(h.nhom) ?? 0) + 1);
	const coTen = [...dem.keys()].filter((k) => k !== "");
	if (coTen.length < 2 && !dem.has("")) return null;
	return (
		<div className="max-w-full overflow-x-auto">
			<ToggleGroup
				aria-label="Lọc theo nhóm"
				onValueChange={(v) => {
					if (v !== "") doiNhom(v);
				}}
				size="sm"
				type="single"
				value={nhom}
				variant="outline"
			>
				<ToggleGroupItem value={TAT_CA}>
					Tất cả
					<span className="text-muted-foreground tabular-nums">
						{loTrinh.hang.length}
					</span>
				</ToggleGroupItem>
				{coTen.map((k) => (
					<ToggleGroupItem key={k} value={k}>
						<span translate="no">{k}</span>
						<span className="text-muted-foreground tabular-nums">
							{dem.get(k)}
						</span>
					</ToggleGroupItem>
				))}
				{dem.has("") && coTen.length ? (
					<ToggleGroupItem value={KHONG_NHOM}>
						Không nhóm
						<span className="text-muted-foreground tabular-nums">
							{dem.get("")}
						</span>
					</ToggleGroupItem>
				) : null}
			</ToggleGroup>
		</div>
	);
}

function DanhSachMoc({
	loTrinh,
	homNay,
}: {
	loTrinh: LoTrinh;
	homNay: string | null;
}) {
	if (!loTrinh.moc.length) return null;
	const daQua =
		homNay === null ? 0 : loTrinh.moc.filter((m) => m.ngay < homNay).length;
	return (
		<Card>
			<CardHeader>
				<CardTitle>Mốc</CardTitle>
				<CardDescription>
					Các mốc của lộ trình theo ngày. Mốc đã qua mà còn việc chưa giao được
					đánh dấu.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Timeline value={daQua}>
					{loTrinh.moc.map((m, i) => (
						<TimelineItem
							data-lo-trinh-moc={m.ngay}
							key={`${m.ngay}-${m.ten}`}
							step={i + 1}
						>
							<TimelineHeader>
								<TimelineSeparator />
								<TimelineDate className="tabular-nums">
									{ngayDep(m.ngay)}
								</TimelineDate>
								<TimelineTitle translate="no">{m.ten}</TimelineTitle>
								<TimelineIndicator />
							</TimelineHeader>
							<TimelineContent className="flex flex-wrap items-center gap-2">
								{m.hang.length ? (
									<span translate="no">{m.hang.join(" · ")}</span>
								) : null}
								{homNay !== null && mocQuaConViec(m, homNay) ? (
									<StatusIndicator
										label="Đã qua — còn việc chưa giao"
										size="sm"
										tone="warning"
									/>
								) : null}
							</TimelineContent>
						</TimelineItem>
					))}
				</Timeline>
			</CardContent>
		</Card>
	);
}

function BangCot({
	loTrinh,
	nhom,
	homNay,
	moViec,
}: {
	loTrinh: LoTrinh;
	nhom: string;
	homNay: string | null;
	moViec: (ma: string) => void;
}) {
	const theoMoc = mocCuaViec(loTrinh);
	const tre = new Set(homNay === null ? [] : viecTre(loTrinh, homNay));
	const viec = locViec(loTrinh, nhom);
	const NutViec = useMemo(
		() =>
			function NutViec({ href, children, className }: ComponentProps<"a">) {
				return (
					<button
						className={className}
						onClick={() => moViec(String(href).slice(1))}
						type="button"
					>
						{children}
					</button>
				);
			},
		[moViec],
	);
	const cot: BoardColumn[] = THU_TU_COT.map((g) => {
		const trong = viec.filter((h) => h.nhom_trang_thai === g);
		return {
			id: g,
			label: NHAN_NHOM[g],
			count: trong.length,
			cards: trong.slice(0, TRAN_THE_COT).map((h) => ({
				id: h.ma,
				href: `#${h.ma}`,
				title: h.cau_giao,
				subtitle: `${h.ma}${h.nhom ? ` · ${h.nhom}` : ""}`,
				meta: (
					<span className="text-muted-foreground text-xs">
						<OMoc moc={theoMoc.get(h.ma)} tre={tre.has(h.ma)} />
					</span>
				),
			})),
		};
	});
	return (
		<Board columns={cot} label="Việc theo trạng thái" linkComponent={NutViec} />
	);
}

function ChiTietViec({
	loTrinh,
	ma,
	homNay,
	moViec,
	dong,
}: {
	loTrinh: LoTrinh;
	ma: string | null;
	homNay: string | null;
	moViec: (ma: string) => void;
	dong: () => void;
}) {
	const h = loTrinh.hang.find((x) => x.ma === ma);
	const theoMa = new Map(loTrinh.hang.map((x) => [x.ma, x]));
	const moc = h ? mocCuaViec(loTrinh).get(h.ma) : undefined;
	const tre = h && homNay !== null && viecTre(loTrinh, homNay).includes(h.ma);
	const choViecNay = h
		? loTrinh.hang.filter((x) => x.dung_tren.includes(h.ma))
		: [];
	const DongViec = ({ x }: { x: Hang }) => (
		<Item asChild size="xs" variant="outline">
			<button onClick={() => moViec(x.ma)} type="button">
				<ItemContent>
					<ItemTitle translate="no">{x.cau_giao}</ItemTitle>
					<ItemDescription className="flex items-center gap-2">
						<Badge translate="no" variant="mono">
							{x.ma}
						</Badge>
						<StatusIndicator
							label={NHAN_NHOM[x.nhom_trang_thai]}
							size="sm"
							tone={TONE[x.nhom_trang_thai]}
						/>
					</ItemDescription>
				</ItemContent>
			</button>
		</Item>
	);
	return (
		<Sheet onOpenChange={(mo) => (mo ? null : dong())} open={h !== undefined}>
			<SheetContent data-lo-trinh-chi-tiet-viec={h?.ma} size="md">
				{h ? (
					<>
						<SheetHeader>
							<SheetDescription className="flex items-center gap-2">
								<Badge translate="no" variant="mono">
									{h.ma}
								</Badge>
								{h.nhom ? <span translate="no">{h.nhom}</span> : null}
							</SheetDescription>
							<SheetTitle translate="no">{h.cau_giao}</SheetTitle>
						</SheetHeader>
						<SheetBody className="flex flex-col gap-5 text-sm">
							<dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-3">
								<dt className="text-muted-foreground">Trạng thái</dt>
								<dd>
									<TrangThai h={h} />
								</dd>
								<dt className="text-muted-foreground">Mốc</dt>
								<dd>
									{moc ? (
										<span className="flex flex-col gap-0.5">
											<OMoc moc={moc} tre={Boolean(tre)} />
											<span
												className="text-muted-foreground text-xs"
												translate="no"
											>
												{moc.ten}
											</span>
										</span>
									) : (
										<span className="text-muted-foreground">Chưa hẹn mốc</span>
									)}
								</dd>
								{h.bat_khi ? (
									<>
										<dt className="text-muted-foreground">
											Coi là thành công khi
										</dt>
										<dd translate="no">{h.bat_khi}</dd>
									</>
								) : null}
								{h.vi_sao ? (
									<>
										<dt className="text-muted-foreground">Vì sao</dt>
										<dd translate="no">{h.vi_sao}</dd>
									</>
								) : null}
							</dl>
							{h.theo_loi ? (
								<Alert>
									<AlertDescription>
										Trạng thái này lấy từ ghi chú của kế hoạch, chưa có hồ sơ
										làm việc xác nhận.
									</AlertDescription>
								</Alert>
							) : null}
							{h.co.length ? (
								<Alert variant="warning">
									<AlertTitle>Kế hoạch và thực tế đang lệch</AlertTitle>
									<AlertDescription translate="no">
										{h.co.join(" · ")}
									</AlertDescription>
								</Alert>
							) : null}
							{h.dung_tren.length ? (
								<div className="flex flex-col gap-2">
									<span className="font-medium">Cần xong trước</span>
									<ItemGroup className="gap-1">
										{h.dung_tren
											.map((m) => theoMa.get(m))
											.filter((x): x is Hang => x !== undefined)
											.map((x) => (
												<DongViec key={x.ma} x={x} />
											))}
									</ItemGroup>
								</div>
							) : null}
							{choViecNay.length ? (
								<div className="flex flex-col gap-2">
									<span className="font-medium">Việc đang chờ việc này</span>
									<ItemGroup className="gap-1">
										{choViecNay.map((x) => (
											<DongViec key={x.ma} x={x} />
										))}
									</ItemGroup>
								</div>
							) : null}
						</SheetBody>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}

function MucGap({
	tieuDe,
	dong,
	ca,
}: {
	tieuDe: string;
	dong: { khoa: string; ma: string | null; chu: string }[];
	ca: string;
}) {
	if (!dong.length) return null;
	return (
		<Collapsible data-lo-trinh-gap={ca}>
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					{tieuDe} ({dong.length})
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ItemGroup className="gap-1 px-3 py-2">
					{dong.map((d) => (
						<Item key={d.khoa} size="xs">
							<ItemContent>
								<ItemDescription className="flex gap-2">
									{d.ma ? (
										<Badge translate="no" variant="mono">
											{d.ma}
										</Badge>
									) : null}
									<span translate="no">{d.chu}</span>
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</CollapsibleContent>
		</Collapsible>
	);
}

function TheLoTrinh({
	loTrinh,
	homNay,
	nhomBanDau,
	xemBanDau,
	chonBanDau,
}: {
	loTrinh: LoTrinh;
	homNay: string | null;
	nhomBanDau: string;
	xemBanDau: string;
	chonBanDau: string | null;
}) {
	const [nhom, doiNhom] = useState(nhomBanDau);
	const [xem, doiXem] = useState(xemBanDau);
	const [chon, doiChon] = useState<string | null>(chonBanDau);
	if (loTrinh.loi) {
		return (
			<Empty data-lo-trinh-trang="lo-loi">
				<EmptyHeader>
					<EmptyTitle>Không tải được lộ trình này</EmptyTitle>
					<EmptyDescription>
						Các lộ trình khác vẫn xem được. Hãy báo đội sản phẩm.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<ChiTietDoi chu={loTrinh.loi} />
				</EmptyContent>
			</Empty>
		);
	}
	const tre = homNay === null ? [] : viecTre(loTrinh, homNay);
	return (
		<div className="flex flex-col gap-6">
			<TienDo loTrinh={loTrinh} />
			{tre.length ? (
				<Alert data-lo-trinh-tre variant="warning">
					<AlertTitle>{tre.length} việc đã qua mốc mà chưa giao</AlertTitle>
					<AlertDescription translate="no">{tre.join(" · ")}</AlertDescription>
				</Alert>
			) : null}
			{loTrinh.hang_ke ? (
				<Card data-viec-ke={loTrinh.hang_ke.ma}>
					<CardHeader>
						<CardDescription>Việc kế tiếp</CardDescription>
						<CardTitle translate="no">{loTrinh.hang_ke.cau_giao}</CardTitle>
					</CardHeader>
				</Card>
			) : null}
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<BoLoc doiNhom={doiNhom} loTrinh={loTrinh} nhom={nhom} />
					<ViewSwitch
						items={[
							{ value: "danh-sach", label: "Danh sách" },
							{ value: "bang-cot", label: "Bảng cột" },
						]}
						label="Cách xem"
						onValueChange={doiXem}
						value={xem}
					/>
				</div>
				{xem === "bang-cot" ? (
					<BangCot
						homNay={homNay}
						loTrinh={loTrinh}
						moViec={doiChon}
						nhom={nhom}
					/>
				) : (
					<DanhSachViec
						homNay={homNay}
						loTrinh={loTrinh}
						moViec={doiChon}
						nhom={nhom}
					/>
				)}
				<ChiTietViec
					dong={() => doiChon(null)}
					homNay={homNay}
					loTrinh={loTrinh}
					ma={chon}
					moViec={doiChon}
				/>
			</div>
			<DanhSachMoc homNay={homNay} loTrinh={loTrinh} />
			<div className="flex flex-col items-start gap-1">
				<MucGap
					ca="can-sua"
					dong={loTrinh.can_sua.map((c, i) => ({
						khoa: `${i}`,
						ma: c.ma,
						chu: c.chu,
					}))}
					tieuDe="Chỗ cần sửa trong kế hoạch"
				/>
				<MucGap
					ca="da-bac"
					dong={loTrinh.da_bac.map((b) => ({
						khoa: b.ma,
						ma: b.ma,
						chu: b.ly_do,
					}))}
					tieuDe="Việc đã bác"
				/>
			</div>
		</div>
	);
}

function CoDuLieu({
	duLieu,
	canhBao,
	homNay,
	nhomBanDau,
	xemBanDau,
	chonBanDau,
}: {
	duLieu: DuLieu;
	canhBao: string[];
	homNay: string | null;
	nhomBanDau: string;
	xemBanDau: string;
	chonBanDau: string | null;
}) {
	const dau = duLieu.lo_trinh[0]?.tep ?? "";
	return (
		<Tabs className="gap-6" defaultValue={dau}>
			<TabsList variant="line">
				{duLieu.lo_trinh.map((lo) => (
					<TabsTrigger data-lo-trinh-the={lo.tep} key={lo.tep} value={lo.tep}>
						<span translate="no">{lo.ten ?? lo.tep}</span>
						{lo.loi ? null : (
							<Badge variant="secondary">{lo.tien_do.tong}</Badge>
						)}
					</TabsTrigger>
				))}
			</TabsList>
			{canhBao.length ? (
				<Alert data-lo-trinh-canh-bao variant="warning">
					<AlertTitle>Trang có thể thiếu một phần</AlertTitle>
					<AlertDescription>
						Dữ liệu lộ trình mới hơn trang này; phần trang hiểu được vẫn đúng.
					</AlertDescription>
					<ChiTietDoi chu={canhBao.join(" · ")} />
				</Alert>
			) : null}
			{duLieu.lo_trinh.map((lo) => (
				<TabsContent key={lo.tep} value={lo.tep}>
					<TheLoTrinh
						chonBanDau={chonBanDau}
						homNay={homNay}
						loTrinh={lo}
						nhomBanDau={nhomBanDau}
						xemBanDau={xemBanDau}
					/>
				</TabsContent>
			))}
		</Tabs>
	);
}

function NoiDung({
	dauVao,
	homNay,
	nhomBanDau,
	xemBanDau,
	chonBanDau,
}: {
	dauVao: DauVao;
	homNay: string | null;
	nhomBanDau: string;
	xemBanDau: string;
	chonBanDau: string | null;
}) {
	if (dauVao.kieu === "dang-tai")
		return (
			<div className="flex flex-col gap-6" data-lo-trinh-trang="dang-tai">
				<Skeleton className="h-8 w-80" />
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
					<Skeleton className="h-28" />
				</div>
				<Skeleton className="h-8 w-96" />
				<Skeleton className="h-72 w-full" />
			</div>
		);
	if (dauVao.kieu === "tep-vang")
		return (
			<KhungTrong
				ca="tep-vang"
				moTa="Bản CRM đang chạy không mang theo lộ trình. Hãy báo đội sản phẩm."
				tieuDe="Không tải được lộ trình"
			/>
		);
	if (dauVao.kieu === "chua-co-khoi")
		return (
			<KhungTrong
				ca="chua-co-khoi"
				cauMay={dauVao.canhBao.join(" · ")}
				moTa="Lộ trình chưa được xuất cho trang này. Đội sản phẩm sẽ bật khi cập nhật công cụ."
				tieuDe="Chưa có lộ trình ở đây"
			/>
		);
	if (dauVao.kieu === "khoi-hong")
		return (
			<KhungTrong
				ca="khoi-hong"
				cauMay={dauVao.canhBao.join(" · ")}
				moTa="Dữ liệu lộ trình bị hỏng nên trang không hiện, để khỏi hiện sai. Hãy báo đội sản phẩm."
				tieuDe="Không tải được lộ trình"
			/>
		);
	return (
		<CoDuLieu
			canhBao={dauVao.canhBao}
			duLieu={dauVao.duLieu}
			homNay={homNay}
			nhomBanDau={nhomBanDau}
			xemBanDau={xemBanDau}
			chonBanDau={chonBanDau}
		/>
	);
}

export function TrangLoTrinh({
	dauVao,
	homNay,
	nhomBanDau = TAT_CA,
	xemBanDau = "danh-sach",
	chonBanDau = null,
}: {
	dauVao: DauVao;
	homNay: string | null;
	nhomBanDau?: string;
	xemBanDau?: string;
	chonBanDau?: string | null;
}) {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Lộ trình</PageShellTitle>
					<PageShellDescription>
						Việc đội sản phẩm đang làm cho CRM và mốc của từng việc. Trang chỉ
						để xem — muốn đổi kế hoạch, hãy báo đội sản phẩm.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<NoiDung
					chonBanDau={chonBanDau}
					dauVao={dauVao}
					homNay={homNay}
					nhomBanDau={nhomBanDau}
					xemBanDau={xemBanDau}
				/>
			</PageShellContent>
		</PageShell>
	);
}
