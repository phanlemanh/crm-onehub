"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Board, type BoardColumn } from "@crm/ui/components/board";
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
import { Progress } from "@crm/ui/components/progress";
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
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
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
import { TreeNav, type TreeNavNode } from "@crm/ui/components/tree-nav";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import {
	type ComponentProps,
	type ReactNode,
	useMemo,
	useState,
	useSyncExternalStore,
} from "react";
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
const CHU_TRUNG_NHOM = new Set(["Chưa mở", "Đã giao", "Đang làm"]);
const TRAN_THE_COT = 8;
const KHO_HEP = "(max-width: 1023px)";

const TAT_CA = "__tat-ca";
const KHONG_NHOM = "__khong-nhom";

export type CachXem = "theo-nhom" | "theo-moc" | "toan-canh";

export type BanDau = {
	xem: CachXem;
	nhom: string;
	kieu: "danh-sach" | "bang-cot";
	chon: string | null;
};

export const BAN_DAU_MAC_DINH: BanDau = {
	xem: "theo-nhom",
	nhom: TAT_CA,
	kieu: "danh-sach",
	chon: null,
};

function useKhoHep() {
	return useSyncExternalStore(
		(bao) => {
			const q = window.matchMedia(KHO_HEP);
			q.addEventListener("change", bao);
			return () => q.removeEventListener("change", bao);
		},
		() => window.matchMedia(KHO_HEP).matches,
		() => false,
	);
}

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

function locViec(loTrinh: LoTrinh, nhom: string) {
	return loTrinh.hang.filter((h) =>
		nhom === TAT_CA
			? true
			: nhom === KHONG_NHOM
				? h.nhom === ""
				: h.nhom === nhom,
	);
}

function demNhom(viec: Hang[]) {
	const dem = (g: NhomTrangThai) =>
		viec.filter((h) => h.nhom_trang_thai === g).length;
	return {
		tong: viec.length,
		daGiao: dem("da-giao"),
		dangLam: dem("dang-lam"),
		chuaBatDau: dem("chua-bat-dau"),
		khac: dem("khac"),
	};
}

function cacNhom(loTrinh: LoTrinh) {
	const ten = [...new Set(loTrinh.hang.map((h) => h.nhom))].filter(Boolean);
	const coRong = loTrinh.hang.some((h) => h.nhom === "");
	return { ten, coRong };
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

function ChamTrangThai({ h }: { h: Hang }) {
	return (
		<StatusIndicator
			label={NHAN_NHOM[h.nhom_trang_thai]}
			size="sm"
			tone={TONE[h.nhom_trang_thai]}
		/>
	);
}

function TrangThai({ h }: { h: Hang }) {
	const nhan = NHAN_NHOM[h.nhom_trang_thai];
	return (
		<span className="flex flex-col gap-0.5">
			<ChamTrangThai h={h} />
			{h.trang_thai !== nhan && !CHU_TRUNG_NHOM.has(h.trang_thai) ? (
				<span className="text-muted-foreground text-xs" translate="no">
					{h.trang_thai}
				</span>
			) : null}
		</span>
	);
}

function OMoc({ moc, tre }: { moc: Moc | undefined; tre: boolean }) {
	if (!moc) return <EmptyCellValue />;
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

function BangViec({
	loTrinh,
	viec,
	homNay,
	moViec,
}: {
	loTrinh: LoTrinh;
	viec: Hang[];
	homNay: string | null;
	moViec: (ma: string) => void;
}) {
	const theoMoc = mocCuaViec(loTrinh);
	const tre = new Set(homNay === null ? [] : viecTre(loTrinh, homNay));
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "viec", header: "Việc" },
						{ id: "trang-thai", header: "Trạng thái", width: "13rem" },
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
									<span className="font-medium" translate="no">
										{h.cau_giao}
									</span>
									<span
										className="text-muted-foreground text-xs"
										translate="no"
									>
										{h.ma}
										{h.nhom ? ` · ${h.nhom}` : ""}
										{h.co.length ? ` · ${h.co.length} chỗ lệch kế hoạch` : ""}
									</span>
								</span>
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
							<button
								className="text-start"
								onClick={() => moViec(h.ma)}
								type="button"
							>
								<ItemContent>
									<ItemTitle translate="no">{h.cau_giao}</ItemTitle>
									<ItemDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
										<ChamTrangThai h={h} />
										<span translate="no">{h.ma}</span>
										{theoMoc.get(h.ma) ? (
											<OMoc moc={theoMoc.get(h.ma)} tre={tre.has(h.ma)} />
										) : null}
									</ItemDescription>
								</ItemContent>
							</button>
						</Item>
					))}
				</ItemGroup>
			</div>
		</>
	);
}

function BangCot({
	loTrinh,
	viec,
	homNay,
	moViec,
}: {
	loTrinh: LoTrinh;
	viec: Hang[];
	homNay: string | null;
	moViec: (ma: string) => void;
}) {
	const theoMoc = mocCuaViec(loTrinh);
	const tre = new Set(homNay === null ? [] : viecTre(loTrinh, homNay));
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
				subtitle: h.ma,
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

function NhomViec({
	tieuDe,
	dem,
	children,
	moSan = true,
	ca,
}: {
	tieuDe: string;
	dem: number;
	children: ReactNode;
	moSan?: boolean;
	ca: string;
}) {
	const [mo, doiMo] = useState(moSan);
	if (dem === 0) return null;
	return (
		<Collapsible
			className="flex flex-col gap-2"
			data-lo-trinh-nhom-viec={ca}
			onOpenChange={doiMo}
			open={mo}
		>
			<SectionHeading
				actions={
					<CollapsibleTrigger asChild>
						<Button size="sm" variant="ghost">
							{mo ? "Thu gọn" : "Xem"}
						</Button>
					</CollapsibleTrigger>
				}
			>
				{tieuDe}{" "}
				<span className="text-muted-foreground tabular-nums">{dem}</span>
			</SectionHeading>
			<CollapsibleContent>{children}</CollapsibleContent>
		</Collapsible>
	);
}

function BoChonNhom({
	loTrinh,
	nhom,
	doiNhom,
}: {
	loTrinh: LoTrinh;
	nhom: string;
	doiNhom: (n: string) => void;
}) {
	const hep = useKhoHep();
	const { ten, coRong } = cacNhom(loTrinh);
	const dem = (n: string) => {
		const d = demNhom(locViec(loTrinh, n));
		return `${d.daGiao}/${d.tong}`;
	};
	const muc = [
		{ id: TAT_CA, ten: "Tất cả" },
		...ten.map((t) => ({ id: t, ten: t })),
		...(coRong && ten.length ? [{ id: KHONG_NHOM, ten: "Không nhóm" }] : []),
	];
	if (hep)
		return (
			<Select onValueChange={doiNhom} value={nhom}>
				<SelectTrigger aria-label="Nhóm" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{muc.map((m) => (
						<SelectItem key={m.id} value={m.id}>
							<span translate="no">{m.ten}</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	const nodes: TreeNavNode<string>[] = muc.map((m) => ({
		id: m.id,
		name: m.ten,
		data: m.id,
	}));
	return (
		<TreeNav
			expanded={[]}
			label="Nhóm"
			nodes={nodes}
			onExpandedChange={() => undefined}
			onSelect={doiNhom}
			renderLabel={(n) => (
				<span className="flex w-full min-w-0 items-center gap-2">
					<span className="min-w-0 truncate" translate="no">
						{n.name}
					</span>
					<span className="ms-auto text-muted-foreground text-xs tabular-nums">
						{dem(n.id)}
					</span>
				</span>
			)}
			selectedId={nhom}
		/>
	);
}

function TheoNhom({
	loTrinh,
	homNay,
	banDau,
	moViec,
}: {
	loTrinh: LoTrinh;
	homNay: string | null;
	banDau: BanDau;
	moViec: (ma: string) => void;
}) {
	const [nhom, doiNhom] = useState(banDau.nhom);
	const [kieu, doiKieu] = useState<string>(banDau.kieu);
	const viec = locViec(loTrinh, nhom);
	const d = demNhom(viec);
	const tre = new Set(homNay === null ? [] : viecTre(loTrinh, homNay));
	const theoMoc = mocCuaViec(loTrinh);
	const viecTreDs = viec.filter((h) => tre.has(h.ma));
	const sapToi = viec
		.filter((h) => h.nhom_trang_thai !== "da-giao" && !tre.has(h.ma))
		.sort((a, b) =>
			(theoMoc.get(a.ma)?.ngay ?? "9999").localeCompare(
				theoMoc.get(b.ma)?.ngay ?? "9999",
			),
		);
	const daGiao = viec.filter((h) => h.nhom_trang_thai === "da-giao");
	const tenNhom =
		nhom === TAT_CA ? "Tất cả nhóm" : nhom === KHONG_NHOM ? "Không nhóm" : nhom;
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
			<div className="min-w-0">
				<BoChonNhom doiNhom={doiNhom} loTrinh={loTrinh} nhom={nhom} />
			</div>
			<div className="flex min-w-0 flex-col gap-6">
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-1">
						<span className="font-medium" translate="no">
							{tenNhom}
						</span>
						<span className="text-muted-foreground text-sm">
							{d.tong} việc · {d.daGiao} đã giao · {d.dangLam} đang làm ·{" "}
							{d.chuaBatDau} chưa bắt đầu
							{viecTreDs.length ? ` · ${viecTreDs.length} trễ mốc` : ""}
						</span>
					</div>
					<ViewSwitch
						items={[
							{ value: "danh-sach", label: "Danh sách" },
							{ value: "bang-cot", label: "Bảng cột" },
						]}
						label="Cách xem"
						onValueChange={doiKieu}
						value={kieu}
					/>
				</div>
				{kieu === "bang-cot" ? (
					<BangCot
						homNay={homNay}
						loTrinh={loTrinh}
						moViec={moViec}
						viec={viec}
					/>
				) : (
					<div className="flex flex-col gap-6">
						<NhomViec ca="tre" dem={viecTreDs.length} tieuDe="Trễ mốc">
							<BangViec
								homNay={homNay}
								loTrinh={loTrinh}
								moViec={moViec}
								viec={viecTreDs}
							/>
						</NhomViec>
						<NhomViec ca="sap-toi" dem={sapToi.length} tieuDe="Sắp tới">
							<BangViec
								homNay={homNay}
								loTrinh={loTrinh}
								moViec={moViec}
								viec={sapToi}
							/>
						</NhomViec>
						<NhomViec
							ca="da-giao"
							dem={daGiao.length}
							moSan={false}
							tieuDe="Đã giao"
						>
							<BangViec
								homNay={homNay}
								loTrinh={loTrinh}
								moViec={moViec}
								viec={daGiao}
							/>
						</NhomViec>
					</div>
				)}
			</div>
		</div>
	);
}

function TheoMoc({
	loTrinh,
	homNay,
	moViec,
}: {
	loTrinh: LoTrinh;
	homNay: string | null;
	moViec: (ma: string) => void;
}) {
	const theoMa = new Map(loTrinh.hang.map((h) => [h.ma, h]));
	const coMoc = new Set(loTrinh.moc.flatMap((m) => m.hang));
	const khongMoc = loTrinh.hang.filter(
		(h) => !coMoc.has(h.ma) && h.nhom_trang_thai !== "da-giao",
	);
	const daQua =
		homNay === null ? 0 : loTrinh.moc.filter((m) => m.ngay < homNay).length;
	if (!loTrinh.moc.length)
		return (
			<KhungTrong
				ca="khong-moc"
				moTa="Kế hoạch này chưa hẹn mốc nào. Xem việc ở «Theo nhóm»."
				tieuDe="Chưa có mốc"
			/>
		);
	return (
		<div className="flex flex-col gap-6">
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
						<TimelineContent className="flex flex-col gap-2 pt-1">
							{homNay !== null && mocQuaConViec(m, homNay) ? (
								<StatusIndicator
									label="Đã qua — còn việc chưa giao"
									size="sm"
									tone="warning"
								/>
							) : null}
							{m.hang.length ? (
								<ItemGroup className="gap-1">
									{m.hang
										.map((ma) => theoMa.get(ma))
										.filter((h): h is Hang => h !== undefined)
										.map((h) => (
											<Item asChild key={h.ma} size="xs" variant="outline">
												<button
													className="text-start"
													onClick={() => moViec(h.ma)}
													type="button"
												>
													<ItemContent>
														<ItemTitle className="font-normal" translate="no">
															{h.cau_giao}
														</ItemTitle>
													</ItemContent>
													<ChamTrangThai h={h} />
												</button>
											</Item>
										))}
								</ItemGroup>
							) : null}
						</TimelineContent>
					</TimelineItem>
				))}
			</Timeline>
			<NhomViec
				ca="chua-hen-moc"
				dem={khongMoc.length}
				moSan={false}
				tieuDe="Chưa hẹn mốc"
			>
				<BangViec
					homNay={homNay}
					loTrinh={loTrinh}
					moViec={moViec}
					viec={khongMoc}
				/>
			</NhomViec>
		</div>
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

function ToanCanh({
	loTrinh,
	homNay,
}: {
	loTrinh: LoTrinh;
	homNay: string | null;
}) {
	const { tien_do: t } = loTrinh;
	const tre = homNay === null ? [] : viecTre(loTrinh, homNay);
	const { ten, coRong } = cacNhom(loTrinh);
	const dong = [
		...ten.map((n) => ({ id: n, ten: n })),
		...(coRong ? [{ id: KHONG_NHOM, ten: "Không nhóm" }] : []),
	];
	return (
		<div className="flex flex-col gap-6">
			<StatGroup>
				<StatCard
					data-tien-do="da_giao"
					description={`${t.tong ? Math.round((t.da_giao / t.tong) * 100) : 0}% kế hoạch`}
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
					description={`Đã lên kế hoạch, chưa mở${t.khac ? ` · ${t.khac} xếp lại hoặc đã bác` : ""}`}
					label="Chưa bắt đầu"
					value={t.chua_bat_dau}
				/>
				<StatCard
					description={tre.length ? tre.join(" · ") : "Không việc nào trễ"}
					label="Trễ mốc"
					value={homNay === null ? "—" : tre.length}
				/>
			</StatGroup>
			<Card>
				<CardHeader>
					<CardTitle>Theo nhóm</CardTitle>
					<CardDescription>
						Mỗi nhóm đã giao bao nhiêu trên tổng số việc của nhóm.
					</CardDescription>
				</CardHeader>
				<SimpleTable
					columns={[
						{ id: "nhom", header: "Nhóm" },
						{ id: "tien-do", header: "Đã giao", width: "40%" },
						{ id: "dang-lam", header: "Đang làm", align: "right" },
						{ id: "chua", header: "Chưa bắt đầu", align: "right" },
						{ id: "tong", header: "Số việc", align: "right" },
					]}
					surface="page"
				>
					{dong.map((n) => {
						const d = demNhom(locViec(loTrinh, n.id));
						return (
							<SimpleTableRow data-lo-trinh-hang-nhom={n.id} key={n.id}>
								<TableCell translate="no">{n.ten}</TableCell>
								<TableCell>
									<span className="flex items-center gap-3">
										<Progress
											label={`Đã giao ${n.ten}`}
											value={d.tong ? (d.daGiao / d.tong) * 100 : 0}
											valueText={`${d.daGiao}/${d.tong}`}
											variant="neutral"
										/>
										<span className="shrink-0 text-muted-foreground tabular-nums">
											{d.daGiao}/{d.tong}
										</span>
									</span>
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{d.dangLam}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{d.chuaBatDau}
								</TableCell>
								<TableCell className="text-right tabular-nums">
									{d.tong}
								</TableCell>
							</SimpleTableRow>
						);
					})}
				</SimpleTable>
			</Card>
			<div className="flex flex-col items-start gap-1">
				<MucGap
					ca="da-bac"
					dong={loTrinh.da_bac.map((b) => ({
						khoa: b.ma,
						ma: b.ma,
						chu: b.ly_do,
					}))}
					tieuDe="Việc đã bác"
				/>
				<MucGap
					ca="doi-san-pham"
					dong={[
						...(loTrinh.hang_ke
							? [
									{
										khoa: "hang-ke",
										ma: loTrinh.hang_ke.ma,
										chu: `Việc kế tiếp: ${loTrinh.hang_ke.cau_giao}`,
									},
								]
							: []),
						...loTrinh.can_sua.map((c, i) => ({
							khoa: `${i}`,
							ma: c.ma,
							chu: c.chu,
						})),
					]}
					tieuDe="Dành cho đội sản phẩm"
				/>
			</div>
		</div>
	);
}

function DongViec({ x, moViec }: { x: Hang; moViec: (ma: string) => void }) {
	return (
		<Item asChild size="xs" variant="outline">
			<button className="text-start" onClick={() => moViec(x.ma)} type="button">
				<ItemContent>
					<ItemTitle className="font-normal" translate="no">
						{x.cau_giao}
					</ItemTitle>
				</ItemContent>
				<ChamTrangThai h={x} />
			</button>
		</Item>
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
	return (
		<Sheet onOpenChange={(mo) => (mo ? null : dong())} open={h !== undefined}>
			<SheetContent data-lo-trinh-chi-tiet-viec={h?.ma} size="md">
				{h ? (
					<>
						<SheetHeader>
							<SheetDescription translate="no">
								{h.ma}
								{h.nhom ? ` · ${h.nhom}` : ""}
							</SheetDescription>
							<SheetTitle translate="no">{h.cau_giao}</SheetTitle>
						</SheetHeader>
						<SheetBody className="flex flex-col gap-5 text-sm">
							<dl className="grid grid-cols-[9rem_1fr] gap-x-4 gap-y-3">
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
									<SectionHeading level={4}>Cần xong trước</SectionHeading>
									<ItemGroup className="gap-1">
										{h.dung_tren
											.map((m) => theoMa.get(m))
											.filter((x): x is Hang => x !== undefined)
											.map((x) => (
												<DongViec key={x.ma} moViec={moViec} x={x} />
											))}
									</ItemGroup>
								</div>
							) : null}
							{choViecNay.length ? (
								<div className="flex flex-col gap-2">
									<SectionHeading level={4}>
										Việc đang chờ việc này
									</SectionHeading>
									<ItemGroup className="gap-1">
										{choViecNay.map((x) => (
											<DongViec key={x.ma} moViec={moViec} x={x} />
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

function BoChonLoTrinh({
	duLieu,
	lo,
	doiLo,
}: {
	duLieu: DuLieu;
	lo: string;
	doiLo: (t: string) => void;
}) {
	return (
		<Select onValueChange={doiLo} value={lo}>
			<SelectTrigger aria-label="Lộ trình" size="sm">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{duLieu.lo_trinh.map((l) => (
					<SelectItem key={l.tep} value={l.tep}>
						<span translate="no">{l.ten ?? l.tep}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function CoDuLieu({
	duLieu,
	canhBao,
	homNay,
	banDau,
}: {
	duLieu: DuLieu;
	canhBao: string[];
	homNay: string | null;
	banDau: BanDau;
}) {
	const [lo, doiLo] = useState(duLieu.lo_trinh[0]?.tep ?? "");
	const [xem, doiXem] = useState<string>(banDau.xem);
	const [chon, doiChon] = useState<string | null>(banDau.chon);
	const loTrinh = duLieu.lo_trinh.find((l) => l.tep === lo);
	return (
		<Tabs className="gap-6" onValueChange={doiXem} value={xem}>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<TabsList variant="line">
					<TabsTrigger value="theo-nhom">Theo nhóm</TabsTrigger>
					<TabsTrigger value="theo-moc">Theo mốc</TabsTrigger>
					<TabsTrigger value="toan-canh">Toàn cảnh</TabsTrigger>
				</TabsList>
				<BoChonLoTrinh doiLo={doiLo} duLieu={duLieu} lo={lo} />
			</div>
			{canhBao.length ? (
				<Alert data-lo-trinh-canh-bao variant="warning">
					<AlertTitle>Trang có thể thiếu một phần</AlertTitle>
					<AlertDescription>
						Dữ liệu lộ trình mới hơn trang này; phần trang hiểu được vẫn đúng.
					</AlertDescription>
					<ChiTietDoi chu={canhBao.join(" · ")} />
				</Alert>
			) : null}
			{!loTrinh ? null : loTrinh.loi ? (
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
			) : (
				<>
					<TabsContent value="theo-nhom">
						<TheoNhom
							banDau={banDau}
							homNay={homNay}
							key={lo}
							loTrinh={loTrinh}
							moViec={doiChon}
						/>
					</TabsContent>
					<TabsContent value="theo-moc">
						<TheoMoc homNay={homNay} loTrinh={loTrinh} moViec={doiChon} />
					</TabsContent>
					<TabsContent value="toan-canh">
						<ToanCanh homNay={homNay} loTrinh={loTrinh} />
					</TabsContent>
					<ChiTietViec
						dong={() => doiChon(null)}
						homNay={homNay}
						loTrinh={loTrinh}
						ma={chon}
						moViec={doiChon}
					/>
				</>
			)}
		</Tabs>
	);
}

function NoiDung({
	dauVao,
	homNay,
	banDau,
}: {
	dauVao: DauVao;
	homNay: string | null;
	banDau: BanDau;
}) {
	if (dauVao.kieu === "dang-tai")
		return (
			<div className="flex flex-col gap-6" data-lo-trinh-trang="dang-tai">
				<Skeleton className="h-8 w-96" />
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
					<Skeleton className="h-64" />
					<Skeleton className="h-96" />
				</div>
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
			banDau={banDau}
			canhBao={dauVao.canhBao}
			duLieu={dauVao.duLieu}
			homNay={homNay}
		/>
	);
}

export function TrangLoTrinh({
	dauVao,
	homNay,
	banDau = BAN_DAU_MAC_DINH,
}: {
	dauVao: DauVao;
	homNay: string | null;
	banDau?: BanDau;
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
				<NoiDung banDau={banDau} dauVao={dauVao} homNay={homNay} />
			</PageShellContent>
		</PageShell>
	);
}
